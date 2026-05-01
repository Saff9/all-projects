/**
 * Comprehensive stream utilities for Node.js
 * @module stream-utils
 */

import {
  Readable,
  Writable,
  Transform,
  PassThrough,
  Duplex,
  Stream,
  TransformOptions,
  ReadableOptions,
  WritableOptions,
} from 'stream';
import {
  createReadStream as fsCreateReadStream,
  createWriteStream as fsCreateWriteStream,
  existsSync,
} from 'fs';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

// Type definitions
export interface StreamInfo {
  readable: boolean;
  writable: boolean;
  destroyed: boolean;
  objectMode: boolean;
  encoding: string | null;
  highWaterMark: number;
}

export interface ProgressOptions {
  total: number;
  onProgress?: (progress: number, bytes: number) => void;
  chunkSize?: number;
}

export interface RetryOptions {
  retries?: number;
  delay?: number;
  maxDelay?: number;
  backoff?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export interface BufferOptions {
  highWaterMark?: number;
  lowWaterMark?: number;
  objectMode?: boolean;
}

export interface ConcatenatedBoundary {
  boundary: string;
  start: string;
  end: string;
}

export interface LineStreamOptions {
  encoding?: BufferEncoding;
  skipEmpty?: boolean;
}

export interface CSVStreamOptions extends LineStreamOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  columns?: boolean;
  trim?: boolean;
}

export interface BackpressureOptions {
  highWaterMark?: number;
  drainWait?: number;
}

// ============================================================================
// Stream Utility Functions
// ============================================================================

/**
 * Check if value is a stream
 * @param value - Value to check
 * @returns True if value is a stream
 */
export function isStream(value: unknown): value is Stream {
  return (
    value instanceof Readable ||
    value instanceof Writable ||
    value instanceof Transform ||
    value instanceof Duplex ||
    (value !== null &&
      typeof value === 'object' &&
      typeof (value as Stream).pipe === 'function')
  );
}

/**
 * Check if stream is readable
 * @param stream - Stream to check
 * @returns True if readable
 */
export function isReadable(stream: unknown): stream is Readable {
  return (
    stream instanceof Readable ||
    (isStream(stream) &&
      typeof (stream as Readable).read === 'function')
  );
}

/**
 * Check if stream is writable
 * @param stream - Stream to check
 * @returns True if writable
 */
export function isWritable(stream: unknown): stream is Writable {
  return (
    stream instanceof Writable ||
    (isStream(stream) &&
      typeof (stream as Writable).write === 'function')
  );
}

/**
 * Check if stream is transform
 * @param stream - Stream to check
 * @returns True if transform
 */
export function isTransform(stream: unknown): stream is Transform {
  return stream instanceof Transform;
}

/**
 * Check if stream is duplex
 * @param stream - Stream to check
 * @returns True if duplex
 */
export function isDuplex(stream: unknown): stream is Duplex {
  return stream instanceof Duplex;
}

/**
 * Get stream information
 * @param stream - Stream to inspect
 * @returns Stream information object
 */
export function getStreamInfo(stream: Stream): StreamInfo {
  return {
    readable: (stream as Readable).readable ?? false,
    writable: (stream as Writable).writable ?? false,
    destroyed: (stream as { destroyed?: boolean }).destroyed ?? false,
    objectMode: (stream as Readable & { objectMode?: boolean }).objectMode ?? false,
    encoding: (stream as Readable & { encoding?: string }).encoding ?? null,
    highWaterMark: (stream as { highWaterMark?: number }).highWaterMark ?? -1,
  };
}

/**
 * Destroy stream safely
 * @param stream - Stream to destroy
 * @param error - Optional error
 * @returns The destroyed stream
 */
export function destroyStream(
  stream: Stream,
  error?: Error
): Stream {
  if ('destroy' in stream) {
    (stream as { destroy(error?: Error): Stream }).destroy(error ?? undefined);
  }
  return stream;
}

/**
 * Pipeline with automatic cleanup
 * @param streams - Streams to pipeline
 * @returns Promise that resolves when pipeline completes
 */
