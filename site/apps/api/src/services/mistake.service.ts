import mistakeRepository, {
  CreateMistakeData,
  UpdateMistakeData,
  MistakeFilter,
  PaginatedResult,
} from '../repositories/mistake.repository';

class MistakeService {
  /**
   * Add a question to mistake notebook
   */
  async add(data: CreateMistakeData): Promise<any> {
    // Check if question exists
    const existingMistake = await mistakeRepository.getMistake(data.userId, data.questionId);
    if (existingMistake) {
      // Update existing mistake
      return mistakeRepository.add(data);
    }

    const mistake = await mistakeRepository.add(data);
    return mistake;
  }

  /**
   * Remove from mistake notebook
   */
  async remove(userId: string, questionId: string): Promise<any> {
    const mistake = await mistakeRepository.getMistake(userId, questionId);
    if (!mistake) {
      throw new Error('Mistake not found in notebook');
    }

    return mistakeRepository.remove(userId, questionId);
  }

  /**
   * Get all mistakes for a user
   */
  async getUserMistakes(
    filter: MistakeFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return mistakeRepository.getUserMistakes(filter, page, limit);
  }

  /**
   * Get mistakes by chapter
   */
  async getMistakesByChapter(userId: string, chapterId: string): Promise<any[]> {
    return mistakeRepository.getMistakesByChapter(userId, chapterId);
  }

  /**
   * Get mistakes by subject
   */
  async getMistakesBySubject(userId: string, subjectId: string): Promise<any[]> {
    return mistakeRepository.getMistakesBySubject(userId, subjectId);
  }

  /**
   * Get a specific mistake
   */
  async getMistake(userId: string, questionId: string): Promise<any | null> {
    return mistakeRepository.getMistake(userId, questionId);
  }

  /**
   * Update revision status using spaced repetition
   */
  async updateRevisionStatus(
    userId: string,
    questionId: string,
    quality: number // 0-5 rating
  ): Promise<any> {
    // Validate quality rating
    if (quality < 0 || quality > 5) {
      throw new Error('Quality rating must be between 0 and 5');
    }

    const mistake = await mistakeRepository.getMistake(userId, questionId);
    if (!mistake) {
      throw new Error('Mistake not found in notebook');
    }

    const updated = await mistakeRepository.updateRevisionStatus(userId, questionId, quality);
    return updated;
  }

  /**
   * Get revision queue (mistakes due for revision)
   */
  async getRevisionQueue(userId: string, limit?: number): Promise<any[]> {
    return mistakeRepository.getRevisionQueue(userId, limit);
  }

  /**
   * Get mistake statistics for a user
   */
  async getMistakeStats(userId: string): Promise<any> {
    return mistakeRepository.getMistakeStats(userId);
  }

  /**
   * Update mistake notes
   */
  async updateNotes(userId: string, questionId: string, notes: string): Promise<any> {
    const mistake = await mistakeRepository.getMistake(userId, questionId);
    if (!mistake) {
      throw new Error('Mistake not found in notebook');
    }

    return mistakeRepository.updateNotes(userId, questionId, notes);
  }

  /**
   * Check if question is in mistake notebook
   */
  async isInMistakeNotebook(userId: string, questionId: string): Promise<boolean> {
    return mistakeRepository.isInMistakeNotebook(userId, questionId);
  }

  /**
   * Get mistakes by type
   */
  async getMistakesByType(
    userId: string,
    mistakeType: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return mistakeRepository.getUserMistakes(
      { userId, mistakeType },
      page,
      limit
    );
  }

  /**
   * Get mistakes by severity
   */
  async getMistakesBySeverity(
    userId: string,
    severity: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return mistakeRepository.getUserMistakes(
      { userId, severity },
      page,
      limit
    );
  }

  /**
   * Get mastered mistakes
   */
  async getMasteredMistakes(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return mistakeRepository.getUserMistakes(
      { userId, isMastered: true },
      page,
      limit
    );
  }

  /**
   * Get pending mistakes (not mastered)
   */
  async getPendingMistakes(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return mistakeRepository.getUserMistakes(
      { userId, isMastered: false },
      page,
      limit
    );
  }

  /**
   * Start a revision session
   */
  async startRevisionSession(userId: string, count: number = 10): Promise<any[]> {
    const queue = await this.getRevisionQueue(userId, count);
    return queue;
  }

  /**
   * Complete a revision session
   */
  async completeRevisionSession(
    userId: string,
    revisions: Array<{ questionId: string; quality: number }>
  ): Promise<any> {
    const results = [];

    for (const revision of revisions) {
      try {
        const updated = await this.updateRevisionStatus(
          userId,
          revision.questionId,
          revision.quality
        );
        results.push({
          questionId: revision.questionId,
          success: true,
          isMastered: updated.isMastered,
        });
      } catch (error: any) {
        results.push({
          questionId: revision.questionId,
          success: false,
          error: error.message,
        });
      }
    }

    // Log daily activity
    const successfulRevisions = results.filter((r) => r.success).length;
    // This would need to call progressService.logDailyActivity

    return {
      total: revisions.length,
      successful: successfulRevisions,
      results,
    };
  }

  /**
   * Get mistake summary for dashboard
   */
  async getMistakeSummary(userId: string): Promise<any> {
    const [stats, revisionQueue] = await Promise.all([
      this.getMistakeStats(userId),
      this.getRevisionQueue(userId, 5),
    ]);

    return {
      ...stats,
      revisionQueueCount: revisionQueue.length,
      upcomingRevisions: revisionQueue.slice(0, 5),
    };
  }
}

export const mistakeService = new MistakeService();
export default mistakeService;