<!-- TLP:CLEAR -->
# Universal Search Context-Aware Refactor

**Status:** 📋 Backlog
**Priority:** P2 - High
**Complexity:** 🟡 Medium-Large
**Created:** January 31, 2026
**Target:** Q1 2026

---

## Context

The current Unified Command component (`src/components/app/unified-command.tsx`) provides a powerful search and navigation interface triggered by the `/` key. However, it has significant opportunities for improvement:

1. **Mobile Experience** - Layout and spacing could be optimized for smaller screens
2. **Desktop Space Utilization** - Excess horizontal space on larger screens isn't leveraged for contextual suggestions
3. **Context-Awareness** - Search results and suggestions are the same regardless of where the user is on the site

---

## Problem Statement

### Current Limitations

#### Mobile Experience

- ❌ Search results may be too compact or cluttered on small screens
- ❌ Touch targets might not meet minimum size requirements (44px)
- ❌ Limited use of vertical space for suggestions
- ❌ Footer hints ("Navigate with ↑↓ arrows") may be less relevant on touch devices

#### Desktop Space Utilization

- ❌ Significant horizontal space unused (especially on 1440px+ screens)
- ❌ No sidebar or supplementary panels for contextual content
- ❌ Popular posts, categories, tags, and pages not surfaced
- ❌ Same narrow dialog width regardless of screen size

#### Context-Awareness

- ❌ Shows the same results on `/blog` as on `/works`
- ❌ No page-specific recommendations (e.g., similar pages when on a page)
- ❌ Doesn't prioritize content type based on current location
- ❌ No legal document suggestions when browsing legal pages
- ❌ Missing "You might also like" style suggestions

### User Impact

**Mobile Users:**

- Harder to browse search results
- May miss relevant suggestions
- Touch navigation less intuitive

**Desktop Users:**

- Underutilized screen real estate
- Missed discovery opportunities
- Less contextual relevance

**All Users:**

- Less personalized experience
- Reduced content discovery
- Lower engagement with related content

---

## Goals & Success Criteria

### Primary Goals

1. **Optimize Mobile Experience**
   - Touch-friendly design
   - Responsive spacing and typography
   - Mobile-first result presentation

2. **Leverage Desktop Space**
   - Multi-column layout on wide screens
   - Contextual sidebar panels
   - Popular/suggested content surfacing

3. **Context-Aware Results**
   - Location-based result prioritization
   - Relevant suggestions per page type
   - Smart content recommendations

### Success Metrics

| Metric                        | Current      | Target                | How to Measure      |
| ----------------------------- | ------------ | --------------------- | ------------------- |
| **Mobile Touch Target Size**  | Unknown      | ≥44px                 | Accessibility audit |
| **Desktop Space Utilization** | ~600px width | Adaptive (800-1200px) | Visual QA           |
| **Context-Relevant Results**  | None         | ≥3 per search         | Analytics tracking  |
| **Mobile Search Engagement**  | Baseline     | +20%                  | Event tracking      |
| **Desktop Suggestion Clicks** | 0            | 10%+ of searches      | Click-through rate  |

---

## Proposed Solution

### 1. Mobile-First Responsive Design

**Current State:**

```tsx
// Fixed dialog size
<Command className="rounded-lg border shadow-md">{/* Content */}</Command>
```

**Proposed Changes:**

#### A. Adaptive Dialog Sizing

```tsx
<Command
  className={cn(
    "rounded-lg border shadow-md",
    // Mobile: Full-screen modal with safe areas
    "max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:h-screen",
    // Tablet: 90% width, centered
    "sm:max-w-[90vw] sm:mx-auto",
    // Desktop: Adaptive width based on screen size
    "md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px]"
  )}
>
```

#### B. Touch-Friendly Result Items

