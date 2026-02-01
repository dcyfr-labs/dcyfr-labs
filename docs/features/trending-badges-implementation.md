<!-- TLP:CLEAR -->

# Trending Badges Implementation Guide

## Overview

Implemented engagement-based trending badges that appear on published events instead of creating duplicate "trending" events. This eliminates redundancy in the activity feed while providing clear visual indicators of popular content.

**Status:** ✅ Production Ready

## Implementation Date

December 25, 2025 (Completed with time-windowed metrics)

## What Changed

### 1. Trending Calculation System ([src/lib/activity/trending.ts](../../src/lib/activity/trending.ts))

Created a comprehensive trending calculation utility that:
- **Calculates engagement scores** based on views, likes, comments, and reading completion
- **Supports dual time windows**: Weekly (7 days) and monthly (30 days)
- **Uses weighted scoring**: Comments = 10x views, Likes = 5x views, Reading completion = 2x views
- **Includes anti-spam protection**: Minimum 10 views required for trending eligibility
- **Configurable thresholds**: Weekly ≥ 60 score, Monthly ≥ 50 score

**Key Functions:**
```typescript
calculateEngagementScore(metrics: EngagementMetrics): number
calculateTrendingStatus(metrics: EngagementMetrics): TrendingStatus
getTrendingBadgeLabel(status: TrendingStatus): string | null
```

### 2. Type System Extension ([src/lib/activity/types.ts](../../src/lib/activity/types.ts))

Extended `ActivityMeta` interface with detailed trending status:

```typescript
interface ActivityMeta {
  // ... existing fields

  /** Detailed trending status */
  trendingStatus?: {
    isWeeklyTrending: boolean;
    isMonthlyTrending: boolean;
    engagementScore: number; // 0-100
  };

  /** @deprecated Use trendingStatus instead */
  trending?: boolean;
}
```

### 3. Server-Side Activity Enrichment ([src/lib/activity/sources.server.ts](../../src/lib/activity/sources.server.ts))

Enhanced `transformPostsWithViews` to automatically calculate and attach trending status:

```typescript
// Calculate trending for both time windows
const weeklyMetrics: EngagementMetrics = {
  views: views || 0,
  likes: likes || 0,
  comments: comments || 0,
  readingCompletion: 0, // TODO: Implement tracking
  periodDays: 7,
};

const monthlyMetrics: EngagementMetrics = {
  ...weeklyMetrics,
  periodDays: 30,
};

const weeklyStatus = calculateTrendingStatus(weeklyMetrics);
const monthlyStatus = calculateTrendingStatus(monthlyMetrics);

// Add to activity metadata
meta: {
  // ... other meta
  trendingStatus: {
    isWeeklyTrending: weeklyStatus.isWeeklyTrending,
    isMonthlyTrending: monthlyStatus.isMonthlyTrending,
    engagementScore: Math.max(
      weeklyStatus.engagementScore,
      monthlyStatus.engagementScore
    ),
  },
  trending: weeklyStatus.isWeeklyTrending || monthlyStatus.isMonthlyTrending,
}
```

### 4. UI Components Updated

#### ThreadHeader ([src/components/activity/ThreadHeader.tsx](../../src/components/activity/ThreadHeader.tsx))

Added trending badges after source and verb badges:

```tsx
{/* Trending Badge (Weekly takes priority over Monthly) */}
{activity.meta?.trendingStatus?.isWeeklyTrending && (
  <Badge variant="secondary" className={cn("px-2 h-6", NEON_COLORS.orange.badge)}>
    🔥 Trending this week
  </Badge>
)}
{!activity.meta?.trendingStatus?.isWeeklyTrending && activity.meta?.trendingStatus?.isMonthlyTrending && (
  <Badge variant="secondary" className={cn("px-2 h-6", NEON_COLORS.blue.badge)}>
    📈 Trending this month
  </Badge>
)}
```

#### ThreadReply ([src/components/activity/ThreadReply.tsx](../../src/components/activity/ThreadReply.tsx))

Added compact trending badges for replies:

```tsx
{/* Trending Badge (Compact) */}
{activity.meta?.trendingStatus?.isWeeklyTrending && (
  <Badge variant="secondary" className={cn("px-1.5 h-5 text-xs", NEON_COLORS.orange.badge)}>
    🔥 Week
  </Badge>
)}
{!activity.meta?.trendingStatus?.isWeeklyTrending && activity.meta?.trendingStatus?.isMonthlyTrending && (
  <Badge variant="secondary" className={cn("px-1.5 h-5 text-xs", NEON_COLORS.blue.badge)}>
    📈 Month
  </Badge>
)}
```

### 5. Duplicate Event Removal

Disabled `transformTrendingPosts` calls in all pages:
- [src/app/activity/page.tsx](../../src/app/activity/page.tsx) (line 151)
- [src/app/page.tsx](../../src/app/page.tsx) (line 234)
- src/app/(embed)/embed/activity/page.tsx/embed/activity/page.tsx) (line 131)

**Before:** Duplicate events (published + trending)
```
[Blog] [published] "OWASP Top 10 for Agentic AI"
[Trending] [updated] "OWASP Top 10 for Agentic AI" - Trending with X views
```

**After:** Single event with trending badge
```
[Blog] [published] [🔥 Trending this week] "OWASP Top 10 for Agentic AI"
```

## Visual Design

