import resourceRepository, {
  CreateResourceData,
  UpdateResourceData,
  ResourceFilter,
  PaginatedResult,
} from '../repositories/resource.repository';

class ResourceService {
  /**
   * Create a resource
   */
  async create(data: CreateResourceData): Promise<any> {
    // Check if slug already exists
    const slugExists = await resourceRepository.slugExists(data.slug);
    if (slugExists) {
      throw new Error('Resource with this slug already exists');
    }

    const resource = await resourceRepository.create(data);
    return resource;
  }

  /**
   * Create a resource linked to a chapter
   */
  async createWithChapter(
    data: CreateResourceData & { chapterId: string; displayOrder?: number }
  ): Promise<any> {
    // Check if slug already exists
    const slugExists = await resourceRepository.slugExists(data.slug);
    if (slugExists) {
      throw new Error('Resource with this slug already exists');
    }

    const resource = await resourceRepository.createWithChapter(data);
    return resource;
  }

  /**
   * Get all resources with filtering and pagination
   */
  async findAll(
    filter: ResourceFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    // Default to active and public resources only
    if (filter.isActive === undefined) {
      filter.isActive = true;
    }
    if (filter.isPublic === undefined) {
      filter.isPublic = true;
    }

    return resourceRepository.findAll(filter, page, limit);
  }

  /**
   * Get resource by ID
   */
  async findById(id: string): Promise<any | null> {
    if (!id) {
      throw new Error('Resource ID is required');
    }

    // Increment view count
    await resourceRepository.incrementViewCount(id);

    return resourceRepository.findById(id);
  }

  /**
   * Get resource by slug
   */
  async findBySlug(slug: string): Promise<any | null> {
    if (!slug) {
      throw new Error('Resource slug is required');
    }

    return resourceRepository.findBySlug(slug);
  }

  /**
   * Get resources by chapter
   */
  async findByChapter(chapterId: string): Promise<any[]> {
    if (!chapterId) {
      throw new Error('Chapter ID is required');
    }

    return resourceRepository.findByChapter(chapterId);
  }

  /**
   * Get resources by subject
   */
  async findBySubject(subjectId: string): Promise<any[]> {
    if (!subjectId) {
      throw new Error('Subject ID is required');
    }

    return resourceRepository.findBySubject(subjectId);
  }

  /**
   * Get resources by type
   */
  async findByType(resourceType: string, limit?: number): Promise<any[]> {
    const validTypes = ['pdf', 'video', 'link', 'formula_sheet'];
    if (!validTypes.includes(resourceType)) {
      throw new Error(`Invalid resource type. Must be one of: ${validTypes.join(', ')}`);
    }

    return resourceRepository.findByType(resourceType, limit);
  }

  /**
   * Update resource
   */
  async update(id: string, data: UpdateResourceData): Promise<any> {
    // Check if resource exists
    const exists = await resourceRepository.exists(id);
    if (!exists) {
      throw new Error('Resource not found');
    }

    // Check if new slug already exists (if slug is being updated)
    if (data.slug) {
      const slugExists = await resourceRepository.slugExists(data.slug, id);
      if (slugExists) {
        throw new Error('Resource with this slug already exists');
      }
    }

    const resource = await resourceRepository.update(id, data);
    return resource;
  }

  /**
   * Delete resource (soft delete)
   */
  async delete(id: string): Promise<any> {
    // Check if resource exists
    const exists = await resourceRepository.exists(id);
    if (!exists) {
      throw new Error('Resource not found');
    }

    const resource = await resourceRepository.delete(id);
    return resource;
  }

  /**
   * Link resource to chapter
   */
  async linkToChapter(resourceId: string, chapterId: string, displayOrder?: number): Promise<any> {
    // Check if resource exists
    const resourceExists = await resourceRepository.exists(resourceId);
    if (!resourceExists) {
      throw new Error('Resource not found');
    }

    return resourceRepository.linkToChapter(resourceId, chapterId, displayOrder);
  }

  /**
   * Unlink resource from chapter
   */
  async unlinkFromChapter(resourceId: string, chapterId: string): Promise<any> {
    return resourceRepository.unlinkFromChapter(resourceId, chapterId);
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<any> {
    return resourceRepository.incrementDownloadCount(id);
  }

  /**
   * Get popular resources
   */
  async getPopular(limit: number = 10): Promise<any[]> {
    return resourceRepository.getPopular(limit);
  }

  /**
   * Get recent resources
   */
  async getRecent(limit: number = 10): Promise<any[]> {
    return resourceRepository.getRecent(limit);
  }

  /**
   * Get resource statistics
   */
  async getStats(): Promise<any> {
    return resourceRepository.getStats();
  }

  /**
   * Search resources
   */
  async search(query: string, limit: number = 20): Promise<any[]> {
    const result = await resourceRepository.findAll(
      { search: query, isActive: true, isPublic: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Get NCERT resources
   */
  async getNcertResources(subjectId?: string, limit: number = 20): Promise<any[]> {
    const filter: ResourceFilter = {
      category: 'ncert',
      isActive: true,
      isPublic: true,
    };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const result = await resourceRepository.findAll(filter, 1, limit);
    return result.data;
  }

  /**
   * Get formula sheets
   */
  async getFormulaSheets(subjectId?: string, limit: number = 20): Promise<any[]> {
    const filter: ResourceFilter = {
      resourceType: 'formula_sheet',
      isActive: true,
      isPublic: true,
    };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const result = await resourceRepository.findAll(filter, 1, limit);
    return result.data;
  }

  /**
   * Get video resources
   */
  async getVideoResources(subjectId?: string, limit: number = 20): Promise<any[]> {
    const filter: ResourceFilter = {
      resourceType: 'video',
      isActive: true,
      isPublic: true,
    };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const result = await resourceRepository.findAll(filter, 1, limit);
    return result.data;
  }

  /**
   * Download resource (track download)
   */
  async download(id: string): Promise<any> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Increment download count
    await resourceRepository.incrementDownloadCount(id);

    // Return download URL
    return {
      fileUrl: resource.fileUrl,
      externalUrl: resource.externalUrl,
      title: resource.title,
    };
  }
}

export const resourceService = new ResourceService();
export default resourceService;