// ============================================
// User Types
// ============================================

export type UserRole = 'guest' | 'student' | 'premium' | 'admin';
export type TargetExam = 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED' | 'BOTH';
export type SubscriptionStatus = 'free' | 'premium' | 'expired';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  targetExam?: TargetExam;
  targetYear?: number;
  schoolName?: string;
  city?: string;
  state?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Subject & Chapter Types
// ============================================

export interface Subject {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  colorCode?: string;
  description?: string;
  displayOrder: number;
  forNeet: boolean;
  forJeeMain: boolean;
  forJeeAdvanced: boolean;
  isActive: boolean;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  unitName?: string;
  unitNumber?: number;
  chapterNumber?: number;
  neetWeightage?: number;
  jeeMainWeightage?: number;
  jeeAdvancedWeightage?: number;
  totalTopics: number;
  totalQuestions: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  subject?: Subject;
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  slug: string;
  description?: string;
  topicNumber?: number;
  keyConcepts?: string[];
  importantFormulas?: string[];
  estimatedMinutes?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  isActive: boolean;
}

// ============================================
// Question Types
// ============================================

export type QuestionType = 'mcq' | 'multiple_correct' | 'numerical' | 'assertion_reason' | 'matrix_match';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SourceType = 'pyq' | 'ncert' | 'exemplar' | 'custom';

export interface QuestionOption {
  id: string;
  questionId: string;
  optionLabel: string;
  optionText?: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
  displayOrder: number;
}

export interface Question {
  id: string;
  topicId?: string;
  chapterId: string;
  subjectId: string;
  questionText: string;
  questionType: QuestionType;
  questionImageUrl?: string;
  difficultyLevel: DifficultyLevel;
  sourceType?: SourceType;
  sourceExam?: string;
  sourceYear?: number;
  forNeet: boolean;
  forJeeMain: boolean;
  forJeeAdvanced: boolean;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  timesAttempted: number;
  timesCorrect: number;
  isActive: boolean;
  options?: QuestionOption[];
  chapter?: Chapter;
}

// ============================================
// Test Types
// ============================================

export type TestType = 'chapter_test' | 'unit_test' | 'subject_test' | 'full_test' | 'custom_test' | 'pyq_test';
export type ExamType = 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
export type TestAttemptStatus = 'in_progress' | 'submitted' | 'abandoned' | 'timeout';

export interface Test {
  id: string;
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  testType: TestType;
  examType: ExamType;
  subjectId?: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  isPublic: boolean;
  isPremium: boolean;
  isActive: boolean;
  attemptsCount: number;
  averageScore?: number;
  highestScore?: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  timeTakenSeconds?: number;
  status: TestAttemptStatus;
  totalQuestions?: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  marksObtained?: number;
  totalMarks?: number;
  percentage?: number;
  rank?: number;
  totalParticipants?: number;
  percentile?: number;
}

// ============================================
// Progress Types
// ============================================

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'revision';

export interface UserProgress {
  id: string;
  userId: string;
  chapterId: string;
  status: ProgressStatus;
  completionPercentage: number;
  totalQuestions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  questionsSkipped: number;
  totalTimeSpentSeconds: number;
  accuracyPercentage?: number;
  isWeakChapter: boolean;
  revisionCount: number;
  lastAccessedAt?: string;
  chapter?: Chapter;
}

export interface StudyStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  weeklyGoalMinutes: number;
  weeklyMinutesLogged: number;
}

// ============================================
// Mistake Types
// ============================================

export type MistakeType = 'conceptual' | 'calculation' | 'silly' | 'time_pressure' | 'misinterpretation' | 'other';
export type Severity = 'minor' | 'moderate' | 'major';

export interface Mistake {
  id: string;
  userId: string;
  questionId: string;
  sourceType?: 'test' | 'pyq_practice' | 'manual_entry';
  userAnswer: string[];
  correctAnswer: string[];
  userNotes?: string;
  mistakeReason?: string;
  mistakeType?: MistakeType;
  severity?: Severity;
  revisionCount: number;
  isMastered: boolean;
  nextRevisionDate?: string;
  question?: Question;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  targetExam?: TargetExam;
  targetYear?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
