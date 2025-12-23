/**
 * Blog Search Client Component
 * 
 * Client-side search integration for blog posts using unified search system
 */

"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/data/posts";
import { createSearchIndex, searchItems } from "@/lib/search";
import { BLOG_SEARCH_CONFIG } from "@/lib/blog/search-config";
import { SearchInput } from "@/components/common";

interface BlogSearchProps {
  /** All blog posts */
  posts: Post[];
  /** Current search query */
  searchQuery: string;
  /** Callback when search changes */
  onSearchChange: (query: string) => void;
  /** Number of filtered results */
  resultCount: number;
}

/**
 * Blog search component with unified search system
 * 
 * Features:
 * - Full-text search with fuzzy matching
 * - Advanced query syntax (tag:, category:, -, "exact")
 * - Search history
 * - Keyboard shortcuts (Cmd/Ctrl + K)
 * 
 * @example
 * <BlogSearchClient
 *   posts={posts}
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   resultCount={filteredPosts.length}
 * />
 */
export function BlogSearchClient({
  posts,
  searchQuery,
  onSearchChange,
  resultCount,
}: BlogSearchProps) {
  // Create search index (memoized)
  const searchIndex = useMemo(() => {
    return createSearchIndex(posts, BLOG_SEARCH_CONFIG);
  }, [posts]);

  return (
    <SearchInput
      value={searchQuery}
      onChange={onSearchChange}
      placeholder="Search blog posts... (try: tag:security, -test, &quot;exact phrase&quot;)"
      historyStorageKey={BLOG_SEARCH_CONFIG.historyStorageKey}
      resultCount={resultCount}
      keyboardShortcut={true}
      showHints={true}
    />
  );
}

/**
 * Hook to use blog search
 * Returns filtered posts based on search query
 */
export function useBlogSearch(posts: Post[], searchQuery: string) {
  const searchIndex = useMemo(() => {
    return createSearchIndex(posts, BLOG_SEARCH_CONFIG);
  }, [posts]);

  const searchResults = useMemo(() => {
    if (!searchQuery?.trim()) {
      return posts;
    }

    const results = searchItems(posts, searchIndex, searchQuery, BLOG_SEARCH_CONFIG);
    return results.map(r => r.item);
  }, [posts, searchIndex, searchQuery]);

  return searchResults;
}
