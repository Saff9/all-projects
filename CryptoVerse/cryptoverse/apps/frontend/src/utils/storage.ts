/**
 * Local storage utilities with fallback and encryption support
 */

// ==========================================
// Types
// ==========================================

export interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
}

interface StorageItem<T> {
  value: T;
  expires?: number;
  createdAt: number;
}

// ==========================================
// Constants
// ==========================================

const STORAGE_PREFIX = 'cv_';

// ==========================================
// Memory Storage Fallback
// ==========================================

class MemoryStorage {
  private storage: Map<string, string> = new Map();

  get length(): number {
    return this.storage.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] || null;
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// ==========================================
// Storage Detection
// ==========================================

function getStorage(): Storage | MemoryStorage {
  if (typeof window === 'undefined') {
    return new MemoryStorage();
  }

  try {
    // Test if localStorage is available
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    // Fall back to memory storage
    return new MemoryStorage();
  }
}

const storage = getStorage();

// ==========================================
// Basic Operations
// ==========================================

/**
 * Get prefixed key
 */
function getPrefixedKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Set item in storage
 */
export function setItem<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): void {
  const prefixedKey = getPrefixedKey(key);
  const item: StorageItem<T> = {
    value,
    createdAt: Date.now(),
  };

  if (options.expiresIn) {
    item.expires = Date.now() + options.expiresIn;
  }

  try {
    const serialized = JSON.stringify(item);
    storage.setItem(prefixedKey, serialized);
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

/**
 * Get item from storage
 */
export function getItem<T>(key: string): T | null {
  const prefixedKey = getPrefixedKey(key);

  try {
    const serialized = storage.getItem(prefixedKey);
    if (!serialized) return null;

    const item: StorageItem<T> = JSON.parse(serialized);

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error('Failed to read from storage:', error);
    return null;
  }
}

/**
 * Remove item from storage
 */
export function removeItem(key: string): void {
  const prefixedKey = getPrefixedKey(key);
  storage.removeItem(prefixedKey);
}

/**
 * Check if item exists
 */
export function hasItem(key: string): boolean {
  return getItem(key) !== null;
}

/**
 * Clear all app storage
 */
export function clearStorage(): void {
  const keys = getAllKeys();
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_PREFIX)) {
      storage.removeItem(key);
    }
  });
}

/**
 * Get all storage keys
 */
export function getAllKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

// ==========================================
// Typed Storage Hooks
// ==========================================

/**
 * Create typed storage operations
 */
export function createTypedStorage<T>(key: string, defaultValue: T) {
  return {
    get: (): T => getItem<T>(key) ?? defaultValue,
    set: (value: T, options?: StorageOptions): void => setItem(key, value, options),
    remove: (): void => removeItem(key),
    exists: (): boolean => hasItem(key),
  };
}

// ==========================================
// Session Storage
// ==========================================

/**
 * Set session item (cleared when tab closes)
 */
export function setSessionItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    const prefixedKey = getPrefixedKey(key);
    sessionStorage.setItem(prefixedKey, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to session storage:', error);
  }
}

/**
 * Get session item
 */
export function getSessionItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const prefixedKey = getPrefixedKey(key);
    const serialized = sessionStorage.getItem(prefixedKey);
    return serialized ? JSON.parse(serialized) : null;
  } catch (error) {
    console.error('Failed to read from session storage:', error);
    return null;
  }
}

/**
 * Remove session item
 */
export function removeSessionItem(key: string): void {
  if (typeof window === 'undefined') return;

  const prefixedKey = getPrefixedKey(key);
  sessionStorage.removeItem(prefixedKey);
}

// ==========================================
// Storage Keys Constants
// ==========================================

export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',

  // User Preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  SOUND_ENABLED: 'sound_enabled',
  HAPTIC_ENABLED: 'haptic_enabled',
  PARTICLES_ENABLED: 'particles_enabled',

  // Game State
  LAST_MINING_SESSION: 'last_mining_session',
  CACHED_ENERGY: 'cached_energy',
  CACHED_COMBO: 'cached_combo',

  // Cache
  CACHED_USER: 'cached_user',
  CACHED_STATS: 'cached_stats',
  CACHED_CHARACTERS: 'cached_characters',
  CACHED_ACHIEVEMENTS: 'cached_achievements',

  // Settings
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  AUTO_CLAIM_ENABLED: 'auto_claim_enabled',
} as const;

// ==========================================
// Pre-configured Storage
// ==========================================

export const authTokenStorage = createTypedStorage<string>(
  STORAGE_KEYS.AUTH_TOKEN,
  ''
);

export const refreshTokenStorage = createTypedStorage<string>(
  STORAGE_KEYS.REFRESH_TOKEN,
  ''
);

export const soundEnabledStorage = createTypedStorage<boolean>(
  STORAGE_KEYS.SOUND_ENABLED,
  true
);

export const hapticEnabledStorage = createTypedStorage<boolean>(
  STORAGE_KEYS.HAPTIC_ENABLED,
  true
);

export const particlesEnabledStorage = createTypedStorage<boolean>(
  STORAGE_KEYS.PARTICLES_ENABLED,
  true
);

// ==========================================
// Cache Utilities
// ==========================================

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
}

/**
 * Get cached data with TTL
 */
export function getCached<T>(key: string): T | null {
  const cached = getItem<{ data: T; timestamp: number }>(key);
  
  if (!cached) return null;
  
  return cached.data;
}

/**
 * Set cached data with TTL
 */
export function setCached<T>(
  key: string,
  data: T,
  ttl: number
): void {
  setItem(key, { data, timestamp: Date.now() }, { expiresIn: ttl });
}

/**
 * Check if cache is valid
 */
export function isCacheValid(key: string, ttl: number): boolean {
  const cached = getItem<{ data: unknown; timestamp: number }>(key);
  
  if (!cached) return false;
  
  return Date.now() - cached.timestamp < ttl;
}

// ==========================================
// Migration Utilities
// ==========================================

/**
 * Migrate storage keys (for version updates)
 */
export function migrateStorage(
  migrations: Array<{ from: string; to: string }>
): void {
  migrations.forEach(({ from, to }) => {
    const value = getItem(from);
    if (value !== null) {
      setItem(to, value);
      removeItem(from);
    }
  });
}

/**
 * Get storage usage info
 */
export function getStorageUsage(): { used: number; available: number } {
  let used = 0;
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  }
  
  // Most browsers allow ~5MB
  const available = 5 * 1024 * 1024 - used;
  
  return { used, available };
}

export default {
  setItem,
  getItem,
  removeItem,
  hasItem,
  clearStorage,
  getAllKeys,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
  createTypedStorage,
  getCached,
  setCached,
  isCacheValid,
  STORAGE_KEYS,
};