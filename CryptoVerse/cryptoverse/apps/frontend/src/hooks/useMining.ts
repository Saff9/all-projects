import { useCallback, useEffect, useRef } from 'react';
import { useMiningStore, useUserStore, useGameStore } from '../stores';
import { telegramService } from '../services';
import { MINING_CONFIG } from '@cryptoverse/shared';

// ==========================================
// Hook
// ==========================================

export function useMining() {
  const {
    stats,
    boosts,
    currentSession,
    isMining,
    isTapping,
    isLoading,
    error,
    localEnergy,
    localCombo,
    lastTapTime,
    tapAnimations,
    fetchStats,
    fetchBoosts,
    tap,
    startMining,
    stopMining,
    updateLocalEnergy,
    updateLocalCombo,
    addTapAnimation,
    removeTapAnimation,
    clearTapAnimations,
    regenerateEnergy,
    resetCombo,
    setLoading,
    setError,
    reset,
  } = useMiningStore();

  const { updateCoins } = useUserStore();
  const { hapticEnabled, hapticIntensity, particlesEnabled } = useGameStore();

  // Energy regeneration interval
  const energyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Combo reset timeout
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchBoosts();
  }, [fetchStats, fetchBoosts]);

  // Energy regeneration loop
  useEffect(() => {
    if (stats) {
      energyIntervalRef.current = setInterval(() => {
        regenerateEnergy();
      }, 1000); // Every second
    }

    return () => {
      if (energyIntervalRef.current) {
        clearInterval(energyIntervalRef.current);
      }
    };
  }, [stats, regenerateEnergy]);

  // Combo reset timeout
  useEffect(() => {
    if (localCombo > 0 && lastTapTime) {
      // Reset combo after 2 seconds of no taps
      comboTimeoutRef.current = setTimeout(() => {
        resetCombo();
      }, 2000);
    }

    return () => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
    };
  }, [localCombo, lastTapTime, resetCombo]);

  // Clean up old tap animations
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const oldAnimations = tapAnimations.filter(
        (a) => now - a.timestamp > 1000 // Remove animations older than 1 second
      );
      oldAnimations.forEach((a) => removeTapAnimation(a.id));
    }, 100);

    return () => clearInterval(cleanupInterval);
  }, [tapAnimations, removeTapAnimation]);

  // Handle tap
  const handleTap = useCallback(
    async (x?: number, y?: number) => {
      // Check energy
      if (localEnergy < MINING_CONFIG.TAP_ENERGY_COST) {
        setError('Insufficient energy');
        return null;
      }

      try {
        // Trigger haptic feedback
        if (hapticEnabled) {
          telegramService.hapticImpact(hapticIntensity);
        }

        const result = await tap();

        // Update user coins
        updateCoins(result.totalCoins);

        // Create tap animation
        if (particlesEnabled) {
          const animationId = `tap-${Date.now()}-${Math.random()}`;
          addTapAnimation({
            id: animationId,
            x: x || Math.random() * 200 + 50,
            y: y || Math.random() * 200 + 50,
            value: result.coinsEarned * (result.comboMultiplier || 1),
            isCritical: result.isCritical,
            timestamp: Date.now(),
          });

          // Remove animation after delay
          setTimeout(() => {
            removeTapAnimation(animationId);
          }, 1000);
        }

        // Critical hit haptic
        if (result.isCritical && hapticEnabled) {
          telegramService.hapticNotification('success');
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Tap failed';
        setError(message);
        return null;
      }
    },
    [
      localEnergy,
      tap,
      updateCoins,
      hapticEnabled,
      hapticIntensity,
      particlesEnabled,
      addTapAnimation,
      removeTapAnimation,
      setError,
    ]
  );

  // Start mining session
  const handleStartMining = useCallback(
    async (boostId?: string) => {
      try {
        await startMining(boostId);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start mining';
        setError(message);
        return false;
      }
    },
    [startMining, setError]
  );

  // Stop mining session
  const handleStopMining = useCallback(async () => {
    try {
      await stopMining();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop mining';
      setError(message);
      return false;
    }
  }, [stopMining, setError]);

  // Calculate energy percentage
  const energyPercentage = stats
    ? (localEnergy / stats.maxEnergy) * 100
    : 0;

  // Calculate combo multiplier
  const comboMultiplier = Math.min(1 + localCombo * 0.1, 5); // Max 5x multiplier

  // Get active boost
  const activeBoost = stats?.activeBoost;

  // Calculate effective mining rate
  const effectiveMiningRate = stats
    ? stats.miningRate * comboMultiplier * (activeBoost?.multiplier || 1)
    : MINING_CONFIG.BASE_MINING_RATE;

  return {
    stats,
    boosts,
    currentSession,
    isMining,
    isTapping,
    isLoading,
    error,
    localEnergy,
    localCombo,
    energyPercentage,
    comboMultiplier,
    activeBoost,
    effectiveMiningRate,
    tapAnimations,
    fetchStats,
    fetchBoosts,
    tap: handleTap,
    startMining: handleStartMining,
    stopMining: handleStopMining,
    updateLocalEnergy,
    updateLocalCombo,
    clearTapAnimations,
    setLoading,
    setError,
    reset,
  };
}

export default useMining;