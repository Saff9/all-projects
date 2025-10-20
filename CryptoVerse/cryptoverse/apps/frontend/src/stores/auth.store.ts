import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@cryptoverse/shared';
import { authService, AuthResponse } from '../services';

// ==========================================
// Types
// ==========================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  error: string | null;
}

interface AuthActions {
  login: (initData: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// ==========================================
// Initial State
// ==========================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isNewUser: false,
  error: null,
};

// ==========================================
// Auth Store
// ==========================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (initData: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.loginWithTelegram(initData);
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isNewUser: response.is_new_user,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({
            error: message,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({
            ...initialState,
            isLoading: false,
          });
        }
      },

      refreshUser: async () => {
        if (!authService.isAuthenticated()) {
          set({ ...initialState, isLoading: false });
          return;
        }
        try {
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            ...initialState,
            isLoading: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
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
    }),
    {
      name: 'cryptoverse-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;