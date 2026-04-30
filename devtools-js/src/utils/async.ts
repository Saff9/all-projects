import { logger } from '../index';

/**
 * Pause execution for given milliseconds.
 * Useful for rate limiting, retries, or testing delays.
 */
export const sleep = (ms: number) =>
  new Promise<void>(r => setTimeout(r, ms));

/**
 * Execute function with retry logic including exponential backoff and jitter.
 * Perfect for handling transient failures in API calls, database operations, or network requests.
 *
 * @param fn - Function to retry
 * @param options - Retry configuration or number of attempts
 * @returns Promise that resolves when fn succeeds or rejects after all retries fail
 */
interface RetryOptions {
  /** Maximum number of retry attempts */
  times?: number;
  /** Initial delay between retries in milliseconds */
  delay?: number;
  /** Backoff strategy: "linear" or "exponential" */
  backoff?: "linear" | "exponential";
  /** Add random variation to delay to prevent thundering herd */
  jitter?: boolean;
  /** Maximum delay between retries */
  maxDelay?: number;
  /** Custom logic to determine if error should be retried */
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions | number = {}
): Promise<T> {
  // Support both old (times, delay) and new (options object) API
  const times = typeof options === 'number' ? options : options.times ?? 3;
  const delay = typeof options === 'number' ? 300 : options.delay ?? 300;
  const backoff = typeof options === 'number' ? "exponential" : options.backoff ?? "exponential";
  const jitter = typeof options === 'number' ? true : options.jitter ?? true;
  const maxDelay = typeof options === 'number' ? 10000 : options.maxDelay ?? 10000;
  const shouldRetry = typeof options === 'number' ? () => true : options.shouldRetry ?? (() => true);

  let err: any;

  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;

      // Check if we should retry this specific error
      if (!shouldRetry(e, i + 1)) {
        throw err;
      }

      // Calculate delay with backoff strategy
      let calculatedDelay = delay;
      if (backoff === "exponential") {
        calculatedDelay = delay * Math.pow(2, i);
      } else {
        calculatedDelay = delay * (i + 1);
      }

      // Apply jitter (random variation) to prevent thundering herd problem
      if (jitter) {
        calculatedDelay = calculatedDelay * (0.5 + Math.random());
      }

      // Apply max delay to prevent excessive waiting
      calculatedDelay = Math.min(calculatedDelay, maxDelay);

      await sleep(calculatedDelay);
    }
  }

  throw err;
}

/**
 * Execute array of async tasks with concurrency limit.
 * Perfect for API calls, file processing, or any parallel operations where you need control.
 *
 * @param tasks - Array of async functions to execute
 * @param limit - Maximum number of concurrent tasks
 * @returns Array of results in same order as input tasks
 */
export async function asyncQueue<T>(
  tasks: (() => Promise<T>)[],
  limit = 3
): Promise<T[]> {
  const results: T[] = [];
  const running: Promise<any>[] = [];

  for (const task of tasks) {
    const p = task().then(r => results.push(r));
    running.push(p);

    if (running.length >= limit) {
      await Promise.race(running);
      running.splice(
        running.findIndex(x => x === p),
        1
      );
    }
  }

  await Promise.all(running);
  return results;
}

/**
 * Execute async function with error handling pattern.
 * Returns tuple where first element is error (or null) and second is result (or null).
 * Eliminates nested try/catch blocks for cleaner async code.
 *
 * @param fn - Async function to execute safely
 * @returns Tuple of [error, result]
 */
export async function safeTry<T>(fn: () => Promise<T>) {
  try {
    return [null, await fn()] as const;
  } catch (e) {
    return [e, null] as const;
  }
}

