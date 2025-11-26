# Skeleton Sync Strategy

**Last Updated:** November 22, 2025

## Status: ✅ IMPLEMENTED & ENFORCED (Hybrid Approach + Automated Tests)

**Implementation Date:** November 19, 2025  
**Last Sync Audit:** November 22, 2025  
**Strategy:** Hybrid (Layout Components + Loading Prop + Structural Tests)

## Problem Statement

Skeleton loaders need to stay synchronized with their actual components. When components are updated (structure, layout, styling), skeletons often fall out of sync, leading to layout shifts and poor UX.

**Original Issues (Resolved):**
- ✅ Skeletons were in separate files with manual structure replication
- ✅ No automated checks to ensure structural parity
- ✅ Manual updates required when components changed
- ✅ Easy to forget to update skeletons after component changes

## Latest Audit Results (November 25, 2025)

**Critical Fixes Implemented:**
1. ✅ **Projects Page** - Fixed grid breakpoint (`lg:grid-cols-3` added) and removed phantom GitHub Heatmap section
2. ✅ **Homepage** - Replaced "Blog Section" with correct "Recent Activity" structure using Card components
3. ✅ **Homepage** - Removed phantom "Projects Section" that was commented out in actual page
4. ✅ **Blog Page** - Complete restructure to match actual custom layout with:
   - BlogLayoutWrapper grid system (`lg:grid-cols-[280px_1fr]`)
   - Desktop sidebar with sticky positioning (hidden on mobile)
   - ViewToggle in header (desktop only)
   - Mobile filters section (below lg breakpoint)
   - Increased PostListSkeleton count to 12 items

**Previous Fixes (November 22, 2025):**
1. ✅ `PostListSkeleton` - Updated to match PostList's new structure with background images, gradient overlays, and proper padding (space-y-4 container, p-3 sm:p-4 content)
2. ✅ `ProjectListSkeleton` - Fixed grid gap from `gap-6` to `gap-4` to match actual projects page
3. ✅ Skeleton tests - Updated from deprecated `animate-pulse` to `skeleton-shimmer` class
4. ✅ Skeleton tests - Fixed outdated selectors and layout expectations

**All 21 skeleton sync tests now passing** ✅

## Implemented Solution: Hybrid Approach

We've implemented a **three-pronged strategy** that eliminates manual skeleton maintenance:

### 1. Layout Components with Skeleton Children ⭐

All `loading.tsx` files now use the **actual layout components** (`PageHero`, `ArchiveLayout`, `PageLayout`) with skeleton children passed as props. This guarantees structural sync because the layout structure is identical.

**Example:**
```tsx
// src/app/loading.tsx
<PageHero
  variant="homepage"
  align="center"
  title={<Skeleton className="h-12 w-64 mx-auto" />}
  description={<>
    <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
    <Skeleton className="h-6 w-3/4 max-w-2xl mx-auto" />
  </>}
  image={<Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />}
  actions={...}
/>
```

### 2. Loading Prop Support (Future-Ready) 🚀

Layout components now accept a `loading` boolean prop for self-contained skeleton rendering:

```tsx
// Simplified usage (optional)
<PageHero loading variant="homepage" align="center" />
<ArchiveLayout loading>
  <PostListSkeleton count={5} />
</ArchiveLayout>
```

This provides an even simpler API for future loading states while maintaining perfect structure sync.

### 3. Automated Structural Tests ✅

Created `src/__tests__/skeleton-sync.test.tsx` with comprehensive tests that validate:
- All loading states use proper layout components
- Skeleton animations are present
- Design tokens are used consistently
- Critical page structures match (home, projects, blog, about, contact, resume)

Tests run automatically in CI/CD to catch any regressions.

## Implementation Status

### Updated Files (November 19, 2025)

