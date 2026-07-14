import { Request, Response, NextFunction } from 'express';
import questionService from '../services/question.service';
import { ApiError } from '../middleware/error.middleware';

export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter: any = {};

    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.chapterId) filter.chapterId = req.query.chapterId as string;
    if (req.query.topicId) filter.topicId = req.query.topicId as string;
    if (req.query.difficultyLevel) filter.difficultyLevel = req.query.difficultyLevel as string;
    if (req.query.questionType) filter.questionType = req.query.questionType as string;
    if (req.query.sourceType) filter.sourceType = req.query.sourceType as string;
    if (req.query.sourceExam) filter.sourceExam = req.query.sourceExam as string;
    if (req.query.sourceYear) filter.sourceYear = parseInt(req.query.sourceYear as string);
    if (req.query.forNeet !== undefined) filter.forNeet = req.query.forNeet === 'true';
    if (req.query.forJeeMain !== undefined) filter.forJeeMain = req.query.forJeeMain === 'true';
    if (req.query.forJeeAdvanced !== undefined) filter.forJeeAdvanced = req.query.forJeeAdvanced === 'true';
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.search) filter.search = req.query.search as string;

    const result = await questionService.findAll(filter, page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const question = await questionService.findById(id);

    if (!question) {
      return next(new ApiError(404, 'Question not found'));
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chapterId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const questions = await questionService.findByChapter(chapterId, limit);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topicId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const questions = await questionService.findByTopic(topicId, limit);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getRandomQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = parseInt(req.query.count as string) || 10;
    const filter: any = {};

    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.chapterId) filter.chapterId = req.query.chapterId as string;
    if (req.query.topicId) filter.topicId = req.query.topicId as string;
    if (req.query.difficultyLevel) filter.difficultyLevel = req.query.difficultyLevel as string;
    if (req.query.forNeet !== undefined) filter.forNeet = req.query.forNeet === 'true';
    if (req.query.forJeeMain !== undefined) filter.forJeeMain = req.query.forJeeMain === 'true';
    if (req.query.forJeeAdvanced !== undefined) filter.forJeeAdvanced = req.query.forJeeAdvanced === 'true';

    const questions = await questionService.getRandomQuestions(filter, count);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const question = await questionService.create(req.body);

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const question = await questionService.update(id, req.body);

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestionOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const question = await questionService.updateOptions(id, req.body.options);

    res.json({
      success: true,
      data: question,
      message: 'Question options updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await questionService.delete(id);

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chapterId = req.query.chapterId as string | undefined;
    const subjectId = req.query.subjectId as string | undefined;

    const counts = await questionService.getCountsByDifficulty(chapterId, subjectId);

    res.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    next(error);
  }
};

export const searchQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    const questions = await questionService.search(q as string, limit);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getPYQs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { examType } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const subjectId = req.query.subjectId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const questions = await questionService.getPYQs(examType, year, subjectId, limit);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsForNeet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter: any = {};

    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.chapterId) filter.chapterId = req.query.chapterId as string;
    if (req.query.difficultyLevel) filter.difficultyLevel = req.query.difficultyLevel as string;

    const result = await questionService.getQuestionsForNeet(filter, page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsForJeeMain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter: any = {};

    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.chapterId) filter.chapterId = req.query.chapterId as string;
    if (req.query.difficultyLevel) filter.difficultyLevel = req.query.difficultyLevel as string;

    const result = await questionService.getQuestionsForJeeMain(filter, page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const question = await questionService.verify(id, userId);

    res.json({
      success: true,
      data: question,
      message: 'Question verified successfully',
    });
  } catch (error) {
    next(error);
  }
};
