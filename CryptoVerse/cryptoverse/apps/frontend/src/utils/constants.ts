/**
 * Frontend-specific constants
 */

// ==========================================
// API Configuration
// ==========================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const;

// ==========================================
// App Configuration
// ==========================================

export const APP_CONFIG = {
  NAME: 'CryptoVerse',
  VERSION: '1.0.0',
  BOT_USERNAME: 'cryptoverse_bot',
  SUPPORT_URL: 'https://t.me/cryptoverse_support',
  CHANNEL_URL: 'https://t.me/cryptoverse_channel',
} as const;

// ==========================================
// Game Constants
// ==========================================

export const GAME_CONFIG = {
  // Energy
  INITIAL_ENERGY: 1000,
  MAX_ENERGY: 5000,
  ENERGY_REGEN_RATE: 1, // per second
  ENERGY_REGEN_INTERVAL: 1000, // ms
  TAP_ENERGY_COST: 1,

  // Mining
  BASE_TAP_REWARD: 1,
  CRITICAL_HIT_CHANCE: 0.05, // 5%
  CRITICAL_HIT_MULTIPLIER: 2,
  COMBO_TIMEOUT: 2000, // ms
  MAX_COMBO_MULTIPLIER: 5,

  // Level
  BASE_XP: 100,
  XP_MULTIPLIER: 1.5,

  // Boosts
  ENERGY_BOOST_DURATION: 60 * 60 * 1000, // 1 hour in ms
  TAP_BOOST_DURATION: 30 * 60 * 1000, // 30 minutes in ms
  AUTO_MINING_DURATION: 4 * 60 * 60 * 1000, // 4 hours in ms
} as const;

// ==========================================
// Character Constants
// ==========================================

export const CHARACTER_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

export const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF', // gray
  rare: '#3B82F6', // blue
  epic: '#A855F7', // purple
  legendary: '#F59E0B', // gold
};

export const RARITY_MULTIPLIERS: Record<string, number> = {
  common: 1,
  rare: 1.5,
  epic: 2,
  legendary: 3,
};

export const MAX_CHARACTER_LEVEL = 50;

// ==========================================
// Achievement Constants
// ==========================================

export const ACHIEVEMENT_TYPES = {
  TAPS: 'taps',
  LEVEL: 'level',
  CHARACTERS: 'characters',
  REFERRALS: 'referrals',
  STREAK: 'streak',
  SPECIAL: 'special',
} as const;

export const ACHIEVEMENT_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export const ACHIEVEMENT_TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

// ==========================================
// Quest Constants
// ==========================================

export const QUEST_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIAL: 'special',
  ACHIEVEMENT: 'achievement',
} as const;

export const QUEST_STATUS = {
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CLAIMED: 'claimed',
} as const;

export const DAILY_QUEST_RESET_HOUR = 0; // Midnight UTC

// ==========================================
// Leaderboard Constants
// ==========================================

export const LEADERBOARD_TYPES = {
  GLOBAL: 'global',
  FRIENDS: 'friends',
  COUNTRY: 'country',
} as const;

export const LEADERBOARD_TIMEFRAMES = {
  ALL_TIME: 'all_time',
  WEEKLY: 'weekly',
  DAILY: 'daily',
} as const;

export const LEADERBOARD_PAGE_SIZE = 50;

// ==========================================
// Wallet Constants
// ==========================================

export const TOKEN_SYMBOL = 'CVT';
export const TOKEN_NAME = 'CryptoVerse Token';

export const TRANSACTION_TYPES = {
  EARN: 'earn',
  SPEND: 'spend',
  TRANSFER: 'transfer',
  REWARD: 'reward',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// ==========================================
// Animation Constants
// ==========================================

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

export const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
} as const;

// ==========================================
// UI Constants
// ==========================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  POPOVER: 60,
  TOOLTIP: 70,
  TOAST: 80,
  OVERLAY: 90,
  MAX: 9999,
} as const;

