/**
 * Telegram WebApp utilities
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
  is_premium?: boolean;
  photo_url?: string;
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
      title?: string;
      username?: string;
    };
    start_param?: string;
    can_send_after?: number;
    auth_date?: number;
    hash?: string;
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
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: Error | null) => void) => void;
    getItem: (key: string, callback: (error: Error | null, value?: string) => void) => void;
    getItems: (keys: string[], callback: (error: Error | null, values?: string[]) => void) => void;
    removeItem: (key: string, callback?: (error: Error | null) => void) => void;
    removeItems: (keys: string[], callback?: (error: Error | null) => void) => void;
    getKeys: (callback: (error: Error | null, keys?: string[]) => void) => void;
  };
  close: () => void;
  expand: () => void;
  ready: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (qrCode: string) => boolean) => void;
  closeScanQrPopup: () => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  shareToStory: (mediaUrl: string, params?: { text?: string }) => void;
  switchInlineQuery: (query: string, chooseChatTypes?: string[]) => void;
  sendData: (data: string) => void;
}

// ==========================================
// Telegram WebApp Instance
// ==========================================

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp as unknown as TelegramWebApp;
  }
  return null;
}

/**
 * Check if running inside Telegram
 */
export function isTelegramWebApp(): boolean {
  return getTelegramWebApp() !== null;
}

// ==========================================
// User Data
// ==========================================

/**
 * Get Telegram user data
 */
export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
}

/**
 * Get Telegram user ID
 */
export function getTelegramUserId(): number | null {
  const user = getTelegramUser();
  return user?.id || null;
}

/**
 * Get Telegram user display name
 */
export function getTelegramUserDisplayName(): string {
  const user = getTelegramUser();
  if (!user) return 'Guest';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.first_name || user.username || 'Guest';
}

/**
 * Get Telegram init data for authentication
 */
export function getTelegramInitData(): string | null {
  const webApp = getTelegramWebApp();
  return webApp?.initData || null;
}

/**
 * Get start parameter from deep link
 */
export function getStartParam(): string | null {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.start_param || null;
}

// ==========================================
// Theme
// ==========================================

/**
 * Get Telegram theme params
 */
export function getTelegramThemeParams(): TelegramWebApp['themeParams'] {
  const webApp = getTelegramWebApp();
  return webApp?.themeParams || {};
}

/**
 * Get Telegram color scheme
 */
export function getTelegramColorScheme(): 'light' | 'dark' {
  const webApp = getTelegramWebApp();
  return webApp?.colorScheme || 'dark';
}

/**
 * Check if dark mode
 */
export function isDarkMode(): boolean {
  return getTelegramColorScheme() === 'dark';
}

/**
 * Apply Telegram theme to CSS variables
 */
export function applyTelegramTheme(): void {
  const themeParams = getTelegramThemeParams();
  const root = document.documentElement;
  
  if (themeParams.bg_color) {
    root.style.setProperty('--tg-bg-color', themeParams.bg_color);
  }
  if (themeParams.text_color) {
    root.style.setProperty('--tg-text-color', themeParams.text_color);
  }
  if (themeParams.hint_color) {
    root.style.setProperty('--tg-hint-color', themeParams.hint_color);
  }
  if (themeParams.link_color) {
    root.style.setProperty('--tg-link-color', themeParams.link_color);
  }
  if (themeParams.button_color) {
    root.style.setProperty('--tg-button-color', themeParams.button_color);
  }
  if (themeParams.button_text_color) {
    root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
  }
  if (themeParams.secondary_bg_color) {
    root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color);
  }
}

// ==========================================
// Haptic Feedback
// ==========================================

/**
 * Trigger haptic feedback
 */
export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): void {
  const webApp = getTelegramWebApp();
  webApp?.HapticFeedback?.impactOccurred(style);
}

export function hapticNotification(type: 'error' | 'success' | 'warning'): void {
  const webApp = getTelegramWebApp();
  webApp?.HapticFeedback?.notificationOccurred(type);
}

export function hapticSelection(): void {
  const webApp = getTelegramWebApp();
  webApp?.HapticFeedback?.selectionChanged();
}

// ==========================================
// Main Button
// ==========================================

/**
 * Configure main button
 */
export function configureMainButton(options: {
  text?: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
}): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.MainButton) return;
  
  if (options.text) {
    webApp.MainButton.setText(options.text);
  }
  if (options.color) {
    webApp.MainButton.color = options.color;
  }
  if (options.textColor) {
    webApp.MainButton.textColor = options.textColor;
  }
  if (options.onClick) {
    webApp.MainButton.onClick(options.onClick);
  }
}

/**
 * Show main button
 */
export function showMainButton(): void {
  const webApp = getTelegramWebApp();
  webApp?.MainButton?.show();
}

/**
 * Hide main button
 */
export function hideMainButton(): void {
  const webApp = getTelegramWebApp();
  webApp?.MainButton?.hide();
}

/**
 * Show main button loading
 */
