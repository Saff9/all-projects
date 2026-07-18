import { body, query, param } from 'express-validator';

export const createChapterValidation = [
  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 200 })
    .withMessage('Name must be at most 200 characters'),
  
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isSlug()
    .withMessage('Invalid slug format')
    .isLength({ max: 200 })
    .withMessage('Slug must be at most 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  
  body('classLevel')
    .optional()
    .isArray()
    .withMessage('Class level must be an array')
    .custom((value: number[]) => {
      if (!value.every((v) => [11, 12].includes(v))) {
        throw new Error('Class level must contain only 11 or 12');
      }
      return true;
    }),
  
  body('unitName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Unit name must be at most 100 characters'),
  
  body('unitNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Unit number must be a non-negative integer'),
  
  body('chapterNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Chapter number must be a non-negative integer'),
  
  body('neetWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('NEET weightage must be between 0 and 100'),
  
  body('jeeMainWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('JEE Main weightage must be between 0 and 100'),
  
  body('jeeAdvancedWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('JEE Advanced weightage must be between 0 and 100'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a non-negative number'),
  
  body('difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
];

export const updateChapterValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid chapter ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Name must be at most 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Invalid slug format')
    .isLength({ max: 200 })
    .withMessage('Slug must be at most 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  
  body('classLevel')
    .optional()
    .isArray()
    .withMessage('Class level must be an array')
    .custom((value: number[]) => {
      if (!value.every((v) => [11, 12].includes(v))) {
        throw new Error('Class level must contain only 11 or 12');
      }
      return true;
    }),
  
  body('unitName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Unit name must be at most 100 characters'),
  
  body('unitNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Unit number must be a non-negative integer'),
  
  body('chapterNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Chapter number must be a non-negative integer'),
  
  body('neetWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('NEET weightage must be between 0 and 100'),
  
  body('jeeMainWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('JEE Main weightage must be between 0 and 100'),
  
  body('jeeAdvancedWeightage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('JEE Advanced weightage must be between 0 and 100'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a non-negative number'),
  
  body('difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const getChaptersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('subjectId')
    .optional()
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  
  query('difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  query('classLevel')
    .optional()
    .isIn(['11', '12'])
    .withMessage('Class level must be 11 or 12'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be at most 100 characters'),
];

export const getChapterByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid chapter ID'),
];

export const deleteChapterValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid chapter ID'),
];

export interface CreateChapterInput {
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  classLevel?: number[];
  unitName?: string;
  unitNumber?: number;
  chapterNumber?: number;
  neetWeightage?: number;
  jeeMainWeightage?: number;
  jeeAdvancedWeightage?: number;
  estimatedHours?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  displayOrder?: number;
}

export interface UpdateChapterInput {
  name?: string;
  slug?: string;
  description?: string;
  classLevel?: number[];
  unitName?: string;
  unitNumber?: number;
  chapterNumber?: number;
  neetWeightage?: number;
  jeeMainWeightage?: number;
  jeeAdvancedWeightage?: number;
  estimatedHours?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  displayOrder?: number;
  isActive?: boolean;
}

export interface ChapterQueryInput {
  page?: number;
  limit?: number;
  subjectId?: string;
  isActive?: boolean;
  difficultyLevel?: string;
  classLevel?: number;
  search?: string;
}