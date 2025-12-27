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
import { clearCache } from "@/lib/perplexity";
import { NextRequest } from "next/server";
import type { PerplexityResponse } from "@/lib/perplexity";

// Mock dependencies
vi.mock("@/lib/api-security", () => ({
  blockExternalAccess: vi.fn(() => null), // By default, allow access
  safeFetch: vi.fn((...args: Parameters<typeof fetch>) => global.fetch(...args)), // Delegate to global fetch mock
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

// Mock fetch globally
global.fetch = vi.fn();

describe("Research API Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    clearCache(); // Clear Perplexity cache between tests

    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.PERPLEXITY_API_KEY;

    // Default: rate limit allows requests
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    // Default: successful Perplexity API response
    const mockResponse: PerplexityResponse = {
      id: "test-completion-id",
      model: "llama-3.1-sonar-large-128k-online",
      created: Date.now(),
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150,
      },
      citations: ["https://example.com/article1", "https://example.com/article2"],
      choices: [
        {
          index: 0,
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: "This is a research result with citations and analysis.",
          },
        },
      ],
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("GET /api/research", () => {
    it("returns service status when configured", async () => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";

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
        const request = new NextRequest("http://localhost:3000/api/research", {
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: "Test query" }],
            options: {
              model: "llama-3.1-sonar-small-128k-online",
              search_recency_filter: "day",
            },
          }),
        });

        await POST(request);

        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.perplexity.ai/chat/completions",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: "Bearer test-api-key",
            }),
          })
        );

        const fetchCall = (global.fetch as any).mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);
        expect(requestBody.model).toBe("llama-3.1-sonar-small-128k-online");
        expect(requestBody.search_recency_filter).toBe("day");
        expect(requestBody.return_citations).toBe(true);
      });
    });

    describe("Error Handling", () => {
      beforeEach(() => {
        process.env.PERPLEXITY_API_KEY = "test-api-key";
      });

      it("handles Perplexity API errors", async () => {
        // Clear all previous mocks and set up error response
        vi.mocked(global.fetch).mockReset();
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error: {
              message: "Internal server error",
              type: "server_error",
            },
          }),
        } as Response);

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
        vi.mocked(global.fetch).mockReset();
        vi.mocked(global.fetch).mockRejectedValueOnce(
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
        vi.mocked(global.fetch).mockReset();
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            error: {
              message: "Unauthorized",
              type: "authentication_error",
            },
          }),
        } as Response);

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
        vi.mocked(global.fetch).mockReset();
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({
            error: {
              message: "Rate limit exceeded",
              type: "rate_limit_error",
            },
          }),
        } as Response);

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
