import testRepository, {
  CreateTestData,
  CreateTestWithQuestionsData,
  CreateTestQuestionData,
  UpdateTestData,
  TestFilter,
  PaginatedResult,
} from '../repositories/test.repository';
import questionRepository from '../repositories/question.repository';
import progressRepository from '../repositories/progress.repository';

class TestService {
  /**
   * Create a test with questions
   */
  async create(data: CreateTestWithQuestionsData): Promise<any> {
    // Check if slug already exists
    const slugExists = await testRepository.slugExists(data.slug);
    if (slugExists) {
      throw new Error('Test with this slug already exists');
    }

    // Validate questions count
    if (data.questions.length !== data.totalQuestions) {
      throw new Error('Number of questions does not match totalQuestions');
    }

    // Validate question numbers are sequential
    const questionNumbers = data.questions.map((q) => q.questionNumber).sort((a, b) => a - b);
    for (let i = 0; i < questionNumbers.length; i++) {
      if (questionNumbers[i] !== i + 1) {
        throw new Error('Question numbers must be sequential starting from 1');
      }
    }

    const test = await testRepository.createWithQuestions(data);
    return test;
  }

  /**
   * Create a chapter test with random questions
   */
  async createChapterTest(
    chapterId: string,
    subjectId: string,
    examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED',
    questionCount: number = 30,
    title?: string
  ): Promise<any> {
    // Get random questions for the chapter
    const questions = await questionRepository.getRandomQuestions(
      { chapterId, subjectId },
      questionCount
    );

    if (questions.length < questionCount) {
      throw new Error(`Not enough questions in chapter. Found ${questions.length}, need ${questionCount}`);
    }

    // Create test data
    const slug = `chapter-${chapterId}-${Date.now()}`;
    const testQuestions: CreateTestQuestionData[] = questions.map((q: any, index: number) => ({
      questionId: q.id,
      questionNumber: index + 1,
      marks: 4,
    }));

    const test = await this.create({
      title: title || `Chapter Test - ${chapterId}`,
      slug,
      testType: 'chapter_test',
      examType,
      subjectId,
      totalQuestions: questionCount,
      totalMarks: questionCount * 4,
      durationMinutes: Math.round(questionCount * 2), // 2 minutes per question
      questions: testQuestions,
    });

    return test;
  }

  /**
   * Get all tests with filtering and pagination
   */
  async findAll(
    filter: TestFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    // Default to active and public tests only
    if (filter.isActive === undefined) {
      filter.isActive = true;
    }
    if (filter.isPublic === undefined) {
      filter.isPublic = true;
    }

    return testRepository.findAll(filter, page, limit);
  }

  /**
   * Get test by ID with questions
   */
  async findById(id: string): Promise<any | null> {
    if (!id) {
      throw new Error('Test ID is required');
    }

    return testRepository.findById(id);
  }

  /**
   * Get test by slug
   */
  async findBySlug(slug: string): Promise<any | null> {
    if (!slug) {
      throw new Error('Test slug is required');
    }

    return testRepository.findBySlug(slug);
  }

  /**
   * Start a test attempt
   */
  async startAttempt(testId: string, userId: string): Promise<any> {
    // Check if test exists and is active
    const test = await testRepository.findById(testId);
    if (!test) {
      throw new Error('Test not found');
    }
    if (!test.isActive) {
      throw new Error('Test is not available');
    }

    // Check if there's already an active attempt
    const activeAttempt = await testRepository.getActiveAttempt(testId, userId);
    if (activeAttempt) {
      return activeAttempt; // Return existing attempt
    }

    const attempt = await testRepository.startAttempt(testId, userId);
    return attempt;
  }

  /**
   * Submit an answer for a question
   */
  async submitAnswer(
    attemptId: string,
    questionId: string,
    data: {
      selectedOptions: string[];
      numericalAnswer?: number;
      timeSpentSeconds: number;
      markedForReview?: boolean;
    }
  ): Promise<any> {
    // Get the attempt
    const attempt = await testRepository.getAttemptById(attemptId) as any;
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    if (attempt.status !== 'in_progress') {
      throw new Error('Attempt is not in progress');
    }

    // Get the question to check correctness
    const question = await questionRepository.findById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Determine if answer is correct
    let isCorrect: boolean | undefined;
    let marksObtained: number | undefined;

    if (data.selectedOptions.length > 0) {
      // For MCQ questions
      const correctOptions = question.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.optionLabel);

      isCorrect =
        data.selectedOptions.length === correctOptions.length &&
        data.selectedOptions.every((opt) => correctOptions.includes(opt));

      // Calculate marks
      const markingScheme = attempt.test.markingScheme as any;
      if (isCorrect) {
        marksObtained = Number(markingScheme?.correct ?? 4);
      } else {
        marksObtained = Number(markingScheme?.incorrect ?? -1);
      }
    }

    // Save the answer
    const response = await testRepository.submitAnswer(attemptId, questionId, {
      selectedOptions: data.selectedOptions,
      numericalAnswer: data.numericalAnswer,
      isCorrect,
      isAttempted: data.selectedOptions.length > 0,
      timeSpentSeconds: data.timeSpentSeconds,
      marksObtained,
      markedForReview: data.markedForReview,
    });

