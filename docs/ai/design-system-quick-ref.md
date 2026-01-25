{/* TLP:CLEAR */}

# Design System Quick Reference (AI-Optimized)

**Purpose**: Ultra-concise patterns for AI code generation. Use this for first-time compliance.

> **Related Documentation:**
>
> - **Validation Guide:** [design-system.md](./design-system.md) - Complete validation checklist and enforcement
> - **Complete Catalog:** [../design/design-system.md](../design/design-system.md) - Comprehensive design token catalog
> - **Component Patterns:** [component-patterns.md](./component-patterns.md) - Layout selection and barrel exports

**Import Required**:

```typescript
import {
  SPACING,
  TYPOGRAPHY,
  CONTAINER_WIDTHS,
  SEMANTIC_COLORS,
  HOVER_EFFECTS,
  BORDERS,
  SHADOWS,
} from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
```

---

## ❌ NEVER → ✅ ALWAYS Patterns

### Spacing

```tsx
// ❌ NEVER - Hardcoded spacing
<div className="space-y-6">
<div className="space-y-8">
<div className="gap-4">

// ✅ ALWAYS - Design tokens
<div className={SPACING.content}>       // space-y-3 md:space-y-4 lg:space-y-5
<div className={SPACING.section}>      // space-y-8 md:space-y-10 lg:space-y-14
<div className={SPACING.subsection}>   // space-y-5 md:space-y-6 lg:space-y-8

// ✅ OK - Small gaps (use numbers)
<div className="gap-4">     // OK for flex/grid gaps
<div className="p-6">       // OK for padding
<div className="space-y-2"> // OK for tight spacing < space-y-3
```

### Typography

```tsx
// ❌ NEVER - Inline typography
<h1 className="text-3xl font-semibold">
<h2 className="text-2xl font-medium">
<p className="text-lg text-muted-foreground">

// ✅ ALWAYS - Design tokens
<h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
<h1 className={TYPOGRAPHY.h1.hero}>Archive Title</h1>
<h1 className={TYPOGRAPHY.h1.article}>Blog Post Title</h1>
<h2 className={TYPOGRAPHY.h2.standard}>Section Heading</h2>
<h3 className={TYPOGRAPHY.h3.standard}>Subsection Heading</h3>
<p className={TYPOGRAPHY.description}>Lead paragraph</p>
<p className={TYPOGRAPHY.body}>Body text</p>
<span className={TYPOGRAPHY.metadata}>Published: Jan 1</span>
```

### Colors

```tsx
// ❌ NEVER - Hardcoded colors
<div className="bg-white dark:bg-gray-900">
<div className="text-gray-900 dark:text-white">
<div className="border-gray-200 dark:border-gray-800">

// ✅ ALWAYS - Semantic colors
<div className="bg-card text-card-foreground">
<div className="bg-background text-foreground">
<div className="border border-border">
<div className="text-muted-foreground">
<div className="bg-muted">

// Alert colors
<div className={SEMANTIC_COLORS.alert.critical.container}>
  <AlertCircle className={SEMANTIC_COLORS.alert.critical.icon} />
  <p className={SEMANTIC_COLORS.alert.critical.text}>Error message</p>
</div>
```

### Container Widths

```tsx
// ❌ NEVER - Hardcoded widths
<div className="max-w-4xl mx-auto px-6">
<div className="max-w-7xl mx-auto">

// ✅ ALWAYS - Design tokens
<div className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8`}>
<div className={`mx-auto ${CONTAINER_WIDTHS.prose} px-4 sm:px-6 md:px-8`}>
<div className={`mx-auto ${CONTAINER_WIDTHS.archive} px-4 sm:px-6 md:px-8`}>
```

### Content & SEO

```tsx
// ❌ NEVER - Missing periods in descriptions
<PageHero
  title="About Me"
  description="Full-stack developer passionate about building"
/>
const pageDescription = "Browse our portfolio of projects"

// ✅ ALWAYS - End descriptions with periods
<PageHero
  title="About Me"
  description="Full-stack developer passionate about building."
/>
const pageDescription = "Browse our portfolio of projects."

// ✅ OK - Exclamation points for CTAs
<Button>Get started now!</Button>
```

**Rules**:

- **Always end descriptions with periods** (both meta and hero descriptions)
- Use exclamation points only for calls-to-action
- Keep meta descriptions 150-160 characters
- Use complete sentences with proper grammar

---

## Complete Component Examples

### 1. Hero Section

```tsx
import { PageHero } from '@/components/layouts/page-hero';
import { TYPOGRAPHY } from '@/lib/design-tokens';

