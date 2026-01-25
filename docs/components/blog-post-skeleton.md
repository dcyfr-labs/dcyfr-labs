{/* TLP:CLEAR */}

# Blog Post Skeleton Component

**Location:** `src/components/blog-post-skeleton.tsx`

**Type:** Server Component

**Dependencies:** `@/components/ui/skeleton`

## Overview

The `BlogPostSkeleton` component provides a visual placeholder while blog post content is loading. It mimics the layout and structure of a blog post to provide visual continuity and better perceived performance during the loading phase.

## Features

- **Layout Structure**: Mirrors actual blog post HTML structure
- **Content Hierarchy**: Shows realistic skeleton of header, title, description, and body
- **Prevents Layout Shift**: Pre-defines dimensions to maintain layout stability
- **Development-Friendly**: Easy to understand and modify
- **Minimal Dependencies**: Only uses `Skeleton` UI primitive
- **Responsive**: Works on all screen sizes
- **Accessible**: Semantic structure (uses `<article>` and `<header>`)

## Usage

### Basic Usage

Use as a fallback component while awaiting async blog post content:

```tsx
import { BlogPostSkeleton } from "@/components/blog-post-skeleton";

export default function BlogPostPage() {
  return (
    <Suspense fallback={<BlogPostSkeleton />}>
      <BlogPostContent slug={slug} />
    </Suspense>
  );
}
```

### Props

The component accepts no props and is purely presentational:

```tsx
export function BlogPostSkeleton(): ReactNode
```

## Component Structure

### Rendered Layout

```
<article>
  <header>
    {/* Date/updated info skeleton */}
    <Skeleton className="h-4 w-48" />
    
    {/* Title skeleton */}
    <Skeleton className="h-10 w-3/4" />
    
    {/* Description (2 lines) */}
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-5/6" />
    
    {/* Badges */}
    <Skeleton className="h-5 w-16" />
    <Skeleton className="h-5 w-20" />
    <Skeleton className="h-5 w-14" />
    <Skeleton className="h-5 w-24" />
  </header>
  
  <div>
    {/* Body content (8 paragraphs, 3 lines each) */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    ))}
  </div>
</article>
```

### DOM Hierarchy

```
article (max-w-3xl, centered padding)
├── header
│   ├── Skeleton (date) - 48px width, 16px height
│   ├── Skeleton (title) - 75% width, 40px height
│   ├── Skeleton (desc line 1) - 100% width, 20px height
│   ├── Skeleton (desc line 2) - 83% width, 20px height
│   └── [4× Badge Skeletons]
└── content
    └── [8× Paragraph Skeletons with 3 lines each]
```

## Styling

### Tailwind Classes Used

| Element | Classes | Purpose |
|---------|---------|---------|
| Article | `mx-auto max-w-3xl py-14 md:py-20` | Centered container with padding |
| Header | (none) | Semantic grouping |
| Date | `h-4 w-48 mb-4` | Small text height, 192px width |
| Title | `h-10 w-3/4 mb-4` | Heading height, 75% width |
| Desc Lines | `h-5 w-full / w-5/6` | Text height, full/83% width |
| Badge Container | `flex flex-wrap gap-2` | Row layout with spacing |
| Badge Skeletons | `h-5 w-16 / w-20 / w-14 / w-24` | Various badge widths |
| Content Container | `mt-8 space-y-4` | Top margin, line spacing |
| Paragraph Lines | `space-y-2` | Vertical spacing between lines |
| Individual Lines | `h-4 w-full / w-4/5` | Text height, varying widths |

### Widths Strategy

The component uses varied widths (`w-full`, `w-5/6`, `w-4/5`, etc.) to create a more natural, less repetitive appearance that mirrors real text layout where the last line of paragraphs is often shorter.

## Skeleton UI Primitive

The `Skeleton` component (from `src/components/ui/skeleton`) provides:
- Animated background shine effect
- Rounded corners
- Proper contrast in light/dark modes
- Consistent styling across the app

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Usage: automatically animated, no additional props needed
<Skeleton className="h-4 w-48" />
```

## Integration Points

### Where It's Used

1. **Blog Post Page** (`/blog/[slug]/page.tsx`)
   - Used inside `Suspense` boundary for React Server Components
   - Shows while MDX content is being parsed and rendered

2. **Blog Post Layout** (with Streaming)
   - Can be used with Next.js streaming for progressive rendering
   - Allows other page sections to load while post content loads

### Current Usage Pattern

```tsx
// In blog post page component
<Suspense fallback={<BlogPostSkeleton />}>
  <BlogPostContent slug={slug} />
</Suspense>
```

### Adding to Other Pages

If you add skeleton loading to other async components:

```tsx
import { BlogPostSkeleton } from "@/components/blog-post-skeleton";

// Reuse directly
<Suspense fallback={<BlogPostSkeleton />}>
  <AsyncContent />
</Suspense>

