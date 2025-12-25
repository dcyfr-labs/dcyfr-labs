# Archive Pages Refactor

Comprehensive modernization of blog and work archive pages with elevated images, social features, and modern app-like experience.

## Overview

This refactor addresses visual hierarchy issues, consolidates navigation (series into blog), and brings the archive pages in line with the modern, app-like experience established by the activity timeline.

### Key Problems Solved

1. **Washed-out Featured Images** - Heavy gradient overlays (75-95% opacity) made background images barely visible
2. **Static, Traditional Feel** - Pages lacked the modern animations and polish of the activity timeline
3. **Fragmented Navigation** - Separate /blog/series page created navigation confusion
4. **Missing Social Features** - No integrated sharing, bookmarking, or trending indicators on cards

## What's New

### 1. Design Tokens (`src/lib/design-tokens.ts`)

#### ARCHIVE_CARD_VARIANTS

Three card layout variants with proper image treatment:

```tsx
// Elevated (Recommended) - Image on top, content below
<article className={ARCHIVE_CARD_VARIANTS.elevated.container}>
  <div className={ARCHIVE_CARD_VARIANTS.elevated.imageWrapper}>
    <Image className={ARCHIVE_CARD_VARIANTS.elevated.image} />
    <div className={ARCHIVE_CARD_VARIANTS.elevated.overlay} /> {/* Only 60% at bottom */}
  </div>
  <div className={ARCHIVE_CARD_VARIANTS.elevated.content}>
    {/* Content */}
  </div>
</article>

// Background - Lighter overlay (20-60% instead of 75-95%)
<article className={ARCHIVE_CARD_VARIANTS.background.container}>
  <div className={ARCHIVE_CARD_VARIANTS.background.imageWrapper}>
    <Image className={ARCHIVE_CARD_VARIANTS.background.image} />
    <div className={ARCHIVE_CARD_VARIANTS.background.overlay} />
  </div>
  <div className={ARCHIVE_CARD_VARIANTS.background.content}>
    <div className={ARCHIVE_CARD_VARIANTS.background.glassCard}>
      {/* Content in glass card */}
    </div>
  </div>
</article>

// Side-by-side - Image left, content right (magazine style)
<article className={ARCHIVE_CARD_VARIANTS.sideBySide.container}>
  <div className={ARCHIVE_CARD_VARIANTS.sideBySide.imageWrapper}>
    <Image className={ARCHIVE_CARD_VARIANTS.sideBySide.image} />
  </div>
  <div className={ARCHIVE_CARD_VARIANTS.sideBySide.content}>
    {/* Content */}
  </div>
</article>
```

#### ARCHIVE_ANIMATIONS

Framer Motion animation variants for consistent transitions:

```tsx
<motion.div
  variants={ARCHIVE_ANIMATIONS.container}
  initial="hidden"
  animate="visible"
>
  {posts.map((post, i) => (
    <motion.div
      key={post.id}
      variants={ARCHIVE_ANIMATIONS.item}
      transition={{ delay: i * 0.05 }}
    >
      <PostCard post={post} />
    </motion.div>
  ))}
</motion.div>
```

#### VIEW_MODES

Layout configuration for different viewing preferences:

```tsx
const VIEW_MODES = {
  grid: { /* 3-column grid */ },
  list: { /* Single column with detail */ },
  magazine: { /* Hero + grid */ },
  masonry: { /* Pinterest-style */ },
};
```

### 2. Modern Post Card (`src/components/blog/post/modern-post-card.tsx`)

Next-generation blog post card with:

- **Elevated images** that pop from the page (default variant)
- **Social features** - Share and bookmark buttons with tracking
- **Analytics** - View counts, trending indicators, share counts
- **Framer Motion** - Smooth animations with stagger effect
- **Three variants** - elevated, background, sideBySide

#### Usage