// ✅ CORRECT
export default function Page() {
  return (
    <PageHero
      title="About Me"
      description="Full-stack developer passionate about building great experiences."
      variant="standard"
    />
  );
}

// ❌ WRONG - Manual hero with hardcoded values
export default function Page() {
  return (
    <section className="pt-24 px-6">
      <h1 className="text-3xl font-semibold">About Me</h1>
      <p className="text-lg text-gray-600">Description</p>
    </section>
  );
}
```

### 2. Card Component

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { HOVER_EFFECTS } from '@/lib/design-tokens';

// ✅ CORRECT
export function ProjectCard({ title, description, content }) {
  return (
    <Card className={HOVER_EFFECTS.card}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// ❌ WRONG - Manual card with hardcoded values
export function ProjectCard({ title, description, content }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
      <div>{content}</div>
    </div>
  );
}
```

### 3. Page Section

```tsx
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHero } from '@/components/layouts/page-hero';
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';

// ✅ CORRECT
export default function AboutPage() {
  return (
    <PageLayout>
      <PageHero title="About" description="Learn more about my background." />

      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}
      >
        <div className={SPACING.section}>{/* Content sections */}</div>
      </section>
    </PageLayout>
  );
}

// ❌ WRONG - Manual layout
export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="pt-24 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-lg text-gray-600">Description</p>
      </section>
      <section className="px-6 max-w-5xl mx-auto space-y-8">{/* Content */}</section>
    </div>
  );
}
```

### 4. Form Component

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SPACING } from '@/lib/design-tokens';

// ✅ CORRECT
export function ContactForm() {
  return (
    <form className={SPACING.content}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Your message" rows={5} />
      </div>

      <Button type="submit">Send Message</Button>
    </form>
  );
}

// ❌ WRONG - Manual form with hardcoded styles
export function ContactForm() {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900"
        />
      </div>
    </form>
  );
}
```

### 5. Grid Layout

```tsx
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { Card } from '@/components/ui/card';

// ✅ CORRECT
export function ProjectGrid({ projects }) {
  return (
    <section className={`mx-auto ${CONTAINER_WIDTHS.archive} px-4 sm:px-6 md:px-8`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>{/* Card content */}</Card>
        ))}
      </div>
    </section>
  );
}

// ❌ WRONG - Hardcoded container and gap
export function ProjectGrid({ projects }) {
  return (
    <section className="max-w-7xl mx-auto px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{/* ... */}</div>
    </section>
  );
}
```

### 6. Button/CTA

```tsx
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// ✅ CORRECT - Uses shadcn/ui Button
export function CTAButton() {
  return (
    <div className="flex gap-4">
      <Button size="lg">
        Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <Button variant="outline" size="lg">
        Learn More
      </Button>
    </div>
  );
}

// ❌ WRONG - Manual button
export function CTAButton() {
  return (
    <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold">
      Get Started
    </button>
  );
}
```

---

## Common Scenarios Quick Reference

### Scenario: Building a new page

```tsx
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHero } from '@/components/layouts/page-hero';
import { SPACING, CONTAINER_WIDTHS } from '@/lib/design-tokens';

export default function NewPage() {
  return (
    <PageLayout>
      {/* Hero section */}
      <PageHero title="Page Title" description="Page description." />

      {/* Main content */}
      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}
      >
        <div className={SPACING.section}>{/* Your content sections here */}</div>
      </section>
    </PageLayout>
  );
}
```

### Scenario: Building a card grid

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HOVER_EFFECTS } from '@/lib/design-tokens';

export function CardGrid({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item.id} className={HOVER_EFFECTS.card}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>{item.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Scenario: Adding alerts/notifications

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { SEMANTIC_COLORS } from '@/lib/design-tokens';

// Error alert
export function ErrorAlert({ message }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// Custom styled alert
export function CustomAlert({ message, type = 'info' }) {
  const colors = SEMANTIC_COLORS.alert[type];

  return (
    <div className={cn(colors.container, colors.border, 'p-4 rounded-lg')}>
      <div className="flex gap-3">
        <Info className={colors.icon} />
        <p className={colors.text}>{message}</p>
      </div>
    </div>
  );
}
```

---

## Design Token Cheat Sheet

### Spacing (Vertical)

```typescript
SPACING.section; // space-y-8 md:space-y-10 lg:space-y-14 (major sections)
SPACING.subsection; // space-y-5 md:space-y-6 lg:space-y-8 (related blocks)
SPACING.content; // space-y-3 md:space-y-4 lg:space-y-5 (within content)
SPACING.prose; // space-y-5 md:space-y-6 lg:space-y-8 (reading content)
SPACING.compact; // space-y-2 (lists, alerts)
```

