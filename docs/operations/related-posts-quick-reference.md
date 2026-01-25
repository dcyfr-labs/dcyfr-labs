{/* TLP:CLEAR */}

# Related Posts Feature

**Status:** ✅ Implemented  
**Date:** October 21, 2025  
**Location:** Blog post pages (`/blog/[slug]`)

---

## Overview

Automatically displays related posts at the end of each blog post based on shared tags. Uses an intelligent scoring algorithm to rank posts by relevance.

---

## Implementation

### 1. Related Posts Algorithm (`src/lib/related-posts.ts`)

Server-side utility that finds and ranks related posts:

```typescript
export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit: number = 3
): Post[];
```

**Filtering:**
- Excludes current post
- Excludes draft posts (in production)
- Only includes posts with at least one shared tag

**Scoring Algorithm:**
```typescript
score = sharedTags.length          // Base score: number of matching tags
if (post.featured) score += 0.5    // Featured bonus
if (post.archived) score -= 0.5    // Archived penalty
```

**Sorting:**
1. Sort by score (descending)
2. Tie-breaker: published date (newest first)

### 2. Related Posts Component (`src/components/related-posts.tsx`)

Displays related posts in a responsive card grid:

```tsx
<RelatedPosts posts={relatedPosts} />
```

**Features:**
- Hidden if no related posts found
- Responsive grid: 1 column (mobile) → 2 columns (sm) → 3 columns (lg)
- Card layout with hover effects
- Shows: title, summary, tags, date, reading time
- "Read more" link appears on hover

### 3. Integration (`src/app/blog/[slug]/page.tsx`)

```typescript
// Server-side: Find related posts
const relatedPosts = getRelatedPosts(post, posts, 3);

// Render at end of article (after sources, before closing </article>)
<RelatedPosts posts={relatedPosts} />
```

---

## User Experience

### Desktop
- 3-column grid of related post cards
- Smooth hover transitions
- Background changes to accent color
- "Read more" link fades in

### Tablet
- 2-column grid

### Mobile
- Single column stacked layout
- Full-width cards

### Empty State
- Component automatically hidden if no related posts
- No UI shown (graceful degradation)

---

## Algorithm Details

### Example Scoring

Given a post with tags: `["Next.js", "TypeScript", "React"]`

| Related Post | Shared Tags | Featured | Archived | Score |
|-------------|-------------|----------|----------|-------|
| Post A      | Next.js, React | Yes | No | 2.5 |
| Post B      | Next.js, React | No | No | 2.0 |
| Post C      | Next.js | No | Yes | 0.5 |
| Post D      | TypeScript | Yes | No | 1.5 |

**Result:** Post A ranks #1 (highest score), followed by Post B, Post D, then Post C.

### Tie-Breaking

If two posts have the same score, the newer post ranks higher:

```typescript
// Same score (2.0)
Post X: published 2025-03-01
Post Y: published 2025-01-01

// Result: Post X ranks higher (newer)
```

---

## Visual Design

### Card Structure

```
┌─────────────────────────────┐
│ Title (bold, hover:primary) │
│ Summary (2 lines max)       │
│ [Tag 1] [Tag 2] [Tag 3] +2  │
│ Date • Reading time         │
│ Read more →                 │
└─────────────────────────────┘
```

### Styling
- Border: Card border color
- Background: Card background → Accent on hover
- Text: Muted foreground
- Title: Foreground → Primary on hover
- "Read more": Primary color, fades in on hover

---

## Performance

### Server-Side
- Algorithm runs during SSR (no client impact)
- O(n) complexity where n = total posts
- Efficient Set-based tag matching

### Client-Side
- Static HTML with CSS transitions
- No JavaScript required for display
- Only interactive element: link navigation

---

## SEO Benefits

1. **Internal Linking:** Improves site crawlability
2. **Related Content:** Keeps users engaged longer
3. **Topic Clustering:** Groups content by theme
4. **User Signals:** Lower bounce rate, higher page views

---

## Edge Cases

### No Related Posts
- Component returns `null`
- No visual element rendered
- No empty state message

### One Related Post
- Still displays in grid (single card)
- Layout adapts responsively

### All Posts Related
- Shows top 3 by score
- Ensures quality over quantity

### Same Score Tie
- Newest post wins
- Consistent, predictable ordering

---

## Testing

Run the test suite:
```bash
npm run test:related-posts
```

**Test Coverage:**
- ✅ Multiple shared tags
- ✅ Single shared tag
- ✅ No shared tags (empty result)
- ✅ Featured post bonus
- ✅ Archived post penalty
- ✅ Date-based tie-breaking
- ✅ Current post exclusion
- ✅ Limit enforcement (top 3)

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
// Adjust bonuses/penalties
let score = sharedTags.length;
if (post.featured) score += 1.0;  // Increase featured bonus
if (post.archived) score -= 1.0;  // Increase archived penalty
```

---

## Future Enhancements

### Potential Improvements

1. **Content Similarity:** Use TF-IDF or embeddings for smarter matching
2. **View Count Boost:** Factor in popularity
3. **Collaborative Filtering:** "Users who read X also read Y"
4. **Manual Curation:** Allow explicit related post overrides in frontmatter
5. **Category Matching:** Add weight for same category
6. **Reading Level:** Match complexity/difficulty
7. **Series Detection:** Prioritize posts in same series
8. **Time Decay:** Prefer newer content

### Analytics Ideas

- Track which related posts are clicked
- Measure engagement time after clicking
- A/B test different scoring algorithms
- Optimize number of recommendations (3 vs 5 vs 7)

---

## Accessibility

- Semantic HTML: `<aside>` for related content
- Proper heading hierarchy: `<h2>` for section title
- Link context: Post titles are descriptive
- Keyboard navigation: All links focusable
- No reliance on hover: Content always visible

---

## Files

```
src/lib/related-posts.ts              (NEW - algorithm)
src/components/related-posts.tsx      (NEW - UI component)
src/app/blog/[slug]/page.tsx         (MODIFIED - integration)
scripts/test-related-posts.mjs       (NEW - test suite)
```

---

## Example Output

For post: "Hardening a Developer Portfolio" (tags: Security, Performance, Next.js)

**Related Posts Shown:**
1. "Shipping a Developer Portfolio" - shares Next.js tag
2. "Performance Optimization" - shares Performance tag
3. "Security Best Practices" - shares Security tag

---

## Notes

- Algorithm runs on every page load (fast, \<1ms)
- No caching needed (SSR handles it)
- Works with any number of posts (scales well)
- Tag matching is case-sensitive (by design)
- No minimum tag overlap required (1+ shared tags)
