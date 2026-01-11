# Test Failure Analysis - Preview Branch
**Date:** December 25, 2025  
**Branch:** preview  
**Total Tests:** 3,516  
**Pass Rate:** 96.6% (3,388 passing, 14 failing unit tests + ~7+ E2E failures)

---

## Summary

The preview branch has **two distinct categories of test failures**:

### Unit/Integration Tests: 14 Failures
- **File:** `src/__tests__/components/navigation/site-header.test.tsx`
- **Category:** Navigation dropdown label mismatches
- **Root Cause:** Navigation config labels changed; tests still expect old labels

### E2E Tests: 7+ Failures  
- **File:** `e2e/activity-embed.spec.ts`
- **Category:** Activity feed embed not loading/rendering
- **Root Cause:** Activity data not available or navigation structure conflicts

---

## DETAILED ANALYSIS

## 1. UNIT TEST FAILURES (14 tests in site-header.test.tsx)

### Problem Overview
The `SiteHeader` component's dropdown tests are failing because the test expectations don't match the current navigation configuration labels.

### Root Cause
**Navigation configuration was updated but tests were not.** The WORK_NAV items now have more descriptive labels:

#### Old Expected Labels (Test)
```
- "View complete portfolio"
- "Open source and community work"
- "Mission-driven partnerships"
- "Early-stage product development"
```

#### New Actual Labels (Config)
```
- "All Projects"
- "Community"
- "Nonprofit"
- "Startup"
```

