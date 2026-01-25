{/* TLP:CLEAR */}

# Component Patterns

**Version:** 1.0.0  
**Last Updated:** November 8, 2025

This document provides reusable component patterns and implementation examples for common UI needs.

---

## Table of Contents

1. [Page Layout Components](#page-layout-components)
2. [Card Patterns](#card-patterns)
3. [Hero Sections](#hero-sections)
4. [List Components](#list-components)
5. [Form Patterns](#form-patterns)
6. [Navigation Elements](#navigation-elements)

---

## Page Layout Components

### PageContainer Component

Reusable container wrapper for consistent page layouts.

**File:** `src/components/page-container.tsx`

```tsx
import { ReactNode } from 'react';
import { getContainerClasses, type ContainerWidth } from '@/lib/design-tokens';

interface PageContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  className?: string;
}

/**
 * Reusable page container with consistent width and padding
 * 
 * @example
 * ```tsx
 * <PageContainer width="prose">
 *   <article>{content}</article>
 * </PageContainer>
 * ```
 */
export function PageContainer({ 
  children, 
  width = 'standard',
  className = ''
}: PageContainerProps) {
  return (
    <div className={`${getContainerClasses(width)} ${className}`.trim()}>
      {children}
    </div>
  );
}
```

**Usage:**

```tsx
// Standard width page (blog listing, projects)
<PageContainer width="standard">
  <content />
</PageContainer>

// Prose-optimized width (blog posts, about)
<PageContainer width="prose">
  <article />
</PageContainer>

// Narrow width (contact form)
<PageContainer width="narrow">
  <form />
</PageContainer>
```

---

### PageHero Component

Consistent page header with title and description.

**File:** `src/components/page-hero.tsx`

```tsx
import { ReactNode } from 'react';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';

interface PageHeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/**
 * Standard page hero section with title and optional description
 * 
 * @example
 * ```tsx
 * <PageHero 
 *   title="About Me" 
 *   description="Learn about my journey in cybersecurity"
 * />
 * ```
 */
export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <header className={SPACING.proseHero}>
      <h1 className={TYPOGRAPHY.h1.standard}>
        {title}
      </h1>
      {description && (
        <p className={TYPOGRAPHY.description}>
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
```

**Usage:**

```tsx
import { PageContainer } from '@/components/page-container';
import { PageHero } from '@/components/page-hero';

export default function AboutPage() {
  return (
    <PageContainer width="prose">
      <PageHero
        title="About Me"
        description="A cybersecurity architect passionate about building resilient systems."
      />
      
      {/* Page content */}
    </PageContainer>
  );
}
```

---

## Card Patterns

### Standard Card with Hover

Most common card pattern for projects and posts.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HOVER_EFFECTS } from '@/lib/design-tokens';

export function StandardCard({ title, description, children }) {
  return (
    <Card className={HOVER_EFFECTS.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

### Featured Card (Hero)

For hero sections and featured content.

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { HOVER_EFFECTS } from '@/lib/design-tokens';

export function FeaturedCard({ children }) {
  return (
    <Card className={HOVER_EFFECTS.cardFeatured}>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
```

### Subtle Card

For secondary or inline content.

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { HOVER_EFFECTS } from '@/lib/design-tokens';

export function SubtleCard({ children }) {
  return (
    <Card className={HOVER_EFFECTS.cardSubtle}>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

---

## Hero Sections

### Homepage Hero

```tsx
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export function HomepageHero() {
  return (
    <section className="py-4 md:py-8 space-y-4 md:space-y-5 text-center">
      {/* Avatar */}
      <div className="flex justify-center mb-4 md:mb-5">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <Image
            src="/images/avatar.jpg"
            alt="Profile picture"
            fill
            className="rounded-full object-cover ring-4 ring-border shadow-lg"
            priority
          />
        </div>
      </div>
      
      {/* Title */}
      <h1 className={`${TYPOGRAPHY.h1.hero} flex items-center gap-2 justify-center`}>
        Hi, I'm Drew <Logo width={24} height={24} className="ml-2" />
      </h1>
      
      {/* Description */}
      <p className={TYPOGRAPHY.description}>
        Cybersecurity architect building resilient security programs.
      </p>
    </section>
  );
}
```

### Page Hero with Metadata

```tsx
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { Calendar, Clock } from 'lucide-react';

export function BlogPostHero({ title, date, readingTime }) {
  return (
    <header className={SPACING.proseHero}>
      {/* Metadata */}
      <div className={TYPOGRAPHY.metadata}>
        <time dateTime={date}>
          {new Date(date).toLocaleDateString()}
        </time>
        <span className="mx-2">•</span>
        <span>{readingTime} min read</span>
      </div>
      
      {/* Title (larger for articles) */}
      <h1 className={TYPOGRAPHY.h1.article}>
        {title}
      </h1>
    </header>
  );
}
```

---

## List Components

### Standard Grid Layout

```tsx
import { SPACING } from '@/lib/design-tokens';

export function CardGrid({ children }) {
  return (
    <div className={SPACING.section}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
```

**Usage:**

```tsx
<CardGrid>
  {projects.map(project => (
    <ProjectCard key={project.slug} project={project} />
  ))}
</CardGrid>
```

### List with Sections

```tsx
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

export function SectionedList({ title, items, renderItem }) {
  return (
    <section className={SPACING.subsection}>
      <h2 className={TYPOGRAPHY.h2.standard}>
        {title}
      </h2>
      <div className={SPACING.content}>
        {items.map(renderItem)}
      </div>
    </section>
  );
}
```

---

## Form Patterns

### Standard Form Layout

```tsx
import { SPACING } from '@/lib/design-tokens';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function StandardForm({ onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={SPACING.content}>
      <div className={SPACING.content}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" required />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required />
        </div>
        
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={5} required />
        </div>
      </div>
      
      <Button type="submit">
        Submit
      </Button>
    </form>
  );
}
```

---

## Navigation Elements

### Breadcrumbs

```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## Real-World Examples

### Complete Page Template

```tsx
import { PageContainer } from '@/components/page-container';
import { PageHero } from '@/components/page-hero';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse my portfolio of development projects",
};

export default function ProjectsPage() {
  return (
    <PageContainer width="standard">
      {/* Hero */}
      <PageHero
        title="Projects"
        description="Browse my portfolio of development projects, open-source contributions, and published work."
      />
      
      {/* Main Content */}
      <div className={SPACING.section}>
        {/* Section 1 */}
        <section className={SPACING.subsection}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Featured Projects
          </h2>
          <div className={`${SPACING.content} grid gap-6 md:grid-cols-2`}>
            {/* Project cards */}
          </div>
        </section>
        
        {/* Section 2 */}
        <section className={SPACING.subsection}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Open Source
          </h2>
          <div className={SPACING.content}>
            {/* Content */}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
```

---

## Testing Patterns

### Visual Regression Checklist

When implementing new components:

- [ ] Test in light and dark modes
- [ ] Test at mobile breakpoint (< 768px)
- [ ] Test at tablet breakpoint (768px - 1024px)
- [ ] Test at desktop breakpoint (> 1024px)
- [ ] Verify hover states work
- [ ] Verify focus states are visible
- [ ] Check keyboard navigation
- [ ] Test with screen reader
- [ ] Verify touch targets on mobile (44px minimum)

---

## Related Documentation

- Design System Guide
- UX/UI Consistency Analysis
- Design Tokens

---

**Last Updated:** November 8, 2025
