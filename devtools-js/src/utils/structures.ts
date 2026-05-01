/**
 * Comprehensive Data Structures for Developers
 * @module structures
 */

/**
 * LRUCache - Least Recently Used Cache with TTL support
 * @class
 * @typeparam K - Key type
 * @typeparam V - Value type
 */
export class LRUCache<K, V> {
  private cache: Map<K, { value: V; expiresAt: number }>;
  private maxCapacity: number;
  private ttl: number;
  private hits: number = 0;
  private misses: number = 0;

  /**
   * Creates a new LRUCache instance
   * @param {number} maxSize - Maximum number of items in cache
   * @param {number} ttl - Time to live in milliseconds (default: 0 = no expiry)
   */
  constructor(maxSize: number = 100, ttl: number = 0) {
    this.maxCapacity = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
  }

  /**
   * Get a value by key
   * @param {K} key - The key to look up
   * @returns {V | undefined} The value or undefined if not found
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return undefined;
    }

    if (this.ttl > 0 && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  /**
   * Set a key-value pair
   * @param {K} key - The key
   * @param {V} value - The value
   * @returns {LRUCache<K, V>} Returns this for chaining
   */
  set(key: K, value: V): LRUCache<K, V> {
    // Remove existing key first to update order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest item if at capacity
    if (this.cache.size >= this.maxCapacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: this.ttl > 0 ? Date.now() + this.ttl : Infinity
    });

