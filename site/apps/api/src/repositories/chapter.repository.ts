import type { Chapter, Subject, Topic } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CreateChapterData {
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  classLevel?: number[];
  unitName?: string;
  unitNumber?: number;
  chapterNumber?: number;
  neetWeightage?: number;
  jeeMainWeightage?: number;
  jeeAdvancedWeightage?: number;
  totalTopics?: number;
  totalQuestions?: number;
  estimatedHours?: number;
  difficultyLevel?: string;
  displayOrder?: number;
}

export interface UpdateChapterData {
  name?: string;
  slug?: string;
  description?: string;
  classLevel?: number[];
  unitName?: string;
  unitNumber?: number;
  chapterNumber?: number;
  neetWeightage?: number;
  jeeMainWeightage?: number;
  jeeAdvancedWeightage?: number;
  totalTopics?: number;
  totalQuestions?: number;
  estimatedHours?: number;
  difficultyLevel?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ChapterFilter {
  subjectId?: string;
  isActive?: boolean;
  difficultyLevel?: string;
  classLevel?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ChapterWithRelations = Chapter & {
  subject: Pick<Subject, 'id' | 'name' | 'slug'>;
  topics?: Topic[];
  _count?: {
    questions: number;
    topics?: number;
  };
};

class ChapterRepository {
  /**
   * Create a new chapter
   */
  async create(data: CreateChapterData): Promise<Chapter> {
    return prisma.chapter.create({
      data: {
        ...data,
        neetWeightage: data.neetWeightage ? data.neetWeightage : null,
        jeeMainWeightage: data.jeeMainWeightage ? data.jeeMainWeightage : null,
        jeeAdvancedWeightage: data.jeeAdvancedWeightage ? data.jeeAdvancedWeightage : null,
        estimatedHours: data.estimatedHours ? data.estimatedHours : null,
      },
    });
  }

  /**
   * Find all chapters with filtering and pagination
   */
  async findAll(
    filter: ChapterFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<ChapterWithRelations>> {
    const where: any = {};

    if (filter.subjectId) {
      where.subjectId = filter.subjectId;
    }
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter.difficultyLevel) {
      where.difficultyLevel = filter.difficultyLevel;
    }
    if (filter.classLevel) {
      where.classLevel = { has: filter.classLevel };
    }
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.chapter.count({ where });
    const data = await prisma.chapter.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            questions: true,
            topics: true,
          },
        },
      },
      orderBy: [{ subjectId: 'asc' }, { chapterNumber: 'asc' }],
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
   * Find chapter by ID
   */
  async findById(id: string): Promise<ChapterWithRelations | null> {
    return prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: true,
        topics: {
          where: { isActive: true },
          orderBy: { topicNumber: 'asc' },
        },
        _count: {
          select: {
            questions: { where: { isActive: true } },
            topics: { where: { isActive: true } },
          },
        },
      },
    });
  }

  /**
   * Find chapter by slug within a subject
   */
  async findBySlug(subjectId: string, slug: string): Promise<Chapter | null> {
    return prisma.chapter.findFirst({
      where: {
        subjectId,
        slug,
      },
    });
  }

  /**
   * Find all chapters for a subject
   */
  async findBySubject(subjectId: string): Promise<Chapter[]> {
    return prisma.chapter.findMany({
      where: {
        subjectId,
        isActive: true,
      },
      orderBy: { chapterNumber: 'asc' },
    });
  }

  /**
   * Find chapters by exam type
   */
  async findByExam(examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED', subjectId?: string): Promise<Chapter[]> {
    const where: any = { isActive: true };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    // Filter by weightage for the specific exam
    if (examType === 'NEET') {
      where.neetWeightage = { not: null };
    } else if (examType === 'JEE_MAIN') {
      where.jeeMainWeightage = { not: null };
    } else if (examType === 'JEE_ADVANCED') {
      where.jeeAdvancedWeightage = { not: null };
    }

    return prisma.chapter.findMany({
      where,
      orderBy: { chapterNumber: 'asc' },
    });
  }

  /**
   * Update chapter
   */
  async update(id: string, data: UpdateChapterData): Promise<Chapter> {
    return prisma.chapter.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete chapter (soft delete)
   */
  async delete(id: string): Promise<Chapter> {
    return prisma.chapter.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete chapter
   */
  async hardDelete(id: string): Promise<Chapter> {
    return prisma.chapter.delete({
      where: { id },
    });
  }

  /**
   * Check if chapter exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.chapter.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if slug exists within subject
   */
  async slugExists(subjectId: string, slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.chapter.count({
      where: {
        subjectId,
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Get chapter with topics and resources
   */
  async getWithTopicsAndResources(id: string) {
    return prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: true,
        topics: {
          where: { isActive: true },
          orderBy: { topicNumber: 'asc' },
        },
        resources: {
          include: {
            resource: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Get chapter progress for a user
   */
  async getUserProgress(chapterId: string, userId: string) {
    return prisma.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });
  }

  /**
   * Update chapter statistics
   */
  async updateStats(id: string): Promise<void> {
    const [topicCount, questionCount] = await Promise.all([
      prisma.topic.count({ where: { chapterId: id, isActive: true } }),
      prisma.question.count({ where: { chapterId: id, isActive: true } }),
    ]);

    await prisma.chapter.update({
      where: { id },
      data: {
        totalTopics: topicCount,
        totalQuestions: questionCount,
      },
    });
  }
}

export const chapterRepository = new ChapterRepository();
export default chapterRepository;
