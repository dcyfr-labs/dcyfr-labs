/**
 * Credly Data Caching Utilities
 * 
 * Provides client-side caching for Credly API data to improve performance
 * and reduce redundant API calls across multiple components on the same page.
 */

import type { CredlyBadge, CredlyBadgesResponse } from "@/types/credly";

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_KEY_PREFIX = "credly_cache_";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface BadgesApiResponse {
  badges: CredlyBadge[];
  total_count: number;
  count: number;
}

// In-memory cache for the current session
const cache = new Map<string, CacheEntry<any>>();

/**
 * Create a cache key for badges with username and limit
 */
function createBadgesCacheKey(username: string, limit?: number): string {
  return `${CACHE_KEY_PREFIX}badges_${username}_${limit || "all"}`;
}

/**
 * Check if a cache entry is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() < entry.expiresAt;
}

/**
 * Get cached data if valid, otherwise return null
 */
function getCachedData<T>(cacheKey: string): T | null {
  const entry = cache.get(cacheKey);
  if (entry && isCacheValid(entry)) {
    return entry.data;
  }
  // Remove expired entry
  if (entry) {
    cache.delete(cacheKey);
  }
  return null;
}

/**
 * Store data in cache with expiration
 */
function setCachedData<T>(cacheKey: string, data: T): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION,
  };
  cache.set(cacheKey, entry);
}

/**
 * Fetch Credly badges with caching
 */
export async function fetchCredlyBadgesCached(
  username: string = "dcyfr", 
  limit?: number
): Promise<BadgesApiResponse> {
  const cacheKey = createBadgesCacheKey(username, limit);
  
  // Check cache first
  const cached = getCachedData<BadgesApiResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Build API URL
  const params = new URLSearchParams({
    username,
    ...(limit && { limit: limit.toString() }),
  });

  const apiUrl = `/api/credly/badges?${params}`;
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch badges: ${response.status}`);
  }

  const data: BadgesApiResponse = await response.json();
  
  // Cache the response
  setCachedData(cacheKey, data);
  
  return data;
}

/**
 * Clear all Credly cache entries
 */
export function clearCredlyCache(): void {
  for (const key of cache.keys()) {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      cache.delete(key);
    }
  }
  console.log("[Credly Cache] ✅ Cache cleared");
}

/**
 * Get cache statistics for debugging
 */
export function getCredlyCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  cacheKeys: string[];
} {
  const credlyKeys = Array.from(cache.keys()).filter(key => 
    key.startsWith(CACHE_KEY_PREFIX)
  );
  
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const key of credlyKeys) {
    const entry = cache.get(key);
    if (entry) {
      if (isCacheValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
  }
  
  return {
    totalEntries: credlyKeys.length,
    validEntries,
    expiredEntries,
    cacheKeys: credlyKeys,
  };
}

/**
 * Preload Credly data for better performance
 * Useful for SSR or when you know data will be needed
 */
export async function preloadCredlyData(
  username: string = "dcyfr"
): Promise<void> {
  try {
    // Preload both unlimited and limited data
    await Promise.all([
      fetchCredlyBadgesCached(username), // All badges
      fetchCredlyBadgesCached(username, 10), // Top 10
      fetchCredlyBadgesCached(username, 3), // Top 3
    ]);
    console.log(`[Credly Cache] ✅ Preloaded data for ${username}`);
  } catch (error) {
    console.error(`[Credly Cache] ❌ Preload failed for ${username}:`, error);
  }
}