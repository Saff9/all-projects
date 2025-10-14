import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database';
import { UpdateUserDto, ApplyReferralDto } from './dto/update-user.dto';
import { REFERRAL_CONFIG, ERROR_MESSAGES } from '@cryptoverse/shared';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user profile with stats
   */
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
      },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        coins: user.coins.toString(),
        miningRate: user.miningRate,
        totalMined: user.totalMined.toString(),
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: user.stats
        ? {
            totalTaps: user.stats.totalTaps.toString(),
            totalEarned: user.stats.totalEarned.toString(),
            achievementsUnlocked: user.stats.achievementsUnlocked,
            charactersOwned: user.stats.charactersOwned,
            questsCompleted: user.stats.questsCompleted,
            currentStreak: user.stats.currentStreak,
            bestStreak: user.stats.bestStreak,
            lastActiveAt: user.stats.lastActiveAt,
          }
        : null,
    };
  }

  /**
   * Get user stats only
   */
  async getUserStats(userId: string) {
    const stats = await this.prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      totalTaps: stats.totalTaps.toString(),
      totalEarned: stats.totalEarned.toString(),
      achievementsUnlocked: stats.achievementsUnlocked,
      charactersOwned: stats.charactersOwned,
      questsCompleted: stats.questsCompleted,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      lastActiveAt: stats.lastActiveAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    // Check if username is already taken
    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Username already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateUserDto,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`User profile updated: ${userId}`);

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      coins: user.coins.toString(),
      miningRate: user.miningRate,
      totalMined: user.totalMined.toString(),
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get referral stats
   */
  async getReferralStats(userId: string) {
    // Get user's referrals
    const referrals = await this.prisma.user.findMany({
      where: { referredBy: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total coins earned from referrals
    const totalCoinsEarned = BigInt(referrals.length) * BigInt(REFERRAL_CONFIG.REFERRER_BONUS);

    return {
      totalReferrals: referrals.length,
      coinsEarned: totalCoinsEarned.toString(),
      referrals: referrals.map((r) => ({
        id: r.id,
        username: r.username,
        firstName: r.firstName,
        photoUrl: r.photoUrl,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Apply referral code
   */
  async applyReferral(userId: string, applyReferralDto: ApplyReferralDto) {
    // Check if user already has a referrer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.referredBy) {
      throw new BadRequestException('You have already applied a referral code');
    }

    // Find referrer by code
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: applyReferralDto.referralCode },
    });

    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referrer.id === userId) {
      throw new BadRequestException('You cannot use your own referral code');
    }

    // Apply referral in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update user with referrer
      await tx.user.update({
        where: { id: userId },
        data: {
          referredBy: referrer.id,
          coins: { increment: BigInt(REFERRAL_CONFIG.REFERREE_BONUS) },
        },
      });

      // Give referrer bonus
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          coins: { increment: BigInt(REFERRAL_CONFIG.REFERRER_BONUS) },
        },
      });

      // Update user stats
      await tx.userStats.update({
        where: { userId },
        data: {
          totalEarned: { increment: BigInt(REFERRAL_CONFIG.REFERREE_BONUS) },
        },
      });

      await tx.userStats.update({
        where: { userId: referrer.id },
        data: {
          totalEarned: { increment: BigInt(REFERRAL_CONFIG.REFERRER_BONUS) },
        },
      });
    });

    this.logger.log(`Referral applied: ${userId} referred by ${referrer.id}`);

    return {
      success: true,
      message: 'Referral code applied successfully',
      bonusCoins: REFERRAL_CONFIG.REFERREE_BONUS,
    };
  }

  /**
   * Find user by ID
   */
  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Find user by Telegram ID
   */
  async findByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId },
    });
  }
}
