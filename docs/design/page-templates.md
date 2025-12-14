# Page Templates & Patterns

**Last Updated:** December 9, 2025

Standardized page templates enforcing design token usage for consistent user experience across the site.

---

## 📚 Real-World Examples

### Series Pages (December 2025)

The series feature implementation serves as the **gold standard** for archive page patterns:

- **Index Page**: `/blog/series` - [page.tsx](../../src/app/blog/series/page.tsx)
- **Detail Page**: `/blog/series/[slug]` - [page.tsx](../../src/app/blog/series/[slug]/page.tsx)

**Key Implementation Details:**

- ✅ Full-width hero with `variant="homepage"` (includes serif font)
- ✅ Hero content constrained to `max-w-7xl` (matches archive container)
- ✅ Analytics tracking integrated via dedicated tracker components
- ✅ Design tokens used throughout (zero hardcoded values)
- ✅ Responsive grid with `GRID_PATTERNS.three`
- ✅ ISR with 24-hour revalidation

**What Makes This Template Great:**

1. **Typography Hierarchy**: Uses `variant="homepage"` for serif titles matching other archive pages
2. **Width Consistency**: Hero (`max-w-7xl`) matches content container (`CONTAINER_WIDTHS.archive`)
3. **Analytics First**: Dedicated tracker components for granular event tracking
4. **No Prose Constraint**: Removed `prose` class from hero to prevent 65ch width limit
5. **Full-Width Background**: Hero extends to viewport edges while content stays constrained

**Lessons Learned:**

- `PAGE_LAYOUT.hero.content` includes `prose` class → adds unwanted `max-w-prose` constraint
- Archive pages should use `CONTAINER_WIDTHS.archive` (`max-w-7xl`) not `standard` (`max-w-5xl`)
- `variant="homepage"` adds serif font (`font-serif`) for archive page titles
- Always match hero content width to page content container width

---

## 🎯 Design Token Compliance Rules

**ALWAYS use design tokens. NEVER hardcode values.**

### ✅ Allowed
```tsx
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, BORDERS } from '@/lib/design-tokens';

<h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
<div className={SPACING.section}>Content</div>
<div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>Container</div>
```

### ❌ Prohibited
```tsx
// NEVER do this:
<h1 className="text-3xl font-semibold">Title</h1>
<div className="space-y-8">Content</div>
<div className="max-w-5xl mx-auto">Container</div>
```

---

## 📄 Template 1: Archive/Index Page

**Use for:** Blog index, series index, work portfolio, category/tag pages

**Pattern:** PageLayout → Container → PageHero → Grid/List

### TypeScript Template