    return this;
  }

  /**
   * Check if a key exists
   * @param {K} key - The key to check
   * @returns {boolean} True if key exists
   */
  has(key: K): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (this.ttl > 0 && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a key
   * @param {K} key - The key to delete
   * @returns {boolean} True if key was deleted
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get all keys
   * @returns {K[]} Array of keys
   */
  keys(): K[] {
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values
   * @returns {V[]} Array of values
   */
  values(): V[] {
    this.cleanExpired();
    return Array.from(this.cache.values()).map(item => item.value);
  }

  /**
   * Get all entries
   * @returns {[K, V][]} Array of [key, value] pairs
   */
  entries(): [K, V][] {
    this.cleanExpired();
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }

  /**
   * Get the number of items
   * @returns {number} Number of items
   */
  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * Get maximum cache size
   * @returns {number} Maximum size
   */
  getMaxSize(): number {
    return this.maxCapacity;
  }

  /**
   * Check if cache is full
   * @returns {boolean} True if full
   */
  isFull(): boolean {
    return this.cache.size >= this.maxCapacity;
  }

  /**
   * Record a cache hit
   * @param {K} key - The key accessed
   * @returns {boolean} True if key exists
   */
  hit(key: K): boolean {
    if (this.has(key)) {
      this.hits++;
      return true;
    }
    return false;
  }

  /**
   * Record a cache miss
   * @param {K} key - The key that was missed
   * @returns {boolean} Always returns false
   */
  miss(key: K): boolean {
    if (!this.has(key)) {
      this.misses++;
      return true;
    }
    return false;
  }

  /**
   * Get cache statistics
   * @returns {{ hits: number; misses: number; hitRate: number }} Statistics
   */
  stats(): { hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0
    };
  }

  private cleanExpired(): void {
    if (this.ttl <= 0) return;
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * RateLimiter - Token bucket rate limiter
 * @class
 */
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private windowMs: number;
  private lastRefill: number;
  private refillRate: number;

  /**
   * Creates a new RateLimiter
   * @param {number} maxRequests - Maximum requests per window
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(maxRequests: number = 10, windowMs: number = 1000) {
    this.maxTokens = maxRequests;
    this.tokens = maxRequests;
    this.windowMs = windowMs;
    this.lastRefill = Date.now();
    this.refillRate = maxRequests / windowMs;
  }

  /**
   * Try to acquire a token without waiting
   * @returns {boolean} True if token acquired
   */
  tryAcquire(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  /**
   * Acquire a token, waiting if necessary
   * @returns {Promise<boolean>} True when token acquired
   */
  async acquire(): Promise<boolean> {
    return new Promise((resolve) => {
      const check = () => {
        this.refill();
        if (this.tokens >= 1) {
          this.tokens -= 1;
          resolve(true);
        } else {
          const waitTime = (1 - this.tokens) / this.refillRate;
          setTimeout(check, Math.min(waitTime, 10));
        }
      };
      check();
    });
  }

  /**
   * Get available tokens
   * @returns {number} Available tokens
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Get time until reset
   * @returns {number} Time in milliseconds
   */
  getResetTime(): number {
    const timeSinceRefill = Date.now() - this.lastRefill;
    return Math.max(0, this.windowMs - timeSinceRefill);
  }

  /**
   * Reset the limiter
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

/**
 * TokenBucket - Token bucket algorithm implementation
 * @class
 */
export class TokenBucket {
  private tokens: number;
  private rate: number;
  private capacity: number;
  private lastUpdate: number;

  /**
   * Creates a new TokenBucket
   * @param {number} rate - Refill rate (tokens per millisecond)
   * @param {number} capacity - Maximum token capacity
   */
  constructor(rate: number = 0.1, capacity: number = 10) {
    this.rate = rate;
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastUpdate = Date.now();
  }

  /**
   * Consume tokens from the bucket
   * @param {number} tokens - Number of tokens to consume
   * @returns {boolean} True if successful
   */
  consume(tokens: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  /**
   * Get available tokens
   * @returns {number} Available tokens
   */
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Refill tokens based on elapsed time
   */
  refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    const tokensToAdd = elapsed * this.rate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastUpdate = now;
  }

  /**
   * Reset the bucket
   */
  reset(): void {
    this.tokens = this.capacity;
    this.lastUpdate = Date.now();
  }
}

/**
 * PriorityQueue - Generic priority queue
 * @class
 * @typeparam T - Item type
 */
export class PriorityQueue<T> {
  private items: { item: T; priority: number }[];

  /**
   * Creates a new PriorityQueue
   * @param {(a: T, b: T) => number} comparator - Custom comparator function
   */
  constructor(
    private comparator: (a: T, b: T) => number = (a, b) => 
      (a as unknown as number) - (b as unknown as number)
  ) {
    this.items = [];
  }

  /**
   * Add an item with priority
   * @param {T} item - The item to add
   * @param {number} priority - Priority value (lower = higher priority)
   * @returns {PriorityQueue<T>} Returns this for chaining
   */
  enqueue(item: T, priority: number): PriorityQueue<T> {
    this.items.push({ item, priority });
    this.bubbleUp(this.items.length - 1);
    return this;
  }

  /**
   * Remove and return highest priority item
   * @returns {T | undefined} The item or undefined if empty
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return min.item;
  }

  /**
   * View highest priority item without removing
   * @returns {T | undefined} The item or undefined if empty
   */
  peek(): T | undefined {
    return this.items[0]?.item;
  }

  /**
   * Check if empty
   * @returns {boolean} True if empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get size
   * @returns {number} Number of items
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Convert to array
   * @returns {T[]} Array of items
   */
  toArray(): T[] {
    return this.items.map(({ item }) => item);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.items[parentIndex].priority <= this.items[index].priority) break;
      [this.items[parentIndex], this.items[index]] = [this.items[index], this.items[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.items.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.items[left].priority < this.items[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.items[right].priority < this.items[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}

/**
 * Deque - Double-ended Queue
 * @class
 * @typeparam T - Item type
 */
export class Deque<T> {
  private items: T[];

  /**
   * Creates a new Deque
   */
  constructor() {
    this.items = [];
  }

  /**
   * Add item to the back
   * @param {T} item - Item to add
   * @returns {Deque<T>} Returns this for chaining
   */
  pushBack(item: T): Deque<T> {
    this.items.push(item);
    return this;
  }

  /**
   * Add item to the front
   * @param {T} item - Item to add
   * @returns {Deque<T>} Returns this for chaining
   */
  pushFront(item: T): Deque<T> {
    this.items.unshift(item);
    return this;
  }

  /**
   * Remove and return item from back
   * @returns {T | undefined} Item or undefined if empty
   */
  popBack(): T | undefined {
    return this.items.pop();
  }

  /**
   * Remove and return item from front
   * @returns {T | undefined} Item or undefined if empty
   */
  popFront(): T | undefined {
    return this.items.shift();
  }

  /**
   * View back item
   * @returns {T | undefined} Item or undefined if empty
   */
  peekBack(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * View front item
   * @returns {T | undefined} Item or undefined if empty
   */
  peekFront(): T | undefined {
    return this.items[0];
  }

  /**
   * Check if empty
   * @returns {boolean} True if empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get size
   * @returns {number} Number of items
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clear the deque
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Convert to array
   * @returns {T[]} Array of items
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Iterate over items
   * @param {(item: T, index: number) => void} callback - Callback function
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }
}

/**
 * Stack - LIFO data structure
 * @class
 * @typeparam T - Item type
 */
export class Stack<T> {
  private items: T[];

  /**
   * Creates a new Stack
   */
  constructor() {
    this.items = [];
  }

  /**
   * Push item onto stack
   * @param {T} item - Item to push
   * @returns {Stack<T>} Returns this for chaining
   */
  push(item: T): Stack<T> {
    this.items.push(item);
    return this;
  }

  /**
   * Pop item from stack
   * @returns {T | undefined} Item or undefined if empty
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * View top item
   * @returns {T | undefined} Item or undefined if empty
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Check if empty
   * @returns {boolean} True if empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get size
   * @returns {number} Number of items
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clear the stack
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Convert to array
   * @returns {T[]} Array of items
   */
  toArray(): T[] {
    return [...this.items].reverse();
  }
}

/**
 * Queue - FIFO data structure
 * @class
 * @typeparam T - Item type
 */
export class Queue<T> {
  private items: T[];

  /**
   * Creates a new Queue
   */
  constructor() {
    this.items = [];
  }

  /**
   * Add item to queue
   * @param {T} item - Item to add
   * @returns {Queue<T>} Returns this for chaining
   */
  enqueue(item: T): Queue<T> {
    this.items.push(item);
    return this;
  }

  /**
   * Remove and return item from queue
   * @returns {T | undefined} Item or undefined if empty
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * View front item
   * @returns {T | undefined} Item or undefined if empty
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Check if empty
   * @returns {boolean} True if empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get size
   * @returns {number} Number of items
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Convert to array
   * @returns {T[]} Array of items
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Iterate over items
   * @param {(item: T, index: number) => void} callback - Callback function
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }
}

/**
 * Heap - Binary heap implementation
 * @class
 * @typeparam T - Item type
 */
export class Heap<T> {
  private items: T[];

  /**
   * Creates a new Heap
   * @param {(a: T, b: T) => number} comparator - Comparison function
   */
  constructor(
    private comparator: (a: T, b: T) => number = (a, b) => 
      (a as unknown as number) - (b as unknown as number)
  ) {
    this.items = [];
  }

  /**
   * Insert item into heap
   * @param {T} item - Item to insert
   * @returns {Heap<T>} Returns this for chaining
   */
  insert(item: T): Heap<T> {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
    return this;
  }

  /**
   * Extract root item
   * @returns {T | undefined} Item or undefined if empty
   */
  extract(): T | undefined {
    if (this.isEmpty()) return undefined;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return root;
  }

  /**
   * View root item
   * @returns {T | undefined} Item or undefined if empty
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Get size
   * @returns {number} Number of items
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Check if empty
   * @returns {boolean} True if empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Clear the heap
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Convert to array
   * @returns {T[]} Array of items
   */
  toArray(): T[] {
    return [...this.items];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.items[parentIndex], this.items[index]) <= 0) break;
      [this.items[parentIndex], this.items[index]] = [this.items[index], this.items[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.items.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.comparator(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.comparator(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}

/**
 * MinHeap - Minimum heap implementation
 * @class
 * @typeparam T - Item type
 */
export class MinHeap<T> extends Heap<T> {
  /**
   * Creates a new MinHeap
   * @param {(a: T, b: T) => number} comparator - Custom comparator
   */
  constructor(comparator?: (a: T, b: T) => number) {
    super(comparator);
  }
}

/**
 * MaxHeap - Maximum heap implementation
 * @class
 * @typeparam T - Item type
 */
export class MaxHeap<T> extends Heap<T> {
  /**
   * Creates a new MaxHeap
   * @param {(a: T, b: T) => number} comparator - Custom comparator
   */
  constructor(comparator?: (a: T, b: T) => number) {
    super((a, b) => -(comparator ? comparator(a, b) : (a as unknown as number) - (b as unknown as number)));
  }
}

/**
 * BloomFilter - Probabilistic set membership structure
 * @class
 */
export class BloomFilter {
  private bitArray: boolean[];
  private size: number;
  private hashCount: number;
  private count: number = 0;

  /**
   * Creates a new BloomFilter
   * @param {number} size - Size of the filter in bits
   * @param {number} hashCount - Number of hash functions
   */
  constructor(size: number = 1000, hashCount: number = 4) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Array(size).fill(false);
  }

  /**
   * Add an item to the filter
   * @param {string} item - Item to add
   */
  add(item: string): void {
    const indexes = this.getHashIndexes(item);
    indexes.forEach(index => {
      this.bitArray[index] = true;
    });
    this.count++;
  }

  /**
   * Check if item might be in set
   * @param {string} item - Item to check
   * @returns {boolean} True if might be in set (false = definitely not)
   */
  has(item: string): boolean {
    const indexes = this.getHashIndexes(item);
    return indexes.every(index => this.bitArray[index]);
  }

  /**
   * Get filter size
   * @returns {number} Size in bits
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Get number of hash functions
   * @returns {number} Hash count
   */
  getHashCount(): number {
    return this.hashCount;
  }

  /**
   * Get estimated false positive rate
   * @returns {number} Estimated FPR
   */
  getFalsePositiveRate(): number {
    const n = this.count;
    return Math.pow(1 - Math.exp(-this.hashCount * n / this.size), this.hashCount);
  }

  /**
   * Get item count
   * @returns {number} Number of items added
   */
  getCount(): number {
    return this.count;
  }

  private getHashIndexes(item: string): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < this.hashCount; i++) {
      indexes.push(this.hash(item, i) % this.size);
    }
    return indexes;
  }

  private hash(item: string, seed: number): number {
    let hash = 0;
    for (let i = 0; i < item.length; i++) {
      hash = ((hash << 5) - hash + item.charCodeAt(i) + seed) | 0;
    }
    return Math.abs(hash);
  }
}

/**
 * Trie - Prefix tree for string storage and search
 * @class
 */
export class Trie {
  private root: TrieNode;
  private wordCount: number = 0;

  /**
   * Creates a new Trie
   */
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word
   * @param {string} word - Word to insert
   */
  insert(word: string): void {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    this.wordCount++;
  }

  /**
   * Search for exact word
   * @param {string} word - Word to search
   * @returns {boolean} True if word exists
   */
  search(word: string): boolean {
    const node = this.traverse(word.toLowerCase());
    return node !== null && node.isEndOfWord;
  }

  /**
   * Check if any word starts with prefix
   * @param {string} prefix - Prefix to check
   * @returns {boolean} True if any word has this prefix
   */
  startsWith(prefix: string): boolean {
    return this.traverse(prefix.toLowerCase()) !== null;
  }

  /**
   * Delete a word
   * @param {string} word - Word to delete
   * @returns {boolean} True if word was deleted
   */
  delete(word: string): boolean {
    const node = this.traverse(word.toLowerCase());
    if (!node || !node.isEndOfWord) return false;
    node.isEndOfWord = false;
    this.wordCount--;
    return true;
  }

  /**
   * Get all words with prefix
   * @param {string} prefix - Prefix to match
   * @returns {string[]} Array of matching words
   */
  getWords(prefix: string = ''): string[] {
    const node = this.traverse(prefix.toLowerCase());
    if (!node) return [];
    const words: string[] = [];
    this.collectWords(node, prefix.toLowerCase(), words);
    return words;
  }

  /**
   * Get longest matching prefix
   * @param {string} word - Word to match
   * @returns {string} Longest prefix found
   */
  getLongestPrefix(word: string): string {
    let node = this.root;
    let prefix = '';
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) break;
      prefix += char;
      node = node.children[char];
    }
    return prefix;
  }

  /**
   * Check if trie is empty
   * @returns {boolean} True if empty
   */
  isEmpty(): boolean {
    return this.wordCount === 0;
  }

  /**
   * Get word count
   * @returns {number} Number of words
   */
  size(): number {
    return this.wordCount;
  }

  private traverse(prefix: string): TrieNode | null {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return null;
      node = node.children[char];
    }
    return node;
  }

  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(prefix);
    }
    for (const [char, child] of Object.entries(node.children)) {
      this.collectWords(child, prefix + char, words);
    }
  }
}

class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEndOfWord: boolean = false;
}

/**
 * Graph - Undirected graph implementation
 * @class
 * @typeparam T - Node type
 */
export class Graph<T> {
  protected adjacencyList: Map<T, { neighbor: T; weight: number }[]>;
  protected nodeCount: number = 0;
  protected edgeCount: number = 0;

  /**
   * Creates a new Graph
   */
  constructor() {
    this.adjacencyList = new Map();
  }

  /**
   * Add a node
   * @param {T} node - Node to add
   * @returns {Graph<T>} Returns this for chaining
   */
  addNode(node: T): Graph<T> {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, []);
      this.nodeCount++;
    }
    return this;
  }

  /**
   * Add an edge between two nodes
   * @param {T} node1 - First node
   * @param {T} node2 - Second node
   * @param {number} weight - Edge weight (default: 1)
   * @returns {Graph<T>} Returns this for chaining
   */
  addEdge(node1: T, node2: T, weight: number = 1): Graph<T> {
    this.addNode(node1);
    this.addNode(node2);
    this.adjacencyList.get(node1)!.push({ neighbor: node2, weight });
    this.adjacencyList.get(node2)!.push({ neighbor: node1, weight });
    this.edgeCount++;
    return this;
  }

  /**
   * Remove a node
   * @param {T} node - Node to remove
   * @returns {boolean} True if node was removed
   */
  removeNode(node: T): boolean {
    if (!this.adjacencyList.has(node)) return false;
    
    // Remove all edges to this node
    for (const neighbors of this.adjacencyList.values()) {
      const index = neighbors.findIndex(n => n.neighbor === node);
      if (index !== -1) {
        neighbors.splice(index, 1);
        this.edgeCount--;
      }
    }
    
    this.adjacencyList.delete(node);
    this.nodeCount--;
    return true;
  }

  /**
   * Remove an edge
   * @param {T} node1 - First node
   * @param {T} node2 - Second node
   * @returns {boolean} True if edge was removed
   */
  removeEdge(node1: T, node2: T): boolean {
    const neighbors1 = this.adjacencyList.get(node1);
    const neighbors2 = this.adjacencyList.get(node2);
    
    if (!neighbors1 || !neighbors2) return false;
    
    const index1 = neighbors1.findIndex(n => n.neighbor === node2);
    const index2 = neighbors2.findIndex(n => n.neighbor === node1);
    
    if (index1 !== -1) {
      neighbors1.splice(index1, 1);
      this.edgeCount--;
    }
    if (index2 !== -1) {
      neighbors2.splice(index2, 1);
    }
    
    return index1 !== -1;
  }

  /**
   * Check if node exists
   * @param {T} node - Node to check
   * @returns {boolean} True if node exists
   */
  hasNode(node: T): boolean {
    return this.adjacencyList.has(node);
  }

  /**
   * Check if edge exists
   * @param {T} node1 - First node
   * @param {T} node2 - Second node
   * @returns {boolean} True if edge exists
   */
  hasEdge(node1: T, node2: T): boolean {
    const neighbors = this.adjacencyList.get(node1);
    return neighbors?.some(n => n.neighbor === node2) ?? false;
  }

  /**
   * Get neighbors of a node
   * @param {T} node - Node to get neighbors for
   * @returns {T[]} Array of neighbors
   */
  getNeighbors(node: T): T[] {
    return this.adjacencyList.get(node)?.map(n => n.neighbor) ?? [];
  }

  /**
   * Get edge weight
   * @param {T} node1 - First node
   * @param {T} node2 - Second node
   * @returns {number | undefined if no undefined} Weight or edge
   */
  getWeight(node1: T, node2: T): number | undefined {
    return this.adjacencyList.get(node1)?.find(n => n.neighbor === node2)?.weight;
  }

  /**
   * Get node count
   * @returns {number} Number of nodes
   */
  size(): number {
    return this.nodeCount;
  }

  /**
   * Get all nodes
   * @returns {T[]} Array of all nodes
   */
  getNodes(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Get all edges
   * @returns {{ from: T; to: T; weight: number }[]} Array of edges
   */
  getEdges(): { from: T; to: T; weight: number }[] {
    const edges: { from: T; to: T; weight: number }[] = [];
    const seen = new Set<string>();
    
    for (const [node, neighbors] of this.adjacencyList) {
      for (const neighbor of neighbors) {
        const key = `${String(node)}-${String(neighbor.neighbor)}`;
        const reverseKey = `${String(neighbor.neighbor)}-${String(node)}`;
        if (!seen.has(reverseKey)) {
          edges.push({ from: node, to: neighbor.neighbor, weight: neighbor.weight });
          seen.add(key);
        }
      }
    }
    
    return edges;
  }

  /**
   * Breadth-first search
   * @param {T} start - Start node
   * @param {T} target - Target node
   * @returns {T[] | null} Path or null if not found
   */
  bfs(start: T, target: T): T[] | null {
    if (!this.hasNode(start) || !this.hasNode(target)) return null;
    
    const queue: T[] = [start];
    const visited = new Set<T>([start]);
    const parent = new Map<T, T>();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === target) {
        return this.reconstructPath(parent, start, target);
      }
      
      for (const neighbor of this.getNeighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }
    
    return null;
  }

  /**
   * Depth-first search
   * @param {T} start - Start node
   * @param {T} target - Target node
   * @returns {T[] | null} Path or null if not found
   */
  dfs(start: T, target: T): T[] | null {
    if (!this.hasNode(start) || !this.hasNode(target)) return null;
    
    const visited = new Set<T>();
    const parent = new Map<T, T>();
    
    const dfsHelper = (node: T): boolean => {
      if (node === target) return true;
      
      visited.add(node);
      for (const neighbor of this.getNeighbors(node)) {
        if (!visited.has(neighbor)) {
          parent.set(neighbor, node);
          if (dfsHelper(neighbor)) return true;
        }
      }
      
      return false;
    };
    
    if (dfsHelper(start)) {
      return this.reconstructPath(parent, start, target);
    }
    return null;
  }

  /**
   * Dijkstra's shortest path algorithm
   * @param {T} start - Start node
   * @param {T} target - Target node
   * @returns {{ path: T[]; distance: number } | null} Path and distance or null
   */
  dijkstra(start: T, target: T): { path: T[]; distance: number } | null {
    if (!this.hasNode(start) || !this.hasNode(target)) return null;
    
    const distances = new Map<T, number>();
    const parent = new Map<T, T>();
    const pq = new PriorityQueue<T>();
    
    for (const node of this.getNodes()) {
      distances.set(node, Infinity);
    }
    distances.set(start, 0);
    pq.enqueue(start, 0);
    
    while (!pq.isEmpty()) {
      const current = pq.dequeue()!;
      if (current === target) {
        return {
          path: this.reconstructPath(parent, start, target),
          distance: distances.get(target)!
        };
      }
      
      for (const neighbor of this.getNeighbors(current)) {
        const weight = this.getWeight(current, neighbor)!;
        const newDist = distances.get(current)! + weight;
        
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          parent.set(neighbor, current);
          pq.enqueue(neighbor, newDist);
        }
      }
    }
    
    return null;
  }

  private reconstructPath(parent: Map<T, T>, start: T, target: T): T[] {
    const path: T[] = [];
    let current: T = target;
    while (current !== undefined) {
      path.unshift(current);
      const parentNode = parent.get(current);
      if (current === start || parentNode === undefined) break;
      current = parentNode;
    }
    return path;
  }
}

/**
 * DirectedGraph - Directed graph implementation
 * @class
 * @typeparam T - Node type
 */
export class DirectedGraph<T> extends Graph<T> {
  /**
   * Add a directed edge
   * @param {T} from - Source node
   * @param {T} to - Target node
   * @param {number} weight - Edge weight (default: 1)
   * @returns {DirectedGraph<T>} Returns this for chaining
   */
  addEdge(from: T, to: T, weight: number = 1): DirectedGraph<T> {
    this.addNode(from);
    this.addNode(to);
    const neighbors = this.adjacencyList.get(from)!;
    neighbors.push({ neighbor: to, weight });
    this.edgeCount++;
    return this;
  }

  /**
   * Remove a directed edge
   * @param {T} from - Source node
   * @param {T} to - Target node
   * @returns {boolean} True if edge was removed
   */
  removeEdge(from: T, to: T): boolean {
    const neighbors = this.adjacencyList.get(from);
    if (!neighbors) return false;
    
    const index = neighbors.findIndex(n => n.neighbor === to);
    if (index !== -1) {
      neighbors.splice(index, 1);
      this.edgeCount--;
      return true;
    }
    return false;
  }

  /**
   * Get in-neighbors of a node
   * @param {T} node - Node to get in-neighbors for
   * @returns {T[]} Array of in-neighbors
   */
  getInNeighbors(node: T): T[] {
    const inNeighbors: T[] = [];
    for (const [source, neighbors] of this.adjacencyList) {
      if (neighbors.some(n => n.neighbor === node)) {
        inNeighbors.push(source);
      }
    }
    return inNeighbors;
  }

  /**
   * Topological sort (Kahn's algorithm)
   * @returns {T[] | null} Topologically sorted nodes or null if cycle exists
   */
  topologicalSort(): T[] | null {
    const inDegree = new Map<T, number>();
    const nodes = this.getNodes();
    
    for (const node of nodes) {
      inDegree.set(node, 0);
    }
    
    for (const node of nodes) {
      for (const neighbor of this.getNeighbors(node)) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
      }
    }
    
    const queue: T[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node);
    }
    
    const result: T[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      
      for (const neighbor of this.getNeighbors(node)) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    return result.length === nodes.length ? result : null;
  }
}

