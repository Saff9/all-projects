import questionRepository, {
  CreateQuestionData,
  CreateQuestionWithOptionsData,
  CreateQuestionOptionData,
  UpdateQuestionData,
  QuestionFilter,
  PaginatedResult,
} from '../repositories/question.repository';

class QuestionService {
  /**
   * Create a question with options
   */
  async create(data: CreateQuestionWithOptionsData): Promise<any> {
    // Validate that at least one option is correct for MCQ
    if (data.questionType === 'mcq' || !data.questionType) {
      const correctOptions = data.options.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        throw new Error('At least one option must be marked as correct');
      }
      if (correctOptions.length > 1) {
        throw new Error('MCQ questions should have exactly one correct answer');
      }
    }

    // Validate option labels
    const validLabels = ['A', 'B', 'C', 'D'];
    for (const opt of data.options) {
      if (!validLabels.includes(opt.optionLabel)) {
        throw new Error(`Invalid option label: ${opt.optionLabel}. Must be one of A, B, C, D`);
      }
    }

    const question = await questionRepository.createWithOptions(data);
    return question;
  }

  /**
   * Get all questions with filtering and pagination
   */
  async findAll(
    filter: QuestionFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    // Default to active questions only
    if (filter.isActive === undefined) {
      filter.isActive = true;
    }

    return questionRepository.findAll(filter, page, limit);
  }

  /**
   * Get question by ID
   */
  async findById(id: string): Promise<any | null> {
    if (!id) {
      throw new Error('Question ID is required');
    }

    return questionRepository.findById(id);
  }

  /**
   * Get questions by chapter
   */
  async findByChapter(chapterId: string, limit?: number): Promise<any[]> {
    if (!chapterId) {
      throw new Error('Chapter ID is required');
    }

    return questionRepository.findByChapter(chapterId, limit);
  }

  /**
   * Get questions by topic
   */
  async findByTopic(topicId: string, limit?: number): Promise<any[]> {
    if (!topicId) {
      throw new Error('Topic ID is required');
    }

    return questionRepository.findByTopic(topicId, limit);
  }

  /**
   * Get random questions for tests
   */
  async getRandomQuestions(
    filter: QuestionFilter,
    count: number,
    excludeIds: string[] = []
  ): Promise<any[]> {
    if (count <= 0) {
      throw new Error('Count must be greater than 0');
    }

    return questionRepository.getRandomQuestions(filter, count, excludeIds);
  }

  /**
   * Update question
   */
  async update(id: string, data: UpdateQuestionData): Promise<any> {
    // Check if question exists
    const exists = await questionRepository.exists(id);
    if (!exists) {
      throw new Error('Question not found');
    }

    const question = await questionRepository.update(id, data);
    return question;
  }

  /**
   * Update question options
   */
  async updateOptions(id: string, options: CreateQuestionOptionData[]): Promise<any> {
    // Validate that at least one option is correct
    const correctOptions = options.filter((opt) => opt.isCorrect);
    if (correctOptions.length === 0) {
      throw new Error('At least one option must be marked as correct');
    }

    // Validate option labels
    const validLabels = ['A', 'B', 'C', 'D'];
    for (const opt of options) {
      if (!validLabels.includes(opt.optionLabel)) {
        throw new Error(`Invalid option label: ${opt.optionLabel}. Must be one of A, B, C, D`);
      }
    }

    const question = await questionRepository.updateOptions(id, options);
    return question;
  }

  /**
   * Delete question (soft delete)
   */
  async delete(id: string): Promise<any> {
    // Check if question exists
    const exists = await questionRepository.exists(id);
    if (!exists) {
      throw new Error('Question not found');
    }

    const question = await questionRepository.delete(id);
    return question;
  }

  /**
   * Update question statistics after attempt
   */
  async updateStats(id: string, isCorrect: boolean, timeSeconds: number): Promise<any> {
    return questionRepository.updateStats(id, isCorrect, timeSeconds);
  }

  /**
   * Get question counts by difficulty
   */
  async getCountsByDifficulty(chapterId?: string, subjectId?: string): Promise<{
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }> {
    return questionRepository.getCountsByDifficulty(chapterId, subjectId);
  }

  /**
   * Search questions
   */
  async search(query: string, limit: number = 20): Promise<any[]> {
    const result = await questionRepository.findAll(
      { search: query, isActive: true },
      1,
      limit
    );
    return result.data;
  }

  /**
   * Get PYQ (Previous Year Questions) by year and exam
   */
  async getPYQs(
    examType: string,
    year?: number,
    subjectId?: string,
    limit: number = 50
  ): Promise<any[]> {
    const filter: QuestionFilter = {
      sourceType: 'pyq',
      sourceExam: examType,
      isActive: true,
    };

    if (year) {
      filter.sourceYear = year;
    }
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const result = await questionRepository.findAll(filter, 1, limit);
    return result.data;
  }

  /**
   * Get questions for NEET
   */
  async getQuestionsForNeet(
    filter: Omit<QuestionFilter, 'forNeet'> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return this.findAll({ ...filter, forNeet: true }, page, limit);
  }

  /**
   * Get questions for JEE Main
   */
  async getQuestionsForJeeMain(
    filter: Omit<QuestionFilter, 'forJeeMain'> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return this.findAll({ ...filter, forJeeMain: true }, page, limit);
  }

  /**
   * Get questions for JEE Advanced
   */
  async getQuestionsForJeeAdvanced(
    filter: Omit<QuestionFilter, 'forJeeAdvanced'> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<any>> {
    return this.findAll({ ...filter, forJeeAdvanced: true }, page, limit);
  }

  /**
   * Verify a question (admin only)
   */
  async verify(id: string, verifiedBy: string): Promise<any> {
    const question = await questionRepository.update(id, {
      isVerified: true,
      verifiedBy,
      verifiedAt: new Date(),
    });
    return question;
  }

  /**
   * Bulk create questions
   */
  async bulkCreate(questions: CreateQuestionWithOptionsData[]): Promise<number> {
    let created = 0;
    const errors: string[] = [];

    for (const q of questions) {
      try {
        await this.create(q);
        created++;
      } catch (error: any) {
        errors.push(`Question ${created + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Bulk create errors:', errors);
    }

    return created;
  }
}

export const questionService = new QuestionService();
export default questionService;