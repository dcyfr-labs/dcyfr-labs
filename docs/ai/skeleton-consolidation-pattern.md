<!-- TLP:CLEAR -->

# Skeleton Consolidation Pattern

**Last Updated**: January 2, 2026
**Status**: ✅ **ACTIVE PATTERN** - Use for all new components

---

## Problem: Skeleton Drift

**Before consolidation**, we had two separate implementations for each component:

```tsx
// ❌ OLD PATTERN: Separate files that can drift
// Component: src/components/about/badge-wallet.tsx
export function BadgeWallet({ username, limit }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5" />
        <h3>Badges</h3>
        <Badge>{totalCount} Total</Badge>
      </div>
      {/* Grid of badges */}
    </div>
  );
}

// Skeleton: src/components/about/badge-wallet-skeleton.tsx (SEPARATE FILE!)
export function BadgeWalletSkeleton() {
  return (
    <div>
      <SkeletonHeading level="h2" /> {/* ❌ Wrong heading level! */}
      <Skeleton className="h-4" />   {/* ❌ Missing icon + badge! */}
      {/* Grid of skeleton cards */}
    </div>
  );
}
```

**Problems:**
1. ❌ **Skeleton drift** - structure gets out of sync when component changes
2. ❌ **Duplicate code** - same structure maintained in two places
3. ❌ **Layout shift** - skeleton doesn't match real component
4. ❌ **Extra files** - separate skeleton files to maintain
5. ❌ **Poor DX** - must import two components instead of one

---

## Solution: `loading` Prop Pattern

**After consolidation**, skeleton lives inside the component:

```tsx
// ✅ NEW PATTERN: Single source of truth
// Component: src/components/about/badge-wallet.tsx
interface BadgeWalletProps {
  username?: string;
  limit?: number;
  loading?: boolean; // ← ADD THIS
}

export function BadgeWallet({
  username = "dcyfr",
  limit,
  loading: loadingProp = false, // ← ADD THIS
}: BadgeWalletProps) {
  const { badges, loading: hookLoading, error } = useCredlyBadges({ username, limit });

  // Combine prop and hook loading states
  const loading = loadingProp || hookLoading;

  // Loading state - skeleton version matching EXACT structure
  if (loading) {
    return (
      <div className={cn(SPACING.subsection, className)}>
        {/* Header skeleton - MATCHES real component exactly */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <SkeletonHeading level="h3" width="w-32" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>

        {/* Badge grid skeleton - MATCHES real component exactly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit || 6)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="h-36 w-36 rounded-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Real component render (unchanged)
  return (
    <div className={cn(SPACING.subsection, className)}>
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>Badges</h3>
        <Badge variant="secondary">{totalCount} Total</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
      </div>
    </div>
  );
}
```

**Usage:**
```tsx
// In dynamic imports
const BadgeWallet = dynamic(
  () => import("@/components/about").then((mod) => ({ default: mod.BadgeWallet })),
  { loading: () => <BadgeWallet loading limit={6} /> } // ✅ Same component!
);

// Or directly
<BadgeWallet loading /> // Shows skeleton
<BadgeWallet username="dcyfr" /> // Shows real data
```

---

## Benefits

### 1. ✅ **No Skeleton Drift**
- Structure defined once
- Loading state always matches real component
- Update structure in one place

### 2. ✅ **Better DX**
```tsx
// Before: Import two components
import { BadgeWallet } from "@/components/about";
import { BadgeWalletSkeleton } from "@/components/about";

// After: Import one component
import { BadgeWallet } from "@/components/about";
<BadgeWallet loading />
```

