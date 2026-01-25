{/* TLP:CLEAR */}

# Header Clearance Best Practices

## Overview

This document defines the spacing standards for header and content padding to ensure consistent, professional visual rhythm across the site.

## Design Rationale

The site header uses `position: sticky` and sits at `top-0` with no additional margin. The dev banner (when visible) is positioned in the document flow and naturally pushes the header down. Content padding provides appropriate separation between the header and page content.

## Spacing Values

### Header Position

- **Position**: `sticky top-0` (no top margin)
- **Dev Banner**: Positioned in document flow, scrolls out of view naturally
- **Location**: `src/components/navigation/site-header.tsx:68`

**Implementation**: The header has no conditional logic or banner detection - it simply sticks to the top of the viewport. The dev banner exists in the normal document flow above the header.

### Hero Content Top Padding

- **Mobile**: `pt-6` (24px / 1.5rem)
- **Tablet**: `md:pt-8` (32px / 2rem)
- **Desktop**: `lg:pt-10` (40px / 2.5rem)

**Location**: `src/lib/design-tokens.ts:1767`

**Applied universally across:**

- Standard pages (`page-layout.tsx`, `page-hero.tsx`)
- Blog posts (`blog/[slug]/page.tsx`, `blog/[...slug]/page.tsx`)
- Project pages (`work/[slug]/page.tsx`)
- Documentation (`docs-layout.tsx`)

## Design Guidelines

The spacing uses **document flow positioning** with **consistent content padding**:

```text
Document Flow (development):
[Dev Banner] → pushes down everything below
[Sticky Header] → sticks to top-0
[Content with pt-6/8/10] → consistent spacing

Scroll Behavior:
User scrolls → banner scrolls out of view
Header remains sticky at top-0
Content spacing unchanged (pt-6/8/10)
```

This approach creates optimal spacing:

- **Document flow** eliminates complex conditional logic
- **Natural scrolling** provides familiar, predictable behavior
- **Consistent content padding** maintains uniform spacing across all pages
- **Simplified implementation** reduces maintenance and testing overhead

## Why This Approach?

1. **Simplicity**: No conditional logic, state management, or banner detection required
2. **Natural Behavior**: Banner scrolls out of view like any normal page element
3. **Predictable**: Users understand scrolling behavior intuitively
4. **Maintainable**: Fewer edge cases, simpler testing, less complex code
5. **Consistent Content Spacing**: Uniform pt-6/8/10 across all page types ensures predictable layout

## Implementation

### Universal Content Padding (all pages)

All page types now use consistent spacing:

```typescript
// Standard Hero (PAGE_LAYOUT.hero.container)
pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12

// Archive Hero (PAGE_LAYOUT.archiveHero.container)
pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12

// Archive Hero Variants - all use same top padding
padding.full: "pt-6 md:pt-8 lg:pt-10 pb-12 md:pb-16 lg:pb-20"
padding.medium: "pt-6 md:pt-8 lg:pt-10 pb-10 md:pb-14"
padding.minimal: "pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12"

// Blog Posts (blog/[slug]/page.tsx, blog/[...slug]/page.tsx)
pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12

// Project Pages (work/[slug]/page.tsx)
pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12

// Documentation (docs-layout.tsx)
pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-12
```

### Header Implementation

```typescript
// src/components/navigation/site-header.tsx
<header
  className={cn(
    "sticky top-0 z-40 site-header transition-colors",
    ANIMATION.duration.fast,
    hasScrolled
      ? "backdrop-blur supports-backdrop-filter:bg-background/60 border-b"
      : "bg-transparent"
  )}
>
```

### Dev Banner (Document Flow)

```typescript
// src/components/features/dev-banner.tsx
<div
  role="region"
  aria-label="Dev Banner"
  className={cn(
    "w-full bg-background transition-all",
    ANIMATION.duration.standard,
    isAnimating ? "opacity-0 -translate-y-full" : "opacity-100 translate-y-0"
  )}
>
```

## Scroll Behavior

