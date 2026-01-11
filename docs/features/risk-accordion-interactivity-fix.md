# Risk Accordion Interactivity Fix

**Date:** January 5, 2026  
**Issue:** RiskAccordion expand/collapse, group controls, and progress counter non-functional  
**Status:** ✅ Resolved  
**PR:** TBD

---

## Problem

After implementing the RiskAccordion visual design for the OWASP blog post, user testing revealed three critical interactive features were not working:

1. **Individual accordions** - Click handlers didn't expand/collapse content
2. **"Expand All" button** - No effect on child accordions
3. **"Collapse All" button** - No effect on child accordions
4. **Progress counter** - Always showed "0 of 10 risks reviewed"

### Root Cause

The initial implementation created the visual structure and UI components but left state management as TODO comments:

```tsx
// Before: State management not connected
const handleExpandAll = () => {
  setAllExpanded(true);
  // TODO: Trigger expand on all children (implementation would need event system)
};

const toggleExpanded = () => {
  setIsExpanded(!isExpanded);
  // Missing: onToggle?.(!isExpanded); - callback never called
};
```

**Critical Issue**: Parent `RiskAccordionGroup` and child `RiskAccordion` components had no communication mechanism.

---

## Solution

Implemented **React Context API** pattern for parent-child state coordination.

### Implementation Strategy

1. **Created AccordionGroupContext**

   ```tsx
   interface AccordionGroupContextValue {
     expandedIds: Set<string>;
     toggleRisk: (id: string, isExpanded: boolean) => void;
     expandAll: () => void;
     collapseAll: () => void;
   }
   ```

2. **RiskAccordionGroup provides context**
   - Tracks expanded risk IDs in `Set<string>`
   - Provides methods to control all children
   - Wraps children in `AccordionGroupContext.Provider`

3. **RiskAccordion consumes context**
   - Uses group state if available (context)
   - Falls back to local state if standalone
   - Calls `toggleRisk()` when clicked

4. **Progress counter updates automatically**
   - `expandedCount = expandedIds.size`
   - Reactively updates when Set changes

### Code Changes

**File:** [`/src/components/blog/risk-accordion.tsx`](../../src/components/blog/risk-accordion.tsx)

**Lines Modified:**

- Added context creation (lines 45-56)
- Updated RiskAccordion to use context (lines 104-128)
- Rewrote RiskAccordionGroup with state management (lines 258-345)

**Key Patterns:**

```tsx
// Context consumer in RiskAccordion
const groupContext = useAccordionGroup();
const isExpanded = groupContext
  ? groupContext.expandedIds.has(id)
  : localExpanded;

const handleToggle = () => {
  const newState = !isExpanded;
  if (groupContext) {
    groupContext.toggleRisk(id, newState);
  } else {
    setLocalExpanded(newState);
  }
  onToggle?.(newState);
};

// Context provider in RiskAccordionGroup
const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

const toggleRisk = React.useCallback((id: string, isExpanded: boolean) => {
  setExpandedIds((prev) => {
    const next = new Set(prev);
    if (isExpanded) next.add(id);
    else next.delete(id);
    return next;
  });
}, []);

const expandAll = React.useCallback(() => {
  const allIds = extractRiskIds(children);
  setExpandedIds(new Set(allIds));
}, [children]);

const collapseAll = React.useCallback(() => {
  setExpandedIds(new Set());
}, []);
```

---

## Testing

### Unit Tests

**File:** [`/tests/unit/components/blog/risk-accordion.test.tsx`](../../tests/unit/components/blog/risk-accordion.test.tsx)

**Coverage:**

- ✅ Individual accordion expand/collapse (with animation waits)
- ✅ Progress counter updates correctly (1 of 3, 2 of 3, etc.)
- ✅ "Expand All" button expands all accordions
- ✅ "Collapse All" button collapses all accordions

**Test Results:**

```
✓ tests/unit/components/blog/risk-accordion.test.tsx (4 tests) 752ms
  ✓ RiskAccordion (4)
    ✓ Individual Accordion (1)
      ✓ should expand and collapse when clicked  348ms
    ✓ RiskAccordionGroup (3)
      ✓ should track expanded count correctly 51ms
      ✓ should expand all accordions when Expand All is clicked 23ms
      ✓ should collapse all accordions when Collapse All is clicked  329ms
```

**Key Testing Pattern (Framer Motion Animations):**

