/**
 * Fuse.js Search Configuration
 *
 * Configures fuzzy search behavior for blog posts.
 *
 * Features:
 * - Fuzzy matching with typo tolerance
 * - Weighted search fields (title > tags > content)
 * - Configurable threshold for match quality
 */

import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";

/**
 * Fuse.js configuration for blog post search
 *
 * @see https://fusejs.io/api/options.html
 */
export const fuseOptions: IFuseOptions<SearchablePost> = {
  // Search will ignore location and prioritize quality of match
  threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything

  // Search will consider location of match in string (early matches ranked higher)
  location: 0,
  distance: 100,

  // Minimum character length to trigger search
  minMatchCharLength: 2,

  // Include score and matches in results for debugging/highlighting
  includeScore: true,
  includeMatches: true,

  // Ignore location for better fuzzy matching
  ignoreLocation: true,

  // Fields to search with weights
  keys: [
    {
      name: "title",
      weight: 0.5, // Highest priority
    },
    {
      name: "tags",
      weight: 0.3,
    },
    {
      name: "summary",
      weight: 0.15,
    },
    {
      name: "content",
      weight: 0.05, // Lowest priority (too noisy)
    },
  ],
};

/**
 * Searchable post interface matching the generated index
 */
export interface SearchablePost {
  id: string;
  title: string;
  summary: string;
  content: string; // Excerpt only (first 500 chars)
  tags: string[];
  series: string | null;
  publishedAt: string;
  readingTime: number;
  url: string;
}

/**
 * Search index structure
 */
export interface SearchIndex {
  posts: SearchablePost[];
  tags: string[];
  series: string[];
  generatedAt: string;
}
