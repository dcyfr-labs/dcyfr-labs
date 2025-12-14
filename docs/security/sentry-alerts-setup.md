# Sentry Security Alerts Setup Guide
**Date:** December 11, 2025
**Purpose:** Configure automated security alerts for admin endpoint monitoring

---

## Prerequisites

- ✅ Sentry project configured for dcyfr-labs
- ✅ Structured JSON logging implemented (Dec 11, 2025)
- ✅ `@sentry/nextjs` installed and configured
- ✅ Axiom dashboard monitoring active

---

## Overview

This guide configures Sentry alerts for the security events logged by our admin endpoints:
- `/api/analytics` - Analytics dashboard access
- `/api/admin/api-usage` - API usage monitoring

**Logged Events:**
```json
{
  "event": "admin_access",
  "endpoint": "/api/analytics" | "/api/admin/api-usage",
  "method": "GET",
  "result": "success" | "denied",
  "reason": "invalid or missing API key" | "production environment blocked" | "rate limit exceeded",
  "timestamp": "2025-12-11T17:30:00.000Z",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "environment": "production",
  "vercelEnv": "production"
}
```

---

## Step 1: Access Sentry Alerts

1. **Navigate to Sentry Dashboard:**
   - Go to https://sentry.io
   - Select project: `dcyfr-labs` (or your project name)

2. **Access Alerts:**
   - Click **Alerts** in left sidebar
   - Click **Create Alert** button

3. **Choose Alert Type:**
   - Select **Issues**
   - This allows filtering on message content, tags, and context

---

## Step 2: Critical Alert - Production Admin Access Attempts

**Priority:** 🔴 **CRITICAL**
**Purpose:** Alert immediately when anyone attempts to access admin endpoints in production (should never happen - all admin endpoints are blocked in production)

### Configuration

**Alert Name:** `[CRITICAL] Production Admin Access Attempt`

**Conditions:**
```
When an event is captured by Sentry
AND
message CONTAINS "admin_access"
AND
environment IS "production"
AND
vercelEnv IS "production"
```

**Action/Filters:**
1. **Set Conditions:**
   - Event Type: `All Events`
   - Environment: `production`
   - Message contains: `admin_access`

2. **Set Threshold:**
   - Trigger: `1 event`
   - In: `1 minute`
   - Frequency: `Immediately`

3. **Actions:**
   - Send notification to: `Email`, `Slack` (if configured)
   - Create Sentry Issue: `Yes`
   - Priority: `High`

**Expected Behavior:**
- Should **NEVER** trigger (admin endpoints return 404 in production via `blockExternalAccess()`)
- If triggered: **IMMEDIATE INVESTIGATION REQUIRED** - potential security bypass

---

## Step 3: High Priority - Repeated Authentication Failures

**Priority:** 🟠 **HIGH**
**Purpose:** Detect brute force attacks or credential stuffing attempts

### Configuration

**Alert Name:** `[HIGH] Brute Force Attack Detected - Admin Endpoints`

**Conditions:**
```
When an event is captured by Sentry
AND
message CONTAINS "admin_access"
AND
result IS "denied"
AND
reason CONTAINS "invalid or missing API key"
AND
COUNT >= 10 events
IN 5 minutes
FROM same IP address
```

