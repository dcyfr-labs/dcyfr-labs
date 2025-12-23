/**
 * Activity Feed Search System
 *
 * Full-text search with fuzzy matching, advanced query syntax, and search history.
 * Uses MiniSearch for client-side indexing and search performance optimization.
 *
 * Features:
 * - Fuzzy matching with typo tolerance
 * - Advanced query syntax (tag:, source:, -, "exact")
 * - Search history with localStorage persistence
 * - Performance optimized for <100ms on 1000+ items
 * - Highlight matched terms in results
 *
 * @see /docs/features/activity-feed.md
 */

import MiniSearch from "minisearch";
import type { ActivityItem, ActivitySource } from "./types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Search result with highlighting metadata
 */
export interface SearchResult {
  /** Original activity item */
  item: ActivityItem;

  /** Search relevance score (0-1, higher is better) */
  score: number;

  /** Terms that matched in the search */
  matchedTerms: string[];

  /** Fields that contained matches */
  matchedFields: string[];
}

/**
 * Search query structure
 */
export interface SearchQuery {
  /** Main search terms */
  terms: string;

  /** Tag filters (tag:typescript) */
  tags?: string[];

  /** Source filters (source:blog) */
  sources?: ActivitySource[];

  /** Excluded sources (-github) */
  excludeSources?: ActivitySource[];

  /** Exact phrase matches */
  exactPhrases?: string[];
}

/**
 * Search history item
 */
export interface SearchHistoryItem {
  /** Search query text */
  query: string;

  /** When the search was performed */
  timestamp: Date;

  /** Number of results returned */
  resultCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SEARCH_HISTORY_KEY = "dcyfr-activity-search-history";
const MAX_SEARCH_HISTORY = 10;

/**
 * MiniSearch configuration for activity items
 */
const SEARCH_CONFIG = {
  fields: ["title", "description", "tags", "category"], // Fields to search
  storeFields: ["id"], // Fields to store for retrieval
  searchOptions: {
    boost: { title: 2, tags: 1.5, description: 1, category: 1 }, // Field importance
    fuzzy: 0.2, // Typo tolerance (0.2 = ~2 character edits)
    prefix: true, // Match word prefixes
    combineWith: "AND" as const, // Default query combination
  },
};

// ============================================================================
// SEARCH INDEX MANAGEMENT
// ============================================================================

/**
 * Create and populate a MiniSearch index from activity items
 */
export function createSearchIndex(items: ActivityItem[]): MiniSearch {
  const miniSearch = new MiniSearch({
    fields: SEARCH_CONFIG.fields,
    storeFields: SEARCH_CONFIG.storeFields,
    extractField: (document, fieldName) => {
      // Custom field extraction to handle nested metadata
      if (fieldName === "tags") {
        return (document as ActivityItem).meta?.tags?.join(" ") || "";
      }
      if (fieldName === "category") {
        return (document as ActivityItem).meta?.category || "";
      }
      return (document as ActivityItem)[fieldName as keyof ActivityItem] as string;
    },
  });

  // Index all activity items
  miniSearch.addAll(items);

  return miniSearch;
}

// ============================================================================
// QUERY PARSER
// ============================================================================

/**
 * Parse advanced search query syntax into structured query
 *
 * Supports:
 * - `tag:typescript` - Search by tag
 * - `source:blog` - Filter by source
 * - `-github` - Exclude source
 * - `"exact phrase"` - Exact match
 * - Plain text - Fuzzy search
 *
 * @example
 * parseSearchQuery('tag:typescript source:blog "react hooks"')
 * // Returns: { terms: '', tags: ['typescript'], sources: ['blog'], exactPhrases: ['react hooks'] }
 */
export function parseSearchQuery(query: string): SearchQuery {
  const parsed: SearchQuery = {
    terms: "",
    tags: [],
    sources: [],
    excludeSources: [],
    exactPhrases: [],
  };

  let remainingQuery = query;

  // Extract exact phrases
  const phraseMatches = query.match(/"([^"]+)"/g);
  if (phraseMatches) {
    phraseMatches.forEach((match) => {
      const phrase = match.slice(1, -1); // Remove quotes
      parsed.exactPhrases!.push(phrase);
      remainingQuery = remainingQuery.replace(match, "");
    });
  }

  // Extract tag filters
  const tagMatches = remainingQuery.match(/tag:(\w+)/g);
  if (tagMatches) {
    tagMatches.forEach((match) => {
      const tag = match.replace("tag:", "");
      parsed.tags!.push(tag);
      remainingQuery = remainingQuery.replace(match, "");
    });
  }

  // Extract source filters
  const sourceMatches = remainingQuery.match(/source:(\w+)/g);
  if (sourceMatches) {
    sourceMatches.forEach((match) => {
      const source = match.replace("source:", "");
      parsed.sources!.push(source as ActivitySource);
      remainingQuery = remainingQuery.replace(match, "");
    });
  }

  // Extract excluded sources
  const excludeMatches = remainingQuery.match(/-(\w+)/g);
  if (excludeMatches) {
    excludeMatches.forEach((match) => {
      const source = match.replace("-", "");
      parsed.excludeSources!.push(source as ActivitySource);
      remainingQuery = remainingQuery.replace(match, "");
    });
  }

  // Remaining text is the main search terms
  parsed.terms = remainingQuery.trim();

  return parsed;
}

