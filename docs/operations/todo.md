# Project TODO & Issue Tracker

This document tracks **active and pending** work. Completed tasks are in **`done.md`**.

**Last Updated:** December 12, 2025 | **Status:** Cleanup Complete - TODO/Done/Future Ideas Consolidated | **Pass Rate:** 1339/1346 tests (99.5%)

> **📋 For AI Agents:** This document tracks **active and backlog** work only. For **unvalidated ideas** and **future enhancements** (>10 hours effort, experimental features, ideas needing validation), see **[`FUTURE_IDEAS.md`](../features/future-ideas)**. Move items from FUTURE_IDEAS.md to this TODO only after validation, clear business case, or resource availability.

---

## 🎯 Executive Summary

| Status | Count | Impact |
|--------|-------|--------|
| **Pending Work** | 0 items | All priority work complete ✅ |
| **Active Backlog** | 2 items | Medium-priority, 2-5 hour efforts (next planning cycle) |
| **Future Ideas** | 12 items | Low-priority, experimental, or unvalidated features (>10 hours or speculative) |
| **✅ Completed** | 59 items | Phases 1-4 + automation + security hardening + Gitleaks enforcement + backup plan (Dec 12) |

---

## 🤖 Claude Code Agents for TODO Management

**8 specialized agents available** to support work on these items. Use them when:

**Creating Features:** `/design-check` → `/security-audit` → `/arch-review`

- Design validation, security checks, pattern consistency

**Writing Content:** `/create-blog` → `/edit-content` → `/seo-optimize`

- Blog posts, documentation, SEO optimization

**Maintenance Work:** `/deps-audit` → `/perf-optimize` → `/seo-optimize`

- Dependency updates, performance analysis, Lighthouse scores

**Quick Help:** Type `/agent-help` in Claude Code to see all agents and workflows