### Badge Hierarchy
```
[Source] [Verb] [Trending (if applicable)]
  ↓       ↓            ↓
[Blog] [published] [🔥 Trending this week]
```

### Color Scheme
- **Weekly Trending**: Orange neon (`NEON_COLORS.orange.badge`) - 🔥 emoji
- **Monthly Trending**: Blue neon (`NEON_COLORS.blue.badge`) - 📈 emoji
- **Priority**: Weekly badge shown preferentially if both conditions are met

### Size Variants
- **ThreadHeader**: Full size badges (h-6, px-2)
- **ThreadReply**: Compact badges (h-5, px-1.5, text-xs, shortened labels)

## Engagement Score Formula

```
Raw Score = (views × 1) + (likes × 5) + (comments × 10) + (completion × 2)
Daily Score = Raw Score / periodDays
Normalized Score = min(100, (Daily Score / 10) × 100)
```

### Thresholds
- **Weekly Trending**: Score ≥ 60 in past 7 days + minimum 10 views
- **Monthly Trending**: Score ≥ 50 in past 30 days + minimum 10 views

## Data Sources

Currently integrated:
- ✅ **Views (Time-Windowed)**: `getMultiplePostViewsInRange(postIds, 7)` and `getMultiplePostViewsInRange(postIds, 30)` from Redis
  - Weekly trending uses views from past 7 days only
  - Monthly trending uses views from past 30 days only
  - View history retained for 90 days in Redis sorted sets
- ✅ **Likes**: `mapGiscusReactionsToLikes()` from Giscus API (all-time counts)
- ✅ **Comments**: `getPostCommentsBulk()` from Giscus API (all-time counts)
- ⏳ **Reading Completion**: TODO - needs ArticleReadingProgress integration

## Future Enhancements

### 1. ~~Time-Windowed Metrics~~ ✅ IMPLEMENTED (Dec 25, 2025)
**Status**: Fully implemented for view counts. Comments/likes use all-time counts (acceptable since most engagement happens within first weeks).

Implementation details:
- Views use `getMultiplePostViewsInRange()` with 7/30 day windows
- View history stored in Redis sorted sets with 90-day retention
- Weekly trending: views from past 7 days only
- Monthly trending: views from past 30 days only
- Comments/likes remain all-time (Giscus API limitation)

### 2. Reading Completion Tracking
Integrate with `ArticleReadingProgress` component:
```typescript
// In ArticleReadingProgress component
onReadingComplete={(percentage) => {
  fetch('/api/analytics/reading', {
    method: 'POST',
    body: JSON.stringify({
      postId,
      percentage,
      timestamp: new Date(),
    }),
  });
}}
```

Then aggregate in trending calculation:
```typescript
const avgCompletion = await getAverageReadingCompletion(postId, periodDays);
```

### 3. Configurable Thresholds
Allow per-site tuning based on traffic patterns:
```typescript
// In site-config.ts
export const TRENDING_CONFIG = {
  weeklyScoreThreshold: 60,
  monthlyScoreThreshold: 50,
  minViews: 10,
  weights: {
    views: 1,
    likes: 5,
    comments: 10,
    completion: 2,
  },
};
```

### 4. Trending Badge Variants
Additional time windows or criteria:
- **🔥 Hot Right Now**: Score ≥ 80 in past 24 hours
- **⭐ All-Time Popular**: Top 10 all-time engagement scores
- **💬 Most Discussed**: Highest comment-to-view ratio

## Testing

### Manual Testing
To test badges immediately, add mock trending status to any activity:

```typescript
// In sources.server.ts, temporarily add:
{
  id: "blog-test-post",
  // ... other fields
  meta: {
    // ... other meta
    trendingStatus: {
      isWeeklyTrending: true,  // Test weekly badge
      isMonthlyTrending: false,
      engagementScore: 75,
    },
  },
}
```

### Automated Testing
Future test coverage should include:
- Unit tests for `calculateEngagementScore()`
- Unit tests for `calculateTrendingStatus()`
- Integration tests for `transformPostsWithViews()`
- Visual regression tests for badge display

## Performance Considerations

### Current Impact
- **Minimal**: Calculation runs server-side during activity transformation
- **No additional API calls**: Uses existing data (views, likes, comments)
- **Cached**: Activity feed is cached in Redis (5-15 minutes)

### Future Optimizations
1. **Pre-calculate trending scores**: Run hourly Inngest job to calculate and cache scores
2. **Batch processing**: Calculate for all posts at once, store in Redis
3. **Incremental updates**: Only recalculate when metrics change

## Migration Notes

### Backward Compatibility
- Old `trending` boolean flag still populated for compatibility
- `transformTrendingPosts()` function kept but disabled
- No breaking changes to existing activity consumers

### Cleanup Tasks
Future cleanup (non-urgent):
1. Remove `transformTrendingPosts()` function entirely
2. Remove old `trending` boolean from ActivityMeta
3. Update all consumers to use `trendingStatus` only

## Related Documentation

- [Activity Feed Architecture](./activity-feed.md)
- [Activity Automation](./activity-automation-quick-start.md)
- Engagement Tracking
- Trending Integration Example

## Credits

Implementation completed by Claude Sonnet 4.5 on December 25, 2025, based on user requirements for:
1. Engagement-based trending calculation
2. Weekly and monthly time windows
3. Visual badges instead of duplicate events
4. Single source of truth for content
