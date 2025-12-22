# Slug Redirects Implementation: Visual Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Blog Post Frontmatter                        │
├─────────────────────────────────────────────────────────────────┤
│ ---                                                             │
│ title: "Post Title"                                             │
│ summary: "..."                                                  │
│ publishedAt: "2025-10-15"                                       │
│ tags: ["tag1", "tag2"]                                          │
│                                                                 │
│ ✨ NEW FIELD:                                                   │
│ previousSlugs:                   ◄── Define old URLs here       │
│   - "old-slug-1"                                                │
│   - "old-slug-2"                                                │
│ ---                                                             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ gray-matter parses
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Post Object (TypeScript)                           │
├─────────────────────────────────────────────────────────────────┤
│ {                                                               │
│   slug: "new-slug",                 ◄── From filename           │
│   title: "Post Title",                                          │
│   summary: "...",                                               │
│   publishedAt: "2025-10-15",                                    │
│   tags: ["tag1", "tag2"],                                       │
│                                                                 │
│   ✨ NEW:                                                       │
│   previousSlugs: ["old-slug-1", "old-slug-2"]                  │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────────┐         ┌──────────────────────┐
│ generateStaticParams │         │  Utility Functions   │
├──────────────────────┤         ├──────────────────────┤
│                      │         │                      │
│ Build-time:          │         │ getPostByAnySlug()   │
│                      │         │ getCanonicalSlug()   │
│ Add both old & new   │         │ buildRedirectMap()   │
│ slugs to params      │         │                      │
│                      │         │ ← Used by page       │
│ /blog/new-slug ✓     │         │   component          │
│ /blog/old-slug-1 ✓   │         │                      │
│ /blog/old-slug-2 ✓   │         │                      │
│                      │         │                      │
│ → All prerendered    │         │ → Runtime lookup     │
│                      │         │                      │
└──────────────────────┘         └──────────────────────┘
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │   PostPage Component             │
        │   [slug]/page.tsx                │
        └────────────┬─────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    User visits old URL    User visits new URL
         │                       │
         ▼                       ▼
    /blog/old-slug-1       /blog/new-slug
         │                       │
         │ getPostByAnySlug()    │ getPostByAnySlug()
         │                       │
         ▼                       ▼
    needsRedirect=true      needsRedirect=false
         │                       │
         ▼                       ▼
    redirect()              Show post
    (301 Permanent)         normally
         │                       │
         └───────────┬───────────┘
                     │
                Browser shows:
                /blog/new-slug
```

## Request/Response Flow

### Old URL Request
```
User Action:
  Visit: https://example.com/blog/old-slug-name
         │
         ▼
Next.js Router:
  Match: /blog/[slug]
  slug = "old-slug-name"
         │
         ▼
PostPage Component:
  getPostByAnySlug("old-slug-name", posts)
         │
         ├─ Check if "old-slug-name" matches any post.slug
         │  ✗ No direct match
         │
         └─ Check if "old-slug-name" in any post.previousSlugs
            ✓ Found! In post with slug="new-slug-name"
         │
         ▼
  Result:
  {
    post: Post object,
    needsRedirect: true,
    canonicalSlug: "new-slug-name"
  }
         │
         ▼
  if (needsRedirect) {
    redirect("/blog/new-slug-name")
  }
         │
         ▼
HTTP Response:
  Status: 307 Temporary Redirect (dev) / 301 Permanent (prod)
  Location: /blog/new-slug-name
         │
         ▼
Browser:
  Follow redirect automatically
         │
         ▼
Display: https://example.com/blog/new-slug-name
```

### New URL Request
```
User Action:
  Visit: https://example.com/blog/new-slug-name
         │
         ▼
PostPage Component:
  getPostByAnySlug("new-slug-name", posts)
         │
         ├─ Check if "new-slug-name" matches any post.slug
         │  ✓ Direct match found!
         │
         ▼
  Result:
  {
    post: Post object,
    needsRedirect: false,
    canonicalSlug: "new-slug-name"
  }
         │
         ▼
  if (needsRedirect) {
    // Skip, no redirect needed
  }
         │
         ▼
Render post normally
Display content
```

## File Structure

```
src/
├── data/
│   └── posts.ts                          ◄── Post type with previousSlugs
│
├── lib/
│   └── blog.ts                           ◄── Utility functions:
│       ├── getPostByAnySlug()              • getPostByAnySlug()
│       ├── getCanonicalSlug()              • getCanonicalSlug()
│       └── buildRedirectMap()              • buildRedirectMap()
│
├── app/
│   └── blog/[slug]/
│       └── page.tsx                      ◄── Redirect logic
│           ├── generateStaticParams()      includes old + new slugs
│           ├── generateMetadata()          uses getPostByAnySlug()
│           └── PostPage()                  handles redirect
│
└── content/
    └── blog/
        └── *.mdx                         ◄── Frontmatter with previousSlugs

docs/
├── blog/
│   ├── frontmatter-schema.md             ◄── Updated with previousSlugs
│   ├── slug-redirects-guide.md           ◄── NEW: Comprehensive guide
│   └── REDIRECTS_IMPLEMENTATION.md       ◄── NEW: Implementation details
│
└── SLUG_REDIRECTS_QUICKSTART.md          ◄── NEW: Quick reference
```

## Data Flow: From File to Browser

```
MDX File
  │
  ├─ Frontmatter (YAML)
  │   previousSlugs:
  │     - "old-slug"
  │
  └─ Content (MDX)
      
       │
       ▼
fs.readFileSync()
  (Read file contents)
       │
       ▼
gray-matter()
  (Parse frontmatter)
       │
       ├─ data: {title, summary, ..., previousSlugs}
       └─ content: MDX body
       │
       ▼
Post object creation
  {
    slug: filename without .mdx
    title: data.title
    ...
    previousSlugs: data.previousSlugs  ◄── Parsed here
  }
       │
       ├─ At build time:
       │  └─ generateStaticParams()
       │     ├─ Add post.slug
       │     └─ Add post.previousSlugs
       │
       └─ At request time:
          └─ getPostByAnySlug(requestedSlug, posts)
             ├─ Check post.slug
             └─ Check post.previousSlugs
                ├─ Match: no redirect needed
                └─ No match: redirect to canonical
                   
                       ▼
                 Browser receives
                 301 Permanent Redirect
                   
                       ▼
                 Browser follows redirect
                   
                       ▼
                 User sees post on new URL
```

## Lookup Performance

### Build Time (One-time)
```
getAllPosts()
  ├─ Read all .mdx files
  ├─ Parse each file
  ├─ Extract slug from filename
  ├─ Extract previousSlugs from frontmatter
  └─ Return array of Post objects
  
  Time: ~10-50ms (depending on number of posts)
```

### Request Time (Per-request)
```
getPostByAnySlug(slug, posts)
  ├─ Loop through posts
  │  ├─ Check if slug === post.slug
  │  └─ Check if slug in post.previousSlugs
  └─ Return match or null
  
  Time: O(n) where n = number of posts
  Actual: &lt;1ms for typical blog (10-100 posts)
  
  Note: Already prerendered at build time,
        so most requests hit static cache
```

## Example: Multiple Slug Changes

### Scenario
Post renamed 4 times during its lifecycle:

```
Timeline:
├─ 2025-05-01: Created as "react-tutorial.mdx"
├─ 2025-06-15: Renamed to "react-hooks-guide.mdx"
├─ 2025-08-20: Renamed to "hooks-comprehensive.mdx"
└─ 2025-10-27: Renamed to "react-hooks-deep-dive.mdx"
```

### Frontmatter
```yaml
---
title: "React Hooks: Deep Dive"
summary: "..."
publishedAt: "2025-05-01"
updatedAt: "2025-10-27"

previousSlugs:
  - "react-tutorial"           ← Original
  - "react-hooks-guide"        ← 2nd version
  - "hooks-comprehensive"      ← 3rd version
---
```

### URLs
```
All these URLs now work:
✓ /blog/react-hooks-deep-dive       → Current URL
✓ /blog/react-tutorial              → 301 redirect
✓ /blog/react-hooks-guide           → 301 redirect
✓ /blog/hooks-comprehensive         → 301 redirect

External links from 4 years ago still work!
```

## Type Safety

```typescript
// All functions are fully typed
import { getPostByAnySlug } from "@/lib/blog";
import type { Post } from "@/data/posts";

// ✅ Correct usage
const result: ReturnType<typeof getPostByAnySlug> 
  = getPostByAnySlug("some-slug", posts);

if (result) {
  const { 
    post,                    // Post
    needsRedirect,           // boolean
    canonicalSlug            // string
  } = result;
}

// ✅ Full type checking from TypeScript
result?.post.slug           // ✓ string
result?.post.previousSlugs  // ✓ string[] | undefined
result?.canonicalSlug       // ✓ string
```

## Build Output

```
When building (npm run build):

generateStaticParams() generates:
  ├─ /blog/react-hooks-deep-dive       ← new slug
  ├─ /blog/react-tutorial              ← old slug 1
  ├─ /blog/react-hooks-guide           ← old slug 2
  └─ /blog/hooks-comprehensive         ← old slug 3

All 4 URLs are prerendered as static pages.

Build log shows:
  ✓ Generating static pages (24/24)
  
  Each slug gets its own HTML file.
  Requests served from static cache (fastest).
```

---

This architecture ensures:
- ✅ Fast redirects (prerendered at build time)
- ✅ Type-safe (full TypeScript support)
- ✅ SEO-friendly (301 status codes)
- ✅ User-friendly (automatic redirects)
- ✅ Developer-friendly (simple frontmatter syntax)
