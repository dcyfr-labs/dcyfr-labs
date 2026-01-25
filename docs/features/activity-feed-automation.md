{/* TLP:CLEAR */}

# Activity Feed Automation Strategy

**Last Updated:** December 9, 2025  
**Status:** Implementation Guide  
**Current State:** Partial automation (trending, views, GitHub)  
**Target State:** Full automation with scheduled jobs

---

## 🎯 Current State Analysis

### What's Already Automated ✅

| Source | Automation | Frequency | Method |
|--------|-----------|-----------|--------|
| **Trending Posts** | ✅ Automated | Hourly | Inngest (`calculateBlogTrending`) |
| **View Counts** | ✅ Automated | Real-time | Redis increments |
| **GitHub Activity** | ✅ Automated | Hourly | Inngest (`refreshGitHubData`) |
| **Comment Milestones** | ✅ Automated | On-demand | Redis bulk fetch |
| **Page Revalidation** | ✅ Automated | 5 minutes | Next.js ISR |

### What's Manual ❌

| Source | Current Method | Why Manual |
|--------|---------------|------------|
| **Blog Posts** | Manual file edits (`src/data/posts.ts`) | Content creation requires human input |
| **Projects** | Manual file edits (`src/data/projects.ts`) | Portfolio updates are infrequent |
| **Changelog** | Manual file edits (`src/data/changelog.ts`) | Site updates are manual events |

---

## 🚀 Automation Opportunities

### 1. Automated Content Discovery (HIGH VALUE)

**Problem:** New blog posts/projects require manual updates to activity feed  
**Solution:** Auto-detect new content and emit events

#### Option A: Git-Based Detection (Recommended)

Detect file changes via GitHub webhooks or scheduled checks:

```typescript
// src/inngest/content-sync-functions.ts
export const detectNewContent = inngest.createFunction(
  { id: "detect-new-content" },
  { cron: "*/15 * * * *" }, // Every 15 minutes
  async ({ step }) => {
    // Step 1: Check for new/modified content files
    const changes = await step.run("check-content-changes", async () => {
      const lastCheckSHA = await redis.get("content:last-check-sha");
      const currentSHA = await fetchLatestCommitSHA();
      
      if (lastCheckSHA === currentSHA) return null;
      
      const changedFiles = await getChangedFiles(lastCheckSHA, currentSHA);
      await redis.set("content:last-check-sha", currentSHA);
      
      return changedFiles.filter(f => 
        f.startsWith("src/data/posts") || 
        f.startsWith("src/data/projects") ||
        f.startsWith("src/data/changelog")
      );
    });
    
    if (!changes?.length) {
      return { message: "No content changes detected" };
    }
    
    // Step 2: Emit events for new content
    await step.run("emit-content-events", async () => {
      for (const file of changes) {
        if (file.includes("posts")) {
          await inngest.send({ name: "content/post.published", data: { file } });
        } else if (file.includes("projects")) {
          await inngest.send({ name: "content/project.published", data: { file } });
        } else if (file.includes("changelog")) {
          await inngest.send({ name: "content/changelog.updated", data: { file } });
        }
      }
    });
    
    return { changedFiles: changes.length };
  }
);
```

**Benefits:**
- ✅ Works with existing manual workflow
- ✅ No CMS changes required
- ✅ Detects all content types
- ✅ Can trigger downstream automations (social posts, indexing, etc.)

#### Option B: GitHub Webhook Integration

Listen for push events directly:

```typescript
// src/app/api/webhooks/github/route.ts
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // Validate webhook signature
  const signature = request.headers.get("x-hub-signature-256");
  if (!validateWebhookSignature(signature, data)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // Filter for content changes
  const contentFiles = data.commits
    .flatMap((c: any) => [...c.added, ...c.modified])
    .filter((f: string) => f.startsWith("src/data/"));
  
  // Queue processing
  for (const file of contentFiles) {
    await inngest.send({
      name: "content/file.changed",
      data: { file, commit: data.head_commit.id }
    });
  }
  
  return NextResponse.json({ received: true });
}
```

