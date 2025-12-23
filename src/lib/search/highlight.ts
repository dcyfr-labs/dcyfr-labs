/**
 * Unified Search System - Text Highlighting
 * 
 * Utilities for highlighting search terms in text
 */

import type { HighlightSegment } from "./types";
import { parseSearchQuery, getSearchTermsForHighlighting } from "./query-parser";

/**
 * Highlight search terms in text, returning segments for rendering
 * 
 * @param text - Text to highlight
 * @param queryString - Search query string
 * @returns Array of text segments with highlight flags
 * 
 * @example
 * const segments = highlightSearchTerms('Hello world', 'hello');
 * // Returns: [
 * //   { text: 'Hello', highlighted: true },
 * //   { text: ' world', highlighted: false }
 * // ]
 */
export function highlightSearchTerms(
  text: string,
  queryString: string
): HighlightSegment[] {
  if (!text || !queryString?.trim()) {
    return [{ text, highlighted: false }];
  }

  const query = parseSearchQuery(queryString);
  const terms = getSearchTermsForHighlighting(query);

  if (terms.length === 0) {
    return [{ text, highlighted: false }];
  }

  // Build regex pattern for all terms (case-insensitive)
  const escapedTerms = terms.map(term =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");

  // Split text by matches
  const parts = text.split(pattern);
  const segments: HighlightSegment[] = [];

  for (const part of parts) {
    if (!part) continue;

    const isMatch = terms.some(term =>
      part.toLowerCase() === term.toLowerCase()
    );

    segments.push({
      text: part,
      highlighted: isMatch,
    });
  }

  return segments;
}

/**
 * Check if a text contains any of the search terms
 * 
 * @param text - Text to check
 * @param queryString - Search query string
 * @returns True if text contains any search terms
 */
export function containsSearchTerms(text: string, queryString: string): boolean {
  if (!text || !queryString?.trim()) return false;

  const query = parseSearchQuery(queryString);
  const terms = getSearchTermsForHighlighting(query);
  const textLower = text.toLowerCase();

  return terms.some(term => textLower.includes(term.toLowerCase()));
}

/**
 * Get excerpt from text around the first match
 * 
 * @param text - Full text
 * @param queryString - Search query string
 * @param maxLength - Maximum excerpt length (default: 200)
 * @returns Excerpt with match context
 * 
 * @example
 * const excerpt = getMatchExcerpt(
 *   'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
 *   'dolor',
 *   30
 * );
 * // Returns: '...ipsum dolor sit amet...'
 */
export function getMatchExcerpt(
  text: string,
  queryString: string,
  maxLength: number = 200
): string {
  if (!text || !queryString?.trim()) {
    return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
  }

  const query = parseSearchQuery(queryString);
  const terms = getSearchTermsForHighlighting(query);

  // Find first match position
  let matchIndex = -1;
  let matchLength = 0;

  for (const term of terms) {
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
      matchIndex = index;
      matchLength = term.length;
    }
  }

  // No match found
  if (matchIndex === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
  }

  // Calculate excerpt bounds around the match
  const halfLength = Math.floor(maxLength / 2);
  const start = Math.max(0, matchIndex - halfLength);
  const end = Math.min(text.length, matchIndex + matchLength + halfLength);

  let excerpt = text.slice(start, end);

  // Add ellipsis
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";

  return excerpt;
}