/**
 * DisjointSet - Union-Find data structure
 * @class
 * @typeparam T - Element type
 */
export class DisjointSet<T> {
  private parent: Map<T, T>;
  private size: Map<T, number>;
  private sets: Map<string, T[]>;

  /**
   * Creates a new DisjointSet
   */
  constructor() {
    this.parent = new Map();
    this.size = new Map();
    this.sets = new Map();
  }

  /**
   * Create sets from items
   * @param {T[]} items - Items to create sets from
   */
  makeSet(items: T[]): void {
    for (const item of items) {
      this.parent.set(item, item);
      this.size.set(item, 1);
      this.sets.set(this.getKey(item), [item]);
    }
  }

  /**
   * Find set representative
   * @param {T} item - Item to find
   * @returns {T | undefined} Representative or undefined
   */
  find(item: T): T | undefined {
    if (!this.parent.has(item)) return undefined;
    
    // Path compression
    const root = this.findRoot(item);
    this.pathCompression(item, root);
    return root;
  }

  /**
   * Union two sets
   * @param {T} item1 - First item
   * @param {T} item2 - Second item
   * @returns {boolean} True if union was performed
   */
  union(item1: T, item2: T): boolean {
    const root1 = this.find(item1);
    const root2 = this.find(item2);
    
    if (!root1 || !root2 || root1 === root2) return false;
    
