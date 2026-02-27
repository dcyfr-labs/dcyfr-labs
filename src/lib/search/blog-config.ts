/**
 * Blog Posts Search Configuration
 *
 * Search configuration for blog posts using the unified search system
 * Moved from src/lib/blog/search-config.ts during Phase 11d consolidation
 */

import type { SearchConfig } from '@/lib/search';
import type { Post } from '@/data/posts';

/**
 * Search configuration for blog posts
 *
 * Searchable fields with relevance weights:
 * - title: 3x weight (highest priority)
 * - summary: 2x weight
 * - body: 1x weight (base priority)
 * - tags: 1.5x weight
 */
export const BLOG_SEARCH_CONFIG: SearchConfig<Post> = {
  fields: [
    { name: 'title', weight: 3 },
    { name: 'summary', weight: 2 },
    { name: 'body', weight: 1 },
    { name: 'tags', weight: 1.5 },
  ],
  idField: 'slug',
  fuzzyThreshold: 0.2,
  maxHistoryItems: 10,
  historyStorageKey: 'blog-search-history',
};

/**
 * Get field value for search indexing
 * Handles nested fields and arrays
 */
export function getBlogSearchFieldValue(post: Post, field: string): string {
  const value = post[field as keyof Post];

  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return String(value || '');
}
