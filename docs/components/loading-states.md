<!-- TLP:CLEAR -->

# Loading States

**Last Updated:** October 27, 2025  
**Status:** ✅ Implemented across all async components

Loading states prevent layout shift and provide visual feedback while content loads. This guide covers skeleton components, route-level loading, and client-side patterns.

---

## Quick Reference

### Using Skeleton Components

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// Simple skeleton
<Skeleton className="h-10 w-64" />

// Custom styling
<Skeleton className="h-4 w-full rounded-full" />
```

### Specialized Skeletons

```tsx
// GitHub Heatmap
import { GitHubHeatmapSkeleton } from "@/components/github-heatmap-skeleton"
<GitHubHeatmapSkeleton />

// Post List
import { PostListSkeleton } from "@/components/post-list-skeleton"
<PostListSkeleton count={5} />  // Default: 3

// Project Cards
import { ProjectCardSkeleton, ProjectListSkeleton } from "@/components/project-card-skeleton"
<ProjectCardSkeleton />        // Single card
<ProjectListSkeleton count={4} />  // Multiple cards

// Blog Post
import { BlogPostSkeleton } from "@/components/blog-post-skeleton"
<BlogPostSkeleton />
```

---

## Implementation Patterns

### Pattern 1: Route-Level Loading (Next.js)

Next.js automatically uses `loading.tsx` files for route transitions.

**File:** `src/app/[route]/loading.tsx`
```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl py-14 md:py-20">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-full max-w-2xl mt-2" />
      {/* More skeletons matching your page layout */}
    </div>
  )
}
```

**Existing Loading Files:**
- `/src/app/loading.tsx` – Home page
- `/src/app/blog/loading.tsx` – Blog listing
- `/src/app/blog/[slug]/loading.tsx` – Blog post
- `/src/app/projects/loading.tsx` – Projects page
- `/src/app/about/loading.tsx` – About page
- `/src/app/contact/loading.tsx` – Contact page

### Pattern 2: State-Based Loading (Client Components)

```tsx
"use client"

import { useState, useEffect } from "react"
import { GitHubHeatmapSkeleton } from "@/components/github-heatmap-skeleton"

export function MyComponent() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetchData().then(data => {
      setData(data)
      setLoading(false)
    })
  }, [])
  
  if (loading) {
    return <GitHubHeatmapSkeleton />
  }
  
  return <div>Actual content: {data}</div>
}
```

### Pattern 3: Disabled State Loading (Forms)

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitForm()
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input disabled={isSubmitting} />
      <Button disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
```

### Pattern 4: useTransition Loading (Navigation)

```tsx
"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"

export function SearchForm() {
  const [isPending, startTransition] = useTransition()
  
  function handleSearch(query: string) {
    startTransition(async () => {
      const results = await search(query)
      // Update UI with results
    })
  }
  
  return (
    <Button onClick={() => handleSearch("query")} disabled={isPending}>
      {isPending ? "Searching..." : "Search"}
    </Button>
  )
}
```

---

## Skeleton Styling Guide

### Height Classes
```tsx
<Skeleton className="h-4" />   // Small text (12-14px)
<Skeleton className="h-5" />   // Badges, small elements
<Skeleton className="h-6" />   // Body text (16px)
<Skeleton className="h-8" />   // Subheadings
<Skeleton className="h-10" />  // Headings, inputs, buttons
<Skeleton className="h-12" />  // Large headings
```

### Width Classes
```tsx
<Skeleton className="w-12" />        // Tiny elements
<Skeleton className="w-32" />        // Medium elements
<Skeleton className="w-64" />        // Large elements
<Skeleton className="w-3/4" />       // 75% width
<Skeleton className="w-full" />      // Full width
<Skeleton className="max-w-2xl" />   // Constrained
```

### Rounding
```tsx
<Skeleton className="rounded-md" />    // Default (4px)
<Skeleton className="rounded-full" />  // Pills/circles
<Skeleton className="rounded-lg" />    // Cards
<Skeleton className="rounded-sm" />    // Minimal rounding
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
    <Skeleton key={i} className="h-40 rounded-lg" />
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
      <Skeleton className="h-4 w-5/6" />
    </div>
  ))}
</div>
```

### Text Block Skeleton
```tsx
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-4/5" />
</div>
```

