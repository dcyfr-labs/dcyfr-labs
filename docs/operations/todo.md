# Project TODO & Issue Tracker

This document tracks **active and pending** work only. Completed tasks are in **`done.md`**.

**Last Updated:** December 4, 2025 (Blog Frontmatter Improvements Complete)

---

## 🎯 Status Overview

All major phases complete. Project is in **maintenance mode** with data-driven enhancements.

| Phase | Status | Completed |
|-------|--------|-----------|
| Phase 1: Foundation & Reliability | ✅ Complete | Nov 23, 2025 |
| Phase 2: Performance & Visibility | ✅ Complete | Nov 22, 2025 |
| Phase 3: Enhancement & Polish | ✅ Complete | Nov 25, 2025 |
| Phase 4: Code Organization | ✅ Complete | Nov 26, 2025 |
| Phase 4A-C: Maintenance Dashboard | ✅ Complete | Nov 29, 2025 |

**Key Metrics:**

- 1225/1232 tests passing (99.4% pass rate) ✅
- 198 integration tests
- 0 security vulnerabilities ✅
- 0 TypeScript compilation errors ✅
- All dependencies current (latest versions) ✅
- All Core Web Vitals monitored
- SEO foundation complete
- Full conversion tracking infrastructure

---

## 🟢 Active Work Queue

### Maintenance Automation (Complete) ✅

- [x] **Phase 1: Testing Automation** ✅ (Nov 28, 2025)
  - Weekly test health reports with Sentry enrichment
  - Automated GitHub Issue creation
  - Coverage tracking and regression detection
  - See [`docs/operations/maintenance-automation.md`](maintenance-automation.md)

- [x] **Phase 2: Security Automation** ✅ (Nov 28, 2025)
  - Monthly security reviews
  - Automated branch cleanup
  - Dependency vulnerability tracking
  - CodeQL integration and SBOM generation

- [x] **Phase 3: Content & Cleanup** ✅ (Nov 29, 2025)
  - Blog frontmatter validation (PR + weekly)
  - Dead code detection via ts-prune
  - Unused dependency detection via depcheck
  - Monthly workspace cleanup checklists

- [x] **Phase 4: Dashboard & Observability** ✅ (Nov 29, 2025)
  - Maintenance dashboard at `/dev/maintenance` with real-time workflow status
  - Observation logging system with Redis storage (100 most recent)
  - 52-week trend visualizations using Recharts
  - Metrics API with caching and graceful fallback
  - Analytics dashboard validated (100% real data)

---

## 🟢 Recent Completion: Operational Audit (Dec 2, 2025) ✅

Comprehensive operational audit completed with immediate remediation:

- [x] **Full Security Audit** ✅
  - 0 vulnerabilities across 2,054 dependencies
  - All security automation verified
  - Report: [`docs/security/OPERATIONAL_AUDIT_2025-12-02.md`](../security/OPERATIONAL_AUDIT_2025-12-02.md)

- [x] **TypeScript Compilation Fixes** ✅ (30 minutes)
  - Fixed 12 type errors in project-filters tests
  - Fixed 1 type error in webkit-mobile-nav E2E test
  - Updated `ProjectFiltersProps` and `ProjectStatusFilterProps` to accept `status: string | null`
  - All TypeScript compilation now passing (0 errors)

- [x] **Dependency Updates** ✅ (30 minutes)
  - Updated `@vitest/coverage-v8`: 4.0.14 → 4.0.15
  - Updated `@vitest/ui`: 4.0.14 → 4.0.15
  - Updated `vitest`: 4.0.14 → 4.0.15
  - Updated `mermaid`: 11.12.1 → 11.12.2
  - Updated `shiki`: 3.17.1 → 3.18.0
  - All tests and build passing after updates

- [x] **Code Quality Verification** ✅
  - Test pass rate: 99.4% (1225/1232)
  - TypeScript: 0 errors
  - Build: Successful
  - Linting: 59 warnings (design tokens, non-blocking)

**Overall Health Score:** 90/100 (Grade: A-)

See full audit report for recommendations and remaining backlog items.