**Loading States (6 files):**
- ✅ `src/app/loading.tsx` - Uses `PageHero` component
- ✅ `src/app/projects/loading.tsx` - Uses `ArchiveLayout` component
- ✅ `src/app/blog/loading.tsx` - Uses `ArchiveLayout` component
- ✅ `src/app/about/loading.tsx` - Uses `PageHero` component
- ✅ `src/app/contact/loading.tsx` - Uses `PageHero` component
- ✅ `src/app/resume/loading.tsx` - Uses `PageHero` component

**Layout Components (3 files):**
- ✅ `src/components/layouts/page-hero.tsx` - Added `loading` prop support
- ✅ `src/components/layouts/archive-layout.tsx` - Added `loading` prop support
- ✅ `src/components/layouts/article-layout.tsx` - Added `loading` prop support (NEW)

**Skeleton Primitives (1 file):**
- ✅ `src/components/ui/skeleton-primitives.tsx` - Design-token-aware skeleton primitives (NEW)

**Components with Co-located Loading (1 file):**
- ✅ `src/components/projects/project-card.tsx` - Added `loading` prop for co-located skeleton (NEW)

**Tests (1 file):**
- ✅ `src/__tests__/skeleton-sync.test.tsx` - Structural validation tests + primitive tests

### Key Improvements

1. **Guaranteed Sync:** Impossible for skeletons to drift from actual layouts since they use the same components
2. **Single Source of Truth:** Layout structure defined once, used everywhere
3. **Automated Validation:** Tests catch regressions automatically
4. **Future-Proof:** `loading` prop provides even simpler API going forward
5. **Maintainable:** Changes to layout components automatically apply to loading states
6. **Design-Token-Aware:** Skeleton primitives automatically size based on typography tokens (NEW)
7. **Co-located Skeletons:** Components define their own skeleton inline, impossible to forget (NEW)

## Skeleton Primitives (NEW)

Design-token-aware skeleton primitives that automatically size based on the design system.

### Available Primitives

```tsx
import { 
  SkeletonText,        // Multi-line body text
  SkeletonHeading,     // h1-h4 with token-based heights
  SkeletonDescription, // Lead/description text
  SkeletonAvatar,      // Circular avatar (sm/md/lg/xl)
  SkeletonBadges,      // Tag/badge group
  SkeletonButton,      // Button placeholder
  SkeletonMetadata,    // Date, reading time, views
  SkeletonParagraphs,  // Multiple paragraph blocks
  SkeletonImage,       // Image with aspect ratios
  SkeletonCard,        // Complete card (post/project/simple)
  SkeletonList,        // List of skeleton cards
} from "@/components/ui/skeleton-primitives";
```

### Usage Examples

```tsx
// Typography-matched headings
<SkeletonHeading level="h1" variant="article" />  // Matches TYPOGRAPHY.h1.article
<SkeletonHeading level="h2" />                     // Matches TYPOGRAPHY.h2.standard

// Content blocks
<SkeletonText lines={3} lastLineWidth="w-3/4" />
<SkeletonParagraphs count={5} />

// Metadata and badges
<SkeletonMetadata showDate showReadingTime showViews />
<SkeletonBadges count={4} />

// Complete cards
<SkeletonCard variant="post" showImage />
<SkeletonCard variant="project" />
```

### Benefits

- **Auto-sized:** Heights match actual typography tokens
- **Consistent:** Same dimensions across all skeletons
- **Maintainable:** Change token = all skeletons update
- **Semantic:** `SkeletonHeading level="h1"` is self-documenting

## Co-located Loading Pattern (NEW)

Components define their own skeleton inline via a `loading` prop.

### Example: ProjectCard

```tsx
// Using ProjectCard with loading state
<ProjectCard loading />  // Renders skeleton

// In a list
{isLoading 
  ? Array.from({ length: 3 }).map((_, i) => <ProjectCard key={i} loading />)
  : projects.map(p => <ProjectCard key={p.slug} project={p} />)
}
```

