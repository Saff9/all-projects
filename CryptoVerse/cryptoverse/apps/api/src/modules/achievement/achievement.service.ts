import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { ClaimAchievementDto } from './dto/claim-achievement.dto';
import { ERROR_MESSAGES } from '@cryptoverse/shared';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all achievements with user progress
   */
  async getAllAchievements(userId: string, category?: string) {
    const where: any = {};
    if (category) {
      where.category = category.toUpperCase();
    }

    const [achievements, userAchievements] = await Promise.all([
      this.prisma.achievement.findMany({
        where,
        orderBy: [{ category: 'asc' }, { requirement: 'asc' }],
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      }),
    ]);

    // Create a map of user achievements
    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua]),
    );

    return achievements.map((a) => {
      const ua = userAchievementMap.get(a.id);
      const progress = ua?.progress || 0;
      const progressPercentage = Math.min((progress / a.requirement) * 100, 100);
      const isUnlocked = progress >= a.requirement;

      return {
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category.toLowerCase(),
        requirement: a.requirement,
        reward: a.reward.toString(),
        createdAt: a.createdAt,
        progress,
        progressPercentage,
        isUnlocked,
        unlockedAt: ua?.unlockedAt,
        claimed: ua?.claimed || false,
        claimedAt: ua?.claimedAt,
      };
    });
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => {
      const progressPercentage = Math.min(
        (ua.progress / ua.achievement.requirement) * 100,
        100,
      );
      const isUnlocked = ua.progress >= ua.achievement.requirement;

      return {
        id: ua.id,
        userId: ua.userId,
        achievementId: ua.achievementId,
        progress: ua.progress,
        unlockedAt: ua.unlockedAt,
        claimed: ua.claimed,
        claimedAt: ua.claimedAt,
        achievement: {
          id: ua.achievement.id,
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          category: ua.achievement.category.toLowerCase(),
          requirement: ua.achievement.requirement,
          reward: ua.achievement.reward.toString(),
          createdAt: ua.achievement.createdAt,
        },
        progressPercentage,
        isUnlocked,
      };
    });
  }

  /**
   * Claim achievement reward
   */
  async claimReward(userId: string, achievementId: string) {
    // Get user achievement
    const userAchievement = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
      include: { achievement: true },
    });

    if (!userAchievement) {
      throw new NotFoundException(ERROR_MESSAGES.ACHIEVEMENT_NOT_UNLOCKED);
    }

    // Check if unlocked
    if (userAchievement.progress < userAchievement.achievement.requirement) {
      throw new BadRequestException(ERROR_MESSAGES.ACHIEVEMENT_NOT_UNLOCKED);
    }

    // Check if already claimed
    if (userAchievement.claimed) {
      throw new BadRequestException(ERROR_MESSAGES.ACHIEVEMENT_ALREADY_CLAIMED);
    }

    // Claim reward
    await this.prisma.$transaction(async (tx) => {
      // Update user coins
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: userAchievement.achievement.reward },
        },
      });

      // Update user stats
      await tx.userStats.update({
        where: { userId },
        data: {
          totalEarned: { increment: userAchievement.achievement.reward },
        },
      });

      // Mark as claimed
      await tx.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          claimed: true,
          claimedAt: new Date(),
        },
      });
    });

    this.logger.log(`Achievement claimed: ${userId} - ${achievementId}`);

    return {
      success: true,
      reward: userAchievement.achievement.reward.toString(),
      achievement: {
        id: userAchievement.achievement.id,
        name: userAchievement.achievement.name,
        description: userAchievement.achievement.description,
        icon: userAchievement.achievement.icon,
        category: userAchievement.achievement.category.toLowerCase(),
        requirement: userAchievement.achievement.requirement,
        reward: userAchievement.achievement.reward.toString(),
        createdAt: userAchievement.achievement.createdAt,
      },
    };
  }

  /**
   * Update achievement progress
   */
  async updateProgress(
    userId: string,
    category: string,
    value: number,
  ): Promise<void> {
    // Get all achievements in this category
    const achievements = await this.prisma.achievement.findMany({
      where: { category: category.toUpperCase() as any },
    });

    for (const achievement of achievements) {
      // Check if user has this achievement tracked
      let userAchievement = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (!userAchievement) {
        // Create new tracking
        userAchievement = await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: value,
          },
        });
      } else if (!userAchievement.unlockedAt) {
        // Update progress
        const newProgress = Math.min(value, achievement.requirement);
        const unlockedAt = newProgress >= achievement.requirement ? new Date() : null;

        await this.prisma.userAchievement.update({
          where: { id: userAchievement.id },
          data: {
            progress: newProgress,
            unlockedAt,
          },
        });

        if (unlockedAt) {
          this.logger.log(
            `Achievement unlocked: ${userId} - ${achievement.name}`,
          );

          // Update stats
          await this.prisma.userStats.update({
            where: { userId },
            data: { achievementsUnlocked: { increment: 1 } },
          });
        }
      }
    }
  }
}
