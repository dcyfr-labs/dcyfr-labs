<!-- TLP:CLEAR -->

# Spacing Standards - Quick Reference

**Last Updated:** November 5, 2025  
**Status:** ✅ Active Standard

Quick reference guide for consistent spacing across the site. See `/docs/design/spacing-audit-2025.md` for full details.

## Page-Level Spacing

```tsx
// Page wrapper
<div className="py-12 md:py-16">              // Standard page padding
<div className="px-4 sm:px-6 md:px-8">        // Standard horizontal padding

// Between major sections
<div className="space-y-8">                    // Standard spacing
<div className="space-y-10">                   // For distinct sections
<section className="mt-10 md:mt-12">          // Section margins

// ❌ AVOID
<div className="space-y-12">                   // Too generous
<section className="mt-12 md:mt-16">          // Too large
```

## Card Spacing

```tsx
// Standard card
<Card className="p-5">                         // 20px padding (standard)
<Card className="p-5 space-y-3">              // With internal spacing

// Compact card
<Card className="p-4">                         // 16px padding (compact)

// ❌ AVOID
<Card className="p-6">                         // 24px - too generous
<Card className="p-6 space-y-4">              // Both too large
```

## Grid & Flex Layouts

```tsx
// Standard grids
<div className="grid gap-4 sm:grid-cols-2">   // 16px gap
<div className="grid gap-5 sm:grid-cols-2">   // 20px gap (looser)

// Inline elements
<div className="flex gap-2">                   // 8px - badges, tags
<div className="flex gap-3">                   // 12px - buttons, actions

// ❌ AVOID
<div className="grid gap-6">                   // 24px - too loose
<div className="grid gap-8">                   // 32px - excessive
```

## Component Heights

```tsx
// Badges
<Badge className="h-8">                        // 32px (standard)
<Badge className="h-8 sm:h-9">               // 32px → 36px (responsive)

// Buttons
<Button className="h-10">                      // 40px (standard)
<Button className="h-11">                      // 44px (large, mobile touch)

// ❌ AVOID
<Badge className="h-10">                       // Badge too large
<Badge className="md:h-10">                   // Unnecessary growth
```

## Section Patterns

### Hero Sections
```tsx
<section className="py-4 md:py-8 space-y-4 md:space-y-5">
  <h1>Title</h1>
  <p>Description</p>
</section>
```

### Content Sections
```tsx
<section className="mt-10 md:mt-12 space-y-4">
  <h2>Section Title</h2>
  <div>{/* content */}</div>
</section>
```

### Related/Supplementary Content
```tsx
<aside className="mt-12 border-t pt-6">
  <h2 className="mb-4">Related Items</h2>
  <div className="grid gap-5 sm:grid-cols-2">
    {/* cards */}
  </div>
</aside>
```

## Component-Specific Standards

### Project Cards
```tsx
<CardHeader className="space-y-1.5 px-4 sm:px-6 py-4 sm:py-5">
<CardContent className="px-4 sm:px-6 pb-0">
<CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
```

### Blog Post Cards
```tsx
<article className="p-3 sm:p-4 space-y-2">
  {/* mobile: full width, tight spacing */}
</article>
```

### List Spacing
```tsx
// Between cards in a list
<div className="space-y-4">                    // Standard
<div className="space-y-3">                    // Compact

// Experience/role cards
<div className="space-y-4">                    // Between roles
<Card className="p-5 space-y-2">              // Internal
```

## Mobile-First Reminders

✅ **Always maintain:**
- 44px minimum touch targets for interactive elements
- Adequate padding for tap zones (min 16px = `p-4`)
- Readable line-height and spacing for text content
- Responsive spacing: tighter on mobile, looser on desktop

✅ **Responsive patterns:**
```tsx
// Good progression
<div className="p-4 sm:p-5">                   // 16px → 20px
<div className="space-y-3 md:space-y-4">      // 12px → 16px
<div className="gap-2 sm:gap-3">              // 8px → 12px

// Avoid large jumps
<div className="p-4 md:p-8">                   // ❌ 16px → 32px (too much)
```

## Common Mistakes to Avoid

### ❌ Excessive Page-Level Spacing
```tsx
<div className="space-y-12">                   // 48px - too much
<section className="mt-16">                    // 64px - excessive
<Card className="p-8">                         // 32px - bloated
```

### ❌ Inconsistent Patterns
```tsx
// Don't mix standards randomly
<Card className="p-5">                         // ✅
<Card className="p-6">                         // ❌ Inconsistent
<Card className="p-4">                         // ✅ (if compact variant)
```

### ❌ Oversized Components
```tsx
<Badge className="h-10 md:h-12">             // ❌ Badges too large
<div className="grid gap-8">                   // ❌ Grid too loose
```

## Migration Guide

When updating old components:

1. **Identify the pattern:** Page, section, card, grid, or inline?
2. **Check current spacing:** What values are being used?
3. **Apply standards:** Use the reference above
4. **Test responsiveness:** Verify on mobile, tablet, desktop
5. **Check accessibility:** Ensure touch targets remain adequate

## See Also

- `/docs/design/spacing-audit-2025.md` - Full audit documentation
- `/docs/design/mobile-first-optimization-analysis.md` - Mobile-first principles
- `/docs/components/` - Component-specific documentation
