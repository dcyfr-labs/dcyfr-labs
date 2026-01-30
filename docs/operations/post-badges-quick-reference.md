<!-- TLP:CLEAR -->

# Post Badges Quick Reference

## Component Usage

```tsx
import { PostBadges } from "@/components/post-badges";

// Default size (post detail page)
<PostBadges 
  post={post}
  isLatestPost={latestPost?.slug === post.slug}
  isHotPost={hottestSlug === post.slug && maxViews > 0}
/>

// Small size (homepage, blog list)
<PostBadges 
  post={post} 
  size="sm"
  isLatestPost={latestPost?.slug === post.slug}
  isHotPost={hottestSlug === post.slug && maxViews > 0}
/>
```

## Badge Types

| Badge | Condition | Color | Visibility |
|-------|-----------|-------|------------|
| Draft | `post.draft === true` | Blue | Development only |
| Archived | `post.archived === true` | Amber | Always |
| New | Latest published post (not archived) | Green | Always |
| Hot | Post with most views (not archived) | Red | Always |

## Color Classes

```tsx
// Draft (blue)
"border-blue-500/50 text-blue-600 dark:text-blue-400"

// Archived (amber)
"border-amber-500/50 text-amber-600 dark:text-amber-400"

// New (green)
"border-green-500/50 text-green-600 dark:text-green-400"

// Hot (red)
"border-red-500/50 text-red-600 dark:text-red-400"
```

## Layout Pattern (Floating Right)

All pages follow this structure:

```tsx
<article>
  {/* Metadata: date, tags, reading time */}
  <div className="text-xs text-muted-foreground">
    [Date • Tags • Reading Time]
  </div>
  
  {/* Title with floating badges */}
  <div className="flex items-center justify-between gap-2">
    <h1>[Post Title]</h1>
    <div className="flex gap-2 flex-shrink-0">
      <PostBadges post={post} isLatestPost={...} isHotPost={...} />
    </div>
  </div>
  
  {/* Content or summary */}
  <p>[Content]</p>
</article>
```

## Calculating Latest & Hot Posts

```tsx
import { getMultiplePostViews } from "@/lib/views";

// Get view counts
const viewMap = await getMultiplePostViews(posts.map(p => p.slug));

// Find hottest post
let hottestSlug: string | null = null;
let maxViews = 0;
viewMap.forEach((views, slug) => {
  if (views > maxViews) {
    maxViews = views;
    hottestSlug = slug;
  }
});

// Find latest post
const latestPost = [...posts]
  .filter(p => !p.archived)
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))[0];
```

## Pages Using PostBadges

1. **Homepage** (`src/app/page.tsx`)
   - Shows 3 recent posts
   - Uses `size="sm"`
   - Badges float right of title

2. **Blog List** (`src/app/blog/page.tsx`)
   - Shows all posts (filtered/paginated)
   - Uses `size="sm"`
   - Badges float right of title

3. **Post Detail** (`src/app/blog/[slug]/page.tsx`)
   - Shows individual post
   - Uses default size
   - Badges float right of title

## Implementation Details

**File:** `src/components/post-badges.tsx`

**Props:**
- `post: Post` - The post object
- `size?: "default" | "sm"` - Badge size (default: "default")
- `isLatestPost?: boolean` - True if this is the latest post
- `isHotPost?: boolean` - True if this has the most views

**Returns:**
- JSX with badge elements or `null` if no badges

**Badge Priority:**
1. Draft (if in development)
2. Archived
3. New (if latest post)
4. Hot (if most views)

## Related Documentation

- [Badge Floating Layout](./badge-floating-layout) - Floating layout implementation
- Post Badges Reorganization - Initial implementation
- Draft Posts Feature
