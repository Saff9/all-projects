import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { UpgradeCharacterDto, UnlockCharacterDto } from './dto/upgrade-character.dto';
import { ERROR_MESSAGES, RARITY_MULTIPLIERS } from '@cryptoverse/shared';

@Injectable()
export class CharacterService {
  private readonly logger = new Logger(CharacterService.name);

  // Upgrade cost formula: base_cost * (level ^ 2) * rarity_multiplier
  private readonly BASE_UPGRADE_COST = 100;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all available characters
   */
  async getAllCharacters(rarity?: string) {
    const where: any = {};
    if (rarity) {
      where.rarity = rarity.toUpperCase();
    }

    const characters = await this.prisma.character.findMany({
      where,
      orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
    });

    return characters.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      rarity: c.rarity.toLowerCase(),
      baseMiningBonus: c.baseMiningBonus,
      specialAbility: c.specialAbility,
      maxLevel: c.maxLevel,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Get user's characters
   */
  async getUserCharacters(userId: string) {
    const userCharacters = await this.prisma.userCharacter.findMany({
      where: { userId },
      include: {
        character: true,
      },
      orderBy: { acquiredAt: 'desc' },
    });

    return userCharacters.map((uc) => {
      const currentMiningBonus = this.calculateMiningBonus(
        uc.character.baseMiningBonus,
        uc.level,
        uc.character.rarity,
      );
      const expToNext = this.experienceNeededForLevel(uc.level + 1);

      return {
        id: uc.id,
        userId: uc.userId,
        characterId: uc.characterId,
        level: uc.level,
        experience: uc.experience.toString(),
        acquiredAt: uc.acquiredAt,
        character: {
          id: uc.character.id,
          name: uc.character.name,
          description: uc.character.description,
          imageUrl: uc.character.imageUrl,
          rarity: uc.character.rarity.toLowerCase(),
          baseMiningBonus: uc.character.baseMiningBonus,
          specialAbility: uc.character.specialAbility,
          maxLevel: uc.character.maxLevel,
          createdAt: uc.character.createdAt,
        },
        currentMiningBonus,
        experienceToNextLevel: expToNext.toString(),
      };
    });
  }

  /**
   * Get a specific character by ID
   */
  async getCharacterById(characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(ERROR_MESSAGES.CHARACTER_NOT_FOUND);
    }

    return {
      id: character.id,
      name: character.name,
      description: character.description,
      imageUrl: character.imageUrl,
      rarity: character.rarity.toLowerCase(),
      baseMiningBonus: character.baseMiningBonus,
      specialAbility: character.specialAbility,
      maxLevel: character.maxLevel,
      createdAt: character.createdAt,
    };
  }

  /**
   * Upgrade character level
   */
  async upgradeCharacter(
    userId: string,
    userCharacterId: string,
    upgradeDto: UpgradeCharacterDto,
  ) {
    const levelsToUpgrade = upgradeDto.levels || 1;

    // Get user character
    const userCharacter = await this.prisma.userCharacter.findUnique({
      where: { id: userCharacterId },
      include: { character: true },
    });

    if (!userCharacter || userCharacter.userId !== userId) {
      throw new NotFoundException(ERROR_MESSAGES.CHARACTER_NOT_FOUND);
    }

    const newLevel = userCharacter.level + levelsToUpgrade;

    // Check max level
    if (newLevel > userCharacter.character.maxLevel) {
      throw new BadRequestException(
        `Cannot upgrade beyond max level ${userCharacter.character.maxLevel}`,
      );
    }

    // Calculate upgrade cost
    const cost = this.calculateUpgradeCost(
      userCharacter.level,
      levelsToUpgrade,
      userCharacter.character.rarity,
    );

    // Check user balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user || user.coins < cost) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_COINS);
    }

    const previousLevel = userCharacter.level;
    const previousBonus = this.calculateMiningBonus(
      userCharacter.character.baseMiningBonus,
      userCharacter.level,
      userCharacter.character.rarity,
    );

