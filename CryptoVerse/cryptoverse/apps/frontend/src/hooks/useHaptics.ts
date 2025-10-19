import { useCallback } from 'react';
import { useGameStore } from '../stores';
import { telegramService } from '../services';

// ==========================================
// Types
// ==========================================

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';

// ==========================================
// Hook
// ==========================================

export function useHaptics() {
  const { hapticEnabled, hapticIntensity } = useGameStore();

  // Impact feedback
  const impact = useCallback(
    (style?: ImpactStyle) => {
      if (!hapticEnabled) return;
      telegramService.hapticImpact(style || hapticIntensity);
    },
    [hapticEnabled, hapticIntensity]
  );

  // Notification feedback
  const notification = useCallback(
    (type: NotificationType = 'success') => {
      if (!hapticEnabled) return;
      telegramService.hapticNotification(type);
    },
    [hapticEnabled]
  );

  // Selection feedback
  const selection = useCallback(() => {
    if (!hapticEnabled) return;
    telegramService.hapticSelection();
  }, [hapticEnabled]);

  // Convenience methods
  const success = useCallback(() => notification('success'), [notification]);
  const error = useCallback(() => notification('error'), [notification]);
  const warning = useCallback(() => notification('warning'), [notification]);

  // Tap feedback (light impact)
  const tap = useCallback(() => {
    impact('light');
  }, [impact]);

  // Button press feedback (medium impact)
  const buttonPress = useCallback(() => {
    impact('medium');
  }, [impact]);

  // Heavy action feedback
  const heavy = useCallback(() => {
    impact('heavy');
  }, [impact]);

  return {
    isEnabled: hapticEnabled,
    intensity: hapticIntensity,
    impact,
    notification,
    selection,
    success,
    error,
    warning,
    tap,
    buttonPress,
    heavy,
    light: () => impact('light'),
    medium: () => impact('medium'),
  };
}

export default useHaptics;