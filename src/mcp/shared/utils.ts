/**
 * Shared utilities for MCP servers
 * Common functions used across Analytics, Design Token, and Content Manager MCPs
 */

import type { MCPError } from "./types";

// ============================================================================
// Error Handling
// ============================================================================

export class MCPToolError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "MCPToolError";
  }

  toJSON(): MCPError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export function handleToolError(error: unknown): string {
  if (error instanceof MCPToolError) {
    return `Error [${error.code}]: ${error.message}`;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}

// ============================================================================
// Environment Helpers
// ============================================================================

export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "development"
  );
}

export function getEnvironment(): "production" | "preview" | "development" {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV as "production" | "preview" | "development";
  }

  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "development") return "development";

  return "development";
}

// ============================================================================
// Data Filtering
// ============================================================================

/**
 * Filters out test/demo data in production environments
 */
export function filterProductionData<T extends { isTest?: boolean }>(
  items: T[],
): T[] {
  if (!isProduction()) {
    return items;
  }

  // In production, exclude test data
  return items.filter((item) => !item.isTest);
}

/**
 * Warns if using fallback/demo data in production
 */
export function warnProductionFallback(dataSource: string): void {
  if (isProduction()) {
    console.error(
      `❌ CRITICAL: Using demo/fallback data in production (${dataSource})`,
    );
  }
}

// ============================================================================
// Time Helpers
// ============================================================================

export function getTimeRangeMs(
  range: "1h" | "24h" | "7d" | "30d" | "all",
): number {
  const now = Date.now();

  switch (range) {
    case "1h":
      return 60 * 60 * 1000; // 1 hour
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
    case "all":
      return now; // All time
    default:
      return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
  }
}

export function isWithinTimeRange(
  timestamp: number,
  range: "1h" | "24h" | "7d" | "30d" | "all",
): boolean {
  if (range === "all") return true;

  const now = Date.now();
  const rangeMs = getTimeRangeMs(range);

  return now - timestamp <= rangeMs;
}

// ============================================================================
// String Helpers
// ============================================================================

export function sanitizePath(path: string): string {
  // Remove leading/trailing slashes, normalize
  return path.replace(/^\/+|\/+$/g, "").toLowerCase();
}

export function extractSlug(filePath: string): string {
  // Extract slug from file path (e.g., "blog/my-post.mdx" -> "my-post")
  const parts = filePath.split("/");
  const fileName = parts[parts.length - 1] || "";
  return fileName.replace(/\.(mdx?|tsx?)$/, "");
}

export function calculateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

// ============================================================================
// Array Helpers
// ============================================================================

export function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function sortByProperty<T>(
  items: T[],
  property: keyof T,
  direction: "asc" | "desc" = "desc",
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });
}

export function limitResults<T>(items: T[], limit?: number): T[] {
  if (!limit || limit <= 0) return items;
  return items.slice(0, limit);
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidPath(path: string): boolean {
  // Basic validation: starts with /, contains no special chars except - and _
  return /^\/[\w\-\/]*$/.test(path);
}

// ============================================================================
// Performance Helpers
// ============================================================================

export async function measurePerformance<T>(
  operation: () => Promise<T>,
  label: string,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await operation();
  const durationMs = performance.now() - start;

  if (durationMs > 500) {
    console.warn(
      `⚠️ Performance warning: ${label} took ${durationMs.toFixed(2)}ms`,
    );
  }

  return { result, durationMs };
}

// ============================================================================
// Logging Helpers
// ============================================================================

export function logToolExecution(
  toolName: string,
  params: Record<string, unknown>,
  success: boolean,
  durationMs?: number,
): void {
  const status = success ? "✅" : "❌";
  const duration = durationMs ? ` (${durationMs.toFixed(2)}ms)` : "";

  console.warn(`${status} ${toolName}`, params, duration);
}
