import { body, query, param } from 'express-validator';

export const createTestValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  
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
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),
  
  body('instructions')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Instructions must be at most 5000 characters'),
  
  body('testType')
    .notEmpty()
    .withMessage('Test type is required')
    .isIn(['chapter_test', 'unit_test', 'subject_test', 'full_test', 'custom_test', 'pyq_test'])
    .withMessage('Invalid test type'),
  
  body('examType')
    .notEmpty()
    .withMessage('Exam type is required')
    .isIn(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'])
    .withMessage('Invalid exam type'),
  
  body('subjectId')
    .optional()
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  body('totalQuestions')
    .notEmpty()
    .withMessage('Total questions is required')
    .isInt({ min: 1, max: 200 })
    .withMessage('Total questions must be between 1 and 200'),
  
  body('totalMarks')
    .notEmpty()
    .withMessage('Total marks is required')
    .isInt({ min: 1 })
    .withMessage('Total marks must be at least 1'),
  
  body('durationMinutes')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1, max: 360 })
    .withMessage('Duration must be between 1 and 360 minutes'),
  
  body('markingScheme')
    .optional()
    .isObject()
    .withMessage('Marking scheme must be an object'),
  
  body('markingScheme.correct')
    .optional()
    .isInt()
    .withMessage('Correct marks must be an integer'),
  
  body('markingScheme.incorrect')
    .optional()
    .isInt()
    .withMessage('Incorrect marks must be an integer'),
  
  body('markingScheme.unattempted')
    .optional()
    .isInt()
    .withMessage('Unattempted marks must be an integer'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isPremium')
    .optional()
    .isBoolean()
    .withMessage('isPremium must be a boolean'),
  
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions must be a non-empty array'),
  
  body('questions.*.questionId')
    .isUUID()
    .withMessage('Invalid question ID'),
  
  body('questions.*.questionNumber')
    .isInt({ min: 1 })
    .withMessage('Question number must be a positive integer'),
  
  body('questions.*.marks')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Marks must be a non-negative integer'),
];

export const updateTestValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid test ID'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must be at most 200 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Invalid slug format')
    .isLength({ max: 200 })
    .withMessage('Slug must be at most 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),
  
  body('instructions')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Instructions must be at most 5000 characters'),
  
  body('testType')
    .optional()
    .isIn(['chapter_test', 'unit_test', 'subject_test', 'full_test', 'custom_test', 'pyq_test'])
    .withMessage('Invalid test type'),
  
  body('examType')
    .optional()
    .isIn(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'])
    .withMessage('Invalid exam type'),
  
  body('subjectId')
    .optional()
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  body('totalQuestions')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Total questions must be between 1 and 200'),
  
  body('totalMarks')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total marks must be at least 1'),
  
  body('durationMinutes')
    .optional()
    .isInt({ min: 1, max: 360 })
    .withMessage('Duration must be between 1 and 360 minutes'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isPremium')
    .optional()
    .isBoolean()
    .withMessage('isPremium must be a boolean'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const getTestsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('testType')
    .optional()
    .isIn(['chapter_test', 'unit_test', 'subject_test', 'full_test', 'custom_test', 'pyq_test'])
    .withMessage('Invalid test type'),
  
  query('examType')
    .optional()
    .isIn(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'])
    .withMessage('Invalid exam type'),
  
  query('subjectId')
    .optional()
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  query('isPublic')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isPublic must be true or false'),
  
  query('isPremium')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isPremium must be true or false'),
  
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be at most 100 characters'),
];

export const getTestByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid test ID'),
];

export const startAttemptValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid test ID'),
];

export const submitAnswerValidation = [
  param('attemptId')
    .isUUID()
    .withMessage('Invalid attempt ID'),
  
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isUUID()
    .withMessage('Invalid question ID'),
  
  body('selectedOptions')
    .isArray()
    .withMessage('Selected options must be an array'),
  
  body('selectedOptions.*')
    .isIn(['A', 'B', 'C', 'D', 'E', 'F'])
    .withMessage('Invalid option label'),
  
  body('numericalAnswer')
    .optional()
    .isFloat()
    .withMessage('Numerical answer must be a number'),
  
  body('timeSpentSeconds')
    .notEmpty()
    .withMessage('Time spent is required')
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),
  
  body('markedForReview')
    .optional()
    .isBoolean()
    .withMessage('markedForReview must be a boolean'),
];

export const finishAttemptValidation = [
  param('attemptId')
    .isUUID()
    .withMessage('Invalid attempt ID'),
];

export const getAttemptResultsValidation = [
  param('attemptId')
    .isUUID()
    .withMessage('Invalid attempt ID'),
];

export const deleteTestValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid test ID'),
];

export interface CreateTestInput {
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  testType: string;
  examType: string;
  subjectId?: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  markingScheme?: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  isPublic?: boolean;
  isPremium?: boolean;
  questions: Array<{
    questionId: string;
    questionNumber: number;
    marks?: number;
  }>;
}

export interface UpdateTestInput {
  title?: string;
  slug?: string;
  description?: string;
  instructions?: string;
  testType?: string;
  examType?: string;
  subjectId?: string;
  totalQuestions?: number;
  totalMarks?: number;
  durationMinutes?: number;
  isPublic?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
}

export interface TestQueryInput {
  page?: number;
  limit?: number;
  testType?: string;
  examType?: string;
  subjectId?: string;
  isPublic?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface SubmitAnswerInput {
  questionId: string;
  selectedOptions: string[];
  numericalAnswer?: number;
  timeSpentSeconds: number;
  markedForReview?: boolean;
}