/**
 * Cache Versioning System
 *
 * Prevents cache drift when code structure changes by:
 * 1. Including version in cache keys
 * 2. Validating cached data against expected schema
 * 3. Automatic invalidation on schema changes
 * 4. Type-safe cache operations
 *
 * Usage:
 * ```typescript
 * import { VersionedCache } from '@/lib/cache-versioning';
 *
 * const activityCache = new VersionedCache({
 *   namespace: 'activity',
 *   version: 2, // Increment when structure changes
 *   ttl: 3600,
 *   validate: (data) => Array.isArray(data) && data.every(item => 'id' in item),
 * });
 *
 * // Set with automatic versioning
 * await activityCache.set('feed:all', activities);
 *
 * // Get with validation
 * const cached = await activityCache.get('feed:all');
 * if (!cached) {
 *   // Cache miss or validation failed - fetch fresh data
 * }
 * ```
 */

import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheVersionConfig<T = any> {
  /** Namespace for this cache (e.g., 'activity', 'analytics') */
  namespace: string;
  /** Schema version - increment when data structure changes */
  version: number;
  /** Time-to-live in seconds */
  ttl: number;
  /** Optional validator function to check data integrity */
  validate?: (data: unknown) => data is T;
  /** Optional description for debugging */
  description?: string;
}

export interface CacheMetadata {
  version: number;
  cachedAt: string;
  expiresAt: string;
  namespace: string;
}

export interface CachedData<T> {
  metadata: CacheMetadata;
  data: T;
}

// ============================================================================
// REDIS CLIENT HELPER
// ============================================================================

async function getRedisClient(): Promise<RedisClientType | null> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[Cache] REDIS_URL not configured');
    return null;
  }

  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Max retries exceeded');
          return Math.min(retries * 100, 3000);
        },
      },
    });

    if (!client.isOpen) {
      await client.connect();
    }

    return client as RedisClientType;
  } catch (error) {
    console.error('[Cache] Redis connection failed:', error);
    return null;
  }
}

// ============================================================================
// VERSIONED CACHE
// ============================================================================

export class VersionedCache<T = any> {
  private config: CacheVersionConfig<T>;

  constructor(config: CacheVersionConfig<T>) {
    this.config = config;
  }

  /**
   * Generate versioned cache key
   * Format: {namespace}:v{version}:{key}
   * Example: activity:v2:feed:all
   */
  private getVersionedKey(key: string): string {
    return `${this.config.namespace}:v${this.config.version}:${key}`;
  }

  /**
   * Get data from cache with validation
   * Returns null if:
   * - Cache miss
   * - Version mismatch
   * - Validation failed
   * - Redis unavailable
   */
  async get(key: string): Promise<T | null> {
    const redis = await getRedisClient();
    if (!redis) return null;

    try {
      const versionedKey = this.getVersionedKey(key);
      const raw = await redis.get(versionedKey);

      if (!raw) {
        console.warn(
          `[Cache] Miss: ${versionedKey} (${this.config.description || this.config.namespace})`
        );
        return null;
      }

      const cached: CachedData<T> = JSON.parse(raw);

      // Validate version match
      if (cached.metadata.version !== this.config.version) {
        console.warn(
          `[Cache] Version mismatch: ${versionedKey} (cached: v${cached.metadata.version}, expected: v${this.config.version})`
        );
        // Auto-cleanup old version
        await redis.del(versionedKey);
        return null;
      }

      // Validate schema if validator provided
      if (this.config.validate && !this.config.validate(cached.data)) {
        console.error(
          `[Cache] Validation failed: ${versionedKey} - data does not match expected schema`
        );
        // Auto-cleanup invalid data
        await redis.del(versionedKey);
        return null;
      }

      console.warn(
        `[Cache] Hit: ${versionedKey} (${this.config.description || this.config.namespace}, ${this.formatAge(cached.metadata.cachedAt)})`
      );

      return cached.data;
    } catch (error) {
      console.error(`[Cache] Get error:`, error);
      return null;
    } finally {
      await redis.quit();
    }
  }