**Manual Implementation (Sentry doesn't support complex queries):**

Since Sentry's built-in alerting doesn't support complex "same IP" grouping, we'll use **Issue Grouping** + **Metric Alerts**:

1. **Create Metric Alert:**
   - Go to **Alerts** → **Metric Alerts** → **Create Alert**
   - Alert name: `[HIGH] Brute Force Attack - Admin Endpoints`

2. **Configure Metric:**
   - Metric: `count()`
   - Filter:
     - `message:"admin_access"`
     - `tags.result:"denied"`
     - `tags.reason:"invalid or missing API key"`

3. **Set Threshold:**
   - Trigger when metric: `is above 10`
   - In: `5 minutes`
   - Frequency: `Every 5 minutes`

4. **Actions:**
   - Email notification
   - Slack notification (if configured)
   - Create issue

**Note:** For IP-based grouping, use Axiom (you already have this in your dashboard). Sentry will alert on volume, Axiom can show you the specific IPs.

---

## Step 4: Medium Priority - Rate Limit Violations

**Priority:** 🟡 **MEDIUM**
**Purpose:** Monitor for potential abuse or misconfigured clients

### Configuration

**Alert Name:** `[MEDIUM] High Rate Limit Violations - Admin Endpoints`

**Conditions:**
```
When an event is captured by Sentry
AND
message CONTAINS "admin_access"
AND
result IS "denied"
AND
reason CONTAINS "rate limit exceeded"
AND
COUNT >= 20 events
IN 15 minutes
```

**Implementation:**

1. **Create Metric Alert:**
   - Go to **Alerts** → **Metric Alerts** → **Create Alert**
   - Alert name: `[MEDIUM] Rate Limit Violations - Admin Endpoints`

2. **Configure Metric:**
   - Metric: `count()`
   - Filter:
     - `message:"admin_access"`
     - `tags.result:"denied"`
     - `tags.reason:"rate limit exceeded"`

3. **Set Threshold:**
   - Trigger when metric: `is above 20`
   - In: `15 minutes`
   - Frequency: `Every 15 minutes`

4. **Actions:**
   - Email notification
   - Create issue (low priority)

---

## Step 5: Info Alert - Successful Admin Access Monitoring

**Priority:** ℹ️ **INFO**
**Purpose:** Track all successful admin access for audit trail

### Configuration

**Alert Name:** `[INFO] Admin Access Log - Success`

**Note:** This is **not** a critical alert, but useful for compliance and audit trails.

**Implementation:**

1. **Create Metric Alert:**
   - Go to **Alerts** → **Metric Alerts** → **Create Alert**
   - Alert name: `[INFO] Admin Access Success - Daily Summary`

2. **Configure Metric:**
   - Metric: `count()`
   - Filter:
     - `message:"admin_access"`
     - `tags.result:"success"`

3. **Set Threshold:**
   - Trigger when metric: `is above 0`
   - In: `24 hours`
   - Frequency: `Daily at 00:00 UTC`

4. **Actions:**
   - Email summary (optional)
   - Log only (for audit)

---

## Step 6: Custom Tags for Better Filtering

To enable the filters above, you need to ensure your Sentry integration extracts custom tags from the structured logs.

### Update Sentry Integration

**File:** `sentry.client.config.ts` or `sentry.server.config.ts`

Add `beforeSend` hook to extract structured log fields as tags:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ... other config ...

  beforeSend(event, hint) {
    // Extract structured log data from console.log messages
    if (event.message && event.message.includes("admin_access")) {
      try {
        // Parse JSON from log message
        const logData = JSON.parse(event.message);

        // Add as tags for filtering
        event.tags = {
          ...event.tags,
          event_type: logData.event || "unknown",
          endpoint: logData.endpoint || "unknown",
          result: logData.result || "unknown",
          reason: logData.reason || "unknown",
          user_ip: logData.ip || "unknown",
        };

        // Add as context for detailed view
        event.contexts = {
          ...event.contexts,
          admin_access: {
            endpoint: logData.endpoint,
            method: logData.method,
            result: logData.result,
            reason: logData.reason,
            ip: logData.ip,
            userAgent: logData.userAgent,
            timestamp: logData.timestamp,
          },
        };

        // Set fingerprint for proper grouping
        event.fingerprint = [
          "admin_access",
          logData.endpoint || "unknown",
          logData.result || "unknown",
          logData.reason || "unknown",
        ];
      } catch (error) {
        // If parsing fails, just return the event as-is
        console.error("Failed to parse admin_access log for Sentry:", error);
      }
    }

    return event;
  },

  // ... rest of config ...
});
```

**Restart Required:** Yes, after updating Sentry config

---

## Step 7: Manual Logging to Sentry (Alternative Approach)

If the `beforeSend` approach is too complex, you can **directly log to Sentry** instead of relying on console.log parsing.

### Update Logging Functions

**File:** `src/app/api/analytics/route.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

