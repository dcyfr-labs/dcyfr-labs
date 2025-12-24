/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadBookmarksFromStorage,
  saveBookmarksToStorage,
  isBookmarked,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  updateBookmarkNotes,
  updateBookmarkTags,
  getAllTags,
  filterBookmarkedActivities,
  searchBookmarks,
  filterBookmarksByTag,
  exportBookmarksToJSON,
  exportBookmarksToCSV,
  importBookmarksFromJSON,
  downloadBookmarks,
  type BookmarkCollection,
  type Bookmark,
} from "@/lib/activity/bookmarks";
import type { ActivityItem } from "@/lib/activity/types";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

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

describe("Bookmark Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("loadBookmarksFromStorage", () => {
    it("should return empty collection when no storage data", () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = loadBookmarksFromStorage();
      
      expect(result).toEqual({
        bookmarks: [],
        lastUpdated: expect.any(Date),
        count: 0,
        syncStatus: "local",
      });
    });

    it("should load and deserialize bookmarks from storage", () => {
      const storedData = {
        bookmarks: [
          {
            activityId: "test-1",
            createdAt: "2023-01-01T00:00:00.000Z",
            notes: "Test note",
            tags: ["important"],
          }
        ],
        lastUpdated: "2023-01-01T00:00:00.000Z",
        count: 1,
        syncStatus: "local",
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));
      
      const result = loadBookmarksFromStorage();
      
      expect(result.bookmarks).toHaveLength(1);
      expect(result.bookmarks[0].activityId).toBe("test-1");
      expect(result.bookmarks[0].createdAt).toBeInstanceOf(Date);
      expect(result.count).toBe(1);
    });

    it("should handle corrupted storage data gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");
      
      const result = loadBookmarksFromStorage();
      
      expect(result).toEqual({
        bookmarks: [],
        lastUpdated: expect.any(Date),
        count: 0,
        syncStatus: "error",
        syncError: "Failed to load bookmarks",
      });
    });

    it("should return empty collection in non-browser environment", () => {
      // Temporarily mock window as undefined
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const result = loadBookmarksFromStorage();
      
      expect(result).toEqual({
        bookmarks: [],
        lastUpdated: expect.any(Date),
        count: 0,
        syncStatus: "local",
      });
      
      global.window = originalWindow;
    });
  });

  describe("saveBookmarksToStorage", () => {
    it("should serialize and save bookmarks to localStorage", () => {
      const collection: BookmarkCollection = {
        bookmarks: [
          {
            activityId: "test-1",
            createdAt: new Date("2023-01-01"),
            notes: "Test note",
            tags: ["important"],
          }
        ],
        lastUpdated: new Date("2023-01-01"),
        count: 1,
        syncStatus: "local",
      };
      
      saveBookmarksToStorage(collection);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dcyfr-activity-bookmarks",
        expect.stringContaining('"activityId":"test-1"')
      );
    });

    it("should handle storage errors gracefully", () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });
      
      const collection: BookmarkCollection = {
        bookmarks: [],
        lastUpdated: new Date(),
        count: 0,
        syncStatus: "local",
      };
      
      expect(() => saveBookmarksToStorage(collection)).not.toThrow();
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });
  });
});