export async function streamPipeline(
  source: Stream,
  ...transforms: (Stream | ((error: Error | null) => void))[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const callback: (error: Error | null) => void = (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };
    
    const args: (Stream | ((error: Error | null) => void))[] = [source, ...transforms];
    const lastArg = args[args.length - 1];
    
    if (typeof lastArg === 'function') {
      // Last argument is callback, replace with our callback
      args[args.length - 1] = callback;
    } else {
      args.push(callback);
    }
    
    // Use any to avoid strict type checking for pipeline
    (require('stream') as any).pipeline(...args);
  });
}

/**
 * Wait for stream to finish
 * @param stream - Stream to wait for
 * @returns Promise that resolves when stream finishes
 */
export function streamFinished(stream: Stream): Promise<void> {
  return new Promise((resolve, reject) => {
    (require('stream') as any).finished(stream, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// ============================================================================
// Stream Conversion
// ============================================================================

/**
 * Convert stream to buffer (async)
 * @param stream - Readable stream
 * @returns Promise resolving to buffer
 */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk));
      }
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Convert buffer to stream
 * @param buffer - Buffer to convert
 * @returns Readable stream
 */
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Convert stream to JSON (async)
 * @param stream - Readable stream
 * @returns Promise resolving to parsed JSON
 */
export async function streamToJson<T = unknown>(
  stream: Readable
): Promise<T> {
  const buffer = await streamToBuffer(stream);
  return JSON.parse(buffer.toString());
}

/**
 * Convert stream to string (async)
 * @param stream - Readable stream
 * @param encoding - Encoding to use (default: utf8)
 * @returns Promise resolving to string
 */
export async function streamToString(
  stream: Readable,
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  const buffer = await streamToBuffer(stream);
  return buffer.toString(encoding);
}

/**
 * Convert string to stream
 * @param str - String to convert
 * @param options - Readable options
 * @returns Readable stream
 */
export function stringToStream(
  str: string,
  options?: ReadableOptions
): Readable {
  return new Readable({
    ...options,
    read() {
      this.push(str);
      this.push(null);
    },
  });
}

/**
 * Convert stream to array of lines
 * @param stream - Readable stream
 * @returns Promise resolving to array of lines
 */
export async function streamToLines(stream: Readable): Promise<string[]> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => {
      const full = Buffer.concat(chunks).toString();
      const lines = full.split(/\r?\n/);
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      resolve(lines);
    });
  });
}

/**
 * Convert stream to array
 * @param stream - Readable stream
 * @returns Promise resolving to array of items
 */
export async function streamToArray<T>(
  stream: Readable
): Promise<T[]> {
  const items: T[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (item) => items.push(item as T));
    stream.on('error', reject);
    stream.on('end', () => resolve(items));
  });
}

// ============================================================================
// Stream Creation
// ============================================================================

/**
 * Create read stream
 * @param path - File path
 * @param options - Stream options
 * @returns Readable stream
 */
export function createReadStream(
  path: string,
  options?: Parameters<typeof fsCreateReadStream>[1]
): ReturnType<typeof fsCreateReadStream> {
  return fsCreateReadStream(path, options);
}

/**
 * Create write stream
 * @param path - File path
 * @param options - Stream options
 * @returns Writable stream
 */
export function createWriteStream(
  path: string,
  options?: Parameters<typeof fsCreateWriteStream>[1]
): ReturnType<typeof fsCreateWriteStream> {
  return fsCreateWriteStream(path, options);
}

/**
 * Create transform stream
 * @param transform - Transform function
 * @param flush - Flush function (optional)
 * @param options - Transform options
 * @returns Transform stream
 */
export function createTransformStream<T = unknown, R = unknown>(
  transform: (
    chunk: T,
    encoding: string,
    callback: (error?: Error | null, data?: R) => void
  ) => void,
  flush?: (
    callback: (error?: Error | null, data?: R) => void
  ) => void,
  options?: TransformOptions
): Transform {
  return new Transform({
    ...options,
    transform,
    flush,
  });
}

/**
 * Create pass-through stream
 * @returns PassThrough stream
 */
export function createPassThroughStream(): PassThrough {
  return new PassThrough();
}

/**
 * Create stream for concatenated data
 * @param getBoundary - Function to get boundary for concatenation
 * @returns Transform stream
 */
