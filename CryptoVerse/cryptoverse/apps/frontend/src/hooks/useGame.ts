import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  particlesEnabled: boolean;
  toggleSound: () => void;
  toggleHaptic: () => void;
  toggleParticles: () => void;
  reset: () => void;
}

const initialState = {
  soundEnabled: true,
  hapticEnabled: true,
  particlesEnabled: true,
};

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
      toggleParticles: () => set((state) => ({ particlesEnabled: !state.particlesEnabled })),
      reset: () => set(initialState),
    }),
    {
      name: 'cryptoverse-game-settings',
    }
  )
);