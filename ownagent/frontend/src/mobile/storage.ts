import { Preferences } from '@capacitor/preferences';
import { isNativePlatform } from './bridge';

/**
 * Native Storage Wrapper for Apex Smart Mobile App
 * Uses Capacitor Preferences for native storage
 * Falls back to localStorage on web
 */

const STORAGE_PREFIX = 'genzsmart_';

/**
 * Set a value in storage
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  
  if (isNativePlatform()) {
    await Preferences.set({
      key: fullKey,
      value,
    });
  } else {
    localStorage.setItem(fullKey, value);
  }
};

/**
 * Get a value from storage
 */
export const getItem = async (key: string): Promise<string | null> => {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  
  if (isNativePlatform()) {
    const result = await Preferences.get({ key: fullKey });
    return result.value;
  } else {
    return localStorage.getItem(fullKey);
  }
};

/**
 * Remove a value from storage
 */
export const removeItem = async (key: string): Promise<void> => {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  
  if (isNativePlatform()) {
    await Preferences.remove({ key: fullKey });
  } else {
    localStorage.removeItem(fullKey);
  }
};

/**
 * Clear all app storage
 */
export const clearStorage = async (): Promise<void> => {
  if (isNativePlatform()) {
    await Preferences.clear();
  } else {
    // Only clear items with our prefix
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }
};

/**
 * Get all keys in storage
 */
export const getKeys = async (): Promise<string[]> => {
  if (isNativePlatform()) {
    const result = await Preferences.keys();
    return result.keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.replace(STORAGE_PREFIX, ''));
  } else {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  }
};

/**
 * Store object as JSON
 */
export const setObject = async <T>(key: string, value: T): Promise<void> => {
  await setItem(key, JSON.stringify(value));
};

/**
 * Get object from JSON storage
 */
export const getObject = async <T>(key: string): Promise<T | null> => {
  const value = await getItem(key);
  if (value === null) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

/**
 * Storage keys used in the app
 */
export const StorageKeys = {
  SETTINGS: 'settings',
  CHAT_HISTORY: 'chat_history',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LAST_SESSION: 'last_session',
  API_CONFIG: 'api_config',
} as const;
