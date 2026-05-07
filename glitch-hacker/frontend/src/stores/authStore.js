/**
 * Auth Store
 * Manages user authentication state using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authTelegram } from '../services/gameApi';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initData: null,

      // Actions
      setInitData: (initData) => set({ initData }),

      login: async (initData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authTelegram(initData);
          
          if (response.success) {
            // Store token in localStorage for API calls
            localStorage.setItem('auth_token', response.token);
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              initData,
            });
            return { success: true, user: response.user };
          }
        } catch (error) {
          set({
            error: error.message || 'Authentication failed',
            isLoading: false,
            isAuthenticated: false,
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          initData: null,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        }));
      },

      clearError: () => set({ error: null }),

      // Check if token exists on app load
      checkAuth: () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          set({ token, isAuthenticated: true });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
