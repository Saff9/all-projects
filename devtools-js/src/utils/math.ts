/**
 * @fileoverview Comprehensive math utilities for developers
 * @version 1.0.0
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** Mathematical PI (π) - ratio of circumference to diameter */
export const PI = Math.PI;

/** Euler's number (e) - base of natural logarithm */
export const E = Math.E;

/** Tau (τ) - 2π, the circle constant */
export const TAU = 2 * Math.PI;

/** Positive infinity */
export const INFINITY = Infinity;

/** Negative infinity */
export const NEGATIVE_INFINITY = -Infinity;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Type for numeric inputs that can be number or bigint */
export type Numeric = number | bigint;

/** Type for array of numbers */
export type NumberArray = number[];

/** Type for weighted random selection */
export type WeightedItem<T> = { value: T; weight: number };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if value is a valid number (not NaN, Infinity, or -Infinity)
 * @param n - Value to check
 * @returns True if valid number
 */
function isValidNumber(n: number): boolean {
  return typeof n === 'number' && !isNaN(n) && isFinite(n);
}

/**
 * Convert input to number if possible
 * @param n - Value to convert
 * @returns Number or NaN
 */
function toNumber(n: number | bigint): number {
  return typeof n === 'bigint' ? Number(n) : n;
}

/**
 * Sort numbers in ascending order
 * @param nums - Array of numbers
 * @returns Sorted array
 */
function sortNumbers(nums: number[]): number[] {
  return [...nums].sort((a, b) => a - b);
}

// =============================================================================
// BASIC MATH OPERATIONS
// =============================================================================

/**
 * Add two numbers together.
 * Useful for basic arithmetic calculations.
 *
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract b from a.
 * Useful for basic arithmetic calculations.
 *
 * @param a - First number
 * @param b - Second number
 * @returns Difference of a and b
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply two numbers together.
 * Useful for basic arithmetic calculations.
 *
 * @param a - First number
 * @param b - Second number
 * @returns Product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divide a by b with division by zero check.
 * Useful for basic arithmetic calculations.
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns Quotient of a and b, or NaN if b is 0
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    console.warn('Division by zero attempted');
    return NaN;
  }
  return a / b;
}

/**
 * Calculate modulo (remainder after division).
 * Useful for cycling values, wrapping, or checking divisibility.
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns Remainder of a divided by b
 */
export function modulo(a: number, b: number): number {
  if (b === 0) {
    console.warn('Modulo by zero attempted');
    return NaN;
  }
  return a % b;
}

/**
 * Calculate base raised to exponent power.
 * Useful for exponential calculations and scaling.
 *
 * @param base - Base number
 * @param exponent - Exponent
 * @returns Base raised to exponent
 */
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

/**
 * Calculate square root of a number.
 * Useful for geometry, statistics, and distance calculations.
 *
 * @param n - Number to find square root of
 * @returns Square root of n, or NaN if n is negative
 */
export function sqrt(n: number): number {
  if (n < 0) {
    console.warn('Square root of negative number attempted');
    return NaN;
  }
  return Math.sqrt(n);
}

/**
 * Calculate nth root of a number.
 * Useful for solving equations and finding roots.
 *
 * @param n - Number to find root of
 * @param root - Root degree (2 for square root, 3 for cube root, etc.)
 * @returns nth root of n, or NaN for invalid inputs
 */
export function root(n: number, root: number): number {
  if (n < 0 && root % 2 === 0) {
    console.warn('Even root of negative number attempted');
    return NaN;
  }
  if (root === 0) {
    console.warn('Zero root attempted');
    return NaN;
  }
  return Math.pow(n, 1 / root);
}

/**
 * Calculate factorial of a number.
 * Useful for permutations, combinations, and probability calculations.
 * Supports BigInt for large numbers.
 *
 * @param n - Non-negative integer
 * @returns Factorial as number or BigInt
 */
