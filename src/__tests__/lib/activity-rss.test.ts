/**
 * @vitest-environment node
 */

import { describe, it, expect } from "vitest";
import { generateRSSFeed, filterActivitiesForRSS } from "@/lib/activity";
import type { ActivityItem } from "@/lib/activity";

// ============================================================================
// TEST DATA
// ============================================================================

const mockActivities: ActivityItem[] = [
  {
    id: "blog-test-post",
    source: "blog",
    verb: "published",
    title: "Test Blog Post",
    description: "A test blog post description with <special> characters & symbols",
    href: "/blog/test-post",
    timestamp: new Date("2025-12-23T12:00:00Z"),
    meta: {
      tags: ["testing", "rss"],
      readingTime: "5 min",
      stats: {
        views: 1234,
        comments: 5,
      },
    },
  },
  {
    id: "project-test-app",
    source: "project",
    verb: "launched",
    title: "Test App",
    description: "Test application",
    href: "/work/test-app",
    timestamp: new Date("2025-12-22T12:00:00Z"),
    meta: {
      stats: {
        stars: 42,
      },
    },
  },
  {
    id: "milestone-views",
    source: "milestone",
    verb: "reached",
    title: "10K Views Milestone",
    description: "Reached 10,000 total views",
    href: "/activity",
    timestamp: new Date("2025-12-21T12:00:00Z"),
    meta: {
      milestone: 10000,
    },
  },
];

// ============================================================================
// RSS FEED GENERATION TESTS
// ============================================================================

describe("generateRSSFeed", () => {
  it("generates valid RSS 2.0 XML structure", () => {
    const feed = generateRSSFeed(mockActivities);

    // Check XML declaration
    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');

    // Check channel elements
    expect(feed).toContain("<channel>");
    expect(feed).toContain("</channel>");
    expect(feed).toContain("</rss>");
  });

  it("includes required RSS channel metadata", () => {
    const feed = generateRSSFeed(mockActivities);

    expect(feed).toContain("<title>");
    expect(feed).toContain("<link>");
    expect(feed).toContain("<description>");
    expect(feed).toContain("<language>en-US</language>");
    expect(feed).toContain("<copyright>");
    expect(feed).toContain("<lastBuildDate>");
    expect(feed).toContain("<pubDate>");
    expect(feed).toContain("<ttl>60</ttl>");
  });

  it("includes atom:link for self-reference", () => {
    const feed = generateRSSFeed(mockActivities);

    expect(feed).toContain('<atom:link href=');
    expect(feed).toContain('/activity/rss.xml');
    expect(feed).toContain('rel="self"');
    expect(feed).toContain('type="application/rss+xml"');
  });

  it("generates RSS items for all activities", () => {
    const feed = generateRSSFeed(mockActivities);

    // Should have 3 items
    const itemMatches = feed.match(/<item>/g);
    expect(itemMatches).toHaveLength(3);

    // Check item content
    expect(feed).toContain("Test Blog Post");
    expect(feed).toContain("Test App");
    expect(feed).toContain("10K Views Milestone");
  });

  it("properly escapes XML special characters", () => {
    const feed = generateRSSFeed(mockActivities);

    // Special characters should be escaped
    expect(feed).toContain("&lt;special&gt;");
    expect(feed).toContain("&amp;");
    expect(feed).not.toContain("<special>");
  });

  it("includes activity metadata in descriptions", () => {
    const feed = generateRSSFeed(mockActivities);

    // Should include reading time
    expect(feed).toContain("📖 5 min");

    // Should include view count
    expect(feed).toContain("👁️ 1,234 views");

    // Should include comments
    expect(feed).toContain("💬 5 comments");

    // Should include stars
    expect(feed).toContain("⭐ 42 stars");

    // Should include milestone
    expect(feed).toContain("🎯 10,000 milestone");
  });

  it("includes tags in item descriptions", () => {
    const feed = generateRSSFeed(mockActivities);

    expect(feed).toContain("#testing");
    expect(feed).toContain("#rss");
  });

  it("formats activity verbs as human-readable labels", () => {
    const feed = generateRSSFeed(mockActivities);

    expect(feed).toContain("Published: Test Blog Post");
    expect(feed).toContain("Launched: Test App");
    expect(feed).toContain("Reached: 10K Views Milestone");
  });

  it("categorizes items by source type", () => {
    const feed = generateRSSFeed(mockActivities);

    expect(feed).toContain("<category>Blog Post</category>");
    expect(feed).toContain("<category>Project</category>");
    expect(feed).toContain("<category>Milestone</category>");
  });

  it("includes proper pubDate formatting", () => {
    const feed = generateRSSFeed(mockActivities);

    // Should have RFC 2822 formatted dates
    expect(feed).toMatch(/<pubDate>[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4}/);
  });

  it("includes guid for each item", () => {
    const feed = generateRSSFeed(mockActivities);

    expect(feed).toContain('<guid isPermaLink="false">blog-test-post</guid>');
    expect(feed).toContain('<guid isPermaLink="false">project-test-app</guid>');
    expect(feed).toContain('<guid isPermaLink="false">milestone-views</guid>');
  });

  it("handles absolute URLs correctly", () => {
    const absoluteActivity: ActivityItem = {
      id: "external-link",
      source: "blog",
      verb: "published",
      title: "External Post",
      description: "External",
      href: "https://example.com/post",
      timestamp: new Date("2025-12-23T12:00:00Z"),
    };

    const feed = generateRSSFeed([absoluteActivity]);

    expect(feed).toContain("<link>https://example.com/post</link>");
  });

  it("respects maxItems configuration", () => {
    const feed = generateRSSFeed(mockActivities, { maxItems: 2 });

    const itemMatches = feed.match(/<item>/g);
    expect(itemMatches).toHaveLength(2);
  });

  it("handles empty activities array", () => {
    const feed = generateRSSFeed([]);

    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain("<channel>");
    expect(feed).not.toContain("<item>");
  });

  it("handles activities without optional metadata", () => {
    const minimalActivity: ActivityItem = {
      id: "minimal",
      source: "changelog",
      verb: "updated",
      title: "Minimal Activity",
      description: "No metadata",
      href: "/changelog",
      timestamp: new Date("2025-12-23T12:00:00Z"),
    };

    const feed = generateRSSFeed([minimalActivity]);

    expect(feed).toContain("Minimal Activity");
    expect(feed).not.toContain("📖"); // No reading time
    expect(feed).not.toContain("👁️"); // No views
  });

  it("uses custom feed configuration", () => {
    const feed = generateRSSFeed(mockActivities, {
      title: "Custom Feed Title",
      description: "Custom description",
      ttl: 120,
    });

    expect(feed).toContain("<title>Custom Feed Title</title>");
    expect(feed).toContain("<description>Custom description</description>");
    expect(feed).toContain("<ttl>120</ttl>");
  });
});

// ============================================================================
// RSS FEED FILTERING TESTS
// ============================================================================

describe("filterActivitiesForRSS", () => {
  it("returns all activities by default", () => {
    const filtered = filterActivitiesForRSS(mockActivities);
    expect(filtered).toHaveLength(3);
    expect(filtered).toEqual(mockActivities);
  });

  it("maintains activity order", () => {
    const filtered = filterActivitiesForRSS(mockActivities);
    expect(filtered[0].id).toBe("blog-test-post");
    expect(filtered[1].id).toBe("project-test-app");
    expect(filtered[2].id).toBe("milestone-views");
  });

  it("handles empty array", () => {
    const filtered = filterActivitiesForRSS([]);
    expect(filtered).toHaveLength(0);
  });
});
