{/* TLP:CLEAR */}

# Daily Security Test Schedule - Inngest Automation

**Status:** ✅ Active
**Schedule:** Daily at 6:00 PM Mountain Time
**Duration:** December 12-20, 2025 (8 days)
**Purpose:** Validate Sentry alerting and Axiom logging integration

---

## Overview

An automated Inngest cron function runs daily security tests to validate the security monitoring infrastructure implemented during the December 2025 security audit.

**Function:** `dailySecurityTest`
**File:** [src/inngest/security-functions.ts](../../src/inngest/security-functions.ts)
**Cron Schedule:** `0 1 * * *` (1:00 AM UTC = 6:00 PM MST)

---

## Test Suite

The function performs 4 automated tests against production APIs:

### Test 1: Invalid API Key Attempts (3 requests)
- **Target:** `/api/analytics`
- **Expected:** HTTP 401 responses
- **Sentry:** 3 warning events
- **Axiom:** 3 structured log entries
- **Purpose:** Validate basic authentication logging

### Test 2: Brute Force Simulation (15 requests)
- **Target:** `/api/analytics`
- **Expected:** 15x HTTP 401 responses
- **Sentry:** 1 alert triggered (>10 attempts threshold)
- **Axiom:** 15 structured log entries
- **Purpose:** Validate brute force detection alerting

### Test 3: Rate Limit Validation (10 requests)
- **Target:** `/api/analytics`
- **Expected:** Some HTTP 429 responses (rate limited)
- **Sentry:** Rate limit events logged
- **Axiom:** Rate limit violation logs
- **Purpose:** Validate rate limiting is active

### Test 4: Admin API Test (1 request)
- **Target:** `/api/admin/api-usage`
- **Expected:** HTTP 401 response
- **Sentry:** 1 warning event
- **Axiom:** 1 structured log entry
- **Purpose:** Validate both admin endpoints

---

## Expected Daily Outcomes

**Per Test Run:**
- **Total API Requests:** 29 (3 + 15 + 10 + 1)
- **Sentry Events:** ~19 events
- **Sentry Alerts:** 1 brute force alert (if configured)
- **Axiom Logs:** 29 structured JSON logs
- **Email Notifications:** 1 (if Sentry alerts configured)

**Verification Points:**
- ✅ All requests return expected HTTP status codes
- ✅ No requests fail with errors
- ✅ Sentry dashboard shows grouped events
- ✅ Axiom dashboard shows structured logs
- ✅ Email alerts received (if configured)

---

## Monitoring the Tests

### Inngest Dashboard

View test execution and results:

1. Go to: https://app.inngest.com
2. Navigate to: Functions → `daily-security-test`
3. Check "Recent Runs" for daily execution logs
4. View detailed step-by-step execution

**What to Look For:**
- Function runs daily at 6:00 PM MT
- All steps complete successfully (green checkmarks)
- Summary shows expected test counts
- No errors or retries

### Sentry Dashboard

Verify events are being captured:

1. Go to: https://sentry.io
2. Click "Issues" tab
3. Look for: "Admin access denied: invalid or missing API key"
4. Check event count increases by ~19 daily
5. Verify alert triggered (if configured)

**Query:** `is:unresolved message:"Admin access denied"`

### Axiom Dashboard

Verify structured logs are flowing:

1. Go to: https://app.axiom.co
2. Navigate to your Vercel logs dataset
3. Run query: `['event'] == "admin_access" | sort by timestamp desc | limit 50`
4. Should see 29 new events daily at ~6:00 PM MT

**Daily Pattern:**
- Cluster of events around 6:00 PM MT
- Mix of "denied" results
- Consistent structure across all events

---

## Schedule Details

### Cron Expression: `0 1 * * *`

**Translation:**
- `0` = Minute (0-59): At minute 0
- `1` = Hour (0-23): At 1 AM UTC
- `*` = Day of month: Every day
- `*` = Month: Every month
- `*` = Day of week: Every day of week

**Time Zone Conversion:**
- **UTC:** 1:00 AM
- **MST (Mountain Standard Time, UTC-7):** 6:00 PM previous day
- **MDT (Mountain Daylight Time, UTC-6):** 7:00 PM previous day

**Current:** Winter (MST), so tests run at 6:00 PM MT

### Auto-Termination

The function automatically skips execution after **December 20, 2025**:

```typescript
const endDate = new Date("2025-12-20T23:59:59Z");

if (now > endDate) {
  return {
    skipped: true,
    reason: "Validation period ended (Dec 20, 2025)",
    timestamp: now.toISOString(),
  };
}
```