export function showMainButtonProgress(): void {
  const webApp = getTelegramWebApp();
  webApp?.MainButton?.showProgress();
}

/**
 * Hide main button loading
 */
export function hideMainButtonProgress(): void {
  const webApp = getTelegramWebApp();
  webApp?.MainButton?.hideProgress();
}

// ==========================================
// Back Button
// ==========================================

/**
 * Show back button
 */
export function showBackButton(callback?: () => void): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.BackButton) return;
  
  webApp.BackButton.show();
  if (callback) {
    webApp.BackButton.onClick(callback);
  }
}

/**
 * Hide back button
 */
export function hideBackButton(): void {
  const webApp = getTelegramWebApp();
  webApp?.BackButton?.hide();
}

// ==========================================
// Popups & Alerts
// ==========================================

/**
 * Show alert popup
 */
export function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp?.showAlert) {
      webApp.showAlert(message, resolve);
    } else {
      alert(message);
      resolve();
    }
  });
}

/**
 * Show confirm popup
 */
export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp?.showConfirm) {
      webApp.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
}

/**
 * Show custom popup
 */
export function showPopup(params: {
  title?: string;
  message: string;
  buttons?: Array<{
    id?: string;
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    text?: string;
  }>;
}): Promise<string> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp?.showPopup) {
      webApp.showPopup(params, resolve);
    } else {
      alert(params.message);
      resolve('ok');
    }
  });
}

// ==========================================
// Links & Sharing
// ==========================================

/**
 * Open external link
 */
export function openExternalLink(url: string, tryInstantView: boolean = false): void {
  const webApp = getTelegramWebApp();
  if (webApp?.openLink) {
    webApp.openLink(url, { try_instant_view: tryInstantView });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Open Telegram link
 */
export function openTelegramLink(url: string): void {
  const webApp = getTelegramWebApp();
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Share to story
 */
export function shareToStory(mediaUrl: string, text?: string): void {
  const webApp = getTelegramWebApp();
  webApp?.shareToStory?.(mediaUrl, { text });
}

/**
 * Switch to inline query
 */
export function switchInlineQuery(query: string, chatTypes?: string[]): void {
  const webApp = getTelegramWebApp();
  webApp?.switchInlineQuery?.(query, chatTypes);
}

// ==========================================
// Cloud Storage
// ==========================================

/**
 * Save to Telegram cloud storage
 */
export function saveToCloudStorage(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const webApp = getTelegramWebApp();
    if (!webApp?.CloudStorage) {
      reject(new Error('Cloud storage not available'));
      return;
    }
    
    webApp.CloudStorage.setItem(key, value, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get from Telegram cloud storage
 */
export function getFromCloudStorage(key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const webApp = getTelegramWebApp();
    if (!webApp?.CloudStorage) {
      reject(new Error('Cloud storage not available'));
      return;
    }
    
    webApp.CloudStorage.getItem(key, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value || null);
      }
    });
  });
}

/**
 * Remove from Telegram cloud storage
 */
export function removeFromCloudStorage(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const webApp = getTelegramWebApp();
    if (!webApp?.CloudStorage) {
      reject(new Error('Cloud storage not available'));
      return;
    }
    
    webApp.CloudStorage.removeItem(key, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// ==========================================
// App Control
// ==========================================

/**
 * Close the mini app
 */
export function closeApp(): void {
  const webApp = getTelegramWebApp();
  webApp?.close();
}

/**
 * Expand the mini app
 */
export function expandApp(): void {
  const webApp = getTelegramWebApp();
  webApp?.expand();
}

/**
 * Mark app as ready
 */
export function readyApp(): void {
  const webApp = getTelegramWebApp();
  webApp?.ready();
}

/**
 * Enable closing confirmation
 */
export function enableClosingConfirmation(): void {
  const webApp = getTelegramWebApp();
  webApp?.enableClosingConfirmation();
}

/**
 * Disable closing confirmation
 */
export function disableClosingConfirmation(): void {
  const webApp = getTelegramWebApp();
  webApp?.disableClosingConfirmation();
}

// ==========================================
// Utilities
// ==========================================

/**
 * Get referral link
 */
export function getReferralLink(botUsername: string, referralCode: string): string {
  return `https://t.me/${botUsername}?start=${referralCode}`;
}

/**
 * Share referral link
 */
export function shareReferralLink(botUsername: string, referralCode: string): void {
  const link = getReferralLink(botUsername, referralCode);
  const text = `Join CryptoVerse and start earning! Use my referral link:`;
  
  switchInlineQuery(`${text} ${link}`);
}

/**
 * Check if user is premium
 */
export function isPremiumUser(): boolean {
  const user = getTelegramUser();
  return user?.is_premium || false;
}

/**
 * Get platform
 */
export function getPlatform(): string {
  const webApp = getTelegramWebApp();
  return webApp?.platform || 'unknown';
}

/**
 * Get WebApp version
 */
export function getWebAppVersion(): string {
  const webApp = getTelegramWebApp();
  return webApp?.version || '0.0';
}