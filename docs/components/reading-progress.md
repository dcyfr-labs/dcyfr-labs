{/* TLP:CLEAR */}

# Reading Progress Indicator

**Location:** `src/components/reading-progress.tsx`

**Type:** Client Component (`"use client"`)

## Overview

The `ReadingProgress` component displays a fixed progress bar at the top of the viewport that visually indicates how far the user has scrolled through the page. It's particularly useful for long-form content like blog posts to give readers a sense of progress.

## Features

- **Fixed Position Progress Bar**: Sticky bar at the top of the viewport (z-index: 50)
- **GPU-Accelerated Animations**: Uses `scaleX` transform for smooth, jank-free animations instead of width changes
- **Performance Optimized**: Leverages `requestAnimationFrame` for efficient rendering
- **Passive Event Listeners**: Uses passive scroll/resize listeners for better scrolling performance
- **Responsive**: Automatically recalculates on window resize
- **Accessible**: Full ARIA attributes for screen readers (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- **Gradient Styling**: Visual gradient effect (primary → primary/80 → primary)

## Usage

Import and add to your layout or page:

```tsx
import { ReadingProgress } from "@/components/reading-progress";

export default function Layout({ children }) {
  return (
    <>
      <ReadingProgress />
      {children}
    </>
  );
}
```

The component works automatically - no props needed. It:
1. Calculates scroll position on mount and on each scroll event
2. Updates progress as a percentage (0-100)
3. Applies GPU-accelerated transform to the bar

## How It Works

### Calculation Logic

```
scrollPercentage = (currentScrollPosition / totalScrollableHeight) × 100
```

The component:
1. Gets the window height (`window.innerHeight`)
2. Gets the total document height (`document.documentElement.scrollHeight`)
3. Gets current scroll position (`window.scrollY`)
4. Calculates `totalScrollable = documentHeight - windowHeight`
5. Computes percentage and clamps to 0-100

### Performance Optimization

- **`scaleX` Transform**: Only modifies the X-axis scale, which is GPU-accelerated. Changing `width` would trigger layout recalculation, but `scaleX` doesn't.
- **`willChange: "transform"`**: CSS hint to browser for optimization
- **`requestAnimationFrame`**: Batches DOM updates to sync with browser repaint cycles
- **Passive Listeners**: `{ passive: true }` allows the browser to scroll without waiting for listener callbacks
- **Cleanup**: Removes event listeners and cancels pending animation frames on unmount

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Progress Bar (height: h-1 / 4px)       │
│ <── scaleX varies from 0 to 1 ──>       │
└─────────────────────────────────────────┘
├ Rest of Page Content ┤
```

The bar uses:
- `transform-origin: left` - Expands from left to right
- `pointer-events: none` - Doesn't interfere with page interaction
- Gradient background for visual appeal

## Integration Points

### Where to Use

- **Blog posts** - Included in blog post layout to show reading progress
- **Long-form pages** - Any page with substantial scrollable content
- **Documentation** - Helpful for multi-section documentation pages

### Current Usage

The reading progress bar is integrated into the blog post layout and renders on all blog post pages (`/blog/[slug]`).

## Styling & Customization

The component uses Tailwind classes:

| Aspect | Class | Value |
|--------|-------|-------|
| Position | `fixed top-0 left-0 right-0` | Sticks to top |
| Stacking | `z-50` | High z-index (below modals) |
| Height | `h-1` | 4px (0.25rem) |
| Background | `bg-gradient-to-r from-primary via-primary/80 to-primary` | Gradient effect |
| Transform | `scaleX` | GPU-accelerated |
| Interaction | `pointer-events-none` | Doesn't block clicks |

To customize the appearance, modify the className:

```tsx
// Example: Make it taller and change color
<div
  className="fixed top-0 left-0 right-0 z-50 h-2 bg-blue-500 pointer-events-none origin-left"
  // ... rest of props
/>
```

## Accessibility

The component includes comprehensive ARIA attributes:

```tsx
role="progressbar"
aria-valuenow={0}        // Updates with scroll percentage
aria-valuemin={0}        // Minimum value
aria-valuemax={100}      // Maximum value
aria-label="Reading progress"
```

Screen readers will announce: "Reading progress, progress bar, 45 percent" (for example).

## Performance Metrics

- **Initial Render**: Negligible (single div)
- **Per-Frame Cost**: ~1-2ms (one calculation + one transform update)
- **Memory**: Minimal (~2 refs)
- **No Layout Thrashing**: Uses transform, not width

## Browser Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs:
  - `requestAnimationFrame` - IE10+
  - `window.addEventListener` - Universal
  - `transform` - Universal

## Development Notes

- The component doesn't render any visible content on mount (starts at `scaleX(0)`)
- In development, you can test by scrolling a long page (like a blog post)
- The `ref` is used to directly manipulate the DOM for performance
- `useTransition` is not used because this is independent of React's concurrent features

## Related Components

- **Blog Layout** - Where this is typically rendered
- **ReadingProgress** - This component (self-contained)
- No child components or dependencies on other layout components

## Type Definitions

The component accepts no props:

```tsx
export function ReadingProgress(): ReactNode
```

## Testing

To test the reading progress:

1. Navigate to a blog post (`/blog/[slug]`)
2. Observe the thin bar at the top
3. Scroll down - bar should expand smoothly from left to right
4. Scroll to bottom - bar should reach full width (100%)
5. Resize window - bar should recalculate correctly
6. Check accessibility: Use screen reader to verify progress bar announcement

## Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Bar not moving | Not added to layout | Add to root layout or page |
| Jittery movement | Using width instead of transform | Ensure `scaleX` is being used |
| Bar behind content | z-index too low | Increase `z-50` if needed |
| Not accessible | Missing ARIA | Check ARIA attributes are present |

## Performance Considerations

✅ **Optimized for:**
- Mobile devices (passive listeners)
- High-frequency scroll events (requestAnimationFrame batching)
- Reflow prevention (transform instead of width)

⚠️ **Considerations:**
- Very long pages with thousands of elements may see marginal perf impact
- Not affected by React re-renders (uses ref directly)

## Changelog

- **2025-10-20** - Initial implementation with GPU-accelerated animations
