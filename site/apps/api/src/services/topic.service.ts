import topicRepository, {
  CreateTopicData,
  UpdateTopicData,
  TopicFilter,
  PaginatedResult,
} from '../repositories/topic.repository';

class TopicService {
  /**
   * Create a new topic
   */
  async create(data: CreateTopicData): Promise<any> {
    // Check if slug already exists within chapter
    const slugExists = await topicRepository.slugExists(data.chapterId, data.slug);
    if (slugExists) {
      throw new Error('Topic with this slug already exists in this chapter');
    }

    const topic = await topicRepository.create(data);
    return topic;
  }

  /**
   * Get all topics with filtering and pagination
   */
  async findAll(
    filter: TopicFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    // Default to active topics only
    if (filter.isActive === undefined) {
      filter.isActive = true;
    }

    return topicRepository.findAll(filter, page, limit);
  }

  /**
   * Get topic by ID
   */
  async findById(id: string): Promise<any | null> {
    if (!id) {
      throw new Error('Topic ID is required');
    }

    return topicRepository.findById(id);
  }

  /**
   * Get all topics for a chapter
   */
  async findByChapter(chapterId: string): Promise<any[]> {
    if (!chapterId) {
      throw new Error('Chapter ID is required');
    }

    return topicRepository.findByChapter(chapterId);
  }

  /**
   * Update topic
   */
  async update(id: string, data: UpdateTopicData): Promise<any> {
    // Check if topic exists
    const exists = await topicRepository.exists(id);
    if (!exists) {
      throw new Error('Topic not found');
    }

    // Check if new slug already exists (if slug is being updated)
    if (data.slug) {
      const topic = await topicRepository.findById(id);
      if (topic) {
        const slugExists = await topicRepository.slugExists(
          topic.chapterId,
          data.slug,
          id
        );
        if (slugExists) {
          throw new Error('Topic with this slug already exists in this chapter');
        }
      }
    }

    const updatedTopic = await topicRepository.update(id, data);
    return updatedTopic;
  }

  /**
   * Delete topic (soft delete)
   */
  async delete(id: string): Promise<any> {
    // Check if topic exists
    const exists = await topicRepository.exists(id);
    if (!exists) {
      throw new Error('Topic not found');
    }

    const topic = await topicRepository.delete(id);
    return topic;
  }

  /**
   * Get topic with questions
   */
  async getWithQuestions(id: string): Promise<any | null> {
    return topicRepository.getWithQuestions(id);
  }

  /**
   * Search topics
   */
  async search(query: string, limit: number = 10): Promise<any[]> {
    const result = await topicRepository.findAll(
      { search: query, isActive: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Get topic count by chapter
   */
  async getTopicCountByChapter(chapterId: string): Promise<number> {
    const result = await topicRepository.findAll({ chapterId, isActive: true }, 1, 1000);
    return result.total;
  }
}

export const topicService = new TopicService();
export default topicService;