**After Dec 20:**
- Function will run but immediately skip
- No API requests made
- Logs "Validation period ended"
- Can be safely disabled or removed

---

## Test Output Format

Each test run returns a detailed summary:

```json
{
  "timestamp": "2025-12-12T01:00:00.000Z",
  "mountainTime": "12/11/2025, 6:00:00 PM",
  "daysRemaining": 8,
  "tests": {
    "invalidKeys": {
      "total": 3,
      "successful": 3
    },
    "bruteForce": {
      "total": 15,
      "successful": 15,
      "expectedSentryAlert": true
    },
    "rateLimits": {
      "total": 10,
      "rateLimited": 5
    },
    "adminApi": {
      "status": 401,
      "success": true
    }
  },
  "expectedOutcomes": {
    "sentryEvents": 19,
    "sentryAlerts": 1,
    "axiomLogs": 29
  }
}
```

---

## Troubleshooting

### Function Not Running

**Check 1: Inngest Dashboard**
- Go to Functions → daily-security-test
- Check "Cron Schedule" shows `0 1 * * *`
- Verify status is "Active" not "Paused"

**Check 2: Function Registration**
- Verify function is in `/api/inngest/route.ts` functions array
- Check dev/production deployment includes latest code

**Check 3: Environment**
- Ensure `VERCEL_URL` or base URL is accessible
- Verify Inngest can reach your deployment

### Tests Failing

**Check 1: API Responses**
- Look at Inngest run logs for specific errors
- Check if endpoints return unexpected status codes
- Verify `x-internal-request` header is accepted

**Check 2: Rate Limiting**
- Rate limits may block legitimate test requests
- Check Redis connection in production
- Review rate limit configuration

**Check 3: Network Issues**
- Inngest may have connectivity issues to your deployment
- Check Vercel deployment logs for errors
- Verify API routes are deployed and accessible

### No Sentry Events

**Check 1: Sentry Configuration**
- Verify `SENTRY_DSN` environment variable is set
- Check Sentry is enabled in production (`sentry.server.config.ts`)
- Confirm DSN is valid and project exists

**Check 2: Event Filtering**
- Check Sentry filters aren't dropping events
- Verify sample rate allows events through
- Look for events in Sentry's "All Events" view

**Check 3: Fingerprinting**
- Events should group under same issue
- Check fingerprint configuration in code
- Verify grouping isn't creating too many issues

### No Axiom Logs

**Check 1: Vercel Logs Integration**
- Verify Axiom integration is active on Vercel
- Check Axiom dataset is receiving logs
- Test with manual API requests

**Check 2: Log Format**
- Structured logs must be valid JSON
- Check console.log statements in API routes
- Verify timestamp and event fields present

---

## After Validation Period (Dec 20+)

### Option 1: Disable Function

Remove from Inngest serve configuration:

```typescript
// src/app/api/inngest/route.ts
const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // ... other functions ...
    // dailySecurityTest,  // ← Comment out or remove
  ],
});
```

### Option 2: Reduce Frequency

Change to weekly instead of daily:

```typescript
// src/inngest/security-functions.ts
export const weeklySecurityTest = inngest.createFunction(
  { id: "weekly-security-test", retries: 1 },
  { cron: "0 1 * * 0" }, // Sunday at 6PM MT
  async ({ step }) => {
    // Same test logic...
  }
);
```

### Option 3: Convert to On-Demand

Change to event-driven for manual triggering:

```typescript
export const manualSecurityTest = inngest.createFunction(
  { id: "manual-security-test", retries: 1 },
  { event: "security/test.manual" },
  async ({ step }) => {
    // Same test logic...
  }
);

// Trigger manually:
await inngest.send({
  name: "security/test.manual",
  data: {},
});
```

---

## Related Documentation

- [Security Audit Summary](./security-audit-summary-2025-12-11)
- [Security Fixes Implementation](./security-fixes-2025-12-11)
- [Sentry Integration Guide](./sentry-integration-complete)
- [Sentry Manual Alert Setup](./sentry-manual-alert-setup)
- [Axiom Security Queries](./axiom-security-queries)
- [Completion Status](./completion-status-2025-12-12)

---

## Summary

**What it does:**
- Runs 29 automated security tests daily
- Validates Sentry and Axiom integrations
- Triggers alerts to verify monitoring is working

**Why it's valuable:**
- Catches monitoring failures immediately
- Ensures security alerting remains active
- Provides continuous validation of security controls

**When it ends:**
- Automatically after December 20, 2025
- Can be extended, disabled, or converted to on-demand

**Current status:** ✅ Active and running daily at 6:00 PM MT
