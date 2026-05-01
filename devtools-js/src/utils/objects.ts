import { logger } from '../index.js';

/**
 * Create deep copy of object to avoid reference issues.
 * Uses structuredClone for reliable deep cloning of complex objects.
 */
export const deepClone = <T>(obj: T): T =>
  structuredClone(obj);

/**
 * Select specific properties from object.
 * Creates new object with only specified keys.
 *
 * @param obj - Source object
 * @param keys - Array of keys to include
 * @returns New object with only specified properties
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: any = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Exclude specific properties from object.
 * Creates new object without specified keys.
 *
 * @param obj - Source object
 * @param keys - Array of keys to exclude
 * @returns New object without specified properties
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Deep merge multiple objects into one.
 * Combines properties recursively, preserving nested object structure.
 * Arrays are overwritten, not merged.
 *
 * @param objects - Objects to merge
 * @returns Merged object
 */
export function merge<T extends object, U extends object>(target: T, source: U): T & U;
export function merge<T extends object>(...objects: T[]): T;
export function merge<T extends object>(...objects: T[]): T {
  if (objects.length === 0) return {} as T;

  const result = { ...objects[0] };

  for (let i = 1; i < objects.length; i++) {
    const source = objects[i];
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' &&
          result[key] !== null && typeof result[key] === 'object' &&
          !Array.isArray(source[key]) && !Array.isArray(result[key])) {
        // Deep merge objects (not arrays)
        result[key] = merge(result[key], source[key]);
      } else {
        // Overwrite with source value
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Check if value is empty.
 * Handles null, undefined, empty arrays, empty objects, and empty strings.
 *
 * @param val - Value to check
 * @returns True if value is empty, false otherwise
 */
export function isEmpty(val: any) {
  if (val == null) return true;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  if (typeof val === "string") return val.trim().length === 0;
  return false;
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
 * Create a memoized version of a function with cache management.
 * Useful for performance optimization, caching, or expensive computations.
 *
 * @param fn - Function to memoize
 * @param options - Cache configuration options
 * @returns Memoized function with cache management
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    maxSize?: number;
    ttl?: number; // Time to live in milliseconds
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  const { maxSize = Infinity, ttl = Infinity, keyGenerator = (args: Parameters<T>) => JSON.stringify(args) } = options || {};
  const cache = new Map<string, { value: any; timestamp: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator(args);
    const now = Date.now();

    // Check if cached value exists and is still valid
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      if (now - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    // Clean up cache if it exceeds max size
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }

    // Execute function and cache result
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  }) as T;
}

/**
 * Create a once-only function that can only be called once.
 * Useful for initialization, singletons, or one-time operations.
 *
 * @param fn - Function to call once
 * @returns Function that can only be called once
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
  let hasExecuted = false;
  let cachedResult: any;

  return ((...args: Parameters<T>): ReturnType<T> => {
    if (hasExecuted) {
      return cachedResult;
    }
    
    hasExecuted = true;
    cachedResult = fn(...args);
    return cachedResult;
  }) as T;
}

/**
 * Create a function with call count limiting and monitoring.
 * Useful for rate limiting, API calls, or resource management.
 *
 * @param fn - Function to limit
 * @param limit - Maximum number of calls
 * @param options - Optional configuration
 * @returns Limited function with monitoring
 */
export function limitCalls<T extends (...args: any[]) => any>(
  fn: T, 
  limit: number,
  options?: { warnThreshold?: number; resetAfter?: number }
): T {
  let callCount = 0;
  let lastResetTime = Date.now();

  const { warnThreshold = Math.floor(limit * 0.8), resetAfter } = options || {};

  return ((...args: Parameters<T>): ReturnType<T> | null => {
    const now = Date.now();
    
    // Auto-reset if resetAfter is configured
    if (resetAfter && (now - lastResetTime) > resetAfter) {
      callCount = 0;
      lastResetTime = now;
    }

    if (callCount >= limit) {
      return null as any;
    }

    if (callCount >= warnThreshold) {
      // Could add warning logic here
    }

    callCount++;
    return fn(...args);
  }) as T;
}

/**
 * Get nested property value using dot notation path.
 * Useful for accessing deeply nested object properties safely.
 *
 * @param obj - Object to search in
 * @param path - Dot notation path (e.g., 'user.profile.name')
 * @returns Value at path or undefined if not found
 */
export function get(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested property value using dot notation path.
 * Useful for setting deeply nested object properties.
 *
 * @param obj - Object to modify
 * @param path - Dot notation path (e.g., 'user.profile.name')
 * @param value - Value to set
 * @returns Modified object
 */
export function set(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
}

/**
 * Check if object has a nested property using dot notation path.
 * Useful for safely checking deeply nested object properties.
 *
 * @param obj - Object to search in
 * @param path - Dot notation path (e.g., 'user.profile.name')
 * @returns True if property exists, false otherwise
 */
export function has(obj: any, path: string): boolean {
  return path.split('.').every(key => {
    if (typeof obj !== 'object' || obj === null) return false;
    obj = obj[key];
    return obj !== undefined;
  });
}

/**
 * Remove nested property using dot notation path.
 * Useful for removing deeply nested object properties.
 *
 * @param obj - Object to modify
 * @param path - Dot notation path (e.g., 'user.profile.name')
 * @returns True if property was removed, false otherwise
 */
export function remove(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

/**
 * Flatten a nested object into a single-level object.
 * Useful for serialization, form data, or API requests.
 *
 * @param obj - Object to flatten
 * @param prefix - Prefix for keys (default: '')
 * @returns Flattened object
 */
export function flatten(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(result, flatten(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Deep freeze an object to make it immutable.
 * Useful for creating immutable data structures.
 *
 * @param obj - Object to freeze
 * @returns Frozen object
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (obj && (obj as any)[prop] && typeof (obj as any)[prop] === 'object') {
        deepFreeze((obj as any)[prop]);
      }
    });
    return Object.freeze(obj);
  }
  return obj as Readonly<T>;
}

/**
 * Create a deep copy of an object with all functions bound to a context.
 * Useful for creating bound copies of objects with methods.
 *
 * @param obj - Object to bind
 * @param context - Context to bind functions to
 * @returns Bound object
 */
export function bindAll<T extends Record<string, any>>(obj: T, context: any): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'function') {
      result[key] = result[key].bind(context);
    }
  }
  
  return result;
}