// ============================================================================
// SEARCH EXECUTION
// ============================================================================

/**
 * Search activity items with fuzzy matching and advanced query syntax
 *
 * @param items - All activity items to search
 * @param query - Search query string (supports advanced syntax)
 * @param searchIndex - Optional pre-built search index for performance
 * @returns Array of search results with scores and highlighting metadata
 */
export function searchActivities(
  items: ActivityItem[],
  query: string,
  searchIndex?: MiniSearch
): SearchResult[] {
  if (!query.trim()) {
    return items.map((item) => ({
      item,
      score: 1,
      matchedTerms: [],
      matchedFields: [],
    }));
  }

  // Parse the query
  const parsedQuery = parseSearchQuery(query);

  // Start with all items if no text search terms
  let results: SearchResult[] = [];
  const hasTextSearch = parsedQuery.terms.trim() || (parsedQuery.exactPhrases && parsedQuery.exactPhrases.length > 0);

  if (hasTextSearch) {
    // Create index if not provided
    const index = searchIndex || createSearchIndex(items);

    // Build MiniSearch query
    let searchTerms = parsedQuery.terms;
    if (parsedQuery.exactPhrases && parsedQuery.exactPhrases.length > 0) {
      // Add exact phrases with quotes
      searchTerms += " " + parsedQuery.exactPhrases.map((p) => `"${p}"`).join(" ");
    }

    // Perform the search
    const searchResults = index.search(searchTerms.trim(), SEARCH_CONFIG.searchOptions);

    // Map results back to activity items
    results = searchResults
      .map((result) => {
        const item = items.find((i) => i.id === result.id);
        if (!item) return null;

        return {
          item,
          score: result.score,
          matchedTerms: result.match ? Object.keys(result.match) : [],
          matchedFields: result.match ? Object.keys(result.match) : [],
        };
      })
      .filter((r): r is SearchResult => r !== null);
  } else {
    // No text search, just use all items with neutral scores
    results = items.map((item) => ({
      item,
      score: 1,
      matchedTerms: [],
      matchedFields: [],
    }));
  }

  // Apply filters
  results = results.filter((result) => {
    const item = result.item;

    // Tag filter
    if (parsedQuery.tags && parsedQuery.tags.length > 0) {
      const itemTags = item.meta?.tags || [];
      const hasTag = parsedQuery.tags.some((tag) =>
        itemTags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
      );
      if (!hasTag) return false;
    }

    // Source filter
    if (parsedQuery.sources && parsedQuery.sources.length > 0) {
      if (!parsedQuery.sources.includes(item.source)) return false;
    }

    // Excluded sources
    if (parsedQuery.excludeSources && parsedQuery.excludeSources.length > 0) {
      if (parsedQuery.excludeSources.includes(item.source)) return false;
    }

    return true;
  });

  // Sort by score (descending)
  return results.sort((a, b) => b.score - a.score);
}

// ============================================================================
// SEARCH HISTORY
// ============================================================================

/**
 * Load search history from localStorage
 */
export function loadSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((item: { query: string; timestamp: string; resultCount: number }) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch (error) {
    console.error("Failed to load search history:", error);
    return [];
  }
}

/**
 * Save a search query to history
 */
export function saveSearchToHistory(query: string, resultCount: number): void {
  if (typeof window === "undefined") return;
  if (!query.trim()) return;

  try {
    const history = loadSearchHistory();

    // Remove duplicate if exists
    const filtered = history.filter((item) => item.query !== query);

    // Add new item at the beginning
    const newHistory = [
      { query, timestamp: new Date(), resultCount },
      ...filtered,
    ].slice(0, MAX_SEARCH_HISTORY);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear search history:", error);
  }
}

// ============================================================================
// SEARCH HIGHLIGHTING
// ============================================================================

/**
 * Extract search terms from query for highlighting
 */
export function extractSearchTerms(query: string): string[] {
  const parsed = parseSearchQuery(query);
  const terms: string[] = [];

  // Add main search terms
  if (parsed.terms) {
    terms.push(...parsed.terms.split(/\s+/).filter(Boolean));
  }

  // Add exact phrases
  if (parsed.exactPhrases && parsed.exactPhrases.length > 0) {
    terms.push(...parsed.exactPhrases);
  }

  // Add tag values (not the whole tag:value, just the value)
  if (parsed.tags && parsed.tags.length > 0) {
    terms.push(...parsed.tags);
  }

  return terms.filter((t) => t.length > 1); // Ignore single characters
}

/**
 * Highlight search terms in text
 *
 * @param text - Text to highlight
 * @param searchTerms - Terms to highlight
 * @returns Array of text segments with highlight flags
 */
export function highlightSearchTerms(
  text: string,
  searchTerms: string[]
): Array<{ text: string; highlighted: boolean }> {
  if (!searchTerms.length) {
    return [{ text, highlighted: false }];
  }

  const segments: Array<{ text: string; highlighted: boolean }> = [];
  
  // Create regex pattern for all search terms (case-insensitive)
  const escapedTerms = searchTerms.map((term) => 
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  
  // Split text by matches
  const parts = text.split(pattern);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue; // Skip empty parts
    
    // Check if this part matches any search term (case-insensitive)
    const isMatch = searchTerms.some((term) => 
      part.toLowerCase() === term.toLowerCase()
    );
    
    segments.push({
      text: part,
      highlighted: isMatch,
    });
  }

  return segments;
}
