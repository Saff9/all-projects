// Type Definitions for Typing Test Application

import type { DifficultyLevel, TestMode } from './constants';

export interface CharacterResult {
  character: string;
  expected: string;
  isCorrect: boolean;
  typedAt: number;
  timeToType: number;
}

export interface WordResult {
  word: string;
  expected: string;
  isCorrect: boolean;
  characters: CharacterResult[];
  startTime: number;
  endTime: number;
  wpm: number;
}

export interface TestResult {
  id: string;
  mode: TestMode;
  difficulty: DifficultyLevel;
  text: string;
  typedText: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  charactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  wordsTyped: number;
  correctWords: number;
  errors: number;
  startTime: number;
  endTime: number;
  duration: number;
  characterResults: CharacterResult[];
  wordResults: WordResult[];
  consistency: number;
  averageTimePerChar: number;
}

export interface BestScore {
  wpm: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  mode: TestMode;
  date: string;
}

export interface BestScoresMap {
  [key: string]: BestScore;
}

export interface TestHistoryEntry {
  id: string;
  wpm: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  mode: TestMode;
  date: string;
  duration: number;
}

export interface DailyStats {
  date: string;
  testsCompleted: number;
  totalWpm: number;
  totalAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  totalTimeSpent: number;
}

export interface UserStats {
  totalTests: number;
  totalWordsTyped: number;
  totalTimeSpent: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastTestDate: string;
  dailyStats: DailyStats[];
  weeklyProgress: { week: string; averageWpm: number; testsCompleted: number }[];
  monthlyProgress: { month: string; averageWpm: number; testsCompleted: number }[];
}

export interface TypingSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  smoothCaret: boolean;
  showLiveWpm: boolean;
  showTimer: boolean;
  autoAdvance: boolean;
  blindMode: boolean;
  quickRestart: 'off' | 'tab' | 'enter' | 'esc';
  punctuationMode: boolean;
  numbersMode: boolean;
}

export interface TestConfig {
  mode: TestMode;
  difficulty: DifficultyLevel;
  timeLimit?: number;
  wordCount?: number;
  quote?: string;
  customText?: string;
  live?: boolean;
  includePunctuation?: boolean;
  includeNumbers?: boolean;
}

export interface TypingState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  config: TestConfig;
  targetText: string;
  typedText: string;
  currentIndex: number;
  characterResults: CharacterResult[];
  wordResults: WordResult[];
  startTime: number | null;
  elapsedTime: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  currentWpm: number;
  rawWpm: number;
  accuracy: number;
  lastKeyTime: number;
  keyPressTimes: number[];
}

export interface CaretPosition {
  line: number;
  column: number;
  offset: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: UserStats, result: TestResult) => boolean;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wpm: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  mode: TestMode;
  date: string;
  isCurrentUser: boolean;
}