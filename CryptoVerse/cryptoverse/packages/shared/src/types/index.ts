// ==========================================
// User Types
// ==========================================

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  coins: number;
  miningRate: number;
  totalMined: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalTaps: number;
  totalEarned: number;
  achievementsUnlocked: number;
  charactersOwned: number;
  questsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  level?: number;
  totalXp?: number;
  totalTokens?: number;
  referrals?: number;
  tokensPerTap?: number;
}

export interface UserProfile {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  isPremium?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  referralCode: string;
  totalEarned: number;
  pendingRewards: number;
}

// ==========================================
// Character Types
// ==========================================

export type CharacterRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: CharacterRarity;
  baseMiningBonus: number;
  specialAbility?: string;
  createdAt: Date;
}

export interface UserCharacter {
  id: string;
  userId: string;
  characterId: string;
  level: number;
  experience: number;
  acquiredAt: Date;
  character?: Character;
}

// ==========================================
// Mining Types
// ==========================================

export interface MiningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  coinsEarned: number;
  isActive: boolean;
}

export interface MiningBoost {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  duration: number; // in seconds
  cost: number;
}

// ==========================================
// Achievement Types
// ==========================================

export type AchievementCategory = 'mining' | 'social' | 'collection' | 'quest' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  reward: number;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  claimed: boolean;
  achievement?: Achievement;
}

// ==========================================
// Quest Types
// ==========================================

export type QuestType = 'daily' | 'weekly' | 'special';
export type QuestStatus = 'pending' | 'in_progress' | 'completed' | 'claimed';

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  requirement: number;
  reward: number;
  expiresAt?: Date;
  createdAt: Date;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  progress: number;
  status: QuestStatus;
  startedAt: Date;
  completedAt?: Date;
  quest?: Quest;
}

// ==========================================
// Leaderboard Types
// ==========================================

export type LeaderboardType = 'coins' | 'mining' | 'achievements' | 'referrals';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username?: string;
  photoUrl?: string;
  value: number;
}

// ==========================================
// Airdrop Types
// ==========================================

export interface Airdrop {
  id: string;
  name: string;
  description: string;
  totalTokens: number;
  tokensPerUser: number;
  startDate: Date;
  endDate: Date;
  requirements: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface UserAirdrop {
  id: string;
  userId: string;
  airdropId: string;
  eligible: boolean;
  claimed: boolean;
  claimedAt?: Date;
  airdrop?: Airdrop;
}

// ==========================================
// Wallet Types
// ==========================================

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  network: string;
  isVerified: boolean;
  createdAt: Date;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// ==========================================
// Telegram Types
// ==========================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebAppInitData {
  user: TelegramUser;
  query_id?: string;
  auth_date: number;
  hash: string;
}
