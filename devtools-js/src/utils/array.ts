/**
 * Split an array into chunks of specified size.
 * Useful for pagination, batch processing, or splitting large datasets.
 *
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array) || size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Flatten array with optional depth.
 * Useful for nested array processing and data transformation.
 *
 * @param array - Array to flatten
 * @param depth - Depth to flatten (default: Infinity)
 * @returns Flattened array
 */
export function flatten<T>(array: T[], depth: number = Infinity): T[] {
  if (!Array.isArray(array)) return [];
  const result: T[] = [];
  for (const item of array) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Remove duplicate values from array.
 * Useful for data cleaning, unique identification, or deduplication.
 *
 * @param array - Array to deduplicate
 * @returns Array with unique values
 */
export function unique<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return [];
  return [...new Set(array)];
}

/**
 * Group array elements by key or function result.
 * Useful for categorization, aggregation, or data organization.
 *
 * @param array - Array to group
 * @param iteratee - Function or key to group by
 * @returns Object with grouped values
 */
export function groupBy<T>(
  array: T[],
  iteratee: ((item: T) => any) | string
): Record<string, T[]> {
  if (!Array.isArray(array)) return {};
  const result: Record<string, T[]> = {};
  const getKey = typeof iteratee === 'function' ? iteratee : (item: T) => String((item as any)[iteratee]);
  
  for (const item of array) {
    const key = getKey(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/**
 * Split array into two groups based on predicate.
 * Useful for filtering, separation logic, or conditional processing.
 *
 * @param array - Array to partition
 * @param predicate - Function to test each element
 * @returns Tuple of [matching, non-matching]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  if (!Array.isArray(array)) return [[], []];
  const matching: T[] = [];
  const nonMatching: T[] = [];
  for (const item of array) {
    if (predicate(item)) matching.push(item);
    else nonMatching.push(item);
  }
  return [matching, nonMatching];
}

/**
 * Combine arrays element-wise into tuples.
 * Useful for combining related data, zipping operations, or parallel iteration.
 *
 * @param arrays - Arrays to zip
 * @returns Array of tuples
 */
export function zip<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return [];
  const length = Math.min(...arrays.map(arr => arr.length));
  const result: T[][] = [];
  for (let i = 0; i < length; i++) {
    result.push(arrays.map(arr => arr[i]));
  }
  return result;
}

/**
 * Split array of tuples into separate arrays.
 * Inverse of zip operation.
 * Useful for unzipping data or separating combined values.
 *
 * @param arrays - Array of tuples to unzip
 * @returns Array of separate arrays
 */
export function unzip<T>(arrays: T[][]): T[][] {
  if (!Array.isArray(arrays) || arrays.length === 0) return [];
  const length = arrays[0].length;
  const result: T[][] = Array.from({ length }, () => []);
  for (const tuple of arrays) {
    for (let i = 0; i < tuple.length; i++) {
      result[i].push(tuple[i]);
    }
  }
  return result;
}

/**
 * Find common elements across all arrays.
 * Useful for intersection calculations, common data finding, or overlap detection.
 *
 * @param arrays - Arrays to find intersection
 * @returns Array of common elements
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  const first = arrays[0];
  const rest = arrays.slice(1);
  return first.filter(item => rest.every(arr => arr.includes(item)));
}

/**
 * Find elements in first array not present in others.
 * Useful for difference calculations, exclusion logic, or filtering.
 *
 * @param array - Primary array
 * @param others - Arrays to exclude from
 * @returns Array of elements not in other arrays
 */
export function difference<T>(array: T[], ...others: T[][]): T[] {
  if (!Array.isArray(array)) return [];
  const excludeSet = new Set(others.flat());
  return array.filter(item => !excludeSet.has(item));
}

/**
 * Combine unique elements from all arrays.
 * Useful for union operations, merging datasets, or combining unique values.
 *
 * @param arrays - Arrays to union
 * @returns Array of unique elements from all arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return [...new Set(arrays.flat())];
}

/**
 * Sort array by property or function result.
 * Useful for sorting objects, custom sorting, or multi-level sorting.
 *
 * @param array - Array to sort
 * @param iteratee - Function or key to sort by
 * @returns New sorted array
 */
export function sortBy<T>(
  array: T[],
  iteratee: ((item: T) => any) | string
): T[] {
  if (!Array.isArray(array)) return [];
  const getValue = typeof iteratee === 'function' ? iteratee : (item: T) => (item as any)[iteratee];
  return [...array].sort((a, b) => {
    const valA = getValue(a);
    const valB = getValue(b);
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });
}

/**
 * Randomly shuffle array using Fisher-Yates algorithm.
 * Useful for randomization, games, sampling, or shuffling UI elements.
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Reverse array (immutable).
 * Useful for reversing order, descending operations, or data transformation.
 *
 * @param array - Array to reverse
 * @returns New reversed array
 */
export function reverse<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return [];
  return [...array].reverse();
}

/**
 * Remove falsy values except 0.
 * Useful for data cleaning, filtering valid values, or preprocessing.
 *
 * @param array - Array to filter
 * @returns Array without falsy values (except 0)
 */
export function compact<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return [];
  return array.filter(item => item !== null && item !== false && item !== '' && item !== undefined && item !== 0 ? true : Number.isNaN(item) ? false : true);
}

