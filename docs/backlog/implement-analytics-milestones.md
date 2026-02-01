# Implement Analytics Milestones Collection

**Status:** Backlog
**Priority:** P3 (Nice to Have)
**Effort:** Medium (8-16 hours)
**Created:** February 1, 2026

---

## Problem

Analytics milestone keys (`analytics:milestones` and `github:traffic:milestones`) are marked as "optional future features" in the production metrics sync system. The infrastructure exists, but automatic collection is not yet implemented.

**Current State:**

- ✅ API integrations exist and work
- ✅ Transformers implemented in `src/lib/activity/sources.server.ts`
- ✅ Test data generation works for development
- ❌ NOT scheduled/automated in production
- ❌ Only populated by test data scripts, not real production metrics

**Related Documentation:**

- [`docs/operations/private/analytics-keys-missing-analysis-2026-02-01.md`](../operations/private/analytics-keys-missing-analysis-2026-02-01.md)
- [`docs/operations/private/google-analytics-cleanup-2026-02-01.md`](../operations/private/google-analytics-cleanup-2026-02-01.md)

---

## Proposed Solution

Implement automated collection jobs for both analytics sources:

### 1. GitHub Traffic Milestones (`github:traffic:milestones`)

**Implementation exists:** `src/lib/analytics-integration.ts:257` - `storeGitHubTrafficMilestones()`

**What's needed:**

1. Create Inngest scheduled job (daily or weekly)
2. Call `storeGitHubTrafficMilestones()` from production
3. Move from "optional" to "critical" in sync patterns

**Benefits:**

- Track repository growth automatically
- Show stars/forks/views milestones in activity feed
- Real production data instead of test data

**Complexity:** Low (API already integrated)

---

### 2. Vercel Analytics Milestones (`analytics:milestones`)

**Implementation exists:** `src/lib/analytics-integration.ts:146` - `storeVercelAnalyticsMilestones()`

**What's needed:**

1. Set up Vercel Analytics API access
2. Create Inngest scheduled job (daily or weekly)
3. Call `storeVercelAnalyticsMilestones()` from production
4. Move from "optional" to "critical" in sync patterns

**Benefits:**

- Track site traffic growth automatically
- Show visitor/pageview milestones in activity feed
- Real production analytics data

**Complexity:** Medium (requires Vercel Analytics API setup)

---

## Implementation Plan

### Phase 1: GitHub Traffic (Easier First)

**Estimated effort:** 4-6 hours

1. **Create Inngest job** (`src/inngest/github-traffic-collection.ts`)

   ```typescript
   import { inngest } from './client';
   import { storeGitHubTrafficMilestones } from '@/lib/analytics-integration';

   export const githubTrafficCollection = inngest.createFunction(
     { id: 'github-traffic-collection' },
     { cron: '0 2 * * *' }, // Daily at 2 AM
     async ({ step }) => {
       await step.run('collect-github-traffic', async () => {
         await storeGitHubTrafficMilestones();
       });
     }
   );
   ```

2. **Update sync patterns** (`scripts/sync-production-metrics.mjs`)
   - Move `github:traffic:milestones` from `optional` to `critical`

3. **Test in production**
   - Verify job runs daily
   - Check Redis key is populated
   - Verify activity feed displays milestones

4. **Update documentation**
   - Mark as "active" in `PRODUCTION_METRICS_SYNC.md`
   - Update `ANALYTICS_INTEGRATION.md`

---

### Phase 2: Vercel Analytics (More Setup Required)

**Estimated effort:** 8-12 hours

1. **Set up Vercel Analytics API**
   - Create API token in Vercel dashboard
   - Add `VERCEL_ANALYTICS_TOKEN` to environment variables
   - Test API access with existing `fetchVercelAnalyticsMilestones()`

2. **Create Inngest job** (`src/inngest/vercel-analytics-collection.ts`)

   ```typescript
   import { inngest } from './client';
   import { storeVercelAnalyticsMilestones } from '@/lib/analytics-integration';

   export const vercelAnalyticsCollection = inngest.createFunction(
     { id: 'vercel-analytics-collection' },
     { cron: '0 3 * * *' }, // Daily at 3 AM
     async ({ step }) => {
       await step.run('collect-vercel-analytics', async () => {
         await storeVercelAnalyticsMilestones();
       });
     }
   );
   ```

3. **Update sync patterns** (`scripts/sync-production-metrics.mjs`)
   - Move `analytics:milestones` from `optional` to `critical`

4. **Test in production**
   - Verify job runs daily
   - Check Redis key is populated
   - Verify activity feed displays milestones

5. **Update documentation**
   - Mark as "active" in `PRODUCTION_METRICS_SYNC.md`
   - Update `ANALYTICS_INTEGRATION.md`

---

## Alternative: Remove Entirely

**If we decide NOT to implement:**

1. Remove `analytics:milestones` and `github:traffic:milestones` from sync patterns entirely
2. Remove `transformVercelAnalytics()` and `transformGitHubTraffic()` from `sources.server.ts`
3. Keep implementations in `analytics-integration.ts` as placeholders (documented)
4. Remove from test data generation
5. Update documentation to mark as "removed"

**Pros:** Clean codebase, no misleading references
**Cons:** Lose potential value from tracking analytics milestones

---

## Success Criteria

**When this task is complete:**

- ✅ GitHub traffic collection runs daily in production
- ✅ Vercel Analytics collection runs daily in production (OR decision to skip)
- ✅ Both keys exist in production Redis with real data
- ✅ Sync script shows both as "synced" (not "not found")
- ✅ Activity feed displays real analytics milestones
- ✅ Documentation updated to reflect "active" status
- ✅ Tests updated to reflect production behavior

**Expected sync output:**

```
📊 Syncing critical analytics keys...
   ✓ blog:trending → preview:blog:trending
   ✓ analytics:milestones → preview:analytics:milestones
   ✓ github:traffic:milestones → preview:github:traffic:milestones
```

---

## Resources

**Existing code to leverage:**

- `src/lib/analytics-integration.ts:146` - `fetchVercelAnalyticsMilestones()`
- `src/lib/analytics-integration.ts:257` - `fetchGitHubTrafficMilestones()`
- `src/lib/activity/sources.server.ts:810` - `transformVercelAnalytics()`
- `src/lib/activity/sources.server.ts:883` - `transformGitHubTraffic()`

**Test data for reference:**

- `scripts/populate-analytics-milestones.mjs` - Shows expected data structure

**Documentation:**

- `docs/features/ANALYTICS_INTEGRATION.md` - Integration guide
- `docs/operations/PRODUCTION_METRICS_SYNC.md` - Sync system docs

---

## Notes

- **Security:** GitHub traffic requires `GITHUB_TOKEN` with `repo` scope
- **Rate limits:** GitHub API has rate limits (5000/hour for authenticated)
- **Costs:** Vercel Analytics API may have usage limits/costs
- **Scheduling:** Daily collection is probably sufficient (not real-time needs)

---

## Decision Required

**Before implementing, decide:**

1. ✅ Implement GitHub traffic? (Easy, already have access)
2. ❓ Implement Vercel Analytics? (Medium effort, API setup required)
3. ❓ Keep optional or remove entirely if not implementing?

**Recommendation:** Implement GitHub traffic first (low effort, high value). Decide on Vercel Analytics after seeing GitHub integration work.