function logAccess(request: Request, status: "success" | "denied", reason?: string) {
  const url = new URL(request.url);
  const timestamp = new Date().toISOString();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const queryParams = url.searchParams.toString();

  const logData = {
    event: "admin_access",
    endpoint: "/api/analytics",
    method: "GET",
    result: status,
    reason: reason || undefined,
    timestamp,
    ip,
    userAgent,
    queryParams: queryParams || undefined,
    environment: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || undefined,
  };

  // Structured JSON logging for Axiom
  console.log(JSON.stringify(logData));

  // Also send to Sentry for alerting (only for denied access)
  if (status === "denied") {
    Sentry.captureMessage(`Admin access denied: ${reason}`, {
      level: "warning",
      tags: {
        event_type: "admin_access",
        endpoint: "/api/analytics",
        result: status,
        reason: reason || "unknown",
        user_ip: ip,
      },
      contexts: {
        admin_access: logData,
      },
      fingerprint: [
        "admin_access",
        "/api/analytics",
        status,
        reason || "unknown",
      ],
    });
  }

  // For production access attempts (should never happen), send as ERROR
  if (process.env.VERCEL_ENV === "production") {
    Sentry.captureMessage(`CRITICAL: Admin endpoint accessed in production!`, {
      level: "error",
      tags: {
        event_type: "admin_access",
        endpoint: "/api/analytics",
        result: status,
        environment: "production",
      },
      contexts: {
        admin_access: logData,
      },
      fingerprint: [
        "admin_access_production",
        "/api/analytics",
      ],
    });
  }
}
```

**Same changes for:** `src/app/api/admin/api-usage/route.ts`

**Pros:**
- ✅ Direct Sentry integration
- ✅ Easier filtering in Sentry UI
- ✅ Automatic tag extraction
- ✅ Better grouping control

**Cons:**
- ⚠️ Requires code changes
- ⚠️ Adds Sentry calls to hot paths (minimal performance impact)

---

## Step 8: Verify Alerts are Working

### Test Critical Alert (Production Access)

**DO NOT DO THIS IN ACTUAL PRODUCTION!** Test in preview/development:

```bash
# In preview environment (not production)
curl -X GET https://preview.dcyfr.ai/api/analytics \
  -H "Authorization: Bearer test_key"

# Expected:
# - Axiom: Logs the attempt
# - Sentry: Should NOT alert (only alerts on actual production)
```

### Test Brute Force Alert

```bash
# In development
for i in {1..15}; do
  curl -X GET http://localhost:3000/api/analytics \
    -H "Authorization: Bearer invalid_key_$i"
  sleep 1
done

# Expected:
# - Axiom: Shows 15 failed attempts
# - Sentry: Alert triggers after 10 attempts in 5 minutes
```

### Test Rate Limit Alert

```bash
# In development (analytics has 60/min in dev)
for i in {1..65}; do
  curl -X GET http://localhost:3000/api/analytics \
    -H "Authorization: Bearer $ADMIN_API_KEY"
done

