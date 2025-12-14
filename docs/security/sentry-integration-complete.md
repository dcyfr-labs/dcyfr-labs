# Sentry Security Alerts - Implementation Complete ✅

**Date:** December 11, 2025
**Status:** ✅ **READY FOR TESTING**
**Implementation Time:** ~30 minutes

---

## What Was Implemented

### 1. ✅ Direct Sentry Logging (Both Endpoints)

**Files Modified:**
- [src/app/api/analytics/route.ts](../../src/app/api/analytics/route.ts)
- [src/app/api/admin/api-usage/route.ts](../../src/app/api/admin/api-usage/route.ts)

**Changes:**
```typescript
import * as Sentry from "@sentry/nextjs";

// In logAccess() / logAdminAccess() functions:
// 1. Logs to console (for Axiom)
// 2. Sends to Sentry (for alerting)

if (status === "denied") {
  Sentry.captureMessage(`Admin access denied: ${reason}`, {
    level: "warning" or "error",
    tags: { endpoint, result, reason, environment },
    contexts: { admin_access: logData },
    fingerprint: [...],
  });
}

// CRITICAL: Production access attempts
if (process.env.VERCEL_ENV === "production") {
  Sentry.captureMessage("CRITICAL: Admin endpoint accessed in production!", {
    level: "error",
    tags: { critical: "true" },
    ...
  });
}
```

**Event Types Logged to Sentry:**
- ✅ Invalid or missing API key → **WARNING**
- ✅ Production environment blocked → **ERROR**
- ✅ Rate limit exceeded → **WARNING**
- ✅ Production access attempt → **ERROR** (CRITICAL)

**Success events:** Logged to Axiom only (no Sentry alert needed)

---

### 2. ✅ Axiom Security Queries (15 Pre-Built Queries)

**File Created:** [docs/security/AXIOM_SECURITY_QUERIES.md](./axiom-security-queries)

**Query Categories:**
- **Core Security:** Real-time monitoring, failed auth, brute force detection
- **Advanced Analysis:** Geographic anomalies, time-based patterns, user agent analysis
- **Audit & Compliance:** Success logs, retention, export queries

**Top Queries to Add to Your Dashboard:**

**Critical:**
1. **Production Access Attempts** (should be 0)
   ```sql
   ['event'] == "admin_access" and ['vercelEnv'] == "production"
   ```

2. **Brute Force Detection**
   ```sql
   ['event'] == "admin_access"
   and ['result'] == "denied"
   and ['reason'] == "invalid or missing API key"
   | summarize attempts = count() by ip
   | where attempts > 5
   ```

3. **Real-Time Admin Access**
   ```sql
   ['event'] == "admin_access"
   | sort by timestamp desc
   | limit 100
   ```

**Dashboard URL:** https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d

---

### 3. ✅ Automated Test Script

**File Created:** [scripts/test-security-alerts.sh](../../scripts/test-security-alerts.sh)

**Test Coverage:**
- ✅ Test 1: Invalid API Key (triggers Sentry warning)
- ✅ Test 2: Missing API Key (triggers Sentry warning)
- ✅ Test 3: Brute Force Attack (15 attempts → triggers HIGH alert)
- ✅ Test 4: Rate Limit Testing (triggers MEDIUM alert if >20)
- ✅ Test 5: Strict Rate Limit (1/min for admin endpoints)
- ✅ Test 6: Successful Access (Axiom only, no alert)
- ✅ Test 7: Multiple Endpoints (both analytics + admin)

**Usage:**
```bash
# Development testing
npm run dev  # In another terminal
./scripts/test-security-alerts.sh

# Preview/Production testing
./scripts/test-security-alerts.sh https://preview.dcyfr.ai

# Expected:
# - Sentry: 1-2 alerts triggered
# - Axiom: ~20 log events
# - Email/Slack: Notifications received
```

---

## Sentry Alert Configuration (Next Steps)

### Step 1: Go to Sentry Dashboard

