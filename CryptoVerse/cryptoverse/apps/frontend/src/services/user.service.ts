import { api } from './api';
import { User, UserStats } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface UserProfile extends User {
  stats: UserStats;
  level: number;
  experience: number;
  nextLevelExp: number;
  isPremium?: boolean;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface ReferralStats {
  code: string;
  referralCode: string; // Alias for code
  totalReferrals: number;
  activeReferrals: number;
  maxReferrals: number;
  totalEarned: number; // Alias for earnedCoins
  earnedCoins: number;
  pendingRewards: number;
  referrals: Referral[];
}

export interface Referral {
  id: string;
  username?: string;
  photoUrl?: string;
  earnedCoins: number;
  createdAt: Date;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface ApplyReferralData {
  code: string;
}

// ==========================================
// User Service
// ==========================================

export const userService = {
  /**
   * Get current user profile with stats
   */
  getProfile: async (): Promise<UserProfile> => {
    return api.get<UserProfile>('/user/profile');
  },

  /**
   * Get current user statistics
   */
  getStats: async (): Promise<UserStats> => {
    return api.get<UserStats>('/user/stats');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    return api.patch<User>('/user/profile', data);
  },

  /**
   * Get referral statistics
   */
  getReferralStats: async (): Promise<ReferralStats> => {
    return api.get<ReferralStats>('/user/referrals');
  },

  /**
   * Apply a referral code
   */
  applyReferral: async (code: string): Promise<{ success: boolean; bonus: number }> => {
    return api.post<{ success: boolean; bonus: number }>('/user/referral/apply', { code });
  },
};

export default userService;