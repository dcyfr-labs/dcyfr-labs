<!-- TLP:CLEAR -->

# Best Practices: Archive & Article Patterns

**Last Updated:** November 10, 2025  
**Purpose:** Guidelines and recommendations for using refactored architecture patterns

This guide provides best practices, tips, and recommendations based on lessons learned from the Phase 1-3 refactoring.

---

## 📚 Table of Contents

1. [Architecture Philosophy](#architecture-philosophy)
2. [When to Use Patterns](#when-to-use-patterns)
3. [Type Safety Guidelines](#type-safety-guidelines)
4. [Metadata Best Practices](#metadata-best-practices)
5. [Performance Optimization](#performance-optimization)
6. [Security & CSP](#security--csp)
7. [Common Pitfalls](#common-pitfalls)
8. [Testing Strategies](#testing-strategies)

---

## 🏗️ Architecture Philosophy

### Core Principles

**1. Generic for Infrastructure, Custom for Features**

```typescript
// ✅ GOOD: Use generic layout + custom features
<ArchiveLayout>
  <BlogFilters showReadingTime showLayoutToggle />
  <PostList layout="magazine" />
</ArchiveLayout>

// ❌ BAD: Force everything into generic patterns
<ArchiveLayout>
  <ArchiveFilters /> {/* Lost valuable blog-specific features */}
</ArchiveLayout>
```

**Lesson:** Don't remove domain-specific features just to fit generic patterns. The goal is maintainability, not minimalism.

---

**2. Centralize Common, Customize Unique**

```typescript
// ✅ GOOD: Centralized metadata with custom schema
export const metadata = createArchivePageMetadata({ /* common */ })

const customSchema = {
  '@type': 'SoftwareSourceCode',  // Domain-specific
  // ...
}

// ✅ GOOD: Reuse layout with custom content
<ArchiveLayout>
  <CustomVisualization data={items} />
</ArchiveLayout>
```

**Lesson:** Use the infrastructure for common needs (metadata, layouts), but don't hesitate to add custom logic for your domain.

---

**3. Type Safety Over Flexibility**

```typescript
// ✅ GOOD: Strict types
type Post = {
  slug: string
  title: string
  publishedAt: string
  tags: string[]
}

const data = getArchiveData<Post>({ /* ... */ })

// ❌ BAD: Loose types
const data = getArchiveData<any>({ /* ... */ })
```

**Lesson:** TypeScript catches errors early. Always define proper types for your content.

---

## 🎯 When to Use Patterns

### Archive Pattern

**Use for:**
- ✅ List/grid pages with multiple items
- ✅ Pages that need filtering, sorting, pagination
- ✅ Collections that will grow over time
- ✅ Content that users browse or search

**Examples:**
- `/blog` - Blog posts list
- `/projects` - Projects grid
- `/notes` - Notes archive
- `/resources` - Resource library

**Don't use for:**
- ❌ Single-item pages (use Article pattern)
- ❌ Static pages without collections (use plain components)
- ❌ Landing pages or marketing pages

---

### Article Pattern

**Use for:**
- ✅ Individual content pages
- ✅ Pages that need navigation (prev/next)
- ✅ Content with related items
- ✅ Long-form content that benefits from structured layout

**Examples:**
- `/blog/[slug]` - Individual blog post
- `/projects/[slug]` - Project details
- `/tutorials/[slug]` - Tutorial page

**Don't use for:**
- ❌ List/grid pages (use Archive pattern)
- ❌ Simple static pages
- ❌ Modal or dialog content

---

### Decision Tree

```
Do you have multiple items to display?
├─ Yes → Archive Pattern
│  └─ Do items need filtering/sorting?
│     ├─ Yes → Full Archive (filters + pagination)
│     └─ No → Minimal Archive (just layout)
└─ No → Single item?
   ├─ Yes → Article Pattern
   │  └─ Does it need navigation/related?
   │     ├─ Yes → Full Article (nav + related)
   │     └─ No → Minimal Article (just layout)
   └─ No → Plain Component
```

---

## 🔒 Type Safety Guidelines

### 1. Define Strict Types

```typescript
// ✅ GOOD: Explicit, documented type
/**
 * Represents a blog post in the system
 */
type Post = {
  /** Unique URL-safe identifier */
  slug: string
  /** Post title (max 100 chars) */
  title: string
  /** Short description for previews */
  excerpt: string
  /** ISO date string */
  publishedAt: string
  /** Optional ISO date string */
  updatedAt?: string
  /** Categorization tags */
  tags: string[]
  /** Whether post is featured */
  featured?: boolean
  /** Estimated reading time in minutes */
  readingTime?: number
}

// ❌ BAD: Loose type
type Post = {
  [key: string]: any
}
```

---

### 2. Use Generics Correctly

```typescript
// ✅ GOOD: Type-safe generic
const archiveData = getArchiveData<Post>({
  items: posts,
  searchParams: params,
  config: {
    searchFields: ['title', 'excerpt'], // TypeScript validates these exist
    sortOptions: {
      newest: { field: 'publishedAt', order: 'desc' }, // Type-checked
    },
  },
})

// ❌ BAD: No type parameter
const archiveData = getArchiveData({
  items: posts,
  config: {
    searchFields: ['titlee'], // Typo not caught!
  },
})
```

---

### 3. Consistent Field Names

```typescript
// ✅ GOOD: Consistent across types
type Post = { publishedAt: string }
type Project = { publishedAt: string }
type Note = { publishedAt: string }

// ❌ BAD: Inconsistent names
type Post = { publishedAt: string }
type Project = { createdDate: string }
type Note = { date: string }
```

**Why:** Consistent names allow reusing the same config across different content types.

---

### 4. Type-Safe Metadata

```typescript
// ✅ GOOD: Full type information
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return createArchivePageMetadata({
    title: 'Blog',
    description: 'Technical articles',
    path: '/blog',
    itemCount: posts.length,
  })
}

// TypeScript knows the return type matches Next.js requirements
```

---

## 🏷️ Metadata Best Practices

### 1. Always Set Meaningful Titles

```typescript
// ✅ GOOD: Descriptive titles
createArchivePageMetadata({
  title: 'Blog', // Will become "Blog | Your Site Name"
  description: 'Technical articles about web development and design',
  // ...
})

// ❌ BAD: Generic or missing
createArchivePageMetadata({
  title: 'Page',
  description: '',
})
```

---

### 2. Provide Hero Images When Possible

```typescript
// ✅ GOOD: Custom hero for better sharing
createArticlePageMetadata({
  title: post.title,
  description: post.excerpt,
  path: `/blog/${post.slug}`,
  heroImage: post.image ? {
    url: post.image,
    alt: post.imageAlt || post.title,
    width: 1200,
    height: 630,
  } : undefined, // Falls back to default OG image
})

// ⚠️ OKAY: Will use default OG image
createArticlePageMetadata({
  title: post.title,
  description: post.excerpt,
  path: `/blog/${post.slug}`,
  // No heroImage - uses site default
})
```

---

### 3. Include All Relevant Metadata

```typescript
// ✅ GOOD: Complete metadata for articles
createArticlePageMetadata({
  title: post.title,
  description: post.excerpt,
  path: `/blog/${post.slug}`,
  publishedTime: post.publishedAt, // Important for SEO
  modifiedTime: post.updatedAt,     // Shows freshness
  authors: [post.author],            // Attribution
  tags: post.tags,                   // Better categorization
  heroImage: post.image ? { /* ... */ } : undefined,
})

// ❌ BAD: Minimal metadata
createArticlePageMetadata({
  title: post.title,
  description: post.excerpt,
  path: `/blog/${post.slug}`,
  // Missing dates, authors, tags
})
```

---

### 4. JSON-LD for Rich Results

```typescript
// ✅ GOOD: Add structured data for better SEO
const articleSchema = createArticleSchema({
  headline: post.title,
  description: post.excerpt,
  url: `${SITE_URL}/blog/${post.slug}`,
  datePublished: new Date(post.publishedAt),
  dateModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
  author: { name: post.author },
  image: post.image,
  keywords: post.tags,
})

<script {...getJsonLdScriptProps(articleSchema, nonce)} />

// ⚠️ OKAY: But missing rich results opportunity
// No JSON-LD = basic search results
```

**Impact:** JSON-LD enables rich search results (star ratings, breadcrumbs, article cards).

---

## ⚡ Performance Optimization

### 1. Server-Side Filtering

```typescript
// ✅ GOOD: Filter on server
export default async function BlogPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  
  const { items } = getArchiveData({
    items: posts,
    searchParams: params, // Server-side filtering
    config: { /* ... */ },
  })

  return <PostList items={items} /> // Only sends filtered data
}

// ❌ BAD: Client-side filtering
'use client'
export default function BlogPage() {
  const [filtered, setFiltered] = useState(posts)
  
  // All posts sent to client, then filtered
  useEffect(() => {
    setFiltered(posts.filter(/* ... */))
  }, [])
}
```

**Why:** Server-side filtering reduces bundle size and improves performance.

---

### 2. Pagination for Large Collections

```typescript
// ✅ GOOD: Paginate large lists
const archiveData = getArchiveData({
  items: posts,
  searchParams: params,
  config: {
    itemsPerPage: 12, // Limit items per page
  },
})

// ❌ BAD: Show everything at once
const archiveData = getArchiveData({
  items: posts,
  searchParams: params,
  // No pagination = slow for 100+ items
})
```

**Guideline:** Paginate when you have 20+ items.

---

### 3. Static Generation When Possible

```typescript
// ✅ GOOD: Generate at build time
export async function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Pre-rendered at build time
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  return <Post {...post} />
}

// ⚠️ Use dynamic only when necessary
export const dynamic = 'force-dynamic' // Avoid unless data changes frequently
```

---

### 4. Optimize Images

```typescript
// ✅ GOOD: Use Next.js Image
import Image from 'next/image'

<Image
  src={post.image}
  alt={post.imageAlt}
  width={1200}
  height={630}
  loading="lazy"
  placeholder="blur"
/>

// ❌ BAD: Raw img tag
<img src={post.image} alt={post.imageAlt} />
```

---

## 🔐 Security & CSP

### 1. Always Use CSP Nonces

```typescript
// ✅ GOOD: Nonce for inline scripts
import { getNonce } from '@/lib/csp'
import { getJsonLdScriptProps } from '@/lib/metadata'

const nonce = getNonce()
<script {...getJsonLdScriptProps(jsonLd, nonce)} />

// ❌ BAD: Inline without nonce (blocked by CSP)
<script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

**Why:** CSP blocks inline scripts without nonces, protecting against XSS attacks.

---

### 2. Sanitize User Input

```typescript
// ✅ GOOD: Sanitize search queries
const { items } = getArchiveData({
  items: posts,
  searchParams: params,
  config: {
    searchFields: ['title', 'excerpt'], // Only search safe fields
  },
})

// ❌ BAD: Direct input rendering
<div dangerouslySetInnerHTML={{ __html: params.q }} /> // XSS risk!
```

---

### 3. Validate URL Parameters

```typescript
// ✅ GOOD: Validate and sanitize
const page = Math.max(1, parseInt(params.page as string) || 1)
const itemsPerPage = Math.min(100, parseInt(params.perPage as string) || 12)

// ❌ BAD: Trust user input
const page = Number(params.page)
const itemsPerPage = Number(params.perPage) // Could be negative or huge!
```

---

## ⚠️ Common Pitfalls

### 1. Date Type Mismatches

```typescript
// ❌ PROBLEM: String in JSON-LD
const jsonLd = createArticleSchema({
  datePublished: post.publishedAt, // string, not Date!
})

// ✅ SOLUTION: Convert to Date
const jsonLd = createArticleSchema({
  datePublished: new Date(post.publishedAt),
})
```

---

### 2. Missing Await on searchParams

```typescript
// ❌ PROBLEM: searchParams is a Promise
export default async function Page({ searchParams }) {
  const { items } = getArchiveData({
    searchParams: searchParams, // Promise, not object!
  })
}

// ✅ SOLUTION: Await the promise
export default async function Page({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const { items } = getArchiveData({
    searchParams: params, // Now it's an object
  })
}
```

---

### 3. Forgetting to Export generateStaticParams

```typescript
// ❌ PROBLEM: Dynamic rendering for static content
export default async function PostPage({ params }) {
  // Rendered on-demand, slower
}

// ✅ SOLUTION: Pre-generate all paths
export async function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

export default async function PostPage({ params }) {
  // Pre-rendered at build time, fast!
}
```

---

### 4. Over-Filtering Client-Side

```typescript
// ❌ PROBLEM: Send all data, filter on client
'use client'
export default function BlogPage() {
  const [posts, setPosts] = useState(allPosts) // 100+ posts
  const filtered = posts.filter(/* ... */)     // Client-side work
}

// ✅ SOLUTION: Filter on server
export default async function BlogPage({ searchParams }) {
  const params = await searchParams
  const { items } = getArchiveData({
    items: posts,
    searchParams: params, // Server filters, smaller payload
  })
}
```

---

### 5. Inconsistent Field Access

```typescript
// ❌ PROBLEM: Field name doesn't match type
type Post = { publishedAt: string }

getArchiveData<Post>({
  // ...
  config: {
    sortOptions: {
      newest: { field: 'createdAt', order: 'desc' }, // Wrong field!
    },
  },
})

// ✅ SOLUTION: Use correct field names
getArchiveData<Post>({
  // ...
  config: {
    sortOptions: {
      newest: { field: 'publishedAt', order: 'desc' },
    },
  },
})
```

---

## 🧪 Testing Strategies

### 1. Test Metadata Generation

```typescript
import { createArchivePageMetadata } from '@/lib/metadata'

describe('createArchivePageMetadata', () => {
  it('should generate correct title template', () => {
    const metadata = createArchivePageMetadata({
      title: 'Blog',
      description: 'Test',
      path: '/blog',
      itemCount: 10,
    })

    expect(metadata.title).toBe('Blog | Your Site Name')
  })

  it('should include OG image', () => {
    const metadata = createArchivePageMetadata({
      title: 'Blog',
      description: 'Test',
      path: '/blog',
      itemCount: 10,
    })

    expect(metadata.openGraph?.images).toBeDefined()
  })
})
```

---

### 2. Test Filtering Logic

```typescript
import { getArchiveData } from '@/lib/archive'

const testPosts = [
  { slug: 'a', title: 'Apple', tags: ['fruit'], publishedAt: '2025-01-01' },
  { slug: 'b', title: 'Banana', tags: ['fruit'], publishedAt: '2025-01-02' },
  { slug: 'c', title: 'Carrot', tags: ['vegetable'], publishedAt: '2025-01-03' },
]

describe('getArchiveData', () => {
  it('should filter by search query', () => {
    const { items } = getArchiveData({
      items: testPosts,
      searchParams: { q: 'apple' },
      config: { searchFields: ['title'] },
    })

    expect(items).toHaveLength(1)
    expect(items[0].slug).toBe('a')
  })

  it('should filter by tag', () => {
    const { items } = getArchiveData({
      items: testPosts,
      searchParams: { tags: 'fruit' },
      config: {},
    })

    expect(items).toHaveLength(2)
  })
})
```

---

### 3. Test Navigation

```typescript
import { getArticleData } from '@/lib/article'

describe('getArticleData', () => {
  it('should find previous and next items', () => {
    const { navigation } = getArticleData({
      item: testPosts[1], // Middle item
      allItems: testPosts,
      idField: 'slug',
      dateField: 'publishedAt',
    })

    expect(navigation.previous?.slug).toBe('a')
    expect(navigation.next?.slug).toBe('c')
  })
})
```

---

### 4. Visual Regression Testing

```typescript
// With Playwright or similar
test('archive page renders correctly', async ({ page }) => {
  await page.goto('/blog')
  
  // Check layout
  await expect(page.locator('h1')).toContainText('Blog')
  
  // Check filters
  await expect(page.locator('input[type="search"]')).toBeVisible()
  
  // Check items
  const posts = page.locator('[data-testid="post-card"]')
  await expect(posts).toHaveCount(12) // First page
})
```

---

## 📋 Quick Checklist

### New Archive Page
- [ ] Define strict TypeScript type for items
- [ ] Use `getArchiveData()` for filtering/sorting/pagination
- [ ] Generate metadata with `createArchivePageMetadata()`
- [ ] Add JSON-LD with `createCollectionSchema()`
- [ ] Use `<ArchiveLayout>` for structure
- [ ] Add filters if needed (generic or custom)
- [ ] Add pagination if 20+ items
- [ ] Test on mobile and desktop
- [ ] Verify metadata in social media debuggers

### New Article Page
- [ ] Define `generateStaticParams()` for SSG
- [ ] Use `getArticleData()` for navigation/related
- [ ] Generate metadata with `createArticlePageMetadata()`
- [ ] Add JSON-LD with `createArticleSchema()` and `createBreadcrumbSchema()`
- [ ] Use `<ArticleLayout>` for structure
- [ ] Add navigation (prev/next) if appropriate
- [ ] Add related items if valuable
- [ ] Optimize images with Next.js Image
- [ ] Test CSP nonce for inline scripts

---

## 📚 Additional Resources

- **Migration Guide:** `/docs/architecture/migration-guide.md` - Step-by-step guide
- **Examples:** `/docs/architecture/examples.md` - Copy-paste examples
- **Complete Overview:** `/docs/architecture/refactoring-complete.md` - Full refactoring story
- **Working Code:** `/src/app/blog/` and `/src/app/projects/` - Production examples

---

**Remember:** The goal is maintainable, type-safe code that serves your users well. Don't sacrifice features for patterns!
