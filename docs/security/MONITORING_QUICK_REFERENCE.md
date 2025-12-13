# Security Monitoring - Quick Reference

**Status:** ✅ Active
**Last Updated:** December 12, 2025

---

## 📊 Daily Monitoring Checklist

### Automated Tests (6:00 PM MT Daily)

- [ ] Check Inngest dashboard for successful run
- [ ] Verify Sentry received ~19 events
- [ ] Confirm Axiom shows 29 new logs
- [ ] Check email for 1 brute force alert

---

## 🔗 Quick Links

| Service | Dashboard | Purpose |
|---------|-----------|---------|
| **Inngest** | https://app.inngest.com | Automated test execution |
| **Sentry** | https://sentry.io | Security event alerts |
| **Axiom** | https://app.axiom.co | Structured log analysis |
| **Vercel** | https://vercel.com | Production logs |

---

## 🔍 Key Queries

### Sentry

**Recent Security Events:**
```
is:unresolved message:"Admin access denied"
```

**Brute Force Alerts:**
```
is:unresolved level:warning message:"Admin access denied"
```

### Axiom

**Last 50 Security Events:**
```apl
['event'] == "admin_access"
| sort by timestamp desc
| limit 50
```

**Brute Force Detection:**
```apl
['event'] == "admin_access"
and ['reason'] == "invalid or missing API key"
| summarize count() by ip
| where count > 10
```

**Hourly Rate Trends:**
```apl
['event'] == "admin_access"
| summarize count() by bin_auto(timestamp)
| sort by timestamp desc
```

---

## 📈 Expected Metrics

### Daily Baseline (Automated Tests)

| Metric | Expected Value | Source |
|--------|---------------|--------|
| Total API Requests | 29 | Inngest |
| Sentry Events | ~19 | Sentry Issues |
| Sentry Alerts | 1 | Email/Sentry |
| Axiom Logs | 29 | Axiom Dashboard |
| Failed Auth Attempts | 18 | Both |

### Weekly Baseline

| Metric | Expected Value |
|--------|---------------|
| Total Events | ~133 (19 × 7) |
| Unique IPs | 1-3 (Inngest + manual) |
| Alert Emails | 7 (1 per day) |

---

## ⚠️ Alert Thresholds

### Sentry Alerts Configured

1. **🟠 Brute Force Alert**
   - Trigger: >10 failed auth attempts
   - Frequency: At most once every 30 minutes
   - Expected: 1/day from automated tests

2. **🔴 Production Access** (if configured)
   - Trigger: Message contains "production"
   - Frequency: Immediate
   - Expected: 0 (should never fire)

### When to Investigate

**🚨 Critical - Immediate Action:**
- Production access alert fires
- >50 failed auth attempts in 1 hour (not from Inngest)
- Unknown IP addresses in brute force attempts
- Sentry shows >100 events in 1 day

**⚠️ Warning - Review within 24h:**
- Automated tests fail to run
- Sentry alerts don't fire for 2+ days
- Axiom logs missing for >6 hours
- Rate limit violations from unknown sources

**ℹ️ Info - Normal:**
- Daily brute force alert at ~6 PM MT
- ~19 events per day from known IPs
- Consistent patterns in Axiom logs

---

## 🛠️ Quick Troubleshooting

### No Daily Tests Running

```bash
# Check Inngest function status
# → https://app.inngest.com → Functions → daily-security-test

# Verify function is deployed
grep -r "dailySecurityTest" src/app/api/inngest/route.ts

# Check cron schedule
# Should show: { cron: "0 1 * * *" }
```

### No Sentry Events

```bash
# Verify DSN is configured
grep "^SENTRY_DSN" .env.local

# Check Sentry is enabled
grep "enabled:" sentry.server.config.ts

# Test manually
curl -H "x-internal-request: true" \
     -H "Authorization: Bearer test" \
     https://your-domain.com/api/analytics
```

### No Axiom Logs

```bash
# Check Vercel integration
# → https://vercel.com → Project → Integrations → Axiom

# Verify structured logging
grep -A 5 "console.log(JSON.stringify" src/app/api/analytics/route.ts

# Test in dev
npm run dev
# Make request and check server logs
```

---

## 📅 Scheduled Events

### Daily (Automated)

| Time | Event | Description |
|------|-------|-------------|
| 6:00 PM MT | Security Tests | Inngest automated test suite |
| 6:01 PM MT | Sentry Alert | Brute force detection email |

### Weekly (Manual Review)

| Day | Task | Duration |
|-----|------|----------|
| Monday | Review Sentry issues | 5 min |
| Friday | Check Axiom trends | 10 min |

### Validation Period

| Milestone | Date | Action |
|-----------|------|--------|
| Start | Dec 12, 2025 | Monitoring begins |
| Mid-point | Dec 16, 2025 | Review alert tuning |
| End | Dec 20, 2025 | Tests auto-stop |
| Cleanup | Dec 21, 2025 | Disable/remove function |

---

## 📖 Detailed Documentation

| Topic | File |
|-------|------|
| **Daily Test Schedule** | [DAILY_SECURITY_TEST_SCHEDULE.md](./daily-security-test-schedule) |
| **Sentry Setup** | [SENTRY_MANUAL_ALERT_SETUP.md](./sentry-manual-alert-setup) |
| **Axiom Queries** | [AXIOM_SECURITY_QUERIES.md](./axiom-security-queries) |
| **Security Audit** | [SECURITY_AUDIT_SUMMARY_2025-12-11.md](./security-audit-summary-2025-12-11) |
| **Implementation** | [SECURITY_FIXES_2025-12-11.md](./security-fixes-2025-12-11) |
| **Completion Status** | [COMPLETION_STATUS_2025-12-12.md](./completion-status-2025-12-12) |

---

## 🎯 Success Criteria

By December 20, 2025, you should have:

- ✅ 8 successful automated test runs (one per day)
- ✅ ~152 Sentry events (19 × 8)
- ✅ 8 brute force alert emails received
- ✅ Consistent Axiom log patterns
- ✅ Zero false positives or missed alerts
- ✅ Confidence in security monitoring

**Current Security Rating:** A+ (Excellent)
**Monitoring Status:** Active and Validated