export function createConcatenatedStream(
  getBoundary: () => ConcatenatedBoundary
): Transform {
  let firstChunk = true;
  const { boundary } = getBoundary();

  return new Transform({
    objectMode: false,
    transform(chunk, encoding, callback) {
      if (firstChunk) {
        firstChunk = false;
        this.push(`--${boundary}\r\n`);
      }
      this.push(chunk);
      callback();
    },
    flush(callback) {
      this.push(`\r\n--${boundary}--\r\n`);
      callback();
    },
  });
}

// ============================================================================
// Stream Manipulation
// ============================================================================

/**
 * Concatenate multiple streams
 * @param streams - Streams to concatenate
 * @returns Concatenated readable stream
 */
export function concatenateStreams(...streams: Readable[]): Readable {
  let currentIndex = 0;
  const passThrough = new PassThrough();

  function pipeNext(): void {
    if (currentIndex >= streams.length) {
      passThrough.end();
      return;
    }

    const stream = streams[currentIndex++];
    stream.pipe(passThrough, { end: false });
    stream.on('end', pipeNext);
    stream.on('error', (err) => passThrough.destroy(err));
  }

  pipeNext();
  return passThrough;
}

/**
 * Merge multiple streams into one
 * @param streams - Streams to merge
 * @returns Merged readable stream
 */
export function mergeStreams(...streams: Readable[]): Readable {
  const merged = new PassThrough({ objectMode: true });
  let remaining = streams.length;

  if (remaining === 0) {
    merged.end();
    return merged;
  }

  streams.forEach((stream) => {
    stream.on('data', (data) => merged.write(data));
    stream.on('end', () => {
      remaining--;
      if (remaining === 0) {
        merged.end();
      }
    });
    stream.on('error', (err) => merged.destroy(err));
  });

  return merged;
}

/**
 * Zip multiple streams together
 * @param streams - Streams to zip
 * @returns Zipped readable stream
 */
export function zipStreams<T extends Readable[]>(
  ...streams: T
): Readable {
  const buffers: Buffer[][] = new Array(streams.length).fill(null).map(() => []);
  const passThrough = new PassThrough({ objectMode: true });
  let endedCount = 0;

  streams.forEach((stream, index) => {
    stream.on('data', (chunk) => {
      buffers[index].push(Buffer.from(chunk));
    });
    stream.on('end', () => {
      endedCount++;
      if (endedCount === streams.length) {
        const maxLength = Math.max(...buffers.map((b) => b.length));
        for (let i = 0; i < maxLength; i++) {
          const items = buffers.map((b) => b[i]).filter(Boolean);
          if (items.length === streams.length) {
            passThrough.write(items);
          }
        }
        passThrough.end();
      }
    });
    stream.on('error', (err) => passThrough.destroy(err));
  });

  return passThrough;
}

/**
 * Filter stream with predicate
 * @param stream - Source stream
 * @param predicate - Filter predicate
 * @returns Filtered transform stream
 */
export function filterStream<T>(
  stream: Readable,
  predicate: (data: T) => boolean
): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        if (predicate(chunk as T)) {
          this.push(chunk);
        }
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  });
}

/**
 * Map stream with mapper function
 * @param stream - Source stream
 * @param mapper - Map function
 * @returns Mapped transform stream
 */
export function mapStream<T, R>(
  stream: Readable,
  mapper: (data: T) => R
): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        this.push(mapper(chunk as T));
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  });
}

/**
 * FlatMap stream with mapper function
 * @param stream - Source stream
 * @param mapper - FlatMap function
 * @returns FlatMapped transform stream
 */
export function flatMapStream<T, R>(
  stream: Readable,
  mapper: (data: T) => R[] | R
): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const result = mapper(chunk as T);
        if (Array.isArray(result)) {
          result.forEach((item) => this.push(item));
        } else {
          this.push(result);
        }
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  });
}

/**
 * Take first N items from stream
 * @param stream - Source stream
 * @param count - Number of items to take
 * @returns Transform stream
 */
export function takeStream<T>(
  stream: Readable,
  count: number
): Transform {
  let taken = 0;
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      if (taken < count) {
        taken++;
        this.push(chunk);
      } else if (taken === count) {
        taken++;
        this.push(null);
      }
      callback();
    },
  });
}

/**
 * Skip first N items from stream
 * @param stream - Source stream
 * @param count - Number of items to skip
 * @returns Transform stream
 */
