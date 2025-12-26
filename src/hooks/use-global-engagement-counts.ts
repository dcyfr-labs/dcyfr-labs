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

"use client";

import { useState, useEffect, useCallback } from "react";
import type { ContentType } from "@/lib/engagement-analytics";

export interface GlobalEngagementCountsParams {
  slug: string;
  contentType: ContentType;
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
}

// In-memory cache for global counts (across component instances)
// Key: "slug:contentType"
const countCache = new Map<string, { likes: number; bookmarks: number; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Hook for fetching global engagement counts
 */
export function useGlobalEngagementCounts({
  slug,
  contentType,
}: GlobalEngagementCountsParams): UseGlobalEngagementCountsReturn {
  const [globalLikes, setGlobalLikes] = useState(0);
  const [globalBookmarks, setGlobalBookmarks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${slug}:${contentType}`;

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = countCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.debug("[useGlobalEngagementCounts] Using cached counts:", {
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

      console.debug("[useGlobalEngagementCounts] Fetching counts from API:", {
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
        throw new Error("Failed to fetch engagement counts");
      }

      const likesData = (await likesRes.json()) as { count: number };
      const bookmarksData = (await bookmarksRes.json()) as { count: number };

      const likes = likesData.count || 0;
      const bookmarks = bookmarksData.count || 0;

      console.debug("[useGlobalEngagementCounts] Fetched counts:", {
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
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("[useGlobalEngagementCounts] Error fetching counts:", {
        slug,
        contentType,
        error: errorMsg,
      });
      setError(errorMsg);
      // Don't clear the state on error, keep showing cached/default values
    } finally {
      setLoading(false);
    }
  }, [slug, contentType, cacheKey]);

  // Fetch counts on mount and when slug/contentType changes
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    globalLikes,
    globalBookmarks,
    loading,
    error,
    refetch: fetchCounts,
  };
}
