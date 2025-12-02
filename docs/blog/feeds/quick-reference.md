# RSS/Atom Feeds - Quick Reference

**Status:** ✅ Atom-Only Feeds (November 10, 2025)

## Feed URLs

All feeds use **Atom 1.0** format (RFC 4287):

- **Unified Feed (all content):** `https://www.dcyfr.ai/feed` - Includes both blog posts and projects
- **Blog Feed:** `https://www.dcyfr.ai/blog/feed` - Blog posts only
- **Projects Feed:** `https://www.dcyfr.ai/projects/feed` - Projects only

### Legacy Feed Redirects

The following legacy feed URLs now redirect to the unified feed with HTTP 301:

- `/rss.xml` → `/feed` (301 Permanent Redirect)
- `/atom.xml` → `/feed` (301 Permanent Redirect)

This maintains backwards compatibility for users with old feed URLs in their RSS readers.

### Feed Discovery

The site includes feed discovery meta tags in the `<head>` element for automatic detection by RSS readers and browsers:

```html
<link rel="alternate" type="application/atom+xml" href="https://www.dcyfr.ai/feed" title="www.dcyfr.ai — All Content" />
<link rel="alternate" type="application/atom+xml" href="https://www.dcyfr.ai/blog/feed" title="www.dcyfr.ai — Blog" />
<link rel="alternate" type="application/atom+xml" href="https://www.dcyfr.ai/projects/feed" title="www.dcyfr.ai — Projects" />
```

## What Changed in Latest Update

### Atom-Only Feeds + Backwards Compatibility (November 10, 2025)

✅ **Simplified to Single Format**
- Removed legacy RSS 2.0 and Atom endpoints (`/rss.xml`, `/atom.xml`)
- All feeds now use Atom 1.0 format exclusively
- Better standards compliance and modern feed format
- Simpler maintenance with single format

✅ **301 Redirects for Legacy URLs**
- `/rss.xml` → `/feed` (HTTP 301 Permanent Redirect)
- `/atom.xml` → `/feed` (HTTP 301 Permanent Redirect)
- Maintains backwards compatibility for existing subscribers
- Feed readers will automatically update to new URLs

✅ **Feed Discovery Meta Tags**
- Added `<link rel="alternate">` tags to site `<head>` in `layout.tsx`
- All three feeds (unified, blog, projects) discoverable by RSS readers
- Browsers and feed readers can auto-detect available feeds
- Proper titles for each feed type

✅ **Site Footer Updated**
- Replaced separate "Atom" and "RSS" links with single "Feed" link
- Cleaner, simpler navigation
- Points to unified `/feed` endpoint

### Previous Refactor Features (Still Active)
✅ **Multiple Feed Types**
- Unified site feed combining blog posts and projects
- Dedicated feeds for blog and projects separately
- All feeds support featured images with proper enclosures

✅ **Featured Image Support**
- Automatic MIME type detection (JPEG, PNG, WebP, GIF, SVG)
- Proper Atom `<link rel="enclosure">` elements
- Full URLs for all image assets

✅ **Shared Library Architecture**
- All feeds use `src/lib/feeds.ts` for consistency
- Type-safe converters for posts and projects
- DRY principle: no code duplication across routes
- Easy to extend for future feed types

### Files Modified
- `src/app/feed/route.ts` - Changed from RSS to Atom format
- `src/app/blog/feed/route.ts` - Changed from RSS to Atom format
- `src/app/projects/feed/route.ts` - Changed from RSS to Atom format
- `src/app/rss.xml/route.ts` - **RECREATED** as redirect to `/feed`
- `src/app/atom.xml/route.ts` - **RECREATED** as redirect to `/feed`
- `src/app/layout.tsx` - Added feed discovery meta tags
- `src/components/site-footer.tsx` - Unified feed link
- `src/app/sitemap.ts` - Removed legacy feed URLs (redirects not in sitemap)
- All documentation updated

## Key Features (All Feeds)

### ✅ Full Content
- Complete HTML content, not just summaries
- MDX converted to clean, sanitized HTML for blog posts
- Rich descriptions with highlights for projects

### ✅ Featured Images
- Automatic inclusion when `image.url` is present in post/project frontmatter
- MIME type inference from file extension
- Proper Atom `<link rel="enclosure">` elements

### ✅ Author Information
- `<author>` blocks with `<name>` and `<email>`

### ✅ Categories/Tags
- `<category term="..." label="...">` elements
- Works for both blog post tags and project tags

### ✅ Feed Metadata
- Self-referential links (`<link rel="self">`)
- Generator tags identifying Next.js
- Updated timestamps (`<updated>`)
- Proper XML namespaces

### ✅ Performance
- Limited to 20 most recent items per feed
- Parallel HTML conversion for blog posts
- 1-hour revalidation (`revalidate = 3600`)
- CDN-friendly cache headers

## Usage Examples

### Subscribe to All Content
```
https://www.dcyfr.ai/feed
```
Perfect for readers who want everything: new blog posts and project updates.

### Subscribe to Blog Only
```
https://www.dcyfr.ai/blog/feed
```
For readers interested in articles and tutorials only.

### Subscribe to Projects Only
```
https://www.dcyfr.ai/projects/feed
```
For tracking portfolio updates and new projects.

### Testing Locally
```bash
npm run dev

# Test unified feed
curl http://localhost:3000/feed

# Test blog feed
curl http://localhost:3000/blog/feed

# Test projects feed
curl http://localhost:3000/projects/feed
```

### Validation
- [W3C Feed Validator](https://validator.w3.org/feed/)
- Test in RSS readers (Feedly, NetNewsWire, Reeder, Inoreader, etc.)

## Architecture

```
Feed Route (e.g., /feed)
    ↓
src/lib/feeds.ts
    ↓
buildCombinedFeed() / buildBlogFeed() / buildProjectsFeed()
    ↓
Convert items → postToFeedItem() / projectToFeedItem()
    ↓
Generate Atom XML → generateAtomFeed()
    ↓
Response with proper headers
```

### Data Flow for Blog Posts
```
src/data/posts.ts → postToFeedItem() → mdxToHtml() → FeedItem → Atom XML
```

### Data Flow for Projects
```
src/data/projects.ts → projectToFeedItem() → FeedItem → Atom XML
```

## Standards Compliance

✅ **Atom 1.0 (RFC 4287)**
- Required elements: `<title>`, `<id>`, `<updated>`, `<link>`
- Recommended: `<author>`, `<category>`, `<content>`
- Proper link relations: `rel="self"` and `rel="alternate"`
- Enclosures: `<link rel="enclosure" type="..." href="..." />`

## Feed Discovery

Add these to your site's `<head>` for automatic feed discovery:

```html
<!-- Primary feed (all content) -->
<link rel="alternate" type="application/atom+xml" title="Drew's Lab - All Content" href="https://www.dcyfr.ai/feed" />

<!-- Blog feed -->
<link rel="alternate" type="application/atom+xml" title="Drew's Lab - Blog" href="https://www.dcyfr.ai/blog/feed" />

<!-- Projects feed -->
<link rel="alternate" type="application/atom+xml" title="Drew's Lab - Projects" href="https://www.dcyfr.ai/projects/feed" />
```
- Validation checklist
- Resources and references