### Implementation Pattern

```tsx
export function MyComponent({ data, loading = false }: Props) {
  // Loading state - render skeleton with IDENTICAL structure
  if (loading || !data) {
    return (
      <div className="...same-classes-as-normal-render...">
        <Skeleton className="h-6 w-3/4" />
        {/* ... skeleton content using same wrapper structure ... */}
      </div>
    );
  }

  // Normal render
  return (
    <div className="...same-classes-as-skeleton...">
      <h2>{data.title}</h2>
      {/* ... normal content ... */}
    </div>
  );
}
```

### Benefits

- **Impossible to forget:** Skeleton lives in same file
- **Single diff:** Update component = update skeleton
- **IDE support:** Jump to skeleton is one scroll away
- **Type-safe:** Same Props interface for both states

## Benefits of Hybrid Approach

✅ **No manual skeleton maintenance** - Layout components handle structure  
✅ **Perfect structural sync** - Same components = identical structure  
✅ **Type safety** - Props validated by TypeScript  
✅ **Automated testing** - CI/CD catches drift  
✅ **Simplified future updates** - Add `loading` prop, done  
✅ **Clear documentation** - JSDoc examples show both patterns  

## Usage Patterns

### Pattern 1: Skeleton Children (Current Standard)

Pass skeleton components as children to layout components:

```tsx
// src/app/projects/loading.tsx
<ArchiveLayout
  title={<Skeleton className="h-10 w-40" />}
  description={<Skeleton className="h-6 w-3/4 max-w-2xl" />}
>
  <ProjectListSkeleton count={4} />
</ArchiveLayout>
```

**Benefits:**

- Layout structure guaranteed to match
- Type-safe prop validation
- Clear separation of structure vs content

### Pattern 2: Loading Prop (Simplified)

Use the `loading` boolean prop for even simpler syntax:

```tsx
// Future-friendly approach
<PageHero loading variant="homepage" align="center" />
```

**Benefits:**

- Minimal code required
- Perfect structural sync
- Self-documenting API

## Testing

Run skeleton sync tests:

```bash
npm test skeleton-sync
```

Tests validate:

- All loading states use layout components properly
- Skeleton animations are present
- Structure matches actual pages
- Design tokens used consistently

## Migration Guide

### For New Pages

1. Create page in `src/app/[route]/page.tsx` using layout components
2. Create `src/app/[route]/loading.tsx`
3. Import same layout components with skeleton children

### For Existing Pages

Replace manual skeleton structure with layout components:

**Before:**

```tsx
<section className={PAGE_LAYOUT.hero.container}>
  <div className={PAGE_LAYOUT.hero.content}>
    <Skeleton className="h-10 w-48" />
    <Skeleton className="h-6 w-full" />
  </div>
</section>
```

**After:**

```tsx
<PageHero
  title={<Skeleton className="h-10 w-48" />}
  description={<Skeleton className="h-6 w-full" />}
/>
```

## Best Practices

1. **Always use layout components** in loading.tsx files
2. **Match the variant** used in the actual page
3. **Run tests** after updating page structure
4. **Use loading prop** for simpler future implementations
5. **Keep specialized skeletons** (PostListSkeleton, ProjectCardSkeleton) for content-specific patterns

## Previous Approaches (Historical Context)

The following strategies were considered but superseded by the hybrid approach:

### Strategy: Co-location with Visual Markers

Add tests that compare the DOM structure of skeletons to loaded components.

#### Implementation

Create a test helper that validates structure:

