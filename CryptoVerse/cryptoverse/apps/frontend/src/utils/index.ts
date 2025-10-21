// Format utilities
export {
  // Number formatting
  formatNumber,
  formatWithCommas,
  formatCurrency,
  formatPercentage,
  formatTokenAmount,
  
  // Date formatting
  formatRelativeTime,
  formatCountdown,
  formatDuration,
  formatDate,
  formatTime,
  formatDateTime,
  
  // String formatting
  truncateString,
  truncateAddress,
  capitalize,
  snakeToTitle,
  camelToTitle,
  formatUsername,
  
  // Level & XP formatting
  calculateLevel,
  calculateXpForNextLevel,
  calculateLevelProgress,
  
  // Hash & ID formatting
  formatTxHash,
  generateId,
  
  // Energy & Mining formatting
  formatEnergy,
  calculateEnergyRegenTime,
  formatMiningRate,
} from './format';

// Telegram utilities
export {
  // Types
  type TelegramUser,
  type TelegramWebApp,
  
  // Instance
  getTelegramWebApp,
  isTelegramWebApp,
  
  // User data
  getTelegramUser,
  getTelegramUserId,
  getTelegramUserDisplayName,
  getTelegramInitData,
  getStartParam,
  
  // Theme
  getTelegramThemeParams,
  getTelegramColorScheme,
  isDarkMode,
  applyTelegramTheme,
  
  // Haptic feedback
  hapticImpact,
  hapticNotification,
  hapticSelection,
  
  // Main button
  configureMainButton,
  showMainButton,
  hideMainButton,
  showMainButtonProgress,
  hideMainButtonProgress,
  
  // Back button
  showBackButton,
  hideBackButton,
  
  // Popups & alerts
  showAlert,
  showConfirm,
  showPopup,
  
  // Links & sharing
  openExternalLink,
  openTelegramLink,
  shareToStory,
  switchInlineQuery,
  
  // Cloud storage
  saveToCloudStorage,
  getFromCloudStorage,
  removeFromCloudStorage,
  
  // App control
  closeApp,
  expandApp,
  readyApp,
  enableClosingConfirmation,
  disableClosingConfirmation,
  
  // Utilities
  getReferralLink,
  shareReferralLink,
  isPremiumUser,
  getPlatform,
  getWebAppVersion,
} from './telegram';

// Storage utilities
export {
  // Types
  type StorageOptions,
  
  // Basic operations
  setItem,
  getItem,
  removeItem,
  hasItem,
  clearStorage,
  getAllKeys,
  
  // Typed storage
  createTypedStorage,
  
  // Session storage
  setSessionItem,
  getSessionItem,
  removeSessionItem,
  
  // Storage keys
  STORAGE_KEYS,
  
  // Pre-configured storage
  authTokenStorage,
  refreshTokenStorage,
  soundEnabledStorage,
  hapticEnabledStorage,
  particlesEnabledStorage,
  
  // Cache utilities
  type CacheOptions,
  getCached,
  setCached,
  isCacheValid,
  
  // Migration utilities
  migrateStorage,
  getStorageUsage,
} from './storage';

// Constants
export {
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
} from './constants';
