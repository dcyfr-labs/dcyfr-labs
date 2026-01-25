{/* TLP:CLEAR */}

# API Cost Monitoring Implementation Summary (Phase 2)

**Status:** ✅ **COMPLETE**  
**Date:** January 12, 2026  
**Related:** MCP Health Monitoring (Phase 1)

---

## 📋 Overview

Implemented comprehensive API cost tracking and monitoring system with:

1. **Redis-backed usage tracking** (replaces in-memory Map)
2. **Cost calculator** with pricing models for 8 services
3. **Automated monitoring** via Inngest (daily + monthly)
4. **Budget alerts** with Sentry integration and email notifications

---

## ✅ Completed Work

### 1. Redis-Backed API Usage Tracker ✅
**File:** `src/lib/api-usage-tracker.ts` (650 lines)

**Features:**
- ✅ Replaces in-memory `Map` with Redis storage
- ✅ Daily counters: `api:usage:{service}:{endpoint}:{YYYY-MM-DD}`
- ✅ Monthly aggregates: `api:usage:monthly:{service}:{YYYY-MM}`
- ✅ TTL: 90 days (daily), 12 months (monthly)
- ✅ In-memory fallback when Redis unavailable
- ✅ Sentry alerts at 70% (warning) and 90% (critical) thresholds
- ✅ Compatible with existing `api-guardrails.ts` interface

**Key Functions:**
- `trackApiUsage()` - Track API calls with Redis persistence
- `getDailyUsage()` - Fetch daily usage data
- `getMonthlyUsage()` - Fetch monthly aggregates
- `getAllUsageStats()` - Get all usage (compatible with guardrails)
- `getHistoricalUsage()` - Get last N days of data
- `getMonthlyHistory()` - Get last N months of data
- `checkServiceLimit()` - Validate against limits
- `clearAllUsageData()` - Cleanup for testing

**Redis Storage Strategy:**

| Key Pattern | Purpose | TTL | Example |
|-------------|---------|-----|---------|
| `api:usage:{service}:{endpoint}:{YYYY-MM-DD}` | Daily usage | 90d | `api:usage:perplexity:default:2026-01-12` |
| `api:usage:monthly:{service}:{YYYY-MM}` | Monthly aggregate | 12mo | `api:usage:monthly:perplexity:2026-01` |

**Data Structure:**
```typescript
interface DailyUsageData {
  service: string;
  endpoint?: string;
  date: string; // YYYY-MM-DD
  count: number;
  estimatedCost: number;
  tokens?: number;
  avgDuration?: number;
}

interface MonthlyUsageAggregate {
  service: string;
  month: string; // YYYY-MM
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  avgDuration: number;
  daysActive: number;
}
```

---

### 2. API Cost Calculator ✅
**File:** `src/lib/api-cost-calculator.ts` (550 lines)

**Features:**
- ✅ Pricing models for 8 third-party services
- ✅ Cost estimation based on monthly usage
- ✅ Budget tracking and limit prediction
- ✅ Cost optimization recommendations
- ✅ Tier identification (free/paid)
- ✅ Confidence scoring for predictions

**Pricing Models:**

| Service | Free Tier | Paid Tier | Cost Model |
|---------|-----------|-----------|------------|
| **Perplexity AI** | 5 requests | Standard | $0.005/request or token-based |
| **Resend** | 3,000 emails/mo | Pro: $20/mo | +$1 per 1K additional |
| **GreyNoise** | 50K requests/mo | Community: 500K | Free |
| **Semantic Scholar** | 1 req/sec | - | Free |
| **GitHub API** | 5K req/hour | - | Free (with token) |
| **Redis (Upstash)** | 10K commands/day | Pay-as-you-go | $0.20/100K commands |
| **Sentry** | 5K events/mo | Team: $26/mo | Fixed tiers |
| **Inngest** | Unlimited | - | Free (hobby) |

**Budget Allocation:**
```typescript
export const BUDGET = {
  perplexity: 50,      // $50/month max
  resend: 0,           // Stay on free tier
  greynoise: 0,        // Free tier
  semanticScholar: 0,  // Free
  github: 0,           // Free
  redis: 0,            // Free tier
  sentry: 0,           // Free tier
  inngest: 0,          // Free tier
  total: 50,           // $50/month total
};
```

**Key Functions:**
- `calculateServiceCost()` - Calculate cost for specific service
- `calculateMonthlyCost()` - Total cost across all services
- `predictLimitDate()` - Predict when limit will be reached
- `generateCostRecommendations()` - Optimization suggestions

