# PageHero Component

## Overview

The `PageHero` component is a standardized, reusable hero section used across all pages in the site. It ensures consistent styling, spacing, and behavior for page introductions.

## Location

`src/components/layouts/page-hero.tsx`

## Key Features

- **Consistent styling** using design tokens from `@/lib/design-tokens`
- **Multiple variants** (standard, homepage, article)
- **Flexible alignment** (left or center)
- **Optional elements** (image, actions, item count)
- **Type-safe props** with full TypeScript support
- **Responsive design** with mobile-first approach

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string \| ReactNode` | Required | Hero title (renders as h1) |
| `description` | `string \| ReactNode` | Optional | Hero description/tagline |
| `variant` | `'standard' \| 'homepage' \| 'article'` | `'standard'` | Determines typography size |
| `align` | `'left' \| 'center'` | `'left'` | Text alignment |
| `image` | `ReactNode` | Optional | Image or avatar element |
| `actions` | `ReactNode` | Optional | Action buttons or links |
| `itemCount` | `number` | Optional | Display item count (e.g., "5 items") |
| `className` | `string` | Optional | Additional container classes |
| `contentClassName` | `string` | Optional | Additional content wrapper classes |

## Variants

### Standard (Default)

Used for most pages (about, contact, resume, projects, blog).

```tsx
<PageHero 
  title="About Me" 
  description="Full-stack developer passionate about building great experiences"
/>
```

### Homepage

Larger, more prominent styling for the homepage hero.

```tsx
<PageHero 
  variant="homepage"
  title="Hi, I'm Drew"
  description="Cybersecurity architect and developer"
/>
```

### Article

Optimized for blog posts and long-form content.

```tsx
<PageHero 
  variant="article"
  title="Understanding React Server Components"
  description="A deep dive into the latest React feature"
/>
```

## Alignment

### Left-aligned (Default)

Standard for most pages.

```tsx
<PageHero 
  title="Contact"
  description="Get in touch"
/>
```

### Center-aligned

Used for homepage and error pages.

```tsx
<PageHero 
  align="center"
  title="Welcome"
  description="Explore my work"
/>
```

## Usage Examples

### Basic Hero

```tsx
import { PageHero } from "@/components/layouts/page-hero";

export default function ContactPage() {
  return (
    <PageLayout>
      <PageHero
        title="Contact Me"
        description="Whether you have questions, feedback, or collaboration ideas, feel free to reach out using the form below."
      />
      {/* Page content */}
    </PageLayout>
  );
}
```

### Hero with Image

```tsx
import { PageHero } from "@/components/layouts/page-hero";
import { AboutAvatar } from "@/components/about-avatar";

export default function AboutPage() {
  return (
    <PageLayout>
      <PageHero
        title="About Drew"
        description="Cybersecurity architect with 5+ years experience"
        image={<AboutAvatar size="md" />}
      />
      {/* Page content */}
    </PageLayout>
  );
}
```

### Hero with Actions

```tsx
import { PageHero } from "@/components/layouts/page-hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <PageLayout>
      <PageHero
        variant="homepage"
        align="center"
        title="Hi, I'm Drew"
        description="Building secure and scalable systems"
        actions={
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/about">Learn more</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog">Read my blog</Link>
            </Button>
          </div>
        }
      />
      {/* Page content */}
    </PageLayout>
  );
}
```

### Hero with Custom Title

```tsx
import { PageHero } from "@/components/layouts/page-hero";
import { Logo } from "@/components/logo";

export default function TeamPage() {
  return (
    <PageLayout>
      <PageHero
        title={
          <span className="flex items-center gap-2">
            Meet the Team <Logo width={32} height={32} />
          </span>
        }
        description="The people behind the work"
      />
      {/* Page content */}
    </PageLayout>
  );
}
```

### Archive Hero with Item Count

```tsx
// Note: ArchiveLayout now uses PageHero internally
import { ArchiveLayout } from "@/components/layouts/archive-layout";

export default function BlogPage() {
  return (
    <ArchiveLayout
      title="Blog"
      description="Articles on web development and security"
      itemCount={42}
    >
      {/* Blog posts */}
    </ArchiveLayout>
  );
}
```

## Integration with ArchiveLayout

The `ArchiveLayout` component now uses `PageHero` internally, ensuring consistent hero sections across all archive pages (blog, projects, etc.):

```tsx
export function ArchiveLayout({
  title,
  description,
  itemCount,
  // ...
}: ArchiveLayoutProps) {
  return (
    <>
      <PageHero
        title={title}
        description={description}
        itemCount={itemCount}
      />
      {/* Filters, content, pagination */}
    </>
  );
}
```

## Design Tokens

The component uses the following design tokens for consistency:

- `PAGE_LAYOUT.hero.container` - Container spacing and width
- `PAGE_LAYOUT.hero.content` - Content wrapper spacing
- `HERO_VARIANTS[variant]` - Typography and styling for each variant
  - `standard` - `TYPOGRAPHY.h1.standard` + `TYPOGRAPHY.description`
  - `homepage` - `TYPOGRAPHY.h1.hero` + `TYPOGRAPHY.description`
  - `article` - `TYPOGRAPHY.h1.article` + `TYPOGRAPHY.description`

## Accessibility

- Uses semantic HTML (`<section>`, `<h1>`, `<p>`)
- Proper heading hierarchy (h1 for page title)
- Keyboard accessible actions
- Screen reader friendly structure

## Responsive Behavior

- Mobile-first approach
- Adjusts spacing and typography at breakpoints
- Image alignment changes on mobile (center) vs desktop (configurable)
- Wraps action buttons on small screens

## Best Practices

1. **Use PageHero for all page headers** - Ensures consistency across the site
2. **Keep descriptions concise** - Aim for 1-2 sentences (under 160 characters)
3. **Use appropriate variant** - Match the context (homepage, article, or standard)
4. **Provide meaningful titles** - Clear, descriptive page titles
5. **Center alignment for emphasis** - Use sparingly (homepage, 404, etc.)
6. **Actions should be primary CTAs** - Limit to 2-3 buttons maximum

## Migration from Manual Heroes

Before:

```tsx
<div className={PAGE_LAYOUT.hero.container}>
  <div className={PAGE_LAYOUT.hero.content}>
    <h1 className={TYPOGRAPHY.h1.standard}>Contact Me</h1>
    <p className={TYPOGRAPHY.description}>
      Get in touch for inquiries.
    </p>
  </div>
</div>
```

After:

```tsx
<PageHero
  title="Contact Me"
  description="Get in touch for inquiries."
/>
```

## Related Components

- `PageLayout` - Universal page wrapper
- `ArchiveLayout` - Uses PageHero internally for archive pages
- `ArticleLayout` - Article/post layout (separate hero pattern)

## See Also

- Design Tokens
- Page Layout Component
- Archive Layout Component
- [Architecture Patterns](/docs/architecture/readme)
