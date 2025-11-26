# Skeleton Sync Quick Reference

**TL;DR:** When you update a component structure, update its skeleton too!

## Quick Checklist

When updating a component that has a skeleton:

- [ ] Check if `*-skeleton.tsx` file exists
- [ ] Update skeleton structure to match new layout
- [ ] Match padding/spacing (`px-*`, `py-*`, `gap-*`)
- [ ] Match responsive breakpoints (`sm:`, `md:`, `lg:`)
- [ ] Test loading state side-by-side with loaded state
- [ ] Update component JSDoc if structural elements changed

## Component-Skeleton Pairs

| Component | Skeleton File | Last Synced |
|-----------|---------------|-------------|
| `GitHubHeatmap` | `github-heatmap-skeleton.tsx` | ✅ 2025-11-04 |
| `ProjectCard` | `project-card-skeleton.tsx` | ✅ 2025-11-04 |
| `PostList` | `post-list-skeleton.tsx` | ✅ 2025-11-04 |
| `BlogPost page` | `blog-post-skeleton.tsx` | ✅ 2025-11-04 |

## Page Loading States

| Page | Loading File | Last Synced |
|------|--------------|-------------|
| Homepage | `src/app/loading.tsx` | ✅ 2025-11-19 |
| Projects | `src/app/projects/loading.tsx` | ✅ 2025-11-19 |
| Blog | `src/app/blog/loading.tsx` | ✅ 2025-11-19 |
| About | `src/app/about/loading.tsx` | ✅ 2025-11-25 |
| Contact | `src/app/contact/loading.tsx` | ✅ 2025-11-25 |
| Resume | `src/app/resume/loading.tsx` | ✅ 2025-11-25 |

**All skeletons now have JSDoc sync warnings!** ✅

## Visual Markers in Code

All components with skeletons now have JSDoc warnings:

```tsx
/**
 * ComponentName
 * 
 * ⚠️ SKELETON SYNC REQUIRED
 * When updating this component's structure, also update:
 * - src/components/component-name-skeleton.tsx
 * 
 * Key structural elements that must match:
 * - [list of important layout elements]
 */
```

## Testing Loading States

### Quick Browser Test

1. Start dev server: `npm run dev`
2. Open browser DevTools → Network tab
3. Set throttling to "Slow 3G"
4. Navigate to page with component
5. Watch skeleton appear before content loads
6. Check for layout shifts (should be zero)

### Visual Comparison

```bash
# Take screenshots at different states
open http://localhost:3000/projects
# Screenshot 1: Skeleton loading
# Screenshot 2: Content loaded
# Compare for layout shifts
```

## Common Sync Issues

### ❌ Wrong: Padding mismatch
```tsx
// Component
<CardHeader className="px-4 sm:px-6 py-4 sm:py-6">

// Skeleton
<Card className="p-6">  // ❌ Doesn't match responsive padding
```

### ✅ Right: Matching padding
```tsx
// Component
<CardHeader className="px-4 sm:px-6 py-4 sm:py-6">

// Skeleton
<CardHeader className="px-4 sm:px-6 py-4 sm:py-6">  // ✅ Matches exactly
```

### ❌ Wrong: Missing sections
```tsx
// Component has 4 sections:
CardHeader → CardContent → CardFooter → Stats

// Skeleton only has 2:
Header → Footer  // ❌ Missing CardContent and Stats
```

### ✅ Right: All sections present
```tsx
// Skeleton matches all sections
CardHeader → CardContent → CardFooter → Stats  // ✅
```

## Skeleton Best Practices

### 1. Match Structure Exactly

```tsx
// If component uses CardHeader, CardContent, CardFooter
// Skeleton should too
<Card>
  <CardHeader> ... </CardHeader>
  <CardContent> ... </CardContent>
  <CardFooter> ... </CardFooter>
</Card>
```

### 2. Match Responsive Classes

```tsx
// Component
<div className="grid grid-cols-2 md:grid-cols-4">

// Skeleton
<div className="grid grid-cols-2 md:grid-cols-4">  // Same breakpoints
```

### 3. Approximate Content Sizes

```tsx
// Component has title "Building Modern Web Apps"
// Skeleton should have similar width
<Skeleton className="h-6 w-48" />  // Roughly same visual weight
```

### 4. Include Conditional Sections

```tsx
// If component has optional sections, skeleton should show them
{hasHighlights && <CardContent>...</CardContent>}

// Skeleton shows placeholder
<CardContent>
  <Skeleton className="h-4 w-full" />
</CardContent>
```

## PR Review Checklist

When reviewing PRs that modify components:

- [ ] Does PR modify component structure?
- [ ] Does component have a skeleton? (`git ls-files | grep skeleton`)
- [ ] Is skeleton updated in this PR?
- [ ] Do padding/spacing values match?
- [ ] Do responsive breakpoints match?
- [ ] Are all sections represented in skeleton?

## Quick Commands

```bash
# Find all skeleton files
find src/components -name "*skeleton*.tsx"

# Find all components that import their skeleton
grep -r "Skeleton" src/components/*.tsx

# Check if component has skeleton
ls src/components/component-name-skeleton.tsx

# View skeleton in browser (with slow network)
npm run dev
# DevTools → Network → Throttling → Slow 3G
```

## Need Help?

- **Full strategy guide:** `/docs/components/skeleton-sync-strategy.md`
- **Component docs:** `/docs/components/[component-name].md`
- **Loading states overview:** `/docs/components/loading-states.md`

## Remember

> "A skeleton out of sync is worse than no skeleton at all"  
> — Causes layout shifts, poor UX, and user confusion

**When in doubt:**
1. Look at component JSDoc for sync requirements
2. Test loading state in browser
3. Check for layout shifts (should be zero)
