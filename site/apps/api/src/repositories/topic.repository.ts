import prisma from '../lib/prisma';

export interface CreateTopicData {
  chapterId: string;
  name: string;
  slug: string;
  description?: string;
  topicNumber?: number;
  keyConcepts?: string[];
  importantFormulas?: string[];
  estimatedMinutes?: number;
  difficultyLevel?: string;
  displayOrder?: number;
}

export interface UpdateTopicData {
  name?: string;
  slug?: string;
  description?: string;
  topicNumber?: number;
  keyConcepts?: string[];
  importantFormulas?: string[];
  estimatedMinutes?: number;
  difficultyLevel?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface TopicFilter {
  chapterId?: string;
  isActive?: boolean;
  difficultyLevel?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class TopicRepository {
  /**
   * Create a new topic
   */
  async create(data: CreateTopicData) {
    return prisma.topic.create({
      data,
    });
  }

  /**
   * Find all topics with filtering and pagination
   */
  async findAll(
    filter: TopicFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (filter.chapterId) {
      where.chapterId = filter.chapterId;
    }
    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter.difficultyLevel) {
      where.difficultyLevel = filter.difficultyLevel;
    }
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.topic.count({ where });
    const data = await prisma.topic.findMany({
      where,
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
            slug: true,
            subject: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            questions: { where: { isActive: true } },
          },
        },
      },
      orderBy: [{ chapterId: 'asc' }, { topicNumber: 'asc' }],
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
   * Find topic by ID
   */
  async findById(id: string) {
    return prisma.topic.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  /**
   * Find topic by slug within a chapter
   */
  async findBySlug(chapterId: string, slug: string) {
    return prisma.topic.findFirst({
      where: {
        chapterId,
        slug,
      },
    });
  }

  /**
   * Find all topics for a chapter
   */
  async findByChapter(chapterId: string) {
    return prisma.topic.findMany({
      where: {
        chapterId,
        isActive: true,
      },
      orderBy: { topicNumber: 'asc' },
    });
  }

  /**
   * Update topic
   */
  async update(id: string, data: UpdateTopicData) {
    return prisma.topic.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete topic (soft delete)
   */
  async delete(id: string) {
    return prisma.topic.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete topic
   */
  async hardDelete(id: string) {
    return prisma.topic.delete({
      where: { id },
    });
  }

  /**
   * Check if topic exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.topic.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if slug exists within chapter
   */
  async slugExists(chapterId: string, slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.topic.count({
      where: {
        chapterId,
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Get topic with questions
   */
  async getWithQuestions(id: string) {
    return prisma.topic.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
        questions: {
          where: { isActive: true },
          include: {
            options: true,
          },
        },
      },
    });
  }
}

export const topicRepository = new TopicRepository();
export default topicRepository;
