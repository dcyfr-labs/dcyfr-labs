# Inngest Troubleshooting Flowchart

## Visual Decision Tree for Debugging

```
                            Inngest Function Failed?
                                    |
                    ┌───────────────┴──────────────┐
                    |                              |
         Is it a scheduled function?      Is it an event-triggered function?
         (cron job)                       (contact form, webhook, etc.)
                    |                              |
            YES ────┴──── NO                       |
            |       |                              |
            |       └─ contact-form-submitted    Check event payload
            |          github-data.refresh    (Is data complete?)
            |          trending calculation        |
            |          security monitor       ┌────┴────┐
            |                                 │          │
            |                           YES ──┘          └─ NO
            |                            |                  |
            |                      Skip error         Payload incomplete
            |                    handling check        Add validation
            |                            |
            ▼                            ▼
        Redis connected?          External API responding?
            |                      (GitHub, Google, Resend, etc.)
       ┌────┴────┐                    |
      YES        NO             ┌─────┴─────┐
       |         |            YES            NO
       |      Check:           |             |
       |    • REDIS_URL env    API works    API unavailable
       |    • Connection string Check:      Check:
       |    • Redis instance    • API key   • API status
       |    • Network access    • Rate limit • Key validity
       |    • Firewall         • Timeout    • Network
       |                           |         |
       ▼                           ▼         ▼
    Function executes          Function     Circuit break
    Check logs for:            succeeds     (add fallback)
    • Timeout errors              |
    • Connection pool          Skip this
    • Latency issues           issue
                                   |
                                   ▼
                            Function failed → Debug root cause
                            (See investigation report)
```

---

## Troubleshooting by Function

### `calculate-trending` Failure Flow

```
calculate-trending failed?
    ↓
Step 1: "fetch-post-data" failed?
    ├─ YES → Redis not available
    │        └─ Check REDIS_URL, verify cloud instance online
    └─ NO  → Step 2
        ↓
Step 2: "calculate-scores" failed?
    ├─ YES → Logic error
    │        └─ Check post data format
    └─ NO  → Step 3
        ↓
Step 3: "store-trending" failed?
    ├─ YES → Redis write failed
    │        └─ Check Redis memory, connection
    └─ NO  → Unexpected (check logs)
```

### `refresh-github-data` Failure Flow

```
refresh-github-data failed?
    ↓
Is GITHUB_TOKEN set?
    ├─ NO  → Rate limited (60 req/hour)
    │        └─ Set GITHUB_TOKEN in .env
    └─ YES → Continue
        ↓
GitHub API responding?
    ├─ NO  → GitHub outage or network issue
    │        └─ Check GitHub status page
    └─ YES → Possible auth error
        ↓
Is GITHUB_TOKEN valid?
    ├─ NO  → Regenerate token on github.com/settings/tokens
    └─ YES → Cache write failed
        ↓
Redis available?
    ├─ NO  → See calculate-trending flow
    └─ YES → Unexpected (check logs)
```

### `security-advisory-monitor` Failure Flow

```
security-advisory-monitor failed?
    ↓
GHSA API responding? (api.github.com)
    ├─ NO  → Network/DNS issue
    │        └─ Test: curl -I https://api.github.com/
    └─ YES → Parsing error
        ↓
Any monitored packages detected as vulnerable?
    ├─ YES → Email notification needed?
    │  ├─ RESEND_API_KEY set?
    │  │   ├─ NO  → Email skipped (silent failure)
    │  │   └─ YES → Verify API key valid
    │  └─ Check detection logic
    └─ NO  → Function succeeds
```

---

## Error Message Decoder

### What You'll See in Inngest Dashboard

| Message | Meaning | Fix |
|---------|---------|-----|
| `redis-not-configured` | Redis URL not set or connection failed | Check REDIS_URL env var, verify cloud instance |
| `GHSA API error: 429` | Rate limited | Add GitHub token or wait 1 hour |
| `GHSA API error: 422` | Validation or anti-spam (endpoint may have rejected the request) | Log response body, avoid aggressive retries, add small delays between package requests and consider adding a GITHUB_TOKEN |
| `GHSA API error: 500` | GitHub API issue | Wait and retry, check status page |
| `Failed to connect` | Connection timeout (too short) | Increase timeout from 5s to 10s |
| `Max retries exceeded` | Too many retry attempts | Reduce retry count or fix root cause |
| `Error: socket hang up` | Connection dropped mid-request | Redis connectivity issue |

---

## Monitoring Commands

### Check Redis Connection Status