    // Union by size
    const size1 = this.size.get(root1) ?? 1;
    const size2 = this.size.get(root2) ?? 1;
    
    let newRoot: T;
    let childRoot: T;
    if (size1 >= size2) {
      newRoot = root1;
      childRoot = root2;
    } else {
      newRoot = root2;
      childRoot = root1;
    }
    
    this.parent.set(childRoot, newRoot);
    this.size.set(newRoot, size1 + size2);
    
    // Merge sets
    const key1 = this.getKey(root1);
    const key2 = this.getKey(root2);
    const set1 = this.sets.get(key1) ?? [];
    const set2 = this.sets.get(key2) ?? [];
    this.sets.set(this.getKey(newRoot), [...set1, ...set2]);
    this.sets.delete(key1);
    this.sets.delete(key2);
    
    return true;
  }

  /**
   * Check if two items are in the same set
   * @param {T} item1 - First item
   * @param {T} item2 - Second item
   * @returns {boolean} True if connected
   */
  connected(item1: T, item2: T): boolean {
    const root1 = this.find(item1);
    const root2 = this.find(item2);
    return root1 !== undefined && root1 === root2;
  }

  /**
   * Get size of set containing item
   * @param {T} item - Item to check
   * @returns {number} Size of set
   */
  getSize(item: T): number {
    const root = this.find(item);
    return root ? (this.size.get(root) ?? 1) : 0;
  }

