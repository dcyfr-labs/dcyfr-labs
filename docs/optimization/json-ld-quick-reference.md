{/* TLP:CLEAR */}

# JSON-LD Quick Reference

Quick guide for working with JSON-LD structured data on this site.

## Adding JSON-LD to a New Page

### 1. Import Utilities
```typescript
import { getJsonLdScriptProps } from "@/lib/json-ld";
import { headers } from "next/headers";
```

### 2. Create Schema in Component
```typescript
export default async function MyPage() {
  const nonce = (await headers()).get("x-nonce") || "";
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "My Page",
    description: "Page description",
    url: `${SITE_URL}/my-page`,
  };
  
  return (
    <>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      {/* page content */}
    </>
  );
}
```

## Available Schema Generators

### Person Schema
```typescript
import { getPersonSchema } from "@/lib/json-ld";

const personSchema = getPersonSchema(socialImageUrl);
// Includes: name, jobTitle, sameAs (social links)
```

### Article Schema (Blog Posts)
```typescript
import { getArticleSchema } from "@/lib/json-ld";

const articleSchema = getArticleSchema(post, viewCount, imageUrl);
// Includes: headline, author, datePublished, wordCount, etc.
```

### Breadcrumb Schema
```typescript
import { getBreadcrumbSchema } from "@/lib/json-ld";

const breadcrumbSchema = getBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Blog", url: `${SITE_URL}/blog` },
  { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
]);
```

### Blog Collection Schema
```typescript
import { getBlogCollectionSchema } from "@/lib/json-ld";

const jsonLd = getBlogCollectionSchema(
  posts,
  "Blog",
  "Articles about tech"
);
```

### About Page Schema
```typescript
import { getAboutPageSchema } from "@/lib/json-ld";

const jsonLd = getAboutPageSchema(description, socialImage);
// Returns graph with AboutPage + ProfilePage + Person
```

### Contact Page Schema
```typescript
import { getContactPageSchema } from "@/lib/json-ld";

const jsonLd = getContactPageSchema(description);
```

## Combining Multiple Schemas

Use `@graph` to include multiple schemas on one page:

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    articleSchema,
    breadcrumbSchema,
    // ... more schemas
  ],
};
```

## Testing Your Schema

### Google Rich Results Test
```bash
# Online
https://search.google.com/test/rich-results

# Enter your URL or paste HTML
```

### Schema Validator
```bash
# Online
https://validator.schema.org/

# Paste JSON-LD or enter URL
```

### Local Testing
```bash
# Extract JSON-LD from page
curl http://localhost:3000/blog/my-post | grep -A 50 "application/ld+json"
```

## Common Schema Types

| Type | Use Case |
|------|----------|
| Article | Blog posts |
| WebPage | Generic pages |
| AboutPage | About pages |
| ContactPage | Contact forms |
| CollectionPage | Lists/indexes |
| ProfilePage | Personal profiles |
| Person | Author/identity |
| BreadcrumbList | Navigation |
| ItemList | Lists of items |
| SoftwareSourceCode | Code projects |

## Required Properties

### Article
- ✅ headline
- ✅ datePublished
- ✅ author (Person)
- ✅ image (ImageObject recommended)

### Person
- ✅ name
- ✅ Optional: url, jobTitle, sameAs, image

### BreadcrumbList
- ✅ itemListElement (array)
- ✅ Each item: position, name, item (URL)

## CSP Compliance

Always include nonce for Content Security Policy:

```typescript
const nonce = (await headers()).get("x-nonce") || "";
<script {...getJsonLdScriptProps(jsonLd, nonce)} />
```

## Troubleshooting

### Schema not appearing
- Check browser DevTools → Elements → Search `application/ld+json`
- Verify JSON is valid (no trailing commas, proper quotes)

### Rich results not showing
- Wait 1-2 weeks for Google to recrawl
- Submit URL to Google Search Console
- Check required properties are present

### CSP errors
- Ensure nonce is included in script tag
- Verify middleware is generating nonces
- Check network tab for `x-nonce` header

## File Locations

- **Utility Library**: `src/lib/json-ld.ts`
- **Documentation**: `/docs/seo/json-ld-implementation.md`
- **Examples**: Check existing page implementations

## Resources

- Schema.org: https://schema.org/
- Google Guidelines: https://developers.google.com/search/docs/appearance/structured-data
- Rich Results Test: https://search.google.com/test/rich-results
- Validator: https://validator.schema.org/
