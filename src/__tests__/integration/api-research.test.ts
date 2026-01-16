/**
 * Integration Test Suite: /api/research
 *
 * Tests the research API endpoint with Perplexity AI integration.
 * Covers rate limiting, validation, error handling, and response formatting.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST, GET } from "@/app/api/research/route";
import { rateLimit } from "@/lib/rate-limit";
import { blockExternalAccess } from "@/lib/api-security";
import { NextRequest } from "next/server";
import type { PerplexityResponse } from "@/lib/perplexity";

// Mock the entire perplexity library to avoid fetch conflicts
vi.mock("@/lib/perplexity", () => ({
  research: vi.fn(),
  quickResearch: vi.fn(),
  isPerplexityConfigured: vi.fn(),
  clearCache: vi.fn(),
  getCacheStats: vi.fn(),
}));

// Import mocked functions
import { research, isPerplexityConfigured, clearCache } from "@/lib/perplexity";

// Mock dependencies
vi.mock("@/lib/api-security", () => ({
  blockExternalAccess: vi.fn(() => null), // By default, allow access
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => "192.168.1.1"),
  createRateLimitHeaders: vi.fn((result) => ({
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  })),
}));

describe("Research API Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.PERPLEXITY_API_KEY;

    // Default: Perplexity is not configured
    vi.mocked(isPerplexityConfigured).mockReturnValue(false);

    // Default: rate limit allows requests
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    // Default: successful research response (ResearchResult type)
    vi.mocked(research).mockResolvedValue({
      content: "This is a research result with citations and analysis.",
      citations: ["https://example.com/article1", "https://example.com/article2"],
      usage: {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      },
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("GET /api/research", () => {
    it("returns service status when configured", async () => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";
      vi.mocked(isPerplexityConfigured).mockReturnValue(true);

      const request = new NextRequest("http://localhost:3000/api/research");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.service).toBe("Perplexity AI Research");
      expect(data.status).toBe("available");
      expect(data.configured).toBe(true);
      expect(data.models).toContain("llama-3.1-sonar-large-128k-online");
      expect(data.rateLimit.requestsPerMinute).toBe(5);
    });

    it("returns not configured status when API key is missing", async () => {
      delete process.env.PERPLEXITY_API_KEY;
      vi.mocked(isPerplexityConfigured).mockReturnValue(false);

      const request = new NextRequest("http://localhost:3000/api/research");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("not configured");
      expect(data.configured).toBe(false);
    });
  });

  describe("POST /api/research", () => {
    describe("Service Configuration", () => {
      it("rejects request when Perplexity is not configured", async () => {
        delete process.env.PERPLEXITY_API_KEY;

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test query" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.error).toBe("Research service not configured");
      });
    });

    describe("Rate Limiting", () => {
      beforeEach(() => {
        process.env.PERPLEXITY_API_KEY = "test-api-key";
        vi.mocked(isPerplexityConfigured).mockReturnValue(true);
      });

      it("blocks request when rate limit is exceeded", async () => {
        vi.mocked(rateLimit).mockResolvedValueOnce({
          success: false,
          limit: 5,
          remaining: 0,
          reset: Date.now() + 30000,
        });

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test query" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.error).toContain("Rate limit exceeded");
        expect(response.headers.get("Retry-After")).toBeTruthy();
      });

      it("includes rate limit headers in response", async () => {
        process.env.PERPLEXITY_API_KEY = "test-api-key";

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test query" }],
          }),
        });

        const response = await POST(request);

        expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
        expect(response.headers.get("X-RateLimit-Remaining")).toBeTruthy();
        expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
      });
    });

    describe("Input Validation", () => {
      beforeEach(() => {
        process.env.PERPLEXITY_API_KEY = "test-api-key";
        vi.mocked(isPerplexityConfigured).mockReturnValue(true);
      });

      it("rejects request with invalid JSON", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: "invalid json{",
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid JSON");
      });

      it("rejects request without messages", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid messages format");
      });

      it("rejects request with empty messages array", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid messages format");
      });

      it("rejects messages with invalid role", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "invalid", content: "Test" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid messages format");
      });

      it("rejects messages without content", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid messages format");
      });

      it("rejects message with content too long", async () => {
        const longContent = "a".repeat(10001); // Exceeds MAX_MESSAGE_LENGTH

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: longContent }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid messages format");
      });

      it("rejects too many messages", async () => {
        const messages = Array.from({ length: 21 }, (_, i) => ({
          role: "user" as const,
          content: `Message ${i}`,
        }));

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({ messages }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid messages format");
      });

      it("accepts valid messages", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: "What is TypeScript?" },
            ],
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });

      it("rejects invalid model option", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test" }],
            options: { model: "invalid-model" },
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid options format");
      });

      it("rejects invalid temperature option", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test" }],
            options: { temperature: 3 }, // Out of range (0-2)
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain("Invalid options format");
      });

      it("accepts valid options", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test" }],
            options: {
              model: "llama-3.1-sonar-small-128k-online",
              temperature: 0.7,
              max_tokens: 1000,
              return_citations: true,
              search_recency_filter: "week",
            },
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });

    describe("Successful Requests", () => {
      beforeEach(() => {
        process.env.PERPLEXITY_API_KEY = "test-api-key";
        vi.mocked(isPerplexityConfigured).mockReturnValue(true);
      });

      it("returns research result with citations", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: "What are the latest React features?" },
            ],
            options: {
              return_citations: true,
            },
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.content).toBe("This is a research result with citations and analysis.");
        expect(data.citations).toHaveLength(2);
        expect(data.citations).toContain("https://example.com/article1");
        expect(data.usage).toBeDefined();
        expect(data.usage.totalTokens).toBe(150);
      });

      it("includes cache headers", async () => {
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test query" }],
          }),
        });

        const response = await POST(request);

        expect(response.headers.get("Cache-Control")).toBeTruthy();
        expect(response.headers.get("X-Cache-Status")).toBe("MISS");
      });

      it("makes correct API call to Perplexity", async () => {
        const testRequest = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: "Test query" },
            ],
            options: {
              model: "llama-3.1-sonar-huge-128k-online",
              temperature: 0.7,
              return_citations: true,
            },
          }),
        });

        const response = await POST(testRequest);

        expect(response.status).toBe(200);
        // Verify research() was called with correct arguments
        expect(research).toHaveBeenCalledWith(
          [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Test query" },
          ],
          expect.objectContaining({
            model: "llama-3.1-sonar-huge-128k-online",
            temperature: 0.7,
            return_citations: true,
          })
        );
      });
    });

    describe("Error Handling", () => {
      beforeEach(() => {
        process.env.PERPLEXITY_API_KEY = "test-api-key";
        vi.mocked(isPerplexityConfigured).mockReturnValue(true);
      });

      it("handles Perplexity API errors", async () => {
        // Mock research() to throw an API error
        vi.mocked(research).mockRejectedValueOnce(
          new Error("Perplexity API error: Internal server error")
        );

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Error test query 1" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Research request failed");
      });

      it("handles network errors", async () => {
        // Mock research() to throw a network error
        vi.mocked(research).mockRejectedValueOnce(
          new Error("Network error")
        );

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Error test query 2" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Research request failed");
      });

      it("handles authentication errors", async () => {
        // Mock research() to throw an authentication error
        vi.mocked(research).mockRejectedValueOnce(
          new Error("Perplexity API error: Unauthorized")
        );

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Error test query 3" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.error).toBe("Authentication failed");
      });

      it("handles upstream rate limit errors", async () => {
        // Mock research() to throw a rate limit error
        vi.mocked(research).mockRejectedValueOnce(
          new Error("Perplexity API error: Rate limit exceeded")
        );

        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Error test query 4" }],
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.error).toBe("Upstream rate limit exceeded");
      });
    });
  });
});
