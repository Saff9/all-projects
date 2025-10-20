import { api } from './api';
import { Character, UserCharacter, CharacterRarity } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface CharacterAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  value?: number;
}

export interface CharacterWithProgress extends Character {
  owned: boolean;
  userCharacterId?: string;
  level?: number;
  experience?: number;
  maxLevel?: number;
  currentMultiplier?: number;
  baseMultiplier?: number;
  abilities?: CharacterAbility[];
  upgradeCost?: number;
  unlocked?: boolean;
  unlockCondition?: string;
}

export interface UserCharacterWithDetails extends UserCharacter {
  character: Character;
  upgradeCost: number;
  nextLevelBonus: number;
  canUpgrade: boolean;
}

export interface UpgradeResult {
  userCharacter: UserCharacterWithDetails;
  coinsSpent: number;
  newLevel: number;
}

export interface UnlockResult {
  userCharacter: UserCharacterWithDetails;
  coinsSpent: number;
}

export interface UpgradeData {
  levels?: number;
}

export interface UnlockData {
  characterId: string;
}

// ==========================================
// Character Service
// ==========================================

export const characterService = {
  /**
   * Get all available characters
   */
  getAllCharacters: async (rarity?: CharacterRarity): Promise<CharacterWithProgress[]> => {
    const params = rarity ? `?rarity=${rarity}` : '';
    return api.get<CharacterWithProgress[]>(`/characters${params}`);
  },

  /**
   * Get current user's characters
   */
  getUserCharacters: async (): Promise<UserCharacterWithDetails[]> => {
    return api.get<UserCharacterWithDetails[]>('/characters/user');
  },

  /**
   * Get character by ID
   */
  getCharacterById: async (characterId: string): Promise<Character> => {
    return api.get<Character>(`/characters/${characterId}`);
  },

  /**
   * Upgrade character level
   */
  upgradeCharacter: async (
    userCharacterId: string,
    data?: UpgradeData
  ): Promise<UpgradeResult> => {
    return api.post<UpgradeResult>(`/characters/${userCharacterId}/upgrade`, data || {});
  },

  /**
   * Unlock a new character
   */
  unlockCharacter: async (data: UnlockData): Promise<UnlockResult> => {
    return api.post<UnlockResult>('/characters/unlock', data);
  },
};

export default characterService;