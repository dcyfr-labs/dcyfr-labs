# Lighthouse Performance Issues - /activity Page Remediation Guide

**Page:** `/activity`  
**Current Performance Score:** 0.51 / 1.0  
**Target Performance Score:** ≥ 0.9  
**Status:** IN PROGRESS  
**Created:** 2026-01-14  

---

## Executive Summary

The `/activity` page has significant performance issues preventing it from passing Lighthouse CI checks. This document provides a comprehensive remediation plan with prioritized fixes.

### Key Metrics

| Metric | Current | Target | Priority | Estimated Impact |
|--------|---------|--------|----------|------------------|
| **Performance Score** | 0.51 | ≥0.9 | 🔴 CRITICAL | +0.39 |
| **LCP** (Largest Contentful Paint) | 0.08 | ≥0.9 | 🔴 CRITICAL | Major |
| **BF-Cache** | 0 | ≥0.9 | 🔴 CRITICAL | High |
| **Console Errors** | 0 | ≥0.9 | 🔴 CRITICAL | High |
| **Render-Blocking Resources** | 4 | 0 | 🟠 HIGH | Very High |
| **Unused JavaScript** | 6 chunks | 0 | 🟠 HIGH | High |
| **DOM Size** | Excessive | Normal | 🟠 HIGH | Medium |
| **Heading Order** | Invalid | Valid | 🟡 MEDIUM | Medium |
| **Legacy JavaScript** | 3 chunks | 0 | 🟡 MEDIUM | Medium |
| **Image Delivery** | 0.5 | ≥0.9 | 🟡 MEDIUM | Medium |

---

## Root Cause Analysis

### 1. 🔴 CRITICAL: Render-Blocking Resources (4 identified)

**Issue:** 4 CSS or JavaScript resources are blocking page render

**Likely Causes:**
- Global CSS imports in layout or page
- Synchronous script tags
- Inline critical styles not extracted
- Font loading strategy (swap vs block)

**Impact:** Delays First Contentful Paint (FCP) and Largest Contentful Paint (LCP)

**Files to Check:**
- `src/app/layout.tsx` - Global stylesheets
- `src/app/activity/page.tsx` - Page-specific styles
- `next.config.ts` - Font configuration
- CSS imports in components

---

### 2. 🔴 CRITICAL: Console Errors (Blocking BF-Cache)

**Issue:** Unhandled errors logged to browser console prevent back/forward cache

**Common Causes:**
- Unhandled Promise rejections
- `unload` event listeners
- `beforeunload` handlers
- Synchronous XHR
- Service worker issues

**Impact:** 
- Page can't be cached in BF-Cache
- Each navigation requires full reload
- Performance regression on repeated visits

**Files to Check:**
- `src/app/activity/activity-client.tsx`
- Activity-related hooks
- Event listeners in components

---

### 3. 🔴 CRITICAL: Legacy JavaScript (3 chunks)

**Issue:** 3 chunks contain unused legacy JavaScript targeting older browsers

**Likely Causes:**
- Polyfills not being tree-shaken
- ES5 builds included
- Babel preset configuration
- Unused dependencies

**Impact:** Extra ~50-100KB uncompressed (estimate)

---

### 4. 🟠 HIGH: Unused JavaScript (6 chunks)

**Issue:** 6 JavaScript chunks contain unused code on this page

**Likely Causes:**
- Large components not lazy-loaded
- Library imports not tree-shaken
- Unused feature code bundled
- Dynamic imports not split properly

**Impact:** ~100-200KB uncompressed per chunk (estimate)

**Files to Check:**
- Component imports in `activity-client.tsx`
- Library usage in activity components
- Conditional component rendering

---

### 5. 🟠 HIGH: Excessive DOM Size

**Issue:** DOM has more nodes than recommended

**Recommended:** < 1500 nodes  
**Current:** Likely 2000+ (estimated from 0.5 score)

