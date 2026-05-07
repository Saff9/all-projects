/**
 * Clicker Store
 * Manages clicker game mechanics: clicks, energy, passive income
 */

import { create } from 'zustand';
import { click, collectPassive, getClickerStatus } from '../services/gameApi';

// Energy constants
const ENERGY_MAX = 1000;
const ENERGY_REGEN_RATE = 10; // per second
const ENERGY_REGEN_INTERVAL = 100; // ms
const ENERGY_PER_TICK = ENERGY_REGEN_RATE / (1000 / ENERGY_REGEN_INTERVAL);

const useClickerStore = create((set, get) => ({
  // State
  clickCount: 0,
  energy: 1000,
  maxEnergy: 1000,
  clickPower: 1,
  passiveIncomeRate: 0,
  accumulatedPassive: 0,
  isLoading: false,
  error: null,
  lastClickTime: 0,
  canClick: true,

  // Actions
  fetchStatus: async () => {
    try {
      const data = await getClickerStatus();
      set({
        energy: data.energy,
        maxEnergy: data.maxEnergy,
        clickPower: data.clickPower,
        passiveIncomeRate: data.passiveIncomeRate,
        accumulatedPassive: data.accumulatedPassive,
        timeUntilNextEnergy: data.timeUntilNextEnergy,
      });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  click: async () => {
    const { energy, canClick, lastClickTime } = get();
    
    // Prevent clicking if no energy or on cooldown
    if (energy < 1 || !canClick) {
      return { success: false, error: 'Not enough energy' };
    }

    // Simple cooldown to prevent spam
    const now = Date.now();
    if (now - lastClickTime < 50) {
      return { success: false, error: 'Clicking too fast' };
    }

    set({ canClick: false, lastClickTime: now });

    try {
      // Optimistic update for instant feedback
      set((state) => ({
        energy: Math.max(0, state.energy - 1),
        clickCount: state.clickCount + 1,
      }));

      // Call API
      const data = await click(Date.now(), 1);

      // Update with server response
      set({
        energy: data.energy,
        clickPower: data.clickPower,
        canClick: true,
      });

      return { 
        success: true, 
        earned: data.earned,
        newBalance: data.newBalance,
        energy: data.energy,
      };
    } catch (error) {
      set({ 
        error: error.message, 
        canClick: true,
        // Revert optimistic update
        energy: get().energy + 1,
        clickCount: get().clickCount - 1,
      });
      return { success: false, error: error.message };
    }
  },

  collectPassive: async () => {
    set({ isLoading: true });
    try {
      const data = await collectPassive();
      
      set({
        accumulatedPassive: 0,
        isLoading: false,
      });

      return {
        success: true,
        collected: data.collected,
        newBalance: data.newBalance,
      };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Local energy regeneration (called by game loop)
  regenerateEnergy: () => {
    set((state) => {
      if (state.energy >= state.maxEnergy) return state;
      
      const newEnergy = Math.min(
        state.maxEnergy,
        state.energy + ENERGY_PER_TICK
      );
      
      return { energy: newEnergy };
    });
  },

  // Local passive income accumulation (called by game loop)
  accumulatePassive: () => {
    set((state) => {
      if (state.passiveIncomeRate <= 0) return state;
      
      // Add income per tick (rate is per second, interval is 100ms)
      const incomePerTick = state.passiveIncomeRate / 10;
      
      return {
        accumulatedPassive: state.accumulatedPassive + incomePerTick,
      };
    });
  },

  setEnergy: (energy) => {
    set((state) => ({
      energy: Math.max(0, Math.min(state.maxEnergy, energy)),
    }));
  },

  setMaxEnergy: (maxEnergy) => {
    set({ maxEnergy });
  },

  setClickPower: (power) => {
    set({ clickPower: power });
  },

  setPassiveIncomeRate: (rate) => {
    set({ passiveIncomeRate: rate });
  },

  clearError: () => set({ error: null }),

  // Reset store
  reset: () => {
    set({
      clickCount: 0,
      energy: 1000,
      maxEnergy: 1000,
      clickPower: 1,
      passiveIncomeRate: 0,
      accumulatedPassive: 0,
      isLoading: false,
      error: null,
      lastClickTime: 0,
      canClick: true,
    });
  },
}));

export default useClickerStore;
export { ENERGY_MAX, ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL, ENERGY_PER_TICK };
