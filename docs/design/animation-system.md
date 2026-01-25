{/* TLP:CLEAR */}

# Animation System

> **Philosophy:** Performance, Browser Support, Simplicity

## Overview

This site uses a CSS-first animation system built on three principles:

1. **Performance** - CSS-only animations using GPU-accelerated properties (`transform`, `opacity`)
2. **Browser Support** - Universal CSS transitions, progressive enhancement for View Transitions API
3. **Simplicity** - Single source of truth in CSS custom properties, minimal JavaScript

## Core Concepts

### CSS Handles Reduced Motion Globally

The `@media (prefers-reduced-motion: reduce)` query in `globals.css` disables all animations site-wide. Components don't need JavaScript checks—CSS handles it automatically.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### CSS Custom Properties

All timing values are defined in `globals.css` under `@theme inline`:

```css
/* Duration Scale */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;

/* Easing Functions */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Transform Distances */
--slide-distance: 12px;
--lift-distance: 2px;
```

## Animation Utilities

### Transitions

```tsx
// Base transitions for opacity + transform
<div className="transition-base">...</div>     // 250ms
<div className="transition-fast">...</div>     // 150ms
<div className="transition-slow">...</div>     // 400ms

// Color transitions (for theme changes, hover states)
<div className="transition-colors">...</div>
```

### Scroll Reveal

Two-class system: initial state + visible state

```tsx
// Initial hidden state
<div className="reveal-hidden reveal-up">...</div>

// Add visible when in viewport
<div className="reveal-hidden reveal-up reveal-visible">...</div>
```

**Direction variants:**
- `reveal-up` - Fade + slide up from below
- `reveal-down` - Fade + slide down from above
- `reveal-left` - Fade + slide from right
- `reveal-right` - Fade + slide from left
- `reveal-scale` - Fade + scale up

### Stagger Delays

For list animations, add stagger classes:

```tsx
{items.map((item, i) => (
  <div 
    className={cn(
      "reveal-hidden reveal-up transition-base",
      isVisible && "reveal-visible",
      i < 6 && `stagger-${i + 1}`  // 50ms increments
    )}
  >
    {item.content}
  </div>
))}
```

### Hover Effects

```tsx
// Card lift effect
<Card className="hover-lift">...</Card>

// Button press effect
<Button className="press-effect">...</Button>
```

## Components

### ScrollReveal Component

The `ScrollReveal` component wraps content with scroll-triggered animations:

```tsx
import { ScrollReveal } from "@/components/features/scroll-reveal";

// Basic usage
<ScrollReveal animation="fade-up">
  <Card>Content</Card>
</ScrollReveal>

// Staggered list
{posts.map((post, i) => (
  <ScrollReveal 
    key={post.slug} 
    animation="fade-up"
    delay={i}  // 0-6, mapped to stagger-1 through stagger-6
  >
    <PostCard post={post} />
  </ScrollReveal>
))}
```

**Props:**
- `animation`: `"fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale"`
- `delay`: `0-6` (stagger index, mapped to 50ms increments)
- `triggerOnce`: `boolean` (default: `true`)
- `className`: Additional CSS classes

### useScrollAnimation Hook

For custom scroll-triggered behavior:

```tsx
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

function CustomComponent() {
  const { ref, shouldAnimate } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-hidden reveal-up transition-base",
        shouldAnimate && "reveal-visible"
      )}
    >
      Content
    </div>
  );
}
```

## Design Tokens

TypeScript constants are available in `@/lib/design-tokens`:

```tsx
import { ANIMATION } from "@/lib/design-tokens";

<div className={cn(
  ANIMATION.reveal.hidden,
  ANIMATION.reveal.up,
  isVisible && ANIMATION.reveal.visible,
  ANIMATION.stagger[1]
)}>
  Content
</div>
```

## Best Practices

### DO

- ✅ Use CSS classes for animations
- ✅ Animate only `transform` and `opacity`
- ✅ Use `transition-base` for standard animations
- ✅ Use stagger classes (1-6) for lists
- ✅ Trust CSS to handle reduced motion

### DON'T

- ❌ Use JavaScript animation libraries (Framer Motion, etc.)
- ❌ Animate layout properties (width, height, margin, padding)
- ❌ Check for reduced motion in JavaScript (CSS handles it)
- ❌ Use inline styles for animation timing
- ❌ Create custom animation durations (use the scale)

## Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | CSS custom properties, utility classes, reduced motion |
| `src/lib/design-tokens.ts` | TypeScript constants (ANIMATION) |
| `src/components/features/scroll-reveal.tsx` | ScrollReveal component |
| `src/hooks/use-scroll-animation.ts` | Viewport detection hook |
| `src/hooks/use-reduced-motion.ts` | Reduced motion detection (for special cases) |

## Theme Transitions

Theme switching uses the View Transitions API with CSS fallback:

```css
/* View Transitions API (modern browsers) */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 150ms;
}

/* CSS fallback */
html:not(.view-transitions-supported) * {
  transition: color 150ms, background-color 150ms, border-color 150ms;
}
```

## Performance Notes

1. **GPU Acceleration**: All animations use `transform` and `opacity` which are composited on the GPU
2. **No Layout Thrashing**: Never animate layout properties
3. **Minimal JavaScript**: Only IntersectionObserver for viewport detection
4. **Automatic Cleanup**: Observer disconnects when not needed
5. **Single Reflow**: CSS handles initial/visible state changes in single reflow
