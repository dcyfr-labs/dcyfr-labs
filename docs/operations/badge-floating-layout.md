# Badge Floating Layout Update

**Date:** October 20, 2024  
**Status:** ✅ Complete

## Overview

Updated post badges to float to the right of post titles and enhanced badge logic to show "New" for the latest post and "Hot" for the post with the most views.

## Changes Made

### 1. Updated `PostBadges` Component

**File:** `src/components/post-badges.tsx`

**Changes:**
- Added `isLatestPost` prop to show "New" badge for the most recent non-archived post
- Added `isHotPost` prop to show "Hot" badge for the post with the most views
- Updated "New" badge logic from time-based (< 7 days) to latest post only
- Added "Hot" badge with red color scheme

**Badge Types:**
- **Draft** (blue) - Development only, for draft posts
- **Archived** (amber) - For archived posts
- **New** (green) - For the single latest published post (not archived)
- **Hot** (red) - For the post with the most views (not archived)

**Color Classes:**
```tsx
// Draft (blue)
"border-blue-500/50 text-blue-600 dark:text-blue-400"

// Archived (amber)
"border-amber-500/50 text-amber-600 dark:text-amber-400"

// New (green)
"border-green-500/50 text-green-600 dark:text-green-400"

// Hot (red) - NEW
"border-red-500/50 text-red-600 dark:text-red-400"
```

### 2. New Views Helper Function

**File:** `src/lib/views.ts`

**Added:**
```typescript
export async function getMultiplePostViews(slugs: string[]): Promise<Map<string, number>>
```

**Purpose:**
- Efficiently fetch view counts for multiple posts in a single Redis call
- Returns a Map of slug → view count
- Used to determine the "Hot" post with the most views

### 3. Homepage Updates

**File:** `src/app/page.tsx`

**Changes:**
- Made component async to fetch view data
- Calculate latest post (most recent non-archived)
- Calculate hottest post (highest view count)
- Float badges to the right of titles using flexbox

**Layout:**
```tsx
<div className="flex items-center justify-between gap-2">
  <h3 className="text-lg font-medium">
    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
  </h3>
  <div className="flex gap-2 flex-shrink-0">
    <PostBadges 
      post={p} 
      size="sm"
      isLatestPost={latestPost?.slug === p.slug}
      isHotPost={hottestSlug === p.slug && maxViews > 0}
    />
  </div>
</div>
```

### 4. Blog List Updates

**File:** `src/app/blog/page.tsx`

**Changes:**
- Import `getMultiplePostViews`
- Calculate latest and hottest posts
- Float badges to the right of titles
- Pass `isLatestPost` and `isHotPost` props

**Same flexbox layout as homepage**

### 5. Post Detail Page Updates

**File:** `src/app/blog/[slug]/page.tsx`

**Changes:**
- Import `getMultiplePostViews`
- Calculate latest and hottest posts
- Float badges to the right of the title
- Larger badges (no `size="sm"`)

**Layout:**
```tsx
<div className="flex items-start justify-between gap-4">
  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
    {post.title}
  </h1>
  <div className="flex gap-2 flex-shrink-0 pt-1">
    <PostBadges 
      post={post}
      isLatestPost={latestPost?.slug === post.slug}
      isHotPost={hottestSlug === post.slug && maxViews > 0}
    />
  </div>
</div>
```

## Visual Structure

### Before (Badges Below Title)
```
[Date • Tags • Reading Time]
[Post Title]
[Draft] [Archived] [New]     ← Below title
[Summary]
```

### After (Badges Floating Right)
```
[Date • Tags • Reading Time]
[Post Title ...................... Draft | Hot]  ← Floating right
[Summary]
```

## Badge Logic

### New Badge
- **Old:** Posts published within last 7 days
- **New:** Only the single latest published post (not archived)
- **Reason:** More meaningful indicator of what's newest

### Hot Badge
- **Condition:** Post with the most views across all posts
- **Requirement:** Must have at least 1 view
- **Exclusion:** Archived posts cannot be "Hot"
- **Purpose:** Highlight popular content

## Technical Details

### View Count Fetching
- Uses Redis `mGet` to batch fetch view counts efficiently
- Fallback to empty Map if Redis unavailable
- Calculates max views to determine hottest post

### Latest Post Calculation
```typescript
const latestPost = [...posts]
  .filter(p => !p.archived)
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))[0];
```

### Hottest Post Calculation
```typescript
let hottestSlug: string | null = null;
let maxViews = 0;
viewMap.forEach((views, slug) => {
  if (views > maxViews) {
    maxViews = views;
    hottestSlug = slug;
  }
});
```

### Responsive Design
- `flex-shrink-0` prevents badges from shrinking
- Badges float right on all screen sizes
- Title remains flexible and wraps if needed
- Gap of 2-4 between title and badges

## Benefits

✅ **Visual Hierarchy** - Badges don't interrupt reading flow  
✅ **Space Efficient** - Better use of horizontal space  
✅ **Cleaner Layout** - Title stands out more prominently  
✅ **Meaningful Indicators** - "New" and "Hot" show actual metrics  
✅ **Performance** - Batch view fetching via Redis mGet

## Testing Checklist

- [ ] Homepage shows badges floating right
- [ ] Blog list shows badges floating right
- [ ] Post detail page shows badges floating right
- [ ] "New" badge appears only on latest post
- [ ] "Hot" badge appears on post with most views
- [ ] Badges wrap properly on mobile
- [ ] Draft badge still shows in development only
- [ ] Archived badge still shows correctly
- [ ] No badge overlap with long titles

## Performance Considerations

- **Redis mGet**: Single round-trip for all view counts
- **Server-side calculation**: Badge logic runs once per page load
- **Static at build time**: Latest/Hot calculated at request time for accuracy

## Future Enhancements

Potential improvements:

1. **Cache badge calculations**
   - Cache latest/hottest slugs for 5 minutes
   - Reduce Redis calls on high-traffic pages

2. **Threshold for Hot badge**
   - Only show "Hot" if views > X
   - Prevent "Hot" badge on low-traffic sites

3. **Multiple "New" posts**
   - Show "New" for posts published within last 3 days
   - Balance between single latest and time-based

4. **Trending badge**
   - Show for posts with increasing view velocity
   - Requires view history tracking

## Files Changed

```
src/
  components/
    post-badges.tsx           MODIFIED - Added isLatestPost, isHotPost props
  lib/
    views.ts                  MODIFIED - Added getMultiplePostViews function
  app/
    page.tsx                  MODIFIED - Async, view fetching, floating badges
    blog/
      page.tsx                MODIFIED - View fetching, floating badges
      [slug]/
        page.tsx              MODIFIED - View fetching, floating badges
```

## Related Documentation

- Post Badges Reorganization - Initial badge implementation
- [View Counts Feature](../platform/view-counts) - View tracking system

## Rollback

To revert these changes:

1. Revert badge floating layout (restore below-title positioning)
2. Revert "New" badge logic (restore time-based < 7 days)
3. Remove "Hot" badge and view fetching logic
4. Remove `getMultiplePostViews` function
