# Design System Quick Start

**For:** Developers working on dcyfr-labs  
**Last Updated:** November 8, 2025

---

## TL;DR

We've identified UX/UI inconsistencies across the site and created a design system to fix them. Use design tokens instead of magic strings.

### Quick Links

- 📊 Full Analysis - Detailed inconsistency report
- 📚 [Design System Guide](./design-system) - Complete documentation
- 🎨 Component Patterns - Reusable patterns & examples
- 🗺️ Implementation Roadmap - Step-by-step plan
- 🎯 [Design Tokens](../../src/lib/design-tokens.ts) - Source of truth

---

## The Problem

**Current consistency score: 44%**

- 5 major inconsistency categories
- 12 specific issues documented
- Pages have different widths, padding, typography, and hover effects
- No standard patterns for new components

**Examples:**
- Projects page uses `font-bold`, others use `font-semibold`
- ProjectCard hover: `-translate-y-1`, PostList hover: `-translate-y-0.5`
- About page: `py-12 md:py-16`, others: `py-14 md:py-20`
- Three different container widths (2xl, 3xl, 5xl) with no clear logic

---

## The Solution

### 1. Design Tokens (✅ Done)

Single source of truth for all design decisions:

```typescript
import { 
  CONTAINER_WIDTHS,
  TYPOGRAPHY,
  SPACING,
  HOVER_EFFECTS,
  getContainerClasses 
} from '@/lib/design-tokens';
```

### 2. Documentation (✅ Done)

- Complete UX/UI analysis with severity ratings
- Design system guide with examples
- Component patterns library
- Implementation roadmap

### 3. Reusable Components (🚧 TODO)

```tsx
// Instead of this:
<div className="mx-auto max-w-5xl py-14 md:py-20 px-4 sm:px-6 md:px-8">

// Use this:
<PageContainer width="standard">
```

### 4. Implementation (🚧 TODO)

4-phase rollout over 2-3 weeks:
1. Foundation (design tokens + docs) ✅
2. Page updates (typography, containers)
3. Component updates (hover effects)
4. Enforcement (ESLint, tests)

---

## Quick Reference

### Container Widths

```tsx
import { getContainerClasses } from '@/lib/design-tokens';

// Long-form content (blog posts, about)
<div className={getContainerClasses('prose')}>

// Lists/grids (blog listing, projects)
<div className={getContainerClasses('standard')}>

// Forms (contact)
<div className={getContainerClasses('narrow')}>
```

### Typography

```tsx
import { TYPOGRAPHY } from '@/lib/design-tokens';

// Page titles
<h1 className={TYPOGRAPHY.h1.standard}>Title</h1>

// Blog post titles (larger)
<h1 className={TYPOGRAPHY.h1.article}>Post Title</h1>

// Section headings
<h2 className={TYPOGRAPHY.h2.standard}>Section</h2>

// Lead text
<p className={TYPOGRAPHY.description}>Description</p>

// Metadata
<span className={TYPOGRAPHY.metadata}>Nov 8, 2025</span>
```

### Spacing

```tsx
import { SPACING } from '@/lib/design-tokens';

// Between major sections
<div className={SPACING.section}>

// Between subsections
<section className={SPACING.subsection}>

// Within content blocks
<div className={SPACING.content}>

// Page hero
<header className={SPACING.proseHero}>
```

### Hover Effects

```tsx
import { HOVER_EFFECTS } from '@/lib/design-tokens';

// Standard cards (projects, posts)
<Card className={HOVER_EFFECTS.card}>

// Subtle cards (secondary content)
<Card className={HOVER_EFFECTS.cardSubtle}>

// Featured cards (hero)
<Card className={HOVER_EFFECTS.cardFeatured}>

// Buttons
<Button className={HOVER_EFFECTS.button}>

// Links
<Link className={HOVER_EFFECTS.link}>
```

---

## Before & After Examples

### Page Container

**Before:**
```tsx
// Inconsistent widths and padding
<div className="mx-auto max-w-3xl py-12 md:py-16 px-4 sm:px-6 md:px-8">
  <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
    Page Title
  </h1>
  <p className="text-xl text-gray-600">
    Description
  </p>
</div>
```