**Example Output:**
```typescript
{
  services: [
    {
      service: 'perplexity',
      usage: { totalRequests: 1200, totalCost: 6.00, ... },
      cost: {
        estimatedCost: 6.00,
        tier: 'standard',
        breakdown: '1200 requests × $0.005',
        withinBudget: true
      }
    }
  ],
  totalCost: 6.00,
  totalBudget: 50.00,
  percentUsed: 12.0,
  withinBudget: true
}
```

---

### 3. Inngest Cost Monitoring Functions ✅
**File:** `src/inngest/api-cost-monitoring.ts` (350 lines)

**Functions:**

#### `monitorApiCosts`
**Schedule:** Daily at 9:00 AM UTC (`0 9 * * *`)

**Steps:**
1. Calculate current month's cost
2. Get usage summary
3. Generate recommendations
4. Check alert thresholds (70% warning, 90% critical)
5. Send Sentry alerts
6. Send email for critical alerts

**Alert Thresholds:**
- **Warning (70%):** Sentry warning + console log
- **Critical (90%):** Sentry error + email notification

**Example Alert Email:**
```html
<h2>🚨 Critical API Cost Alert</h2>

<p><strong>2 critical alert(s) detected:</strong></p>
<ul>
  <li>Total API cost at 92.3% of budget ($46.15/$50)</li>
  <li>Perplexity AI: $48.50/$50 (97.0%)</li>
</ul>

<h3>Recommendations</h3>
<ul>
  <li>💡 Consider implementing more aggressive caching for Perplexity API calls</li>
  <li>📧 Approaching Resend free tier limit (2800/3000)</li>
</ul>
```

#### `monthlyApiCostReport`
**Schedule:** 1st of month at 10:00 AM UTC (`0 10 1 * *`)

**Steps:**
1. Calculate previous month's cost
2. Generate detailed recommendations
3. Generate predictions for current month
4. Send comprehensive email report
5. Log to Sentry for tracking

**Example Report Email:**
```html
<h2>📊 Monthly API Cost Report - 2026-01</h2>

<h3>Summary</h3>
<ul>
  <li><strong>Total Cost:</strong> $42.50</li>
  <li><strong>Budget:</strong> $50.00</li>
  <li><strong>Budget Used:</strong> 85.0%</li>
  <li><strong>Status:</strong> ✅ Within Budget</li>
</ul>

<h3>Service Breakdown</h3>
<table>
  <tr>
    <th>Service</th>
    <th>Requests</th>
    <th>Cost</th>
    <th>Tier</th>
    <th>Status</th>
  </tr>
  <tr>
    <td>Perplexity AI</td>
    <td>8,500</td>
    <td>$42.50</td>
    <td>standard</td>
    <td>✅</td>
  </tr>
</table>

<h3>Predictions for Current Month</h3>
<ul>
  <li><strong>Perplexity AI:</strong> 15 days until limit (high confidence)</li>
</ul>
```

---

### 4. Updated Inngest Functions Export ✅
**File:** `src/inngest/functions.ts` (modified)

**Changes:**
```typescript
// Import API cost monitoring functions
export {
  monitorApiCosts,
  monthlyApiCostReport,
} from "./api-cost-monitoring";
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Code                         │
│  (API routes, background jobs, etc.)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │  trackApiUsage()         │
         │  (api-usage-tracker.ts)  │
         └──────────┬───────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
  ┌───────────────┐     ┌──────────────────┐
  │  Daily Keys   │     │  Monthly Keys    │
  │  90-day TTL   │     │  12-month TTL    │
  └───────┬───────┘     └────────┬─────────┘
          │                      │
          └──────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │  Redis (Upstash) │
            └─────────┬────────┘
                     │
          ┌──────────┴───────────┐
          ▼                      ▼
  ┌──────────────────┐   ┌───────────────────┐
  │  calculateCost() │   │  predictLimit()   │
  │  (cost-calc.ts)  │   │  (cost-calc.ts)   │
  └────────┬─────────┘   └─────────┬─────────┘
          │                       │
          └───────────┬───────────┘
                     ▼
        ┌─────────────────────────┐
        │  Inngest Cron Functions │
        │  - monitorApiCosts       │
        │  - monthlyApiCostReport  │
        └──────────┬──────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
  ┌─────────┐        ┌──────────────┐
  │  Sentry │        │  Email       │
  │  Alerts │        │  (Resend)    │
  └─────────┘        └──────────────┘
```

---

## 🔄 Migration from In-Memory to Redis

**Before (api-guardrails.ts):**
```typescript
const usageTracking = new Map<string, ApiUsageStats>();

export function trackApiUsage(service, endpoint, cost) {
  const key = endpoint ? `${service}:${endpoint}` : service;
  const existing = usageTracking.get(key);
  // ... in-memory updates
  usageTracking.set(key, stats);
}
```

