/**
 * useGameLoop Hook
 * Manages game tick, energy regeneration, passive income, and auto-save
 */

import { useEffect, useRef, useCallback } from 'react';
import useClickerStore from '../stores/clickerStore';
import usePVPStore from '../stores/pvpStore';
import useUserStore from '../stores/userStore';

// Game loop constants
const TICK_RATE = 100; // 100ms = 10 ticks per second
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

export const useGameLoop = (isActive = true) => {
  const tickRef = useRef(0);
  const lastSaveRef = useRef(Date.now());
  const intervalRef = useRef(null);

  // Store actions
  const { regenerateEnergy, accumulatePassive } = useClickerStore();
  const { updateCooldown } = usePVPStore();
  const { fetchUser } = useUserStore();

  // Main game tick
  const gameTick = useCallback(() => {
    // Regenerate energy (+10 per second = +1 per 100ms tick)
    regenerateEnergy();
    
    // Accumulate passive income
    accumulatePassive();
    
    // Update PVP cooldown
    updateCooldown();
    
    tickRef.current += 1;
    
    // Auto-save every 10 seconds (100 ticks)
    const now = Date.now();
    if (now - lastSaveRef.current >= AUTO_SAVE_INTERVAL) {
      // Sync with server
      fetchUser().catch(console.error);
      lastSaveRef.current = now;
    }
  }, [regenerateEnergy, accumulatePassive, updateCooldown, fetchUser]);

  // Start/stop game loop
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start the game loop
    intervalRef.current = setInterval(gameTick, TICK_RATE);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, gameTick]);

  // Manual save function
  const manualSave = useCallback(async () => {
    const result = await fetchUser();
    if (result.success) {
      lastSaveRef.current = Date.now();
    }
    return result;
  }, [fetchUser]);

  // Get current tick count (for debugging)
  const getTickCount = useCallback(() => tickRef.current, []);

  return {
    tickCount: tickRef.current,
    getTickCount,
    manualSave,
    lastSaveTime: lastSaveRef.current,
  };
};

export default useGameLoop;
