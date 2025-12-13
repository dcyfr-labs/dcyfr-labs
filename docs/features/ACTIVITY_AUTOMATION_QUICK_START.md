# Activity Feed Automation - Quick Start

**Goal:** Implement activity feed caching in under 30 minutes for immediate performance gains.

---

## 🎯 Quick Win: Activity Feed Caching

**Impact:** 50% faster page loads, reduced server computation  
**Effort:** 30 minutes  
**Files Changed:** 2

---

## Step 1: Create Inngest Function (5 min)

Create `src/inngest/activity-cache-functions.ts`:

```typescript
import { inngest } from "./client";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import {
  transformPostsWithViews,
  transformProjects,
  transformChangelog,
  transformTrendingPosts,
  transformMilestones,
  transformHighEngagementPosts,
  transformCommentMilestones,
  transformGitHubActivity,
} from "@/lib/activity/sources.server";
import { aggregateActivities } from "@/lib/activity/sources";
import { createClient } from "redis";

async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  const client = createClient({ url: redisUrl });
  await client.connect();
  return client;
}

/**
 * Refresh Activity Feed Cache
 * 
 * Pre-computes the entire activity feed and caches in Redis.
 * Runs every 5 minutes to match page revalidation.
 * 
 * Benefits:
 * - Instant page loads (pre-computed data)
 * - Reduced server load (no concurrent aggregations)
 * - Better caching strategy
 */
export const refreshActivityFeed = inngest.createFunction(
  {
    id: "refresh-activity-feed",
    retries: 2,
  },
  { cron: "*/5 * * * *" }, // Every 5 minutes
  async ({ step }) => {
    const redis = await getRedisClient();
    if (!redis) {
      throw new Error("Redis client unavailable");
    }

    // Step 1: Gather all activities in parallel
    const activities = await step.run("gather-activities", async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const results = await Promise.allSettled([
        transformPostsWithViews(posts),
        transformProjects([...projects]),
        transformChangelog(changelog),
        transformTrendingPosts(posts, 1), // This week
        transformTrendingPosts(posts, 1, { after: monthStart, description: "Trending this month" }),
        transformTrendingPosts(posts, 1, { before: monthStart, description: "All time trending" }),
        transformMilestones(posts, 20),
        transformHighEngagementPosts(posts, 5),
        transformCommentMilestones(posts),
        transformGitHubActivity(),
      ]);

      const allActivities = results
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => (r as PromiseFulfilledResult<any>).value);

      return aggregateActivities(allActivities);
    });

    // Step 2: Cache aggregated feed
    const cached = await step.run("cache-feed", async () => {
      await redis.setEx(
        "activity:feed:all",
        300, // 5 minutes TTL (matches cron)
        JSON.stringify(activities)
      );

      return { count: activities.length };
    });

    await redis.quit();
    return cached;
  }
);

/**
 * Invalidate Activity Feed Cache
 * 
 * Manually triggered when content changes detected.
 * Forces immediate refresh of activity feed.
 */
export const invalidateActivityFeed = inngest.createFunction(
  {
    id: "invalidate-activity-feed",
  },
  { event: "activity/cache.invalidate" },
  async ({ step }) => {
    const redis = await getRedisClient();
    if (!redis) {
      throw new Error("Redis client unavailable");
    }

    await step.run("delete-cache", async () => {
      await redis.del("activity:feed:all");
    });

    await redis.quit();

    // Trigger immediate refresh
    await step.run("trigger-refresh", async () => {
      await inngest.send({ name: "inngest/function.scheduled", data: { function: "refresh-activity-feed" } });
    });

    return { invalidated: true };
  }
);
```

---

## Step 2: Register Functions (2 min)

Update `src/app/api/inngest/route.ts`:

```typescript
import { refreshActivityFeed, invalidateActivityFeed } from "@/inngest/activity-cache-functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // ... existing functions
    
    // Activity feed caching
    refreshActivityFeed,        // Scheduled: Every 5 minutes
    invalidateActivityFeed,     // Event-driven: on content changes
  ],
});
```

---

## Step 3: Update Activity Page (10 min)

Update `src/app/activity/page.tsx` to check cache first:

