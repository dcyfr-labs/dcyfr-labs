# Skipped Tests Documentation

**Status:** Phase 1 Complete | Phase 2 Ready to Implement  
**Last Updated:** January 14, 2026  
**Total Skipped:** 154 tests across 7 files

## Overview

This document provides complete documentation of all skipped integration and feature tests, organized by reason for skipping. Each section includes:
- File locations and test counts
- Specific skip reasons (from TODO comments)
- Blocking dependencies
- MSW (Mock Service Worker) handler requirements
- Re-enablement criteria

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Skipped Tests | 154 |
| Skipped Test Files | 7 |
| Skip Rate | 5.6% of 2,760 tests |
| Active Pass Rate | 94.4% (2,606 passing) |
| Phase 2 Goal | Re-enable to <1% skip rate |

---

## 1. API Refactoring - Outdated Mocks (92 tests)

Tests skipped due to API implementation changes that require updated mocks and handlers.

### 1.1 Analytics API Integration
**File:** `src/__tests__/integration/api-analytics.test.ts`  
**Skip Count:** 30 tests  
**Skip Reason:** `// TODO: API refactored - update mocks to match new implementation`

**Current Skip Status:**
```typescript
describe.skip('Analytics API Integration', () => {
  // 30 tests covering:
  // - GET /api/analytics endpoints
  // - Views, shares, comments aggregation
  // - Date range filtering
  // - Redis caching behavior
  // - Rate limiting
  // - Error scenarios
})
```

**Blocking Factors:**
- ❌ Mock implementations outdated (Redis client structure changed)
- ❌ API route signature changed
- ❌ Response format evolved

**MSW Handlers Needed:**
- `handlers/redis.ts` - Mock Redis get/set/del operations
- `handlers/api.ts` - Mock `/api/analytics` routes
- `handlers/cache.ts` - Mock caching layer

**Re-enablement Checklist:**
- [ ] Review current `/api/analytics` implementation
- [ ] Update Redis mocks to match current `ioredis` patterns
- [ ] Create MSW handlers for analytics endpoints
- [ ] Update response schemas in test assertions
- [ ] Test with actual caching behavior

**Estimated Effort:** 2-3 hours

---

### 1.2 Views API Integration
**File:** `src/__tests__/integration/api-views.test.ts`  
**Skip Count:** 20 tests  
**Skip Reason:** `// TODO: API refactored - update mocks to match new implementation`

**Current Skip Status:**
```typescript
describe.skip('Views API Integration', () => {
  // 20 tests covering:
  // - POST /api/views endpoints
  // - View tracking and aggregation
  // - Session validation
  // - Rate limiting
  // - Cache invalidation
  // - Error handling
})
```

**Blocking Factors:**
- ❌ `isValidSessionId` mock signature changed
- ❌ Views tracking implementation refactored
- ❌ Cache layer updated

**MSW Handlers Needed:**
- `handlers/api.ts` - Mock `/api/views` routes
- `handlers/redis.ts` - Mock Redis operations for view counts

**Re-enablement Checklist:**
- [ ] Review `src/app/api/views/route.ts` current implementation
- [ ] Update session validation mocks
- [ ] Create MSW handlers for views endpoints
- [ ] Test view aggregation logic
- [ ] Validate cache invalidation behavior

**Estimated Effort:** 1.5-2 hours

---

### 1.3 GitHub Contributions API Integration
**File:** `src/__tests__/integration/api-github-contributions.test.ts`  
**Skip Count:** 31 tests  
**Skip Reason:** Security-related (endpoint removed, but tests are well-structured for re-enablement)

**Current Skip Status:**
```typescript
describe.skip('GitHub Contributions API Integration', () => {
  // 31 tests covering:
  // - GET /api/github-contributions endpoint
  // - Username validation
  // - GitHub GraphQL API integration
  // - Contribution data aggregation
  // - Cache behavior
  // - Rate limiting (GitHub + local)
  // - Error handling
})
```

**Blocking Factors:**
- ❌ GitHub endpoint removed for security (comment at line 2)
- ❌ GraphQL query structure may have changed
- ❌ Mocks need updating for current API version

**MSW Handlers Needed:**
- `handlers/api.ts` - Mock `/api/github-contributions` route
- `handlers/github-graphql.ts` - Mock GitHub GraphQL endpoint
- `handlers/cache.ts` - Mock contribution data caching

**Re-enablement Checklist:**
- [ ] Review GitHub API security considerations
- [ ] Decide: re-enable with mock or deprecate endpoint?
- [ ] If re-enabling: update GraphQL query mocks
- [ ] Create comprehensive MSW handlers
- [ ] Test all error scenarios (auth, rate limits, invalid users)
- [ ] Validate cache behavior

**Estimated Effort:** 2-3 hours (depends on security review decision)

---

## 2. Page Refactoring - Outdated Assertions (34 tests)

Tests skipped because page structure or implementation has changed, requiring updated test assertions.