```tsx
// tests/skeleton-sync.test.tsx
import { render } from "@testing-library/react";
import { ProjectCard } from "@/components/project-card";
import { ProjectCardSkeleton } from "@/components/project-card-skeleton";

describe("Skeleton Structural Sync", () => {
  it("ProjectCardSkeleton matches ProjectCard structure", () => {
    const mockProject = createMockProject();
    
    // Render both
    const { container: cardContainer } = render(<ProjectCard project={mockProject} />);
    const { container: skeletonContainer } = render(<ProjectCardSkeleton />);
    
    // Check Card element exists
    expect(cardContainer.querySelector(".flex.h-full")).toBeTruthy();
    expect(skeletonContainer.querySelector("div.p-6")).toBeTruthy();
    
    // Check CardHeader section
    const cardHeader = cardContainer.querySelector("header");
    const skeletonHeader = skeletonContainer.querySelector(".space-y-4 > div:first-child");
    expect(cardHeader).toBeTruthy();
    expect(skeletonHeader).toBeTruthy();
    
    // Check tech badges section
    const cardTechBadges = cardContainer.querySelectorAll("[variant='outline']");
    const skeletonTechBadges = skeletonContainer.querySelectorAll(".flex-wrap > *");
    expect(skeletonTechBadges.length).toBeGreaterThan(0);
    
    // Check footer actions
    const cardFooter = cardContainer.querySelector("footer");
    const skeletonFooter = skeletonContainer.querySelector(".flex.gap-2.pt-2");
    expect(cardFooter).toBeTruthy();
    expect(skeletonFooter).toBeTruthy();
  });
});
```

**Benefits:**
- ✅ Automated validation
- ✅ Catches structural drift
- ✅ CI/CD integration
- ✅ Forces awareness of skeleton updates

**Drawbacks:**
- ⚠️ Requires test setup and maintenance
- ⚠️ May have false positives/negatives
- ⚠️ Doesn't catch styling differences

---

### Strategy 3: Shared Layout Components

Extract common layout patterns into reusable components.

#### Implementation

```tsx
// src/components/card-layouts/project-card-layout.tsx
export function ProjectCardLayout({
  title,
  status,
  timeline,
  description,
  techStack,
  highlights,
  actions,
  isLoading = false
}: ProjectCardLayoutProps) {
  return (
    <Card className="flex h-full flex-col ...">
      <CardHeader className="space-y-3 ...">
        <div className="flex flex-wrap items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-20" />
            </>
          ) : (
            <>
              <CardTitle>{title}</CardTitle>
              <Badge>{status}</Badge>
            </>
          )}
        </div>
        
        {timeline && (
          isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <p className="text-xs ...">{timeline}</p>
          )
        )}
        
        {/* Continue pattern for all sections */}
      </CardHeader>
    </Card>
  );
}

// Usage in ProjectCard
export function ProjectCard({ project }) {
  return (
    <ProjectCardLayout
      title={project.title}
      status={project.status}
      // ... other props
    />
  );
}

// Usage for skeleton
export function ProjectCardSkeleton() {
  return <ProjectCardLayout isLoading />;
}
```

**Benefits:**
- ✅ Single source of truth
- ✅ Guaranteed structural sync
- ✅ DRY principle
- ✅ Easier to maintain

**Drawbacks:**
- ⚠️ Significant refactoring required
- ⚠️ More complex component API
- ⚠️ May reduce flexibility
- ⚠️ Potential performance overhead

---

### Strategy 4: Documentation-Driven Approach

Maintain detailed documentation with visual structure maps.

#### Implementation

Create a structure map in component docs:

```markdown
## Component Structure

```
ProjectCard
├── Card (flex, h-full, hover effects)
│   ├── Background Image Layer (z-0)
│   ├── CardHeader (z-10, px-4 sm:px-6, py-4 sm:py-6)
│   │   ├── Title + Badge
│   │   ├── Timeline (optional)
│   │   ├── Description
│   │   └── Tech Badges (flex-wrap)
│   ├── CardContent (conditional, z-10, px-4 sm:px-6)
│   │   ├── Desktop: Highlights list
│   │   └── Mobile: Expandable accordion
│   └── CardFooter (z-10, px-4 sm:px-6, py-4)
│       └── Action buttons (flex-col sm:flex-row)
```

**ProjectCardSkeleton MUST match:**
1. Card padding
2. Header section with title + badge skeletons
3. Description lines
4. Tech badge section (3-4 skeleton badges)
5. Footer with 2-3 action button skeletons
```

