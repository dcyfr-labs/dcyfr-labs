/**
 * Test Suite: lib/perplexity.ts
 *
 * Tests AI-powered research service with Perplexity API integration.
 * Critical for research capabilities and citation generation.
 *
 * Coverage: research, quickResearch, isPerplexityConfigured, cache management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  research,
  quickResearch,
  isPerplexityConfigured,
  clearCache,
  getCacheStats,
  type ChatMessage,
  type PerplexityRequestOptions,
  type PerplexityResponse,
} from "@/lib/perplexity";

// Store original fetch to restore it later
const originalFetch = global.fetch;

// Mock fetch with proper typing
const mockFetch = vi.fn();

describe("perplexity.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
    delete process.env.PERPLEXITY_API_KEY;
    // Replace global fetch with our mock for each test
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    clearCache();
    // Restore original fetch after each test
    global.fetch = originalFetch;
  });

  describe("isPerplexityConfigured", () => {
    it("should return false when API key is not set", () => {
      delete process.env.PERPLEXITY_API_KEY;
      expect(isPerplexityConfigured()).toBe(false);
    });

    it("should return true when API key is set", () => {
      process.env.PERPLEXITY_API_KEY = "test-key";
      expect(isPerplexityConfigured()).toBe(true);
    });

    it("should return false for empty API key", () => {
      process.env.PERPLEXITY_API_KEY = "";
      expect(isPerplexityConfigured()).toBe(false);
    });
  });

  describe("research - configuration", () => {
    it("should throw error when Perplexity is not configured", async () => {
      delete process.env.PERPLEXITY_API_KEY;

      const messages: ChatMessage[] = [
        { role: "user", content: "Test query" },
      ];

      await expect(research(messages)).rejects.toThrow(
        "Perplexity API key not configured"
      );
    });

    it("should throw error when API key is missing during request", async () => {
      // Configure initially but remove before request
      process.env.PERPLEXITY_API_KEY = "test-key";

      const messages: ChatMessage[] = [
        { role: "user", content: "Test query" },
      ];

      // Remove key before making request
      delete process.env.PERPLEXITY_API_KEY;

      await expect(research(messages)).rejects.toThrow(
        "Perplexity API key not configured"
      );
    });
  });

  describe("research - successful requests", () => {
    beforeEach(() => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";
    });

    it("should make successful research request", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        citations: ["https://example.com/article1"],
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "This is the research result with citations.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What are the latest React features?" },
      ];

      const result = await research(messages);

      expect(result.content).toBe("This is the research result with citations.");
      expect(result.citations).toEqual(["https://example.com/article1"]);
      expect(result.usage.totalTokens).toBe(150);
      expect(result.usage.promptTokens).toBe(50);
      expect(result.usage.completionTokens).toBe(100);

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledTimes(1);
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
    });

    it("should include citations when requested", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        citations: [
          "https://example.com/1",
          "https://example.com/2",
          "https://example.com/3",
        ],
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Research with multiple citations.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Research query" },
      ];

      const options: PerplexityRequestOptions = {
        return_citations: true,
      };

      const result = await research(messages, options);

      expect(result.citations).toHaveLength(3);
      expect(result.citations).toContain("https://example.com/1");
    });

    it("should include related questions when requested", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        related_questions: [
          "What is React Server Components?",
          "How do React hooks work?",
        ],
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Research result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Tell me about React" },
      ];

      const options: PerplexityRequestOptions = {
        return_related_questions: true,
      };

      const result = await research(messages, options);

      expect(result.relatedQuestions).toHaveLength(2);
      expect(result.relatedQuestions).toContain("What is React Server Components?");
    });

    it("should use custom model when specified", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-small-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 30,
          completion_tokens: 60,
          total_tokens: 90,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Small model result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Quick query" },
      ];

      const options: PerplexityRequestOptions = {
        model: "llama-3.1-sonar-small-128k-online",
      };

      await research(messages, options);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.model).toBe("llama-3.1-sonar-small-128k-online");
    });

    it("should apply search recency filter", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Recent results.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Latest news" },
      ];

      const options: PerplexityRequestOptions = {
        search_recency_filter: "day",
      };

      await research(messages, options);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.search_recency_filter).toBe("day");
    });
  });

  describe("research - error handling", () => {
    beforeEach(() => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";
    });

    it("should throw error on API failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            message: "Internal server error",
            type: "server_error",
          },
        }),
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Test query" },
      ];

      await expect(research(messages)).rejects.toThrow("Internal server error");
    });

    it("should throw error on network failure", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error("Network request failed")
      );

      const messages: ChatMessage[] = [
        { role: "user", content: "Test query" },
      ];

      await expect(research(messages)).rejects.toThrow("Network request failed");
    });

    it("should handle API error without message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {},
        }),
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Test query" },
      ];

      await expect(research(messages)).rejects.toThrow("Perplexity API error: 400");
    });
  });

  describe("research - caching", () => {
    beforeEach(() => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";
    });

    it("should cache successful results", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Cached result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Cache test" },
      ];

      // First request
      await research(messages);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second request (should use cache)
      await research(messages);
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional call

      // Verify cache stats
      const stats = getCacheStats();
      expect(stats.size).toBe(1);
    });

    it("should not cache when useCache is false", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Non-cached result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "No cache test" },
      ];

      // Two requests with caching disabled
      await research(messages, undefined, false);
      await research(messages, undefined, false);

      // Both should hit the API
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Cache should be empty
      const stats = getCacheStats();
      expect(stats.size).toBe(0);
    });

    it("should clear cache", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: ChatMessage[] = [
        { role: "user", content: "Clear test" },
      ];

      // Make request to populate cache
      await research(messages);
      expect(getCacheStats().size).toBe(1);

      // Clear cache
      clearCache();
      expect(getCacheStats().size).toBe(0);
    });
  });

  describe("quickResearch", () => {
    beforeEach(() => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";
    });

    it("should perform quick research with default system message", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Quick research result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await quickResearch("What is TypeScript?");

      expect(result.content).toBe("Quick research result.");

      // Verify the request included system message
      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe("system");
      expect(requestBody.messages[1].content).toBe("What is TypeScript?");
    });

    it("should accept options for quick research", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-small-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 30,
          completion_tokens: 60,
          total_tokens: 90,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Quick result with options.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: PerplexityRequestOptions = {
        model: "llama-3.1-sonar-small-128k-online",
        search_recency_filter: "hour",
      };

      await quickResearch("Latest news?", options);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.model).toBe("llama-3.1-sonar-small-128k-online");
      expect(requestBody.search_recency_filter).toBe("hour");
    });
  });

  describe("getCacheStats", () => {
    beforeEach(() => {
      process.env.PERPLEXITY_API_KEY = "test-api-key";
    });

    it("should return empty stats when cache is empty", () => {
      const stats = getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toHaveLength(0);
    });

    it("should return accurate cache stats", async () => {
      const mockResponse: PerplexityResponse = {
        id: "test-id",
        model: "llama-3.1-sonar-large-128k-online",
        created: Date.now(),
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "Result.",
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Add multiple items to cache
      await research([{ role: "user", content: "Query 1" }]);
      await research([{ role: "user", content: "Query 2" }]);
      await research([{ role: "user", content: "Query 3" }]);

      const stats = getCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.keys).toHaveLength(3);
    });
  });
});
