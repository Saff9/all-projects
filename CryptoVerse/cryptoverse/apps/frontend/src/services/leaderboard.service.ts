import { api } from './api';
import { LeaderboardEntry, LeaderboardType } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank?: number;
  userEntry?: LeaderboardEntry;
  updatedAt: Date;
}

// ==========================================
// Leaderboard Service
// ==========================================

export const leaderboardService = {
  /**
   * Get leaderboard by type
   */
  getLeaderboard: async (
    type: LeaderboardType,
    limit?: number
  ): Promise<LeaderboardData> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<LeaderboardData>(`/leaderboard/${type}${params}`);
  },

  /**
   * Get friends leaderboard
   */
  getFriendsLeaderboard: async (limit?: number): Promise<LeaderboardData> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<LeaderboardData>(`/leaderboard/friends/all${params}`);
  },

  /**
   * Get daily leaderboard
   */
  getDailyLeaderboard: async (limit?: number): Promise<LeaderboardData> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<LeaderboardData>(`/leaderboard/daily/all${params}`);
  },
};

export default leaderboardService;