export function skipStream<T>(
  stream: Readable,
  count: number
): Transform {
  let skipped = 0;
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      if (skipped < count) {
        skipped++;
      } else {
        this.push(chunk);
      }
      callback();
    },
  });
}

/**
 * Slice stream from start to end
 * @param stream - Source stream
 * @param start - Start index
 * @param end - End index
 * @returns Transform stream
 */
export function sliceStream<T>(
  stream: Readable,
  start: number,
  end?: number
): Transform {
  let index = 0;
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      if (end !== undefined && index >= end) {
        this.push(null);
        callback();
        return;
      }
      if (index >= start) {
        this.push(chunk);
      }
      index++;
      callback();
    },
  });
}

/**
 * Remove duplicates from stream
 * @param stream - Source stream
 * @param keyMapper - Function to get key for deduplication
 * @returns Transform stream
 */
export function uniqueStream<T>(
  stream: Readable,
  keyMapper?: (data: T) => unknown
): Transform {
  const seen = new Set<unknown>();
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const key = keyMapper ? keyMapper(chunk as T) : chunk;
      if (!seen.has(key)) {
        seen.add(key);
        this.push(chunk);
      }
      callback();
    },
  });
}

/**
 * Flatten nested streams
 * @param stream - Source stream
 * @returns Flattened transform stream
 */
export function flattenStream(stream: Readable): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      if (Array.isArray(chunk)) {
        chunk.forEach((item) => this.push(item));
      } else {
        this.push(chunk);
      }
      callback();
    },
  });
}

// ============================================================================
// Stream Progress
// ============================================================================

/**
 * Add progress tracking to stream
 * @param stream - Source stream
 * @param options - Progress options
 * @returns Transform stream with progress
 */
export function progressStream(
  stream: Readable,
  options: ProgressOptions
): Transform {
  let received = 0;
  const { total, onProgress, chunkSize = 16384 } = options;

  return new Transform({
    highWaterMark: chunkSize,
    transform(chunk, encoding, callback) {
      const size = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
      received += size;
      const progress = total > 0 ? (received / total) * 100 : 0;
      onProgress?.(progress, received);
      this.push(chunk);
      callback();
    },
  });
}

/**
 * Create progress listener for stream
 * @param stream - Source stream
 * @param total - Total bytes expected
 * @param onProgress - Progress callback
 * @returns Progress tracking object
 */
export function createProgressListener(
  stream: Readable,
  total: number,
  onProgress: (progress: number, bytes: number) => void
): { stream: Readable; unsubscribe: () => void } {
  let received = 0;

  function handleData(chunk: unknown): void {
    const size = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
    received += size;
    onProgress(total > 0 ? (received / total) * 100 : 0, received);
  }

  stream.on('data', handleData);

  return {
    stream,
    unsubscribe: () => {
      stream.removeListener('data', handleData);
    },
  };
}

// ============================================================================
// Buffering
// ============================================================================

/**
 * Buffer stream with options
 * @param stream - Source stream
 * @param options - Buffer options
 * @returns Transform stream
 */
export function bufferStream<T>(
  stream: Readable,
  options?: BufferOptions
): Transform {
  const buffer: T[] = [];
  const { highWaterMark = 100, objectMode = true } = options ?? {};

  return new Transform({
    objectMode,
    highWaterMark,
    transform(chunk, encoding, callback) {
      buffer.push(chunk as T);
      if (buffer.length >= highWaterMark) {
        this.push(buffer.splice(0, buffer.length));
      }
      callback();
    },
    flush(callback) {
      if (buffer.length > 0) {
        this.push(buffer.splice(0));
      }
      callback();
    },
  });
}

/**
 * Flush buffer on condition
 * @param stream - Source stream
 * @param flushFn - Function to determine when to flush
 * @returns Transform stream
 */
export function flushStream<T>(
  stream: Readable,
  flushFn: (buffer: T[]) => boolean
): Transform {
  const buffer: T[] = [];
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      buffer.push(chunk as T);
      if (flushFn(buffer)) {
        buffer.forEach((item) => this.push(item));
        buffer.length = 0;
      }
      callback();
    },
    flush(callback) {
      buffer.forEach((item) => this.push(item));
      callback();
    },
  });
}

