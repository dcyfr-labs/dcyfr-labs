# Post List

**Last Updated:** October 27, 2025  
**Location:** `src/components/post-list.tsx`

The `PostList` component displays a collection of blog posts with metadata, badges, and search support. It handles filtering, sorting, and provides multiple customization options.

---

## Quick Reference

### Basic Usage

```tsx
import { PostList } from "@/components/post-list"
import { getPostBadgeMetadata } from "@/lib/post-badges"

const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts)

<PostList 
  posts={posts}
  latestSlug={latestSlug ?? undefined}
  hottestSlug={hottestSlug ?? undefined}
  titleLevel="h2"
  emptyMessage="No posts found."
/>
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `posts` | `Post[]` | ✅ | - | Array of posts to display |
| `latestSlug` | `string` | ❌ | `undefined` | Slug of latest post (shows "New" badge) |
| `hottestSlug` | `string` | ❌ | `undefined` | Slug of hottest post (shows "Hot" badge) |
| `titleLevel` | `"h2" \| "h3"` | ❌ | `"h2"` | Heading level for SEO |
| `emptyMessage` | `string` | ❌ | `"No posts found."` | Message when posts array is empty |

---

## Implementation Details

### Component Structure

```
PostList (Container)
├── Empty state (if no posts)
│   └── Message + helpful text
└── For each post:
    ├── <article> wrapper
    ├── Metadata row
    │   ├── Publication date
    │   ├── Reading time
    │   └── Tags
    ├── Title row (flex layout)
    │   ├── Heading (h2 or h3)
    │   └── Badges (floating right)
    ├── Link wrapper
    └── Summary text
```

### Filtering Rules

**Homepage** – Exclude archived posts:
```tsx
const recentPosts = [...posts]
  .filter(p => !p.archived)  // ← Exclude archived
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  .slice(0, 3)
```

**Blog Page** – Show all posts (including archived):
```tsx
const allPosts = [...posts]
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
```

### Badge Eligibility Matrix

| Badge | Shows if Draft | Shows if Archived | Calculation |
|-------|---|---|---|
| **Draft** | ✅ Yes | N/A | `post.draft === true` (dev only) |
| **Archived** | N/A | ✅ Yes | `post.archived === true` |
| **New** | ❌ No | ❌ No | Latest published post (not draft/archived) |
| **Hot** | ❌ No | ❌ No | Most views (not draft/archived, views > 0) |

---

## Badge Metadata Utility

```tsx
import { getPostBadgeMetadata } from "@/lib/post-badges"

const metadata = await getPostBadgeMetadata(posts)
// Returns: { latestSlug: string | null, hottestSlug: string | null }

<PostList 
  posts={posts}
  latestSlug={metadata.latestSlug ?? undefined}
  hottestSlug={metadata.hottestSlug ?? undefined}
/>
```

**Function Logic:**
- **Latest:** Most recent post that is NOT draft AND NOT archived
- **Hottest:** Post with most views that is NOT draft AND NOT archived
- Returns `null` if criteria not met

---

## Page-Specific Examples

### Homepage (src/app/page.tsx)

```tsx
export default async function Home() {
  const recentPosts = [...posts]
    .filter(p => !p.archived)  // ← Exclude archived
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3)

  const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts)

  return (
    <PostList 
      posts={recentPosts}
      latestSlug={latestSlug ?? undefined}
      hottestSlug={hottestSlug ?? undefined}
      titleLevel="h3"  // ← h3 for homepage (h1 is page title)
    />
  )
}
```

### Blog Page (src/app/blog/page.tsx)

```tsx
export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { q?: string; tag?: string }
}) {
  const tag = searchParams?.tag
  const query = searchParams?.q?.toLowerCase() ?? ""

  // No archived filter - show all posts
  const filtered = posts.filter((post) => {
    const matchesTag = !tag || post.tags.includes(tag)
    if (!matchesTag) return false
    if (!query) return true
    const haystack = `${post.title} ${post.summary}...`.toLowerCase()
    return haystack.includes(query)
  })

  const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts)

  return (
    <PostList 
      posts={filtered}
      latestSlug={latestSlug ?? undefined}
      hottestSlug={hottestSlug ?? undefined}
      titleLevel="h2"  // ← h2 for blog page
      emptyMessage="No posts found. Try adjusting your search or filters."
    />
  )
}
```

---

## Styling

### Key Classes
- `rounded-lg border p-4` – Card container
- `transition-colors hover:bg-muted/50` – Hover effect
- `text-xs text-muted-foreground` – Metadata text
- `flex items-center justify-between gap-2` – Title + badges
- `flex-shrink-0` – Prevents badge wrapping

### Custom Styling
```tsx
// Component automatically uses site theme (light/dark mode)
// No additional styling needed; uses Tailwind + site tokens
```

---

## Related Components

- **PostBadges** (`src/components/post-badges.tsx`) – Individual badge rendering
- **BlogSearchForm** (`src/components/blog-search-form.tsx`) – Search/filter UI
- **RelatedPosts** (`src/components/related-posts.tsx`) – Recommendation engine

---

## Common Patterns

### Featured Posts Section
```tsx
const featured = posts.filter(p => p.featured && !p.archived)
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts)

