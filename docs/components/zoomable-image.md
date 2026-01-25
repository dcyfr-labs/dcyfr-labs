{/* TLP:CLEAR */}

# ZoomableImage Component

**Component:** `ZoomableImage`  
**Location:** `src/components/common/zoomable-image.tsx`  
**Type:** Client Component  
**Purpose:** Interactive image component with click-to-zoom functionality

**Status:** ✅ Production  
**Last Updated:** December 7, 2025

---

## Summary

The `ZoomableImage` component wraps standard images in blog posts with click-to-zoom functionality. It automatically displays a zoom icon on hover and opens a full-screen lightbox modal when clicked, providing readers with an enhanced image viewing experience.

---

## Features

### Core Functionality
- ✅ **Click to zoom** - Opens full-screen lightbox on image click
- ✅ **Hover indicator** - Shows zoom icon overlay on hover
- ✅ **Keyboard accessible** - Supports Enter/Space to open, Escape to close
- ✅ **Click-outside to close** - Closes modal when clicking backdrop
- ✅ **Smooth transitions** - Fade-in/out animations for professional feel
- ✅ **Body scroll lock** - Prevents background scrolling when modal is open

### User Experience
- Visual feedback with hover zoom icon (ZoomIn from lucide-react)
- Full-screen modal with semi-transparent backdrop
- Close hint displayed in modal ("Click or press ESC to close")
- Cursor changes to `zoom-in` on thumbnail, `zoom-out` on zoomed image
- Image maintains aspect ratio in modal

---

## Usage

### Automatic Integration (MDX)

The component is automatically used for all images in blog posts via MDX component mapping:

```mdx
---
title: "My Blog Post"
---

# My Post

Here's an image that users can zoom:

![Screenshot of dashboard](screenshot-url.jpg)

Regular content continues...
```

All markdown images (`!alt`) in blog posts automatically become zoomable.

### Manual Usage

For custom components outside of MDX:

```tsx
import { ZoomableImage } from "@/components/common";

export function CustomComponent() {
  return (
    <ZoomableImage 
      src="/images/chart.png"
      alt="Sales chart for Q4 2025"
      className="rounded-lg shadow-md"
    />
  );
}
```

---

## Props

The component accepts all standard HTML image attributes:

```typescript
interface ZoomableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;        // Image source (required)
  alt: string;        // Alt text for accessibility (required)
  className?: string; // Additional CSS classes
  // ...all other img attributes
}
```

---

## Behavior Details

### Opening the Lightbox

**Triggers:**
1. Click on the image
2. Press Enter while focused on image
3. Press Space while focused on image

**Effect:**
- Modal fades in with backdrop
- Body scroll is locked
- Focus moves to modal
- Close hint appears in top-right corner

### Closing the Lightbox

**Triggers:**
1. Press Escape key
2. Click the backdrop (outside image)
3. Click the zoomed image itself
4. Press Enter/Space while focused on modal backdrop

**Effect:**
- Modal fades out
- Body scroll is restored
- Focus returns to page

### Hover Behavior

When hovering over the thumbnail:
- Background overlay fades in (10% black opacity)
- Zoom icon appears in center with blur backdrop
- Cursor changes to `cursor-zoom-in`

---

## Accessibility

### Keyboard Navigation
- ✅ Focusable with `tabIndex={0}`
- ✅ Operable with Enter and Space keys
- ✅ Escape key closes modal
- ✅ Proper ARIA labels (`aria-label="Zoom image: {alt}"`)

### Screen Readers
- Image maintains proper `alt` attribute
- Role="button" indicates interactivity
- Close hint provides context for screen readers

### Visual Indicators
- Clear hover state shows zoom capability
- Cursor changes signal interactive areas
- Visual close hint in modal

---

## Styling

### Default Styles (from MDX)

When used through MDX, images receive these default classes:
```tsx
className={`${SPACING.image} rounded-lg max-w-full h-auto`}
```

**Design Tokens:**
- `SPACING.image` - Standard margin spacing for content images
- `rounded-lg` - Rounded corners matching site design
- `max-w-full` - Responsive width constraint
- `h-auto` - Maintains aspect ratio

### Customization

Override styles via `className` prop:

```tsx
<ZoomableImage 
  src="/image.jpg"
  alt="Custom styled image"
  className="rounded-xl shadow-2xl border-2 border-primary"
/>
```

---

## Implementation Details

### Modal Structure

```tsx
// Inline wrapper (span, not div - valid inside <p> tags for MDX)
<span className="relative group inline-block cursor-zoom-in w-full">
  <img {...props} />
  // Zoom icon overlays
</span>

// Full-screen backdrop
<div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
  // Container with padding
  <div className="relative max-w-[95vw] max-h-[95vh] p-4">
    // Zoomed image
    <img className="max-w-full max-h-[90vh] object-contain" />
    // Close hint
    <div className="absolute top-6 right-6">Click or press ESC to close</div>
  </div>
</div>
```

