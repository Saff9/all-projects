import chapterRepository, {
  CreateChapterData,
  UpdateChapterData,
  ChapterFilter,
  PaginatedResult,
  ChapterWithRelations,
} from '../repositories/chapter.repository';
import progressRepository from '../repositories/progress.repository';

// Helper to convert Prisma Decimal fields to number
function convertChapterToResponse(chapter: any): ChapterResponse {
  return {
    ...chapter,
    neetWeightage: chapter.neetWeightage ? Number(chapter.neetWeightage) : null,
    jeeMainWeightage: chapter.jeeMainWeightage ? Number(chapter.jeeMainWeightage) : null,
    jeeAdvancedWeightage: chapter.jeeAdvancedWeightage ? Number(chapter.jeeAdvancedWeightage) : null,
    estimatedHours: chapter.estimatedHours ? Number(chapter.estimatedHours) : null,
  };
}

function convertChaptersToResponse(chapters: any[]): ChapterResponse[] {
  return chapters.map(convertChapterToResponse);
}

export interface ChapterResponse {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string | null;
  classLevel: number[];
  unitName: string | null;
  unitNumber: number | null;
  chapterNumber: number | null;
  neetWeightage: number | null;
  jeeMainWeightage: number | null;
  jeeAdvancedWeightage: number | null;
  totalTopics: number;
  totalQuestions: number;
  estimatedHours: number | null;
  difficultyLevel: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterWithSubject extends ChapterResponse {
  subject: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ChapterWithTopics extends ChapterWithSubject {
  topics: any[];
  _count?: {
    questions: number;
  };
}

export interface ChapterWithProgress extends ChapterWithSubject {
  progress?: any;
}

class ChapterService {
  /**
   * Create a new chapter
   */
  async create(data: CreateChapterData): Promise<ChapterResponse> {
    // Check if slug already exists within subject
    const slugExists = await chapterRepository.slugExists(data.subjectId, data.slug);
    if (slugExists) {
      throw new Error('Chapter with this slug already exists in this subject');
    }

    const chapter = await chapterRepository.create(data);
    return convertChapterToResponse(chapter);
  }

  /**
   * Get all chapters with filtering and pagination
   */
  async findAll(
    filter: ChapterFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<ChapterWithRelations>> {
    // Default to active chapters only
    if (filter.isActive === undefined) {
      filter.isActive = true;
    }

    return chapterRepository.findAll(filter, page, limit);
  }

  /**
   * Get chapter by ID
   */
  async findById(id: string): Promise<ChapterWithTopics | null> {
    if (!id) {
      throw new Error('Chapter ID is required');
    }

    const chapter = await chapterRepository.findById(id);
    if (!chapter) {
      return null;
    }

    return {
      ...chapter,
      neetWeightage: chapter.neetWeightage ? Number(chapter.neetWeightage) : null,
      jeeMainWeightage: chapter.jeeMainWeightage ? Number(chapter.jeeMainWeightage) : null,
      jeeAdvancedWeightage: chapter.jeeAdvancedWeightage ? Number(chapter.jeeAdvancedWeightage) : null,
      estimatedHours: chapter.estimatedHours ? Number(chapter.estimatedHours) : null,
    } as ChapterWithTopics;
  }

  /**
   * Get chapter with topics and resources
   */
  async getWithTopicsAndResources(id: string) {
    if (!id) {
      throw new Error('Chapter ID is required');
    }

    return chapterRepository.getWithTopicsAndResources(id);
  }

  /**
   * Get all chapters for a subject
   */
  async findBySubject(subjectId: string): Promise<ChapterResponse[]> {
    if (!subjectId) {
      throw new Error('Subject ID is required');
    }

    return chapterRepository.findBySubject(subjectId).then(convertChaptersToResponse);
  }

  /**
   * Get chapters by exam type
   */
  async findByExam(
    examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED',
    subjectId?: string
  ): Promise<ChapterResponse[]> {
    return chapterRepository.findByExam(examType, subjectId).then(convertChaptersToResponse);
  }

  /**
   * Get chapter progress for a user
   */
  async getChapterProgress(chapterId: string, userId: string) {
    if (!chapterId || !userId) {
      throw new Error('Chapter ID and User ID are required');
    }

    const chapter = await chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const progress = await chapterRepository.getUserProgress(chapterId, userId);

    return {
      ...convertChapterToResponse(chapter),
      progress,
    };
  }

  /**
   * Update chapter
   */
  async update(id: string, data: UpdateChapterData): Promise<ChapterResponse> {
    // Check if chapter exists
    const exists = await chapterRepository.exists(id);
    if (!exists) {
      throw new Error('Chapter not found');
    }

    // Check if new slug already exists (if slug is being updated)
    if (data.slug) {
      const chapter = await chapterRepository.findById(id);
      if (chapter) {
        const slugExists = await chapterRepository.slugExists(
          chapter.subjectId,
          data.slug,
          id
        );
        if (slugExists) {
          throw new Error('Chapter with this slug already exists in this subject');
        }
      }
    }

    const updatedChapter = await chapterRepository.update(id, data);
    return convertChapterToResponse(updatedChapter);
  }

  /**
   * Delete chapter (soft delete)
   */
  async delete(id: string): Promise<ChapterResponse> {
    // Check if chapter exists
    const exists = await chapterRepository.exists(id);
    if (!exists) {
      throw new Error('Chapter not found');
    }

    const chapter = await chapterRepository.delete(id);
    return convertChapterToResponse(chapter);
  }

  /**
   * Update chapter statistics
   */
  async updateStats(id: string): Promise<void> {
    await chapterRepository.updateStats(id);
  }

  /**
   * Get chapters with user progress
   */
  async getChaptersWithProgress(
    userId: string,
    subjectId?: string
  ): Promise<ChapterWithProgress[]> {
    const filter: ChapterFilter = { isActive: true };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const result = await chapterRepository.findAll(filter, 1, 100);
    
    // Get progress for all chapters
    const chaptersWithProgress = await Promise.all(
      result.data.map(async (chapter: any) => {
        const progress = await chapterRepository.getUserProgress(chapter.id, userId);
        return {
          ...convertChapterToResponse(chapter),
          progress,
        } as ChapterWithProgress;
      })
    );

    return chaptersWithProgress;
  }

  /**
   * Get high weightage chapters for an exam
   */
  async getHighWeightageChapters(
    examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED',
    limit: number = 10
  ): Promise<any[]> {
    const chapters = await chapterRepository.findByExam(examType);

    // Sort by weightage
    const sorted = chapters.sort((a, b) => {
      const weightageA =
        examType === 'NEET'
          ? Number(a.neetWeightage) || 0
          : examType === 'JEE_MAIN'
          ? Number(a.jeeMainWeightage) || 0
          : Number(a.jeeAdvancedWeightage) || 0;

      const weightageB =
        examType === 'NEET'
          ? Number(b.neetWeightage) || 0
          : examType === 'JEE_MAIN'
          ? Number(b.jeeMainWeightage) || 0
          : Number(b.jeeAdvancedWeightage) || 0;

      return weightageB - weightageA;
    });

    return sorted.slice(0, limit);
  }

  /**
   * Search chapters
   */
  async search(query: string, limit: number = 10): Promise<any[]> {
    const result = await chapterRepository.findAll(
      { search: query, isActive: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Get chapter count by subject
   */
  async getChapterCountBySubject(subjectId: string): Promise<number> {
    const result = await chapterRepository.findAll({ subjectId, isActive: true }, 1, 1000);
    return result.total;
  }
}

export const chapterService = new ChapterService();
export default chapterService;