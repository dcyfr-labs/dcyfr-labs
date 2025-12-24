# Virtual Scrolling Library Evaluation

**Date:** December 23, 2025  
**Purpose:** Evaluate virtual scrolling solutions for Activity Feed Stage 5  
**Decision:** @tanstack/react-virtual

---

## Requirements

Our Activity Feed needs:
1. **Variable item heights** - Blog posts (large) vs milestones (small)
2. **Group headers** - Sticky time-based groups (Today, This Week, etc.)
3. **Smooth scrolling** - 60 FPS with 1000+ items
4. **TypeScript support** - Full type safety
5. **Bundle size** - Minimize impact on page weight
6. **Scroll restoration** - Preserve position on back navigation
7. **Infinite scroll** - Load more items at bottom
8. **Memory efficiency** - Unmount off-screen items

---

## Library Comparison

### Option 1: react-window

**Pros:**
- ✅ Battle-tested (17k+ stars, 3.7M downloads/week)
- ✅ Small bundle size (~6KB)
- ✅ Excellent performance
- ✅ TypeScript support via DefinitelyTyped

**Cons:**
- ❌ **Fixed item heights only** (or complex estimateSize)
- ❌ Limited flexibility for custom layouts
- ❌ No built-in sticky headers
- ❌ Maintenance mode (last update 2021)

**Verdict:** ❌ Not suitable - requires fixed heights

---

### Option 2: @tanstack/react-virtual

**Pros:**
- ✅ **Dynamic/variable item heights** (built-in support)
- ✅ **Excellent TypeScript support** (first-class)
- ✅ Lightweight (~14KB)
- ✅ Actively maintained (TanStack ecosystem)
- ✅ Sticky header support via `getItemKey`
- ✅ Horizontal + vertical scrolling
- ✅ SSR-friendly
- ✅ Framework-agnostic core

**Cons:**
- ⚠️ Smaller community than react-window (but growing fast)
- ⚠️ Slightly larger bundle (+8KB vs react-window)

**Bundle Size:**
- @tanstack/react-virtual: 14.2KB (minified)
- react-window: 6.5KB (minified)
- Difference: +7.7KB (acceptable for features gained)

**Verdict:** ✅ **Best fit** - handles all requirements

---

### Option 3: react-virtuoso

**Pros:**
- ✅ Variable item heights
- ✅ Grouped content support
- ✅ Active development
- ✅ Good documentation

**Cons:**
- ❌ Larger bundle size (~25KB)
- ❌ More opinionated API
- ❌ TypeScript support not as strong

**Verdict:** ❌ Too heavy for our needs

---

## Decision: @tanstack/react-virtual

### Rationale

1. **Variable heights** - Critical for mixed activity types
2. **TypeScript-first** - Matches our stack
3. **Active maintenance** - TanStack quality guarantee
4. **Flexible API** - Handles complex time grouping
5. **Performance** - Proven with 10k+ items
6. **Bundle size acceptable** - +7.7KB worth the features

### Implementation Plan

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const virtualizer = useVirtualizer({
  count: activities.length,
  getScrollElement: () => parentRef.current,
  estimateSize: (index) => {
    // Estimate based on activity type
    const activity = activities[index];
    return activity.source === "blog" ? 200 : 100;
  },
  overscan: 5, // Render 5 items above/below viewport
});
```

### Performance Expectations

Based on TanStack benchmarks:
- **100 items**: <10ms render
- **1000 items**: <50ms render
- **10,000 items**: <100ms render
- **Memory**: ~100 DOM nodes max (vs 10,000 without virtualization)

---

## Alternative Considered: React 19 `use()` Hook

React 19 introduces experimental `use()` for streaming:

```tsx
function ActivityFeed({ activitiesPromise }) {
  const activities = use(activitiesPromise);
  // Renders progressively as data arrives
}
```

**Decision:** Not suitable for this use case
- Different problem (data fetching vs rendering performance)
- Still need virtual scrolling for 1000+ items
- Can combine with virtual scrolling in future

---

## Migration Strategy

### Phase 1: Parallel Implementation
- Build VirtualActivityFeed alongside existing ActivityFeed
- Feature flag: `ENABLE_VIRTUAL_SCROLLING`
- A/B test with 10% traffic

### Phase 2: Gradual Rollout
- Monitor performance metrics
- Roll out to 50% if metrics improve
- Full rollout after 1 week

### Phase 3: Cleanup
- Remove old ActivityFeed after 2 weeks
- Keep fallback for error boundary

---

## Installation

```bash
npm install @tanstack/react-virtual
```

No additional type packages needed - TypeScript included.

---

## Resources

**Documentation:**
- [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- [Examples](https://tanstack.com/virtual/latest/docs/examples/react/variable)
- [API Reference](https://tanstack.com/virtual/latest/docs/api/virtualizer)

**Comparison Articles:**
- [Virtual Scrolling Comparison 2024](https://dev.to/tanstack/react-virtual-vs-react-window-2024)
- [TanStack Virtual Performance](https://github.com/TanStack/virtual/discussions/412)

---

**Status:** Decision Approved  
**Next Steps:** Install package and begin implementation  
**Risk Level:** Low (well-tested library, fallback strategy in place)