```tsx
import type { Metadata } from "next";
import { PageLayout, PageHero } from "@/components/layouts";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, GRID_PATTERNS, SPACING } from "@/lib/design-tokens";
import { SITE_TITLE_PLAIN, SITE_URL, getOgImageUrl, getTwitterImageUrl } from "@/lib/site-config";

// ISR Configuration
export const revalidate = 86400; // 24 hours

// Metadata
export async function generateMetadata(): Promise<Metadata> {
  const title = "Page Title";
  const description = "Page description for SEO";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_TITLE_PLAIN}`,
      description,
      url: `${SITE_URL}/path`,
      siteName: SITE_TITLE_PLAIN,
      type: "website",
      images: [
        {
          url: getOgImageUrl(title, description),
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_TITLE_PLAIN}`,
      description,
      images: [getTwitterImageUrl(title, description)],
    },
  };
}

// Page Component
export default function ArchivePage() {
  return (
    <PageLayout>
      {/* Hero section - has its own built-in container (IMPORTANT: do not wrap in container!) */}
      <PageHero
        title="Archive Page Title"
        description="Brief description of this archive page"
      />

      {/* Content section - apply container width here */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING}`}>
        <div className={SPACING.section}>
          <div className={GRID_PATTERNS.three}>
            {/* Grid items here */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
```

### Key Features
- **Container:** `CONTAINER_WIDTHS.archive` for list/grid pages
- **Padding:** `CONTAINER_PADDING` (responsive: px-4 sm:px-6 md:px-8)
- **Spacing:** `SPACING.section` between hero and content
- **Grid:** `GRID_PATTERNS.three` (1→2→3 columns responsive)
- **SEO:** Open Graph + Twitter Card + metadata

### Variations

**2-Column Grid:**
```tsx
<div className={GRID_PATTERNS.two}>
  {items.map(item => <Card key={item.id} />)}
</div>
```

**4-Column Grid:**
```tsx
<div className={GRID_PATTERNS.four}>
  {items.map(item => <Card key={item.id} />)}
</div>
```

**List View:**
```tsx
<div className={SPACING.postList}>
  {items.map(item => <ListItem key={item.id} />)}
</div>
```

---

## 📄 Template 2: Content Detail Page

**Use for:** Blog post detail, project detail, case study

**Pattern:** PageLayout → Article Container → ArticleLayout → MDX Content

### TypeScript Template

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticleLayout, ArticleHeader, ArticleFooter } from "@/components/layouts";
import { PageLayout } from "@/components/layouts";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { createArticlePageMetadata } from "@/lib/metadata";

// ISR Configuration
export const revalidate = 3600; // 1 hour

// PPR (Partial Prerendering)
export const experimental_ppr = true;

// Generate Static Params
export async function generateStaticParams() {
  // Return array of { slug: string } objects
  return items.map((item) => ({
    slug: item.slug,
  }));
}

// Metadata Generation
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) return {};

  return createArticlePageMetadata({
    title: item.title,
    description: item.summary,
    path: `/path/${item.slug}`,
    publishedAt: new Date(item.publishedAt),
    modifiedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    author: AUTHOR_NAME,
    keywords: item.tags,
    image: item.image?.url ? `${SITE_URL}${item.image.url}` : undefined,
  });
}

// Page Component
export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <PageLayout>
      <ArticleLayout>
        <ArticleHeader
          title={item.title}
          subtitle={item.subtitle}
          publishedAt={item.publishedAt}
          updatedAt={item.updatedAt}
          readingTime={item.readingTime}
          tags={item.tags}
        />

        {/* Article Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {item.body}
        </article>

        <ArticleFooter
          relatedItems={relatedItems}
          shareUrl={`${SITE_URL}/path/${item.slug}`}
        />
      </ArticleLayout>
    </PageLayout>
  );
}
```

### Key Features
- **Container:** `CONTAINER_WIDTHS.content` for reading-optimized width
- **Layout:** `ArticleLayout` handles sidebar, breadcrumbs, TOC
- **Header:** `ArticleHeader` for consistent metadata display
- **Content:** Prose styles for MDX/markdown content
- **Footer:** `ArticleFooter` for related content, sharing

---

## 📄 Template 3: Standard Page (Static)

**Use for:** About, Contact, Services, landing pages

**Pattern:** PageLayout → Container → PageHero → Sections

### TypeScript Template

```tsx
import type { Metadata } from "next";
import { PageLayout, PageHero } from "@/components/layouts";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { SITE_TITLE_PLAIN, SITE_URL, getOgImageUrl, getTwitterImageUrl } from "@/lib/site-config";

// Metadata
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
  openGraph: {
    title: `Page Title | ${SITE_TITLE_PLAIN}`,
    description: "Page description",
    url: `${SITE_URL}/path`,
    siteName: SITE_TITLE_PLAIN,
    type: "website",
    images: [
      {
        url: getOgImageUrl("Page Title", "Page description"),
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Page Title",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Page Title | ${SITE_TITLE_PLAIN}`,
    description: "Page description",
    images: [getTwitterImageUrl("Page Title", "Page description")],
  },
};

// Page Component
export default function StaticPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`}>
        {/* Hero */}
        <PageHero
          title="Page Title"
          description="Brief description of this page"
        />

        {/* Section 1 */}
        <section className={SPACING.section}>
          <h2 className={TYPOGRAPHY.h2.standard}>Section Title</h2>
          <p className={TYPOGRAPHY.body}>Section content...</p>
        </section>

        {/* Section 2 */}
        <section className={SPACING.section}>
          <h2 className={TYPOGRAPHY.h2.standard}>Another Section</h2>
          <div className={SPACING.content}>
            {/* Nested content */}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
```

### Key Features
- **Container:** `CONTAINER_WIDTHS.standard` for standard pages
- **Sections:** `SPACING.section` between major sections
- **Headings:** `TYPOGRAPHY.h2.standard` for section titles
- **Content:** `SPACING.content` for nested content blocks

---

## 📄 Template 4: Homepage

