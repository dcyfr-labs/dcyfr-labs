# Inngest Failing Runs - Quick Fix Guide

**Problem:** 30+ failed Inngest scheduled runs  
**Root Cause:** Redis connection timeouts  
**Fix Time:** 15 minutes  
**Difficulty:** Easy

---

## Quick Diagnosis

Your scheduled functions are failing because:

1. **Redis connection timeout is too aggressive (5 seconds)**
2. **Not enough retry attempts (max 3)**
3. **Error handling doesn't propagate failures properly**

---

## 3-Step Fix

### Step 1: Update Redis Connection Timeout (5 min)

**File:** `src/inngest/blog-functions.ts`

**Current Code (Lines 14-31):**
```typescript
async function getRedisClient(): Promise<RedisClient | null> {
  if (!redisUrl) return null;

  if (!globalThis.__blogAnalyticsRedisClient) {
    const client = createClient({ 
      url: redisUrl,
      socket: {
        connectTimeout: 5000,      // ← PROBLEM: 5 seconds is too tight
        reconnectStrategy: (retries) => {
          if (retries > 3) return new Error('Max retries exceeded');  // ← PROBLEM: Not enough retries
          return Math.min(retries * 100, 3000); // ← PROBLEM: Backoff too fast
        },
      },
    });
```

**Fixed Code:**
```typescript
async function getRedisClient(): Promise<RedisClient | null> {
  if (!redisUrl) return null;

  if (!globalThis.__blogAnalyticsRedisClient) {
    const client = createClient({ 
      url: redisUrl,
      socket: {
        connectTimeout: 10000,     // ✅ Increased to 10 seconds
        reconnectStrategy: (retries) => {
          if (retries > 5) return new Error('Max retries exceeded');  // ✅ Allow 5 retries
          return Math.min(retries * 200, 5000); // ✅ Slower backoff
        },
      },
    });
```

---

### Step 2: Fix Error Handling in `security-functions.ts` (5 min)

**File:** `src/inngest/security-functions.ts`

**Current Code (Lines 115-148):**
```typescript
for (const packageName of MONITORED_PACKAGES) {
  try {
    const response = await fetch(`https://api.github.com/.../${packageName}`);
    
    if (!response.ok) {
      console.warn(`GHSA API error for ${packageName}: ${response.status}`);
      // ← PROBLEM: Continues silently instead of failing
      continue;
    }
```

**Fixed Code:**
```typescript
for (const packageName of MONITORED_PACKAGES) {
  try {
    const response = await fetch(`https://api.github.com/.../${packageName}`);
    
    if (!response.ok) {
      console.error(`GHSA API error for ${packageName}: ${response.status}`);
      // ✅ Throw error to trigger retry
      throw new Error(`GHSA API returned ${response.status} for ${packageName}`);
    }
```

---

### Step 3: Reduce Retry Count for Scheduled Jobs (5 min)

**File:** `src/inngest/blog-functions.ts`

**Current Code (Line 196):**
```typescript
export const calculateTrending = inngest.createFunction(
  { 
    id: "calculate-trending",
    retries: 2,  // ← PROBLEM: Scheduled jobs shouldn't retry heavily
  },
```

**Fixed Code:**
```typescript
export const calculateTrending = inngest.createFunction(
  { 
    id: "calculate-trending",
    retries: 1,  // ✅ Fail fast on hourly jobs
  },
```

**Also update in `github-functions.ts` (Line 165):**

**Current Code:**
```typescript
export const refreshGitHubData = inngest.createFunction(
  { 
    id: "refresh-github-data",
    // ← No retry config = uses default 5 retries
  },
```

**Fixed Code:**
```typescript
export const refreshGitHubData = inngest.createFunction(
  { 
    id: "refresh-github-data",
    retries: 1,  // ✅ Explicit: fail fast on scheduled jobs
  },
```

---

## Test the Fix

### After making changes:

```bash
# 1. Restart dev server
npm run dev

# 2. Go to Inngest dashboard
# https://app.inngest.com/

# 3. Manually trigger calculate-trending
# Functions > calculate-trending > Send Event
# Verify it completes successfully

# 4. Check logs
# Should see: "Updated trending posts: X posts"
# Should NOT see: "Redis not configured"
```

---

## Verify in Production

Once deployed:

1. Wait for next scheduled run (hourly)
2. Check Inngest dashboard for `calculate-trending` 
3. Status should be ✅ instead of ❌
4. Trending posts should update hourly

---

## If Still Failing

**Check Redis Status:**
- Log into https://app.redislabs.com/
- Verify your Redis instance is up
- Check connection pool isn't exhausted
- Test connection: `redis-cli ping`

**Check Inngest Logs:**
- Go to Inngest Dashboard
- Runs > Failed
- Click on a failed run
- Look at "Steps" tab for detailed error
- Check "Logs" tab for console output

---

## Full Documentation

For more details, see:
- `docs/operations/INNGEST_FAILING_RUNS_INVESTIGATION.md` - Full investigation report
- `docs/operations/INNGEST_VALIDATION_REPORT.md` - Configuration validation

---

**Estimated Time to Fix:** 15 minutes  
**Estimated Time to Deploy:** 5 minutes  
**Estimated Time to Verify:** 10 minutes

**Total: 30 minutes**