/**
 * Batch stream items
 * @param stream - Source stream
 * @param batchSize - Number of items per batch
 * @returns Transform stream
 */
export function batchStream<T>(
  stream: Readable,
  batchSize: number
): Transform {
  const batch: T[] = [];
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      batch.push(chunk as T);
      if (batch.length >= batchSize) {
        this.push(batch.splice(0, batchSize));
      }
      callback();
    },
    flush(callback) {
      if (batch.length > 0) {
        this.push(batch);
      }
      callback();
    },
  });
}

/**
 * Sliding window over stream
 * @param stream - Source stream
 * @param windowSize - Size of sliding window
 * @returns Transform stream
 */
export function windowStream<T>(
  stream: Readable,
  windowSize: number
): Transform {
  const window: T[] = [];
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      window.push(chunk as T);
      if (window.length >= windowSize) {
        this.push(window.slice());
        window.shift();
      }
      callback();
    },
    flush(callback) {
      if (window.length > 0) {
        this.push(window);
      }
      callback();
    },
  });
}

// ============================================================================
// Timing
// ============================================================================

/**
 * Throttle stream
 * @param stream - Source stream
 * @param rate - Bytes per second
 * @returns Transform stream
 */
export function throttleStream(
  stream: Readable,
  rate: number
): Transform {
  const minDelay = 1000 / rate;
  let lastTime = 0;
  return new Transform({
    highWaterMark: Math.max(1, Math.floor(rate / 10)),
    transform(chunk, encoding, callback) {
      const now = Date.now();
      const elapsed = now - lastTime;
      if (elapsed < minDelay) {
        setTimeout(() => {
          lastTime = Date.now();
          this.push(chunk);
          callback();
        }, minDelay - elapsed);
      } else {
        lastTime = now;
        this.push(chunk);
        callback();
      }
    },
  });
}

/**
 * Debounce stream
 * @param stream - Source stream
 * @param delay - Debounce delay in ms
 * @returns Transform stream
 */
export function debounceStream<T>(
  stream: Readable,
  delay: number
): Transform {
  let timeout: NodeJS.Timeout | null = null;
  let chunk: Buffer | null = null;
  return new Transform({
    transform(input, encoding, callback) {
      if (chunk !== null) {
        this.push(chunk);
      }
      chunk = Buffer.from(input);
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        if (chunk !== null) {
          this.push(chunk);
          chunk = null;
        }
        callback();
      }, delay);
    },
    flush(callback) {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (chunk !== null) {
        this.push(chunk);
      }
      callback();
    },
  });
}

/**
 * Delay stream emission
 * @param stream - Source stream
 * @param delay - Delay in ms
 * @returns Transform stream
 */
