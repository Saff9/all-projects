import { create } from 'zustand';
import { User, UserStats } from '@cryptoverse/shared';
import { userService, UserProfile, ReferralStats, UpdateProfileData } from '../services';

// ==========================================
// Types
// ==========================================

interface UserState {
  profile: UserProfile | null;
  stats: UserStats | null;
  referralStats: ReferralStats | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchReferralStats: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  applyReferral: (code: string) => Promise<{ success: boolean; bonus: number }>;
  updateCoins: (coins: number) => void;
  updateMiningRate: (rate: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

// ==========================================
// Initial State
// ==========================================

const initialState: UserState = {
  profile: null,
  stats: null,
  referralStats: null,
  isLoading: false,
  error: null,
};

// ==========================================
// User Store
// ==========================================

export const useUserStore = create<UserStore>()((set, get) => ({
  ...initialState,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userService.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      set({ error: message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await userService.getStats();
      set({ stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stats';
      set({ error: message });
    }
  },

  fetchReferralStats: async () => {
    try {
      const referralStats = await userService.getReferralStats();
      set({ referralStats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch referral stats';
      set({ error: message });
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateProfile(data);
      const profile = get().profile;
      if (profile) {
        set({
          profile: { ...profile, ...updatedUser },
          isLoading: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  applyReferral: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userService.applyReferral(code);
      // Refresh profile after applying referral
      await get().fetchProfile();
      set({ isLoading: false });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply referral';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateCoins: (coins: number) => {
    const profile = get().profile;
    if (profile) {
      set({ profile: { ...profile, coins } });
    }
  },

  updateMiningRate: (rate: number) => {
    const profile = get().profile;
    if (profile) {
      set({ profile: { ...profile, miningRate: rate } });
    }
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

export default useUserStore;