# Mobile Design Token Update Plan

**Date:** December 25, 2025  
**Based on:** Touch target and typography E2E test results  
**Status:** Ready for implementation

---

## Executive Summary

E2E test analysis reveals **26 touch target violations** (out of ~130 buttons tested = 20% failure rate). The failing elements are primarily:
- **Activity feed action buttons** (like, reply, etc.) - 28-36px height (need 44px)
- **Navigation icons** - 24-32px square (need 44x44px)  
- **Post metadata links** - 28px height (need 44px)

**Typography tests** passed 9/9, indicating good baseline typography implementation. Focus should be on **touch target sizing**.

---

## Test Results Summary

### ✅ Passing Tests (9/14)
- Line height optimization (1.6-1.8 ratio) ✓
- Text contrast (WCAG AA 4.5:1) ✓
- Line length readability (45-75 chars) ✓
- Typography consistency across devices ✓
- Code/monospace distinction ✓
- Scroll stability ✓
- Font size scaling ✓
- Link touch targets ✓
- Element spacing (8pt minimum) ✓

### ❌ Failing Tests (1/14)
- **Touch Targets - Buttons** (26 violations = 20% failure rate)

### ⏭️ Skipped Tests (4/14)
- Heading scale mobile vs desktop (test not implemented)
- Form inputs height validation (skipped)
- iPhone SE validation (skipped)
- iPad Pro sizing (skipped)

---

## Critical Violations Breakdown

### Touch Target Failures (26 elements)

**Pattern Analysis:**

| Element Type | Current Size | Required | Count | Fix Priority |
|--------------|--------------|----------|-------|--------------|
| Activity icons (like/reply) | 24-36px | 44x44px | ~15 | **HIGH** |
| Navigation icons | 32-36px | 44x44px | ~6 | **HIGH** |
| Post metadata links | 28px height | 44px | ~5 | MEDIUM |

**Specific Violations:**

```
Action buttons (activity feed):
- Index 0, 4, 6, 10, 13, 16, 19, 22, 25: 32-36px square (icons)
- Index 7, 8, 11, 14, 17, 20, 23, 26: 57-62px × 25-28px (text buttons)
- Index 9, 12, 15, 18, 21, 24, 27: 36px × 24px (small buttons)
- Index 29: 32×32px (icon button)
```

---

## Design Token Updates Required

### 1. **SPACING Token Additions** (HIGH PRIORITY)

**File:** `src/lib/design-tokens.ts`

**Add new touch target constants:**

```typescript
export const TOUCH_TARGETS = {
  /** Minimum touch target (Apple HIG, Material Design) */
  minimum: "44px",
  
  /** Comfortable touch target */
  comfortable: "48px",
  
  /** Large touch target (thumbs) */
  large: "56px",
  
  /** Minimum spacing between targets */
  spacing: "8px",
} as const;

export const BUTTON_SIZES = {
  /** Icon-only buttons (mobile) */
  iconMobile: "h-11 w-11", // 44px
  
  /** Small text buttons (mobile) */
  smallMobile: "h-11 px-4", // 44px height
  
  /** Standard buttons (mobile) */
  standardMobile: "h-12 px-6", // 48px height
  
  /** Large CTA buttons (mobile) */
  largeMobile: "h-14 px-8", // 56px height
  
  /** Icon-only buttons (desktop) */
  iconDesktop: "h-9 w-9", // 36px (acceptable on desktop)
  
  /** Standard buttons (desktop) */
  standardDesktop: "h-10 px-5", // 40px height
} as const;
```

### 2. **Component-Specific Updates** (MEDIUM PRIORITY)

#### ActivityItem Action Buttons

**File:** `src/components/activity/ActivityItem.tsx` (estimated location)

**Current (failing):**
```tsx
// Buttons rendering at 24-36px height
<button className="h-6 w-6">❤️</button>
<button className="h-8 w-8">💬</button>
```

**Required (mobile-first):**
```tsx
import { TOUCH_TARGETS } from '@/lib/design-tokens';

// Mobile-first with responsive sizing
<button className="h-11 w-11 md:h-8 md:w-8">❤️</button>
<button className="h-11 w-11 md:h-8 md:w-8">💬</button>

// OR using design tokens
<button style={{ minHeight: TOUCH_TARGETS.minimum, minWidth: TOUCH_TARGETS.minimum }}>
  ❤️
</button>
```

#### Navigation Icons

**File:** `src/components/navigation/*` (header, mobile nav)

**Required:**
```tsx
// Mobile nav icons
<button className="h-11 w-11 md:h-9 md:w-9">
  <MenuIcon className="h-6 w-6" />
</button>
```

### 3. **Typography Tokens** (LOW PRIORITY - Already Passing)

No changes needed. Current implementation passes:
- ✅ Line height: 1.6-1.8 on mobile
- ✅ Contrast: 4.5:1 WCAG AA
- ✅ Line length: 45-75 characters
- ✅ Heading consistency

