{/* TLP:CLEAR */}

# Feed Implementation Guide

**Last Updated:** November 10, 2025  
**Status:** ✅ Production Ready (Atom 1.0 Only)

## Overview

The website provides multiple Atom 1.0 feeds for different content types. All feeds are generated using a shared library (`src/lib/feeds.ts`) that ensures consistency, proper formatting, and standards compliance.

> **Note:** As of November 10, 2025, all feeds use **Atom 1.0 format exclusively**. Legacy RSS 2.0 and Atom endpoints (`/rss.xml`, `/atom.xml`) now redirect to `/feed` with HTTP 301 for backwards compatibility.

### Feed Discovery

The site includes feed discovery meta tags in the HTML `<head>` element (configured in `src/app/layout.tsx`):

```typescript
alternates: {
  canonical: SITE_URL,
  types: {
    "application/atom+xml": [
      { url: `${SITE_URL}/feed`, title: `${SITE_TITLE} — All Content` },
      { url: `${SITE_URL}/blog/feed`, title: `${SITE_TITLE} — Blog` },
      { url: `${SITE_URL}/projects/feed`, title: `${SITE_TITLE} — Projects` },
    ],
  },
}
```

This allows RSS readers and browsers to automatically discover available feeds.

## Architecture

### Feed Types

The site offers **three Atom feeds**:

1. **Unified Feed** (`/feed`) - Combined blog posts and projects
2. **Blog Feed** (`/blog/feed`) - Blog posts only
3. **Projects Feed** (`/projects/feed`) - Projects only

### Core Components

```
src/lib/feeds.ts           # Feed generation library
├── Types (FeedItem, FeedConfig)
├── Utilities (escapeXml, absoluteUrl, inferImageMimeType)
├── Converters (postToFeedItem, projectToFeedItem)
├── Generator (generateAtomFeed)
└── Builders (buildBlogFeed, buildProjectsFeed, buildCombinedFeed)

src/app/feed/route.ts      # Unified feed route
src/app/blog/feed/route.ts # Blog-only feed route
src/app/projects/feed/route.ts # Projects-only feed route
```

## Feed Generation Pipeline

### 1. Data Sources

**Blog Posts** (`src/data/posts.ts`)
```typescript
export type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  body: string; // MDX content
  image?: PostImage;
  // ... other fields
};
```

**Projects** (`src/data/projects.ts`)
```typescript
export type Project = {
  slug: string;
  title: string;
  description: string;
  timeline?: string;
  status: "active" | "in-progress" | "archived";
  tech?: string[];
  tags?: string[];
  links: ProjectLink[];
  image?: ProjectImage;
  highlights?: string[];
  // ... other fields
};
```

### 2. Conversion to Feed Items

Both posts and projects are converted to a unified `FeedItem` type:

```typescript
export type FeedItem = {
  id: string;           // Unique identifier (full URL)
  title: string;        // Item title
  description: string;  // Short description/summary
  content?: string;     // Full HTML content
  link: string;         // Item URL
  published: Date;      // Publication date
  updated?: Date;       // Last updated date
  categories?: string[]; // Tags/categories
  author?: {
    name: string;
    email: string;
  };
  image?: {
    url: string;        // Full image URL
    type: string;       // MIME type (image/jpeg, etc.)
    length?: number;    // Optional file size
  };
};
```

**Blog Post Conversion** (`postToFeedItem`)
- Converts MDX body to HTML using `mdxToHtml()`
- Extracts featured image from `post.image`
- Uses `post.publishedAt` and `post.updatedAt` for dates
- Includes all tags as categories

**Project Conversion** (`projectToFeedItem`)
- Builds HTML from description, tech stack, highlights, and links
- Extracts featured image from `project.image`
- Infers publication date from `timeline` field (e.g., "2024 → Present")
- Includes project tags as categories

### 3. XML Generation

Feed items are converted to Atom 1.0 format:

**Atom 1.0 Format**
```xml
<entry>
  <title type="text">...</title>
  <link href="https://www.dcyfr.ai/blog/..." rel="alternate" type="text/html" />
  <link rel="enclosure" type="image/jpeg" href="https://www.dcyfr.ai/blog/images/post/hero.jpg" />
  <id>https://www.dcyfr.ai/blog/...</id>
  <published>2025-11-10T12:00:00.000Z</published>
  <updated>2025-11-10T12:00:00.000Z</updated>
  <author>
    <name>Drew</name>
    <email>drew@www.dcyfr.ai</email>
  </author>
  <summary type="html"><![CDATA[...]]></summary>
  <content type="html"><![CDATA[...]]></content>
  <category term="TypeScript" label="TypeScript" />
  <category term="Security" label="Security" />
</entry>
```

## Feed Configuration

### Unified Feed (`/feed`)

**Purpose:** Provides all content (blog posts + projects) in a single feed.

**Configuration:**
```typescript
{
  title: "Drew's Lab",
  description: "Cybersecurity, Tech, and More",
  link: "https://www.dcyfr.ai",
  feedUrl: "https://www.dcyfr.ai/feed",
  language: "en-us",
  author: { name: "Drew", email: "drew@www.dcyfr.ai" }
}
```

