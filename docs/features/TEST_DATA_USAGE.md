{/* TLP:CLEAR */}

# Test Data Usage Guide

**Status:** Production Safeguards Implemented (DEV ONLY)

This document describes all test/demo data sources in dcyfr-labs and how they're protected for development-only use.

---

## Overview

The application includes three sources of test/demo data that are intended **for development and testing only**:

| Source | Purpose | Protection | Risk |
|--------|---------|-----------|------|
| **Analytics Milestones** | Test activity feed | Environment check | ⚠️ HIGH |
| **GitHub Contributions** | Fallback display | Environment check + warning | ⚠️ MEDIUM |
| **Trending Posts** | Fallback logic | Real data fallback | ✅ SAFE |

---

## 1. Analytics Milestones (Test Data)

### Location
- **Script:** `scripts/populate-analytics-milestones.mjs`
- **Redis Keys:** 
  - `analytics:milestones` (3 test items)
  - `github:traffic:milestones` (3 test items)
  - `google:analytics:milestones` (3 test items)
  - `search:console:milestones` (4 test items)

### What It Is
Sample milestone data for testing the activity feed transformations. **NOT** real metrics.

### Sample Values (Actual Data Comparison)
| Metric | Sample | Actual | Accuracy |
|--------|--------|--------|----------|
| GitHub Stars | 15 | 1 | ❌ Fabricated |
| GitHub Forks | (not in sample) | 0 | ❌ Fabricated |
| GitHub Views | 1150 | Not available | ❌ Fabricated |
| GitHub Clones | 67 | Not available | ❌ Fabricated |
| GA Users | 2150 | Unknown | ❌ Fabricated |
| Search Console | 5420 impressions | Unknown | ❌ Fabricated |

### Production Protection

```javascript
// PRODUCTION CHECK: Prevent running in production
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production' || process.env.VERCEL_ENV === 'production';

if (isProduction) {
  console.error('❌ BLOCKED: This script is for development/testing only!');
  process.exit(1);
}
```

**What happens if run in production:**
- Script exits with error code 1
- Refuses to populate sample data
- Clearly logs the environment it detected

### How to Use (DEV ONLY)

```bash
# Local development
npm run analytics:populate

# This will:
# ✅ Check NODE_ENV (defaults to 'development')
# ✅ Populate 13 test milestone items in Redis
# ✅ Show success message with test data notice
```

### Clearing Test Data

```bash
# Clear all test data from Redis (safe - only removes sample data keys)
npm run analytics:clear

# Or with explicit REDIS_URL:
REDIS_URL="..." npm run analytics:clear
```

**What it removes:**
```
✅ analytics:milestones (Vercel Analytics test data)
✅ github:traffic:milestones (GitHub test data)
✅ google:analytics:milestones (Google Analytics test data)
✅ search:console:milestones (Search Console test data)
```

**What it preserves:**
- All other Redis keys (comments, views, trending posts, etc.)
- Only removes the 4 test milestone keys
- Safe to run in production

**Verification:**
```bash
# Check if test data is cleared
REDIS_URL="..." node -e "
import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();
const keys = await redis.keys('*:milestones');
console.log('Remaining milestone keys:', keys.length);
await redis.quit();
"
# Should return: 0
```

---

## 2. GitHub Contributions Fallback (Demo Data)

### Location
- **File:** `src/lib/github-data.ts`
- **Function:** `generateFallbackData()` (lines 82-127)

### What It Is
Dynamically generated contribution data shown when Redis is unavailable. Used for UI testing and demo purposes.

### Generated Values
- **Total Contributions:** Random (~1,500-3,000)
- **Total Repositories:** 42 (hardcoded)
- **Pattern:** 80% weekdays, 30% weekends
- **Duration:** Past 365 days
- **Warning:** "Using demo data - GitHub API temporarily unavailable"

### When It's Used
```typescript
// If Redis unavailable
if (!redis) {
  console.warn("[GitHub Data] Redis not available, using fallback data");
  return generateFallbackData();
}

// If Redis read fails
if (redisError) {
  console.error("[GitHub Data] Cache access failed:", error);
  return generateFallbackData();
}
```

### Production Protection

```typescript
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production' || process.env.VERCEL_ENV === 'production';

if (isProduction) {
  console.error('[GitHub Data] ❌ CRITICAL: Fallback data in production!');
  console.error('[GitHub Data]    This means Redis is unavailable in production.');
  console.error('[GitHub Data]    Showing fake contribution data is NOT acceptable.');
}
```

**Warning Message:**
- DEV: "Using demo data - GitHub API temporarily unavailable (DEV MODE)"
- PROD: "❌ CRITICAL: Showing demo data in production (Redis unavailable)"

### What To Do If Triggered in Production
1. ⚠️ Check Redis connection immediately
2. Verify `REDIS_URL` is set and accessible
3. Check Redis service health
4. Restore connection - app is showing fake data
5. Monitor logs for other services also affected

---

## 3. Trending Posts Fallback (Real Data)

### Location
- **File:** `src/lib/activity/sources.server.ts`
- **Function:** `transformTrendingPosts()` (lines 194-345)

### What It Is
Falls back to most recent published blog posts when Redis is unavailable. **Uses real data.**

### Protection
✅ **No test data** - Falls back to actual published posts from `data/posts.ts`