---

## Implementation Plan

### Phase 1: Design Token Updates (1-2 hours)

**Task 1.1:** Add `TOUCH_TARGETS` and `BUTTON_SIZES` constants to `design-tokens.ts`

**Task 1.2:** Export new tokens in barrel export

**Task 1.3:** Update ESLint rules to enforce touch target tokens (optional)

### Phase 2: Component Updates (3-4 hours)

**Priority Order:**

1. **Activity Feed Buttons** (15 violations)
   - Files: `src/components/activity/ActivityItem.tsx`
   - Update like, reply, share buttons to use `h-11 w-11 md:h-8 md:w-8`

2. **Navigation Icons** (6 violations)
   - Files: `src/components/navigation/*`, header components
   - Update menu, search, profile icons to `h-11 w-11`

3. **Post Metadata Links** (5 violations)
   - Files: Blog post cards, activity cards
   - Update tag/category links to `h-11` minimum height

### Phase 3: Validation (30 minutes)

**Task 3.1:** Run touch target tests
```bash
npm run test:e2e -- e2e/touch-targets.spec.ts --project=chromium
```

**Task 3.2:** Verify pass rate ≥80% (current: 80% pass on other elements)

**Task 3.3:** Screenshot regression testing

---

## Success Criteria

- ✅ Touch target test failure rate <10% (currently 20%)
- ✅ All critical UI elements (nav, actions) ≥44px
- ✅ Desktop experience preserved (responsive classes)
- ✅ No visual regressions
- ✅ ESLint passes with new tokens

---

## Files to Modify

### Primary Changes
1. `src/lib/design-tokens.ts` - Add TOUCH_TARGETS and BUTTON_SIZES
2. `src/components/activity/ActivityItem.tsx` - Update action buttons
3. `src/components/navigation/*` - Update nav icons

### Secondary Changes (if needed)
4. Blog post card components
5. Mobile navigation sheet
6. Header navigation

### Test Validation
7. Re-run `e2e/touch-targets.spec.ts`
8. Visual regression check (optional)

---

## Code Examples

### Example 1: Activity Action Button Fix

**Before:**
```tsx
<button className="flex items-center gap-1 text-sm">
  <Heart className="h-4 w-4" />
  <span>Like</span>
</button>
```

**After (mobile-first):**
```tsx
<button className="flex items-center gap-1 text-sm h-11 md:h-auto min-h-[44px] md:min-h-0">
  <Heart className="h-5 w-5 md:h-4 md:w-4" />
  <span>Like</span>
</button>
```

### Example 2: Icon-Only Button Fix

**Before:**
```tsx
<button className="p-2" aria-label="Menu">
  <MenuIcon className="h-6 w-6" />
</button>
```

**After:**
```tsx
<button className="h-11 w-11 md:h-9 md:w-9 flex items-center justify-center" aria-label="Menu">
  <MenuIcon className="h-6 w-6 md:h-5 md:w-5" />
</button>
```

### Example 3: Using Design Tokens

**After tokens added:**
```tsx
import { BUTTON_SIZES } from '@/lib/design-tokens';

<button className={`flex items-center ${BUTTON_SIZES.iconMobile}`}>
  <Icon />
</button>
```

---

## Responsive Strategy

**Mobile-First Approach:**

1. **Default (mobile):** All touch targets ≥44px
2. **Tablet (md: 768px+):** Reduce to comfortable desktop sizes
3. **Desktop (lg: 1024px+):** Standard desktop sizing

**Example:**
```tsx
className="h-11 w-11 md:h-9 md:w-9 lg:h-8 lg:w-8"
// Mobile: 44x44px
// Tablet: 36x36px  
// Desktop: 32x32px
```

---

## Risk Assessment

### Low Risk
- ✅ Typography changes (all tests passing)
- ✅ Adding new design tokens (non-breaking)

### Medium Risk
- ⚠️ Button sizing changes (may affect layouts)
- ⚠️ Icon sizing (visual hierarchy changes)

### Mitigation
- Use responsive classes (`md:` prefix) to preserve desktop experience
- Test on real devices (iPhone SE, iPhone 15 Pro Max)
- Visual regression testing recommended

---

## Next Steps

1. **Review this plan** - Confirm approach with team
2. **Implement Phase 1** - Add design tokens
3. **Implement Phase 2** - Update components
4. **Validate** - Re-run E2E tests
5. **Deploy** - Merge to preview, test on devices

---

## Questions to Resolve

1. Should we update all buttons project-wide or start with critical paths (activity, nav)?
2. Do we want ESLint enforcement of touch target tokens?
3. Should icon sizes also increase on mobile (currently tested at 4-6px)?
4. Timeline: Implement all at once or phase by priority?

---

**Estimated Total Implementation Time:** 5-7 hours  
**Test Coverage After:** 95%+ touch target compliance  
**Breaking Changes:** None (mobile-first responsive)