**Sorting:** Combined items sorted by published date (newest first)  
**Limit:** 20 most recent items  
**Format:** RSS 2.0

### Blog Feed (`/blog/feed`)

**Purpose:** Blog posts only, for readers interested in articles/tutorials.

**Configuration:**
```typescript
{
  title: "Drew's Lab - Blog",
  description: "Articles and notes on web development, security, and TypeScript.",
  link: "https://www.dcyfr.ai/blog",
  feedUrl: "https://www.dcyfr.ai/blog/feed",
  // ... same author
}
```

**Filtering:** Excludes drafts (`!post.draft`)  
**Sorting:** By `publishedAt` (newest first)  
**Limit:** 20 posts  
**Format:** Atom 1.0

### Projects Feed (`/projects/feed`)

**Purpose:** Project updates only, for tracking portfolio additions.

**Configuration:**
```typescript
{
  title: "Drew's Lab - Projects",
  description: "Portfolio projects and proof of concept works.",
  link: "https://www.dcyfr.ai/projects",
  feedUrl: "https://www.dcyfr.ai/projects/feed",
  // ... same author
}
```

**Filtering:** Excludes hidden projects (`!project.hidden`)  
**Sorting:** Array order (manual curation)  
**Limit:** 20 projects  
**Format:** Atom 1.0

## Featured Image Support

### Image Detection

The feed system automatically detects and includes featured images when available:

**Blog Posts:**
```typescript
// In post frontmatter
image: {
  url: "/blog/images/my-post/hero.jpg",
  alt: "Post hero image",
  // ... optional width, height, caption
}
```

**Projects:**
```typescript
// In project data
image: {
  url: "/projects/my-project/screenshot.png",
  alt: "Project screenshot",
  position: "center"
}
```

### MIME Type Inference

The system infers MIME types from file extensions:

| Extension | MIME Type       |
|-----------|----------------|
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.png`    | `image/png`    |
| `.gif`    | `image/gif`    |
| `.webp`   | `image/webp`   |
| `.svg`    | `image/svg+xml`|
| *default* | `image/jpeg`   |

### Enclosure Format

**Atom 1.0:**
```xml
<link rel="enclosure" type="image/jpeg" href="https://www.dcyfr.ai/blog/images/post/hero.jpg" />
```

## Performance Optimizations

### Caching Strategy

All feed routes use identical caching configuration:

```typescript
export const revalidate = 3600; // 1 hour ISR

