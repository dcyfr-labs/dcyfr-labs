/**
 * Blog RSS 2.0 Feed
 * 
 * Provides an RSS 2.0 feed of blog posts.
 * Available at: /blog/rss.xml
 */

import { NextResponse } from "next/server";
import { posts } from "@/data/posts";
import { buildBlogFeed } from "@/lib/feeds";

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const xml = await buildBlogFeed(posts, "rss", 20);
    
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating blog RSS feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
