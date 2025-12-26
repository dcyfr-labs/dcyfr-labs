/**
 * Activity Feed (RSS 2.0)
 * 
 * Comprehensive feed combining blog posts, projects, and changelog updates.
 * Available at: /activity/feed
 * 
 * Uses RSS 2.0 as the default format for maximum compatibility.
 * Content is sanitized to remove accessibility and footnote attributes
 * that cause feed validation issues.
 * 
 * Updates more frequently than other feeds (30 min revalidation) since
 * activity content changes more dynamically.
 * 
 * For specific formats:
 * - /activity/feed (RSS 2.0 - default)
 * - /activity/rss.xml (RSS 2.0)
 * - /activity/feed.json (JSON Feed 1.1)
 * 
 * @see src/lib/feeds.ts for feed generation logic
 */

import { NextRequest, NextResponse } from "next/server";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import { buildActivityFeed } from "@/lib/feeds";

// Make this route dynamic to allow content negotiation via Accept header
export const dynamic = "force-dynamic";

// Higher update frequency for activity feed (30 minutes)
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  try {
    // Check Accept header for format preference (auto-detection)
    const acceptHeader = request.headers.get("accept") || "";
    const prefersJson = acceptHeader.includes("application/json") || 
                       acceptHeader.includes("application/feed+json");
    
    if (prefersJson) {
      // Serve JSON Feed format
      const json = await buildActivityFeed(posts, projects, changelog, "json", 50);
      
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/feed+json; charset=utf-8",
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      });
    }
    
    // Default to RSS 2.0 for maximum compatibility
    const xml = await buildActivityFeed(posts, projects, changelog, "rss", 50);
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "X-Feed-Format": "RSS 2.0",
      },
    });
  } catch (error) {
    console.error("Error generating activity feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
