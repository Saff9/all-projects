import subjectRepository, {
  CreateSubjectData,
  UpdateSubjectData,
  SubjectFilter,
  PaginatedResult,
} from '../repositories/subject.repository';

export interface SubjectResponse {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  colorCode: string | null;
  description: string | null;
  displayOrder: number;
  forNeet: boolean;
  forJeeMain: boolean;
  forJeeAdvanced: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectWithChapters extends SubjectResponse {
  chapters: any[];
}

export interface SubjectWithStats extends SubjectResponse {
  _count: {
    chapters: number;
    questions: number;
  };
}

class SubjectService {
  /**
   * Create a new subject
   */
  async create(data: CreateSubjectData): Promise<SubjectResponse> {
    // Check if slug already exists
    const slugExists = await subjectRepository.slugExists(data.slug);
    if (slugExists) {
      throw new Error('Subject with this slug already exists');
    }

    const subject = await subjectRepository.create(data);
    return subject;
  }

  /**
   * Get all subjects with filtering and pagination
   */
  async findAll(
    filter: SubjectFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<SubjectResponse>> {
    // Default to active subjects only
    if (filter.isActive === undefined) {
      filter.isActive = true;
    }

    return subjectRepository.findAll(filter, page, limit);
  }

  /**
   * Get subject by ID
   */
  async findById(id: string): Promise<SubjectWithChapters | null> {
    if (!id) {
      throw new Error('Subject ID is required');
    }

    const subject = await subjectRepository.findById(id);
    if (!subject) {
      return null;
    }

    return subject as SubjectWithChapters;
  }

  /**
   * Get subject by slug
   */
  async findBySlug(slug: string): Promise<SubjectResponse | null> {
    if (!slug) {
      throw new Error('Subject slug is required');
    }

    return subjectRepository.findBySlug(slug);
  }

  /**
   * Get subjects by exam type
   */
  async findByExam(examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED'): Promise<SubjectResponse[]> {
    return subjectRepository.findByExam(examType);
  }

  /**
   * Update subject
   */
  async update(id: string, data: UpdateSubjectData): Promise<SubjectResponse> {
    // Check if subject exists
    const exists = await subjectRepository.exists(id);
    if (!exists) {
      throw new Error('Subject not found');
    }

    // Check if new slug already exists (if slug is being updated)
    if (data.slug) {
      const slugExists = await subjectRepository.slugExists(data.slug, id);
      if (slugExists) {
        throw new Error('Subject with this slug already exists');
      }
    }

    const subject = await subjectRepository.update(id, data);
    return subject;
  }

  /**
   * Delete subject (soft delete)
   */
  async delete(id: string): Promise<SubjectResponse> {
    // Check if subject exists
    const exists = await subjectRepository.exists(id);
    if (!exists) {
      throw new Error('Subject not found');
    }

    const subject = await subjectRepository.delete(id);
    return subject;
  }

  /**
   * Get subject with statistics
   */
  async getWithStats(id: string): Promise<SubjectWithStats | null> {
    const subject = await subjectRepository.getWithChapterCount(id);
    if (!subject) {
      return null;
    }

    return subject as SubjectWithStats;
  }

  /**
   * Get all active subjects (for dropdowns, navigation, etc.)
   */
  async getActiveSubjects(): Promise<SubjectResponse[]> {
    const result = await subjectRepository.findAll({ isActive: true }, 1, 100);
    return result.data;
  }

  /**
   * Get subjects for NEET
   */
  async getNeetSubjects(): Promise<SubjectResponse[]> {
    return this.findByExam('NEET');
  }

  /**
   * Get subjects for JEE Main
   */
  async getJeeMainSubjects(): Promise<SubjectResponse[]> {
    return this.findByExam('JEE_MAIN');
  }

  /**
   * Get subjects for JEE Advanced
   */
  async getJeeAdvancedSubjects(): Promise<SubjectResponse[]> {
    return this.findByExam('JEE_ADVANCED');
  }

  /**
   * Search subjects
   */
  async search(query: string, limit: number = 10): Promise<SubjectResponse[]> {
    const result = await subjectRepository.findAll(
      { search: query, isActive: true },
      1,
      limit
    );
    return result.data;
  }
}

export const subjectService = new SubjectService();
export default subjectService;