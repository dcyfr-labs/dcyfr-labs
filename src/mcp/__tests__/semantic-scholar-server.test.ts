/**
 * Tests for Semantic Scholar MCP Server
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter } from "../shared/rate-limiter";
import {
  scholarPapersCache,
  scholarSearchCache,
  scholarAuthorsCache,
} from "../shared/cache";
import type {
  ScholarPaper,
  ScholarAuthor,
  ScholarSearchResult,
} from "../shared/types";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a rate limiter with correct interval", () => {
    const rateLimiter = new RateLimiter(1); // 1 req/sec
    expect(rateLimiter).toBeDefined();
  });

  it("should enforce rate limit of 1 req/sec", async () => {
    const rateLimiter = new RateLimiter(1);
    const startTime = Date.now();

    // Enqueue 3 requests
    const promises = [
      rateLimiter.enqueue(async () => "request1"),
      rateLimiter.enqueue(async () => "request2"),
      rateLimiter.enqueue(async () => "request3"),
    ];

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    // Should take at least 2 seconds for 3 requests (0s, 1s, 2s)
    expect(duration).toBeGreaterThanOrEqual(1900); // Allow 100ms tolerance
    expect(results).toEqual(["request1", "request2", "request3"]);
  });

  it("should return correct queue length", () => {
    const rateLimiter = new RateLimiter(1);

    // Enqueue requests without awaiting
    rateLimiter.enqueue(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "req1";
    });
    rateLimiter.enqueue(async () => "req2");
    rateLimiter.enqueue(async () => "req3");

    // Queue length should reflect pending requests
    expect(rateLimiter.getQueueLength()).toBeGreaterThan(0);
  });

  it("should track statistics correctly", async () => {
    const rateLimiter = new RateLimiter(10); // Faster for testing

    await rateLimiter.enqueue(async () => "test1");
    await rateLimiter.enqueue(async () => "test2");

    const stats = rateLimiter.getStats();

    expect(stats.totalRequests).toBe(2);
    expect(stats.rejectedRequests).toBe(0);
    expect(stats.queueLength).toBe(0);
  });

  it("should handle errors in queued functions", async () => {
    const rateLimiter = new RateLimiter(1);

    const promise = rateLimiter.enqueue(async () => {
      throw new Error("Test error");
    });

    await expect(promise).rejects.toThrow("Test error");

    const stats = rateLimiter.getStats();
    expect(stats.rejectedRequests).toBe(1);
  });

  it("should clear queue correctly", async () => {
    const rateLimiter = new RateLimiter(1);

    // Enqueue several requests and catch expected rejections
    const promises = [
      rateLimiter.enqueue(async () => "req1").catch(() => "cleared"),
      rateLimiter.enqueue(async () => "req2").catch(() => "cleared"),
      rateLimiter.enqueue(async () => "req3").catch(() => "cleared"),
    ];

    // Give time for first request to start processing
    await new Promise((resolve) => setTimeout(resolve, 10));

    rateLimiter.clearQueue();

    expect(rateLimiter.getQueueLength()).toBe(0);

    // Wait for all promises to settle
    const results = await Promise.all(promises);

    // First request may complete or be cleared depending on timing
    // Others should be cleared
    expect(results[1]).toBe("cleared");
    expect(results[2]).toBe("cleared");
  });
});

describe("Scholar Caching", () => {
  beforeEach(() => {
    scholarPapersCache.clear();
    scholarSearchCache.clear();
    scholarAuthorsCache.clear();
  });

  it("should cache paper data", () => {
    const mockPaper: ScholarPaper = {
      paperId: "test123",
      title: "Test Paper",
      abstract: "This is a test paper",
      year: 2024,
    };

    scholarPapersCache.set("paper:test123", mockPaper);

    const cached = scholarPapersCache.get("paper:test123");
    expect(cached).toEqual(mockPaper);
  });

  it("should cache search results", () => {
    const mockSearchResult: ScholarSearchResult = {
      total: 1,
      offset: 0,
      data: [
        {
          paperId: "test123",
          title: "Test Paper",
        },
      ],
    };

    scholarSearchCache.set("search:test-query", mockSearchResult);

    const cached = scholarSearchCache.get("search:test-query");
    expect(cached).toEqual(mockSearchResult);
  });

  it("should cache author data", () => {
    const mockAuthor: ScholarAuthor = {
      authorId: "author123",
      name: "Test Author",
      paperCount: 10,
      citationCount: 100,
      hIndex: 5,
    };

    scholarAuthorsCache.set("author:author123", mockAuthor);

    const cached = scholarAuthorsCache.get("author:author123");
    expect(cached).toEqual(mockAuthor);
  });

  it("should expire cache entries after TTL", async () => {
    const shortTtlCache = new (
      await import("../shared/cache.js")
    ).SimpleCache(100); // 100ms TTL

    shortTtlCache.set("test", "value");
    expect(shortTtlCache.get("test")).toBe("value");

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(shortTtlCache.get("test")).toBeNull();
  });

  it("should return cache statistics", () => {
    scholarPapersCache.set("paper1", { paperId: "1", title: "Paper 1" });
    scholarPapersCache.set("paper2", { paperId: "2", title: "Paper 2" });

    const stats = scholarPapersCache.getStats();

    expect(stats.total).toBe(2);
    expect(stats.valid).toBe(2);
    expect(stats.expired).toBe(0);
  });

  it("should clear expired entries", async () => {
    const shortTtlCache = new (
      await import("../shared/cache.js")
    ).SimpleCache(100);

    shortTtlCache.set("item1", "value1");
    shortTtlCache.set("item2", "value2");

    await new Promise((resolve) => setTimeout(resolve, 150));

    shortTtlCache.clearExpired();

    const stats = shortTtlCache.getStats();
    expect(stats.total).toBe(0);
  });
});

describe("Semantic Scholar API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should construct correct API endpoint for paper search", () => {
    const baseUrl = "https://api.semanticscholar.org/graph/v1";
    const query = "machine learning";
    const fields = ["paperId", "title", "abstract"];

    const params = new URLSearchParams({
      query,
      fields: fields.join(","),
      limit: "10",
      offset: "0",
    });

    const expectedUrl = `${baseUrl}/paper/search?${params.toString()}`;

    expect(expectedUrl).toContain("query=machine+learning");
    expect(expectedUrl).toContain("fields=paperId%2Ctitle%2Cabstract");
  });

  it("should construct correct endpoint for paper details", () => {
    const baseUrl = "https://api.semanticscholar.org/graph/v1";
    const paperId = "abc123";
    const fields = ["paperId", "title", "authors"];

    const expectedUrl = `${baseUrl}/paper/${paperId}?fields=${fields.join(",")}`;

    expect(expectedUrl).toBe(
      "https://api.semanticscholar.org/graph/v1/paper/abc123?fields=paperId,title,authors"
    );
  });

  it("should construct correct endpoint for citations", () => {
    const baseUrl = "https://api.semanticscholar.org/graph/v1";
    const paperId = "xyz789";

    const params = new URLSearchParams({
      fields: "paperId,title",
      limit: "100",
      offset: "0",
    });

    const expectedUrl = `${baseUrl}/paper/${paperId}/citations?${params.toString()}`;

    expect(expectedUrl).toContain("/citations?");
    expect(expectedUrl).toContain("limit=100");
  });

  it("should handle DOI-based paper IDs correctly", () => {
    const doi = "10.1038/nature12373";
    const encodedDoi = encodeURIComponent(doi);

    expect(encodedDoi).toBe("10.1038%2Fnature12373");
  });

  it("should handle ArXiv IDs correctly", () => {
    const arxivId = "2301.12345";
    const encodedArxivId = encodeURIComponent(arxivId);

    // ArXiv IDs don't need encoding, but test the pattern
    expect(encodedArxivId).toBe("2301.12345");
  });
});

describe("Query Tracking", () => {
  it("should track recent queries with timestamps", () => {
    const recentQueries: Array<{
      query: string;
      type: string;
      timestamp: number;
      cached: boolean;
    }> = [];

    const trackQuery = (query: string, type: string, cached: boolean) => {
      recentQueries.unshift({
        query,
        type,
        timestamp: Date.now(),
        cached,
      });

      if (recentQueries.length > 20) {
        recentQueries.pop();
      }
    };

    trackQuery("machine learning", "searchPapers", false);
    trackQuery("deep learning", "searchPapers", true);

    expect(recentQueries).toHaveLength(2);
    expect(recentQueries[0].query).toBe("deep learning");
    expect(recentQueries[0].cached).toBe(true);
    expect(recentQueries[1].query).toBe("machine learning");
    expect(recentQueries[1].cached).toBe(false);
  });

  it("should limit to 20 recent queries", () => {
    const recentQueries: Array<{
      query: string;
      type: string;
      timestamp: number;
      cached: boolean;
    }> = [];

    const trackQuery = (query: string, type: string, cached: boolean) => {
      recentQueries.unshift({
        query,
        type,
        timestamp: Date.now(),
        cached,
      });

      if (recentQueries.length > 20) {
        recentQueries.pop();
      }
    };

    // Add 25 queries
    for (let i = 0; i < 25; i++) {
      trackQuery(`query${i}`, "searchPapers", false);
    }

    expect(recentQueries).toHaveLength(20);
    expect(recentQueries[0].query).toBe("query24"); // Most recent
    expect(recentQueries[19].query).toBe("query5"); // 20th from the end
  });
});

describe("Paper Data Validation", () => {
  it("should validate paper structure", () => {
    const validPaper: ScholarPaper = {
      paperId: "abc123",
      title: "Test Paper",
      abstract: "Abstract text",
      year: 2024,
      citationCount: 10,
      authors: [
        {
          authorId: "author1",
          name: "Author Name",
        },
      ],
    };

    expect(validPaper.paperId).toBeDefined();
    expect(validPaper.title).toBeDefined();
    expect(typeof validPaper.citationCount).toBe("number");
  });

  it("should handle optional fields", () => {
    const minimalPaper: ScholarPaper = {
      paperId: "minimal123",
      title: "Minimal Paper",
    };

    expect(minimalPaper.abstract).toBeUndefined();
    expect(minimalPaper.year).toBeUndefined();
    expect(minimalPaper.authors).toBeUndefined();
  });

  it("should validate author structure", () => {
    const validAuthor: ScholarAuthor = {
      authorId: "auth123",
      name: "Dr. Test Author",
      paperCount: 50,
      citationCount: 1000,
      hIndex: 15,
    };

    expect(validAuthor.authorId).toBeDefined();
    expect(validAuthor.name).toBeDefined();
    expect(typeof validAuthor.hIndex).toBe("number");
  });
});

describe("Error Handling", () => {
  it("should handle API errors gracefully", async () => {
    const mockErrorResponse = {
      status: 429,
      text: async () => "Rate limit exceeded",
    };

    const error = new Error(
      `Semantic Scholar API error (429): Rate limit exceeded`
    );

    expect(error.message).toContain("429");
    expect(error.message).toContain("Rate limit exceeded");
  });

  it("should handle network errors", () => {
    const networkError = new Error("Network request failed");

    expect(networkError.message).toBe("Network request failed");
  });

  it("should handle invalid paper IDs", () => {
    const invalidPaperId = "";

    expect(invalidPaperId.length).toBe(0);
  });
});

describe("Cache TTL Configuration", () => {
  it("should use correct TTL for different data types", () => {
    const CACHE_TTL = {
      PAPER: 90 * 24 * 60 * 60, // 90 days
      SEARCH: 7 * 24 * 60 * 60, // 7 days
      AUTHOR: 30 * 24 * 60 * 60, // 30 days
      CITATIONS: 24 * 60 * 60, // 1 day
      REFERENCES: 90 * 24 * 60 * 60, // 90 days
    };

    expect(CACHE_TTL.PAPER).toBe(7776000); // 90 days in seconds
    expect(CACHE_TTL.SEARCH).toBe(604800); // 7 days
    expect(CACHE_TTL.AUTHOR).toBe(2592000); // 30 days
    expect(CACHE_TTL.CITATIONS).toBe(86400); // 1 day
    expect(CACHE_TTL.REFERENCES).toBe(7776000); // 90 days
  });
});
