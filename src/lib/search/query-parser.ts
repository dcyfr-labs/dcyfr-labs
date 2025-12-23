/**
 * Unified Search System - Query Parser
 * 
 * Parses search queries with advanced syntax:
 * - Exact phrases: "exact match"
 * - Exclusions: -excluded
 * - Field filters: tag:security, category:code, source:github
 */

import type { SearchQuery } from "./types";

/**
 * Parse a search query string into structured query object
 * 
 * Supported syntax:
 * - "exact phrase" - Match exact phrase
 * - -exclude - Exclude term
 * - field:value - Filter by field (e.g., tag:security)
 * - Regular terms - Fuzzy match
 * 
 * @param queryString - Raw search query
 * @returns Parsed search query
 * 
 * @example
 * parseSearchQuery('security -test tag:api "exact match"')
 * // Returns:
 * // {
 * //   terms: ['security'],
 * //   phrases: ['exact match'],
 * //   excludeTerms: ['test'],
 * //   filters: { tag: ['api'] },
 * //   isFilterOnly: false
 * // }
 */
export function parseSearchQuery(queryString: string): SearchQuery {
  const query: SearchQuery = {
    terms: [],
    phrases: [],
    excludeTerms: [],
    filters: {},
    isFilterOnly: false,
  };

  if (!queryString?.trim()) {
    query.isFilterOnly = true;
    return query;
  }

  // Extract exact phrases (wrapped in quotes)
  const phraseMatches = queryString.match(/"([^"]+)"/g) || [];
  query.phrases = phraseMatches.map(p => p.replace(/"/g, ""));

  // Remove phrases from query string to avoid double-processing
  let remainingQuery = queryString;
  phraseMatches.forEach(phrase => {
    remainingQuery = remainingQuery.replace(phrase, "");
  });

  // Split into tokens and process
  const tokens = remainingQuery.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    // Exclusion (starts with -)
    if (token.startsWith("-") && token.length > 1) {
      query.excludeTerms.push(token.slice(1).toLowerCase());
      continue;
    }

    // Field filter (contains :)
    if (token.includes(":")) {
      const [field, ...valueParts] = token.split(":");
      const value = valueParts.join(":"); // Handle values with colons
      
      if (field && value) {
        const fieldLower = field.toLowerCase();
        if (!query.filters[fieldLower]) {
          query.filters[fieldLower] = [];
        }
        query.filters[fieldLower].push(value.toLowerCase());
      }
      continue;
    }

    // Regular search term
    if (token.trim()) {
      query.terms.push(token.toLowerCase());
    }
  }

  // Determine if this is a filter-only query
  query.isFilterOnly = query.terms.length === 0 && query.phrases.length === 0;

  return query;
}

/**
 * Convert a search query back to a query string
 * Useful for search history and URL parameters
 * 
 * @param query - Parsed search query
 * @returns Query string representation
 */
export function queryToString(query: SearchQuery): string {
  const parts: string[] = [];

  // Add phrases
  query.phrases.forEach(phrase => {
    parts.push(`"${phrase}"`);
  });

  // Add regular terms
  parts.push(...query.terms);

  // Add exclusions
  query.excludeTerms.forEach(term => {
    parts.push(`-${term}`);
  });

  // Add filters
  Object.entries(query.filters).forEach(([field, values]) => {
    values.forEach(value => {
      parts.push(`${field}:${value}`);
    });
  });

  return parts.join(" ");
}

/**
 * Get all search terms (including phrases) for highlighting
 * 
 * @param query - Parsed search query
 * @returns Array of all terms that should be highlighted
 */
export function getSearchTermsForHighlighting(query: SearchQuery): string[] {
  const terms: string[] = [];

  // Add regular terms
  terms.push(...query.terms);

  // Add phrases
  terms.push(...query.phrases);

  // Split phrases into individual words for better highlighting
  query.phrases.forEach(phrase => {
    terms.push(...phrase.split(/\s+/));
  });

  return [...new Set(terms)]; // Remove duplicates
}
