#!/usr/bin/env node
/**
 * Content Manager MCP Server
 *
 * Query and analyze MDX blog posts and project content for strategic insights.
 * AI assistants can discover content, analyze topics, and find related articles.
 *
 * @see docs/architecture/MCP_IMPLEMENTATION_PLAN.md - Phase 3
 */

import { FastMCP } from "fastmcp";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// Shared utilities
import { SimpleCache } from "./shared/cache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MCP server
const server = new FastMCP({
  name: "dcyfr-content",
  version: "1.0.0",
  instructions:
    "Query and analyze MDX blog posts and project content for dcyfr-labs. Use these tools to discover content, analyze topics, and find related articles.",
});

// Cache for content queries (5 minutes)
const contentCache = new SimpleCache<object>(300000);
const topicsCache = new SimpleCache<object>(300000);

// ============================================================================
// Content Discovery
// ============================================================================

interface ContentMetadata {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  category?: string;
  published?: boolean;
  wordCount?: number;
  readingTime?: number;
}

interface ContentItem {
  filePath: string;
  slug: string;
  type: "blog" | "project";
  metadata: ContentMetadata;
  excerpt?: string;
}

/**
 * Get all MDX content files
 */
async function getContentFiles(type: "blog" | "project"): Promise<string[]> {
  const contentDir = path.join(process.cwd(), "src", "content", type);

  try {
    const files = await fs.readdir(contentDir);
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => path.join(contentDir, file));
  } catch (error) {
    return [];
  }
}

/**
 * Parse MDX file and extract metadata
 */
async function parseContent(
  filePath: string,
  type: "blog" | "project"
): Promise<ContentItem | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { data, content: body } = matter(content);

    const slug = path.basename(filePath, ".mdx");
    const wordCount = body.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    return {
      filePath,
      slug,
      type,
      metadata: {
        title: data.title || slug,
        description: data.description,
        date: data.date,
        tags: data.tags || [],
        category: data.category,
        published: data.published !== false,
        wordCount,
        readingTime,
      },
      excerpt: body.slice(0, 200).trim() + "...",
    };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
    return null;
  }
}

/**
 * Query content with filters
 */