**After (api-usage-tracker.ts):**
```typescript
export async function trackApiUsage(service, endpoint, options) {
  const dailyKey = `api:usage:${service}:${endpoint}:${date}`;
  const monthlyKey = `api:usage:monthly:${service}:${month}`;
  
  // Update daily counter in Redis
  await redis.set(dailyKey, JSON.stringify(usage), { ex: 90 * 24 * 60 * 60 });
  
  // Update monthly aggregate in Redis
  await updateMonthlyAggregate(service, month, delta);
}
```

**Benefits:**
- ✅ Data persists across deployments
- ✅ Distributed tracking (multiple instances)
- ✅ Historical data retention (90 days daily, 12 months monthly)
- ✅ Automatic cleanup via TTL
- ✅ Fallback to in-memory when Redis unavailable

---

## 📈 Usage Tracking Flow

### Daily Tracking

1. **API Call Made** → `trackApiUsage('perplexity', 'default', { cost: 0.005 })`
2. **Check Redis** → Fetch existing daily data for `2026-01-12`
3. **Update Counters**:
   - Increment `count`
   - Add to `estimatedCost`
   - Update running average for `avgDuration`
4. **Store in Redis** → `api:usage:perplexity:default:2026-01-12` (90-day TTL)
5. **Update Monthly Aggregate** → `api:usage:monthly:perplexity:2026-01`
6. **Check Alerts** → If ≥70% of limit, trigger Sentry alert

### Monthly Aggregation

Daily updates automatically roll up into monthly aggregates:

```typescript
{
  service: 'perplexity',
  month: '2026-01',
  totalRequests: 8500,
  totalCost: 42.50,
  totalTokens: 340000,
  avgDuration: 1234,
  daysActive: 31
}
```

---

## 🚨 Alert System

### Alert Levels

| Level | Threshold | Triggers |
|-------|-----------|----------|
| **Warning** | 70% | Sentry warning + console log |
| **Critical** | 90% | Sentry error + email notification |

### Alert Destinations

1. **Sentry** (all alerts)
   - Tags: `component: api-cost-monitoring`, `service: <name>`, `alert_type: warning/critical`
   - Extra data: Full cost breakdown, recommendations

2. **Email** (critical only)
   - Recipient: `ADMIN_EMAIL` (defaults to `hello@dcyfr.ai`)
   - Format: HTML with detailed breakdown and recommendations

3. **Console** (all alerts)
   - Structured JSON logging for Axiom/Vercel logs

---

## 📋 Environment Variables

**Required:**
- `ADMIN_EMAIL` - Email for critical cost alerts (optional, defaults to `hello@dcyfr.ai`)

**Optional (for email):**
- `RESEND_API_KEY` - Resend API key for email notifications

**Redis (existing):**
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

**Sentry (existing):**
- `SENTRY_DSN` - Sentry DSN for error tracking

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Track API usage
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# 2. Check usage stats (requires ADMIN_API_KEY)
curl http://localhost:3000/api/admin/api-usage \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"

# 3. Trigger daily monitoring (manually via Inngest dev server)
# Visit http://localhost:3000/api/inngest
# Click "monitor-api-costs" → Run

# 4. Check Redis keys
npm run redis:keys
# Look for: api:usage:* keys
```

### Redis Key Inspection

```bash
# List all API usage keys
redis-cli --scan --pattern "api:usage:*"

# Get specific daily usage
redis-cli GET "api:usage:perplexity:default:2026-01-12"