**Use for:** Main landing page

**Pattern:** PageLayout → Multiple Containers → Featured Sections

### TypeScript Template

```tsx
import type { Metadata } from "next";
import { PageLayout } from "@/components/layouts";
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { SITE_TITLE_PLAIN, SITE_DESCRIPTION, SITE_URL, getOgImageUrl, getTwitterImageUrl } from "@/lib/site-config";

// Metadata
export const metadata: Metadata = {
  title: SITE_TITLE_PLAIN,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE_PLAIN,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE_PLAIN,
    type: "website",
    images: [
      {
        url: getOgImageUrl(SITE_TITLE_PLAIN, SITE_DESCRIPTION),
        width: 1200,
        height: 630,
        type: "image/png",
        alt: SITE_TITLE_PLAIN,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_PLAIN,
    description: SITE_DESCRIPTION,
    images: [getTwitterImageUrl(SITE_TITLE_PLAIN, SITE_DESCRIPTION)],
  },
};

// Page Component
export default function HomePage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} py-12 md:py-20`}>
        <div className={SPACING.section}>
          <h1 className={TYPOGRAPHY.h1.hero}>Welcome</h1>
          <p className={TYPOGRAPHY.description}>
            Site tagline or description
          </p>
        </div>
      </section>

      {/* Featured Content */}
      <section className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING}`}>
        <div className={SPACING.section}>
          <h2 className={TYPOGRAPHY.h2.featured}>Featured Work</h2>
          <div className={SPACING.subsection}>
            {/* Featured items grid */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`mx-auto ${CONTAINER_WIDTHS.narrow} ${CONTAINER_PADDING}`}>
        <div className={SPACING.section}>
          {/* Call to action content */}
        </div>
      </section>
    </PageLayout>
  );
}
```

### Key Features
- **Multiple widths:** Different containers for different sections
- **Hero:** Larger typography (`TYPOGRAPHY.h1.hero`)
- **Featured:** `TYPOGRAPHY.h2.featured` for prominent headings
- **Flexible:** Mix standard, archive, and narrow containers

---

## 🎨 Design Token Quick Reference

### Container Widths
```tsx
CONTAINER_WIDTHS.prose      // Reading content (max-w-prose)
CONTAINER_WIDTHS.narrow     // Forms, focused (max-w-4xl)
CONTAINER_WIDTHS.standard   // Core pages (max-w-5xl)
CONTAINER_WIDTHS.content    // Blog posts with sidebar (max-w-6xl)
CONTAINER_WIDTHS.archive    // Listings with grids (max-w-7xl)
CONTAINER_WIDTHS.dashboard  // Data-heavy pages (max-w-[1536px])
```

### Spacing (Vertical)
```tsx
SPACING.section      // Between major sections (space-y-10 md:space-y-12)
SPACING.subsection   // Related content blocks (space-y-6 md:space-y-8)
SPACING.content      // Within blocks (space-y-4)
SPACING.compact      // Tight lists (space-y-2)
SPACING.prose        // Long-form text (space-y-6 md:space-y-8)
```

### Typography
```tsx
// Headings
TYPOGRAPHY.h1.standard    // Standard pages
TYPOGRAPHY.h1.hero        // Archive/hero sections
TYPOGRAPHY.h1.article     // Blog post titles
TYPOGRAPHY.h2.standard    // Section headings
TYPOGRAPHY.h2.featured    // Featured content

// Body Text
TYPOGRAPHY.description    // Lead/intro text (text-lg md:text-xl)
TYPOGRAPHY.body          // Standard body text
TYPOGRAPHY.metadata      // Dates, reading time (text-sm)
```

### Grids
```tsx
GRID_PATTERNS.two    // 1→2 columns (grid grid-cols-1 md:grid-cols-2 gap-6)
GRID_PATTERNS.three  // 1→2→3 columns
GRID_PATTERNS.four   // 2→4 columns
GRID_PATTERNS.auto   // Responsive (1→2→3→4)
```

### Hover Effects
```tsx
HOVER_EFFECTS.card          // Standard cards
HOVER_EFFECTS.cardFeatured  // Hero/featured cards
HOVER_EFFECTS.cardSubtle    // Secondary cards
HOVER_EFFECTS.link          // Text links
HOVER_EFFECTS.button        // Interactive buttons
```

