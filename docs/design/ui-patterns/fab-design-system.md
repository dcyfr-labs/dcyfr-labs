<!-- TLP:CLEAR -->

# Floating Action Button (FAB) Design System

**Date:** November 4, 2025  
**Status:** ✅ Implemented  
**Related:** Back to Top · Table of Contents

---

## Overview

Unified design system for all floating action buttons (FABs) across the site. Ensures consistent size, spacing, animations, and behavior for optimal mobile and desktop UX.

---

## Design Specifications

### Size & Shape
```
Standard FAB Size: 56px × 56px (h-14 w-14)
- Exceeds WCAG AAA 44px minimum touch target
- Visually balanced without overwhelming content
- Large enough for comfortable thumb reach
- Consistent with Material Design FAB specs

Shape: Circular (rounded-full)
Icon Size: 24px × 24px (h-6 w-6)
```

### Positioning
```
Base Position: bottom-24 right-4 (96px from bottom, 16px from right)
- Provides clearance above 64px footer + margin
- Safe distance from screen edges
- Avoids iOS bottom bar / Android navigation
- Thumb-friendly zone (right-handed users)
- Ensures FABs never overlap with site footer

Stacking (when multiple FABs):
- Primary FAB (Back to Top): bottom-24 (96px from bottom)
- Secondary FAB (TOC): bottom-[168px] (168px from bottom)
- Vertical spacing: 72px between FABs
- Both FABs remain visible above footer when scrolled to bottom
```

### Z-Index Hierarchy
```
z-40: FAB buttons (below modals, above content)
z-50: Sheets/Drawers
z-60: Dialogs/Modals
```

### Colors & Variants
```
Primary FAB: variant="default" (primary color)
Secondary FAB: variant="secondary" (muted)
Icon color: Inherits from variant
```

### Shadows
```
Default: shadow-lg (0 10px 15px -3px rgba(0, 0, 0, 0.1))
Hover: shadow-xl (0 20px 25px -5px rgba(0, 0, 0, 0.1))
Transition: transition-shadow (smooth shadow change)
```

### Animation System

#### Entry/Exit Animation
```typescript
// Framer Motion configuration
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.8 }}
transition={{ duration: 0.2, ease: "easeOut" }}
```

**Why scale + opacity:**
- Feels natural (grows from center point)
- Doesn't cause layout shift
- GPU-accelerated (transform + opacity)
- Smooth on all devices

**Duration:** 200ms (0.2s)
- Fast enough to feel responsive
- Slow enough to be noticeable
- Consistent with Material Design timing

### Scroll Behavior

#### Scroll Threshold
```typescript
Show FAB when: window.scrollY > 400
// Approximately 1.5 viewports on average screens
```

**Why 400px:**
- User has clearly scrolled (intentional navigation)
- Avoids flickering on small scrolls
- Consistent across all FABs
- Works well on mobile and desktop

#### Scroll Listener
```typescript
window.addEventListener("scroll", handleScroll, { passive: true });
```

**Passive listener:**
- Better scroll performance
- Doesn't block scrolling
- Browser can optimize rendering

---

## Current FAB Implementations

### 1. BackToTop (Blog Posts Only)

**Location:** `src/components/back-to-top.tsx`  
**Visibility:** Individual blog post pages only (`/blog/[slug]`)  
**Hidden on:** Homepage, `/blog` list, `/projects`, and other pages  
**Position:** `bottom-24 right-4` (96px from bottom for footer clearance)

```tsx
<motion.div className="fixed bottom-24 right-4 z-40">
  <Button
    variant="secondary"
    size="icon"
    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
  >
    <ArrowUp className="h-6 w-6" />
  </Button>
</motion.div>
```

**Features:**
- Shows only on individual blog post pages
- Appears after 400px scroll threshold
- Framer Motion animation
- Smooth scroll to top
- 56px circular button
- Secondary variant (muted)
- Positioned above footer (never overlaps)
- Uses `usePathname()` to detect blog post pages

---

### 2. Table of Contents FAB (Blog Posts Only)

**Location:** `src/components/table-of-contents.tsx`  
**Visibility:** Mobile/tablet only (< XL breakpoint)  
**Position:** `bottom-[168px] right-4` (above BackToTop with footer clearance)

```tsx
<motion.div className="fixed bottom-[168px] right-4 z-40">
  <Button
    size="icon"
    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
  >
    <Menu className="h-6 w-6" />
  </Button>
</motion.div>
```

**Features:**
- Shows after 400px scroll (same as BackToTop)
- Framer Motion animation (consistent)
- Opens Sheet drawer with TOC
- 56px circular button
- Primary variant (prominent)
- Auto-hides on desktop (becomes fixed sidebar)

**Positioning Rationale:**
- `bottom-[168px]` (168px) places it above BackToTop with footer clearance
- 72px vertical spacing prevents thumb overlap
- Both FABs visible above 64px footer when scrolled to bottom
- TOC is primary action on blog posts (more prominent)

---

## Spacing & Layout

### Visual Layout (Mobile Blog Post)

```
┌─────────────────────────┐
│                         │
│   Blog Post Content     │
│                         │
│                         │
│                         │
│                    [☰]  │ ← TOC FAB (bottom-[168px])
│                         │ ← 72px spacing
│                    [↑]  │ ← BackToTop (bottom-24)
│─────────────────────────│
│   Footer (64px)         │ ← Footer never overlaps FABs
└─────────────────────────┘
    16px edge margin (right-4)
```

### Footer Clearance

