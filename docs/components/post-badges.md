{/* TLP:CLEAR */}

# Post Badges Component

**Status:** ✅ Implemented  
**Location:** `src/components/post-badges.tsx`  
**Date:** October 20, 2025

---

## Overview

Centralized component for displaying post status badges consistently across all blog-related pages. Includes Draft, Archived, and New badges with configurable sizing and responsive styling.

---

## Quick Reference

### Component Usage

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

### Badge Types

| Badge | Condition | Color | Visibility | Purpose |
|-------|-----------|-------|------------|---------|
| Draft | `post.draft === true` | Blue | Dev only | Work-in-progress posts |
| Archived | `post.archived === true` | Amber | Always | Older/deprecated content |
| New | Latest published post (not archived) | Green | Always | Recently published |
| Hot | Post with most views (not archived) | Red | Always | High engagement indicator |

### Color Classes

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

### Props Interface

```tsx
interface PostBadgesProps {
  post: Post;
  size?: "default" | "sm";
  isLatestPost?: boolean;
  isHotPost?: boolean;
}
```

---

## Implementation Details

### Badge Priority

Badges are displayed in this order:
1. Draft (development only)
2. Archived
3. New (if latest published post)
4. Hot (if most viewed post)

### Badge Logic

**Draft Badge:**
- Only visible in development mode
- Indicates work-in-progress content
- Not shown in production

**Archived Badge:**
- Always shown for archived posts
- Visible in both development and production
- Prevents marking archived posts as "New"

**New Badge:**
- Shows for the most recently published post
- Only applied if not archived
- Published date comparison uses ISO format

**Hot Badge:**
- Shows for the post with the highest view count
- Only applied if not archived
- Requires comparing against all other posts' views

### View Count Calculation

To determine latest and hot posts:

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

---

## Pages Using PostBadges

### 1. Homepage (`src/app/page.tsx`)
- Displays 3 featured posts
- Uses `size="sm"` for compact display
- Badges positioned to the right of title
- Shows badges from featured section

**Layout Structure:**
```
[Date • Tags • Reading Time]
[Title]  [Draft] [Archived] [New] [Hot]
[Summary]
```

### 2. Blog List (`src/app/blog/page.tsx`)
- Displays all posts (filtered/searchable)
- Uses `size="sm"` for consistency
- Badges positioned to the right of title
- Maintains responsive grid layout

**Layout Structure:**
```
[Date • Tags • Reading Time]
[Title]  [Draft] [Archived] [New] [Hot]
[Summary]
```

### 3. Post Detail (`src/app/blog/[slug]/page.tsx`)
- Shows individual post with full content
- Uses default size for emphasis
- Badges positioned below title
- Separated from metadata section

**Layout Structure:**
```
[Date • Tags • Reading Time]
[Title]
[Draft] [Archived] [New] [Hot]
---
[Content with TOC, related posts, etc.]
```

---

## Layout Pattern: Floating Right

Badges typically float to the right of titles for efficient space usage:

```tsx
<div className="flex items-center justify-between gap-2">
  <h1 className="flex-1">{post.title}</h1>
  <div className="flex gap-2 flex-shrink-0">
    <PostBadges 
      post={post} 
      isLatestPost={isLatest}
      isHotPost={isHot}
    />
  </div>
</div>
```

**Key Classes:**
- `flex items-center justify-between gap-2` - Horizontal layout with spacing
- `flex-1` on title - Allows title to expand
- `flex-shrink-0` on badges - Prevents shrinking
- `gap-2` - Consistent spacing between badges

---

## Responsive Behavior

### Desktop (≥640px)
- Badges display inline after title
- Full-size badges with clear labels
- `text-xs` for `size="sm"`
- `text-sm` for default size

### Mobile (<640px)
- Badges may wrap to next line if space constrained
- Smaller badge size prevents overflow
- Maintain readability with proper spacing

### Implementation

```tsx
// In component
const sizeClass = size === "sm" ? "text-xs" : "text-sm";
```

---

## Styling

### Badge Component

Uses shadcn/ui `Badge` component with `variant="outline"`:

