import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { StartQuestDto } from './dto/complete-quest.dto';
import { ERROR_MESSAGES } from '@cryptoverse/shared';

@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all quests with user progress
   */
  async getAllQuests(userId: string, type?: string, status?: string) {
    const now = new Date();
    
    const where: any = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
    };

    if (type) {
      where.type = type.toUpperCase();
    }

    const [quests, userQuests] = await Promise.all([
      this.prisma.quest.findMany({
        where,
        orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.userQuest.findMany({
        where: { userId },
        include: { quest: true },
      }),
    ]);

    // Create a map of user quests
    const userQuestMap = new Map(
      userQuests.map((uq) => [uq.questId, uq]),
    );

    let result = quests.map((q) => {
      const uq = userQuestMap.get(q.id);
      const progress = uq?.progress || 0;
      const progressPercentage = Math.min((progress / q.requirement) * 100, 100);
      const isCompleted = progress >= q.requirement;

      return {
        id: q.id,
        name: q.name,
        description: q.description,
        type: q.type.toLowerCase(),
        requirement: q.requirement,
        reward: q.reward.toString(),
        expiresAt: q.expiresAt,
        createdAt: q.createdAt,
        progress,
        progressPercentage,
        isCompleted,
        status: uq?.status.toLowerCase() || 'pending',
        startedAt: uq?.startedAt,
        completedAt: uq?.completedAt,
        claimedAt: uq?.claimedAt,
      };
    });

    // Filter by status if provided
    if (status) {
      result = result.filter((r) => r.status === status);
    }

    return result;
  }

  /**
   * Get user's quests
   */
  async getUserQuests(userId: string) {
    const userQuests = await this.prisma.userQuest.findMany({
      where: { userId },
      include: { quest: true },
      orderBy: { startedAt: 'desc' },
    });

    return userQuests.map((uq) => {
      const progressPercentage = Math.min(
        (uq.progress / uq.quest.requirement) * 100,
        100,
      );
      const isCompleted = uq.progress >= uq.quest.requirement;

      return {
        id: uq.id,
        userId: uq.userId,
        questId: uq.questId,
        progress: uq.progress,
        status: uq.status.toLowerCase(),
        startedAt: uq.startedAt,
        completedAt: uq.completedAt,
        claimedAt: uq.claimedAt,
        quest: {
          id: uq.quest.id,
          name: uq.quest.name,
          description: uq.quest.description,
          type: uq.quest.type.toLowerCase(),
          requirement: uq.quest.requirement,
          reward: uq.quest.reward.toString(),
          expiresAt: uq.quest.expiresAt,
          createdAt: uq.quest.createdAt,
        },
        progressPercentage,
        isCompleted,
      };
    });
  }

  /**
   * Start a quest
   */
  async startQuest(userId: string, startQuestDto: StartQuestDto) {
    // Check if quest exists
    const quest = await this.prisma.quest.findUnique({
      where: { id: startQuestDto.questId },
    });

    if (!quest) {
      throw new NotFoundException(ERROR_MESSAGES.QUEST_NOT_FOUND);
    }

    // Check if already started
    const existing = await this.prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId,
          questId: startQuestDto.questId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'CLAIMED') {
        throw new BadRequestException(ERROR_MESSAGES.QUEST_ALREADY_COMPLETED);
      }
      return {
        success: true,
        message: 'Quest already started',
        userQuest: {
          id: existing.id,
          progress: existing.progress,
          status: existing.status.toLowerCase(),
        },
      };
    }

    // Start quest
    const userQuest = await this.prisma.userQuest.create({
      data: {
        userId,
        questId: startQuestDto.questId,
        progress: 0,
        status: 'IN_PROGRESS',
      },
    });

    this.logger.log(`Quest started: ${userId} - ${startQuestDto.questId}`);

    return {
      success: true,
      message: 'Quest started',
      userQuest: {
        id: userQuest.id,
        progress: userQuest.progress,
        status: userQuest.status.toLowerCase(),
      },
    };
  }

  /**
   * Claim quest reward
   */
  async claimReward(userId: string, questId: string) {
    // Get user quest
    const userQuest = await this.prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId,
          questId,
        },
      },
      include: { quest: true },
    });

    if (!userQuest) {
      throw new NotFoundException(ERROR_MESSAGES.QUEST_NOT_STARTED);
    }

    // Check if completed
    if (userQuest.progress < userQuest.quest.requirement) {
      throw new BadRequestException('Quest not yet completed');
    }

    // Check if already claimed
    if (userQuest.status === 'CLAIMED') {
      throw new BadRequestException(ERROR_MESSAGES.QUEST_ALREADY_COMPLETED);
    }

    // Claim reward
    await this.prisma.$transaction(async (tx) => {
      // Update user coins
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: userQuest.quest.reward },
        },
      });

      // Update user stats
      await tx.userStats.update({
        where: { userId },
        data: {
          totalEarned: { increment: userQuest.quest.reward },
          questsCompleted: { increment: 1 },
        },
      });

      // Mark as claimed
      await tx.userQuest.update({
        where: { id: userQuest.id },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
        },
      });
    });

    this.logger.log(`Quest claimed: ${userId} - ${questId}`);

    return {
      success: true,
      reward: userQuest.quest.reward.toString(),
      quest: {
        id: userQuest.quest.id,
        name: userQuest.quest.name,
        description: userQuest.quest.description,
        type: userQuest.quest.type.toLowerCase(),
        requirement: userQuest.quest.requirement,
        reward: userQuest.quest.reward.toString(),
        expiresAt: userQuest.quest.expiresAt,
        createdAt: userQuest.quest.createdAt,
      },
    };
  }

  /**
   * Update quest progress
   */
  async updateProgress(
    userId: string,
    questType: string,
    value: number,
  ): Promise<void> {
    // Get all active quests of this type for the user
    const userQuests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        status: 'IN_PROGRESS',
        quest: {
          type: questType.toUpperCase() as any,
        },
      },
      include: { quest: true },
    });

    for (const uq of userQuests) {
      const newProgress = Math.min(value, uq.quest.requirement);
      const isCompleted = newProgress >= uq.quest.requirement;

      await this.prisma.userQuest.update({
        where: { id: uq.id },
        data: {
          progress: newProgress,
          status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          completedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted) {
        this.logger.log(`Quest completed: ${userId} - ${uq.quest.name}`);
      }
    }
  }
}
