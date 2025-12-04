/**
 * Test Suite: lib/api-guardrails.ts
 *
 * Tests API usage tracking, cost estimation, and limit enforcement.
 * Critical for preventing unexpected API costs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  trackApiUsage,
  checkServiceLimit,
  getAllUsageStats,
  getUsageSummary,
  getApiHealthStatus,
  resetUsageTracking,
  estimatePerplexityCost,
  checkApiLimitMiddleware,
  recordApiCall,
  API_LIMITS,
} from "@/lib/api-guardrails";

describe("api-guardrails.ts", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetUsageTracking();
    // Mock console to prevent spam during limit threshold tests
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    resetUsageTracking();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("trackApiUsage", () => {
    it("should track first API call", () => {
      trackApiUsage("perplexity", "/api/research", 0.05);

      const stats = getAllUsageStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].service).toBe("perplexity");
      expect(stats[0].count).toBe(1);
      expect(stats[0].estimatedCost).toBe(0.05);
    });

    it("should increment count for subsequent calls", () => {
      trackApiUsage("perplexity", "/api/research", 0.05);
      trackApiUsage("perplexity", "/api/research", 0.03);
      trackApiUsage("perplexity", "/api/research", 0.04);

      const stats = getAllUsageStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].count).toBe(3);
      expect(stats[0].estimatedCost).toBeCloseTo(0.12, 2);
    });

    it("should track different services separately", () => {
      trackApiUsage("perplexity", "/api/research");
      trackApiUsage("inngest", "contact-form");
      trackApiUsage("resend", "email");

      const stats = getAllUsageStats();
      expect(stats).toHaveLength(3);
      expect(stats.map((s) => s.service)).toContain("perplexity");
      expect(stats.map((s) => s.service)).toContain("inngest");
      expect(stats.map((s) => s.service)).toContain("resend");
    });

    it("should track different endpoints separately", () => {
      trackApiUsage("perplexity", "/api/research");
      trackApiUsage("perplexity", "/api/analyze");

      const stats = getAllUsageStats();
      expect(stats).toHaveLength(2);
      expect(stats[0].endpoint).toBe("/api/research");
      expect(stats[1].endpoint).toBe("/api/analyze");
    });

    it("should calculate percent used correctly", () => {
      // Make 500 calls (50% of 1000 limit for Perplexity)
      for (let i = 0; i < 500; i++) {
        trackApiUsage("perplexity");
      }

      const stats = getAllUsageStats();
      expect(stats[0].percentUsed).toBe(50);
    });
  });

  describe("checkServiceLimit", () => {
    it("should allow requests under limit", () => {
      trackApiUsage("perplexity");

      const result = checkServiceLimit("perplexity");
      expect(result.allowed).toBe(true);
    });

    it("should block requests at limit", () => {
      const limit = API_LIMITS.perplexity.maxRequestsPerMonth;

      // Hit the limit
      for (let i = 0; i < limit; i++) {
        trackApiUsage("perplexity");
      }

      const result = checkServiceLimit("perplexity");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("limit reached");
    });

    it("should block when cost limit is reached", () => {
      // Simulate high-cost calls that exceed budget
      for (let i = 0; i < 10; i++) {
        trackApiUsage("perplexity", "/api/research", 6); // $6 each
      }

      const result = checkServiceLimit("perplexity", "/api/research");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("cost limit reached");
    });

    it("should return stats with result", () => {
      trackApiUsage("perplexity");

      const result = checkServiceLimit("perplexity");
      expect(result.stats).toBeDefined();
      expect(result.stats?.count).toBe(1);
    });
  });

  describe("getUsageSummary", () => {
    it("should return empty summary for no usage", () => {
      const summary = getUsageSummary();

      expect(summary.totalServices).toBe(0);
      expect(summary.totalCost).toBe(0);
      expect(summary.servicesNearLimit).toHaveLength(0);
      expect(summary.servicesAtLimit).toHaveLength(0);
    });

    it("should calculate total cost across services", () => {
      trackApiUsage("perplexity", "/api/research", 0.05);
      trackApiUsage("perplexity", "/api/research", 0.03);
      trackApiUsage("resend", "email", 0.001);

      const summary = getUsageSummary();
      expect(summary.totalCost).toBeCloseTo(0.081, 3);
    });

    it("should identify services near limit", () => {
      // Use 75% of limit (above 70% warning threshold)
      const limit = API_LIMITS.perplexity.maxRequestsPerMonth;
      for (let i = 0; i < limit * 0.75; i++) {
        trackApiUsage("perplexity");
      }

      const summary = getUsageSummary();
      expect(summary.servicesNearLimit).toContain("perplexity");
    });

    it("should identify services at limit", () => {
      const limit = API_LIMITS.perplexity.maxRequestsPerMonth;
      for (let i = 0; i < limit; i++) {
        trackApiUsage("perplexity");
      }

      const summary = getUsageSummary();
      expect(summary.servicesAtLimit).toContain("perplexity");
    });

    it("should count unique services", () => {
      trackApiUsage("perplexity", "/api/research");
      trackApiUsage("perplexity", "/api/analyze");
      trackApiUsage("inngest", "contact-form");

      const summary = getUsageSummary();
      expect(summary.totalServices).toBe(2); // perplexity and inngest
    });
  });

  describe("getApiHealthStatus", () => {
    it("should return healthy when all services within limits", () => {
      trackApiUsage("perplexity");

      const health = getApiHealthStatus();
      expect(health.status).toBe("healthy");
    });

    it("should return warning when service near limit", () => {
      // Use 75% of limit
      const limit = API_LIMITS.perplexity.maxRequestsPerMonth;
      for (let i = 0; i < limit * 0.75; i++) {
        trackApiUsage("perplexity");
      }

      const health = getApiHealthStatus();
      expect(health.status).toBe("warning");
    });

    it("should return critical when service at limit", () => {
      const limit = API_LIMITS.perplexity.maxRequestsPerMonth;
      for (let i = 0; i < limit; i++) {
        trackApiUsage("perplexity");
      }

      const health = getApiHealthStatus();
      expect(health.status).toBe("critical");
    });
  });

  describe("estimatePerplexityCost", () => {
    it("should estimate cost for small model", () => {
      const cost = estimatePerplexityCost({
        model: "llama-3.1-sonar-small-128k-online",
        promptTokens: 100,
        completionTokens: 200,
      });

      // Small model: $0.0002 per 1K tokens
      // (100 + 200) / 1000 * 0.0002 = 0.00006
      expect(cost).toBeCloseTo(0.00006, 5);
    });

    it("should estimate cost for large model", () => {
      const cost = estimatePerplexityCost({
        model: "llama-3.1-sonar-large-128k-online",
        promptTokens: 1000,
        completionTokens: 2000,
      });

      // Large model: $0.001 per 1K tokens
      // (1000 + 2000) / 1000 * 0.001 = 0.003
      expect(cost).toBeCloseTo(0.003, 5);
    });

    it("should estimate cost for huge model", () => {
      const cost = estimatePerplexityCost({
        model: "llama-3.1-sonar-huge-128k-online",
        promptTokens: 500,
        completionTokens: 1500,
      });

      // Huge model: $0.005 per 1K tokens
      // (500 + 1500) / 1000 * 0.005 = 0.01
      expect(cost).toBeCloseTo(0.01, 5);
    });

    it("should default to large model pricing for unknown model", () => {
      const cost = estimatePerplexityCost({
        model: "unknown-model",
        promptTokens: 1000,
        completionTokens: 1000,
      });

      // Should use large model pricing
      expect(cost).toBeCloseTo(0.002, 5);
    });
  });

  describe("checkApiLimitMiddleware", () => {
    it("should allow request when under limit", async () => {
      trackApiUsage("perplexity", "/api/research");

      const result = await checkApiLimitMiddleware("perplexity", "/api/research");
      expect(result.allowed).toBe(true);
    });

    it("should block request when at limit", async () => {
      const limit = API_LIMITS.perplexity.maxRequestsPerMonth;
      for (let i = 0; i < limit; i++) {
        trackApiUsage("perplexity", "/api/research");
      }

      const result = await checkApiLimitMiddleware("perplexity", "/api/research");
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.status).toBe(429);
        expect(result.message).toContain("limit");
        expect(result.retryAfter).toBe(3600);
      }
    });
  });

  describe("recordApiCall", () => {
    it("should track API call with cost", () => {
      recordApiCall("perplexity", "/api/research", {
        cost: 0.05,
        tokens: 1000,
        duration: 500,
      });

      const stats = getAllUsageStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].count).toBe(1);
      expect(stats[0].estimatedCost).toBe(0.05);
    });

    it("should track API call without cost", () => {
      recordApiCall("inngest", "contact-form");

      const stats = getAllUsageStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].count).toBe(1);
      expect(stats[0].estimatedCost).toBeUndefined();
    });
  });

  describe("resetUsageTracking", () => {
    it("should clear all usage statistics", () => {
      trackApiUsage("perplexity");
      trackApiUsage("inngest");
      trackApiUsage("resend");

      expect(getAllUsageStats()).toHaveLength(3);

      resetUsageTracking();

      expect(getAllUsageStats()).toHaveLength(0);
    });
  });
});
