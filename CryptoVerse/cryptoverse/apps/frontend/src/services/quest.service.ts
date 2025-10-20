import { api } from './api';
import { Quest, UserQuest, QuestType, QuestStatus } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface QuestWithProgress extends Quest {
  progress: number;
  status: QuestStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export interface StartQuestData {
  questId: string;
}

export interface ClaimResult {
  userQuest: UserQuest;
  reward: number;
  totalCoins: number;
}

// ==========================================
// Quest Service
// ==========================================

export const questService = {
  /**
   * Get all quests with user progress
   */
  getAllQuests: async (
    type?: QuestType,
    status?: QuestStatus
  ): Promise<QuestWithProgress[]> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<QuestWithProgress[]>(`/quests${query}`);
  },

  /**
   * Get current user's quests
   */
  getUserQuests: async (): Promise<UserQuest[]> => {
    return api.get<UserQuest[]>('/quests/user');
  },

  /**
   * Start a quest
   */
  startQuest: async (data: StartQuestData): Promise<UserQuest> => {
    return api.post<UserQuest>('/quests/start', data);
  },

  /**
   * Claim quest reward
   */
  claimReward: async (questId: string): Promise<ClaimResult> => {
    return api.post<ClaimResult>(`/quests/${questId}/claim`);
  },
};

export default questService;