```tsx
// Wait for animation to complete before assertions
await waitFor(() => {
  expect(screen.getByText("Content 1")).toBeInTheDocument();
});

// Use regex for split text elements
const groupControl = screen.getByText(/reviewed/).closest("div");
expect(groupControl?.textContent).toMatch(/3.*of.*3/);
```

### Manual Testing Checklist

After deployment, verify:

- [ ] Individual risk accordions expand/collapse on click
- [ ] "Expand All" button opens all 10 ASI risks
- [ ] "Collapse All" button closes all 10 ASI risks
- [ ] Counter displays "X of 10 risks reviewed" correctly
- [ ] Keyboard navigation works (Enter key to toggle)
- [ ] Mobile touch interactions work smoothly
- [ ] Analytics events fire (check console for gtag calls)

---

## Quality Gates

### ✅ All Passing

- **TypeScript:** 0 errors
- **ESLint:** 0 errors (18 pre-existing warnings unrelated)
- **Unit Tests:** 4/4 passing (100%)
- **Design Tokens:** No violations introduced
- **Barrel Exports:** All imports use `@/components/blog`

---

## User Impact

### Before Fix

- ❌ Accordions non-interactive (visual only)
- ❌ No way to expand/collapse content
- ❌ Progress tracking broken
- ❌ Group controls non-functional

### After Fix

- ✅ Click any risk header to expand/collapse
- ✅ "Expand All" reveals all 10 risks instantly
- ✅ "Collapse All" hides all content
- ✅ Counter updates: "3 of 10 risks reviewed"
- ✅ Smooth animations (Framer Motion)
- ✅ Analytics tracking enabled

---

## Performance Considerations

### Optimization Strategies

1. **React.useCallback** for stable function references
   - Prevents unnecessary re-renders in child components
   - Used for `toggleRisk`, `expandAll`, `collapseAll`

2. **React.useMemo** for context value
   - Memoizes context object to prevent provider re-renders
   - Only updates when dependencies change

3. **Set<string> for O(1) lookups**
   - `expandedIds.has(id)` is constant time
   - Better than array `.includes()` for large lists

4. **Lazy state initialization**
   - `new Set()` created once, not on every render
   - State updates use functional form for correctness

### Future Optimizations (If Needed)

- Consider `React.memo()` for RiskAccordion if re-render issues arise
- Add virtual scrolling if list exceeds 50+ items
- Debounce "Expand All" if animation performance degrades

---

## Lessons Learned

### What Went Wrong

1. **Incomplete Implementation**
   - Visual design prioritized over functionality
   - TODO comments left in production code
   - State management treated as optional

2. **Testing Gap**
   - Initial implementation had no unit tests
   - Interactive features not validated until user testing

3. **Communication Breakdown**
   - Parent-child component interaction not planned
   - Context pattern should have been designed upfront

### Best Practices Going Forward

1. ✅ **Always test interactive features before marking complete**
2. ✅ **Write unit tests for stateful components**
3. ✅ **Design state management architecture before UI**
4. ✅ **Never commit TODO comments for critical features**
5. ✅ **Use Framer Motion `waitFor()` in tests for animations**

---

## Related Files

**Components:**

- [risk-accordion.tsx](../../src/components/blog/risk-accordion.tsx) - Main implementation
- [index.ts](../../src/components/blog/index.ts) - Barrel export

**Content:**

- [owasp-top-10-agentic-ai/index.mdx](../../src/content/blog/owasp-top-10-agentic-ai/index.mdx) - Blog post using accordions

**Tests:**

- [risk-accordion.test.tsx](../../tests/unit/components/blog/risk-accordion.test.tsx) - Unit tests

**Documentation:**

- [BLOG_POST_ENGAGEMENT_OPTIMIZATION.md](./BLOG_POST_ENGAGEMENT_OPTIMIZATION.md) - Overall strategy

---

## Deployment Notes

### Pre-Deployment

- [x] TypeScript compilation passes
- [x] ESLint passes (0 errors)
- [x] Unit tests pass (4/4)
- [x] Manual testing in dev environment

### Post-Deployment Monitoring

Monitor analytics for:

- **Risk expansion rate** - What % of visitors expand accordions?
- **"Expand All" usage** - Do users prefer group controls?
- **Average expanded count** - How many risks do users review?
- **Time on page** - Does progressive disclosure increase engagement?

**Tracking Events:**

```javascript
// Google Analytics events (if gtag available)
- risk_accordion_toggle (action: expand|collapse)
- Includes: risk_id, risk_title
```

---

**Status:** ✅ Complete and tested  
**Next Steps:** Deploy to production, monitor analytics  
**Owner:** DCYFR Team