export function factorial(n: number): number | bigint {
  if (n < 0) {
    console.warn('Factorial of negative number attempted');
    return NaN;
  }
  if (n > 170) {
    // Use BigInt for very large numbers
    let result = 1n;
    for (let i = 2n; i <= BigInt(n); i++) {
      result *= i;
    }
    return result;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// =============================================================================
// CLAMPING & LIMITING
// =============================================================================

/**
 * Clamp a number between min and max values.
 * Useful for constraining values within a range.
 *
 * @param n - Number to clamp
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Clamped number
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Map a value from one range to another.
 * Useful for scaling, normalization, and unit conversions.
 *
 * @param value - Value to map
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Limit a number to a maximum value.
 * Useful for constraining upper bounds.
 *
 * @param n - Number to limit
 * @param max - Maximum value
 * @returns Limited number
 */
export function limit(n: number, max: number): number {
  return Math.min(n, max);
}

/**
 * Floor a number to specified decimal places.
 * Useful for rounding down currency values or measurements.
 *
 * @param n - Number to floor
 * @param decimals - Number of decimal places (default: 0)
 * @returns Floored number
 */
export function floor(n: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(n * factor) / factor;
}

/**
 * Ceiling a number to specified decimal places.
 * Useful for rounding up to whole numbers or decimals.
 *
 * @param n - Number to ceiling
 * @param decimals - Number of decimal places (default: 0)
 * @returns Ceiled number
 */
export function ceil(n: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(n * factor) / factor;
}

/**
 * Round a number to specified decimal places.
 * Useful for standard rounding in calculations.
 *
 * @param n - Number to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded number
 */
export function round(n: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

/**
 * Truncate a number to specified decimal places.
 * Useful for cutting off without rounding.
 *
 * @param n - Number to truncate
 * @param decimals - Number of decimal places (default: 0)
 * @returns Truncated number
 */
export function truncate(n: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.trunc(n * factor) / factor;
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Calculate sum of numbers.
 * Useful for aggregations and statistics.
 *
 * @param numbers - Numbers to sum
 * @returns Sum of all numbers
 */
export function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * Calculate product of numbers.
 * Useful for scaling and multiplicative operations.
 *
 * @param numbers - Numbers to multiply
 * @returns Product of all numbers
 */
export function product(...numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, n) => acc * n, 1);
}

/**
 * Calculate arithmetic mean (average) of numbers.
 * Useful for central tendency calculations.
 *
 * @param numbers - Numbers to average
 * @returns Mean value, or NaN if empty
 */
export function mean(...numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  return sum(...numbers) / numbers.length;
}

/**
 * Calculate median of numbers.
 * Useful for robust central tendency calculations.
 *
 * @param numbers - Numbers to find median of
 * @returns Median value, or NaN if empty
 */
export function median(...numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  
  const sorted = sortNumbers(numbers);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate mode of numbers (most frequent value).
 * Useful for finding the most common value in a dataset.
 *
 * @param numbers - Numbers to find mode of
 * @returns Mode value, or array of modes if multiple, or NaN if empty
 */
export function mode(...numbers: number[]): number | number[] {
  if (numbers.length === 0) return NaN;
  
  const frequency: Map<number, number> = new Map();
  for (const n of numbers) {
    frequency.set(n, (frequency.get(n) || 0) + 1);
  }
  
  let maxFreq = 0;
  for (const freq of frequency.values()) {
    if (freq > maxFreq) maxFreq = freq;
  }
  
  const modes: number[] = [];
  for (const [n, freq] of frequency) {
    if (freq === maxFreq) modes.push(n);
  }
  
  return modes.length === 1 ? modes[0] : modes;
}

/**
 * Calculate variance of numbers.
 * Useful for measuring spread of data.
 *
 * @param numbers - Numbers to calculate variance of
 * @returns Variance, or NaN if fewer than 2 numbers
 */
export function variance(...numbers: number[]): number {
  if (numbers.length < 2) return NaN;
  
  const avg = mean(...numbers);
  const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
  return mean(...squaredDiffs);
}

/**
 * Calculate standard deviation of numbers.
 * Useful for measuring dispersion of data.
 *
 * @param numbers - Numbers to calculate std dev of
 * @returns Standard deviation, or NaN if fewer than 2 numbers
 */
export function standardDeviation(...numbers: number[]): number {
  return sqrt(variance(...numbers));
}

/**
 * Calculate harmonic mean of numbers.
 * Useful for averaging rates and ratios.
 *
 * @param numbers - Numbers to calculate harmonic mean of
 * @returns Harmonic mean, or NaN if empty or contains zero
 */
export function harmonicMean(...numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  if (numbers.some(n => n === 0)) return NaN;
  
  const sumOfReciprocals = numbers.reduce((acc, n) => acc + 1 / n, 0);
  return numbers.length / sumOfReciprocals;
}

/**
 * Calculate geometric mean of numbers.
 * Useful for growth rates and multiplicative data.
 *
 * @param numbers - Numbers to calculate geometric mean of
 * @returns Geometric mean, or NaN if empty or contains negative
 */
export function geometricMean(...numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  if (numbers.some(n => n < 0)) return NaN;
  
  const productOfNumbers = numbers.reduce((acc, n) => acc * n, 1);
  return Math.pow(productOfNumbers, 1 / numbers.length);
}

// =============================================================================
// MIN/MAX
// =============================================================================

/**
 * Find minimum value among numbers.
 * Useful for finding smallest value in a dataset.
 *
 * @param numbers - Numbers to compare
 * @returns Minimum value, or Infinity if empty
 */
export function min(...numbers: number[]): number {
  if (numbers.length === 0) return Infinity;
  return Math.min(...numbers);
}

/**
 * Find maximum value among numbers.
 * Useful for finding largest value in a dataset.
 *
 * @param numbers - Numbers to compare
 * @returns Maximum value, or -Infinity if empty
 */
export function max(...numbers: number[]): number {
  if (numbers.length === 0) return -Infinity;
  return Math.max(...numbers);
}

/**
 * Calculate range (max - min) of numbers.
 * Useful for measuring spread of data.
 *
 * @param numbers - Numbers to calculate range of
 * @returns Range value, or 0 if empty
 */
export function range(...numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return max(...numbers) - min(...numbers);
}

/**
 * Calculate pth percentile of numbers.
 * Useful for finding thresholds and benchmarks.
 *
 * @param numbers - Array of numbers
 * @param p - Percentile (0-100)
 * @returns Percentile value, or NaN if invalid input
 */
export function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0 || p < 0 || p > 100) return NaN;
  
  const sorted = sortNumbers(numbers);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) return sorted[lower];
  
  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Calculate qth quantile of numbers.
 * Useful for splitting data into equal parts.
 *
 * @param numbers - Array of numbers
 * @param q - Quantile (0-1, e.g., 0.25 for first quartile)
 * @returns Quantile value, or NaN if invalid input
 */
export function quantile(numbers: number[], q: number): number {
  return percentile(numbers, q * 100);
}

// =============================================================================
// RANDOM & PROBABILITY
// =============================================================================

/**
 * Generate random float between 0 and 1.
 * Useful for basic random number generation.
 *
 * @returns Random float between 0 (inclusive) and 1 (exclusive)
 */
export function random(): number {
  return Math.random();
}

/**
 * Generate random integer between min and max (inclusive).
 * Useful for random selections and simulations.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max.
 * Useful for generating random decimals.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Random float
 */
export function randomFloat(min: number, max: number, decimals = 2): number {
  return round(Math.random() * (max - min) + min, decimals);
}

/**
 * Generate random boolean.
 * Useful for binary decisions and coin flips.
 *
 * @returns Random true or false
 */
export function randomBool(): boolean {
  return Math.random() < 0.5;
}

/**
 * Select random item from array.
 * Useful for random sampling and selections.
 *
 * @param array - Array to select from
 * @returns Random item, or undefined if empty
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array using Fisher-Yates algorithm.
 * Useful for randomizing lists and deck shuffling.
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
 * Select weighted random item.
 * Useful for biased random selections and loot tables.
 *
 * @param weights - Array of {value, weight} pairs
 * @returns Selected value based on weights
 */
export function weightedRandom<T>(weights: WeightedItem<T>[]): T | undefined {
  if (weights.length === 0) return undefined;
  
  const totalWeight = weights.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of weights) {
    random -= item.weight;
    if (random <= 0) return item.value;
  }
  
  return weights[weights.length - 1].value;
}

