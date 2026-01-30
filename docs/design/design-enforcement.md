<!-- TLP:CLEAR -->

# Design System Enforcement

This document explains how the design system is enforced through automated tooling to ensure consistency across the codebase.

**Last Updated:** November 9, 2025

---

## Overview

The design system enforcement uses **ESLint rules** to catch violations at development time, providing immediate feedback when hardcoded values are used instead of design tokens.

---

## ESLint Rules

### Configuration

All design system rules are configured in `eslint.config.mjs` under the "Design System Enforcement Rules" section.

### Active Rules

#### 1. Container Width Enforcement

**Rule:** Warns when hardcoded `max-w-*` classes are used  
**Alternative:** Use `getContainerClasses()` from `@/lib/design-tokens`

```tsx
// ❌ Hardcoded - ESLint will warn
<div className="mx-auto max-w-5xl px-4">

// ✅ Using design tokens
<div className={getContainerClasses('standard')}>
```

**Caught patterns:**
- `max-w-xs`, `max-w-sm`, `max-w-md`, `max-w-lg`, `max-w-xl`
- `max-w-2xl`, `max-w-3xl`, `max-w-4xl`, `max-w-5xl`, `max-w-6xl`, `max-w-7xl`
- `max-w-full`, `max-w-prose`

#### 2. Typography Enforcement

**Rule:** Warns when hardcoded typography classes are combined  
**Alternative:** Use `TYPOGRAPHY.*` tokens from `@/lib/design-tokens`

```tsx
// ❌ Hardcoded - ESLint will warn
<h1 className="text-3xl md:text-4xl font-bold">

// ✅ Using design tokens
<h1 className={TYPOGRAPHY.h1.standard}>
```

**Caught patterns:**
- Text size + font weight combinations (e.g., `text-xl font-semibold`)
- Commonly used in headings where design tokens should be preferred

#### 3. Hover Effects Enforcement

**Rule:** Warns when hardcoded hover transition classes are used  
**Alternative:** Use `HOVER_EFFECTS.*` tokens from `@/lib/design-tokens`

```tsx
// ❌ Hardcoded - ESLint will warn
<Card className="transition-all hover:shadow-lg hover:-translate-y-1">

// ✅ Using design tokens
<Card className={HOVER_EFFECTS.card}>
```

**Caught patterns:**
- `transition-all` combined with `hover:shadow-*`
- Commonly used on cards and interactive elements

---

## Running ESLint

### Development

ESLint runs automatically in VS Code with the ESLint extension. Warnings appear inline in your editor.

### Command Line

```bash
# Check all files
npm run lint

# Fix auto-fixable issues (design token violations require manual fixes)
npm run lint -- --fix
```

### CI/CD

ESLint runs in the build pipeline. Design token violations are treated as **warnings** (not errors), so builds won't fail, but they should be addressed.

---

## Current Status

As of November 9, 2025:

### ✅ Fully Migrated (Phase 2 & 3 Complete)
- ✅ `src/app/page.tsx` - Homepage
- ✅ `src/app/about/page.tsx` - About page
- ✅ `src/app/projects/page.tsx` - Projects page
- ✅ `src/app/blog/page.tsx` - Blog listing
- ✅ `src/app/contact/page.tsx` - Contact page
- ✅ `src/components/project-card.tsx` - Project cards
- ✅ `src/components/post-list.tsx` - Blog post listings
- ✅ `src/components/featured-post-hero.tsx` - Featured post hero
- ✅ `src/components/back-to-top.tsx` - Back to top FAB
- ✅ `src/components/table-of-contents.tsx` - TOC FAB
- ✅ `src/components/fab-menu.tsx` - FAB menu

### ⚠️ Pending Migration (ESLint warnings)
- `src/app/blog/[slug]/page.tsx` - Individual blog posts
- `src/app/blog/series/[slug]/page.tsx` - Series pages
- `src/app/analytics/AnalyticsClient.tsx` - Analytics page
- Loading states (various `loading.tsx` files)

Run `npm run lint` to see the full list of files with design token violations.

---

## Fixing Violations

### Step 1: Import Design Tokens

```tsx
import { 
  getContainerClasses, 
  TYPOGRAPHY, 
  HOVER_EFFECTS,
  SPACING 
} from "@/lib/design-tokens";
```

### Step 2: Replace Hardcoded Values

Refer to the **[Quick Start Guide](./quick-start)** for examples of each pattern.

### Step 3: Verify

```bash
# Run ESLint to check if violations are fixed
npm run lint

# Test in browser
npm run dev
```

---

## Adding New Rules

To add additional design system enforcement rules:

1. Edit `eslint.config.mjs`
2. Add a new selector under the `no-restricted-syntax` rule
3. Test with `npm run lint`
4. Update this documentation

**Example:**

```javascript
{
  selector: "Literal[value=/space-y-[0-9]+/]",
  message: "Use SPACING tokens from @/lib/design-tokens for vertical rhythm.",
}
```

---

## Exceptions

Some files may legitimately need hardcoded values:

- **UI Primitives** (`src/components/ui/*`) - These are the base building blocks
- **Design Token Definitions** (`src/lib/design-tokens.ts`) - The source of truth itself
- **One-off Utilities** - Rare cases where design tokens don't apply

To suppress warnings in these cases, use ESLint disable comments:

```tsx
{/* eslint-disable-next-line no-restricted-syntax */}
<div className="max-w-[600px]">
```

**Use sparingly!** Most cases should use design tokens.

---

## Benefits

✅ **Consistency:** Automatic enforcement prevents drift  
✅ **Developer Experience:** Immediate feedback in editor  
✅ **Maintainability:** Easy to update design system in one place  
✅ **Onboarding:** New developers learn patterns through warnings  
✅ **Code Quality:** Encourages best practices  

---

## Resources

- **[Quick Start Guide](./quick-start)** - Get started with design tokens
- **[Design System Overview](./design-system)** - Complete reference
- **Component Patterns** - Copy-paste examples
- **Implementation Roadmap** - Migration phases

---

## Questions?

See the [Quick Start Guide](./quick-start) for common patterns, or check the [Design System documentation](./design-system) for detailed information about available tokens.
