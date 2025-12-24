/**
 * Activity Bookmarking System
 *
 * Allows users to bookmark activity items for later reference.
 * Supports local storage with optional server-side sync for cross-device access.
 *
 * Features:
 * - Local storage persistence
 * - Optional server sync (when authenticated)
 * - Export/import (JSON, CSV)
 * - Tags and notes
 * - Search and filtering
 */

import type { ActivityItem } from "./types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Bookmark metadata for an activity item
 */
export interface Bookmark {
  /** Activity item ID being bookmarked */
  activityId: string;
  
  /** When the bookmark was created */
  createdAt: Date;
  
  /** Optional user notes */
  notes?: string;
  
  /** Optional custom tags for organization */
  tags?: string[];
  
  /** Last sync timestamp (for server sync) */
  lastSyncedAt?: Date;
  
  /** Server-side bookmark ID (if synced) */
  serverId?: string;
}

/**
 * Bookmark collection with metadata
 */
export interface BookmarkCollection {
  /** All bookmarks */
  bookmarks: Bookmark[];
  
  /** Last updated timestamp */
  lastUpdated: Date;
  
  /** Total count for quick access */
  count: number;
  
  /** Sync status */
  syncStatus: "local" | "synced" | "pending" | "error";
  
  /** Last sync error message */
  syncError?: string;
}

/**
 * Export format options
 */
export type ExportFormat = "json" | "csv";

/**
 * Bookmark export data
 */
export interface BookmarkExport {
  version: string;
  exportedAt: string;
  bookmarks: Array<{
    activityId: string;
    createdAt: string;
    notes?: string;
    tags?: string[];
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "dcyfr-activity-bookmarks";
const EXPORT_VERSION = "1.0.0";

// ============================================================================
// LOCAL STORAGE OPERATIONS
// ============================================================================

/**
 * Load bookmarks from localStorage
 */
export function loadBookmarksFromStorage(): BookmarkCollection {
  if (typeof window === "undefined") {
    return {
      bookmarks: [],
      lastUpdated: new Date(),
      count: 0,
      syncStatus: "local",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        bookmarks: [],
        lastUpdated: new Date(),
        count: 0,
        syncStatus: "local",
      };
    }

    const parsed = JSON.parse(stored) as {
      bookmarks: Array<{
        activityId: string;
        createdAt: string;
        notes?: string;
        tags?: string[];
        lastSyncedAt?: string;
        serverId?: string;
      }>;
      lastUpdated: string;
      count: number;
      syncStatus: "local" | "synced" | "pending" | "error";
      syncError?: string;
    };

    // Ensure bookmarks is an array (handle malformed data)
    if (!Array.isArray(parsed.bookmarks)) {
      console.warn("[Bookmarks] Invalid bookmarks data, resetting to empty array");
      return {
        bookmarks: [],
        lastUpdated: new Date(),
        count: 0,
        syncStatus: "local",
      };
    }

    // Deserialize dates
    const bookmarks: Bookmark[] = parsed.bookmarks.map((b) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      lastSyncedAt: b.lastSyncedAt ? new Date(b.lastSyncedAt) : undefined,
    }));

    return {
      bookmarks,
      lastUpdated: new Date(parsed.lastUpdated),
      count: parsed.count,
      syncStatus: parsed.syncStatus,
      syncError: parsed.syncError,
    };
  } catch (error) {
    console.error("[Bookmarks] Failed to load from storage:", error);
    return {
      bookmarks: [],
      lastUpdated: new Date(),
      count: 0,
      syncStatus: "error",
      syncError: "Failed to load bookmarks",
    };
  }
}

/**
 * Save bookmarks to localStorage
 */
export function saveBookmarksToStorage(collection: BookmarkCollection): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = {
      bookmarks: collection.bookmarks.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
        lastSyncedAt: b.lastSyncedAt?.toISOString(),
      })),
      lastUpdated: collection.lastUpdated.toISOString(),
      count: collection.count,
      syncStatus: collection.syncStatus,
      syncError: collection.syncError,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error("[Bookmarks] Failed to save to storage:", error);
  }
}

// ============================================================================
// BOOKMARK OPERATIONS
// ============================================================================

/**
 * Check if an activity is bookmarked
 */
export function isBookmarked(activityId: string, collection: BookmarkCollection): boolean {
  return collection.bookmarks.some((b) => b.activityId === activityId);
}

/**
 * Add a bookmark
 */
export function addBookmark(
  activityId: string,
  collection: BookmarkCollection,
  options?: { notes?: string; tags?: string[] }
): BookmarkCollection {
  // Don't duplicate
  if (isBookmarked(activityId, collection)) {
    return collection;
  }

  const newBookmark: Bookmark = {
    activityId,
    createdAt: new Date(),
    notes: options?.notes,
    tags: options?.tags,
  };

  const updated: BookmarkCollection = {
    bookmarks: [...collection.bookmarks, newBookmark],
    lastUpdated: new Date(),
    count: collection.count + 1,
    syncStatus: "pending",
  };

  saveBookmarksToStorage(updated);
  return updated;
}

/**
 * Remove a bookmark
 */
export function removeBookmark(
  activityId: string,
  collection: BookmarkCollection
): BookmarkCollection {
  const filteredBookmarks = collection.bookmarks.filter((b) => b.activityId !== activityId);
  
  const updated: BookmarkCollection = {
    bookmarks: filteredBookmarks,
    lastUpdated: new Date(),
    count: filteredBookmarks.length,
    syncStatus: "pending",
  };

  saveBookmarksToStorage(updated);
  return updated;
}

/**
 * Toggle a bookmark (add if not exists, remove if exists)
 */
