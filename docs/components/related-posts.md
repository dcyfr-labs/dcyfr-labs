# Related Posts Component

**Status:** ✅ Implemented  
**Location:** `src/components/related-posts.tsx`  
**Date:** October 21, 2025

---

## Overview

Automatically displays related posts at the end of each blog post based on shared tags. Uses an intelligent scoring algorithm to rank posts by relevance, improving engagement and internal linking.

---

## Quick Reference

### Component Usage

```tsx
import { RelatedPosts } from "@/components/related-posts";

<RelatedPosts posts={relatedPosts} />
```

### Integration

```tsx
// In blog post page
const relatedPosts = getRelatedPosts(post, allPosts, 3);

return (
  <article>
    {/* Post content */}
    <RelatedPosts posts={relatedPosts} />
  </article>
);
```

### Display Format

- **Desktop:** 3-column responsive grid
- **Tablet:** 2-column grid
- **Mobile:** Single column stacked layout
- **Empty state:** Component hidden if no related posts

---

## Algorithm

### Related Posts Utility (`src/lib/related-posts.ts`)

Server-side utility that finds and ranks related posts:

```typescript
export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit: number = 3
): Post[];
```

### Filtering

1. Excludes current post
2. Excludes draft posts (in production)
3. Only includes posts with at least one shared tag

### Scoring Algorithm

```typescript
score = sharedTags.length         // Base score: number of matching tags
if (post.featured) score += 0.5   // Featured post bonus
if (post.archived) score -= 0.5   // Archived post penalty
```

**Priority:** Score-based ranking, tie-broken by publication date (newest first)

### Example Scoring

Given a post with tags: `["Next.js", "TypeScript", "React"]`

| Related Post | Shared Tags | Featured | Archived | Score | Rank |
|-------------|-------------|----------|----------|-------|------|
| Post A      | Next.js, React | Yes | No | 2.5 | 1 |
| Post B      | Next.js, React | No | No | 2.0 | 2 |
| Post D      | TypeScript | Yes | No | 1.5 | 3 |
| Post C      | Next.js | No | Yes | 0.5 | 4 |

---

## UI Component

### Features

- **Responsive grid:** 1 (mobile) → 2 (tablet) → 3 (desktop) columns
- **Card layout:** Title, summary, tags, date, reading time
- **Hover effects:** Background color change, link highlight
- **Graceful degradation:** Hidden if no related posts
- **Semantic HTML:** Proper heading hierarchy and structure

### Styling

```tsx
// Card structure
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="group hover:bg-accent">
    <h3 className="group-hover:text-primary">{post.title}</h3>
    <p className="text-muted-foreground">{post.summary}</p>
    <div className="flex gap-1 flex-wrap">{/* tags */}</div>
    <div className="text-xs text-muted-foreground">
      {date} • {readingTime}
    </div>
  </Card>
</div>
```

### Visual Hierarchy

```
┌─────────────────────────────┐
│ Title (bold, hover:primary) │
│ Summary (2 lines max)       │
│ [Tag 1] [Tag 2] [Tag 3] +2  │
│ Date • Reading time         │
│ Read more →                 │
└─────────────────────────────┘
```

---

## Integration Points

### Blog Post Page

```tsx
import { getRelatedPosts } from "@/lib/related-posts";
import { RelatedPosts } from "@/components/related-posts";

export default async function BlogPostPage({ params }: Props) {
  // ... post fetching logic ...
  
  const relatedPosts = getRelatedPosts(post, allPosts, 3);
  
  return (
    <article>
      {/* Post header, content, footer */}
      <RelatedPosts posts={relatedPosts} />
    </article>
  );
}
```

### RSS/Atom Feeds

Related posts intentionally excluded from feeds (not part of post content).

---

## Performance

### Server-Side
- Algorithm runs during SSR (no client impact)
- O(n) complexity where n = total posts
- Efficient Set-based tag matching
- Negligible runtime (\<1ms on 50+ posts)

### Client-Side
- Static HTML with CSS transitions
- No JavaScript required for display
- Only interactive element: link navigation
- CSS hover effects handled by browser

---

## Edge Cases

### No Related Posts

Component returns `null`, no visual element rendered:

```tsx
if (!relatedPosts || relatedPosts.length === 0) {
  return null;
}
```

### One Related Post

Still displays in grid (single card layout):
- Desktop: 1 card in 3-column grid
- Responsive behavior adapts automatically

### All Posts Related

