import progressRepository, { UpdateProgressData } from '../repositories/progress.repository';

class ProgressService {
  /**
   * Update chapter progress
   */
  async updateProgress(
    userId: string,
    chapterId: string,
    data: UpdateProgressData
  ): Promise<any> {
    // Get existing progress
    const existingProgress = await progressRepository.getProgress(userId, chapterId);

    // Calculate derived fields
    const updateData: UpdateProgressData = { ...data };

    // Calculate accuracy if we have the data
    if (data.questionsAttempted !== undefined && data.questionsCorrect !== undefined) {
      updateData.accuracyPercentage =
        data.questionsAttempted > 0
          ? (data.questionsCorrect / data.questionsAttempted) * 100
          : 0;
    }

    // Update status based on completion
    if (data.completionPercentage !== undefined) {
      if (data.completionPercentage === 0) {
        updateData.status = 'not_started';
      } else if (data.completionPercentage >= 100) {
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      } else {
        updateData.status = 'in_progress';
      }
    }

    // Set first accessed date if new
    if (!existingProgress) {
      updateData.firstAccessedAt = new Date();
    }
    updateData.lastAccessedAt = new Date();

    // Calculate weakness score
    if (updateData.accuracyPercentage !== undefined) {
      const weaknessScore = this.calculateWeaknessScore(
        updateData.accuracyPercentage,
        data.questionsAttempted || existingProgress?.questionsAttempted || 0
      );
      updateData.isWeakChapter = weaknessScore > 50;
      updateData.weaknessScore = weaknessScore;
    }

    const progress = await progressRepository.upsertProgress(userId, chapterId, updateData);
    return progress;
  }

  /**
   * Calculate weakness score (higher = weaker)
   */
  private calculateWeaknessScore(accuracy: number, attempts: number): number {
    // Weight factors:
    // - Low accuracy increases weakness
    // - More attempts with low accuracy increases weakness
    const accuracyWeight = 100 - accuracy;
    const attemptWeight = Math.min(attempts / 50, 1); // Normalize to max 1

    return accuracyWeight * (0.7 + 0.3 * attemptWeight);
  }

  /**
   * Get progress for a specific chapter
   */
  async getProgress(userId: string, chapterId: string): Promise<any | null> {
    return progressRepository.getProgress(userId, chapterId);
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(
    userId: string,
    filter: { subjectId?: string; status?: string; isWeakChapter?: boolean } = {}
  ): Promise<any[]> {
    return progressRepository.getUserProgress(userId, filter);
  }

  /**
   * Get overall progress by subject
   */
  async getOverallProgressBySubject(userId: string): Promise<any[]> {
    return progressRepository.getOverallProgressBySubject(userId);
  }

  /**
   * Get weak chapters for a user
   */
  async getWeakChapters(userId: string, limit?: number): Promise<any[]> {
    return progressRepository.getWeakChapters(userId, limit);
  }

  /**
   * Mark chapter as weak
   */
  async markAsWeak(userId: string, chapterId: string, weaknessScore?: number): Promise<any> {
    const progress = await progressRepository.getProgress(userId, chapterId);
    const score = weaknessScore || progress?.weaknessScore || 50;

    return progressRepository.markAsWeak(userId, chapterId, Number(score));
  }

  /**
   * Update study streak
   */
  async updateStreak(userId: string): Promise<any> {
    return progressRepository.updateStreak(userId);
  }

  /**
   * Get current streak
   */
  async getStreak(userId: string): Promise<any | null> {
    return progressRepository.getStreak(userId);
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
  ): Promise<any> {
    // Also update streak when logging activity
    await progressRepository.updateStreak(userId);

    return progressRepository.logDailyActivity(userId, data);
  }

  /**
   * Get daily activity for a date range
   */
  async getDailyActivity(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return progressRepository.getDailyActivity(userId, startDate, endDate);
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(userId: string): Promise<any> {
    return progressRepository.getWeeklySummary(userId);
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats(userId: string): Promise<any> {
    const [overallProgress, weakChapters, streak, weeklySummary] = await Promise.all([
      this.getOverallProgressBySubject(userId),
      this.getWeakChapters(userId, 5),
      this.getStreak(userId),
      this.getWeeklySummary(userId),
    ]);

    // Calculate total stats
    let totalChapters = 0;
    let completedChapters = 0;
    let totalQuestions = 0;
    let questionsAttempted = 0;
    let questionsCorrect = 0;

    for (const subject of overallProgress) {
      totalChapters += subject.totalChapters;
      completedChapters += subject.completedChapters;
      totalQuestions += subject.totalQuestions;
      questionsAttempted += subject.questionsAttempted;
      questionsCorrect += subject.questionsCorrect;
    }

    return {
      overall: {
        totalChapters,
        completedChapters,
        completionPercentage: totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0,
        totalQuestions,
        questionsAttempted,
        questionsCorrect,
        accuracy: questionsAttempted > 0 ? (questionsCorrect / questionsAttempted) * 100 : 0,
      },
      bySubject: overallProgress,
      weakChapters,
      streak: streak || { currentStreak: 0, longestStreak: 0 },
      weeklyActivity: weeklySummary,
    };
  }

  /**
   * Get progress for revision
   */
  async getRevisionQueue(userId: string): Promise<any[]> {
    // Get chapters that need revision
    const progress = await progressRepository.getUserProgress(userId, {
      status: 'completed',
    });

    // Filter chapters that are due for revision
    const now = new Date();
    const dueForRevision = progress.filter((p: any) => {
      if (!p.nextRevisionDue) return false;
      return new Date(p.nextRevisionDue) <= now;
    });

    return dueForRevision;
  }

  /**
   * Schedule next revision
   */
  async scheduleRevision(userId: string, chapterId: string, daysFromNow: number = 7): Promise<any> {
    const nextRevisionDue = new Date();
    nextRevisionDue.setDate(nextRevisionDue.getDate() + daysFromNow);

    return progressRepository.upsertProgress(userId, chapterId, {
      nextRevisionDue,
      revisionCount: { increment: 1 } as any,
      lastRevisedAt: new Date(),
    });
  }

  /**
   * Delete progress for a chapter
   */
  async deleteProgress(userId: string, chapterId: string): Promise<any> {
    return progressRepository.deleteProgress(userId, chapterId);
  }
}

export const progressService = new ProgressService();
export default progressService;