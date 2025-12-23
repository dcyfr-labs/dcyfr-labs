# Operations TODO

**Last Updated:** December 23, 2025  
**Status:** Active Development

This document tracks operational priorities, feature development stages, and maintenance tasks for dcyfr-labs.

---

## 🎯 Active Development: Activity Feed Enhancement (5-Stage Plan)

### Stage 1: Quick Wins ✅ IN PROGRESS
**Goal:** Improve UX clarity with minimal effort, high impact

**Tasks:**
- [x] Implement month-based trending labels ("Trending in December 2025")
- [x] Update tests for dynamic date validation
- [x] Add results count badge to filter bar
- [x] Add "Clear all filters" button
- [ ] Commit and deploy to preview

**Success Metrics:**
- All tests passing (4/4 trending tests ✅)
- TypeScript validation clean ✅
- User feedback on clarity improvement
- Reduced support questions about "what is trending"

**Estimated Completion:** December 23, 2025

---

### Stage 2: Saved Filter Presets
**Goal:** Enable user-curated filter combinations for power users

**Tasks:**
- [ ] Design filter preset data structure (localStorage)
- [ ] Add "Save current filters" button to ActivityFilters
- [ ] Create preset management UI (rename, delete, reorder)
- [ ] Implement preset dropdown with quick-apply
- [ ] Add default presets:
  - "My Code Projects" (source: project + blog, tags: code-related)
  - "Trending This Month" (source: trending, timeRange: month)
  - "Recent Blog Posts" (source: blog, timeRange: week)
  - "All Achievements" (source: milestone + certification + engagement)
- [ ] Add localStorage persistence
- [ ] Add export/import for sharing presets
- [ ] Write unit tests for preset logic
- [ ] Add E2E tests for preset creation/application

**Success Metrics:**
- ≥90% of returning users create at least one preset
- Average time to apply filters reduced by 70%
- 0 localStorage quota errors

**Estimated Completion:** January 2026

---

### Stage 3: Full-Text Search
**Goal:** Search within descriptions, not just titles, with fuzzy matching

**Tasks:**
- [ ] Evaluate search libraries (Fuse.js vs MiniSearch vs custom)
- [ ] Implement client-side fuzzy search with typo tolerance
- [ ] Add search input to ActivityFilters component
- [ ] Highlight matched terms in results
- [ ] Add search history dropdown (recent 10 searches)
- [ ] Implement advanced query syntax:
  - `tag:typescript` - Search by tag
  - `source:blog` - Filter by source
  - `-github` - Exclude source
  - `"exact phrase"` - Exact match
- [ ] Add search analytics (track popular queries)
- [ ] Optimize search performance for 1000+ items
- [ ] Add keyboard shortcuts (Cmd+K to focus search)
- [ ] Write comprehensive search tests
- [ ] Add E2E tests for search flows

**Success Metrics:**
- Search response time <100ms for 1000 items
- ≥95% of searches return relevant results
- Fuzzy matching catches 90% of typos
- Advanced syntax adoption ≥30%

**Estimated Completion:** February 2026

---

### Stage 4: Activity Heatmap Visualization
**Goal:** Calendar view showing activity intensity by day

**Tasks:**
- [ ] Design heatmap data structure (date → count aggregation)
- [ ] Create HeatmapCalendar component (12-month view)
- [ ] Implement color intensity scale (0-10+ activities)
- [ ] Add tooltip on hover (date + activity count + top sources)
- [ ] Create click-to-filter interaction (click date → filter to that day)
- [ ] Add month navigation controls
- [ ] Implement responsive design (mobile: 3-month view)
- [ ] Add animation for data loading
- [ ] Add accessibility (keyboard navigation, screen reader support)
- [ ] Integrate with activity page (tab view: Timeline | Heatmap)
- [ ] Add export as image functionality
- [ ] Write unit tests for date aggregation
- [ ] Add E2E tests for heatmap interactions
- [ ] Add performance monitoring (render time <500ms)

**Success Metrics:**
- Heatmap loads in <500ms for 1 year of data
- ≥50% of users switch to heatmap view at least once
- Click-to-filter engagement ≥30%
- Lighthouse Performance ≥90

**Estimated Completion:** March 2026

---

### Stage 5: Virtual Scrolling for Performance
**Goal:** Only render visible items for feeds with 1000+ items

**Tasks:**
- [ ] Evaluate virtual scrolling libraries (react-virtual vs react-window vs tanstack-virtual)
- [ ] Implement virtual scrolling for ActivityFeed component
- [ ] Handle variable item heights (blog posts vs projects)
- [ ] Preserve time group headers in virtual scroll
- [ ] Add scroll-to-top button for long feeds
- [ ] Implement scroll position restoration (back button preserves position)
- [ ] Add infinite scroll for pagination (load more on scroll)
- [ ] Optimize memory usage (unmount off-screen items)
- [ ] Add loading indicators during scroll
- [ ] Test with 5000+ item dataset
- [ ] Add performance monitoring dashboard
- [ ] Write unit tests for virtual scroll logic
- [ ] Add E2E tests for scroll interactions
- [ ] Add accessibility (focus management, screen reader announcements)

**Success Metrics:**
- Initial render time <200ms for 5000 items (vs 5000ms+ baseline)
- Memory usage <100MB for 5000 items
- Scroll FPS ≥60 (smooth scrolling)
- Time-to-interactive <1s
- Lighthouse Performance ≥95

**Estimated Completion:** April 2026

---

## 📊 Performance Targets (Post Stage 5)

| Metric | Current | Target | Stage |
|--------|---------|--------|-------|
| Activity Feed Load Time | ~500ms | <200ms | Stage 5 |
| Filter Application Time | ~100ms | <50ms | Stage 2 |
| Search Response Time | N/A | <100ms | Stage 3 |
| Memory Usage (5000 items) | ~500MB | <100MB | Stage 5 |
| Lighthouse Performance | 92 | ≥95 | Stage 5 |
| Accessibility Score | 95 | ≥98 | Stage 4 |

---

## 🔄 Ongoing Maintenance

### Weekly
- [ ] Review Dependabot PRs (auto-merge enabled)
- [ ] Monitor Lighthouse CI reports
- [ ] Check CodeQL security alerts
- [ ] Review activity feed usage analytics

### Monthly
- [ ] Update AI agent instructions (quarterly sync)
- [ ] Review and archive completed features
- [ ] Analyze activity feed engagement metrics
- [ ] Update this TODO with new priorities

### Quarterly
- [ ] Comprehensive performance audit
- [ ] Update documentation
- [ ] Review and update filter presets
- [ ] Evaluate new features from user feedback

---

## 🚨 Priority Bugs / Issues

_No critical bugs currently tracked. Check GitHub Issues for community-reported items._

---

## 📝 Notes

**Activity Feed Enhancement Strategy:**
- Focus on incremental value delivery (Stage 1 done in 1 day)
- Each stage delivers standalone value
- Performance optimizations deferred to Stage 5 (when data volume justifies)
- User research drives Stage 2-4 feature prioritization

**Success Criteria:**
- ≥90% test coverage maintained throughout
- Design token compliance ≥95%
- No breaking changes to existing API
- All features mobile-responsive
- WCAG AA compliance minimum

**Future Considerations (Post Stage 5):**
- AI-powered topic clustering (#31 from brainstorm)
- RSS feed generation (#51)
- Bookmarking system (#47)
- Real-time GitHub commit feed (#123)
- Activity embeds for external sites (#57)

---

**For detailed brainstorm of 127 potential improvements, see activity feed session notes from December 23, 2025.**
