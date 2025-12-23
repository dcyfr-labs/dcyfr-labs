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

### Stage 2: Saved Filter Presets ✅ COMPLETE
**Goal:** Enable user-curated filter combinations for power users

**Tasks:**
- [x] Design filter preset data structure (localStorage)
- [x] Add "Save current filters" button to ActivityFilters
- [x] Create preset management UI (rename, delete, reorder)
- [x] Implement preset dropdown with quick-apply
- [x] Add default presets:
  - "Code Projects" (source: project + blog + github)
  - "Trending This Month" (source: trending, timeRange: month)
  - "Recent Blog Posts" (source: blog, timeRange: week)
  - "All Achievements" (source: milestone + certification + engagement)
- [x] Add localStorage persistence
- [x] Add export/import for sharing presets
- [x] Write unit tests for preset logic
- [ ] Add E2E tests for preset creation/application (future enhancement)

**Implementation Details:**
- `src/lib/activity/presets.ts` - Core preset logic with localStorage
- `src/components/activity/PresetManager.tsx` - Preset management UI
- `src/components/activity/ActivityFilters.tsx` - Integrated preset dropdown
- `src/__tests__/lib/activity-presets.test.ts` - Comprehensive unit tests

**Success Metrics:**
- ✅ localStorage persistence with version control
- ✅ Export/import functionality implemented
- ✅ 4 default presets configured
- ✅ Preset management UI (rename, delete, reorder)
- 📊 User adoption metrics: TBD after deployment
- 📊 Filter application time reduction: TBD after deployment

**Status:** All core functionality implemented and tested. Ready for deployment.

**Completed:** December 23, 2025

---

### Stage 3: Full-Text Search ✅ COMPLETE
**Goal:** Search within descriptions, not just titles, with fuzzy matching

**Tasks:**
- [x] Evaluate search libraries (Fuse.js vs MiniSearch vs custom)
  - **Decision:** MiniSearch - Better suited for advanced query syntax, lighter weight (6KB), built-in fuzzy matching
- [x] Implement client-side fuzzy search with typo tolerance
  - MiniSearch configured with 0.2 fuzzy threshold (~2 character edits)
- [x] Add search input to ActivityFilters component
  - Search input with Cmd+K shortcut
  - Clear search button
  - Search syntax hints displayed
- [x] Highlight matched terms in results
  - Created SearchHighlight component
  - Highlights search terms in titles and descriptions
- [x] Add search history dropdown (recent 10 searches)
  - localStorage persistence
  - Recent searches with result counts
  - Clear history functionality
- [x] Implement advanced query syntax:
  - `tag:typescript` - Search by tag ✅
  - `source:blog` - Filter by source ✅
  - `-github` - Exclude source ✅
  - `"exact phrase"` - Exact match ✅
- [x] Add search analytics (track popular queries)
  - Search history tracks query + result count + timestamp
- [x] Optimize search performance for 1000+ items
  - Performance tests confirm <100ms for 1000 items
  - Pre-built search index for efficiency
- [x] Add keyboard shortcuts (Cmd+K to focus search)
  - Cmd+K / Ctrl+K to focus search input
- [x] Write comprehensive search tests
  - 35 unit tests covering:
    - Query parsing (6 tests)
    - Search functionality (11 tests)
    - Performance benchmarks (2 tests)
    - Search history (6 tests)
    - Term extraction (4 tests)
    - Highlighting (6 tests)
  - All tests passing ✅
- [x] Add E2E tests for search flows
  - 15 E2E scenarios including:
    - Basic search
    - Advanced syntax (tag:, source:, -, "exact")
    - Keyboard shortcuts
    - Search history
    - Filter combinations

**Implementation Details:**
- `src/lib/activity/search.ts` - Search engine with MiniSearch
- `src/components/activity/SearchHighlight.tsx` - Highlight component
- `src/components/activity/ActivityFilters.tsx` - Integrated search UI
- `src/app/activity/activity-client.tsx` - Search state management
- `src/__tests__/lib/activity-search.test.ts` - 35 unit tests
- `e2e/activity-search.spec.ts` - 15 E2E tests

**Success Metrics:**
- ✅ Search response time <100ms for 1000 items (verified in tests)
- 📊 ≥95% of searches return relevant results (TBD after deployment)
- ✅ Fuzzy matching catches typos (verified in tests)
- 📊 Advanced syntax adoption ≥30% (TBD after deployment)

**Performance Achieved:**
- Average search time: ~14ms for 1000 items (86ms under target)
- Complex query time: ~9ms for 1000 items (91ms under target)

**Completed:** December 23, 2025

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