    return response;
  }

  /**
   * Finish a test attempt
   */
  async finishAttempt(attemptId: string): Promise<any> {
    // Get the attempt with all responses
    const attempt = await testRepository.getAttemptResults(attemptId) as any;
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    if (attempt.status !== 'in_progress') {
      throw new Error('Attempt is not in progress');
    }

    // Calculate results
    const responses = attempt.answerResponses;
    const testQuestions = attempt.test.testQuestions;

    let attemptedQuestions = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;
    let marksObtained = 0;
    let totalTimeSeconds = 0;

    const subjectWiseScores: Record<string, number> = {};
    const chapterWiseScores: Record<string, number> = {};
    const timeDistribution: Record<string, number> = {};

    for (const tq of testQuestions) {
      const response = responses.find((r: any) => r.questionId === tq.questionId);
      const question = tq.question;

      if (response && response.isAttempted) {
        attemptedQuestions++;
        totalTimeSeconds += response.timeSpentSeconds || 0;

        if (response.isCorrect) {
          correctAnswers++;
          marksObtained += Number(response.marksObtained) || 0;
        } else {
          incorrectAnswers++;
          marksObtained += Number(response.marksObtained) || 0; // negative marks
        }

        // Subject-wise scores
        const subjectId = question.subjectId;
        if (!subjectWiseScores[subjectId]) {
          subjectWiseScores[subjectId] = 0;
        }
        subjectWiseScores[subjectId] += Number(response.marksObtained) || 0;

        // Chapter-wise scores
        const chapterId = question.chapterId;
        if (!chapterWiseScores[chapterId]) {
          chapterWiseScores[chapterId] = 0;
        }
        chapterWiseScores[chapterId] += Number(response.marksObtained) || 0;

        // Time distribution by subject
        if (!timeDistribution[subjectId]) {
          timeDistribution[subjectId] = 0;
        }
        timeDistribution[subjectId] += response.timeSpentSeconds || 0;
      } else {
        skippedQuestions++;
      }
    }

    const percentage = attempt.totalMarks
      ? (marksObtained / Number(attempt.totalMarks)) * 100
      : 0;

    // Finish the attempt
    const finishedAttempt = await testRepository.finishAttempt(attemptId, {
      timeTakenSeconds: totalTimeSeconds,
      attemptedQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      marksObtained,
      percentage,
      subjectWiseScores,
      chapterWiseScores,
      timeDistribution,
    });

    // Update test statistics
    await testRepository.updateTestStats(attempt.testId);

    // Update user progress for chapters
    for (const chapterId in chapterWiseScores) {
      await progressRepository.upsertProgress(attempt.userId, chapterId, {
        lastAccessedAt: new Date(),
      });
    }

    // Update streak
    await progressRepository.updateStreak(attempt.userId);

    // Log daily activity
    await progressRepository.logDailyActivity(attempt.userId, {
      totalTimeSeconds: BigInt(totalTimeSeconds),
      questionsSolved: attemptedQuestions,
      questionsCorrect: correctAnswers,
      testsTaken: 1,
    });

    return finishedAttempt;
  }

  /**
   * Get attempt results
   */
  async getAttemptResults(attemptId: string): Promise<any | null> {
    return testRepository.getAttemptResults(attemptId);
  }

  /**
   * Get user's test history
   */
  async getUserTestHistory(
    userId: string,
    filter: { testType?: string; examType?: string } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    return testRepository.getUserTestHistory(userId, filter, page, limit);
  }

  /**
   * Update test
   */
  async update(id: string, data: UpdateTestData): Promise<any> {
    // Check if test exists
    const exists = await testRepository.exists(id);
    if (!exists) {
      throw new Error('Test not found');
    }

    // Check if new slug already exists (if slug is being updated)
    if (data.slug) {
      const slugExists = await testRepository.slugExists(data.slug, id);
      if (slugExists) {
        throw new Error('Test with this slug already exists');
      }
    }

    const test = await testRepository.update(id, data);
    return test;
  }

  /**
   * Delete test (soft delete)
   */
  async delete(id: string): Promise<any> {
    // Check if test exists
    const exists = await testRepository.exists(id);
    if (!exists) {
      throw new Error('Test not found');
    }

    const test = await testRepository.delete(id);
    return test;
  }

  /**
   * Get tests by exam type
   */
  async findByExamType(examType: string, limit: number = 20): Promise<any[]> {
    const result = await testRepository.findAll(
      { examType, isActive: true, isPublic: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Get tests by subject
   */
  async findBySubject(subjectId: string, limit: number = 20): Promise<any[]> {
    const result = await testRepository.findAll(
      { subjectId, isActive: true, isPublic: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Search tests
   */
  async search(query: string, limit: number = 10): Promise<any[]> {
    const result = await testRepository.findAll(
      { search: query, isActive: true, isPublic: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Get leaderboard for a test
   */
  async getLeaderboard(testId: string, limit: number = 10): Promise<any[]> {
    const attempts = await testRepository.getAttemptResults(testId);
    // This would need a custom query to get top performers
    // For now, return empty array
    return [];
  }
}

export const testService = new TestService();
export default testService;