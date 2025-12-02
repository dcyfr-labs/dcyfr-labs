# JSON-LD Structured Data Implementation

## Overview

This site implements comprehensive Schema.org structured data (JSON-LD) across all pages for enhanced SEO, AI assistant discovery, and rich search results. The implementation uses reusable utility functions for consistency and maintainability.

**Last Updated:** October 24, 2025  
**Status:** ✅ Complete

---

## Why JSON-LD?

### Benefits
- **Rich Search Results**: Google and other search engines can show enhanced previews (articles, breadcrumbs, ratings)
- **AI Discovery**: AI assistants like ChatGPT, Claude, and Perplexity can better understand and cite your content
- **Knowledge Graph**: Helps search engines build connections between your content and related topics
- **Voice Search**: Improves discoverability via voice assistants (Siri, Alexa, Google Assistant)
- **Social Previews**: Enhanced preview cards when sharing links on social media

### Schema.org Types Used
- **Article**: Blog posts with full metadata
- **BreadcrumbList**: Navigation hierarchy for better UX
- **CollectionPage**: Blog listing with ItemList
- **AboutPage**: About page structure
- **ProfilePage**: Personal/professional profile
- **ContactPage**: Contact information
- **Person**: Author/site owner identity
- **WebSite**: Homepage and site-wide metadata

---

## Implementation Architecture

### Utility Library: `src/lib/json-ld.ts`

Centralized schema generation functions for consistency across pages.

**Key Functions:**
- `getPersonSchema()` - Author identity schema
- `getWebSiteSchema()` - Homepage schema with search action
- `getBreadcrumbSchema()` - Navigation breadcrumbs
- `getArticleSchema()` - Blog post articles
- `getBlogCollectionSchema()` - Blog listing with ItemList
- `getAboutPageSchema()` - About page with ProfilePage
- `getContactPageSchema()` - Contact page
- `getJsonLdScriptProps()` - Script tag props with CSP nonce

### Page Coverage

| Page | Schema Types | Status |
|------|-------------|---------|
| Homepage (`/`) | WebSite, Person, WebPage | ✅ Complete |
| Blog Post (`/blog/[slug]`) | Article, BreadcrumbList | ✅ Enhanced |
| Blog Listing (`/blog`) | CollectionPage, ItemList | ✅ Added |
| Projects (`/projects`) | CollectionPage, ItemList, SoftwareSourceCode | ✅ Complete |
| About (`/about`) | AboutPage, ProfilePage, Person | ✅ Added |
| Contact (`/contact`) | ContactPage | ✅ Added |
| Resume (`/resume`) | Not implemented | 🔄 Future |

---

## Page-by-Page Implementation

### Homepage (`/`)