export function delayStream(
  stream: Readable,
  delay: number
): Transform {
  return new Transform({
    transform(chunk, encoding, callback) {
      setTimeout(() => {
        this.push(chunk);
        callback();
      }, delay);
    },
  });
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Retry failed streams
 * @param stream - Source stream
 * @param options - Retry options
 * @returns Transform stream with retry
 */
export function retryStream(
  stream: Readable,
  options?: RetryOptions
): Readable {
  const {
    retries = 3,
    delay = 1000,
    maxDelay = 30000,
    backoff = 2,
    onRetry,
  } = options ?? {};
  let attempt = 0;
  const passThrough = new PassThrough();

  function getDelay(currentDelay: number): number {
    return Math.min(currentDelay * Math.pow(backoff, attempt), maxDelay);
  }

  function retry(err: Error): void {
    attempt++;
    if (attempt > retries) {
      passThrough.destroy(new Error(`Max retries (${retries}) exceeded`));
      return;
    }

    const currentDelay = getDelay(delay);
    onRetry?.(err, attempt);
    setTimeout(() => {
      const newStream = new Readable({
        read() {
          this.push(null);
        },
      });
      newStream.on('error', retry);
      newStream.pipe(passThrough, { end: true });
    }, currentDelay);
  }

  stream.on('error', retry);
  stream.pipe(passThrough, { end: false });

  return passThrough;
}

/**
 * Add timeout to stream
 * @param stream - Source stream
 * @param timeout - Timeout in ms
 * @returns Transform stream with timeout
 */
export function timeoutStream(
  stream: Readable,
  timeout: number
): Readable {
  let timedOut = false;
  const passThrough = new PassThrough();

  const timeoutId = setTimeout(() => {
    timedOut = true;
    stream.destroy(new Error(`Stream timeout after ${timeout}ms`));
    passThrough.destroy(new Error(`Stream timeout after ${timeout}ms`));
  }, timeout);

  stream.on('data', (chunk) => {
    if (!timedOut) {
      passThrough.write(chunk);
    }
  });

  stream.on('end', () => {
    clearTimeout(timeoutId);
    if (!timedOut) {
      passThrough.end();
    }
  });

  stream.on('error', (err) => {
    clearTimeout(timeoutId);
    passThrough.destroy(err);
  });

  return passThrough;
}

// ============================================================================
// Compression
// ============================================================================

/**
 * Create gzip compress stream
 * @returns Gzip transform stream
 */
export function createGzipStream(): ReturnType<typeof zlib.createGzip> {
  return zlib.createGzip();
}

/**
 * Create gzip decompress stream
 * @returns Gunzip transform stream
 */
export function createGunzipStream(): ReturnType<typeof zlib.createGunzip> {
  return zlib.createGunzip();
}

/**
 * Create brotli compress stream
 * @returns Brotli compress transform stream or null if not supported
 */
export function createBrotliCompressStream(): ReturnType<typeof zlib.createBrotliCompress> | null {
  if (typeof zlib.createBrotliCompress === 'function') {
    return zlib.createBrotliCompress();
  }
  return null;
}

/**
 * Create brotli decompress stream
 * @returns Brotli decompress transform stream or null if not supported
 */
export function createBrotliDecompressStream(): ReturnType<typeof zlib.createBrotliDecompress> | null {
  if (typeof zlib.createBrotliDecompress === 'function') {
    return zlib.createBrotliDecompress();
  }
  return null;
}

/**
 * Create zlib compress stream
 * @returns Zlib transform stream (deflate)
 */
export function createZlibStream(): ReturnType<typeof zlib.createDeflate> {
  return zlib.createDeflate();
}

// ============================================================================
// Encryption
// ============================================================================

/**
 * Create encrypt stream
 * @param key - Encryption key
 * @param iv - Initialization vector
 * @returns Encrypt transform stream
 */
export function createEncryptStream(
  key: string | Buffer,
  iv: string | Buffer
): ReturnType<typeof crypto.createCipheriv> {
  const keyBuffer = typeof key === 'string' ? Buffer.from(key) : key;
  const ivBuffer = typeof iv === 'string' ? Buffer.from(iv) : iv;
  return crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
}

/**
 * Create decrypt stream
 * @param key - Decryption key
 * @param iv - Initialization vector
 * @returns Decrypt transform stream
 */
export function createDecryptStream(
  key: string | Buffer,
  iv: string | Buffer
): ReturnType<typeof crypto.createDecipheriv> {
  const keyBuffer = typeof key === 'string' ? Buffer.from(key) : key;
  const ivBuffer = typeof iv === 'string' ? Buffer.from(iv) : iv;
  return crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
}

// ============================================================================
// Line-based
// ============================================================================

/**
 * Create line-by-line stream
 * @param options - Line stream options
 * @returns Transform stream
 */
export function createLineStream(options?: LineStreamOptions): Transform {
  let buffer = '';
  const { encoding = 'utf8', skipEmpty = false } = options ?? {};

  return new Transform({
    decodeStrings: true,
    encoding,
    objectMode: false,
    transform(chunk, encoding, callback) {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!skipEmpty || line.length > 0) {
          this.push(line);
        }
      }
      callback();
    },
    flush(callback) {
      if (buffer.length > 0) {
        if (!skipEmpty || buffer.length > 0) {
          this.push(buffer);
        }
      }
      callback();
    },
  });
}

/**
 * Create CSV line stream
 * @param options - CSV stream options
 * @returns Transform stream
 */
export function createCSVStream(options?: CSVStreamOptions): Transform {
  const {
    delimiter = ',',
    quote = '"',
    escape = '"',
    columns = false,
    trim = false,
  } = options ?? {};

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === quote && nextChar === quote) {
          current += quote;
          i++;
        } else if (char === quote) {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === quote) {
          inQuotes = true;
        } else if (char === delimiter) {
          result.push(trim ? current.trim() : current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(trim ? current.trim() : current);
    return result;
  }

  return new Transform({
    objectMode: true,
    transform(line, encoding, callback) {
      const parsed = parseCSVLine(line as string);
      this.push(parsed);
      callback();
    },
  });
}