# Expected:
# - Request #61+ returns 429 Rate Limit Exceeded
# - Axiom: Shows rate limit violations
# - Sentry: Alert if > 20 violations in 15 min
```

---

## Step 9: Alert Response Procedures

### Critical Alert Response (Production Access Attempt)

**Alert:** `[CRITICAL] Production Admin Access Attempt`

**Immediate Actions:**
1. ✅ Check Axiom logs for IP address and user agent
2. ✅ Verify `blockExternalAccess()` is functioning
3. ✅ Check if request actually reached endpoint logic (should be 404)
4. ✅ Review recent deployments for security bypass
5. ✅ If bypass confirmed: **ROLLBACK IMMEDIATELY**
6. ✅ Update firewall rules to block attacking IP
7. ✅ Rotate `ADMIN_API_KEY` immediately

**Investigation Questions:**
- Was the request actually blocked (404)?
- Is there a code path that bypasses `blockExternalAccess()`?
- Was the deployment recent? Any config changes?
- Is this a test/monitoring system we forgot about?

### High Alert Response (Brute Force Attack)

**Alert:** `[HIGH] Brute Force Attack Detected`

**Immediate Actions:**
1. ✅ Check Axiom for attacking IP addresses
2. ✅ Verify rate limiting is working
3. ✅ Check if any attempts succeeded
4. ✅ If >100 attempts from single IP: Consider WAF block
5. ✅ Monitor for 24 hours for continued attempts

**Investigation Questions:**
- Is this a distributed attack (many IPs)?
- Are all attempts from same user agent?
- Is this a misconfigured monitoring tool?
- Have any attempts succeeded?

### Medium Alert Response (Rate Limit Violations)

**Alert:** `[MEDIUM] High Rate Limit Violations`

**Actions:**
1. ✅ Check Axiom for violating IPs
2. ✅ Verify if legitimate user (known IP/UA)
3. ✅ Contact user if legitimate (inform of rate limits)
4. ✅ No immediate action needed if distributed

---

## Step 10: Alert Maintenance

### Monthly Review

**Tasks:**
1. Review alert thresholds (too sensitive? too lenient?)
2. Check false positive rate
3. Update IP whitelist if needed
4. Review incident response times

### Quarterly Review

**Tasks:**
1. Review all triggered alerts
2. Update alert configurations based on patterns
3. Add new alerts for new security features
4. Remove obsolete alerts

---

## Step 11: Inngest Webhook Authentication Monitoring

**Priority:** 🟠 **HIGH**
**Purpose:** Monitor Inngest authentication failures and detect signature validation issues

### Background

Inngest uses cryptographic signature validation via the `INNGEST_SIGNING_KEY` environment variable. The `serve()` function from the Inngest SDK handles this validation internally. If your route handler has pre-emptive header validation, it can block legitimate Inngest requests before signature validation occurs.

**Common Causes of Inngest 401 Errors:**

1. **Incorrect INNGEST_SIGNING_KEY** - Key mismatch between local development and production
2. **Redundant Header Validation** - Route handlers checking for headers that aren't always present
3. **Request Body Tampering** - Proxies or middleware modifying request body
4. **Clock Skew** - Request timestamp validation failures (> 5 min difference)
5. **Missing Inngest Client** - Inngest SDK not properly initialized in environment

### Configuration

**Alert Name:** `[HIGH] Inngest Authentication Failures`

**Metric Alert Setup:**

1. **Access Sentry Alerts** → **Metric Alerts** → **Create Alert**

2. **Configure Metric:**
   ```
   Metric: count()
   Filter:
     - message:"Inngest"
     - tags.status:"401"
     - request.path:"/api/inngest"
   ```

3. **Set Threshold:**
   - Trigger when metric: `is above 20`
   - In: `10 minutes`
   - Frequency: `Every 10 minutes`

4. **Actions:**
   - Email notification
   - Slack notification
   - Create issue (high priority)

### Diagnosis Steps

When the alert triggers:

**Step 1: Check Error Logs**
```bash
# View recent Inngest errors in production logs
curl "https://api.axiom.co/v1/datasets/vercel/query" \
  -H "Authorization: Bearer $AXIOM_TOKEN" \
  -d '{
    "apl": "['\'vercel'\''] | where ['\'request.path'\''] contains '\''/api/inngest'\'' | where toint(['\'request.statusCode'\'']) == 401 | limit 50"
  }'
```

**Step 2: Verify Environment Variable**
```bash
# Check Inngest signing key is set
vercel env list
# Should show INNGEST_SIGNING_KEY value (masked)

# If missing, set it:
vercel env add INNGEST_SIGNING_KEY
```

**Step 3: Check for Route Handler Issues**
```bash
# Look for pre-emptive header validation in /api/inngest/route.ts
grep -n "x-inngest" src/app/api/inngest/route.ts

