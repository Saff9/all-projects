import { api } from './api';
import { MiningBoost } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface MiningStats {
  energy: number;
  maxEnergy: number;
  energyRegenRate: number;
  miningRate: number;
  totalMined: number;
  totalTaps: number;
  combo: number;
  maxCombo: number;
  lastTapAt: Date | null;
  activeBoost?: ActiveBoost;
}

export interface ActiveBoost {
  id: string;
  name: string;
  multiplier: number;
  endsAt: Date;
}

export interface TapResult {
  coinsEarned: number;
  totalCoins: number;
  energy: number;
  isCritical: boolean;
  criticalMultiplier?: number;
  combo: number;
  comboMultiplier: number;
}

export interface TapData {
  count?: number;
  timestamp?: number;
}

export interface StartMiningData {
  boostId?: string;
}

export interface MiningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  coinsEarned: number;
  isActive: boolean;
}

export interface MiningHistory {
  sessions: MiningSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// Mining Service
// ==========================================

export const miningService = {
  /**
   * Tap to mine coins
   */
  tap: async (data?: TapData): Promise<TapResult> => {
    return api.post<TapResult>('/mining/tap', data || {});
  },

  /**
   * Get mining statistics
   */
  getStats: async (): Promise<MiningStats> => {
    return api.get<MiningStats>('/mining/stats');
  },

  /**
   * Start a mining session
   */
  startMining: async (data?: StartMiningData): Promise<MiningSession> => {
    return api.post<MiningSession>('/mining/start', data || {});
  },

  /**
   * Stop current mining session
   */
  stopMining: async (): Promise<MiningSession> => {
    return api.post<MiningSession>('/mining/stop');
  },

  /**
   * Get available mining boosts
   */
  getBoosts: async (): Promise<MiningBoost[]> => {
    return api.get<MiningBoost[]>('/mining/boosts');
  },

  /**
   * Get mining session history
   */
  getHistory: async (
    page: number = 1,
    limit: number = 20
  ): Promise<MiningHistory> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return api.get<MiningHistory>(`/mining/history?${params.toString()}`);
  },
};

export default miningService;