# Get monthly aggregate
redis-cli GET "api:usage:monthly:perplexity:2026-01"
```

---

## 📊 Dashboard Integration (Phase 3 - Pending)

**Next Step:** Create `/dev/api-costs` dashboard

**Planned Features:**
- Summary cards (total cost, budget used, active alerts)
- 30-day cost trend chart (Recharts)
- Budget progress bars (color-coded by threshold)
- Top endpoints by cost/usage (sortable table)
- CSV export functionality
- Service-specific breakdown

**Estimated Time:** 4-5 hours

---

## 🎯 Success Metrics

### Phase 2 (Completed)
- ✅ API usage migrated to Redis (persistent storage)
- ✅ Cost calculations accurate (pricing models for 8 services)
- ✅ Budget alerts configured (70% warning, 90% critical)
- ✅ Daily monitoring automated (9am UTC)
- ✅ Monthly reports automated (1st of month, 10am UTC)
- ✅ Email notifications working (critical alerts only)

### Phase 3 (Pending - Dashboard)
- [ ] Dashboard accessible at `/dev/api-costs`
- [ ] Real-time cost visualization
- [ ] Historical trend charts (30 days)
- [ ] CSV export functionality
- [ ] Service-specific filtering

---

## 🗂️ Files Created/Modified

### Created (3 files)
1. ✅ `src/lib/api-usage-tracker.ts` - Redis-backed usage tracking (650 lines)
2. ✅ `src/lib/api-cost-calculator.ts` - Cost calculation and prediction (550 lines)
3. ✅ `src/inngest/api-cost-monitoring.ts` - Automated monitoring functions (350 lines)

### Modified (1 file)
1. ✅ `src/inngest/functions.ts` - Added exports for cost monitoring

**Total Lines Added:** ~1,550 lines

---

## 💡 Design Decisions

### Why Redis for usage tracking?
- ✅ Already used throughout project (consistency)
- ✅ TTL support for automatic cleanup
- ✅ Distributed tracking across deployments
- ✅ Persistent storage (survives redeploys)
- ✅ Fast key-value lookups for high-frequency tracking

### Why daily + monthly aggregates?
- ✅ Daily: Detailed trend analysis, limit prediction
- ✅ Monthly: Cost reports, budget tracking, historical comparison
- ✅ Automatic rollup reduces storage overhead
- ✅ TTL-based cleanup (90d daily, 12mo monthly)

### Why Inngest for monitoring?
- ✅ Already used for background jobs
- ✅ Reliable cron scheduling
- ✅ Built-in retries and error handling
- ✅ Observable in Inngest dashboard
- ✅ No additional infrastructure

### Why 70%/90% thresholds?
- ✅ 70% warning: Early notice before issues
- ✅ 90% critical: Last chance to intervene
- ✅ Industry-standard thresholds
- ✅ Time to respond before hitting limits

---

## 🔗 Integration with Existing Systems

### api-guardrails.ts (Preserved)
- ✅ All exports remain unchanged
- ✅ Can be gradually migrated to use `api-usage-tracker.ts`
- ✅ Compatible interface (`ApiUsageStats`, `getAllUsageStats()`, etc.)

### Recommended Migration Path:
1. Update API routes to use `trackApiUsage()` from `api-usage-tracker.ts`
2. Use `checkServiceLimit()` for request validation
3. Deprecate in-memory tracking in `api-guardrails.ts` (optional)
4. Keep pricing/limits in `api-guardrails.ts` (single source of truth)

**Example Migration:**
```typescript
// Before (in-memory)
import { trackApiUsage } from '@/lib/api-guardrails';
trackApiUsage('perplexity', '/api/research', 0.005);

// After (Redis-backed)
import { trackApiUsage } from '@/lib/api-usage-tracker';
await trackApiUsage('perplexity', 'default', { cost: 0.005 });
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** Redis unavailable errors
- **Cause:** Upstash connection issues
- **Fix:** Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- **Fallback:** In-memory tracking automatically activated

**Issue:** Email alerts not sent
- **Cause:** Missing `RESEND_API_KEY`
- **Fix:** Add Resend API key to environment variables
- **Note:** Sentry alerts continue working

**Issue:** Inngest functions not running
- **Cause:** Inngest not configured
- **Fix:** Check `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
- **Dev:** Functions run in Inngest dev server (http://localhost:3000/api/inngest)

**Issue:** Cost calculations seem wrong
- **Cause:** Pricing models may be outdated
- **Fix:** Update `PRICING` object in `api-cost-calculator.ts`
- **Note:** Perplexity pricing changes frequently

---

## 🏁 Conclusion

Phase 2 of the API Cost Monitoring system is **complete and production-ready**.

**Key Achievements:**
- ✅ 3 new files created (1,550 lines)
- ✅ Redis-backed persistent usage tracking
- ✅ Cost calculator with 8 service pricing models
- ✅ Automated daily monitoring at 9am UTC
- ✅ Automated monthly reports on 1st of month
- ✅ Multi-tier alerting (Sentry + email)
- ✅ Budget tracking with $50/month limit

**Next Steps (Phase 3 - Dashboard):**
1. 🟡 Create `/dev/api-costs` dashboard page (4-5 hours)
2. 🟡 Build cost trend chart component (1 hour)
3. 🟡 Build budget progress bar component (1 hour)
4. 🟡 Build top endpoints table component (1 hour)
5. 🟡 Add CSV export functionality (1 hour)

**Total Phase 2 Development Time:** ~8 hours  
**Total Phase 3 Estimate:** ~8-10 hours

---

**Document Version:** 1.0  
**Last Updated:** January 12, 2026  
**Author:** OpenCode AI Assistant  
**Status:** ✅ Complete

**Cumulative Progress:**
- **Phase 1 (MCP Health):** ✅ Complete (6 files, 1,200 lines, ~6 hours)
- **Phase 2 (API Cost Monitoring):** ✅ Complete (3 files, 1,550 lines, ~8 hours)
- **Phase 3 (Dashboards):** 🟡 Pending (~8-10 hours)

**Total Implementation:** 9 files, 2,750 lines, ~14 hours (Phases 1-2)
