/**
 * RSS Feed Generation Utilities
 *
 * Generates RSS 2.0 compliant XML feeds for the activity timeline.
 * Supports all activity types with proper metadata and formatting.
 *
 * @see https://www.rssboard.org/rss-specification
 */

import type { ActivityItem } from "./types";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";

// ============================================================================
// RSS FEED METADATA
// ============================================================================

export interface RSSFeedConfig {
  title: string;
  description: string;
  link: string;
  language: string;
  copyright: string;
  ttl: number; // Minutes until refresh
  maxItems?: number; // Optional limit for feed size
}

const DEFAULT_CONFIG: RSSFeedConfig = {
  title: `${AUTHOR_NAME}'s Activity Feed`,
  description:
    "Real-time timeline of blog posts, project updates, trending content, milestones, and GitHub activity.",
  link: `${SITE_URL}/activity`,
  language: "en-US",
  copyright: `© ${new Date().getFullYear()} ${AUTHOR_NAME}`,
  ttl: 60, // Refresh every hour
  maxItems: 100, // Limit to 100 most recent items
};

// ============================================================================
// XML ESCAPING
// ============================================================================

/**
 * Escape XML special characters to prevent malformed feeds
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert ActivityItem to RSS-safe description HTML
 */
function formatDescription(item: ActivityItem): string {
  const parts: string[] = [];

  // Add description if available
  if (item.description) {
    parts.push(`<p>${escapeXML(item.description)}</p>`);
  }

  // Add metadata badges
  const badges: string[] = [];
  
  if (item.meta?.readingTime) {
    badges.push(`📖 ${escapeXML(item.meta.readingTime)}`);
  }
  
  if (item.meta?.stats?.views !== undefined) {
    badges.push(`👁️ ${item.meta.stats.views.toLocaleString()} views`);
  }
  
  if (item.meta?.stats?.comments !== undefined && item.meta.stats.comments > 0) {
    badges.push(`💬 ${item.meta.stats.comments} comments`);
  }

  if (item.meta?.milestone) {
    badges.push(`🎯 ${item.meta.milestone.toLocaleString()} milestone`);
  }

  if (item.meta?.stats?.stars !== undefined) {
    badges.push(`⭐ ${item.meta.stats.stars} stars`);
  }

  if (badges.length > 0) {
    parts.push(`<p><small>${badges.join(" · ")}</small></p>`);
  }

  // Add tags if available
  if (item.meta?.tags && item.meta.tags.length > 0) {
    const tagList = item.meta.tags.map((tag) => `#${escapeXML(tag)}`).join(" ");
    parts.push(`<p><small>${tagList}</small></p>`);
  }

  return parts.join("\n");
}

/**
 * Get activity verb as human-readable label
 */
function getVerbLabel(verb: ActivityItem["verb"]): string {
  const labels: Record<ActivityItem["verb"], string> = {
    published: "Published",
    updated: "Updated",
    launched: "Launched",
    released: "Released",
    committed: "Committed",
    reached: "Reached",
    achieved: "Achieved",
    earned: "Earned",
  };
  return labels[verb] || verb;
}

/**
 * Get activity source as category label
 */
function getCategoryLabel(source: ActivityItem["source"]): string {
  const labels: Record<ActivityItem["source"], string> = {
    blog: "Blog Post",
    project: "Project",
    github: "GitHub",
    changelog: "Site Update",
    milestone: "Milestone",
    trending: "Trending",
    engagement: "High Engagement",
    certification: "Certification",
    analytics: "Analytics",
    "github-traffic": "GitHub Traffic",
    seo: "SEO Achievement",
  };
  return labels[source] || source;
}

// ============================================================================
// RSS ITEM GENERATION
// ============================================================================

/**
 * Generate RSS <item> element for a single activity
 */
function generateRSSItem(item: ActivityItem): string {
  const title = `${getVerbLabel(item.verb)}: ${escapeXML(item.title)}`;
  const link = item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`;
  const description = formatDescription(item);
  const category = getCategoryLabel(item.source);
  const pubDate = new Date(item.timestamp).toUTCString();
  const guid = item.id;

  return `
    <item>
      <title>${title}</title>
      <link>${escapeXML(link)}</link>
      <description><![CDATA[${description}]]></description>
      <category>${escapeXML(category)}</category>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${escapeXML(guid)}</guid>
    </item>`;
}

// ============================================================================
// RSS FEED GENERATION
// ============================================================================

/**
 * Generate complete RSS 2.0 feed from activity items
 */
export function generateRSSFeed(
  items: ActivityItem[],
  config: Partial<RSSFeedConfig> = {}
): string {
  const feedConfig = { ...DEFAULT_CONFIG, ...config };
  const buildDate = new Date().toUTCString();

  // Limit items if configured
  const feedItems =
    feedConfig.maxItems && items.length > feedConfig.maxItems
      ? items.slice(0, feedConfig.maxItems)
      : items;

  // Generate all RSS items
  const rssItems = feedItems.map(generateRSSItem).join("\n");

  // Get latest publish date for lastBuildDate
  const latestItem = feedItems[0];
  const lastBuildDate = latestItem
    ? new Date(latestItem.timestamp).toUTCString()
    : buildDate;

  // Generate complete RSS feed
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(feedConfig.title)}</title>
    <link>${escapeXML(feedConfig.link)}</link>
    <description>${escapeXML(feedConfig.description)}</description>
    <language>${feedConfig.language}</language>
    <copyright>${escapeXML(feedConfig.copyright)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>${feedConfig.ttl}</ttl>
    <atom:link href="${escapeXML(SITE_URL)}/activity/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;
}

/**
 * Filter activities for RSS feed (exclude some activity types)
 */
export function filterActivitiesForRSS(items: ActivityItem[]): ActivityItem[] {
  // Include all activity types in RSS feed
  // Future: Could add exclude list if certain types should be feed-only
  return items;
}
