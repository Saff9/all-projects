// ==========================================
// Number Utilities
// ==========================================

/**
 * Format a number with commas and optional decimal places
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format large numbers with suffixes (K, M, B, T)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Clamp a number between min and max values
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if a number is within a range
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

// ==========================================
// String Utilities
// ==========================================

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  return generateRandomString(8).toUpperCase();
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => capitalize(txt));
}

/**
 * Mask a wallet address (show first and last few characters)
 */
export function maskWalletAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ==========================================
// Date Utilities
// ==========================================

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date to a relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Format time remaining in MM:SS format
 */
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if a date is expired
 */
export function isExpired(date: Date | string): boolean {
  return new Date(date) < new Date();
}

/**
 * Get time until a date expires (in seconds)
 */
export function getTimeUntilExpiry(date: Date | string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

// ==========================================
// Validation Utilities
// ==========================================

/**
 * Validate an Ethereum wallet address
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate a Telegram username
 */
export function isValidTelegramUsername(username: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username);
}

/**
 * Validate a referral code
 */
export function isValidReferralCode(code: string): boolean {
  return /^[A-Z0-9]{6,10}$/.test(code);
}

// ==========================================
// Game Utilities
// ==========================================

/**
 * Calculate mining reward based on rate and time
 */
export function calculateMiningReward(rate: number, seconds: number): number {
  return rate * seconds;
}

/**
 * Calculate energy regeneration
 */
export function calculateEnergyRegen(
  currentEnergy: number,
  maxEnergy: number,
  regenRate: number,
  seconds: number
): number {
  return Math.min(currentEnergy + regenRate * seconds, maxEnergy);
}

/**
 * Calculate character upgrade cost
 */
export function calculateUpgradeCost(currentLevel: number, rarity: string): number {
  const baseCost = 100;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  }[rarity] || 1;

  return Math.floor(baseCost * Math.pow(1.5, currentLevel) * rarityMultiplier);
}

/**
 * Calculate experience needed for next level
 */
export function calculateExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level));
}

/**
 * Determine character rarity based on random roll
 */
export function rollCharacterRarity(): string {
  const roll = Math.random();
  let cumulative = 0;

  const rates = [
    { rarity: 'legendary', rate: 0.01 },
    { rarity: 'epic', rate: 0.04 },
    { rarity: 'rare', rate: 0.1 },
    { rarity: 'uncommon', rate: 0.25 },
    { rarity: 'common', rate: 0.6 },
  ];

  for (const { rarity, rate } of rates) {
    cumulative += rate;
    if (roll < cumulative) return rarity;
  }

  return 'common';
}

/**
 * Check if a critical hit occurs
 */
export function isCriticalHit(chance: number = 0.05): boolean {
  return Math.random() < chance;
}

// ==========================================
// Array Utilities
// ==========================================

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a random element from an array
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Chunk an array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ==========================================
// Object Utilities
// ==========================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove undefined/null values from an object
 */
export function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}