**Schema:** WebSite + Person + WebPage (graph)

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      url: SITE_URL,
      name: SITE_TITLE,
      publisher: { "@id": `${SITE_URL}/#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?q={search_term_string}`,
      },
    },
    {
      "@type": "Person",
      name: AUTHOR_NAME,
      jobTitle: "Cybersecurity Architect & Developer",
      sameAs: ["https://linkedin.com/in/dcyfr", "https://github.com/dcyfr"],
    },
  ],
};
```

**Features:**
- SearchAction enables search box in Google results
- Person schema links social profiles
- WebPage describes homepage content

---

### Blog Post (`/blog/[slug]`)

**Schema:** Article + BreadcrumbList (graph)

```typescript
const articleSchema = getArticleSchema(post, viewCount, socialImage);
const breadcrumbSchema = getBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Blog", url: `${SITE_URL}/blog` },
  { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
]);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [articleSchema, breadcrumbSchema],
};
```

**Article Properties:**
- `headline` - Post title
- `description` - Post summary
- `datePublished` - Initial publish date
- `dateModified` - Last updated date (if edited)
- `author` - Person schema
- `publisher` - Site/author identity
- `image` - ImageObject with social preview (1200x630)
- `wordCount` - Calculated from reading time
- `timeRequired` - Reading time estimate
- `keywords` - Post tags as comma-separated string
- `interactionStatistic` - View count (ReadAction)
- `isAccessibleForFree` - True (no paywall)
- `creativeWorkStatus` - "Archived" for old posts

**Breadcrumb Properties:**
- Position-based navigation hierarchy
- Helps Google show breadcrumbs in search results
- Improves user understanding of site structure

---

### Blog Listing (`/blog`)

**Schema:** CollectionPage + ItemList

```typescript
const jsonLd = getBlogCollectionSchema(
  filteredPosts,
  "Blog",
  "Articles about cybersecurity and software development"
);
```

**Features:**
- Lists all blog posts in structured format
- Updates dynamically based on filters (tags, search)
- numberOfItems reflects current filtered count
- Each post has position, name, and URL

**Use Cases:**
- Helps search engines understand content organization
- AI assistants can discover all posts at once
- Improved crawling efficiency

---

### Projects (`/projects`)

**Schema:** CollectionPage + ItemList + SoftwareSourceCode

```typescript
mainEntity: {
  "@type": "ItemList",
  itemListElement: projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareSourceCode",
      name: project.title,
      description: project.description,
      codeRepository: project.githubUrl,
      programmingLanguage: project.tech,
      creativeWorkStatus: project.status, // "Published", "Draft", "Archived"
    },
  })),
}
```

**Features:**
- SoftwareSourceCode for technical projects
- GitHub repository links
- Technology stack as programmingLanguage
- Project status (active, in-progress, archived)

---

### About Page (`/about`)

**Schema:** AboutPage + ProfilePage + Person (graph)

```typescript
const jsonLd = getAboutPageSchema(pageDescription, socialImage);

// Generates:
{
  "@graph": [
    { "@type": "AboutPage", about: { "@id": ".../#person" } },
    { "@type": "ProfilePage", mainEntity: { "@id": ".../#person" } },
    { "@type": "Person", /* full identity */ }
  ]
}
```

**Features:**
- AboutPage signals "about the site/author" content
- ProfilePage for personal/professional information
- Person schema with complete identity
- Social profile links (LinkedIn, GitHub)

---

### Contact Page (`/contact`)

**Schema:** ContactPage

```typescript
const jsonLd = getContactPageSchema(pageDescription);

{
  "@type": "ContactPage",
  url: `${SITE_URL}/contact`,
  name: "Contact",
  description: "...",
  about: { "@id": `${SITE_URL}/#person` },
}
```

**Features:**
- Signals contact form availability
- Links to Person schema for identity
- Helps AI assistants find contact methods

---

## CSP Integration

All JSON-LD scripts include nonce for Content Security Policy compliance:

```typescript
import { getJsonLdScriptProps } from "@/lib/json-ld";

const nonce = (await headers()).get("x-nonce") || "";
const jsonLd = /* schema object */;

<script {...getJsonLdScriptProps(jsonLd, nonce)} />
```

**Props Generated:**
```typescript
{
  type: "application/ld+json",
  nonce: "abc123...",
  dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  suppressHydrationWarning: true,
}
```

---

## Testing & Validation

### Google Rich Results Test

**URL:** https://search.google.com/test/rich-results

**How to Test:**
1. Visit Google Rich Results Test
2. Enter page URL or paste HTML
3. View detected schema types
4. Check for errors or warnings
5. Preview how results appear in search

**What to Check:**
- ✅ Article schema valid for blog posts
- ✅ Breadcrumbs detected correctly
- ✅ Author/publisher information present
- ✅ Images meet size requirements (1200x630)
- ✅ No errors or critical warnings

### Schema Markup Validator

**URL:** https://validator.schema.org/

**Benefits:**
- Validates against full Schema.org vocabulary
- More comprehensive than Google's tool
- Catches syntax errors and type mismatches

**How to Test:**
1. Visit validator.schema.org
2. Paste JSON-LD or enter URL
3. Review validation results
4. Fix any errors or warnings

### Manual Testing Commands

```bash
# Extract JSON-LD from homepage
curl https://www.dcyfr.ai/ | grep -A 100 "application/ld+json"

# Extract JSON-LD from blog post
curl https://www.dcyfr.ai/blog/test-post | grep -A 100 "application/ld+json"

