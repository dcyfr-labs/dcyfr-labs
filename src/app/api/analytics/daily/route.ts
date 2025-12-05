import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";
import { posts } from "@/data/posts";

const redisUrl = process.env.REDIS_URL;
const VIEW_KEY_PREFIX = "views:post:";

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __dailyAnalyticsRedisClient: RedisClient | undefined;
}

async function getRedisClient(): Promise<RedisClient | null> {
  if (!redisUrl) {
    return null;
  }

  try {
    if (!global.__dailyAnalyticsRedisClient) {
      global.__dailyAnalyticsRedisClient = createClient({ url: redisUrl });
      await global.__dailyAnalyticsRedisClient.connect();
    }
    return global.__dailyAnalyticsRedisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return null;
  }
}

/**
 * GET /api/analytics/daily
 * 
 * Fetches daily view data for analytics charts
 * 
 * Query params:
 * - days: number of days to fetch (default: 30, max: 90)
 * - slug: optional post slug to fetch data for a specific post
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Array<{
 *     date: string,           // YYYY-MM-DD
 *     views: number,
 *     postSlug?: string       // included if filtering by slug
 *   }>,
 *   summary: {
 *     totalViews: number,
 *     averageViews: number,
 *     peakViews: number,
 *     peakDate: string
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const redis = await getRedisClient();
  
  if (!redis) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Analytics service unavailable",
        data: [],
        summary: { totalViews: 0, averageViews: 0, peakViews: 0, peakDate: null }
      },
      { status: 503 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const slugParam = searchParams.get("slug");
    
    // Validate and parse days parameter
    const days = Math.min(Math.max(parseInt(daysParam || "30"), 1), 90);
    
    // Generate date range
    const dates: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const dailyData: Array<{ date: string; views: number; postSlug?: string }> = [];

    if (slugParam) {
      // Fetch data for a specific post
      const post = posts.find(p => p.slug === slugParam);
      if (!post) {
        return NextResponse.json(
          { success: false, error: "Post not found" },
          { status: 404 }
        );
      }

      for (const date of dates) {
        // Use postId for daily view keys (consistent with Inngest tracking)
        const key = `${VIEW_KEY_PREFIX}${post.id}:day:${date}`;
        const views = await redis.get(key);
        dailyData.push({
          date,
          views: parseInt(views || "0"),
          postSlug: post.slug,
        });
      }
    } else {
      // Fetch aggregate data for all posts
      for (const date of dates) {
        let totalViews = 0;
        
        // Sum views across all posts for this date (using postId)
        for (const post of posts) {
          const key = `${VIEW_KEY_PREFIX}${post.id}:day:${date}`;
          const views = await redis.get(key);
          totalViews += parseInt(views || "0");
        }
        
        dailyData.push({ date, views: totalViews });
      }
    }

    // Calculate summary statistics
    const totalViews = dailyData.reduce((sum, d) => sum + d.views, 0);
    const averageViews = dailyData.length > 0 ? totalViews / dailyData.length : 0;
    const peakDay = dailyData.reduce((max, d) => d.views > max.views ? d : max, dailyData[0]);

    return NextResponse.json({
      success: true,
      data: dailyData,
      summary: {
        totalViews,
        averageViews: Math.round(averageViews),
        peakViews: peakDay?.views || 0,
        peakDate: peakDay?.date || null,
      },
      meta: {
        days,
        slug: slugParam || null,
        startDate: dates[0],
        endDate: dates[dates.length - 1],
      },
    });
  } catch (error) {
    console.error("Daily analytics error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch daily analytics",
        data: [],
        summary: { totalViews: 0, averageViews: 0, peakViews: 0, peakDate: null }
      },
      { status: 500 }
    );
  }
}