export function toggleBookmark(
  activityId: string,
  collection: BookmarkCollection,
  options?: { notes?: string; tags?: string[] }
): BookmarkCollection {
  return isBookmarked(activityId, collection)
    ? removeBookmark(activityId, collection)
    : addBookmark(activityId, collection, options);
}

/**
 * Update bookmark notes
 */
export function updateBookmarkNotes(
  activityId: string,
  notes: string,
  collection: BookmarkCollection
): BookmarkCollection {
  const updated: BookmarkCollection = {
    ...collection,
    bookmarks: collection.bookmarks.map((b) =>
      b.activityId === activityId ? { ...b, notes } : b
    ),
    lastUpdated: new Date(),
    syncStatus: "pending",
  };

  saveBookmarksToStorage(updated);
  return updated;
}

/**
 * Update bookmark tags
 */
export function updateBookmarkTags(
  activityId: string,
  tags: string[],
  collection: BookmarkCollection
): BookmarkCollection {
  const updated: BookmarkCollection = {
    ...collection,
    bookmarks: collection.bookmarks.map((b) =>
      b.activityId === activityId ? { ...b, tags } : b
    ),
    lastUpdated: new Date(),
    syncStatus: "pending",
  };

  saveBookmarksToStorage(updated);
  return updated;
}

/**
 * Get all unique tags from bookmarks
 */
export function getAllTags(collection: BookmarkCollection): string[] {
  const tagSet = new Set<string>();
  collection.bookmarks.forEach((b) => {
    b.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filter activities to only bookmarked items
 */
export function filterBookmarkedActivities(
  activities: ActivityItem[],
  collection: BookmarkCollection
): ActivityItem[] {
  const bookmarkedIds = new Set(collection.bookmarks.map((b) => b.activityId));
  return activities.filter((a) => bookmarkedIds.has(a.id));
}

/**
 * Search bookmarks by notes or tags
 */
export function searchBookmarks(
  query: string,
  collection: BookmarkCollection
): Bookmark[] {
  const lowerQuery = query.toLowerCase();
  return collection.bookmarks.filter((b) => {
    const notesMatch = b.notes?.toLowerCase().includes(lowerQuery);
    const tagsMatch = b.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
    return notesMatch || tagsMatch;
  });
}

/**
 * Filter bookmarks by tag
 */
export function filterBookmarksByTag(
  tag: string,
  collection: BookmarkCollection
): Bookmark[] {
  return collection.bookmarks.filter((b) => b.tags?.includes(tag));
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

/**
 * Export bookmarks to JSON
 */
export function exportBookmarksToJSON(collection: BookmarkCollection): string {
  const exportData: BookmarkExport = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    bookmarks: collection.bookmarks.map((b) => ({
      activityId: b.activityId,
      createdAt: b.createdAt.toISOString(),
      notes: b.notes,
      tags: b.tags,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export bookmarks to CSV
 */
export function exportBookmarksToCSV(collection: BookmarkCollection): string {
  const headers = ["Activity ID", "Created At", "Notes", "Tags"];
  const rows = collection.bookmarks.map((b) => [
    b.activityId,
    b.createdAt.toISOString(),
    b.notes || "",
    b.tags?.join("; ") || "",
  ]);

  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ];

  return csvLines.join("\n");
}

/**
 * Import bookmarks from JSON
 */
export function importBookmarksFromJSON(
  json: string,
  collection: BookmarkCollection,
  options?: { merge?: boolean }
): BookmarkCollection {
  try {
    const parsed = JSON.parse(json) as BookmarkExport;

    if (parsed.version !== EXPORT_VERSION) {
      throw new Error(`Unsupported version: ${parsed.version}`);
    }

    const importedBookmarks: Bookmark[] = parsed.bookmarks.map((b) => ({
      activityId: b.activityId,
      createdAt: new Date(b.createdAt),
      notes: b.notes,
      tags: b.tags,
    }));

    const updated: BookmarkCollection = {
      bookmarks: options?.merge
        ? mergeBookmarks(collection.bookmarks, importedBookmarks)
        : importedBookmarks,
      lastUpdated: new Date(),
      count: importedBookmarks.length,
      syncStatus: "pending",
    };

    saveBookmarksToStorage(updated);
    return updated;
  } catch (error) {
    console.error("[Bookmarks] Import failed:", error);
    throw new Error(`Failed to import bookmarks: ${error}`);
  }
}

/**
 * Merge two bookmark arrays, preferring existing bookmarks
 */
function mergeBookmarks(existing: Bookmark[], imported: Bookmark[]): Bookmark[] {
  const merged = new Map<string, Bookmark>();

  // Add existing bookmarks first
  existing.forEach((b) => merged.set(b.activityId, b));

  // Add imported bookmarks (won't overwrite existing)
  imported.forEach((b) => {
    if (!merged.has(b.activityId)) {
      merged.set(b.activityId, b);
    }
  });

  return Array.from(merged.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Download bookmarks as file
 */
export function downloadBookmarks(
  collection: BookmarkCollection,
  format: ExportFormat
): void {
  if (typeof window === "undefined") return;

  const content = format === "json"
    ? exportBookmarksToJSON(collection)
    : exportBookmarksToCSV(collection);

  const blob = new Blob([content], {
    type: format === "json" ? "application/json" : "text/csv",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `activity-bookmarks-${new Date().toISOString().split("T")[0]}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// SERVER SYNC (Optional - requires authentication)
// ============================================================================

/**
 * Sync bookmarks with server (placeholder for future implementation)
 */
export async function syncBookmarksWithServer(
  collection: BookmarkCollection
): Promise<BookmarkCollection> {
  // TODO: Implement server sync when authentication is available
  // For now, just mark as local-only
  console.info("[Bookmarks] Server sync not yet implemented");
  
  return {
    ...collection,
    syncStatus: "local",
  };
}
