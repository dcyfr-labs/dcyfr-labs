/**
 * Blog Search Analytics Wrapper
 * 
 * Tracks search and filter analytics for the blog page.
 * This component wraps the blog search/filter interactions and tracks:
 * - Search queries with results count
 * - Tag filter changes with results count
 * - Filter clears
 * 
 * Usage:
 * ```tsx
 * <BlogSearchAnalytics
 *   query="react"
 *   tags={["typescript", "web"]}
 *   resultsCount={12}
 * />
 * ```
 */

"use client";

import { useEffect, useRef } from "react";
import { trackSearch, trackTagFilter, trackFiltersClear } from "@/lib/analytics";

interface BlogSearchAnalyticsProps {
  query: string;
  tags: string[];
  resultsCount: number;
}

export function BlogSearchAnalytics({ query, tags, resultsCount }: BlogSearchAnalyticsProps) {
  const prevQueryRef = useRef<string>("");
  const prevTagsRef = useRef<string[]>([]);
  const hasTrackedInitialRef = useRef(false);

  useEffect(() => {
    // Skip initial mount
    if (!hasTrackedInitialRef.current) {
      hasTrackedInitialRef.current = true;
      prevQueryRef.current = query;
      prevTagsRef.current = tags;
      return;
    }

    const queryChanged = query !== prevQueryRef.current;
    const tagsChanged = JSON.stringify(tags) !== JSON.stringify(prevTagsRef.current);
    const hadPreviousFilters = prevQueryRef.current || prevTagsRef.current.length > 0;
    const hasCurrentFilters = query || tags.length > 0;

    // Track search query if changed and not empty
    if (queryChanged && query) {
      trackSearch(query, resultsCount);
    }

    // Track tag filter if changed and not empty
    if (tagsChanged && tags.length > 0) {
      trackTagFilter(tags, resultsCount);
    }

    // Track filter clear if we went from having filters to having none
    if (hadPreviousFilters && !hasCurrentFilters) {
      trackFiltersClear(!!prevQueryRef.current, prevTagsRef.current.length > 0);
    }

    // Update refs for next comparison
    prevQueryRef.current = query;
    prevTagsRef.current = tags;
  }, [query, tags, resultsCount]);

  // This component doesn't render anything
  return null;
}