```tsx
import { ModernPostCard } from "@/components/blog";

// Basic usage
<ModernPostCard
  post={post}
  latestSlug={latestSlug}
  hottestSlug={hottestSlug}
  viewCount={142}
  initialShareCount={28}
/>

// With animations (in a grid)
<motion.div
  variants={ARCHIVE_ANIMATIONS.container}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
>
  {posts.map((post, i) => (
    <ModernPostCard
      key={post.slug}
      post={post}
      variant="elevated"
      index={i}
    />
  ))}
</motion.div>

// Side-by-side variant (list view)
<ModernPostCard
  post={post}
  variant="sideBySide"
  showActions
/>

// Background variant (hero card)
<ModernPostCard
  post={featuredPost}
  variant="background"
  viewCount={256}
/>
```

#### Features

- **Prominent images** - Images no longer washed out
- **Quick actions** - Share and bookmark appear on hover (desktop) or visible (mobile)
- **Trending badge** - Shows when post is "hot" based on analytics
- **View counter** - Displays formatted view count with icon
- **Share tracking** - Increments share count via API
- **Responsive** - Touch-optimized for mobile, hover states for desktop

### 3. Modern Project Card (`src/components/projects/modern-project-card.tsx`)

Similar modernization for work/project cards:

```tsx
import { ModernProjectCard } from "@/components/projects/modern-project-card";

<ModernProjectCard
  project={project}
  variant="elevated"
  viewCount={256}
  showActions
/>
```

Features:
- Status badges with color coding (active, in-progress, archived)
- Tech stack display with overflow indicator
- External link quick action on hover
- Timeline and category metadata
- View count display

### 4. Content Type Toggle (`src/components/blog/content-type-toggle.tsx`)

Replaces separate /blog/series page with integrated toggle:

```tsx
import { ContentTypeToggle } from "@/components/blog";

<ContentTypeToggle
  current="posts"
  counts={{ posts: 42, series: 8 }}
/>
```

Features:
- Animated tab indicator (Framer Motion layoutId)
- URL parameter synchronization (`?type=series`)
- Item counts for each content type
- Touch-optimized mobile targets (44px)
- Keyboard accessible

## Implementation Guide

### Phase 1: Update Blog Archive Page

1. **Add Content Type Toggle** to `/blog` page:

```tsx
// src/app/blog/page.tsx
import { ContentTypeToggle } from "@/components/blog";

export default async function BlogPage({ searchParams }) {
  const contentType = searchParams.type === "series" ? "series" : "posts";

  return (
    <PageLayout>
      <PageHero title="Blog" description="..." />

      <div className="mx-auto max-w-7xl px-4">
        {/* Content Type Toggle */}
        <div className="mb-8">
          <ContentTypeToggle
            current={contentType}
            counts={{
              posts: allPosts.length,
              series: allSeries.length,
            }}
          />
        </div>

        {/* Conditional rendering */}
        {contentType === "series" ? (
          <SeriesGrid series={allSeries} />
        ) : (
          <motion.div
            variants={ARCHIVE_ANIMATIONS.container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post, i) => (
              <ModernPostCard
                key={post.slug}
                post={post}
                variant="elevated"
                viewCount={viewCounts.get(post.id)}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}
```

2. **Redirect old series page**:

```tsx
// src/app/blog/series/page.tsx
import { redirect } from "next/navigation";

export default function SeriesPage() {
  redirect("/blog?type=series");
}
```

### Phase 2: Modernize Work Archive

```tsx
// src/app/work/page.tsx
import { ModernProjectCard } from "@/components/projects/modern-project-card";
import { ARCHIVE_ANIMATIONS } from "@/lib/design-tokens";
import { motion } from "framer-motion";

export default async function WorkPage() {
  return (
    <PageLayout>
      <PageHero title="Our Work" />

      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          variants={ARCHIVE_ANIMATIONS.container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project, i) => (
            <ModernProjectCard
              key={project.slug}
              project={project}
              variant="elevated"
              viewCount={viewCounts.get(project.slug)}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </PageLayout>
  );
}
```

### Phase 3: Add View Mode Toggle (Optional)

Create a view mode preference system:

```tsx
// src/components/archive/view-mode-toggle.tsx
"use client";

import { LayoutGrid, List, Newspaper } from "lucide-react";

export function ViewModeToggle({ current, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted border">
      <button onClick={() => onChange("grid")}>
        <LayoutGrid /> Grid
      </button>
      <button onClick={() => onChange("list")}>
        <List /> List
      </button>
      <button onClick={() => onChange("magazine")}>
        <Newspaper /> Magazine
      </button>
    </div>
  );
}
```

