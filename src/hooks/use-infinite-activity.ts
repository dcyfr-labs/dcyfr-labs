"use client";

import { useState, useCallback, useMemo } from "react";
import type { ActivityItem } from "@/lib/activity";

// ============================================================================
// TYPES
// ============================================================================

interface UseInfiniteActivityOptions {
  /** All activity items to paginate through */
  items: ActivityItem[];
  /** Total count of all activities (before limiting), if different from items.length */
  totalActivities?: number;
  /** Initial page size */
  initialPageSize?: number;
  /** How many items to load per "page" */
  pageSize?: number;
}

interface UseInfiniteActivityReturn {
  /** Currently visible items */
  visibleItems: ActivityItem[];
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether we're currently loading more */
  isLoadingMore: boolean;
  /** Load more items */
  loadMore: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
  /** Total item count */
  totalCount: number;
  /** Current visible count */
  visibleCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_INITIAL_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE = 5;
const SIMULATED_LOAD_DELAY = 300; // Simulate network delay for realistic UX

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for infinite scroll pagination of activity items
 *
 * Simulates async loading by paginating through existing items.
 * Useful for homepage activity sections that want infinite scroll UX
 * without requiring a backend API.
 *
 * @example
 * ```tsx
 * const { visibleItems, hasMore, isLoadingMore, loadMore } = useInfiniteActivity({
 *   items: allActivities,
 *   initialPageSize: 5,
 *   pageSize: 5,
 * });
 *
 * return (
 *   <VirtualActivityFeed
 *     items={visibleItems}
 *     enableInfiniteScroll
 *     onLoadMore={loadMore}
 *     hasMore={hasMore}
 *     isLoadingMore={isLoadingMore}
 *   />
 * );
 * ```
 */
export function useInfiniteActivity({
  items,
  totalActivities,
  initialPageSize = DEFAULT_INITIAL_PAGE_SIZE,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseInfiniteActivityOptions): UseInfiniteActivityReturn {
  const [visibleCount, setVisibleCount] = useState(initialPageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Memoize visible items
  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  // Check if there are more items
  const hasMore = visibleCount < items.length;

  // Load more items with simulated delay for realistic UX
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LOAD_DELAY));

    setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, pageSize, items.length]);

  // Reset to initial state
  const reset = useCallback(() => {
    setVisibleCount(initialPageSize);
    setIsLoadingMore(false);
  }, [initialPageSize]);

  return {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    totalCount: totalActivities ?? items.length,
    visibleCount: visibleItems.length, // Use actual visible items length, not state
  };
}

export default useInfiniteActivity;
