<!-- TLP:CLEAR -->

# Feed System Testing Guide

**Quick reference for testing the Atom feed system**

## Local Testing Commands

```bash
# Start dev server
npm run dev

# Test all feed endpoints (all Atom format)
curl http://localhost:3000/feed
curl http://localhost:3000/blog/feed
curl http://localhost:3000/projects/feed

# Test legacy endpoint redirects (should show 307/308 redirect to /feed)
curl -I http://localhost:3000/rss.xml
curl -I http://localhost:3000/atom.xml

# Follow redirects and fetch final content
curl -L http://localhost:3000/rss.xml
curl -L http://localhost:3000/atom.xml

# Validate XML formatting (requires xmllint)
curl -s http://localhost:3000/feed | xmllint --format - | head -50

# Check for featured images
curl -s http://localhost:3000/feed | grep "rel=\"enclosure\""
curl -s http://localhost:3000/blog/feed | grep "rel=\"enclosure\""

# Check item counts
curl -s http://localhost:3000/feed | grep -c "<entry>"
curl -s http://localhost:3000/blog/feed | grep -c "<entry>"
curl -s http://localhost:3000/projects/feed | grep -c "<entry>"

# Check for full content (not just summaries)
curl -s http://localhost:3000/feed | grep -c "<content type=\"html\">"
```

## Feed URLs

| Feed Type | URL | Format | Content |
|-----------|-----|--------|---------|
| Unified | `/feed` | Atom 1.0 | Blog + Projects |
| Blog | `/blog/feed` | Atom 1.0 | Blog only |
| Projects | `/projects/feed` | Atom 1.0 | Projects only |

## Online Validation

**W3C Feed Validator**
```
https://validator.w3.org/feed/check.cgi?url=https://www.dcyfr.ai/feed
https://validator.w3.org/feed/check.cgi?url=https://www.dcyfr.ai/blog/feed
https://validator.w3.org/feed/check.cgi?url=https://www.dcyfr.ai/projects/feed
```

## RSS Reader Testing

Test in these popular readers:
- [ ] Feedly (https://feedly.com)
- [ ] NetNewsWire (macOS/iOS)
- [ ] Reeder (macOS/iOS)
- [ ] Inoreader (https://inoreader.com)
- [ ] The Old Reader (https://theoldreader.com)

### What to Check:
- [ ] Feed loads without errors
- [ ] All items display with titles and dates
- [ ] Full content shows (not truncated)
- [ ] Featured images appear (if supported by reader)
- [ ] Links work correctly
- [ ] Categories/tags display

## Manual Inspection Checklist

### Atom 1.0 Format
- [ ] XML declaration present
- [ ] Proper namespace (`xmlns="http://www.w3.org/2005/Atom"`)
- [ ] Feed has title, id, updated
- [ ] Self-referential `<link rel="self">`
- [ ] Entries have title, id, updated, published
- [ ] Entries have author blocks
- [ ] Entries have categories
- [ ] Entries have `<content type="html">` with full HTML
- [ ] Entries with images have `<link rel="enclosure">`
- [ ] No XML errors or malformed tags

## Sitemap Verification

```bash
# Check feeds appear in sitemap
curl http://localhost:3000/sitemap.xml | grep "feed"
```

Should show:
- `/feed`
- `/blog/feed`
- `/projects/feed`

## Performance Testing

```bash
# Check response times
time curl -s http://localhost:3000/feed > /dev/null
time curl -s http://localhost:3000/blog/feed > /dev/null
time curl -s http://localhost:3000/projects/feed > /dev/null

# Check cache headers
curl -I http://localhost:3000/feed
# Should show:
# Content-Type: application/rss+xml; charset=utf-8
# Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

## Expected Behavior

### Unified Feed (`/feed`)
- Contains both blog posts and projects
- Items sorted by date (newest first)
- Limited to 20 most recent items
- Blog posts have full MDX→HTML content
- Projects have description + highlights + tech stack

### Blog Feed (`/blog/feed`)
- Contains blog posts only
- Excludes drafts
- Full MDX→HTML content
- Featured images as enclosures
- All tags as categories

### Projects Feed (`/projects/feed`)
- Contains projects only
- Excludes hidden projects
- Rich HTML descriptions
- Tech stack, highlights, links included
- Featured images as enclosures

## Common Issues

### Issue: 500 Error
**Cause**: Error during feed generation  
**Check**: Server logs for error details  
**Fix**: Verify MDX content is valid in all posts

### Issue: Images Not Showing
**Cause**: Invalid image path or MIME type  
**Check**: Image URLs in post/project frontmatter  
**Fix**: Ensure URLs start with `/` or `http`

### Issue: Content Truncated
**Cause**: Reader doesn't support `<content:encoded>` or `<content>`  
**Check**: Different RSS reader  
**Fix**: This is expected; some readers only show summaries

### Issue: No Items in Feed
**Cause**: All items filtered out (drafts, hidden)  
**Check**: Post/project data in `src/data/`  
**Fix**: Ensure posts have `draft: false` and projects have `hidden: false`

## Files to Review

- `src/lib/feeds.ts` - Feed generation library
- `src/app/feed/route.ts` - Unified feed endpoint
- `src/app/blog/feed/route.ts` - Blog feed endpoint
- `src/app/projects/feed/route.ts` - Projects feed endpoint
- `src/app/rss.xml/route.ts` - Legacy RSS redirect
- `src/app/atom.xml/route.ts` - Legacy Atom redirect
- `src/app/layout.tsx` - Feed discovery meta tags
- `src/components/site-footer.tsx` - Feed link in footer
- `docs/rss/implementation.md` - Full documentation
- `docs/rss/quick-reference.md` - Quick reference

## Testing Legacy Redirects

### Expected Behavior

The legacy feed endpoints should redirect to the unified feed:

```bash
# Test redirect headers
curl -I http://localhost:3000/rss.xml
# Expected: HTTP/1.1 307 Temporary Redirect (or 308 Permanent Redirect)
# Location: /feed

curl -I http://localhost:3000/atom.xml
# Expected: HTTP/1.1 307 Temporary Redirect (or 308 Permanent Redirect)
# Location: /feed
```

### Verify Content After Redirect

```bash
# Follow redirects and get final content
curl -L http://localhost:3000/rss.xml > /tmp/redirected-feed.xml
curl -L http://localhost:3000/feed > /tmp/direct-feed.xml

# Compare - they should be identical
diff /tmp/redirected-feed.xml /tmp/direct-feed.xml
# Expected: No differences
```

### Test in RSS Readers

1. Add old feed URL (e.g., `https://www.dcyfr.ai/rss.xml`) to RSS reader
2. Reader should automatically follow redirect and subscribe to `/feed`
3. Reader may show updated feed URL in settings
4. Content should load normally

This ensures backwards compatibility for existing subscribers.

## Next Steps After Testing

1. [ ] Validate all feeds with W3C validator
2. [ ] Test in at least 2 different RSS readers
3. [ ] Verify featured images display correctly
4. [ ] Check sitemap includes feed URLs
5. [ ] Add feed discovery meta tags to site head (optional)
6. [ ] Consider JSON Feed support (optional)
7. [ ] Update project README with feed URLs (optional)