/**
 * Get all keys from an object, including nested ones.
 * Useful for object introspection and debugging.
 *
 * @param obj - Object to inspect
 * @param prefix - Prefix for nested keys (default: '')
 * @returns Array of all keys
 */
export function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    keys.push(newKey);
    
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], newKey));
    }
  }
  
  return keys;
}

/**
 * Get all values from an object, including nested ones.
 * Useful for object introspection and data extraction.
 *
 * @param obj - Object to inspect
 * @returns Array of all values
 */
export function getAllValues(obj: any): any[] {
  const values: any[] = [];
  
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      values.push(...getAllValues(obj[key]));
    } else {
      values.push(obj[key]);
    }
  }
  
  return values;
}

/**
 * Transform object keys using a mapping function.
 * Useful for converting between different naming conventions.
 *
 * @param obj - Object to transform
 * @param transformFn - Function to transform keys
 * @returns Transformed object
 */
export function transformKeys<T extends Record<string, any>>(
  obj: T,
  transformFn: (key: string) => string
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    const newKey = transformFn(key);
    result[newKey] = obj[key as keyof T];
  }
  
  return result;
}

/**
 * Filter object properties based on a predicate function.
 * Useful for creating subsets of objects based on conditions.
 *
 * @param obj - Object to filter
 * @param predicate - Function that returns true for properties to keep
 * @returns Filtered object
 */
export function filterObject<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string, obj: T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (predicate(obj[key as keyof T], key, obj)) {
      (result as any)[key] = obj[key as keyof T];
    }
  }
  
  return result;
}

/**
 * Map object values using a mapping function.
 * Useful for transforming all values in an object.
 *
 * @param obj - Object to map
 * @param mapFn - Function to transform values
 * @returns Mapped object
 */
export function mapValues<T extends Record<string, any>, U>(
  obj: T,
  mapFn: (value: any, key: string, obj: T) => U
): Record<string, U> {
  const result = {} as Record<string, U>;
  
  for (const key in obj) {
    result[key] = mapFn(obj[key as keyof T], key, obj);
  }
  
  return result;
}

/**
 * Pick properties from an object based on a predicate function.
 * Useful for selecting properties that match certain criteria.
 *
 * @param obj - Object to pick from
 * @param predicate - Function that returns true for properties to pick
 * @returns Object with picked properties
 */
export function pickBy<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string, obj: T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (predicate(obj[key as keyof T], key, obj)) {
      (result as any)[key] = obj[key as keyof T];
    }
  }
  
  return result;
}

