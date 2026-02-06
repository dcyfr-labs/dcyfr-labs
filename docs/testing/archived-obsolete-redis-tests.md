<!-- TLP:CLEAR -->
# Archived Obsolete Redis Tests

**Date:** January 25, 2026
**Reason:** Migration from legacy `redis@5.10.0` to `@upstash/redis`
**Status:** Tests archived - functionality no longer applicable

---

## Overview

During the migration from legacy Redis (TCP connection-based) to Upstash Redis (REST API-based), the following test categories became obsolete:

1. **Connection Management Tests** - Upstash uses stateless REST API (no connections)
2. **REDIS_URL Environment Variable Tests** - Singleton pattern uses centralized configuration
3. **Client Lifecycle Tests** - No `connect()`, `disconnect()`, `isOpen` with REST API

---

## Archived Test Categories

### Category 1: Connection Management Tests

**Location:** `src/__tests__/lib/views.test.ts` lines 261-283

**Reason:** Upstash Redis REST API is stateless - no connection management needed.

#### Test 1: "connects to Redis if not already open"

```typescript
it('connects to Redis if not already open', async () => {
  process.env.REDIS_URL = 'redis://localhost:6379';
  mockRedis.isOpen = false;
  mockRedis.get.mockResolvedValue('1');

  const { getPostViews } = await import('@/lib/views');
  await getPostViews('test-post-id');

  expect(mockRedis.connect).toHaveBeenCalled();
});
```

**Why Obsolete:**

