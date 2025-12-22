# /dev/docs Complete Refactor Plan

**Created:** December 22, 2025  
**Status:** Planning  
**Priority:** HIGH

---

## 🚨 Current Issues

### 1. Performance Problems
- **Symptom:** Pages loading slowly, "loading over and over again"
- **Root Cause:** 
  - Client components re-rendering unnecessarily
  - No memoization on expensive operations
  - State resetting on every navigation
  - Previously had `generateStaticParams()` pre-compiling all pages (now fixed with ISR)

### 2. MDX Compilation Errors
- **Symptom:** `Unexpected character '5' (U+0035) before name`
- **Example:** `/dev/docs/troubleshooting/linkedin-oauth-fetch-failed-fix`
- **Root Cause:** Markdown syntax with numbers in section headers being misinterpreted by MDX
  - Section headers like `### Network Connection Failed (503)` 
  - Numbered lists starting with patterns like `1. **Item**` inside sections
  - MDX parser treating `(503)` or similar patterns as potential JSX elements

### 3. Layout Too Narrow
- **Symptom:** Content cramped, doesn't fit properly
- **Current:** Uses `CONTAINER_WIDTHS.archive` in 3-column grid
- **Need:** Dashboard-style wide layout for better content display

---

## 🎯 Refactor Goals

1. ✅ **Instant startup** - Already implemented on-demand ISR
2. 🔄 **Eliminate re-renders** - Optimize state and component structure
3. 🔄 **Fix MDX errors** - Sanitize markdown syntax
4. 🔄 **Wider layout** - Dashboard-style presentation
5. 🔄 **Graceful error handling** - MDX error boundaries

---

## 📋 Implementation Plan

### Phase 1: Fix Critical MDX Errors (HIGH PRIORITY)

**Goal:** Make all pages render without errors

**Tasks:**

1. **Sanitize problematic markdown files**
   - Fix: `docs/troubleshooting/linkedin-oauth-fetch-failed-fix.md`
   - Pattern: Section headers with status codes `(503)` → `Status 503`
   - Pattern: Numbered lists inside sections → Use `-` bullets or ensure proper spacing
   
2. **Create MDX sanitization script**
   ```bash
   scripts/sanitize-mdx-content.mjs
   ```
   - Scans all `.md` files in `docs/`
   - Detects problematic patterns:
     - `### Title (123)` → `### Title - Code 123`
     - Improper numbered list nesting
     - Invalid JSX-like syntax
   - Auto-fixes or reports issues

3. **Add MDX validation to pre-commit**
   - Run sanitization check before commit
   - Fail if invalid MDX syntax detected

**Success Criteria:**
- ✅ All doc pages render without MDX errors
- ✅ No "Unexpected character" errors
- ✅ Sanitization script in place

---

### Phase 2: Implement Error Boundaries (MEDIUM PRIORITY)

**Goal:** Gracefully handle MDX errors without breaking the entire page

**Tasks:**

1. **Create `MDXErrorBoundary` component**
   ```tsx
   // src/components/dev/mdx-error-boundary.tsx
   'use client';
   
   export function MDXErrorBoundary({ 
     children, 
     fallback 
   }: { 
     children: React.ReactNode; 
     fallback?: React.ReactNode;
   }) {
     // Catch MDX compilation errors
     // Show helpful error message with:
     // - File path
     // - Line number (if available)
     // - Error message
     // - Link to MDX troubleshooting docs
   }
   ```

2. **Wrap MDX rendering in page.tsx**
   ```tsx
   <MDXErrorBoundary
     fallback={<MDXErrorFallback doc={doc} />}
   >
     <MDX source={doc.content} />
   </MDXErrorBoundary>
   ```

3. **Create helpful error fallback UI**
   - Show doc metadata (title, path, category)
   - Display sanitized error message
   - Provide "View Raw Markdown" link
   - Suggest fixes for common issues

**Success Criteria:**
- ✅ MDX errors don't crash entire page
- ✅ Helpful error messages shown
- ✅ User can still navigate sidebar

---

### Phase 3: Optimize Performance & Re-renders (HIGH PRIORITY)

**Goal:** Eliminate "loading over and over" issue

**Current Problems:**

1. **Sidebar state resets on navigation**
   - `expandedCategories` state in `DocSidebar` resets
   - User loses their place when navigating

2. **Components re-render unnecessarily**
   - No memoization on doc lists
   - Sidebar rebuilds category tree on every render

3. **Expensive operations repeated**
   - `getAllDocs()` called multiple times
   - Category grouping recalculated

**Tasks:**

1. **Memoize expensive operations**
   ```tsx
   // In DocSidebar
   const docsByCategory = useMemo(
     () => docsInFolders.reduce((acc, doc) => { ... }),
     [docsInFolders]
   );
   ```

