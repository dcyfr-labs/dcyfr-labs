{/* TLP:CLEAR */}

# Architecture Patterns: Practical Examples

**Last Updated:** November 10, 2025  
**Purpose:** Real-world examples of archive and article patterns

This document provides copy-paste examples for common scenarios based on the refactored architecture.

---

## 📚 Table of Contents

1. [Archive Page Patterns](#archive-page-patterns)
2. [Article Page Patterns](#article-page-patterns)
3. [Custom Filter Examples](#custom-filter-examples)
4. [JSON-LD Schema Examples](#json-ld-schema-examples)
5. [Layout Variations](#layout-variations)

---

## 📋 Archive Page Patterns

### Pattern 1: Minimal Archive (No Filters)

**Use case:** Small collections that don't need filtering

```typescript
// src/app/testimonials/page.tsx
import { ArchiveLayout } from '@/components/layouts/archive-layout'
import { createArchivePageMetadata } from '@/lib/metadata'
import { testimonials } from '@/data/testimonials'

export const metadata = createArchivePageMetadata({
  title: 'Testimonials',
  description: 'What people are saying',
  path: '/testimonials',
  itemCount: testimonials.length,
})

export default function TestimonialsPage() {
  return (
    <ArchiveLayout 
      title="Testimonials" 
      description="What people are saying"
      itemCount={testimonials.length}
    >
      <div className="space-y-6">
        {testimonials.map(testimonial => (
          <TestimonialCard key={testimonial.id} {...testimonial} />
        ))}
      </div>
    </ArchiveLayout>
  )
}
```

---

### Pattern 2: Archive with Search Only

**Use case:** Searchable list without tags or complex filters

```typescript
// src/app/resources/page.tsx
import { ArchiveLayout } from '@/components/layouts/archive-layout'
import { getArchiveData } from '@/lib/archive'
import { createArchivePageMetadata } from '@/lib/metadata'
import { resources } from '@/data/resources'

export const metadata = createArchivePageMetadata({
  title: 'Resources',
  description: 'Useful tools and links',
  path: '/resources',
  itemCount: resources.length,
})

export default async function ResourcesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const params = await searchParams
  
  const { items, filters } = getArchiveData({
    items: resources,
    searchParams: params,
    config: {
      searchFields: ['title', 'description', 'url'],
      defaultSort: 'title',
    },
  })

  return (
    <ArchiveLayout 
      title="Resources" 
      description="Useful tools and links"
      itemCount={items.length}
      filters={
        <SearchBox 
          defaultValue={filters.query} 
          placeholder="Search resources..."
        />
      }
    >
      <ResourceList items={items} />
    </ArchiveLayout>
  )
}
```

---

### Pattern 3: Full-Featured Archive

**Use case:** Complex collections with search, tags, sorting, pagination

```typescript
// src/app/tutorials/page.tsx
import { ArchiveLayout } from '@/components/layouts/archive-layout'
import { ArchiveFilters } from '@/components/layouts/archive-filters'
import { ArchivePagination } from '@/components/layouts/archive-pagination'
import { getArchiveData } from '@/lib/archive'
import { 
  createArchivePageMetadata, 
  createCollectionSchema,
  getJsonLdScriptProps 
} from '@/lib/metadata'
import { getNonce } from '@/lib/csp'
import { tutorials } from '@/data/tutorials'

export const metadata = createArchivePageMetadata({
  title: 'Tutorials',
  description: 'Step-by-step guides and how-tos',
  path: '/tutorials',
  itemCount: tutorials.length,
})

export default async function TutorialsPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}) {
  const params = await searchParams
  const nonce = getNonce()
  
  const archiveData = getArchiveData({
    items: tutorials,
    searchParams: params,
    config: {
      searchFields: ['title', 'description', 'tags'],
      sortOptions: {
        newest: { field: 'publishedAt', order: 'desc' },
        popular: { field: 'views', order: 'desc' },
        title: { field: 'title', order: 'asc' },
      },
      defaultSort: 'newest',
      itemsPerPage: 12,
    },
  })

  const { items, pagination, filters } = archiveData

  const jsonLd = createCollectionSchema({
    name: 'Tutorials',
    description: 'Step-by-step guides and how-tos',
    url: 'https://yourdomain.com/tutorials',
    items: items.map(tutorial => ({
      name: tutorial.title,
      description: tutorial.description,
      url: `https://yourdomain.com/tutorials/${tutorial.slug}`,
      datePublished: new Date(tutorial.publishedAt),
    })),
  })

  return (
    <>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      
      <ArchiveLayout
        title="Tutorials"
        description="Step-by-step guides and how-tos"
        itemCount={items.length}
        filters={
          <ArchiveFilters
            currentQuery={filters.query}
            selectedTags={filters.tags}
            availableTags={filters.availableTags}
            basePath="/tutorials"
          />
        }
        pagination={
          pagination.totalPages > 1 ? (
            <ArchivePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              basePath="/tutorials"
            />
          ) : null
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(tutorial => (
            <TutorialCard key={tutorial.slug} tutorial={tutorial} />
          ))}
        </div>
      </ArchiveLayout>
    </>
  )
}
```

---

### Pattern 4: Archive with Featured Items

**Use case:** Highlight specific items at the top

```typescript
// src/app/showcase/page.tsx
import { ArchiveLayout } from '@/components/layouts/archive-layout'
import { getArchiveData } from '@/lib/archive'
import { createArchivePageMetadata } from '@/lib/metadata'
import { projects } from '@/data/projects'

