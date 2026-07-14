import { Request, Response, NextFunction } from 'express';
import subjectService from '../services/subject.service';
import { ApiError } from '../middleware/error.middleware';

export const getSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter: any = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.forNeet !== undefined) {
      filter.forNeet = req.query.forNeet === 'true';
    }
    if (req.query.forJeeMain !== undefined) {
      filter.forJeeMain = req.query.forJeeMain === 'true';
    }
    if (req.query.forJeeAdvanced !== undefined) {
      filter.forJeeAdvanced = req.query.forJeeAdvanced === 'true';
    }
    if (req.query.search) {
      filter.search = req.query.search as string;
    }

    const result = await subjectService.findAll(filter, page, limit);

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

export const getSubjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subject = await subjectService.findById(id);

    if (!subject) {
      return next(new ApiError(404, 'Subject not found'));
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const subject = await subjectService.findBySlug(slug);

    if (!subject) {
      return next(new ApiError(404, 'Subject not found'));
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectsByExam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { examType } = req.params;

    const subjects = await subjectService.findByExam(examType as any);

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subject = await subjectService.create(req.body);

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subject = await subjectService.update(id, req.body);

    res.json({
      success: true,
      data: subject,
      message: 'Subject updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await subjectService.delete(id);

    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subject = await subjectService.getWithStats(id);

    if (!subject) {
      return next(new ApiError(404, 'Subject not found'));
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const searchSubjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    const subjects = await subjectService.search(q as string, limit);

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};