**Benefits:**
- ✅ Real-time updates (no delay)
- ✅ Lower polling overhead
- ❌ Requires webhook setup in GitHub
- ❌ More complex security validation

---

### 2. Automated Activity Aggregation (MEDIUM VALUE)

**Problem:** Activity feed recalculates on every request  
**Solution:** Pre-compute aggregated activity feed and cache in Redis

```typescript
// src/inngest/activity-cache-functions.ts
export const refreshActivityFeed = inngest.createFunction(
  { id: "refresh-activity-feed" },
  { cron: "*/5 * * * *" }, // Every 5 minutes (matches page revalidation)
  async ({ step }) => {
    // Step 1: Gather all activities (same logic as page)
    const activities = await step.run("gather-activities", async () => {
      const [
        blogPosts,
        projects,
        changelog,
        trending,
        milestones,
        highEngagement,
        commentMilestones,
        githubActivity
      ] = await Promise.all([
        transformPostsWithViews(posts),
        transformProjects(projects),
        transformChangelog(changelog),
        transformTrendingPosts(posts, 3),
        transformMilestones(posts, 20),
        transformHighEngagementPosts(posts, 5),
        transformCommentMilestones(posts),
        transformGitHubActivity()
      ]);
      
      return aggregateActivities([
        ...blogPosts,
        ...projects,
        ...changelog,
        ...trending,
        ...milestones,
        ...highEngagement,
        ...commentMilestones,
        ...githubActivity
      ]);
    });
    
    // Step 2: Cache aggregated feed
    await step.run("cache-feed", async () => {
      await redis.setEx(
        "activity:feed:all",
        300, // 5 minutes TTL
        JSON.stringify(activities)
      );
    });
    
    return { count: activities.length };
  }
);
```

**Update page to use cache:**

```typescript
// src/app/activity/page.tsx
export default async function ActivityPage() {
  let allActivities: ActivityItem[] = [];
  
  // Try cache first
  const redis = await getRedisClient();
  if (redis) {
    const cached = await redis.get("activity:feed:all");
    if (cached) {
      allActivities = JSON.parse(cached);
      await redis.quit();
      console.log("[Activity Page] Loaded from cache");
    }
  }
  
  // Fallback to direct fetch if cache miss
  if (allActivities.length === 0) {
    // ... existing logic
    console.log("[Activity Page] Cache miss, fetching directly");
  }
  
  // ... rest of page
}
```

**Benefits:**
- ✅ Faster page loads (pre-computed data)
- ✅ Reduced server load (fewer concurrent aggregations)
- ✅ Better caching strategy
- ✅ Easier to add new activity sources

---

### 3. Automated Social Media Posting (HIGH VALUE)

**Problem:** New activity doesn't propagate to social media  
**Solution:** Auto-post to X/Twitter, LinkedIn, etc. when new content detected

```typescript
// src/inngest/social-sync-functions.ts
export const postToSocial = inngest.createFunction(
  { id: "post-to-social" },
  { event: "content/post.published" },
  async ({ event, step }) => {
    const { postId } = event.data;
    
    // Step 1: Get post details
    const post = await step.run("fetch-post", async () => {
      const found = posts.find(p => p.id === postId);
      if (!found) throw new Error(`Post ${postId} not found`);
      return found;
    });
    
    // Step 2: Post to X/Twitter
    await step.run("post-to-twitter", async () => {
      const tweetText = `New blog post: ${post.title}\n\n${post.summary}\n\n${SITE_URL}/blog/${post.slug}`;
      
      return await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.TWITTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: tweetText })
      });
    });
    
    // Step 3: Post to LinkedIn
    await step.run("post-to-linkedin", async () => {
      // Similar LinkedIn API call
    });
    
    // Step 4: Update activity with social links
    await step.run("update-activity", async () => {
      await redis.hSet(`activity:${postId}:social`, {
        twitter: "tweet-id",
        linkedin: "post-id"
      });
    });
  }
);
```