// Response headers
headers: {
  "Content-Type": "application/atom+xml; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
}
```

**Benefits:**
- **ISR (Incremental Static Regeneration):** Feeds rebuild every hour
- **CDN Caching:** 1 hour on edge, 24 hours stale-while-revalidate
- **Reduced Load:** Most requests served from cache

### Parallel Processing

Blog posts require MDX→HTML conversion, done in parallel:

```typescript
const items = await Promise.all(
  sortedPosts.map(postToFeedItem) // Each runs mdxToHtml()
);
```

### Item Limits

All feeds limited to **20 most recent items** to balance:
- Feed file size (faster downloads)
- Processing time (faster generation)
- Reader experience (recent content focus)

## Error Handling

All feed routes include try-catch error handling:

```typescript
export async function GET() {
  try {
    const xml = await buildBlogFeed(posts, "rss", 20);
    return new NextResponse(xml, { headers: { ... } });
  } catch (error) {
    console.error("Error generating blog feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
```

**Behavior on Error:**
- Logs detailed error to console/monitoring
- Returns 500 status with generic message
- Prevents feed corruption or partial output

## XML Safety

All user-generated content is properly escaped:

```typescript
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
```

**Usage:**
- Applied to all text fields (titles, descriptions, categories)
- CDATA sections used for HTML content (bypasses escaping)
- Image URLs and links also escaped for safety

## Standards Compliance

### Atom 1.0 Compliance (RFC 4287)

**Required Feed Elements:**
- ✅ `<title>` - Feed title
- ✅ `<id>` - Unique feed identifier (URL)
- ✅ `<updated>` - Last update timestamp
- ✅ `<link rel="alternate">` - Alternate representation
- ✅ `<link rel="self">` - Self-reference

**Recommended Feed Elements:**
- ✅ `<author>` - Feed author
- ✅ `<subtitle>` - Feed description
- ✅ `<generator>` - Generator software

**Required Entry Elements:**
- ✅ `<title>` - Entry title
- ✅ `<id>` - Unique entry identifier
- ✅ `<updated>` - Last update timestamp
- ✅ `<link rel="alternate">` - Entry URL

**Optional Entry Elements:**
- ✅ `<published>` - Publication date
- ✅ `<author>` - Entry author
- ✅ `<summary>` - Short summary
- ✅ `<content type="html">` - Full HTML content
- ✅ `<category>` - Categories/tags
- ✅ `<link rel="enclosure">` - Featured image

## Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test feeds
curl http://localhost:3000/feed
curl http://localhost:3000/blog/feed
curl http://localhost:3000/projects/feed

# Test legacy redirects (should return 307/308 redirect)
curl -I http://localhost:3000/rss.xml
curl -I http://localhost:3000/atom.xml

# Validate with xmllint (if installed)
curl -s http://localhost:3000/feed | xmllint --format -

# Check for specific content
curl -s http://localhost:3000/feed | grep "<title>"
curl -s http://localhost:3000/feed | grep "<enclosure"
```

### Online Validation

**W3C Feed Validator:** https://validator.w3.org/feed/

```bash
# Validate production feeds
https://validator.w3.org/feed/check.cgi?url=https://www.dcyfr.ai/feed
https://validator.w3.org/feed/check.cgi?url=https://www.dcyfr.ai/blog/feed
https://validator.w3.org/feed/check.cgi?url=https://www.dcyfr.ai/projects/feed
```

### Reader Testing

Test in popular RSS readers:
- **Feedly** - Web/mobile app
- **NetNewsWire** - macOS/iOS
- **Reeder** - macOS/iOS
- **Inoreader** - Web/mobile app
- **The Old Reader** - Web

**What to Check:**
- ✅ Feed loads without errors
- ✅ Items display correctly with titles, dates, authors
- ✅ Full content shows (not just summaries)
- ✅ Featured images display (if reader supports)
- ✅ Links work correctly
- ✅ Categories/tags appear

## Troubleshooting

### Issue: Feed Returns 500 Error

**Cause:** Error during feed generation (likely MDX conversion)

**Debug:**
```typescript
// Check server logs for:
console.error("Error generating blog feed:", error);
```

**Solutions:**
1. Check for invalid MDX in recent posts
2. Verify `mdxToHtml()` works for all posts
3. Check `SITE_URL` environment variable is set

### Issue: Images Not Appearing

**Cause:** Image path not absolute or MIME type incorrect

**Debug:**
```typescript
// Check image URLs in generated XML
curl http://localhost:3000/feed | grep "<enclosure"
```

**Solutions:**
1. Ensure `image.url` in frontmatter starts with `/` (local) or `http` (external)
2. Verify image file extension is recognized (`.jpg`, `.png`, etc.)
3. Check `absoluteUrl()` function is adding `SITE_URL` correctly

### Issue: Content Shows as Escaped HTML

**Cause:** Content not wrapped in CDATA or improperly escaped

**Solution:**
- Full content should be in `<![CDATA[...]]>` blocks
- This is handled automatically by `generateRssFeed()` and `generateAtomFeed()`

### Issue: Feed Validation Errors

**Cause:** Invalid XML structure or missing required elements

**Debug:**
```bash
# Validate locally
curl -s http://localhost:3000/feed | xmllint --noout -
```

**Solutions:**
1. Check all required RSS/Atom elements present
2. Ensure XML special characters are escaped
3. Verify namespaces declared correctly
4. Run through W3C validator

### Issue: Projects Not Showing Dates

**Cause:** Projects don't have explicit `publishedAt` field

**Solution:**
- System infers dates from `timeline` field (e.g., "2024 → Present" → Jan 1, 2024)
- Ensure projects have `timeline` field or update `projectToFeedItem()` fallback logic

## Extension Ideas

### JSON Feed Support

Add JSON Feed format (`/feed.json`):
```typescript
// src/app/feed.json/route.ts
export async function GET() {
  const items = await buildCombinedFeedItems(posts, projects, 20);
  return NextResponse.json({
    version: "https://jsonfeed.org/version/1.1",
    title: "Drew's Lab",
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    items: items.map(item => ({
      id: item.id,
      url: item.link,
      title: item.title,
      content_html: item.content,
      summary: item.description,
      date_published: item.published.toISOString(),
      tags: item.categories,
    }))
  });
}
```

### Tag-Specific Feeds

Generate feeds filtered by tag:
```typescript
// src/app/blog/tag/[tag]/feed/route.ts
export async function GET(req, { params }) {
  const tag = params.tag;
  const tagPosts = posts.filter(p => p.tags.includes(tag));
  const xml = await buildBlogFeed(tagPosts, "rss", 20);
  // ... return response
}
```

### XSLT Styling

Add stylesheet for browser viewing:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0">
  {/* ... */}
</rss>
```

### WebSub Support

Enable real-time feed updates:
```xml
<link rel="hub" href="https://pubsubhubbub.appspot.com/" />
<link rel="self" href="https://www.dcyfr.ai/feed" />
```

## References

- **RSS 2.0 Spec:** https://www.rssboard.org/rss-specification
- **Atom 1.0 (RFC 4287):** https://www.rfc-editor.org/rfc/rfc4287
- **W3C Feed Validator:** https://validator.w3.org/feed/
- **JSON Feed Spec:** https://jsonfeed.org/version/1.1

## Related Documentation

- **Blog System:** `/docs/blog/architecture.md`
- **MDX Processing:** `/docs/blog/mdx-processing.md`
- **Projects Data:** `/src/data/projects.ts`
- **Quick Reference:** `/docs/rss/quick-reference.md`