```tsx
<Command.Item
  className={cn(
    "relative flex cursor-pointer flex-col gap-1 rounded-md px-3 py-3",
    // Mobile: Larger touch targets
    "max-sm:min-h-[60px] max-sm:px-4 max-sm:py-4",
    "aria-selected:bg-accent aria-selected:text-accent-foreground",
    "hover:bg-accent/50 transition-colors"
  )}
>
```

#### C. Mobile-Optimized Typography

```tsx
// Use responsive typography tokens
<h4
  className={cn(
    TYPOGRAPHY.h4.standard,
    'max-sm:text-base' // Larger on mobile
  )}
>
  {post.title}
</h4>
```

#### D. Simplified Mobile Footer

```tsx
<div
  className={cn(
    'flex items-center justify-between border-t border-border/50 px-4 py-2 text-xs text-muted-foreground bg-muted/30',
    // Mobile: Single line, swipe hint
    'max-sm:justify-center max-sm:text-center'
  )}
>
  <span className="hidden sm:inline">Navigate with ↑↓ arrows</span>
  <span className="sm:hidden">Swipe to browse • Tap to select</span>
  <span className="hidden sm:inline">Press Enter to select</span>
</div>
```

---

### 2. Desktop Multi-Column Layout

**Architecture:** Main results + Contextual sidebar

#### Layout Structure

```tsx
<div
  className={cn(
    'flex gap-4',
    // Mobile: Single column (stack)
    'max-md:flex-col',
    // Desktop: Two columns (main + sidebar)
    'md:flex-row'
  )}
>
  {/* Main Search Results - 60-70% width */}
  <div className="flex-1 min-w-0 md:w-[65%]">
    <Command.List>{/* Existing search results */}</Command.List>
  </div>

  {/* Contextual Sidebar - 30-40% width */}
  <aside className="hidden md:block md:w-[35%] border-l border-border/50 pl-4 max-h-[60vh] overflow-y-auto">
    <ContextualSuggestions currentPath={currentPath} />
  </aside>
</div>
```

#### Contextual Sidebar Component

```tsx
interface ContextualSuggestionsProps {
  currentPath: string;
  searchQuery?: string;
}

function ContextualSuggestions({ currentPath, searchQuery }: ContextualSuggestionsProps) {
  const context = detectContext(currentPath);

  return (
    <div className="space-y-4">
      {/* Popular in Current Section */}
      {context.popularPosts && (
        <div>
          <h3 className={cn(TYPOGRAPHY.h5.standard, 'mb-2')}>Popular {context.sectionName}</h3>
          <ul className="space-y-2">
            {context.popularPosts.map((post) => (
              <li key={post.id}>
                <button className="text-sm hover:underline text-left">{post.title}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories/Tags */}
      {context.categories && (
        <div>
          <h3 className={cn(TYPOGRAPHY.h5.standard, 'mb-2')}>Categories</h3>
          <div className="flex flex-wrap gap-2">
            {context.categories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Related Pages */}
      {context.relatedPages && (
        <div>
          <h3 className={cn(TYPOGRAPHY.h5.standard, 'mb-2')}>Related {context.pageType}s</h3>
          <ul className="space-y-2">
            {context.relatedPages.map((page) => (
              <li key={page.slug}>
                <button className="text-sm hover:underline text-left">{page.title}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Context-Aware Search Logic

**Core Concept:** Boost/prioritize results based on current location

#### Context Detection System

```typescript
// src/lib/search/context-detector.ts

export type PageContext =
  | 'blog-archive'
  | 'blog-post'
  | 'works-archive'
  | 'work-project'
  | 'legal-archive'
  | 'legal-document'
  | 'page'
  | 'homepage'
  | 'unknown';

export interface SearchContext {
  type: PageContext;
  sectionName: string;
  contentType: 'post' | 'project' | 'page' | 'legal';
  tags?: string[];
  categories?: string[];
  popularContent?: string[];
  relatedContent?: string[];
}

