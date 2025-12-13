# Frontmatter Schema Reference

**Status:** ✅ Production  
**Last Updated:** October 24, 2025  
**Related:** [Content Creation](./content-creation) · [Blog Architecture](./architecture)

---

## Summary

Complete technical reference for blog post frontmatter fields. This document defines the schema, types, validation rules, and behavior for all frontmatter properties used in the blog system.

---

## Table of Contents

- [Overview](#overview)
- [Schema Definition](#schema-definition)
- [Field Reference](#field-reference)
- [Type Definitions](#type-definitions)
- [Validation Rules](#validation-rules)
- [Examples](#examples)
- [Migration Guide](#migration-guide)

---

## Overview

Frontmatter is YAML-formatted metadata at the top of each MDX file, parsed by `gray-matter` and validated against TypeScript types.

### Basic Structure

```yaml
---
# Required fields
title: "Post Title"
summary: "Brief description"
publishedAt: "2025-10-24"
tags: ["tag1", "tag2"]

# Optional fields
updatedAt: "2025-10-25"
featured: true
archived: false
draft: false
sources:
  - label: "Source Name"
    href: "https://example.com"
---

Post content starts here...
```

### Processing Flow

```
┌─────────────────┐
│  MDX File       │
│  (.mdx)         │
└────────┬────────┘
         │
         │ fs.readFileSync()
         ▼
┌─────────────────┐
│  File Contents  │
│  (string)       │
└────────┬────────┘
         │
         │ matter() from gray-matter
         ▼
┌─────────────────┬─────────────────┐
│  Frontmatter    │  Content Body   │
│  (data object)  │  (markdown)     │
└────────┬────────┴─────────────────┘
         │
         │ Type casting & validation
         ▼
┌─────────────────┐
│  Post Object    │
│  (typed)        │
└─────────────────┘
```

---

## Schema Definition

### TypeScript Interface

**Location:** `src/data/posts.ts`

```typescript
export type PostSource = {
  label: string;
  href: string;
};

export type PostImage = {
  url: string;               // local path or external URL
  alt: string;               // required for accessibility
  width?: number;            // optional, for next/image optimization
  height?: number;           // optional, maintains aspect ratio
  caption?: string;          // optional, displayed below image
  credit?: string;           // optional, photographer/source attribution
  position?: "top" | "left" | "right" | "background"; // list view placement hint
};

export type Post = {
  slug: string;              // Derived from filename (active/current slug)
  title: string;             // Required
  summary: string;           // Required
  publishedAt: string;       // Required (ISO date string)
  updatedAt?: string;        // Optional (ISO date string)
  tags: string[];            // Required (array of strings)
  featured?: boolean;        // Optional (default: undefined)
  archived?: boolean;        // Optional (default: undefined)
  draft?: boolean;           // Optional (default: undefined)
  body: string;              // MDX content (not in frontmatter)
  sources?: PostSource[];    // Optional (array of objects)
  previousSlugs?: string[];  // Optional (old slugs that 301 redirect to current)
  image?: PostImage;         // Optional (featured image object)
  readingTime: {             // Auto-calculated (not in frontmatter)
    words: number;
    minutes: number;
    text: string;
  };
};
```

### YAML Schema

```yaml
# JSON Schema representation
type: object
required:
  - title
  - summary
  - publishedAt
  - tags
properties:
  title:
    type: string
    minLength: 1
    maxLength: 200
  summary:
    type: string
    minLength: 1
    maxLength: 500
  publishedAt:
    type: string
    format: date
    pattern: ^\d{4}-\d{2}-\d{2}$
  updatedAt:
    type: string
    format: date
    pattern: ^\d{4}-\d{2}-\d{2}$
  tags:
    type: array
    items:
      type: string
    minItems: 1
    maxItems: 10
  featured:
    type: boolean
  archived:
    type: boolean
  draft:
    type: boolean
  sources:
    type: array
    items:
      type: object
      required:
        - label
        - href
      properties:
        label:
          type: string
        href:
          type: string
          format: uri
```

---

## Field Reference

### `title` (Required)

**Type:** `string`  
**Parsed As:** `data.title as string`  
**Used In:** Page title, meta tags, post listings, social cards

**Description:**
The primary heading for the blog post. Displayed prominently in all contexts.

**Constraints:**
- Must be present
- Must be non-empty string
- Recommended: 10-60 characters
- Should be unique across all posts

**Behavior:**
- Used as `<h1>` content on post page
- Appears in `<title>` tag: `{title} | Site Name`
- Used in Open Graph `og:title`
- Displayed in post listings and search results

**Example:**
```yaml
title: "Building a Blog with Next.js and MDX"
title: "TypeScript Generics: A Complete Guide"
title: "CSS Grid vs Flexbox: When to Use Each"
```

**Special Characters:**
```yaml
# Requires quotes if contains colons, quotes, or special chars
title: "Next.js: App Router Guide"           # Colon
title: "The \"Ultimate\" Guide to React"     # Escaped quotes
title: "5 Tips & Tricks for TypeScript"      # Ampersand (safe)
```

**Validation Error:**
```typescript
// If missing or empty:
// TypeError: Cannot read property 'title' of undefined
```

---

### `summary` (Required)

**Type:** `string`  
**Parsed As:** `data.summary as string`  
**Used In:** Meta descriptions, post cards, social previews

**Description:**
Brief description of the post content. Used for SEO and previews.

**Constraints:**
- Must be present
- Must be non-empty string
- Recommended: 120-160 characters (optimal for meta descriptions)
- Should not duplicate title

**Behavior:**
- Used as `<meta name="description">`
- Used in Open Graph `og:description`
- Displayed in post listings
- Shown in search engine results

**Example:**
```yaml
summary: "Learn how to build a modern blog with Next.js 16, MDX for content, and Tailwind CSS for styling. Includes full source code and deployment guide."

summary: "A comprehensive guide to TypeScript generics covering basic concepts, advanced patterns, and real-world use cases with practical examples."
```

**Best Practices:**
```yaml
# Good - descriptive, action-oriented, keyword-rich
summary: "Step-by-step tutorial for migrating from Pages Router to App Router in Next.js. Covers routing, data fetching, and layout patterns."

# Avoid - too vague
summary: "A post about Next.js."

# Avoid - too long (truncated in search results)
summary: "This is an extremely comprehensive and detailed guide that will teach you absolutely everything you need to know about building modern web applications using Next.js 16, React 19, and TypeScript with all the latest features and best practices."
```

---

### `publishedAt` (Required)

**Type:** `string` (ISO 8601 date)  
**Parsed As:** `data.publishedAt as string`  
**Format:** `YYYY-MM-DD`

**Description:**
Original publication date of the post. Used for sorting and display.

**Constraints:**
- Must be present
- Must be valid date string
- Format: `YYYY-MM-DD`
- Should not be future date (but not enforced)

**Behavior:**
- Posts sorted by this date (newest first)
- Displayed on post page: "Published Oct 24, 2025"
- Used in RSS/Atom feeds (`<pubDate>`)
- Used in sitemap.xml (`<lastmod>`)

**Example:**
```yaml
publishedAt: "2025-10-24"
publishedAt: "2025-01-15"
publishedAt: "2024-12-31"
```

**Invalid Formats:**
```yaml
# ❌ Wrong formats
publishedAt: 10/24/2025           # US format
publishedAt: 24-10-2025           # Day-first
publishedAt: Oct 24, 2025         # Text format
publishedAt: 2025-10-24T10:00:00  # With time (works but unnecessary)

# ✅ Correct format
publishedAt: "2025-10-24"
```

**Parsing:**
```typescript
// src/lib/blog.ts
publishedAt: data.publishedAt as string

// Sorting
posts.sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

// Display
new Date(post.publishedAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

---

### `tags` (Required)

**Type:** `string[]` (array of strings)  
**Parsed As:** `(data.tags as string[]) || []`

**Description:**
Categories/topics for the post. Used for filtering and recommendations.

**Constraints:**
- Must be present (empty array allowed but not recommended)
- Array of strings
- Recommended: 2-5 tags per post
- Case-sensitive (maintain consistency)

**Behavior:**
- Used for tag filtering on `/blog` page
- Used in related post algorithm (shared tags = related)
- Displayed as badges on post cards
- Counted in tag statistics (`postTagCounts`)

**Example:**
```yaml
tags: ["Next.js", "React", "Tutorial"]
tags: ["TypeScript", "JavaScript"]
tags: ["CSS", "Design", "Frontend"]
```

**YAML Syntax Options:**
```yaml
# Flow style (inline)
tags: ["Next.js", "React", "Tutorial"]

# Block style (multi-line)
tags:
  - Next.js
  - React
  - Tutorial

# Single tag (still array)
tags: ["Tutorial"]
```

**Usage in Code:**
```typescript
// Get all unique tags
export const allPostTags = Object.freeze(
  Object.keys(postTagCounts).sort()
);

// Count posts per tag
export const postTagCounts = posts.reduce<Record<string, number>>((acc, post) => {
  for (const tag of post.tags) {
    acc[tag] = (acc[tag] ?? 0) + 1;
  }
  return acc;
}, {});

// Related posts (shared tags)
const relatedPosts = posts
  .filter(p => p.slug !== currentPost.slug)
  .filter(p => p.tags.some(tag => currentPost.tags.includes(tag)));
```

**Best Practices:**
```yaml
# Good - consistent casing, specific but not too narrow
tags: ["Next.js", "React", "Server Components"]

# Good - mix of broad and specific
tags: ["TypeScript", "Tutorial", "Generics"]

# Avoid - inconsistent casing
tags: ["next.js", "Next.JS", "NextJS"]  # Pick one style

# Avoid - too many tags
tags: ["Next.js", "React", "JavaScript", "TypeScript", "Web", "Frontend", "Tutorial", "Guide", "Beginner", "Advanced"]
```

---

### `updatedAt` (Optional)

**Type:** `string | undefined` (ISO 8601 date)  
**Parsed As:** `data.updatedAt as string | undefined`  
**Format:** `YYYY-MM-DD`  
**Default:** `undefined`

**Description:**
Date of last significant update. Optional field for tracking content freshness.

**Constraints:**
- Optional (can be omitted)
- Must be valid date string if present
- Format: `YYYY-MM-DD`
- Should be equal to or after `publishedAt`

**Behavior:**
- Displayed on post page: "Updated Oct 25, 2025"
- Shows "Updated" badge if present
- Used in RSS feeds (when more recent than `publishedAt`)
- Signals content freshness to search engines

**Example:**
```yaml
publishedAt: "2025-09-10"
updatedAt: "2025-10-24"  # Major revision 6 weeks later
```

**When to Use:**
```yaml
# Use for major content updates
- Significant new information added
- Code examples updated for new versions
- Outdated information corrected
- New sections added

# Don't use for minor changes
- Typo fixes
- Formatting adjustments
- Link updates
```

**Display Logic:**
```typescript
{post.updatedAt && (
  <p className="text-sm text-muted-foreground">
    Updated {new Date(post.updatedAt).toLocaleDateString()}
  </p>
)}
```

---

### `featured` (Optional)

**Type:** `boolean | undefined`  
**Parsed As:** `data.featured as boolean | undefined`  
**Default:** `undefined` (falsy)

**Description:**
Marks post as featured for homepage and special sections.

**Constraints:**
- Optional
- Must be boolean if present
- Typically 2-5 posts featured at once

**Behavior:**
- `true`: Post appears in featured sections
- `false` or `undefined`: Not featured
- Filtered by: `posts.filter(p => p.featured)`

**Example:**
```yaml
featured: true   # Show on homepage
featured: false  # Explicitly not featured
# Omitted = not featured (default)
```

**Usage:**
```typescript
// Get featured posts
export const featuredPosts = Object.freeze(
  posts.filter((post) => post.featured)
);

// Display featured badge
{post.featured && (
  <Badge variant="default">Featured</Badge>
)}
```

**Best Practices:**
- Feature high-quality, evergreen content
- Limit to 2-5 posts
- Update periodically
- Consider analytics (popular posts)

---

### `archived` (Optional)

**Type:** `boolean | undefined`  
**Parsed As:** `data.archived as boolean | undefined`  
**Default:** `undefined` (falsy)

**Description:**
Marks post as outdated but keeps it accessible and indexed.

**Constraints:**
- Optional
- Must be boolean if present
- Does NOT filter from production builds

**Behavior:**
- `true`: Shows "Archived" badge, still visible
- `false` or `undefined`: Normal post
- Still appears in listings and search
- Still indexed by search engines

**Example:**
```yaml
archived: true   # Show "Archived" badge
archived: false  # Current content
# Omitted = current (default)
```

**Use Cases:**
```yaml
# Archive when:
- Technology has moved on (Webpack 4 → Webpack 5)
- Better alternatives exist
- Content has historical value
- Don't want to delete for SEO/backlinks

# Example
---
title: "Getting Started with Webpack 4"
archived: true
updatedAt: "2025-10-24"
---

> **Archived:** This post covers Webpack 4, which has been superseded...
```

**Display:**
```typescript
{post.archived && (
  <Badge variant="secondary">Archived</Badge>
)}
```

---

### `draft` (Optional)

**Type:** `boolean | undefined`  
**Parsed As:** `data.draft as boolean | undefined`  
**Default:** `undefined` (falsy)

**Description:**
Hides post in production builds. Visible only in development.

**Constraints:**
- Optional
- Must be boolean if present
- Filtering happens at build time

**Behavior:**
- `true` + development: Post visible at `/blog/slug`
- `true` + production: Post completely hidden (404)
- `false` or `undefined`: Published (visible everywhere)

**Example:**
```yaml
draft: true   # Work in progress
draft: false  # Published
# Omitted = published (default)
```

**Filtering Logic:**
```typescript
// src/lib/blog.ts
const filteredPosts = posts.filter((post) => {
  if (process.env.NODE_ENV === "production" && post.draft) {
    return false;  // Hide in production
  }
  return true;
});
```

**Workflow:**
```yaml
# 1. Create post
---
title: "My New Post"
draft: true  # Start as draft
---

# 2. Develop locally (visible)
npm run dev

# 3. Ready to publish
---
draft: false  # Or remove field
---

# 4. Deploy (now visible in production)
git push
```

**Display:**
```typescript
{post.draft && process.env.NODE_ENV === "development" && (
  <Badge variant="outline">Draft</Badge>
)}
```

---

### `sources` (Optional)

**Type:** `PostSource[] | undefined`  
**Parsed As:** `data.sources as PostSource[] | undefined`  
**Default:** `undefined`

**Description:**
Array of reference links and external resources cited in the post.

**Schema:**
```typescript
type PostSource = {
  label: string;  // Display text
  href: string;   // URL
};
```

**Constraints:**
- Optional (can be omitted)
- Array of objects if present
- Each object requires `label` and `href`
- URLs should be absolute (with protocol)

**Example:**
```yaml
sources:
  - label: "Next.js Documentation"
    href: "https://nextjs.org/docs"
  - label: "React Server Components RFC"
    href: "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md"
  - label: "MDN Web Docs"
    href: "https://developer.mozilla.org"
```

**YAML Syntax:**
```yaml
# Block style (recommended for readability)
sources:
  - label: "Source 1"
    href: "https://example.com/1"
  - label: "Source 2"
    href: "https://example.com/2"

# Flow style (compact)
sources: [{ label: "Source 1", href: "https://example.com/1" }]
```

**Display:**
```tsx
{post.sources && post.sources.length > 0 && (
  <div className="mt-8">
    <h2>Sources & References</h2>
    <ul>
      {post.sources.map((source, i) => (
        <li key={i}>
          <a href={source.href} target="_blank" rel="noopener noreferrer">
            {source.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
```

**Use Cases:**
- Official documentation references
- Academic papers or research
- Original source material
- Further reading suggestions
- Attribution for ideas/code

---

### `image` (Optional)

**Type:** `PostImage | undefined`  
**Parsed As:** `data.image as PostImage | undefined`  
**Default:** `undefined`

**Description:**
Featured image for the blog post. Used for hero images on post detail pages, thumbnails in post listings, Open Graph/Twitter Card social sharing images, and RSS/Atom feed enclosures.

**Schema:**
```typescript
type PostImage = {
  url: string;              // Required: local path or external URL
  alt: string;              // Required: accessibility text
  width?: number;           // Optional: pixel width for optimization
  height?: number;          // Optional: pixel height for optimization
  caption?: string;         // Optional: displayed below image
  credit?: string;          // Optional: photographer/source
  position?: "top" | "left" | "right" | "background"; // Optional: layout hint
};
```

**Constraints:**
- Optional (can be omitted, defaults to generated default image)
- `url` and `alt` are required if `image` object is present
- Local URLs should start with `/` (e.g., `/blog/images/post-slug/hero.jpg`)
- External URLs must be absolute (with protocol)
- For social sharing, recommended dimensions: 1200 × 630px (1.91:1)
- Supported formats: JPEG, PNG, WebP, SVG (though SVG may not work in all social platforms)

**Example:**
```yaml
image:
  url: "/blog/images/nextjs-guide/hero.jpg"
  alt: "Next.js logo with code editor in background"
  width: 1200
  height: 630
  caption: "Next.js makes building React apps easier"
  credit: "Photo by John Doe on Unsplash"
  position: "top"
```

**Display Locations:**

1. **Post Hero Image** (Post Detail Page)
   - Full-width responsive image at top of post
   - 16:9 aspect on mobile, 21:9 on desktop
   - Gradient overlays for visual polish
   - Caption and credit displayed below

2. **Post Listings** (Blog Page, Homepage)
   - Thumbnail in card layouts (varies by layout variant)
   - Default layout: 128×96px side thumbnail (desktop)
   - Magazine layout: 50% width large image
   - Grid layout: Full-width 192px height image on top

3. **Related Posts**
   - 160px height thumbnail (h-40)
   - Hover zoom effect (scale-105)

4. **Open Graph / Twitter Cards**
   - Used for social media link previews
   - Fallback to dynamic text-based generator if no image
   - `og:image` and `twitter:image` meta tags

5. **RSS/Atom Feeds**
   - RSS: `<enclosure>` tag with image URL
   - Atom: `<link rel="enclosure">` with image URL

**Usage Examples:**

```yaml
# Minimal (required fields only)
image:
  url: "/blog/images/my-post/hero.jpg"
  alt: "Descriptive alt text for accessibility"

# With dimensions for OG optimization
image:
  url: "/blog/images/my-post/hero.jpg"
  alt: "Next.js App Router architecture diagram"
  width: 1200
  height: 630

# Full metadata with caption
image:
  url: "/blog/images/security-guide/hero.jpg"
  alt: "Lock icon representing application security"
  width: 1200
  height: 630
  caption: "Security should be built in from the start"
  credit: "Photo by Dan Nelson on Unsplash"
  position: "top"

# External image
image:
  url: "https://images.unsplash.com/photo-123456789"
  alt: "Beautiful landscape photo"
  width: 1920
  height: 1080
  credit: "Unsplash"
```

**Best Practices:**

1. **Always provide alt text** for accessibility
2. **Optimize images before upload** (target < 200KB for fast loading)
3. **Use 1200×630px for social sharing** (OG/Twitter standard)
4. **Store local images in** `/public/blog/images/{post-slug}/`
5. **Use descriptive filenames** (e.g., `hero.jpg`, `diagram.png`)
6. **Consider lazy loading** for images below the fold (automatic with next/image)
7. **Provide width/height** to prevent layout shift

**File Storage:**
```
public/blog/images/
├── default/              # Default/shared images
│   ├── hero.svg
│   ├── minimal.svg
│   └── geometric.svg
├── nextjs-guide/         # Post-specific images
│   ├── hero.jpg
│   └── diagram.png
└── security-basics/
    └── hero.jpg
```

**See Also:**
- [Featured Images Guide](/docs/blog/featured-images) - Hero image implementation
- [OG Image Integration](/docs/blog/og-image-integration) - Social sharing setup
- [Default Images](/docs/blog/default-images-quick-ref) - Fallback image system

---

### `previousSlugs` (Optional)

**Type:** `string[] | undefined`  
**Parsed As:** `data.previousSlugs as string[] | undefined`  
**Default:** `undefined`

**Description:**
Array of old/previous URL slugs that should redirect to the current slug. Used for maintaining backward compatibility when a post's URL changes or gets renamed.

**Constraints:**
- Optional (can be omitted)
- Array of strings if present
- Each string is a slug that previously existed
- Should not contain duplicate slugs within the array
- Should not reference slugs that still exist as active posts

**SEO Behavior:**
- Old URLs return **301 Permanent Redirect** to the new canonical slug
- Preserves search engine rankings and external links
- Tells search engines the content has permanently moved
- Automatically added to `generateStaticParams()` for prerendering

**Example:**
```yaml
# Current filename: building-nextjs-blog.mdx
# Renamed from: nextjs-blog-tutorial.mdx and creating-a-blog-with-nextjs.mdx

previousSlugs:
  - "nextjs-blog-tutorial"
  - "creating-a-blog-with-nextjs"
```

**How It Works:**

1. **New URL:** `https://example.com/blog/building-nextjs-blog`
2. **Old URL:** `https://example.com/blog/nextjs-blog-tutorial`
3. **Result:** Browser receives 301 redirect to new URL

**Display:**
Internally, the redirect happens at the Next.js level. End users don't see the old slug unless:
- They have old links bookmarked or in browser history
- External sites link to the old URL
- Search engines haven't fully reindexed yet

**Use Cases:**
- Renamed post after SEO optimization
- Consolidated multiple posts into one
- Changed URL structure or naming convention
- Post moved to different section/category
- Corrected spelling or grammar in slug

**Migration Workflow:**
```yaml
# Before rename (old filename)
# src/content/blog/old-slug-name.mdx
---
title: "My Post"
slug: "old-slug-name"  # Not needed - derived from filename
---

# After rename (new filename + redirect)
# src/content/blog/new-slug-name.mdx
---
title: "My Post"
previousSlugs:
  - "old-slug-name"
---
```

**Redirect Utilities:**

The blog system provides utility functions for working with redirects:

```typescript
// Get the canonical slug for any given slug
import { getCanonicalSlug } from "@/lib/blog";
const canonical = getCanonicalSlug("old-slug", posts); // "new-slug"

// Find a post by current or previous slug
import { getPostByAnySlug } from "@/lib/blog";
const result = getPostByAnySlug("old-slug", posts);
if (result?.needsRedirect) {
  redirect(`/blog/${result.canonicalSlug}`);
}

// Build a redirect map for bulk lookups
import { buildRedirectMap } from "@/lib/blog";
const redirects = buildRedirectMap(posts);
const canonical = redirects.get("old-slug") ?? "old-slug";
```

**Implementation Details:**

- Redirects are handled in `src/app/blog/[slug]/page.tsx`
- Both old and new slugs are prerendered at build time
- Visiting an old URL automatically redirects to the new one
- No need to update links in blog content (automatic)
- Works for both development and production deployments

---

### `slug` (Auto-Generated)

**Type:** `string`  
**Source:** Derived from filename  
**Not in frontmatter**

**Description:**
URL segment for the post, automatically generated from the filename.

**Generation:**
```typescript
// src/lib/blog.ts
const slug = filename.replace(/\.mdx$/, "");
```

**Example:**
```bash
# Filename → Slug → URL
my-post.mdx          → my-post          → /blog/my-post
nextjs-guide.mdx     → nextjs-guide     → /blog/nextjs-guide
typescript-tips.mdx  → typescript-tips  → /blog/typescript-tips
```

**Usage:**
- Unique identifier for each post
- URL path segment
- Key in `postsBySlug` lookup object

**Best Practices:**
- Keep filenames lowercase
- Use hyphens, not underscores
- Make slugs descriptive
- Consider SEO keywords

---

### `body` (Auto-Extracted)

**Type:** `string`  
**Source:** MDX content after frontmatter  
**Not in frontmatter**

**Description:**
The main content of the post in Markdown/MDX format.

**Extraction:**
```typescript
const { data, content } = matter(fileContents);
// data = frontmatter object
// content = body string
```

**Usage:**
- Passed to `<MDX source={post.body} />`
- Used for reading time calculation
- Processed by remark/rehype plugins

---

### `readingTime` (Auto-Calculated)

**Type:** `{ words: number; minutes: number; text: string; }`  
**Source:** Calculated from body content  
**Not in frontmatter**

**Description:**
Automatically calculated reading statistics based on word count.

**Calculation:**
```typescript
const WORDS_PER_MINUTE = 225;

function calculateReadingTime(body: string) {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")  // Remove code blocks
    .replace(/<[^>]*>/g, " ")         // Remove HTML tags
    .split(/\s+/)
    .filter(Boolean).length;
  
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  
  return {
    words,
    minutes,
    text: `${minutes} min read`,
  };
}
```

**Example Output:**
```typescript
{
  words: 1350,
  minutes: 6,
  text: "6 min read"
}
```

**Display:**
```tsx
<p className="text-sm text-muted-foreground">
  {post.readingTime.text}
</p>
```

---

## Type Definitions

### Complete TypeScript Types

**File:** `src/data/posts.ts`

```typescript
export type PostSource = {
  label: string;
  href: string;
};

export type Post = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  featured?: boolean;
  archived?: boolean;
  draft?: boolean;
  body: string;
  sources?: PostSource[];
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
};
```

### Runtime Type Checking

No runtime validation currently implemented. Type safety relies on:

1. **TypeScript compilation** - Catches type errors at build time
2. **Type assertions** - Manual casting in `blog.ts`
3. **Gray-matter parsing** - Validates YAML syntax

**Future Enhancement:**
```typescript
// Consider adding Zod schema validation
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).min(1).max(10),
  // ... more fields
});
```

---

## Validation Rules

### Required Field Validation

**At Parse Time:**
- Missing required fields cause TypeScript errors
- Build fails if posts can't be parsed

**Required Fields Checklist:**
- ✅ `title` - Must be present
- ✅ `summary` - Must be present
- ✅ `publishedAt` - Must be present and valid date
- ✅ `tags` - Must be array (can be empty)

### Optional Field Validation

**Default Handling:**
```typescript
// Optional fields default to undefined
featured: data.featured as boolean | undefined  // undefined if omitted
archived: data.archived as boolean | undefined
draft: data.draft as boolean | undefined
updatedAt: data.updatedAt as string | undefined
sources: data.sources as PostSource[] | undefined
```

### Date Format Validation

**Expected Format:** `YYYY-MM-DD`

**Valid Examples:**
```yaml
publishedAt: "2025-10-24"
publishedAt: "2025-01-01"
publishedAt: "2024-12-31"
```

**Invalid Examples:**
```yaml
publishedAt: "10/24/2025"      # US format
publishedAt: "24-10-2025"      # Wrong order
publishedAt: "Oct 24, 2025"    # Text format
```

**Validation (implicit via Date constructor):**
```typescript
new Date(post.publishedAt).getTime()  // NaN if invalid
```

### Tag Validation

**Rules:**
- Must be array
- Can be empty (but not recommended)
- No duplicate checking (allowed)
- Case-sensitive

**Recommendations:**
- 2-5 tags per post
- Consistent casing
- Check existing tags first

---

## Examples

### Minimal Post

```yaml
---
title: "Hello World"
summary: "My first blog post"
publishedAt: "2025-10-24"
tags: ["intro"]
---

## Welcome

This is my first post!
```

### Full-Featured Post

```yaml
---
title: "Complete Guide to Next.js App Router"
summary: "Learn how to build modern web applications with Next.js 16 App Router, server components, and streaming. Includes practical examples and best practices."
publishedAt: "2025-09-15"
updatedAt: "2025-10-24"
tags: ["Next.js", "React", "Tutorial", "App Router"]
featured: true
archived: false
draft: false
sources:
  - label: "Next.js Documentation"
    href: "https://nextjs.org/docs"
  - label: "React Server Components"
    href: "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components"
  - label: "App Router Migration Guide"
    href: "https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration"
---

> **Update (Oct 2025):** This guide has been updated for Next.js 16 and React 19.

## Introduction

The App Router represents a fundamental shift...
```

### Draft Post

```yaml
---
title: "Work in Progress"
summary: "This post is still being written"
publishedAt: "2025-10-24"
tags: ["wip"]
draft: true
---

## Coming Soon

More content to follow...
```

### Archived Post

```yaml
---
title: "Getting Started with Webpack 4"
summary: "Learn how to configure Webpack 4 for modern web development."
publishedAt: "2019-05-15"
updatedAt: "2025-10-24"
archived: true
tags: ["Webpack", "Build Tools"]
sources:
  - label: "Webpack 4 Documentation"
    href: "https://v4.webpack.js.org/"
---

> **Archived:** This post covers Webpack 4. Webpack 5 is now stable, and many projects have migrated to Vite or Turbopack. This content remains for historical reference.
```

---

## Migration Guide

### Adding New Required Field

**Steps:**

1. **Update TypeScript type:**
   ```typescript
   export type Post = {
     // ... existing fields
     newField: string;  // Add new required field
   };
   ```

2. **Update parsing logic:**
   ```typescript
   return {
     // ... existing fields
     newField: data.newField as string,
   };
   ```

3. **Update all existing posts:**
   ```bash
   # Add to all posts
   find src/content/blog -name "*.mdx" -exec sed -i '' '/^tags:/a\
   newField: "default"
   ' {} \;
   ```

4. **Test build:**
   ```bash
   npm run build
   ```

### Adding New Optional Field

**Steps:**

1. **Update TypeScript type:**
   ```typescript
   export type Post = {
     // ... existing fields
     newField?: string;  // Optional field
   };
   ```

2. **Update parsing logic:**
   ```typescript
   return {
     // ... existing fields
     newField: data.newField as string | undefined,
   };
   ```

3. **No changes needed to existing posts** (defaults to `undefined`)

4. **Add to new posts as needed**

### Removing a Field

**Steps:**

1. **Remove from TypeScript type**
2. **Remove from parsing logic**
3. **Optional: Remove from existing posts** (or leave for backward compatibility)

---

## Related Documentation

- **[Content Creation Guide](./content-creation)** - How to write posts
- **[Blog Architecture](./architecture)** - System design
- **[MDX Processing](./mdx-processing)** - Content transformation
- **[Quick Reference](./quick-reference)** - Command cheat sheet

---

## Quick Reference

### Complete Example

```yaml
---
title: "Post Title (Required)"
summary: "Brief description (Required, 150-160 chars)"
publishedAt: "2025-10-24"  # Required, YYYY-MM-DD
tags: ["Tag1", "Tag2"]      # Required, array of strings
updatedAt: "2025-10-25"     # Optional, YYYY-MM-DD
featured: true              # Optional, boolean
archived: false             # Optional, boolean
draft: false                # Optional, boolean
sources:                    # Optional, array of objects
  - label: "Source Name"
    href: "https://example.com"
---

Content starts here...
```

### Field Quick Reference Table

| Field | Type | Required | Default | Used For |
|-------|------|----------|---------|----------|
| `title` | `string` | ✅ | - | Page title, meta tags, listings |
| `summary` | `string` | ✅ | - | Meta description, previews |
| `publishedAt` | `string` | ✅ | - | Sorting, display, RSS/sitemap |
| `tags` | `string[]` | ✅ | - | Filtering, related posts |
| `updatedAt` | `string` | ❌ | `undefined` | Display update date |
| `featured` | `boolean` | ❌ | `undefined` | Homepage highlights |
| `archived` | `boolean` | ❌ | `undefined` | Mark outdated content |
| `draft` | `boolean` | ❌ | `undefined` | Hide in production |
| `sources` | `PostSource[]` | ❌ | `undefined` | References/citations |
| `slug` | `string` | Auto | from filename | URL path segment |
| `body` | `string` | Auto | from content | MDX content |
| `readingTime` | `object` | Auto | calculated | Reading statistics |

---

**Last Updated:** October 24, 2025  
**Maintained By:** Project Team  
**Status:** ✅ Production-ready