The site header has scroll-aware behavior that adds a border when scrolled past the header height:

```typescript
// Threshold calculation in site-header.tsx (lines 45-52)
const handleScroll = () => {
  const isMobile = window.innerWidth < 768;
  const threshold = isMobile ? 56 : 64; // h-14 = 56px, md:h-16 = 64px

  const scrolled = window.scrollY > threshold;
  setHasScrolled(scrolled);
};

// Threshold values:
// Mobile:  56px (h-14)
// Tablet+: 64px (md:h-16)
```

The dev banner scrolls out of view naturally as part of the page content. No special logic is required to handle its presence or absence.

## Related Documentation

- [Design Tokens](../../src/lib/design-tokens.ts) - Source of truth for spacing values
- [Site Header](../../src/components/navigation/site-header.tsx) - Header implementation
- [Page Layout](../../src/components/layouts/page-layout.tsx) - Page wrapper implementation

## Migration Notes

**Phase 1: Initial Reduction** (First optimization)

- Header margin: `mt-8 md:mt-12 lg:mt-16` (32px/48px/64px)
- Hero padding: `pt-16 md:pt-24 lg:pt-32` → `pt-4 md:pt-6 lg:pt-8` (75% reduction)
- Issue: Static header margin didn't account for banner state

**Phase 2: Conditional Header Margin** (Banner state detection)

- Header margin: Conditional `mt-16/20/24` (with banner) or `mt-0` (without)
- Hero padding: `pt-4 md:pt-6 lg:pt-8` → `pt-6 md:pt-8 lg:pt-10` (slight increase for balance)
- Issue: Complex logic, state management, hydration challenges

**Phase 3: Universal Consistency** (Content spacing standardization - December 2025)

- Standardized all pages to use `pt-6 md:pt-8 lg:pt-10`
- Updated 6+ files across blog, projects, docs
- Maintained conditional header margin logic

**Phase 4: Document Flow Refactor** (Final simplification - December 2025)

- **Removed** all conditional header margin logic
- **Repositioned** dev banner from `position: fixed` to document flow
- **Simplified** header to `sticky top-0` with no margin
- **Updated files:**
  - `src/components/features/dev-banner.tsx` - Document flow positioning with slide-up animation
  - `src/components/navigation/site-header.tsx` - Removed banner detection and conditional margin

**Final Benefits:**

- Eliminated complex conditional logic and state management
- Natural, predictable scrolling behavior
- Simpler implementation with fewer edge cases
- Uniform content spacing across all page types (pt-6/8/10)
- Easier to test and maintain
- Consistent, predictable user experience

## Testing Checklist

When modifying header or content spacing:

- [ ] Verify dev banner appears in development mode
- [ ] Test banner dismiss animation (slide-up + fade)
- [ ] Confirm banner scrolls out of view naturally
- [ ] Test scroll behavior - border appears at correct threshold (56px mobile, 64px desktop)
- [ ] Check all breakpoints (mobile, tablet, desktop)
- [ ] Verify content spacing feels balanced (pt-6/8/10)
- [ ] Ensure sticky header remains at top-0 during scroll
- [ ] Test on different viewport heights
- [ ] Verify spacing consistency across all page types (home, blog, projects, docs)

## Common Mistakes to Avoid

❌ **Don't** add conditional logic or state management to the header for banner positioning
✅ **Do** use document flow and let the browser handle layout naturally

❌ **Don't** use `position: fixed` or `position: absolute` for banners that should push content
✅ **Do** use document flow positioning for banners that affect layout

❌ **Don't** add top margin to the sticky header
✅ **Do** keep header at `sticky top-0` with no margin

❌ **Don't** use different padding values for different page types
✅ **Do** use consistent universal padding (pt-6/8/10) across all pages

## References

- [Refactoring UI - Spacing Systems](https://www.refactoringui.com/)
- [Material Design - Layout Metrics](https://material.io/design/layout/understanding-layout.html)
- [Nielsen Norman Group - Whitespace](https://www.nngroup.com/articles/whitespace-in-design/)
