# Component-First Decision Trees

Visual flowcharts for making architectural decisions in the dcyfr-labs codebase. Use these to quickly determine which patterns, layouts, and helpers to use without re-reading documentation.

**Quick Links:**
- [Which Layout Should I Use?](#which-layout-should-i-use)
- [Which Container Width?](#which-container-width)
- [Which Metadata Helper?](#which-metadata-helper)
- [Do I Need an Error Boundary?](#do-i-need-an-error-boundary)
- [How Should I Import Components?](#how-should-i-import-components)

---

## Which Layout Should I Use?

**TL;DR: Use PageLayout for 90% of pages. Only use ArticleLayout for blog posts, ArchiveLayout for filterable lists.**

```mermaid
graph TD
    Start[Creating a new page?] --> Question1{Is this a blog post?}
    
    Question1 -->|Yes| ArticleLayout[Use ArticleLayout]
    ArticleLayout --> ArticleFeatures[Includes:<br/>- Reading time<br/>- Table of contents<br/>- Related posts<br/>- Metadata<br/>- Hero image support]
    ArticleFeatures --> ArticleExample[Example:<br/>src/app/blog/slug/page.tsx]
    
    Question1 -->|No| Question2{Is this a filterable list?}
    
    Question2 -->|Yes| Question3{Does it need filters,<br/>pagination, or sorting?}
    Question3 -->|Yes| ArchiveLayout[Use ArchiveLayout]
    ArchiveLayout --> ArchiveFeatures[Includes:<br/>- Filter controls<br/>- Pagination<br/>- Item count badge<br/>- View toggles]
    ArchiveFeatures --> ArchiveExample[Examples:<br/>- src/app/blog/page.tsx<br/>- src/app/work/page.tsx]
    
    Question3 -->|No| PageLayout[Use PageLayout]
    Question2 -->|No| PageLayout
    
    PageLayout --> PageFeatures[Standard wrapper:<br/>- Consistent spacing<br/>- Responsive layout<br/>- SEO-ready<br/>- Header/footer included]
    PageFeatures --> PageExample[Examples:<br/>- src/app/page.tsx<br/>- src/app/about/page.tsx<br/>- src/app/contact/page.tsx<br/>- src/app/resume/page.tsx]
    
    style ArticleLayout fill:#4ade80
    style ArchiveLayout fill:#60a5fa
    style PageLayout fill:#fbbf24
    style Start fill:#e5e7eb
```

**Code Examples:**

```typescript
// ✅ PageLayout (90% of pages)
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description: "Learn more about me",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageLayout>
      {/* Your content */}
    </PageLayout>
  );
}

// ✅ ArticleLayout (blog posts only)
import { ArticleLayout } from "@/components/layouts";
import { createArticlePageMetadata } from "@/lib/metadata";

export const metadata = createArticlePageMetadata({
  title: post.title,
  description: post.summary,
  path: `/blog/${post.slug}`,
  publishedAt: new Date(post.publishedAt),
  tags: post.tags,
  image: post.image?.url,
});

export default function BlogPost() {
  return (
    <ArticleLayout post={post}>
      <MDX source={post.content} />
    </ArticleLayout>
  );
}

// ✅ ArchiveLayout (filterable lists)
import { ArchiveLayout } from "@/components/layouts";
import { createArchivePageMetadata } from "@/lib/metadata";

export const metadata = createArchivePageMetadata({
  title: "Blog",
  itemCount: posts.length,
});

export default function BlogArchive() {
  return (
    <ArchiveLayout>
      <PostList posts={posts} />
    </ArchiveLayout>
  );
}
```

---

## Which Container Width?

**TL;DR: Use `CONTAINER_WIDTHS.content` for 80% of content. Narrow for focused reading, wide for dashboards.**

```mermaid
graph TD
    Start[Need to constrain content width?] --> Question1{What type of content?}
    
    Question1 -->|Long-form text,<br/>blog posts| Narrow[CONTAINER_WIDTHS.narrow]
    Narrow --> NarrowValue[672px max-width<br/>Optimal for reading]
    NarrowValue --> NarrowExample[Examples:<br/>- Blog post content<br/>- Documentation]
    
    Question1 -->|Standard pages,<br/>forms, lists| Standard[CONTAINER_WIDTHS.standard]
    Standard --> StandardValue[896px max-width<br/>Most common choice]
    StandardValue --> StandardExample[Examples:<br/>- About page<br/>- Contact form<br/>- Resume]
    
    Question1 -->|Rich content,<br/>media, components| Content[CONTAINER_WIDTHS.content]
    Content --> ContentValue[1120px max-width<br/>Default for most pages]
    ContentValue --> ContentExample[Examples:<br/>- Homepage<br/>- Project showcases<br/>- Feature pages]
    
    Question1 -->|Filterable lists,<br/>archives| Archive[CONTAINER_WIDTHS.archive]
    Archive --> ArchiveValue[1280px max-width<br/>Accommodates sidebars]
    ArchiveValue --> ArchiveExample[Examples:<br/>- Blog archive<br/>- Project listing]
    
    Question1 -->|Analytics,<br/>admin panels| Dashboard[CONTAINER_WIDTHS.dashboard]
    Dashboard --> DashboardValue[1536px max-width<br/>Full-width layouts]
    DashboardValue --> DashboardExample[Examples:<br/>- Analytics dashboards<br/>- Admin interfaces]
    
    style Narrow fill:#fbbf24
    style Standard fill:#fbbf24
    style Content fill:#4ade80
    style Archive fill:#60a5fa
    style Dashboard fill:#a78bfa
    style Start fill:#e5e7eb
```

**Code Examples:**

```typescript
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

// ✅ Narrow (blog content)
<div className={`mx-auto ${CONTAINER_WIDTHS.narrow}`}>
  <MDX source={content} />
</div>

// ✅ Standard (most pages - 80% choice)
<div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
  <AboutContent />
</div>

// ✅ Content (rich layouts)
<div className={`mx-auto ${CONTAINER_WIDTHS.content}`}>
  <ProjectShowcase />
</div>

// ✅ Archive (with filters)
<div className={`mx-auto ${CONTAINER_WIDTHS.archive}`}>
  <ArchiveLayout>...</ArchiveLayout>
</div>

// ✅ Dashboard (analytics)
<div className={`mx-auto ${CONTAINER_WIDTHS.dashboard}`}>
  <AnalyticsDashboard />
</div>
```

---

## Which Metadata Helper?

**TL;DR: Use `createPageMetadata` for standard pages, `createArchivePageMetadata` for lists, `createArticlePageMetadata` for blog posts.**

```mermaid
graph TD
    Start[Need to generate metadata?] --> Question1{What type of page?}
    
    Question1 -->|Standard page:<br/>about, contact,<br/>resume, etc| PageMeta[createPageMetadata]
    PageMeta --> PageProps[Required props:<br/>- title<br/>- description<br/>- path]
    PageProps --> PageGenerated[Generates:<br/>- OpenGraph<br/>- Twitter Card<br/>- Canonical URL]
    PageGenerated --> PageExample[Example:<br/>createPageMetadata<br/>title: 'About'<br/>description: '...'<br/>path: '/about']
    
    Question1 -->|List/archive page:<br/>blog list,<br/>projects list| ArchiveMeta[createArchivePageMetadata]
    ArchiveMeta --> ArchiveProps[Required props:<br/>- title<br/>- itemCount<br/>Optional:<br/>- activeTag<br/>- description]
    ArchiveProps --> ArchiveGenerated[Generates:<br/>- Dynamic description<br/>- Item count badge<br/>- Filter metadata]
    ArchiveGenerated --> ArchiveExample[Example:<br/>createArchivePageMetadata<br/>title: 'Blog'<br/>itemCount: 42<br/>activeTag: 'Next.js']
    
    Question1 -->|Blog post/<br/>article| ArticleMeta[createArticlePageMetadata]
    ArticleMeta --> ArticleProps[Required props:<br/>- title<br/>- description<br/>- path<br/>- publishedAt<br/>Optional:<br/>- tags<br/>- image<br/>- author]
    ArticleProps --> ArticleGenerated[Generates:<br/>- Article schema<br/>- Reading time<br/>- Publication date<br/>- Author metadata<br/>- Hero image OG]
    ArticleGenerated --> ArticleExample[Example:<br/>createArticlePageMetadata<br/>title: post.title<br/>description: post.summary<br/>publishedAt: new Date<br/>tags: post.tags]
    
    style PageMeta fill:#fbbf24
    style ArchiveMeta fill:#60a5fa
    style ArticleMeta fill:#4ade80
    style Start fill:#e5e7eb
```

**Code Examples:**

```typescript
import { 
  createPageMetadata,
  createArchivePageMetadata,
  createArticlePageMetadata 
} from "@/lib/metadata";

// ✅ Standard pages (80% of pages)
export const metadata = createPageMetadata({
  title: "About",
  description: "Learn more about me and my work",
  path: "/about",
});

// ✅ Archive/list pages
export const metadata = createArchivePageMetadata({
  title: "Blog",
  description: "All blog posts about web development",
  itemCount: posts.length,
  activeTag: searchParams.tag, // optional
});

// ✅ Blog posts/articles
export const metadata = createArticlePageMetadata({
  title: post.title,
  description: post.summary,
  path: `/blog/${post.slug}`,
  publishedAt: new Date(post.publishedAt),
  tags: post.tags,
  image: post.image?.url,
  author: "Drew",
});
```

---

## Do I Need an Error Boundary?

**TL;DR: Only wrap components that make external API calls, process user input, or perform expensive computations. Don't wrap everything.**

```mermaid
graph TD
    Start[Adding a new component?] --> Question1{Does it make<br/>external API calls?}
    
    Question1 -->|Yes| NeedsBoundary[✅ Wrap with ErrorBoundary]
    Question1 -->|No| Question2{Does it process<br/>user input or forms?}
    
    Question2 -->|Yes| NeedsBoundary
    Question2 -->|No| Question3{Does it perform<br/>expensive computations?}
    
    Question3 -->|Yes| NeedsBoundary
    Question3 -->|No| Question4{Is it static content<br/>or a simple layout?}
    
    Question4 -->|Yes| NoNeedsBoundary[❌ No ErrorBoundary needed]
    Question4 -->|No| DefaultHandling[Root error handling<br/>is sufficient]
    
    NeedsBoundary --> Examples1[Examples:<br/>- GitHub API calls<br/>- Contact forms<br/>- Data visualizations<br/>- Third-party widgets]
    
    NoNeedsBoundary --> Examples2[Examples:<br/>- Text content<br/>- Navigation menus<br/>- Static lists<br/>- Simple layouts]
    
    DefaultHandling --> Examples2
    
    style NeedsBoundary fill:#4ade80
    style NoNeedsBoundary fill:#f87171
    style DefaultHandling fill:#fbbf24
    style Start fill:#e5e7eb
```

**Code Examples:**

```typescript
// ✅ WRAP: External API call
import { GitHubHeatmapErrorBoundary } from "@/components/errors";

<GitHubHeatmapErrorBoundary>
  <GitHubHeatmap userId="dcyfr" />
</GitHubHeatmapErrorBoundary>

// ✅ WRAP: User input/forms
import { ContactFormErrorBoundary } from "@/components/errors";

<ContactFormErrorBoundary>
  <ContactForm />
</ContactFormErrorBoundary>

// ❌ DON'T WRAP: Static content
<div>
  <h1>About Me</h1>
  <p>Simple text content</p>
</div>

// ❌ DON'T WRAP: Simple list
<PostList posts={posts} />

// ❌ DON'T WRAP: Navigation
<SiteHeader />
```

---

## How Should I Import Components?

**TL;DR: Always use barrel exports from subdirectories. Never import from root `@/components` or direct files.**

```mermaid
graph TD
    Start[Need to import a component?] --> Question1{What component type?}
    
    Question1 -->|Blog-related| BlogBarrel[Import from @/components/blog]
    BlogBarrel --> BlogExamples[Available:<br/>- PostList<br/>- BlogFilters<br/>- PostCard<br/>- SeriesNavigation<br/>- BlogPostSidebar]
    
    Question1 -->|Navigation| NavBarrel[Import from @/components/navigation]
    NavBarrel --> NavExamples[Available:<br/>- SiteHeader<br/>- SiteFooter<br/>- Breadcrumbs<br/>- MobileNav]
    
    Question1 -->|Layout| LayoutBarrel[Import from @/components/layouts]
    LayoutBarrel --> LayoutExamples[Available:<br/>- PageLayout<br/>- ArticleLayout<br/>- ArchiveLayout<br/>- Types]
    
    Question1 -->|Shared/common| CommonBarrel[Import from @/components/common]
    CommonBarrel --> CommonExamples[Available:<br/>- MDX<br/>- TableOfContents<br/>- Section<br/>- ViewToggle]
    
    Question1 -->|UI primitives| UIBarrel[Import from @/components/ui]
    UIBarrel --> UIExamples[shadcn/ui components:<br/>- Button<br/>- Input<br/>- Sheet<br/>- Dialog]
    
    Question1 -->|Feature-specific| FeatureBarrel[Import from @/components/features]
    FeatureBarrel --> FeatureExamples[Available:<br/>- ShareButtons<br/>- ViewTracker<br/>- ReadingProgress]
    
    BlogBarrel --> CorrectImport[✅ CORRECT]
    NavBarrel --> CorrectImport
    LayoutBarrel --> CorrectImport
    CommonBarrel --> CorrectImport
    UIBarrel --> CorrectImport
    FeatureBarrel --> CorrectImport
    
    Start --> WrongWay{❌ DON'T import from:}
    WrongWay --> Wrong1[❌ @/components/blog/post-list]
    WrongWay --> Wrong2[❌ @/components directly]
    WrongWay --> Wrong3[❌ Relative paths ../../]
    
    style CorrectImport fill:#4ade80
    style Wrong1 fill:#f87171
    style Wrong2 fill:#f87171
    style Wrong3 fill:#f87171
    style Start fill:#e5e7eb
```

**Code Examples:**

```typescript
// ✅ CORRECT - Use barrel exports
import { PostList, BlogFilters } from "@/components/blog";
import { SiteHeader, SiteFooter } from "@/components/navigation";
import { PageLayout, ArticleLayout } from "@/components/layouts";
import { MDX, TableOfContents } from "@/components/common";
import { Button, Input } from "@/components/ui";

// ❌ WRONG - Direct file import
import PostList from "@/components/blog/post-list";

// ❌ WRONG - Import from root
import { PostList } from "@/components";

// ❌ WRONG - Relative paths
import { PostList } from "../../components/blog/post-list";
```

---

## Quick Reference Table

| Decision | Default Choice (80%+) | Alternative | When to Use Alternative |
|----------|----------------------|-------------|------------------------|
| **Layout** | `PageLayout` | `ArticleLayout`, `ArchiveLayout` | Blog posts or filterable lists |
| **Container** | `CONTAINER_WIDTHS.content` | `narrow`, `standard`, `archive`, `dashboard` | Based on content density |
| **Metadata** | `createPageMetadata` | `createArchivePageMetadata`, `createArticlePageMetadata` | Lists or blog posts |
| **Error Boundary** | None | Wrap component | External APIs, forms, computations |
| **Imports** | Barrel exports | N/A | Never use direct imports |

---

## Interactive Decision Tools

Visit `/dev/docs/decision-trees` for interactive versions with:
- Clickable flowchart nodes
- Live code examples
- Template generation
- Quick copy buttons

---

## Related Documentation

- [Component Patterns Guide](./component-patterns)
- [Design Token System](./design-system)
- [Templates Library](../templates/)
- [Best Practices](./best-practices)