1. Navigate to: https://sentry.io
2. Select project: `dcyfr-labs`
3. Click: **Alerts** → **Create Alert**

### Step 2: Create 4 Alert Rules

#### Alert 1: 🔴 CRITICAL - Production Access

**Configuration:**
- **Name:** `[CRITICAL] Production Admin Access Attempt`
- **When:** Event is captured
- **Conditions:**
  - Environment: `production`
  - Tags: `event_type` equals `admin_access_production`
  - OR Message contains: `"CRITICAL: Admin endpoint accessed"`
- **Threshold:** `1 event in 1 minute`
- **Frequency:** Immediately
- **Actions:** Email + Slack + PagerDuty (if configured)

**Fingerprint:** `admin_access_production`

---

#### Alert 2: 🟠 HIGH - Brute Force Attack

**Configuration:**
- **Name:** `[HIGH] Brute Force Attack - Admin Endpoints`
- **When:** Metric alert
- **Metric:** `count()`
- **Conditions:**
  - Message contains: `"Admin access denied"`
  - Tags: `reason` equals `"invalid or missing API key"`
- **Threshold:** `> 10 events in 5 minutes`
- **Frequency:** Every 5 minutes
- **Actions:** Email + Slack

**Note:** For IP-based grouping, use Axiom. Sentry alerts on volume.

---

#### Alert 3: 🟡 MEDIUM - Rate Limit Violations

**Configuration:**
- **Name:** `[MEDIUM] High Rate Limit Violations`
- **When:** Metric alert
- **Metric:** `count()`
- **Conditions:**
  - Message contains: `"Admin access denied"`
  - Tags: `reason` equals `"rate limit exceeded"`
- **Threshold:** `> 20 events in 15 minutes`
- **Frequency:** Every 15 minutes
- **Actions:** Email notification

---

#### Alert 4: ℹ️ INFO - Daily Admin Access Summary

**Configuration:**
- **Name:** `[INFO] Admin Access Daily Summary`
- **When:** Metric alert
- **Metric:** `count()`
- **Conditions:**
  - Tags: `event_type` equals `admin_access`
- **Threshold:** `> 0 events in 24 hours`
- **Frequency:** Daily at 00:00 UTC
- **Actions:** Email summary (optional)

**Purpose:** Audit trail, not critical alert

---

## Testing Instructions

### Quick Test (5 minutes)

**1. Start Development Server:**
```bash
npm run dev
```

**2. Run Test Script:**
```bash
./scripts/test-security-alerts.sh
```

**3. Verify Results:**