**Note:** The component uses `<span>` elements for inline wrappers to avoid HTML validation errors. MDX often renders images inside `<p>` tags, and HTML doesn't allow block-level elements like `<div>` inside `<p>`. Using `<span>` ensures valid HTML structure and prevents React hydration errors.

### State Management

Uses React.useState for modal open/close state:
```tsx
const [isOpen, setIsOpen] = React.useState(false);
```

### Side Effects

The component handles body scroll locking via useEffect:
```tsx
React.useEffect(() => {
  if (!isOpen) return;
  
  document.body.style.overflow = "hidden"; // Lock scroll
  
  return () => {
    document.body.style.overflow = ""; // Restore scroll
  };
}, [isOpen]);
```

---

## Testing

### Test Coverage
- ✅ Rendering with props
- ✅ Click to open modal
- ✅ Keyboard navigation (Enter, Space, Escape)
- ✅ Close on backdrop click
- ✅ Close on image click
- ✅ Body scroll locking
- ✅ Custom className application
- ✅ Accessibility attributes

**Location:** `src/components/common/__tests__/zoomable-image.test.tsx`

**Run tests:**
```bash
npm test -- zoomable-image.test.tsx
```

---

## Performance

### Bundle Size
- Client component (requires JavaScript)
- Minimal footprint (~2KB)
- lucide-react icon shared with other components

### Runtime Performance
- React.useState for local state only
- useEffect cleanup prevents memory leaks
- No external dependencies beyond lucide-react

### User Experience
- Smooth 200ms transitions
- No layout shift on hover
- Instant response to user interactions

---

## Browser Support

Works in all modern browsers with:
- CSS backdrop-blur support
- CSS animations (fade-in/out)
- Modern flexbox layout

**Fallback:** If backdrop-blur is unsupported, uses solid black background (90% opacity).

---

## Common Use Cases

### 1. Screenshots in Technical Posts

```mdx
![Application dashboard with metrics](dashboard-before.jpg)
```

**Result:** Readers can click to see details in charts and metrics.

### 2. Architecture Diagrams

```mdx
![System architecture diagram](architecture-diagram.jpg)
```

**Result:** Complex diagrams become readable when zoomed.

### 3. Code Screenshots

```mdx
![VS Code with error highlights](vs-code-errors.jpg)
```

**Result:** Small text in screenshots becomes legible.

### 4. Before/After Comparisons

```mdx
![Performance metrics before optimization](perf-before.jpg)
![Performance metrics after optimization](perf-after.jpg)
```

**Result:** Readers can examine both images in detail.

---

## Troubleshooting

### Image Not Zoomable

**Symptom:** Image displays but doesn't show zoom icon or open modal

**Causes:**
1. Image is not rendered through MDX (check if using custom component)
2. JavaScript is disabled
3. Component not imported in MDX mapping

**Solution:**
- Verify image is in MDX content (not hardcoded in page component)
- Check browser console for errors
- Ensure `ZoomableImage` is in MDX components mapping

### Modal Not Closing

**Symptom:** Modal stays open when clicking backdrop

**Causes:**
1. Event propagation stopped by child component
2. Focus trapped elsewhere

**Solution:**
- Check for conflicting click handlers in parent components
- Ensure modal's onClick handler is not prevented

### Body Still Scrollable

**Symptom:** Background scrolls even when modal is open

**Causes:**
1. CSS overflow rule overridden elsewhere
2. Component unmounted before cleanup

**Solution:**
- Check for `!important` rules on body in global CSS
- Verify component lifecycle (React DevTools)

---

## Future Enhancements

Potential improvements for future versions:

1. **Image Gallery Mode**
   - Navigate between multiple images in modal
   - Thumbnail strip at bottom

2. **Touch Gestures**
   - Pinch to zoom on mobile
   - Swipe to close

3. **Lazy Loading**
   - Defer high-res image load until zoom
   - Show low-res placeholder first

4. **Caption Support**
   - Display image caption in modal
   - Extract from markdown title attribute

5. **Sharing**
   - Copy image URL button
   - Download image option

---

## Related Documentation

- **[MDX Component](./mdx)** - How MDX processes markdown images
- **[Design System](../../docs/ai/design-system)** - Image spacing tokens
- **[Component Patterns](../../docs/ai/component-patterns)** - Barrel exports

---

## Examples in Production

See the feature in action:
- **CVE-2025-55182 Blog Post** - Dashboard screenshot is zoomable
- Any blog post with embedded images

---

**Note:** This component is part of the core blog reading experience. Changes should maintain backward compatibility and be thoroughly tested across devices.