**Likely Causes:**
- Large activity lists rendered all at once
- No virtualization
- Hidden elements still in DOM
- Deeply nested components

**Impact:**
- Slower script execution
- Higher memory usage
- Slower repaint/reflow

**Files to Check:**
- `src/app/activity/activity-client.tsx` - Threading logic
- `VirtualActivityFeed.tsx` - If not being used
- Thread/reply rendering

---

### 6. 🟡 MEDIUM: Heading Order Violation

**Issue:** Heading hierarchy is not sequential

**Expected:** h1 → h2 → h3 (skip allowed)  
**Problem:** Likely skipping levels or wrong order

**Impact:** Accessibility issue, SEO impact

**Files to Check:**
- `src/app/activity/page.tsx` - Hero heading
- Activity filter components
- Thread/activity item headings

---

### 7. 🟡 MEDIUM: Accessibility Name Mismatch

**Issue:** Elements with visible text don't match accessible names

**Likely Causes:**
- Missing `aria-label` on button-like divs
- Label text doesn't match aria-label
- Icon-only buttons without labels

**Impact:** Screen reader accessibility

---

## Remediation Plan (Prioritized)

### Phase 1: CRITICAL Issues (Est. 4 hours)

#### Fix 1: Eliminate Render-Blocking Resources

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1.5 hours  
**Expected Impact:** +0.15-0.20 to performance score

**Steps:**

1. **Identify Blocking Resources:**
   ```bash
   # Run Lighthouse locally
   npm run build
   npx lighthouse http://localhost:3000/activity --emulated-form-factor=none
   ```
   Look for "Render Blocking Resources" section in HTML report

2. **Defer Non-Critical CSS:**
   - Move non-critical styles to separate files
   - Use `media="print"` or `media="(prefers-color-scheme: dark)"` for conditional loading
   - Example:
   ```tsx
   // In layout.tsx
   <link rel="stylesheet" href="/styles/global.css" />
   <link rel="stylesheet" href="/styles/print.css" media="print" />
   ```

3. **Optimize Font Loading:**
   - Already using `display: "optional"` (good!)
   - Consider `display: "swap"` for Geist Sans
   - May need adjustment in `next.config.ts`

4. **Defer Non-Critical JavaScript:**
   - Lazy-load analytics scripts
   - Defer search functionality script loading
   - Example:
   ```tsx
   // Defer search until user needs it
   const SearchProvider = dynamic(() => import('./SearchProvider'), {
     ssr: false,
     loading: () => null // Or minimal loading state
   });
   ```

**Success Criteria:**
- All render-blocking resources eliminated
- First paint < 2.0s
- First contentful paint < 3.0s

---

#### Fix 2: Debug and Fix Console Errors

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1.5 hours  
**Expected Impact:** +0.20-0.25 to performance score (enables BF-Cache)

**Steps:**

1. **Identify Errors:**
   - Open DevTools on /activity page
   - Look for red error messages in Console
   - Document exact errors

2. **Common Fixes:**

   **If unload listener error:**
   ```tsx
   // BAD - prevents BF-cache
   useEffect(() => {
     window.addEventListener('unload', cleanup);
     return () => window.removeEventListener('unload', cleanup);
   }, []);

   // GOOD - use pagehide instead
   useEffect(() => {
     window.addEventListener('pagehide', cleanup);
     return () => window.removeEventListener('pagehide', cleanup);
   }, []);
   ```

   **If unhandled Promise rejection:**
   ```tsx
   // Add .catch() to all promises
   Promise.resolve(transformActivities())
     .then(...)
     .catch(err => console.error('Activity load failed:', err));
   ```

3. **Verify No BF-Cache Blockers:**
   - No unload/beforeunload listeners
   - No sync XHR
   - No unhandled rejections

**Success Criteria:**
- Zero errors in console
- BF-Cache score ≥ 0.9
- Page passes `pagehide` event listeners (not `unload`)

---