export const metadata = createArchivePageMetadata({
  title: 'Showcase',
  description: 'Featured projects and work',
  path: '/showcase',
  itemCount: projects.length,
})

export default async function ShowcasePage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}) {
  const params = await searchParams
  
  const { items } = getArchiveData({
    items: projects,
    searchParams: params,
    config: {
      searchFields: ['title', 'description'],
      defaultSort: 'newest',
    },
  })

  // Split into featured and regular
  const featured = items.filter(p => p.featured)
  const regular = items.filter(p => !p.featured)

  return (
    <ArchiveLayout 
      title="Showcase" 
      description="Featured projects and work"
      itemCount={items.length}
    >
      {/* Featured section */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featured.map(project => (
              <FeaturedCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Regular items */}
      {regular.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">All Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regular.map(project => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </ArchiveLayout>
  )
}
```

---

## 📄 Article Page Patterns

### Pattern 1: Basic Article

**Use case:** Simple content page

```typescript
// src/app/guides/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/layouts/article-layout'
import { createArticlePageMetadata } from '@/lib/metadata'
import { guides } from '@/data/guides'

export async function generateStaticParams() {
  return guides.map(guide => ({ slug: guide.slug }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const guide = guides.find(g => g.slug === slug)
  if (!guide) return {}

  return createArticlePageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    publishedTime: guide.publishedAt,
  })
}

export default async function GuidePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const guide = guides.find(g => g.slug === slug)
  if (!guide) notFound()

  return (
    <ArticleLayout>
      <article>
        <header>
          <h1>{guide.title}</h1>
          <p className="text-lg text-muted-foreground">{guide.description}</p>
        </header>
        
        <div className="prose dark:prose-invert">
          {guide.content}
        </div>
      </article>
    </ArticleLayout>
  )
}
```

---

### Pattern 2: Article with Navigation

**Use case:** Long-form content with prev/next navigation

```typescript
// src/app/series/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/layouts/article-layout'
import { getArticleData } from '@/lib/article'
import { createArticlePageMetadata, createBreadcrumbSchema, getJsonLdScriptProps } from '@/lib/metadata'
import { getNonce } from '@/lib/csp'
import { episodes } from '@/data/episodes'

export async function generateStaticParams() {
  return episodes.map(ep => ({ slug: ep.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const episode = episodes.find(e => e.slug === slug)
  if (!episode) return {}

  return createArticlePageMetadata({
    title: episode.title,
    description: episode.description,
    path: `/series/${episode.slug}`,
    publishedTime: episode.publishedAt,
  })
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nonce = getNonce()
  
  const episode = episodes.find(e => e.slug === slug)
  if (!episode) notFound()

  // Get navigation
  const { navigation } = getArticleData({
    item: episode,
    allItems: episodes,
    idField: 'slug',
    dateField: 'publishedAt',
  })

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://yourdomain.com' },
    { name: 'Series', url: 'https://yourdomain.com/series' },
    { name: episode.title, url: `https://yourdomain.com/series/${episode.slug}` },
  ])

  return (
    <>
      <script {...getJsonLdScriptProps(breadcrumbSchema, nonce)} />
      
      <ArticleLayout>
        <article>
          <h1>{episode.title}</h1>
          <div className="prose dark:prose-invert">
            {episode.content}
          </div>
        </article>

        {/* Navigation */}
        <nav className="flex justify-between mt-12 pt-8 border-t">
          {navigation.previous ? (
            <a href={`/series/${navigation.previous.slug}`} className="group">
              <span className="text-sm text-muted-foreground">← Previous</span>
              <p className="font-medium group-hover:underline">
                {navigation.previous.title}
              </p>
            </a>
          ) : (
            <div />
          )}
          
          {navigation.next ? (
            <a href={`/series/${navigation.next.slug}`} className="group text-right">
              <span className="text-sm text-muted-foreground">Next →</span>
              <p className="font-medium group-hover:underline">
                {navigation.next.title}
              </p>
            </a>
          ) : (
            <div />
          )}
        </nav>
      </ArticleLayout>
    </>
  )
}
```

---

### Pattern 3: Article with Related Items

**Use case:** Content with recommendations

```typescript
// src/app/articles/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/layouts/article-layout'
import { getArticleData } from '@/lib/article'
import { 
  createArticlePageMetadata, 
  createArticleSchema,
  getJsonLdScriptProps 
} from '@/lib/metadata'
import { getNonce } from '@/lib/csp'
import { articles } from '@/data/articles'

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles.find(a => a.slug === slug)
  if (!article) return {}

  return createArticlePageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    publishedTime: article.publishedAt,
    tags: article.tags,
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nonce = getNonce()
  
  const article = articles.find(a => a.slug === slug)
  if (!article) notFound()

  // Get related articles
  const { relatedItems } = getArticleData({
    item: article,
    allItems: articles,
    relatedFields: ['tags', 'category'],
    idField: 'slug',
    maxRelated: 3,
  })

  const articleSchema = createArticleSchema({
    headline: article.title,
    description: article.excerpt,
    url: `https://yourdomain.com/articles/${article.slug}`,
    datePublished: new Date(article.publishedAt),
    keywords: article.tags,
  })

  return (
    <>
      <script {...getJsonLdScriptProps(articleSchema, nonce)} />
      
      <ArticleLayout>
        <article>
          <h1>{article.title}</h1>
          <div className="prose dark:prose-invert">
            {article.content}
          </div>
        </article>

        {/* Related articles */}
        {relatedItems.length > 0 && (
          <aside className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-bold mb-4">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedItems.map(related => (
                <a 
                  key={related.slug} 
                  href={`/articles/${related.slug}`}
                  className="group"
                >
                  <h3 className="font-medium group-hover:underline">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {related.excerpt}
                  </p>
                </a>
              ))}
            </div>
          </aside>
        )}
      </ArticleLayout>
    </>
  )
}
```

---

## 🎨 Custom Filter Examples

### Example 1: Category Dropdown

```typescript
'use client'

