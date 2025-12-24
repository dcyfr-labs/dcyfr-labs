/**
 * Activity Threading System
 *
 * Groups related activities into conversation-style threads (Threads-inspired UX).
 *
 * Threading Rules:
 * - Blog posts + their milestones (trending, views, engagement)
 * - Projects + related GitHub commits/releases
 * - Multiple GitHub commits on the same day
 * - Standalone activities (certifications, analytics, SEO, changelog)
 *
 * @example
 * ```ts
 * const threads = groupActivitiesIntoThreads(activities);
 * threads.forEach(thread => {
 *   console.log('Primary:', thread.primary.title);
 *   console.log('Replies:', thread.replies.length);
 * });
 * ```
 */

import type { ActivityItem, ActivitySource } from "./types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a threaded conversation of related activities
 */
export interface ActivityThread {
  /** Unique identifier (matches primary activity ID) */
  id: string;
  /** Main activity in the thread */
  primary: ActivityItem;
  /** Related activities (replies/updates) */
  replies: ActivityItem[];
  /** Number of collapsed replies (if replies > MAX_VISIBLE_REPLIES) */
  collapsedCount: number;
  /** Thread timestamp (from primary activity) */
  timestamp: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum replies to show before collapsing */
const MAX_VISIBLE_REPLIES = 5;

/** Maximum activities to check for relationships (performance limit) */
const MAX_RELATIONSHIP_SEARCH_WINDOW = 20;

/** Maximum days apart for activities to be considered related */
const MAX_DAYS_APART = 7;

/** Sources that can be primary activities in threads */
const PRIMARY_SOURCES: ActivitySource[] = ["blog", "project", "github"];

/** Sources that are typically replies/milestones */
const REPLY_SOURCES: ActivitySource[] = [
  "trending",
  "milestone",
  "engagement",
  "github",
];

// ============================================================================
// CORE THREADING ALGORITHM
// ============================================================================

/**
 * Groups activities into conversation-style threads
 *
 * Algorithm:
 * 1. Iterate through activities chronologically
 * 2. For each activity, check if it's a primary or standalone
 * 3. Search next N activities for related items (same post, project, repo)
 * 4. Group related items as "replies" to the primary
 * 5. Mark used activities to avoid duplicates
 *
 * @param activities - Flat list of activities (must be sorted by timestamp DESC)
 * @returns Array of threaded activities
 */
export function groupActivitiesIntoThreads(
  activities: ActivityItem[]
): ActivityThread[] {
  const threads: ActivityThread[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    // Skip if already used in a thread
    if (usedIds.has(activity.id)) {
      continue;
    }

    // Mark as used
    usedIds.add(activity.id);

    // Find related activities in the next N items
    const searchWindow = activities.slice(
      i + 1,
      i + 1 + MAX_RELATIONSHIP_SEARCH_WINDOW
    );

    const relatedActivities = findRelatedActivities(
      activity,
      searchWindow,
      usedIds
    );

    // Mark related activities as used
    relatedActivities.forEach((related) => usedIds.add(related.id));

    // Create thread
    const visibleReplies = relatedActivities.slice(0, MAX_VISIBLE_REPLIES);
    const collapsedCount = Math.max(
      0,
      relatedActivities.length - MAX_VISIBLE_REPLIES
    );

    threads.push({
      id: activity.id,
      primary: activity,
      replies: visibleReplies,
      collapsedCount,
      timestamp: activity.timestamp,
    });
  }

  return threads;
}

// ============================================================================
// RELATIONSHIP DETECTION
// ============================================================================

/**
 * Finds activities related to a primary activity
 *
 * Relationship rules:
 * - Blog post → trending/milestone/engagement with matching title
 * - Project → GitHub commits with matching repo or related releases
 * - GitHub commit → More commits on same day and same repo
 *
 * @param primary - The main activity to find relations for
 * @param candidates - Pool of activities to search through
 * @param usedIds - Set of already-used activity IDs to skip
 * @returns Array of related activities
 */
function findRelatedActivities(
  primary: ActivityItem,
  candidates: ActivityItem[],
  usedIds: Set<string>
): ActivityItem[] {
  const related: ActivityItem[] = [];

  for (const candidate of candidates) {
    // Skip if already used
    if (usedIds.has(candidate.id)) {
      continue;
    }

    // Skip if too far apart in time
    if (!isWithinTimeWindow(primary.timestamp, candidate.timestamp)) {
      continue;
    }

    // Check relationship based on primary's source
    const isRelated = checkRelationship(primary, candidate);

    if (isRelated) {
      related.push(candidate);
    }
  }

  return related;
}

/**
 * Checks if two activities are related based on their sources and metadata
 */
function checkRelationship(
  primary: ActivityItem,
  candidate: ActivityItem
): boolean {
  // Blog Post Thread: Blog + milestones
  if (primary.source === "blog") {
    return isBlogMilestone(primary, candidate);
  }

  // Project Thread: Project + commits/releases
  if (primary.source === "project") {
    return isProjectRelated(primary, candidate);
  }

  // GitHub Commit Thread: Same repo, same day
  if (primary.source === "github" && primary.verb === "committed") {
    return isCommitRelated(primary, candidate);
  }

  // No other threading rules
  return false;
}

/**
 * Checks if candidate is a milestone for a blog post
 * Matches on exact title or post ID in metadata
 */
function isBlogMilestone(
  blog: ActivityItem,
  candidate: ActivityItem
): boolean {
  // Must be a milestone-type source
  if (
    !["trending", "milestone", "engagement"].includes(candidate.source)
  ) {
    return false;
  }

  // Match by exact title (conservative approach)
  if (blog.title.toLowerCase() === candidate.title.toLowerCase()) {
    return true;
  }

  // Match by post ID in metadata (if available)
  const blogId = blog.meta?.id || blog.id;
  const candidateRef = candidate.meta?.postId || candidate.meta?.id;

  if (blogId && candidateRef && blogId === candidateRef) {
    return true;
  }

  return false;
}

/**
 * Checks if candidate is related to a project
 * Matches on repo name or project reference
 */
function isProjectRelated(
  project: ActivityItem,
  candidate: ActivityItem
): boolean {
  // GitHub commits related to project
  if (candidate.source === "github") {
    // Extract repo name from project title or metadata
    const projectRepo = extractRepoName(project.title) || project.meta?.repo;
    const candidateRepo = candidate.meta?.repo;

    if (projectRepo && candidateRepo) {
      return projectRepo === candidateRepo;
    }
  }

  // GitHub releases for same project
  if (candidate.source === "github" && candidate.verb === "released") {
    const projectName = project.title.toLowerCase();
    const releaseName = candidate.title.toLowerCase();
    return releaseName.includes(projectName) || projectName.includes(releaseName);
  }

  return false;
}

/**
 * Checks if candidate is a commit on the same repo and same day
 */
function isCommitRelated(
  primaryCommit: ActivityItem,
  candidate: ActivityItem
): boolean {
  // Must also be a commit
  if (candidate.source !== "github" || candidate.verb !== "committed") {
    return false;
  }

  // Must be same repository
  const primaryRepo = primaryCommit.meta?.repo;
  const candidateRepo = candidate.meta?.repo;

  if (!primaryRepo || !candidateRepo || primaryRepo !== candidateRepo) {
    return false;
  }

  // Must be same day
  return isSameDay(primaryCommit.timestamp, candidate.timestamp);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if two dates are within the threading time window
 */
function isWithinTimeWindow(date1: Date, date2: Date): boolean {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.abs((date1.getTime() - date2.getTime()) / msPerDay);
  return diffDays <= MAX_DAYS_APART;
}

/**
 * Checks if two dates are on the same calendar day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Extracts repository name from project title
 * E.g., "dcyfr-labs Portfolio" → "dcyfr-labs"
 */
function extractRepoName(title: string): string | null {
  // Common patterns:
  // - "repo-name: Description"
  // - "repo-name - Description"
  // - "repo-name Portfolio"

  const patterns = [
    /^([a-z0-9-]+):/i,        // "repo: description"
    /^([a-z0-9-]+)\s+-\s+/i,  // "repo - description"
    /^([a-z0-9-]+)\s+/i,      // "repo description"
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return null;
}

// ============================================================================
// HELPER FUNCTIONS FOR COMPONENTS
// ============================================================================

/**
 * Checks if an activity can be a thread primary
 * (Used by components to determine rendering style)
 */
export function canBeThreadPrimary(activity: ActivityItem): boolean {
  return PRIMARY_SOURCES.includes(activity.source);
}

/**
 * Checks if an activity is typically a reply/milestone
 * (Used by components for visual styling)
 */
export function isReplySource(activity: ActivityItem): boolean {
  return REPLY_SOURCES.includes(activity.source);
}

/**
 * Gets a thread summary text for collapsed replies
 * E.g., "2 more updates", "3 more commits"
 */
export function getCollapsedSummary(
  collapsedCount: number,
  primarySource: ActivitySource
): string {
  if (collapsedCount === 0) return "";

  const noun = primarySource === "github" ? "commit" : "update";
  const pluralNoun = collapsedCount === 1 ? noun : `${noun}s`;

  return `${collapsedCount} more ${pluralNoun}`;
}
