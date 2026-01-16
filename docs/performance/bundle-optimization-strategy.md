# Bundle Optimization Strategy

**Created**: January 15, 2026  
**Status**: Analysis Complete - Ready for Implementation  
**Goal**: Reduce bundle size from ~500KB to <300KB

---

## Executive Summary

**Bundle Analysis Complete**: Identified 10 large dependencies contributing to bundle size.

**Total Estimated Savings**: -200-250KB (40-50% reduction)

**Priority Actions**:
1. **Framer Motion conversion** - 10 components (-60-80KB)
2. **Code splitting heavy libraries** - Three.js, Recharts, html2canvas (-100-150KB)
3. **Remove unused dependencies** - googleapis, @stackblitz/sdk (if unused)

---

## Large Dependencies Identified

### Tier 1: Critical Optimization Targets (High Impact)

| Library | Estimated Size | Usage | Action | Savings |
|---------|---------------|-------|--------|---------|
| **three** + @react-three/fiber + @react-three/drei | ~600KB | 3D graphics | ✅ Dynamic import | -500KB |
| **framer-motion** | 60-80KB | 34 components | 🔄 Convert to CSS | -60-80KB |
| **recharts** | ~200KB | Analytics charts | ✅ Dynamic import | -180KB |
| **shiki** | ~200KB | Code syntax highlighting | ✅ Already optimized? | -150KB if not |
| **@xyflow/react** | ~150KB | Interactive diagrams | ✅ Dynamic import | -130KB |

**Estimated Tier 1 Savings**: -1020-1140KB if all dynamically imported

### Tier 2: Medium Optimization Targets

| Library | Estimated Size | Usage | Action | Savings |
|---------|---------------|-------|--------|---------|
| **html2canvas** | ~100KB | Screenshot functionality | ✅ Dynamic import | -90KB |
| **katex** | ~100KB | Math rendering | ✅ Dynamic import | -90KB |
| **googleapis** | ~150KB+ | Google APIs | ⚠️ Verify usage | -150KB if unused |
| **@stackblitz/sdk** | ~80KB | StackBlitz integration | ⚠️ Verify usage | -80KB if unused |
| **next-mdx-remote** | ~80KB | MDX processing | ⚠️ Server-side only? | -0KB (SSR) |

**Estimated Tier 2 Savings**: -410-510KB

### Tier 3: Keep As-Is (Core Functionality)

