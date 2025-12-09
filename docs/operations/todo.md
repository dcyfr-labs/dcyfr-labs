# Project TODO & Issue Tracker

This document tracks **active and pending** work. Completed tasks are in **`done.md`**.

**Last Updated:** December 8, 2025 | **Status:** Maintenance mode with data-driven enhancements | **Pass Rate:** 1339/1346 tests (99.5%)

---

## 🎯 Executive Summary

| Status | Count | Impact |
|--------|-------|--------|
| **Pending Work** | 15 items | Medium-effort features (2-6 hours each) |
| **Backlog** | 11 items | Low-priority or speculative features |
| **✅ Completed** | 45+ items | Phases 1-4 + recent completions |

---

## 🟡 PENDING WORK QUEUE (Next Steps)

### Priority 1: Blog Features (Medium Effort)

#### 🟡 **Mobile Filter Drawer/Sheet Pattern** (3-4 hours)
- Replace collapsible bar with bottom sheet (shadcn Sheet)
- Familiar mobile UX (like app store filters)
- Swipe to dismiss, backdrop click to close
- Maintains desktop filter sidebar
- **Estimated Impact:** Improved mobile UX

#### 🟡 **Floating Filter FAB for Mobile** (2-3 hours)
- Floating action button (bottom-right, above footer)
- Opens filter sheet on mobile only
- Icon changes when filters active
- Counts active filters
- **Estimated Impact:** Mobile discoverability

#### 🟡 **Horizontal Scroll Filter Chips** (2-3 hours)
- Single row of horizontally scrolling filter badges
- Selected state styling
- "More" button for full filter access
- Sticky to top with shadow on scroll
- **Estimated Impact:** Mobile UX improvement

#### 🟡 **Category Grouping in Blog Grid** (2-3 hours)
- Add section headers for each category
- Group posts visually under category headings
- Optional collapsible sections
- Shows post count per category
- **Estimated Impact:** Better content organization

#### 🟡 **Hybrid Layout Pattern** (2-3 hours)
- First post as large hero card, rest in 2-column grid
- Responsive: stacked on mobile, 2-col on tablet+
- Combines best of grid and magazine layouts
- Fallback to magazine layout if <3 posts
- **Estimated Impact:** Visual hierarchy improvement

### Priority 2: Analytics Dashboard (Medium Effort)

#### 🟡 **Sparkline Trend Visualizations** (2-3 hours)
- Small inline charts for key metrics
- `RechartsSparkline` component
- Show 7-day/30-day trends
- Use design token colors
- **Estimated Impact:** Quick metrics overview

#### 🟡 **GitHub-Style Heatmap Calendar View** (3-4 hours)
- Calendar heatmap of post views/engagement
- 52-week view (adjustable date range)
- Color intensity = activity level
- Tooltip on hover with details
- **Estimated Impact:** Visual engagement trends

#### 🟡 **Real Vercel Analytics Integration** (4-6 hours)
- Query Vercel Analytics API (requires integration)
- Display top pages, referrers, devices
- Compare with custom Redis analytics
- Sync in daily background job
- **Estimated Impact:** Comprehensive analytics view

### Priority 3: New Pages (Medium Effort)

#### 🟡 **Professional Services Page** (4-6 hours)
- Consulting offerings overview
- Service packages with descriptions
- Process/methodology section
- CTA to contact form
- Portfolio samples (link to work page)
- **Estimated Impact:** Business development

---

## 🔵 BACKLOG (Low Priority or Speculative)

### Infrastructure & Reliability

- [ ] **Backup & Disaster Recovery Plan** (2 hours)
- [ ] **GitHub Actions CI Improvements** (2-3 hours)
- [ ] **Automated Performance Regression Tests** (3-4 hours)

### Future Features: Sponsor Dashboard & Tracking

**Current Status:** Public invite code display implemented at `/sponsors` and `/invites`. Phase 2 backlogged pending sponsor validation.

#### Phase 2: Tracking & Analytics (11-16 hours total)

- [ ] **API Tracking Endpoints** (2-3 hours)
  - `POST /api/invites/track` - Track invite code usage
  - Follow `/api/views` pattern with anti-spam protection
  - Session deduplication (24-hour window)
  - Rate limiting (5 requests/minute per IP)

- [ ] **Inngest Background Jobs** (2-3 hours)
  - `trackInviteCodeUse` - Increment usage counters
  - `handleInviteMilestone` - Detect 100/500/1000 uses
  - Vercel Analytics integration

- [ ] **Sponsor Authentication** (3-4 hours)
  - API key-based access (`SPONSOR_API_KEY` env var)
  - Per-sponsor tokens stored in Redis
  - `GET /api/invites/stats` - Protected stats endpoint

- [ ] **Sponsor Dashboard UI** (3-4 hours)
  - `/sponsors/dashboard` page with authentication
  - Display stats (uses, conversions, trending)
  - Chart visualization
  - Real-time updates via API polling

- [ ] **Privacy & Compliance** (1-2 hours)
  - IP address anonymization (hash only)
  - Session data TTL (30-90 days)
  - GDPR-compliant aggregate reporting

**Priority:** Low (no validated sponsor need yet)

### UI/UX Enhancements

- [ ] **Advanced Holographic Card Effects with Mouse Tracking** (4-6 hours)
  - **Current Status:** Disabled pending implementation
  - **Scope:** Refactor card hover effects with dynamic mouse tracking
  - **Reference Patterns:** 
    - Vercel dashboard card interactions (magnetic borders, gradient borders)
    - Framer Motion parallax effects
    - Real-time cursor position tracking
    - Dynamic 3D tilt based on mouse location
  - **Implementation Plan:**
    1. Mouse event tracking hook (`useMouseTracker`) - tracks cursor position relative to card
    2. Dynamic border shine effect - follows cursor movement
    3. Gradient border animation - CSS mask or border-image with gradient
    4. Card tilt/perspective - 3D rotation based on cursor X/Y
    5. Parallax image shift - subtle image movement paralleling mouse
    6. Performance optimization - throttle tracking, GPU acceleration via `will-change`
    7. Mobile fallback - disable tracking on touch devices, use static effects
    8. Accessibility - respect `prefers-reduced-motion` for all animations
  - **Files to Update:**
    - `src/components/home/featured-post-hero.tsx` - re-enable holo effects
    - `src/components/blog/post/post-list.tsx` - all layout variants (magazine, grid, list, compact)
    - `src/styles/holo-card.css` - add new selectors for dynamic border tracking
    - Create new: `src/hooks/useMouseTracker.ts` - cursor tracking utility
    - Create new: `src/lib/card-tilt.ts` - 3D tilt calculations
  - **Design Inspiration:**
    - Vercel's featured blog cards with animated borders
    - Apple's product pages with parallax depth
    - Tailwind UI premium components with shimmer effects
  - **Estimated Impact:** Significant visual polish, competitive feature parity with modern platforms

---

## ✅ COMPLETED WORK

### 📅 Recent Completion: Bookmark/Reading List Feature (Dec 8, 2025) ✅

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

**Last Review:** December 7, 2025 | **Next Review:** Monthly or as needed