export function detectContext(pathname: string): SearchContext {
  // Blog contexts
  if (pathname === '/blog') {
    return {
      type: 'blog-archive',
      sectionName: 'Posts',
      contentType: 'post',
      categories: getBlogCategories(),
      popularContent: getPopularPosts(5),
    };
  }

  if (pathname.startsWith('/blog/')) {
    const currentPost = pathname.replace('/blog/', '');
    return {
      type: 'blog-post',
      sectionName: 'Posts',
      contentType: 'post',
      tags: getPostTags(currentPost),
      relatedContent: getRelatedPosts(currentPost, 5),
    };
  }

  // Works contexts
  if (pathname === '/works') {
    return {
      type: 'works-archive',
      sectionName: 'Projects',
      contentType: 'project',
      categories: getProjectCategories(),
      popularContent: getPopularProjects(5),
    };
  }

  if (pathname.startsWith('/works/')) {
    const currentProject = pathname.replace('/works/', '');
    return {
      type: 'work-project',
      sectionName: 'Projects',
      contentType: 'project',
      tags: getProjectTags(currentProject),
      relatedContent: getRelatedProjects(currentProject, 5),
    };
  }

  // Legal contexts
  if (
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/cookies')
  ) {
    return {
      type: 'legal-document',
      sectionName: 'Legal Documents',
      contentType: 'legal',
      relatedContent: getAllLegalDocs(),
    };
  }

  // Generic page
  return {
    type: 'page',
    sectionName: 'Pages',
    contentType: 'page',
  };
}
```

#### Context-Aware Fuse.js Scoring

```typescript
// src/lib/search/context-aware-search.ts

interface SearchOptions {
  context: SearchContext;
  query: string;
  index: SearchIndex;
}

export function contextAwareSearch({ context, query, index }: SearchOptions) {
  const fuse = new Fuse(index.posts, fuseOptions);
  const baseResults = fuse.search(query);

  // Apply context-based boosting
  const boostedResults = baseResults.map((result) => {
    let score = result.score ?? 1;

    // Boost results matching current content type
    if (result.item.type === context.contentType) {
      score *= 0.7; // Lower score = higher priority in Fuse.js
    }

    // Boost results with matching tags
    if (context.tags && result.item.tags) {
      const matchingTags = result.item.tags.filter((tag) => context.tags?.includes(tag));
      if (matchingTags.length > 0) {
        score *= 0.8 - matchingTags.length * 0.05;
      }
    }

    // Boost popular content in current section
    if (context.popularContent?.includes(result.item.id)) {
      score *= 0.85;
    }

    return { ...result, score };
  });

  // Re-sort by adjusted score
  return boostedResults.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
}
```

#### Smart Suggestions (Zero-Query State)

```typescript
// When search is empty, show context-aware suggestions

