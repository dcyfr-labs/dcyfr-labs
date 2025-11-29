# Project TODO & Issue Tracker

This document tracks **active and pending** work only. Completed tasks are in **`done.md`**.

**Last Updated:** November 29, 2025 (Phase 4 Complete)

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

- 1196 tests passing (94%+ pass rate)
- 198 integration tests
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

## ⚪ Backlog

Items deferred until data validates need or time permits.

### Testing & Quality

- [ ] Fix React 19 test failures - 11 tests (2-3 hours)
  - Wrap Mermaid async state updates in act()
  - Fix rate limiting test timing issues
  - Fix error scenario integration tests

### Infrastructure & Reliability

- [ ] Backup & disaster recovery plan (2 hours)
- [ ] GitHub Actions CI improvements (2-3 hours)
- [ ] Automated performance regression tests (3-4 hours)

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
