/**
 * Simple in-memory cache for MCP servers
 * Reduces load on Redis and file system for frequently accessed data
 */

import type { CacheEntry, CacheOptions } from "./types";

export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTtl: number;

  constructor(defaultTtl: number = 60000) {
    // Default 1 minute
    this.defaultTtl = defaultTtl;
  }

  /**
   * Set a cache entry
   */
  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      cachedAt: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Get a cache entry if valid, null if expired or missing
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.cachedAt > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Get or compute a cache entry
   */
  async getOrCompute(
    key: string,
    compute: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = this.get(key);

    if (cached !== null) {
      return cached;
    }

    const data = await compute();
    this.set(key, data, ttl);

    return data;
  }

  /**
   * Check if cache has a valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.cachedAt > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let validCount = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now - entry.cachedAt > entry.ttl) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
    };
  }
}

/**
 * Global cache instances for each MCP server
 */
export const analyticsCache = new SimpleCache(60000); // 1 minute
export const tokensCache = new SimpleCache(300000); // 5 minutes
export const contentCache = new SimpleCache(300000); // 5 minutes

/**
 * Semantic Scholar MCP cache instances
 * - scholarPapersCache: Hot cache for paper metadata (1 minute)
 * - scholarSearchCache: Search results cache (5 minutes)
 * - scholarAuthorsCache: Author metadata cache (5 minutes)
 * Note: Long-term persistence (90 days) is handled via Redis in the MCP server
 */
export const scholarPapersCache = new SimpleCache(60000); // 1 minute
export const scholarSearchCache = new SimpleCache(300000); // 5 minutes
export const scholarAuthorsCache = new SimpleCache(300000); // 5 minutes
