// Typing Test Constants and Configuration

export const DIFFICULTY_LEVELS = {
  easy: {
    label: 'Easy',
    description: 'Common words, no punctuation',
    wordCount: 25,
    timeLimit: 60,
    color: 'emerald',
  },
  medium: {
    label: 'Medium',
    description: 'Mixed vocabulary with punctuation',
    wordCount: 50,
    timeLimit: 120,
    color: 'amber',
  },
  hard: {
    label: 'Hard',
    description: 'Complex words and special characters',
    wordCount: 100,
    timeLimit: 180,
    color: 'rose',
  },
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS;

export const TEST_MODES = {
  time: {
    label: 'Time Trial',
    description: 'Type as much as you can in the time limit',
    durations: [15, 30, 60, 120],
  },
  words: {
    label: 'Word Count',
    description: 'Type a specific number of words',
    counts: [10, 25, 50, 100],
  },
  quote: {
    label: 'Quote',
    description: 'Type famous quotes accurately',
  },
  custom: {
    label: 'Custom',
    description: 'Configure your own test parameters',
  },
} as const;

export type TestMode = keyof typeof TEST_MODES;

export const WORD_LISTS = {
  easy: [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  ],
  medium: [
    'algorithm', 'binary', 'compile', 'debug', 'execute', 'function', 'variable', 'syntax',
  ],
  hard: [
    'quintessential', 'juxtaposition', 'phenomenon', 'sycophant', 'ubiquitous', 'ephemeral',
  ],
} as const;

export const SPECIAL_CHARS = ['.', ',', '!', '?', ';', ':', '-', '"', "'"];

export const PUNCTUATION_PATTERNS = [
  '{word}.',
  '{word},',
  '{word}!',
  '{word}?',
  '({word})',
  '{word};',
  '{word}:',
];

export const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Innovation distinguishes between a leader and a follower.",
];

export const STORAGE_KEYS = {
  bestScores: 'typing_best_scores',
  testHistory: 'typing_test_history',
  settings: 'typing_settings',
  stats: 'typing_stats',
};

export const MAX_HISTORY_ITEMS = 100;
export const WPM_CALCULATION_WINDOW = 60;