  /**
   * Get all sets
   * @returns {T[][]} Array of sets
   */
  getSets(): T[][] {
    return Array.from(this.sets.values());
  }

  private getKey(item: T): string {
    return String(item);
  }

  private findRoot(item: T): T {
    if (this.parent.get(item) === item) {
      return item;
    }
    return this.findRoot(this.parent.get(item)!);
  }

  private pathCompression(item: T, root: T): void {
    if (this.parent.get(item) !== item) {
      this.pathCompression(this.parent.get(item)!, root);
      this.parent.set(item, root);
    }
  }
}

/**
 * BitSet - Fixed-size bit array
 * @class
 */
export class BitSet {
  private bits: number[];
  private size: number;

  /**
   * Creates a new BitSet
   * @param {number} size - Number of bits
   */
  constructor(size: number) {
    this.size = size;
    this.bits = new Array(Math.ceil(size / 32)).fill(0);
  }

  /**
   * Set a bit to 1
   * @param {number} bit - Bit index
   * @returns {BitSet} Returns this for chaining
   */
  set(bit: number): BitSet {
    if (bit < 0 || bit >= this.size) return this;
    const wordIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    this.bits[wordIndex] |= (1 << bitIndex);
    return this;
  }

  /**
   * Clear a bit to 0
   * @param {number} bit - Bit index
   * @returns {BitSet} Returns this for chaining
   */
  clear(bit: number): BitSet {
    if (bit < 0 || bit >= this.size) return this;
    const wordIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    this.bits[wordIndex] &= ~(1 << bitIndex);
    return this;
  }

