import { Subject } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CreateSubjectData {
  name: string;
  slug: string;
  iconUrl?: string;
  colorCode?: string;
  description?: string;
  displayOrder?: number;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
}

export interface UpdateSubjectData {
  name?: string;
  slug?: string;
  iconUrl?: string;
  colorCode?: string;
  description?: string;
  displayOrder?: number;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  isActive?: boolean;
}

export interface SubjectFilter {
  isActive?: boolean;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class SubjectRepository {
  /**
   * Create a new subject
   */
  async create(data: CreateSubjectData): Promise<Subject> {
    return prisma.subject.create({
      data,
    });
  }

  /**
   * Find all subjects with filtering and pagination
   */
  async findAll(
    filter: SubjectFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Subject>> {
    const where: any = {};

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter.forNeet !== undefined) {
      where.forNeet = filter.forNeet;
    }
    if (filter.forJeeMain !== undefined) {
      where.forJeeMain = filter.forJeeMain;
    }
    if (filter.forJeeAdvanced !== undefined) {
      where.forJeeAdvanced = filter.forJeeAdvanced;
    }
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.subject.count({ where });
    const data = await prisma.subject.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
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
   * Find subject by ID
   */
  async findById(id: string): Promise<Subject | null> {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        chapters: {
          where: { isActive: true },
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });
  }

  /**
   * Find subject by slug
   */
  async findBySlug(slug: string): Promise<Subject | null> {
    return prisma.subject.findUnique({
      where: { slug },
    });
  }

  /**
   * Find subjects by exam type
   */
  async findByExam(examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED'): Promise<Subject[]> {
    const where: any = { isActive: true };

    switch (examType) {
      case 'NEET':
        where.forNeet = true;
        break;
      case 'JEE_MAIN':
        where.forJeeMain = true;
        break;
      case 'JEE_ADVANCED':
        where.forJeeAdvanced = true;
        break;
    }

    return prisma.subject.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Update subject
   */
  async update(id: string, data: UpdateSubjectData): Promise<Subject> {
    return prisma.subject.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete subject (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<Subject> {
    return prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete subject
   */
  async hardDelete(id: string): Promise<Subject> {
    return prisma.subject.delete({
      where: { id },
    });
  }

  /**
   * Check if subject exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.subject.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.subject.count({
      where: {
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Get subject with chapter count
   */
  async getWithChapterCount(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            chapters: { where: { isActive: true } },
            questions: { where: { isActive: true } },
          },
        },
      },
    });

    return subject;
  }
}

export const subjectRepository = new SubjectRepository();
export default subjectRepository;