---

## 🟢 Recent Completion: Red Team Security Analysis (Dec 4, 2025) ✅

Comprehensive security penetration testing and vulnerability remediation completed:

- [x] **Red Team Security Analysis** ✅
  - Full attack surface analysis from public repository
  - Information disclosure review (0 secrets exposed)
  - Authentication & authorization pattern testing
  - API endpoint security validation
  - Security header & CSP configuration audit
  - Dependency vulnerability scanning (0 vulnerabilities)
  - CI/CD security review
  - **Overall Risk Level: LOW** with strong defense-in-depth

- [x] **High-Priority Security Fixes** ✅ (Dec 4, 2025 - 30 minutes)
  1. **CSP Header Duplication Fixed**
     - Removed conflicting CSP from `vercel.json`
     - Now uses only nonce-based CSP from `src/proxy.ts`
     - Eliminated weaker `'unsafe-inline'` directive
     - Stronger XSS protection via cryptographic nonces

  2. **GitHub Token Logging Removed**
     - Removed verbose token logging in `/api/github-contributions`
     - Eliminated information disclosure risk (token length + first 10 chars)
     - Retained basic authentication status logging

  3. **Fail-Closed Rate Limiting**
     - Added `failClosed` option to `RateLimitConfig` type
     - Contact form now fails closed on Redis errors
     - Prevents abuse during service degradation
     - Other endpoints continue to fail open for availability

- [x] **Testing & Validation** ✅
  - 23/23 rate limiter tests passing
  - 6/6 contact API tests passing
  - 31/31 GitHub contributions API tests passing
  - 0 TypeScript compilation errors
  - 0 new linting warnings

**Security Posture:** Excellent defense-in-depth with multiple protective layers

**Remaining Low-Priority Items:**

- Add authentication to health check cron endpoint
- Implement server-side session IDs for anti-spam
- Add explicit CSRF tokens for state-changing operations
- Sanitize documentation examples with clearer placeholders

---

## 🟢 Recent Completion: Blog Frontmatter Improvements (Dec 4, 2025) ✅

Comprehensive audit and standardization of blog post metadata:

- [x] **Timezone-Safe Timestamps** ✅
  - All 9 posts updated with full ISO timestamps (`2025-12-03T12:00:00Z`)
  - Fixed date display bug (CVE post showing Dec 2 instead of Dec 3)
  - Prevents timezone-related display issues across all posts

- [x] **Metadata Consistency** ✅
  - Added missing `updatedAt` field to CVE post
  - Fixed copy-pasted image metadata in 2 posts (hardening, shipping)
  - Added consistent `credit: "Default Blog Image"` to all placeholder images

- [x] **Image Metadata Accuracy** ✅
  - Updated alt text and captions to match actual post content
  - Removed incorrect AI/MCP references from portfolio posts
  - Ensured all image metadata is descriptive and relevant

**Standards Established:**

- Always use full timestamps: `publishedAt: "2025-12-04T12:00:00Z"`
- Include `updatedAt` on all posts (even if same as publishedAt)
- Image metadata must match post content (alt, caption, credit)
- Consistent field ordering across all posts

**Future Opportunities Identified:**

- 8/9 posts use placeholder images - consider custom hero images
- Add SEO fields: keywords, author, readingTime
- Add organization fields: series, relatedPosts
- Separate social media images: ogImage, twitterCard

---

## ⚪ Backlog

Items deferred until data validates need or time permits.

### Testing & Quality

- [ ] Fix design token linting warnings (2-3 hours)
  - 59 warnings remaining (reduced from 83 via auto-fix on Dec 2)
  - Spacing violations: space-y-8, space-y-6, gap-6/7/8/9
  - Typography violations: hardcoded text-* and font-* classes
  - Affected files: activity-client.tsx, AnalyticsClient.tsx, blog/[slug]/page.tsx, dev pages
  - Replace hardcoded values with design tokens from @/lib/design-tokens

- [ ] Fix React 19 test failures - 11 tests (2-3 hours)
  - Wrap Mermaid async state updates in act()
  - Fix rate limiting test timing issues
  - Fix error scenario integration tests

