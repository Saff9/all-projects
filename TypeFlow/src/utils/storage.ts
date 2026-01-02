import { UserProgress, GameStats, Difficulty, GameMode } from '../types';
import { generateId } from './calculations';

/**
 * Storage namespace prefix for the typing game.
 */
const STORAGE_PREFIX = 'typeracer_pro_';

/**
 * Keys used in localStorage.
 */
const STORAGE_KEYS = {
  USER_ID: `${STORAGE_PREFIX}userId`,
  USER_PROGRESS: `${STORAGE_PREFIX}progress`,
  GAME_STATS: `${STORAGE_PREFIX}stats`
} as const;

/**
 * Retrieves or creates a unique user ID from localStorage.
 *
 * @returns User ID string
 */
export function getUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  if (!userId) {
    userId = generateId();
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  return userId;
}

/**
 * Retrieves the user's progress data from localStorage.
 * If no data exists, returns a default UserProgress object.
 *
 * @returns UserProgress object
 */
export function getUserProgress(): UserProgress {
  const userId = getUserId();
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);

  if (!stored) {
    return createDefaultProgress(userId);
  }

  try {
    const data = JSON.parse(stored) as UserProgress;

    // Validate required fields and provide defaults if missing
    return {
      userId: data.userId || userId,
      totalGames: data.totalGames ?? 0,
      totalTimePlayed: data.totalTimePlayed ?? 0,
      bestWPM: data.bestWPM ?? 0,
      bestAccuracy: data.bestAccuracy ?? 0,
      gamesByDifficulty: data.gamesByDifficulty ?? {
        easy: 0,
        medium: 0,
        hard: 0,
        expert: 0
      },
      gamesByMode: data.gamesByMode ?? {
        time: 0,
        words: 0,
        infinite: 0
      },
      recentGames: data.recentGames ?? [],
      totalCharsTyped: data.totalCharsTyped ?? 0,
      totalCorrectChars: data.totalCorrectChars ?? 0,
      firstPlayDate: data.firstPlayDate ?? Date.now(),
      lastPlayDate: data.lastPlayDate ?? Date.now(),
      completedTexts: data.completedTexts ?? []
    };
  } catch (error) {
    console.error('Failed to parse user progress:', error);
    return createDefaultProgress(userId);
  }
}

/**
 * Saves the user's progress data to localStorage.
 *
 * @param progress - UserProgress object to save
 */
export function saveUserProgress(progress: UserProgress): void {
  try {
    const serialized = JSON.stringify(progress);
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, serialized);
  } catch (error) {
    console.error('Failed to save user progress:', error);
  }
}

/**
 * Saves a game session stats and updates user progress.
 *
 * @param stats - GameStats from completed game
 * @returns Updated UserProgress
 */
export function saveGameStats(stats: GameStats): UserProgress {
  const progress = getUserProgress();

  // Update progress stats
  progress.totalGames += 1;
  progress.totalTimePlayed += stats.timeElapsed;
  progress.gamesByDifficulty[stats.difficulty] += 1;
  progress.gamesByMode[stats.mode] += 1;
  progress.totalCharsTyped += stats.totalChars;
  progress.totalCorrectChars += stats.correctChars;
  progress.lastPlayDate = Date.now();

  // Update best records
  if (stats.wpm > progress.bestWPM) {
    progress.bestWPM = stats.wpm;
  }

  if (stats.accuracy > progress.bestAccuracy) {
    progress.bestAccuracy = stats.accuracy;
  }

  // Add to recent games (keep last 50)
  progress.recentGames.unshift(stats);
  if (progress.recentGames.length > 50) {
    progress.recentGames = progress.recentGames.slice(0, 50);
  }

  // Mark text as completed
  if (!progress.completedTexts.includes(stats.textId)) {
    progress.completedTexts.push(stats.textId);
  }

  saveUserProgress(progress);
  return progress;
}

/**
 * Clears all user data from localStorage.
 * This includes progress, stats, and user ID.
 */
export function clearUserData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Creates a default UserProgress object for a new user.
 *
 * @param userId - User ID
 * @returns Default UserProgress
 */
function createDefaultProgress(userId: string): UserProgress {
  return {
    userId,
    totalGames: 0,
    totalTimePlayed: 0,
    bestWPM: 0,
    bestAccuracy: 0,
    gamesByDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    },
    gamesByMode: {
      time: 0,
      words: 0,
      infinite: 0
    },
    recentGames: [],
    totalCharsTyped: 0,
    totalCorrectChars: 0,
    firstPlayDate: Date.now(),
    lastPlayDate: Date.now(),
    completedTexts: []
  };
}

/**
 * Exports user data as JSON string.
 * Useful for backup/restore functionality.
 *
 * @returns JSON string of user progress
 */
export function exportUserData(): string {
  const progress = getUserProgress();
  return JSON.stringify(progress, null, 2);
}

/**
 * Imports user data from JSON string.
 *
 * @param jsonString - JSON string containing user progress
 * @returns True if import successful, false otherwise
 */
export function importUserData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as UserProgress;
    saveUserProgress(data);
    return true;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}
