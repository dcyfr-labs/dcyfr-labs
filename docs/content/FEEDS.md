<!-- TLP:CLEAR -->

# Feed System Documentation

**Status:** Production Ready
**Last Updated:** December 25, 2025
**Formats:** RSS 2.0, Atom 1.0, JSON Feed 1.1

---

## 📡 Overview

dcyfr-labs provides comprehensive feed support across all content sections with three format types:

- **RSS 2.0** (default, widest support) - `/feed` or `/rss.xml`
- **Atom 1.0** (alternative) - `/atom.xml`
- **JSON Feed 1.1** (alternative) - `/feed.json`

Each major content section (main site, activity, blog, work) has all three feed types available.

---

## 🎯 Feed Endpoints

### Main Site Feeds

- **RSS 2.0:** [https://www.dcyfr.ai/feed](https://www.dcyfr.ai/feed) or [/rss.xml](https://www.dcyfr.ai/rss.xml)
- **Atom 1.0:** [https://www.dcyfr.ai/atom.xml](https://www.dcyfr.ai/atom.xml)
- **JSON Feed:** [https://www.dcyfr.ai/feed.json](https://www.dcyfr.ai/feed.json)

**Content:** Latest 20 blog posts and projects combined
**Revalidation:** 60 minutes

### Activity Feeds

- **RSS 2.0:** [https://www.dcyfr.ai/activity/feed](https://www.dcyfr.ai/activity/feed) or [/activity/rss.xml](https://www.dcyfr.ai/activity/rss.xml)
- **JSON Feed:** [https://www.dcyfr.ai/activity/feed.json](https://www.dcyfr.ai/activity/feed.json)

**Content:** Latest 50 posts, projects, and changelog entries
**Revalidation:** 30 minutes

### Blog Feeds

- **RSS 2.0:** [https://www.dcyfr.ai/blog/feed](https://www.dcyfr.ai/blog/feed) or [/blog/rss.xml](https://www.dcyfr.ai/blog/rss.xml)
- **JSON Feed:** [https://www.dcyfr.ai/blog/feed.json](https://www.dcyfr.ai/blog/feed.json)

**Content:** Latest blog posts only
**Revalidation:** 60 minutes

### Work/Projects Feeds

- **RSS 2.0:** [https://www.dcyfr.ai/work/feed](https://www.dcyfr.ai/work/feed) or [/work/rss.xml](https://www.dcyfr.ai/work/rss.xml)
- **JSON Feed:** [https://www.dcyfr.ai/work/feed.json](https://www.dcyfr.ai/work/feed.json)

**Content:** Latest projects only
**Revalidation:** 60 minutes

---

## 🏗️ Architecture

### Feed Generation Pipeline

```typescript
MDX → unified → remark-parse → remark-gfm → rehype-sanitize → rehypeStripFeedAttributes → HTML
```

**Key Components:**

1. **`src/lib/feeds.ts`** - Core feed generation logic
   - `buildCombinedFeed()` - Combines posts and projects
   - `buildActivityFeed()` - Includes changelog entries
   - `buildBlogFeed()` - Blog posts only
   - `buildWorkFeed()` - Projects only

2. **`src/lib/mdx-to-html.ts`** - Content sanitization
   - `rehypeStripFeedAttributes()` - Removes forbidden attributes
   - Strips: `data-footnote-*`, `aria-*`, other problematic attributes
   - Ensures feed validator compliance

3. **Route Files:**
   - `/feed/route.ts` - RSS 2.0 main feed
   - `/atom.xml/route.ts` - Atom 1.0 main feed
   - `/feed.json/route.ts` - JSON Feed main feed
   - `/rss.xml/route.ts` - Redirects to `/feed`
   - `/{section}/feed/route.ts` - Section-specific RSS feeds
   - `/{section}/rss.xml/route.ts` - Section-specific RSS aliases
   - `/{section}/feed.json/route.ts` - Section-specific JSON feeds

### Content Sanitization

**Problem:** remark-gfm generates footnotes with accessibility attributes that aren't valid in feed content:

- `data-footnote-ref`
- `data-footnote-backref`
- `data-footnotes`
- `aria-describedby`
- `aria-label`

**Solution:** Custom `rehypeStripFeedAttributes()` plugin removes these before sanitization:

```typescript
function rehypeStripFeedAttributes() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
      // Remove footnote attributes
      delete node.properties.dataFootnoteRef;
      delete node.properties.dataFootnoteBackref;
      delete node.properties.dataFootnotes;

      // Remove aria attributes
      delete node.properties.ariaDescribedby;
      delete node.properties.ariaLabel;
      delete node.properties.ariaLabelledby;
      delete node.properties.ariaHidden;
    });
  };
}
```

---

## 🔍 Validation

### Automated Validation Script

**Location:** `scripts/validate-feeds.mjs`

**Usage:**

```bash
npm run feeds:validate
```

**Checks:**

- ✅ All feed endpoints return proper HTTP status
- ✅ Content-Type headers match format (RSS/Atom/JSON)
- ✅ No forbidden HTML attributes in content
- ✅ Feed size reasonable

**CI/CD:** Runs automatically on PR when feed files change (`.github/workflows/validate-feeds.yml`)

### Manual Validation

**RSS 2.0 / Atom 1.0:**

- [W3C Feed Validator](https://validator.w3.org/feed/)

**JSON Feed 1.1:**

- [JSON Feed Validator](https://validator.jsonfeed.org/)

---

## 📋 Format Comparison

| Feature             | RSS 2.0               | Atom 1.0               | JSON Feed 1.1           |
| ------------------- | --------------------- | ---------------------- | ----------------------- |
| **Reader Support**  | ✅ Widest             | ⚠️ Good                | ⚠️ Growing              |
| **Spec Simplicity** | ✅ Simple             | ❌ Complex             | ✅ Simple               |
| **Date Format**     | RFC-822               | RFC-3339               | RFC-3339                |
| **Content-Type**    | `application/rss+xml` | `application/atom+xml` | `application/feed+json` |
| **Default Choice**  | ✅ Yes                | ❌ No                  | ❌ No                   |

**Recommendation:** Use RSS 2.0 (`/feed`) as default for maximum compatibility.

---

## 🚀 Adding New Feeds

### 1. Create Feed Route

```typescript
// src/app/new-section/feed/route.ts
import { buildCustomFeed } from '@/lib/feeds';
import type { NextRequest } from 'next/server';

export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  const feedXml = await buildCustomFeed(yourData, 'rss', 20);

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'X-Feed-Format': 'RSS 2.0',
    },
  });
}
```

### 2. Add Alternative Formats

```bash
# Create Atom variant
cp new-section/feed/route.ts new-section/atom.xml/route.ts
# Update to use format="atom" and Content-Type: application/atom+xml

# Create JSON Feed variant
cp new-section/feed/route.ts new-section/feed.json/route.ts
# Update to use format="json" and Content-Type: application/feed+json

# Create RSS alias
cp new-section/feed/route.ts new-section/rss.xml/route.ts
```

### 3. Update Sitemap

```typescript
// src/app/sitemap.ts
const feedEntries = [
  // ... existing feeds
  {
    url: `${base}/new-section/feed`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: `${base}/new-section/rss.xml`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: `${base}/new-section/feed.json`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
];
```

### 4. Add to Validation Script

```javascript
// scripts/validate-feeds.mjs
const FEED_ENDPOINTS = [
  // ... existing endpoints
  {
    path: '/new-section/feed',
    type: 'RSS 2.0',
    contentType: 'application/rss+xml',
  },
  {
    path: '/new-section/rss.xml',
    type: 'RSS 2.0',
    contentType: 'application/rss+xml',
  },
  {
    path: '/new-section/feed.json',
    type: 'JSON Feed 1.1',
    contentType: 'application/feed+json',
  },
];
```

---

## 🐛 Troubleshooting

### Feed Validator Errors

**Error:** `data-footnote-ref` or `aria-describedby` in content

**Cause:** remark-gfm adds these attributes for footnotes
**Fix:** Ensure `rehypeStripFeedAttributes()` is in the unified pipeline

**Error:** Wrong Content-Type header

**Cause:** Mismatch between format and header
**Fix:** Check route file headers match format:

- RSS 2.0: `application/rss+xml`
- Atom 1.0: `application/atom+xml`
- JSON Feed: `application/feed+json`

**Error:** Feed not updating

**Cause:** Stale revalidation cache
**Fix:**

1. Check `revalidate` time in route file
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

### Empty Feed Content

**Cause:** Data source filtering or date issues
**Fix:**

1. Check data source filters (published vs draft)
2. Verify date parsing (publishedAt, updatedAt)
3. Test with known good content

---

## 📊 Best Practices

### Content Quality

✅ **DO:**

- Strip unnecessary HTML attributes
- Use semantic HTML (headings, paragraphs, lists)
- Include full post content or meaningful excerpt
- Set proper `<guid>` (permanent URL)
- Use RFC-3339/RFC-822 dates consistently

❌ **DON'T:**

- Include JavaScript or interactive elements
- Use relative URLs (always absolute)
- Embed large images inline (link instead)
- Use custom data attributes
- Include form elements

### Performance

✅ **DO:**

- Set appropriate `revalidate` times
- Limit feed items (20-50 max)
- Cache feed responses
- Use ISR (Incremental Static Regeneration)

❌ **DON'T:**

- Generate feeds on every request
- Include hundreds of items
- Skip revalidation entirely
- Use client-side data fetching

### Compliance

✅ **DO:**

- Validate with W3C/JSON Feed validators
- Test with multiple feed readers
- Provide all three format types
- Add feeds to sitemap.xml
- Document feed URLs in README

❌ **DON'T:**

- Skip validation before deployment
- Assume one format works everywhere
- Hide feed URLs
- Break feed URLs without redirects

---

## 🔗 Resources

**Specifications:**

- [RSS 2.0 Spec](https://www.rssboard.org/rss-specification)
- [Atom 1.0 Spec (RFC 4287)](https://datatracker.ietf.org/doc/html/rfc4287)
- [JSON Feed 1.1 Spec](https://www.jsonfeed.org/version/1.1/)

**Validators:**

- [W3C Feed Validator](https://validator.w3.org/feed/)
- [JSON Feed Validator](https://validator.jsonfeed.org/)

**Tools:**

- [Feed Wrangler](https://feedwrangler.net/) (RSS reader)
- [Feedly](https://feedly.com/) (RSS reader)
- [NetNewsWire](https://netnewswire.com/) (macOS/iOS reader)

---

**Maintained by:** DCYFR Labs
**Questions?** See SUPPORT.md or [open an issue](https://github.com/dcyfr/dcyfr-labs/issues)