/**
 * Generate random number using Gaussian/normal distribution.
 * Useful for simulations and natural phenomena modeling.
 *
 * @param mean - Mean of distribution
 * @param stdDev - Standard deviation
 * @returns Random number from normal distribution
 */
export function gaussianRandom(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// =============================================================================
// NUMBER THEORY
// =============================================================================

/**
 * Calculate greatest common divisor using Euclidean algorithm.
 * Useful for simplifying fractions and cryptography.
 *
 * @param a - First number
 * @param b - Second number
 * @returns GCD of a and b
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  return a;
}

/**
 * Calculate least common multiple.
 * Useful for finding common denominators and scheduling.
 *
 * @param a - First number
 * @param b - Second number
 * @returns LCM of a and b
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

/**
 * Check if number is even.
 * Useful for parity checks and divisibility.
 *
 * @param n - Number to check
 * @returns True if even
 */
export function isEven(n: number): boolean {
  return n % 2 === 0;
}

/**
 * Check if number is odd.
 * Useful for parity checks and divisibility.
 *
 * @param n - Number to check
 * @returns True if odd
 */
export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

/**
 * Check if number is prime using trial division.
 * Useful for prime testing and factorization.
 *
 * @param n - Number to check
 * @returns True if prime
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  const sqrtN = Math.sqrt(n);
  for (let i = 3; i <= sqrtN; i += 2) {
    if (n % i === 0) return false;
  }
  
  return true;
}

/**
 * Check if number is a perfect square.
 * Useful for geometry and number theory.
 *
 * @param n - Number to check
 * @returns True if perfect square
 */
export function isPerfectSquare(n: number): boolean {
  if (n < 0) return false;
  const sqrtN = Math.sqrt(n);
  return Number.isInteger(sqrtN);
}

/**
 * Check if number is a power of two.
 * Useful for bitwise operations and computer science.
 *
 * @param n - Number to check
 * @returns True if power of two
 */
export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Calculate next power of two greater than or equal to n.
 * Useful for buffer sizing and memory alignment.
 *
 * @param n - Number to find next power of two for
 * @returns Next power of two
 */
export function nextPowerOfTwo(n: number): number {
  if (n < 0) return 1;
  if (isPowerOfTwo(n)) return n;
  
  let result = 1;
  while (result < n) {
    result *= 2;
  }
  return result;
}

/**
 * Calculate prime factorization of a number.
 * Useful for number theory and cryptography.
 *
 * @param n - Number to factorize
 * @returns Array of prime factors
 */
export function primeFactors(n: number): number[] {
  if (n < 2) return [];
  
  const factors: number[] = [];
  
  // Factor out 2
  while (n % 2 === 0) {
    factors.push(2);
    n /= 2;
  }
  
  // Factor out odd numbers
  let i = 3;
  while (i * i <= n) {
    while (n % i === 0) {
      factors.push(i);
      n /= i;
    }
    i += 2;
  }
  
  // If n is still greater than 1, it's a prime factor
  if (n > 1) {
    factors.push(n);
  }
  
  return factors;
}

// =============================================================================
// TRIGONOMETRY (RADIANS)
// =============================================================================

/**
 * Convert degrees to radians.
 * Useful for angle conversions.
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 * Useful for angle conversions.
 *
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate sine of angle.
 * Useful for waves, circles, and periodic functions.
 *
 * @param angle - Angle in radians
 * @returns Sine of angle
 */
export function sin(angle: number): number {
  return Math.sin(angle);
}

/**
 * Calculate cosine of angle.
 * Useful for waves, circles, and periodic functions.
 *
 * @param angle - Angle in radians
 * @returns Cosine of angle
 */
export function cos(angle: number): number {
  return Math.cos(angle);
}

/**
 * Calculate tangent of angle.
 * Useful for slopes, angles, and periodic functions.
 *
 * @param angle - Angle in radians
 * @returns Tangent of angle
 */
export function tan(angle: number): number {
  return Math.tan(angle);
}

/**
 * Calculate arc sine (inverse sine).
 * Useful for finding angles from ratios.
 *
 * @param value - Value between -1 and 1
 * @returns Angle in radians
 */
export function asin(value: number): number {
  if (value < -1 || value > 1) return NaN;
  return Math.asin(value);
}

/**
 * Calculate arc cosine (inverse cosine).
 * Useful for finding angles from ratios.
 *
 * @param value - Value between -1 and 1
 * @returns Angle in radians
 */
export function acos(value: number): number {
  if (value < -1 || value > 1) return NaN;
  return Math.acos(value);
}

/**
 * Calculate arc tangent (inverse tangent).
 * Useful for finding angles from slopes.
 *
 * @param value - Numeric value
 * @returns Angle in radians
 */
export function atan(value: number): number {
  return Math.atan(value);
}

/**
 * Calculate arc tangent with two arguments (y/x).
 * Useful for finding angles in all quadrants.
 *
 * @param y - Y coordinate
 * @param x - X coordinate
 * @returns Angle in radians
 */
export function atan2(y: number, x: number): number {
  return Math.atan2(y, x);
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format number with thousands separators.
 * Useful for displaying large numbers.
 *
 * @param n - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format number as currency.
 * Useful for displaying monetary values.
 *
 * @param n - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  n: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(n);
}

/**
 * Format number as percentage.
 * Useful for displaying ratios and proportions.
 *
 * @param n - Number to format (e.g., 0.5 for 50%)
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted percentage string
 */
export function formatPercent(
  n: number,
  decimals = 0,
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n);
}

