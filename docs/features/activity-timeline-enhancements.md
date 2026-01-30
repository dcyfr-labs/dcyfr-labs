<!-- TLP:CLEAR -->

# Activity Timeline - Future Enhancements

**Status:** Future Consideration  
**Priority:** Low (Current implementation is production-ready)  
**Last Updated:** December 23, 2025

## Current Implementation

The Recent Activity section on the homepage uses:
- ✅ Intersection Observer for lazy loading
- ✅ Dynamic page-flow loading (no scrollable frame)
- ✅ Smooth animations with Framer Motion
- ✅ Progress indicators and loading states
- ✅ Mobile-first responsive design
- ✅ Design token compliance

**Files:**
- `src/components/home/infinite-activity-section.tsx`
- `src/hooks/use-infinite-activity.ts`

## Potential Enhancements

### 1. Time-Based Grouping

**Pattern:** Group activities by "Today", "Yesterday", "This Week"  
**Benefit:** Reduces cognitive load, easier to scan  
**Complexity:** Medium

```tsx
// Sticky time headers
<div className="sticky top-0 bg-background/95 backdrop-blur py-2 mb-4">
  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    Today
  </h3>
</div>
```

**Implementation:**
- Add grouping logic to `use-infinite-activity.ts`
- Insert time separator components between groups
- Sticky positioning for headers

---

### 2. "Back to Top" Button

**Pattern:** Global scroll-to-top for long feeds  
**Benefit:** Better navigation on mobile  
**Complexity:** Low

```tsx
// Show after scrolling past viewport height
{showBackToTop && (
  <Button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
    size="icon"
    variant="secondary"
  >
    <ArrowUp className="h-4 w-4" />
  </Button>
)}
```

**Implementation:**
- Add window scroll listener with throttling
- Show button after ~800px scroll
- Smooth scroll to top on click

---

### 3. Improved "Caught Up" Message

**Pattern:** Friendlier end-of-feed messaging  
**Benefit:** Better UX, less abrupt ending  
**Complexity:** Low

```tsx
// Replace current "End of activity" with:
<p className="text-center text-sm text-muted-foreground">
  You're all caught up! 🎉
  <br />
  <span className="text-xs">Check back later for more updates</span>
</p>
```

**Implementation:**
- Update end indicator in `infinite-activity-section.tsx`
- Add celebratory micro-animation (optional)

---

### 4. List Virtualization (Performance)

**Pattern:** Virtualize long lists with react-window  
**Benefit:** Maintain 60 FPS with 100+ items  
**Complexity:** High  
**When to implement:** Only if users consistently scroll through 100+ items

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={window.innerHeight}
  itemCount={items.length}
  itemSize={120}
  width="100%"
>
  {Row}
</FixedSizeList>
```

**Considerations:**
- Breaks natural page flow
- Adds dependency
- May conflict with Intersection Observer pattern
- **Recommend:** Only if performance monitoring shows issues

---

### 5. "New Items Available" Notification

**Pattern:** Show badge when new items load at top  
**Benefit:** Users know fresh content is available  
**Complexity:** Medium

```tsx
{hasNewItems && (
  <Button
    onClick={scrollToTop}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
    variant="secondary"
    size="sm"
  >
    {newItemsCount} new updates
  </Button>
)}
```

**Implementation:**
- Add polling or real-time updates
- Track unread count
- Smooth scroll to top on click

---

## Decision Log

**December 23, 2025:** Removed scrollable frame in favor of page-flow loading with Intersection Observer. Current implementation follows all core best practices from social timeline UX research.

**Recommendation:** Monitor user behavior before implementing enhancements. Current solution is production-ready and performant.

## References

- [Social Timeline UX Best Practices](https://www.b12.io/glossary-of-web-design-terms/infinite-scrolling/)
- [Infinite Scroll in Next.js](https://blog.logrocket.com/implementing-infinite-scroll-next-js-server-actions/)
- [React Performance Optimization](https://blog.sentry.io/react-js-performance-guide/)
