# Design System Implementation Roadmap

**Status:** Planning  
**Priority:** High  
**Est. Completion:** 2-3 weeks  
**Last Updated:** November 8, 2025

---

## Overview

This roadmap outlines the implementation of the design system to bring the dcyfr-labs site to full UX/UI consistency. The work is divided into 4 phases with clear deliverables and success criteria.

---

## Phase 1: Foundation (Week 1)

**Goal:** Establish design tokens and documentation  
**Priority:** Critical

### Tasks

#### 1.1 Design Tokens ✅
- [x] Create `src/lib/design-tokens.ts` with all constants
- [x] Define container widths (prose, standard, narrow)
- [x] Define typography patterns (h1, h2, h3, description, metadata)
- [x] Define spacing scale (section, subsection, content)
- [x] Define hover effects (card, cardSubtle, cardFeatured, button, link)
- [x] Export TypeScript types for type safety

**Files Created:**
- `src/lib/design-tokens.ts`

---

#### 1.2 Documentation ✅
- [x] Write UX/UI consistency analysis document
- [x] Create design system guide
- [x] Document component patterns with examples
- [x] Create implementation roadmap (this document)

**Files Created:**
- `docs/design/ux-ui-consistency-analysis.md`
- `docs/design/design-system.md`
- `docs/design/component-patterns.md`
- `docs/design/implementation-roadmap.md`

---

#### 1.3 Core Components (TODO)
**Est. Time:** 4 hours

Create reusable layout components:

- [ ] `PageContainer` - Wrapper for consistent page layouts
- [ ] `PageHero` - Standard page header with title/description
- [ ] `Section` - Consistent section spacing wrapper

**Implementation:**

```tsx
// src/components/page-container.tsx
export function PageContainer({ 
  children, 
  width = 'standard' 
}: PageContainerProps) {
  return (
    <div className={getContainerClasses(width)}>
      {children}
    </div>
  );
}

// src/components/page-hero.tsx
export function PageHero({ 
  title, 
  description 
}: PageHeroProps) {
  return (
    <header className={SPACING.proseHero}>
      <h1 className={TYPOGRAPHY.h1.standard}>{title}</h1>
      {description && (
        <p className={TYPOGRAPHY.description}>{description}</p>
      )}
    </header>
  );
}

// src/components/section.tsx
export function Section({ 
  children, 
  spacing = 'subsection' 
}: SectionProps) {
  return (
    <section className={SPACING[spacing]}>
      {children}
    </section>
  );
}
```

**Deliverables:**
- [ ] 3 new component files
- [ ] JSDoc comments for each
- [ ] Usage examples in component-patterns.md

---

### Phase 1 Success Criteria

- ✅ Design tokens file created and typed
- ✅ All documentation written and reviewed
- [ ] Core layout components implemented
- [ ] Components tested in isolation
- [ ] Examples added to documentation

**Phase 1 Completion:** TBD

---

## Phase 2: Page Updates (Week 1-2)

**Goal:** Update all pages to use design tokens  
**Priority:** High

### Tasks

#### 2.1 Update Page Titles (TODO)
**Est. Time:** 2 hours

Fix inconsistent H1 font weights:

- [ ] Projects page: Change `font-bold` → `font-semibold`
- [ ] Contact page: Change `font-bold` → `font-semibold`
- [ ] Verify all other pages use `font-semibold`

**Files to Update:**
- `src/app/projects/page.tsx`
- `src/app/contact/page.tsx`

**Before:**
```tsx
<h1 className="font-serif text-3xl md:text-4xl font-bold">
  Page Title
</h1>
```

**After:**
```tsx
import { TYPOGRAPHY } from '@/lib/design-tokens';

<h1 className={TYPOGRAPHY.h1.standard}>
  Page Title
</h1>
```

---

#### 2.2 Update Page Containers (TODO)
**Est. Time:** 3 hours

Standardize container patterns across all pages:

- [ ] Home: Verify `max-w-5xl` with consistent padding
- [ ] About: Update `py-12 md:py-16` → `py-14 md:py-20`
- [ ] Blog listing: Verify consistency
- [ ] Projects: Verify consistency
- [ ] Contact: Verify consistency
- [ ] Resume: Verify consistency

**Files to Update:**
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/blog/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/resume/page.tsx`

**Migration Pattern:**
```tsx
// Before
<div className="mx-auto max-w-3xl py-12 md:py-16 px-4 sm:px-6 md:px-8">

// After
import { getContainerClasses } from '@/lib/design-tokens';

