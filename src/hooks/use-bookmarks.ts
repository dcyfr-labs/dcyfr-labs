/**
 * React hook for managing activity bookmarks
 *
 * Provides state management and operations for bookmarks with localStorage persistence.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadBookmarksFromStorage,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  updateBookmarkNotes,
  updateBookmarkTags,
  isBookmarked,
  getAllTags,
  filterBookmarkedActivities,
  searchBookmarks,
  filterBookmarksByTag,
  exportBookmarksToJSON,
  exportBookmarksToCSV,
  importBookmarksFromJSON,
  downloadBookmarks,
  syncBookmarksWithServer,
  type BookmarkCollection,
  type Bookmark,
  type ExportFormat,
} from "@/lib/activity/bookmarks";
import type { ActivityItem } from "@/lib/activity/types";

export interface UseBookmarksReturn {
  // State
  collection: BookmarkCollection;
  loading: boolean;

  // Queries
  isBookmarked: (activityId: string) => boolean;
  getBookmark: (activityId: string) => Bookmark | undefined;
  getBookmarkCount: (activityId: string) => number;
  getAllTags: () => string[];
  
  // Operations
  toggle: (activityId: string, options?: { notes?: string; tags?: string[] }) => void;
  add: (activityId: string, options?: { notes?: string; tags?: string[] }) => void;
  remove: (activityId: string) => void;
  updateNotes: (activityId: string, notes: string) => void;
  updateTags: (activityId: string, tags: string[]) => void;
  
  // Filtering
  filterActivities: (activities: ActivityItem[]) => ActivityItem[];
  searchBookmarks: (query: string) => Bookmark[];
  filterByTag: (tag: string) => Bookmark[];
  
  // Export/Import
  exportToJSON: () => string;
  exportToCSV: () => string;
  importFromJSON: (json: string, merge?: boolean) => void;
  download: (format: ExportFormat) => void;
  
  // Sync
  sync: () => Promise<void>;
}

/**
 * Hook for managing activity bookmarks
 * 
 * @example
 * ```tsx
 * const { isBookmarked, toggle, collection } = useBookmarks();
 * 
 * // Check if bookmarked
 * if (isBookmarked(activityId)) { ... }
 * 
 * // Toggle bookmark
 * toggle(activityId, { tags: ['important'] });
 * 
 * // Clear all bookmarks
 * clearBookmarks();
 * ```
 */
export function useBookmarks(): UseBookmarksReturn {
  const [collection, setCollection] = useState<BookmarkCollection>({
    bookmarks: [],
    lastUpdated: new Date(),
    count: 0,
    syncStatus: "local",
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load bookmarks on mount
  useEffect(() => {
    setMounted(true);
    const loaded = loadBookmarksFromStorage();
    setCollection(loaded);
    setLoading(false);
  }, []);

  // Query operations
  const isBookmarkedQuery = useCallback(
    (activityId: string): boolean => {
      if (!mounted) return false; // Suppress client-only data during SSR
      return isBookmarked(activityId, collection);
    },
    [collection, mounted]
  );

  const getBookmark = useCallback(
    (activityId: string): Bookmark | undefined => {
      return collection.bookmarks.find((b) => b.activityId === activityId);
    },
    [collection]
  );

  const getBookmarkCount = useCallback(
    (activityId: string): number => {
      // Return 1 if bookmarked, 0 otherwise (simulated global count)
      // In a real implementation, this would fetch from server
      return isBookmarkedQuery(activityId) ? 1 : 0;
    },
    [isBookmarkedQuery]
  );

  const getAllTagsQuery = useCallback((): string[] => {
    return getAllTags(collection);
  }, [collection]);

  // Mutation operations
  const toggle = useCallback(
    (activityId: string, options?: { notes?: string; tags?: string[] }) => {
      setCollection((prev) => toggleBookmark(activityId, prev, options));
    },
    []
  );

  const add = useCallback(
    (activityId: string, options?: { notes?: string; tags?: string[] }) => {
      setCollection((prev) => addBookmark(activityId, prev, options));
    },
    []
  );

  const remove = useCallback((activityId: string) => {
    setCollection((prev) => removeBookmark(activityId, prev));
  }, []);

  const updateNotes = useCallback((activityId: string, notes: string) => {
    setCollection((prev) => updateBookmarkNotes(activityId, notes, prev));
  }, []);

  const updateTags = useCallback((activityId: string, tags: string[]) => {
    setCollection((prev) => updateBookmarkTags(activityId, tags, prev));
  }, []);

  // Filtering operations
  const filterActivities = useCallback(
    (activities: ActivityItem[]): ActivityItem[] => {
      return filterBookmarkedActivities(activities, collection);
    },
    [collection]
  );

  const searchBookmarksQuery = useCallback(
    (query: string): Bookmark[] => {
      return searchBookmarks(query, collection);
    },
    [collection]
  );

  const filterByTag = useCallback(
    (tag: string): Bookmark[] => {
      return filterBookmarksByTag(tag, collection);
    },
    [collection]
  );

  // Export operations
  const exportToJSON = useCallback((): string => {
    return exportBookmarksToJSON(collection);
  }, [collection]);

  const exportToCSV = useCallback((): string => {
    return exportBookmarksToCSV(collection);
  }, [collection]);

  const importFromJSON = useCallback((json: string, merge = false) => {
    setCollection((prev) => importBookmarksFromJSON(json, prev, { merge }));
  }, []);

  const download = useCallback(
    (format: ExportFormat) => {
      downloadBookmarks(collection, format);
    },
    [collection]
  );

  // Sync operation
  const sync = useCallback(async () => {
    try {
      const synced = await syncBookmarksWithServer(collection);
      setCollection(synced);
    } catch (error) {
      console.error("[useBookmarks] Sync failed:", error);
      setCollection((prev) => ({
        ...prev,
        syncStatus: "error",
        syncError: error instanceof Error ? error.message : "Sync failed",
      }));
    }
  }, [collection]);

  return {
    collection,
    loading,
    isBookmarked: isBookmarkedQuery,
    getBookmark,
    getBookmarkCount,
    getAllTags: getAllTagsQuery,
    toggle,
    add,
    remove,
    updateNotes,
    updateTags,
    filterActivities,
    searchBookmarks: searchBookmarksQuery,
    filterByTag,
    exportToJSON,
    exportToCSV,
    importFromJSON,
    download,
    sync,
  };
}