**Benefits:**
- ✅ Clear reference documentation
- ✅ Easy to review during PRs
- ✅ No code changes needed
- ✅ Good for onboarding

**Drawbacks:**
- ⚠️ Still manual process
- ⚠️ Docs can go stale
- ⚠️ No automated enforcement

---

### Strategy 5: Component Metadata & Linting

Add metadata to components that can be checked by linters.

#### Implementation

```tsx
// project-card.tsx
/**
 * @component ProjectCard
 * @skeleton ProjectCardSkeleton
 * @skeletonPath src/components/project-card-skeleton.tsx
 * @structureVersion 2.0.0
 */
export function ProjectCard() { ... }

// project-card-skeleton.tsx
/**
 * @skeletonFor ProjectCard
 * @structureVersion 2.0.0
 * @lastSyncDate 2025-11-04
 */
export function ProjectCardSkeleton() { ... }
```

Custom ESLint rule to check:
- Version numbers match
- lastSyncDate is recent
- Referenced files exist

**Benefits:**
- ✅ Automated checks
- ✅ CI/CD integration
- ✅ Clear versioning

**Drawbacks:**
- ⚠️ Requires custom tooling
- ⚠️ Version management overhead
- ⚠️ Doesn't validate actual structure

---

## Recommended Implementation Plan

### Phase 1: Quick Wins (Immediate)

1. **Add JSDoc warnings to all components with skeletons** ⭐
   - Lists skeleton file path
   - Documents key structural elements
   - Takes 5 minutes per component

2. **Update skeleton sync checklist in PR template**
   ```markdown
   - [ ] If component structure changed, did you update the skeleton?
   - [ ] Tested loading state matches loaded state?
   ```

3. **Create visual comparison script**
   ```bash
   npm run compare-skeletons
   # Opens browser with side-by-side skeleton vs loaded component
   ```

### Phase 2: Enhanced Documentation (Week 1)

4. **Add structure maps to all component docs**
   - ASCII tree showing hierarchy
   - Key classes and breakpoints
   - Skeleton matching requirements

5. **Create skeleton sync guide**
   - When to update skeletons
   - How to validate sync
   - Common patterns

### Phase 3: Automation (Month 1)

6. **Add structural tests for critical components**
   - GitHub Heatmap
   - Project Card
   - Post List
   - Blog Post

7. **Set up visual regression testing** (optional)
   - Percy, Chromatic, or similar
   - Captures skeleton vs loaded states
   - Flags visual differences

### Phase 4: Long-term (Future)

8. **Consider shared layout components** (if patterns emerge)
9. **Explore Storybook integration** for visual testing
10. **Build custom ESLint rule** if needed

---

## Current Component-Skeleton Pairs

| Component | Skeleton | Status | Priority |
|-----------|----------|--------|----------|
| `ProjectCard` | `ProjectCardSkeleton` | ✅ Updated (Nov 4) | LOW |
| `GitHubHeatmap` | `GitHubHeatmapSkeleton` | ✅ Updated (Nov 4) | LOW |
| `PostList` | `PostListSkeleton` | ✅ Synced (Nov 4) | LOW |
| `BlogPost` | `BlogPostSkeleton` | ✅ Synced (Nov 4) | LOW |

### All Skeletons Now Have Sync Warnings ✅

**Status (Nov 4, 2025):** All components with skeletons now include JSDoc warnings with:
- ⚠️ Clear "SKELETON SYNC REQUIRED" marker
- Path to skeleton file
- List of key structural elements to match
- Links to documentation
- Last synced date