---

## Accessibility

### Current Implementation
- Decorative elements (no ARIA labels)
- Screen readers announce content when loaded
- No interactive elements in skeletons

### Enhanced Accessibility
```tsx
<div 
  role="status" 
  aria-live="polite" 
  aria-label="Loading content"
  className="space-y-4"
>
  <Skeleton className="h-10 w-64" />
  <Skeleton className="h-6 w-full" />
</div>
```

---

## Common Issues & Solutions

### Issue: Layout Shift
**Problem:** Content jumps when skeleton is replaced with actual content

**Solution:** Match skeleton dimensions exactly to final content
```tsx
// ❌ Bad - skeleton is smaller
<Skeleton className="h-10 w-32" />  
<div className="h-20 w-64">Content</div>  // Mismatched

// ✅ Good - dimensions match
<Skeleton className="h-20 w-64" />
<div className="h-20 w-64">Content</div>  // Consistent
```

### Issue: Flash of Skeleton
**Problem:** Skeleton appears briefly for already-loaded content

**Solution:** Check cache or SSR data before showing skeleton
```tsx
// ❌ Bad - always shows skeleton
if (loading) return <Skeleton />
return <Content data={data} />

// ✅ Good - check for data first
if (cachedData) {
  return <Content data={cachedData} />
}
if (loading) return <Skeleton />
return <Content data={data} />
```

### Issue: Long Loading Times
**Problem:** Users see skeleton too long; seems broken

**Solution:** Show loading message after delay
```tsx
const [showMessage, setShowMessage] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setShowMessage(true), 5000)
  return () => clearTimeout(timer)
}, [])

if (loading) {
  return (
    <>
      <Skeleton />
      {showMessage && <p className="text-muted-foreground">Still loading...</p>}
    </>
  )
}
```

---

## Testing Loading States

### In Development
```bash
# Chrome DevTools
1. Open DevTools → Network tab
2. Set Throttling → Slow 3G
3. Reload page
4. Observe loading states

# Safari
1. Develop → Network Conditions
2. Select Slow 3G
3. Reload page
```

### Force Loading State (Development)
```tsx
// Add temporary delay for testing
useEffect(() => {
  const delay = new Promise(r => setTimeout(r, 3000))
  setLoadingPromise(delay)
}, [])
```

### Automated Testing
```tsx
// Example Jest test
import { render, screen, waitFor } from "@testing-library/react"

test("shows skeleton then content", async () => {
  render(<MyComponent />)
  
  // Initially shows skeleton
  expect(screen.getByRole("status")).toBeInTheDocument()
  
  // After load, shows content
  await waitFor(() => {
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})
```

---

## Performance Considerations

### Optimize Skeleton Rendering
```tsx
// ❌ Bad - re-creates array every render
if (loading) {
  return (
    <div>
      {[...Array(5)].map((_, i) => <Skeleton key={i} />)}
    </div>
  )
}

// ✅ Good - constant array
const SKELETON_COUNT = 5
if (loading) {
  return (
    <div>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  )
}
```

### Keep Skeletons Simple
- Don't add complex animations to skeletons
- Use CSS animations only (not JS)
- Keep skeleton count reasonable (<20)

---

## Files

- **Base Skeleton:** `src/components/ui/skeleton.tsx`
- **GitHub Heatmap:** `src/components/github-heatmap-skeleton.tsx`
- **Post List:** `src/components/post-list-skeleton.tsx`
- **Project Cards:** `src/components/project-card-skeleton.tsx`
- **Blog Post:** `src/components/blog-post-skeleton.tsx`

---

## Related Documentation

- [Error Boundaries](./error-boundaries) – Error handling for failed loads
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Suspense](https://react.dev/reference/react/Suspense)

---

## Best Practices

1. **Match the layout** – Skeleton dimensions should match final content
2. **Use for all async** – Show loading state for any data fetch
3. **Keep simple** – Avoid complex animations
4. **Test thoroughly** – Check at various network speeds
5. **Provide feedback** – Show message if loading takes >5s
6. **Use appropriate level** – Route-level vs component-level
7. **Accessibility** – Add aria-live for important skeletons

---

**Migrated from:** `/docs/operations/loading-states-quick-reference.md` and `loading-states-implementation.md`  
**Last Updated:** October 27, 2025
