import prisma from '../lib/prisma';

export interface CreateMistakeData {
  userId: string;
  questionId: string;
  sourceType?: string;
  sourceId?: string;
  userAnswer: string[];
  userAnswerText?: string;
  correctAnswer: string[];
  userNotes?: string;
  mistakeReason?: string;
  conceptGap?: string;
  mistakeType?: string;
  severity?: string;
}

export interface UpdateMistakeData {
  userNotes?: string;
  mistakeReason?: string;
  conceptGap?: string;
  mistakeType?: string;
  severity?: string;
  revisionCount?: number;
  lastRevisedAt?: Date;
  nextRevisionDate?: Date;
  isMastered?: boolean;
  easeFactor?: number;
  intervalDays?: number;
  repetition?: number;
}

export interface MistakeFilter {
  userId: string;
  questionId?: string;
  chapterId?: string;
  subjectId?: string;
  mistakeType?: string;
  severity?: string;
  isMastered?: boolean;
  sourceType?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class MistakeRepository {
  /**
   * Add a question to mistake notebook
   */
  async add(data: CreateMistakeData) {
    return prisma.mistake.upsert({
      where: {
        userId_questionId: {
          userId: data.userId,
          questionId: data.questionId,
        },
      },
      update: {
        userAnswer: data.userAnswer,
        userAnswerText: data.userAnswerText,
        correctAnswer: data.correctAnswer,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        userNotes: data.userNotes,
        mistakeReason: data.mistakeReason,
        conceptGap: data.conceptGap,
        mistakeType: data.mistakeType,
        severity: data.severity,
        isMastered: false,
        revisionCount: 0,
      },
      create: {
        userId: data.userId,
        questionId: data.questionId,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        userAnswer: data.userAnswer,
        userAnswerText: data.userAnswerText,
        correctAnswer: data.correctAnswer,
        userNotes: data.userNotes,
        mistakeReason: data.mistakeReason,
        conceptGap: data.conceptGap,
        mistakeType: data.mistakeType,
        severity: data.severity,
      },
    });
  }

  /**
   * Remove from mistake notebook
   */
  async remove(userId: string, questionId: string) {
    return prisma.mistake.delete({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });
  }

  /**
   * Get all mistakes for a user with filtering and pagination
   */
  async getUserMistakes(
    filter: MistakeFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const where: any = { userId: filter.userId };

    if (filter.questionId) where.questionId = filter.questionId;
    if (filter.mistakeType) where.mistakeType = filter.mistakeType;
    if (filter.severity) where.severity = filter.severity;
    if (filter.isMastered !== undefined) where.isMastered = filter.isMastered;
    if (filter.sourceType) where.sourceType = filter.sourceType;
    if (filter.chapterId) where.question = { chapterId: filter.chapterId };
    if (filter.subjectId) where.question = { subjectId: filter.subjectId };

    const total = await prisma.mistake.count({ where });
    const data = await prisma.mistake.findMany({
      where,
      include: {
        question: {
          include: {
            subject: {
              select: { id: true, name: true, slug: true },
            },
            chapter: {
              select: { id: true, name: true, slug: true },
            },
            options: {
              orderBy: { displayOrder: 'asc' },
            },
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
   * Get mistakes by chapter
   */
  async getMistakesByChapter(userId: string, chapterId: string) {
    return prisma.mistake.findMany({
      where: {
        userId,
        question: {
          chapterId,
        },
      },
      include: {
        question: {
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get mistakes by subject
   */
  async getMistakesBySubject(userId: string, subjectId: string) {
    return prisma.mistake.findMany({
      where: {
        userId,
        question: {
          subjectId,
        },
      },
      include: {
        question: {
          include: {
            chapter: {
              select: { id: true, name: true },
            },
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific mistake
   */
  async getMistake(userId: string, questionId: string) {
    return prisma.mistake.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      include: {
        question: {
          include: {
            subject: true,
            chapter: true,
            options: true,
          },
        },
      },
    });
  }

  /**
   * Update revision status using spaced repetition
   */
  async updateRevisionStatus(
    userId: string,
    questionId: string,
    quality: number // 0-5 rating (0 = complete failure, 5 = perfect)
  ) {
    const mistake = await prisma.mistake.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (!mistake) {
      throw new Error('Mistake not found');
    }

    // SM-2 algorithm for spaced repetition
    let { easeFactor, intervalDays, repetition } = mistake;
    const easeFactorNum = Number(easeFactor);
    let intervalDaysNum = Number(intervalDays);

    if (quality >= 3) {
      // Correct response
      if (repetition === 0) {
        intervalDaysNum = 1;
      } else if (repetition === 1) {
        intervalDaysNum = 6;
      } else {
        intervalDaysNum = Math.round(intervalDaysNum * easeFactorNum);
      }
      repetition += 1;
    } else {
      // Incorrect response
      repetition = 0;
      intervalDays = 1;
    }

    // Update ease factor
    const newEaseFactor = Math.max(
      1.3,
      easeFactorNum + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );

    // Calculate next revision date
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + intervalDaysNum);

    // Check if mastered (correctly revised 3+ times with interval > 21 days)
    const isMastered = repetition >= 3 && intervalDaysNum >= 21;

    return prisma.mistake.update({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      data: {
        revisionCount: { increment: 1 },
        lastRevisedAt: new Date(),
        nextRevisionDate,
        isMastered,
        easeFactor: newEaseFactor,
        intervalDays: intervalDaysNum,
        repetition,
      },
    });
  }

  /**
   * Get revision queue (mistakes due for revision)
   */
  async getRevisionQueue(userId: string, limit?: number) {
    const now = new Date();

    return prisma.mistake.findMany({
      where: {
        userId,
        isMastered: false,
        OR: [
          { nextRevisionDate: { lte: now } },
          { nextRevisionDate: null },
        ],
      },
      include: {
        question: {
          include: {
            subject: {
              select: { id: true, name: true, colorCode: true },
            },
            chapter: {
              select: { id: true, name: true },
            },
            options: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
      orderBy: [
        { nextRevisionDate: 'asc' },
        { createdAt: 'asc' },
      ],
      take: limit,
    });
  }

  /**
   * Get mistake statistics for a user
   */
  async getMistakeStats(userId: string) {
    const [total, mastered, byType, bySeverity, bySubject] = await Promise.all([
      prisma.mistake.count({ where: { userId } }),
      prisma.mistake.count({ where: { userId, isMastered: true } }),
      prisma.mistake.groupBy({
        by: ['mistakeType'],
        where: { userId },
        _count: true,
      }),
      prisma.mistake.groupBy({
        by: ['severity'],
        where: { userId },
        _count: true,
      }),
      prisma.mistake.findMany({
        where: { userId },
        include: {
          question: {
            select: { subjectId: true },
          },
        },
      }),
    ]);

    // Group by subject
    const subjectCounts: Record<string, number> = {};
    for (const m of bySubject) {
      const subjectId = m.question.subjectId;
      subjectCounts[subjectId] = (subjectCounts[subjectId] || 0) + 1;
    }

    return {
      total,
      mastered,
      pending: total - mastered,
      byType: byType.reduce((acc, item) => {
        if (item.mistakeType) {
          acc[item.mistakeType] = item._count;
        }
        return acc;
      }, {} as Record<string, number>),
      bySeverity: bySeverity.reduce((acc, item) => {
        if (item.severity) {
          acc[item.severity] = item._count;
        }
        return acc;
      }, {} as Record<string, number>),
      bySubject: subjectCounts,
    };
  }

  /**
   * Update mistake notes
   */
  async updateNotes(userId: string, questionId: string, notes: string) {
    return prisma.mistake.update({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      data: {
        userNotes: notes,
      },
    });
  }

  /**
   * Check if question is in mistake notebook
   */
  async isInMistakeNotebook(userId: string, questionId: string): Promise<boolean> {
    const count = await prisma.mistake.count({
      where: {
        userId,
        questionId,
      },
    });
    return count > 0;
  }
}

export const mistakeRepository = new MistakeRepository();
export default mistakeRepository;
