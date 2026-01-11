/**
 * Semantic Scholar MCP Server
 * Provides AI assistants with access to academic paper data via Semantic Scholar API
 *
 * Features:
 * - 1 req/sec rate limiting with request queuing
 * - Multi-layer caching (in-memory + Redis)
 * - Bulk search with pagination support
 * - Citation and reference network exploration
 * - Author search and profiles
 *
 * Tools:
 * - scholar:searchPapers - Search academic papers with advanced filters
 * - scholar:getPaper - Get detailed paper information by ID
 * - scholar:getPaperBatch - Get multiple papers in one request (up to 500)
 * - scholar:getCitations - Get papers citing a specific paper
 * - scholar:getReferences - Get papers referenced by a paper
 * - scholar:searchAuthors - Search for authors
 * - scholar:getAuthor - Get author profile and metrics
 * - scholar:getAuthorPapers - Get author's publications
 * - scholar:getRecommendations - Get recommended papers based on seed papers
 *
 * Resources:
 * - scholar://cache-stats - Cache performance metrics
 * - scholar://rate-limit-status - Request queue and API usage stats
 * - scholar://recent-queries - Last 20 search queries with timestamps
 */

import { FastMCP } from "fastmcp";
import { z } from "zod";
import { redis } from "./shared/redis-client.js";
import { RateLimiter } from "./shared/rate-limiter.js";
import {
  scholarPapersCache,
  scholarSearchCache,
  scholarAuthorsCache,
} from "./shared/cache.js";
import {
  handleToolError,
  logToolExecution,
  measurePerformance,
} from "./shared/utils.js";
import type {
  ScholarPaper,
  ScholarAuthor,
  ScholarCitation,
  ScholarReference,
  ScholarSearchResult,
  ScholarBulkSearchResult,
  ScholarAuthorSearchResult,
  ScholarRecommendation,
  ScholarCacheStats,
} from "./shared/types.js";

// ============================================================================
// Configuration & Constants
// ============================================================================

const API_BASE_URL = "https://api.semanticscholar.org/graph/v1";
const RECOMMENDATIONS_BASE_URL =
  "https://api.semanticscholar.org/recommendations/v1";

const API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;

if (!API_KEY) {
  console.warn(
    "⚠️  SEMANTIC_SCHOLAR_API_KEY not set. API requests will use shared rate limit pool."
  );
  console.warn(
    "   Get your API key at: https://www.semanticscholar.org/product/api"
  );
}

// Rate limiter: 1 request per second (enforced by API)
const rateLimiter = new RateLimiter(1);

// Redis cache TTLs (seconds)
const CACHE_TTL = {
  PAPER: 90 * 24 * 60 * 60, // 90 days (papers rarely change)
  SEARCH: 7 * 24 * 60 * 60, // 7 days
  AUTHOR: 30 * 24 * 60 * 60, // 30 days
  CITATIONS: 24 * 60 * 60, // 1 day (citation counts change)
  REFERENCES: 90 * 24 * 60 * 60, // 90 days (references don't change)
};

// Default fields to request from API
const DEFAULT_PAPER_FIELDS = [
  "paperId",
  "corpusId",
  "title",
  "abstract",
  "venue",
  "year",
  "publicationDate",
  "citationCount",
  "influentialCitationCount",
  "referenceCount",
  "authors",
  "fieldsOfStudy",
  "openAccessPdf",
  "externalIds",
  "url",
  "tldr",
];

const DEFAULT_AUTHOR_FIELDS = [
  "authorId",
  "name",
  "affiliations",
  "homepage",
  "paperCount",
  "citationCount",
  "hIndex",
  "url",
];

// Track recent queries for analytics
const recentQueries: Array<{
  query: string;
  type: string;
  timestamp: number;
  cached: boolean;
}> = [];

// ============================================================================
// Server Configuration
// ============================================================================