## Migration Strategy

### A/B Testing Approach

1. **Feature Flag** - Use URL parameter for gradual rollout:

```tsx
const useModernCards = searchParams.modern === "true";

{useModernCards ? (
  <ModernPostCard post={post} />
) : (
  <PostList posts={posts} />  // Old component
)}
```

2. **Analytics Tracking** - Monitor engagement:
   - Click-through rate on new cards
   - Share/bookmark interaction rates
   - View count changes
   - Bounce rate improvements

3. **Progressive Rollout**:
   - Week 1: 10% traffic to modern cards
   - Week 2: 50% traffic if metrics positive
   - Week 3: 100% rollout
   - Week 4: Remove old components

### Backward Compatibility

Old components remain available during transition:
- `PostList` (current implementation)
- `ProjectCard` (current implementation)
- `/blog/series` page (redirects to `/blog?type=series`)

## Social Features Integration

### Share Tracking

```tsx
// Uses existing useShareTracking hook
const { trackShare, shareCount } = useShareTracking(post.id);

// Increments count on share
await trackShare();
```

### Bookmark Integration

```tsx
// Uses existing BookmarkButton component
<BookmarkButton slug={post.slug} size="icon" variant="ghost" />
```

### Trending Posts

Existing `TrendingPosts` component patterns integrated:
- Trending indicator badge
- View count display with icon
- Ranking indicators (#1, #2, #3)

## Performance Considerations

### Image Optimization

- Elevated variant uses `priority` for first card
- Proper `sizes` attribute for responsive images
- `hover:scale-105` animation uses GPU-accelerated transform

### Animation Performance

- Stagger children limited to 0.05s delay
- Uses `ease-out` timing for snappier feel
- Framer Motion optimizes for 60fps

### Bundle Size

- Dynamic imports for heavy components:
```tsx
const ModernPostCard = dynamic(() => import("@/components/blog/post/modern-post-card"));
```

## Accessibility

- Touch targets meet 44px minimum on mobile
- Keyboard navigation supported
- ARIA labels on interactive elements
- Focus visible states
- Semantic HTML (`article`, `time`, etc.)

## Testing Checklist

- [ ] ModernPostCard renders with all variants
- [ ] Content Type Toggle switches views correctly
- [ ] Animations perform at 60fps
- [ ] Share tracking increments correctly
- [ ] Bookmark integration works
- [ ] View counts display properly
- [ ] Trending badges appear for hot posts
- [ ] Images no longer washed out (visual QA)
- [ ] Mobile touch targets (44px minimum)
- [ ] Keyboard navigation works
- [ ] URL parameters persist on navigation
- [ ] Old /blog/series redirects correctly

## Visual Comparison

### Before (Old PostList)
- Background images with 75-95% opacity gradient
- No hover states beyond subtle lift
- No social actions visible
- Static, traditional blog archive feel

### After (ModernPostCard)
- Elevated images with only 60% gradient at bottom
- Dramatic hover states (scale + shadow)
- Share/bookmark buttons on hover
- Modern app-like experience with animations

## Future Enhancements

1. **Infinite Scroll** - Replace pagination with infinite scroll
2. **Masonry Layout** - Pinterest-style variable height cards
3. **Saved Filters** - Remember user's preferred view mode
4. **Quick Preview** - Modal preview on hover (desktop)
5. **Keyboard Shortcuts** - j/k navigation, / for search
6. **Context Menus** - Right-click actions

## Related Documentation

- [Activity Timeline Patterns](./activity-feed.md)
- [Design Tokens](../design/design-tokens-guide.md)
- [Framer Motion Integration](../architecture/framer-motion-patterns.md)
- [Share Tracking](./share-tracking.md)

## Support

For questions or issues:
1. Check this guide first
2. Review component JSDoc comments
3. Test with URL parameter `?modern=true`
4. File issue with visual comparison screenshots
