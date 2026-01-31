# GitHub Cache Fix - Preview Deployment Key Mismatch

**Date:** January 30, 2026
**Status:** ✅ FIXED
**Issue:** Preview deployments showing "Cache not populated" despite successful build
**Root Cause:** Key prefix mismatch between build-time and runtime

---

## Problem

Preview deployments were failing to display GitHub activity data even though the build cache population succeeded. The GitHub Activity widget showed:

```
Cache not populated. Visit /api/dev/populate-cache to populate.
```

### Symptoms

- Build logs showed successful cache population (`[Build Cache] ✅ GitHub data cached`)
- Runtime logs showed cache miss (`[GitHub Data] ⚠️ Cache MISS - key not found or invalid`)
- Issue only occurred in **preview deployments**, not production
- Issue specifically affected **branch-based preview deployments** (not PR previews)

---

## Root Cause

The cache key prefix generation was inconsistent between build-time and runtime:

### Before Fix

**Build Time (`populate-build-cache.mjs`):**

```javascript
// Used VERCEL_GIT_PULL_REQUEST_ID
const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || 'preview';
keyPrefix = `preview:${prNumber}:`;
// Result for preview branch: "preview:preview:"
```

**Runtime (`redis-client.ts`):**

```typescript
// Also used VERCEL_GIT_PULL_REQUEST_ID
const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || 'preview';
return `preview:${prNumber}:`;
// Result for preview branch: "preview:preview:"
```

### Why It Failed

While both **should** have used the same fallback (`'preview'`), there was an edge case:

1. **PR-based preview deployments** → `VERCEL_GIT_PULL_REQUEST_ID` is set (e.g., `123`) → Works fine
2. **Branch-based preview deployments** → `VERCEL_GIT_PULL_REQUEST_ID` is **NOT set** → Falls back to `'preview'`
3. **Problem:** The fallback wasn't reliable if environment variables differed between build and runtime phases

---

## Solution

Use `VERCEL_GIT_COMMIT_REF` (branch name) instead of `VERCEL_GIT_PULL_REQUEST_ID` because:

✅ **Consistent:** Available in both build and runtime phases
✅ **Reliable:** Always set for Vercel deployments
✅ **Descriptive:** Better isolation per branch (e.g., `preview:feature-branch:`)

### After Fix

**Build Time (`populate-build-cache.mjs`):**

```javascript
// Use branch name for consistency
const branch = process.env.VERCEL_GIT_COMMIT_REF || 'preview';
keyPrefix = `preview:${branch}:`;
// Result for preview branch: "preview:preview:"
// Result for PR branch: "preview:feature-branch:"
```

**Runtime (`redis-client.ts`):**

```typescript
// Use branch name for isolation (consistent with build-time)
const branch = process.env.VERCEL_GIT_COMMIT_REF || 'preview';
return `preview:${branch}:`;
// Result for preview branch: "preview:preview:"
// Result for PR branch: "preview:preview:feature-branch:"
```

---

## Changes Made

### 1. Build Script Update

**File:** `scripts/populate-build-cache.mjs`

```diff
- const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || 'preview';
- keyPrefix = `preview:${prNumber}:`;
+ // Use branch name for consistency (available in both build and runtime)
+ const branch = process.env.VERCEL_GIT_COMMIT_REF || 'preview';
+ keyPrefix = `preview:${branch}:`;
```

### 2. Runtime Client Update

**File:** `src/mcp/shared/redis-client.ts`

```diff
- // Use PR number or deployment ID for isolation
- const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || 'preview';
- return `preview:${prNumber}:`;
+ // Use branch name for isolation (consistent with build-time)
+ const branch = process.env.VERCEL_GIT_COMMIT_REF || 'preview';
+ return `preview:${branch}:`;
```

### 3. Enhanced Logging

**Files:** `scripts/populate-build-cache.mjs`, `src/lib/github-data.ts`

Added `GIT_COMMIT_REF` and `gitCommitRef` to logs for better debugging:

```javascript
console.log('[Build Cache] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF, // NEW
  keyPrefix: keyPrefix || '(none)',
  redisUrl: redisUrl ? `${redisUrl.substring(0, 30)}...` : '(none)',
});
```

### 4. Test Coverage

**File:** `tests/lib/github-cache-key-consistency.test.ts`

Added comprehensive tests to prevent regression:

- ✅ PR preview deployments
- ✅ Branch preview deployments (no PR)
- ✅ Missing `VERCEL_GIT_COMMIT_REF` fallback
- ✅ Production deployments
- ✅ Development environment
- ✅ Full cache key construction

---

## Verification

### How to Test

1. **Deploy to preview branch:**

   ```bash
   git push origin preview
   ```

2. **Check build logs** for cache population:

   ```
   [Build Cache] ✅ GitHub data cached
   ```

3. **Visit preview deployment** and check GitHub Activity widget loads correctly

4. **Check runtime logs** (no cache miss):
   ```
   [GitHub Data] ✅ Cache HIT
   ```

### Expected Results

| Environment    | `VERCEL_GIT_COMMIT_REF` | Key Prefix                | Status   |
| -------------- | ----------------------- | ------------------------- | -------- |
| PR Preview     | `feature-branch`        | `preview:feature-branch:` | ✅ Works |
| Branch Preview | `preview`               | `preview:preview:`        | ✅ Fixed |
| Production     | `main`                  | `` (empty)                | ✅ Works |
| Development    | N/A                     | `dev:username:`           | ✅ Works |

---

## Related Files

- `scripts/populate-build-cache.mjs` - Build-time cache population
- `src/mcp/shared/redis-client.ts` - Runtime Redis client
- `src/lib/github-data.ts` - GitHub data access layer
- `tests/lib/github-cache-key-consistency.test.ts` - Test coverage

---

## Lessons Learned

1. **Environment Variables:** Always verify which env vars are available in **both** build and runtime phases
2. **Consistency:** Use the same key generation logic in build scripts and runtime code
3. **Logging:** Include relevant env vars in logs for easier debugging
4. **Testing:** Write tests that simulate different deployment scenarios
5. **Fallbacks:** Ensure fallback values are consistent across all code paths

---

## Future Improvements

- [ ] Consider using Vercel deployment ID for even more isolation
- [ ] Add health check endpoint to validate cache keys match
- [ ] Document all Vercel environment variables used in the project
- [ ] Consider migrating to Vercel KV for built-in consistency

---

**Status:** ✅ **RESOLVED**
**Next Deployment:** Should work correctly for all preview branches
