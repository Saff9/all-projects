/**
 * Frontend-specific types for CryptoVerse
 */

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ==========================================
// User Types
// ==========================================

export interface UserProfile {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  isPremium: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  level: number;
  totalXp: number;
  totalTokens: number;
  totalTaps: number;
  tokensPerTap: number;
  criticalChance: number;
  energyLimit: number;
  energyRegenRate: number;
  charactersOwned: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  referrals: number;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalEarned: number;
  pendingRewards: number;
}

// ==========================================
// Mining Types
// ==========================================

export interface MiningSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  tokensEarned: number;
  tapsCount: number;
  criticalHits: number;
  maxCombo: number;
}

export interface MiningBoost {
  id: string;
  type: 'energy' | 'tap' | 'auto';
  multiplier: number;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface TapResult {
  tokensEarned: number;
  isCritical: boolean;
  comboCount: number;
  comboMultiplier: number;
  energyRemaining: number;
}

// ==========================================
// Character Types
// ==========================================

export interface CharacterType {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseMultiplier: number;
  maxLevel: number;
  unlockCondition?: string;
  imageUrl?: string;
  abilities: CharacterAbilityType[];
}

export interface CharacterAbilityType {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  effect: string;
  baseValue: number;
}

export interface UserCharacter {
  id: string;
  characterId: string;
  userId: string;
  level: number;
  currentMultiplier: number;
  unlockedAt: string;
  lastUpgradedAt?: string;
}

// ==========================================
// Achievement Types
// ==========================================

export interface AchievementType {
  id: string;
  name: string;
  description: string;
  type: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  requirement: number;
  reward: number;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  userId: string;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: string;
  claimedAt?: string;
}

// ==========================================
// Quest Types
// ==========================================

export interface QuestType {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'achievement';
  requirement: number;
  rewards: {
    tokens: number;
    xp?: number;
    items?: string[];
  };
  startDate?: string;
  endDate?: string;
}

export interface UserQuest {
  id: string;
  questId: string;
  userId: string;
  status: 'available' | 'in_progress' | 'completed' | 'claimed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  claimedAt?: string;
}

// ==========================================
// Wallet Types
// ==========================================

export interface WalletBalance {
  available: number;
  pending: number;
  staked: number;
  total: number;
}

export interface TransactionType {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer' | 'reward' | 'stake' | 'unstake';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  fromAddress?: string;
  toAddress?: string;
  createdAt: string;
}

// ==========================================
// Leaderboard Types
// ==========================================

export interface LeaderboardEntryType {
  rank: number;
  userId: string;
  username: string;
  photoUrl?: string;
  score: number;
  level?: number;
  country?: string;
}

export interface LeaderboardData {
  entries: LeaderboardEntryType[];
  userRank?: number;
  userScore?: number;
  total: number;
  page: number;
  hasMore: boolean;
}

// ==========================================
// Airdrop Types
// ==========================================

export interface AirdropType {
  id: string;
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  logoUrl?: string;
  totalSupply: number;
  allocatedAmount: number;
  claimedAmount: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  requirements?: string[];
}

export interface AirdropEligibility {
  airdropId: string;
  userId: string;
  isEligible: boolean;
  reason?: string;
  allocatedTokens: number;
  claimedTokens: number;
}

// ==========================================
// Notification Types
// ==========================================

export interface NotificationType {
  id: string;
  type: 'achievement' | 'quest' | 'airdrop' | 'system' | 'reward';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// Game State Types
// ==========================================

export interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  particlesEnabled: boolean;
  notificationsEnabled: boolean;
  language: string;
}

export interface GameState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

// ==========================================
// Component Props Types
// ==========================================

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface WithId {
  id: string;
}

export interface WithLoading {
  isLoading?: boolean;
}

export interface WithDisabled {
  disabled?: boolean;
}

// ==========================================
// Form Types
// ==========================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface FormErrors {
  [key: string]: string;
}

// ==========================================
// Event Types
// ==========================================

export interface TapEvent {
  x: number;
  y: number;
  timestamp: number;
  tokensEarned: number;
  isCritical: boolean;
}

export interface LevelUpEvent {
  previousLevel: number;
  newLevel: number;
  rewards: {
    tokens: number;
    energyBonus?: number;
  };
}

export interface AchievementUnlockEvent {
  achievementId: string;
  achievementName: string;
  reward: number;
}

// ==========================================
// Theme Types
// ==========================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

// ==========================================
// Utility Types
// ==========================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncFunction<T = void> = () => Promise<T>;

export type CallbackFunction<T = void> = (data: T) => void;

export type EventCallback<T = unknown> = (event: T) => void;