/**
 * Remove null and undefined values.
 * Useful for data cleaning, optional value filtering, or preprocessing.
 *
 * @param array - Array to filter
 * @returns Array without null and undefined
 */
export function filterNil<T>(array: T[]): NonNullable<T>[] {
  if (!Array.isArray(array)) return [];
  return array.filter((item): item is NonNullable<T> => item != null) as NonNullable<T>[];
}

/**
 * Remove first n elements from array.
 * Useful for dropping elements, offset calculations, or trimming.
 *
 * @param array - Array to drop from
 * @param n - Number of elements to remove
 * @returns New array without first n elements
 */
export function drop<T>(array: T[], n: number = 1): T[] {
  if (!Array.isArray(array)) return [];
  return array.slice(n);
}

/**
 * Get first n elements from array.
 * Useful for taking elements, limiting results, or head extraction.
 *
 * @param array - Array to take from
 * @param n - Number of elements to get
 * @returns New array with first n elements
 */
export function take<T>(array: T[], n: number = 1): T[] {
  if (!Array.isArray(array)) return [];
  return array.slice(0, n);
}

/**
 * Slice array after condition is met.
 * Useful for splitting arrays, extracting suffixes, or conditional extraction.
 *
 * @param array - Array to slice
 * @param predicate - Condition to match
 * @returns Array after first match
 */
export function sliceAfter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  if (!Array.isArray(array)) return [];
  const index = array.findIndex(predicate);
  return index === -1 ? [] : array.slice(index + 1);
}

/**
 * Slice array before condition is met.
 * Useful for splitting arrays, extracting prefixes, or conditional extraction.
 *
 * @param array - Array to slice
 * @param predicate - Condition to match
 * @returns Array before first match
 */
export function sliceBefore<T>(array: T[], predicate: (item: T) => boolean): T[] {
  if (!Array.isArray(array)) return [];
  const index = array.findIndex(predicate);
  return index === -1 ? array : array.slice(0, index);
}

/**
 * Find last matching element in array.
 * Useful for finding last occurrence, reverse search, or tail matching.
 *
 * @param array - Array to search
 * @param predicate - Condition to match
 * @returns Last matching element or undefined
 */
export function findLast<T>(
  array: T[],
  predicate: (item: T) => boolean
): T | undefined {
  if (!Array.isArray(array)) return undefined;
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return array[i];
  }
  return undefined;
}

/**
 * Find last matching index in array.
 * Useful for finding last position, reverse index search, or position tracking.
 *
 * @param array - Array to search
 * @param predicate - Condition to match
 * @returns Last matching index or -1
 */
export function findIndexLast<T>(
  array: T[],
  predicate: (item: T) => boolean
): number {
  if (!Array.isArray(array)) return -1;
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

/**
 * Check if array includes value (type guard).
 * Useful for value checking, membership tests, or presence verification.
 *
 * @param array - Array to check
 * @param value - Value to search for
 * @returns True if value is in array
 */
export function includes<T>(array: T[], value: T): boolean {
  if (!Array.isArray(array)) return false;
  return array.includes(value);
}

/**
 * Find all indices of value in array.
 * Useful for finding all occurrences, position tracking, or multiple matches.
 *
 * @param array - Array to search
 * @param value - Value to find
 * @returns Array of all indices
 */
export function indexOfAll<T>(array: T[], value: T): number[] {
  if (!Array.isArray(array)) return [];
  const indices: number[] = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) indices.push(i);
  }
  return indices;
}

/**
 * Map array with access to value and index.
 * Useful for indexed transformations, positional operations, or enriched mapping.
 *
 * @param array - Array to map
 * @param iteratee - Function with value and index
 * @returns Mapped array
 */
