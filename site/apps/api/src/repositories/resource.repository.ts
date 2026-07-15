import prisma from '../lib/prisma';

export interface CreateResourceData {
  title: string;
  slug: string;
  description?: string;
  resourceType: string;
  category: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  subjectId?: string;
  fileSize?: number;
  durationMinutes?: number;
  author?: string;
  source?: string;
  isPublic?: boolean;
  isPremium?: boolean;
}

export interface UpdateResourceData {
  title?: string;
  slug?: string;
  description?: string;
  resourceType?: string;
  category?: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  subjectId?: string;
  fileSize?: number;
  durationMinutes?: number;
  author?: string;
  source?: string;
  isPublic?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
}

export interface ResourceFilter {
  resourceType?: string;
  category?: string;
  subjectId?: string;
  chapterId?: string;
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

class ResourceRepository {
  /**
   * Create a resource
   */
  async create(data: CreateResourceData) {
    return prisma.resource.create({
      data,
    });
  }

  /**
   * Create a resource linked to a chapter
   */
  async createWithChapter(data: CreateResourceData & { chapterId: string; displayOrder?: number }) {
    return prisma.$transaction(async (tx: any) => {
      const resource = await tx.resource.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          resourceType: data.resourceType,
          category: data.category,
          fileUrl: data.fileUrl,
          externalUrl: data.externalUrl,
          thumbnailUrl: data.thumbnailUrl,
          content: data.content,
          subjectId: data.subjectId,
          fileSize: data.fileSize,
          durationMinutes: data.durationMinutes,
          author: data.author,
          source: data.source,
          isPublic: data.isPublic ?? true,
          isPremium: data.isPremium ?? false,
        },
      });

      // Link to chapter
      await tx.chapterResource.create({
        data: {
          chapterId: data.chapterId,
          resourceId: resource.id,
          displayOrder: data.displayOrder ?? 0,
        },
      });

      return resource;
    });
  }

  /**
   * Find all resources with filtering and pagination
   */
  async findAll(
    filter: ResourceFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (filter.resourceType) where.resourceType = filter.resourceType;
    if (filter.category) where.category = filter.category;
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
    if (filter.chapterId) {
      where.chapterResources = {
        some: { chapterId: filter.chapterId },
      };
    }

    const total = await prisma.resource.count({ where });
    const data = await prisma.resource.findMany({
      where,
      include: {
        chapterResources: {
          include: {
            chapter: {
              select: { id: true, name: true, slug: true },
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
   * Find resource by ID
   */
  async findById(id: string) {
    return prisma.resource.findUnique({
      where: { id },
      include: {
        chapterResources: {
          include: {
            chapter: {
              include: {
                subject: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find resource by slug
   */
  async findBySlug(slug: string) {
    return prisma.resource.findUnique({
      where: { slug },
    });
  }

  /**
   * Find resources by chapter
   */
  async findByChapter(chapterId: string) {
    const chapterResources = await prisma.chapterResource.findMany({
      where: { chapterId },
      include: {
        resource: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    return chapterResources.map((cr) => cr.resource);
  }

  /**
   * Find resources by subject
   */
  async findBySubject(subjectId: string) {
    return prisma.resource.findMany({
      where: {
        subjectId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find resources by type
   */
  async findByType(resourceType: string, limit?: number) {
    return prisma.resource.findMany({
      where: {
        resourceType,
        isActive: true,
        isPublic: true,
      },
      orderBy: { downloadCount: 'desc' },
      take: limit,
    });
  }

  /**
   * Update resource
   */
  async update(id: string, data: UpdateResourceData) {
    return prisma.resource.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete resource (soft delete)
   */
  async delete(id: string) {
    return prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete resource
   */
  async hardDelete(id: string) {
    return prisma.$transaction(async (tx: any) => {
      // Delete chapter links first
      await tx.chapterResource.deleteMany({
        where: { resourceId: id },
      });

      // Delete resource
      return tx.resource.delete({
        where: { id },
      });
    });
  }

  /**
   * Check if resource exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.resource.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.resource.count({
      where: {
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Link resource to chapter
   */
  async linkToChapter(resourceId: string, chapterId: string, displayOrder?: number) {
    return prisma.chapterResource.create({
      data: {
        resourceId,
        chapterId,
        displayOrder: displayOrder ?? 0,
      },
    });
  }

  /**
   * Unlink resource from chapter
   */
  async unlinkFromChapter(resourceId: string, chapterId: string) {
    return prisma.chapterResource.delete({
      where: {
        chapterId_resourceId: {
          chapterId,
          resourceId,
        },
      },
    });
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string) {
    return prisma.resource.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
    });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string) {
    return prisma.resource.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  /**
   * Get popular resources
   */
  async getPopular(limit: number = 10) {
    return prisma.resource.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      orderBy: { downloadCount: 'desc' },
      take: limit,
    });
  }

  /**
   * Get recent resources
   */
  async getRecent(limit: number = 10) {
    return prisma.resource.findMany({
      where: {
        isActive: true,
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get resource statistics
   */
  async getStats() {
    const [total, byType, byCategory] = await Promise.all([
      prisma.resource.count({ where: { isActive: true } }),
      prisma.resource.groupBy({
        by: ['resourceType'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.resource.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.map((item) => ({
        type: item.resourceType,
        count: item._count,
      })),
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
    };
  }
}

export const resourceRepository = new ResourceRepository();
export default resourceRepository;