export function CategoryFilter({ 
  categories, 
  selected 
}: { 
  categories: string[]
  selected?: string 
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (category: string) => {
    const params = new URLSearchParams(window.location.search)
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select 
      value={selected || 'all'}
      onChange={(e) => handleChange(e.target.value)}
      className="..."
    >
      <option value="all">All Categories</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  )
}
```

---

### Example 2: Reading Time Range

```typescript
'use client'

export function ReadingTimeFilter({ 
  min, 
  max, 
  current 
}: { 
  min: number
  max: number
  current?: number 
}) {
  const [value, setValue] = useState(current || max)
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newValue: number) => {
    setValue(newValue)
    
    const params = new URLSearchParams(window.location.search)
    if (newValue === max) {
      params.delete('maxReadingTime')
    } else {
      params.set('maxReadingTime', newValue.toString())
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div>
      <label>Reading time: up to {value} min</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
      />
    </div>
  )
}
```

---

### Example 3: Layout Toggle

```typescript
'use client'

export function LayoutToggle({ 
  layout 
}: { 
  layout: 'grid' | 'list' 
}) {
  const router = useRouter()
  const pathname = usePathname()

  const toggleLayout = () => {
    const params = new URLSearchParams(window.location.search)
    const newLayout = layout === 'grid' ? 'list' : 'grid'
    params.set('layout', newLayout)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button onClick={toggleLayout} aria-label="Toggle layout">
      {layout === 'grid' ? <ListIcon /> : <GridIcon />}
    </button>
  )
}
```

---

## 🔗 JSON-LD Schema Examples

### Example 1: Recipe Schema

```typescript
const recipeSchema = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  'name': recipe.title,
  'description': recipe.description,
  'image': recipe.image,
  'datePublished': recipe.publishedAt,
  'prepTime': `PT${recipe.prepTime}M`,
  'cookTime': `PT${recipe.cookTime}M`,
  'totalTime': `PT${recipe.prepTime + recipe.cookTime}M`,
  'recipeYield': recipe.servings,
  'recipeIngredient': recipe.ingredients,
  'recipeInstructions': recipe.steps.map((step, i) => ({
    '@type': 'HowToStep',
    'position': i + 1,
    'text': step,
  })),
}
```

---

### Example 2: Course Schema

```typescript
const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  'name': course.title,
  'description': course.description,
  'provider': {
    '@type': 'Organization',
    'name': SITE_TITLE,
    'url': SITE_URL,
  },
  'coursePrerequisites': course.prerequisites,
  'hasCourseInstance': {
    '@type': 'CourseInstance',
    'courseMode': 'online',
    'duration': `PT${course.hours}H`,
  },
  'offers': course.price ? {
    '@type': 'Offer',
    'price': course.price,
    'priceCurrency': 'USD',
  } : undefined,
}
```

---

### Example 3: Event Schema

```typescript
const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  'name': event.title,
  'description': event.description,
  'startDate': event.startDate,
  'endDate': event.endDate,
  'eventStatus': 'https://schema.org/EventScheduled',
  'eventAttendanceMode': event.virtual 
    ? 'https://schema.org/OnlineEventAttendanceMode'
    : 'https://schema.org/OfflineEventAttendanceMode',
  'location': event.virtual ? {
    '@type': 'VirtualLocation',
    'url': event.url,
  } : {
    '@type': 'Place',
    'name': event.venue,
    'address': event.address,
  },
  'organizer': {
    '@type': 'Person',
    'name': AUTHOR_NAME,
  },
}
```

---

## 🎭 Layout Variations

### Variation 1: Magazine Layout

```typescript
export default async function BlogPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const { items } = getArchiveData({ /* ... */ })

  const [latest, ...rest] = items

  return (
    <ArchiveLayout {...}>
      {/* Hero post */}
      {latest && (
        <article className="mb-12 p-8 border rounded-lg">
          <h2 className="text-3xl font-bold">{latest.title}</h2>
          <p className="text-lg mt-2">{latest.excerpt}</p>
          <a href={`/blog/${latest.slug}`}>Read more →</a>
        </article>
      )}

      {/* Grid of other posts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </ArchiveLayout>
  )
}
```

---

### Variation 2: Timeline Layout

```typescript
export default async function TimelinePage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const { items } = getArchiveData({ /* ... */ })

  // Group by year
  const grouped = items.reduce((acc, item) => {
    const year = new Date(item.publishedAt).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(item)
    return acc
  }, {} as Record<number, typeof items>)

  return (
    <ArchiveLayout {...}>
      {Object.entries(grouped)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, items]) => (
          <section key={year} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{year}</h2>
            <ol className="space-y-4 border-l-2 pl-6">
              {items.map(item => (
                <li key={item.slug}>
                  <time className="text-sm text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </time>
                  <h3 className="font-medium">{item.title}</h3>
                </li>
              ))}
            </ol>
          </section>
        ))}
    </ArchiveLayout>
  )
}
```

---

### Variation 3: Masonry Grid

```typescript
export default async function GalleryPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const { items } = getArchiveData({ /* ... */ })

  return (
    <ArchiveLayout {...}>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map(item => (
          <div key={item.slug} className="break-inside-avoid">
            <GalleryCard item={item} />
          </div>
        ))}
      </div>
    </ArchiveLayout>
  )
}
```

---

## 📚 Next Steps

- **Learn More:** Read the [Migration Guide](./migration-guide) for detailed explanations
- **See Refactoring:** Check Refactoring Complete for the full story
- **Reference Code:** Browse working examples in `/src/app/blog/` and `/src/app/projects/`

---

**Have a pattern to share?** Add it to this document!
