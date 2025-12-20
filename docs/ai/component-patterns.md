# Component Patterns

Mandatory patterns for components, layouts, imports, and metadata generation.

## Table of Contents

- [Barrel Exports](#barrel-exports)
- [Layout Hierarchy](#layout-hierarchy)
- [Metadata Generation](#metadata-generation)
- [Container Widths](#container-widths)
- [Error Boundaries](#error-boundaries)
- [Animation Patterns](#animation-patterns)
- [Loading States & Skeletons](#loading-states--skeletons)

---

## Barrel Exports

**MANDATORY:** Always import from barrel files (`index.ts`), never from specific files.

### Available Barrels

```typescript
// ✅ CORRECT - Use these imports
import { PostList, BlogFilters, PostCard } from "@/components/blog";
import { SiteHeader, SiteFooter, Breadcrumbs } from "@/components/navigation";
import { PageLayout, ArticleLayout, ArchiveLayout } from "@/components/layouts";
import { MDX, TableOfContents, Section } from "@/components/common";
import { Button, Input, Sheet } from "@/components/ui";
import { ShareButtons, ViewTracker } from "@/components/features";

// ❌ WRONG - Never import like this
import PostList from "@/components/blog/post-list";
import { PostList } from "@/components"; // root import
import PostList from "../../components/blog/post-list"; // relative
```

### Creating New Barrel Exports

When creating a new component subdirectory:

1. Create `index.ts` in the directory
2. Export all public components
3. Export types if needed

```typescript
// src/components/my-feature/index.ts
export { MyComponent } from "./my-component";
export { AnotherComponent } from "./another-component";
export type { MyComponentProps } from "./my-component";
```

---

## Layout Hierarchy

**Rule:** Use `PageLayout` for 90% of pages. Only use specialized layouts when necessary.

### PageLayout (Default - 90% of pages)

**When to use:**
- Homepage
- About, Contact, Resume
- Standard content pages
- Any page without special features

**Example:**
```typescript
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
```

### ArticleLayout (Blog Posts Only)

**When to use:**
- ONLY for blog posts at `src/app/blog/[slug]/page.tsx`
- Never use for other content types

**Features:**
- Reading time calculation
- Table of contents (auto-generated)
- Related posts
- Hero image support
- Publication metadata

**Example:**
```typescript
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
```

### ArchiveLayout (Filterable Lists Only)

**When to use:**
- Blog archive (`/blog`)
- Project listing (`/work`)
- Any page with filters, pagination, or sorting

**Features:**
- Filter controls
- Pagination
- Item count badge
- View toggles (grid/list)

**Example:**
```typescript
import { ArchiveLayout } from "@/components/layouts";
import { createArchivePageMetadata } from "@/lib/metadata";

export const metadata = createArchivePageMetadata({
  title: "Blog",
  itemCount: posts.length,
  activeTag: searchParams.tag,
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

## Metadata Generation

**Three helpers for three use cases.** Always use the correct helper for your page type.

### createPageMetadata (Standard Pages)

**Use for:** 80% of pages (about, contact, resume, etc.)

```typescript
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",               // Required
  description: "About me",      // Required
  path: "/about",               // Required
});
```

**Generates:**
- `<title>` tag with site name template
- OpenGraph metadata (og:title, og:description, og:image)
- Twitter Card metadata
- Canonical URL
- Robots meta

### createArchivePageMetadata (List Pages)

**Use for:** Filterable list pages with item counts

```typescript
import { createArchivePageMetadata } from "@/lib/metadata";

export const metadata = createArchivePageMetadata({
  title: "Blog",                // Required
  itemCount: posts.length,      // Required
  activeTag: "Next.js",         // Optional
  description: "Custom desc",   // Optional (auto-generated if omitted)
});
```

**Generates:**
- Everything from `createPageMetadata`
- Dynamic description with item count
- Filter-aware metadata (if activeTag provided)

### createArticlePageMetadata (Blog Posts)

**Use for:** Blog posts only

```typescript
import { createArticlePageMetadata } from "@/lib/metadata";

export const metadata = createArticlePageMetadata({
  title: post.title,                    // Required
  description: post.summary,            // Required
  path: `/blog/${post.slug}`,           // Required
  publishedAt: new Date(post.publishedAt), // Required
  tags: post.tags,                      // Optional
  image: post.image?.url,               // Optional
  author: "Drew",                  // Optional
});
```

**Generates:**
- Everything from `createPageMetadata`
- Article schema (structured data for Google)
- Publication date metadata
- Author information
- Tag keywords
- Hero image for social cards

---

## Container Widths

**Never hardcode widths.** Use design tokens for all container constraints.

```typescript
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";
```

### Available Widths

| Token | Max Width | Usage |
|-------|-----------|-------|
| `narrow` | 672px | Long-form text, documentation |
| `standard` | 896px | **Most common (80%)** - forms, simple content |
| `content` | 1120px | Rich layouts, media-heavy pages |
| `archive` | 1280px | Filterable lists with sidebars |
| `dashboard` | 1536px | Analytics, admin panels |

### Examples

```typescript
// ✅ CORRECT
<div className={`mx-auto ${CONTAINER_WIDTHS.content}`}>
  <ProjectShowcase />
</div>

// ❌ WRONG
<div className="max-w-[1120px] mx-auto">
  <ProjectShowcase />
</div>
```

---

## Error Boundaries

**Rule:** Only wrap high-risk components. Don't wrap everything.

### When to Wrap

**YES - Wrap these:**
- External API calls (GitHub API, weather data, etc.)
- User forms (contact forms, search inputs)
- Expensive computations (data processing, charts)

**NO - Don't wrap these:**
- Static text content
- Navigation menus
- Simple lists
- Layout components

### Examples

```typescript
// ✅ YES - External API
import { GitHubHeatmapErrorBoundary } from "@/components/errors";

<GitHubHeatmapErrorBoundary>
  <GitHubHeatmap userId="dcyfr" />
</GitHubHeatmapErrorBoundary>

// ✅ YES - User form
import { ContactFormErrorBoundary } from "@/components/errors";

<ContactFormErrorBoundary>
  <ContactForm />
</ContactFormErrorBoundary>

// ❌ NO - Static content (root error handling is sufficient)
<div>
  <h1>About Me</h1>
  <p>Static text</p>
</div>
```

---

## Animation Patterns

**MANDATORY:** Use ANIMATION tokens and transition utilities instead of hardcoded duration classes.

### Why Standardized Animations?

- **Consistency** - Same speeds across 150+ components
- **Performance** - GPU-accelerated (transform + opacity)
- **Accessibility** - Automatic prefers-reduced-motion support
- **Maintainability** - Change globally via design tokens

### Available Animation Tokens

```typescript
import { ANIMATION } from "@/lib/design-tokens";

// Duration tokens (replace duration-* classes)
ANIMATION.duration.fast    // "duration-150" - Quick UI responses (hover, focus)
ANIMATION.duration.normal  // "duration-300" - Standard transitions (cards, modals)
ANIMATION.duration.slow    // "duration-500" - Dramatic effects (page transitions)

// Transition utilities (prefer these for common patterns)
ANIMATION.transition.movement    // "transition-movement" - transform (scale, translate, rotate)
ANIMATION.transition.appearance  // "transition-appearance" - opacity, backdrop-blur
ANIMATION.transition.theme       // "transition-theme" - theme switching (colors, backgrounds)
```

### Usage Patterns

```typescript
// ✅ CORRECT - Use duration tokens
<div className={cn("transition-transform", ANIMATION.duration.fast)}>
  <Card />
</div>

// ✅ BETTER - Use transition utilities (includes duration)
<div className="transition-movement">
  <Card />
</div>

// ✅ BEST - Combine for complex animations
<div className={cn("transition-movement", ANIMATION.duration.slow)}>
  <HeroSection />
</div>

// ❌ WRONG - Hardcoded durations (ESLint will warn)
<div className="transition-transform duration-150">
  <Card />
</div>
```

### When to Use Which

| Pattern | Use Token | Use Utility | Example |
|---------|-----------|-------------|---------|
| Hover scale/translate | ✅ | ✅ | `.transition-movement` |
| Fade in/out | ✅ | ✅ | `.transition-appearance` |
| Theme switching | ❌ | ✅ | `.transition-theme` (slow by design) |
| Custom timing | ✅ | ❌ | `{ANIMATION.duration.slow}` |

---

## Loading States & Skeletons

**STRATEGY:** Selective skeletons for slow content only (APIs, databases, heavy images).

### When to Use Skeletons

```typescript
// ✅ YES - External APIs (slow, unpredictable)
<Suspense fallback={<BlogPostSkeleton />}>
  <BlogPost slug={slug} />
</Suspense>

// ✅ YES - Database queries (can be slow)
<Suspense fallback={<ProjectCardSkeleton />}>
  <ProjectCardWithViews projectId={id} />
</Suspense>

// ❌ NO - Static content (fast, unnecessary)
<div>
  <h1>About Me</h1>
  <p>This renders instantly from MDX</p>
</div>

// ❌ NO - Simple state (loading=true is sufficient)
{isLoading ? <Spinner /> : <Content />}
```

### Skeleton Implementation Pattern

**All skeletons must match the final component structure exactly.**

```typescript
// ProjectCard with integrated skeleton
export function ProjectCard({ project, loading }: ProjectCardProps) {
  if (loading || !project) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />  {/* Matches title */}
          <Skeleton className="h-4 w-full" /> {/* Matches description line 1 */}
          <Skeleton className="h-4 w-5/6" /> {/* Matches description line 2 */}
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### Skeleton Primitives

**File:** `src/components/ui/skeleton-primitives.tsx` (420 lines)

Pre-built skeletons for common patterns:

```typescript
import {
  SkeletonText,        // Single line of text
  SkeletonHeading,     // Heading with proper sizing
  SkeletonParagraph,   // Multiple lines of text
  SkeletonCard,        // Full card with header/body
  SkeletonImage,       // Image placeholder
  SkeletonBadge,       // Badge/tag placeholder
} from "@/components/ui/skeleton-primitives";

// Use primitives for quick skeleton construction
<SkeletonCard>
  <SkeletonHeading level={2} />
  <SkeletonParagraph lines={3} />
  <div className="flex gap-2">
    <SkeletonBadge />
    <SkeletonBadge />
  </div>
</SkeletonCard>
```

### Performance Considerations

- **Shimmer animation** - GPU-accelerated (translateX + background-gradient)
- **Auto-disabled** - Respects prefers-reduced-motion
- **Lazy loading** - Skeletons load first, then hydrate with data
- **Minimal DOM** - Simple structure reduces parse time

---

## MDX Components for Content

### KeyTakeaway - Key Insights

**Purpose:** Highlight critical takeaways and insights in blog content.

**Use for:**
- Important security principles
- Critical technical insights  
- Key business implications
- Essential conclusions

```mdx
<KeyTakeaway>
If an agent's goals can be hijacked, it becomes a weapon turned against you---using its own legitimate access to cause harm.
</KeyTakeaway>
```

**Features:**
- Lightbulb icon for visual prominence
- Automatic "Key Takeaway:" prefix
- Semantic info color theming
- Responsive typography and spacing

### ContextClue - Background Information

**Purpose:** Provide important background context and setup information.

**Use for:**
- Background information readers need
- Prerequisites or assumptions
- Research methodology context
- Problem space setup

```mdx
<ContextClue>
As AI agents become more autonomous and capable of taking real-world actions, the security landscape is evolving rapidly.
</ContextClue>
```

**Features:**
- Info icon for contextual information
- Automatic "Context:" prefix
- Subtle blue theming
- `role="complementary"` for accessibility

### Alert - Status Messages

**Purpose:** Warnings, errors, or important notifications.

```mdx
<Alert type="warning">
**Important:** This feature is in beta.
</Alert>

<Alert type="critical">
**Security Alert:** Update immediately.
</Alert>
```

**Types:** `critical`, `warning`, `info`, `success`

### When to Use Which

| Component | Use For | Don't Use For |
|-----------|---------|---------------|
| `<KeyTakeaway>` | Insights, conclusions, principles | Quotes, citations, warnings |
| `<ContextClue>` | Background info, prerequisites, setup | Main content, key insights |
| `<Alert>` | Warnings, status messages | Insights, regular content |
| `<blockquote>` | Citations, quotes | Key takeaways, alerts, context |

---

## Related Documentation

- [Quick Reference](./quick-reference) - Commands and 80/20 patterns
- [Enforcement Rules](./enforcement-rules) - Design tokens, validation
- [Decision Trees](./decision-trees) - Visual flowcharts
- [Templates](../templates/) - Copy-paste starting points