**Critical spacing considerations:**
1. Footer is 64px tall (h-16)
2. BackToTop at `bottom-24` (96px) provides 32px clearance above footer
3. TOC at `bottom-[168px]` (168px) maintains 72px spacing above BackToTop
4. Both FABs remain fully visible and accessible when scrolled to page bottom
5. No overlap with footer content or links

### Collision Avoidance

**No conflicts because:**
1. TOC only shows on blog posts (< XL breakpoint)
2. BackToTop is global but respects vertical spacing and footer
3. Both use same right-side positioning (consistent)
4. 72px vertical gap prevents touch target overlap
5. Footer clearance prevents overlap at bottom of long pages
```

---

## Responsive Behavior

### Mobile (< 768px)
- Both FABs visible (if applicable)
- 56px size optimal for thumb reach
- 16px edge margin safe from swipe gestures

### Tablet (768px - 1279px)
- Same as mobile for blog posts
- Single BackToTop on other pages

### Desktop (≥ 1280px)
- TOC becomes fixed sidebar (no FAB)
- Only BackToTop FAB visible
- Smaller relative screen size, still prominent

---

## Accessibility

### Touch Targets
- ✅ 56px exceeds WCAG AAA 44px minimum
- ✅ Sufficient spacing between FABs (64px)
- ✅ No overlapping interactive areas

### Screen Readers
```tsx
aria-label="Scroll to top"        // BackToTop
aria-label="Open table of contents" // TOC FAB
```

### Keyboard Navigation
- Buttons are focusable via Tab
- Enter/Space activates button
- Escape closes Sheet drawer (TOC)

### Motion Preferences
```tsx
// Framer Motion respects prefers-reduced-motion
// Animations are GPU-accelerated for smoothness
```

---

## Performance Considerations

### Event Listeners
```typescript
// Passive listeners don't block scrolling
window.addEventListener("scroll", handleScroll, { passive: true });

// Cleanup prevents memory leaks
return () => window.removeEventListener("scroll", handleScroll);
```

### Animations
- Transform and opacity are GPU-accelerated
- No layout recalculation during animation
- 200ms duration is optimal (not too fast/slow)

### Re-renders
- State updates only on visibility change (threshold crossed)
- No continuous scroll position tracking
- Minimal performance impact

---

## Usage Guidelines

### When to Add a New FAB

**Consider:**
- Is this a primary, frequent action?
- Does it need to be always accessible?
- Can it be combined with existing FAB?

**Avoid:**
- More than 2 FABs visible at once
- FABs for secondary actions
- FABs that duplicate header navigation

### Adding a New FAB

1. **Choose Position:**
   - Primary action: `bottom-4 right-4`
   - Secondary action: `bottom-20 right-4` (if primary exists)
   - Tertiary: Consider FAB menu pattern instead

2. **Use Standard Size:**
   ```tsx
   className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
   ```

3. **Use Standard Animation:**
   ```tsx
   <motion.div
     initial={{ opacity: 0, scale: 0.8 }}
     animate={{ opacity: 1, scale: 1 }}
     exit={{ opacity: 0, scale: 0.8 }}
     transition={{ duration: 0.2, ease: "easeOut" }}
   >
   ```

4. **Use Standard Threshold:**
   ```typescript
   setIsVisible(window.scrollY > 400);
   ```

5. **Choose Variant:**
   - Primary action: `variant="default"`
   - Secondary action: `variant="secondary"`

### FAB Menu Pattern (Future)

If needing 3+ actions:
```
         [☰] TOC
          ↑
         [+] Main FAB (expands to show others)
          ↑
         [↑] Back to Top
```

---

## Testing Checklist

### Visual Testing
- [ ] FAB appears after 400px scroll
- [ ] Correct size (56px × 56px)
- [ ] Correct position (per spec)
- [ ] Smooth animation (200ms)
- [ ] Shadow transitions on hover
- [ ] No layout shift on appear/disappear

### Functional Testing
- [ ] Tap/click triggers correct action
- [ ] Scroll listener works (passive)
- [ ] Animation respects reduced motion
- [ ] Works on iOS bottom bar
- [ ] Works on Android gesture nav

### Responsive Testing
- [ ] Mobile: FABs visible, properly spaced
- [ ] Tablet: Same as mobile
- [ ] Desktop: Appropriate FABs shown
- [ ] No overlap at any breakpoint

### Accessibility Testing
- [ ] Touch targets ≥ 44px (we use 56px)
- [ ] Screen reader announces correctly
- [ ] Keyboard navigation works
- [ ] Focus visible on Tab
- [ ] Color contrast sufficient

---

## Future Enhancements

### Potential Additions
- 🔮 FAB menu for multiple actions
- 🔮 Haptic feedback on tap (mobile)
- 🔮 Toast notification on action
- 🔮 Drag-to-reposition (advanced)
- 🔮 Context-aware FABs (based on page)

### Considerations
- Keep total FABs ≤ 2 visible simultaneously
- Maintain consistent design language
- Test on real devices before shipping
- Monitor analytics for usage patterns

---

## References

- [Material Design - FAB Spec](https://m3.material.io/components/floating-action-button/specs)
- [WCAG 2.2 - Touch Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [iOS Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

## Change Log

### November 4, 2025
- ✅ Unified BackToTop and TOC FAB designs
- ✅ Standardized size to 56px (h-14 w-14)
- ✅ Consistent Framer Motion animations
- ✅ Synchronized scroll threshold (400px)
- ✅ Standardized positioning system
- ✅ Improved shadow transitions
- ✅ Updated icon sizes to 24px (h-6 w-6)
```