### Borders
```tsx
BORDERS.card      // rounded-lg
BORDERS.button    // rounded-md
BORDERS.circle    // rounded-full
BORDERS.container // rounded-xl
```

---

## 🛠️ Component Checklist

Before creating a new page or component:

### ✅ Pre-Flight Checklist
- [ ] Identified correct template (Archive, Content, Static, Homepage)
- [ ] Reviewed design token reference
- [ ] Checked existing similar pages for patterns
- [ ] Planned container widths for each section
- [ ] Planned spacing between sections

### ✅ Implementation Checklist
- [ ] Used `PageLayout` wrapper
- [ ] Applied correct `CONTAINER_WIDTHS` constant
- [ ] Used `CONTAINER_PADDING` for horizontal spacing
- [ ] Used `SPACING.*` tokens for vertical spacing
- [ ] Used `TYPOGRAPHY.*` tokens for all text
- [ ] Used `GRID_PATTERNS.*` for grids
- [ ] Used `HOVER_EFFECTS.*` for interactive elements
- [ ] Added proper SEO metadata
- [ ] Configured ISR/revalidation if needed

### ✅ Validation Checklist
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (0 errors/warnings)
- [ ] `node scripts/validate-design-tokens.mjs` passes
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode looks correct
- [ ] No hardcoded spacing/typography values

---

## 📚 Real-World Examples

### Example 1: Series Index Page
**File:** `src/app/blog/series/page.tsx`

**Template Used:** Archive/Index Page

**Key Patterns:**
```tsx
// Container
<div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING}`}>

// Hero
<PageHero title="Blog Series" description="Explore multi-part..." />

// Grid
<div className={SPACING.section}>
  <div className={GRID_PATTERNS.three}>
    {sortedSeries.map((series) => (
      <SeriesCard key={series.slug} series={series} />
    ))}
  </div>
</div>
```

### Example 2: Series Card Component
**File:** `src/components/blog/series-card.tsx`

**Design Tokens Used:**
```tsx
import {
  HOVER_EFFECTS,    // Card hover effect
  SPACING,          // CardHeader, CardContent spacing
  TYPOGRAPHY,       // Title, metadata text
  BORDERS,          // Icon badge border
  getSeriesColors   // Color theming
} from "@/lib/design-tokens";

// Usage
<CardHeader className={SPACING.compact}>...</CardHeader>
<CardTitle className={TYPOGRAPHY.h3.standard}>...</CardTitle>
<div className={TYPOGRAPHY.metadata}>...</div>
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Hardcoded Spacing
```tsx
// BAD
<div className="space-y-8 gap-6 p-4">

// GOOD
<div className={SPACING.subsection}>
  <div className="flex gap-4"> {/* Small gaps OK */}
```

### ❌ Hardcoded Typography
```tsx
// BAD
<h1 className="text-3xl font-semibold">

// GOOD
<h1 className={TYPOGRAPHY.h1.standard}>
```

### ❌ Hardcoded Container Widths
```tsx
// BAD
<div className="max-w-6xl mx-auto px-8">

// GOOD
<div className={`mx-auto ${CONTAINER_WIDTHS.content} ${CONTAINER_PADDING}`}>
```

### ❌ Nesting PageHero Inside Container
```tsx
// BAD - PageHero has built-in container
<div className={`mx-auto ${CONTAINER_WIDTHS.archive}`}>
  <PageHero title="Title" />
  <div>Content</div>
</div>

// GOOD - PageHero at top level
<PageHero title="Title" />
<div className={`mx-auto ${CONTAINER_WIDTHS.archive}`}>
  <div>Content</div>
</div>
```

### ❌ Inconsistent Hover Effects
```tsx
// BAD
<Card className="hover:shadow-lg transition-all duration-300">

// GOOD
<Card className={HOVER_EFFECTS.card}>
```

---

## 📖 Additional Resources

- **Design Tokens Reference:** `src/lib/design-tokens.ts`
- **Validation Script:** `scripts/validate-design-tokens.mjs`
- **Design System Guide:** `docs/ai/DESIGN_SYSTEM.md`
- **ESLint Rules:** `.eslintrc.json` (design-token enforcement)
- **VS Code Snippets:** Type `dt` + Tab for quick token insertion

---

**Last Updated:** December 9, 2025
**Maintained by:** DCYFR Labs Development Team
