import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ==========================================
// Types
// ==========================================

interface GameState {
  // Sound settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  
  // Haptic settings
  hapticEnabled: boolean;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  
  // Visual settings
  particlesEnabled: boolean;
  animationsEnabled: boolean;
  
  // Game state
  hasSeenTutorial: boolean;
  lastActiveTime: number | null;
  sessionStartTime: number | null;
  
  // Notifications
  notificationsEnabled: boolean;
  dailyReminderEnabled: boolean;
  
  // UI state
  isAppReady: boolean;
  isOnline: boolean;
  currentModal: string | null;
}

interface GameActions {
  // Sound actions
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  
  // Haptic actions
  toggleHaptic: () => void;
  setHapticIntensity: (intensity: 'light' | 'medium' | 'heavy') => void;
  
  // Visual actions
  toggleParticles: () => void;
  toggleAnimations: () => void;
  
  // Game actions
  markTutorialSeen: () => void;
  updateLastActiveTime: () => void;
  startSession: () => void;
  endSession: () => void;
  
  // Notification actions
  toggleNotifications: () => void;
  toggleDailyReminder: () => void;
  
  // UI actions
  setAppReady: (ready: boolean) => void;
  setOnline: (online: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Reset
  reset: () => void;
}

type GameStore = GameState & GameActions;

// ==========================================
// Initial State
// ==========================================

const initialState: GameState = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,
  hapticEnabled: true,
  hapticIntensity: 'medium',
  particlesEnabled: true,
  animationsEnabled: true,
  hasSeenTutorial: false,
  lastActiveTime: null,
  sessionStartTime: null,
  notificationsEnabled: true,
  dailyReminderEnabled: true,
  isAppReady: false,
  isOnline: true,
  currentModal: null,
};

// ==========================================
// Game Store
// ==========================================

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Sound actions
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleMusic: () => {
        set((state) => ({ musicEnabled: !state.musicEnabled }));
      },

      setSoundVolume: (volume: number) => {
        set({ soundVolume: Math.max(0, Math.min(1, volume)) });
      },

      setMusicVolume: (volume: number) => {
        set({ musicVolume: Math.max(0, Math.min(1, volume)) });
      },

      // Haptic actions
      toggleHaptic: () => {
        set((state) => ({ hapticEnabled: !state.hapticEnabled }));
      },

      setHapticIntensity: (intensity: 'light' | 'medium' | 'heavy') => {
        set({ hapticIntensity: intensity });
      },

      // Visual actions
      toggleParticles: () => {
        set((state) => ({ particlesEnabled: !state.particlesEnabled }));
      },

      toggleAnimations: () => {
        set((state) => ({ animationsEnabled: !state.animationsEnabled }));
      },

      // Game actions
      markTutorialSeen: () => {
        set({ hasSeenTutorial: true });
      },

      updateLastActiveTime: () => {
        set({ lastActiveTime: Date.now() });
      },

      startSession: () => {
        set({ sessionStartTime: Date.now() });
      },

      endSession: () => {
        set({ sessionStartTime: null });
      },

      // Notification actions
      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },

      toggleDailyReminder: () => {
        set((state) => ({ dailyReminderEnabled: !state.dailyReminderEnabled }));
      },

      // UI actions
      setAppReady: (ready: boolean) => {
        set({ isAppReady: ready });
      },

      setOnline: (online: boolean) => {
        set({ isOnline: online });
      },

      openModal: (modalId: string) => {
        set({ currentModal: modalId });
      },

      closeModal: () => {
        set({ currentModal: null });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'cryptoverse-game',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        soundVolume: state.soundVolume,
        musicVolume: state.musicVolume,
        hapticEnabled: state.hapticEnabled,
        hapticIntensity: state.hapticIntensity,
        particlesEnabled: state.particlesEnabled,
        animationsEnabled: state.animationsEnabled,
        hasSeenTutorial: state.hasSeenTutorial,
        notificationsEnabled: state.notificationsEnabled,
        dailyReminderEnabled: state.dailyReminderEnabled,
      }),
    }
  )
);

export default useGameStore;