```bash
# If you have redis-cli installed
redis-cli -u $REDIS_URL ping
# Should respond: PONG

# Check latency
redis-cli -u $REDIS_URL --latency-samples 5 latency latest
# Should be < 50ms
```

### Monitor Inngest Runs

```bash
# View all failed runs (via curl)
curl -s https://api.inngest.com/v1/runs?status=failed \
  -H "Authorization: Bearer $INNGEST_EVENT_KEY" | jq '.data[] | {id, function, status, createdAt}'

# View specific function runs
curl -s https://api.inngest.com/v1/runs?functionId=calculate-trending \
  -H "Authorization: Bearer $INNGEST_EVENT_KEY" | jq '.data[-5:] | .[] | {id, status}'
```

### Check Function Logs

```bash
# Go to Inngest Dashboard
# Functions > [Function Name] > Recent Runs

# Click on any run to see:
# - Step-by-step execution
# - Console logs (console.log, console.error)
# - Error stack traces
# - Execution duration
```

---

## Performance Expectations

### Normal Execution Times

```
calculate-trending
├─ fetch-post-data:  200-500ms
├─ calculate-scores: 50-100ms
└─ store-trending:   300-800ms
Total: 1-2 seconds ✅

refresh-github-data
├─ fetch-contributions: 800-2000ms (GitHub API)
└─ cache-update:       200-500ms
Total: 2-3 seconds ✅

security-advisory-monitor
├─ fetch-ghsa-advisories: 5000-10000ms (iterates multiple packages)
└─ cache-update:        200-500ms
Total: 5-10 seconds ✅
```

### Red Flags (> 30 seconds)

- Network connectivity issues
- Redis connection pool exhaustion
- GitHub/external API slowness
- Firewall/DNS issues

---

## Common Solutions Quick Reference

| Problem | Solution | File | Line |
|---------|----------|------|------|
| Redis timeout | Increase `connectTimeout` 5000 → 10000 | `blog-functions.ts` | 19 |
| Not enough retries | Increase `retries: > 3` → `> 5` | `blog-functions.ts` | 20 |
| API fails silently | Add `throw new Error()` | `security-functions.ts` | 117 |
| Retry queue builds | Add `retries: 1` to config | `github-functions.ts` | 165 |
| No fallback behavior | Add graceful degradation check | All functions | var |

---

## Interactive Debugging Steps

### Step 1: Verify Configuration
```typescript
// In any Inngest function, add this:
console.log("Configuration Check", {
  REDIS_URL: process.env.REDIS_URL ? "✅" : "❌",
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ? "✅" : "❌",
  GOOGLE_API_KEY: process.env.GOOGLE_INDEXING_API_KEY ? "✅" : "❌",
  RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅" : "❌",
});
```

### Step 2: Check Redis Connection
```typescript
const redis = await getRedisClient();
if (!redis) {
  console.error("❌ Redis connection failed");
  console.log("REDIS_URL:", process.env.REDIS_URL ? "set" : "not set");
  return; // Early exit for debugging
}
console.log("✅ Redis connected");
```

### Step 3: Monitor External API Calls
```typescript
const startTime = Date.now();
try {
  const response = await fetch(apiUrl);
  const duration = Date.now() - startTime;
  console.log(`API call took ${duration}ms`, {
    url: apiUrl,
    status: response.status,
    ok: response.ok,
  });
} catch (error) {
  const duration = Date.now() - startTime;
  console.error(`API call failed after ${duration}ms`, {
    error: error.message,
  });
}
```

---

## When to Escalate

Escalate to infrastructure team if:

1. **Redis Cloud** shows connection issues
   - Contact Redis support
   - Check cloud provider status
   - Review network ACLs

2. **GitHub API** consistently returns 5xx
   - Check GitHub status page
   - This is not your fault

3. **Vercel/Google API** frequently timeout
   - Contact respective support teams
   - May indicate quota limit reached

4. **Inngest Cloud** shows webhook failures
   - Verify webhook URL is correct
   - Check firewall/security rules
   - Verify signing key is valid

---

## Health Check Commands

### Daily Checklist

```bash
# 1. Check failed run count
# Go to: https://app.inngest.com/ > Runs > Status: Failed
# Should be: 0 or very low

# 2. Check function execution times
# Recent runs should complete in < 10 seconds
# Trending should be < 5 seconds

# 3. Verify trending posts update
# Check blog homepage
# Trending list should change hourly

# 4. Check Axiom logs
# Search for: function:calculate-trending | filter status != "success"
# Should be: empty or very few results
```

---

**Last Updated:** December 10, 2025  
**Version:** 1.0