**Sentry (https://sentry.io):**
- Go to **Issues** tab
- Look for new issues:
  - `Admin access denied: invalid or missing API key` (17 events)
  - `Admin access denied: rate limit exceeded` (if applicable)
- Check issue details:
  - Tags: `endpoint`, `result`, `reason`
  - Context: `admin_access` with full log data

**Axiom (https://app.axiom.co):**
- Run query:
  ```sql
  ['event'] == "admin_access"
  | sort by timestamp desc
  | limit 50
  ```
- Verify ~20 events logged
- Check fields: `result`, `reason`, `ip`, `userAgent`

**Console/Vercel Logs:**
- Should see JSON structured logs
- Each denied access logged with reason

---

### Advanced Testing (15 minutes)

**Test Production Alert (Preview Environment Only!):**

**DO NOT TEST IN ACTUAL PRODUCTION!**

In preview environment, temporarily set:
```bash
# .env.local (preview only)
VERCEL_ENV=production
```

Run a single test:
```bash
curl https://preview.dcyfr.ai/api/analytics \
  -H "Authorization: Bearer test"
```

**Expected:**
- Sentry: CRITICAL alert triggered
- Message: "CRITICAL: Admin endpoint accessed in production"
- Your response: Verify it's just a test

**IMPORTANT:** Remove the env var after testing!

---

## Monitoring Setup

### Daily Routine

**Morning Check (5 min):**
1. Check Axiom dashboard: https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d
2. Run query: `['event'] == "admin_access" and ['result'] == "denied" | where timestamp > ago(24h)`
3. Review any denied access attempts
4. Check for patterns (same IP, unusual times)

**Weekly Review (15 min):**
1. Review all Sentry issues from past week
2. Check alert thresholds (too sensitive? too lenient?)
3. Update blocklist if needed
4. Review Axiom retention (30 days default)

**Monthly Audit (30 min):**
1. Export Axiom logs for compliance:
   ```sql
   ['event'] == "admin_access"
   | where timestamp > ago(30d)
   | project-away _sysTime
   ```
2. Review all successful admin access
3. Update security documentation
4. Test alert system (run test script)

---

## Slack Integration (Optional)

### Setup Slack Notifications

**1. Go to Sentry Settings:**
- Settings → Integrations → Slack
- Click **Add Workspace**
- Authorize Sentry

**2. Create Channel:**
- Create `#security-alerts` channel
- Add relevant team members

**3. Route Alerts:**
- Critical → `#security-alerts` (with @here)
- High → `#security-alerts`
- Medium → `#dev-alerts`

**4. Test:**
```bash
./scripts/test-security-alerts.sh
```

**Expected:** Slack message appears with alert details

---

## Axiom + Sentry Workflow

### Incident Response Example

**Scenario:** Sentry alert "Brute Force Attack Detected"

**Step-by-Step:**

1. **Sentry Alert Received** 🔔
   - Email: "HIGH: Brute Force Attack - Admin Endpoints"
   - Slack: Alert in `#security-alerts`

2. **Initial Assessment** 🔍
   - Click Sentry link
   - Review issue: 15 events, "invalid or missing API key"
   - Note: Multiple events from recent timestamp

3. **Deep Dive in Axiom** 📊
   - Go to Axiom dashboard
   - Run query:
     ```sql
     ['event'] == "admin_access"
     and ['result'] == "denied"
     and timestamp > ago(1h)
     | summarize attempts = count() by ip
     | sort by attempts desc
     ```
   - Identify attacking IP: `192.168.1.100` (50 attempts)

4. **Verify Attack Pattern** 🎯
   - Check user agent: `curl/7.68.0` (automated tool)
   - Check timing: Rapid succession (1 req/sec)
   - Check geographic location: Foreign country (unexpected)

5. **Take Action** 🛡️
   - Block IP via Vercel WAF or firewall
   - Check if any attempts succeeded (run success query)
   - Verify API key not compromised
   - Monitor for 1 hour

6. **Document & Close** 📝
   - Log incident in security tracker
   - Update blocklist documentation
   - Review: Was alert threshold appropriate?
   - Close Sentry issue

---

## Troubleshooting

### Issue: Sentry Not Receiving Events

**Check:**
1. Sentry DSN configured: `NEXT_PUBLIC_SENTRY_DSN`
2. Sentry initialized: Check `sentry.client.config.ts`
3. Build successful: `npm run build`
4. Test locally: `./scripts/test-security-alerts.sh`
5. Check Sentry project: https://sentry.io

**Debug:**
```typescript
// Add to logging function temporarily
console.log("Sending to Sentry:", logData);
Sentry.captureMessage(...);
console.log("Sentry message sent");
```

---

### Issue: Axiom Not Showing Logs

**Check:**
1. Vercel → Axiom integration active
2. Logs enabled in Vercel project
3. Console.log working: Check Vercel logs
4. Axiom dataset: `dcyfr-1fc7`
5. Query syntax correct

**Debug:**
```bash
# Check Vercel logs directly
vercel logs --follow

# Look for JSON structured logs
# Example: {"event":"admin_access",...}
```

---

### Issue: Alerts Not Triggering

**Check:**
1. Alert rules created in Sentry
2. Thresholds correct (not too high)
3. Environment filter not too restrictive
4. Email/Slack integration configured
5. Test script generates enough events

**Debug:**
```bash
# Generate many events to trigger alert
for i in {1..20}; do
  curl http://localhost:3000/api/analytics \
    -H "Authorization: Bearer invalid"
done
```

---

## Files Created/Modified

### New Files ✅
1. [docs/security/SENTRY_ALERTS_SETUP.md](./sentry-alerts-setup) - Complete setup guide
2. [docs/security/AXIOM_SECURITY_QUERIES.md](./axiom-security-queries) - 15 pre-built queries
3. [docs/security/SENTRY_INTEGRATION_COMPLETE.md](./sentry-integration-complete) - This document
4. [scripts/test-security-alerts.sh](../../scripts/test-security-alerts.sh) - Automated test script

### Modified Files ✅
5. [src/app/api/analytics/route.ts](../../src/app/api/analytics/route.ts) - Added Sentry logging
6. [src/app/api/admin/api-usage/route.ts](../../src/app/api/admin/api-usage/route.ts) - Added Sentry logging

---

## Next Steps

### Immediate (Today)

1. ✅ **Run Test Script:**
   ```bash
   npm run dev
   ./scripts/test-security-alerts.sh
   ```

2. ✅ **Verify Sentry Receives Events:**
   - Check https://sentry.io → Issues
   - Should see "Admin access denied" events

3. ✅ **Create 4 Alert Rules in Sentry:**
   - Follow "Sentry Alert Configuration" section above
   - Test each alert with appropriate trigger

4. ✅ **Add Axiom Queries to Dashboard:**
   - Pick 5-7 queries from AXIOM_SECURITY_QUERIES.md
   - Add to your dashboard: https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d

5. ✅ **Configure Slack (Optional):**
   - Set up Slack integration
   - Test with script

### Short-Term (This Week)

6. ⏳ **Monitor for 1 Week:**
   - Review Sentry issues daily
   - Check Axiom logs
   - Adjust alert thresholds if needed

7. ⏳ **Document Response Procedures:**
   - Update incident response playbook
   - Add to team runbook

8. ⏳ **Train Team:**
   - Walk through Axiom queries
   - Show Sentry alert workflow
   - Practice incident response

---

## Success Criteria

**✅ Implementation Complete When:**
- [x] Sentry logging added to both endpoints
- [x] Test script created and executable
- [x] Build successful with no errors
- [x] Documentation complete

**✅ Testing Complete When:**
- [ ] Test script runs successfully
- [ ] Sentry receives test events
- [ ] Axiom shows structured logs
- [ ] 4 alert rules created in Sentry
- [ ] At least 1 alert triggers during testing

**✅ Production Ready When:**
- [ ] All alerts tested and verified
- [ ] Slack integration configured (if wanted)
- [ ] Team trained on response procedures
- [ ] Monitoring dashboard finalized
- [ ] 1 week of monitoring with no issues

---

## Summary

**What You Have Now:**

✅ **Dual Logging System:**
- Console logs → Axiom (detailed analysis)
- Sentry events → Alerts (automated response)

✅ **15 Pre-Built Axiom Queries:**
- Real-time monitoring
- Brute force detection
- Geographic analysis
- Audit trails

✅ **Automated Testing:**
- 7 comprehensive test scenarios
- Easy to run and repeat
- Validates entire stack

✅ **Complete Documentation:**
- Setup guides (Sentry, Axiom)
- Alert configuration instructions
- Incident response workflows
- Troubleshooting procedures

**Security Posture:**
- **Before:** Good logging, manual analysis required
- **After:** Automated alerts + deep analysis capabilities
- **Result:** Enterprise-grade security monitoring

---

**Status:** ✅ **READY FOR TESTING & DEPLOYMENT**

**Next Action:** Run `./scripts/test-security-alerts.sh` and create Sentry alert rules

---

**Prepared By:** Claude Sonnet 4.5
**Date:** December 11, 2025
**Version:** 1.0
