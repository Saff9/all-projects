import { body, query, param } from 'express-validator';

export const createQuestionValidation = [
  body('chapterId')
    .notEmpty()
    .withMessage('Chapter ID is required')
    .isUUID()
    .withMessage('Invalid chapter ID'),
  
  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  body('topicId')
    .optional()
    .isUUID()
    .withMessage('Invalid topic ID'),
  
  body('questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ max: 5000 })
    .withMessage('Question text must be at most 5000 characters'),
  
  body('questionType')
    .optional()
    .isIn(['mcq', 'multiple_correct', 'numerical', 'assertion_reason', 'matrix_match'])
    .withMessage('Invalid question type'),
  
  body('questionImageUrl')
    .optional()
    .isURL()
    .withMessage('Question image URL must be a valid URL'),
  
  body('difficultyLevel')
    .notEmpty()
    .withMessage('Difficulty level is required')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  body('bloomTaxonomy')
    .optional()
    .isIn(['knowledge', 'understanding', 'application', 'analysis', 'synthesis', 'evaluation'])
    .withMessage('Invalid Bloom taxonomy level'),
  
  body('sourceType')
    .optional()
    .isIn(['pyq', 'ncert', 'exemplar', 'custom'])
    .withMessage('Invalid source type'),
  
  body('sourceExam')
    .optional()
    .isIn(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'])
    .withMessage('Invalid source exam'),
  
  body('sourceYear')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid source year'),
  
  body('sourceSession')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source session must be at most 50 characters'),
  
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
  
  body('solutionText')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Solution text must be at most 10000 characters'),
  
  body('solutionImageUrl')
    .optional()
    .isURL()
    .withMessage('Solution image URL must be a valid URL'),
  
  body('hint')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Hint must be at most 500 characters'),
  
  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2-6 options'),
  
  body('options.*.optionLabel')
    .isIn(['A', 'B', 'C', 'D', 'E', 'F'])
    .withMessage('Option label must be A, B, C, D, E, or F'),
  
  body('options.*.optionText')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Option text must be at most 2000 characters'),
  
  body('options.*.optionImageUrl')
    .optional()
    .isURL()
    .withMessage('Option image URL must be a valid URL'),
  
  body('options.*.isCorrect')
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  
  body('options.*.explanation')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Option explanation must be at most 1000 characters'),
];

export const updateQuestionValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid question ID'),
  
  body('topicId')
    .optional()
    .isUUID()
    .withMessage('Invalid topic ID'),
  
  body('questionText')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question text cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Question text must be at most 5000 characters'),
  
  body('questionType')
    .optional()
    .isIn(['mcq', 'multiple_correct', 'numerical', 'assertion_reason', 'matrix_match'])
    .withMessage('Invalid question type'),
  
  body('questionImageUrl')
    .optional()
    .isURL()
    .withMessage('Question image URL must be a valid URL'),
  
  body('difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  body('bloomTaxonomy')
    .optional()
    .isIn(['knowledge', 'understanding', 'application', 'analysis', 'synthesis', 'evaluation'])
    .withMessage('Invalid Bloom taxonomy level'),
  
  body('sourceType')
    .optional()
    .isIn(['pyq', 'ncert', 'exemplar', 'custom'])
    .withMessage('Invalid source type'),
  
  body('sourceExam')
    .optional()
    .isIn(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'])
    .withMessage('Invalid source exam'),
  
  body('sourceYear')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid source year'),
  
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
  
  body('solutionText')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Solution text must be at most 10000 characters'),
  
  body('solutionImageUrl')
    .optional()
    .isURL()
    .withMessage('Solution image URL must be a valid URL'),
  
  body('hint')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Hint must be at most 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
];

export const getQuestionsValidation = [
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
  
  query('chapterId')
    .optional()
    .isUUID()
    .withMessage('Invalid chapter ID'),
  
  query('topicId')
    .optional()
    .isUUID()
    .withMessage('Invalid topic ID'),
  
  query('difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  
  query('questionType')
    .optional()
    .isIn(['mcq', 'multiple_correct', 'numerical', 'assertion_reason', 'matrix_match'])
    .withMessage('Invalid question type'),
  
  query('sourceType')
    .optional()
    .isIn(['pyq', 'ncert', 'exemplar', 'custom'])
    .withMessage('Invalid source type'),
  
  query('sourceExam')
    .optional()
    .isIn(['NEET', 'JEE_MAIN', 'JEE_ADVANCED'])
    .withMessage('Invalid source exam'),
  
  query('sourceYear')
    .optional()
    .isInt({ min: 2000 })
    .withMessage('Invalid source year'),
  
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
  
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  
  query('isVerified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isVerified must be true or false'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query must be at most 200 characters'),
];

export const getQuestionByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid question ID'),
];

export const deleteQuestionValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid question ID'),
];

export interface QuestionOptionInput {
  optionLabel: string;
  optionText?: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
  displayOrder?: number;
}

export interface CreateQuestionInput {
  topicId?: string;
  chapterId: string;
  subjectId: string;
  questionText: string;
  questionType?: string;
  questionImageUrl?: string;
  difficultyLevel: string;
  bloomTaxonomy?: string;
  sourceType?: string;
  sourceExam?: string;
  sourceYear?: number;
  sourceSession?: string;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  options: QuestionOptionInput[];
}

export interface UpdateQuestionInput {
  topicId?: string;
  questionText?: string;
  questionType?: string;
  questionImageUrl?: string;
  difficultyLevel?: string;
  bloomTaxonomy?: string;
  sourceType?: string;
  sourceExam?: string;
  sourceYear?: number;
  sourceSession?: string;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface QuestionQueryInput {
  page?: number;
  limit?: number;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficultyLevel?: string;
  questionType?: string;
  sourceType?: string;
  sourceExam?: string;
  sourceYear?: number;
  forNeet?: boolean;
  forJeeMain?: boolean;
  forJeeAdvanced?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}