See [`CLAUDE.md`](../../claude#claude-code-agents-ai-powered-quality-assurance) and [`.claude/agents/`](../../.claude/agents/) for detailed agent documentation.

---

## ✅ RECENTLY COMPLETED (Dec 12, 2025)

**All recently completed items have been moved to [`done.md`](done) for consolidation.** This keeps todo.md focused on active and pending work.

Key completions in this period:
- 🔐 Gitleaks Enforcement Policy & Automated Remediation
- 🔒 API Security Hardening & Incident Response  
- 🔐 PI vs PII Classification Expansion (9 new patterns)
- 📊 Activity Feed Caching Implementation
- ✅ All Priority 1-3 security improvements and features

See [`done.md`](done) for full details on Dec 11-12 completions.

---

## 🟡 PENDING WORK QUEUE (Next Steps)

**All security priority work (Priority 1-3) has been completed and archived in [`done.md`](done).**

### Remaining Backlog Items

- [ ] **Scanner Unit & Integration Tests** (2-3 hours)
  - Add tests for `check-for-pii.mjs` and the gitleaks parser to ensure placeholder logic and allowlist classification work as expected. Include falsy and true-positive tests.
  - **Impact:** Reduces regressions when modifying scanner rules.
  - **Estimated Effort:** 2-3 hours
  - **Priority:** Medium

---

## 📋 Completed Work Archive

All completed work has been moved to [`done.md`](done) with archive subdirectories for historical reference.

See:
- **[`done.md`](done)** - Recent completions (current month)
- **[`docs/operations/archive/`](./archive/)** - Historical completions by month

---

### Historic Completion: Horizontal Scroll Filter Chips (Dec 9, 2025) ✅

- [x] **HorizontalFilterChips Component** ✅
  - Created `src/components/blog/filters/horizontal-filter-chips.tsx`
  - Single row horizontal scrolling with touch-friendly momentum
  - Displays sort options (Newest, Popular, Oldest) with selection state
  - Shows up to 6 category badges with display name mapping
  - "More" button triggers full filter sheet via shared state
  - Sticky positioning at top-16 with shadow on scroll
  - Backdrop blur effect for visual clarity
  - Mobile-only (hidden on lg: breakpoint)

- [x] **Integration** ✅
  - Integrated into DynamicBlogContent above MobileFilterBar
  - Uses existing useFilterParams hook for URL state management
  - Coordinates with useMobileFilterSheet for "More" button
  - Negative margins to extend to container edges
  - Proper z-index layering (z-20) below header

- [x] **Quality Verification** ✅
  - Created 21 test cases covering all functionality (100% passing)
  - Tests cover rendering, selection state, interactions, accessibility, sticky behavior, scroll mechanics, edge cases
  - TypeScript: 0 errors
  - ESLint: 0 new errors
  - Build: Successful
  - Added barrel export to `src/components/blog/index.ts`

- [x] **Features Delivered** ✅
  - Quick access to common filters without opening full sheet
  - Visual feedback for active selections (primary color)
  - Smooth horizontal scroll with hidden scrollbar
  - Border separator between sort and category sections
  - Graceful handling of empty/missing data
  - Touch-optimized badge spacing and sizing

---

### 📅 Recent Completion: Floating Filter FAB for Mobile (Dec 9, 2025) ✅

- [x] **Shared State Hook** ✅
  - Created `src/hooks/use-mobile-filter-sheet.ts` (zustand store)
  - Manages sheet open/close state across components
  - Shared by MobileFilterBar and FloatingFilterFab

- [x] **FloatingFilterFab Component** ✅
  - Created `src/components/blog/filters/floating-filter-fab.tsx`
  - Fixed position bottom-right (above footer at z-30)
  - Shows active filter count in badge
  - Mobile only (hidden on lg: breakpoint)
  - Triggers shared filter sheet on click

- [x] **Integration** ✅
  - Updated MobileFilterBar to use shared hook instead of local useState
  - Integrated FloatingFilterFab into DynamicBlogContent
  - Calculates active filter count from all filter states
  - Added barrel export to `src/components/blog/index.ts`

- [x] **Quality Verification** ✅
  - Created 7 test cases for FloatingFilterFab (100% passing)
  - Updated MobileFilterBar tests to match new aria-label (3/3 passing)
  - TypeScript: 0 errors
  - ESLint: 0 new errors
  - Build: Successful

- [x] **Next Steps** 🔜
  - Consider keyboard navigation improvements (accessibility)
  - A/B test FAB visibility and positioning with users
  - Monitor mobile filter engagement metrics

### 🔴 TEMP: Horizontal Filter Chips Disabled (Dec 9, 2025)
- **Why**: Temporarily disabled to simplify mobile UI and reduce duplication with the Floating Filter FAB while we evaluate usage and performance.
- **How**: Feature is gated behind `NEXT_PUBLIC_FEATURE_HORIZONTAL_FILTER_CHIPS` environment variable. Set to `true` to re-enable.
- **Where**:
  - Component: `src/components/blog/filters/horizontal-filter-chips.tsx`
  - Used in: `src/components/blog/dynamic-blog-content.tsx` (gated)
- **Follow-up**: Consider re-enabling after telemetry review or adding an experiment (A/B) to validate usability. Move to backlog if decision is no.

---

### 📅 Recent Completion: Mobile Filter Drawer/Sheet Pattern (Dec 8, 2025) ✅

- [x] **Mobile Filter Drawer (Sheet)** ✅
  - Replaced inline collapsible `MobileFilterBar` with bottom sheet using `Sheet` UI (Radix + shadcn pattern)
  - Sheet triggers via the filter summary button on mobile; supports backdrop click to close
  - `BlogFilters` is now rendered inside `SheetContent` with `max-h-[80vh] overflow-auto` for scrolling
  - Clear action closes sheet and returns to `/blog` (clears filters)
  - Preserved desktop sidebar UX (desktop `BlogSidebar` still used)

- [x] **Quality Verification** ✅
  - Added unit test `src/__tests__/components/blog/mobile-filter-bar.test.tsx` covering trigger, sheet open, and clear action
  - TypeScript: local typecheck passed; ESLint: ran with warnings unrelated to this change
  - Layout & accessibility: `aria-label` and close button included; overlay/backdrop closable

---

- [x] **useBookmarks Hook** ✅
  - Created `src/hooks/use-bookmarks.ts` with localStorage persistence
  - SSR-safe initialization (loads on mount, no hydration issues)
  - Real-time sync across tabs via storage event
  - Type-safe operations: add, remove, toggle, check, clear
  - Graceful error handling and fallbacks

- [x] **BookmarkButton Component** ✅
  - Created `src/components/blog/bookmark-button.tsx`
  - Reusable button with configurable variants/sizes
  - Visual feedback (filled icon when bookmarked)
  - Toast notifications on toggle
  - Prevents event bubbling in card links

- [x] **PostList Integration** ✅
  - Added bookmark button to all layout variants (grid, list, magazine, compact)
  - Top-right corner placement with opacity transition on hover
  - Backdrop blur effect for visual clarity
  - Maintains accessibility and keyboard navigation

- [x] **PostQuickActions Update** ✅
  - Refactored to use centralized useBookmarks hook
  - Removed duplicate localStorage logic
  - Maintains existing functionality with improved state management

- [x] **Bookmarks Page** ✅
  - Created `/bookmarks` page at `src/app/bookmarks/page.tsx`
  - Uses PageLayout for consistency
  - Displays bookmarked posts with PostList component
  - Empty state with link to blog
  - Clear all bookmarks with confirmation
  - Info banner about local storage persistence

- [x] **Quality Verification** ✅
  - ESLint: 0 errors (all new files pass)
  - TypeScript: 0 errors (strict mode compliant)
  - Design tokens used correctly (TYPOGRAPHY, SPACING, CONTAINER_WIDTHS)
  - Barrel exports updated (`src/components/blog/index.ts`)

- [x] **Next Steps** 🔜
  - Add unit tests for useBookmarks hook
  - Add E2E tests for bookmark functionality
  - Consider service worker sync for offline support (backlog)

---

### 📅 Recent Completion: Mobile Filter Drawer/Sheet Pattern (Dec 8, 2025) ✅

- [x] **Mobile Filter Drawer (Sheet)** ✅
  - Replaced inline collapsible `MobileFilterBar` with bottom sheet using `Sheet` UI (Radix + shadcn pattern)
  - Sheet triggers via the filter summary button on mobile; supports backdrop click to close
  - `BlogFilters` is now rendered inside `SheetContent` with `max-h-[80vh] overflow-auto` for scrolling
  - Clear action closes sheet and returns to `/blog` (clears filters)
  - Preserved desktop sidebar UX (desktop `BlogSidebar` still used)

- [x] **Quality Verification** ✅
  - Added unit test `src/__tests__/components/blog/mobile-filter-bar.test.tsx` covering trigger, sheet open, and clear action
  - TypeScript: local typecheck passed; ESLint: ran with warnings unrelated to this change
  - Layout & accessibility: `aria-label` and close button included; overlay/backdrop closable

---

---

### 📅 Recent Completion: Print-Friendly Blog Styling (Dec 7, 2025) ✅

- [x] **Print Stylesheet Created** ✅
  - Created `src/styles/print.css` with complete print optimization
  - 400+ lines of CSS covering all print scenarios
  - Automatic import in `ArticleLayout` component

- [x] **Features Implemented** ✅
  - Hide navigation, sidebars, and interactive elements
  - Optimize typography (serif fonts, proper sizes, line-height)
  - Remove backgrounds for paper efficiency
  - Show external link URLs after text
  - Proper page break control (widow/orphan handling)
  - Code block formatting with borders
  - Table styling for print readability

- [x] **Testing** ✅
  - Created `src/__tests__/styles/print.test.tsx` (13 tests, 100% passing)
  - Verified HTML structure supports CSS targeting
  - Tests cover article structure, content preservation, accessibility

- [x] **Quality Verification** ✅
  - All tests passing (1377/1384 tests, 99.5% pass rate)
  - TypeScript: 0 errors | ESLint: 0 new errors
  - Production build: Successful

---

### 📅 Recent Completion: Partial Prerendering (PPR) for Blog (Dec 6, 2025) ✅

- [x] **DynamicBlogContent Server Component** ✅
  - Async view count fetching from Redis
  - Proper error handling and fallbacks
  - Type-safe implementation

- [x] **BlogListSkeleton Component** ✅
  - 4 layout variants: grid, list, magazine, compact
  - CLS-optimized sizing
  - 23-test comprehensive test suite

- [x] **Suspense Implementation** ✅
  - Suspense boundary on `/blog` page with skeleton fallback
  - PPR flag enabled on `/blog` and `/blog/[slug]` routes
  - Expected performance improvement: 55-65% faster FCP/LCP

- [x] **Documentation** ✅
  - See: `docs/development/ppr-implementation-complete.md`

---

### 📅 Recent Completion: Custom Blog Image Generation (Dec 6, 2025) ✅

- [x] **Enhanced SVG Generator** ✅
  - Created `scripts/generate-blog-hero.mjs` with 6 style variants
  - 8 icon types + pattern overlays
  - Generated 9 hero images (2.1-2.3KB each)
  - CLI flags: `--slug`, `--all`, `--preview`, `--force`

- [x] **Unsplash API Integration** ✅
  - Created `src/lib/unsplash.ts` TypeScript client
  - Interactive search mode with result preview
  - Automatic download tracking (API compliance)
  - Created `scripts/fetch-unsplash-image.mjs` CLI tool

- [x] **Configuration & Documentation** ✅
  - Added `images.unsplash.com` to Next.js remote patterns
  - Added npm scripts: `generate:hero`, `generate:hero:all`, `fetch:unsplash`
  - Created `docs/blog/custom-image-generation.md`

---

### 📅 Recent Completion: Vercel Deployment Checks (Dec 5, 2025) ✅

- [x] **GitHub Action Workflow** ✅
  - Created `.github/workflows/vercel-checks.yml` (395 lines)
  - 3 checks: Bundle Size, Lighthouse Performance, Baseline Validation
  - Triggers on `deployment_status` events from Vercel

- [x] **Check Lifecycle** ✅
  - Create → Running → Validation → Update → Conclusion
  - Critical failures block deployment
  - Warnings allow deployment (neutral conclusion)

- [x] **Blocking Thresholds** ✅
  - Bundle size: 25% error, 10% warning
  - Lighthouse: 10-point error, 5-point warning
  - Performance <90% or Accessibility <95% fails

- [x] **Integration Documentation** ✅
  - Created `docs/platform/vercel-deployment-checks.md`
  - Complete setup guide with `VERCEL_TOKEN` requirements

---

### 📅 Recent Completion: Performance Monitoring Infrastructure (Dec 5, 2025) ✅

- [x] **Bundle Size Monitoring** ✅
  - Created `performance-baselines.json` with regression thresholds
  - Enhanced `scripts/check-bundle-size.mjs` with baseline comparison
  - Three-tier detection: <10% pass, 10-25% warning, >25% error
  - CI integration in `.github/workflows/test.yml`

- [x] **Custom Analytics System** ✅
  - Redis-backed view tracking with 5-layer anti-spam protection
  - Session deduplication (30-minute window)
  - IP rate limiting (10 views per 5 minutes)
  - Milestone detection (100, 1K, 10K, 50K, 100K views)
  - Trending algorithm with hourly calculation

- [x] **Vercel Analytics Integration** ✅
  - Server-side event tracking via `@vercel/analytics/server`
  - Tracked events: blog_post_viewed, blog_milestone_reached, trending_posts_calculated, analytics_summary_generated, contact_form_submitted

- [x] **Historical Data Storage** ✅
  - 14-day retention via GitHub Actions artifacts
  - Sufficient for immediate regression detection
  - Migration path documented for future scaling

---

### 📅 Recent Completion: ESLint Cleanup (Dec 5, 2025) ✅

- [x] **Anonymous Export Fixes** ✅
  - Fixed anonymous default export in `scripts/github-api.mjs`
  - Fixed anonymous default export in `scripts/sentry-enricher.mjs`
  - Added named constants: `githubApi` and `sentryEnricher`
  - ESLint: 0 errors, 0 warnings

---

### 📅 Recent Completion: Performance Optimizations (Dec 5, 2025) ✅

- [x] **Blur Placeholders for Images** ✅
  - Created `IMAGE_PLACEHOLDER` constant in design-tokens.ts
  - Added blur placeholders to 7 Image components across 6 files
  - **Impact:** Reduces CLS by 0.02-0.05

- [x] **Homepage ScrollReveal Optimization** ✅
  - Converted ScrollReveal from dynamic to static import
  - Eliminated unnecessary network request for above-fold content
  - **Impact:** Improves FCP by 50-100ms

- [x] **Lazy Load Below-Fold Components** ✅
  - Lazy loaded FeaturedPostHero and ActivityFeed
  - Added loading skeletons for smooth UX
  - Maintained SEO with `ssr: true`
  - **Impact:** Reduces initial bundle by 15-20KB

---

### 📅 Recent Completion: Red Team Security Analysis (Dec 4, 2025) ✅

- [x] **Full Attack Surface Analysis** ✅
  - Information disclosure review (0 secrets exposed)
  - Authentication & authorization pattern testing
  - API endpoint security validation
  - Security header & CSP configuration audit
  - **Overall Risk Level: LOW**

- [x] **Security Fixes** ✅
  - CSP header duplication fixed
  - GitHub token logging removed
  - Fail-closed rate limiting added to contact form

- [x] **Testing & Validation** ✅
  - 23/23 rate limiter tests passing
  - 6/6 contact API tests passing
  - 31/31 GitHub contributions API tests passing

---

### 📅 Recent Completion: Blog Frontmatter (Dec 4, 2025) ✅

- [x] **Timezone-Safe Timestamps** ✅
  - All 9 posts updated with full ISO timestamps
  - Fixed date display bug (CVE post)

- [x] **Metadata Consistency** ✅
  - Added missing `updatedAt` field to CVE post
  - Fixed copy-pasted image metadata in 2 posts
  - Added consistent `credit` to all placeholder images

- [x] **Image Metadata Accuracy** ✅
  - Updated alt text and captions to match post content
  - Removed incorrect references from portfolio posts

---

### 📅 Recent Completion: Operational Audit (Dec 2, 2025) ✅

- [x] **Full Security Audit** ✅
  - 0 vulnerabilities across 2,054 dependencies
  - All security automation verified
  - Report: `docs/security/OPERATIONAL_AUDIT_2025-12-02.md`

- [x] **TypeScript Compilation Fixes** ✅
  - Fixed 12 type errors in project-filters tests
  - Fixed 1 type error in webkit-mobile-nav E2E test
  - All TypeScript compilation now passing (0 errors)

- [x] **Dependency Updates** ✅
  - Updated vitest, coverage tools, mermaid, shiki
  - All tests passing after updates

---

### 🏆 Completed Phases (Nov 23-29, 2025) ✅

#### Phase 1: Foundation & Reliability ✅
- Weekly test health reports with Sentry enrichment
- Automated GitHub Issue creation
- Coverage tracking and regression detection

#### Phase 2: Security Automation ✅
- Monthly security reviews
- Automated branch cleanup
- Dependency vulnerability tracking
- CodeQL integration and SBOM generation

#### Phase 3: Content & Cleanup ✅
- Blog frontmatter validation (PR + weekly)
- Dead code detection via ts-prune
- Unused dependency detection via depcheck
- Monthly workspace cleanup checklists

#### Phase 4: Dashboard & Observability ✅
- Maintenance dashboard at `/dev/maintenance`
- Real-time workflow status
- Observation logging system with Redis storage (100 most recent)
- 52-week trend visualizations using Recharts
- Metrics API with caching and graceful fallback
- Analytics dashboard validated (100% real data)

---

## 📊 Current Metrics

**Quality Gates:**
- Tests: 1339/1346 passing (99.5%) ✅
- TypeScript: 0 errors ✅
- ESLint: 0 errors, 0 warnings ✅
- Security: 0 vulnerabilities ✅
- Integration tests: 198 ✅

**Infrastructure:**
- SEO foundation: Complete ✅
- Conversion tracking: Active ✅
- Bot detection: Implemented ✅
- Performance monitoring: Active ✅
- Analytics: Redis + Vercel integrated ✅

**Code Quality:**
- 80 components organized
- 411 lines of duplicated code eliminated
- 13 unnecessary files removed
- Design token compliance: 99%+

---

## 📋 Quick Reference

### Before Starting Work
- [ ] Check accessibility impact (WCAG 2.1 AA)
- [ ] Estimate effort (add 25% buffer)
- [ ] Consider test coverage needs

### Before Committing
- [ ] Run `npm run lint` (0 errors required)
- [ ] Run `npm run build` (must pass)
- [ ] Run `npm run test` (≥99% pass rate)
- [ ] Update documentation if needed
- [ ] Move completed item to `done.md`

### Priority Framework
1. **Critical** → Compliance, security, accessibility
2. **High** → Infrastructure, testing, monitoring
3. **Medium** → Performance, SEO, content, UX
4. **Low** → Polish, enhancements (data-driven)
5. **Backlog** → Speculative, no validated need

### Key Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run test             # Unit tests (watch)
npm run test:e2e         # E2E tests (Playwright)
npm run lint             # ESLint check
npm run check            # All quality checks
```

---

## 📚 Related Documents

- **[`done.md`](done)** - Completed work archive (Phases 1-4, features, fixes)
- **[`FUTURE_IDEAS.md`](../features/future-ideas)** - Unvalidated ideas, experimental features, long-term enhancements (>10 hours effort)
- **[CI/CD Optimization Analysis](ci-cd-optimization-analysis)** - Pipeline optimization opportunities and implementation
- **[CI/CD Optimization Implementation](ci-cd-optimization-implementation)** - Completed Tier 1 optimizations (Dec 2025)

---

**Last Review:** December 10, 2025 | **Next Review:** Monthly or as needed