  /**
   * Set data in cache with version metadata
   */
  async set(key: string, data: T, customTtl?: number): Promise<boolean> {
    const redis = await getRedisClient();
    if (!redis) return false;

    try {
      const versionedKey = this.getVersionedKey(key);
      const ttl = customTtl ?? this.config.ttl;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl * 1000);

      const cached: CachedData<T> = {
        metadata: {
          version: this.config.version,
          cachedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          namespace: this.config.namespace,
        },
        data,
      };

      await redis.setEx(versionedKey, ttl, JSON.stringify(cached));

      console.warn(
        `[Cache] Set: ${versionedKey} (${this.config.description || this.config.namespace}, TTL: ${ttl}s)`
      );

      return true;
    } catch (error) {
      console.error(`[Cache] Set error:`, error);
      return false;
    } finally {
      await redis.quit();
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<boolean> {
    const redis = await getRedisClient();
    if (!redis) return false;

    try {
      const versionedKey = this.getVersionedKey(key);
      const deleted = await redis.del(versionedKey);

      console.warn(`[Cache] Deleted: ${versionedKey} (${deleted > 0 ? 'success' : 'not found'})`);

      return deleted > 0;
    } catch (error) {
      console.error(`[Cache] Delete error:`, error);
      return false;
    } finally {
      await redis.quit();
    }
  }

  /**
   * Delete all cache entries for this namespace (all versions)
   * WARNING: Use with caution - deletes ALL versions
   */
  async deleteAllVersions(key: string): Promise<number> {
    const redis = await getRedisClient();
    if (!redis) return 0;

    try {
      // Find all keys matching pattern
      const pattern = `${this.config.namespace}:v*:${key}`;
      const keys = await redis.keys(pattern);

      if (keys.length === 0) {
        console.warn(`[Cache] No keys found matching: ${pattern}`);
        return 0;
      }

      const deleted = await redis.del(keys);
      console.warn(`[Cache] Deleted ${deleted} versions of ${this.config.namespace}:${key}`);

      return deleted;
    } catch (error) {
      console.error(`[Cache] Delete all versions error:`, error);
      return 0;
    } finally {
      await redis.quit();
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    exists: boolean;
    version: number | null;
    age: string | null;
    ttl: number | null;
  }> {
    const redis = await getRedisClient();
    if (!redis) {
      return { exists: false, version: null, age: null, ttl: null };
    }

    try {
      const versionedKey = this.getVersionedKey('*');
      const keys = await redis.keys(versionedKey);

      if (keys.length === 0) {
        return { exists: false, version: null, age: null, ttl: null };
      }

      // Get first key's metadata
      const raw = await redis.get(keys[0]);
      if (!raw) {
        return { exists: false, version: null, age: null, ttl: null };
      }

      const cached: CachedData<T> = JSON.parse(raw);
      const ttl = await redis.ttl(keys[0]);

      return {
        exists: true,
        version: cached.metadata.version,
        age: this.formatAge(cached.metadata.cachedAt),
        ttl: ttl > 0 ? ttl : null,
      };
    } catch (error) {
      console.error(`[Cache] Stats error:`, error);
      return { exists: false, version: null, age: null, ttl: null };
    } finally {
      await redis.quit();
    }
  }

  /**
   * Format age as human-readable string
   */
  private formatAge(cachedAt: string): string {
    const now = Date.now();
    const cached = new Date(cachedAt).getTime();
    const ageMs = now - cached;
    const ageMinutes = Math.floor(ageMs / 60000);

    if (ageMinutes < 1) return '< 1 minute ago';
    if (ageMinutes === 1) return '1 minute ago';
    if (ageMinutes < 60) return `${ageMinutes} minutes ago`;

    const ageHours = Math.floor(ageMinutes / 60);
    if (ageHours === 1) return '1 hour ago';
    if (ageHours < 24) return `${ageHours} hours ago`;

    const ageDays = Math.floor(ageHours / 24);
    if (ageDays === 1) return '1 day ago';
    return `${ageDays} days ago`;
  }
}

// ============================================================================
// CACHE VERSION REGISTRY
// ============================================================================

/**
 * Central registry of all cache versions
 * Update these when changing data structures
 */
export const CACHE_VERSIONS = {
  /** Activity feed cache - increment when ActivityItem structure changes */
  ACTIVITY_FEED: 2, // v2: Added threading support + removed old aggregation logic

  /** Analytics cache - increment when analytics data structure changes */
  ANALYTICS: 1,

  /** Trending posts cache */
  TRENDING: 1,

  /** GitHub data cache */
  GITHUB: 1,
} as const;

// ============================================================================
// PRE-CONFIGURED CACHE INSTANCES
// ============================================================================

/**
 * Activity feed cache with validation
 */
export const activityFeedCache = new VersionedCache({
  namespace: 'activity',
  version: CACHE_VERSIONS.ACTIVITY_FEED,
  ttl: 3600, // 1 hour
  description: 'Activity feed with threading',
  validate: (data): data is any[] => {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return true; // Empty is valid

    // Validate first item has required fields
    const item = data[0];
    return (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'source' in item &&
      'timestamp' in item
    );
  },
});