describe("Bookmark Operations", () => {
  let baseCollection: BookmarkCollection;

  beforeEach(() => {
    baseCollection = {
      bookmarks: [
        {
          activityId: "existing-1",
          createdAt: new Date("2023-01-01"),
          notes: "Existing bookmark",
          tags: ["work"],
        }
      ],
      lastUpdated: new Date("2023-01-01"),
      count: 1,
      syncStatus: "local",
    };
    vi.clearAllMocks();
  });

  describe("isBookmarked", () => {
    it("should return true for existing bookmarks", () => {
      expect(isBookmarked("existing-1", baseCollection)).toBe(true);
    });

    it("should return false for non-existing bookmarks", () => {
      expect(isBookmarked("non-existing", baseCollection)).toBe(false);
    });
  });

  describe("addBookmark", () => {
    it("should add new bookmark to collection", () => {
      const result = addBookmark("new-activity", baseCollection, {
        notes: "New note",
        tags: ["important"],
      });

      expect(result.bookmarks).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.syncStatus).toBe("pending");
      expect(isBookmarked("new-activity", result)).toBe(true);
    });

    it("should not duplicate existing bookmarks", () => {
      const result = addBookmark("existing-1", baseCollection);
      expect(result).toBe(baseCollection);
    });

    it("should save to storage when adding", () => {
      addBookmark("new-activity", baseCollection);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("removeBookmark", () => {
    it("should remove existing bookmark", () => {
      const result = removeBookmark("existing-1", baseCollection);

      expect(result.bookmarks).toHaveLength(0);
      expect(result.count).toBe(0);
      expect(result.syncStatus).toBe("pending");
      expect(isBookmarked("existing-1", result)).toBe(false);
    });

    it("should handle removing non-existing bookmark", () => {
      const result = removeBookmark("non-existing", baseCollection);
      expect(result.count).toBe(1); // No change
    });

    it("should save to storage when removing", () => {
      removeBookmark("existing-1", baseCollection);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("toggleBookmark", () => {
    it("should add bookmark if not exists", () => {
      const result = toggleBookmark("new-activity", baseCollection);
      expect(isBookmarked("new-activity", result)).toBe(true);
      expect(result.count).toBe(2);
    });

    it("should remove bookmark if exists", () => {
      const result = toggleBookmark("existing-1", baseCollection);
      expect(isBookmarked("existing-1", result)).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe("updateBookmarkNotes", () => {
    it("should update notes for existing bookmark", () => {
      const result = updateBookmarkNotes("existing-1", "Updated notes", baseCollection);
      
      expect(result.bookmarks[0].notes).toBe("Updated notes");
      expect(result.syncStatus).toBe("pending");
    });

    it("should save to storage when updating notes", () => {
      updateBookmarkNotes("existing-1", "Updated notes", baseCollection);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("updateBookmarkTags", () => {
    it("should update tags for existing bookmark", () => {
      const newTags = ["personal", "important"];
      const result = updateBookmarkTags("existing-1", newTags, baseCollection);
      
      expect(result.bookmarks[0].tags).toEqual(newTags);
      expect(result.syncStatus).toBe("pending");
    });
  });

  describe("getAllTags", () => {
    it("should return all unique tags sorted", () => {
      const collection: BookmarkCollection = {
        ...baseCollection,
        bookmarks: [
          { activityId: "1", createdAt: new Date(), tags: ["work", "important"] },
          { activityId: "2", createdAt: new Date(), tags: ["personal", "work"] },
          { activityId: "3", createdAt: new Date(), tags: ["important"] },
        ],
      };

      const tags = getAllTags(collection);
      expect(tags).toEqual(["important", "personal", "work"]);
    });

    it("should return empty array when no tags", () => {
      const collection: BookmarkCollection = {
        ...baseCollection,
        bookmarks: [{ activityId: "1", createdAt: new Date() }],
      };

      const tags = getAllTags(collection);
      expect(tags).toEqual([]);
    });
  });
});

describe("Filtering Functions", () => {
  let collection: BookmarkCollection;

  beforeEach(() => {
    collection = {
      bookmarks: [
        {
          activityId: "activity-1",  // Match mockActivities ID
          createdAt: new Date("2023-01-01"),
          notes: "Important work item",
          tags: ["work", "urgent"],
        },
        {
          activityId: "activity-2",  // Match mockActivities ID  
          createdAt: new Date("2023-01-02"),
          notes: "Personal project",
          tags: ["personal"],
        }
      ],
      lastUpdated: new Date(),
      count: 2,
      syncStatus: "local",
    };
  });

  describe("filterBookmarkedActivities", () => {
    it("should return only bookmarked activities", () => {
      const result = filterBookmarkedActivities(mockActivities, collection);
      expect(result).toHaveLength(2); // Both activities are bookmarked
      expect(result.map(a => a.id)).toEqual(["activity-1", "activity-2"]);
    });

    it("should return empty array when no bookmarks match", () => {
      const activities: ActivityItem[] = [
        { ...mockActivities[0], id: "non-bookmarked" }
      ];
      
      const result = filterBookmarkedActivities(activities, collection);
      expect(result).toHaveLength(0);
    });
  });

  describe("searchBookmarks", () => {
    it("should search in notes", () => {
      const result = searchBookmarks("work", collection);
      expect(result).toHaveLength(1);
      expect(result[0].activityId).toBe("activity-1");
    });

    it("should search in tags", () => {
      const result = searchBookmarks("personal", collection);
      expect(result).toHaveLength(1);
      expect(result[0].activityId).toBe("activity-2");
    });

    it("should be case insensitive", () => {
      const result = searchBookmarks("WORK", collection);
      expect(result).toHaveLength(1);
    });
  });

  describe("filterBookmarksByTag", () => {
    it("should return bookmarks with specific tag", () => {
      const result = filterBookmarksByTag("work", collection);
      expect(result).toHaveLength(1);
      expect(result[0].activityId).toBe("activity-1");
    });

    it("should return empty array for non-existing tag", () => {
      const result = filterBookmarksByTag("nonexistent", collection);
      expect(result).toHaveLength(0);
    });
  });
});

describe("Export/Import Functions", () => {
  let collection: BookmarkCollection;

  beforeEach(() => {
    collection = {
      bookmarks: [
        {
          activityId: "test-1",
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
          notes: "Test note",
          tags: ["work"],
        }
      ],
      lastUpdated: new Date(),
      count: 1,
      syncStatus: "local",
    };
  });

  describe("exportBookmarksToJSON", () => {
    it("should export valid JSON", () => {
      const result = exportBookmarksToJSON(collection);
      const parsed = JSON.parse(result);
      
      expect(parsed.version).toBe("1.0.0");
      expect(parsed.bookmarks).toHaveLength(1);
      expect(parsed.bookmarks[0].activityId).toBe("test-1");
    });
  });

  describe("exportBookmarksToCSV", () => {
    it("should export valid CSV", () => {
      const result = exportBookmarksToCSV(collection);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('Activity ID,Created At,Notes,Tags');
      expect(lines[1]).toContain('"test-1"');
      expect(lines[1]).toContain('"Test note"');
      expect(lines[1]).toContain('"work"');
    });

    it("should handle empty fields", () => {
      const collectionWithEmpty: BookmarkCollection = {
        ...collection,
        bookmarks: [
          {
            activityId: "test-2",
            createdAt: new Date("2023-01-01"),
          }
        ],
      };
      
      const result = exportBookmarksToCSV(collectionWithEmpty);
      expect(result).toContain('""'); // Empty notes and tags
    });
  });

  describe("importBookmarksFromJSON", () => {
    it("should import valid JSON", () => {
      const exportData = exportBookmarksToJSON(collection);
      const emptyCollection: BookmarkCollection = {
        bookmarks: [],
        lastUpdated: new Date(),
        count: 0,
        syncStatus: "local",
      };
      
      const result = importBookmarksFromJSON(exportData, emptyCollection);
      expect(result.bookmarks).toHaveLength(1);
      expect(result.bookmarks[0].activityId).toBe("test-1");
    });

    it("should merge when merge option is true", () => {
      const existingCollection: BookmarkCollection = {
        bookmarks: [
          {
            activityId: "existing",
            createdAt: new Date("2023-01-01"),
          }
        ],
        lastUpdated: new Date(),
        count: 1,
        syncStatus: "local",
      };
      
      const exportData = exportBookmarksToJSON(collection);
      const result = importBookmarksFromJSON(exportData, existingCollection, { merge: true });
      
      expect(result.bookmarks).toHaveLength(2);
    });

    it("should handle invalid JSON", () => {
      const emptyCollection: BookmarkCollection = {
        bookmarks: [],
        lastUpdated: new Date(),
        count: 0,
        syncStatus: "local",
      };
      
      expect(() => {
        importBookmarksFromJSON("invalid json", emptyCollection);
      }).toThrow("Failed to import bookmarks");
    });

    it("should handle unsupported version", () => {
      const invalidVersion = JSON.stringify({
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        bookmarks: [],
      });
      
      const emptyCollection: BookmarkCollection = {
        bookmarks: [],
        lastUpdated: new Date(),
        count: 0,
        syncStatus: "local",
      };
      
      expect(() => {
        importBookmarksFromJSON(invalidVersion, emptyCollection);
      }).toThrow("Unsupported version: 2.0.0");
    });
  });

  describe("downloadBookmarks", () => {
    let createObjectURL: any;
    let revokeObjectURL: any;
    let appendChild: any;
    let removeChild: any;
    let click: any;
    let createElement: any;

    beforeEach(() => {
      // Mock URL methods
      createObjectURL = vi.fn(() => 'mock-url');
      revokeObjectURL = vi.fn();
      Object.defineProperty(window, 'URL', {
        value: { createObjectURL, revokeObjectURL },
        configurable: true
      });

      // Mock DOM manipulation
      appendChild = vi.fn();
      removeChild = vi.fn();
      click = vi.fn();
      createElement = vi.fn(() => ({
        href: '',
        download: '',
        click,
      }));

      Object.defineProperty(document, 'createElement', {
        value: createElement,
        configurable: true
      });

      Object.defineProperty(document, 'body', {
        value: { appendChild, removeChild },
        configurable: true
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should trigger JSON download", () => {
      downloadBookmarks(collection, "json");
      
      expect(createObjectURL).toHaveBeenCalled();
      expect(createElement).toHaveBeenCalledWith('a');
      expect(appendChild).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();
      expect(removeChild).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
    });

    it("should trigger CSV download", () => {
      downloadBookmarks(collection, "csv");
      
      expect(createObjectURL).toHaveBeenCalled();
      expect(createElement).toHaveBeenCalledWith('a');
      expect(click).toHaveBeenCalled();
    });
  });
});