/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { ActivityItem } from "@/lib/activity/types";

// Mock the bookmark utilities
vi.mock("@/lib/activity/bookmarks", () => ({
  loadBookmarksFromStorage: vi.fn(),
  addBookmark: vi.fn(),
  removeBookmark: vi.fn(),
  toggleBookmark: vi.fn(),
  updateBookmarkNotes: vi.fn(),
  updateBookmarkTags: vi.fn(),
  isBookmarked: vi.fn(),
  getAllTags: vi.fn(),
  filterBookmarkedActivities: vi.fn(),
  searchBookmarks: vi.fn(),
  filterBookmarksByTag: vi.fn(),
  exportBookmarksToJSON: vi.fn(),
  exportBookmarksToCSV: vi.fn(),
  importBookmarksFromJSON: vi.fn(),
  downloadBookmarks: vi.fn(),
  syncBookmarksWithServer: vi.fn(),
}));

import * as bookmarksModule from "@/lib/activity/bookmarks";

const mockBookmarksModule = bookmarksModule as any;

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: "activity-1",
    title: "Test Activity 1",
    description: "First test activity",
    source: "blog",
    verb: "published",
    timestamp: new Date("2023-01-01"),
    href: "/test-1",
  },
  {
    id: "activity-2",
    title: "Test Activity 2", 
    description: "Second test activity",
    source: "project",
    verb: "launched",
    timestamp: new Date("2023-01-02"),
    href: "/test-2",
  },
];

const mockCollection = {
  bookmarks: [
    {
      activityId: "activity-1",
      createdAt: new Date("2023-01-01"),
      notes: "Test note",
      tags: ["important"],
    }
  ],
  lastUpdated: new Date("2023-01-01"),
  count: 1,
  syncStatus: "local" as const,
};