#### Fix 3: Remove Unused JavaScript

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1 hour  
**Expected Impact:** +0.10 to performance score

**Steps:**

1. **Identify Unused Code:**
   ```bash
   # Run bundle analysis
   ANALYZE=true npm run build
   # Look for large unused chunks in webpack-bundle-analyzer
   ```

2. **Common Culprits:**
   - Unused activity filter options
   - Unused sorting strategies
   - Unused visualization components
   - Heavy dependencies imported but not used

3. **Fix Strategies:**

   **Strategy A: Lazy Load Components**
   ```tsx
   // Instead of:
   import { HeavyVisualization } from '@/components/activity';

   // Do:
   const HeavyVisualization = dynamic(() => 
     import('@/components/activity').then(m => m.HeavyVisualization),
     { ssr: false }
   );
   ```

   **Strategy B: Remove Unused Dependencies**
   ```bash
   # Check if dependencies are used
   npx depcheck
   # Remove unused ones
   npm uninstall unused-package
   ```

4. **Tree-shake Unused Code:**
   - Ensure `sideEffects: false` in package.json
   - Use barrel exports correctly
   - Import only what you need

**Success Criteria:**
- All 6 unused JavaScript chunks eliminated or significantly reduced
- Bundle size < 150KB first load (including runtime)

---

### Phase 2: HIGH Priority Issues (Est. 2 hours)

#### Fix 4: Reduce Excessive DOM Size

**Priority:** 🟠 HIGH  
**Estimated Time:** 1.5 hours  
**Expected Impact:** +0.08 to performance score

**Steps:**

1. **Current Implementation Review:**
   - `VirtualActivityFeed.tsx` exists but may not be used
   - Check if virtualization is implemented

2. **Implement Virtual Scrolling (if not present):**
   ```tsx
   // Use existing VirtualActivityFeed
   import { VirtualActivityFeed } from '@/components/activity';

   // Or use a library like react-window
   import { FixedSizeList } from 'react-window';
   ```

3. **Hide Non-Visible Content:**
   ```tsx
   // Instead of rendering all replies, show collapsed by default
   <ThreadedActivityGroup thread={thread} initialCollapsed={true} />
   ```

4. **Lazy Load Activity Details:**
   - Load full thread details on demand
   - Show summary by default

**Success Criteria:**
- DOM size < 1500 nodes
- DOM audit score ≥ 0.9

---

#### Fix 5: Optimize Image Delivery

**Priority:** 🟠 HIGH  
**Estimated Time:** 0.5 hours  
**Expected Impact:** +0.05 to performance score

**Steps:**

1. **Check Image Formats:**
   - Ensure AVIF/WebP formats are used (already in next.config.ts)
   - Verify images are optimized
   - Check responsive sizing

2. **Add Responsive Images:**
   ```tsx
   <Image
     src={url}
     alt={alt}
     width={800}
     height={600}
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     priority={false}
   />
   ```

3. **Lazy Load Images:**
   - Below-fold images should use `priority={false}`
   - Consider `loading="lazy"`

**Success Criteria:**
- Image delivery score ≥ 0.9

---

### Phase 3: MEDIUM Priority Issues (Est. 1 hour)

#### Fix 6: Fix Heading Order

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 0.5 hours  
**Expected Impact:** +0.05 to performance score

**Steps:**

1. **Audit Page Structure:**
   - Hero section has h1? → Yes (should be in `ArchiveHero`)
   - Activity filters have h2? → Check
   - Thread titles have h2/h3? → Check

2. **Fix Heading Hierarchy:**
   ```tsx
   // BAD: h1 → h3 (skipping h2)
   <h1>Activity</h1>
   <h3>Search</h3>

   // GOOD: h1 → h2 → h3
   <h1>Activity</h1>
   <h2>Filters</h2>
   <h3>Thread Title</h3>
   ```

**Success Criteria:**
- All headings in sequential order
- Heading order score ≥ 0.9

---

