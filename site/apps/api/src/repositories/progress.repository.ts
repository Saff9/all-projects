import prisma from '../lib/prisma';

export interface UpdateProgressData {
  status?: string;
  completionPercentage?: number;
  totalQuestions?: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  questionsIncorrect?: number;
  questionsSkipped?: number;
  totalTimeSpentSeconds?: bigint;
  averageTimePerQuestion?: number;
  accuracyPercentage?: number;
  lastScorePercentage?: number;
  bestScorePercentage?: number;
  isWeakChapter?: boolean;
  weaknessScore?: number;
  revisionCount?: number;
  lastRevisedAt?: Date;
  nextRevisionDue?: Date;
  firstAccessedAt?: Date;
  lastAccessedAt?: Date;
  completedAt?: Date;
}

export interface ProgressFilter {
  userId: string;
  subjectId?: string;
  status?: string;
  isWeakChapter?: boolean;
}

class ProgressRepository {
  /**
   * Create or update user progress for a chapter
   */
  async upsertProgress(userId: string, chapterId: string, data: UpdateProgressData) {
    return prisma.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        chapterId,
        ...data,
      },
    });
  }

  /**
   * Get user progress for a specific chapter
   */
  async getProgress(userId: string, chapterId: string) {
    return prisma.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      include: {
        chapter: {
          include: {
            subject: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(
    userId: string,
    filter: { subjectId?: string; status?: string; isWeakChapter?: boolean } = {}
  ) {
    const where: any = { userId };

    if (filter.subjectId) {
      where.chapter = { subjectId: filter.subjectId };
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.isWeakChapter !== undefined) {
      where.isWeakChapter = filter.isWeakChapter;
    }

    return prisma.userProgress.findMany({
      where,
      include: {
        chapter: {
          include: {
            subject: {
              select: { id: true, name: true, slug: true, colorCode: true },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });
  }

  /**
   * Get overall progress by subject
   */
  async getOverallProgressBySubject(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        chapter: {
          include: {
            subject: {
              select: { id: true, name: true, slug: true, colorCode: true },
            },
          },
        },
      },
    });

    // Group by subject
    const subjectProgress: Record<string, any> = {};

    for (const p of progress) {
      const subjectId = p.chapter.subject.id;
      if (!subjectProgress[subjectId]) {
        subjectProgress[subjectId] = {
          subject: p.chapter.subject,
          totalChapters: 0,
          completedChapters: 0,
          inProgressChapters: 0,
          notStartedChapters: 0,
          totalQuestions: 0,
          questionsAttempted: 0,
          questionsCorrect: 0,
          averageAccuracy: 0,
          totalTimeSpentSeconds: BigInt(0),
        };
      }

      const sp = subjectProgress[subjectId];
      sp.totalChapters += 1;
      sp.totalQuestions += p.totalQuestions;
      sp.questionsAttempted += p.questionsAttempted;
      sp.questionsCorrect += p.questionsCorrect;
      sp.totalTimeSpentSeconds += p.totalTimeSpentSeconds;

      if (p.status === 'completed') {
        sp.completedChapters += 1;
      } else if (p.status === 'in_progress') {
        sp.inProgressChapters += 1;
      } else {
        sp.notStartedChapters += 1;
      }
    }

    // Calculate averages
    for (const subjectId in subjectProgress) {
      const sp = subjectProgress[subjectId];
      sp.averageAccuracy =
        sp.questionsAttempted > 0
          ? (sp.questionsCorrect / sp.questionsAttempted) * 100
          : 0;
      sp.completionPercentage =
        sp.totalChapters > 0
          ? (sp.completedChapters / sp.totalChapters) * 100
          : 0;
    }

    return Object.values(subjectProgress);
  }

  /**
   * Get weak chapters for a user
   */
  async getWeakChapters(userId: string, limit?: number) {
    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        isWeakChapter: true,
      },
      include: {
        chapter: {
          include: {
            subject: {
              select: { id: true, name: true, slug: true, colorCode: true },
            },
          },
        },
      },
      orderBy: { weaknessScore: 'desc' },
      take: limit,
    });

    return progress;
  }

  /**
   * Mark chapter as weak
   */
  async markAsWeak(userId: string, chapterId: string, weaknessScore: number) {
    return prisma.userProgress.update({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      data: {
        isWeakChapter: true,
        weaknessScore,
      },
    });
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.studyStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      // Create new streak
      return prisma.studyStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          streakStartDate: today,
        },
      });
    }

    const lastActivity = streak.lastActivityDate;
    if (!lastActivity) {
      return prisma.studyStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(streak.longestStreak, 1),
          lastActivityDate: today,
          streakStartDate: today,
        },
      });
    }

    const lastActivityDate = new Date(lastActivity);
    lastActivityDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastActivityDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no update needed
      return streak;
    } else if (diffDays === 1) {
      // Consecutive day
      const newStreak = streak.currentStreak + 1;
      return prisma.studyStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          lastActivityDate: today,
        },
      });
    } else {
      // Streak broken
      return prisma.studyStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActivityDate: today,
          streakStartDate: today,
        },
      });
    }
  }

  /**
   * Get streak
   */
  async getStreak(userId: string) {
    return prisma.studyStreak.findUnique({
      where: { userId },
    });
  }

  /**
   * Log daily activity
   */
  async logDailyActivity(
    userId: string,
    data: {
      totalTimeSeconds?: bigint;
      questionsSolved?: number;
      questionsCorrect?: number;
      testsTaken?: number;
      chaptersStudied?: number;
      mistakesReviewed?: number;
      pomodoroSessions?: number;
      pomodoroMinutes?: number;
    }
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.dailyActivityLog.upsert({
      where: {
        userId_activityDate: {
          userId,
          activityDate: today,
        },
      },
      update: {
        totalTimeSeconds: data.totalTimeSeconds
          ? { increment: data.totalTimeSeconds }
          : undefined,
        sessionsCount: { increment: 1 },
        questionsSolved: data.questionsSolved
          ? { increment: data.questionsSolved }
          : undefined,
        questionsCorrect: data.questionsCorrect
          ? { increment: data.questionsCorrect }
          : undefined,
        testsTaken: data.testsTaken ? { increment: data.testsTaken } : undefined,
        chaptersStudied: data.chaptersStudied
          ? { increment: data.chaptersStudied }
          : undefined,
        mistakesReviewed: data.mistakesReviewed
          ? { increment: data.mistakesReviewed }
          : undefined,
        pomodoroSessions: data.pomodoroSessions
          ? { increment: data.pomodoroSessions }
          : undefined,
        pomodoroMinutes: data.pomodoroMinutes
          ? { increment: data.pomodoroMinutes }
          : undefined,
      },
      create: {
        userId,
        activityDate: today,
        totalTimeSeconds: data.totalTimeSeconds || BigInt(0),
        sessionsCount: 1,
        questionsSolved: data.questionsSolved || 0,
        questionsCorrect: data.questionsCorrect || 0,
        testsTaken: data.testsTaken || 0,
        chaptersStudied: data.chaptersStudied || 0,
        mistakesReviewed: data.mistakesReviewed || 0,
        pomodoroSessions: data.pomodoroSessions || 0,
        pomodoroMinutes: data.pomodoroMinutes || 0,
      },
    });
  }

  /**
   * Get daily activity for a date range
   */
  async getDailyActivity(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.dailyActivityLog.findMany({
      where: {
        userId,
        activityDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { activityDate: 'asc' },
    });
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(userId: string) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const activities = await prisma.dailyActivityLog.findMany({
      where: {
        userId,
        activityDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const summary = {
      totalTimeSeconds: BigInt(0),
      totalQuestionsSolved: 0,
      totalQuestionsCorrect: 0,
      totalTestsTaken: 0,
      totalChaptersStudied: 0,
      totalMistakesReviewed: 0,
      activeDays: activities.length,
    };

    for (const activity of activities) {
      summary.totalTimeSeconds += activity.totalTimeSeconds;
      summary.totalQuestionsSolved += activity.questionsSolved;
      summary.totalQuestionsCorrect += activity.questionsCorrect;
      summary.totalTestsTaken += activity.testsTaken;
      summary.totalChaptersStudied += activity.chaptersStudied;
      summary.totalMistakesReviewed += activity.mistakesReviewed;
    }

    return summary;
  }

  /**
   * Delete progress for a chapter
   */
  async deleteProgress(userId: string, chapterId: string) {
    return prisma.userProgress.delete({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });
  }
}

export const progressRepository = new ProgressRepository();
export default progressRepository;
