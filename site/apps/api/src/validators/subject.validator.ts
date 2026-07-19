import { body, query, param, validationResult } from 'express-validator';

export const createSubjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .isSlug()
    .withMessage('Invalid slug format')
    .isLength({ max: 100 })
    .withMessage('Slug must be at most 100 characters'),
  
  body('iconUrl')
    .optional()
    .isURL()
    .withMessage('Icon URL must be a valid URL'),
  
  body('colorCode')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color code must be a valid hex color (e.g., #FF5733)'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  
  body('forNeet')
    .optional()
    .isBoolean()
    .withMessage('forNeet must be a boolean'),
  
  body('forJeeMain')
    .optional()
    .isBoolean()
    .withMessage('forJeeMain must be a boolean'),
  
  body('forJeeAdvanced')
    .optional()
    .isBoolean()
    .withMessage('forJeeAdvanced must be a boolean'),
];

export const updateSubjectValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Invalid slug format')
    .isLength({ max: 100 })
    .withMessage('Slug must be at most 100 characters'),
  
  body('iconUrl')
    .optional()
    .isURL()
    .withMessage('Icon URL must be a valid URL'),
  
  body('colorCode')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color code must be a valid hex color'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  
  body('forNeet')
    .optional()
    .isBoolean()
    .withMessage('forNeet must be a boolean'),
  
  body('forJeeMain')
    .optional()
    .isBoolean()
    .withMessage('forJeeMain must be a boolean'),
  
  body('forJeeAdvanced')
    .optional()
    .isBoolean()
    .withMessage('forJeeAdvanced must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const getSubjectsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  
  query('forNeet')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('forNeet must be true or false'),
  
  query('forJeeMain')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('forJeeMain must be true or false'),
  
  query('forJeeAdvanced')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('forJeeAdvanced must be true or false'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be at most 100 characters'),
];

export const getSubjectByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid subject ID'),
];

export const deleteSubjectValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid subject ID'),
];

export interface CreateSubjectInput {
  name: string;
  slug: string;
  iconUrl?: string;
  colorCode?: string;
  description?: string;
  displayOrder?: number;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
}

export interface UpdateSubjectInput {
  name?: string;
  slug?: string;
  iconUrl?: string;
  colorCode?: string;
  description?: string;
  displayOrder?: number;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  isActive?: boolean;
}

export interface SubjectQueryInput {
  page?: number;
  limit?: number;
  isActive?: boolean;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  search?: string;
}