# Design System Guide

**Version:** 1.0.0  
**Last Updated:** November 8, 2025  
**Maintainers:** Drew

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Design Tokens](#design-tokens)
4. [Layout System](#layout-system)
5. [Typography](#typography)
6. [Spacing & Rhythm](#spacing--rhythm)
7. [Color & Theming](#color--theming)
8. [Interactive Elements](#interactive-elements)
9. [Component Patterns](#component-patterns)
10. [Accessibility](#accessibility)
11. [Best Practices](#best-practices)

---

## Overview

This design system ensures visual and behavioral consistency across the dcyfr-labs site. It provides:

- **Design tokens** - Single source of truth for design decisions
- **Component patterns** - Reusable UI building blocks
- **Guidelines** - Clear rules for when and how to use each pattern
- **Examples** - Real-world usage from the codebase

### Philosophy

Our design system follows these core principles:

1. **Consistency Over Creativity** - Reuse existing patterns before creating new ones
2. **Mobile-First** - Design for small screens, enhance for larger ones
3. **Accessibility Always** - Meet WCAG 2.1 AA standards minimum
4. **Performance Matters** - Lightweight, fast, efficient
5. **Developer Experience** - Easy to use, hard to misuse

---

## Design Principles

### 1. Progressive Disclosure
Show users what they need, when they need it. Don't overwhelm with information.

### 2. Consistency
Similar elements should look and behave similarly across the site.

### 3. Feedback
Every interaction should provide clear, immediate feedback.

### 4. Flexibility
Design for various content types and screen sizes.

### 5. Clarity
Prioritize legibility and comprehension over decoration.

---

## Design Tokens

All design tokens are centralized in `src/lib/design-tokens.ts`. Import and use these constants instead of magic strings.

### Container Widths

```typescript
import { CONTAINER_WIDTHS, getContainerClasses } from '@/lib/design-tokens';

// Five semantic width options
CONTAINER_WIDTHS.narrow    // max-w-4xl (768px) - Forms, focused content
CONTAINER_WIDTHS.standard  // max-w-5xl (1024px) - Core pages (home, about, contact, resume)
CONTAINER_WIDTHS.content   // max-w-6xl (1152px) - Content pages with sidebars (blog posts, project details)
CONTAINER_WIDTHS.archive   // max-w-7xl (1280px) - Archive/listing pages (blog listing, projects listing)
CONTAINER_WIDTHS.dashboard // max-w-[1536px] (1536px) - Full-width dashboards with data tables, charts, analytics

// Utility function for complete classes
getContainerClasses('standard')
// Returns: "mx-auto max-w-5xl py-14 md:py-20 px-4 sm:px-6 md:px-8"
```

**When to use each:**
- **Narrow** (`max-w-4xl`): Contact form, focused content, centered text blocks
- **Standard** (`max-w-5xl`): Homepage, about page, resume, contact page (default for most pages)
- **Content** (`max-w-6xl`): Individual blog posts, project detail pages (with sidebar/TOC)
- **Archive** (`max-w-7xl`): Blog listing, projects listing (with filters/grids)
- **Dashboard** (`max-w-[1536px]`): Analytics dashboards, dev tools, wide data tables and charts

### Typography

```typescript
import { TYPOGRAPHY } from '@/lib/design-tokens';

// Heading variants
TYPOGRAPHY.h1.standard  // Standard page titles
TYPOGRAPHY.h1.hero      // Homepage hero
TYPOGRAPHY.h1.article   // Blog post titles (larger)

TYPOGRAPHY.h2.standard  // Section headings
TYPOGRAPHY.h3.standard  // Subsection headings

// Text styles
TYPOGRAPHY.description  // Lead text, page descriptions
TYPOGRAPHY.metadata     // Dates, reading time
TYPOGRAPHY.body         // Long-form content
```

**Usage example:**
```tsx
export default function Page() {
  return (
    <div>
      <h1 className={TYPOGRAPHY.h1.standard}>
        Page Title
      </h1>
      <p className={TYPOGRAPHY.description}>
        A compelling description that draws readers in.
      </p>
    </div>
  );
}
```

### Spacing

```typescript
import { SPACING } from '@/lib/design-tokens';

SPACING.section      // space-y-10 md:space-y-12 - Between major sections
SPACING.subsection   // space-y-6 md:space-y-8   - Between related blocks
SPACING.content      // space-y-4                - Within content blocks
SPACING.proseHero    // prose space-y-4          - Page hero sections
```

**Spacing hierarchy:**
```
┌─────────────────────────────────────┐
│ Page Container (py-14 md:py-20)    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Section (space-y-10/12)       │ │
│  │                               │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ Subsection (space-y-6/8)│ │ │
│  │  │                         │ │ │
│  │  │  ┌───────────────────┐ │ │ │
│  │  │  │ Content (space-y-4)│ │ │ │
│  │  │  └───────────────────┘ │ │ │
│  │  └─────────────────────────┘ │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Hover Effects

```typescript
import { HOVER_EFFECTS } from '@/lib/design-tokens';

HOVER_EFFECTS.card         // Standard cards (projects, posts)
HOVER_EFFECTS.cardSubtle   // Secondary cards
HOVER_EFFECTS.cardFeatured // Hero/featured cards
HOVER_EFFECTS.button       // Buttons, FABs
HOVER_EFFECTS.link         // Text links
```

**Visual comparison:**

| Effect | Shadow | Transform | Background | Use Case |
|--------|--------|-----------|------------|----------|
| `card` | lg | -translate-y-0.5 | muted/30 | Projects, posts |
| `cardSubtle` | md | none | muted/50 | Secondary cards |
| `cardFeatured` | xl | none | none | Hero sections |
| `button` | xl | none | none | Buttons, FABs |
| `link` | none | none | none | Text links |

---

## Layout System

### Page Container Pattern

Every page should use a consistent container pattern:

```tsx
import { getContainerClasses } from '@/lib/design-tokens';

export default function Page() {
  return (
    <div className={getContainerClasses('standard')}>
      {/* Content */}
    </div>
  );
}
```

**Generated output:**
```html
<div class="mx-auto max-w-5xl py-14 md:py-20 px-4 sm:px-6 md:px-8">
  <!-- Centered, responsive padding, consistent vertical spacing -->
</div>
```

### Page Structure Template

Standard page structure:

```tsx
import { getContainerClasses, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

export default function StandardPage() {
  return (
    <div className={getContainerClasses('standard')}>
      {/* Hero Section */}
      <header className={SPACING.proseHero}>
        <h1 className={TYPOGRAPHY.h1.standard}>
          Page Title
        </h1>
        <p className={TYPOGRAPHY.description}>
          Page description that explains the content.
        </p>
      </header>

      {/* Main Content Sections */}
      <div className={SPACING.section}>
        <section className={SPACING.subsection}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Section Heading
          </h2>
          <div className={SPACING.content}>
            {/* Content blocks */}
          </div>
        </section>

        <section className={SPACING.subsection}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Another Section
          </h2>
          <div className={SPACING.content}>
            {/* Content blocks */}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## Typography

### Heading Hierarchy

```tsx
// H1 - Page titles (one per page)
<h1 className={TYPOGRAPHY.h1.standard}>
  Standard Page Title
</h1>

// H1 - Blog post titles (larger, more prominent)
<h1 className={TYPOGRAPHY.h1.article}>
  Blog Post Title
</h1>

// H2 - Major section headings
<h2 className={TYPOGRAPHY.h2.standard}>
  Section Heading
</h2>

// H3 - Subsection headings
<h3 className={TYPOGRAPHY.h3.standard}>
  Subsection Heading
</h3>
```

### Text Styles

```tsx
// Lead paragraph / page description
<p className={TYPOGRAPHY.description}>
  This is a lead paragraph that introduces the page content.
</p>

// Metadata (dates, reading time)
<span className={TYPOGRAPHY.metadata}>
  <time dateTime="2025-11-08">November 8, 2025</time>
</span>

// Body text
<p className={TYPOGRAPHY.body}>
  Regular body content goes here.
</p>
```

### Font Family

- **Headings:** `font-serif` (Georgia, serif stack)
- **Body:** Default system font stack (optimized for each OS)
- **Monospace:** For code blocks (handled by Shiki)

### Font Weights

- **Semibold (600)**: All H1 headings, emphasized text
- **Medium (500)**: H2, H3 headings
- **Regular (400)**: Body text, descriptions

⚠️ **Never use `font-bold` (700) for headings** - Use `font-semibold` for consistency.

---

## Spacing & Rhythm

### Vertical Rhythm

The site uses a consistent vertical rhythm based on multiples of 4:

```typescript
space-y-4      // 1rem (16px)
space-y-6      // 1.5rem (24px)
space-y-8      // 2rem (32px)
space-y-10     // 2.5rem (40px)
space-y-12     // 3rem (48px)
```

### When to Use Each

| Spacing | Use Case | Example |
|---------|----------|---------|
| `space-y-4` | Within content blocks | List items, form fields |
| `space-y-6` | Between related subsections | About page info blocks |
| `space-y-8` | Between subsections (desktop) | Subsection spacing |
| `space-y-10` | Between major sections | Page section dividers |
| `space-y-12` | Between major sections (desktop) | Large section breaks |

### Prose Wrapper

For typography-heavy content, use the `prose` class:

```tsx
<div className="prose space-y-4">
  <h1>Title</h1>
  <p>Content</p>
</div>
```

**When NOT to use prose:**
- Custom card layouts
- Grid/flex layouts
- Forms
- Navigation elements

---

## Color & Theming

The site uses CSS variables for theming with light/dark mode support via `next-themes`.

### Semantic Colors

```css
/* Use semantic color variables */
text-foreground        /* Primary text */
text-muted-foreground  /* Secondary text, metadata */
bg-background          /* Page background */
bg-card                /* Card backgrounds */
border                 /* Borders */
```

### Theme-Aware Components

All components should work in both light and dark modes:

```tsx
// ✅ Good - Uses semantic colors
<div className="bg-card text-foreground border">
  Content
</div>

// ❌ Bad - Hard-coded colors
<div className="bg-white text-black border-gray-300">
  Content
</div>
```

---

## Interactive Elements

### Hover States

All interactive elements should provide hover feedback:

```tsx
import { HOVER_EFFECTS } from '@/lib/design-tokens';

// Cards
<Card className={HOVER_EFFECTS.card}>
  {content}
</Card>

// Buttons (using shadcn/ui Button component)
<Button variant="default">
  Click Me
</Button>

// Links
<Link href="/blog" className={HOVER_EFFECTS.link}>
  Read More
</Link>
```

### Focus States

Focus states are automatically handled by shadcn/ui components. For custom elements:

```tsx
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Custom Button
</button>
```

### Loading States

Use Skeleton components for loading states:

```tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-8 w-48" />
```

---

## Component Patterns

### Card Components

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HOVER_EFFECTS } from '@/lib/design-tokens';

<Card className={HOVER_EFFECTS.card}>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Badge Usage

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">New</Badge>
<Badge variant="secondary">Popular</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Archived</Badge>
```

### Button Variants

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link Style</Button>
```

---

## Accessibility

### Minimum Requirements

- **Touch targets:** 44x44px minimum on mobile
- **Color contrast:** 4.5:1 for normal text, 3:1 for large text
- **Focus indicators:** Visible on all interactive elements
- **Keyboard navigation:** All interactive elements accessible via keyboard
- **Screen readers:** Proper semantic HTML and ARIA labels

### Implementation Examples

```tsx
// Touch targets on mobile
<button className="min-h-11 min-w-11 md:h-9 md:w-9">
  Icon
</button>

// Screen reader labels
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Skip links for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Best Practices

### DO ✅

- **Use design tokens** for all styling decisions
- **Import from design-tokens.ts** instead of writing custom classes
- **Test in both light and dark modes**
- **Verify mobile responsiveness** at all breakpoints
- **Check accessibility** with keyboard navigation and screen readers
- **Document new patterns** when extending the system

### DON'T ❌

- **Don't use magic strings** - Import constants from design tokens
- **Don't create one-off styles** - Extend the design system instead
- **Don't skip hover states** - Every interactive element needs feedback
- **Don't hard-code colors** - Use semantic color variables
- **Don't forget mobile** - Design mobile-first, enhance for desktop
- **Don't break existing patterns** - Consistency is key

### Code Review Checklist

When reviewing design-related PRs, check:

- [ ] Uses design tokens from `design-tokens.ts`
- [ ] Follows existing component patterns
- [ ] Works in both light and dark modes
- [ ] Hover/focus states are present and consistent
- [ ] Responsive behavior is appropriate
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Semantic HTML is used correctly
- [ ] Accessibility requirements are met

---

## Migration Guide

### Migrating Existing Components

To update existing components to use the design system:

1. **Identify the pattern** - What type of component is it? (page, card, button, etc.)
2. **Import design tokens** - Replace magic strings with constants
3. **Apply hover effects** - Use appropriate HOVER_EFFECTS constant
4. **Update spacing** - Use SPACING constants for vertical rhythm
5. **Verify consistency** - Compare with similar components
6. **Test thoroughly** - Check all breakpoints and themes

### Example Migration

**Before:**
```tsx
<div className="mx-auto max-w-4xl py-12 px-6">
  <h1 className="text-4xl font-bold mb-4">
    Page Title
  </h1>
  <p className="text-xl text-gray-600 mb-8">
    Description
  </p>
</div>
```

**After:**
```tsx
import { getContainerClasses, TYPOGRAPHY, SPACING } from '@/lib/design-tokens';

<div className={getContainerClasses('standard')}>
  <div className={SPACING.proseHero}>
    <h1 className={TYPOGRAPHY.h1.standard}>
      Page Title
    </h1>
    <p className={TYPOGRAPHY.description}>
      Description
    </p>
  </div>
</div>
```

---

## Resources

- **Design Tokens:** `src/lib/design-tokens.ts`
- **UX/UI Analysis:** `docs/design/ux-ui-consistency-analysis.md`
- **Component Patterns:** `docs/design/component-patterns.md`
- **shadcn/ui Docs:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com

---

## Changelog

### Version 1.0.0 (November 8, 2025)
- Initial design system documentation
- Defined design tokens for consistency
- Documented component patterns
- Created migration guide

---

**Questions?** Open a discussion in the repository or contact the maintainers.
