# Blog System Architecture

**Status:** ✅ Implemented  
**Last Updated:** October 23, 2025  
**Related:** [MDX Processing](./mdx-processing) · [Content Creation](./content-creation) · [Quick Reference](./quick-reference)

---

## Summary

The blog system is a full-featured MDX-powered content platform built on Next.js App Router. It supports rich content authoring, automatic metadata extraction, intelligent post recommendations, and comprehensive reader features like table of contents, reading progress, and view tracking.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Content Layer                            │
│  src/content/blog/*.mdx (MDX files with frontmatter)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ File system read + parse
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  src/lib/blog.ts       ← File operations, parsing           │
│  src/data/posts.ts     ← Exported array of Post objects     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Server-side import
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Rendering Layer                            │
│  src/app/blog/page.tsx       ← Post list with search        │
│  src/app/blog/[slug]/page.tsx ← Individual post pages       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Component composition
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Component Layer                             │
│  PostList, PostBadges, RelatedPosts, TableOfContents, etc.  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ MDX rendering
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                         │
│  MDX → HTML with syntax highlighting, auto-linking, etc.    │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Layers

### 1. Content Layer

**Location:** `src/content/blog/`

MDX files serve as the source of truth for blog content. Each file contains:

- **Frontmatter** (YAML): Metadata (title, summary, dates, tags, status flags)
- **Content** (Markdown/MDX): Blog post body with GitHub-flavored markdown support

**Example:**
```mdx
---
title: "My Blog Post"
summary: "A brief description"
publishedAt: "2025-10-23"
tags: ["next.js", "react"]
featured: true
---

## Introduction

Post content goes here...
```

**Key Features:**
- Version controlled (Git)
- Type-safe via TypeScript validation
- Hot-reloadable in development
- Build-time parsing for performance

---

### 2. Data Layer

**Primary Files:**
- `src/lib/blog.ts` - File system operations and parsing
- `src/data/posts.ts` - Exported array of all posts

**Responsibilities:**

#### `src/lib/blog.ts`
- `getAllPosts()` - Reads all MDX files, parses frontmatter, calculates reading time
- `getPostBySlug(slug)` - Retrieves a single post by slug
- `calculateReadingTime(content)` - Computes reading metrics (words, minutes)
- Draft filtering (production vs development)
- Sorting (newest first by publishedAt)

#### `src/data/posts.ts`
- Exports `posts: Post[]` - Pre-computed at build time
- Exports `postsBySlug` - Map for O(1) lookup
- Exports `postTagCounts` - Tag frequency for filtering

**Post Type:**
```typescript
type Post = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  featured?: boolean;
  archived?: boolean;
  draft?: boolean;
  body: string; // Raw MDX content
  sources?: PostSource[];
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
};
```

**Build-Time Processing:**
All posts are parsed once at build time (or on dev server start), ensuring fast runtime performance. The `posts` array is a static export that Next.js can statically analyze.

---

### 3. Routing Layer

**Blog List:** `/blog` → `src/app/blog/page.tsx`
- Displays all published posts (excludes drafts in production)
- Client-side search by title, summary, tags
- Post badges (New, Hot, Draft, Archived)
- Responsive grid layout

**Individual Post:** `/blog/[slug]` → `src/app/blog/[slug]/page.tsx`
- Dynamic route for each post
- **Incremental Static Regeneration (ISR)** with 1-hour revalidation
- Server component (pre-rendered at build time with `generateStaticParams`)
- Increments view count on page load
- Shows related posts based on shared tags
- Table of contents (auto-generated from headings)
- Reading progress indicator
- Post metadata (reading time, view count, tags)

**Dynamic Features:**
- `generateStaticParams()` - Pre-generates all post routes at build time
- `generateMetadata()` - Dynamic SEO metadata per post
- Server actions for view count increment

---

### 4. Component Layer

**Core Components:**

#### Post Display
- **`PostList`** - Reusable list component with badges and metadata
- **`PostBadges`** - Status indicators (Draft, Archived, New, Hot)
- **`RelatedPosts`** - Smart recommendations based on shared tags

#### Navigation & Reading
- **`TableOfContents`** - Auto-generated from H2/H3 headings
- **`ReadingProgress`** - Scroll-based progress bar
- **`BlogSearchForm`** - Client-side search with filtering

#### Content Rendering
- **`MDX`** - Core MDX renderer with custom components
- **`BlogPostSkeleton`** - Loading state for posts

#### Error Handling
- **`BlogSearchErrorBoundary`** - Wraps search form
- **`PageErrorBoundary`** - Catches page-level errors

**Component Philosophy:**
- Small, focused, single-responsibility
- Server components by default
- Client components marked with `"use client"`
- Comprehensive error boundaries
- Loading states for async content

---

### 5. Feature Integrations

#### View Counts (Redis)
- **Location:** `src/lib/views.ts`
- **Storage:** Redis (optional, graceful degradation)
- **Pattern:** `views:post:<slug>`
- **Operations:** `incrementPostViews()`, `getPostViews()`

#### Related Posts Algorithm
- **Location:** `src/lib/related-posts.ts`
- **Scoring:** Shared tags + featured bonus - archived penalty
- **Limit:** Top 3 most relevant posts
- **Filtering:** Excludes current post and drafts

#### Table of Contents
- **Location:** `src/lib/toc.ts`
- **Extraction:** Parses H2/H3 from MDX content
- **Display:** Fixed sidebar on XL+ screens
- **Features:** Active section tracking, smooth scroll

#### RSS/Atom Feeds
- **Routes:** `/rss.xml`, `/atom.xml`
- **Content:** Full HTML (converted from MDX)
- **Limit:** 20 most recent posts
- **Metadata:** Tags, author, dates, view counts

---

## Data Flow

### Post Creation → Display

```
1. Author writes post.mdx in src/content/blog/
   ↓
2. File saved, dev server hot-reloads
   ↓
3. getAllPosts() reads file system
   ↓
4. gray-matter parses frontmatter + body
   ↓
5. Reading time calculated
   ↓
6. Post object added to posts array
   ↓
7. Posts sorted by publishedAt (newest first)
   ↓
8. /blog page imports posts array
   ↓
9. PostList component renders list
   ↓
10. User clicks post → /blog/[slug]
    ↓
11. MDX content rendered with syntax highlighting
    ↓
12. View count incremented in Redis
    ↓
13. Related posts calculated and displayed
```

### Build-Time Optimization

```
Build Start
  ↓
getAllPosts() executes
  ↓
All MDX files parsed
  ↓
posts array exported from src/data/posts.ts
  ↓
generateStaticParams() creates routes for all posts
  ↓
Each post page pre-rendered as static HTML
  ↓
Static HTML + JSON generated
  ↓
Deploy to CDN (instant page loads)
  ↓
Incremental Static Regeneration (ISR)
  - Pages cached for 1 hour
  - Background revalidation after expiry
  - Automatic content updates without rebuild
```

**Performance Benefits:**
- **Fast page loads**: Static HTML served from CDN
- **Fresh content**: Automatic updates every hour
- **Scalability**: No server rendering on every request
- **View count updates**: Picked up during revalidation

See [ISR Implementation Guide](../performance/isr-implementation) for details.

---

## Post Lifecycle States

### Draft (Development Only)
- **Flag:** `draft: true`
- **Visibility:** Development only
- **Badge:** Blue "Draft" badge
- **URL Access:** 404 in production
- **Purpose:** Work-in-progress posts

### Published (Active)
- **Flag:** No special flag
- **Visibility:** Always visible
- **Features:** Full feature set
- **SEO:** Indexed, in sitemap
- **Purpose:** Active blog content

### Featured (Highlighted)
- **Flag:** `featured: true`
- **Visibility:** Highlighted on homepage
- **Benefits:** Related posts score bonus
- **Purpose:** Showcase best content

### Archived (Legacy)
- **Flag:** `archived: true`
- **Visibility:** Visible with warning
- **Badge:** Amber "Archived" badge
- **Penalty:** Related posts score reduction
- **Purpose:** Outdated but kept for reference

### New (Recent)
- **Condition:** Published < 7 days ago
- **Badge:** Green "New" badge
- **Auto-calculated:** Based on publishedAt
- **Purpose:** Highlight fresh content

### Hot (Popular)
- **Condition:** Most views across all posts
- **Badge:** Red "Hot" badge
- **Auto-calculated:** From Redis view counts
- **Purpose:** Highlight trending content

---

## Environment-Based Behavior

### Development Mode
- Draft posts visible
- Cache indicators shown (GitHub API, etc.)
- Hot reload on content changes
- View count testing enabled
- Debug badges displayed

### Production Mode
- Draft posts filtered out (404 on direct access)
- Draft badges hidden
- Cache indicators hidden
- Optimized builds
- Analytics enabled

---

## Performance Characteristics

### Build Time
- **Post Parsing:** O(n) where n = number of posts
- **Static Generation:** All routes pre-rendered
- **Bundle Size:** Minimal (server-side parsing)

### Runtime
- **Post Lookup:** O(1) via `postsBySlug` map
- **Related Posts:** O(n) calculation, server-side
- **View Counts:** Single Redis operation
- **MDX Rendering:** Cached after first render

### Optimization Strategies
1. Build-time parsing (not runtime)
2. Server components reduce client bundle
3. Dynamic imports for heavy components
4. Redis for view count caching
5. Static params for route pre-generation

---

## Security Considerations

### Content Security
- **MDX Sanitization:** `rehype-sanitize` prevents XSS
- **User Input:** No user-generated MDX (author-only)
- **File Access:** Restricted to `src/content/blog/` only

### API Security
- **Rate Limiting:** All API routes protected (Redis)
- **Input Validation:** Server-side validation
- **Error Handling:** No sensitive data in errors

### Metadata Security
- **XSS Prevention:** Frontmatter values escaped
- **SQL Injection:** N/A (no database)
- **Path Traversal:** Slug validation prevents directory traversal

---

## Extension Points

### Adding New Features

**Custom MDX Components:**
```typescript
// src/components/mdx.tsx
const components = {
  // Add custom component
  CustomCallout: (props) => <div className="callout" {...props} />
};
```

**New Post Metadata:**
```typescript
// 1. Update frontmatter schema in Post type
// 2. Parse in getAllPosts()
// 3. Display in post page or component
```

**Additional Filters:**
```typescript
// src/data/posts.ts
export const postsByCategory = posts.reduce(/* group by category */);
```

**New Algorithms:**
```typescript
// src/lib/custom-algorithm.ts
export function rankPostsByComplexity(posts: Post[]) { /* ... */ }
```

---

## Testing Strategy

### Manual Testing
- Create draft post → verify dev visibility
- Publish post → verify production build
- Test search functionality
- Verify related posts accuracy
- Check view count increment

### Automated Testing (Future)
- Unit tests for `calculateReadingTime()`
- Integration tests for `getAllPosts()`
- E2E tests for post navigation
- Snapshot tests for MDX rendering

---

## Troubleshooting

### Post Not Appearing

**Check:**
1. Is it marked `draft: true`? (dev only)
2. Is file in `src/content/blog/`?
3. Does filename match slug?
4. Is frontmatter valid YAML?
5. Has dev server reloaded?

### MDX Not Rendering

**Check:**
1. Valid markdown syntax?
2. Closing tags balanced?
3. Code blocks properly fenced?
4. Check browser console for errors

### Related Posts Empty

**Check:**
1. Do posts share tags?
2. Are related posts also drafts? (filtered in prod)
3. Is current post the only one with those tags?

### View Count Not Incrementing

**Check:**
1. `REDIS_URL` environment variable set?
2. Redis connection working?
3. Check `/api/github-contributions` for errors
4. Network tab for failed requests

---

## Related Documentation

- [MDX Processing](./mdx-processing) - How MDX is transformed to HTML
- [Content Creation](./content-creation) - Guide to authoring posts
- [Frontmatter Schema](./frontmatter-schema) - Complete field reference
- [Quick Reference](./quick-reference) - Common patterns and snippets
- [Features Index](./features-index) - Complete feature catalog

---

## Future Enhancements

### Planned
- [ ] Post series/collections
- [ ] Tag pages (`/blog/tags/[tag]`)
- [ ] Author pages (multi-author support)
- [ ] Post scheduling (publish in future)
- [ ] Content versioning (edit history)

### Under Consideration
- [ ] Comments system (Giscus)
- [ ] Reactions/likes
- [ ] Email newsletter integration
- [ ] Post translations (i18n)
- [ ] Audio versions (text-to-speech)
- [ ] Interactive code playgrounds
- [ ] Collaborative editing

---

_This architecture powers a production blog system handling MDX content, real-time features, and extensive reader tools while maintaining excellent performance and developer experience._