2. **Persist sidebar state**
   ```tsx
   // Option A: localStorage (faster, client-only)
   const [expandedCategories, setExpandedCategories] = useLocalStorage<Set<string>>(
     'docs-expanded-categories',
     new Set()
   );
   
   // Option B: URL params (shareable, SSR-friendly)
   const router = useRouter();
   const searchParams = useSearchParams();
   const expandedCategories = new Set(searchParams.get('expanded')?.split(',') || []);
   ```

3. **Implement React.memo on components**
   ```tsx
   export const DocSidebar = React.memo(function DocSidebar({ ... }) { ... });
   export const DocTableOfContents = React.memo(function DocTableOfContents({ ... }) { ... });
   ```

4. **Cache doc listings**
   ```tsx
   // In docs.ts
   let docsCache: DocFile[] | null = null;
   let docsCacheTime: number = 0;
   const CACHE_TTL = 60_000; // 1 minute in dev
   
   export function getAllDocs(): DocFile[] {
     const now = Date.now();
     if (docsCache && (now - docsCacheTime) < CACHE_TTL) {
       return docsCache;
     }
     docsCache = readDocsRecursive(...);
     docsCacheTime = now;
     return docsCache;
   }
   ```

**Success Criteria:**
- ✅ Sidebar state persists across navigation
- ✅ No unnecessary re-renders
- ✅ Doc listing cached properly
- ✅ Page feels snappy

---

### Phase 4: Wider Dashboard-Style Layout (MEDIUM PRIORITY)

**Goal:** Accommodate wider content without horizontal scroll

**Current Layout:**
```tsx
// DocsLayout.tsx
<div className={cn("container mx-auto", CONTAINER_WIDTHS.archive, CONTAINER_PADDING)}>
  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_200px] gap-4">
    <div>Sidebar</div>
    <main>Content</main>
    <div>TOC</div>
  </div>
</div>
```

**Problems:**
- `CONTAINER_WIDTHS.archive` = `max-w-6xl` (1152px) → too narrow
- 3-column grid leaves ~600px for main content → cramped
- Code blocks and tables overflow

**New Layout:**

```tsx
// Option A: Full-width with padding
<div className="container mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8">
  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_240px] gap-6">
    <div>Sidebar (280px)</div>
    <main className="min-w-0 max-w-4xl">Content (flexible, max 896px)</main>
    <div className="hidden xl:block">TOC (240px, hidden on lg)</div>
  </div>
</div>

// Option B: Sidebar-as-overlay on smaller screens
<div className="flex">
  <aside className="w-64 fixed left-0 top-16 h-screen">Sidebar</aside>
  <main className="ml-64 flex-1 max-w-5xl mx-auto px-8">Content</main>
  <aside className="w-64 fixed right-0 top-16">TOC</aside>
</div>
```

**Recommendation: Option A**
- Responsive breakpoints
- Works on all screen sizes
- Cleaner implementation

**Tasks:**

1. **Update DocsLayout.tsx**
   - Change container width to `max-w-[1600px]` or `max-w-7xl`
   - Adjust grid columns: `lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_240px]`
   - Increase gap to `gap-6` or `gap-8`

2. **Update main content max-width**
   ```tsx
   <main className="min-w-0 max-w-4xl lg:max-w-5xl">
     {children}
   </main>
   ```

3. **Make TOC responsive**
   ```tsx
   <div className="hidden xl:block sticky top-24">
     <DocTableOfContents headings={tableOfContents} />
   </div>
   ```

4. **Add mobile TOC option**
   - Show TOC at top of content on mobile
   - Or make it a collapsible section

**Success Criteria:**
- ✅ Content has 800-1000px width on large screens
- ✅ No horizontal scroll
- ✅ Responsive on all screen sizes
- ✅ Sidebar and TOC don't crowd content

---

### Phase 5: Additional Optimizations (LOW PRIORITY)

**Goal:** Polish and long-term improvements

**Tasks:**

1. **Implement search indexing**
   - Pre-build search index from all docs
   - Use Fuse.js or similar for client-side search
   - Cache search results

2. **Add loading states**
   - Show skeleton loaders while content loads
   - Progressive enhancement

3. **Implement doc versioning**
   - Track doc version in frontmatter
   - Show "updated" badge for recent changes

4. **Add analytics**
   - Track most-viewed docs
   - Identify pages with high bounce rates
   - Monitor search queries

5. **Create doc templates**
   - Template for troubleshooting docs
   - Template for API reference
   - Template for guides

**Success Criteria:**
- ✅ Search is fast and accurate
- ✅ Loading states enhance UX
- ✅ Analytics provide insights

---