### Typography (Headings)

```typescript
TYPOGRAPHY.h1.standard; // Page titles (3xl md:4xl)
TYPOGRAPHY.h1.hero; // Archive pages (3xl md:4xl serif)
TYPOGRAPHY.h1.article; // Blog posts (3xl md:5xl serif)
TYPOGRAPHY.h2.standard; // Section headings (xl md:2xl)
TYPOGRAPHY.h3.standard; // Subsection headings (lg md:xl)
TYPOGRAPHY.description; // Lead text (lg md:xl muted)
TYPOGRAPHY.body; // Body text (base)
TYPOGRAPHY.metadata; // Dates, tags (sm muted)
```

### Container Widths

```typescript
CONTAINER_WIDTHS.prose; // max-w-4xl (reading content)
CONTAINER_WIDTHS.narrow; // max-w-4xl (forms)
CONTAINER_WIDTHS.standard; // max-w-5xl (core pages)
CONTAINER_WIDTHS.content; // max-w-6xl (blog posts)
CONTAINER_WIDTHS.archive; // max-w-7xl (listings)
CONTAINER_WIDTHS.dashboard; // max-w-[1536px] (data tables)
```

### Hover Effects

```typescript
HOVER_EFFECTS.card; // Standard card hover (shadow + lift)
HOVER_EFFECTS.cardCTA; // CTA card (border highlight)
HOVER_EFFECTS.cardSubtle; // Minimal hover
HOVER_EFFECTS.link; // Text link underline
HOVER_EFFECTS.button; // Button shadow + scale
```

### Borders & Shadows

```typescript
BORDERS.card; // rounded-lg
BORDERS.button; // rounded-md
BORDERS.circle; // rounded-full

SHADOWS.tier1.combined; // Code blocks (most prominent)
SHADOWS.tier2.combined; // Tables (medium)
SHADOWS.tier3.combined; // Inline content (subtle)
SHADOWS.card.rest; // shadow-sm
SHADOWS.card.hover; // shadow-md
```

---

## ESLint Error Prevention

**Common ESLint violations and fixes:**

```tsx
// ❌ ESLint Error: Hardcoded spacing 'space-y-6'
<div className="space-y-6">

// ✅ Fix: Use SPACING token
<div className={SPACING.subsection}>

// ❌ ESLint Error: Hardcoded typography 'text-3xl font-semibold'
<h1 className="text-3xl font-semibold">

// ✅ Fix: Use TYPOGRAPHY token
<h1 className={TYPOGRAPHY.h1.standard}>

// ❌ ESLint Error: Hardcoded color 'bg-white dark:bg-gray-900'
<div className="bg-white dark:bg-gray-900">

// ✅ Fix: Use semantic color
<div className="bg-card">
```

---

## Pre-Flight Checklist (AI Code Generation)

Before generating component code, verify:

1. ✅ Import design tokens: `import { SPACING, TYPOGRAPHY, ... } from '@/lib/design-tokens'`
2. ✅ Use existing layout components: `PageLayout`, `PageHero`, `Card`, etc.
3. ✅ Use design tokens for:
   - Vertical spacing (SPACING.\*)
   - Typography (TYPOGRAPHY.\*)
   - Container widths (CONTAINER_WIDTHS.\*)
   - Colors (semantic: bg-card, text-foreground, etc.)
4. ✅ Use numbers for: gap-_, p-_, px-_, py-_, space-y-2 (tight)
5. ✅ Import utilities: `import { cn } from '@/lib/utils'`

---

## Quick Decision Tree

```
Need spacing?
  → Major sections? → SPACING.section
  → Related content? → SPACING.subsection
  → Within content? → SPACING.content
  → Tight spacing? → space-y-2 (literal)

Need typography?
  → Page title? → TYPOGRAPHY.h1.standard
  → Blog title? → TYPOGRAPHY.h1.article
  → Section heading? → TYPOGRAPHY.h2.standard
  → Description? → TYPOGRAPHY.description
  → Body text? → TYPOGRAPHY.body

Need container?
  → Reading content? → CONTAINER_WIDTHS.prose
  → Form page? → CONTAINER_WIDTHS.narrow
  → Standard page? → CONTAINER_WIDTHS.standard
  → Listing page? → CONTAINER_WIDTHS.archive

Need colors?
  → Card background? → bg-card
  → Main background? → bg-background
  → Text? → text-foreground
  → Muted text? → text-muted-foreground
  → Border? → border-border
```

---

**Token Count**: ~2500 tokens (optimized for AI context window)
**Last Updated**: 2025-12-24
**Maintenance**: Update when new design tokens added
