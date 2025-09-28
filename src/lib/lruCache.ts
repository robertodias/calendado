/**
 * LRU Cache implementation for public resolver
 * Provides in-memory caching with TTL support
 */

import type { CacheEntry, LRUCacheOptions } from './publicTypes';

// ============================================================================
// LRU CACHE NODE
// ============================================================================

interface LRUNode<T> {
  key: string;
  value: CacheEntry<T>;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

// ============================================================================
// LRU CACHE IMPLEMENTATION
// ============================================================================

export class LRUCache<T> {
  private capacity: number;
  private defaultTTL: number;
  private cache = new Map<string, LRUNode<T>>();
  private head: LRUNode<T> | null = null;
  private tail: LRUNode<T> | null = null;

  constructor(options: LRUCacheOptions) {
    this.capacity = options.maxSize;
    this.defaultTTL = options.defaultTTL;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const node = this.cache.get(key);

    if (!node) {
      return null;
    }

    // Check if expired
    if (this.isExpired(node.value)) {
      this.delete(key);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);

    return node.value.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // Update existing node
      existingNode.value = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL,
      };
      this.moveToHead(existingNode);
      return;
    }

    // Create new node
    const newNode: LRUNode<T> = {
      key,
      value: {
        data: value,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTTL,
      },
      prev: null,
      next: null,
    };

    // Add to cache
    this.cache.set(key, newNode);
    this.addToHead(newNode);

    // Remove least recently used if over capacity
    if (this.cache.size > this.capacity) {
      this.removeTail();
    }
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);

    if (!node) {
      return false;
    }

    this.cache.delete(key);
    this.removeNode(node);

    return true;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const node = this.cache.get(key);

    if (!node) {
      return false;
    }

    // Check if expired
    if (this.isExpired(node.value)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    capacity: number;
    hitRate: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    for (const node of this.cache.values()) {
      const timestamp = node.value.timestamp;

      if (oldestEntry === null || timestamp < oldestEntry) {
        oldestEntry = timestamp;
      }

      if (newestEntry === null || timestamp > newestEntry) {
        newestEntry = timestamp;
      }
    }

    return {
      size: this.cache.size,
      capacity: this.capacity,
      hitRate: 0, // Would need to track hits/misses
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let cleanedCount = 0;
    const expiredKeys: string[] = [];

    for (const [key, node] of this.cache.entries()) {
      if (this.isExpired(node.value)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
      cleanedCount++;
    }

    return cleanedCount;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return now - entry.timestamp > entry.ttl;
  }

  /**
   * Move node to head (most recently used)
   */
  private moveToHead(node: LRUNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Add node to head
   */
  private addToHead(node: LRUNode<T>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Remove node from linked list
   */
  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Remove tail node (least recently used)
   */
  private removeTail(): void {
    if (!this.tail) {
      return;
    }

    const tailKey = this.tail.key;
    this.cache.delete(tailKey);
    this.removeNode(this.tail);
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in cache
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(node => node.value.data);
  }

  /**
   * Get all entries in cache
   */
  entries(): [string, T][] {
    return Array.from(this.cache.entries()).map(([key, node]) => [
      key,
      node.value.data,
    ]);
  }
}

// ============================================================================
// CACHE FACTORY
// ============================================================================

/**
 * Create a new LRU cache instance
 */
export function createLRUCache<T>(options: LRUCacheOptions): LRUCache<T> {
  return new LRUCache<T>(options);
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Create cache key from path segments
 */
export function createCacheKey(segments: string[]): string {
  return segments.filter(Boolean).join('/');
}

/**
 * Parse cache key into path segments
 */
export function parseCacheKey(key: string): string[] {
  return key.split('/').filter(Boolean);
}

/**
 * Check if cache key matches pattern
 */
export function matchesCacheKey(key: string, pattern: string): boolean {
  const keySegments = parseCacheKey(key);
  const patternSegments = parseCacheKey(pattern);

  if (keySegments.length !== patternSegments.length) {
    return false;
  }

  for (let i = 0; i < keySegments.length; i++) {
    if (patternSegments[i] !== '*' && keySegments[i] !== patternSegments[i]) {
      return false;
    }
  }

  return true;
}