/**
 * Create newline-delimited JSON stream
 * @returns Transform stream
 */
export function createNDJSONStream(): Transform {
  return new Transform({
    objectMode: true,
    transform(line, encoding, callback) {
      try {
        const json = JSON.parse(line as string);
        this.push(json);
      } catch {
        // Skip invalid JSON lines
      }
      callback();
    },
  });
}

// ============================================================================
// Backpressure
// ============================================================================

/**
 * Handle backpressure
 * @param stream - Source stream
 * @param options - Backpressure options
 * @returns Readable stream
 */
export function backpressureStream(
  stream: Readable,
  options?: BackpressureOptions
): Readable {
  const { highWaterMark = 16 * 1024 } = options ?? {};
  let waiting = false;

  return new Readable({
    highWaterMark,
    read() {
      if (waiting) {
        waiting = false;
        stream.resume();
      }
    },
  });
}

/**
 * Wait for drain
 * @param stream - Writable stream
 * @returns Promise that resolves on drain
 */
export async function drainStream(stream: Writable): Promise<void> {
  if (!stream.write('')) {
    return new Promise((resolve) => {
      stream.once('drain', resolve);
    });
  }
}

// ============================================================================
// Testing
// ============================================================================

/**
 * Create mock readable stream
 * @param data - Data to emit
 * @param options - Readable options
 * @returns Mock readable stream
 */
export function mockReadableStream<T = string>(
  data?: T[],
  options?: ReadableOptions
): Readable {
  const items = data ?? [];
  let index = 0;
  return new Readable({
    ...options,
    objectMode: true,
    read() {
      if (index < items.length) {
        this.push(items[index++]);
      } else {
        this.push(null);
      }
    },
  });
}

/**
 * Create mock writable stream
 * @param data - Array to collect data
 * @param options - Writable options
 * @returns Mock writable stream
 */
export function mockWritableStream<T = unknown>(
  data?: T[],
  options?: WritableOptions
): Writable {
  const collected = data ?? [];
  return new Writable({
    ...options,
    objectMode: true,
    write(chunk, encoding, callback) {
      collected.push(chunk as T);
      callback();
    },
  });
}

/**
 * Create mock transform stream
 * @param transformFn - Transform function
 * @returns Mock transform stream
 */
export function mockTransformStream<T = unknown, R = unknown>(
  transformFn?: (chunk: T) => R
): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const result = transformFn ? transformFn(chunk as T) : chunk;
        this.push(result);
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
  });
}

// ============================================================================
// Large File
// ============================================================================

/**
 * Read file range
 * @param path - File path
 * @param start - Start byte
 * @param end - End byte
 * @returns Readable stream for range
 */
export function createReadStreamForRange(
  path: string,
  start: number,
  end?: number
): ReturnType<typeof fsCreateReadStream> {
  return fsCreateReadStream(path, { start, end });
}

/**
 * Stream last N lines
 * @param path - File path
 * @param lines - Number of lines to stream
 * @returns Transform stream
 */
export function createTailStream(
  _path: string,
  lines: number
): Transform {
  const lineBuffer: string[] = [];
  const maxLines = Math.max(1, lines);

  return new Transform({
    objectMode: true,
    transform(line, _encoding, callback) {
      lineBuffer.push(line as string);
      if (lineBuffer.length > maxLines) {
        lineBuffer.shift();
      }
      callback();
    },
    flush(callback) {
      lineBuffer.forEach((line) => this.push(line));
      callback();
    },
  });
}

/**
 * Stream first N lines
 * @param path - File path
 * @param lines - Number of lines to stream
 * @returns Transform stream
 */
export function createHeadStream(
  _path: string,
  lines: number
): Transform {
  let lineCount = 0;
  const maxLines = Math.max(1, lines);

  return new Transform({
    objectMode: true,
    transform(line, _encoding, callback) {
      if (lineCount < maxLines) {
        lineCount++;
        this.push(line);
      }
      callback();
    },
  });
}