function getZeroQuerySuggestions(context: SearchContext) {
  switch (context.type) {
    case 'blog-archive':
      return {
        heading: 'Popular Posts',
        items: context.popularContent || [],
      };

    case 'blog-post':
      return {
        heading: 'Related Posts',
        items: context.relatedContent || [],
      };

    case 'works-archive':
      return {
        heading: 'Featured Projects',
        items: context.popularContent || [],
      };

    case 'work-project':
      return {
        heading: 'Similar Projects',
        items: context.relatedContent || [],
      };

    case 'legal-document':
      return {
        heading: 'Legal Documents',
        items: context.relatedContent || [],
      };

    default:
      return {
        heading: 'Recently Updated',
        items: getRecentlyUpdated(5),
      };
  }
}
```

---

### 4. Suggested Content Types by Location

**Recommendation Matrix:**

| Current Location   | Primary Content    | Secondary Content          | Tertiary Content   |
| ------------------ | ------------------ | -------------------------- | ------------------ |
| **Homepage**       | Popular posts      | Recent projects            | Navigation         |
| **Blog Archive**   | All posts          | Popular posts              | Categories, tags   |
| **Blog Post**      | Related posts      | Posts in same category     | Continue reading   |
| **Works Archive**  | All projects       | Featured projects          | Project categories |
| **Work Project**   | Related projects   | Projects with similar tech | All projects       |
| **Legal Archive**  | All legal docs     | Related policies           | -                  |
| **Legal Document** | Related legal docs | All legal docs             | -                  |
| **About/Contact**  | Pages              | Recent posts               | -                  |

**Implementation:**

```tsx
// In UnifiedCommand component
const context = detectContext(usePathname());
const suggestions = useMemo(() => {
  if (!search.trim()) {
    return getZeroQuerySuggestions(context);
  }
  return contextAwareSearch({ context, query: search, index: searchIndex });
}, [search, context, searchIndex]);
```

---

## Implementation Plan

### Phase 1: Mobile Optimization (Week 1)

**Goal:** Improve mobile UX and touch friendliness

**Tasks:**

- [ ] Implement responsive dialog sizing (full-screen on mobile)
- [ ] Increase touch target sizes (≥44px minimum)
- [ ] Add mobile-specific typography scaling
- [ ] Update footer hints for touch devices
- [ ] Add safe area padding for notched devices
- [ ] Test on iOS Safari, Android Chrome, and tablet sizes

**Deliverables:**

- Mobile-optimized command palette
- Touch target accessibility compliance
- Cross-device testing report

**Acceptance Criteria:**

- [ ] All touch targets ≥44px on mobile
- [ ] Full-screen modal on mobile (<640px)
- [ ] Safe area insets respected
- [ ] Tests pass on iOS 15+, Android 11+
- [ ] E2E tests updated for mobile flows

---

### Phase 2: Desktop Multi-Column Layout (Week 2)

**Goal:** Leverage desktop space with contextual sidebar

**Tasks:**

- [ ] Create responsive flex layout (single/multi-column)
- [ ] Build ContextualSuggestions component
- [ ] Implement popular content fetching
- [ ] Add category/tag display
- [ ] Create responsive breakpoints (md:, lg:, xl:)
- [ ] Add scrollable sidebar with max-height

**Deliverables:**

- Multi-column search layout
- Contextual sidebar component
- Responsive breakpoint system

**Acceptance Criteria:**

- [ ] Two-column layout on ≥768px screens
- [ ] Sidebar shows ≥3 suggestions
- [ ] Sidebar scrollable when content overflows
- [ ] Single column on mobile (<768px)
- [ ] Design token compliance ≥90%

---

### Phase 3: Context Detection System (Week 3)

**Goal:** Build context-aware suggestion engine

**Tasks:**

- [ ] Create `src/lib/search/context-detector.ts`
- [ ] Implement `detectContext()` function
- [ ] Build context types and interfaces
- [ ] Add popular/related content fetchers
- [ ] Integrate with search index
- [ ] Add context caching for performance

**Deliverables:**

- Context detection library
- Popular/related content APIs
- Performance-optimized caching

**Acceptance Criteria:**

- [ ] Detects all 8 page contexts
- [ ] Returns relevant suggestions per context
- [ ] Caches context for 5 minutes
- [ ] <50ms detection time
- [ ] Unit tests ≥90% coverage

---

### Phase 4: Context-Aware Search (Week 4)

**Goal:** Boost search results based on context

**Tasks:**

- [ ] Create `src/lib/search/context-aware-search.ts`
- [ ] Implement score boosting algorithm
- [ ] Add content type prioritization
- [ ] Implement tag-based boosting
- [ ] Add popular content boosting
- [ ] Integrate with Fuse.js search

**Deliverables:**

- Context-aware search library
- Boosting algorithm implementation
- Integration with existing search

**Acceptance Criteria:**

- [ ] Results prioritized by content type
- [ ] Tag matches boost relevance
- [ ] Popular content surfaces higher
- [ ] Search performance <100ms
- [ ] A/B test shows +10% engagement

---

### Phase 5: Zero-Query Suggestions (Week 5)

**Goal:** Show smart suggestions when search is empty

**Tasks:**

- [ ] Implement `getZeroQuerySuggestions()`
- [ ] Create suggestion heading logic
- [ ] Add recently updated content
- [ ] Implement "Continue Reading" integration
- [ ] Add suggestion analytics tracking
- [ ] Polish UI/UX

**Deliverables:**

- Zero-query suggestion system
- Analytics integration
- Polished suggestion UI

**Acceptance Criteria:**

- [ ] Shows ≥3 suggestions when empty
- [ ] Different suggestions per context
- [ ] Click tracking via analytics
- [ ] Suggestions update in real-time
- [ ] UI matches design system

---

### Phase 6: Testing & Polish (Week 6)

**Goal:** Comprehensive testing and refinement

**Tasks:**

- [ ] Write E2E tests for all contexts
- [ ] Add mobile E2E tests (touch interactions)
- [ ] Performance testing (1000+ posts)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Analytics implementation
- [ ] Documentation updates

**Deliverables:**

- Comprehensive test suite
- Performance benchmarks
- Accessibility compliance report
- Updated documentation

**Acceptance Criteria:**

- [ ] E2E tests ≥95% coverage
- [ ] Mobile E2E tests pass
- [ ] WCAG 2.1 AA compliant
- [ ] Performance <2s on slow 3G
- [ ] Cross-browser compatibility verified
- [ ] Analytics tracking active

---

## Technical Specifications

### Component Refactor

**Current File:** `src/components/app/unified-command.tsx` (565 lines)

**Proposed Structure:**

```
src/components/app/
├── unified-command.tsx (main component, 300 lines)
├── search/
│   ├── context-detector.ts (context logic, 150 lines)
│   ├── context-aware-search.ts (boosting, 120 lines)
│   ├── contextual-suggestions.tsx (sidebar, 180 lines)
│   ├── search-result-item.tsx (result display, 100 lines)
│   └── zero-query-suggestions.tsx (empty state, 80 lines)
└── index.ts (barrel exports)
```

**Benefits:**

- Modular, testable components
- Clear separation of concerns
- Easier to maintain and extend
- Follows existing architecture patterns

### New Dependencies

**None** - Uses existing:

- `fuse.js` (already installed)
- `cmdk` (already installed)
- `lucide-react` (already installed)
- Design tokens (already implemented)

### Performance Considerations

**Challenges:**

1. Context detection on every search
2. Popular content fetching
3. Multi-column layout rendering
4. Large search index (1000+ posts)

**Optimizations:**

- Cache context for 5 minutes
- Lazy-load popular content
- Virtual scrolling for large result sets
- Debounce search input (200ms)
- Memoize expensive computations

**Metrics:**

- Search response time: <100ms
- Context detection: <50ms
- Initial render: <200ms
- Scroll performance: 60fps

---

## Testing Strategy

### Unit Tests

**New Test Files:**

- `src/lib/search/context-detector.test.ts`
- `src/lib/search/context-aware-search.test.ts`
- `src/components/app/search/contextual-suggestions.test.tsx`
- `src/components/app/search/zero-query-suggestions.test.tsx`

**Coverage Targets:**

- Context detection: ≥90%
- Search boosting: ≥90%
- Components: ≥85%

### Integration Tests

**Scenarios:**

- Search from different page contexts
- Context switching while modal open
- Popular content fetching
- Sidebar scrolling with many suggestions

### E2E Tests

**Update:** `e2e/command-palette.spec.ts`

**New Test Cases:**

```typescript
test.describe('Context-Aware Search', () => {
  test('shows blog-specific suggestions on /blog', async ({ page }) => {
    await page.goto('/blog');
    await page.keyboard.press('Slash');

    // Should show popular posts in sidebar
    await expect(page.getByText('Popular Posts')).toBeVisible();
  });

  test('prioritizes projects when searching from /works', async ({ page }) => {
    await page.goto('/works');
    await page.keyboard.press('Slash');
    await page.fill('[placeholder="Search commands..."]', 'test');

    // First result should be a project (if matches exist)
    // Implementation depends on test data
  });

  test('shows legal docs when on privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await page.keyboard.press('Slash');

    await expect(page.getByText('Legal Documents')).toBeVisible();
  });
});

