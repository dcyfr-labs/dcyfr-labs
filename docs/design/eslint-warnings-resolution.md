# ESLint Design System Warnings - Resolution Plan

**Status:** In Progress  
**Created:** November 9, 2025  
**Owner:** Engineering Team

---

## Overview

During the Vercel build on November 9, 2025, we observed 100+ ESLint warnings related to design system enforcement. These warnings are **intentional** - they identify where hardcoded styles should be replaced with design tokens from `@/lib/design-tokens`.

### Current State
- ✅ Build succeeds (warnings don't block deployment)
- ⚠️ 100+ warnings create log noise
- ✅ Design system is documented and ready
- 🚧 Migration from hardcoded styles is ongoing

---

## Root Cause Analysis

The ESLint warnings come from custom rules added to enforce the design system:

```javascript
// eslint.config.mjs
"no-restricted-syntax": [
  "warn",
  { 
    selector: "Literal[value=/max-w-(xs|sm|md|lg|xl|...)/]",
    message: "Use getContainerClasses() from @/lib/design-tokens..."
  },
  { 
    selector: "Literal[value=/text-(xs|sm|...).*font-(bold|semibold|medium)/]",
    message: "Use TYPOGRAPHY tokens from @/lib/design-tokens..."
  },
  // ... more rules
]
```

These rules were added to:
1. **Identify inconsistencies** - Find where magic strings are used
2. **Guide refactoring** - Point developers to the right patterns
3. **Prevent regression** - Stop new hardcoded styles from being added

---

## Warning Breakdown

### By Category

| Category | Count | Priority | Fix Complexity |
|----------|-------|----------|----------------|
| Container widths (`max-w-*`) | ~20 | High | Easy |
| Typography (`font-*`, `text-*`) | ~70 | High | Medium |
| Hover effects | ~10 | Low | Easy |

### By File Type

| File Type | Count | Action |
|-----------|-------|--------|
| shadcn/ui components | ~15 | ✅ Exclude (false positives) |
| Design tokens definition | ~10 | ✅ Exclude (defines patterns) |
| Loading skeletons | ~10 | ✅ Exclude (mirrors structure) |
| Page components | ~30 | 🔧 Fix incrementally |
| Feature components | ~40 | 🔧 Fix incrementally |

---

## Resolution Strategy

### Phase 1: Immediate Cleanup (✅ COMPLETE)

**Goal:** Reduce warnings by 30-40% by excluding false positives

**Actions:**
- ✅ Exclude `src/components/ui/**` (shadcn/ui primitives)
- ✅ Exclude `src/lib/design-tokens.ts` (source of truth)
- ✅ Exclude loading skeletons and error boundaries

**Result:** ~70 warnings remaining (down from 100+)

**Commit:** Updated `eslint.config.mjs` with exclusion rules

---

### Phase 2: High-Impact Pages (🚧 TODO - This Week)

**Goal:** Fix the most visible user-facing pages first

**Priority 1 - Blog System:**
- [ ] `src/app/blog/[slug]/page.tsx` (3 violations)
  - Replace `max-w-3xl` with `getContainerClasses('prose')`
  - Replace heading classes with `TYPOGRAPHY.h1.article`
- [ ] `src/app/blog/page.tsx` (2 violations)
  - Replace heading classes with `TYPOGRAPHY.h2.standard`

**Priority 2 - Projects:**
- [ ] `src/app/projects/[slug]/page.tsx` (7 violations)
  - Replace `max-w-3xl` with `getContainerClasses('prose')`
  - Replace typography classes across multiple headings

**Priority 3 - Analytics (Admin):**
- [ ] `src/app/analytics/AnalyticsClient.tsx` (18 violations)
  - Complex component, needs careful review
  - Can defer to later phase (not public-facing)

**Estimated Impact:** Reduce to ~40 warnings
**Timeline:** 1-2 days
**Risk:** Low - these patterns are well-tested

---

### Phase 3: Component Library (📅 TODO - Next Sprint)

**Goal:** Update shared components used across the site

**Components:**
- [ ] `src/components/github-heatmap.tsx` (6 violations)
- [ ] `src/components/featured-post-hero.tsx` (2 violations)
- [ ] `src/components/project-card.tsx` (2 violations)
- [ ] `src/components/related-posts.tsx` (1 violation)
- [ ] `src/components/table-of-contents.tsx` (1 violation)
- [ ] `src/components/mdx.tsx` (3 violations)

**Estimated Impact:** Reduce to ~15 warnings
**Timeline:** 2-3 days
**Risk:** Medium - need regression testing

---

### Phase 4: Edge Cases & Polish (📅 TODO - Future)

**Goal:** Achieve <5 warnings, document any intentional exceptions

**Remaining:**
- [ ] Error boundaries (styling for error states)
- [ ] Mobile navigation
- [ ] About page components
- [ ] Resume page
- [ ] Not-found page

**Estimated Impact:** Reduce to <5 warnings
**Timeline:** 1-2 days
**Risk:** Low

---

## Implementation Guide

### Example: Fixing Container Widths

**Before:**
```tsx
<div className="mx-auto max-w-3xl py-14 md:py-20 px-4 sm:px-6 md:px-8">
  {content}
</div>
```

**After:**
```tsx
import { getContainerClasses } from '@/lib/design-tokens';

<div className={getContainerClasses('prose')}>
  {content}
</div>
```

### Example: Fixing Typography

**Before:**
```tsx
<h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight">
  {title}
</h1>
```

**After:**
```tsx
import { TYPOGRAPHY } from '@/lib/design-tokens';

<h1 className={TYPOGRAPHY.h1.article}>
  {title}
</h1>
```

### Example: Fixing Hover Effects

**Before:**
```tsx
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
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

## Testing Strategy

For each phase:

1. **Visual Regression Testing**
   - Compare before/after screenshots
   - Verify responsive breakpoints
   - Check dark mode

2. **Component Testing**
   - Run existing component tests
   - Add new tests for edge cases

3. **Manual Testing**
   - Navigate through fixed pages
   - Verify hover states
   - Test on mobile devices

4. **Lint Verification**
   ```bash
   npm run lint
   ```

---

## Automation Opportunities

Consider creating a codemod script for common patterns:

```javascript
// scripts/migrate-to-design-tokens.mjs
// Automatically converts common patterns

// Example: Convert max-w-3xl -> getContainerClasses('prose')
const transforms = [
  {
    pattern: /className="mx-auto max-w-3xl py-14 md:py-20 px-4 sm:px-6 md:px-8"/g,
    replacement: 'className={getContainerClasses(\'prose\')}'
  },
  // ... more patterns
];
```

**Benefits:**
- Faster migration
- Consistent results
- Reduces human error

**Risks:**
- Complex className expressions may break
- Need thorough testing after automated changes

---

## Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total warnings | 100+ | <10 | 🔴 In Progress |
| False positives | ~25 | 0 | ✅ Complete |
| High-impact pages fixed | 0/5 | 5/5 | 🚧 Phase 2 |
| Component library fixed | 0/6 | 6/6 | 📅 Phase 3 |
| Design system adoption | ~40% | >95% | 🔴 In Progress |

---

## Timeline

```
Week 1 (Current):
├─ ✅ Phase 1: ESLint exclusions
└─ 🚧 Phase 2: High-impact pages

Week 2:
├─ Phase 2 completion
└─ Phase 3: Component library

Week 3:
├─ Phase 3 completion
├─ Phase 4: Edge cases
└─ Documentation updates
```

---

## Related Documentation

- [Design System Quick Start](/docs/design/quick-start)
- [UX/UI Consistency Analysis](/docs/design/ux-ui-consistency-analysis)
- [Implementation Roadmap](/docs/design/implementation-roadmap)
- [Design Tokens Reference](/src/lib/design-tokens.ts)

---

## Decision Log

### November 9, 2025 - ESLint Exclusion Strategy

**Decision:** Exclude shadcn/ui components, design-tokens.ts, and loading skeletons from lint rules

**Rationale:**
- These are false positives (defining patterns, not consuming them)
- Reduces noise without losing enforcement on application code
- Aligns with incremental migration strategy

**Alternative Considered:** More precise AST selectors to target only className props
**Why Not:** Complex to implement, may miss edge cases, file exclusions are simpler

### November 8, 2025 - Warning Level vs Error Level

**Decision:** Keep violations as "warn" not "error"

**Rationale:**
- Doesn't block builds during migration
- Maintains visibility of progress
- Allows gradual adoption

**Will Review:** Once <10 warnings remain, consider upgrading to "error" to prevent regression

---

## Questions & Answers

**Q: Why not just disable the rules?**  
A: The rules provide visibility and prevent regression. Disabling them would defeat the purpose of the design system initiative.

**Q: Why are shadcn/ui components excluded?**  
A: They're third-party primitives with their own design system. We shouldn't modify their internal styling patterns.

**Q: Can we automate this migration?**  
A: Partially. Simple patterns can be automated, but complex className expressions need manual review.

**Q: What about new code?**  
A: The ESLint rules will catch violations in new code immediately, guiding developers to use design tokens.

**Q: How do we ensure consistency in new components?**  
A: 1) ESLint enforcement, 2) Code review, 3) Component template in docs, 4) Pre-commit hooks (future)

---

## Next Steps

1. ✅ Merge ESLint config updates
2. 🚧 Start Phase 2: Fix blog pages
3. 📝 Document progress in `/docs/operations/todo.md`
4. 🔄 Update this plan as phases complete

**Assigned To:** Engineering Team  
**Review Date:** November 16, 2025 (after Phase 2)