/**
 * Omit properties from an object based on a predicate function.
 * Useful for removing properties that match certain criteria.
 *
 * @param obj - Object to omit from
 * @param predicate - Function that returns true for properties to omit
 * @returns Object with omitted properties
 */
export function omitBy<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string, obj: T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (!predicate(obj[key as keyof T], key, obj)) {
      (result as any)[key] = obj[key as keyof T];
    }
  }
  
  return result;
}

/**
 * Check if an object is plain (created by {} or new Object).
 * Useful for distinguishing between plain objects and other object types.
 *
 * @param obj - Object to check
 * @returns True if plain object, false otherwise
 */
export function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  if (Object.getPrototypeOf(obj) === null) {
    return true;
  }
  
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  
  return Object.getPrototypeOf(obj) === proto;
}

/**
 * Get the size of an object (number of enumerable properties).
 * Useful for object introspection and size checking.
 *
 * @param obj - Object to measure
 * @returns Number of enumerable properties
 */
export function size(obj: any): number {
  return Object.keys(obj).length;
}

/**
 * Check if an object is empty (has no enumerable properties).
 * Useful for validation and conditional logic.
 *
 * @param obj - Object to check
 * @returns True if empty, false otherwise
 */
export function isEmptyObject(obj: any): boolean {
  return size(obj) === 0;
}

/**
 * Create an object from an array of key-value pairs.
 * Useful for converting arrays to objects.
 *
 * @param entries - Array of [key, value] pairs
 * @returns Object created from entries
 */
export function fromEntries<T = any>(entries: [string, T][]): Record<string, T> {
  const result = {} as Record<string, T>;
  
  for (const [key, value] of entries) {
    result[key] = value;
  }
  
  return result;
}

/**
 * Create an array of key-value pairs from an object.
 * Useful for converting objects to arrays.
 *
 * @param obj - Object to convert
 * @returns Array of [key, value] pairs
 */
export function toEntries<T = any>(obj: Record<string, T>): [string, T][] {
  return Object.entries(obj) as [string, T][];
}

/**
 * Invert an object (swap keys and values).
 * Useful for creating reverse mappings.
 *
 * @param obj - Object to invert
 * @returns Inverted object
 */
export function invert<T extends Record<string, string>>(obj: T): Record<string, string> {
  const result = {} as Record<string, string>;
  
  for (const key in obj) {
    result[obj[key]] = key;
  }
  
  return result;
}

/**
 * Create a partial object with only the specified keys.
 * Useful for creating subsets of objects with specific keys.
 *
 * @param obj - Object to create partial from
 * @param keys - Keys to include in the partial
 * @returns Partial object
 */
export function partial<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Check if an object has all the specified keys.
 * Useful for validation and conditional logic.
 *
 * @param obj - Object to check
 * @param keys - Keys to check for
 * @returns True if object has all keys, false otherwise
 */
export function hasKeys<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): boolean {
  return keys.every(key => key in obj);
}

/**
 * Check if an object has any of the specified keys.
 * Useful for validation and conditional logic.
 *
 * @param obj - Object to check
 * @param keys - Keys to check for
 * @returns True if object has any keys, false otherwise
 */
export function hasAnyKeys<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): boolean {
  return keys.some(key => key in obj);
}

/**
 * Get the first key that matches a predicate function.
 * Useful for finding specific properties in objects.
 *
 * @param obj - Object to search
 * @param predicate - Function that returns true for matching keys
 * @returns First matching key or undefined
 */
export function findKey<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string, obj: T) => boolean
): string | undefined {
  for (const key in obj) {
    if (predicate(obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
}

/**
 * Get the first value that matches a predicate function.
 * Useful for finding specific values in objects.
 *
 * @param obj - Object to search
 * @param predicate - Function that returns true for matching values
 * @returns First matching value or undefined
 */
export function findValue<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string, obj: T) => boolean
): any | undefined {
  for (const key in obj) {
    if (predicate(obj[key], key, obj)) {
      return obj[key];
    }
  }
  return undefined;
}

/**
 * Count the number of properties that match a predicate function.
 * Useful for statistics and analysis.
 *
 * @param obj - Object to count
 * @param predicate - Function that returns true for matching properties
 * @returns Number of matching properties
 */
export function countBy<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string, obj: T) => boolean
): number {
  let count = 0;
  
  for (const key in obj) {
    if (predicate(obj[key], key, obj)) {
      count++;
    }
  }
  
  return count;
}