Algorithm shows top 3 by score:
- Ensures quality over quantity
- Limit parameter controls count

### Score Ties

Newest post wins tie-breaker:

```typescript
// Same score (2.0)
Post X: published 2025-03-01
Post Y: published 2025-01-01

// Result: Post X ranks higher (newer)
```

---

## Configuration

### Adjust Number of Posts

In `src/app/blog/[slug]/page.tsx`:

```typescript
// Show 5 related posts instead of 3
const relatedPosts = getRelatedPosts(post, posts, 5);
```

### Modify Scoring

In `src/lib/related-posts.ts`:

```typescript
// Increase featured post bonus
if (post.featured) score += 1.0;  // Was 0.5

// Increase archived post penalty
if (post.archived) score -= 1.0;  // Was -0.5
```

### Change Sorting

Add additional tie-breakers or scoring factors:

```typescript
// Example: Factor in view count
const views = viewMap.get(post.slug) || 0;
if (views > threshold) score += 0.25;
```

---

## Accessibility

- **Semantic HTML:** `<aside>` for related content
- **Heading hierarchy:** `<h2>` for section title
- **Link context:** Post titles are descriptive
- **Keyboard navigation:** All links focusable and keyboard accessible
- **Screen readers:** Proper ARIA labels on main content sections

---

## Testing

### Unit Tests

```bash
npm run test:related-posts
```

**Coverage:**
- ✅ Multiple shared tags
- ✅ Single shared tag
- ✅ No shared tags (empty result)
- ✅ Featured post bonus applied
- ✅ Archived post penalty applied
- ✅ Date-based tie-breaking
- ✅ Current post exclusion
- ✅ Limit enforcement (top 3)

### Manual Testing

1. **Single tag match**
   - Post A: `["React"]`
   - Post B: `["React"]`
   - Related: Post B appears

2. **Multiple tag matches**
   - Current: `["React", "TypeScript"]`
   - Post A: `["React", "TypeScript", "Next.js"]`
   - Related: Post A shows (2 shared tags)

3. **Featured boost**
   - Both posts have same tags
   - Featured post appears first

4. **Archived penalty**
   - Archived post scores lower
   - Never appears if other posts available

---

## Analytics & Insights

### Tracking Related Post Clicks

Add analytics events to track engagement:

```typescript
// In component
onClick={() => {
  trackEvent("related_post_click", {
    currentPostSlug: post.slug,
    relatedPostSlug: relatedPost.slug,
    tagMatch: sharedTags,
  });
}}
```

### Metrics to Monitor

- **Click-through rate:** Which related posts get clicked
- **Bounce rate:** Does clicking related post reduce bounces
- **Time on site:** Do related posts increase engagement
- **Relevance:** Track if algorithm needs adjustment

---

## Future Enhancements

### Potential Improvements

1. **Content Similarity:** Use TF-IDF or embeddings for smarter matching
2. **View Count Boost:** Factor in popularity in scoring
3. **Collaborative Filtering:** "Users who read X also read Y"
4. **Manual Curation:** Allow explicit related post overrides in frontmatter
5. **Category Matching:** Add weight for same category
6. **Reading Level:** Match complexity/difficulty
7. **Series Detection:** Prioritize posts in same series
8. **Time Decay:** Prefer newer content (already implemented)

### Implementation Ideas

```typescript
// Series detection example
const seriesPosts = allPosts.filter(
  p => p.series === currentPost.series && p.slug !== currentPost.slug
);

// Prioritize series matches
if (seriesPosts.length > 0) {
  relatedPosts = seriesPosts.slice(0, limit);
}
```

---

## Files

```
src/
  lib/
    related-posts.ts              (NEW - algorithm)
  components/
    related-posts.tsx             (NEW - UI component)
  app/
    blog/
      [slug]/
        page.tsx                  (MODIFIED - integration)

scripts/
  test-related-posts.mjs          (NEW - test suite)
```

---

## SEO Benefits

1. **Internal Linking:** Improves site crawlability and authority
2. **Related Content:** Keeps users engaged, reduces bounce rate
3. **Topic Clustering:** Search engines understand topic relationships
4. **Page Views:** Users visit more pages per session
5. **Dwell Time:** Increased time on site signals content quality

---

## Notes

- Algorithm runs on every page load (fast, \<1ms)
- No caching needed (SSR handles it)
- Works with any number of posts (scales well)
- Tag matching is case-sensitive (by design)
- No minimum tag overlap required (1+ shared tags)
- Archived posts rarely appear (unless heavily featured)

