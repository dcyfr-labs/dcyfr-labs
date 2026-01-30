<!-- TLP:CLEAR -->

# RSS/Atom/JSON Feed System

Comprehensive feed syndication system supporting multiple formats (Atom 1.0, JSON Feed 1.1) with automatic format detection, differential revalidation, and content-type-specific update frequencies.

## Architecture

### Feed Hierarchy

```
/feeds (discovery page)
  ├── /activity/feed (30 min) - All content: posts + projects + changelog
  ├── /blog/feed (1 hour) - Blog posts only
  └── /work/feed (6 hours) - Portfolio projects only
```

### Differential Revalidation

Content types update at different frequencies based on their velocity:

- **Activity Feed**: 30 minutes (`revalidate = 1800`)
  - Highest frequency due to combined content sources
  - Includes blog posts, projects, and site changelog
  
- **Blog Feed**: 1 hour (`revalidate = 3600`)
  - Medium frequency for blog post updates
  - Filters out drafts automatically
  
- **Work Feed**: 6 hours (`revalidate = 21600`)
  - Lowest frequency since projects update rarely
  - Filters out hidden projects

## Feed Formats

### Atom 1.0 (Default)

**Endpoints:**
- `/activity/feed` - Activity timeline
- `/blog/feed` - Blog posts
- `/work/feed` - Portfolio projects

**Features:**
- RFC 4287 compliant
- Media RSS namespace for images
- Full HTML content via `<content type="html">`
- Proper author metadata
- Category tags

**Example:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>DCYFR Labs — Activity</title>
  <subtitle>Complete timeline of blog posts, projects, and site updates.</subtitle>
  <link href="https://www.dcyfr.ai/activity/feed" rel="self" type="application/atom+xml" />
  <entry>...</entry>
</feed>
```

### JSON Feed 1.1

**Endpoints:**
- `/activity/feed.json` - Activity timeline
- `/blog/feed.json` - Blog posts
- `/work/feed.json` - Portfolio projects

**Features:**
- JSON Feed 1.1 spec compliant
- Developer-friendly format
- Easier to parse than XML
- Includes attachments for images

**Example:**
```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "DCYFR Labs — Activity",
  "home_page_url": "https://www.dcyfr.ai/activity",
  "feed_url": "https://www.dcyfr.ai/activity/feed.json",
  "items": [...]
}
```

### Auto-Detection

All feed routes support format auto-detection via `Accept` header:

```bash
# Request JSON Feed
curl -H "Accept: application/json" https://www.dcyfr.ai/blog/feed

# Request Atom Feed (default)
curl -H "Accept: application/atom+xml" https://www.dcyfr.ai/blog/feed
```

If no specific format is requested, Atom is served by default.

## Content Sources

### Blog Posts (`src/data/posts.ts`)

**Transformation:**
- MDX body converted to HTML via `mdxToHtml()`
- Full content included in feeds
- Drafts excluded automatically
- Tags mapped to categories

**Feed Item:**
```typescript
{
  id: "https://www.dcyfr.ai/blog/post-slug",
  title: "Post Title",
  description: "Post summary",
  content: "<p>Full HTML content...</p>",
  published: new Date("2024-01-15"),
  categories: ["typescript", "nextjs"]
}
```

### Projects (`src/data/projects.ts`)

**Transformation:**
- Description + tech stack + highlights combined
- Timeline parsed for published date
- Hidden projects excluded

**Feed Item:**
```typescript
{
  id: "https://www.dcyfr.ai/work/project-slug",
  title: "Project Title",
  description: "Project description",
  content: "<p>Description</p><p>Technologies: React, TypeScript</p>",
  published: new Date("2024-01-01"),
  categories: ["community", "typescript"]
}
```

### Changelog (`src/data/changelog.ts`)

**Transformation:**
- Type prefixed to title: `[Feature] New Activity Timeline`
- Optional link to related page
- Only visible entries included

**Feed Item:**
```typescript
{
  id: "https://www.dcyfr.ai/activity#activity-feed-launch",
  title: "[Feature] Launched Universal Activity Timeline",
  description: "New social media-inspired activity feed...",
  link: "https://www.dcyfr.ai/activity",
  published: new Date("2025-11-29"),
  categories: ["feature", "changelog"]
}
```

## Feed Discovery

### Discovery Page (`/feeds`)

Central hub for subscribing to feeds:
- Lists all available feeds
- Shows update frequencies
- Provides format options (Atom, JSON)
- Explains what RSS/Atom feeds are
- Links to popular feed readers

### HTML `<link>` Tags

All feeds discoverable via `<head>` metadata:

```html
<link rel="alternate" type="application/atom+xml" 
      href="/activity/feed" title="DCYFR Labs — Activity" />
<link rel="alternate" type="application/feed+json" 
      href="/activity/feed.json" title="DCYFR Labs — Activity (JSON)" />