### When It's Used
```typescript
// If Redis unavailable
const trending = await fetchTrendingPostsFromRedis(); // null/empty

// Fallback
const fallback = posts.slice(0, 5).map(post => ({
  // ...
  source: "fallback",
  // Uses actual post data
}));
```

**Status:** ✅ SAFE - No fabricated data

---

## Environment Variables

### NODE_ENV
Controls development vs. production mode:
```bash
# Development (default)
NODE_ENV=development  # or unset

# Production
NODE_ENV=production   # Blocks sample data scripts
```

### VERCEL_ENV
Vercel-specific environment flag:
```bash
VERCEL_ENV=production  # Blocks sample data scripts
```

### REDIS_URL
Connection to Redis instance:
```bash
REDIS_URL=redis://localhost:6379              # Local
REDIS_URL=redis://<host>:<port>               # Remote
REDIS_URL=rediss://:<password>@<host>:<port>  # Cloud (SSL)
```

---

## Testing Checklist

### ✅ Development
- [ ] `NODE_ENV` is unset or `development`
- [ ] `npm run analytics:populate` succeeds
- [ ] Test data appears in activity feed
- [ ] Redis connections work

### ✅ Staging
- [ ] `NODE_ENV=staging` (if using)
- [ ] Sample data population only in non-prod
- [ ] Test data clearly labeled
- [ ] Redis backup before populating

### ✅ Production
- [ ] `NODE_ENV=production` is set
- [ ] `npm run analytics:populate` **FAILS** with error
- [ ] Script refuses to run
- [ ] No test data in Redis
- [ ] Real data from monitoring scripts only

---

## CI/CD Integration

### Pre-deployment Checks
```bash
# 1. Verify no test data in production Redis
redis-cli keys '*:milestones' | wc -l
# Should return: 0 (no milestone keys)

# 2. Verify environment is production
echo $NODE_ENV
# Should return: production

# 3. Check environment detection works
node -e "console.log(process.env.NODE_ENV || 'development')"
# Should return: production
```

### Deployment Safety
```yaml
# Example CI/CD check (prevent test data in prod)
- name: Clear test data from production
  if: github.ref == 'refs/heads/main'
  env:
    REDIS_URL: ${{ secrets.PRODUCTION_REDIS_URL }}
  run: npm run analytics:clear

- name: Verify no test data in production
  if: github.ref == 'refs/heads/main'
  env:
    REDIS_URL: ${{ secrets.PRODUCTION_REDIS_URL }}
  run: |
    COUNT=$(node -e "
      import { createClient } from 'redis';
      const r = createClient({ url: process.env.REDIS_URL });
      await r.connect();
      const keys = await r.keys('*:milestones');
      await r.quit();
      console.log(keys.length);
    ")
    if [ "$COUNT" -gt 0 ]; then
      echo "❌ ERROR: Found $COUNT test data keys in production!"
      exit 1
    fi
    echo "✅ Verified: No test data in production"
```

---

## Real Data Implementation

To replace test data with real metrics:

### Vercel Analytics
```typescript
// Fetch real analytics from Vercel API
const analytics = await fetch('https://api.vercel.com/v9/analytics', {
  headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
});
const data = await analytics.json();
await redis.set('analytics:milestones', JSON.stringify(data));
```

### GitHub Traffic (Admin API)
```typescript
// Requires repository admin access
const traffic = await fetch(
  'https://api.github.com/repos/dcyfr/dcyfr-labs/traffic/views',
  { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
);
```

### Google Analytics
```typescript
// Use official Analytics Data API
const report = await analyticsDataClient.runReport({
  property: `properties/${GA_PROPERTY_ID}`,
  dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
  metrics: [{ name: 'activeUsers' }]
});
```

### Search Console
```typescript
// Use official Search Console API
const data = await searchconsole.searchanalytics.query({
  siteUrl: 'https://dcyfrlabs.com',
  requestBody: {
    startDate: startDate,
    endDate: endDate,
    dimensions: ['query', 'page'],
    type: 'web'
  }
});
```

---

## FAQ

**Q: Can I run `npm run analytics:populate` in production?**
A: No. The script checks `NODE_ENV` and `VERCEL_ENV` and blocks execution in production with error code 1.

**Q: What if Redis fails in production?**
A: 
- GitHub contributions will show demo data with ❌ CRITICAL warning
- Activity milestones won't load (returns empty, no warning)
- Trending posts fallback to recent blog posts (real data)

**Q: How do I know if test data is being used?**
A: Check logs for:
- `[GitHub Data] ❌ CRITICAL: Fallback data in production` = Bad
- `[GitHub Data] Using demo data (DEV MODE)` = OK
- `[Activity] No X milestones found in Redis` = Expected (empty)

**Q: Can I use test data in staging?**
A: Yes, but:
1. Set `NODE_ENV=staging` (or exclude from production check)
2. Clearly mark in UI that data is test data
3. Don't confuse with production metrics
4. Document in staging environment

**Q: When will real data be available?**
A: Implement monitoring scripts that fetch from official APIs and populate Redis on schedule. See "Real Data Implementation" section above.

---

## Related Documentation

- [Analytics Integration](./ANALYTICS_INTEGRATION.md)
- [Activity Feed](../architecture/activity-system.md)
- [Redis Configuration](../platform/environment-variables.md#redis)
- [Deployment Guide](../operations/deployment-guide.md)

---

**Last Updated:** December 25, 2025
**Status:** ✅ Production Safeguards Implemented
