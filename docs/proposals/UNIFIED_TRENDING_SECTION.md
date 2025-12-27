# Unified Trending Section Refactor

**Date:** December 27, 2025
**Status:** Proposal
**Goal:** Consolidate "Trending" and "Popular Topics" sections into a unified "Trending" showcase

---

## Problem Statement

Currently, the homepage has two separate trending-related sections:

1. **Trending** (Section #4, lines 496-518) - Shows top 3 posts by view count
2. **Popular Topics** (Section #5, lines 520-542) - Shows top 12 tags by post count

**Issues:**
- Semantically redundant: "Popular Topics" is technically trending data (most frequently used tags)
- Separated related information that users expect to see together
- Missed opportunity to showcase more types of trending content
- Not leveraging full trending calculation system (engagement scores, weekly/monthly windows)

---

## Current Data Sources Available

### 1. **Trending Posts** ✅
- View counts (all-time, weekly, monthly)
- Engagement scores (views + likes × 5 + comments × 10)
- Trending status (weekly/monthly windows)
- **Source:** `/src/lib/activity/trending.ts` + Redis analytics

### 2. **Popular Topics** ✅
- Tag frequency counts
- Tag co-occurrence data
- Topic normalization
- **Source:** `/src/lib/activity/topics.ts`

###3. **Available but Not Displayed:**

#### Trending Projects
- GitHub stars, forks, recent activity
- Project view counts
- **Source:** Activity feed already tracks projects

#### Trending Technologies
- Tech stack mentions across posts/projects
- Could aggregate from project `tech` arrays
- **Source:** Posts metadata + projects data

#### Trending Series
- Series with most engagement
- Series progression tracking
- **Source:** Posts series metadata + analytics

#### Hot Searches (Future)
- Most searched terms
- **Source:** Would need search analytics tracking

#### Milestone Events
- Posts hitting view milestones (10, 25, 50, 100, 500, 1K views)
- **Source:** `/src/lib/activity/sources.server.ts` - `transformMilestones`

#### High Engagement Posts
- Posts with exceptional likes/comments
- **Source:** `/src/lib/activity/sources.server.ts` - `transformHighEngagementPosts`

---

## Proposed Solution: Unified "Trending" Section

### Design Concept

Create a **single, comprehensive "Trending" section** with multiple subsections (tabs or accordion):

```
┌─────────────────────────────────────────────────────────┐
│                       Trending                          │
│                                                         │
│  [Posts] [Topics] [Projects] [Technologies] [Series]   │← Tabs
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ #1  Building Event-Driven Architecture         │   │
│  │     Inngest • 6 min read • 🔥 124 views        │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ #2  Getting Started with React Hooks           │   │
│  │     React • 3 min read • 📈 98 views           │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ #3  UI Elements and Components                 │   │
│  │     Demo • 6 min read • 🔥 87 views            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 Showing weekly trending · View all posts →         │
└─────────────────────────────────────────────────────────┘
```

Alternative: **Carousel/Grid Layout** (like Netflix trending):
```
┌─────────────────────────────────────────────────────────┐
│  Trending Now                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Post #1 │  │  Post #2 │  │  Post #3 │  →          │
│  │  🔥 Week │  │  📈 Month│  │  🔥 Week │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  Popular Topics                                         │
│  [Demo 5] [Next.js 4] [TypeScript 4] [MDX 3] ...      │
│                                                         │
│  Rising Stars (Projects)                                │
│  ⭐ dcyfr-labs +12 stars this week                     │
│  ⭐ portfolio-v3 +8 stars this week                    │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Consolidation (MVP) - **Recommend Starting Here**

**Goal:** Merge existing Trending Posts + Popular Topics into unified section

#### 1.1 Create Unified Component

**File:** `/src/components/home/trending-section.tsx`

```typescript
interface TrendingSectionProps {
  // Posts
  posts: Post[]
  viewCounts: Map<string, number>

  // Topics
  topics: TopicData[]

  // Display options
  variant?: 'tabbed' | 'stacked' | 'carousel'
  defaultTab?: 'posts' | 'topics'
}

export function TrendingSection({ ... }: TrendingSectionProps) {
  // Render tabs/sections for:
  // 1. Trending Posts (top 5-10)
  // 2. Popular Topics (top 12)
  // 3. (Future) Trending Projects
}
```

#### 1.2 Update Homepage

**File:** `/src/app/page.tsx`

```typescript
// BEFORE: Two separate sections
<Section id="trending">
  <TrendingPosts posts={...} viewCounts={...} limit={3} />
</Section>

<Section id="topics">
  <TopicNavigator topics={...} maxTopics={12} />
</Section>

// AFTER: One unified section
<Section id="trending">
  <SectionHeader title="Trending" />
  <TrendingSection
    posts={activePosts}
    viewCounts={viewCountsMap}
    topics={topTopics}
    variant="tabbed" // or 'stacked', 'carousel'
    defaultTab="posts"
  />
</Section>
```

**Benefits:**
- Single source of truth for trending content
- Better UX: related data in one place
- Cleaner homepage structure
- Easier to add new trending types

---

### Phase 2: Enhanced Data (Week 2-3)

**Goal:** Add more trending data types

#### 2.1 Trending Projects

```typescript
// Calculate project trending score based on:
// - GitHub stars (recent vs all-time)
// - View counts
// - Recent commits/activity

interface TrendingProject {
  project: Project
  stars: number
  recentStars: number // Last 7 days
  score: number
}

async function getTrendingProjects(
  projects: Project[],
  limit: number = 5
): Promise<TrendingProject[]> {
  // Fetch GitHub stars, calculate scores
}
```

#### 2.2 Trending Technologies

```typescript
// Aggregate tech mentions across posts + projects
interface TrendingTechnology {
  name: string
  postCount: number
  projectCount: number
  totalMentions: number
  trend: 'rising' | 'stable' | 'falling'
}

function getTrendingTechnologies(
  posts: Post[],
  projects: Project[],
  limit: number = 10
): TrendingTechnology[] {
  // Count tech mentions, calculate trends
}
```

#### 2.3 Trending Series

```typescript
interface TrendingSeries {
  series: Series
  totalViews: number
  averageEngagement: number
  completionRate: number // % who read entire series
}
```

---

### Phase 3: Advanced Features (Week 4+)

#### 3.1 Time Period Selector

Allow users to switch between:
- **This Week** (7 days)
- **This Month** (30 days)
- **All Time** (default for new visitors)

#### 3.2 Trending Indicators

Visual indicators for trending velocity:
- 🔥 **Hot** - Weekly trending (rapid growth)
- 📈 **Rising** - Monthly trending (steady growth)
- ⭐ **Top** - All-time popular

#### 3.3 Personalized Trending (Future)

If user preferences/history tracked:
- **For You** - Trending in topics user reads
- **Related** - Trending similar to recently viewed

---

## Component Architecture

### File Structure

```
/src/components/home/
  ├── trending-section.tsx          # Main unified component
  ├── trending-tabs.tsx              # Tab navigation
  ├── trending-posts-panel.tsx       # Posts tab content
  ├── trending-topics-panel.tsx      # Topics tab content
  ├── trending-projects-panel.tsx    # Projects tab content (future)
  └── trending-card.tsx              # Reusable trending item card
```

### Shared Components

Reuse existing:
- `TrendingPosts` component (refactor to `TrendingPostsPanel`)
- `TopicNavigator` component (refactor to `TrendingTopicsPanel`)
- Add new `TrendingCard` for consistent styling

---

## Design Tokens Compliance

All components must use design tokens (no hardcoded values):

```typescript
import {
  TYPOGRAPHY,
  SPACING,
  ANIMATION,
  HOVER_EFFECTS,
  NEON_COLORS,
} from '@/lib/design-tokens'

// Spacing
className={SPACING.content}  // Not: "space-y-4"

// Typography
className={TYPOGRAPHY.h3.standard}  // Not: "text-2xl font-semibold"

// Animations
className={ANIMATION.transition.base}  // Not: "transition-all duration-200"
```

---

## User Experience Considerations

### Default View

**Recommendation:** Show **Trending Posts** by default

**Reasoning:**
- Posts are primary content type
- Most engagement/interaction happens with posts
- Users visiting homepage likely looking for latest/popular content

### Mobile Optimization

- **Tabs:** Horizontal scrollable tabs (space-constrained)
- **Stack:** Accordion-style collapse/expand (saves vertical space)
- **Carousel:** Swipeable cards (native mobile UX)

**Recommendation:** Use **tabs on desktop**, **stacked accordion on mobile**

### Accessibility

- Proper ARIA labels for tabs
- Keyboard navigation (arrow keys for tabs)
- Screen reader announcements for dynamic content
- Focus management when switching tabs

---

## Performance Considerations

### Data Fetching

**Current:** Both sections fetch data independently
**Proposed:** Single fetch for all trending data

```typescript
// Fetch all trending data in parallel
const trendingData = await Promise.all([
  getTrendingPosts(posts, viewCounts, 10),
  getTrendingTopics(posts, 12),
  getTrendingProjects(projects, 5), // Phase 2
  getTrendingTechnologies(posts, projects, 10), // Phase 2
])
```

### Caching Strategy

- Cache trending calculations (expensive)
- **TTL:** 1 hour (trending doesn't need real-time updates)
- **Invalidation:** On new content publish or milestone events

```typescript
// Redis cache key pattern
const cacheKey = `trending:${type}:${period}:${limit}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// Calculate and cache
const result = await calculateTrending(...)
await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600)
```

### Client-Side Optimization

- Lazy load tabs (only render active tab content)
- Use `Suspense` boundaries for async data
- Prefetch tab content on hover (optional enhancement)

---

## Migration Strategy

### Step 1: Create New Component (No Breaking Changes)

- Build `TrendingSection` alongside existing components
- Test in isolation (Storybook or dedicated page)
- Validate design tokens compliance

### Step 2: A/B Test (Optional)

- Show 50% users old layout, 50% new layout
- Track engagement metrics:
  - Click-through rate on trending items
  - Time spent in section
  - Scroll depth
  - Tab switching behavior

### Step 3: Replace on Homepage

- Remove old `TrendingPosts` and `TopicNavigator` sections
- Add unified `TrendingSection`
- Monitor analytics for regressions

### Step 4: Cleanup

- Archive old components (don't delete immediately)
- Update related documentation
- Remove feature flag (if A/B tested)

---

## Success Metrics

### Engagement Metrics

- **Primary:** Click-through rate on trending items (+20% target)
- Time spent in trending section (+15% target)
- Internal navigation to blog/projects from trending (+25% target)

### Technical Metrics

- Page load time (no regression)
- Lighthouse score (maintain 92+)
- Design token violations (0)
- Test coverage (maintain 99%+)

---

## Alternative Approaches Considered

### Option 1: Keep Separate (Status Quo)
**Pros:** No breaking changes, less refactoring
**Cons:** Semantically redundant, missed opportunity

### Option 2: Sidebar Widget
**Pros:** Always visible, doesn't compete for vertical space
**Cons:** Limited mobile space, less prominent

### Option 3: Dashboard-Style Grid
**Pros:** Modern, shows everything at once
**Cons:** Overwhelming, requires significant design work

**Recommendation:** **Unified section with tabs** (best balance)

---

## Timeline Estimate

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1** | Consolidation (MVP) | 1-2 days | **High** |
| - Component setup | Create TrendingSection | 3-4 hours | |
| - Integration | Update homepage | 2 hours | |
| - Testing | Validate & test | 2 hours | |
| **Phase 2** | Enhanced data | 3-5 days | Medium |
| - Trending projects | GitHub API integration | 4-6 hours | |
| - Trending technologies | Data aggregation | 3-4 hours | |
| - Trending series | Analytics integration | 3-4 hours | |
| **Phase 3** | Advanced features | 5-7 days | Low |
| - Time period selector | UI + data fetching | 4-6 hours | |
| - Personalization | User preferences | 8-10 hours | |

**Total:** 1-2 weeks for complete implementation

---

## Open Questions

1. **Tab vs Accordion vs Carousel?**
   - **Recommendation:** Tabs (familiar UX pattern)

2. **Default tab: Posts or Topics?**
   - **Recommendation:** Posts (primary content)

3. **How many items per trending type?**
   - **Recommendation:**
     - Posts: 5-10 (more detail)
     - Topics: 12-15 (quick scan)
     - Projects: 3-5 (less frequent updates)

4. **Include "View All" links?**
   - **Recommendation:** Yes, to dedicated trending pages
     - `/trending/posts`
     - `/trending/topics`
     - `/trending/projects`

5. **Animated tab transitions?**
   - **Recommendation:** Subtle fade (don't overdo it)

---

## Next Steps

1. **Review & Approve** this proposal
2. **Design mockup** (Figma/Sketch) for visual alignment
3. **Phase 1 implementation** (1-2 days)
4. **User testing** (internal review)
5. **Deploy to production**
6. **Monitor analytics** for 1 week
7. **Iterate** based on data

---

## References

- Current implementation: [`/src/app/page.tsx:496-542`](../src/app/page.tsx#L496-L542)
- Trending calculation: [`/src/lib/activity/trending.ts`](../src/lib/activity/trending.ts)
- Topic extraction: [`/src/lib/activity/topics.ts`](../src/lib/activity/topics.ts)
- Design tokens: [`/src/lib/design-tokens.ts`](../src/lib/design-tokens.ts)

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Author:** Claude Code
**Status:** Awaiting Review
