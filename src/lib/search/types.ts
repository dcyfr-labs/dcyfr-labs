/**
 * Unified Search System - Type Definitions
 * 
 * Generic types for search functionality across all content types
 * (Activity Items, Blog Posts, Projects, etc.)
 */

/**
 * Generic search result with highlighting and scoring
 */
export interface SearchResult<T> {
  /** Original item */
  item: T;
  /** Relevance score (0-1, higher is better) */
  score: number;
  /** Matched fields for highlighting */
  matches: SearchMatch[];
  /** Terms that matched in this result */
  matchedTerms: string[];
}

/**
 * Match information for a specific field
 */
export interface SearchMatch {
  /** Field name that matched */
  field: string;
  /** Matched text excerpt */
  excerpt: string;
  /** Character positions of matches in excerpt */
  positions: [number, number][];
}

/**
 * Parsed search query with filters
 */
export interface SearchQuery {
  /** Text search terms (full-text search) */
  terms: string[];
  /** Exact phrase search (wrapped in quotes) */
  phrases: string[];
  /** Excluded terms (prefixed with -) */
  excludeTerms: string[];
  /** Field-specific filters (e.g., tag:security, category:code) */
  filters: Record<string, string[]>;
  /** Whether this is a filter-only query (no text search) */
  isFilterOnly: boolean;
}

/**
 * Search history item
 */
export interface SearchHistoryItem {
  /** Search query string */
  query: string;
  /** Timestamp of search */
  timestamp: number;
  /** Number of results returned */
  resultCount: number;
}

/**
 * Configuration for searchable fields
 */
export interface SearchableField {
  /** Field name in the item */
  name: string;
  /** Weight for search relevance (default: 1) */
  weight?: number;
  /** Whether to use fuzzy matching (default: true) */
  fuzzy?: boolean;
}

/**
 * Search configuration for a content type
 */
export interface SearchConfig<T> {
  /** Searchable fields with weights */
  fields: SearchableField[];
  /** Field to use as unique ID */
  idField: keyof T;
  /** Fuzzy matching threshold (0-1, lower is stricter, default: 0.2) */
  fuzzyThreshold?: number;
  /** Maximum search history items (default: 10) */
  maxHistoryItems?: number;
  /** localStorage key for search history (default: 'search-history') */
  historyStorageKey?: string;
}

/**
 * Supported field filter syntax
 * Examples: tag:security, category:code, source:github
 */
export type FilterPrefix = string;

/**
 * Highlight segment for matched text
 */
export interface HighlightSegment {
  /** Text content */
  text: string;
  /** Whether this segment matched the search */
  highlighted: boolean;
}
