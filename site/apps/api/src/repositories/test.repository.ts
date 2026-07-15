import prisma from '../lib/prisma';

export interface CreateTestData {
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  testType: string;
  examType: string;
  subjectId?: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  markingScheme?: any;
  isPublic?: boolean;
  isPremium?: boolean;
}

export interface CreateTestQuestionData {
  questionId: string;
  questionNumber: number;
  marks?: number;
}

export interface CreateTestWithQuestionsData extends CreateTestData {
  questions: CreateTestQuestionData[];
}

export interface UpdateTestData {
  title?: string;
  slug?: string;
  description?: string;
  instructions?: string;
  testType?: string;
  examType?: string;
  subjectId?: string;
  totalQuestions?: number;
  totalMarks?: number;
  durationMinutes?: number;
  markingScheme?: any;
  isPublic?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
}

export interface TestFilter {
  testType?: string;
  examType?: string;
  subjectId?: string;
  isPublic?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class TestRepository {
  /**
   * Create a test with questions in a transaction
   */
  async createWithQuestions(data: CreateTestWithQuestionsData) {
    return prisma.$transaction(async (tx: any) => {
      // Create the test
      const test = await tx.test.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          instructions: data.instructions,
          testType: data.testType,
          examType: data.examType,
          subjectId: data.subjectId,
          totalQuestions: data.totalQuestions,
          totalMarks: data.totalMarks,
          durationMinutes: data.durationMinutes,
          markingScheme: data.markingScheme || { correct: 4, incorrect: -1, unattempted: 0 },
          isPublic: data.isPublic ?? true,
          isPremium: data.isPremium ?? false,
        },
      });

      // Create test questions
      if (data.questions && data.questions.length > 0) {
        await tx.testQuestion.createMany({
          data: data.questions.map((q) => ({
            testId: test.id,
            questionId: q.questionId,
            questionNumber: q.questionNumber,
            marks: q.marks ?? 4,
          })),
        });
      }

      return test;
    });
  }

  /**
   * Create a single test (without questions)
   */
  async create(data: CreateTestData) {
    return prisma.test.create({
      data: {
        ...data,
        markingScheme: data.markingScheme || { correct: 4, incorrect: -1, unattempted: 0 },
      },
    });
  }

  /**
   * Find all tests with filtering and pagination
   */
  async findAll(
    filter: TestFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (filter.testType) where.testType = filter.testType;
    if (filter.examType) where.examType = filter.examType;
    if (filter.subjectId) where.subjectId = filter.subjectId;
    if (filter.isPublic !== undefined) where.isPublic = filter.isPublic;
    if (filter.isPremium !== undefined) where.isPremium = filter.isPremium;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.test.count({ where });
    const data = await prisma.test.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            testQuestions: true,
            testAttempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find test by ID with questions
   */
  async findById(id: string) {
    return prisma.test.findUnique({
      where: { id },
      include: {
        subject: true,
        testQuestions: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { questionNumber: 'asc' },
        },
      },
    });
  }

  /**
   * Find test by slug
   */
  async findBySlug(slug: string) {
    return prisma.test.findUnique({
      where: { slug },
      include: {
        subject: true,
        _count: {
          select: {
            testQuestions: true,
            testAttempts: true,
          },
        },
      },
    });
  }

  /**
   * Update test
   */
  async update(id: string, data: UpdateTestData) {
    return prisma.test.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete test (soft delete)
   */
  async delete(id: string) {
    return prisma.test.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete test
   */
  async hardDelete(id: string) {
    return prisma.test.delete({
      where: { id },
    });
  }

  /**
   * Check if test exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.test.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.test.count({
      where: {
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return count > 0;
  }

  // ============================================
  // Test Attempt Methods
  // ============================================

  /**
   * Start a test attempt
   */
  async startAttempt(testId: string, userId: string) {
    // Get the current attempt number
    const existingAttempts = await prisma.testAttempt.count({
      where: { testId, userId },
    });

    // Get test details
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { totalQuestions: true, totalMarks: true },
    });

    if (!test) {
      throw new Error('Test not found');
    }

    return prisma.testAttempt.create({
      data: {
        testId,
        userId,
        attemptNumber: existingAttempts + 1,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
      },
    });
  }

  /**
   * Get test attempt by ID
   */
  async getAttemptById(attemptId: string) {
    return prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            subject: true,
          },
        },
        answerResponses: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get active attempt for a test and user
   */
  async getActiveAttempt(testId: string, userId: string) {
    return prisma.testAttempt.findFirst({
      where: {
        testId,
        userId,
        status: 'in_progress',
      },
      include: {
        answerResponses: true,
      },
    });
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
      isCorrect?: boolean;
      isAttempted: boolean;
      timeSpentSeconds?: number;
      marksObtained?: number;
      markedForReview?: boolean;
    }
  ) {
    return prisma.answerResponse.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        selectedOptions: data.selectedOptions,
        numericalAnswer: data.numericalAnswer,
        isCorrect: data.isCorrect,
        isAttempted: data.isAttempted,
        timeSpentSeconds: data.timeSpentSeconds,
        marksObtained: data.marksObtained,
        markedForReview: data.markedForReview,
        answeredAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        selectedOptions: data.selectedOptions,
        numericalAnswer: data.numericalAnswer,
        isCorrect: data.isCorrect,
        isAttempted: data.isAttempted,
        timeSpentSeconds: data.timeSpentSeconds,
        marksObtained: data.marksObtained,
        markedForReview: data.markedForReview,
        answeredAt: new Date(),
      },
    });
  }

  /**
   * Finish a test attempt
   */
  async finishAttempt(
    attemptId: string,
    results: {
      timeTakenSeconds: number;
      attemptedQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      skippedQuestions: number;
      marksObtained: number;
      percentage: number;
      subjectWiseScores?: any;
      chapterWiseScores?: any;
      timeDistribution?: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const attempt = await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
          timeTakenSeconds: results.timeTakenSeconds,
          attemptedQuestions: results.attemptedQuestions,
          correctAnswers: results.correctAnswers,
          incorrectAnswers: results.incorrectAnswers,
          skippedQuestions: results.skippedQuestions,
          marksObtained: results.marksObtained,
          percentage: results.percentage,
          subjectWiseScores: results.subjectWiseScores || {},
          chapterWiseScores: results.chapterWiseScores || {},
          timeDistribution: results.timeDistribution || {},
        },
      });

      // Update test statistics
      await tx.test.update({
        where: { id: attempt.testId },
        data: {
          attemptsCount: { increment: 1 },
        },
      });

      return attempt;
    });
  }

  /**
   * Get user's test history
   */
  async getUserTestHistory(
    userId: string,
    filter: { testType?: string; examType?: string } = {},
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = { userId };

    if (filter.testType) {
      where.test = { testType: filter.testType };
    }
    if (filter.examType) {
      where.test = { ...where.test, examType: filter.examType };
    }

    const total = await prisma.testAttempt.count({ where });
    const data = await prisma.testAttempt.findMany({
      where,
      include: {
        test: {
          include: {
            subject: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get attempt results with detailed analysis
   */
  async getAttemptResults(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            subject: true,
            testQuestions: {
              include: {
                question: {
                  include: {
                    chapter: {
                      select: { id: true, name: true },
                    },
                    subject: {
                      select: { id: true, name: true },
                    },
                    options: true,
                  },
                },
              },
              orderBy: { questionNumber: 'asc' },
            },
          },
        },
        answerResponses: true,
      },
    });

    return attempt;
  }

  /**
   * Update test statistics (average score, highest score)
   */
  async updateTestStats(testId: string) {
    const stats = await prisma.testAttempt.aggregate({
      where: {
        testId,
        status: 'submitted',
      },
      _avg: {
        percentage: true,
      },
      _max: {
        percentage: true,
      },
    });

    return prisma.test.update({
      where: { id: testId },
      data: {
        averageScore: stats._avg.percentage,
        highestScore: stats._max.percentage,
      },
    });
  }
}

export const testRepository = new TestRepository();
export default testRepository;
