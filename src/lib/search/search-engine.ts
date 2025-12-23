/**
 * Unified Search System - Search Engine
 * 
 * Generic search engine using MiniSearch with support for:
 * - Full-text search with fuzzy matching
 * - Field-specific filtering
 * - Relevance scoring and ranking
 * - Exact phrase matching
 */

import MiniSearch from "minisearch";
import type { SearchResult, SearchQuery, SearchConfig, SearchableField, SearchMatch } from "./types";
import { parseSearchQuery, getSearchTermsForHighlighting } from "./query-parser";

/**
 * Create a search index for a collection of items
 * 
 * @param items - Items to index
 * @param config - Search configuration
 * @returns MiniSearch instance
 * 
 * @example
 * const searchIndex = createSearchIndex(posts, {
 *   fields: [
 *     { name: 'title', weight: 3 },
 *     { name: 'description', weight: 2 },
 *     { name: 'tags', weight: 1.5 }
 *   ],
 *   idField: 'slug',
 *   fuzzyThreshold: 0.2
 * });
 */
export function createSearchIndex<T extends Record<string, any>>(
  items: T[],
  config: SearchConfig<T>
): MiniSearch<T> {
  const searchIndex = new MiniSearch<T>({
    fields: config.fields.map(f => f.name),
    storeFields: [String(config.idField)],
    searchOptions: {
      fuzzy: config.fuzzyThreshold ?? 0.2,
      prefix: true,
      boost: config.fields.reduce((acc, field) => {
        acc[field.name] = field.weight ?? 1;
        return acc;
      }, {} as Record<string, number>),
    },
  });

  searchIndex.addAll(items);
  return searchIndex;
}

/**
 * Search items using the unified search system
 * 
 * @param items - All items (used for filter-only queries)
 * @param searchIndex - Pre-built search index
 * @param queryString - Search query string
 * @param config - Search configuration
 * @returns Array of search results with scoring and matches
 * 
 * @example
 * const results = searchItems(
 *   posts,
 *   searchIndex,
 *   'security tag:api -test',
 *   config
 * );
 */
export function searchItems<T extends Record<string, any>>(
  items: T[],
  searchIndex: MiniSearch<T>,
  queryString: string,
  config: SearchConfig<T>
): SearchResult<T>[] {
  const query = parseSearchQuery(queryString);

  // Handle filter-only queries (no text search)
  if (query.isFilterOnly) {
    return applyFilters(items, query, config).map(item => ({
      item,
      score: 1,
      matches: [],
      matchedTerms: [],
    }));
  }

  // Build search string for MiniSearch
  const searchTerms: string[] = [];
  searchTerms.push(...query.terms);
  searchTerms.push(...query.phrases);

  const searchString = searchTerms.join(" ");

  // Perform full-text search
  const miniSearchResults = searchIndex.search(searchString, {
    fuzzy: config.fuzzyThreshold ?? 0.2,
    prefix: true,
  });

  // Convert MiniSearch results to our SearchResult format
  const itemMap = new Map(items.map(item => [item[config.idField], item]));
  const results: SearchResult<T>[] = miniSearchResults
    .map(result => {
      const item = itemMap.get(result.id);
      if (!item) return null;

      const matches: SearchMatch[] = Object.entries(result.match || {}).map(([field, terms]) => ({
        field,
        excerpt: String(item[field] || ""),
        positions: [] as [number, number][],
      }));

      return {
        item,
        score: result.score,
        matches,
        matchedTerms: getSearchTermsForHighlighting(query),
      };
    })
    .filter((r): r is SearchResult<T> => r !== null);

  // Apply filters
  const filteredResults = applyFilters(
    results.map(r => r.item),
    query,
    config
  );

  // Reconstruct search results with filtering applied
  const filteredIds = new Set(filteredResults.map(item => item[config.idField]));
  const finalResults = results.filter(r => filteredIds.has(r.item[config.idField]));

  // Apply exclusions
  const excludedResults = applyExclusions(finalResults, query, config);

  // Apply exact phrase filtering
  const phraseFilteredResults = applyPhraseFilter(excludedResults, query, config);

  return phraseFilteredResults;
}

/**
 * Apply field-specific filters to items
 */
function applyFilters<T extends Record<string, any>>(
  items: T[],
  query: SearchQuery,
  config: SearchConfig<T>
): T[] {
  if (Object.keys(query.filters).length === 0) {
    return items;
  }

  return items.filter(item => {
    return Object.entries(query.filters).every(([field, values]) => {
      const itemValue = item[field];

      // Handle array fields (e.g., tags)
      if (Array.isArray(itemValue)) {
        return values.some(filterValue =>
          itemValue.some(v =>
            String(v).toLowerCase() === filterValue.toLowerCase() ||
            String(v).toLowerCase().includes(filterValue.toLowerCase())
          )
        );
      }

      // Handle string fields
      if (typeof itemValue === "string") {
        return values.some(filterValue =>
          itemValue.toLowerCase() === filterValue.toLowerCase() ||
          itemValue.toLowerCase().includes(filterValue.toLowerCase())
        );
      }

      return false;
    });
  });
}

/**
 * Apply exclusion filters (-term)
 */
function applyExclusions<T extends Record<string, any>>(
  results: SearchResult<T>[],
  query: SearchQuery,
  config: SearchConfig<T>
): SearchResult<T>[] {
  if (query.excludeTerms.length === 0) {
    return results;
  }

  return results.filter(result => {
    const searchableText = config.fields
      .map(field => {
        const value = result.item[field.name];
        if (Array.isArray(value)) return value.join(" ");
        return String(value || "");
      })
      .join(" ")
      .toLowerCase();

    return !query.excludeTerms.some(term => searchableText.includes(term));
  });
}

/**
 * Apply exact phrase filtering
 */
function applyPhraseFilter<T extends Record<string, any>>(
  results: SearchResult<T>[],
  query: SearchQuery,
  config: SearchConfig<T>
): SearchResult<T>[] {
  if (query.phrases.length === 0) {
    return results;
  }

  return results.filter(result => {
    const searchableText = config.fields
      .map(field => {
        const value = result.item[field.name];
        if (Array.isArray(value)) return value.join(" ");
        return String(value || "");
      })
      .join(" ")
      .toLowerCase();

    return query.phrases.every(phrase =>
      searchableText.includes(phrase.toLowerCase())
    );
  });
}
