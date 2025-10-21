import { create } from 'zustand';
import { Character, CharacterRarity } from '@cryptoverse/shared';
import {
  characterService,
  CharacterWithProgress,
  UserCharacterWithDetails,
  UnlockData,
} from '../services';

// ==========================================
// Types
// ==========================================

interface CharacterState {
  allCharacters: CharacterWithProgress[];
  userCharacters: UserCharacterWithDetails[];
  selectedCharacter: UserCharacterWithDetails | null;
  isLoading: boolean;
  isUpgrading: boolean;
  isUnlocking: boolean;
  error: string | null;
  filter: {
    rarity?: CharacterRarity;
    owned: boolean;
  };
}

interface CharacterActions {
  fetchAllCharacters: (rarity?: CharacterRarity) => Promise<void>;
  fetchUserCharacters: () => Promise<void>;
  selectCharacter: (character: UserCharacterWithDetails | null) => void;
  upgradeCharacter: (userCharacterId: string, levels?: number) => Promise<void>;
  unlockCharacter: (characterId: string) => Promise<void>;
  setFilter: (filter: Partial<CharacterState['filter']>) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type CharacterStore = CharacterState & CharacterActions;

// ==========================================
// Initial State
// ==========================================

const initialState: CharacterState = {
  allCharacters: [],
  userCharacters: [],
  selectedCharacter: null,
  isLoading: false,
  isUpgrading: false,
  isUnlocking: false,
  error: null,
  filter: {
    owned: false,
  },
};

// ==========================================
// Character Store
// ==========================================

export const useCharacterStore = create<CharacterStore>()((set, get) => ({
  ...initialState,

  fetchAllCharacters: async (rarity?: CharacterRarity) => {
    set({ isLoading: true, error: null });
    try {
      const allCharacters = await characterService.getAllCharacters(rarity);
      set({ allCharacters, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch characters';
      set({ error: message, isLoading: false });
    }
  },

  fetchUserCharacters: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCharacters = await characterService.getUserCharacters();
      set({ userCharacters, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user characters';
      set({ error: message, isLoading: false });
    }
  },

  selectCharacter: (character: UserCharacterWithDetails | null) => {
    set({ selectedCharacter: character });
  },

  upgradeCharacter: async (userCharacterId: string, levels?: number) => {
    set({ isUpgrading: true, error: null });
    try {
      const result = await characterService.upgradeCharacter(userCharacterId, levels ? { levels } : undefined);
      
      // Update user characters list
      const userCharacters = get().userCharacters.map((uc) =>
        uc.id === userCharacterId ? result.userCharacter : uc
      );
      
      // Update selected character if it's the one being upgraded
      const selectedCharacter = get().selectedCharacter?.id === userCharacterId
        ? result.userCharacter
        : get().selectedCharacter;
      
      set({
        userCharacters,
        selectedCharacter,
        isUpgrading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upgrade character';
      set({ error: message, isUpgrading: false });
      throw error;
    }
  },

  unlockCharacter: async (characterId: string) => {
    set({ isUnlocking: true, error: null });
    try {
      const result = await characterService.unlockCharacter({ characterId });
      
      // Add to user characters
      const userCharacters = [...get().userCharacters, result.userCharacter];
      
      // Update all characters to mark as owned
      const allCharacters = get().allCharacters.map((c) =>
        c.id === characterId
          ? { ...c, owned: true, userCharacterId: result.userCharacter.id, level: 1 }
          : c
      );
      
      set({
        userCharacters,
        allCharacters,
        isUnlocking: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unlock character';
      set({ error: message, isUnlocking: false });
      throw error;
    }
  },

  setFilter: (filter: Partial<CharacterState['filter']>) => {
    set({ filter: { ...get().filter, ...filter } });
  },

  clearFilter: () => {
    set({ filter: { owned: false } });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useCharacterStore;