import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { telegramService, TelegramUser, TelegramWebApp } from '../services';

// ==========================================
// Hook
// ==========================================

export function useTelegram() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    const tg = telegramService;
    tg.init();
    setWebApp(telegramService.getWebApp?.() || null);
    setIsReady(true);
  }, []);

  // Handle back button
  useEffect(() => {
    if (!isReady || pathname === '/') return;

    // Show back button for non-home pages
    telegramService.showBackButton(() => {
      router.back();
    });

    return () => {
      telegramService.hideBackButton();
    };
  }, [isReady, pathname, router]);

  // Get user info
  const user = telegramService.getUser();
  const initData = telegramService.getInitData();
  const startParam = telegramService.getStartParam();
  const colorScheme = telegramService.getColorScheme();
  const themeParams = telegramService.getThemeParams();
  const isTelegram = telegramService.isTelegramEnvironment();

  // Haptic feedback wrappers
  const haptic = {
    impact: useCallback((style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      telegramService.hapticImpact(style);
    }, []),
    notification: useCallback((type?: 'error' | 'success' | 'warning') => {
      telegramService.hapticNotification(type);
    }, []),
    selection: useCallback(() => {
      telegramService.hapticSelection();
    }, []),
  };

  // Alert and popup wrappers
  const showAlert = useCallback((message: string) => {
    return telegramService.showAlert(message);
  }, []);

  const showConfirm = useCallback((message: string) => {
    return telegramService.showConfirm(message);
  }, []);

  const showPopup = useCallback((params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }) => {
    return telegramService.showPopup(params);
  }, []);

  // Link wrappers
  const openLink = useCallback((url: string) => {
    telegramService.openLink(url);
  }, []);

  const openTelegramLink = useCallback((url: string) => {
    telegramService.openTelegramLink(url);
  }, []);

  // Share functionality
  const shareReferralLink = useCallback((botUsername: string, referralCode: string) => {
    telegramService.shareReferralLink(botUsername, referralCode);
  }, []);

  // Cloud storage
  const cloudStorage = {
    setItem: useCallback((key: string, value: string) => {
      return telegramService.setCloudItem(key, value);
    }, []),
    getItem: useCallback((key: string) => {
      return telegramService.getCloudItem(key);
    }, []),
    removeItem: useCallback((key: string) => {
      return telegramService.removeCloudItem(key);
    }, []),
  };

  // App control
  const close = useCallback(() => {
    telegramService.close();
  }, []);

  const expand = useCallback(() => {
    telegramService.expand();
  }, []);

  // Main button control
  const mainButton = {
    show: useCallback((params: {
      text: string;
      color?: string;
      textColor?: string;
      onClick: () => void;
    }) => {
      telegramService.configureMainButton(params);
    }, []),
    hide: useCallback(() => {
      telegramService.hideMainButton();
    }, []),
    showProgress: useCallback(() => {
      telegramService.showMainButtonProgress();
    }, []),
    hideProgress: useCallback(() => {
      telegramService.hideMainButtonProgress();
    }, []),
  };

  return {
    isReady,
    isTelegram,
    user,
    initData,
    startParam,
    colorScheme,
    themeParams,
    webApp,
    haptic,
    showAlert,
    showConfirm,
    showPopup,
    openLink,
    openTelegramLink,
    shareReferralLink,
    cloudStorage,
    close,
    expand,
    mainButton,
  };
}

export default useTelegram;