- [ ] Fix broken Sentry MCP integration (1 hour)
  - MCP server returning 404 for organization `dcyfr-labs-gj` (should be `dcyfr-labs`)
  - Update VS Code Sentry MCP extension settings with correct org
  - Test with `mcp_sentry_find_organizations` tool

- [x] **CodeQL Configuration** ✅ (Nov 29, 2025)
  - Disabled default setup conflicting with advanced workflow
  - Advanced `.github/workflows/codeql.yml` now runs without SARIF errors

### Infrastructure & Reliability

- [ ] Backup & disaster recovery plan (2 hours)
- [ ] GitHub Actions CI improvements (2-3 hours)
- [ ] Automated performance regression tests (3-4 hours)

## 🔧 Current Short-Term Tasks (Next day)

_All current short-term tasks completed as of December 4, 2025._


### Performance (Data-Driven)

- [ ] Lazy load below-fold components (2-3 hours)
- [ ] Optimize ScrollReveal usage (3-4 hours)
- [ ] Add image blur placeholders (2-3 hours)
- [ ] Implement Partial Prerendering (4-6 hours)

### Homepage Enhancements

- [ ] Tech stack visualization - Icon grid (2-3 hours)
- [ ] Social links section (1 hour)
- [ ] Tag cloud / popular topics (1-2 hours)

### Resume Page Enhancements

- [ ] Timeline visualization (3-4 hours)
- [ ] Certification verification links (1 hour)
- [ ] Company logos (2 hours)
- [ ] PDF download (4-6 hours)

### About Page Enhancements

- [ ] Featured blog posts section (2 hours)
- [ ] Downloadable resume button (1 hour)

### Blog Features Enhancements

- [ ] Bookmark/reading list functionality (4-6 hours)
- [ ] Print-friendly styling (2-3 hours)
- [ ] Advanced search filters (4-6 hours)
- [ ] Mobile filter drawer/sheet pattern (3-4 hours)
  - Replace collapsible bar with bottom sheet or slide-out drawer
  - Uses familiar mobile UX patterns (e.g., shadcn Sheet component)
- [ ] Floating filter FAB for mobile (2-3 hours)
  - Floating action button that opens filter modal
  - Maximum content visibility, minimal footprint
- [ ] Horizontal scroll filter chips (2-3 hours)
  - Single row of horizontally scrolling quick-filter badges
  - "More" button for full filter access

### Analytics Dashboard Enhancements

- [ ] Sparkline trend visualizations (2-3 hours)
- [ ] GitHub-style heatmap calendar view (3-4 hours)
- [ ] Real Vercel Analytics integration (4-6 hours)

### New Pages

- [ ] Professional Services page (4-6 hours)

---

## 📋 Quick Reference

### Before Starting Work

- [ ] Check accessibility impact (WCAG 2.1 AA)
- [ ] Estimate effort (add 25% buffer)
- [ ] Consider test coverage needs

### Before Committing

- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Update documentation if needed
- [ ] Move completed item to `done.md`

### Priority Framework

1. **Critical** → Compliance, security, accessibility
2. **High** → Infrastructure, testing, monitoring
3. **Medium** → Performance, SEO, content
4. **Low** → Polish, enhancements (data-driven)
5. **Backlog** → Speculative, no validated need

---

## 📊 Project Statistics

**Completed Work:**

- ✅ 4 phases complete
- ✅ 1196 tests passing
- ✅ 198 integration tests
- ✅ Full SEO foundation
- ✅ Conversion tracking active
- ✅ Bot detection on API routes
- ✅ Performance monitoring
- ✅ 80 components organized
- ✅ 411 lines of duplicated code eliminated
- ✅ 13 unnecessary files removed

**Documentation:**

- Architecture guides in `/docs/architecture/`
- Component docs in `/docs/components/`
- Feature guides in `/docs/features/`
- Security docs in `/docs/security/`
- Completed work in `/docs/operations/done.md`

---

**Next Review:** Monthly or as needed
