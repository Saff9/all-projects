/**
 * Format utilities for numbers, dates, and strings
 */

// ==========================================
// Number Formatting
// ==========================================

/**
 * Format a number with compact notation (K, M, B, T)
 */
export function formatNumber(
  value: number | string,
  decimals: number = 1
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  if (num >= 1e12) {
    return (num / 1e12).toFixed(decimals) + 'T';
  }
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
}

/**
 * Format a number with thousand separators
 */
export function formatWithCommas(
  value: number | string,
  decimals: number = 0
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'USD',
  decimals: number = 2
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  if (isNaN(value)) return '0%';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format token amount with symbol
 */
export function formatTokenAmount(
  amount: number | string,
  symbol: string = 'CVT',
  decimals: number = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return `0 ${symbol}`;
  
  return `${formatWithCommas(num, decimals)} ${symbol}`;
}

// ==========================================
// Date Formatting
// ==========================================

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number
): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

/**
 * Format countdown timer
 */
export function formatCountdown(
  seconds: number
): string {
  if (seconds <= 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(
  seconds: number
): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
}

/**
 * Format date to locale string
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format time to locale string
 */
export function formatTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: Date | string | number
): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// ==========================================
// String Formatting
// ==========================================

/**
 * Truncate string with ellipsis
 */
export function truncateString(
  str: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (str.length <= maxLength) return str;
  
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Truncate wallet address
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Capitalize first letter
 */
export function capitalize(
  str: string
): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(
  str: string
): string {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(
  str: string
): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format username for display
 */
export function formatUsername(
  firstName?: string,
  lastName?: string,
  username?: string
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (username) {
    return `@${username}`;
  }
  return 'Anonymous';
}

// ==========================================
// Level & XP Formatting
// ==========================================

/**
 * Calculate level from total XP
 */
export function calculateLevel(
  totalXp: number,
  baseXp: number = 100,
  multiplier: number = 1.5
): number {
  if (totalXp < baseXp) return 1;
  
  let level = 1;
  let xpNeeded = baseXp;
  let totalXpNeeded = baseXp;
  
  while (totalXp >= totalXpNeeded) {
    level++;
    xpNeeded = Math.floor(xpNeeded * multiplier);
    totalXpNeeded += xpNeeded;
  }
  
  return level;
}

/**
 * Calculate XP needed for next level
 */
export function calculateXpForNextLevel(
  currentLevel: number,
  baseXp: number = 100,
  multiplier: number = 1.5
): number {
  return Math.floor(baseXp * Math.pow(multiplier, currentLevel - 1));
}

/**
 * Calculate level progress
 */
export function calculateLevelProgress(
  totalXp: number,
  currentLevel: number,
  baseXp: number = 100,
  multiplier: number = 1.5
): { current: number; needed: number; percentage: number } {
  // Calculate total XP needed to reach current level
  let xpForCurrentLevel = 0;
  for (let i = 1; i < currentLevel; i++) {
    xpForCurrentLevel += Math.floor(baseXp * Math.pow(multiplier, i - 1));
  }
  
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNext = calculateXpForNextLevel(currentLevel, baseXp, multiplier);
  
  return {
    current: xpInCurrentLevel,
    needed: xpNeededForNext,
    percentage: Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100),
  };
}

// ==========================================
// Hash & ID Formatting
// ==========================================

/**
 * Format transaction hash
 */
export function formatTxHash(
  hash: string,
  length: number = 8
): string {
  return truncateString(hash, length * 2 + 3);
}

/**
 * Generate random ID
 */
export function generateId(
  length: number = 8
): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ==========================================
// Energy & Mining Formatting
// ==========================================

/**
 * Format energy display
 */
export function formatEnergy(
  current: number,
  max: number
): string {
  return `${formatWithCommas(current)}/${formatWithCommas(max)}`;
}

/**
 * Calculate energy regeneration time
 */
export function calculateEnergyRegenTime(
  currentEnergy: number,
  maxEnergy: number,
  regenRate: number // energy per second
): number {
  if (currentEnergy >= maxEnergy) return 0;
  
  const energyNeeded = maxEnergy - currentEnergy;
  return Math.ceil(energyNeeded / regenRate);
}

/**
 * Format mining rate
 */
export function formatMiningRate(
  tokensPerHour: number
): string {
  return `${formatNumber(tokensPerHour)}/h`;
}