/**
 * Group object properties by a grouping function.
 * Useful for categorizing object properties.
 *
 * @param obj - Object to group
 * @param groupFn - Function that returns a group key
 * @returns Object with grouped properties
 */
export function groupBy<T extends Record<string, any>, K extends string>(
  obj: T,
  groupFn: (value: any, key: string, obj: T) => K
): Record<K, Partial<T>> {
  const result = {} as Record<K, Partial<T>>;
  
  for (const key in obj) {
    const groupKey = groupFn(obj[key as keyof T], key, obj);
    
    if (!result[groupKey]) {
      result[groupKey] = {};
    }
    
    (result[groupKey] as any)[key] = obj[key as keyof T];
  }
  
  return result;
}

/**
 * Create a new object with properties sorted by key.
 * Useful for consistent object representation.
 *
 * @param obj - Object to sort
 * @returns New object with sorted keys
 */
export function sortKeys<T extends Record<string, any>>(obj: T): T {
  const sortedKeys = Object.keys(obj).sort();
  const result = {} as Record<string, any>;
  
  for (const key of sortedKeys) {
    result[key] = obj[key as keyof T];
  }
  
  return result as T;
}

/**
 * Create a new object with properties sorted by value.
 * Useful for consistent object representation.
 *
 * @param obj - Object to sort
 * @param compareFn - Comparison function for values
 * @returns New object with sorted values
 */
export function sortValues<T extends Record<string, any>>(
  obj: T,
  compareFn?: (a: any, b: any) => number
): T {
  const entries = Object.entries(obj);
  
  if (compareFn) {
    entries.sort(([, a], [, b]) => compareFn(a, b));
  } else {
    entries.sort(([, a], [, b]) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }
  
  const result = {} as Record<string, any>;
  
  for (const [key, value] of entries) {
    result[key] = value;
  }
  
  return result as T;
}

/**
 * Create a diff between two objects.
 * Useful for change detection and comparison.
 *
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns Object with differences
 */
export function diff<T extends Record<string, any>>(
  obj1: T,
  obj2: T
): { added: Partial<T>; removed: Partial<T>; changed: Partial<T> } {
  const result = {
    added: {} as Partial<T>,
    removed: {} as Partial<T>,
    changed: {} as Partial<T>
  };
  
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    const hasKey1 = key in obj1;
    const hasKey2 = key in obj2;
    
    if (!hasKey1 && hasKey2) {
      (result.added as any)[key] = obj2[key];
    } else if (hasKey1 && !hasKey2) {
      (result.removed as any)[key] = obj1[key];
    } else if (hasKey1 && hasKey2 && obj1[key] !== obj2[key]) {
      (result.changed as any)[key] = obj2[key];
    }
  }
  
  return result;
}

/**
 * Create a deep copy of an object with circular reference handling.
 * Useful for cloning complex objects with circular references.
 *
 * @param obj - Object to clone
 * @param visited - Map of visited objects (internal use)
 * @returns Deep clone of the object
 */
export function deepCloneWithCircular<T>(obj: T, visited = new WeakMap()): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  
  const clone = Array.isArray(obj) ? [] : {};
  visited.set(obj, clone);
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (clone as any)[key] = deepCloneWithCircular((obj as any)[key], visited);
    }
  }
  
  return clone as T;
}

/**
 * Create a proxy that tracks property access and modifications.
 * Useful for debugging, logging, and reactive programming.
 *
 * @param obj - Object to proxy
 * @param handlers - Proxy handlers
 * @returns Proxied object
 */
export function createProxy<T extends Record<string, any>>(
  obj: T,
  handlers?: {
    get?: (target: T, prop: string, receiver: any) => any;
    set?: (target: T, prop: string, value: any, receiver: any) => boolean;
    deleteProperty?: (target: T, prop: string) => boolean;
  }
): T {
  const defaultHandlers = {
    get(target: T, prop: string, receiver: any) {
      logger.debug(`Getting property: ${prop}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target: T, prop: string, value: any, receiver: any) {
      logger.debug(`Setting property: ${prop} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    },
    deleteProperty(target: T, prop: string) {
      logger.debug(`Deleting property: ${prop}`);
      return Reflect.deleteProperty(target, prop);
    },
    ...handlers
  };
  
  return new Proxy(obj, defaultHandlers);
}