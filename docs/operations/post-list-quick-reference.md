<!-- TLP:CLEAR -->

# Post List Quick Reference

## Component Usage

```tsx
import { PostList } from "@/components/post-list";
import { getPostBadgeMetadata } from "@/lib/post-badges";

// Get badge metadata
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

// Render post list
<PostList 
  posts={posts}
  latestSlug={latestSlug ?? undefined}
  hottestSlug={hottestSlug ?? undefined}
  titleLevel="h2"
  emptyMessage="No posts found."
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `posts` | `Post[]` | ✅ Yes | - | Array of posts to display |
| `latestSlug` | `string` | ❌ No | `undefined` | Slug of latest post (for "New" badge) |
| `hottestSlug` | `string` | ❌ No | `undefined` | Slug of hottest post (for "Hot" badge) |
| `titleLevel` | `"h2" \| "h3"` | ❌ No | `"h2"` | Heading level for SEO |
| `emptyMessage` | `string` | ❌ No | `"No posts found."` | Message when posts array is empty |

## Filtering Rules

### Homepage
```tsx
// Filter out archived posts
const recentPosts = [...posts]
  .filter(p => !p.archived)
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  .slice(0, 3);
```

### Blog Page
```tsx
// Show all posts (including archived)
const allPosts = [...posts]
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
```

## Badge Eligibility

| Badge | Draft | Archived | Calculation |
|-------|-------|----------|-------------|
| **Draft** | ✅ | N/A | `post.draft === true` (dev only) |
| **Archived** | N/A | ✅ | `post.archived === true` |
| **New** | ❌ | ❌ | Latest published post (not draft/archived) |
| **Hot** | ❌ | ❌ | Most views (not draft/archived, views > 0) |

## Badge Metadata Utility

```tsx
import { getPostBadgeMetadata } from "@/lib/post-badges";

// Returns { latestSlug, hottestSlug }
const metadata = await getPostBadgeMetadata(posts);

// Use in PostList
<PostList 
  posts={posts}
  latestSlug={metadata.latestSlug ?? undefined}
  hottestSlug={metadata.hottestSlug ?? undefined}
/>
```

**Function Signature:**
```typescript
async function getPostBadgeMetadata(posts: Post[]): Promise<{
  latestSlug: string | null;   // Most recent non-archived, non-draft
  hottestSlug: string | null;  // Most viewed non-archived, non-draft
}>
```

## Page-Specific Examples

### Homepage (src/app/page.tsx)

```tsx
const recentPosts = [...posts]
  .filter(p => !p.archived)  // ← Exclude archived
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  .slice(0, 3);

const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

<PostList 
  posts={recentPosts}
  latestSlug={latestSlug ?? undefined}
  hottestSlug={hottestSlug ?? undefined}
  titleLevel="h3"  // ← h3 for homepage
/>
```

### Blog Page (src/app/blog/page.tsx)

```tsx
// No archived filter - show all posts
const filtered = all.filter((post) => {
  const matchesTag = !tag || post.tags.includes(tag);
  if (!matchesTag) return false;
  if (!normalizedQuery) return true;
  const haystack = `${post.title} ${post.summary}...`.toLowerCase();
  return haystack.includes(normalizedQuery);
});

const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

<PostList 
  posts={filtered}
  latestSlug={latestSlug ?? undefined}
  hottestSlug={hottestSlug ?? undefined}
  titleLevel="h2"  // ← h2 for blog page
  emptyMessage="No posts found. Try adjusting your search or filters."
/>
```

## Component Structure

```
PostList
├── If posts.length === 0:
│   └── Empty state with custom message
└── For each post:
    ├── <article> with hover effect
    ├── Metadata row (date, reading time, tags)
    ├── Title row (flex layout)
    │   ├── <h2> or <h3> with link
    │   └── Badges (floating right)
    └── Summary text
```

## Styling

The component uses these key classes:
- `rounded-lg border p-4` - Card container
- `transition-colors hover:bg-muted/50` - Hover effect
- `text-xs text-muted-foreground` - Metadata text
- `flex items-center justify-start gap-2` - Title + badges layout
- `flex-shrink-0` - Prevents badge wrapping

## Related Components

- **PostBadges** (`src/components/post-badges.tsx`) - Individual badge rendering
- **BlogSearchForm** (`src/components/blog-search-form.tsx`) - Search/filter UI

## Common Patterns

### Featured Posts Section
```tsx
const featured = posts.filter(p => p.featured && !p.archived);
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

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
const tagged = posts.filter(p => p.tags.includes("security"));
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

<PostList 
  posts={tagged}
  latestSlug={latestSlug}
  hottestSlug={hottestSlug}
  titleLevel="h2"
  emptyMessage="No security posts yet."
/>
```

### Archive Page
```tsx
const archived = posts.filter(p => p.archived);
const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);

<PostList 
  posts={archived}
  latestSlug={latestSlug}
  hottestSlug={hottestSlug}
  titleLevel="h2"
  emptyMessage="No archived posts."
/>
```

## Performance

- **Single badge calculation**: Call `getPostBadgeMetadata` once per page
- **Efficient Redis**: Uses `mGet` for batch view fetching
- **Server-side rendering**: All calculations happen on the server
- **No client JavaScript**: Pure SSR component

## Files

- **Component**: `src/components/post-list.tsx`
- **Utility**: `src/lib/post-badges.ts`
- **Type**: `src/data/posts.ts` (Post type)
- **Badges**: `src/components/post-badges.tsx`

## Related Documentation

- Post List Refactoring - Full implementation guide
- [Post Badges Quick Reference](./post-badges-quick-reference) - Badge system
- [Badge Floating Layout](./badge-floating-layout) - Badge positioning
