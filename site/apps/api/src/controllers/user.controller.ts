import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/error.middleware';
import progressService from '../services/progress.service';
import mistakeService from '../services/mistake.service';
import testService from '../services/test.service';

const prisma = new PrismaClient();

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        targetExam: true,
        targetYear: true,
        schoolName: true,
        city: true,
        state: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { fullName, phone, targetExam, targetYear, schoolName, city, state } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        fullName,
        phone,
        targetExam,
        targetYear,
        schoolName,
        city,
        state,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        targetExam: true,
        targetYear: true,
        schoolName: true,
        city: true,
        state: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Progress Endpoints
// ============================================

export const getUserProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const filter: any = {};
    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.status) filter.status = req.query.status as string;
    if (req.query.isWeakChapter !== undefined) {
      filter.isWeakChapter = req.query.isWeakChapter === 'true';
    }

    const progress = await progressService.getUserProgress(req.user.userId, filter);

    res.json({
      success: true,
      data: progress,
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
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { chapterId } = req.params;

    const progress = await progressService.getProgress(req.user.userId, chapterId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChapterProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { chapterId } = req.params;

    const progress = await progressService.updateProgress(
      req.user.userId,
      chapterId,
      req.body
    );

    res.json({
      success: true,
      data: progress,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOverallProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const progress = await progressService.getOverallProgressBySubject(req.user.userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const getWeakChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const chapters = await progressService.getWeakChapters(req.user.userId, limit);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

export const getStreak = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const streak = await progressService.getStreak(req.user.userId);

    res.json({
      success: true,
      data: streak,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const stats = await progressService.getDashboardStats(req.user.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklySummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const summary = await progressService.getWeeklySummary(req.user.userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    const activity = await progressService.getDailyActivity(
      req.user.userId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const activity = await progressService.logDailyActivity(req.user.userId, req.body);

    res.json({
      success: true,
      data: activity,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Mistake Notebook Endpoints
// ============================================

export const getMistakes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter: any = { userId: req.user.userId };

    if (req.query.chapterId) filter.chapterId = req.query.chapterId as string;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId as string;
    if (req.query.mistakeType) filter.mistakeType = req.query.mistakeType as string;
    if (req.query.severity) filter.severity = req.query.severity as string;
    if (req.query.isMastered !== undefined) {
      filter.isMastered = req.query.isMastered === 'true';
    }

    const result = await mistakeService.getUserMistakes(filter, page, limit);

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

export const getMistakeStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const stats = await mistakeService.getMistakeStats(req.user.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevisionQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const queue = await mistakeService.getRevisionQueue(req.user.userId, limit);

    res.json({
      success: true,
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

export const addMistake = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const mistake = await mistakeService.add({
      userId: req.user.userId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: mistake,
      message: 'Question added to mistake notebook',
    });
  } catch (error) {
    next(error);
  }
};

export const removeMistake = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { questionId } = req.params;

    await mistakeService.remove(req.user.userId, questionId);

    res.json({
      success: true,
      message: 'Question removed from mistake notebook',
    });
  } catch (error) {
    next(error);
  }
};

export const updateMistakeRevision = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { questionId } = req.params;
    const { quality } = req.body;

    const mistake = await mistakeService.updateRevisionStatus(
      req.user.userId,
      questionId,
      quality
    );

    res.json({
      success: true,
      data: mistake,
      message: 'Revision status updated',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Test History Endpoints
// ============================================

export const getTestHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter: any = {};

    if (req.query.testType) filter.testType = req.query.testType as string;
    if (req.query.examType) filter.examType = req.query.examType as string;

    const result = await testService.getUserTestHistory(req.user.userId, filter, page, limit);

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