```tsx
<Badge 
  variant="outline" 
  className={`border-color text-color dark:text-dark-color`}
>
  {label}
</Badge>
```

### Theme Support

All badges include:
- Light mode color class (e.g., `text-blue-600`)
- Dark mode color class (e.g., `dark:text-blue-400`)
- Semi-transparent border (e.g., `border-blue-500/50`)

---

## Related Documentation

- [Post List Component](./post-list) - Integration with post cards
- [Blog Architecture](../blog/architecture) - Blog system design
- [Reading Progress](./reading-progress) - Content features

---

## Testing

### Visual Testing

- [ ] Draft badge appears in development only
- [ ] Archived badge always visible for archived posts
- [ ] New badge shows for latest post only
- [ ] Hot badge shows for most viewed post
- [ ] Badge colors correct in light/dark mode
- [ ] Badges responsive on mobile/desktop
- [ ] Size prop changes badge dimensions

### Functional Testing

- [ ] Latest post correctly identified
- [ ] Hot post calculated from view counts
- [ ] Badges don't display when no conditions met
- [ ] Multiple posts can't have same badge (New/Hot)
- [ ] Props validation works

### Edge Cases

- [ ] No badges scenario (regular old post)
- [ ] All badges (draft post that's latest)
- [ ] Archived post never shows "New"
- [ ] Post with zero views (but is hottest)

---

## Performance

### Rendering
- Static badges once calculated
- No re-renders on scroll or interaction
- CSS classes applied at build time

### View Count Lookup
- Batched view retrieval for lists
- Single lookup for detail pages
- Fallback to zero for unknown posts

---

## Future Enhancements

### Potential Badge Types

1. **Updated Badge**
   - Color: Purple
   - Shows posts updated within X days
   - Field: `post.updatedAt`

2. **Featured Badge**
   - Color: Gold
   - Shows featured posts
   - Field: `post.featured`

3. **Series Badge**
   - Color: Cyan
   - Groups related posts
   - Field: `post.series`

### Configuration

- Move badge definitions to config file
- Allow custom colors and labels
- Add feature flags per badge type
- Support custom badge ordering

---

## Related Components

- **Post List** (`post-list.tsx`) - Uses PostBadges in card layout
- **Blog Search Form** (`blog-search-form.tsx`) - Filters by badge type
- **Post Card** (inline) - Displays badge with post metadata

---

## Component API

### Props

```typescript
interface PostBadgesProps {
  post: Post;              // The post object
  size?: "default" | "sm"; // Badge size (default: "default")
  isLatestPost?: boolean;  // True if latest published post
  isHotPost?: boolean;     // True if most viewed post
}
```

### Returns

- JSX with badge elements
- `null` if no badges to display

### Throws

- TypeScript error if `post` prop missing (required)

---

## Example Implementations

### Homepage Card
```tsx
<article className="group">
  <div className="text-xs text-muted-foreground">
    {post.date} • {tags.join(", ")} • {readingTime}
  </div>
  
  <div className="flex items-center justify-between gap-2">
    <h3 className="flex-1">
      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
    </h3>
    <div className="flex-shrink-0">
      <PostBadges 
        post={post}
        size="sm"
        isLatestPost={latestPost?.slug === post.slug}
        isHotPost={hottestSlug === post.slug && maxViews > 0}
      />
    </div>
  </div>
  
  <p className="text-sm text-muted-foreground">{post.summary}</p>
</article>
```

### Post Detail
```tsx
<article>
  <div className="text-xs text-muted-foreground">
    {post.date} • {tags.join(", ")} • {readingTime} • {views} views
  </div>
  
  <h1>{post.title}</h1>
  
  <div className="flex gap-2 my-4">
    <PostBadges 
      post={post}
      isLatestPost={latestPost?.slug === post.slug}
      isHotPost={hottestSlug === post.slug && maxViews > 0}
    />
  </div>
  
  <div className="prose">{/* Post content */}</div>
</article>
```

---

## Notes

- Badge order is semantic: Draft → Archived → New → Hot
- Uses outline variant for subtle, non-intrusive display
- All color coding follows accessibility standards
- No external API calls (all local state)
- Zero dependencies beyond shadcn/ui Badge

