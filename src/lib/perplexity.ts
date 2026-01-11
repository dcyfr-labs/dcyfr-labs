/**
 * Perplexity AI Research Service
 *
 * Provides AI-powered research capabilities with real-time web search.
 * Uses the Perplexity API (OpenAI-compatible format) for chat completions
 * with integrated search and citation generation.
 */

import { SERVICES } from "@/lib/site-config";
import { safeFetch } from "@/lib/api-security";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Available Perplexity AI models
 */
export type PerplexityModel =
  | "llama-3.1-sonar-small-128k-online"
  | "llama-3.1-sonar-large-128k-online"
  | "llama-3.1-sonar-huge-128k-online";

/**
 * Search recency filter options
 */
export type SearchRecencyFilter = "hour" | "day" | "week" | "month";

/**
 * Chat message role
 */
export type MessageRole = "system" | "user" | "assistant";

/**
 * Chat message format (OpenAI-compatible)
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Citation from search results
 */
export interface Citation {
  url: string;
  title?: string;
  snippet?: string;
}

/**
 * Perplexity API request options
 */
export interface PerplexityRequestOptions {
  model?: PerplexityModel;
  temperature?: number;
  max_tokens?: number;
  return_citations?: boolean;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: SearchRecencyFilter;
  search_domain_filter?: string[];
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

/**
 * Perplexity API request body
 */
export interface PerplexityRequest {
  model: PerplexityModel;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  return_citations?: boolean;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: SearchRecencyFilter;
  search_domain_filter?: string[];
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

/**
 * Perplexity API response (OpenAI-compatible)
 */
export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  images?: string[];
  related_questions?: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
}

/**
 * Simplified research response
 */
export interface ResearchResult {
  content: string;
  citations?: string[];
  images?: string[];
  relatedQuestions?: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Error response from Perplexity API
 */
export interface PerplexityError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// ============================================================================
// CONFIG
// ============================================================================

const API_URL = SERVICES.perplexity.apiUrl;
const DEFAULT_MODEL = SERVICES.perplexity.defaultModel;
const CACHE_TTL = SERVICES.perplexity.cacheMinutes * 60 * 1000;

// Simple in-memory cache for research queries
let cache: Map<string, { data: ResearchResult; timestamp: number }> = new Map();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate cache key from messages and options
 */
function getCacheKey(
  messages: ChatMessage[],
  options?: PerplexityRequestOptions
): string {
  const messagesStr = JSON.stringify(messages);
  const optionsStr = JSON.stringify(options || {});
  return `${messagesStr}-${optionsStr}`;
}

/**
 * Check if Perplexity is configured
 */
export function isPerplexityConfigured(): boolean {
  return !!process.env.PERPLEXITY_API_KEY;
}

/**
 * Get API key from environment
 */
function getApiKey(): string | undefined {
  return process.env.PERPLEXITY_API_KEY;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Make a request to the Perplexity API
 */
async function callPerplexityAPI(
  messages: ChatMessage[],
  options?: PerplexityRequestOptions
): Promise<PerplexityResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Perplexity API key not configured");
  }

  const requestBody: PerplexityRequest = {
    model: options?.model || DEFAULT_MODEL,
    messages,
    temperature: options?.temperature,
    max_tokens: options?.max_tokens,
    return_citations: options?.return_citations ?? true,
    return_images: options?.return_images ?? false,
    return_related_questions: options?.return_related_questions ?? false,
    search_recency_filter: options?.search_recency_filter,
    search_domain_filter: options?.search_domain_filter,
    top_p: options?.top_p,
    frequency_penalty: options?.frequency_penalty,
    presence_penalty: options?.presence_penalty,
    stream: options?.stream ?? false,
  };

  // Add timeout protection for external API calls
  const FETCH_TIMEOUT_MS = 30000; // 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await safeFetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: PerplexityError = await response.json();
      throw new Error(
        errorData.error?.message || `Perplexity API error: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Perform AI research with real-time web search
 *
 * @param messages - Chat messages (system + user prompts)
 * @param options - Optional configuration for the request
 * @param useCache - Whether to use caching (default: true)
 * @returns Research result with content and citations
 *
 * @example
 * ```ts
 * const result = await research([
 *   { role: "system", content: "You are a helpful research assistant." },
 *   { role: "user", content: "What are the latest React 19 features?" }
 * ], {
 *   model: "llama-3.1-sonar-large-128k-online",
 *   return_citations: true,
 *   search_recency_filter: "week"
 * });
 *
 * console.warn(result.content);
 * console.warn(result.citations);
 * ```
 */
export async function research(
  messages: ChatMessage[],
  options?: PerplexityRequestOptions,
  useCache = true
): Promise<ResearchResult> {
  if (!isPerplexityConfigured()) {
    throw new Error("Perplexity API key not configured");
  }

  // Check cache
  if (useCache) {
    const cacheKey = getCacheKey(messages, options);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  // Make API request
  try {
    const response = await callPerplexityAPI(messages, options);

    const result: ResearchResult = {
      content: response.choices[0]?.message?.content || "",
      citations: response.citations,
      images: response.images,
      relatedQuestions: response.related_questions,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };

    // Update cache
    if (useCache) {
      const cacheKey = getCacheKey(messages, options);
      cache.set(cacheKey, { data: result, timestamp: Date.now() });

      // Cleanup old cache entries (keep last 100)
      if (cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) cache.delete(oldestKey);
      }
    }

    return result;
  } catch (error) {
    console.error("Perplexity API error:", error);
    throw error;
  }
}

/**
 * Quick research helper - single user query
 */
export async function quickResearch(
  query: string,
  options?: PerplexityRequestOptions
): Promise<ResearchResult> {
  return research(
    [
      {
        role: "system",
        content: "You are a helpful research assistant that provides accurate, well-cited information.",
      },
      { role: "user", content: query },
    ],
    options
  );
}

/**
 * Clear the research cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
