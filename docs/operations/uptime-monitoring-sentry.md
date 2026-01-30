<!-- TLP:CLEAR -->

# Uptime Monitoring with Sentry

**Date:** November 11, 2025  
**Priority:** 🔴 HIGH (Infrastructure & Reliability)  
**Effort:** 30 minutes setup + ongoing monitoring  
**Tool:** Sentry (already configured)

---

## 📊 Overview

This guide explains how to set up comprehensive uptime and performance monitoring using **Sentry**, which is already configured in this project. Sentry provides better integration than UptimeRobot because it combines:

- ✅ Uptime monitoring (Cron Monitoring)
- ✅ Error tracking (already active)
- ✅ Performance monitoring (already active)
- ✅ Session replay (already active)
- ✅ All in one dashboard

**Advantages over UptimeRobot:**
- Already integrated with your codebase
- No additional tool to maintain
- Unified error and uptime monitoring
- Better context for incidents (stack traces, user sessions)
- Free tier: 5,000 errors/month, 10,000 performance units/month
- Cron monitoring included in free tier

---

## 🎯 What to Monitor

### Critical Endpoints (Priority 1)
1. **Homepage** (`https://www.dcyfr.ai/`)
   - Most important page (user entry point)
   - Check interval: 5 minutes
   - Expected: 200 OK, < 2s load time

2. **Blog List** (`https://www.dcyfr.ai/blog`)
   - High-traffic page
   - Check interval: 10 minutes
   - Expected: 200 OK, < 2s load time

3. **API Health Check** (`https://www.dcyfr.ai/api/health`)
   - **Action Required**: Create this endpoint (see below)
   - Check interval: 5 minutes
   - Expected: 200 OK with JSON response

### Important Endpoints (Priority 2)
4. **RSS Feed** (`https://www.dcyfr.ai/rss.xml`)
   - Check interval: 30 minutes
   - Expected: 200 OK, valid XML

5. **Sitemap** (`https://www.dcyfr.ai/sitemap.xml`)
   - Check interval: 60 minutes
   - Expected: 200 OK, valid XML

### Nice-to-Have (Priority 3)
6. **Contact Form API** (`https://www.dcyfr.ai/api/contact`)
   - Already has error tracking via Sentry
   - Monitor via error rates (not direct uptime check)

---

## 🚀 Setup Instructions

### Step 1: Enable Sentry Cron Monitoring

Sentry's **Cron Monitoring** feature is perfect for uptime checks. It works by:
1. You define a "cron job" that should run on a schedule
2. Sentry expects a check-in at that interval
3. If check-in is missed, you get alerted

**Implementation Options:**

#### Option A: Vercel Cron Job (Recommended)

Create a Vercel cron job that pings your endpoints and reports to Sentry.

**1. Create Health Check API Route**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'edge';

export async function GET() {
  const checkId = Sentry.captureCheckIn({
    monitorSlug: 'site-health-check',
    status: 'in_progress',
  });

  try {
    // Check critical services
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {
        redis: await checkRedis(),
        database: true, // Add database check if applicable
        vercel: true,
      },
    };

    // Report success to Sentry
    Sentry.captureCheckIn({
      checkInId: checkId,
      monitorSlug: 'site-health-check',
      status: 'ok',
    });

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    // Report failure to Sentry
    Sentry.captureCheckIn({
      checkInId: checkId,
      monitorSlug: 'site-health-check',
      status: 'error',
    });

    Sentry.captureException(error);

    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    // Add your Redis check here
    // const redis = getRedis();
    // await redis.ping();
    return true;
  } catch {
    return false;
  }
}
```

**2. Create Vercel Cron Configuration**

```json
// vercel.json (add to existing config)
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes and automatically reports to Sentry.

#### Option B: External Monitoring Script (Alternative)

If you prefer external monitoring (like UptimeRobot style), create a separate monitoring service:

**1. Create monitoring script**

```typescript
// scripts/monitor-uptime.mjs
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const ENDPOINTS = [
  { url: 'https://www.dcyfr.ai/', name: 'homepage' },
  { url: 'https://www.dcyfr.ai/blog', name: 'blog' },
  { url: 'https://www.dcyfr.ai/api/health', name: 'health-check' },
];

async function checkEndpoint(endpoint) {
  const checkId = Sentry.captureCheckIn({
    monitorSlug: `uptime-${endpoint.name}`,
    status: 'in_progress',
  });

  try {
    const start = Date.now();
    const response = await fetch(endpoint.url);
    const duration = Date.now() - start;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    Sentry.captureCheckIn({
      checkInId: checkId,
      monitorSlug: `uptime-${endpoint.name}`,
      status: 'ok',
      duration: duration / 1000, // seconds
    });

    console.log(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
  } catch (error) {
    Sentry.captureCheckIn({
      checkInId: checkId,
      monitorSlug: `uptime-${endpoint.name}`,
      status: 'error',
    });

    console.error(`❌ ${endpoint.name}: ${error.message}`);
  }
}

async function main() {
  for (const endpoint of ENDPOINTS) {
    await checkEndpoint(endpoint);
  }
}

main();
```

**2. Schedule with GitHub Actions**