  /**
   * Toggle a bit
   * @param {number} bit - Bit index
   * @returns {BitSet} Returns this for chaining
   */
  toggle(bit: number): BitSet {
    if (bit < 0 || bit >= this.size) return this;
    const wordIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    this.bits[wordIndex] ^= (1 << bitIndex);
    return this;
  }

  /**
   * Check if a bit is set
   * @param {number} bit - Bit index
   * @returns {boolean} True if bit is set
   */
  has(bit: number): boolean {
    if (bit < 0 || bit >= this.size) return false;
    const wordIndex = Math.floor(bit / 32);
    const bitIndex = bit % 32;
    return (this.bits[wordIndex] & (1 << bitIndex)) !== 0;
  }

  /**
   * Bitwise AND with another BitSet
   * @param {BitSet} other - Other BitSet
   * @returns {BitSet} New BitSet with result
   */
  and(other: BitSet): BitSet {
    const result = new BitSet(this.size);
    const minLength = Math.min(this.bits.length, other.bits.length);
    for (let i = 0; i < minLength; i++) {
      result.bits[i] = this.bits[i] & other.bits[i];
    }
    return result;
  }

  /**
   * Bitwise OR with another BitSet
   * @param {BitSet} other - Other BitSet
   * @returns {BitSet} New BitSet with result
   */
  or(other: BitSet): BitSet {
    const result = new BitSet(this.size);
    const maxLength = Math.max(this.bits.length, other.bits.length);
    for (let i = 0; i < maxLength; i++) {
      const thisWord = this.bits[i] ?? 0;
      const otherWord = other.bits[i] ?? 0;
      result.bits[i] = thisWord | otherWord;
    }
    return result;
  }

