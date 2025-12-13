# ESLint Design System Warnings - Quick Reference

**Last Updated:** November 9, 2025  
**Current Status:** 78 warnings (down from 100+)

---

## 🎯 Quick Stats

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Warnings | 100+ | 78 | ✅ 22% reduction |
| False Positives | ~25 | 0 | ✅ Eliminated |
| Errors | 0 | 0 | ✅ No blocking issues |
| Build Status | ✅ Pass | ✅ Pass | No impact |

---

## 📋 What Changed (November 9, 2025)

### ESLint Configuration Updated

Added exclusion rules in `eslint.config.mjs` for:

1. **shadcn/ui components** (`src/components/ui/**`)
   - These are third-party primitives with their own design system
   - Excluded: badge, button, input, label, dropdown-menu, sheet
   - **Impact:** ~15 false positive warnings removed

2. **Design token definitions** (`src/lib/design-tokens.ts`)
   - This file DEFINES the patterns, not consumes them
   - **Impact:** ~10 false positive warnings removed

3. **Loading skeletons** (`src/**/*loading.tsx`, `src/**/*skeleton.tsx`)
   - These mirror component structure and are transitional
   - **Impact:** ~10 false positive warnings removed

### Result
- ✅ Warnings reduced by 22%
- ✅ Only real violations remain
- ✅ Build logs are cleaner
- ✅ Enforcement still active for application code

---

## 🚀 Next Steps

### Priority Queue (Ordered by Impact)

#### This Week
1. **Blog post pages** (`src/app/blog/[slug]/page.tsx`) - 3 warnings
   - High traffic, user-facing
   - Should use `TYPOGRAPHY.h1.article` and `getContainerClasses('prose')`

2. **Blog listing** (`src/app/blog/page.tsx`) - 2 warnings
   - Should use `TYPOGRAPHY.h2.standard`

3. **Project pages** (`src/app/projects/[slug]/page.tsx`) - 7 warnings
   - Portfolio showcase, important for conversions

#### Next Sprint
4. **GitHub heatmap** (`src/components/github-heatmap.tsx`) - 5 warnings
5. **Featured post hero** (`src/components/featured-post-hero.tsx`) - 2 warnings
6. **About page components** (4 files) - ~8 warnings

#### Future
7. **Analytics page** (`src/app/analytics/AnalyticsClient.tsx`) - 18 warnings
   - Admin-only, can defer
8. **Error boundaries and edge cases** - ~15 warnings
9. **Mobile navigation** - 1 warning

---

## 🔧 How to Fix Warnings

### Pattern 1: Container Widths

```tsx
// ❌ Before
<div className="mx-auto max-w-3xl py-14 md:py-20 px-4 sm:px-6 md:px-8">

// ✅ After
import { getContainerClasses } from '@/lib/design-tokens';
<div className={getContainerClasses('prose')}>
```

**Options:**
- `'prose'` - Long-form content (blog posts, about) → max-w-3xl
- `'standard'` - Lists/grids (blog listing, projects) → max-w-5xl
- `'narrow'` - Forms (contact) → max-w-2xl

### Pattern 2: Typography

```tsx
// ❌ Before
<h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight">

// ✅ After
import { TYPOGRAPHY } from '@/lib/design-tokens';
<h1 className={TYPOGRAPHY.h1.article}>
```

**Options:**
- `TYPOGRAPHY.h1.standard` - Page titles (about, projects, contact)
- `TYPOGRAPHY.h1.hero` - Homepage hero
- `TYPOGRAPHY.h1.article` - Blog post titles (larger)
- `TYPOGRAPHY.h2.standard` - Section headings
- `TYPOGRAPHY.h3.standard` - Subsection headings
- `TYPOGRAPHY.description` - Lead text
- `TYPOGRAPHY.metadata` - Dates, reading time

### Pattern 3: Hover Effects

```tsx
// ❌ Before
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

// ✅ After
import { HOVER_EFFECTS } from '@/lib/design-tokens';
<Card className={HOVER_EFFECTS.card}>
```

**Options:**
- `HOVER_EFFECTS.card` - Standard cards (most common)
- `HOVER_EFFECTS.cardSubtle` - Secondary/inline cards
- `HOVER_EFFECTS.cardFeatured` - Hero/featured cards
- `HOVER_EFFECTS.button` - Interactive buttons
- `HOVER_EFFECTS.link` - Text links

---

## 📊 Remaining Warnings by File

### High Priority (User-Facing)
- `src/app/blog/[slug]/page.tsx` - 3 warnings
- `src/app/blog/page.tsx` - 2 warnings
- `src/app/projects/[slug]/page.tsx` - 7 warnings
- `src/app/blog/series/[slug]/page.tsx` - 2 warnings
- `src/app/not-found.tsx` - 2 warnings
- `src/app/resume/page.tsx` - 5 warnings

### Medium Priority (Components)
- `src/components/github-heatmap.tsx` - 5 warnings
- `src/components/featured-post-hero.tsx` - 2 warnings
- `src/components/about-*.tsx` - 8 warnings (4 files)
- `src/components/project-card.tsx` - 2 warnings
- `src/components/giscus-comments.tsx` - 1 warning
- `src/components/mdx.tsx` - 3 warnings

### Low Priority (Admin/Edge Cases)
- `src/app/analytics/AnalyticsClient.tsx` - 18 warnings
- Error boundaries - ~6 warnings (3 files)
- Navigation components - 3 warnings (2 files)

**Total:** 78 warnings

---

## ✅ Testing Checklist

When fixing warnings, verify:

- [ ] Visual appearance unchanged (before/after screenshots)
- [ ] Responsive breakpoints work (mobile, tablet, desktop)
- [ ] Dark mode still looks correct
- [ ] Hover states function properly
- [ ] No console errors in browser
- [ ] `npm run lint` shows reduced warning count
- [ ] `npm run build` succeeds

---

## 📚 Documentation Links

- [Full Resolution Plan](/docs/design/eslint-warnings-resolution) - Complete strategy and timeline
- [Design System Quick Start](/docs/design/quick-start) - How to use design tokens
- [Design Tokens Reference](/src/lib/design-tokens.ts) - Complete token definitions
- [Component Patterns](/docs/design/component-patterns) - Reusable examples
- [Implementation Roadmap](/docs/design/implementation-roadmap) - Overall plan

---

## 💡 Tips

1. **Start with easy wins** - Container width fixes are fastest (1-2 min each)
2. **Group related changes** - Fix all warnings in one file at a time
3. **Test as you go** - Don't fix 10 files then test, fix one and verify
4. **Use multi-cursor editing** - VS Code can help with repetitive changes
5. **Check dark mode** - Design tokens work in both themes, but always verify

---

## 🚨 Common Pitfalls

1. **Don't modify shadcn/ui components** - They're excluded for a reason
2. **Don't change design-tokens.ts** - It defines the patterns
3. **Don't combine tokens with hardcoded values** - Use one or the other
4. **Don't forget imports** - Add design token imports at the top
5. **Don't skip testing** - Visual bugs are easy to introduce

---

## 📞 Questions?

- Check the design system docs first
- Look at `src/app/page.tsx` for a good example (already migrated)
- Ask in team chat if unsure about a pattern
- When in doubt, use the Quick Start guide

---

**Remember:** These warnings are helpers, not blockers. Take it one file at a time! 🎯