**Components updated:**
1. ✅ `ProjectCard` → `ProjectCardSkeleton` - Updated structure + JSDoc
2. ✅ `GitHubHeatmap` → `GitHubHeatmapSkeleton` - Added JSDoc warning
3. ✅ `PostList` → `PostListSkeleton` - Added JSDoc warning
4. ✅ `BlogPost page` → `BlogPostSkeleton` - Added JSDoc warning

---

### Phase 1 Implementation Complete! 🎉

All immediate quick wins from Phase 1 have been implemented:
- ✅ JSDoc warnings added to all components with skeletons
- ✅ ProjectCardSkeleton updated to match current structure
- ✅ Comprehensive documentation created
- ✅ Quick reference guide available

**Next:** Phase 2 (Enhanced Documentation) and Phase 3 (Automation)

---

## Old Status (Pre-Nov 4, 2025)

### ProjectCard Skeleton Update Needed

**Current mismatch:**
- ✅ Skeleton uses `Card className="p-6"`
- ❌ Actual uses `CardHeader`, `CardContent`, `CardFooter` with specific padding
- ❌ Missing statistics grid (new feature)
- ❌ Missing responsive padding (px-4 sm:px-6)

**Action required:**
Update `project-card-skeleton.tsx` to match new structure from Nov 4, 2025 updates.

---

## Best Practices

### When Creating New Components

1. **Create skeleton alongside component**
   - Same PR, same commit
   - Not an afterthought

2. **Add JSDoc skeleton reference**
   - Clear path to skeleton file
   - List structural elements to sync

3. **Test loading state immediately**
   - View in browser with throttled network
   - Check for layout shifts

### When Updating Existing Components

1. **Check for skeleton file**
   - Search for `*-skeleton.tsx`
   - Check imports in loading.tsx

2. **Update skeleton structure**
   - Match new layout
   - Update padding/spacing
   - Test side-by-side

3. **Update component docs**
   - Note structural changes
   - Update structure map
   - Bump version if using versioning

### Code Review Checklist

- [ ] Does this component have a skeleton?
- [ ] If structure changed, was skeleton updated?
- [ ] Are padding/spacing values consistent?
- [ ] Does skeleton match responsive breakpoints?
- [ ] Tested loading state in browser?
- [ ] Documentation updated?

---

## Tools & Scripts

### Quick Skeleton Comparison Script

```typescript
// scripts/compare-skeleton.mjs
import { chromium } from 'playwright';

async function compareSkeletons() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to dev server
  await page.goto('http://localhost:3000/projects');
  
  // Take screenshot of loaded state
  await page.screenshot({ path: 'screenshots/loaded.png' });
  
  // Throttle network to trigger loading state
  await page.route('**/*', route => {
    setTimeout(() => route.continue(), 2000);
  });
  
  // Reload to see skeleton
  await page.reload();
  await page.screenshot({ path: 'screenshots/skeleton.png' });
  
  console.log('Screenshots saved! Compare loaded.png vs skeleton.png');
  await browser.close();
}

compareSkeletons();
```

**Usage:**
```bash
npm run dev
node scripts/compare-skeleton.mjs
```

### Visual Diff Tool

```bash
# Use ImageMagick to create diff
compare screenshots/skeleton.png screenshots/loaded.png screenshots/diff.png
```

---

## Success Metrics

- **Zero layout shifts** when content loads (Lighthouse CLS score)
- **< 5% visual difference** between skeleton and loaded state
- **100% of components** with skeletons have JSDoc references
- **PR review time** for skeleton updates < 5 minutes

---

## Enforcement & Maintenance Guide

### Critical Patterns to Maintain

**1. PostList & PostListSkeleton Sync:**