```

Located in: `src/app/layout.tsx`

### Sitemap

All feeds included in sitemap with appropriate priorities:

```typescript
{
  url: "https://www.dcyfr.ai/activity/feed",
  changeFrequency: "hourly",
  priority: 0.7
}
```

Located in: `src/app/sitemap.ts`

## Redirects

### Legacy Feed Redirects

For backward compatibility with old feed URLs:

- `/feed` → `/activity/feed` (301 permanent)
- `/rss.xml` → `/feed` (handled in `app/rss.xml/route.ts`)
- `/atom.xml` → `/feed` (handled in `app/atom.xml/route.ts`)

Configured in: `next.config.ts`

### Footer Navigation

Footer link updated to point to discovery page:
- Old: `/feed` (direct feed URL)
- New: `/feeds` (discovery hub)

## Implementation

### Feed Library (`src/lib/feeds.ts`)

**Core Functions:**

```typescript
// Converters
postToFeedItem(post: Post): Promise<FeedItem>
projectToFeedItem(project: Project): FeedItem
changelogToFeedItem(entry: ChangelogEntry): FeedItem

// Generators
generateAtomFeed(items: FeedItem[], config: FeedConfig): string
generateJsonFeed(items: FeedItem[], config: FeedConfig): string
generateRssFeed(items: FeedItem[], config: FeedConfig): string

// Builders
buildBlogFeed(posts, format, limit): Promise<string>
buildProjectsFeed(projects, format, limit): Promise<string>
buildActivityFeed(posts, projects, changelog, format, limit): Promise<string>
buildCombinedFeed(posts, projects, format, limit): Promise<string>
```

**Key Features:**
- Type-safe with TypeScript
- Supports multiple formats (rss, atom, json)
- Configurable item limits
- Automatic URL normalization
- XML escaping for security
- MIME type inference for images

### Route Structure

```
src/app/
├── feeds/
│   └── page.tsx                    # Discovery hub
├── activity/
│   ├── feed/
│   │   └── route.ts                # Atom feed (auto-detect)
│   └── feed.json/
│       └── route.ts                # JSON feed (explicit)
├── blog/
│   ├── feed/
│   │   └── route.ts                # Atom feed (auto-detect)
│   └── feed.json/
│       └── route.ts                # JSON feed (explicit)
└── work/
    ├── feed/
    │   └── route.ts                # Atom feed (auto-detect)
    └── feed.json/
        └── route.ts                # JSON feed (explicit)
```

### Caching Strategy

All feeds use ISR (Incremental Static Regeneration) with stale-while-revalidate:

```typescript
export const revalidate = 3600; // 1 hour

return new NextResponse(xml, {
  headers: {
    "Content-Type": "application/atom+xml; charset=utf-8",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  },
});
```

**Benefits:**
- Instant responses from cache
- Background revalidation
- Reduced build times
- Handles traffic spikes

## Testing

### Unit Tests (`src/__tests__/lib/feeds.test.ts`)

**Coverage:**
- Feed item converters (post, project, changelog)
- Feed generators (Atom, JSON, RSS)
- Feed builders (blog, work, activity, combined)
- XML escaping and security
- Image URL handling
- Date formatting

**Run Tests:**
```bash
npm run test src/__tests__/lib/feeds.test.ts
```

### Manual Validation

**Atom Feed Validator:**
- Use [W3C Feed Validator](https://validator.w3.org/feed/)
- Test URL: `https://www.dcyfr.ai/activity/feed`

**JSON Feed Validator:**
- Use [JSON Feed Validator](https://validator.jsonfeed.org/)
- Test URL: `https://www.dcyfr.ai/activity/feed.json`

**Feed Reader Testing:**
- Test in Feedly, Inoreader, NetNewsWire
- Verify images display correctly
- Check full content rendering
- Test category filtering

## Future Enhancements

### Specialized Feeds (Backlog)

- **Tag-specific feeds**: `/blog/tags/[tag]/feed`
- **Category feeds**: `/blog/[category]/feed`
- **Series feeds**: `/blog/series/[series]/feed`
- **Featured-only feeds**: `/blog/featured/feed`
- **Standalone changelog feed**: `/changelog/feed`

### Analytics

- Track subscriber counts via User-Agent detection
- Monitor popular content in feeds
- Measure feed reader engagement
- Inform content strategy

### Feed Enhancements

- Podcast RSS support (enclosures, iTunes tags)
- Media RSS for video content
- WebSub (PubSubHubbub) for real-time updates
- Feed pagination for large archives

## Troubleshooting

### Feed Not Updating

1. Check revalidation period in route file
2. Verify ISR cache is working: `Cache-Control` header
3. Clear `.next` cache: `rm -rf .next`
4. Check for errors in build logs

### Invalid Feed XML

1. Run through W3C Feed Validator
2. Check for unescaped special characters
3. Verify CDATA sections are properly closed
4. Test XML parsing locally

### Missing Content

1. Verify content source filters (drafts, hidden)
2. Check MDX-to-HTML conversion
3. Validate feed item limit isn't too low
4. Inspect feed builder logic

### Auto-Detection Not Working

1. Verify `Accept` header in request
2. Check NextRequest import in route
3. Test with explicit `.json` endpoint
4. Inspect Content-Type header in response

## References

- **Atom Spec**: [RFC 4287](https://datatracker.ietf.org/doc/html/rfc4287)
- **JSON Feed Spec**: [jsonfeed.org](https://www.jsonfeed.org/)
- **RSS 2.0 Spec**: [RSS Advisory Board](https://www.rssboard.org/rss-specification)
- **Media RSS**: [RSS Best Practices](https://www.rssboard.org/media-rss)

## Related Documentation

- `docs/api/routes.md` - API route patterns
- `docs/architecture/caching-strategy.md` - ISR and cache headers
- `docs/features/blog-system.md` - Blog post system
- `docs/content/mdx-processing.md` - MDX to HTML conversion