### 3. ✅ **Zero Layout Shift**
- Skeleton uses exact same:
  - Grid layouts (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  - Spacing values (`SPACING.subsection`, `gap-4`)
  - Element heights (`h-36`, `h-5`, `h-4`)
  - Responsive breakpoints (`md:`, `lg:`)

### 4. ✅ **Fewer Files**
- Delete separate skeleton files
- Reduces codebase complexity
- Easier to find related code

### 5. ✅ **Type Safety**
- TypeScript ensures loading prop matches component props
- Can't forget to update skeleton when props change

---

## Implementation Checklist

When adding `loading` prop to a component:

### **Step 1: Add Loading Prop to Interface**
```tsx
interface ComponentProps {
  // ... existing props
  /** Loading state - renders skeleton version */
  loading?: boolean;
}
```

### **Step 2: Extract Loading State**
```tsx
export function Component({
  // ... existing props
  loading: loadingProp = false,
}: ComponentProps) {
  const { data, loading: hookLoading, error } = useData();

  // Combine prop and hook loading states
  const loading = loadingProp || hookLoading;
```

### **Step 3: Add Loading State Renderer**
Place **before** error/empty checks:
```tsx
  // Loading state - skeleton version matching real component structure
  if (loading) {
    return (
      <div className={/* Same container as real component */}>
        {/* Match EXACT structure of real component */}
        {/* Use Skeleton primitives */}
      </div>
    );
  }

  if (error) { /* ... */ }
  if (data.length === 0) { /* ... */ }
```

### **Step 4: Match Real Component Structure**
Critical elements to match:
- ✅ Container class names (spacing, padding)
- ✅ Grid layouts (columns, gaps)
- ✅ Flexbox arrangements
- ✅ Element heights
- ✅ Responsive breakpoints
- ✅ Header structure (icons, headings, badges)

### **Step 5: Add Stagger Effects (Optional)**
For lists/grids:
```tsx
{[...Array(count)].map((_, i) => (
  <div
    key={i}
    style={{
      animationDelay: `${i * 50}ms`, // Stagger effect
    }}
  >
    <Skeleton />
  </div>
))}
```

### **Step 6: Update Documentation**
Add loading state example to JSDoc:
```tsx
/**
 * Component Name
 *
 * **Loading State:**
 * Pass `loading={true}` to render skeleton version that matches the real component structure.
 * This ensures loading states never drift from the actual component layout.
 *
 * @example
 * // Show loading skeleton
 * <Component loading limit={6} />
 */
```

### **Step 7: Delete Old Skeleton File**
Once consolidated:
```bash
rm src/components/*/component-name-skeleton.tsx
```

Update index.ts to remove skeleton export:
```tsx
// Remove:
// export { ComponentNameSkeleton } from "./component-name-skeleton";
```

---

## When to Use This Pattern

### ✅ **Use `loading` Prop For:**

1. **Page-specific components**
   - Homepage sections (FeaturedPostHero, SeriesShowcase, etc.)
   - About page components (BadgeWallet, SkillsWallet)
   - Custom feature components

2. **Components with data fetching**
   - Components using hooks that return `loading` state
   - API-driven components

3. **Reusable feature components**
   - Card components with variable content
   - List components with dynamic data

### ❌ **Keep Separate Skeletons For:**

1. **Generic utility skeletons**
   - `FormSkeleton` - Generic form placeholder
   - `ChartSkeleton` - Generic chart placeholder
   - `DiagramSkeleton` - Generic diagram placeholder
   - `CommentSectionSkeleton` - Generic comments placeholder

   **Why?** These don't correspond to specific components; they're utilities used across multiple contexts.

2. **Layout skeletons**
   - `PageHero` - Already has `loading` prop ✅
   - `ArchiveHero` - Already has `loading` prop ✅
   - `ArticleLayout` - Already has `loading` prop ✅

   **Why?** Layout components already use this pattern!

---

## Examples from Codebase

### ✅ **Components Using This Pattern:**

1. **PageHero** ([src/components/layouts/page-hero.tsx](../../src/components/layouts/page-hero.tsx))
   ```tsx
   <PageHero loading variant="homepage" align="center" />
   ```

2. **ArchiveHero** ([src/components/layouts/archive-hero.tsx](../../src/components/layouts/archive-hero.tsx))
   ```tsx
   <ArchiveHero loading variant="full" />
   ```

3. **ProjectCard** ([src/components/projects/project-card.tsx](../../src/components/projects/project-card.tsx))
   ```tsx
   <ProjectCard loading />
   ```

4. **BadgeWallet** ([src/components/about/badge-wallet.tsx](../../src/components/about/badge-wallet.tsx)) - ✅ Just consolidated!
   ```tsx
   <BadgeWallet loading limit={6} />
   ```

5. **SkillsWallet** ([src/components/about/skills-wallet.tsx](../../src/components/about/skills-wallet.tsx)) - ✅ Just consolidated!
   ```tsx
   <SkillsWallet loading limit={6} />
   ```

---

## Migration Checklist

### **Completed** ✅
- [x] BadgeWallet
- [x] SkillsWallet
- [x] SeriesShowcase
- [x] ExploreCards
- [x] HomepageHeatmapMini
- [x] FeaturedPostHero
- [x] InfiniteActivitySection
- [x] **Homepage (src/app/page.tsx)** - Updated to use loading prop pattern
- [x] **Old skeleton file deleted** - Removed src/components/home/home-skeletons.tsx
- [x] **Index exports updated** - Removed skeleton exports from src/components/home/index.ts

### **Future Candidates**
- [ ] PostList
- [ ] BlogPost
- [ ] TrendingSection
- [ ] HomepageStats

### **Migration Complete** 🎉

All homepage components have been migrated to the `loading` prop pattern. The old skeleton files have been removed and the homepage now uses component-internal skeletons, ensuring zero skeleton drift going forward.

---

## Testing Skeleton Accuracy

After implementing `loading` prop, verify skeleton matches real component:

```bash
# 1. Run component in loading state
<Component loading />

# 2. Run component with real data
<Component {...realProps} />

# 3. Compare structure in DevTools
# - Same container dimensions?
# - Same grid columns?
# - Same element heights?
# - Same spacing?

# 4. Check for layout shift
# - Does content "jump" when loading → loaded?
# - Do scroll bars appear/disappear?
```

---

## Related Documentation

- [Animation System](./ANIMATION_SYSTEM_ANALYSIS.md) - Animation timing and stagger effects
- [Design System](./design-system.md) - Design tokens for consistent spacing
- [Best Practices](./best-practices.md) - General component patterns

---

## Enforcement

**This pattern is now the standard for all new components.**

When creating a new component that needs a loading state:
1. ✅ Add `loading?: boolean` prop
2. ✅ Implement skeleton inside component
3. ❌ Do NOT create separate skeleton file

When reviewing PRs:
- 🚫 Reject separate skeleton files for new components
- ✅ Require `loading` prop pattern instead