### 2.1 Feeds Page
**File:** `src/__tests__/app/feeds.test.tsx`  
**Skip Count:** 34 tests  
**Skip Reason:** `// TODO: Feeds page refactored - tests need update to match new structure`

**Current Skip Status:**
```typescript
describe.skip("FeedsPage", () => {
  // 34 tests covering:
  // - Metadata validation (title, description, canonical)
  // - Page structure and layout
  // - Feed list rendering
  // - Feed categories
  // - RSS/Atom feed links
  // - Subscribe buttons and CTAs
  // - Mobile responsiveness
})
```

**Blocking Factors:**
- ❌ Page layout/structure changed
- ❌ Component hierarchy updated
- ❌ Heading text or element selectors changed
- ❌ Feed rendering logic updated

**MSW Handlers Needed:**
- None (page tests don't require API mocking)

**Re-enablement Checklist:**
- [ ] Review current `src/app/feeds/page.tsx` implementation
- [ ] Update heading selectors and text assertions
- [ ] Check for new components or structure changes
- [ ] Update render assertions to match new layout
- [ ] Test metadata generation
- [ ] Validate feed list rendering
- [ ] Test responsive behavior

**Estimated Effort:** 1-1.5 hours

---

## 3. Error Handling Refactoring (4 tests)

Tests skipped due to error handling implementation changes.

### 3.1 Error Scenario Integration Tests
**File:** `src/__tests__/integration/error-scenarios.test.ts`  
**Skip Count:** 4 tests  
**Skip Reason:** `// TODO: Error handling refactored - update tests for new implementation`

**Current Skip Status:**
```typescript
describe.skip('Error Scenario Integration Tests', () => {
  // 4 tests covering:
  // - API error responses
  // - Invalid input handling
  // - Rate limit errors
  // - Server error scenarios
})
```

**Blocking Factors:**
- ❌ Error response format changed
- ❌ Error handling middleware updated
- ❌ Status codes or error messages modified

**MSW Handlers Needed:**
- `handlers/api.ts` - Mock error response scenarios

**Re-enablement Checklist:**
- [ ] Review error handling implementation
- [ ] Update expected error status codes
- [ ] Update error message assertions
- [ ] Test rate limiting error responses
- [ ] Validate server error behavior

**Estimated Effort:** 1 hour

---

## 4. Infrastructure/Script Issues (1 test)

Tests skipped due to validation script or infrastructure changes.

### 4.1 Reports Safety (PII Scanning)
**File:** `src/__tests__/validation/reports-safety.test.ts`  
**Skip Count:** 1 test  
**Skip Reason:** `// TODO: PII scanner script needs investigation - may have stale reports`

**Current Skip Status:**
```typescript
describe.skip('Reports safety', () => {
  it('scan reports for obvious PII', () => {
    const res = spawnSync('node', ['scripts/validation/check-reports-for-pii.mjs'], { encoding: 'utf8' })
    expect(res.status).toBe(0)
  })
})
```

**Blocking Factors:**
- ❌ Script `scripts/validation/check-reports-for-pii.mjs` may be outdated
- ❌ Report structure may have changed
- ❌ PII detection patterns may need updating

**MSW Handlers Needed:**
- None (this is a validation script test)

**Re-enablement Checklist:**
- [ ] Check if `scripts/validation/check-reports-for-pii.mjs` exists and is current
- [ ] Review script implementation for PII patterns
- [ ] Determine if reports are in the expected location/format
- [ ] Run script locally to verify it exits with status 0
- [ ] Update script if necessary
- [ ] Add any missing PII patterns

**Estimated Effort:** 0.5-1 hour

---

## 5. Performance Benchmarks (19 tests)

Tests skipped due to performance infrastructure not yet in place.

### 5.1 Performance Benchmark Tests
**File:** `src/__tests__/integration/performance-benchmarks.test.ts`  
**Skip Count:** 19 tests  
**Skip Reason:** Performance testing infrastructure not fully integrated

**Current Skip Status:**
```typescript
describe.skip('Performance Benchmark Tests', () => {
  // 19 tests covering:
  // - Single API request performance (<200ms)
  // - Bulk API request performance
  // - Concurrent request handling
  // - Cache effectiveness
  // - Memory usage patterns
  // - Response time variance
})
```

**Blocking Factors:**
- ❌ Performance monitoring setup incomplete
- ❌ Benchmark thresholds not validated
- ❌ Performance data collection infrastructure needed

**MSW Handlers Needed:**
- `handlers/api.ts` - Mock all API routes tested
- `handlers/redis.ts` - Mock Redis for cache testing

**Re-enablement Checklist:**
- [ ] Set up performance monitoring/metrics collection
- [ ] Establish realistic performance baselines
- [ ] Create helpers for timing assertions
- [ ] Implement cache effectiveness metrics
- [ ] Test with actual data volumes
- [ ] Document performance expectations
- [ ] Create performance dashboard/reporting

**Estimated Effort:** 3-4 hours (includes infrastructure setup)

---

## Phase 2: Re-enablement Strategy

### Implementation Order (by priority)

1. **Week 1: MSW Handler Setup**
   - [ ] Create `tests/mocks/` directory structure
   - [ ] Implement `handlers/api.ts` (all API routes)
   - [ ] Implement `handlers/redis.ts` (Redis operations)
   - [ ] Implement `handlers/github-graphql.ts` (GitHub API)
   - [ ] Set up MSW server in `vitest.setup.ts`
   - **Effort:** 8-12 hours

2. **Week 1-2: API Integration Tests (92 tests)**
   - [ ] Start with Views API (simplest, 20 tests)
   - [ ] Then Analytics API (30 tests, depends on Redis mocks)
   - [ ] Then GitHub Contributions (31 tests, GraphQL complex)
   - **Effort:** 5-8 hours

3. **Week 2: Page & Error Tests (38 tests)**
   - [ ] Feeds Page tests (34 tests)
   - [ ] Error Scenarios (4 tests)
   - **Effort:** 2-2.5 hours

4. **Week 2-3: Infrastructure Tests (24 tests)**
   - [ ] Reports Safety (1 test, script investigation)
   - [ ] Performance Benchmarks (19 tests, needs infrastructure)
   - [ ] Other validation tests (4 tests)
   - **Effort:** 4-5 hours

### Expected Outcomes

| Metric | Current | Phase 2 Goal | Phase 3 Target |
|--------|---------|-------------|-----------------|
| Skip Rate | 5.6% (154) | <1% (10-20) | <0.5% (5-10) |
| Test Count | 2,760 | 2,750+ enabled | 2,800+ with new tests |
| Test Execution Time | 55s | 35-40s | 20-25s |
| Coverage | 15% | 25-30% | 50%+ |

### Dependencies

**External Dependencies:**
- ✅ `msw@^2.12.7` - Already in devDeps
- ✅ `vitest` - Already configured
- ❌ Performance monitoring library (TBD)
- ❌ Redis test utilities (may need to add)

**Internal Dependencies:**
- ✅ `.github/workflows/test.yml` - Updated in Phase 1
- ✅ `vitest.config.ts` - Coverage baselines set
- ✅ Test setup file - Ready for MSW server

---

## Adding Comments to Skipped Tests

Each skipped test should have an inline comment explaining:
1. **Why it's skipped** - Link to TODO reason
2. **What blocks re-enablement** - Specific requirements
3. **Re-enablement date/target** - When/who will fix

### Comment Template

```typescript
describe.skip('[Reason Category]', () => {
  /**
   * @skip [Category]
   * @reason API refactored - mocks need updating
   * @requires MSW handlers for /api/analytics
   * @target Phase 2, Week 1
   * @link docs/testing/SKIPPED_TESTS_DOCUMENTATION.md
   * 
   * Tests to re-enable:
   * - GET /api/analytics endpoint validation
   * - Redis cache behavior
   * - Rate limiting
   */
```

---

## Maintenance & Tracking

### How to Update This Document

When updating skipped tests:
1. Update the appropriate section
2. Change "Skip Count" if tests are re-enabled
3. Update "Total Skipped" statistics at top
4. Update "Phase 2 Goal" if conditions change
5. Commit with message: `docs: update SKIPPED_TESTS_DOCUMENTATION.md`

### Monthly Review Checklist

- [ ] Verify skip reasons are still accurate
- [ ] Check if any tests have been re-enabled
- [ ] Review performance benchmark infrastructure progress
- [ ] Update re-enablement estimates based on actual progress

---

## Quick Reference: All Skipped Tests

### By File
- `api-analytics.test.ts` (30) - API refactoring
- `api-github-contributions.test.ts` (31) - API refactoring
- `api-views.test.ts` (20) - API refactoring
- `feeds.test.tsx` (34) - Page refactoring
- `error-scenarios.test.ts` (4) - Error handling refactoring
- `performance-benchmarks.test.ts` (19) - Infrastructure incomplete
- `reports-safety.test.ts` (1) - Script investigation needed

### By Category
- **API Integration Tests (92)** - Need MSW handlers + mock updates
- **Page Tests (34)** - Need assertion updates
- **Error Tests (4)** - Need implementation review
- **Performance Tests (19)** - Need infrastructure setup
- **Validation Tests (1)** - Need script investigation

### By Implementation Difficulty
- **Easy (38):** Page tests, Error tests
- **Medium (92):** API tests
- **Hard (19):** Performance tests
- **Investigation (1):** Script validation

---

## Related Documentation

- [`docs/testing/automated-testing-guide.md`](./automated-testing-guide.md) - Test execution
- [`docs/automation/QA-AUDIT-IMPLEMENTATION-REPORT.md`](../automation/QA-AUDIT-IMPLEMENTATION-REPORT.md) - Phase planning
- [`.github/agents/TESTING_PATTERNS.md`](../.github/agents/patterns/TESTING_PATTERNS.md) - Testing patterns
- `vitest.config.ts` - Coverage configuration

---

**Status:** Ready for Phase 2 Implementation  
**Maintained By:** DCYFR Development Team  
**Next Review:** After Phase 2 Week 1 completion