const server = new FastMCP({
  name: "dcyfr-semantic-scholar",
  version: "1.0.0",
  instructions:
    "Provides access to academic paper data from Semantic Scholar. Enforces 1 req/sec rate limit with intelligent caching. Use for paper search, citation analysis, author profiles, and research recommendations.",
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Make rate-limited API request to Semantic Scholar
 */
async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  return rateLimiter.enqueue(async () => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Semantic Scholar API error (${response.status}): ${errorText}`
      );
    }

    return response.json() as Promise<T>;
  });
}

/**
 * Get cached paper from Redis or in-memory cache
 */
async function getCachedPaper(paperId: string): Promise<ScholarPaper | null> {
  // Check in-memory cache first
  const hot = scholarPapersCache.get(`paper:${paperId}`);
  if (hot) {
    return hot as ScholarPaper;
  }

  // Check Redis
  const cached = await redis.get(`scholar:paper:${paperId}`);
  if (cached) {
    const paper = JSON.parse(cached as string) as ScholarPaper;
    scholarPapersCache.set(`paper:${paperId}`, paper); // Promote to hot cache
    return paper;
  }

  return null;
}

/**
 * Cache paper in both Redis and in-memory
 */
async function cachePaper(paper: ScholarPaper): Promise<void> {
  scholarPapersCache.set(`paper:${paper.paperId}`, paper);
  await redis.setEx(
    `scholar:paper:${paper.paperId}`,
    CACHE_TTL.PAPER,
    JSON.stringify(paper)
  );
}

/**
 * Track query for analytics
 */
function trackQuery(query: string, type: string, cached: boolean): void {
  recentQueries.unshift({
    query,
    type,
    timestamp: Date.now(),
    cached,
  });

  // Keep only last 20 queries
  if (recentQueries.length > 20) {
    recentQueries.pop();
  }
}

// ============================================================================
// Tool 1: Search Papers
// ============================================================================

server.addTool({
  name: "scholar:searchPapers",
  description:
    "Search for academic papers on Semantic Scholar. Supports advanced filters for year, venue, field of study, citation count, and open access. Returns up to 100 results per query with pagination support.",
  parameters: z.object({
    query: z.string().describe("Search query (supports boolean operators)"),
    year: z
      .string()
      .optional()
      .describe('Publication year range (e.g., "2020-", "2015-2020")'),
    venue: z.string().optional().describe("Publication venue filter"),
    fieldsOfStudy: z
      .array(z.string())
      .optional()
      .describe("Filter by field (e.g., Computer Science, Medicine, Biology)"),
    minCitationCount: z
      .number()
      .optional()
      .describe("Minimum citation count filter"),
    openAccessPdf: z
      .boolean()
      .optional()
      .describe("Only return papers with open access PDFs"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Number of results (1-100, default 10)"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (
    args: {
      query: string;
      year?: string;
      venue?: string;
      fieldsOfStudy?: string[];
      minCitationCount?: number;
      openAccessPdf?: boolean;
      limit?: number;
      offset?: number;
    },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        // Build cache key
        const cacheKey = `search:${JSON.stringify(args)}`;
        const hotCached = scholarSearchCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached search results");
          trackQuery(args.query, "searchPapers", true);
          return hotCached;
        }

        // Check Redis cache
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarSearchCache.set(cacheKey, parsed);
          trackQuery(args.query, "searchPapers", true);
          return parsed;
        }

        // Build query parameters
        const params = new URLSearchParams({
          query: args.query,
          fields: DEFAULT_PAPER_FIELDS.join(","),
          limit: String(args.limit || 10),
          offset: String(args.offset || 0),
        });

        if (args.year) params.append("year", args.year);
        if (args.venue) params.append("venue", args.venue);
        if (args.fieldsOfStudy)
          params.append("fieldsOfStudy", args.fieldsOfStudy.join(","));
        if (args.minCitationCount)
          params.append("minCitationCount", String(args.minCitationCount));
        if (args.openAccessPdf !== undefined)
          params.append("openAccessPdf", String(args.openAccessPdf));

        // Make API request
        const searchResult = await makeApiRequest<ScholarSearchResult>(
          `/paper/search?${params.toString()}`
        );

        // Cache individual papers
        for (const paper of searchResult.data) {
          await cachePaper(paper);
        }

        // Cache search results
        scholarSearchCache.set(cacheKey, searchResult);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.SEARCH,
          JSON.stringify(searchResult)
        );

        trackQuery(args.query, "searchPapers", false);

        return searchResult;
      }, "searchPapers");

      logToolExecution("scholar:searchPapers", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:searchPapers", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 2: Get Paper Details
// ============================================================================

server.addTool({
  name: "scholar:getPaper",
  description:
    "Get detailed information about a specific paper by ID. Supports multiple ID formats: Semantic Scholar ID, DOI, ArXiv ID, PubMed ID, Corpus ID, or URL. Returns full metadata including abstract, citations, references, and authors.",
  parameters: z.object({
    paperId: z
      .string()
      .describe(
        "Paper ID (supports: S2 ID, DOI, ArXiv, PubMed, CorpusId, or URL)"
      ),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { paperId: string }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        // Check cache first
        const cached = await getCachedPaper(args.paperId);
        if (cached) {
          log.info("Returning cached paper");
          trackQuery(args.paperId, "getPaper", true);
          return cached;
        }

        // Fetch from API
        const paper = await makeApiRequest<ScholarPaper>(
          `/paper/${encodeURIComponent(args.paperId)}?fields=${DEFAULT_PAPER_FIELDS.join(",")}`
        );

        // Cache the paper
        await cachePaper(paper);

        trackQuery(args.paperId, "getPaper", false);

        return paper;
      }, "getPaper");

      logToolExecution("scholar:getPaper", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getPaper", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 3: Get Paper Batch
// ============================================================================

server.addTool({
  name: "scholar:getPaperBatch",
  description:
    "Get detailed information for multiple papers in a single request. More efficient than multiple individual requests. Supports up to 500 paper IDs. Use for bulk paper lookups or building citation networks.",
  parameters: z.object({
    paperIds: z
      .array(z.string())
      .max(500)
      .describe("Array of paper IDs (max 500)"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { paperIds: string[] }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        // Check which papers are cached
        const cachedPapers: ScholarPaper[] = [];
        const uncachedIds: string[] = [];

        for (const paperId of args.paperIds) {
          const cached = await getCachedPaper(paperId);
          if (cached) {
            cachedPapers.push(cached);
          } else {
            uncachedIds.push(paperId);
          }
        }

        log.info(
          `Found ${cachedPapers.length} cached, fetching ${uncachedIds.length} from API`
        );

        // Fetch uncached papers
        let fetchedPapers: ScholarPaper[] = [];
        if (uncachedIds.length > 0) {
          const response = await makeApiRequest<ScholarPaper[]>(
            `/paper/batch?fields=${DEFAULT_PAPER_FIELDS.join(",")}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ids: uncachedIds }),
            }
          );

          fetchedPapers = response;

          // Cache fetched papers
          for (const paper of fetchedPapers) {
            if (paper) {
              await cachePaper(paper);
            }
          }
        }

        trackQuery(
          `batch:${args.paperIds.length}`,
          "getPaperBatch",
          cachedPapers.length === args.paperIds.length
        );

        return [...cachedPapers, ...fetchedPapers];
      }, "getPaperBatch");

      logToolExecution("scholar:getPaperBatch", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getPaperBatch", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 4: Get Citations
// ============================================================================

server.addTool({
  name: "scholar:getCitations",
  description:
    "Get papers that cite a specific paper. Includes citation contexts (snippets where the paper is cited), citation intents (why it was cited), and influential citation flags. Supports pagination for papers with many citations.",
  parameters: z.object({
    paperId: z.string().describe("Paper ID to get citations for"),
    limit: z
      .number()
      .optional()
      .default(100)
      .describe("Number of citations to return (max 1000)"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (
    args: { paperId: string; limit?: number; offset?: number },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `citations:${args.paperId}:${args.offset || 0}:${args.limit || 100}`;
        const hotCached = scholarPapersCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached citations");
          trackQuery(args.paperId, "getCitations", true);
          return hotCached;
        }

        // Check Redis
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarPapersCache.set(cacheKey, parsed);
          trackQuery(args.paperId, "getCitations", true);
          return parsed;
        }

        // Fetch from API
        const params = new URLSearchParams({
          fields: DEFAULT_PAPER_FIELDS.join(","),
          limit: String(args.limit || 100),
          offset: String(args.offset || 0),
        });

        const response = await makeApiRequest<{
          offset: number;
          next?: number;
          data: ScholarCitation[];
        }>(
          `/paper/${encodeURIComponent(args.paperId)}/citations?${params.toString()}`
        );

        // Cache individual citing papers
        for (const citation of response.data) {
          if (citation.citingPaper) {
            await cachePaper(citation.citingPaper);
          }
        }

        // Cache citations result
        scholarPapersCache.set(cacheKey, response);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.CITATIONS,
          JSON.stringify(response)
        );

        trackQuery(args.paperId, "getCitations", false);

        return response;
      }, "getCitations");

      logToolExecution("scholar:getCitations", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getCitations", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 5: Get References
// ============================================================================

server.addTool({
  name: "scholar:getReferences",
  description:
    "Get papers referenced (cited) by a specific paper. Includes reference contexts and influential reference flags. Useful for understanding the foundation of a paper's research.",
  parameters: z.object({
    paperId: z.string().describe("Paper ID to get references for"),
    limit: z
      .number()
      .optional()
      .default(100)
      .describe("Number of references to return (max 1000)"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (
    args: { paperId: string; limit?: number; offset?: number },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `references:${args.paperId}:${args.offset || 0}:${args.limit || 100}`;
        const hotCached = scholarPapersCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached references");
          trackQuery(args.paperId, "getReferences", true);
          return hotCached;
        }

        // Check Redis
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarPapersCache.set(cacheKey, parsed);
          trackQuery(args.paperId, "getReferences", true);
          return parsed;
        }

        // Fetch from API
        const params = new URLSearchParams({
          fields: DEFAULT_PAPER_FIELDS.join(","),
          limit: String(args.limit || 100),
          offset: String(args.offset || 0),
        });

        const response = await makeApiRequest<{
          offset: number;
          next?: number;
          data: ScholarReference[];
        }>(
          `/paper/${encodeURIComponent(args.paperId)}/references?${params.toString()}`
        );

        // Cache individual referenced papers
        for (const reference of response.data) {
          if (reference.citedPaper) {
            await cachePaper(reference.citedPaper);
          }
        }

        // Cache references result
        scholarPapersCache.set(cacheKey, response);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.REFERENCES,
          JSON.stringify(response)
        );

        trackQuery(args.paperId, "getReferences", false);

        return response;
      }, "getReferences");

      logToolExecution("scholar:getReferences", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getReferences", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 6: Search Authors
// ============================================================================

server.addTool({
  name: "scholar:searchAuthors",
  description:
    "Search for authors by name. Returns author profiles with paper counts, citation counts, and h-index metrics. Use for finding researcher profiles or building collaboration networks.",
  parameters: z.object({
    query: z.string().describe("Author name to search for"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Number of results (1-100, default 10)"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (
    args: { query: string; limit?: number; offset?: number },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `author-search:${args.query}:${args.offset || 0}:${args.limit || 10}`;
        const hotCached = scholarAuthorsCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached author search results");
          trackQuery(args.query, "searchAuthors", true);
          return hotCached;
        }

        // Check Redis
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarAuthorsCache.set(cacheKey, parsed);
          trackQuery(args.query, "searchAuthors", true);
          return parsed;
        }

        // Fetch from API
        const params = new URLSearchParams({
          query: args.query,
          fields: DEFAULT_AUTHOR_FIELDS.join(","),
          limit: String(args.limit || 10),
          offset: String(args.offset || 0),
        });

        const response = await makeApiRequest<ScholarAuthorSearchResult>(
          `/author/search?${params.toString()}`
        );

        // Cache search results
        scholarAuthorsCache.set(cacheKey, response);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.SEARCH,
          JSON.stringify(response)
        );

        // Cache individual authors
        for (const author of response.data) {
          scholarAuthorsCache.set(`author:${author.authorId}`, author);
          await redis.setEx(
            `scholar:author:${author.authorId}`,
            CACHE_TTL.AUTHOR,
            JSON.stringify(author)
          );
        }

        trackQuery(args.query, "searchAuthors", false);

        return response;
      }, "searchAuthors");

      logToolExecution("scholar:searchAuthors", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:searchAuthors", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 7: Get Author Details
// ============================================================================

server.addTool({
  name: "scholar:getAuthor",
  description:
    "Get detailed profile for a specific author including affiliations, paper count, citation metrics, h-index, and homepage. Use for author verification or impact analysis.",
  parameters: z.object({
    authorId: z.string().describe("Semantic Scholar author ID"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (args: { authorId: string }, { log }: { log: any }) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        // Check cache
        const cacheKey = `author:${args.authorId}`;
        const hotCached = scholarAuthorsCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached author");
          trackQuery(args.authorId, "getAuthor", true);
          return hotCached;
        }

        // Check Redis
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarAuthorsCache.set(cacheKey, parsed);
          trackQuery(args.authorId, "getAuthor", true);
          return parsed;
        }

        // Fetch from API
        const author = await makeApiRequest<ScholarAuthor>(
          `/author/${encodeURIComponent(args.authorId)}?fields=${DEFAULT_AUTHOR_FIELDS.join(",")}`
        );

        // Cache author
        scholarAuthorsCache.set(cacheKey, author);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.AUTHOR,
          JSON.stringify(author)
        );

        trackQuery(args.authorId, "getAuthor", false);

        return author;
      }, "getAuthor");

      logToolExecution("scholar:getAuthor", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getAuthor", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 8: Get Author Papers
// ============================================================================

server.addTool({
  name: "scholar:getAuthorPapers",
  description:
    "Get publications by a specific author. Supports filtering by publication year and pagination for prolific authors. Returns full paper metadata for each publication.",
  parameters: z.object({
    authorId: z.string().describe("Semantic Scholar author ID"),
    year: z
      .string()
      .optional()
      .describe('Filter by year (e.g., "2020-", "2015-2020")'),
    limit: z
      .number()
      .optional()
      .default(100)
      .describe("Number of papers to return (max 1000)"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
  },
  execute: async (
    args: {
      authorId: string;
      year?: string;
      limit?: number;
      offset?: number;
    },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `author-papers:${args.authorId}:${args.year || "all"}:${args.offset || 0}:${args.limit || 100}`;
        const hotCached = scholarAuthorsCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached author papers");
          trackQuery(args.authorId, "getAuthorPapers", true);
          return hotCached;
        }

        // Check Redis
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarAuthorsCache.set(cacheKey, parsed);
          trackQuery(args.authorId, "getAuthorPapers", true);
          return parsed;
        }

        // Build params
        const params = new URLSearchParams({
          fields: DEFAULT_PAPER_FIELDS.join(","),
          limit: String(args.limit || 100),
          offset: String(args.offset || 0),
        });

        if (args.year) {
          params.append("publicationDateOrYear", args.year);
        }

        // Fetch from API
        const response = await makeApiRequest<{
          offset: number;
          next?: number;
          data: ScholarPaper[];
        }>(
          `/author/${encodeURIComponent(args.authorId)}/papers?${params.toString()}`
        );

        // Cache individual papers
        for (const paper of response.data) {
          await cachePaper(paper);
        }

        // Cache result
        scholarAuthorsCache.set(cacheKey, response);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.AUTHOR,
          JSON.stringify(response)
        );

        trackQuery(args.authorId, "getAuthorPapers", false);

        return response;
      }, "getAuthorPapers");

      logToolExecution("scholar:getAuthorPapers", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getAuthorPapers", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Tool 9: Get Recommendations
// ============================================================================

server.addTool({
  name: "scholar:getRecommendations",
  description:
    "Get paper recommendations based on one or more seed papers. Uses Semantic Scholar's recommendation algorithm to find related and relevant papers. Supports both positive examples (papers you like) and negative examples (papers to avoid).",
  parameters: z.object({
    positivePaperIds: z
      .array(z.string())
      .describe("Paper IDs to base recommendations on (what you want)"),
    negativePaperIds: z
      .array(z.string())
      .optional()
      .describe("Paper IDs to avoid in recommendations (optional)"),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Number of recommendations (1-500, default 10)"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (
    args: {
      positivePaperIds: string[];
      negativePaperIds?: string[];
      limit?: number;
    },
    { log }: { log: any }
  ) => {
    try {
      const { result, durationMs } = await measurePerformance(async () => {
        const cacheKey = `recommendations:${JSON.stringify(args)}`;
        const hotCached = scholarPapersCache.get(cacheKey);

        if (hotCached) {
          log.info("Returning cached recommendations");
          trackQuery(
            `rec:${args.positivePaperIds.length}`,
            "getRecommendations",
            true
          );
          return hotCached;
        }

        // Check Redis
        const redisCached = await redis.get(`scholar:${cacheKey}`);
        if (redisCached) {
          const parsed = JSON.parse(redisCached as string);
          scholarPapersCache.set(cacheKey, parsed);
          trackQuery(
            `rec:${args.positivePaperIds.length}`,
            "getRecommendations",
            true
          );
          return parsed;
        }

        // Build request body
        const body: {
          positivePaperIds: string[];
          negativePaperIds?: string[];
          limit?: number;
        } = {
          positivePaperIds: args.positivePaperIds,
          limit: args.limit || 10,
        };

        if (args.negativePaperIds && args.negativePaperIds.length > 0) {
          body.negativePaperIds = args.negativePaperIds;
        }

        // Fetch from Recommendations API
        const url = `${RECOMMENDATIONS_BASE_URL}/papers/`;
        const response = await rateLimiter.enqueue(async () => {
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };

          if (API_KEY) {
            headers["x-api-key"] = API_KEY;
          }

          const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              `Recommendations API error (${res.status}): ${errorText}`
            );
          }

          return res.json() as Promise<ScholarRecommendation>;
        });

        // Cache individual recommended papers
        for (const paper of response.recommendedPapers) {
          await cachePaper(paper);
        }

        // Cache recommendations
        scholarPapersCache.set(cacheKey, response);
        await redis.setEx(
          `scholar:${cacheKey}`,
          CACHE_TTL.SEARCH,
          JSON.stringify(response)
        );

        trackQuery(
          `rec:${args.positivePaperIds.length}`,
          "getRecommendations",
          false
        );

        return response;
      }, "getRecommendations");

      logToolExecution("scholar:getRecommendations", args, true, durationMs);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      logToolExecution("scholar:getRecommendations", args, false);
      return handleToolError(error);
    }
  },
});

// ============================================================================
// Resource 1: Cache Statistics
// ============================================================================

server.addResource({
  uri: "scholar://cache-stats",
  name: "Cache Performance Statistics",
  mimeType: "application/json",
  description:
    "Cache hit/miss rates and performance metrics for the Semantic Scholar MCP",
  async load() {
    try {
      const stats: ScholarCacheStats = {
        papers: scholarPapersCache.getStats(),
        searches: scholarSearchCache.getStats(),
        authors: scholarAuthorsCache.getStats(),
        hitRate: 0,
        missRate: 0,
      };

      const totalRequests =
        stats.papers.total + stats.searches.total + stats.authors.total;
      const totalValid =
        stats.papers.valid + stats.searches.valid + stats.authors.valid;
      const totalExpired =
        stats.papers.expired + stats.searches.expired + stats.authors.expired;

      if (totalRequests > 0) {
        stats.hitRate = Math.round((totalValid / totalRequests) * 100);
        stats.missRate = Math.round(
          ((totalExpired + (totalRequests - totalValid - totalExpired)) /
            totalRequests) *
            100
        );
      }

      return { text: JSON.stringify(stats, null, 2) };
    } catch (error) {
      return { text: handleToolError(error) };
    }
  },
});

// ============================================================================
// Resource 2: Rate Limit Status
// ============================================================================

server.addResource({
  uri: "scholar://rate-limit-status",
  name: "Rate Limit and Queue Status",
  mimeType: "application/json",
  description:
    "Current request queue status and rate limiter statistics for API usage monitoring",
  async load() {
    try {
      const stats = rateLimiter.getStats();

      const status = {
        queueLength: stats.queueLength,
        totalRequests: stats.totalRequests,
        rejectedRequests: stats.rejectedRequests,
        averageWaitTime: `${stats.averageWaitTime}ms`,
        lastRequestTime: new Date(stats.lastRequestTime).toISOString(),
        rateLimit: "1 request/second",
        apiKeyConfigured: !!API_KEY,
      };

      return { text: JSON.stringify(status, null, 2) };
    } catch (error) {
      return { text: handleToolError(error) };
    }
  },
});

// ============================================================================
// Resource 3: Recent Queries
// ============================================================================

server.addResource({
  uri: "scholar://recent-queries",
  name: "Recent Search Queries",
  mimeType: "application/json",
  description:
    "Last 20 queries executed through the Semantic Scholar MCP with cache hit information",
  async load() {
    try {
      const queries = recentQueries.map((q) => ({
        ...q,
        timestamp: new Date(q.timestamp).toISOString(),
      }));

      return { text: JSON.stringify(queries, null, 2) };
    } catch (error) {
      return { text: handleToolError(error) };
    }
  },
});

// ============================================================================
// Start Server
// ============================================================================

server.start({
  transportType: "stdio",
});

console.warn("✅ Semantic Scholar MCP Server started (stdio mode)");
console.warn(
  `   Rate Limit: 1 req/sec | API Key: ${API_KEY ? "configured" : "NOT SET"}`
);
