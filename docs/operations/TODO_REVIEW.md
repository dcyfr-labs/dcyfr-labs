# TODO Comments Analysis & Action Plan

**Generated:** January 17, 2026  
**Total TODOs Found:** 33  
**Status:** Categorized and prioritized

---

## Summary by Category

| Category | Count | Action |
|----------|-------|--------|
| **STALE** (Remove/Document) | 8 | Delete or convert to documentation |
| **ACTIVE** (Keep, Track) | 18 | Valid future work, keep as-is |
| **BACKLOG** (Convert to Issues) | 7 | Convert to GitHub issues |

---

## 🗑️ STALE TODOs (Remove or Document)

### 1. Commented-Out JSX TODOs (3 items)

**Files:**
- `src/components/projects/layouts/default-project-layout.tsx:167-169`
  - Tech Stack Badges
  - Tag Badges
- `src/components/layouts/article-header.tsx:190`
  - Holo effects after mouse-tracking

**Action:** Remove commented code if not planned for near-term implementation
```bash
# Check if these features are in backlog
grep -r "Tech Stack\|Tag Badges\|holo effects" docs/
```

**Recommendation:** Remove commented code, add to feature backlog if desired

---

### 2. Dead Code Path - trending-integration-example.ts (5 items)

**File:** `src/lib/activity/trending-integration-example.ts:76,93,107,120`

**TODOs:**
- Implement with Vercel Analytics
- Implement with server-side like tracking  
- Implement with GitHub Discussions API
- Implement with analytics scroll depth tracking

**Action:** This entire file is example code (returns hardcoded 0s)
- Decision: Remove file or move to `docs/examples/`
- Related TODO in `src/lib/activity/trending.ts:174` - Implement real metric aggregation

**Recommendation:** DELETE file (see Phase 2.3)

---

### 3. Test Skips Without Context (2 items)

**Files:**
- `src/__tests__/integration/api-analytics.test.ts:55`
  - "API refactored - update mocks to match new implementation"
- `src/__tests__/integration/error-scenarios.test.ts:49`
  - "Error handling refactored - update tests for new implementation"

**Action:** Check if refactoring is complete
- If yes: Update tests
- If no: Create GitHub issue to track

**Recommendation:** Investigate and either fix or create issue

---

### 4. Stale Investigation TODO

**File:** `src/__tests__/validation/reports-safety.test.ts:4`

**TODO:** "PII scanner script needs investigation - may have stale reports"

**Action:** This is Phase 2.2 task - investigate today

**Recommendation:** FIX TODAY (Phase 2.2)

---

## ✅ ACTIVE TODOs (Keep as Valid Future Work)

### Authentication & OAuth (3 items)

**Files:**
- `src/lib/storage-adapter.ts:142` - Implement when OAuth is ready
- `src/lib/storage-adapter.ts:274` - Switch to ApiStorageAdapter when OAuth is implemented  
- `src/lib/activity/bookmarks.ts:510` - Implement server sync when authentication is available

**Status:** Valid future work, blocked by OAuth implementation
**Action:** Keep as-is, track in OAuth project

---

### Analytics Integration (6 items)

**Files:**
- `src/lib/analytics-integration.ts:369,379` - Google Analytics Data API integration
- `src/lib/analytics-integration.ts:415,425` - Google Search Console API integration
- `src/components/analytics/social-metrics.tsx:65` - Fetch actual referral counts
- `src/app/api/maintenance/metrics/route.ts:30` - Replace with Redis/Inngest data

**Status:** Valid future work, analytics roadmap
**Action:** Keep as-is, track in analytics project

---

### Activity & Tracking (4 items)

**Files:**
- `src/lib/activity/sources.server.ts:128` - Reading completion tracking
- `src/lib/activity/sources.server.ts:564` - Shares tracking
- `src/lib/comments.ts:245` - 24h filtering implementation
- `src/lib/activity/types.ts:8` - Create documentation at `/docs/features/activity-feed.md`

**Status:** Valid future enhancements
**Action:** Keep as-is, add docs task to backlog

---

### Testing & Quality (2 items)

**Files:**
- `src/components/blog/__tests__/blog-post-layout-wrapper.test.tsx:31` - Re-enable when right rail is implemented

**Status:** Valid test skip, feature-dependent
**Action:** Keep as-is until right rail implemented

---

### Monitoring & Alerts (3 items)

**Files:**
- `src/inngest/session-management.ts:114` - Integrate with monitoring/alerting
- `src/inngest/session-management.ts:152` - Log to audit trail in production
- `src/inngest/session-management.ts:247,265` - Emergency alerts and Redis cleanup

**Status:** Production hardening tasks
**Action:** Keep as-is, track in ops/monitoring project

---

## 📋 BACKLOG TODOs (Convert to GitHub Issues)

### 1. IP Reputation Manual Override

**File:** `src/app/api/ip-reputation/route.ts:390`

**TODO:** Implement manual reputation override

**Action:** Create GitHub issue
**Priority:** Medium
**Labels:** enhancement, security

---

### 2. MCP FastMCP Prompt Re-enable

**File:** `src/mcp/design-token-server.ts:576`

**TODO:** Re-enable after verifying correct FastMCP prompt API

**Action:** Create GitHub issue  
**Priority:** Low
**Labels:** mcp, investigation

---

### 3. MCP Health Duration Calculation

**File:** `src/lib/mcp-health-tracker.ts:232`

**TODO:** Calculate duration by finding next 'ok' status

**Action:** Create GitHub issue
**Priority:** Low  
**Labels:** mcp, enhancement

---

## 📊 Action Summary

### Immediate Actions (Phase 2)

- [ ] **Remove trending-integration-example.ts** (dead code)
- [ ] **Investigate reports-safety.test.ts** (stale skip)
- [ ] **Review commented JSX TODOs** (remove or backlog)
- [ ] **Check refactored test TODOs** (update or issue)

### Follow-up Actions (After Phase 2)

- [ ] Create 3 GitHub issues for backlog TODOs
- [ ] Add OAuth TODOs to OAuth project tracking
- [ ] Add analytics TODOs to analytics roadmap
- [ ] Create `docs/features/activity-feed.md` documentation

---

## Verification Commands

```bash
# Count TODOs by category
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l

# Find stale test skips
grep -r "describe.skip\|it.skip\|test.skip" src/__tests__/ -l

# Check for commented-out code
grep -r "^[[:space:]]*// TODO" src/components/ --include="*.tsx"

# Find analytics TODOs
grep -r "TODO.*[Aa]nalytics" src/lib/ --include="*.ts"
```

---

**Next Steps:**
1. Execute Phase 2.2: Investigate reports-safety.test.ts
2. Execute Phase 2.3: Remove trending-integration-example.ts
3. Execute Phase 2.5: Clean up commented JSX TODOs
4. Create GitHub issues for backlog items

**See Also:**
- [CLEANUP_LOG.md](CLEANUP_LOG.md) - Phase 1 cleanup record
- Project backlog (GitHub Issues)
