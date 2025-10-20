/**
 * Telegram WebApp SDK Integration Service
 * Provides utilities for interacting with Telegram Mini App features
 */

// ==========================================
// Types
// ==========================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: {
      user_id: number;
    };
    chat?: {
      id: number;
      type: string;
    };
    start_param?: string;
    can_send_after?: number;
    can_send_after_date?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveDisabled?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: Error | null) => void) => void;
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
    getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null) => void) => void;
    removeItems: (keys: string[], callback?: (error: Error | null) => void) => void;
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  showPopup: (
    params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text?: string;
      }>;
    },
    callback?: (buttonId: string) => void
  ) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  shareToStory: (mediaUrl: string, params?: { text?: string; widgetLink?: { url: string; name: string } }) => void;
  switchInlineQuery: (query: string, chooseChatTypes?: ('users' | 'bots' | 'groups' | 'channels')[]) => void;
  sendData: (data: string) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (qrCode: string) => boolean) => void;
  closeScanQrPopup: () => void;
}

// ==========================================
// Telegram Service
// ==========================================

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Get the Telegram WebApp instance
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

/**
 * Check if running inside Telegram
 */
export const isTelegramEnvironment = (): boolean => {
  return getTelegramWebApp() !== null;
};

/**
 * Get Telegram user data
 */
export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

/**
 * Get Telegram init data string for authentication
 */
export const getInitData = (): string | null => {
  const webApp = getTelegramWebApp();
  return webApp?.initData || null;
};

/**
 * Telegram service utilities
 */