**Benefits:**
- ✅ Automatic social media promotion
- ✅ Consistent posting schedule
- ✅ Tracks social engagement
- ✅ Can customize per platform

---

### 4. Automated Email Digest (MEDIUM VALUE)

**Problem:** Subscribers don't get notified of new activity  
**Solution:** Daily/weekly email digest of activity feed

```typescript
// src/inngest/email-digest-functions.ts
export const sendWeeklyDigest = inngest.createFunction(
  { id: "send-weekly-digest" },
  { cron: "0 9 * * 1" }, // Every Monday at 9 AM
  async ({ step }) => {
    // Step 1: Get last week's activity
    const activities = await step.run("fetch-activities", async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const cached = await redis.get("activity:feed:all");
      const all = cached ? JSON.parse(cached) : [];
      
      return all.filter((a: ActivityItem) => 
        new Date(a.timestamp) >= weekAgo
      );
    });
    
    if (activities.length === 0) {
      return { message: "No activity this week" };
    }
    
    // Step 2: Render email template
    const html = await step.run("render-email", async () => {
      return renderWeeklyDigestEmail(activities);
    });
    
    // Step 3: Send via Resend
    await step.run("send-emails", async () => {
      const subscribers = await getSubscribers();
      
      for (const subscriber of subscribers) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "DCYFR Labs <noreply@dcyfr.ai>",
            to: subscriber.email,
            subject: `Weekly Activity Digest - ${new Date().toLocaleDateString()}`,
            html
          })
        });
      }
    });
    
    return { sent: activities.length };
  }
);
```

**Benefits:**
- ✅ Keeps audience engaged
- ✅ Automatic subscriber updates
- ✅ Configurable frequency
- ✅ Can track open/click rates

---

### 5. Automated Metrics Dashboard (LOW VALUE)

**Problem:** Manual tracking of activity feed engagement  
**Solution:** Auto-generate analytics dashboard

```typescript
// src/inngest/analytics-functions.ts
export const generateActivityMetrics = inngest.createFunction(
  { id: "generate-activity-metrics" },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    // Step 1: Calculate metrics
    const metrics = await step.run("calculate-metrics", async () => {
      const cached = await redis.get("activity:feed:all");
      const activities = cached ? JSON.parse(cached) : [];
      
      return {
        totalActivities: activities.length,
        bySource: countBySource(activities),
        byType: countByType(activities),
        trending: activities.filter((a: ActivityItem) => a.verb === "trending"),
        engagementRate: calculateEngagementRate(activities)
      };
    });
    
    // Step 2: Store historical data
    await step.run("store-metrics", async () => {
      await redis.lpush("activity:metrics:history", JSON.stringify({
        date: new Date().toISOString(),
        ...metrics
      }));
      
      // Keep last 90 days
      await redis.ltrim("activity:metrics:history", 0, 89);
    });
    
    return metrics;
  }
);
```

---

## 📊 Recommended Implementation Order

### Phase 1: Core Automation (Week 1)
1. ✅ **Activity Feed Caching** - Immediate performance win
2. ✅ **Git-Based Content Detection** - Foundation for other automations

### Phase 2: Engagement (Week 2)
3. ✅ **Social Media Posting** - Maximize reach
4. ✅ **Email Digest** - Retain audience

### Phase 3: Analytics (Week 3)
5. ✅ **Metrics Dashboard** - Measure success

---

## 🛠️ Implementation Checklist

### Activity Feed Caching
- [ ] Create `src/inngest/activity-cache-functions.ts`
- [ ] Add `refreshActivityFeed` function with 5-minute cron
- [ ] Update `src/app/activity/page.tsx` to check cache first
- [ ] Register function in `src/app/api/inngest/route.ts`
- [ ] Test cache hit/miss scenarios
- [ ] Verify cache invalidation on content changes