  /**
   * Bitwise XOR with another BitSet
   * @param {BitSet} other - Other BitSet
   * @returns {BitSet} New BitSet with result
   */
  xor(other: BitSet): BitSet {
    const result = new BitSet(this.size);
    const maxLength = Math.max(this.bits.length, other.bits.length);
    for (let i = 0; i < maxLength; i++) {
      const thisWord = this.bits[i] ?? 0;
      const otherWord = other.bits[i] ?? 0;
      result.bits[i] = thisWord ^ otherWord;
    }
    return result;
  }

  /**
   * Bitwise NOT
   * @returns {BitSet} New BitSet with result
   */
  not(): BitSet {
    const result = new BitSet(this.size);
    for (let i = 0; i < this.bits.length; i++) {
      result.bits[i] = ~this.bits[i];
    }
    return result;
  }

  /**
   * Count set bits
   * @returns {number} Number of set bits
   */
  count(): number {
    let count = 0;
    for (const word of this.bits) {
      count += this.popcount(word);
    }
    return count;
  }

  /**
   * Convert to array of set bits
   * @returns {number[]} Array of indices that are set
   */
  toArray(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.has(i)) {
        result.push(i);
      }
    }
    return result;
  }

  /**
   * Convert to binary string
   * @returns {string} Binary string representation
   */
  toString(): string {
    let result = '';
    for (let i = this.size - 1; i >= 0; i--) {
      result += this.has(i) ? '1' : '0';
    }
    return result;
  }

  /**
   * Get the size of the BitSet
   * @returns {number} Size in bits
   */
  getSize(): number {
    return this.size;
  }

  private popcount(x: number): number {
    let count = 0;
    while (x > 0) {
      x &= (x - 1);
      count++;
    }
    return count;
  }
}
