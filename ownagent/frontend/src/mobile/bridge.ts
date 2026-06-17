import { Capacitor } from '@capacitor/core';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
// Preferences imported in storage.ts

/**
 * Native Bridge Utilities for Apex Smart Mobile App
 * Provides a unified interface for native device capabilities
 */

/**
 * Check if running on native mobile platform
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on web
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * Initialize mobile app - call on app startup
 */
export const initializeMobileApp = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    // Configure status bar for dark theme
    await StatusBar.setStyle({ style: StatusBarStyle.Dark });
    await StatusBar.setBackgroundColor({ color: '#1a1a2e' });

    // Configure keyboard resize mode - removed as it's handled in config

    // Hide splash screen after initialization
    setTimeout(async () => {
      await SplashScreen.hide();
    }, 2000);
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
};

/**
 * Show splash screen
 */
export const showSplashScreen = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  await SplashScreen.show({
    showDuration: 2000,
    autoHide: true,
  });
};

/**
 * Share content using native share sheet
 */
export const shareContent = async (options: {
  title: string;
  text: string;
  url?: string;
  files?: string[];
}): Promise<void> => {
  if (!isNativePlatform()) {
    // Fallback for web - use Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Copy to clipboard as fallback
      await navigator.clipboard.writeText(`${options.title}\n${options.text}\n${options.url || ''}`);
      alert('Content copied to clipboard!');
    }
    return;
  }

  try {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      files: options.files,
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

/**
 * Save file to device storage
 */
export const saveFile = async (
  filename: string,
  content: string,
  directory: Directory = Directory.Documents
): Promise<string | null> => {
  if (!isNativePlatform()) {
    // Web fallback - trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return null;
  }

  try {
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory,
      encoding: Encoding.UTF8,
    });
    return result.uri;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
};

/**
 * Read file from device storage
 */
export const readFile = async (
  path: string,
  directory: Directory = Directory.Documents
): Promise<string | null> => {
  if (!isNativePlatform()) return null;

  try {
    const result = await Filesystem.readFile({
      path,
      directory,
      encoding: Encoding.UTF8,
    });
    return result.data as string;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

/**
 * Check if file exists
 */
export const fileExists = async (
  path: string,
  directory: Directory = Directory.Documents
): Promise<boolean> => {
  if (!isNativePlatform()) return false;

  try {
    await Filesystem.stat({
      path,
      directory,
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Set status bar style
 */
export const setStatusBarStyle = async (dark: boolean): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({
      style: dark ? StatusBarStyle.Dark : StatusBarStyle.Light,
    });
  } catch (error) {
    console.error('Error setting status bar style:', error);
  }
};

/**
 * Set status bar background color
 */
export const setStatusBarColor = async (color: string): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Error setting status bar color:', error);
  }
};

/**
 * Show status bar
 */
export const showStatusBar = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  await StatusBar.show();
};

/**
 * Hide status bar
 */
export const hideStatusBar = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  await StatusBar.hide();
};

/**
 * Add keyboard show listener
 */
export const onKeyboardShow = (callback: (info: { keyboardHeight: number }) => void): void => {
  if (!isNativePlatform()) return;
  Keyboard.addListener('keyboardWillShow', callback);
};

/**
 * Add keyboard hide listener
 */
export const onKeyboardHide = (callback: () => void): void => {
  if (!isNativePlatform()) return;
  Keyboard.addListener('keyboardWillHide', callback);
};

/**
 * Remove all keyboard listeners
 */
export const removeKeyboardListeners = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  await Keyboard.removeAllListeners();
};