async function queryContent(
  type: "blog" | "project",
  query?: string,
  limit: number = 20
): Promise<ContentItem[]> {
  const cacheKey = `query:${type}:${query || "all"}:${limit}`;
  const cached = contentCache.get(cacheKey);
  if (cached) return cached as ContentItem[];

  const files = await getContentFiles(type);
  const items = await Promise.all(
    files.map((file) => parseContent(file, type))
  );

  let results = items.filter((item): item is ContentItem => item !== null);

  // Filter by query
  if (query) {
    const queryLower = query.toLowerCase();
    results = results.filter((item) => {
      const searchText = [
        item.metadata.title,
        item.metadata.description,
        item.metadata.tags?.join(" "),
        item.excerpt,
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(queryLower);
    });
  }

  // Sort by date (newest first)
  results.sort((a, b) => {
    const dateA = a.metadata.date ? new Date(a.metadata.date).getTime() : 0;
    const dateB = b.metadata.date ? new Date(b.metadata.date).getTime() : 0;
    return dateB - dateA;
  });

  const limited = results.slice(0, limit);
  contentCache.set(cacheKey, limited);

  return limited;
}

/**
 * Analyze content file
 */
async function analyzeContent(filePath: string): Promise<{
  metadata: ContentMetadata;
  analysis: {
    wordCount: number;
    readingTime: number;
    topics: string[];
    headings: string[];
    links: number;
  };
}> {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const content = await fs.readFile(fullPath, "utf-8");
  const { data, content: body } = matter(content);

  const wordCount = body.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Extract headings
  const headings = Array.from(body.matchAll(/^#{1,6}\s+(.+)$/gm)).map((match) =>
    match[1].trim()
  );

  // Count links
  const links = (body.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;

  // Extract topics from tags and headings
  const topics = [...(data.tags || []), ...headings.slice(0, 3)].filter(
    Boolean
  );

  return {
    metadata: {
      title: data.title,
      description: data.description,
      date: data.date,
      tags: data.tags,
      category: data.category,
      published: data.published !== false,
      wordCount,
      readingTime,
    },
    analysis: {
      wordCount,
      readingTime,
      topics,
      headings,
      links,
    },
  };
}

/**
 * Find related content
 */
async function findRelatedContent(
  filePath: string,
  limit: number = 5
): Promise<ContentItem[]> {
  const analyzed = await analyzeContent(filePath);
  const tags = analyzed.metadata.tags || [];

  // Determine type from file path
  const type = filePath.includes("/blog/") ? "blog" : "project";

  // Get all content
  const allContent = await queryContent(type);

  // Score by tag overlap
  const scored = allContent
    .filter((item) => item.filePath !== filePath)
    .map((item) => {
      const itemTags = item.metadata.tags || [];
      const overlap = tags.filter((tag) => itemTags.includes(tag)).length;
      return { item, score: overlap };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  return scored;
}

/**
 * Get topic taxonomy
 */
async function getTopicTaxonomy(
  type?: "blog" | "project"
): Promise<Record<string, number>> {
  const cacheKey = `topics:${type || "all"}`;
  const cached = topicsCache.get(cacheKey);
  if (cached) return cached as Record<string, number>;

  const types: ("blog" | "project")[] = type ? [type] : ["blog", "project"];
  const taxonomy: Record<string, number> = {};

  for (const t of types) {
    const content = await queryContent(t);

    for (const item of content) {
      const tags = item.metadata.tags || [];
      for (const tag of tags) {
        taxonomy[tag] = (taxonomy[tag] || 0) + 1;
      }
    }
  }

  topicsCache.set(cacheKey, taxonomy);
  return taxonomy;
}

// ============================================================================
// MCP Tools
// ============================================================================

// Tool 1: Query content
server.addTool({
  name: "content:query",
  description: "Search for blog posts or projects with optional query filter",
  parameters: z.object({
    type: z.enum(["blog", "project"]).describe("Content type to search"),
    query: z
      .string()
      .optional()
      .describe("Search query (searches title, description, tags, content)"),
    limit: z.number().default(20).describe("Maximum results to return"),
  }),
  execute: async ({ type, query, limit }) => {
    const results = await queryContent(type, query, limit);

    return {
      type: "text",
      text: JSON.stringify(
        {
          type,
          query: query || "all",
          count: results.length,
          results: results.map((item) => ({
            slug: item.slug,
            title: item.metadata.title,
            description: item.metadata.description,
            date: item.metadata.date,
            tags: item.metadata.tags,
            category: item.metadata.category,
            readingTime: item.metadata.readingTime,
            filePath: item.filePath.replace(process.cwd(), ""),
          })),
        },
        null,
        2
      ),
    };
  },
});

// Tool 2: Analyze content
server.addTool({
  name: "content:analyze",
  description: "Comprehensive analysis of a specific MDX content file",
  parameters: z.object({
    filePath: z.string().describe("Path to MDX file to analyze"),
  }),
  execute: async ({ filePath }) => {
    const analysis = await analyzeContent(filePath);

    return {
      type: "text",
      text: JSON.stringify(
        {
          filePath,
          ...analysis,
        },
        null,
        2
      ),
    };
  },
});

// Tool 3: Find related content
server.addTool({
  name: "content:findRelated",
  description: "Find content related to a specific article by tags and topics",
  parameters: z.object({
    filePath: z.string().describe("Path to reference content file"),
    limit: z.number().default(5).describe("Maximum related items to return"),
  }),
  execute: async ({ filePath, limit }) => {
    const related = await findRelatedContent(filePath, limit);

    return {
      type: "text",
      text: JSON.stringify(
        {
          filePath,
          relatedCount: related.length,
          related: related.map((item) => ({
            slug: item.slug,
            title: item.metadata.title,
            tags: item.metadata.tags,
            filePath: item.filePath.replace(process.cwd(), ""),
          })),
        },
        null,
        2
      ),
    };
  },
});

// Tool 4: Get topics
server.addTool({
  name: "content:getTopics",
  description: "Get topic taxonomy with content counts",
  parameters: z.object({
    type: z
      .enum(["blog", "project"])
      .optional()
      .describe("Filter by content type"),
  }),
  execute: async ({ type }) => {
    const taxonomy = await getTopicTaxonomy(type);

    const sorted = Object.entries(taxonomy)
      .sort(([, a], [, b]) => b - a)
      .map(([topic, count]) => ({ topic, count }));

    return {
      type: "text",
      text: JSON.stringify(
        {
          type: type || "all",
          totalTopics: sorted.length,
          topics: sorted,
        },
        null,
        2
      ),
    };
  },
});

// Tool 5: Search content
server.addTool({
  name: "content:search",
  description: "Full-text search across blog posts and projects",
  parameters: z.object({
    query: z.string().describe("Search query"),
    type: z
      .enum(["blog", "project"])
      .optional()
      .describe("Filter by content type"),
  }),
  execute: async ({ query, type }) => {
    const types: ("blog" | "project")[] = type ? [type] : ["blog", "project"];
    const results: ContentItem[] = [];

    for (const t of types) {
      const items = await queryContent(t, query, 50);
      results.push(...items);
    }

    // Re-sort combined results
    results.sort((a, b) => {
      const dateA = a.metadata.date ? new Date(a.metadata.date).getTime() : 0;
      const dateB = b.metadata.date ? new Date(b.metadata.date).getTime() : 0;
      return dateB - dateA;
    });

    return {
      type: "text",
      text: JSON.stringify(
        {
          query,
          type: type || "all",
          count: results.length,
          results: results.slice(0, 20).map((item) => ({
            type: item.type,
            slug: item.slug,
            title: item.metadata.title,
            description: item.metadata.description,
            excerpt: item.excerpt,
            tags: item.metadata.tags,
            filePath: item.filePath.replace(process.cwd(), ""),
          })),
        },
        null,
        2
      ),
    };
  },
});

// Tool 6: Validate frontmatter
server.addTool({
  name: "content:validateFrontmatter",
  description: "Validate MDX frontmatter against schema requirements",
  parameters: z.object({
    filePath: z.string().describe("Path to MDX file to validate"),
  }),
  execute: async ({ filePath }) => {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    const content = await fs.readFile(fullPath, "utf-8");
    const { data } = matter(content);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!data.title) errors.push("Missing required field: title");
    if (!data.date) errors.push("Missing required field: date");

    // Recommended fields
    if (!data.description)
      warnings.push("Recommended field missing: description");
    if (!data.tags || data.tags.length === 0)
      warnings.push("Recommended field missing: tags");

    // Validation
    if (data.date && isNaN(new Date(data.date).getTime())) {
      errors.push("Invalid date format");
    }

    return {
      type: "text",
      text: JSON.stringify(
        {
          filePath,
          isValid: errors.length === 0,
          errors,
          warnings,
          frontmatter: data,
        },
        null,
        2
      ),
    };
  },
});

// ============================================================================
// Start Server
// ============================================================================

server.start({ transportType: "stdio" }).catch((error) => {
  console.error("❌ Failed to start Content Manager MCP server:", error);
  process.exit(1);
});

console.error("✅ Content Manager MCP Server started (stdio mode)");