    // Perform upgrade
    const updated = await this.prisma.$transaction(async (tx) => {
      // Deduct cost
      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: cost } },
      });

      // Update character
      return tx.userCharacter.update({
        where: { id: userCharacterId },
        data: {
          level: newLevel,
          updatedAt: new Date(),
        },
        include: { character: true },
      });
    });

    const newBonus = this.calculateMiningBonus(
      updated.character.baseMiningBonus,
      updated.level,
      updated.character.rarity,
    );

    this.logger.log(
      `Character upgraded: ${userId} - ${userCharacterId} from ${previousLevel} to ${newLevel}`,
    );

    return {
      previousLevel,
      newLevel,
      previousMiningBonus: previousBonus,
      newMiningBonus: newBonus,
      cost: cost.toString(),
      character: {
        id: updated.id,
        userId: updated.userId,
        characterId: updated.characterId,
        level: updated.level,
        experience: updated.experience.toString(),
        acquiredAt: updated.acquiredAt,
        character: {
          id: updated.character.id,
          name: updated.character.name,
          description: updated.character.description,
          imageUrl: updated.character.imageUrl,
          rarity: updated.character.rarity.toLowerCase(),
          baseMiningBonus: updated.character.baseMiningBonus,
          specialAbility: updated.character.specialAbility,
          maxLevel: updated.character.maxLevel,
          createdAt: updated.character.createdAt,
        },
        currentMiningBonus: newBonus,
        experienceToNextLevel: this.experienceNeededForLevel(updated.level + 1).toString(),
      },
    };
  }

  /**
   * Unlock a new character
   */
  async unlockCharacter(userId: string, unlockDto: UnlockCharacterDto) {
    // Check if character exists
    const character = await this.prisma.character.findUnique({
      where: { id: unlockDto.characterId },
    });

    if (!character) {
      throw new NotFoundException(ERROR_MESSAGES.CHARACTER_NOT_FOUND);
    }

    // Check if already owned
    const existing = await this.prisma.userCharacter.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId: unlockDto.characterId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(ERROR_MESSAGES.CHARACTER_ALREADY_OWNED);
    }

    // Calculate unlock cost based on rarity
    const unlockCost = this.calculateUnlockCost(character.rarity);

    // Check balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user || user.coins < unlockCost) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_COINS);
    }

    // Unlock character
    const userCharacter = await this.prisma.$transaction(async (tx) => {
      // Deduct cost
      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: unlockCost } },
      });

      // Update stats
      await tx.userStats.update({
        where: { userId },
        data: { charactersOwned: { increment: 1 } },
      });

      // Create character
      return tx.userCharacter.create({
        data: {
          userId,
          characterId: unlockDto.characterId,
          level: 1,
          experience: BigInt(0),
        },
        include: { character: true },
      });
    });

    this.logger.log(`Character unlocked: ${userId} - ${unlockDto.characterId}`);

    return {
      success: true,
      message: 'Character unlocked successfully',
      cost: unlockCost.toString(),
      character: {
        id: userCharacter.id,
        userId: userCharacter.userId,
        characterId: userCharacter.characterId,
        level: userCharacter.level,
        experience: userCharacter.experience.toString(),
        acquiredAt: userCharacter.acquiredAt,
        character: {
          id: userCharacter.character.id,
          name: userCharacter.character.name,
          description: userCharacter.character.description,
          imageUrl: userCharacter.character.imageUrl,
          rarity: userCharacter.character.rarity.toLowerCase(),
          baseMiningBonus: userCharacter.character.baseMiningBonus,
          specialAbility: userCharacter.character.specialAbility,
          maxLevel: userCharacter.character.maxLevel,
          createdAt: userCharacter.character.createdAt,
        },
        currentMiningBonus: this.calculateMiningBonus(
          userCharacter.character.baseMiningBonus,
          userCharacter.level,
          userCharacter.character.rarity,
        ),
        experienceToNextLevel: this.experienceNeededForLevel(2).toString(),
      },
    };
  }

  /**
   * Calculate mining bonus based on level and rarity
   */
  private calculateMiningBonus(
    baseBonus: number,
    level: number,
    rarity: string,
  ): number {
    const rarityMultiplier = RARITY_MULTIPLIERS[rarity.toLowerCase() as keyof typeof RARITY_MULTIPLIERS] || 1;
    return baseBonus * (1 + (level - 1) * 0.1) * rarityMultiplier;
  }

  /**
   * Calculate upgrade cost
   */
  private calculateUpgradeCost(
    currentLevel: number,
    levels: number,
    rarity: string,
  ): bigint {
    const rarityMultiplier =
      RARITY_MULTIPLIERS[rarity.toLowerCase() as keyof typeof RARITY_MULTIPLIERS] || 1;
    let totalCost = BigInt(0);

    for (let i = 0; i < levels; i++) {
      const level = currentLevel + i;
      const cost = Math.floor(
        this.BASE_UPGRADE_COST * Math.pow(level, 2) * rarityMultiplier,
      );
      totalCost += BigInt(cost);
    }

    return totalCost;
  }

  /**
   * Calculate unlock cost based on rarity
   */
  private calculateUnlockCost(rarity: string): bigint {
    const costs: Record<string, number> = {
      COMMON: 1000,
      UNCOMMON: 2500,
      RARE: 5000,
      EPIC: 10000,
      LEGENDARY: 25000,
    };
    return BigInt(costs[rarity] || 1000);
  }

  /**
   * Experience needed for a level
   */
  private experienceNeededForLevel(level: number): bigint {
    return BigInt(Math.floor(100 * Math.pow(level, 2)));
  }
}
