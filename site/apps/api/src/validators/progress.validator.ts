import { body, query, param } from 'express-validator';

export const updateProgressValidation = [
  param('chapterId')
    .isUUID()
    .withMessage('Invalid chapter ID'),
  
  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed', 'revision'])
    .withMessage('Invalid status'),
  
  body('completionPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Completion percentage must be between 0 and 100'),
  
  body('totalQuestions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total questions must be a non-negative integer'),
  
  body('questionsAttempted')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Questions attempted must be a non-negative integer'),
  
  body('questionsCorrect')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Questions correct must be a non-negative integer'),
  
  body('questionsIncorrect')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Questions incorrect must be a non-negative integer'),
  
  body('questionsSkipped')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Questions skipped must be a non-negative integer'),
  
  body('totalTimeSpentSeconds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total time spent must be a non-negative integer'),
  
  body('averageTimePerQuestion')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Average time per question must be a non-negative integer'),
];

export const getProgressValidation = [
  param('chapterId')
    .isUUID()
    .withMessage('Invalid chapter ID'),
];

export const getUserProgressValidation = [
  query('subjectId')
    .optional()
    .isUUID()
    .withMessage('Invalid subject ID'),
  
  query('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed', 'revision'])
    .withMessage('Invalid status'),
  
  query('isWeakChapter')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isWeakChapter must be true or false'),
];

export const getWeakChaptersValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

export const logActivityValidation = [
  body('totalTimeSeconds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total time must be a non-negative integer'),
  
  body('questionsSolved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Questions solved must be a non-negative integer'),
  
  body('questionsCorrect')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Questions correct must be a non-negative integer'),
  
  body('testsTaken')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tests taken must be a non-negative integer'),
  
  body('chaptersStudied')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Chapters studied must be a non-negative integer'),
  
  body('mistakesReviewed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mistakes reviewed must be a non-negative integer'),
  
  body('pomodoroSessions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Pomodoro sessions must be a non-negative integer'),
  
  body('pomodoroMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Pomodoro minutes must be a non-negative integer'),
];

export const getDailyActivityValidation = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const scheduleRevisionValidation = [
  param('chapterId')
    .isUUID()
    .withMessage('Invalid chapter ID'),
  
  body('daysFromNow')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days from now must be between 1 and 365'),
];

export interface UpdateProgressInput {
  status?: string;
  completionPercentage?: number;
  totalQuestions?: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  questionsIncorrect?: number;
  questionsSkipped?: number;
  totalTimeSpentSeconds?: bigint;
  averageTimePerQuestion?: number;
}

export interface ProgressQueryInput {
  subjectId?: string;
  status?: string;
  isWeakChapter?: boolean;
}

export interface LogActivityInput {
  totalTimeSeconds?: bigint;
  questionsSolved?: number;
  questionsCorrect?: number;
  testsTaken?: number;
  chaptersStudied?: number;
  mistakesReviewed?: number;
  pomodoroSessions?: number;
  pomodoroMinutes?: number;
}

export interface DailyActivityQueryInput {
  startDate: Date;
  endDate: Date;
}