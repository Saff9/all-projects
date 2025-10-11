import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { ClaimAirdropDto } from './dto/claim-airdrop.dto';
import { ERROR_MESSAGES } from '@cryptoverse/shared';

@Injectable()
export class AirdropService {
  private readonly logger = new Logger(AirdropService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active airdrops
   */
  async getAllAirdrops() {
    const now = new Date();
    
    const airdrops = await this.prisma.airdrop.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
    });

    return airdrops.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      totalTokens: a.totalTokens.toString(),
      tokensPerUser: a.tokensPerUser.toString(),
      startDate: a.startDate,
      endDate: a.endDate,
      requirements: a.requirements,
      isActive: a.isActive,
      createdAt: a.createdAt,
    }));
  }

  /**
   * Get user's airdrops with eligibility status
   */
  async getUserAirdrops(userId: string) {
    const now = new Date();

    // Get all active airdrops
    const airdrops = await this.prisma.airdrop.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Get user's airdrop records
    const userAirdrops = await this.prisma.userAirdrop.findMany({
      where: { userId },
      include: { airdrop: true },
    });

    const userAirdropMap = new Map(
      userAirdrops.map((ua) => [ua.airdropId, ua]),
    );

    return airdrops.map((a) => {
      const ua = userAirdropMap.get(a.id);
      
      return {
        id: ua?.id || '',
        userId,
        airdropId: a.id,
        eligible: ua?.eligible || false,
        claimed: ua?.claimed || false,
        claimedAt: ua?.claimedAt,
        airdrop: {
          id: a.id,
          name: a.name,
          description: a.description,
          totalTokens: a.totalTokens.toString(),
          tokensPerUser: a.tokensPerUser.toString(),
          startDate: a.startDate,
          endDate: a.endDate,
          requirements: a.requirements,
          isActive: a.isActive,
          createdAt: a.createdAt,
        },
      };
    });
  }

  /**
   * Check eligibility for an airdrop
   */
  async checkEligibility(userId: string, airdropId: string) {
    // Get airdrop
    const airdrop = await this.prisma.airdrop.findUnique({
      where: { id: airdropId },
    });

    if (!airdrop) {
      throw new NotFoundException('Airdrop not found');
    }

    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        characters: true,
        achievements: true,
        wallets: true,
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Check requirements
    const missingRequirements: string[] = [];
    let isEligible = true;

    for (const requirement of airdrop.requirements) {
      const met = await this.checkRequirement(user, requirement);
      if (!met) {
        isEligible = false;
        missingRequirements.push(requirement);
      }
    }

    // Update or create user airdrop record
    const existingRecord = await this.prisma.userAirdrop.findUnique({
      where: {
        userId_airdropId: {
          userId,
          airdropId,
        },
      },
    });

    if (existingRecord) {
      await this.prisma.userAirdrop.update({
        where: { id: existingRecord.id },
        data: { eligible: isEligible },
      });
    } else {
      await this.prisma.userAirdrop.create({
        data: {
          userId,
          airdropId,
          eligible: isEligible,
        },
      });
    }

    return {
      airdropId,
      isEligible,
      missingRequirements,
      tokensToReceive: airdrop.tokensPerUser.toString(),
    };
  }

  /**
   * Check a single requirement
   */
  private async checkRequirement(user: any, requirement: string): Promise<boolean> {
    // Parse requirement string
    // Format: "type:threshold" e.g., "coins:10000", "level:5", "referrals:10"
    const [type, thresholdStr] = requirement.split(':');
    const threshold = parseInt(thresholdStr, 10);

    switch (type.toLowerCase()) {
      case 'coins':
        return Number(user.coins) >= threshold;
      
      case 'level':
        // Check average character level
        if (user.characters.length === 0) return false;
        const avgLevel = user.characters.reduce(
          (sum: number, c: any) => sum + c.level,
          0,
        ) / user.characters.length;
        return avgLevel >= threshold;
      
      case 'referrals':
        const referralCount = await this.prisma.user.count({
          where: { referredBy: user.id },
        });
        return referralCount >= threshold;
      
      case 'achievements':
        return (user.stats?.achievementsUnlocked || 0) >= threshold;
      
      case 'quests':
        return (user.stats?.questsCompleted || 0) >= threshold;
      
      case 'taps':
        return Number(user.stats?.totalTaps || 0) >= threshold;
      
      case 'wallet':
        return user.wallets.length > 0;
      
      default:
        return false;
    }
  }

  /**
   * Claim airdrop
   */
  async claimAirdrop(userId: string, claimAirdropDto: ClaimAirdropDto) {
    const { airdropId } = claimAirdropDto;

    // Get user airdrop record
    let userAirdrop = await this.prisma.userAirdrop.findUnique({
      where: {
        userId_airdropId: {
          userId,
          airdropId,
        },
      },
      include: { airdrop: true },
    });

    // If no record, check eligibility first
    if (!userAirdrop) {
      const eligibility = await this.checkEligibility(userId, airdropId);
      if (!eligibility.isEligible) {
        throw new BadRequestException(ERROR_MESSAGES.AIRDROP_NOT_ELIGIBLE);
      }
      userAirdrop = await this.prisma.userAirdrop.findUnique({
        where: {
          userId_airdropId: {
            userId,
            airdropId,
          },
        },
        include: { airdrop: true },
      });
    }

    if (!userAirdrop || !userAirdrop.eligible) {
      throw new BadRequestException(ERROR_MESSAGES.AIRDROP_NOT_ELIGIBLE);
    }

    if (userAirdrop.claimed) {
      throw new BadRequestException(ERROR_MESSAGES.AIRDROP_ALREADY_CLAIMED);
    }

    // Claim airdrop
    await this.prisma.$transaction(async (tx) => {
      // Update user coins
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: userAirdrop!.airdrop.tokensPerUser },
        },
      });

      // Update stats
      await tx.userStats.update({
        where: { userId },
        data: {
          totalEarned: { increment: userAirdrop!.airdrop.tokensPerUser },
        },
      });

      // Mark as claimed
      await tx.userAirdrop.update({
        where: { id: userAirdrop!.id },
        data: {
          claimed: true,
          claimedAt: new Date(),
        },
      });
    });

    this.logger.log(`Airdrop claimed: ${userId} - ${airdropId}`);

    return {
      success: true,
      tokensClaimed: userAirdrop.airdrop.tokensPerUser.toString(),
      airdrop: {
        id: userAirdrop.airdrop.id,
        name: userAirdrop.airdrop.name,
        description: userAirdrop.airdrop.description,
        totalTokens: userAirdrop.airdrop.totalTokens.toString(),
        tokensPerUser: userAirdrop.airdrop.tokensPerUser.toString(),
        startDate: userAirdrop.airdrop.startDate,
        endDate: userAirdrop.airdrop.endDate,
        requirements: userAirdrop.airdrop.requirements,
        isActive: userAirdrop.airdrop.isActive,
        createdAt: userAirdrop.airdrop.createdAt,
      },
    };
  }
}