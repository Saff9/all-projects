import { Request, Response, NextFunction } from 'express';
import chapterService from '../services/chapter.service';
import { ApiError } from '../middleware/error.middleware';

export const getChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter: any = {};

    if (req.query.subjectId) {
      filter.subjectId = req.query.subjectId as string;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.difficultyLevel) {
      filter.difficultyLevel = req.query.difficultyLevel as string;
    }
    if (req.query.classLevel) {
      filter.classLevel = parseInt(req.query.classLevel as string);
    }
    if (req.query.search) {
      filter.search = req.query.search as string;
    }

    const result = await chapterService.findAll(filter, page, limit);

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

export const getChapterById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const chapter = await chapterService.findById(id);

    if (!chapter) {
      return next(new ApiError(404, 'Chapter not found'));
    }

    res.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterWithTopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const chapter = await chapterService.getWithTopicsAndResources(id);

    if (!chapter) {
      return next(new ApiError(404, 'Chapter not found'));
    }

    res.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

export const getChaptersBySubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectId } = req.params;

    const chapters = await chapterService.findBySubject(subjectId);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

export const getChaptersByExam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { examType } = req.params;
    const subjectId = req.query.subjectId as string | undefined;

    const chapters = await chapterService.findByExam(examType as any, subjectId);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterProgress = async (
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

    const result = await chapterService.getChapterProgress(id, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chapter = await chapterService.create(req.body);

    res.status(201).json({
      success: true,
      data: chapter,
      message: 'Chapter created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const chapter = await chapterService.update(id, req.body);

    res.json({
      success: true,
      data: chapter,
      message: 'Chapter updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await chapterService.delete(id);

    res.json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getHighWeightageChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { examType } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const chapters = await chapterService.getHighWeightageChapters(examType as any, limit);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

export const searchChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    const chapters = await chapterService.search(q as string, limit);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

export const getChaptersWithProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;
    const subjectId = req.query.subjectId as string | undefined;

    if (!userId) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const chapters = await chapterService.getChaptersWithProgress(userId, subjectId);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};