/**
 * Measure the time taken by a function.
 * Useful for performance monitoring, profiling, or benchmarking.
 *
 * @param fn - Function to measure
 * @returns Object with result and duration
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }>;
export async function measureTime<T>(fn: () => T): Promise<{ result: T; duration: number }>;
export async function measureTime<T>(fn: () => T): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;

  if (result instanceof Promise) {
    return result.then(res => ({ result: res, duration }));
  }
  return { result, duration };
}

/**
 * Retry a function with exponential backoff until it succeeds or max attempts reached.
 * Useful for resilient API calls, network operations, or unreliable services.
 *
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts
 * @param initialDelay - Initial delay in ms
 * @returns Promise that resolves when fn succeeds
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  initialDelay = 100
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw error;
      }
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('Max retry attempts reached');
}

/**
 * Execute a function with timeout.
 * Useful for preventing hanging operations, long-running tasks, or API timeouts.
 *
 * @param fn - Function to execute
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves with result or rejects on timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeout: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);
  });

  try {
    const result = await Promise.race([
      fn(),
      timeoutPromise
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Create a debounced promise function.
 * Useful for search-as-you-type, auto-save, or rate-limited API calls.
 *
 * @param fn - Function to debounce
 * @param wait - Wait time in ms
 * @returns Debounced function
 */
export function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let latestPromise: Promise<any> | null = null;

  return ((...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    latestPromise = new Promise(async (resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });

    return latestPromise;
  });
}

/**
 * Create a throttled promise function.
 * Useful for burst protection, API rate limiting, or resource management.
 *
 * @param fn - Function to throttle
 * @param limit - Maximum calls per interval
 * @param interval - Time interval in ms
 * @returns Throttled function
 */
export function throttlePromise<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limit: number,
  interval: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  const queue: Array<{ resolve: (value: any) => void; reject: (error: any) => void; args: Parameters<T> }> = [];
  let inProgress = 0;
  let lastExecuted = 0;

  const processQueue = async () => {
    if (queue.length === 0 || inProgress >= limit) return;

    inProgress++;
    const { resolve, reject, args } = queue.shift()!;

    try {
      const result = await fn(...args);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      inProgress--;
      lastExecuted = Date.now();
      processQueue();
    }
  };

  return ((...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, args });

      const now = Date.now();
      if (now - lastExecuted >= interval || queue.length === 1) {
        processQueue();
      }
    });
  });
}

/**
 * Batch process an array with concurrency control.
 * Useful for processing large datasets, API batch operations, or parallel tasks.
 *
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param concurrency - Number of concurrent operations
 * @returns Promise with array of results
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = [];
  const running: Promise<void>[] = [];

  for (const item of items) {
    const promise = processor(item).then(result => {
      results.push(result);
      running.splice(running.indexOf(promise), 1);
    });

    running.push(promise);

    if (running.length >= concurrency) {
      await Promise.race(running);
    }
  }

  await Promise.all(running);
  return results;
}

/**
 * Create a circuit breaker for function calls.
 * Useful for protecting against failing services, APIs, or resources.
 *
 * @param fn - Function to protect
 * @param threshold - Number of failures before opening circuit
 * @param resetTimeout - Time before attempting to close circuit
 * @returns Protected function
 */
export function circuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  threshold = 3,
  resetTimeout = 5000
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let state = 'CLOSED';
  let failureCount = 0;
  let nextAttempt = 0;

  return ((...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return new Promise(async (resolve, reject) => {
      const now = Date.now();

      if (state === 'OPEN') {
        if (now < nextAttempt) {
          reject(new Error('Circuit breaker is open'));
          return;
        }
        state = 'HALF-OPEN';
      }

      try {
        const result = await fn(...args);
        if (state === 'HALF-OPEN') {
          state = 'CLOSED';
          failureCount = 0;
        }
        resolve(result);
      } catch (error) {
        failureCount++;
        if (failureCount >= threshold) {
          state = 'OPEN';
          nextAttempt = now + resetTimeout;
          logger.error(`Circuit breaker opened (${threshold} failures)`);
        }
        reject(error);
      }
    });
  });
}