#### Fix 7: Fix Accessibility Label Mismatches

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 0.5 hours  
**Expected Impact:** +0.05 to performance score

**Steps:**

1. **Find Mismatches:**
   - Look for `aria-label` attributes
   - Verify label matches visible text
   - Check button labels

2. **Fix Examples:**
   ```tsx
   // BAD: Label doesn't match visible text
   <button aria-label="Sort by date">⬆️</button>

   // GOOD: Label matches intent
   <button aria-label="Sort activities by date">
     <SortIcon />
   </button>
   ```

3. **Or remove redundant labels:**
   ```tsx
   // If label is already visible, don't need aria-label
   <button>Sort by date</button>  // Accessible!
   ```

**Success Criteria:**
- All labels match accessible names
- Label-content-name-mismatch score = 0 violations

---

### Phase 4: LOW Priority Issues (Est. 0.5 hours)

#### Fix 8: Remove Legacy JavaScript

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 0.5 hours  
**Expected Impact:** +0.03-0.05 to performance score

**Steps:**

1. **Check Babel Configuration:**
   - Review `.babelrc` or Babel config in Next.js
   - Ensure `target: 'es2020'` or higher
   - Remove es5 preset

2. **Check Dependencies:**
   - Look for old polyfills
   - Check if `core-js` is needed
   - Update packages

3. **Verify Build Output:**
   ```bash
   npm run build
   # Check .next/static/chunks/ for legacy code
   ```

**Success Criteria:**
- 0 legacy JavaScript chunks
- Modern browser compatibility maintained

---

## Validation Checklist

### Before Starting
- [ ] Clone latest code
- [ ] Run `npm ci` (clean install)
- [ ] Run `npm run build` (successful)
- [ ] Locally test `/activity` page loads

### During Implementation
- [ ] Each fix is committed separately
- [ ] Tests still pass after each fix
- [ ] No new console errors introduced

### After Each Fix Phase
- [ ] Run Lighthouse: `npm run lighthouse:ci`
- [ ] Verify performance score improved
- [ ] Check no regressions in other pages

### Final Validation
- [ ] Performance score ≥ 0.90
- [ ] All Lighthouse best practices passing
- [ ] Tests pass: `npm run test:run`
- [ ] No visual regressions
- [ ] Page loads in < 3 seconds

---

## Tools & Commands

```bash
# Build production bundle
npm run build

# Run Lighthouse locally
npx lighthouse http://localhost:3000/activity \
  --output-path=./lighthouse-report.html \
  --emulated-form-factor=none

# Run full Lighthouse CI pipeline
npm run lighthouse:ci

# Analyze bundle size
ANALYZE=true npm run build

# Check for unused dependencies
npx depcheck

# Run performance checks
npm run perf:check
```

---

## Related Files

| File | Purpose |
|------|---------|
| `src/app/activity/page.tsx` | Server page component |
| `src/app/activity/activity-client.tsx` | Client component with filters |
| `src/components/activity/` | Activity-related components |
| `next.config.ts` | Build and performance settings |
| `src/app/layout.tsx` | Global layout and styles |
| `lighthouserc.json` | Lighthouse CI configuration |

---

## Success Metrics

### Target Performance Score: ≥ 0.90

**Timeline:**
- Phase 1 (Critical): 4 hours → +0.45-0.55 expected
- Phase 2 (High): 2 hours → +0.13 expected
- Phase 3 (Medium): 1 hour → +0.10 expected
- Phase 4 (Low): 0.5 hours → +0.03-0.05 expected

**Total Expected:** 7.5 hours of work → 0.51 → 0.92-0.95 score

---

## References

- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Render-Blocking Resources](https://developer.chrome.com/docs/lighthouse/performance/render-blocking-resources/)
- [BF-Cache Guide](https://web.dev/bfcache/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

---

**Status:** Ready for implementation  
**Last Updated:** 2026-01-14  
**Owner:** Performance team