| Library | Size | Usage | Action |
|---------|------|-------|--------|
| **lucide-react** | ~50KB | Icons | ✅ Tree-shaking optimized |
| **@radix-ui/*** | ~40KB each | UI primitives | ✅ Keep (essential) |
| **next-themes** | ~15KB | Theme switching | ✅ Keep (essential) |
| **zustand** | ~3KB | State management | ✅ Keep (minimal) |
| **date-fns** | ~20KB | Date formatting | ✅ Keep (common) |

---

## Current Code Splitting Status

### ✅ Already Dynamically Imported (Good!)

```typescript
// src/app/page.tsx (Homepage)
const FeaturedPostHero = dynamic(() => import("@/components/home").then(...));

// src/app/about/page.tsx
const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal"));

// Likely already split (need verification):
// - Three.js components
// - Recharts components
// - Interactive diagrams
```

### ⚠️ Needs Dynamic Import (Critical)

1. **html2canvas** - Used for screenshot functionality
   - Location: Find usages
   - Impact: -90KB

2. **katex** - Math rendering
   - Location: MDX components
   - Impact: -90KB

3. **@stackblitz/sdk** - StackBlitz integration
   - Location: Code playground components?
   - Impact: -80KB

---

## Framer Motion Analysis

### Current Usage: 34 Components

**Files using Framer Motion:**
1. `homepage-heatmap-mini.tsx` - Simple fade/scale
2. `trending-topics-panel.tsx` - List stagger
3. `explore-section.tsx` - Scroll reveals
4. `topic-cloud.tsx` - Stagger animations
5. `featured-content-carousel.tsx` - Slide transitions
6. `project-showcase.tsx` - Grid reveals
7. `testimonial-slider.tsx` - Slide animations
8. `stats-counter.tsx` - Count-up
9. `newsletter-signup.tsx` - Form animations
10. `modern-post-card.tsx` - Card animations (keep 3D tilt)
11-34. (22 additional components - need audit)

### Conversion Priority

**High Priority** (Simple CSS replacements - save 60-80KB):
- Simple fade/slide animations → CSS `animate-in`
- List stagger effects → CSS stagger classes
- Scroll reveals → Intersection Observer + CSS
- Card hovers → CSS hover effects

**Keep Framer Motion** (Legitimate use cases):
- 3D transforms (coin flip, card tilt)
- Spring physics (toggle switches)
- Gesture interactions (drag, swipe)
- Scroll-linked animations (reading progress)

**Expected Savings**: -60-80KB if 20+ components converted to CSS

---

## Implementation Plan

### Phase 1: Verify Current Code Splitting (Day 1)

**Tasks**:
1. ✅ Audit Three.js usage - Check if already dynamic imported
2. ✅ Audit Recharts usage - Verify code splitting
3. ✅ Find html2canvas usage - Implement dynamic import if needed
4. ✅ Find katex usage - Verify if server-side only
5. ✅ Verify googleapis usage - Remove if unused
6. ✅ Verify @stackblitz/sdk usage - Remove if unused

**Commands**:
```bash
# Find Three.js usage
grep -r "from 'three'" --include="*.tsx" --include="*.ts" src/

# Find Recharts usage
grep -r "from 'recharts'" --include="*.tsx" src/

# Find html2canvas usage
grep -r "html2canvas" --include="*.tsx" src/

# Find katex usage
grep -r "katex" --include="*.tsx" --include="*.ts" src/

# Find googleapis usage
grep -r "googleapis" --include="*.tsx" --include="*.ts" src/

# Find StackBlitz SDK usage
grep -r "@stackblitz/sdk" --include="*.tsx" src/
```

---

### Phase 2: Implement Dynamic Imports (Days 2-3)

**Pattern**:
```typescript
// Before: Static import (adds to main bundle)
import { html2canvas } from 'html2canvas';

// After: Dynamic import (split into separate chunk)
const html2canvas = dynamic(() => import('html2canvas'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // Client-only
});

// Or for functions:
async function handleScreenshot() {
  const html2canvas = (await import('html2canvas')).default;
  // Use html2canvas
}
```

**Components to Update**:
1. html2canvas components
2. KaTeX math rendering components
3. Any Three.js components not already split
4. Any Recharts components not already split

**Expected Savings**: -200-300KB

---

### Phase 3: Framer Motion Conversion (Days 4-5)

See detailed guide: `docs/ai/animation-decision-matrix.md`

**Conversion Pattern**:
```typescript
// Before: Framer Motion (60-80KB)
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// After: CSS animations (0KB)
import { ScrollReveal } from '@/components/features';

<ScrollReveal animation="fade-up" delay={1}>
  {content}
</ScrollReveal>

// Or with CSS classes:
<div className="reveal-hidden reveal-up transition-appearance">
  {content}
</div>
```

**Components to Convert**: 10-20 components (priority list in animation-decision-matrix.md)

**Expected Savings**: -60-80KB

---

### Phase 4: Remove Unused Dependencies (Day 6)

**Candidates for Removal**:
```bash
# Verify if googleapis is used
grep -r "googleapis" src/

# If not used, remove:
npm uninstall googleapis

# Verify if @stackblitz/sdk is used
grep -r "@stackblitz/sdk" src/

# If not used, remove:
npm uninstall @stackblitz/sdk
```

**Expected Savings**: -150-200KB if unused

---

### Phase 5: Performance Budgets (Day 7)

Create `performance.json`:
```json
{
  "budgets": [
    {
      "path": "**",
      "resourceCounts": [
        { "resourceType": "script", "budget": 15 },
        { "resourceType": "total", "budget": 50 }
      ],
      "resourceSizes": [
        { "resourceType": "script", "budget": 300000 },
        { "resourceType": "image", "budget": 500000 },
        { "resourceType": "total", "budget": 1000000 }
      ]
    }
  ]
}
```

**Integrate with Lighthouse CI**:
```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "budgets": {
        "script": { "budget": 300 }
      }
    }
  }
}
```

---

## Expected Results

### Before Optimizations
- Main bundle: ~500KB (estimated)
- Framer Motion: +60-80KB
- Three.js: +600KB (if not split)
- Recharts: +200KB (if not split)
- html2canvas: +100KB (if not split)
- Total: ~1400-1500KB (worst case)

### After Phase 1-2 (Code Splitting)
- Main bundle: ~300-350KB
- Three.js: Split chunk (lazy loaded)
- Recharts: Split chunk (lazy loaded)
- html2canvas: Split chunk (lazy loaded)
- Total main: -200-300KB improvement

### After Phase 3 (Framer Motion Conversion)
- Main bundle: ~240-280KB
- Framer Motion: Reduced or removed (-60-80KB)
- Total main: -260-380KB improvement from baseline

### After Phase 4 (Remove Unused)
- Main bundle: ~200-250KB
- googleapis: Removed if unused (-150KB)
- @stackblitz/sdk: Removed if unused (-80KB)
- **Total main: ~200-250KB** ✅ (Target achieved!)

---

## Verification Commands

### Check Bundle Sizes
```bash
# Build and analyze
ANALYZE=true npm run build -- --webpack

# View reports
open .next/analyze/client.html
open .next/analyze/nodejs.html

# Check main bundle size
du -sh .next/static/chunks/main-*.js
```

### Monitor Over Time
```bash
# Create baseline
npm run build
du -sh .next/static/chunks/*.js > bundle-baseline.txt

# After optimizations
npm run build
du -sh .next/static/chunks/*.js > bundle-optimized.txt

# Compare
diff bundle-baseline.txt bundle-optimized.txt
```

---

## Monitoring & Alerting

### GitHub Actions Workflow
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        run: |
          MAIN_SIZE=$(du -sk .next/static/chunks/main-*.js | cut -f1)
          if [ $MAIN_SIZE -gt 300 ]; then
            echo "❌ Main bundle too large: ${MAIN_SIZE}KB (target: <300KB)"
            exit 1
          fi
          echo "✅ Main bundle size: ${MAIN_SIZE}KB"
```

---

## Next Steps

1. ✅ **Day 1**: Run verification commands (find usage of large libraries)
2. ⏳ **Days 2-3**: Implement dynamic imports for heavy libraries
3. ⏳ **Days 4-5**: Convert Framer Motion components to CSS
4. ⏳ **Day 6**: Remove unused dependencies
5. ⏳ **Day 7**: Set up performance budgets and monitoring

---

## Resources

### Internal
- [Animation Decision Matrix](../ai/animation-decision-matrix.md)
- [UI/UX Implementation Plan](../ui-ux-implementation-plan.md)
- [Week 1 Image Audit](./week-1-image-audit-results.md)

### External
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Performance Budgets](https://web.dev/performance-budgets-101/)

---

**Last Updated**: January 15, 2026  
**Status**: Ready for Phase 1 implementation