export function mapValues<T, U>(
  array: T[],
  iteratee: (value: T, index: number) => U
): U[] {
  if (!Array.isArray(array)) return [];
  return array.map(iteratee);
}

/**
 * Flatten array after mapping.
 * Useful for mapping with nested results, flattening transformations, or chained operations.
 *
 * @param array - Array to flatMap
 * @param iteratee - Mapping function
 * @returns Flattened and mapped array
 */
export function flatMap<T, U>(
  array: T[],
  iteratee: (value: T, index: number) => U[]
): U[] {
  if (!Array.isArray(array)) return [];
  return array.flatMap(iteratee);
}

/**
 * Reduce array from right to left.
 * Useful for right-to-left operations, fold operations, or cumulative calculations.
 *
 * @param array - Array to reduce
 * @param reducer - Reduction function
 * @param initial - Initial accumulator value
 * @returns Accumulated result
 */
export function reduceRight<T, U>(
  array: T[],
  reducer: (accumulator: U, current: T, index: number) => U,
  initial: U
): U {
  if (!Array.isArray(array)) return initial;
  let result = initial;
  for (let i = array.length - 1; i >= 0; i--) {
    result = reducer(result, array[i], i);
  }
  return result;
}

/**
 * Zip arrays with custom combine function.
 * Useful for combining arrays with transformation, custom zipping, or paired operations.
 *
 * @param arrays - Arrays to zip
 * @param iteratee - Function to combine elements
 * @returns Combined array
 */
export function zipWith<T, U>(
  arrays: T[][],
  iteratee: (...values: T[]) => U
): U[] {
  if (arrays.length === 0) return [];
  const length = Math.min(...arrays.map(arr => arr.length));
  const result: U[] = [];
  for (let i = 0; i < length; i++) {
    result.push(iteratee(...arrays.map(arr => arr[i])));
  }
  return result;
}

/**
 * Calculate sum of numbers in array.
 * Useful for aggregation, statistics, or numerical calculations.
 *
 * @param array - Array of numbers
 * @returns Sum of all numbers
 */
export function sum(array: number[]): number {
  if (!Array.isArray(array)) return 0;
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate average of numbers in array.
 * Useful for statistics, mean calculation, or data analysis.
 *
 * @param array - Array of numbers
 * @returns Average value
 */
export function mean(array: number[]): number {
  if (!Array.isArray(array) || array.length === 0) return 0;
  return array.reduce((acc, val) => acc + val, 0) / array.length;
}

/**
 * Find minimum value in array.
 * Useful for finding lowest value, boundary detection, or statistics.
 *
 * @param array - Array to search
 * @returns Minimum value
 */
export function min<T extends number | string>(array: T[]): T | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  return array.reduce((min, val) => val < min ? val : min);
}

/**
 * Find maximum value in array.
 * Useful for finding highest value, boundary detection, or statistics.
 *
 * @param array - Array to search
 * @returns Maximum value
 */
export function max<T extends number | string>(array: T[]): T | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  return array.reduce((max, val) => val > max ? val : max);
}

/**
 * Generate range of numbers.
 * Useful for loops, iterations, or creating number sequences.
 *
 * @param start - Start value
 * @param end - End value
 * @param step - Step size (default: 1)
 * @returns Array of numbers in range
 */
export function range(start: number, end: number, step: number = 1): number[] {
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
 * Repeat value specified number of times.
 * Useful for creating repeated patterns, initialization, or replication.
 *
 * @param value - Value to repeat
 * @param times - Number of times to repeat
 * @returns Array with repeated values
 */
export function repeat<T>(value: T, times: number): T[] {
  if (times <= 0) return [];
  return Array.from({ length: times }, () => value);
}

/**
 * Check if array is empty.
 * Useful for validation, emptiness checks, or conditional logic.
 *
 * @param array - Array to check
 * @returns True if array is empty
 */
export function isEmpty(array: any[]): boolean {
  return !Array.isArray(array) || array.length === 0;
}

/**
 * Get array length (safe for non-arrays).
 * Useful for size calculation, length retrieval, or counting.
 *
 * @param array - Array to measure
 * @returns Length of array or 0
 */
export function size(array: any[]): number {
  return Array.isArray(array) ? array.length : 0;
}

/**
 * Type guard to check if value is an array.
 * Useful for type narrowing, type guards, or runtime type checking.
 *
 * @param value - Value to check
 * @returns True if value is an array
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}
