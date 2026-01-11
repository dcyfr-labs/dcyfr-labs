# Design System Quick Reference

**Comprehensive guide** for developers working on dcyfr-labs design implementation.

**Last Updated:** January 5, 2026

---

## Table of Contents

1. [Design System Basics](#design-system-basics)
2. [Typography](#typography)
3. [Mobile-First Optimization](#mobile-first-optimization)
4. [Print Styles](#print-styles)
5. [Resources](#resources)

---

## Design System Basics

### TL;DR

We've identified UX/UI inconsistencies across the site and created a design system to fix them. Use design tokens instead of magic strings.

**Current consistency score: 44%**

- 5 major inconsistency categories
- 12 specific issues documented
- Pages have different widths, padding, typography, and hover effects
- No standard patterns for new components

### Quick Links

- 📊 Full Analysis - Detailed inconsistency report
- 📚 [Design System Guide](./design-system) - Complete documentation
- 🎨 Component Patterns - Reusable patterns & examples
- 🗺️ Implementation Roadmap - Step-by-step plan
- 🎯 [Design Tokens](../../src/lib/design-tokens.ts) - Source of truth

### Design Tokens

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

### Common Mistakes to Avoid

#### ❌ Don't Do This

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

#### ✅ Do This Instead

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

### Before & After Examples

#### Page Container

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

#### Card Hover

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

### PR Review Checklist

Use this checklist when reviewing design changes:

- [ ] Uses design tokens instead of magic strings
- [ ] Follows documented component patterns
- [ ] Consistent with existing pages/components
- [ ] Works in both light and dark modes
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] Hover/focus states match component type
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Documentation updated if new patterns introduced

---

## Typography

### Font Classes

```tsx
// Sans-serif (body text)
<p className="font-sans">Body text</p>

// Serif (headings, emphasis)
<h1 className="font-serif">Heading</h1>

// Monospace (code)
<code className="font-mono">code</code>
```

### Design Token Typography

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

### Common Typography Patterns

#### Page Titles
```tsx
<h1 className="font-serif text-3xl md:text-4xl font-bold">
  Page Title
</h1>
```

#### Section Headings
```tsx
<h2 className="font-serif text-xl md:text-2xl font-semibold">
  Section Title
</h2>
```

#### Subsection Headings
```tsx
<h3 className="font-serif text-lg md:text-xl font-medium">
  Subsection Title
</h3>
```

#### Body Text
```tsx
// No class needed - Geist Sans is default
<p className="text-base leading-7">
  Regular paragraph text
</p>
```

#### Blockquotes
```tsx
<blockquote className="font-serif border-l-4 border-primary/30 pl-6 my-6 text-muted-foreground">
  Quoted text
</blockquote>
```

#### Inline Code
```tsx
<code className="font-mono rounded-md bg-muted px-1.5 py-0.5 text-sm">
  inline code
</code>
```

#### Code Blocks
```tsx
<pre className="font-mono">
  <code>{codeContent}</code>
</pre>
```

### When to Use Each Font

#### Geist Sans (Primary)
- ✅ Body paragraphs
- ✅ UI elements (buttons, inputs)
- ✅ Navigation links
- ✅ Lists
- ✅ Form labels
- ✅ Metadata (dates, tags)

#### Source Serif 4 (Accent)
- ✅ Page titles (H1)
- ✅ Section headings (H2, H3)
- ✅ Blog post titles
- ✅ Blockquotes
- ✅ Pull quotes
- ❌ Body text (too ornate)
- ❌ UI elements (not suitable)

#### Geist Mono (Code)
- ✅ Code blocks
- ✅ Inline code
- ✅ Terminal output
- ✅ File paths
- ✅ URLs in documentation
- ❌ Regular text
- ❌ Headings

### Font Weights

**Geist Sans:**
- 400 (Regular) - Default for body text
- 500 (Medium) - Available but not commonly used
- 600 (Semibold) - Subheadings, emphasis
- 700 (Bold) - Strong emphasis

**Source Serif 4:**
- Variable font: 200-900 (full range)
- 400 (Regular) - Blockquotes, lighter headings
- 600 (Semibold) - Section headings
- 700 (Bold) - Page titles, strong headings
- 800+ (Extra Bold) - Available for special emphasis

**Geist Mono:**
- 400 (Regular) - All code content

### MDX Content

Headings and blockquotes in MDX automatically use serif fonts. No additional classes needed.

```mdx
# This uses Source Serif 4
## So does this
### And this

> Blockquotes use Source Serif 4 italic

Regular text uses Geist Sans.

`inline code` uses Geist Mono.
```

### Typography Examples

#### Homepage Hero
```tsx
<section className="text-center space-y-4">
  <h1 className="font-serif text-4xl md:text-5xl font-bold">
    Welcome to My Portfolio
  </h1>
  <p className="font-sans text-lg md:text-xl text-muted-foreground">
    Building modern web experiences
  </p>
</section>
```

#### Blog Post Header
```tsx
<article>
  <h1 className="font-serif text-3xl md:text-4xl font-semibold">
    Understanding React Server Components
  </h1>
  <div className="font-sans text-sm text-muted-foreground">
    Published on January 15, 2025
  </div>
</article>
```

---

## Mobile-First Optimization

### TL;DR

Your site is **responsive but desktop-first**. This section identifies opportunities to transform it into a true mobile-first experience with native-app-like UX.

### Critical Issues (Fix First)

#### 1. Touch Targets Too Small
- **Problem**: Navigation links ~32px, badges ~24px (minimum should be 44x44px)
- **Impact**: Frustrating taps, accidental clicks
- **Fix**: Add padding to achieve 44x44px minimum for all interactive elements

#### 2. No Mobile Navigation
- **Problem**: Horizontal nav links take valuable space, small targets
- **Impact**: Poor navigation UX on phones
- **Fix**: Implement hamburger menu (Sheet component) + optional bottom nav

#### 3. Hidden Content on Mobile
- **Problem**: Project highlights, TOC completely hidden (lg:hidden)
- **Impact**: Mobile users miss important content
- **Fix**: Progressive disclosure (expand/collapse) instead of hiding

#### 4. Forms Not Optimized
- **Problem**: No inputMode, standard sizes, no inline validation
- **Impact**: Typing difficulty, wrong keyboards, poor UX
- **Fix**: Add inputMode attributes, increase input heights to 48px, add validation

### Quick Wins (High Impact, Low Effort)

#### Touch Target Fix
```tsx
// Add to all interactive elements
className="min-h-[44px] min-w-[44px] flex items-center justify-center"
```

#### Mobile Menu
```tsx
// Use shadcn Sheet for hamburger drawer
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger>☰</SheetTrigger>
  <SheetContent side="left">
    {/* Large touch-friendly links */}
  </SheetContent>
</Sheet>
```

#### Form Input Optimization
```tsx
<Input
  type="email"
  inputMode="email"  // ← Optimized mobile keyboard
  className="h-12"   // ← Larger touch target
  autoComplete="email"
/>
```

#### Mobile Padding
```tsx
// Reduce padding on mobile for more space
<div className="px-4 sm:px-6 md:px-8">
```

### Recommended Pattern Changes

#### Before (Desktop-First)
```tsx
// Logo text hidden on mobile
<span className="hidden md:block">Drew's Lab</span>

// Horizontal nav with small targets
<nav className="flex gap-4 text-sm">
  <Link href="/about">About</Link>
  {/* ... */}
</nav>

// Content completely hidden
<div className="hidden lg:block">
  {/* Project highlights */}
</div>
```

#### After (Mobile-First)
```tsx
// Logo always visible
<span className="text-lg md:text-xl font-serif">Drew's Lab</span>

// Mobile: Drawer, Desktop: Horizontal
<div className="md:hidden">
  <Sheet>{/* Mobile menu */}</Sheet>
</div>
<nav className="hidden md:flex gap-6">
  {/* Desktop nav */}
</nav>

// Progressive disclosure
<Collapsible>
  <CollapsibleTrigger>Show Details</CollapsibleTrigger>
  <CollapsibleContent>
    {/* Project highlights */}
  </CollapsibleContent>
</Collapsible>
```

### Success Metrics

#### Must Achieve
- ✅ All touch targets ≥ 44x44px
- ✅ Lighthouse Accessibility: 100
- ✅ Mobile page load < 3s (3G)
- ✅ Form completion rate > 60%

#### Should Achieve
- ⭐ Lighthouse Performance > 90
- ⭐ Mobile bounce rate < 40%
- ⭐ Time on page > 2 minutes
- ⭐ PWA install rate > 5%

### Test Devices

**Priority 1** (Must test):
- iPhone SE (375px - smallest modern iPhone)
- iPhone 14 Pro (393px - standard)
- Samsung Galaxy S21 (360px - Android standard)

**Priority 2** (Should test):
- iPad Mini (768px - tablet boundary)
- iPad Pro (1024px - large tablet)

---

## Print Styles

### Testing Print Styles

#### Method 1: Print Preview
```
Cmd+P (Mac) or Ctrl+P (Windows/Linux)
```

#### Method 2: Chrome DevTools
1. Open DevTools (F12)
2. Click ⋮ menu → More tools → Rendering
3. Find "Emulate CSS media type"
4. Select "print"

#### Method 3: Test Script
```bash
npm run test:print
```

### What's Hidden in Print

- Site header and footer
- Navigation menus
- Theme toggle buttons
- Table of contents
- Reading progress indicator
- Share buttons
- Comment sections (Giscus)
- Videos and iframes

### What's Enhanced for Print

✅ **Typography**: Serif fonts, optimized sizes
✅ **Page Layout**: Letter size with proper margins
✅ **Code Blocks**: Smaller font, word wrap enabled
✅ **Links**: External URLs shown in parentheses
✅ **Page Breaks**: Smart breaks for headings, code, images
✅ **Badges**: Print-friendly styling
✅ **Metadata**: Dates, reading time, view count

### Quick Customizations

#### Change page margins:
```css
@page {
  margin: 2cm 2.5cm; /* Adjust as needed */
}
```

#### Hide external link URLs:
```css
/* Comment out or remove this rule */
a[href^="http"]:after {
  content: " (" attr(href) ")";
}
```

#### Adjust base font size:
```css
body {
  font-size: 11pt; /* Change value */
}
```

### Browser Print Settings

Recommended settings for best results:

- **Layout**: Portrait
- **Paper**: Letter (8.5" x 11")
- **Margins**: Default (CSS handles it)
- **Headers/Footers**: Off
- **Background graphics**: Off

---

## Resources

### File Locations

- **Design Tokens**: `src/lib/design-tokens.ts`
- **Print Styles**: `src/app/print.css`
- **Component Templates**: `src/components/_templates/`

### Documentation

- **Full Docs**: `docs/design/` directory
- **Design System Guide**: [docs/design/design-system](./design-system)
- **Complete Typography Guide**: `docs/design/typography.md`
- **Print Stylesheet Documentation**: `docs/design/print-stylesheet.md`
- **Mobile Analysis**: `docs/design/mobile-first-optimization-analysis.md`

### External Resources

- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/
- **Apple HIG**: https://developer.apple.com/design/human-interface-guidelines/
- **Material Design**: https://m3.material.io

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

## Getting Help

- **Questions?** Open a GitHub discussion
- **Found a bug?** Create an issue
- **Have an idea?** Start a discussion
- **Need guidance?** Tag maintainers in PR

---

**Quick Access:** Bookmark this file for daily reference when building components or pages.

**Last Updated:** January 5, 2026
**Consolidates**: 4 design quick-reference files into single comprehensive guide