```yaml
# .github/workflows/uptime-monitor.yml
name: Uptime Monitor

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: node scripts/monitor-uptime.mjs
        env:
          SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

---

## 📱 Configure Sentry Alerts

### Step 2: Set Up Sentry Project (if not done)

1. **Go to Sentry Dashboard**
   - URL: https://sentry.io/organizations/dcyfr/projects/
   - Your project should already exist (DSN is configured)

2. **Navigate to Crons**
   - Click "Crons" in left sidebar
   - You should see monitors appear after first check-in

### Step 3: Configure Alert Rules

1. **Navigate to Alerts**
   - Go to your project in Sentry
   - Click "Alerts" → "Alert Rules"
   - Click "Create Alert"

2. **Create Uptime Alert**
   ```
   Name: Critical Endpoint Down
   Conditions:
     - When: A monitor check-in is missed
     - For monitors: uptime-homepage, uptime-health-check
   Actions:
     - Send email to: your-email@example.com
     - (Optional) Send to Slack/Discord
   ```

3. **Create Error Rate Alert**
   ```
   Name: High Error Rate
   Conditions:
     - When: Event count is above 10
     - In: 1 minute
     - Filter: level:error
   Actions:
     - Send email to: your-email@example.com
   ```

4. **Create Performance Alert**
   ```
   Name: Slow Page Load
   Conditions:
     - When: Average transaction duration is above 2000ms
     - For: pageload transactions
     - In: 10 minutes
   Actions:
     - Send email to: your-email@example.com
   ```

---

## 📊 Monitoring Dashboard

### Access Your Sentry Dashboard

**URL:** https://sentry.io/organizations/dcyfr/projects/

### Key Metrics to Monitor

1. **Uptime (Crons)**
   - View: Crons → All Monitors
   - Check: Success rate, missed check-ins
   - Goal: 99.9% uptime (< 43 minutes downtime/month)

2. **Error Rate**
   - View: Issues → All Issues
   - Check: New issues, regression trends
   - Goal: < 0.1% error rate

3. **Performance**
   - View: Performance → Summary
   - Check: P75/P95 response times, Apdex score
   - Goal: P95 < 2 seconds

4. **Session Replay**
   - View: Replays → All Replays
   - Check: Error replays, rage clicks
   - Use: Debug user-reported issues

### Recommended Review Schedule

- **Daily** (5 minutes):
  - Check for new critical errors
  - Review missed check-ins
  - Quick performance scan

- **Weekly** (30 minutes):
  - Analyze error trends
  - Review performance metrics
  - Identify patterns in issues
  - Update alert thresholds if needed

- **Monthly** (2 hours):
  - Generate uptime report
  - Review all incidents
  - Optimize alert rules
  - Plan improvements

---

## 🎯 Quick Start (Immediate Action)

### 5-Minute Setup

1. **Verify Sentry is working**
   ```bash
   # Check if Sentry DSN is configured
   grep -r "SENTRY" .env*
   
   # Should see: Already configured in instrumentation files
   ```

2. **Create health check endpoint**
   - Copy code from "Option A" above
   - Create `src/app/api/health/route.ts`
   - Test: `curl http://localhost:3000/api/health`

3. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "feat: add health check endpoint for uptime monitoring"
   git push
   ```

4. **Check Sentry dashboard**
   - Wait 5 minutes
   - Go to Sentry → Crons
   - Verify "site-health-check" appears

5. **Set up email alerts**
   - Sentry → Alerts → Create Alert
   - Choose "Uptime monitoring" template
   - Add your email

---

## ✅ Success Criteria

After setup is complete, you should have:

- ✅ Health check endpoint responding
- ✅ Sentry receiving check-ins every 5 minutes
- ✅ Email alerts configured for downtime
- ✅ Dashboard accessible with uptime metrics
- ✅ Zero missed check-ins in first 24 hours

---

## 💡 Advanced Features (Optional)

### Add More Comprehensive Checks

```typescript
// Enhanced health check with detailed diagnostics
export async function GET() {
  const checks = await Promise.allSettled([
    checkRedis(),
    checkVercelFunctions(),
    checkExternalAPIs(),
    checkDatabaseConnection(),
  ]);

  const healthy = checks.every(c => c.status === 'fulfilled' && c.value);
  
  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      redis: checks[0],
      functions: checks[1],
      apis: checks[2],
      database: checks[3],
    },
  }, { status: healthy ? 200 : 503 });
}
```

### Integration with Vercel Analytics

Sentry automatically captures Web Vitals when integrated with Vercel:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

No additional configuration needed!

---

## 📚 Resources

- [Sentry Cron Monitoring Docs](https://docs.sentry.io/product/crons/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Sentry Alert Rules](https://docs.sentry.io/product/alerts/)

---

## 🔜 Next Steps

1. Create health check endpoint (5 min)
2. Deploy and verify check-ins (10 min)
3. Configure email alerts (5 min)
4. Add to weekly review schedule (5 min)
5. Document in done.md (5 min)

**Total Time:** ~30 minutes

---

**Created:** November 11, 2025  
**Status:** Ready for implementation  
**ROI:** ⭐⭐⭐⭐⭐ (High - immediate operational visibility with no additional costs)