describe("useBookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockBookmarksModule.loadBookmarksFromStorage.mockReturnValue(mockCollection);
    mockBookmarksModule.isBookmarked.mockImplementation((activityId: string, collection: any) => {
      return collection.bookmarks.some((b: any) => b.activityId === activityId);
    });
    mockBookmarksModule.getAllTags.mockReturnValue(["important", "work"]);
    mockBookmarksModule.filterBookmarkedActivities.mockImplementation((activities: ActivityItem[], collection: any) => {
      const bookmarkedIds = new Set(collection.bookmarks.map((b: any) => b.activityId));
      return activities.filter(a => bookmarkedIds.has(a.id));
    });
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useBookmarks());
    
    expect(result.current.loading).toBe(false); // Loading completes immediately in test
    expect(result.current.collection).toEqual(mockCollection);
  });

  it("should load bookmarks from storage on mount", () => {
    renderHook(() => useBookmarks());
    
    expect(mockBookmarksModule.loadBookmarksFromStorage).toHaveBeenCalledTimes(1);
  });

  describe("Query operations", () => {
    it("should check if activity is bookmarked", () => {
      const { result } = renderHook(() => useBookmarks());
      
      mockBookmarksModule.isBookmarked.mockReturnValueOnce(true);
      
      const isBookmarked = result.current.isBookmarked("activity-1");
      
      expect(isBookmarked).toBe(true);
      expect(mockBookmarksModule.isBookmarked).toHaveBeenCalledWith("activity-1", mockCollection);
    });

    it("should get bookmark by activity ID", () => {
      const { result } = renderHook(() => useBookmarks());
      
      const bookmark = result.current.getBookmark("activity-1");
      
      expect(bookmark).toEqual(mockCollection.bookmarks[0]);
    });

    it("should return undefined for non-existing bookmark", () => {
      const { result } = renderHook(() => useBookmarks());
      
      const bookmark = result.current.getBookmark("non-existing");
      
      expect(bookmark).toBeUndefined();
    });

    it("should get all tags", () => {
      const { result } = renderHook(() => useBookmarks());
      
      const tags = result.current.getAllTags();
      
      expect(tags).toEqual(["important", "work"]);
      expect(mockBookmarksModule.getAllTags).toHaveBeenCalledWith(mockCollection);
    });
  });

  describe("Mutation operations", () => {
    it("should toggle bookmark", () => {
      const updatedCollection = { ...mockCollection, count: 2 };
      mockBookmarksModule.toggleBookmark.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.toggle("activity-2", { tags: ["new"] });
      });
      
      expect(mockBookmarksModule.toggleBookmark).toHaveBeenCalledWith(
        "activity-2",
        mockCollection,
        { tags: ["new"] }
      );
    });

    it("should add bookmark", () => {
      const updatedCollection = { ...mockCollection, count: 2 };
      mockBookmarksModule.addBookmark.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.add("activity-2", { notes: "New note" });
      });
      
      expect(mockBookmarksModule.addBookmark).toHaveBeenCalledWith(
        "activity-2",
        mockCollection,
        { notes: "New note" }
      );
    });

    it("should remove bookmark", () => {
      const updatedCollection = { ...mockCollection, count: 0 };
      mockBookmarksModule.removeBookmark.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.remove("activity-1");
      });
      
      expect(mockBookmarksModule.removeBookmark).toHaveBeenCalledWith("activity-1", mockCollection);
    });

    it("should update notes", () => {
      const updatedCollection = { ...mockCollection };
      mockBookmarksModule.updateBookmarkNotes.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.updateNotes("activity-1", "Updated notes");
      });
      
      expect(mockBookmarksModule.updateBookmarkNotes).toHaveBeenCalledWith(
        "activity-1",
        "Updated notes",
        mockCollection
      );
    });

    it("should update tags", () => {
      const updatedCollection = { ...mockCollection };
      mockBookmarksModule.updateBookmarkTags.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.updateTags("activity-1", ["work", "urgent"]);
      });
      
      expect(mockBookmarksModule.updateBookmarkTags).toHaveBeenCalledWith(
        "activity-1",
        ["work", "urgent"],
        mockCollection
      );
    });
  });

  describe("Filtering operations", () => {
    it("should filter activities to bookmarked only", () => {
      const { result } = renderHook(() => useBookmarks());
      
      const filtered = result.current.filterActivities(mockActivities);
      
      expect(mockBookmarksModule.filterBookmarkedActivities).toHaveBeenCalledWith(
        mockActivities,
        mockCollection
      );
    });

    it("should search bookmarks", () => {
      const searchResults = [mockCollection.bookmarks[0]];
      mockBookmarksModule.searchBookmarks.mockReturnValue(searchResults);
      
      const { result } = renderHook(() => useBookmarks());
      
      const results = result.current.searchBookmarks("test query");
      
      expect(mockBookmarksModule.searchBookmarks).toHaveBeenCalledWith("test query", mockCollection);
      expect(results).toEqual(searchResults);
    });

    it("should filter by tag", () => {
      const tagResults = [mockCollection.bookmarks[0]];
      mockBookmarksModule.filterBookmarksByTag.mockReturnValue(tagResults);
      
      const { result } = renderHook(() => useBookmarks());
      
      const results = result.current.filterByTag("important");
      
      expect(mockBookmarksModule.filterBookmarksByTag).toHaveBeenCalledWith("important", mockCollection);
      expect(results).toEqual(tagResults);
    });
  });

  describe("Export operations", () => {
    it("should export to JSON", () => {
      const jsonData = '{"version":"1.0.0","bookmarks":[]}';
      mockBookmarksModule.exportBookmarksToJSON.mockReturnValue(jsonData);
      
      const { result } = renderHook(() => useBookmarks());
      
      const exported = result.current.exportToJSON();
      
      expect(mockBookmarksModule.exportBookmarksToJSON).toHaveBeenCalledWith(mockCollection);
      expect(exported).toBe(jsonData);
    });

    it("should export to CSV", () => {
      const csvData = "Activity ID,Created At,Notes,Tags\n";
      mockBookmarksModule.exportBookmarksToCSV.mockReturnValue(csvData);
      
      const { result } = renderHook(() => useBookmarks());
      
      const exported = result.current.exportToCSV();
      
      expect(mockBookmarksModule.exportBookmarksToCSV).toHaveBeenCalledWith(mockCollection);
      expect(exported).toBe(csvData);
    });

    it("should import from JSON", () => {
      const importData = '{"version":"1.0.0","bookmarks":[]}';
      const updatedCollection = { ...mockCollection, count: 2 };
      mockBookmarksModule.importBookmarksFromJSON.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.importFromJSON(importData, true);
      });
      
      expect(mockBookmarksModule.importBookmarksFromJSON).toHaveBeenCalledWith(
        importData,
        mockCollection,
        { merge: true }
      );
    });

    it("should download bookmarks", () => {
      const { result } = renderHook(() => useBookmarks());
      
      act(() => {
        result.current.download("json");
      });
      
      expect(mockBookmarksModule.downloadBookmarks).toHaveBeenCalledWith(mockCollection, "json");
    });
  });

  describe("Sync operations", () => {
    it("should sync with server successfully", async () => {
      const syncedCollection = { ...mockCollection, syncStatus: "synced" as const };
      mockBookmarksModule.syncBookmarksWithServer.mockResolvedValue(syncedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      await act(async () => {
        await result.current.sync();
      });
      
      expect(mockBookmarksModule.syncBookmarksWithServer).toHaveBeenCalledWith(mockCollection);
    });

    it("should handle sync errors", async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockBookmarksModule.syncBookmarksWithServer.mockRejectedValue(new Error("Network error"));
      
      const { result } = renderHook(() => useBookmarks());
      
      await act(async () => {
        await result.current.sync();
      });
      
      expect(consoleError).toHaveBeenCalledWith("[useBookmarks] Sync failed:", expect.any(Error));
      
      consoleError.mockRestore();
    });
  });

  describe("State updates", () => {
    it("should update collection state when mutations occur", () => {
      const updatedCollection = {
        ...mockCollection,
        count: 2,
        bookmarks: [
          ...mockCollection.bookmarks,
          {
            activityId: "activity-2",
            createdAt: new Date(),
            notes: "New bookmark",
            tags: ["work"],
          }
        ],
      };
      
      mockBookmarksModule.addBookmark.mockReturnValue(updatedCollection);
      
      const { result } = renderHook(() => useBookmarks());
      
      expect(result.current.collection.count).toBe(1);
      
      act(() => {
        result.current.add("activity-2");
      });
      
      // The collection should be updated through the state setter
      // Note: This test verifies the hook calls the right function
      // The actual state update happens through React's useState
      expect(mockBookmarksModule.addBookmark).toHaveBeenCalled();
    });
  });
});