// Or create a variant
function CustomSkeleton() {
  // Similar structure, adapted for your layout
  return (
    <article>
      {/* Custom skeleton structure */}
    </article>
  );
}
```

## Performance Characteristics

### Rendering

- **Initial Paint**: ~1ms (renders immediately, no async operations)
- **Bundle Size**: Negligible (~0.5KB gzipped with Skeleton component)
- **Memory**: Minimal (8 × 3 Skeleton components + container)

### Animation

- **CPU Impact**: Minimal (CSS animation handled by GPU)
- **Animation Duration**: 2 seconds (full cycle) - configurable in Skeleton component
- **Jank Prevention**: Uses CSS animations, not JavaScript

## Accessibility

### Semantic HTML

```tsx
<article>  {/* Correct semantic for blog post */}
  <header>  {/* Proper header grouping */}
    {/* Content */}
  </header>
</article>
```

### Screen Reader Experience

- Announced as article content
- Skeletons may be announced as small rectangles or images depending on screen reader
- Alternative approach: Add `aria-busy="true"` to article for explicit loading state

**Enhancement Option:**

```tsx
<article aria-busy="true" aria-label="Loading blog post...">
  {/* skeletons */}
</article>
```

### Color Contrast

- Light mode: Gray background with subtle lighter gradient
- Dark mode: Dark gray background with slightly lighter gradient
- Meets WCAG AA contrast requirements
- See `docs/operations/color-contrast-improvements.md` for full audit

## Customization

### Adjusting Structure

To match different post layouts, modify the structure:

```tsx
// For posts with author info
<Skeleton className="h-4 w-32 mb-2" /> {/* Author */}

// For posts with cover images
<Skeleton className="h-64 w-full mb-4" /> {/* Cover image */}

// For posts with table of contents
<Skeleton className="h-32 w-48 mb-4" /> {/* TOC */}
```

### Adjusting Paragraph Count

The component renders 8 paragraphs by default. Adjust for your typical post length:

```tsx
// Shorter posts (4 paragraphs)
{Array.from({ length: 4 }).map((_, i) => ...)}

// Longer posts (12 paragraphs)
{Array.from({ length: 12 }).map((_, i) => ...)}
```

### Adjusting Spacing

Modify container and content spacing:

```tsx
// Tighter spacing
<article className="mx-auto max-w-3xl py-6 md:py-10">
  <div className="mt-6 space-y-2">
    {/* content */}
  </div>
</article>

// Looser spacing
<article className="mx-auto max-w-3xl py-20 md:py-32">
  <div className="mt-12 space-y-6">
    {/* content */}
  </div>
</article>
```

## Best Practices

### When to Use

✅ **Good Uses:**
- Loading placeholders for async components
- Suspense boundaries
- Progressive enhancement
- Server Component loading states
- Initial page load experience

❌ **Avoid For:**
- Always-present placeholders (use actual content)
- Error states (use error boundary instead)
- Static content (no need for skeleton)

### UX Considerations

1. **Realistic Loading Times**: Skeleton should roughly match actual load time
   - If post loads in 100ms, skeleton shows for 100ms
   - If post takes 2s, skeleton shows for 2s

2. **Prevent Jank**: Good skeleton prevents cumulative layout shift (CLS)
   - Pre-defines dimensions of all elements
   - Prevents visual jump when content loads

3. **Visual Feedback**: Animated skeleton indicates loading is happening
   - User knows content is coming
   - Better than blank page

## Related Components

| Component | Purpose | Relationship |
|-----------|---------|--------------|
| `BlogPostSkeleton` | Loading state | This component |
| `BlogPostContent` | Actual content | Replaces skeleton |
| `Skeleton` (UI primitive) | Animation element | Used by skeleton |
| `Suspense` | Async boundary | Triggers skeleton |

## Testing

### Manual Testing

1. **Visual Check**: Navigate to blog post
   - Should see skeleton load briefly
   - Matches post structure when content loads
   - No visual jump (CLS)

2. **Slow Network**: Test with slow 3G in DevTools
   - Skeleton visible for 1-3 seconds
   - Content loads smoothly
   - No broken layout

3. **Accessibility**: Use screen reader
   - Announces article area
   - Describes loading state
   - Proper heading structure when loaded

### Lighthouse Testing

```bash
# Test on slow 3G
# Should see no CLS increase (0 or near 0)
# FCP should be instant (skeleton renders)
# LCP should be reasonable (content loads)
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Skeleton flickers | Suspense boundary not set up | Add `<Suspense>` wrapper |
| CLS (layout shift) | Skeleton size doesn't match content | Adjust skeleton widths/heights |
| Skeleton too long | Content loads quickly | Reduce paragraph count |
| Skeleton too short | Content takes time | Increase paragraph count |
| Doesn't match design | Styling outdated | Update Tailwind classes |

## Type Definitions

```tsx
export function BlogPostSkeleton(): ReactNode
```

No props, returns React node for rendering.

## Performance Checklist

- ✅ No external API calls
- ✅ No React state/effects
- ✅ Pure presentational component
- ✅ CSS animations (GPU-accelerated)
- ✅ Minimal DOM nodes (~30)
- ✅ Server component (no client-side overhead)

## Changelog

- **2025-10-21** - Initial implementation for blog post loading states