<div className={getContainerClasses('prose')}>
```

---

#### 2.3 Update Prose Spacing (TODO)
**Est. Time:** 1 hour

Fix About page hero spacing inconsistency:

- [ ] About page hero: Change `prose space-y-6` → `prose space-y-4`

**Files to Update:**
- `src/app/about/page.tsx`

**Before:**
```tsx
<div className="prose space-y-6">
```

**After:**
```tsx
import { SPACING } from '@/lib/design-tokens';

<div className={SPACING.proseHero}>
```

---

### Phase 2 Success Criteria

- [ ] All pages use consistent H1 font weight (semibold)
- [ ] All pages use consistent container patterns
- [ ] All prose wrappers use space-y-4
- [ ] Visual regression tests pass
- [ ] No layout shifts on any page

**Phase 2 Completion:** TBD

---

## Phase 3: Component Updates (Week 2-3)

**Goal:** Standardize component hover effects and styling  
**Priority:** High

### Tasks

#### 3.1 Update Card Hover Effects (TODO)
**Est. Time:** 4 hours

Standardize hover effects across all card components:

- [ ] ProjectCard: Update to use `HOVER_EFFECTS.card`
- [ ] PostList: Update to use `HOVER_EFFECTS.card`
- [ ] FeaturedPostHero: Update to use `HOVER_EFFECTS.cardFeatured`

**Files to Update:**
- `src/components/project-card.tsx`
- `src/components/post-list.tsx`
- `src/components/featured-post-hero.tsx`

**Before (ProjectCard):**
```tsx
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
```

**After:**
```tsx
import { HOVER_EFFECTS } from '@/lib/design-tokens';

