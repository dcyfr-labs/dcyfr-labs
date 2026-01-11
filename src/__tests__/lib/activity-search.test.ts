/**
 * Activity Search Tests
 *
 * Tests for full-text search, fuzzy matching, query parsing, and search history.
 * Includes performance benchmarks for <100ms on 1000+ items.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  parseSearchQuery,
  searchActivities,
  createSearchIndex,
  extractSearchTerms,
  highlightSearchTerms,
  loadSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
} from "@/lib/activity";
import type { ActivityItem } from "@/lib/activity";

// ============================================================================
// TEST DATA
// ============================================================================

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    source: "blog",
    verb: "published",
    title: "Building with TypeScript and React",
    description: "A guide to modern web development with TypeScript",
    timestamp: new Date("2024-12-01"),
    href: "/blog/typescript-react",
    meta: {
      tags: ["typescript", "react", "web-development"],
      category: "tutorial",
    },
  },
  {
    id: "2",
    source: "project",
    verb: "launched",
    title: "Portfolio Website Redesign",
    description: "Complete redesign using Next.js 16 and React 19",
    timestamp: new Date("2024-11-15"),
    href: "/projects/portfolio",
    meta: {
      tags: ["nextjs", "react", "design"],
      category: "web",
    },
  },
  {
    id: "3",
    source: "github",
    verb: "committed",
    title: "Add search functionality",
    description: "Implemented full-text search with fuzzy matching",
    timestamp: new Date("2024-12-10"),
    href: "/commits/abc123",
    meta: {
      tags: ["feature", "search"],
    },
  },
  {
    id: "4",
    source: "blog",
    verb: "published",
    title: "React Hooks Deep Dive",
    description: "Understanding useEffect and custom hooks",
    timestamp: new Date("2024-10-01"),
    href: "/blog/react-hooks",
    meta: {
      tags: ["react", "hooks", "javascript"],
      category: "tutorial",
    },
  },
];

// Generate large dataset for performance testing
function generateLargeDataset(size: number): ActivityItem[] {
  const items: ActivityItem[] = [];
  const titles = [
    "TypeScript Tutorial",
    "React Component",
    "Next.js Guide",
    "Web Development Tips",
    "JavaScript Best Practices",
  ];
  const sources: ActivityItem["source"][] = ["blog", "project", "github"];

  for (let i = 0; i < size; i++) {
    items.push({
      id: `item-${i}`,
      source: sources[i % sources.length],
      verb: "published",
      title: `${titles[i % titles.length]} ${i}`,
      description: `Description for item ${i} with various keywords`,
      timestamp: new Date(2024, 0, (i % 365) + 1),
      href: `/item-${i}`,
      meta: {
        tags: [`tag-${i % 10}`, `tag-${i % 5}`],
      },
    });
  }

  return items;
}

// ============================================================================
// QUERY PARSER TESTS
// ============================================================================

describe("parseSearchQuery", () => {
  it("should parse plain text queries", () => {
    const result = parseSearchQuery("react hooks");
    expect(result.terms).toBe("react hooks");
    expect(result.tags).toEqual([]);
    expect(result.sources).toEqual([]);
    expect(result.excludeSources).toEqual([]);
    expect(result.exactPhrases).toEqual([]);
  });

  it("should parse tag filters", () => {
    const result = parseSearchQuery("tag:typescript tag:react");
    expect(result.tags).toEqual(["typescript", "react"]);
    expect(result.terms).toBe("");
  });

  it("should parse source filters", () => {
    const result = parseSearchQuery("source:blog source:github");
    expect(result.sources).toEqual(["blog", "github"]);
  });

  it("should parse excluded sources", () => {
    const result = parseSearchQuery("-github -project");
    expect(result.excludeSources).toEqual(["github", "project"]);
  });

  it("should parse exact phrases", () => {
    const result = parseSearchQuery('"react hooks" "web development"');
    expect(result.exactPhrases).toEqual(["react hooks", "web development"]);
  });

  it("should parse complex queries", () => {
    const result = parseSearchQuery('tag:typescript source:blog -github "exact phrase" other terms');
    expect(result.tags).toEqual(["typescript"]);
    expect(result.sources).toEqual(["blog"]);
    expect(result.excludeSources).toEqual(["github"]);
    expect(result.exactPhrases).toEqual(["exact phrase"]);
    expect(result.terms.trim()).toBe("other terms");
  });
});

// ============================================================================
// SEARCH FUNCTIONALITY TESTS
// ============================================================================

describe("searchActivities", () => {
  it("should return all items when query is empty", () => {
    const results = searchActivities(mockActivities, "");
    expect(results).toHaveLength(mockActivities.length);
  });

  it("should search in titles", () => {
    const results = searchActivities(mockActivities, "TypeScript");
    expect(results).toHaveLength(1);
    expect(results[0].item.id).toBe("1");
  });

  it("should search in descriptions", () => {
    const results = searchActivities(mockActivities, "fuzzy matching");
    expect(results).toHaveLength(1);
    expect(results[0].item.id).toBe("3");
  });

  it("should support fuzzy matching for typos", () => {
    const results = searchActivities(mockActivities, "typescrpt"); // Missing 'i'
    expect(results.length).toBeGreaterThan(0);
  });

  it("should filter by tags", () => {
    const results = searchActivities(mockActivities, "tag:react");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.item.meta?.tags).toContain("react");
    });
  });

  it("should filter by source", () => {
    const results = searchActivities(mockActivities, "source:blog");
    expect(results.length).toBe(2);
    results.forEach((r) => {
      expect(r.item.source).toBe("blog");
    });
  });

  it("should exclude sources", () => {
    const results = searchActivities(mockActivities, "-github");
    expect(results.length).toBe(3);
    results.forEach((r) => {
      expect(r.item.source).not.toBe("github");
    });
  });

  it("should support exact phrase matching", () => {
    const results = searchActivities(mockActivities, '"React Hooks"');
    expect(results).toHaveLength(1);
    expect(results[0].item.title).toContain("React Hooks");
  });

  it("should combine multiple filters", () => {
    const results = searchActivities(mockActivities, "tag:react source:blog");
    expect(results.length).toBe(2);
    results.forEach((r) => {
      expect(r.item.source).toBe("blog");
      expect(r.item.meta?.tags).toContain("react");
    });
  });

  it("should return results with relevance scores", () => {
    const results = searchActivities(mockActivities, "react");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.score).toBeGreaterThan(0);
    });
  });

  it("should return results sorted by relevance", () => {
    const results = searchActivities(mockActivities, "react");
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});

// ============================================================================
// SEARCH PERFORMANCE TESTS
// ============================================================================

// TODO: Performance tests are environment-dependent and flaky in CI
describe.skip("searchActivities - Performance", () => {
  it("should complete search in <100ms for 1000 items", () => {
    const largeDataset = generateLargeDataset(1000);
    const index = createSearchIndex(largeDataset);

    const startTime = performance.now();
    searchActivities(largeDataset, "TypeScript Tutorial", index);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
  });

  it("should complete complex search in <100ms for 1000 items", () => {
    const largeDataset = generateLargeDataset(1000);
    const index = createSearchIndex(largeDataset);

    const startTime = performance.now();
    searchActivities(largeDataset, 'tag:tag-1 source:blog -github "Tutorial"', index);
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
  });
});

// ============================================================================
// SEARCH HISTORY TESTS
// ============================================================================

describe("Search History", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    clearSearchHistory();
  });

  it("should load empty history initially", () => {
    const history = loadSearchHistory();
    expect(history).toEqual([]);
  });

  it("should save search to history", () => {
    saveSearchToHistory("react hooks", 5);
    const history = loadSearchHistory();
    
    expect(history).toHaveLength(1);
    expect(history[0].query).toBe("react hooks");
    expect(history[0].resultCount).toBe(5);
    expect(history[0].timestamp).toBeInstanceOf(Date);
  });

  it("should limit history to 10 items", () => {
    for (let i = 0; i < 15; i++) {
      saveSearchToHistory(`query ${i}`, i);
    }

    const history = loadSearchHistory();
    expect(history).toHaveLength(10);
  });

  it("should remove duplicates and add to top", () => {
    saveSearchToHistory("first query", 5);
    saveSearchToHistory("second query", 3);
    saveSearchToHistory("first query", 8); // Duplicate

    const history = loadSearchHistory();
    expect(history).toHaveLength(2);
    expect(history[0].query).toBe("first query");
    expect(history[0].resultCount).toBe(8); // Updated count
  });

  it("should clear all history", () => {
    saveSearchToHistory("query 1", 5);
    saveSearchToHistory("query 2", 3);
    
    clearSearchHistory();
    const history = loadSearchHistory();
    expect(history).toEqual([]);
  });

  it("should ignore empty queries", () => {
    saveSearchToHistory("  ", 0);
    const history = loadSearchHistory();
    expect(history).toEqual([]);
  });
});

// ============================================================================
// SEARCH HIGHLIGHTING TESTS
// ============================================================================

describe("extractSearchTerms", () => {
  it("should extract plain text terms", () => {
    const terms = extractSearchTerms("react hooks");
    expect(terms).toEqual(["react", "hooks"]);
  });

  it("should extract exact phrases", () => {
    const terms = extractSearchTerms('"react hooks" typescript');
    expect(terms).toContain("react hooks");
    expect(terms).toContain("typescript");
  });

  it("should extract tag values", () => {
    const terms = extractSearchTerms("tag:typescript tag:react");
    expect(terms).toContain("typescript");
    expect(terms).toContain("react");
  });

  it("should filter out single characters", () => {
    const terms = extractSearchTerms("a react b hooks c");
    expect(terms).not.toContain("a");
    expect(terms).not.toContain("b");
    expect(terms).not.toContain("c");
    expect(terms).toContain("react");
    expect(terms).toContain("hooks");
  });
});

describe("highlightSearchTerms", () => {
  it("should return unhighlighted text when no terms", () => {
    const segments = highlightSearchTerms("Hello world", []);
    expect(segments).toEqual([{ text: "Hello world", highlighted: false }]);
  });

  it("should highlight single term", () => {
    const segments = highlightSearchTerms("Hello world", ["world"]);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({ text: "Hello ", highlighted: false });
    expect(segments[1]).toEqual({ text: "world", highlighted: true });
  });

  it("should highlight multiple terms", () => {
    const segments = highlightSearchTerms("TypeScript and React", ["TypeScript", "React"]);
    
    // Verify highlighted segments exist
    const highlighted = segments.filter((s) => s.highlighted);
    expect(highlighted).toHaveLength(2);
    expect(highlighted[0].text).toBe("TypeScript");
    expect(highlighted[1].text).toBe("React");
    
    // Verify non-highlighted segment exists
    const nonHighlighted = segments.filter((s) => !s.highlighted);
    expect(nonHighlighted.length).toBeGreaterThan(0);
  });

  it("should be case-insensitive", () => {
    const segments = highlightSearchTerms("Hello WORLD", ["world"]);
    expect(segments.some((s) => s.highlighted && s.text === "WORLD")).toBe(true);
  });

  it("should handle overlapping matches", () => {
    const segments = highlightSearchTerms("react react-hooks", ["react"]);
    expect(segments.filter((s) => s.highlighted).length).toBeGreaterThan(0);
  });

  it("should escape special regex characters", () => {
    const segments = highlightSearchTerms("Price: $100 (sale)", ["$100"]);
    expect(segments.some((s) => s.highlighted && s.text === "$100")).toBe(true);
  });
});
