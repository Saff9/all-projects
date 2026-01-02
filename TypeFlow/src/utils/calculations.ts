/**
 * Calculates words per minute (WPM) based on characters typed and time elapsed.
 * WPM = (characters / 5) / minutes
 * Standard word length is considered 5 characters.
 *
 * @param charsTyped - Number of characters typed
 * @param timeElapsed - Time elapsed in seconds
 * @returns Words per minute rounded to 2 decimal places
 */
export function calculateWPM(charsTyped: number, timeElapsed: number): number {
  if (timeElapsed === 0 || charsTyped === 0) {
    return 0;
  }

  const minutes = timeElapsed / 60;
  const words = charsTyped / 5; // Standard word = 5 characters
  const wpm = words / minutes;

  return Math.round(wpm * 100) / 100;
}

/**
 * Calculates accuracy percentage based on correct and total attempts.
 *
 * @param correct - Number of correct keystrokes
 * @param total - Total number of keystrokes
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  const accuracy = (correct / total) * 100;
  return Math.round(accuracy * 100) / 100;
}

/**
 * Formats seconds into a human-readable time string.
 *
 * @param seconds - Time in seconds
 * @returns Formatted string (MM:SS or HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) {
    seconds = 0;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates time taken to type a text based on start and end timestamps.
 *
 * @param startTime - Game start timestamp (milliseconds)
 * @param endTime - Game end timestamp (milliseconds)
 * @returns Time elapsed in seconds
 */
export function calculateTimeElapsed(startTime: number, endTime: number): number {
  return Math.round((endTime - startTime) / 1000);
}

/**
 * Generates a unique identifier.
 *
 * @returns Unique string ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
