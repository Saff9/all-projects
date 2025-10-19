import { api } from './api';
import { Achievement, UserAchievement, AchievementCategory } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface AchievementWithProgress extends Achievement {
  progress: number;
  unlocked: boolean;
  claimed: boolean;
  unlockedAt?: Date;
}

export interface ClaimResult {
  userAchievement: UserAchievement;
  reward: number;
  totalCoins: number;
}

// ==========================================
// Achievement Service
// ==========================================

export const achievementService = {
  /**
   * Get all achievements with user progress
   */
  getAllAchievements: async (
    category?: AchievementCategory
  ): Promise<AchievementWithProgress[]> => {
    const params = category ? `?category=${category}` : '';
    return api.get<AchievementWithProgress[]>(`/achievements${params}`);
  },

  /**
   * Get current user's achievements
   */
  getUserAchievements: async (): Promise<UserAchievement[]> => {
    return api.get<UserAchievement[]>('/achievements/user');
  },

  /**
   * Claim achievement reward
   */
  claimReward: async (achievementId: string): Promise<ClaimResult> => {
    return api.post<ClaimResult>(`/achievements/${achievementId}/claim`);
  },
};

export default achievementService;