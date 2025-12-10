/**
 * Activity Source Transformers
 *
 * Functions to transform different content types into unified ActivityItem format.
 * Each transformer handles source-specific logic and normalizes data.
 */

import type { Post } from "@/data/posts";
import type { Project, ProjectCategory } from "@/data/projects";
import type { ChangelogEntry, ChangelogType } from "@/data/changelog";
import type { ActivityItem, TimeGroup, ActivityVerb, ActivitySource } from "./types";

/**
 * NOTE: This file contains only synchronous transformers that are safe for client components.
 * Async transformers that require Redis/Node APIs are in sources.server.ts
 */

// ============================================================================
// BLOG POST TRANSFORMER
// ============================================================================

/**
 * Transform blog posts into activity items
 * Basic version without view counts (use transformPostsWithViews from sources.server.ts for enriched data)
 */
export function transformPosts(posts: Post[]): ActivityItem[] {
  return posts
    .filter((p) => !p.archived && !p.draft)
    .map((post) => ({
      id: `blog-${post.id}`,
      source: "blog" as const,
      verb: (post.updatedAt ? "updated" : "published") as ActivityVerb,
      title: post.title,
      description: post.summary,
      timestamp: new Date(post.updatedAt || post.publishedAt),
      href: `/blog/${post.slug}`,
      meta: {
        tags: post.tags.slice(0, 3),
        category: post.category,
        image: post.image
          ? { url: post.image.url, alt: post.image.alt }
          : undefined,
        readingTime: post.readingTime?.text,
      },
    }));
}

// ============================================================================
// PROJECT TRANSFORMER
// ============================================================================

/**
 * Category display names for projects
 */
const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  code: "Code",
  nonprofit: "Nonprofit",
  community: "Community",
  photography: "Photography",
  startup: "Startup",
};

/**
 * Transform projects into activity items
 */
export function transformProjects(projects: Project[]): ActivityItem[] {
  return projects.map((project) => ({
    id: `project-${project.slug}`,
    source: "project" as const,
    verb: "launched" as const,
    title: project.title,
    description: project.description,
    timestamp: parseProjectTimeline(project.timeline),
    href: `/portfolio/${project.slug}`,
    meta: {
      tags: project.tags?.slice(0, 3),
      category: project.category
        ? PROJECT_CATEGORY_LABELS[project.category]
        : undefined,
      image: project.image
        ? { url: project.image.url, alt: project.image.alt }
        : undefined,
      status: project.status,
    },
  }));
}

/**
 * Parse project timeline string to Date
 * Handles formats like "2024 → Present", "2019 → 2021"
 * Always uses the START year as the launch date
 */
function parseProjectTimeline(timeline?: string): Date {
  if (!timeline) return new Date();

  // Extract the start year (first 4-digit number)
  const match = timeline.match(/(\d{4})/);
  if (match) {
    // Use start year as launch date (January 1st of that year)
    return new Date(parseInt(match[1], 10), 0, 1);
  }

  return new Date();
}

// ============================================================================
// CHANGELOG TRANSFORMER
// ============================================================================

/**
 * Map changelog type to activity verb
 */
const CHANGELOG_TYPE_VERBS: Record<ChangelogType, ActivityVerb> = {
  feature: "launched",
  improvement: "updated",
  fix: "updated",
  milestone: "achieved",
};

/**
 * Transform changelog entries into activity items
 */
export function transformChangelog(entries: ChangelogEntry[]): ActivityItem[] {
  return entries.map((entry) => ({
    id: `changelog-${entry.id}`,
    source: "changelog" as const,
    verb: CHANGELOG_TYPE_VERBS[entry.type],
    title: entry.title,
    description: entry.description,
    timestamp: new Date(entry.date),
    href: entry.href || "/",
    meta: {
      category: entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
    },
  }));
}



// ============================================================================
// AGGREGATOR
// ============================================================================

/**
 * Options for aggregating activities
 */
export interface AggregateOptions {
  /** Maximum number of items to return */
  limit?: number;
  /** Filter by sources */
  sources?: ActivitySource[];
  /** Only include items after this date */
  after?: Date;
  /** Only include items before this date */
  before?: Date;
}

/**
 * Aggregate and sort activities from multiple sources
 */
export function aggregateActivities(
  items: ActivityItem[],
  options: AggregateOptions = {}
): ActivityItem[] {
  let result = [...items];

  // Filter by sources
  if (options.sources?.length) {
    result = result.filter((item) =>
      options.sources!.includes(item.source)
    );
  }

  // Filter by date range
  if (options.after) {
    result = result.filter((item) => item.timestamp >= options.after!);
  }
  if (options.before) {
    result = result.filter((item) => item.timestamp <= options.before!);
  }

  // Sort by timestamp (most recent first)
  result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

// ============================================================================
// TIME GROUPING UTILITIES
// ============================================================================

/**
 * Calculate time group for an activity based on timestamp
 * Uses calendar-based grouping (today, week Monday-Sunday, month boundaries)
 */
export function getTimeGroup(timestamp: Date): TimeGroup {
  const now = new Date();
  
  // Set time to start of day for comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const timestampStart = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
  
  // Get start of current week (Monday)
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
  weekStart.setHours(0, 0, 0, 0);
  
  // Get start of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Compare calendar periods
  if (timestampStart.getTime() === todayStart.getTime()) {
    return "today";
  }
  
  if (timestampStart >= weekStart && timestampStart < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
    return "this-week";
  }
  
  if (timestampStart.getFullYear() === now.getFullYear() && timestampStart.getMonth() === now.getMonth()) {
    return "this-month";
  }
  
  return "older";
}


/**
 * Group activities by time period
 */
export function groupActivitiesByTime(
  items: ActivityItem[]
): Map<TimeGroup, ActivityItem[]> {
  const groups = new Map<TimeGroup, ActivityItem[]>();

  for (const item of items) {
    const group = getTimeGroup(item.timestamp);
    const existing = groups.get(group) || [];
    existing.push(item);
    groups.set(group, existing);
  }

  return groups;
}

/**
 * Human-readable labels for time groups
 */
export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  older: "Earlier",
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format timestamp for display (relative time)
 */
export function formatActivityDate(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  
  // If timestamp is in the future (invalid), treat as "just now"
  if (diffMs < 0) return "Just now";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Format timestamp for accessibility (full date)
 */
export function formatActivityDateFull(timestamp: Date): string {
  return timestamp.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
