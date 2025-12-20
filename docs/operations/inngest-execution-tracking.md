# Inngest Execution Tracking Guide

**Quick Reference:** How to monitor and manage monthly Inngest executions to stay within the free tier (100K/month).

---

## Current Configuration (as of Dec 18, 2025)

### Scheduled Functions (Daily Executions)

| Function | Frequency | Executions/Day | Monthly Est. |
|----------|-----------|---|---|
| Activity Feed Cache | Every 1 hour | 24 | 720 |
| Security Advisories | 3x daily (0, 8, 16 UTC) | 3 | 90 |
| Session Monitoring | Every 4 hours | 6 | 180 |
| IP Reputation Check | Every 4 hours | 6 | 180 |
| GitHub Contributions | Every 1 hour | 24 | 720 |
| Blog Trending | Every 1 hour | 24 | 720 |
| Blog Daily Analytics | Daily (midnight UTC) | 1 | 30 |
| LinkedIn Token Refresh | Daily (9 AM UTC) | 1 | 30 |
| **TOTAL SCHEDULED** | | **89** | **~2,670** |

### Event-Driven Functions (Usage-Based)

| Function | Trigger | Estimated/Month |
|----------|---------|---|
| Track Post View | Blog post viewed | ~30,000 |
| Handle Milestone | Post reaches milestone | ~100-200 |
| Contact Form | Form submitted | ~500-1,000 |
| Manual GitHub Refresh | Manual trigger | ~100 |
| Google Indexing | URL submission | ~500 |
| LinkedIn Token Events | Token expiry/refresh | ~50 |
| Security Advisory Handler | Advisory detected | ~20 |
| **TOTAL EVENT-DRIVEN** | | **~31,000-32,000** |

### Estimated Monthly Total: ~35,000-37,000 executions

---

## Monitoring Checklist

