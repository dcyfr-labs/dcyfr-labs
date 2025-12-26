# Test Failure Quick Reference

## Overview
- **Total Tests:** 4,658
- **Passing:** 4,644 (96.6%)
- **Failing:** 21 tests (14 unit + 7 E2E)

## Unit Test Failures (14)

### File: `src/__tests__/components/navigation/site-header.test.tsx`

**Root Cause:** Navigation configuration labels don't match test expectations

#### The Mismatch
```
Navigation Config (CURRENT - CORRECT)    │ Test Expectations (OLD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│━━━━━━━━━━━━━━━━━━━━━━━━━━
"All Projects"                           │ "View complete portfolio"
"Community"                              │ "Open source and community work"
"Nonprofit"                              │ "Mission-driven partnerships"
"Startup"                                │ "Early-stage product development"
```

#### Failed Tests (14)
1. `displays Our Work dropdown links`
2. `closes Our Work dropdown when clicking a link`
3. `displays correct links in Our Work dropdown`
4. + 11 other navigation-related dropdown tests

#### Solution
Update test expectations in [src/__tests__/components/navigation/site-header.test.tsx](src/__tests__/components/navigation/site-header.test.tsx) to match current WORK_NAV labels.

**Effort:** ~30 minutes | **Complexity:** Low

---

## E2E Test Failures (7)

### File: `e2e/activity-embed.spec.ts`

**Root Cause:** Activity embed route not rendering/hiding navigation properly, or activity data missing

#### Failed Tests & Issues

| Test | Error | Line | Issue |
|------|-------|------|-------|
| embed route loads without navigation | Strict mode: 2 nav elements found | 8 | Nav not hidden on embed route |
| embed sends resize messages | resizeMessage undefined | 67 | PostMessage not sent |
| embed respects source filter | Timeout waiting for activity | 18 | No activity data |
| embed respects time range | Timeout waiting for activity | 29 | No activity data |
| embed respects limit parameter | Timeout waiting for activity | 40 | No activity data |
| embed can be loaded in iframe | Timeout loading iframe content | 84 | iframe not loading |
| shows embed generator | Button not found (30s timeout) | 99 | Component not rendering |

#### Root Causes
1. **Navigation visible on embed route** - `/activity/embed` should hide SiteHeader & BottomNav
2. **Activity data missing** - Test environment might not have activity data
3. **Component structure changed** - Test selectors may be outdated
4. **PostMessage not implemented** - Resize message not being sent

#### Solution
Investigate and fix:
1. `/src/app/activity/embed` route (hide navigation)
2. Activity component rendering (verify data loads)
3. PostMessage implementation (if needed)
4. Update test selectors if component changed

**Effort:** ~1-2 hours | **Complexity:** Medium-High

---

## Quick Stats

```
✅ Passing: 4,644 (96.6%)
❌ Failing: 14 unit tests (navigation labels)
❌ Failing: 7 E2E tests (activity embed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Est. Fix Time: ~2 hours
🎯 Priority: Medium (embed feature broken, nav tests easy)
```

---

## Files to Check/Update

### Must Update
- [ ] [src/__tests__/components/navigation/site-header.test.tsx](src/__tests__/components/navigation/site-header.test.tsx) - Update WORK_NAV label expectations
- [ ] [src/app/activity/embed](src/app/activity/embed) - Investigate navigation hiding
- [ ] [src/components/activity](src/components/activity) - Verify component rendering

### Reference
- [src/lib/navigation/config.ts](src/lib/navigation/config.ts) - Current WORK_NAV configuration
- [src/components/navigation/site-header.tsx](src/components/navigation/site-header.tsx) - Current implementation
- [e2e/activity-embed.spec.ts](e2e/activity-embed.spec.ts) - E2E test file
- [TEST_FAILURE_ANALYSIS_PREVIEW.md](TEST_FAILURE_ANALYSIS_PREVIEW.md) - Full analysis

---

## Next Steps

### Step 1: Fix Unit Tests (30 mins)
```bash
# Edit test file to match current navigation config
# Change expected labels from old names to new names
# Run: npm run test:run src/__tests__/components/navigation/site-header.test.tsx
```

### Step 2: Debug E2E Tests (1-2 hours)
```bash
# 1. Check if /activity/embed route properly hides nav
# 2. Verify activity data exists in test environment
# 3. Check component rendering and data loading
# 4. Run: npm run test:e2e
```

### Step 3: Verify All Tests Pass
```bash
npm run test:run && npm run test:e2e
```

---

**Created:** December 25, 2025 | **Status:** Analysis Complete, Ready for Implementation
