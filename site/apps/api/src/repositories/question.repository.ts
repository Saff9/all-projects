import prisma from '../lib/prisma';

export interface CreateQuestionData {
  topicId?: string;
  chapterId: string;
  subjectId: string;
  questionText: string;
  questionType?: string;
  questionImageUrl?: string;
  difficultyLevel: string;
  bloomTaxonomy?: string;
  sourceType?: string;
  sourceExam?: string;
  sourceYear?: number;
  sourceSession?: string;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  aiExplanation?: string;
  aiGenerated?: boolean;
}

export interface CreateQuestionWithOptionsData extends CreateQuestionData {
  options: CreateQuestionOptionData[];
}

export interface CreateQuestionOptionData {
  optionLabel: string;
  optionText?: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
  displayOrder?: number;
}

export interface UpdateQuestionData {
  topicId?: string;
  questionText?: string;
  questionType?: string;
  questionImageUrl?: string;
  difficultyLevel?: string;
  bloomTaxonomy?: string;
  sourceType?: string;
  sourceExam?: string;
  sourceYear?: number;
  sourceSession?: string;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  aiExplanation?: string;
  isActive?: boolean;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface QuestionFilter {
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficultyLevel?: string;
  questionType?: string;
  sourceType?: string;
  sourceExam?: string;
  sourceYear?: number;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class QuestionRepository {
  /**
   * Create a question with options in a transaction
   */
  async createWithOptions(data: CreateQuestionWithOptionsData) {
    return prisma.$transaction(async (tx: any) => {
      // Create the question
      const question = await tx.question.create({
        data: {
          topicId: data.topicId,
          chapterId: data.chapterId,
          subjectId: data.subjectId,
          questionText: data.questionText,
          questionType: data.questionType || 'mcq',
          questionImageUrl: data.questionImageUrl,
          difficultyLevel: data.difficultyLevel,
          bloomTaxonomy: data.bloomTaxonomy,
          sourceType: data.sourceType,
          sourceExam: data.sourceExam,
          sourceYear: data.sourceYear,
          sourceSession: data.sourceSession,
          forNeet: data.forNeet ?? true,
          forJeeMain: data.forJeeMain ?? true,
          forJeeAdvanced: data.forJeeAdvanced ?? false,
          solutionText: data.solutionText,
          solutionImageUrl: data.solutionImageUrl,
          hint: data.hint,
          aiExplanation: data.aiExplanation,
          aiGenerated: data.aiGenerated ?? false,
        },
      });

      // Create options
      if (data.options && data.options.length > 0) {
        await tx.questionOption.createMany({
          data: data.options.map((opt) => ({
            questionId: question.id,
            optionLabel: opt.optionLabel,
            optionText: opt.optionText,
            optionImageUrl: opt.optionImageUrl,
            isCorrect: opt.isCorrect,
            explanation: opt.explanation,
            displayOrder: opt.displayOrder ?? 0,
          })),
        });
      }

      // Update chapter stats
      await tx.chapter.update({
        where: { id: data.chapterId },
        data: {
          totalQuestions: { increment: 1 },
        },
      });

      return question;
    });
  }

  /**
   * Create a single question (without options)
   */
  async create(data: CreateQuestionData) {
    return prisma.question.create({
      data,
    });
  }

  /**
   * Build where clause from filter
   */
  private buildWhereClause(filter: QuestionFilter): any {
    const where: any = {};

    if (filter.subjectId) where.subjectId = filter.subjectId;
    if (filter.chapterId) where.chapterId = filter.chapterId;
    if (filter.topicId) where.topicId = filter.topicId;
    if (filter.difficultyLevel) where.difficultyLevel = filter.difficultyLevel;
    if (filter.questionType) where.questionType = filter.questionType;
    if (filter.sourceType) where.sourceType = filter.sourceType;
    if (filter.sourceExam) where.sourceExam = filter.sourceExam;
    if (filter.sourceYear) where.sourceYear = filter.sourceYear;
    if (filter.forNeet !== undefined) where.forNeet = filter.forNeet;
    if (filter.forJeeMain !== undefined) where.forJeeMain = filter.forJeeMain;
    if (filter.forJeeAdvanced !== undefined) where.forJeeAdvanced = filter.forJeeAdvanced;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.isVerified !== undefined) where.isVerified = filter.isVerified;
    if (filter.search) {
      where.OR = [
        { questionText: { contains: filter.search, mode: 'insensitive' } },
        { solutionText: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Find all questions with filtering and pagination
   */
  async findAll(
    filter: QuestionFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const where = this.buildWhereClause(filter);

    const total = await prisma.question.count({ where });
    const data = await prisma.question.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, slug: true },
        },
        chapter: {
          select: { id: true, name: true, slug: true },
        },
        topic: {
          select: { id: true, name: true, slug: true },
        },
        options: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            mistakes: true,
            bookmarks: true,
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
   * Find question by ID with options
   */
  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        chapter: true,
        topic: true,
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Find questions by chapter
   */
  async findByChapter(chapterId: string, limit?: number) {
    return prisma.question.findMany({
      where: {
        chapterId,
        isActive: true,
      },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Find questions by topic
   */
  async findByTopic(topicId: string, limit?: number) {
    return prisma.question.findMany({
      where: {
        topicId,
        isActive: true,
      },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get random questions for tests
   */
  async getRandomQuestions(
    filter: QuestionFilter,
    count: number,
    excludeIds: string[] = []
  ) {
    const where: any = this.buildWhereClause({
      ...filter,
      isActive: true,
    });
    
    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }

    // Get all matching question IDs
    const allQuestions = await prisma.question.findMany({
      where,
      select: { id: true },
    });

    if (allQuestions.length === 0) {
      return [];
    }

    // Shuffle and pick random questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedIds = shuffled.slice(0, count).map((q) => q.id);

    return prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Update question
   */
  async update(id: string, data: UpdateQuestionData) {
    return prisma.question.update({
      where: { id },
      data,
    });
  }

  /**
   * Update question options
   */
  async updateOptions(questionId: string, options: CreateQuestionOptionData[]) {
    return prisma.$transaction(async (tx: any) => {
      // Delete existing options
      await tx.questionOption.deleteMany({
        where: { questionId },
      });

      // Create new options
      await tx.questionOption.createMany({
        data: options.map((opt) => ({
          questionId,
          optionLabel: opt.optionLabel,
          optionText: opt.optionText,
          optionImageUrl: opt.optionImageUrl,
          isCorrect: opt.isCorrect,
          explanation: opt.explanation,
          displayOrder: opt.displayOrder ?? 0,
        })),
      });

      return tx.question.findUnique({
        where: { id: questionId },
        include: { options: true },
      });
    });
  }

  /**
   * Delete question (soft delete)
   */
  async delete(id: string) {
    return prisma.$transaction(async (tx: any) => {
      const question = await tx.question.findUnique({
        where: { id },
        select: { chapterId: true },
      });

      const deleted = await tx.question.update({
        where: { id },
        data: { isActive: false },
      });

      // Update chapter stats
      if (question) {
        await tx.chapter.update({
          where: { id: question.chapterId },
          data: {
            totalQuestions: { decrement: 1 },
          },
        });
      }

      return deleted;
    });
  }

  /**
   * Hard delete question
   */
  async hardDelete(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }

  /**
   * Check if question exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.question.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Update question statistics
   */
  async updateStats(id: string, isCorrect: boolean, timeSeconds: number) {
    const question = await prisma.question.findUnique({
      where: { id },
      select: { timesAttempted: true, timesCorrect: true, averageTimeSeconds: true },
    });

    if (!question) return null;

    const newAttempted = question.timesAttempted + 1;
    const newCorrect = isCorrect ? question.timesCorrect + 1 : question.timesCorrect;
    const newAvgTime = Math.round(
      ((question.averageTimeSeconds || 0) * question.timesAttempted + timeSeconds) / newAttempted
    );

    return prisma.question.update({
      where: { id },
      data: {
        timesAttempted: newAttempted,
        timesCorrect: newCorrect,
        averageTimeSeconds: newAvgTime,
      },
    });
  }

  /**
   * Get question counts by difficulty
   */
  async getCountsByDifficulty(chapterId?: string, subjectId?: string) {
    const baseWhere: any = { isActive: true };
    if (chapterId) baseWhere.chapterId = chapterId;
    if (subjectId) baseWhere.subjectId = subjectId;

    const [easy, medium, hard] = await Promise.all([
      prisma.question.count({ where: { ...baseWhere, difficultyLevel: 'easy' } }),
      prisma.question.count({ where: { ...baseWhere, difficultyLevel: 'medium' } }),
      prisma.question.count({ where: { ...baseWhere, difficultyLevel: 'hard' } }),
    ]);

    return { easy, medium, hard, total: easy + medium + hard };
  }
}

export const questionRepository = new QuestionRepository();
export default questionRepository;
