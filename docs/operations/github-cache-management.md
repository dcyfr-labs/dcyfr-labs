# GitHub Cache Management

Quick reference for managing the GitHub contribution data cache in dcyfr-labs.

## Overview

The GitHub contribution heatmap widget relies on cached data from the GitHub GraphQL API. This data is:
- Fetched by Inngest background jobs
- Stored in Redis with environment-specific prefixes
- Cached for 1 hour before automatic refresh

## Available Commands

### `npm run github:refresh`

**Purpose:** Manually trigger a fresh fetch from GitHub API and update the cache.

**Usage:**
```bash
npm run github:refresh
```

**When to use:**
- First time setting up development environment
- Cache warnings appear (`⚠️ Cache MISS`)
- Want to see latest GitHub contributions immediately
- Testing after GitHub profile changes

**Output example:**
```json
{
  "success": true,
  "message": "GitHub data refresh triggered",
  "note": "Check Inngest dashboard or logs for progress"
}
```

**Requirements:**
- Development server must be running (`npm run dev`)
- Only works in `NODE_ENV=development`
- Requires Inngest to be properly configured

---

### `npm run github:status`

**Purpose:** Diagnose GitHub cache health and troubleshoot issues.

**Usage:**
```bash
npm run github:status
```

**When to use:**
- Troubleshooting cache warnings
- Verifying cache was populated after refresh
- Checking Redis connection status
- Understanding environment prefix configuration

**Output includes:**
- ✅ Environment information (development/preview/production)
- ✅ Redis key prefix (`dev:drew:`, `preview:123:`, or none)
- ✅ Redis connection status
- ✅ Cache key existence and data validity
- ✅ Recommendations for fixing issues

**Example output:**
```
🔍 GitHub Cache Diagnostics

📍 Environment Information:
   Environment: development
   Key Prefix: dev:drew:

🔑 Redis Configuration:
   Production credentials: ✅
   Preview credentials: ✅
   Using: Preview Redis

📡 Connecting to Redis...
   ✅ Connected successfully

🔎 Checking Cache Keys:
   Key: dev:drew:github:contributions:dcyfr
   Status: ✅ EXISTS
   Total Contributions: 1,234
   Last Updated: 2026-01-31T01:00:00.000Z
   Source: github-api

✅ Cache is healthy!
```

---

### `npm run github:clear-cache-warnings`

**Purpose:** Clear stale warning fields from cached GitHub data.

**Usage:**
```bash
npm run github:clear-cache-warnings
```

**When to use:**
- After fixing cache issues but warnings persist
- Cleaning up after transitioning from fallback to real data
- Removing demo data warnings from production cache

**Note:** This is different from `github:refresh` - it only cleans up warning metadata, doesn't fetch fresh data.

---

## Common Scenarios

### Scenario 1: First Development Setup

**Problem:** Seeing "Cache MISS" warnings on first run.

**Solution:**
```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, refresh cache
npm run github:refresh

# 3. Verify cache is populated
npm run github:status

# Expected: "✅ Cache is healthy!"
```

---

### Scenario 2: Cache Expired

**Problem:** Warnings appear after 1+ hours of development.

**Solution:**
```bash
# Quick refresh
npm run github:refresh

# Cache will auto-refresh hourly via Inngest cron
```

---

### Scenario 3: Inngest Not Running

**Problem:** `github:refresh` triggers but cache stays empty.

**Solution:**
```bash
# 1. Check Inngest dashboard for errors
# 2. Verify environment variables match
npm run github:status

# 3. Check Inngest logs
# Look for "refresh-github-data" function execution
```

---

### Scenario 4: Production Issues

**Problem:** Production shows demo data or cache warnings.

**Solution:**
```bash
# Production uses different Redis instance
# Check Vercel environment variables:
# - UPSTASH_REDIS_REST_URL (production)
# - UPSTASH_REDIS_REST_TOKEN (production)

# Trigger production refresh via webhook
# (requires CRON_SECRET)
curl -X POST https://www.dcyfr.dev/api/github/refresh \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Understanding Environment Prefixes

### Development
- **Prefix:** `dev:{username}:`
- **Example:** `dev:drew:github:contributions:dcyfr`
- **Redis:** Preview database (or fallback to production)

### Preview (Vercel)
- **Prefix:** `preview:{pr-number}:`
- **Example:** `preview:123:github:contributions:dcyfr`
- **Redis:** Preview database

### Production
- **Prefix:** None (empty string)
- **Example:** `github:contributions:dcyfr`
- **Redis:** Production database

**Why prefixes?**
- Prevents development data from polluting production
- Allows multiple developers to work independently
- Enables preview deployments to have isolated cache

---

## Troubleshooting Guide

### Issue: "Cache MISS - key not found"

**Diagnosis:**
```bash
npm run github:status
```

**Common causes:**
1. **Inngest hasn't run yet** → Run `npm run github:refresh`
2. **Wrong environment** → Check `VERCEL_ENV` variable
3. **Cache expired** → Auto-refreshes hourly
4. **Redis connection issue** → Check credentials

---

### Issue: "All cache attempts failed, using fallback data"

**What this means:**
- Main cache key is empty
- Fallback cache key is empty
- App uses demo data with warnings

**Fix:**
```bash
# 1. Verify Redis connection
npm run redis:health

# 2. Refresh cache
npm run github:refresh

# 3. Verify success
npm run github:status
```

---

### Issue: "Using cached data - GitHub API temporarily unavailable"

**What this means:**
- Main cache failed to refresh
- Fallback cache is being used
- Data may be stale

**Fix:**
```bash
# Wait for next hourly refresh
# Or trigger manual refresh
npm run github:refresh
```

---

## Technical Details

### Cache Keys

| Key | Purpose | TTL |
|-----|---------|-----|
| `github:contributions:dcyfr` | Main contribution data | 1 hour |
| `github:fallback-data` | Backup when API fails | 1 hour |

### Data Structure

```typescript
interface ContributionResponse {
  contributions: ContributionDay[];  // Array of {date, count}
  source: string;                   // 'github-api' or 'fallback-data'
  totalContributions: number;       // Total count
  totalRepositories?: number;       // Optional repo count
  lastUpdated: string;              // ISO timestamp
  warning?: string;                 // Only present in fallback mode
}
```

### Inngest Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `refresh-github-data` | Cron: `0 * * * *` (hourly) | Scheduled refresh |
| `manual-refresh-github-data` | Event: `github/data.refresh` | Manual trigger |

---

## Related Files

- **Cache Reader:** `src/lib/github-data.ts` - Server-side cache access
- **Inngest Functions:** `src/inngest/github-functions.ts` - Background jobs
- **Dev Refresh API:** `src/app/api/dev/refresh-github/route.ts` - Manual trigger endpoint
- **Diagnostic Script:** `scripts/diagnose-github-cache.mjs` - Health check tool

---

## See Also

- [Inngest Integration Guide](../features/inngest-integration.md)
- Redis Health Monitoring
- Environment Configuration