```tsx
// ✅ CORRECT: PostListSkeleton matches PostList structure
<div className="space-y-4">  // Match container spacing
  <article className="group rounded-lg border overflow-hidden relative">
    <div className="absolute inset-0 z-0 bg-muted/20">  // Background
      <div className="absolute inset-0 bg-linear-to-b from-background/60..." />  // Gradient
    </div>
    <div className="relative z-10 p-3 sm:p-4">  // Content wrapper
      {/* Metadata, title, summary */}
    </div>
  </article>
</div>

// ❌ WRONG: Missing structural elements
<div className="space-y-6">  // Wrong spacing
  <article className="space-y-3">  // Missing border, background, z-index
    <Skeleton className="h-7 w-3/4" />
  </article>
</div>
```

**2. ProjectCard & ProjectCardSkeleton Sync:**

```tsx
// ✅ CORRECT: Grid gap must match
<div className="grid gap-4 sm:grid-cols-2">  // gap-4 not gap-5 or gap-6
  <ProjectCardSkeleton />
</div>

// ❌ WRONG: Mismatched grid gap
<div className="grid gap-6 md:grid-cols-2">  // Wrong gap and breakpoint
```

**3. Skeleton Component Class Usage:**

```tsx
// ✅ CORRECT: Use skeleton-shimmer class (current)
container.querySelectorAll('.skeleton-shimmer')

// ❌ WRONG: Don't use animate-pulse (deprecated)
container.querySelectorAll('[class*="animate-pulse"]')
```

**4. Card Component Selectors:**

```tsx
// ✅ CORRECT: Use data-slot attribute
container.querySelector('[data-slot="card"]')

// ❌ WRONG: Don't rely on class names
container.querySelector('[class*="rounded-lg"]')
// Card uses rounded-xl, not rounded-lg
```

**5. PageLayout Testing:**

```tsx
// ✅ CORRECT: PageLayout uses div with min-h-screen
container.querySelector('[class*="min-h-screen"]')

// ❌ WRONG: PageLayout doesn't render <main>
container.querySelector('main')
// <main> is in root layout, not PageLayout
```

### When Making Changes

**Before modifying any component:**

1. Check if it has a corresponding skeleton file
2. If yes, update both files with identical structure changes
3. Run `npm test skeleton-sync` to verify

**Common scenarios:**

- **Changing card padding:** Update both component and skeleton (e.g., `p-4` → `p-5`)
- **Changing grid gaps:** Update both component and skeleton (e.g., `gap-4` → `gap-6`)
- **Adding/removing elements:** Mirror changes in skeleton
- **Changing container spacing:** Update both (e.g., `space-y-4` → `space-y-6`)

### Quick Checklist

Before committing changes to components with skeletons:

- [ ] Updated skeleton file with same structural changes
- [ ] Verified spacing values match (padding, gaps, margins)
- [ ] Ran `npm test skeleton-sync` - all tests pass
- [ ] Visually tested loading state matches actual component
- [ ] Updated JSDoc comments if structure changed significantly

### CI/CD Integration

Skeleton sync tests run automatically in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run skeleton sync tests
  run: npm test skeleton-sync
```

Any failures block PR merges, ensuring skeletons stay in sync.

## Future Enhancements

1. **Automatic skeleton generation**
   - AI-powered skeleton generation from component JSX
   - Preserve structure, replace content with Skeleton components

2. **Real-time validation**
   - Dev server plugin that warns when skeleton is stale
   - Shows diff in browser dev tools

3. **Component library integration**
   - Storybook stories for all skeletons
   - Visual regression suite
   - Interactive comparison tool

---

## Related Documentation

- [Loading States Overview](/docs/components/loading-states.md)
- [Component Documentation Index](/docs/components/)
- [Mobile-First Optimization](/docs/design/mobile-first-optimization-analysis.md)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-04 | Adopt Strategy 1 (Visual Markers) | Quick to implement, low overhead, immediate value |
| 2025-11-04 | Add structural tests (Phase 3) | Automated validation worth investment for critical components |
| 2025-11-04 | Defer shared layout components | Wait for clear patterns to emerge before major refactor |