### Git-Based Content Detection
- [ ] Create `src/inngest/content-sync-functions.ts`
- [ ] Add `detectNewContent` function with 15-minute cron
- [ ] Implement `getChangedFiles()` helper using GitHub API
- [ ] Store last checked SHA in Redis
- [ ] Emit events for new posts/projects/changelog
- [ ] Test with actual content commits

### Social Media Posting
- [ ] Create `src/inngest/social-sync-functions.ts`
- [ ] Add `postToSocial` function triggered by content events
- [ ] Set up X/Twitter API credentials in Vercel
- [ ] Set up LinkedIn API credentials in Vercel
- [ ] Create post templates for each platform
- [ ] Add social links to activity metadata
- [ ] Test with sample post

### Email Digest
- [ ] Create `src/inngest/email-digest-functions.ts`
- [ ] Add `sendWeeklyDigest` function with Monday 9 AM cron
- [ ] Create email template in `src/emails/weekly-digest.tsx`
- [ ] Set up Resend API credentials
- [ ] Create subscriber management system
- [ ] Add unsubscribe flow
- [ ] Test with sample subscribers

### Metrics Dashboard
- [ ] Create `src/inngest/analytics-functions.ts`
- [ ] Add `generateActivityMetrics` function with daily cron
- [ ] Store historical metrics in Redis
- [ ] Create `/dev/analytics` page to display metrics
- [ ] Add charts for activity trends
- [ ] Export metrics to CSV

---

## 🔐 Environment Variables Required

```bash
# GitHub API (for content detection)
GITHUB_TOKEN=ghp_xxxxx

# Social Media APIs
TWITTER_API_KEY=xxxxx
TWITTER_API_SECRET=xxxxx
LINKEDIN_API_KEY=xxxxx

# Email Service
RESEND_API_KEY=re_xxxxx

# Redis (already configured)
REDIS_URL=redis://...
```

---

## 📈 Success Metrics

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| **Activity Feed Load Time** | ~800ms | &lt;400ms | Caching |
| **Content to Activity Delay** | Manual | &lt;15 min | Git detection |
| **Social Media Reach** | Manual | Automatic | Auto-posting |
| **Email Open Rate** | N/A | >25% | Weekly digest |
| **Cache Hit Rate** | N/A | >80% | Redis monitoring |

---

## 🚨 Risk Mitigation

### Rate Limits
- **GitHub API**: 5000 requests/hour (authenticated)
- **X/Twitter API**: 50 posts/day (Free tier)
- **LinkedIn API**: 100 posts/day
- **Resend**: 100 emails/day (Free tier)

**Solution:** Implement rate limit tracking in Redis

### Cache Invalidation
- **Problem:** Stale activity data after content changes
- **Solution:** Invalidate cache when content events detected

### Error Handling
- **Problem:** Failed social posts shouldn't block content publication
- **Solution:** Fire-and-forget pattern with error logging to Sentry

---

## 🔄 Maintenance

### Daily
- [ ] Check Inngest dashboard for failed jobs
- [ ] Monitor Redis cache hit rate
- [ ] Review social media post success rate

### Weekly
- [ ] Review email digest engagement metrics
- [ ] Check for rate limit warnings
- [ ] Validate activity feed accuracy

### Monthly
- [ ] Analyze activity trends
- [ ] Optimize cron schedules if needed
- [ ] Review and prune historical metrics

---

## 📚 Related Documentation

- [Activity Feed Feature](./feeds)
- Inngest Functions
- [GitHub Integration](./github-integration)
- Blog Analytics

---

**Status:** Ready for Implementation  
**Estimated Effort:** 3-5 days (phased approach)  
**Dependencies:** Redis, Inngest, GitHub API access
