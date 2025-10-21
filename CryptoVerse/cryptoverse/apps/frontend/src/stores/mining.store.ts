import { create } from 'zustand';
import { MiningBoost } from '@cryptoverse/shared';
import {
  miningService,
  MiningStats,
  TapResult,
  MiningSession,
} from '../services';

// ==========================================
// Types
// ==========================================

interface MiningState {
  stats: MiningStats | null;
  boosts: MiningBoost[];
  currentSession: MiningSession | null;
  isMining: boolean;
  isTapping: boolean;
  isLoading: boolean;
  error: string | null;
  // Local state for real-time updates
  localEnergy: number;
  localCombo: number;
  lastTapTime: number | null;
  tapAnimations: TapAnimation[];
}

interface TapAnimation {
  id: string;
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
  timestamp: number;
}

interface MiningActions {
  fetchStats: () => Promise<void>;
  fetchBoosts: () => Promise<void>;
  tap: () => Promise<TapResult>;
  startMining: (boostId?: string) => Promise<void>;
  stopMining: () => Promise<void>;
  updateLocalEnergy: (energy: number) => void;
  updateLocalCombo: (combo: number) => void;
  addTapAnimation: (animation: TapAnimation) => void;
  removeTapAnimation: (id: string) => void;
  clearTapAnimations: () => void;
  regenerateEnergy: () => void;
  resetCombo: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type MiningStore = MiningState & MiningActions;

// ==========================================
// Initial State
// ==========================================

const initialState: MiningState = {
  stats: null,
  boosts: [],
  currentSession: null,
  isMining: false,
  isTapping: false,
  isLoading: false,
  error: null,
  localEnergy: 1000,
  localCombo: 0,
  lastTapTime: null,
  tapAnimations: [],
};

// ==========================================
// Mining Store
// ==========================================

export const useMiningStore = create<MiningStore>()((set, get) => ({
  ...initialState,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await miningService.getStats();
      set({
        stats,
        localEnergy: stats.energy,
        localCombo: stats.combo,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch mining stats';
      set({ error: message, isLoading: false });
    }
  },

  fetchBoosts: async () => {
    try {
      const boosts = await miningService.getBoosts();
      set({ boosts });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch boosts';
      set({ error: message });
    }
  },

  tap: async () => {
    const state = get();
    
    // Check if enough energy
    if (state.localEnergy < 1) {
      throw new Error('Insufficient energy');
    }

    set({ isTapping: true, error: null });
    try {
      const result = await miningService.tap();
      
      // Update local state
      set({
        localEnergy: result.energy,
        localCombo: result.combo,
        lastTapTime: Date.now(),
        isTapping: false,
        stats: state.stats ? {
          ...state.stats,
          energy: result.energy,
          totalMined: result.totalCoins,
          combo: result.combo,
        } : null,
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tap failed';
      set({ error: message, isTapping: false });
      throw error;
    }
  },

  startMining: async (boostId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await miningService.startMining(boostId ? { boostId } : undefined);
      set({
        currentSession: session,
        isMining: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start mining';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  stopMining: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await miningService.stopMining();
      set({
        currentSession: session,
        isMining: false,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop mining';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateLocalEnergy: (energy: number) => {
    set({ localEnergy: energy });
  },

  updateLocalCombo: (combo: number) => {
    set({ localCombo: combo });
  },

  addTapAnimation: (animation: TapAnimation) => {
    const tapAnimations = [...get().tapAnimations, animation];
    set({ tapAnimations });
  },

  removeTapAnimation: (id: string) => {
    const tapAnimations = get().tapAnimations.filter((a) => a.id !== id);
    set({ tapAnimations });
  },

  clearTapAnimations: () => {
    set({ tapAnimations: [] });
  },

  regenerateEnergy: () => {
    const state = get();
    if (!state.stats) return;

    const now = Date.now();
    const lastTap = state.lastTapTime || now;
    const secondsPassed = Math.floor((now - lastTap) / 1000);
    
    if (secondsPassed > 0) {
      const newEnergy = Math.min(
        state.localEnergy + state.stats.energyRegenRate * secondsPassed,
        state.stats.maxEnergy
      );
      set({ localEnergy: newEnergy });
    }
  },

  resetCombo: () => {
    set({ localCombo: 0 });
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

export default useMiningStore;