## 🔧 Technical Details

### Files to Modify

**High Priority:**
1. `docs/troubleshooting/linkedin-oauth-fetch-failed-fix.md` - Fix MDX syntax
2. `src/app/dev/docs/[[...slug]]/page.tsx` - Add error boundaries, optimize
3. `src/components/layouts/docs-layout.tsx` - Widen layout
4. `src/components/dev/docs-components.tsx` - Optimize sidebar, memoize

**Medium Priority:**
5. `src/lib/docs.ts` - Add caching for getAllDocs()
6. `src/components/dev/mdx-error-boundary.tsx` - Create new component
7. `scripts/sanitize-mdx-content.mjs` - Create new script

### New Files to Create

1. `src/components/dev/mdx-error-boundary.tsx` - Error boundary component
2. `src/components/dev/mdx-error-fallback.tsx` - Error UI component
3. `scripts/sanitize-mdx-content.mjs` - MDX validation script
4. `src/hooks/use-local-storage.ts` - Persistent state hook (if using localStorage)

### Dependencies to Add

```json
{
  "dependencies": {
    "use-local-storage-state": "^19.4.0" // If using localStorage approach
  }
}
```

---

## 🚀 Implementation Order

### Week 1: Critical Fixes
- [ ] Day 1-2: Fix MDX errors (Phase 1)
- [ ] Day 3-4: Add error boundaries (Phase 2)
- [ ] Day 5: Testing and validation

### Week 2: Performance & Layout
- [ ] Day 1-2: Optimize performance (Phase 3)
- [ ] Day 3-4: Widen layout (Phase 4)
- [ ] Day 5: Testing and refinement

### Week 3: Polish (Optional)
- [ ] Additional optimizations (Phase 5)
- [ ] Documentation
- [ ] Monitoring

---

## 📊 Success Metrics

### Before Refactor
- ❌ Dev server hang: ~3-5 minutes (generateStaticParams)
- ❌ MDX errors: 1+ critical page
- ❌ Re-renders: Sidebar resets on navigation
- ❌ Content width: ~600px (cramped)
- ❌ Error handling: Page crash on MDX error

### After Refactor (Targets)
- ✅ Dev server start: <5 seconds (already achieved with ISR)
- ✅ MDX errors: 0 critical pages
- ✅ Re-renders: Sidebar state persists
- ✅ Content width: 800-1000px
- ✅ Error handling: Graceful fallback UI
- ✅ Page load: <100ms (cached)
- ✅ First navigation: <500ms
- ✅ Subsequent navigation: <100ms (memoized)

---

## 🔍 Testing Checklist

### Functional Tests
- [ ] All doc pages render without errors
- [ ] Sidebar navigation works
- [ ] Sidebar state persists across navigation
- [ ] TOC links work correctly
- [ ] Search functionality works
- [ ] Breadcrumbs render correctly
- [ ] Mobile navigation works

### Performance Tests
- [ ] Dev server starts in <5 seconds
- [ ] No unnecessary re-renders (React DevTools)
- [ ] Page navigation feels instant
- [ ] Memory usage stable (no leaks)

### Visual Tests
- [ ] Layout looks good on all screen sizes
- [ ] Content not cramped on large screens
- [ ] Sidebar doesn't overlap content
- [ ] TOC positioned correctly
- [ ] Error fallback UI looks good

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly
- [ ] Focus management correct
- [ ] ARIA labels present

---

## 🚧 Known Risks

### 1. Breaking Changes
- **Risk:** Layout changes might break existing bookmarks/links
- **Mitigation:** Keep URL structure identical, only change visual layout

### 2. State Persistence
- **Risk:** localStorage might cause issues in SSR
- **Mitigation:** Use client-only hooks, check for `window` existence

### 3. Cache Invalidation
- **Risk:** Stale content if cache not invalidated
- **Mitigation:** Implement proper cache TTL, add manual refresh button

### 4. MDX Compilation
- **Risk:** Some edge cases might still cause MDX errors
- **Mitigation:** Error boundaries catch all errors, provide fallback

---

## 📚 References

- [Next.js ISR Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [React.memo Docs](https://react.dev/reference/react/memo)
- [MDX Troubleshooting](https://mdxjs.com/docs/troubleshooting-mdx/)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Optimization](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)

---

## 🤝 Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize phases** based on immediate needs
3. **Start with Phase 1** (MDX fixes) - highest impact
4. **Create feature branch** for refactor work
5. **Implement incrementally** with tests

**Questions? Issues? Updates?** Document in this file as work progresses.

---

**Status:** ✅ Ready for Implementation  
**Estimated Effort:** 1-2 weeks  
**Expected Impact:** HIGH (eliminates critical bugs, major UX improvement)
