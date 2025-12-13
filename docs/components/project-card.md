# ProjectCard Component Documentation

**Location:** `src/components/project-card.tsx`  
**Type:** Client Component  
**Last Updated:** November 4, 2025

## Overview

The `ProjectCard` component displays portfolio projects with an adaptive layout optimized for both mobile and desktop. It features progressive disclosure for project highlights on mobile devices and full-width action buttons with proper touch targets.

## Mobile Optimizations

### Progressive Disclosure (< lg breakpoint)
- **Expandable "Key Features" section** with smooth accordion animation
- Button shows highlight count: "Key Features (3)"
- ChevronDown icon rotates 180° when expanded
- Smooth max-height transition (300ms ease-in-out)
- Touch-friendly expand/collapse button (44px minimum)

### Stacked Action Buttons
- **Full-width buttons** on mobile for easy tapping
- 44px minimum touch target (py-2.5 = 10px × 2 + text height)
- Button-like styling with `bg-accent/50` background
- Converts to inline links on desktop (≥ sm breakpoint)

### Enhanced Spacing
- Progressive padding: `px-4 sm:px-6` throughout sections
- Better vertical rhythm with `space-y-3`
- Optimized font sizes: `text-sm sm:text-base md:text-[0.95rem]`
- Tech badges scale: `text-xs sm:text-sm`

## Desktop Features (≥ lg breakpoint)

- Always-visible highlights list (no accordion)
- Inline link layout without background colors
- Optimized spacing for larger screens
- Hover effects on links and cards

## Props

```typescript
interface ProjectCardProps {
  project: Project;        // Required: Project data object
  showHighlights?: boolean; // Optional: Show highlights section (default: true)
}
```

## Usage Examples

### Basic Usage
```tsx
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

<ProjectCard project={projects[0]} />
```

### Hide Highlights
```tsx
<ProjectCard project={project} showHighlights={false} />
```

### In a Grid Layout
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {projects.map((project) => (
    <ProjectCard key={project.slug} project={project} />
  ))}
</div>
```

## Component Structure

```
Card (hover effects, relative positioning)
├── Background Image Layer (z-0)
│   ├── Next.js Image (custom or default)
│   └── Gradient Overlay
│
├── CardHeader (z-10, responsive padding)
│   ├── Title + Status Badge
│   ├── Timeline (optional)
│   ├── Description
│   └── Tech Stack Badges
│
├── CardContent (z-10, conditional)
│   ├── Desktop: Always-visible highlights list
│   └── Mobile: Expandable accordion
│       ├── Expand/Collapse Button
│       └── Highlights List (animated)
│
└── CardFooter (z-10, responsive layout)
    └── Action Links/Buttons
        ├── Mobile: Full-width stacked buttons
        └── Desktop: Inline links
```

## State Management

### Local State
```typescript
const [isExpanded, setIsExpanded] = useState(false);
```

- **Purpose:** Controls mobile accordion expand/collapse
- **Scope:** Per-card instance (independent state)
- **Persistence:** None (resets on unmount)

## Accessibility Features

### Touch Targets
- ✅ All interactive elements ≥ 44px minimum
- ✅ Expand button uses `.touch-target` utility class
- ✅ Full-width mobile buttons ensure easy tapping

### ARIA Attributes
```tsx
<Button
  aria-expanded={isExpanded}
  aria-controls={`highlights-${project.slug}`}
>
  {/* Expandable content */}
  <div id={`highlights-${project.slug}`}>
    {/* ... */}
  </div>
</Button>
```

### Semantic HTML
- Proper heading hierarchy (CardTitle)
- List elements for highlights (ul/li)
- External link indicators (↗)

### Keyboard Navigation
- ✅ Button component supports keyboard interaction
- ✅ Tab navigation through action links
- ✅ Enter/Space to expand/collapse

## Styling Details

### Responsive Breakpoints
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (sm to lg)
- **Desktop:** ≥ 1024px (lg+)

### Animation Classes
```css
/* Chevron rotation */
transition-transform duration-200

/* Accordion expand/collapse */
transition-all duration-300 ease-in-out
max-h-0 opacity-0 → max-h-96 opacity-100

/* Card hover */
transition-all duration-300
hover:shadow-lg hover:-translate-y-1
```

## Related Components

- **Card Components:** `@/components/ui/card`
- **Button:** `@/components/ui/button`
- **Badge:** `@/components/ui/badge`
- **Image Utilities:** `@/lib/default-project-images`

## Design Rationale

See [Mobile-First Optimization Analysis](/docs/design/mobile-first-optimization-analysis#4-project-cards-project-cardtsx) for detailed design decisions and user research.

### Key Improvements
1. **Progressive Disclosure** - Reveals content on demand without overwhelming mobile users
2. **Touch-Friendly Actions** - Large, full-width buttons reduce tap errors
3. **Responsive Spacing** - Optimized padding and font sizes for each breakpoint
4. **Smooth Animations** - Delightful micro-interactions enhance UX

## Performance Considerations

- Client component required for interactive state
- Minimal re-renders (local state only)
- Image optimization via Next.js Image component
- CSS transitions use GPU-accelerated properties (transform, opacity)

## Testing Checklist

- [ ] Mobile accordion expands/collapses smoothly
- [ ] All touch targets ≥ 44px on mobile
- [ ] Action buttons stack vertically on mobile
- [ ] Action buttons inline on desktop
- [ ] Highlights always visible on desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces expanded state
- [ ] External links show indicator (↗)
- [ ] Card hover effects work on desktop
- [ ] Background images load with fallback

## Troubleshooting

### Accordion Not Animating
**Issue:** Content appears/disappears without animation  
**Solution:** Ensure `max-h-96` is large enough for your content. Increase if needed.

### Touch Targets Too Small
**Issue:** Mobile buttons feel cramped  
**Solution:** Verify `.touch-target` class is applied and `py-2.5` is set.

### Highlights Not Visible on Desktop
**Issue:** Desktop shows expand button instead of list  
**Solution:** Check breakpoint - should be `hidden lg:block` for desktop list.

### State Not Persisting
**Issue:** Accordion state resets unexpectedly  
**Solution:** This is expected behavior. State is per-card and per-session only.

## Future Enhancements

- [ ] Persist expanded state to localStorage (optional)
- [ ] Add animation spring physics for smoother accordion
- [ ] Support for video backgrounds
- [ ] Quick actions menu for sharing/bookmarking
- [ ] Analytics tracking for highlight expansion rate

## Version History

- **Nov 4, 2025** - Initial mobile optimization with progressive disclosure
- Mobile-first redesign with stacked buttons and expandable highlights
- Comprehensive JSDoc documentation added
- Touch target optimization (44px minimum)