/**
 * Count lines in stream
 * @param stream - Readable stream
 * @returns Promise resolving to line count
 */
export async function countLinesStream(stream: Readable): Promise<number> {
  let count = 0;
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      const str = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
      count += (str.match(/\r?\n/g) || []).length;
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(count));
  });
}

// ============================================================================
// Stream Operations (Async)
// ============================================================================

/**
 * Read file as lines (async)
 * @param filePath - File path
 * @param encoding - Encoding to use
 * @returns Promise resolving to array of lines
 */
export async function readLines(
  filePath: string,
  encoding: BufferEncoding = 'utf8'
): Promise<string[]> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const stream = fsCreateReadStream(filePath, { encoding });
  return streamToLines(stream);
}

/**
 * Count lines in file (async)
 * @param filePath - File path
 * @returns Promise resolving to line count
 */
export async function countLines(filePath: string): Promise<number> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const stream = fsCreateReadStream(filePath);
  return countLinesStream(stream);
}

/**
 * Append data as stream
 * @param path - File path
 * @param data - Data to append
 * @returns Promise resolving when complete
 */
export async function appendFileStream(
  path: string,
  data: string | Buffer
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = fsCreateWriteStream(path, { flags: 'a' });
    const toWrite = Buffer.isBuffer(data) ? data : Buffer.from(data);
    stream.write(toWrite);
    stream.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

/**
 * Prepend data as stream
 * @param path - File path
 * @param data - Data to prepend
 * @returns Promise resolving when complete
 */
export async function prependFileStream(
  path: string,
  data: string | Buffer
): Promise<void> {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  const originalContent = await streamToBuffer(fsCreateReadStream(path));
  const toWrite = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const finalContent = Buffer.concat([toWrite, originalContent]);
  return new Promise((resolve, reject) => {
    const stream = fsCreateWriteStream(path);
    stream.end(finalContent);
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

// ============================================================================
// Web Streams (Node.js 16+)
// ============================================================================

/**
 * Convert Node stream to web stream
 * @param readableStream - Node.js readable stream
 * @returns Web ReadableStream
 */
export function convertToWebStream(
  readableStream: Readable
): ReadableStream<Uint8Array> {
  // For Node.js 18+ use built-in conversion
  if (typeof ReadableStream !== 'undefined' && 'toWeb' in ReadableStream) {
    return (ReadableStream as { toWeb(s: Readable): ReadableStream<Uint8Array> }).toWeb(readableStream);
  }
  // Fallback: create a simple web stream wrapper
  return new ReadableStream<Uint8Array>({
    start(controller) {
      readableStream.on('data', (chunk) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        controller.enqueue(new Uint8Array(buffer));
      });
      readableStream.on('end', () => controller.close());
      readableStream.on('error', (err) => controller.error(err));
    },
    cancel() {
      readableStream.destroy();
    },
  });
}

/**
 * Convert web stream to Node stream
 * @param webStream - Web stream
 * @returns Node.js Readable stream
 */
export function convertToNodeStream(
  webStream: ReadableStream<Uint8Array>
): Readable {
  return Readable.fromWeb(webStream as any);
}

/**
 * Convert web stream to buffer
 * @param webStream - Web ReadableStream
 * @returns Promise resolving to buffer
 */
export async function webToBuffer(
  webStream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = webStream.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: isDone } = await reader.read();
    if (value) {
      chunks.push(value);
    }
    done = isDone;
  }

  return Buffer.concat(chunks);
}

// ============================================================================
// Recover Stream
// ============================================================================

/**
 * Recover from errors
 * @param stream - Source stream
 * @param recoverFn - Recovery function
 * @returns Transform stream
 */
export function recoverStream<T>(
  stream: Readable,
  recoverFn: (error: Error) => Readable
): Readable {
  let failed = false;
  const passThrough = new PassThrough({ objectMode: true });

  stream.on('error', (err) => {
    if (!failed) {
      failed = true;
      const recoveredStream = recoverFn(err);
      recoveredStream.pipe(passThrough, { end: true });
    }
  });

  stream.on('data', (chunk) => {
    if (!failed) {
      passThrough.write(chunk);
    }
  });

  stream.on('end', () => {
    if (!failed) {
      passThrough.end();
    }
  });

  return passThrough;
}