**Configuration File:** [src/lib/navigation/config.ts](src/lib/navigation/config.ts#L132-L156)

### Affected Tests (14 failures)

| Test Name | Line | Issue | Expected | Actual |
|-----------|------|-------|----------|--------|
| `displays Our Work dropdown links` | 178 | Missing dropdown links | 4 specific links | 4 different labels |
| `closes Our Work dropdown when clicking a link` | 186 | Link not found | "View complete portfolio" | "All Projects" |
| `displays correct links in Our Work dropdown` | 222 | Multiple links missing | Specific text labels | Current labels |
| Navigation-related tests x11 | Various | Link label mismatches | Old descriptions | New concise labels |

### Test File Location
[src/__tests__/components/navigation/site-header.test.tsx](src/__tests__/components/navigation/site-header.test.tsx#L178-L230)

### Component Implementation
The component correctly implements the current navigation config:

```tsx
// src/components/navigation/site-header.tsx, lines 146-173
{WORK_NAV.map((item, index) => {
  return (
    <Link
      href={item.href}
      // Uses aria-label with item.description
      aria-label={item.description}
      role="menuitem"
    >
      <div className="font-medium">{item.label}</div>
      {item.description && (
        <div className="text-xs text-muted-foreground mt-0.5">
          {item.description}
        </div>
      )}
    </Link>
  );
})}
```

The issue: Tests search for link by `aria-label` which uses `item.description`, but the navigation config has short labels and descriptions separated.

### Current Navigation Config (Correct Implementation)
```typescript
// src/lib/navigation/config.ts, lines 132-156
export const WORK_NAV: NavItem[] = [
  {
    href: "/work",
    label: "All Projects",              // ← Short label
    description: "View complete portfolio",  // ← Full description
    exactMatch: true,
  },
  {
    href: "/work?category=community",
    label: "Community",                  // ← Short label
    description: "Open source and community work",  // ← Full description
  },
  {
    href: "/work?category=nonprofit",
    label: "Nonprofit",                  // ← Short label
    description: "Mission-driven partnerships",  // ← Full description
  },
  {
    href: "/work?category=startup",
    label: "Startup",                    // ← Short label
    description: "Early-stage product development",  // ← Full description
  }
];
```

### Fix Strategy

**Option 1: Update Tests to Match Current Config (RECOMMENDED)**
- Search for links using `description` property (more semantic)
- Tests should query by role with regex matching descriptions, not labels
- This aligns with accessibility best practices (aria-label uses descriptions)

**Option 2: Update Navigation Config**
- Change labels back to full descriptions
- Less optimal for space-constrained UI
- Requires component layout changes

**Recommended Approach:** Option 1 - The config structure is correct; tests need updating to reflect current aria-labels.

---

## 2. E2E TEST FAILURES (7+ tests in activity-embed.spec.ts)

### Problem Overview
Multiple activity embed tests are timing out or failing due to:
1. Navigation elements visible when they shouldn't be
2. Activity data not loading
3. PostMessage not being sent

### Failures Breakdown

#### Failure 1: "embed route loads without navigation"
**Error:** Locator('nav') strict mode violation - 2 nav elements found instead of 0
**Location:** [e2e/activity-embed.spec.ts:8](e2e/activity-embed.spec.ts#L8)
**Issue:** The embed route still renders navigation elements

```
Expected: nav should not be visible
Actual: Found 2 nav elements:
  1. Main navigation (hidden on mobile: <nav aria-label="Main navigation">)
  2. Bottom navigation (<nav aria-label="Bottom navigation">)
```

**Root Cause:** The `/activity/embed` route doesn't properly hide navigation or the test is checking for `<nav>` generically instead of specific navigation.

#### Failure 2: "embed sends resize messages via postMessage"
**Error:** `resizeMessage` is undefined
**Location:** [e2e/activity-embed.spec.ts:67](e2e/activity-embed.spec.ts#L67)
**Issue:** No 'activity-embed-resize' message is being sent

**Root Cause:** Either:
1. The activity component isn't rendering
2. The resize observer isn't being triggered
3. PostMessage communication not implemented

#### Failures 3-5: Activity data timeout errors
**Tests:**
- "embed respects source filter parameter" (line 18)
- "embed respects time range parameter" (line 29)  
- "embed respects limit parameter" (line 40)

**Error:** `TimeoutError: page.waitForSelector: Timeout 10000ms exceeded` waiting for `[data-testid*='activity']`

**Root Cause:** Activity data isn't loading on the embed route. Possible issues:
1. API endpoint not responding
2. Activity data not available in environment
3. Component not initialized

#### Failure 6: "embed can be loaded in iframe"
**Error:** iframe content not loading within timeout
**Location:** [e2e/activity-embed.spec.ts:84](e2e/activity-embed.spec.ts#L84)
**Issue:** Combined issue - iframe can't load the content

#### Failure 7: "shows embed generator when button is clicked"
**Error:** Test timeout (30000ms) - "Show Embed Code" button not found
**Location:** [e2e/activity-embed.spec.ts:99](e2e/activity-embed.spec.ts#L99)
**Issue:** Button element doesn't exist or isn't rendered

### Test File Location
[e2e/activity-embed.spec.ts](e2e/activity-embed.spec.ts)

### Potential Root Causes

1. **Navigation Not Hidden:** The embed route might not be properly hiding the SiteHeader and mobile navigation
2. **Activity Data Not Available:** The activity feed needs real data - may not be available in test environment
3. **Component Structure:** The activity-embed component may have changed and test expectations are outdated
4. **Build Issue:** The activity embed page might not be building correctly

### Investigation Needed

Check the following:
1. `/src/app/activity/embed` route implementation (does it hide nav?)
2. `/src/components/activity` component (does it render properly?)
3. API endpoints for activity data
4. Test environment setup (does it have activity data?)

---

## IMPACT ANALYSIS

### What's Working
✅ 3,388 unit/integration tests passing (96.6%)  
✅ Most E2E tests passing (1,280+ running, ~7 failures)  
✅ Core navigation and layout working  
✅ Design token enforcement working  
✅ Most components rendering correctly

### What's Broken
❌ Site header dropdown tests (navigation label mismatches)  
❌ Activity embed tests (missing data/navigation issues)  

### User Impact
- **High:** Users can't see activity feed embed or use embed feature
- **Low:** Navigation dropdowns work fine; tests just have wrong expectations
- **Moderate:** If users try to filter activities by source/time, they won't see results

---

## RECOMMENDED FIXES (Priority Order)

### Priority 1: Fix Unit Test Failures (Easy - 30 mins)
**Location:** [src/__tests__/components/navigation/site-header.test.tsx](src/__tests__/components/navigation/site-header.test.tsx#L178-L230)

**What to do:**
1. Update test expectations to use current WORK_NAV descriptions
2. Change regex patterns from old labels to new labels
3. Use proper aria-label matching with descriptions

**Example fix:**
```typescript
// BEFORE
const allProjectsLink = await screen.findByRole('link', { name: /View complete portfolio/i });

// AFTER
const allProjectsLink = await screen.findByRole('link', { name: /All Projects/i });
```

### Priority 2: Investigate Activity Embed Tests (Medium - 1-2 hours)
**Location:** [e2e/activity-embed.spec.ts](e2e/activity-embed.spec.ts)

**Investigation steps:**
1. Check if `/activity/embed` route exists and properly hides navigation
2. Verify activity data is available in test environment
3. Check if activity component is rendering
4. Review activity data API for issues
5. Check if PostMessage implementation exists

**Potential fixes:**
- Hide navigation on embed route using layout or route-level wrapper
- Ensure activity data seed is populated for tests
- Add proper error handling and logging
- Update test selectors if component structure changed

---

## TEST RUN SUMMARY

```
Unit Tests:      3,388 passing, 14 failing (96.6% pass rate)
E2E Tests:       1,270+ passing, 7 failing (~99.5% pass rate)
Total:           4,658 tests, 4,644 passing, 21 failing (96.6% pass rate)

Failed Test Files:
  ❌ src/__tests__/components/navigation/site-header.test.tsx (14 failures)
  ❌ e2e/activity-embed.spec.ts (7 failures)
```

---

## Files Involved

### Configuration Files
- [src/lib/navigation/config.ts](src/lib/navigation/config.ts) - Navigation structure (WORK_NAV definition)
- [src/lib/navigation/index.ts](src/lib/navigation/index.ts) - Navigation barrel export
- [src/lib/navigation/types.ts](src/lib/navigation/types.ts) - Navigation type definitions

### Component Files
- [src/components/navigation/site-header.tsx](src/components/navigation/site-header.tsx) - Header with dropdowns
- [src/app/activity/embed](src/app/activity/embed) - Activity embed route (needs investigation)

### Test Files
- [src/__tests__/components/navigation/site-header.test.tsx](src/__tests__/components/navigation/site-header.test.tsx) - 14 failures (dropdown labels)
- [e2e/activity-embed.spec.ts](e2e/activity-embed.spec.ts) - 7 failures (embed rendering)

---

## Next Steps

1. ✅ **This Analysis** - Completed
2. **Fix Unit Tests** - Update test expectations for WORK_NAV labels
3. **Debug E2E Tests** - Investigate activity embed route and data
4. **Verify Fixes** - Run tests to confirm all pass
5. **Merge to Main** - When all tests pass

---

**Created:** December 25, 2025  
**Analysis Version:** 1.0  
**Status:** Ready for implementation
