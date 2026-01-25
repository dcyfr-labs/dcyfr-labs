{/* TLP:CLEAR */}

/**
 * Enhanced Activity Feed with Social Media Integration
 * 
 * Updated activity feed system that incorporates LinkedIn activity,
 * scheduled posts, and cross-platform posting into the unified timeline.
 */

import { ActivityItem, ActivitySource, ActivityVerb } from "@/lib/activity/types";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import { getLinkedInActivity } from "@/inngest/linkedin-functions";
import { redis } from "@/lib/redis";
import type { SocialActivityItem } from "@/lib/activity/social-types";

// ============================================================================
// ENHANCED SOURCE MAPPING
// ============================================================================

/**
 * Extended source icons including social media platforms
 */
export const ENHANCED_SOURCE_ICONS = {
  ...SOURCE_ICONS, // Your existing icons
  linkedin: () => import("lucide-react").then(m => m.Linkedin),
  twitter: () => import("lucide-react").then(m => m.Twitter),
  "social-scheduled": () => import("lucide-react").then(m => m.Clock),
  "social-cross-post": () => import("lucide-react").then(m => m.Share2),
};

/**
 * Extended source colors for social media
 */
export const ENHANCED_SOURCE_COLORS = {
  ...ACTIVITY_SOURCE_COLORS, // Your existing colors
  linkedin: {
    icon: "text-blue-600",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  twitter: {
    icon: "text-sky-600",
    text: "text-sky-700",
    bg: "bg-sky-50",
  },
  "social-scheduled": {
    icon: "text-orange-600",
    text: "text-orange-700",
    bg: "bg-orange-50",
  },
  "social-cross-post": {
    icon: "text-purple-600",
    text: "text-purple-700",
    bg: "bg-purple-50",
  },
};

/**
 * Extended source labels
 */
export const ENHANCED_SOURCE_LABELS = {
  ...ACTIVITY_SOURCE_LABELS, // Your existing labels
  linkedin: "LinkedIn",
  twitter: "Twitter",
  "social-scheduled": "Scheduled Post",
  "social-cross-post": "Social Media",
};

// ============================================================================
// SOCIAL ACTIVITY FETCHERS
// ============================================================================

/**
 * Fetch scheduled posts activity
 */
async function getScheduledPostsActivity(): Promise<SocialActivityItem[]> {
  if (!redis) return [];
  
  try {
    const scheduledItems = await redis.lrange("activity:social:scheduled", 0, 49);
    return scheduledItems.map(item => JSON.parse(item));
  } catch (error) {
    console.error("Error fetching scheduled posts activity:", error);
    return [];
  }
}

/**
 * Fetch posted social activity
 */
async function getPostedSocialActivity(): Promise<SocialActivityItem[]> {
  if (!redis) return [];
  
  try {
    const postedItems = await redis.lrange("activity:social:posted", 0, 49);
    return postedItems.map(item => JSON.parse(item));
  } catch (error) {
    console.error("Error fetching posted social activity:", error);
    return [];
  }
}

// ============================================================================
// ENHANCED ACTIVITY BUILDER
// ============================================================================

/**
 * Build enhanced activity feed with social media integration
 */
export async function buildEnhancedActivityFeed(limit: number = 50): Promise<SocialActivityItem[]> {
  // Fetch all activity sources in parallel
  const [
    // Existing sources
    blogActivities,
    projectActivities,
    changelogActivities,
    
    // Social media sources
    linkedInActivities,
    scheduledPostsActivities,
    postedSocialActivities,
  ] = await Promise.all([
    // Transform existing content (simplified - use your existing logic)
    Promise.resolve(posts.filter(p => !p.draft).slice(0, 20).map(transformPostToActivity)),
    Promise.resolve(projects.filter(p => !p.hidden).slice(0, 10).map(transformProjectToActivity)),
    Promise.resolve(changelog.filter(e => e.visible !== false).slice(0, 10).map(transformChangelogToActivity)),
    
    // Social media activities
    getLinkedInActivity(),
    getScheduledPostsActivity(),
    getPostedSocialActivity(),
  ]);
  
  // Combine all activities
  const allActivities = [
    ...blogActivities,
    ...projectActivities,
    ...changelogActivities,
    ...linkedInActivities,
    ...scheduledPostsActivities,
    ...postedSocialActivities,
  ];
  
  // Sort by timestamp (newest first) and apply limit
  return allActivities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Transform existing content to social activity format (simplified examples)
 */
function transformPostToActivity(post: any): SocialActivityItem {
  return {
    id: `blog-${post.slug}`,
    source: "blog" as ActivitySource,
    verb: "published" as ActivityVerb,
    title: post.title,
    description: post.excerpt || post.description,
    timestamp: new Date(post.publishedDate),
    href: `/blog/${post.slug}`,
    meta: {
      tags: post.tags,
      readingTime: post.readingTime,
      category: post.category,
    },
  } as SocialActivityItem;
}

function transformProjectToActivity(project: any): SocialActivityItem {
  return {
    id: `project-${project.slug}`,
    source: "project" as ActivitySource,
    verb: "launched" as ActivityVerb,
    title: project.title,
    description: project.description,
    timestamp: new Date(project.createdAt || project.updatedAt),
    href: `/work#${project.slug}`,
    meta: {
      tags: project.technologies,
      status: project.status,
      category: project.category,
    },
  } as SocialActivityItem;
}

function transformChangelogToActivity(entry: any): SocialActivityItem {
  return {
    id: `changelog-${entry.version}`,
    source: "changelog" as ActivitySource,
    verb: entry.type === "major" ? "released" : "updated" as ActivityVerb,
    title: `v${entry.version}: ${entry.title}`,
    description: entry.description,
    timestamp: new Date(entry.date),
    href: `/changelog#${entry.version}`,
    meta: {
      version: entry.version,
      category: entry.type,
    },
  } as SocialActivityItem;
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Activity feed API route with social media support
 * 
 * Usage in: src/app/api/activity/route.ts
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const source = url.searchParams.get("source") as ActivitySource | null;
    const includeSocial = url.searchParams.get("includeSocial") !== "false";
    
    let activities: SocialActivityItem[];
    
    if (includeSocial) {
      activities = await buildEnhancedActivityFeed(limit);
    } else {
      // Fallback to existing activity feed
      activities = await buildOriginalActivityFeed(limit);
    }
    
    // Filter by source if specified
    if (source) {
      activities = activities.filter(activity => activity.source === source);
    }
    
    return Response.json({
      success: true,
      activities: activities.slice(0, limit),
      total: activities.length,
      includeSocial,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Activity API error:", error);
    return Response.json(
      { 
        success: false, 
        error: "Failed to fetch activities",
        includeSocial: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Social media activity API route
 * 
 * Usage in: src/app/api/activity/social/route.ts
 */
export async function getSocialActivityAPI(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform") as "linkedin" | "twitter" | null;
    const type = url.searchParams.get("type") as "scheduled" | "posted" | "all";
    
    let activities: SocialActivityItem[] = [];
    
    switch (type) {
      case "scheduled":
        activities = await getScheduledPostsActivity();
        break;
      case "posted":
        activities = await getPostedSocialActivity();
        break;
      case "all":
      default:
        const [linkedin, scheduled, posted] = await Promise.all([
          getLinkedInActivity(),
          getScheduledPostsActivity(),
          getPostedSocialActivity(),
        ]);
        activities = [...linkedin, ...scheduled, ...posted];
        break;
    }
    
    // Filter by platform if specified
    if (platform && activities.length > 0) {
      activities = activities.filter(activity => 
        activity.social?.platform === platform || 
        (activity.source === "social-scheduled" && 
         (activity.meta as any)?.platforms?.includes(platform))
      );
    }
    
    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return Response.json({
      success: true,
      activities: activities.slice(0, 50),
      platform,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Social activity API error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch social activities" },
      { status: 500 }
    );
  }
}

// ============================================================================
// ADMIN INTERFACE HELPERS
// ============================================================================

/**
 * Get social media posting statistics
 */
export async function getSocialMediaStats(): Promise<{
  totalScheduled: number;
  totalPosted: number;
  platformBreakdown: Record<string, number>;
  recentActivity: SocialActivityItem[];
}> {
  try {
    const [scheduled, posted] = await Promise.all([
      getScheduledPostsActivity(),
      getPostedSocialActivity(),
    ]);
    
    // Platform breakdown
    const platformBreakdown: Record<string, number> = {};
    [...scheduled, ...posted].forEach(activity => {
      const platform = activity.social?.platform || "unknown";
      platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
    });
    
    // Recent activity (last 10 items)
    const recentActivity = [...scheduled, ...posted]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
    
    return {
      totalScheduled: scheduled.length,
      totalPosted: posted.length,
      platformBreakdown,
      recentActivity,
    };
  } catch (error) {
    console.error("Error getting social media stats:", error);
    return {
      totalScheduled: 0,
      totalPosted: 0,
      platformBreakdown: {},
      recentActivity: [],
    };
  }
}

// ============================================================================
// COMPONENT USAGE EXAMPLES
// ============================================================================

/**
 * Example usage in ActivityFeed component
 * 
 * ```tsx
 * import { buildEnhancedActivityFeed } from "@/lib/enhanced-activity";
 * 
 * export default async function ActivityPage() {
 *   const activities = await buildEnhancedActivityFeed(50);
 *   
 *   return (
 *     <ActivityFeed
 *       items={activities}
 *       variant="standard"
 *       showGroups
 *       viewAllHref="/activity"
 *     />
 *   );
 * }
 * ```
 */

/**
 * Example usage in social media dashboard
 * 
 * ```tsx
 * import { getSocialMediaStats } from "@/lib/enhanced-activity";
 * 
 * export default async function SocialDashboard() {
 *   const stats = await getSocialMediaStats();
 *   
 *   return (
 *     <div>
 *       <h2>Social Media Overview</h2>
 *       <p>Scheduled: {stats.totalScheduled}</p>
 *       <p>Posted: {stats.totalPosted}</p>
 *       
 *       <h3>Platform Breakdown</h3>
 *       {Object.entries(stats.platformBreakdown).map(([platform, count]) => (
 *         <p key={platform}>{platform}: {count}</p>
 *       ))}
 *       
 *       <ActivityFeed items={stats.recentActivity} variant="compact" limit={5} />
 *     </div>
 *   );
 * }
 * ```
 */

export default {
  buildEnhancedActivityFeed,
  getSocialActivityAPI,
  getSocialMediaStats,
  ENHANCED_SOURCE_ICONS,
  ENHANCED_SOURCE_COLORS,
  ENHANCED_SOURCE_LABELS,
};