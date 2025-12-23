/**
 * Unified Search System - Search History
 * 
 * Manages search history persistence and retrieval
 */

import type { SearchHistoryItem } from "./types";

/**
 * Load search history from localStorage
 * 
 * @param storageKey - localStorage key
 * @param maxItems - Maximum number of items to return
 * @returns Array of search history items, sorted by most recent first
 */
export function loadSearchHistory(
  storageKey: string = "search-history",
  maxItems: number = 10
): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];

    const history: SearchHistoryItem[] = JSON.parse(stored);
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems);
  } catch (error) {
    console.error("Failed to load search history:", error);
    return [];
  }
}

/**
 * Save a search query to history
 * 
 * @param query - Search query string
 * @param resultCount - Number of results returned
 * @param storageKey - localStorage key
 * @param maxItems - Maximum number of items to keep
 */
export function saveSearchToHistory(
  query: string,
  resultCount: number,
  storageKey: string = "search-history",
  maxItems: number = 10
): void {
  if (typeof window === "undefined") return;
  if (!query?.trim()) return;

  try {
    const history = loadSearchHistory(storageKey, maxItems);
    
    // Remove duplicate if it exists
    const filtered = history.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    );

    // Add new item at the beginning
    const newHistory: SearchHistoryItem[] = [
      {
        query: query.trim(),
        timestamp: Date.now(),
        resultCount,
      },
      ...filtered,
    ].slice(0, maxItems);

    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
}

/**
 * Clear all search history
 * 
 * @param storageKey - localStorage key
 */
export function clearSearchHistory(storageKey: string = "search-history"): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear search history:", error);
  }
}

/**
 * Remove a specific item from search history
 * 
 * @param query - Query to remove
 * @param storageKey - localStorage key
 */
export function removeFromSearchHistory(
  query: string,
  storageKey: string = "search-history"
): void {
  if (typeof window === "undefined") return;

  try {
    const history = loadSearchHistory(storageKey);
    const filtered = history.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    );
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove from search history:", error);
  }
}
