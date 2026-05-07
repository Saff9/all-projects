/**
 * useTelegram Hook
 * Telegram SDK integration with haptic feedback and WebApp controls
 */

import { useCallback, useEffect, useState } from 'react';

// Check if running inside Telegram WebApp
const isTelegramWebApp = () => {
  return window.Telegram?.WebApp !== undefined;
};

// Get Telegram WebApp instance
const getWebApp = () => {
  return window.Telegram?.WebApp;
};

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    const webApp = getWebApp();
    
    if (webApp) {
      // Tell Telegram the app is ready
      webApp.ready();
      setIsReady(true);
      setIsExpanded(webApp.isExpanded);

      // Listen for viewport changes
      webApp.onEvent('viewportChanged', () => {
        setIsExpanded(webApp.isExpanded);
      });
    }
  }, []);

  // Haptic feedback helpers
  const hapticImpact = useCallback((style = 'light') => {
    const webApp = getWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  }, []);

  const hapticNotification = useCallback((type = 'success') => {
    const webApp = getWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  }, []);

  const hapticSelection = useCallback(() => {
    const webApp = getWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  }, []);

  // WebApp controls
  const expand = useCallback(() => {
    const webApp = getWebApp();
    if (webApp) {
      webApp.expand();
    }
  }, []);

  const close = useCallback(() => {
    const webApp = getWebApp();
    if (webApp) {
      webApp.close();
    }
  }, []);

  // Set header color
  const setHeaderColor = useCallback((color) => {
    const webApp = getWebApp();
    if (webApp) {
      webApp.setHeaderColor(color);
    }
  }, []);

  // Set background color
  const setBackgroundColor = useCallback((color) => {
    const webApp = getWebApp();
    if (webApp) {
      webApp.setBackgroundColor(color);
    }
  }, []);

  // Show popup
  const showPopup = useCallback((params) => {
    const webApp = getWebApp();
    if (webApp) {
      return new Promise((resolve) => {
        webApp.showPopup(params, resolve);
      });
    }
    return Promise.resolve();
  }, []);

  // Show alert
  const showAlert = useCallback((message) => {
    const webApp = getWebApp();
    if (webApp) {
      return new Promise((resolve) => {
        webApp.showAlert(message, resolve);
      });
    }
    alert(message);
    return Promise.resolve();
  }, []);

  // Show confirm
  const showConfirm = useCallback((message) => {
    const webApp = getWebApp();
    if (webApp) {
      return new Promise((resolve) => {
        webApp.showConfirm(message, resolve);
      });
    }
    return Promise.resolve(confirm(message));
  }, []);

  // Get user info
  const getUser = useCallback(() => {
    const webApp = getWebApp();
    return webApp?.initDataUnsafe?.user || null;
  }, []);

  // Get initData
  const getInitData = useCallback(() => {
    const webApp = getWebApp();
    return webApp?.initData || null;
  }, []);

  return {
    // State
    isTelegram: isTelegramWebApp(),
    isReady,
    isExpanded,
    
    // Haptic feedback
    hapticImpact,
    hapticNotification,
    hapticSelection,
    
    // WebApp controls
    expand,
    close,
    setHeaderColor,
    setBackgroundColor,
    showPopup,
    showAlert,
    showConfirm,
    
    // User info
    getUser,
    getInitData,
    
    // Raw WebApp instance (for advanced usage)
    webApp: getWebApp(),
  };
};

export default useTelegram;
