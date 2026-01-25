{/* TLP:CLEAR */}

# Loading States - Quick Reference

**Last Updated:** October 21, 2025

---

## Using Skeleton Components

### Base Skeleton
```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Simple skeleton
<Skeleton className="h-10 w-64" />

// Custom styling
<Skeleton className="h-4 w-full rounded-full" />
```

### Specialized Skeletons

#### GitHub Heatmap
```tsx
import { GitHubHeatmapSkeleton } from "@/components/github-heatmap-skeleton";

<GitHubHeatmapSkeleton />
```

#### Post List
```tsx
import { PostListSkeleton } from "@/components/post-list-skeleton";

<PostListSkeleton count={5} />  // Default: 3
```

#### Project Cards
```tsx
import { ProjectCardSkeleton, ProjectListSkeleton } from "@/components/project-card-skeleton";

// Single card
<ProjectCardSkeleton />

// Multiple cards with grid
<ProjectListSkeleton count={4} />  // Default: 3
```

#### Blog Post
```tsx
import { BlogPostSkeleton } from "@/components/blog-post-skeleton";

<BlogPostSkeleton />
```

---

## Route-Level Loading

Next.js automatically uses `loading.tsx` files for route transitions.

### Creating a Loading State
```tsx
// src/app/[route]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl py-14 md:py-20">
      <Skeleton className="h-10 w-64" />
      {/* More skeletons matching your page layout */}
    </div>
  );
}
```

### Existing Loading Files
- `/src/app/loading.tsx` - Home page
- `/src/app/blog/loading.tsx` - Blog listing
- `/src/app/blog/[slug]/loading.tsx` - Blog post
- `/src/app/projects/loading.tsx` - Projects page
- `/src/app/about/loading.tsx` - About page
- `/src/app/contact/loading.tsx` - Contact page

---

## Client Component Loading

### Pattern 1: State-Based (GitHub Heatmap)
```tsx
"use client";

import { GitHubHeatmapSkeleton } from "@/components/github-heatmap-skeleton";

export function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <GitHubHeatmapSkeleton />;
  }
  
  return <div>Actual content</div>;
}
```

### Pattern 2: Disabled State (Forms)
```tsx
"use client";

export function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <form>
      <Input disabled={isSubmitting} />
      <Button disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

### Pattern 3: Transition State (Search)
```tsx
"use client";

import { useTransition } from "react";

export function SearchForm() {
  const [isPending, startTransition] = useTransition();
  
  return (
    <Button disabled={isPending}>
      {isPending ? "Searching..." : "Search"}
    </Button>
  );
}
```

---

## Common Patterns

### Page Header Skeleton
```tsx
<div className="space-y-4">
  <Skeleton className="h-10 w-64" />        {/* Title */}
  <Skeleton className="h-6 w-full max-w-2xl" />  {/* Description */}
</div>
```

### Card Grid Skeleton
```tsx
<div className="grid gap-4 md:grid-cols-2">
  {Array.from({ length: 4 }).map((_, i) => (
    <ProjectCardSkeleton key={i} />
  ))}
</div>
```

### List Skeleton
```tsx
<div className="space-y-6">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  ))}
</div>
```

---

## Styling Guidelines

### Heights
- `h-4` - Small text (12-14px)
- `h-5` - Badges, small elements
- `h-6` - Body text (16px)
- `h-8` - Subheadings
- `h-10` - Headings, inputs, buttons
- `h-12` - Large headings

### Widths
- `w-12`, `w-16`, `w-20` - Small elements
- `w-32`, `w-40`, `w-48` - Medium elements
- `w-64` - Large elements
- `w-3/4`, `w-5/6` - Percentage-based
- `w-full` - Full width
- `max-w-2xl` - Constrained width

### Rounding
- Default: `rounded-md` (4px)
- Pills: `rounded-full`
- Cards: `rounded-lg`

---

## Accessibility

### Current Implementation
- Decorative elements (no ARIA labels)
- Screen readers announce content when loaded

### Optional Enhancement
```tsx
<div role="status" aria-live="polite" aria-label="Loading content">
  <Skeleton className="h-10 w-64" />
</div>
```

---

## Testing Loading States

### Simulate Slow Network
```bash
# Chrome DevTools
Network tab → Throttling → Slow 3G

# Safari
Develop → Network Conditions → Slow 3G
```

### Force Loading State
```tsx
// Temporarily add delay for testing
if (loading) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return <MySkeleton />;
}
```

---

## Common Issues

### Layout Shift
**Problem:** Content jumps when skeleton is replaced  
**Solution:** Match skeleton dimensions exactly to final content

```tsx
// Bad
<Skeleton className="h-10 w-32" />  // Too small
<div className="h-20 w-64">Content</div>

// Good
<Skeleton className="h-20 w-64" />  // Matches
<div className="h-20 w-64">Content</div>
```

### Flash of Skeleton
**Problem:** Skeleton appears briefly for already-loaded content  
**Solution:** Use SSR/SSG or check cache before showing skeleton

```tsx
// Check if data is cached/available
if (cachedData) {
  return <Content data={cachedData} />;
}
return <Skeleton />;
```

---

## Related Files

- `/src/components/ui/skeleton.tsx` - Base component
- `/docs/operations/loading-states-implementation.md` - Full documentation
- `/docs/operations/error-boundaries-implementation.md` - Error handling