- Upstash REST client has no `connect()` method
- No connection state to manage (`isOpen` property doesn't exist)
- REST API automatically handles requests without explicit connections

#### Test 2: "does not reconnect if already open"

```typescript
it('does not reconnect if already open', async () => {
  process.env.REDIS_URL = 'redis://localhost:6379';
  mockRedis.isOpen = true;
  mockRedis.get.mockResolvedValue('1');

  const { getPostViews } = await import('@/lib/views');
  await getPostViews('test-post-id');

  expect(mockRedis.connect).not.toHaveBeenCalled();
});
```

**Why Obsolete:**

- Same as above - no connection state in REST API
- Singleton pattern handles client reuse differently

#### Test 3: "reuses existing Redis client"

```typescript
it('reuses existing Redis client', async () => {
  process.env.REDIS_URL = 'redis://localhost:6379';
  mockRedis.get.mockResolvedValue('1');

  const { getPostViews } = await import('@/lib/views');

  await getPostViews('post-1');
  await getPostViews('post-2');

  // TODO: This test is obsolete with Upstash (no createClient)
  // const { createClient } = await import('redis')
  // expect(createClient).toHaveBeenCalledTimes(1)
});
```

**Why Obsolete:**

- Legacy test was checking `createClient()` call count
- Upstash singleton doesn't use `createClient()` - uses `Redis.fromEnv()`
- Already marked as obsolete in test file with TODO comment

---

### Category 2: REDIS_URL Environment Variable Tests

**Locations:**

- `src/__tests__/lib/views.test.ts` - Multiple tests (~18+ occurrences)
- `src/__tests__/lib/shares.test.ts` - Multiple tests (~10+ occurrences)

**Reason:** Singleton pattern in `redis-client.ts` centralizes URL management. Individual functions no longer check `process.env.REDIS_URL` directly.

#### Pattern Found in views.test.ts:

Lines with `process.env.REDIS_URL` checks:

- Line 50, 68, 89, 99, 115, 125, 136, 146, 156, 166, 176, 187, 197, 207, 226, 236, 248, 262

**Example Tests:**

```typescript
// Example 1: getPostViews
it('returns null when REDIS_URL is not set', async () => {
  delete process.env.REDIS_URL;

  const { getPostViews } = await import('@/lib/views');
  const result = await getPostViews('test-post-id');

  expect(result).toBeNull();
});

// Example 2: getPostViews24h
it('returns null when REDIS_URL is not set', async () => {
  delete process.env.REDIS_URL;

  const { getPostViews24h } = await import('@/lib/views');
  const result = await getPostViews24h('test-post-id');

  expect(result).toBeNull();
});
```

**Why Obsolete:**

- Functions no longer check `process.env.REDIS_URL` directly
- Redis client singleton handles URL initialization in `redis-client.ts`
- Singleton throws error if URL not set (handled at initialization, not per-call)
- Each function call doesn't need to validate environment variable

#### Pattern Found in shares.test.ts:

**Example Tests:**

```typescript
// incrementPostShares
it('returns null when REDIS_URL is not set', async () => {
  delete process.env.REDIS_URL;

  const { incrementPostShares } = await import('@/lib/shares');
  const result = await incrementPostShares('test-post-id');

  expect(result).toBeNull();
});

// getPostShares
it('returns null when REDIS_URL is not set', async () => {
  delete process.env.REDIS_URL;

  const { getPostShares } = await import('@/lib/shares');
  const result = await getPostShares('test-post-id');

  expect(result).toBeNull();
});

// getPostShares24h
it('returns null when REDIS_URL is not set', async () => {
  delete process.env.REDIS_URL;

  const { getPostShares24h } = await import('@/lib/shares');
  const result = await getPostShares24h('test-post-id');

  expect(result).toBeNull();
});
```

**Why Obsolete:**

- Same reasoning as views.test.ts
- Functions delegate to singleton, which handles URL validation

---

### Category 3: All Tests Setting process.env.REDIS_URL

**Pattern:**

```typescript
process.env.REDIS_URL = 'redis://localhost:6379';
```

**Why Obsolete:**

- Upstash singleton uses `Redis.fromEnv()` which reads from environment at initialization
- Setting REDIS_URL in individual tests doesn't affect singleton behavior
- Tests should mock the redis client directly, not environment variables

**Affected Test Files:**

- `src/__tests__/lib/views.test.ts` - ~18+ tests
- `src/__tests__/lib/shares.test.ts` - ~10+ tests

---

## Valid Tests to Preserve

The following test categories should be **KEPT** as they test actual business logic:

### ✅ Business Logic Tests

**Share Tracking:**

- `incrementPostShares`: "increments share count and returns new value"
- `incrementPostShares`: "records share in history with timestamp"
- `incrementPostShares`: "handles different post IDs"
- `getPostShares`: "returns share count for existing post"
- `getPostShares24h`: "returns share count for last 24 hours"
- `getPostShares24h`: "queries correct time range"

**View Tracking:**

- `incrementPostViews`: "increments view count and returns new value"
- `incrementPostViews`: "records view in history with timestamp"
- `incrementPostViews`: "cleans up old views beyond 90 days"
- `incrementPostViews`: "handles different post IDs"
- `getPostViews`: "returns view count for existing post"
- `getPostViews24h`: "returns view count for last 24 hours"

### ✅ Error Handling Tests

**Both files:**

- "returns null on Redis error" - Tests graceful degradation
- "handles zero [shares/views]" - Tests edge case handling
- "returns null for non-existent post" - Tests missing data scenario
- "returns null for invalid number values" - Tests data validation

---

## Migration Notes

### What Replaced the Obsolete Functionality

1. **Connection Management:**
   - Old: Manual `connect()`, `disconnect()`, `isOpen` checks in each function
   - New: Upstash REST API - stateless, no connection management needed

2. **REDIS_URL Validation:**
   - Old: Each function checked `process.env.REDIS_URL`
   - New: Singleton pattern validates URL at initialization in `redis-client.ts`
   - Centralized error handling if URL missing

3. **Client Reuse:**
   - Old: `createClient()` call tracking
   - New: Singleton pattern with `Redis.fromEnv()` - automatic reuse

---

## Recommendations

### For Test Maintenance

1. **Remove Obsolete Tests:**
   - All "returns null when REDIS_URL is not set" tests
   - All connection management tests (connect, reconnect, isOpen)
   - All tests setting `process.env.REDIS_URL`

2. **Update Valid Tests:**
   - Remove `process.env.REDIS_URL = 'redis://localhost:6379'` from setup
   - Keep business logic assertions (increment, get, time ranges)
   - Keep error handling tests (null returns, error scenarios)

3. **Fix Method Name Mismatches:**
   - Change `mockRedis.zAdd` → `mockRedis.zadd`
   - Change `mockRedis.zCount` → `mockRedis.zcount`
   - Change `mockRedis.zRemRangeByScore` → `mockRedis.zremrangebyscore`
   - Change `mockRedis.mGet` → `mockRedis.mget`

### Test Coverage Goals

After cleanup, tests should verify:

- ✅ Business logic (increment operations, get operations)
- ✅ Data validation (time ranges, counts, IDs)
- ✅ Error handling (Redis errors, missing data)
- ✅ Edge cases (zero values, invalid inputs)
- ❌ ~~Connection management~~ (not applicable)
- ❌ ~~Environment variable validation~~ (handled by singleton)

---

## Statistics

**Total Obsolete Tests Identified:**

- Connection management: 3 tests
- REDIS_URL validation: ~25+ tests across both files
- Tests setting REDIS_URL: ~28+ instances

**Test Files Affected:**

- `src/__tests__/lib/views.test.ts` (352 lines) - ~18+ obsolete tests
- `src/__tests__/lib/shares.test.ts` (274 lines) - ~10+ obsolete tests

**Valid Tests Preserved:**

- Business logic: ~20+ tests
- Error handling: ~8+ tests
- Edge cases: ~6+ tests

---

## References

- Migration Documentation: `docs/operations/private/redis-migration-complete-2026-01-25.md`
- Redis Client Implementation: `src/mcp/shared/redis-client.ts`
- Test Files:
  - `src/__tests__/lib/views.test.ts`
  - `src/__tests__/lib/shares.test.ts`

---

**Status:** ARCHIVED
**Next Steps:** Remove obsolete tests, update method names in valid tests, verify all remaining tests pass