// ==========================================
// Theme Colors
// ==========================================

export const COLORS = {
  // Primary
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  // Accent
  accent: {
    blue: '#3B82F6',
    gold: '#F59E0B',
    green: '#10B981',
    red: '#EF4444',
    pink: '#EC4899',
  },
  // Background
  background: {
    primary: '#0F172A', // slate-900
    secondary: '#1E293B', // slate-800
    tertiary: '#334155', // slate-700
  },
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8', // slate-400
    muted: '#64748B', // slate-500
  },
} as const;

// ==========================================
// Sound Effects
// ==========================================

export const SOUNDS = {
  TAP: 'tap',
  COIN: 'coin',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT: 'achievement',
  SUCCESS: 'success',
  ERROR: 'error',
  NOTIFICATION: 'notification',
} as const;

// ==========================================
// Routes
// ==========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  WALLET: '/wallet',
  CHARACTERS: '/characters',
  ACHIEVEMENTS: '/achievements',
  QUESTS: '/quests',
  LEADERBOARD: '/leaderboard',
  AIRDROPS: '/airdrops',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FRIENDS: '/friends',
} as const;

// ==========================================
// Cache TTL (Time to Live)
// ==========================================

export const CACHE_TTL = {
  USER: 5 * 60 * 1000, // 5 minutes
  STATS: 1 * 60 * 1000, // 1 minute
  CHARACTERS: 10 * 60 * 1000, // 10 minutes
  ACHIEVEMENTS: 30 * 60 * 1000, // 30 minutes
  QUESTS: 5 * 60 * 1000, // 5 minutes
  LEADERBOARD: 1 * 60 * 1000, // 1 minute
  AIRDROPS: 60 * 60 * 1000, // 1 hour
} as const;

// ==========================================
// Error Messages
// ==========================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  INSUFFICIENT_ENERGY: 'Not enough energy. Please wait for regeneration.',
  INSUFFICIENT_BALANCE: 'Insufficient balance.',
  CHARACTER_LOCKED: 'This character is locked.',
  QUEST_NOT_AVAILABLE: 'This quest is no longer available.',
} as const;

// ==========================================
// Success Messages
// ==========================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REWARD_CLAIMED: 'Reward claimed successfully!',
  CHARACTER_UNLOCKED: 'Character unlocked!',
  CHARACTER_UPGRADED: 'Character upgraded!',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  QUEST_COMPLETED: 'Quest completed!',
  TRANSFER_SUCCESS: 'Transfer successful!',
  SETTINGS_SAVED: 'Settings saved!',
} as const;

// ==========================================
// Regex Patterns
// ==========================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  WALLET_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
} as const;

// ==========================================
// Social Links
// ==========================================

export const SOCIAL_LINKS = {
  TELEGRAM: 'https://t.me/cryptoverse',
  TWITTER: 'https://twitter.com/cryptoverse',
  DISCORD: 'https://discord.gg/cryptoverse',
  WEBSITE: 'https://cryptoverse.io',
} as const;

export default {
  API_CONFIG,
  APP_CONFIG,
  GAME_CONFIG,
  CHARACTER_RARITIES,
  RARITY_COLORS,
  RARITY_MULTIPLIERS,
  MAX_CHARACTER_LEVEL,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TIERS,
  ACHIEVEMENT_TIER_COLORS,
  QUEST_TYPES,
  QUEST_STATUS,
  DAILY_QUEST_RESET_HOUR,
  LEADERBOARD_TYPES,
  LEADERBOARD_TIMEFRAMES,
  LEADERBOARD_PAGE_SIZE,
  TOKEN_SYMBOL,
  TOKEN_NAME,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  ANIMATION_DURATION,
  SPRING_CONFIG,
  BREAKPOINTS,
  Z_INDEX,
  COLORS,
  SOUNDS,
  ROUTES,
  CACHE_TTL,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PATTERNS,
  SOCIAL_LINKS,
};