<Card className={HOVER_EFFECTS.card}>
```

**Visual Changes:**
- ProjectCard: `-translate-y-1` → `-translate-y-0.5` (more subtle)
- PostList: Add `hover:bg-muted/30` for consistency

---

#### 3.2 Update Skeleton Components (TODO)
**Est. Time:** 2 hours

Ensure skeleton loaders match updated card styles:

- [ ] `project-card-skeleton.tsx` - Match ProjectCard hover effects
- [ ] `post-list-skeleton.tsx` - Match PostList hover effects

**Files to Update:**
- `src/components/project-card-skeleton.tsx`
- `src/components/post-list-skeleton.tsx`

---

#### 3.3 Component Documentation (TODO)
**Est. Time:** 2 hours

Update component JSDoc to reference design tokens:

- [ ] Add design token imports to JSDoc examples
- [ ] Document hover effect patterns
- [ ] Link to design system docs

**Files to Update:**
- `src/components/project-card.tsx`
- `src/components/post-list.tsx`
- `src/components/featured-post-hero.tsx`

---

### Phase 3 Success Criteria

- [ ] All cards use consistent hover effects
- [ ] Skeleton components match production components
- [ ] Component documentation updated
- [ ] Visual consistency across all card types
- [ ] No regressions in mobile responsiveness

**Phase 3 Completion:** TBD

---

## Phase 4: Enforcement & Tooling (Week 3)

**Goal:** Prevent future inconsistencies  
**Priority:** Medium

### Tasks

#### 4.1 ESLint Rules (TODO)
**Est. Time:** 3 hours

Create custom ESLint rules to catch design token violations:

- [ ] Warn on hard-coded spacing values (space-y-*)
- [ ] Warn on hard-coded font weights (font-bold, font-semibold)
- [ ] Warn on hard-coded container widths (max-w-*)
- [ ] Suggest design token imports

**Implementation:**
```javascript
// eslint-local-rules.js
module.exports = {
  'use-design-tokens': {
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name === 'className') {
            const value = node.value.value;
            if (typeof value === 'string') {
              // Check for hard-coded patterns
              if (/space-y-\d+/.test(value)) {
                context.report({
                  node,
                  message: 'Use SPACING constants from design-tokens.ts',
                });
              }
              // Add more checks...
            }
          }
        },
      };
    },
  },
};
```

---

#### 4.2 Visual Regression Tests (TODO)
**Est. Time:** 4 hours

Set up visual regression testing with Playwright:

- [ ] Install Playwright
- [ ] Create test snapshots for all pages
- [ ] Create test snapshots for all components
- [ ] Add to CI pipeline

**Test Coverage:**
- [ ] Homepage (light/dark)
- [ ] About page (light/dark)
- [ ] Blog listing (light/dark)
- [ ] Blog post (light/dark)
- [ ] Projects (light/dark)
- [ ] Contact (light/dark)
- [ ] All card components
- [ ] All hover states

---

#### 4.3 Documentation Site (TODO)
**Est. Time:** 6 hours

Create interactive design system documentation:

- [ ] Set up Storybook or similar
- [ ] Add stories for all components
- [ ] Add stories for design tokens
- [ ] Deploy to Vercel subdomain

**URL:** `design.www.dcyfr.ai` or `/design-system` route

---

### Phase 4 Success Criteria

- [ ] ESLint rules catch common violations
- [ ] Visual regression tests in CI
- [ ] Interactive documentation published
- [ ] Contributing guide updated with design system info
- [ ] Team members onboarded to new patterns

**Phase 4 Completion:** TBD

---

## Testing Strategy

### Manual Testing Checklist

For each updated component/page:

- [ ] Light mode appearance
- [ ] Dark mode appearance
- [ ] Mobile breakpoint (< 768px)
- [ ] Tablet breakpoint (768px - 1024px)
- [ ] Desktop breakpoint (> 1024px)
- [ ] Hover states
- [ ] Focus states
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Touch target sizes (44px minimum)

### Automated Testing

- [ ] Visual regression tests (Playwright)
- [ ] ESLint rules for design tokens
- [ ] TypeScript type checking
- [ ] Build succeeds with no warnings

---

## Rollout Plan

### Development
1. Create feature branch: `feature/design-system-implementation`
2. Implement Phase 1 (foundation)
3. Commit and push
4. Self-review in preview deployment

### Review
1. Create PR with detailed description
2. Request review from maintainers
3. Address feedback
4. Verify preview deployment

### Deployment
1. Merge to `preview` branch first
2. Monitor for issues (1-2 days)
3. Merge to `main` branch
4. Deploy to production
5. Monitor analytics for bounce rate changes

---

## Rollback Plan

If issues arise after deployment:

1. **Immediate:** Revert merge commit
2. **Investigation:** Identify specific issue
3. **Fix Forward:** Apply targeted fix
4. **Re-deploy:** Test thoroughly before retry

---

## Metrics & Monitoring

### Before Implementation

**Consistency Score:** 44%
- Container widths: 40%
- Typography: 60%
- Spacing: 50%
- Hover effects: 25%

### After Implementation (Target)

**Consistency Score:** 95%+
- Container widths: 95%+
- Typography: 100%
- Spacing: 95%+
- Hover effects: 100%

### Monitoring

Track these metrics weekly:
- Page load time (should not increase)
- Cumulative Layout Shift (should improve)
- User bounce rate (should decrease)
- Time on page (should increase)

---

## Team Communication

### Announcements

- [ ] Announce design system to team
- [ ] Share documentation links
- [ ] Schedule design system walkthrough
- [ ] Update contribution guidelines

### Training Materials

- [ ] Record video walkthrough
- [ ] Create quick reference card
- [ ] Add examples to README
- [ ] Update PR template with design system checklist

---

## Dependencies

### Completed ✅
- Tailwind CSS v4
- shadcn/ui components
- next-themes for dark mode
- Existing component library

### In Progress
- Design tokens file
- Documentation

### Blocked
- None

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing layouts | Low | High | Visual regression tests |
| Increased build time | Low | Low | Monitor build performance |
| Developer confusion | Medium | Medium | Comprehensive docs + training |
| Resistance to change | Low | Medium | Show benefits with examples |

---

## Success Metrics

### Week 1
- [ ] All documentation complete
- [ ] Design tokens file created
- [ ] Core components implemented

### Week 2
- [ ] All pages updated
- [ ] Visual consistency achieved
- [ ] No regressions found

### Week 3
- [ ] Component updates complete
- [ ] ESLint rules active
- [ ] Visual regression tests passing

### Final
- [ ] 95%+ consistency score
- [ ] Zero design token violations
- [ ] All documentation complete
- [ ] Team fully onboarded

---

## Next Steps

1. **Review this roadmap** with team/maintainers
2. **Prioritize tasks** based on feedback
3. **Create GitHub issues** for each task
4. **Begin Phase 1** implementation
5. **Schedule check-ins** for progress updates

---

## Related Documents

- [UX/UI Consistency Analysis](./ux-ui-consistency-analysis.md)
- [Design System Guide](./design-system.md)
- [Component Patterns](./component-patterns.md)
- [Design Tokens Source](../../src/lib/design-tokens.ts)

---

**Last Updated:** November 8, 2025  
**Next Review:** November 15, 2025
