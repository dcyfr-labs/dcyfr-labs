# Blog Slug Redirects Guide

**Status:** ✅ Production  
**Last Updated:** October 27, 2025  
**Related:** [Frontmatter Schema](./frontmatter-schema) · [Content Creation](./content-creation)

---

## Overview

This guide explains how to use the `previousSlugs` field to maintain URL stability when renaming blog posts. When you change a post's filename (which becomes its URL slug), the old URL automatically redirects to the new one with a **301 Permanent Redirect**, preserving SEO rankings and preventing broken links.

---

## Table of Contents

- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Implementation Details](#implementation-details)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Scenario: Renaming a Post

**Step 1: Identify the old slug**
```
Current file: src/content/blog/nextjs-blog-tutorial.mdx
Current URL:  https://example.com/blog/nextjs-blog-tutorial
```

**Step 2: Rename the file**
```bash
# Rename the file
mv nextjs-blog-tutorial.mdx building-nextjs-blog.mdx
```

**Step 3: Add previousSlugs to frontmatter**
```yaml
---
title: "Building a Blog with Next.js and MDX"
summary: "A comprehensive guide to building a modern blog..."
publishedAt: "2025-10-15"
updatedAt: "2025-10-27"
tags: ["nextjs", "blog", "mdx"]

# Add old slug(s) here
previousSlugs:
  - "nextjs-blog-tutorial"
---

Your blog content starts here...
```

**Result:**
- Old URL redirects: `https://example.com/blog/nextjs-blog-tutorial` → new URL
- New URL works: `https://example.com/blog/building-nextjs-blog`
- Search engines updated: 301 redirect tells crawlers about the permanent move
- External links still work: No need to update links in other sites

---

## How It Works

### Redirect Flow

```
User visits old URL
         ↓
/blog/nextjs-blog-tutorial (old slug)
         ↓
Page checks if this is an old slug
         ↓
Found in previousSlugs array
         ↓
Browser returns 301 redirect
         ↓
https://example.com/blog/building-nextjs-blog
         ↓
User sees new content
```

### HTTP Status Codes

**301 Permanent Redirect**
- Tells browsers and search engines: "This moved permanently"
- Search engines: Update their index to the new URL
- Browsers: May cache the redirect
- External links: Still work (redirect is automatic)

### Build-Time Processing

The redirect system works at three levels:

1. **Parse Time** (`src/lib/blog.ts`)
   - Reads `previousSlugs` from frontmatter
   - Builds redirect map: `old-slug` → `new-slug`

2. **Pre-render Time** (`src/app/blog/[slug]/page.tsx`)
   - Includes both old and new slugs in `generateStaticParams()`
   - Generates static pages for all URLs (old and new)

3. **Request Time**
   - If user requests old slug, page checks for redirect
   - Returns `NextResponse.redirect()` with 301 status
   - Browser follows redirect to new URL

---

## Implementation Details

### TypeScript Type

```typescript
export type Post = {
  slug: string;              // Current slug (from filename)
  previousSlugs?: string[];  // Old slugs that should redirect here
  // ... other fields
};
```

### Utility Functions

#### `buildRedirectMap(allPosts)`
Creates a lookup map of old → new slugs.

```typescript
import { buildRedirectMap } from "@/lib/blog";

const redirects = buildRedirectMap(posts);
const newSlug = redirects.get("old-slug"); // "new-slug"
```

#### `getCanonicalSlug(slug, allPosts)`
Returns the current slug for any given slug (old or new).

```typescript
import { getCanonicalSlug } from "@/lib/blog";

const current = getCanonicalSlug("old-slug", posts);
// Returns "new-slug" if "old-slug" is in previousSlugs
```

#### `getPostByAnySlug(slug, allPosts)`
Finds a post by current or previous slug, indicates if redirect needed.

```typescript
import { getPostByAnySlug } from "@/lib/blog";

const result = getPostByAnySlug("old-slug", posts);
if (result) {
  const { post, needsRedirect, canonicalSlug } = result;
  
  if (needsRedirect) {
    // Redirect to canonical URL
    redirect(`/blog/${canonicalSlug}`);
  }
  
  // Use post data
}
```

### Code in `src/app/blog/[slug]/page.tsx`

```typescript
export async function generateStaticParams() {
  const allParams = [];
  
  // Add current slugs
  for (const post of posts) {
    allParams.push({ slug: post.slug });
  }
  
  // Add previous slugs for redirect pages
  for (const post of posts) {
    if (post.previousSlugs) {
      for (const oldSlug of post.previousSlugs) {
        allParams.push({ slug: oldSlug });
      }
    }
  }
  
  return allParams;
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const result = getPostByAnySlug(slug, posts);
  
  if (!result) {
    notFound();
  }
  
  const { post, needsRedirect, canonicalSlug } = result;
  
  // If this is an old slug, redirect to the current one
  if (needsRedirect) {
    redirect(`/blog/${canonicalSlug}`);
  }
  
  // Continue with normal page rendering using post data
  // ...
}
```

---

## Examples

### Single Previous Slug

Post renamed once:

```yaml
---
title: "TypeScript Generics Explained"
summary: "A guide to understanding TypeScript generics..."
publishedAt: "2025-08-10"
tags: ["typescript", "generics"]

# File was: ts-generics-guide.mdx
previousSlugs:
  - "ts-generics-guide"
---
```

**Redirect:** `/blog/ts-generics-guide` → `/blog/typescript-generics-explained`

---

### Multiple Previous Slugs

Post renamed multiple times:

```yaml
---
title: "React Hooks Deep Dive"
summary: "Comprehensive guide to React hooks..."
publishedAt: "2025-06-15"
updatedAt: "2025-10-20"
tags: ["react", "hooks"]

# File was: react-hooks.mdx, then hooks-guide.mdx, then react-hooks-guide.mdx
previousSlugs:
  - "react-hooks"
  - "hooks-guide"
  - "react-hooks-guide"
---
```

**Redirects:**
- `/blog/react-hooks` → `/blog/react-hooks-deep-dive`
- `/blog/hooks-guide` → `/blog/react-hooks-deep-dive`
- `/blog/react-hooks-guide` → `/blog/react-hooks-deep-dive`

---

### Content Consolidation

Multiple posts merged into one:

```yaml
---
title: "CSS Layout Techniques: Grid vs Flexbox vs Float"
summary: "Complete comparison of CSS layout methods..."
publishedAt: "2025-05-01"
tags: ["css", "layout"]

# Consolidated from 3 separate posts
previousSlugs:
  - "css-grid-guide"
  - "flexbox-tutorial"
  - "css-floats-history"
---
```

**Redirects:**
- `/blog/css-grid-guide` → `/blog/css-layout-techniques`
- `/blog/flexbox-tutorial` → `/blog/css-layout-techniques`
- `/blog/css-floats-history` → `/blog/css-layout-techniques`

All three old URLs now point to the consolidated post!

---

### Category Reorganization

Posts moved to new section (change URL structure):

```yaml
---
title: "Next.js 16: New Features"
summary: "What's new in Next.js 16..."
publishedAt: "2025-07-01"
tags: ["nextjs", "framework"]

# Old structure: /blog/nextjs-15-features
# New structure: /blog/nextjs-15-new-features (more descriptive)
previousSlugs:
  - "nextjs-15-features"
---
```

---

## Best Practices

### ✅ Do's

1. **Add redirects when renaming:**
   ```yaml
   previousSlugs:
     - "old-name"
   ```
   Not doing this breaks external links and loses SEO value.

2. **Keep old slugs descriptive:**
   ```yaml
   previousSlugs:
     - "old-descriptive-slug-name"  # Good - clear what it was
   ```

3. **Update `updatedAt` when making significant changes:**
   ```yaml
   updatedAt: "2025-10-27"  # Renamed slug, updated content
   ```

4. **Document why in git commits:**
   ```bash
   git commit -m "Rename blog post: nextjs-guide → nextjs-15-guide
   
   - Renamed for clarity with new versions
   - Added 301 redirect from old slug
   - Updated internal links if needed"
   ```

5. **Test redirects locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/blog/old-slug
   # Should redirect to http://localhost:3000/blog/new-slug
   ```

### ❌ Don'ts

1. **Don't remove previousSlugs:**
   ```yaml
   # ❌ Bad - breaks old links
   previousSlugs: []
   
   # ✅ Good - keep them
   previousSlugs:
     - "old-slug-name"
   ```

2. **Don't create redirect loops:**
   ```yaml
   # ❌ Bad - Post A links to Post B's old slug which redirects back
   # This creates a redirect chain
   ```

3. **Don't add active post slugs to previousSlugs:**
   ```yaml
   # ❌ Bad - "react-guide" is another active post
   previousSlugs:
     - "react-guide"
   
   # ✅ Only add truly old/unused slugs
   ```

4. **Don't modify previousSlugs later:**
   ```yaml
   # ❌ Bad - people may have already bookmarked the first redirect
   # If you change it, those people lose the redirect
   
   # Keep all previous slugs permanently
   ```

### URL Structure Conventions

Keep slugs:
- **Lowercase only:** `my-post` not `My-Post`
- **Hyphen-separated:** `my-blog-post` not `my_blog_post`
- **Descriptive:** `react-hooks-guide` not `post-123`
- **Concise:** `typescript` not `comprehensive-guide-to-typescript`

---

## Troubleshooting

### Redirect Not Working

**Problem:** Old URL doesn't redirect to new URL

**Solutions:**

1. **Verify filename matches slug:**
   ```bash
   # File: src/content/blog/new-slug.mdx
   # Then old slug should be in previousSlugs
   
   # ✅ Correct
   previousSlugs:
     - "old-slug"
   
   # ❌ Wrong - slug doesn't match filename
   # slug: "new-slug"  (Don't do this - derived from filename)
   ```

2. **Rebuild the site:**
   ```bash
   npm run build
   # Previous slugs are included in static generation
   ```

3. **Check the exact slug:**
   ```bash
   # Make sure it matches exactly (case-sensitive)
   # ❌ Wrong: "nextjs-Blog-tutorial"
   # ✅ Correct: "nextjs-blog-tutorial"
   ```

4. **Clear build cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Redirect Chain (Too Many Redirects)

**Problem:** Browser says "too many redirects"

**Causes:**
- Post A has `previousSlugs: ["b-slug"]`
- Post B has `previousSlugs: ["c-slug"]` where c-slug is A's current slug
- Visiting c-slug: c → b → a → c (infinite loop)

**Solution:**
Ensure `previousSlugs` only contains truly old slugs, not other active post URLs.

### Search Engines Showing Old URL

**Problem:** Google Search Console still shows old URL

**Solution:**
This is normal and expected. Google will:
1. See the 301 redirect
2. Update its index (takes 1-2 weeks)
3. Start showing the new URL in search results

No action needed - let it happen naturally.

---

## SEO Impact

### Positive Impacts ✅

1. **URL permanence signals:** 301 redirects tell search engines you care about permanent URLs
2. **Authority preserved:** SEO value transfers from old URL to new URL
3. **Fewer duplicate issues:** Redirects prevent duplicate content penalties
4. **External links still work:** Inbound links continue driving traffic

### Initial Considerations ⚠️

1. **Crawl cost:** Search engines use crawl budget for redirects
   - Minor impact for most sites
   - Only an issue if you have thousands of redirects

2. **Redirect time:** Takes search engines 1-2 weeks to fully reindex
   - During this time, both URLs may appear in results
   - Both URLs work fine for users

---

## See Also

- [Frontmatter Schema Reference](./frontmatter-schema) - Full field documentation
- [Content Creation Guide](./content-creation) - Writing blog posts
- [Blog Architecture](./architecture) - How the blog system works
