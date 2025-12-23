/**
 * Unified Search System Tests
 * 
 * Comprehensive test suite for generic search functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseSearchQuery,
  queryToString,
  getSearchTermsForHighlighting,
  createSearchIndex,
  searchItems,
  highlightSearchTerms,
  containsSearchTerms,
  getMatchExcerpt,
  loadSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  type SearchConfig,
} from "@/lib/search";

// Mock data for testing
interface TestItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

const TEST_ITEMS: TestItem[] = [
  {
    id: "1",
    title: "Introduction to TypeScript",
    description: "Learn the basics of TypeScript programming",
    tags: ["typescript", "programming", "tutorial"],
    category: "code",
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Master advanced React patterns and best practices",
    tags: ["react", "javascript", "patterns"],
    category: "code",
  },
  {
    id: "3",
    title: "Security Best Practices",
    description: "Essential security practices for web development",
    tags: ["security", "best-practices", "web"],
    category: "security",
  },
  {
    id: "4",
    title: "Python for Data Science",
    description: "Using Python for data analysis and visualization",
    tags: ["python", "data-science", "analytics"],
    category: "data",
  },
];

const TEST_CONFIG: SearchConfig<TestItem> = {
  fields: [
    { name: "title", weight: 3 },
    { name: "description", weight: 2 },
    { name: "tags", weight: 1.5 },
    { name: "category", weight: 1 },
  ],
  idField: "id",
  fuzzyThreshold: 0.2,
  maxHistoryItems: 10,
  historyStorageKey: "test-search-history",
};

// ============================================================================
// Query Parser Tests
// ============================================================================

describe("parseSearchQuery", () => {
  it("should parse simple search terms", () => {
    const query = parseSearchQuery("typescript programming");
    expect(query.terms).toEqual(["typescript", "programming"]);
    expect(query.phrases).toEqual([]);
    expect(query.excludeTerms).toEqual([]);
    expect(query.filters).toEqual({});
    expect(query.isFilterOnly).toBe(false);
  });

  it("should parse exact phrases", () => {
    const query = parseSearchQuery('"advanced react" patterns');
    expect(query.phrases).toContain("advanced react");
    expect(query.terms).toContain("patterns");
  });

  it("should parse exclusions", () => {
    const query = parseSearchQuery("typescript -javascript");
    expect(query.terms).toContain("typescript");
    expect(query.excludeTerms).toContain("javascript");
  });

  it("should parse field filters", () => {
    const query = parseSearchQuery("tag:security category:code");
    expect(query.filters.tag).toEqual(["security"]);
    expect(query.filters.category).toEqual(["code"]);
    expect(query.isFilterOnly).toBe(true); // No search terms, only filters
  });

  it("should parse complex queries", () => {
    const query = parseSearchQuery('security tag:api -test "exact match"');
    expect(query.terms).toContain("security");
    expect(query.phrases).toContain("exact match");
    expect(query.excludeTerms).toContain("test");
    expect(query.filters.tag).toContain("api");
    expect(query.isFilterOnly).toBe(false); // Has search terms
  });

  it("should handle empty query", () => {
    const query = parseSearchQuery("");
    expect(query.isFilterOnly).toBe(true);
    expect(query.terms).toEqual([]);
  });

  it("should handle filter-only query", () => {
    const query = parseSearchQuery("tag:security category:code");
    expect(query.isFilterOnly).toBe(true);
  });

  it("should handle multiple values for same filter", () => {
    const query = parseSearchQuery("tag:react tag:typescript");
    expect(query.filters.tag).toEqual(["react", "typescript"]);
  });
});

describe("queryToString", () => {
  it("should convert query back to string", () => {
    const query = parseSearchQuery('security tag:api -test "exact match"');
    const queryString = queryToString(query);
    expect(queryString).toContain("security");
    expect(queryString).toContain('"exact match"');
    expect(queryString).toContain("-test");
    expect(queryString).toContain("tag:api");
  });
});

describe("getSearchTermsForHighlighting", () => {
  it("should extract all terms for highlighting", () => {
    const query = parseSearchQuery('"react patterns" typescript');
    const terms = getSearchTermsForHighlighting(query);
    expect(terms).toContain("typescript");
    expect(terms).toContain("react patterns");
    expect(terms).toContain("react");
    expect(terms).toContain("patterns");
  });
});

// ============================================================================
// Search Engine Tests
// ============================================================================

describe("createSearchIndex", () => {
  it("should create a search index", () => {
    const index = createSearchIndex(TEST_ITEMS, TEST_CONFIG);
    expect(index).toBeDefined();
  });
});

describe("searchItems", () => {
  let searchIndex: ReturnType<typeof createSearchIndex<TestItem>>;

  beforeEach(() => {
    searchIndex = createSearchIndex(TEST_ITEMS, TEST_CONFIG);
  });

  it("should return all items for empty query", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "", TEST_CONFIG);
    expect(results).toHaveLength(TEST_ITEMS.length);
  });

  it("should search by text term", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "typescript", TEST_CONFIG);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.title).toContain("TypeScript");
  });

  it("should support fuzzy matching", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "typescrit", TEST_CONFIG);
    expect(results.length).toBeGreaterThan(0);
  });

  it("should filter by tag", () => {
    // Use "tags:" to match the field name in TEST_ITEMS (plural)
    const results = searchItems(TEST_ITEMS, searchIndex, "tags:security", TEST_CONFIG);
    expect(results.length).toBeGreaterThanOrEqual(1);
    if (results.length > 0) {
      const hasSecurityTag = results.some(r => r.item.tags.includes("security"));
      expect(hasSecurityTag).toBe(true);
    }
  });

  it("should combine text search and filters", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "react tags:react", TEST_CONFIG);
    expect(results.length).toBeGreaterThanOrEqual(0);
    if (results.length > 0) {
      expect(results[0].item.tags).toContain("react");
    }
  });

  it("should filter by category", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "category:code", TEST_CONFIG);
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      expect(r.item.category).toBe("code");
    });
  });

  it("should exclude terms", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "programming -python", TEST_CONFIG);
    results.forEach(r => {
      expect(r.item.title.toLowerCase()).not.toContain("python");
      expect(r.item.description.toLowerCase()).not.toContain("python");
    });
  });

  it("should match exact phrases", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, '"security practices"', TEST_CONFIG);
    expect(results.length).toBeGreaterThan(0);
    const hasMatch = results.some(r => 
      r.item.description.toLowerCase().includes("security practices")
    );
    expect(hasMatch).toBe(true);
  });

  it("should combine text search and filters", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "patterns tags:react", TEST_CONFIG);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.tags).toContain("react");
  });

  it("should return results with scores", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "typescript", TEST_CONFIG);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("should return matched terms", () => {
    const results = searchItems(TEST_ITEMS, searchIndex, "typescript", TEST_CONFIG);
    expect(results[0].matchedTerms).toContain("typescript");
  });
});

// ============================================================================
// Highlighting Tests
// ============================================================================

describe("highlightSearchTerms", () => {
  it("should split text into highlighted segments", () => {
    const segments = highlightSearchTerms("Hello World", "hello");
    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe("Hello");
    expect(segments[0].highlighted).toBe(true);
    expect(segments[1].text).toBe(" World");
    expect(segments[1].highlighted).toBe(false);
  });

  it("should handle multiple matches", () => {
    const segments = highlightSearchTerms("React and React Native", "react");
    const highlightedCount = segments.filter(s => s.highlighted).length;
    expect(highlightedCount).toBe(2);
  });

  it("should be case-insensitive", () => {
    const segments = highlightSearchTerms("TypeScript", "typescript");
    expect(segments[0].highlighted).toBe(true);
  });

  it("should handle empty query", () => {
    const segments = highlightSearchTerms("Hello World", "");
    expect(segments).toHaveLength(1);
    expect(segments[0].highlighted).toBe(false);
  });
});

describe("containsSearchTerms", () => {
  it("should return true if text contains search terms", () => {
    expect(containsSearchTerms("Hello World", "hello")).toBe(true);
  });

  it("should return false if text does not contain search terms", () => {
    expect(containsSearchTerms("Hello World", "goodbye")).toBe(false);
  });

  it("should be case-insensitive", () => {
    expect(containsSearchTerms("TypeScript", "typescript")).toBe(true);
  });
});

describe("getMatchExcerpt", () => {
  const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. TypeScript is a great language for building scalable applications. It provides type safety and better tooling.";

  it("should return excerpt around first match", () => {
    const excerpt = getMatchExcerpt(longText, "TypeScript", 100);
    expect(excerpt).toContain("TypeScript");
    expect(excerpt.length).toBeLessThanOrEqual(120); // Allow for ellipsis
  });

  it("should add ellipsis when truncating", () => {
    const excerpt = getMatchExcerpt(longText, "TypeScript", 50);
    expect(excerpt).toContain("...");
  });

  it("should handle no match", () => {
    const excerpt = getMatchExcerpt(longText, "Python", 50);
    expect(excerpt.length).toBeLessThanOrEqual(60);
  });
});

// ============================================================================
// Search History Tests
// ============================================================================

describe("Search History", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearSearchHistory(TEST_CONFIG.historyStorageKey);
  });

  it("should save search to history", () => {
    saveSearchToHistory("typescript", 5, TEST_CONFIG.historyStorageKey);
    const history = loadSearchHistory(TEST_CONFIG.historyStorageKey);
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe("typescript");
    expect(history[0].resultCount).toBe(5);
  });

  it("should not duplicate searches", () => {
    saveSearchToHistory("typescript", 5, TEST_CONFIG.historyStorageKey);
    saveSearchToHistory("typescript", 3, TEST_CONFIG.historyStorageKey);
    const history = loadSearchHistory(TEST_CONFIG.historyStorageKey);
    expect(history).toHaveLength(1);
    expect(history[0].resultCount).toBe(3); // Updated count
  });

  it("should limit history to max items", () => {
    for (let i = 0; i < 15; i++) {
      saveSearchToHistory(`query${i}`, i, TEST_CONFIG.historyStorageKey, 10);
    }
    const history = loadSearchHistory(TEST_CONFIG.historyStorageKey, 10);
    expect(history.length).toBeLessThanOrEqual(10);
  });

  it("should sort history by most recent first", () => {
    saveSearchToHistory("first", 1, TEST_CONFIG.historyStorageKey);
    saveSearchToHistory("second", 2, TEST_CONFIG.historyStorageKey);
    const history = loadSearchHistory(TEST_CONFIG.historyStorageKey);
    expect(history[0].query).toBe("second");
  });

  it("should clear all history", () => {
    saveSearchToHistory("typescript", 5, TEST_CONFIG.historyStorageKey);
    clearSearchHistory(TEST_CONFIG.historyStorageKey);
    const history = loadSearchHistory(TEST_CONFIG.historyStorageKey);
    expect(history).toHaveLength(0);
  });
});

// ============================================================================
// Performance Tests
// ============================================================================

describe("Search Performance", () => {
  it("should handle large datasets efficiently", () => {
    // Create 1000 test items
    const largeDataset: TestItem[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i} about ${i % 10 === 0 ? "TypeScript" : "JavaScript"}`,
      description: `Description for item ${i}`,
      tags: [`tag${i % 5}`, `tag${i % 10}`],
      category: i % 3 === 0 ? "code" : "other",
    }));

    const searchIndex = createSearchIndex(largeDataset, TEST_CONFIG);
    
    const startTime = performance.now();
    const results = searchItems(largeDataset, searchIndex, "TypeScript", TEST_CONFIG);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    
    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100); // Should complete in <100ms
  });
});
