/**
 * React hook for fetching global engagement counts from Redis
 *
 * Fetches global like and bookmark counts for activities across all users.
 * Includes caching and error handling.
 *
 * @example
 * ```tsx
 * const { globalLikes, globalBookmarks, loading } = useGlobalEngagementCounts({
 *   slug: "my-post",
 *   contentType: "post"
 * });
 *
 * return (
 *   <div>
 *     <span>❤️ {globalLikes} likes</span>
 *     <span>🔖 {globalBookmarks} bookmarks</span>
 *   </div>
 * );
 * ```
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ContentType } from '@/lib/engagement-analytics';

export interface GlobalEngagementCountsParams {
  slug: string;
  contentType: ContentType;
  /** If true, delays fetch until component is visible (reduces initial API load) */
  lazy?: boolean;
}

export interface UseGlobalEngagementCountsReturn {
  /** Global like count across all users */
  globalLikes: number;
  /** Global bookmark count across all users */
  globalBookmarks: number;
  /** Whether counts are being fetched */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually refresh counts */
  refetch: () => Promise<void>;
  /** Ref to attach to element for lazy loading (only when lazy=true) */
  ref: React.RefObject<HTMLDivElement | null>;
}

// In-memory cache for global counts (across component instances)
// Key: "slug:contentType"
const countCache = new Map<string, { likes: number; bookmarks: number; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

/** Safely parse JSON from a Response, returning a default value on error */
async function safeParseJson<T>(res: Response, fallback: T, tag: string): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch (parseErr) {
    console.warn(`[useGlobalEngagementCounts] Failed to parse ${tag} response:`, parseErr);
    return fallback;
  }
}

/**
 * Hook for fetching global engagement counts
 */
export function useGlobalEngagementCounts({
  slug,
  contentType,
  lazy = false,
}: GlobalEngagementCountsParams): UseGlobalEngagementCountsReturn {
  const [globalLikes, setGlobalLikes] = useState(0);
  const [globalBookmarks, setGlobalBookmarks] = useState(0);
  const [loading, setLoading] = useState(!lazy); // Start as not loading if lazy
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!lazy); // Treat as visible if not lazy
  const ref = useRef<HTMLDivElement | null>(null);

  const cacheKey = `${slug}:${contentType}`;

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = countCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.warn('[useGlobalEngagementCounts] Using cached counts:', {
          slug,
          contentType,
          likes: cached.likes,
          bookmarks: cached.bookmarks,
        });
        setGlobalLikes(cached.likes);
        setGlobalBookmarks(cached.bookmarks);
        setLoading(false);
        return;
      }

      console.warn('[useGlobalEngagementCounts] Fetching counts from API:', {
        slug,
        contentType,
      });

      // Fetch both counts in parallel
      const [likesRes, bookmarksRes] = await Promise.all([
        fetch(
          `/api/engagement/like?slug=${encodeURIComponent(slug)}&contentType=${encodeURIComponent(contentType)}`
        ),
        fetch(
          `/api/engagement/bookmark?slug=${encodeURIComponent(slug)}&contentType=${encodeURIComponent(contentType)}`
        ),
      ]);

      if (!likesRes.ok || !bookmarksRes.ok) {
        // Check if Redis is unavailable (503 status)
        if (likesRes.status === 503 || bookmarksRes.status === 503) {
          console.warn('[useGlobalEngagementCounts] Analytics unavailable (Redis not configured)');
          // Set defaults and don't throw error for optional analytics
          setGlobalLikes(0);
          setGlobalBookmarks(0);
          setLoading(false);
          return;
        }
        throw new Error(
          `Failed to fetch engagement counts (${likesRes.status}, ${bookmarksRes.status})`
        );
      }

      // Safer JSON parsing with error handling
      const likesData = await safeParseJson<{ count: number }>(likesRes, { count: 0 }, 'likes');
      const bookmarksData = await safeParseJson<{ count: number }>(bookmarksRes, { count: 0 }, 'bookmarks');

      const likes = likesData.count || 0;
      const bookmarks = bookmarksData.count || 0;

      console.warn('[useGlobalEngagementCounts] Fetched counts:', {
        slug,
        contentType,
        likes,
        bookmarks,
      });

      // Cache the results
      countCache.set(cacheKey, {
        likes,
        bookmarks,
        timestamp: Date.now(),
      });

      setGlobalLikes(likes);
      setGlobalBookmarks(bookmarks);
    } catch (err) {
      // More comprehensive error handling
      let errorMsg = 'Unknown error';
      let errorDetails: any = {};

      if (err instanceof Error) {
        errorMsg = err.message;
        errorDetails = {
          name: err.name,
          message: err.message,
          stack: err.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
        };
      } else if (typeof err === 'string') {
        errorMsg = err;
        errorDetails = { message: err };
      } else if (err && typeof err === 'object') {
        // Handle cases where err might be a plain object or have toString()
        errorMsg = err.toString?.() || JSON.stringify(err) || 'Error object';
        errorDetails = err;
      }

      // Less noisy logging for common development issues
      if (
        errorMsg.includes('Analytics unavailable') ||
        errorMsg.includes('Redis') ||
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError')
      ) {
        console.warn('[useGlobalEngagementCounts] Analytics unavailable:', errorMsg);
      } else {
        console.error('[useGlobalEngagementCounts] Error fetching counts:', {
          slug,
          contentType,
          error: errorMsg,
          details: errorDetails,
          originalError: err,
        });
      }

      setError(errorMsg);
      // Set defaults for graceful degradation
      setGlobalLikes(0);
      setGlobalBookmarks(0);
    } finally {
      setLoading(false);
    }
  }, [slug, contentType, cacheKey]);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          console.warn('[useGlobalEngagementCounts] Element visible, fetching counts:', {
            slug,
            contentType,
          });
          setIsVisible(true);
        }
      },
      {
        rootMargin: '100px', // Start fetching slightly before visible
        threshold: 0.01,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [lazy, slug, contentType, isVisible]);

  // Fetch counts when visible (or immediately if not lazy)
  useEffect(() => {
    if (isVisible) {
      fetchCounts();
    }
  }, [isVisible, fetchCounts]);

  return {
    globalLikes,
    globalBookmarks,
    loading,
    error,
    refetch: fetchCounts,
    ref,
  };
}
