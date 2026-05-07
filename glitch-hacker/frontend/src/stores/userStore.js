/**
 * User Store
 * Manages user profile data, balance, energy, and botnets
 */

import { create } from 'zustand';
import { getUser } from '../services/gameApi';

const useUserStore = create((set, get) => ({
  // State
  profile: null,
  balance: 0,
  energy: 1000,
  maxEnergy: 1000,
  botnets: [],
  firewall: { level: 1 },
  clickPower: 1,
  passiveIncome: 0,
  totalEarned: 0,
  totalSpent: 0,
  totalClicks: 0,
  isLoading: false,
  error: null,
  lastEnergyRefill: null,

  // Actions
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getUser();
      const user = data.user;
      
      set({
        profile: user,
        balance: user.bitz,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        botnets: user.botnets || [],
        firewall: user.firewall || { level: 1 },
        clickPower: user.clickPower,
        passiveIncome: user.passiveIncome,
        totalEarned: user.totalEarned,
        totalSpent: user.totalSpent,
        totalClicks: user.totalClicks,
        lastEnergyRefill: user.lastEnergyRefill,
        isLoading: false,
      });
      
      return { success: true, user };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateBalance: (amount) => {
    set((state) => ({
      balance: state.balance + amount,
    }));
  },

  setBalance: (balance) => {
    set({ balance });
  },

  updateEnergy: (amount) => {
    set((state) => ({
      energy: Math.max(0, Math.min(state.maxEnergy, state.energy + amount)),
    }));
  },

  setEnergy: (energy) => {
    set((state) => ({
      energy: Math.max(0, Math.min(state.maxEnergy, energy)),
    }));
  },

  setMaxEnergy: (maxEnergy) => {
    set({ maxEnergy });
  },

  updateBotnets: (botnets) => {
    set({ botnets });
    // Recalculate passive income
    const income = botnets.reduce((total, botnet) => {
      return total + (botnet.income * botnet.owned);
    }, 0);
    set({ passiveIncome: income });
  },

  addBotnet: (botnetId, level = 1) => {
    set((state) => {
      const existingIndex = state.botnets.findIndex(b => b.id === botnetId);
      let newBotnets;
      
      if (existingIndex >= 0) {
        newBotnets = [...state.botnets];
        newBotnets[existingIndex] = {
          ...newBotnets[existingIndex],
          owned: newBotnets[existingIndex].owned + 1,
          level: level,
        };
      } else {
        newBotnets = [...state.botnets, { id: botnetId, owned: 1, level, income: 0 }];
      }
      
      return { botnets: newBotnets };
    });
  },

  updateFirewall: (level) => {
    set((state) => ({
      firewall: { ...state.firewall, level },
    }));
  },

  updateClickPower: (power) => {
    set({ clickPower: power });
  },

  updateStats: (stats) => {
    set((state) => ({
      totalEarned: stats.totalEarned ?? state.totalEarned,
      totalSpent: stats.totalSpent ?? state.totalSpent,
      totalClicks: stats.totalClicks ?? state.totalClicks,
    }));
  },

  clearError: () => set({ error: null }),

  // Calculate passive income from botnets
  calculatePassiveIncome: () => {
    const { botnets } = get();
    return botnets.reduce((total, botnet) => {
      return total + (botnet.income * botnet.owned);
    }, 0);
  },

  // Reset store (for logout)
  reset: () => {
    set({
      profile: null,
      balance: 0,
      energy: 1000,
      maxEnergy: 1000,
      botnets: [],
      firewall: { level: 1 },
      clickPower: 1,
      passiveIncome: 0,
      totalEarned: 0,
      totalSpent: 0,
      totalClicks: 0,
      isLoading: false,
      error: null,
      lastEnergyRefill: null,
    });
  },
}));

export default useUserStore;
