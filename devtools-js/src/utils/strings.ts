/**
 * Generate random alphanumeric string.
 * Useful for creating tokens, temporary passwords, or unique identifiers.
 *
 * @param len - Length of string to generate
 * @returns Random string
 */
export function randomString(len = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/**
 * Validate email address format.
 * Useful for form validation, user registration, or contact forms.
 *
 * @param email - Email address to validate
 * @returns True if email is valid, false otherwise
 */
export function isEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate URL format.
 * Useful for link validation, input sanitization, or API endpoints.
 *
 * @param url - URL to validate
 * @returns True if URL is valid, false otherwise
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Capitalize first letter of string.
 * Useful for formatting names, titles, or display text.
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to slug format.
 * Useful for URLs, filenames, or SEO-friendly identifiers.
 *
 * @param str - String to convert
 * @returns Slugified string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate string to maximum length.
 * Useful for previews, summaries, or UI display.
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append if truncated
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Check if value is a valid JSON string.
 * Useful for API responses, configuration files, or data validation.
 *
 * @param str - String to check
 * @returns True if valid JSON, false otherwise
 */
export function isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert object to query string.
 * Useful for API requests, URL parameters, or HTTP queries.
 *
 * @param obj - Object to convert
 * @returns Query string
 */
export function toQueryString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Parse query string to object.
 * Useful for URL parameters, API responses, or HTTP queries.
 *
 * @param query - Query string to parse
 * @returns Parsed object
 */
export function fromQueryString(query: string): Record<string, string> {
  return Object.fromEntries(
    query.split('&').map(pair => {
      const [key, value] = pair.split('=');
      return [decodeURIComponent(key), decodeURIComponent(value || '')];
    })
  );
}

/**
 * Generate random hex color.
 * Useful for UI design, data visualization, or theming.
 *
 * @returns Random hex color string
 */
export function randomHexColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Convert RGB to HEX color.
 * Useful for color manipulation, UI design, or theming.
 *
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns HEX color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Convert HEX to RGB color.
 * Useful for color manipulation, UI design, or theming.
 *
 * @param hex - HEX color string
 * @returns RGB object { r, g, b }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Format bytes to human-readable string.
 * Converts raw byte counts to KB, MB, GB as appropriate.
 *
 * @param n - Number of bytes
 * @returns Formatted string (e.g., "1.23 MB")
 */
export function bytes(n: number) {
  const sizes = ["B", "KB", "MB", "GB"];
  let i = 0;

  while (n >= 1024 && i < sizes.length - 1) {
    n /= 1024;
    i++;
  }

  return `${n.toFixed(2)} ${sizes[i]}`;
}

/**
 * Create cryptographic hash of input string.
 * Useful for passwords, data integrity checks, or creating fingerprints.
 *
 * @param input - String to hash
 * @param algo - Hash algorithm (sha256, sha512, etc)
 * @returns Hexadecimal hash string
 */
export function hash(input: string, algo = "sha256") {
  return crypto.subtle.digest(algo, new TextEncoder().encode(input))
    .then(buffer => Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
}

/**
 * Generate a range of numbers.
 * Useful for loops, arrays, or iterations.
 *
 * @param start - Start value
 * @param end - End value
 * @param step - Step size (default: 1)
 * @returns Array of numbers in range
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }
  return result;
}

/**
 * Shuffle an array using Fisher-Yates algorithm.
 * Useful for randomizing lists, games, or data sampling.
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculate percentage of value.
 * Useful for progress bars, statistics, or analytics.
 *
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Percentage as number
 */
export function percentage(value: number, total: number, decimals = 2): number {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
}

/**
 * Check if value is within range.
 * Useful for validation, constraints, or boundary checking.
 *
 * @param value - Value to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp value to range.
 * Useful for ensuring values stay within bounds.
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round number to specified precision.
 * Useful for financial calculations, display formatting, or data processing.
 *
 * @param value - Number to round
 * @param precision - Number of decimal places (default: 2)
 * @returns Rounded number
 */
export function round(value: number, precision = 2): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * Deep equality check for objects and arrays.
 * Useful for testing, comparisons, or data validation.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!bKeys.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a random integer within a range.
 * Useful for simulations, games, or testing scenarios.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format a number with thousands separators.
 * Useful for displaying large numbers in a readable format.
 *
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a currency value.
 * Useful for displaying monetary values with proper formatting.
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format a date string.
 * Useful for displaying dates in a consistent format.
 *
 * @param date - Date to format
 * @param options - Date formatting options
 * @returns Formatted date string
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(date);
}

/**
 * Parse a date string to Date object.
 * Useful for converting various date formats to Date objects.
 *
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Calculate the difference between two dates in milliseconds.
 * Useful for time calculations and duration measurements.
 *
 * @param date1 - First date
 * @param date2 - Second date (default: current date)
 * @returns Difference in milliseconds
 */
export function dateDiffMs(date1: Date, date2: Date = new Date()): number {
  return Math.abs(date2.getTime() - date1.getTime());
}

/**
 * Calculate the difference between two dates in days.
 * Useful for calculating age, countdowns, or time spans.
 *
 * @param date1 - First date
 * @param date2 - Second date (default: current date)
 * @returns Difference in days
 */
export function dateDiffDays(date1: Date, date2: Date = new Date()): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a year is a leap year.
 * Useful for date calculations and calendar operations.
 *
 * @param year - Year to check
 * @returns True if leap year, false otherwise
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the number of days in a month.
 * Useful for date calculations and calendar operations.
 *
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Number of days in the month
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Format a file size in bytes to human-readable format.
 * Enhanced version with more precise calculations.
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate a UUID v4 string.
 * Useful for creating unique identifiers.
 *
 * @returns UUID string
 */
export function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Check if a string is empty or contains only whitespace.
 * Useful for input validation and data cleaning.
 *
 * @param str - String to check
 * @returns True if empty or whitespace only
 */
export function isEmpty(str: string): boolean {
  return str.trim().length === 0;
}

/**
 * Remove all whitespace from a string.
 * Useful for data normalization and comparison.
 *
 * @param str - String to process
 * @returns String without whitespace
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Count the occurrences of a substring in a string.
 * Useful for text analysis and data processing.
 *
 * @param str - String to search in
 * @param search - Substring to search for
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, search: string): number {
  return str.split(search).length - 1;
}

/**
 * Reverse a string.
 * Useful for text manipulation and algorithms.
 *
 * @param str - String to reverse
 * @returns Reversed string
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Check if a string is a palindrome.
 * Useful for text analysis and algorithms.
 *
 * @param str - String to check
 * @returns True if palindrome, false otherwise
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

/**
 * Extract all words from a string.
 * Useful for text analysis and natural language processing.
 *
 * @param str - String to process
 * @returns Array of words
 */
export function extractWords(str: string): string[] {
  return str.toLowerCase().match(/\b[a-z]+\b/g) || [];
}

/**
 * Count words in a string.
 * Useful for text analysis and content processing.
 *
 * @param str - String to count words in
 * @returns Number of words
 */
export function countWords(str: string): number {
  return extractWords(str).length;
}

/**
 * Capitalize each word in a string.
 * Useful for title formatting and text processing.
 *
 * @param str - String to process
 * @returns String with capitalized words
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Convert camelCase to kebab-case.
 * Useful for CSS class names and URL slugs.
 *
 * @param str - String to convert
 * @returns kebab-case string
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase.
 * Useful for JavaScript property names and variable names.
 *
 * @param str - String to convert
 * @returns camelCase string
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert snake_case to camelCase.
 * Useful for JavaScript property names and variable names.
 *
 * @param str - String to convert
 * @returns camelCase string
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case.
 * Useful for database column names and API responses.
 *
 * @param str - String to convert
 * @returns snake_case string
 */
export function camelToSnake(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}