export const telegramService = {
  // ==========================================
  // Initialization
  // ==========================================

  /**
   * Initialize the Telegram WebApp
   */
  init: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  },

  // ==========================================
  // User Data
  // ==========================================

  /**
   * Get Telegram WebApp instance
   */
  getWebApp: (): TelegramWebApp | null => {
    return getTelegramWebApp();
  },

  /**
   * Check if running inside Telegram
   */
  isTelegramEnvironment: (): boolean => {
    return isTelegramEnvironment();
  },

  /**
   * Get Telegram user
   */
  getUser: (): TelegramUser | null => {
    return getTelegramUser();
  },

  /**
   * Get init data for authentication
   */
  getInitData: (): string | null => {
    return getInitData();
  },

  /**
   * Get start parameter from deep link
   */
  getStartParam: (): string | null => {
    const webApp = getTelegramWebApp();
    return webApp?.initDataUnsafe?.start_param || null;
  },

  // ==========================================
  // Theme
  // ==========================================

  /**
   * Get current color scheme
   */
  getColorScheme: (): 'light' | 'dark' => {
    const webApp = getTelegramWebApp();
    return webApp?.colorScheme || 'dark';
  },

  /**
   * Get theme parameters
   */
  getThemeParams: (): TelegramWebApp['themeParams'] => {
    const webApp = getTelegramWebApp();
    return webApp?.themeParams || {};
  },

  /**
   * Set header color
   */
  setHeaderColor: (color: string): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.setHeaderColor(color);
    }
  },

  /**
   * Set background color
   */
  setBackgroundColor: (color: string): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.setBackgroundColor(color);
    }
  },

  // ==========================================
  // Haptic Feedback
  // ==========================================

  /**
   * Trigger impact haptic feedback
   */
  hapticImpact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  },

  /**
   * Trigger notification haptic feedback
   */
  hapticNotification: (type: 'error' | 'success' | 'warning' = 'success'): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  },

  /**
   * Trigger selection changed haptic feedback
   */
  hapticSelection: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  },

  // ==========================================
  // Buttons
  // ==========================================

  /**
   * Show back button
   */
  showBackButton: (callback: () => void): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(callback);
    }
  },

  /**
   * Hide back button
   */
  hideBackButton: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  },

  /**
   * Configure main button
   */
  configureMainButton: (params: {
    text: string;
    color?: string;
    textColor?: string;
    onClick: () => void;
  }): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.MainButton) {
      webApp.MainButton.setText(params.text);
      if (params.color) webApp.MainButton.color = params.color;
      if (params.textColor) webApp.MainButton.textColor = params.textColor;
      webApp.MainButton.onClick(params.onClick);
      webApp.MainButton.show();
    }
  },

  /**
   * Show main button
   */
  showMainButton: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.MainButton) {
      webApp.MainButton.show();
    }
  },

  /**
   * Hide main button
   */
  hideMainButton: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  },

  /**
   * Show main button loading
   */
  showMainButtonProgress: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.MainButton) {
      webApp.MainButton.showProgress();
    }
  },

  /**
   * Hide main button loading
   */
  hideMainButtonProgress: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp?.MainButton) {
      webApp.MainButton.hideProgress();
    }
  },

  // ==========================================
  // Cloud Storage
  // ==========================================

  /**
   * Set item in cloud storage
   */
  setCloudItem: (key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const webApp = getTelegramWebApp();
      if (webApp?.CloudStorage) {
        webApp.CloudStorage.setItem(key, value, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, value);
        resolve();
      }
    });
  },

  /**
   * Get item from cloud storage
   */
  getCloudItem: (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const webApp = getTelegramWebApp();
      if (webApp?.CloudStorage) {
        webApp.CloudStorage.getItem(key, (error, value) => {
          if (error) reject(error);
          else resolve(value);
        });
      } else {
        // Fallback to localStorage
        resolve(localStorage.getItem(key));
      }
    });
  },

  /**
   * Remove item from cloud storage
   */
  removeCloudItem: (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const webApp = getTelegramWebApp();
      if (webApp?.CloudStorage) {
        webApp.CloudStorage.removeItem(key, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } else {
        // Fallback to localStorage
        localStorage.removeItem(key);
        resolve();
      }
    });
  },

  // ==========================================
  // Popups & Alerts
  // ==========================================

  /**
   * Show popup dialog
   */
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }): Promise<string> => {
    return new Promise((resolve) => {
      const webApp = getTelegramWebApp();
      if (webApp) {
        webApp.showPopup(params, resolve);
      } else {
        // Fallback to browser alert
        alert(params.message);
        resolve('ok');
      }
    });
  },

  /**
   * Show alert
   */
  showAlert: (message: string): Promise<void> => {
    return new Promise((resolve) => {
      const webApp = getTelegramWebApp();
      if (webApp) {
        webApp.showAlert(message, resolve);
      } else {
        alert(message);
        resolve();
      }
    });
  },

  /**
   * Show confirmation dialog
   */
  showConfirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const webApp = getTelegramWebApp();
      if (webApp) {
        webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  },

  // ==========================================
  // Links & Sharing
  // ==========================================

  /**
   * Open external link
   */
  openLink: (url: string): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  },

  /**
   * Open Telegram link
   */
  openTelegramLink: (url: string): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  },

  /**
   * Share to story
   */
  shareToStory: (mediaUrl: string, params?: { text?: string }): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.shareToStory(mediaUrl, params);
    }
  },

  /**
   * Switch to inline query (for sharing)
   */
  switchInlineQuery: (query: string): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.switchInlineQuery(query);
    }
  },

  // ==========================================
  // App Control
  // ==========================================

  /**
   * Close the Mini App
   */
  close: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.close();
    }
  },

  /**
   * Expand the Mini App
   */
  expand: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.expand();
    }
  },

  /**
   * Enable closing confirmation
   */
  enableClosingConfirmation: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.enableClosingConfirmation();
    }
  },

  /**
   * Disable closing confirmation
   */
  disableClosingConfirmation: (): void => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.disableClosingConfirmation();
    }
  },

  // ==========================================
  // Invite Friends
  // ==========================================

  /**
   * Generate referral link
   */
  getReferralLink: (botUsername: string, referralCode: string): string => {
    return `https://t.me/${botUsername}?start=${referralCode}`;
  },

  /**
   * Share referral link
   */
  shareReferralLink: (botUsername: string, referralCode: string): void => {
    const link = telegramService.getReferralLink(botUsername, referralCode);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join CryptoVerse and earn coins! Use my referral link:')}`;
    telegramService.openTelegramLink(shareUrl);
  },
};

export default telegramService;