### Daily
- [ ] Check [Inngest Dashboard](https://app.inngest.com) for failed functions
- [ ] Verify activity feed updates (look for cache hits)
- [ ] Monitor Redis connection health

### Weekly
- [ ] Review execution count trend
- [ ] Check if any new event-driven functions were added
- [ ] Verify no functions are stuck in retry loops

### Monthly
- [ ] Compare actual vs. estimated execution count
- [ ] Analyze event-driven function growth (blog views, contact forms)
- [ ] Update documentation if changes made
- [ ] Plan ahead if trending toward limit

---

## Inngest Dashboard Quick Links

**View Execution Count:**
1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Select project `dcyfr-labs`
3. Go to **Monitor** → **Dashboard**
4. Look for "Execution Count" card showing monthly total

**Check Function Schedules:**
1. Go to **Functions** tab
2. Click each scheduled function to verify cron schedule:
   - `refresh-activity-feed` → `0 * * * *` (every hour)
   - `security-advisory-monitor` → `0 0,8,16 * * *` (3x daily)
   - `session-monitoring` → `0 0,4,8,12,16,20 * * *` (every 4 hours)
   - `schedule-ip-reputation-check` → `0 0,4,8,12,16,20 * * *` (every 4 hours)

**View Recent Executions:**
1. Go to **Monitor** → **Recent Runs**
2. Filter by function name to see detailed logs
3. Check duration to identify slow operations

---

## How to Calculate Monthly Executions

### Formula

```
Monthly Executions = (Scheduled Daily × 30) + Event-Driven Estimate

Examples:
- Activity Feed Cache: 24 executions/day × 30 = 720/month
- Blog Views (100 views/day): 100 × 30 = 3,000/month
```

### Current Numbers

**Scheduled (predictable):**
- 89 executions/day × 30 days = 2,670/month

**Event-Driven (variable):**
- Blog views: ~1,000 views/day × 30 = 30,000/month
- Contact forms: ~20 forms/day × 30 = 600/month
- Other: ~300/month
- **Subtotal: ~31,000/month**

**Total: ~33,670/month**

**Remaining Budget: 100,000 - 33,670 = 66,330/month (~66% headroom)**

---

## Growth Scenarios

### Scenario 1: Blog Gets Popular (10x Traffic)

**10,000 views/day instead of 1,000:**
- Event-driven: 10,000 × 30 = 300,000 executions
- **Total: 302,670 executions** ❌ OVER LIMIT

**Solution:**
- Upgrade to Inngest Pro/Teams plan
- Or implement view caching (don't track every single view)

### Scenario 2: Moderate Growth (2x Traffic)

**2,000 views/day instead of 1,000:**
- Event-driven: 2,000 × 30 = 60,000 executions
- **Total: 62,670 executions** ✅ WITHIN LIMIT

**Status:** Still within free tier with 37,330 executions of buffer

### Scenario 3: Multiple New Features Added

**If you add 2 new hourly scheduled functions:**
- Each hourly function: 24 × 30 = 720 executions/month
- Two functions: 1,440 executions/month
- **New total: ~35,110 executions** ✅ WITHIN LIMIT

---

## Cost Optimization Strategies

### If Approaching the Limit

**Option 1: Reduce Blog View Tracking**
```typescript
// Instead of tracking every view, sample 10% of views
if (Math.random() < 0.1) {
  await inngest.send({
    name: "blog/post.viewed",
    data: { postId, slug }
  });
}
// Multiply stats by 10x for estimates
```
**Savings:** ~27,000 executions/month

**Option 2: Batch View Events**
```typescript
// Collect views for 1 hour, then send batch event
// Instead of 1 execution per view: 1 execution per hour
const views = await redis.getRange("views:batch", 0, -1);
await inngest.send({
  name: "blog/views.batch",
  data: { views: JSON.parse(views) }
});
```
**Savings:** ~20,000 executions/month

**Option 3: Increase Scheduled Function Intervals**
- Activity Feed: 1 hour → 4 hours (-18 executions/day, -540/month)
- Blog Trending: 1 hour → 4 hours (-18 executions/day, -540/month)

**Savings:** ~1,000+ executions/month

### If Still Under Limit

**You have buffer for:**
- ~5,000 extra blog views/month without any changes
- ~2 new hourly scheduled functions
- Growth in contact forms, comments, etc.

---

## Troubleshooting

### Execution Count Higher Than Expected

**Check:**
1. Are there retry loops? (View failed function runs)
2. Did event-driven functions spike? (Check blog view numbers)
3. Did someone add a new scheduled function? (Check function list)
4. Is there a bug causing infinite event loops? (Search logs)

### Specific Function Using Too Many Executions

**Example: `trackPostView` running unexpectedly**

```bash
# Check Inngest dashboard for this function
# If executions >> blog views, there's a loop or duplicate trigger
```

**Fix:**
1. Add deduplication: `inngest.createFunction({ idempotency: "postId" })`
2. Check if event is being triggered multiple times
3. Review error logs for retry failures

---

## Code Examples

### Add Execution Tracking to New Functions

```typescript
// src/inngest/my-new-function.ts
export const myNewFunction = inngest.createFunction(
  {
    id: "my-new-function",
    retries: 2,  // Don't set too high; fails are counted as executions
  },
  { cron: "0 12 * * *" }, // Daily at noon = 30 executions/month
  async ({ step }) => {
    // Implementation
    return { success: true };
  }
);
```

### Estimate Execution Cost

```typescript
// Calculate monthly cost of a new scheduled function
function estimateExecutionCost(frequency: string): number {
  const frequencies = {
    "0 * * * *": 24 * 30,      // Every hour
    "0 0 * * *": 1 * 30,       // Daily
    "0 0 * * 0": 1/7 * 30,     // Weekly
    "0 0,12 * * *": 2 * 30,    // Twice daily
    "0 0,6,12,18 * * *": 4 * 30, // 4x daily
  };
  return frequencies[frequency] || 0;
}

// Usage:
console.log(estimateExecutionCost("0 * * * *")); // 720 executions/month
```

---

## Monthly Audit Template

**Date:** ___________

### Execution Count Check
- [ ] Logged into [Inngest Dashboard](https://app.inngest.com)
- [ ] Current monthly count: ___________ / 100,000
- [ ] Percentage used: ___________%
- [ ] Trend (up/down/stable): __________

### Function Health Check
- [ ] All scheduled functions executed successfully
- [ ] No functions in failed/retry state
- [ ] No new unexpected scheduled functions
- [ ] Error count within normal range

### Event-Driven Analysis
- [ ] Blog views this month: __________
- [ ] Contact submissions: __________
- [ ] Other event triggers: __________
- [ ] Growth trend: __________% (vs. last month)

### Next Month Forecast
- [ ] Estimated scheduled: __________ executions
- [ ] Estimated event-driven: __________ executions
- [ ] **Total forecast: __________ / 100,000**
- [ ] Action needed? [ ] Yes [ ] No

### Notes
_______________________________________________________________________

---

## Quick Reference: Critical Numbers

| Metric | Value | Calculation |
|--------|-------|---|
| Free Tier Limit | 100,000 | Monthly executions |
| Scheduled Total | 2,670 | 89/day × 30 |
| Event-Driven Est. | 31,000 | ~1,000 views/day |
| Current Total | ~33,670 | Scheduled + Event |
| **Remaining Budget** | **~66,330** | 100K - 33.7K |
| Buffer % | 66% | Safe zone |

---

## Support Resources

- **Inngest Docs:** https://www.inngest.com/docs
- **Pricing:** https://www.inngest.com/pricing
- **Rate Limits:** https://www.inngest.com/docs/reference/limits
- **Community:** https://www.inngest.com/slack