/**
 * Format number in compact notation (1K, 1M, 1B, etc.).
 * Useful for displaying large numbers concisely.
 *
 * @param n - Number to format
 * @returns Compact formatted string
 */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(n);
}

/**
 * Format bytes to human-readable string.
 * Useful for displaying file sizes and memory.
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.23 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

// =============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate absolute value.
 * Useful for distance and magnitude calculations.
 *
 * @param n - Number
 * @returns Absolute value
 */
export function abs(n: number): number {
  return Math.abs(n);
}

/**
 * Calculate sign of number.
 * Useful for determining direction or sign.
 *
 * @param n - Number
 * @returns 1 for positive, -1 for negative, 0 or NaN for zero/NaN
 */
export function sign(n: number): number {
  return Math.sign(n);
}

/**
 * Calculate exponential (e^n).
 * Useful for growth calculations and natural logarithms.
 *
 * @param n - Exponent
 * @returns e raised to power n
 */
export function exp(n: number): number {
  return Math.exp(n);
}

/**
 * Calculate natural logarithm.
 * Useful for exponential equations and growth rates.
 *
 * @param n - Number
 * @returns Natural logarithm
 */
export function log(n: number): number {
  if (n <= 0) return NaN;
  return Math.log(n);
}

/**
 * Calculate logarithm base 10.
 * Useful for scientific calculations and pH.
 *
 * @param n - Number
 * @returns Logarithm base 10
 */
export function log10(n: number): number {
  if (n <= 0) return NaN;
  return Math.log10(n);
}

/**
 * Calculate logarithm base 2.
 * Useful for computer science and information theory.
 *
 * @param n - Number
 * @returns Logarithm base 2
 */
export function log2(n: number): number {
  if (n <= 0) return NaN;
  return Math.log2(n);
}

/**
 * Hypotenuse calculation (sqrt(a^2 + b^2)).
 * Useful for distance calculations and Pythagorean theorem.
 *
 * @param a - First leg
 * @param b - Second leg
 * @returns Hypotenuse
 */
export function hypot(...values: number[]): number {
  return Math.hypot(...values);
}

/**
 * Cubic root.
 * Useful for finding cube roots and solving cubic equations.
 *
 * @param n - Number
 * @returns Cubic root
 */
export function cbrt(n: number): number {
  return Math.cbrt(n);
}
