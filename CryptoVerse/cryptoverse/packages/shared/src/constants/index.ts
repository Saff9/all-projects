// ==========================================
// Game Constants
// ==========================================

// Mining Configuration
export const MINING_CONFIG = {
  BASE_MINING_RATE: 1, // coins per tap
  PASSIVE_MINING_RATE: 0.1, // coins per second
  MAX_ENERGY: 1000,
  ENERGY_REGEN_RATE: 1, // energy per second
  TAP_ENERGY_COST: 1,
  CRITICAL_CHANCE: 0.05, // 5% chance for critical hit
  CRITICAL_MULTIPLIER: 2,
} as const;

// Character Rarity Multipliers
export const RARITY_MULTIPLIERS = {
  common: 1,
  uncommon: 1.25,
  rare: 1.5,
  epic: 2,
  legendary: 3,
} as const;

// Character Drop Rates
export const CHARACTER_DROP_RATES = {
  common: 0.6, // 60%
  uncommon: 0.25, // 25%
  rare: 0.1, // 10%
  epic: 0.04, // 4%
  legendary: 0.01, // 1%
} as const;

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  MINING: 'mining',
  SOCIAL: 'social',
  COLLECTION: 'collection',
  QUEST: 'quest',
  SPECIAL: 'special',
} as const;

// Quest Types
export const QUEST_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIAL: 'special',
} as const;

// Quest Rewards
export const QUEST_REWARDS = {
  DAILY_MIN: 50,
  DAILY_MAX: 200,
  WEEKLY_MIN: 500,
  WEEKLY_MAX: 2000,
  SPECIAL_MIN: 1000,
  SPECIAL_MAX: 10000,
} as const;

// Leaderboard Configuration
export const LEADERBOARD_CONFIG = {
  LIMIT: 100, // Number of entries to show
  UPDATE_INTERVAL: 60000, // Update every minute
  TYPES: {
    COINS: 'coins',
    MINING: 'mining',
    ACHIEVEMENTS: 'achievements',
    REFERRALS: 'referrals',
  },
} as const;

// Referral Configuration
export const REFERRAL_CONFIG = {
  REFERRER_BONUS: 1000, // Coins for referrer
  REFERREE_BONUS: 500, // Coins for new user
  MAX_REFERRALS: 100, // Max referrals per user
} as const;

// ==========================================
// API Constants
// ==========================================

export const API_ENDPOINTS = {
  // Auth
  AUTH_TELEGRAM: '/api/v1/auth/telegram',
  AUTH_REFRESH: '/api/v1/auth/refresh',
  AUTH_LOGOUT: '/api/v1/auth/logout',

  // User
  USER_PROFILE: '/api/v1/user/profile',
  USER_STATS: '/api/v1/user/stats',
  USER_UPDATE: '/api/v1/user/update',

  // Mining
  MINING_TAP: '/api/v1/mining/tap',
  MINING_START: '/api/v1/mining/start',
  MINING_STOP: '/api/v1/mining/stop',
  MINING_STATUS: '/api/v1/mining/status',
  MINING_BOOSTS: '/api/v1/mining/boosts',

  // Characters
  CHARACTERS_LIST: '/api/v1/characters',
  CHARACTERS_USER: '/api/v1/characters/user',
  CHARACTERS_UPGRADE: '/api/v1/characters/:id/upgrade',

  // Achievements
  ACHIEVEMENTS_LIST: '/api/v1/achievements',
  ACHIEVEMENTS_USER: '/api/v1/achievements/user',
  ACHIEVEMENTS_CLAIM: '/api/v1/achievements/:id/claim',

  // Quests
  QUESTS_LIST: '/api/v1/quests',
  QUESTS_USER: '/api/v1/quests/user',
  QUESTS_START: '/api/v1/quests/:id/start',
  QUESTS_CLAIM: '/api/v1/quests/:id/claim',

  // Leaderboard
  LEADERBOARD: '/api/v1/leaderboard/:type',

  // Airdrop
  AIRDROPS_LIST: '/api/v1/airdrops',
  AIRDROPS_USER: '/api/v1/airdrops/user',
  AIRDROPS_CLAIM: '/api/v1/airdrops/:id/claim',

  // Wallet
  WALLET_CONNECT: '/api/v1/wallet/connect',
  WALLET_VERIFY: '/api/v1/wallet/verify',
  WALLET_DISCONNECT: '/api/v1/wallet/disconnect',
} as const;

// ==========================================
// Error Messages
// ==========================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND: 'User not found',
  INSUFFICIENT_ENERGY: 'Insufficient energy',
  INSUFFICIENT_COINS: 'Insufficient coins',
  CHARACTER_NOT_FOUND: 'Character not found',
  CHARACTER_ALREADY_OWNED: 'Character already owned',
  ACHIEVEMENT_NOT_UNLOCKED: 'Achievement not yet unlocked',
  ACHIEVEMENT_ALREADY_CLAIMED: 'Achievement already claimed',
  QUEST_NOT_FOUND: 'Quest not found',
  QUEST_ALREADY_COMPLETED: 'Quest already completed',
  QUEST_NOT_STARTED: 'Quest not started',
  AIRDROP_NOT_ELIGIBLE: 'Not eligible for airdrop',
  AIRDROP_ALREADY_CLAIMED: 'Airdrop already claimed',
  WALLET_ALREADY_CONNECTED: 'Wallet already connected',
  INVALID_WALLET_ADDRESS: 'Invalid wallet address',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INTERNAL_ERROR: 'Internal server error',
} as const;

// ==========================================
// Success Messages
// ==========================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  PROFILE_UPDATED: 'Profile updated successfully',
  MINING_STARTED: 'Mining started',
  MINING_STOPPED: 'Mining stopped',
  CHARACTER_ACQUIRED: 'Character acquired successfully',
  CHARACTER_UPGRADED: 'Character upgraded successfully',
  ACHIEVEMENT_UNLOCKED: 'Achievement unlocked!',
  ACHIEVEMENT_CLAIMED: 'Reward claimed successfully',
  QUEST_STARTED: 'Quest started',
  QUEST_COMPLETED: 'Quest completed!',
  QUEST_CLAIMED: 'Quest reward claimed',
  AIRDROP_CLAIMED: 'Airdrop claimed successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  WALLET_VERIFIED: 'Wallet verified successfully',
} as const;

// ==========================================
// Time Constants
// ==========================================

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// ==========================================
// Validation Constants
// ==========================================

export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  WALLET_ADDRESS_LENGTH: 42,
  MAX_REFERRAL_CODE_LENGTH: 10,
} as const;
