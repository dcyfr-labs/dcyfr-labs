/**
 * Unified Search System
 * 
 * Generic search infrastructure for all content types
 * (Activity Items, Blog Posts, Projects, etc.)
 * 
 * Features:
 * - Full-text search with fuzzy matching
 * - Advanced query syntax (phrases, exclusions, field filters)
 * - Search history persistence
 * - Text highlighting
 * - Relevance scoring
 * 
 * @example
 * ```typescript
 * import { createSearchIndex, searchItems } from '@/lib/search';
 * 
 * const searchIndex = createSearchIndex(posts, {
 *   fields: [
 *     { name: 'title', weight: 3 },
 *     { name: 'description', weight: 2 },
 *     { name: 'tags', weight: 1.5 }
 *   ],
 *   idField: 'slug',
 *   fuzzyThreshold: 0.2
 * });
 * 
 * const results = searchItems(
 *   posts,
 *   searchIndex,
 *   'security tag:api -test',
 *   config
 * );
 * ```
 */

export * from "./types";
export * from "./query-parser";
export * from "./search-engine";
export * from "./search-history";
export * from "./highlight";