<PostList 
  posts={featured}
  latestSlug={latestSlug}
  hottestSlug={hottestSlug}
  titleLevel="h2"
  emptyMessage="No featured posts."
/>
```

### Tag-Specific Posts
```tsx
const tagged = posts.filter(p => p.tags.includes("security"))
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts)

<PostList 
  posts={tagged}
  latestSlug={latestSlug}
  hottestSlug={hottestSlug}
/>
```

### Archive Page
```tsx
const archived = posts.filter(p => p.archived)
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts)

<PostList 
  posts={archived}
  latestSlug={latestSlug}
  hottestSlug={hottestSlug}
  emptyMessage="No archived posts."
/>
```

### Sorted by Popularity
```tsx
const popular = [...posts]
  .filter(p => !p.archived)
  .sort((a, b) => {
    // Get view counts for both
    const aViews = getViewCount(a.slug) ?? 0
    const bViews = getViewCount(b.slug) ?? 0
    return bViews - aViews
  })

<PostList posts={popular} />
```

---

## Performance

### Optimizations
- **Single metadata call:** Call `getPostBadgeMetadata` once per page
- **Batch Redis queries:** Uses `mGet` for efficient view fetching
- **Server-side rendering:** All calculations happen on the server
- **No client JavaScript:** Pure SSR component (no hydration needed)
- **Efficient sorting:** Sort once before rendering

### Data Flow
```
posts[] 
  → Filter (archived, search, tags)
  → Sort (date, views, etc.)
  → Calculate badges (latest, hottest)
  → Render PostList component
```

---

## Troubleshooting

### Badges Not Showing

**Issue:** New or Hot badges don't appear on posts

**Check:**
1. Ensure `latestSlug` or `hottestSlug` are passed to component
2. Verify `getPostBadgeMetadata` is called on parent page
3. Check post is not draft/archived (ineligible)
4. Verify view counts are loading (Redis connected)

**Solution:**
```tsx
// Debug: Log what's being passed
console.log("Latest:", latestSlug, "Hottest:", hottestSlug)

// Verify badge eligibility
const eligible = posts.filter(p => !p.draft && !p.archived)
```

### Empty State Showing Incorrectly

**Issue:** Empty message shows when posts exist

**Check:**
1. Array is being filtered correctly
2. Filter condition is not too restrictive
3. Array is populated before passing to component

**Solution:**
```tsx
// Debug: Log filtered posts
console.log("Posts to display:", posts.length)
console.log("Filtered posts:", filtered.length)
```

---

## Files

- **Component:** `src/components/post-list.tsx`
- **Badges Utility:** `src/lib/post-badges.ts`
- **Type Definition:** `src/data/posts.ts` (Post type)
- **Badge Component:** `src/components/post-badges.tsx`

---

## Related Documentation

- [Post Badges](./post-badges) – Badge system and eligibility
- [Related Posts](./related-posts) – Post recommendation algorithm
- [Blog System](../blog/architecture) – Blog architecture overview

---

**Migrated from:** `/docs/operations/post-list-quick-reference.md`  
**Last Updated:** October 27, 2025