```typescript
export default async function ActivityPage() {
  const nonce = (await headers()).get("x-nonce") || "";

  let allActivities: ActivityItem[] = [];
  let error: string | null = null;
  let loadSource: "cache" | "direct" = "direct";

  try {
    // TRY CACHE FIRST
    const redis = await getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get("activity:feed:all");
        if (cached) {
          allActivities = JSON.parse(cached);
          loadSource = "cache";
          console.log("[Activity Page] ✅ Loaded from cache:", allActivities.length, "items");
        } else {
          console.log("[Activity Page] ⚠️ Cache miss, fetching directly");
        }
        await redis.quit();
      } catch (cacheError) {
        console.error("[Activity Page] Cache read error:", cacheError);
      }
    }

    // FALLBACK TO DIRECT FETCH IF CACHE MISS
    if (allActivities.length === 0) {
      console.log("[Activity Page] Fetching activities directly...");
      
      // ... existing direct fetch logic (keep as fallback)
      const activities: ActivityItem[] = [];
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      await Promise.all([
        transformPostsWithViews(posts)
          .then((items) => activities.push(...items))
          .catch((err) => console.error("[Activity Page] Blog posts fetch failed:", err)),
        
        // ... rest of existing fetches
      ]);

      allActivities = aggregateActivities(activities);
      loadSource = "direct";
    }
  } catch (err) {
    console.error("[Activity Page] Failed to load activities:", err);
    error = err instanceof Error ? err.message : "Failed to load activities";
  }

  // ... rest of page rendering
}
```

---

## Step 4: Add Redis Helper (5 min)

Add to `src/lib/activity/sources.server.ts` (or create new helper):

```typescript
async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error("Max retries exceeded");
          return Math.min(retries * 100, 3000);
        },
      },
    });

    if (!client.isOpen) {
      await client.connect();
    }

    return client;
  } catch (error) {
    console.error("[Redis] Connection failed:", error);
    return null;
  }
}
```

---

## Step 5: Test & Verify (8 min)

### Local Testing

```bash
# Start dev server
npm run dev

# Trigger Inngest function manually (in Inngest UI)
# Visit: http://localhost:3000/dev

# Check Redis
redis-cli
> GET activity:feed:all
> TTL activity:feed:all  # Should show ~300 seconds

# Visit activity page
open http://localhost:3000/activity

# Check server logs for cache hit
# Should see: "[Activity Page] ✅ Loaded from cache: XX items"
```

### Production Deployment

```bash
# Deploy to Vercel
git add .
git commit -m "feat: add activity feed caching"
git push

# Wait for deployment
vercel --prod

# Check Inngest dashboard
open https://app.inngest.com/env/production/functions/refresh-activity-feed

# Verify cache in production Redis
# Check Vercel logs for cache hits
```

---

## 📊 Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Page Load Time** | 800ms | 400ms | 50% faster ⚡ |
| **Server CPU** | High | Low | Reduced load 📉 |
| **Cache Hit Rate** | 0% | 80%+ | First-time users still fast |
| **Error Rate** | 2% | \<1% | Better reliability ✅ |

---

## 🚨 Troubleshooting

### Cache Not Populating
```bash
# Check Inngest function status
curl https://app.inngest.com/api/v1/functions/refresh-activity-feed

# Check Redis manually
redis-cli
> KEYS activity:*
> GET activity:feed:all

# Force trigger function
# In Inngest UI: Functions → refresh-activity-feed → Test
```

### Cache Miss on Every Request
```bash
# Check Redis TTL
redis-cli
> TTL activity:feed:all
# Should be ~300 seconds, not -1 or -2

# Verify cron is running
# Check Inngest logs for scheduled runs
```

### Stale Data in Cache
```bash
# Manually invalidate cache
redis-cli
> DEL activity:feed:all

# Or trigger invalidation event
curl -X POST https://your-domain.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "activity/cache.invalidate", "data": {}}'
```

---

## 🔄 Next Steps (Optional)

After caching is working, consider:

1. **Content Change Detection** - Auto-invalidate cache when content updates
2. **Social Media Posting** - Auto-post new activity to X/Twitter
3. **Email Digest** - Weekly summary of activity feed
4. **Analytics Dashboard** - Track cache hit rates and engagement

See [ACTIVITY_FEED_AUTOMATION.md](./activity-feed-automation) for full automation roadmap.

---

**Status:** Ready to Implement  
**Estimated Time:** 30 minutes  
**Risk:** Low (fallback to direct fetch if cache fails)  
**Impact:** HIGH - Immediate performance improvement
