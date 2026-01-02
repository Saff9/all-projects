/**
 * Represents the difficulty levels of the typing game.
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Represents the game modes available.
 */
export type GameMode = 'time' | 'words' | 'infinite';

/**
 * Represents a single text entry with its associated metadata.
 */
export interface TextEntry {
  /**
   * Unique identifier for the text entry.
   */
  id: string;

  /**
   * The actual text content to type.
   */
  content: string;

  /**
   * Difficulty level of this text.
   */
  difficulty: Difficulty;

  /**
   * Category of the text (quotes, code, technical, prose).
   */
  category: string;

  /**
   * Estimated time to type in seconds.
   */
  estimatedTime: number;

  /**
   * Word count of the text.
   */
  wordCount: number;

  /**
   * Character count including spaces.
   */
  charCount: number;
}

/**
 * Represents the current state of the game.
 */
export interface GameState {
  /**
   * Current difficulty setting.
   */
  difficulty: Difficulty;

  /**
   * Current game mode.
   */
  mode: GameMode;

  /**
   * Currently selected text entry.
   */
  currentText: TextEntry | null;

  /**
   * Whether the game is currently active.
   */
  isPlaying: boolean;

  /**
   * Current progress - characters typed.
   */
  typedCharacters: number;

  /**
   * Current progress - words completed.
   */
  typedWords: number;

  /**
   * Number of correct keystrokes.
   */
  correctKeystrokes: number;

  /**
   * Number of incorrect keystrokes.
   */
  incorrectKeystrokes: number;

  /**
   * Game start timestamp.
   */
  startTime: number | null;

  /**
   * Game end timestamp.
   */
  endTime: number | null;

  /**
   * Current typed text buffer.
   */
  currentInput: string;

  /**
   * Index of current character position.
   */
  currentIndex: number;
}

/**
 * Represents statistics for a single game session.
 */
export interface GameStats {
  /**
   * Words per minute achieved.
   */
  wpm: number;

  /**
   * Accuracy percentage (0-100).
   */
  accuracy: number;

  /**
   * Total characters in the text.
   */
  totalChars: number;

  /**
   * Correctly typed characters.
   */
  correctChars: number;

  /**
   * Incorrect characters.
   */
  incorrectChars: number;

  /**
   * Time taken in seconds.
   */
  timeElapsed: number;

  /**
   * Timestamp when game ended.
   */
  completedAt: number;

  /**
   * Difficulty used.
   */
  difficulty: Difficulty;

  /**
   * Game mode used.
   */
  mode: GameMode;

  /**
   * Text ID that was typed.
   */
  textId: string;
}

/**
 * Represents user's overall progress and achievements.
 */
export interface UserProgress {
  /**
   * Unique user identifier (from localStorage).
   */
  userId: string;

  /**
   * Total games played.
   */
  totalGames: number;

  /**
   * Total time spent playing in seconds.
   */
  totalTimePlayed: number;

  /**
   * Best WPM achieved.
   */
  bestWPM: number;

  /**
   * Best accuracy achieved.
   */
  bestAccuracy: number;

  /**
   * Games completed per difficulty.
   */
  gamesByDifficulty: Record<Difficulty, number>;

  /**
   * Games completed per game mode.
   */
  gamesByMode: Record<GameMode, number>;

  /**
   * Historical game stats.
   */
  recentGames: GameStats[];

  /**
   * Total characters typed.
   */
  totalCharsTyped: number;

  /**
   * Total correct characters.
   */
  totalCorrectChars: number;

  /**
   * Date of first play.
   */
  firstPlayDate: number;

  /**
   * Date of last play.
   */
  lastPlayDate: number;

  /**
   * Text IDs that have been completed.
   */
  completedTexts: string[];
}