**After:**
```tsx
import { 
  getContainerClasses, 
  TYPOGRAPHY, 
  SPACING 
} from '@/lib/design-tokens';

<div className={getContainerClasses('prose')}>
  <header className={SPACING.proseHero}>
    <h1 className={TYPOGRAPHY.h1.standard}>
      Page Title
    </h1>
    <p className={TYPOGRAPHY.description}>
      Description
    </p>
  </header>
</div>
```

### Card Hover

**Before:**
```tsx
// Inconsistent hover effects
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  {content}
</Card>
```

**After:**
```tsx
import { HOVER_EFFECTS } from '@/lib/design-tokens';

<Card className={HOVER_EFFECTS.card}>
  {content}
</Card>
```

---

## What to Do Now

### If you're creating a new component:

1. **Check existing patterns** in Component Patterns
2. **Use design tokens** from `src/lib/design-tokens.ts`
3. **Follow the examples** in the documentation
4. **Test thoroughly** (light/dark mode, all breakpoints)

### If you're updating an existing component:

1. **Read the analysis** in UX/UI Consistency Analysis
2. **Check the roadmap** in Implementation Roadmap
3. **Import design tokens** instead of using magic strings
4. **Update documentation** if you discover new patterns

### If you're reviewing a PR:

Use this checklist:

- [ ] Uses design tokens instead of magic strings
- [ ] Follows documented component patterns
- [ ] Consistent with existing pages/components
- [ ] Works in both light and dark modes
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] Hover/focus states match component type
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Documentation updated if new patterns introduced

---

## Common Mistakes to Avoid

### ❌ Don't Do This

```tsx
// Hard-coded spacing
<div className="space-y-6">

// Hard-coded typography
<h1 className="text-4xl font-bold">

// Hard-coded hover effects
<Card className="hover:shadow-md hover:-translate-y-1">

// Hard-coded container widths
<div className="max-w-4xl mx-auto py-12 px-6">

// Hard-coded colors
<div className="bg-white text-black">
```

### ✅ Do This Instead

```tsx
import { 
  SPACING, 
  TYPOGRAPHY, 
  HOVER_EFFECTS,
  getContainerClasses 
} from '@/lib/design-tokens';

// Use spacing tokens
<div className={SPACING.subsection}>

// Use typography tokens
<h1 className={TYPOGRAPHY.h1.standard}>

// Use hover effect tokens
<Card className={HOVER_EFFECTS.card}>

// Use container utility
<div className={getContainerClasses('standard')}>

// Use semantic colors
<div className="bg-card text-foreground">
```

---

## FAQs

### Why can't I just use Tailwind classes directly?

You can for unique cases, but design tokens ensure consistency. If everyone uses their own spacing/typography/hover effects, the site becomes inconsistent.

### What if I need something not in the design tokens?

1. Check if an existing token can work
2. If not, discuss with the team
3. Add it to design-tokens.ts
4. Document the decision
5. Update the design system guide

### Do I need to update all existing code?

Not immediately. See the Implementation Roadmap for the phased rollout plan. But **all new code** should use design tokens.

### How do I test my changes?

1. Visual check in both light and dark modes
2. Test all breakpoints (mobile, tablet, desktop)
3. Verify hover/focus states work
4. Check keyboard navigation
5. Run `npm run lint` to catch issues

### Where do I report issues?

Create a GitHub issue with:
- Description of the inconsistency
- Screenshots (before/after)
- Suggested fix using design tokens
- Link to relevant documentation

---

## Resources

- **Full Docs:** `docs/design/` directory
- **Design Tokens:** `src/lib/design-tokens.ts`
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **Accessibility:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Getting Help

- **Questions?** Open a GitHub discussion
- **Found a bug?** Create an issue
- **Have an idea?** Start a discussion
- **Need guidance?** Tag maintainers in PR

---

**Last Updated:** November 8, 2025  
**Next Review:** November 15, 2025

---

## Related Documents

- 📊 UX/UI Consistency Analysis - Full problem breakdown
- 📚 [Design System Guide](./design-system) - Complete reference
- 🎨 Component Patterns - Copy-paste examples
- 🗺️ Implementation Roadmap - Rollout plan