# Test locally with dev server
curl http://localhost:3000/blog | grep -A 50 "application/ld+json"
```

### Browser DevTools

**Chrome/Edge:**
1. Right-click → Inspect
2. Elements tab → Search `application/ld+json`
3. View structured data in `<script>` tags
4. Verify JSON is valid (copy and paste into JSON validator)

**Firefox:**
1. Right-click → Inspect Element
2. Inspector tab → Find `<script type="application/ld+json">`
3. Check JSON formatting and content

---

## Common Issues & Solutions

### Issue: JSON-LD not appearing in search results
**Cause:** Google takes time to recrawl and reindex  
**Solution:**
- Submit sitemap to Google Search Console
- Request indexing for specific URLs
- Wait 1-2 weeks for search results to update

### Issue: Rich results not showing
**Cause:** Missing required properties or validation errors  
**Solution:**
- Run Google Rich Results Test
- Check for missing `datePublished`, `image`, or `author`
- Ensure images are 1200x630 or larger

### Issue: Duplicate schema on page
**Cause:** Multiple components adding same schema  
**Solution:**
- Use `@graph` to combine multiple schemas
- Ensure only one script tag per schema type per page

### Issue: Nonce not working (CSP errors)
**Cause:** Script tag missing nonce attribute  
**Solution:**
- Always use `getJsonLdScriptProps()` helper
- Verify middleware is generating nonces
- Check `x-nonce` header in network tab

---

## Best Practices

### DO ✅
- Use `@graph` to combine multiple schemas on one page
- Include `@id` for entities referenced across schemas
- Add imageObject with width/height for images
- Include dateModified when content is updated
- Use specific types (Article, not just Thing)
- Test with Google Rich Results Test before deploying
- Keep schemas in sync with actual page content

### DON'T ❌
- Don't add false or misleading information
- Don't duplicate properties across multiple schemas unnecessarily
- Don't use generic "Thing" when specific types exist
- Don't forget to update schemas when content changes
- Don't skip CSP nonce integration
- Don't add schema without testing validation

---

## Future Enhancements

### Potential Additions
- [ ] **Resume page schema** - Add Person with full work history
- [ ] **FAQ schema** - If adding FAQ section to blog posts
- [ ] **Video schema** - If adding video content
- [ ] **Event schema** - For talks, webinars, or presentations
- [ ] **Organization schema** - If representing a company/org
- [ ] **Rating/Review schema** - For project showcases
- [ ] **HowTo schema** - For tutorial-style blog posts
- [ ] **Course schema** - If creating educational content

### Monitoring & Analytics
- [ ] Track rich result impressions in Google Search Console
- [ ] Monitor click-through rates for pages with rich results
- [ ] A/B test different schema properties (images, descriptions)
- [ ] Set up alerts for schema validation errors

---

## Schema.org Resources

- **Official Documentation**: https://schema.org/
- **Google Guidelines**: https://developers.google.com/search/docs/appearance/structured-data
- **JSON-LD Playground**: https://json-ld.org/playground/
- **Schema App**: https://www.schemaapp.com/ (paid tool for advanced testing)
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Validator**: https://validator.schema.org/

---

## Related Documentation

- [SEO Best Practices](./seo-best-practices.md)
- [Site Configuration](../lib/site-config.md)
- [CSP Implementation](../security/csp/nonce-implementation.md)
- [Blog Architecture](../blog/architecture.md)

---

## Maintenance Checklist

### Monthly
- [ ] Test all pages with Google Rich Results Test
- [ ] Check Google Search Console for schema errors
- [ ] Verify breadcrumbs showing correctly in search results

### Quarterly
- [ ] Review Schema.org updates for new types/properties
- [ ] Update schema utility functions if needed
- [ ] Audit for any missing or outdated information

### When Adding New Pages
- [ ] Determine appropriate schema type(s)
- [ ] Add JSON-LD script tag with nonce
- [ ] Test with validator before deploying
- [ ] Submit new sitemap to Google Search Console

### When Updating Content
- [ ] Update `dateModified` for blog posts
- [ ] Re-validate if changing major content (title, description)
- [ ] Check if schema properties need updates

---

**Implementation Complete:** October 24, 2025  
**Coverage:** 6/7 pages (resume page pending)  
**Status:** ✅ Production-ready
