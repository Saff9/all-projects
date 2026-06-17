/**
 * Mobile Module - Apex Smart
 * 
 * This module provides native mobile capabilities for the Apex Smart app
 * using Capacitor plugins. It handles platform detection and provides
 * fallbacks for web environments.
 */

export {
  // Platform detection
  isNativePlatform,
  isAndroid,
  isIOS,
  isWeb,
  
  // App initialization
  initializeMobileApp,
  showSplashScreen,
  
  // Sharing
  shareContent,
  
  // File operations
  saveFile,
  readFile,
  fileExists,
  
  // Status bar
  setStatusBarStyle,
  setStatusBarColor,
  showStatusBar,
  hideStatusBar,
  
  // Keyboard
  onKeyboardShow,
  onKeyboardHide,
  removeKeyboardListeners,
} from './bridge';

export {
  // Storage
  setItem,
  getItem,
  removeItem,
  clearStorage,
  getKeys,
  setObject,
  getObject,
  StorageKeys,
} from './storage';
