import { Request, Response, NextFunction } from 'express';
import testService from '../services/test.service';
import { ApiError } from '../middleware/error.middleware';

export const getTests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter: any = {};

    if (req.query.testType) filter.testType = req.query.testType as string;
    if (req.query.examType) filter.examType = req.query.examType as string;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true';
    if (req.query.isPremium !== undefined) filter.isPremium = req.query.isPremium === 'true';
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) filter.search = req.query.search as string;

    const result = await testService.findAll(filter, page, limit);

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

export const getTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const test = await testService.findById(id);

    if (!test) {
      return next(new ApiError(404, 'Test not found'));
    }

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const test = await testService.findBySlug(slug);

    if (!test) {
      return next(new ApiError(404, 'Test not found'));
    }

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    next(error);
  }
};

export const createTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const test = await testService.create(req.body);

    res.status(201).json({
      success: true,
      data: test,
      message: 'Test created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const test = await testService.update(id, req.body);

    res.json({
      success: true,
      data: test,
      message: 'Test updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await testService.delete(id);

    res.json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const startAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const attempt = await testService.startAttempt(id, userId);

    res.json({
      success: true,
      data: attempt,
      message: 'Test attempt started',
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attemptId } = req.params;

    const response = await testService.submitAnswer(attemptId, req.body.questionId, {
      selectedOptions: req.body.selectedOptions,
      numericalAnswer: req.body.numericalAnswer,
      timeSpentSeconds: req.body.timeSpentSeconds,
      markedForReview: req.body.markedForReview,
    });

    res.json({
      success: true,
      data: response,
      message: 'Answer submitted',
    });
  } catch (error) {
    next(error);
  }
};

export const finishAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attemptId } = req.params;

    const attempt = await testService.finishAttempt(attemptId);

    res.json({
      success: true,
      data: attempt,
      message: 'Test completed',
    });
  } catch (error) {
    next(error);
  }
};

export const getAttemptResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attemptId } = req.params;

    const results = await testService.getAttemptResults(attemptId);

    if (!results) {
      return next(new ApiError(404, 'Attempt not found'));
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTestHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter: any = {};

    if (req.query.testType) filter.testType = req.query.testType as string;
    if (req.query.examType) filter.examType = req.query.examType as string;

    if (!userId) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const result = await testService.getUserTestHistory(userId, filter, page, limit);

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

export const getTestsByExamType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { examType } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const tests = await testService.findByExamType(examType, limit);

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestsBySubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const tests = await testService.findBySubject(subjectId, limit);

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

export const searchTests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    const tests = await testService.search(q as string, limit);

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

export const createChapterTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chapterId, subjectId, examType, questionCount, title } = req.body;

    const test = await testService.createChapterTest(
      chapterId,
      subjectId,
      examType,
      questionCount || 30,
      title
    );

    res.status(201).json({
      success: true,
      data: test,
      message: 'Chapter test created successfully',
    });
  } catch (error) {
    next(error);
  }
};
