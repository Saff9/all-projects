/**
 * Shop Store
 * Manages shop items and purchases
 */

import { create } from 'zustand';
import { getShopItems, buyItem, buyFirewall, buyVirus } from '../services/gameApi';

const useShopStore = create((set, get) => ({
  // State
  items: [],
  firewall: null,
  virus: null,
  isLoading: false,
  error: null,
  purchaseInProgress: false,

  // Actions
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getShopItems();
      
      set({
        items: data.items || [],
        firewall: data.firewall,
        virus: data.virus,
        isLoading: false,
      });
      
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  buyItem: async (itemId) => {
    set({ purchaseInProgress: true, error: null });
    try {
      const data = await buyItem(itemId);
      
      // Update local items list with new prices/ownership
      set((state) => ({
        items: state.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              owned: (item.owned || 0) + 1,
              currentPrice: data.nextPrice || item.currentPrice,
              canAfford: data.newBalance >= (data.nextPrice || item.currentPrice),
              maxed: data.maxed || false,
            };
          }
          // Update canAfford for all items based on new balance
          return {
            ...item,
            canAfford: data.newBalance >= item.currentPrice,
          };
        }),
        purchaseInProgress: false,
      }));

      return {
        success: true,
        item: data.item,
        newBalance: data.newBalance,
        newLevel: data.newLevel,
      };
    } catch (error) {
      set({ error: error.message, purchaseInProgress: false });
      return { success: false, error: error.message };
    }
  },

  buyFirewall: async () => {
    set({ purchaseInProgress: true, error: null });
    try {
      const data = await buyFirewall();
      
      set((state) => ({
        firewall: {
          ...state.firewall,
          level: data.newLevel,
          currentPrice: data.nextPrice,
          canAfford: data.newBalance >= data.nextPrice,
          maxed: data.maxed,
        },
        purchaseInProgress: false,
      }));

      return {
        success: true,
        newLevel: data.newLevel,
        newBalance: data.newBalance,
      };
    } catch (error) {
      set({ error: error.message, purchaseInProgress: false });
      return { success: false, error: error.message };
    }
  },

  buyVirus: async () => {
    set({ purchaseInProgress: true, error: null });
    try {
      const data = await buyVirus();
      
      set((state) => ({
        virus: {
          ...state.virus,
          level: data.newLevel,
          currentPrice: data.nextPrice,
          canAfford: data.newBalance >= data.nextPrice,
          maxed: data.maxed,
        },
        purchaseInProgress: false,
      }));

      return {
        success: true,
        newLevel: data.newLevel,
        newBalance: data.newBalance,
      };
    } catch (error) {
      set({ error: error.message, purchaseInProgress: false });
      return { success: false, error: error.message };
    }
  },

  // Update affordability based on current balance
  updateAffordability: (balance) => {
    set((state) => ({
      items: state.items.map(item => ({
        ...item,
        canAfford: balance >= item.currentPrice,
      })),
      firewall: state.firewall ? {
        ...state.firewall,
        canAfford: balance >= state.firewall.currentPrice,
      } : null,
      virus: state.virus ? {
        ...state.virus,
        canAfford: balance >= state.virus.currentPrice,
      } : null,
    }));
  },

  clearError: () => set({ error: null }),

  // Reset store
  reset: () => {
    set({
      items: [],
      firewall: null,
      virus: null,
      isLoading: false,
      error: null,
      purchaseInProgress: false,
    });
  },
}));

export default useShopStore;
