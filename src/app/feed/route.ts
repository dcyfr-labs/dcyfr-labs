/**
 * Unified Site Feed (RSS 2.0)
 * 
 * Provides a combined feed of blog posts and projects.
 * Available at: /feed
 * 
 * Uses RSS 2.0 as the default format for maximum compatibility.
 * RSS has wider support across feed readers than Atom.
 * 
 * For specific formats:
 * - /feed (RSS 2.0 - default, widest support)
 * - /atom.xml (Atom 1.0)
 * - /feed.json (JSON Feed 1.1)
 * 
 * @see src/lib/feeds.ts for feed generation logic
 */

import { NextResponse } from "next/server";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { buildCombinedFeed } from "@/lib/feeds";

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    // Default to RSS 2.0 for maximum compatibility
    const xml = await buildCombinedFeed(posts, projects, "rss", 20);
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Feed-Format": "RSS 2.0",
      },
    });
  } catch (error) {
    console.error("Error generating combined feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