# If found, remove header presence checks - trust serve() to validate
```

**Step 4: Review Inngest Dashboard**
1. Go to https://app.inngest.com
2. Select your function
3. Check "Recent Errors" tab
4. Look for "Signature validation failed" or similar

**Step 5: Check Clock Skew**
```bash
# If you see timestamp-based errors, verify server time is correct
# Production should use NTP for accurate time
date -u
# Should match current UTC time (within 1 second)
```

### Recovery Procedure

If Inngest webhooks are failing:

1. **Check INNGEST_SIGNING_KEY is correct:**
   ```bash
   # Compare the key in your environment vs Inngest dashboard
   # Settings → Signing Keys
   ```

2. **Remove redundant validation:**
   - Delete any header presence checks before `serve()`
   - Let `serve()` handle all signature validation
   - Example: Don't check for `x-inngest-signature` manually

3. **Verify in development first:**
   ```bash
   npm run dev
   # Inngest Dev Server UI should work at http://localhost:3000/api/inngest
   # If it doesn't, check console for errors
   ```

4. **Deploy and monitor:**
   ```bash
   git push origin preview
   # Watch Sentry for alert resolution
   # Verify with Axiom: Check /api/inngest requests have 200/201 status
   ```

### Expected Metrics After Fix

✅ **Before Fix:**
- 150-200 401 errors per hour
- Consistent failure rate across all IPs
- All from Inngest infrastructure IPs (198.212.45.x)

✅ **After Fix:**
- ~0 authentication failures (except legitimate signature failures)
- GET requests return 200 (function discovery)
- POST/PUT requests return 202 (job queued)
- Only real signature mismatches return 401

### Alert Tuning

**If getting false positives (legitimate requests with real 401s):**

1. Check if INNGEST_SIGNING_KEY was recently rotated
2. Verify no middleware is modifying request bodies
3. Check if clock skew exists (more than 5 minutes difference)
4. Consider increasing threshold from 20 → 50 errors/10min

**If not getting alerted when you should:**

1. Verify Sentry is receiving Inngest logs
2. Check filter syntax matches your log format
3. Ensure message contains "inngest" (case-sensitive in APL)
4. Test with manual curl request to trigger the alert

---

| Alert | Priority | Threshold | Frequency | Action |
|-------|----------|-----------|-----------|--------|
| Production Access | 🔴 Critical | 1 event / 1 min | Immediate | Email, Slack, PagerDuty |
| Brute Force | 🟠 High | 10 events / 5 min | Every 5 min | Email, Slack |
| Rate Limit Violations | 🟡 Medium | 20 events / 15 min | Every 15 min | Email |
| Success Audit | ℹ️ Info | Daily summary | Daily | Log only |

---

## Recommended Integrations

### Slack Integration

1. Go to **Sentry** → **Settings** → **Integrations**
2. Enable **Slack** integration
3. Create channel: `#security-alerts`
4. Route alerts:
   - Critical → `#security-alerts` (with @here)
   - High → `#security-alerts`
   - Medium → `#dev-alerts`

### PagerDuty (Optional)

For 24/7 monitoring:
1. Create PagerDuty service: `dcyfr-labs-security`
2. Integrate with Sentry
3. Route **Critical** alerts only to PagerDuty

### Email

- Critical: Security team + CTO
- High: Security team
- Medium: Dev team daily digest
- Info: Audit log only

---

## Alert Configuration Summary

| Alert | Priority | Threshold | Frequency | Action |
|-------|----------|-----------|-----------|--------|
| Production Access | 🔴 Critical | 1 event / 1 min | Immediate | Email, Slack, PagerDuty |
| Brute Force | 🟠 High | 10 events / 5 min | Every 5 min | Email, Slack |
| Rate Limit Violations | 🟡 Medium | 20 events / 15 min | Every 15 min | Email |
| **Inngest Auth Failures** | **🟠 High** | **20 events / 10 min** | **Every 10 min** | **Email, Slack** |
| Success Audit | ℹ️ Info | Daily summary | Daily | Log only |

---

## Axiom + Sentry Combined Strategy

**Axiom:** Real-time monitoring, detailed analysis, IP tracking
**Sentry:** Automated alerting, incident management, error tracking

**Best Practice:**
1. **Sentry** alerts you to the problem
2. **Axiom** helps you investigate the details
3. **Together** they provide complete security visibility

**Example Workflow:**
1. 🔔 Sentry alert: "Brute force attack detected"
2. 🔍 Jump to Axiom dashboard
3. 📊 Query for attacking IPs: `event:"admin_access" AND result:"denied"`
4. 🛡️ Take action: Block IPs, rotate keys, etc.

---

## Next Steps

1. ✅ Implement Sentry config updates (Step 6 or 7)
2. ✅ Create all 4 alert rules in Sentry
3. ✅ Test alerts with development environment
4. ✅ Configure Slack integration
5. ✅ Document incident response procedures
6. ✅ Schedule monthly alert review

---

## Resources

- [Sentry Alerts Documentation](https://docs.sentry.io/product/alerts/)
- [Axiom Query Syntax](https://axiom.co/docs/query-data/queries)
- [Security Audit Summary](./security-audit-summary-2025-12-11)
- [Red Team Engagement Plan](./red-team-engagement-plan)

---

**Prepared By:** Claude Sonnet 4.5 (Security Specialist)
**Status:** Ready for implementation
**Last Updated:** December 11, 2025
