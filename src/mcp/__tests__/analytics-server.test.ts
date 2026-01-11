/**
 * Analytics MCP Server Tests
 * Unit tests for Redis analytics MCP tools and resources
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Redis client
vi.mock("@/lib/redis", () => ({
  redis: {
    hgetall: vi.fn(),
    get: vi.fn(),
    hget: vi.fn(),
  },
}));

// Mock environment for production testing
const originalEnv = process.env;

describe("Analytics MCP Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe("Production Data Filtering", () => {
    it("should filter test data in production environment", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();

      const milestones = [
        { id: "1", title: "Real milestone", achievedAt: Date.now() },
        {
          id: "2",
          title: "Test milestone",
          achievedAt: Date.now(),
          isTest: true,
        },
      ];

      // Dynamic import after environment stub
      const { filterProductionData } = await import("../shared/utils");
      const filtered = filterProductionData(milestones);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should include test data in development environment", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.resetModules();

      const milestones = [
        { id: "1", title: "Real milestone", achievedAt: Date.now() },
        {
          id: "2",
          title: "Test milestone",
          achievedAt: Date.now(),
          isTest: true,
        },
      ];

      const { filterProductionData } = await import("../shared/utils");
      const filtered = filterProductionData(milestones);

      expect(filtered).toHaveLength(2);
    });
  });

  describe("Cache Functionality", () => {
    it("should cache results with TTL", async () => {
      const { SimpleCache } = await import("../shared/cache");
      const cache = new SimpleCache(1000); // 1 second TTL

      cache.set("test-key", { data: "value" });
      const result = cache.get("test-key");

      expect(result).toEqual({ data: "value" });
    });

    it("should return null for expired cache entries", async () => {
      const { SimpleCache } = await import("../shared/cache");
      const cache = new SimpleCache(10); // 10ms TTL

      cache.set("test-key", { data: "value" });

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = cache.get("test-key");
      expect(result).toBeNull();
    });
  });

  describe("Time Range Helpers", () => {
    it("should correctly calculate time range in milliseconds", async () => {
      const { getTimeRangeMs } = await import("../shared/utils");

      expect(getTimeRangeMs("1h")).toBe(3600000);
      expect(getTimeRangeMs("24h")).toBe(86400000);
      expect(getTimeRangeMs("7d")).toBe(604800000);
    });

    it("should validate timestamps within time range", async () => {
      const { isWithinTimeRange } = await import("../shared/utils");

      const now = Date.now();
      const oneHourAgo = now - 3600000;
      const twoDaysAgo = now - 172800000;

      expect(isWithinTimeRange(oneHourAgo, "24h")).toBe(true);
      expect(isWithinTimeRange(twoDaysAgo, "24h")).toBe(false);
    });
  });

  describe("Array Utilities", () => {
    it("should sort items by property in descending order", async () => {
      const { sortByProperty } = await import("../shared/utils");

      const items = [
        { path: "/a", views: 10 },
        { path: "/b", views: 50 },
        { path: "/c", views: 25 },
      ];

      const sorted = sortByProperty(items, "views");

      expect(sorted[0].views).toBe(50);
      expect(sorted[1].views).toBe(25);
      expect(sorted[2].views).toBe(10);
    });

    it("should limit results to specified count", async () => {
      const { limitResults } = await import("../shared/utils");

      const items = [1, 2, 3, 4, 5];
      const limited = limitResults(items, 3);

      expect(limited).toHaveLength(3);
      expect(limited).toEqual([1, 2, 3]);
    });
  });
});