test.describe('Mobile Responsive', () => {
  test('uses full-screen modal on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.keyboard.press('Slash');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveClass(/max-sm:fixed max-sm:inset-0/);
  });

  test('touch targets are ≥44px on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.keyboard.press('Slash');

    const resultItem = page.locator('[cmdk-item]').first();
    const box = await resultItem.boundingBox();

    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
```

### Performance Tests

**Benchmarks:**

```typescript
test('search response time <100ms', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Slash');

  const start = Date.now();
  await page.fill('[placeholder="Search commands..."]', 'test');
  await page.waitForSelector('[cmdk-item]');
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(100);
});
```

---

## Data Requirements

### Popular Content

**Source:** Redis analytics (if available) or fallback static data

**Schema:**

```typescript
interface PopularContent {
  id: string;
  title: string;
  type: 'post' | 'project' | 'page';
  url: string;
  views?: number;
  score: number; // Ranking algorithm result
}
```

**Fetching:**

```typescript
// src/lib/search/popular-content.ts
export async function getPopularPosts(limit: number = 5): Promise<PopularContent[]> {
  // Try Redis first
  try {
    const analytics = await redis.get('analytics:popular:posts');
    if (analytics) return JSON.parse(analytics).slice(0, limit);
  } catch (err) {
    console.warn('Failed to fetch popular posts from Redis:', err);
  }

  // Fallback: Static list or manual curation
  return FALLBACK_POPULAR_POSTS.slice(0, limit);
}
```

### Categories & Tags

**Source:** Existing search index (`/search-index.json`)

**Extraction:**

```typescript
export function getBlogCategories(): string[] {
  const index = searchIndex.posts;
  const categories = new Set<string>();

  index
    .filter((post) => post.type === 'post')
    .forEach((post) => post.categories?.forEach((cat) => categories.add(cat)));

  return Array.from(categories).sort();
}

export function getBlogTags(): string[] {
  const index = searchIndex.posts;
  const tags = new Set<string>();

  index
    .filter((post) => post.type === 'post')
    .forEach((post) => post.tags?.forEach((tag) => tags.add(tag)));

  return Array.from(tags).sort();
}
```

### Related Content

**Algorithm:** Tag similarity + category matching

```typescript
export function getRelatedPosts(currentPostId: string, limit: number = 5): string[] {
  const currentPost = searchIndex.posts.find((p) => p.id === currentPostId);
  if (!currentPost) return [];

  const related = searchIndex.posts
    .filter((p) => p.id !== currentPostId && p.type === 'post')
    .map((post) => {
      let score = 0;

      // Tag matching (strongest signal)
      const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
      score += sharedTags.length * 3;

      // Category matching
      const sharedCategories = post.categories?.filter((cat) =>
        currentPost.categories?.includes(cat)
      );
      score += (sharedCategories?.length ?? 0) * 2;

      // Recency bonus
      const daysSincePublished =
        (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished < 30) score += 1;

      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.post.id);

  return related;
}
```

---

## Design System Compliance

### New Design Tokens Required

**Spacing:**

```typescript
// Add to SPACING object
export const SPACING = {
  // ... existing tokens

  searchSidebar: {
    gap: 'gap-4', // Spacing between sidebar sections
    padding: 'p-4', // Sidebar internal padding
    itemGap: 'space-y-2', // Gap between suggestion items
  },

  searchMobile: {
    padding: 'p-4', // Mobile modal padding
    itemGap: 'space-y-3', // Larger gap on mobile
    touchTarget: 'min-h-[60px]', // Minimum touch target
  },
};
```

**Typography:**

```typescript
// Add to TYPOGRAPHY object
export const TYPOGRAPHY = {
  // ... existing tokens

  searchSidebar: {
    heading: 'text-sm font-semibold',
    item: 'text-sm',
  },
};
```

**Breakpoints:**

```typescript
// Standardize responsive breakpoints
export const BREAKPOINTS = {
  mobile: 'max-sm', // <640px
  tablet: 'sm', // ≥640px
  desktop: 'md', // ≥768px
  wide: 'lg', // ≥1024px
  ultraWide: 'xl', // ≥1280px
};
```

---

## Analytics & Tracking

### Event Tracking

**New Events:**

```typescript
// Track context-aware interactions
analytics.track('search_context_suggestion_clicked', {
  context: 'blog-post',
  suggestionType: 'related-post',
  suggestionPosition: 2,
  clickedId: 'post-slug',
});

analytics.track('search_sidebar_visible', {
  context: 'blog-archive',
  screenWidth: window.innerWidth,
  suggestionsShown: 5,
});

analytics.track('search_mobile_interaction', {
  deviceType: 'mobile',
  interactionType: 'touch',
  resultClicked: true,
});
```

**Dashboard Metrics:**

- Context-aware suggestion CTR
- Mobile vs desktop engagement
- Popular content performance
- Zero-query vs search-query usage

---

## Documentation Updates

### Required Updates

- [ ] Update `docs/architecture/navigation-system.md` - Add context-aware search section
- [ ] Update `docs/accessibility/WCAG_COMPLIANCE.md` - Mobile touch target compliance
- [ ] Update `e2e/command-palette.spec.ts` - New test cases
- [ ] Update `README.md` - Context-aware search feature

### New Documentation

- [ ] `docs/features/CONTEXT_AWARE_SEARCH.md` - Complete feature guide
- [ ] `docs/components/unified-command.md` - Component API documentation
- [ ] `src/lib/search/README.md` - Search library documentation

---

## Risks & Mitigations

### Risk: Performance Degradation with Large Search Index

**Impact:** High
**Likelihood:** Medium

**Mitigation:**

- Implement virtual scrolling for result lists
- Debounce search input (200ms)
- Lazy-load popular content
- Cache context detection results
- Profile and optimize bottlenecks

### Risk: Mobile UX Regression

**Impact:** High
**Likelihood:** Low

**Mitigation:**

- Mobile-first development approach
- Test on real devices (iOS, Android)
- Touch target size validation
- User testing before release
- Rollback plan ready

### Risk: Context Detection False Positives

**Impact:** Medium
**Likelihood:** Medium

**Mitigation:**

- Comprehensive unit tests for all contexts
- Fallback to generic context on errors
- User feedback mechanism
- A/B testing before full rollout

### Risk: Sidebar Cluttering Desktop UI

**Impact:** Medium
**Likelihood:** Low

**Mitigation:**

- Collapsible sidebar option
- User preference storage
- Max-height with scrolling
- Progressive disclosure of sections

---

## Success Criteria

### Functional Requirements

- [ ] Mobile: Full-screen modal with safe area support
- [ ] Mobile: Touch targets ≥44px
- [ ] Desktop: Multi-column layout (≥768px)
- [ ] Desktop: Contextual sidebar with ≥3 suggestions
- [ ] Context detection for all 8 page types
- [ ] Context-aware result boosting working
- [ ] Zero-query suggestions showing relevant content

### Quality Requirements

- [ ] ≥99% test pass rate maintained
- [ ] 0 ESLint errors
- [ ] Design token compliance ≥90%
- [ ] WCAG 2.1 AA compliant
- [ ] Cross-browser compatibility (Chrome, Safari, Firefox, Edge)

### Performance Requirements

- [ ] Search response time <100ms
- [ ] Context detection <50ms
- [ ] Initial modal render <200ms
- [ ] 60fps scrolling performance
- [ ] Works on slow 3G (Lighthouse)

### User Experience

- [ ] Mobile engagement +20% (analytics)
- [ ] Desktop sidebar CTR ≥10%
- [ ] Zero-query suggestion usage ≥30%
- [ ] User feedback positive (>80% satisfied)

---

## Timeline & Effort Estimate

| Phase                           | Duration    | Effort (hours) | Team           |
| ------------------------------- | ----------- | -------------- | -------------- |
| Phase 1: Mobile Optimization    | 1 week      | 20             | 1 dev          |
| Phase 2: Desktop Multi-Column   | 1 week      | 20             | 1 dev          |
| Phase 3: Context Detection      | 1 week      | 16             | 1 dev          |
| Phase 4: Context-Aware Search   | 1 week      | 20             | 1 dev          |
| Phase 5: Zero-Query Suggestions | 1 week      | 16             | 1 dev          |
| Phase 6: Testing & Polish       | 1 week      | 20             | 1 dev + QA     |
| **Total**                       | **6 weeks** | **112 hours**  | **1 dev + QA** |

**Recommended approach:** Iterative implementation with weekly releases to preview environment for user feedback.

---

## Out of Scope

- AI-powered search suggestions (future enhancement)
- Voice search integration (future enhancement)
- Search result personalization based on user history (future enhancement)
- Multi-language search support (future enhancement)
- Search analytics dashboard (separate project)

---

## Follow-Up Enhancements

After completion, consider:

- [ ] AI-powered semantic search
- [ ] User search history and personalization
- [ ] Search result previews (hover cards)
- [ ] Advanced filters (date range, content type, tags)
- [ ] Search result sharing (copy link with query)
- [ ] Voice search for accessibility
- [ ] Multi-language support

---

## References

- [Current Implementation](../../src/components/app/unified-command.tsx)
- [E2E Tests](../../e2e/command-palette.spec.ts)
- [Navigation System](../architecture/navigation-system.md)
- [Design Tokens](../../src/lib/design-tokens.ts)
- [Accessibility Guidelines](../accessibility/WCAG_COMPLIANCE.md)

---

## Appendix: Context Examples

### Example 1: User on Blog Archive

**Location:** `/blog`

**Search UI:**

- **Main Results:** All posts (no query) or matching posts (with query)
- **Sidebar:**
  - Popular Posts (top 5)
  - Categories (all)
  - Tags (top 10)

**Zero-Query Behavior:**

- Show "Popular Posts" heading
- List top 5 most-viewed posts
- Show categories as clickable badges

---

### Example 2: User on Blog Post

**Location:** `/blog/introduction-to-nextjs`

**Current Post Tags:** `["nextjs", "react", "webdev"]`

**Search UI:**

- **Main Results:** All posts (no query) or matching posts (with query, boosted by shared tags)
- **Sidebar:**
  - Related Posts (same tags, top 5)
  - Posts in Same Category
  - Continue Reading (if user has progress)

**Zero-Query Behavior:**

- Show "Related Posts" heading
- List posts with matching tags
- Show "Continue Reading" if applicable

---

### Example 3: User on Works Archive

**Location:** `/works`

**Search UI:**

- **Main Results:** All projects (no query) or matching projects (with query)
- **Sidebar:**
  - Featured Projects (top 5)
  - Project Categories (all)
  - Tech Stack Tags (top 10)

**Zero-Query Behavior:**

- Show "Featured Projects" heading
- List featured/popular projects
- Show categories and tech stacks

---

### Example 4: User on Legal Document

**Location:** `/privacy`

**Search UI:**

- **Main Results:** Legal documents (prioritized) or all content (with query)
- **Sidebar:**
  - Related Legal Documents (all)
  - Last Updated Info
  - Quick Links to Other Policies

**Zero-Query Behavior:**

- Show "Legal Documents" heading
- List all legal pages (Privacy, Terms, Cookies, etc.)
- Highlight current document

---

**Status Updates:**

- 2026-01-31: Initial backlog item created

---

**Next Steps:**

1. Review and prioritize this task
2. Schedule for Q1 2026 sprint
3. Assign to frontend developer
4. Create Phase 1 subtasks
5. Begin mobile optimization work
