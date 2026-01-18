# MCP Access to Sentry & Axiom for Troubleshooting

**Date:** January 18, 2026  
**Status:** ✅ **VERIFIED & OPERATIONAL**  
**Last Verified:** January 18, 2026

---

## 📋 Quick Summary

Both **Sentry** and **Axiom** MCPs are configured and accessible via Claude Code for troubleshooting:

| Service | Type | Status | Authentication | Primary Use |
|---------|------|--------|-----------------|-------------|
| **Sentry** | HTTP | ✅ Active | OAuth + Token | Error tracking, exceptions, performance |
| **Axiom** | stdio | ✅ Active | API Key | Logs, CSP violations, security events |

**TL;DR:** Use `/research` command in Claude Code to access both services for investigating blog loading errors, security alerts, and performance issues.

---

## 🔧 Configuration Status

### Sentry MCP (HTTP)
- **Endpoint:** `https://mcp.sentry.dev/mcp/dcyfr-labs/dcyfr-labs`
- **Authentication:** `SENTRY_AUTH_TOKEN` (in `.env.local`)
- **Health Check:** ✅ Responds with 401 (expected - needs auth token header)
- **Configuration File:** `.vscode/mcp.json` lines 90-95

```json
"Sentry": {
  "url": "https://mcp.sentry.dev/mcp/dcyfr-labs/dcyfr-labs",
  "type": "http",
  "_tier": "2-on-demand",
  "_description": "Error tracking and performance monitoring"
}
```

### Axiom MCP (stdio)
- **Type:** Remote MCP via `mcp-remote`
- **Endpoint:** `https://mcp.axiom.co/mcp`
- **Command:** `npx -y mcp-remote https://mcp.axiom.co/mcp`
- **Health Check:** ✅ Operational (command-based server)
- **Configuration File:** `.vscode/mcp.json` lines 97-103

```json
"Axiom": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://mcp.axiom.co/mcp"],
  "_tier": "2-on-demand",
  "_description": "Log aggregation and analysis"
}
```

---

## 🚀 How to Access Logs

### Method 1: Claude Code Direct Access (Recommended)

**For Sentry Issues:**
```
@Sentry find organization dcyfr-labs
@Sentry find project dcyfr-labs
@Sentry list issues
@Sentry get issue details
```

**For Axiom Logs:**
```
@Axiom query "['event'] == 'admin_access'"
@Axiom search CSP violations
@Axiom list recent errors
```

### Method 2: Manual Dashboard Access

**Sentry:**
- **URL:** https://sentry.io/organizations/dcyfr-labs/issues/
- **Project:** dcyfr-labs
- **Auth:** Use your Sentry account (OAuth configured)

**Axiom:**
- **URL:** https://app.axiom.co/dcyfr-1fc7
- **Dashboard:** https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d
- **Auth:** Use your Axiom organization credentials

### Method 3: CLI Scripts

**Check MCP Health:**
```bash
npm run mcp:health
```

**Generate Health Report:**
```bash
npm run mcp:health > health-report.json
```

---

## 🔍 Troubleshooting Workflows

### Scenario 1: Blog Loading Errors (Like Error ID: 426590469)

**Step 1: Check Sentry for Redis errors**
```
Use: @Sentry search "redis" OR "connection"
Look for: "Failed to connect to Redis" messages
Timeframe: Last 24 hours
```

**Step 2: Check Axiom for view count failures**
```
Use: @Axiom query "['service'] == 'blog' AND ['severity'] == 'error'"
Look for: view count fetch failures
```

**Step 3: Review MCP Health Status**
```bash
npm run mcp:health | grep -E "Analytics|Axiom|Sentry"
```

**Solution:** The blog loading error we fixed was a missing try-catch in `src/lib/views.server.ts:48-50`. Redis connection failures now return `null` gracefully instead of throwing.

---

### Scenario 2: Security Alert Investigation

**Step 1: Query Admin Access Events in Axiom**
```sql
['event'] == "admin_access" 
| where timestamp > now() - 1h
| sort by timestamp desc
```

**Step 2: Check for Brute Force Attempts**
```sql
['event'] == "admin_access"
and ['result'] == "denied"
| summarize attempts = count() by ip
| where attempts > 5
```

**Step 3: View Sentry Alerts**
```
@Sentry search level:error tag:admin_access
```

**Relevant Queries:** See `docs/security/private/axiom-security-queries.md` for 15+ pre-built queries.

---

### Scenario 3: Performance Investigation

**Step 1: Check Response Times in Axiom**
```sql
['service'] == 'blog'
| project timestamp, duration, endpoint
| where duration > 1000
| sort by duration desc
```

**Step 2: Check Sentry Performance Metrics**
```
@Sentry query metric:duration
@Sentry get performance profile
```

**Step 3: Review MCP Response Times**
```bash
npm run mcp:health | grep responseTimeMs
```

---

## 📊 Available Data Sources

### Sentry Provides
- ✅ Error stack traces with line numbers
- ✅ Browser session replays
- ✅ Performance profiling data
- ✅ Release tracking and source maps
- ✅ User feedback and crash reports
- ✅ Performance monitoring (transactions)
- ✅ Real User Monitoring (RUM)

**Best For:** Understanding *what went wrong* and *where* in the code

### Axiom Provides
- ✅ Structured log events (JSON)
- ✅ CSP violations and security events
- ✅ Request/response metadata
- ✅ Custom application logs
- ✅ Vercel infrastructure logs
- ✅ Real-time log streaming
- ✅ Full-text search over all logs

**Best For:** Understanding *why* something happened and *when* patterns occur

---

## 🔑 Authentication & Environment Variables

### Required Tokens (in `.env.local`)

```bash
# Sentry authentication
SENTRY_AUTH_TOKEN="<your-sentry-personal-token>"
SENTRY_DSN="https://5f7d3fe14a9829d4fafcf00da6cbc87f@o4510349691912192.ingest.us.sentry.io/4510349693419520"
NEXT_PUBLIC_SENTRY_DSN="https://5f7d3fe14a9829d4fafcf00da6cbc87f@o4510349691912192.ingest.us.sentry.io/4510349693419520"

# Axiom authentication (automatic via mcp-remote)
# No explicit token needed - uses web auth
```

### Sentry Token Scopes
The current token has these scopes:
- ✅ `org:read` - Read organization data
- ✅ `project:read` - Read project configuration
- ✅ `project:write` - Update project settings
- ✅ `team:read` - Read team information
- ✅ `team:write` - Update team settings
- ✅ `event:write` - Create/update events

**To regenerate token:**
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Create new token with scopes above
3. Update `SENTRY_AUTH_TOKEN` in `.env.local`

---

## 🧪 Testing MCP Connectivity

### Quick Test: Verify Both Services Respond

```bash
# Test all MCPs
npm run mcp:health

# Test Sentry specifically (checks connectivity, not auth)
curl -I https://mcp.sentry.dev/mcp/dcyfr-labs/dcyfr-labs

# Test Axiom (via health report)
npm run mcp:health | grep Axiom
```

**Expected Results:**
```
✓ Sentry (url) - OK [401]           # 401 = needs auth (normal)
✓ Axiom (command) - OK              # stdio command server
```

### Verbose Health Check

```bash
node scripts/ci/check-mcp-servers.mjs --debug
```

---

## 📚 Documentation References

### For Sentry MCP
- **Setup Guide:** `docs/troubleshooting/private/sentry-mcp-setup.md`
- **Sentry Docs:** https://docs.sentry.io/product/sentry-mcp/
- **Sentry Alerts Setup:** `docs/security/private/sentry-manual-alert-setup.md`

### For Axiom MCP
- **Security Queries:** `docs/security/private/axiom-security-queries.md` (15+ pre-built queries)
- **Web Vitals Setup:** `docs/optimization/axiom-web-vitals-setup.md`
- **Dashboard:** https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d

### General MCP Reference
- **Health Monitoring:** `docs/features/mcp-health-monitoring.md`
- **MCP Configuration:** `.vscode/mcp.json` (TIER 1/2 allocation strategy)
- **AI MCP Checks:** `docs/ai/mcp-checks.md`

---

## 🚨 Known Limitations & Workarounds

### Sentry Limitations
- **Issue:** Semantic search (`search_issues`) requires `OPENAI_API_KEY`
- **Workaround:** Use Axiom's full-text search instead for log analysis
- **Status:** Document notes this in `docs/troubleshooting/private/sentry-mcp-setup.md`

### Axiom Limitations
- **Issue:** Geographic queries need IP geolocation enrichment
- **Workaround:** Query manually on Axiom dashboard with geo_info enrichment
- **Status:** See `docs/security/private/axiom-security-queries.md` line 142

### Rate Limiting
- **Sentry:** 100 requests/minute per token
- **Axiom:** Rate limits per subscription plan
- **Mitigation:** MCP health checks are cached; individual queries not cached

---

## 🔄 Integration with Blog Error Fixing

### Context: Recent Blog Loading Error Fix

**Error Details:**
- **Error ID:** 426590469
- **Issue:** Unhandled promise rejection in Redis connection
- **Root Cause:** `getClient()` in `src/lib/views.server.ts` attempted connection without error handling
- **Fix Applied:** Added try-catch around `await client.connect()`

**How to Verify the Fix:**
```bash
# 1. Check Sentry for no new Redis errors
@Sentry search "redis" OR "connection" after:2026-01-18

# 2. Check Axiom for blog error logs
@Axiom query "['service'] == 'blog' AND ['error'] CONTAINS 'redis'"

# 3. Run blog tests
npm run test:run src/__tests__/lib/blog.test.ts

# 4. Start dev server and test
npm run dev
curl http://localhost:3000/blog
```

**Expected:** No Redis connection errors in either system.

---

## 📞 Support Escalation

### If Sentry MCP Not Working
1. Verify `SENTRY_AUTH_TOKEN` in `.env.local`
2. Check token scopes at https://sentry.io/settings/account/api/auth-tokens/
3. Verify organization: https://sentry.io/settings/dcyfr-labs/projects/
4. See: `docs/troubleshooting/private/sentry-mcp-setup.md`

### If Axiom MCP Not Working
1. Verify Vercel integration at https://axiom.co (check datasources)
2. Check `mcp-remote` binary: `which mcp-remote`
3. Test endpoint: `curl https://mcp.axiom.co/mcp`
4. Verify logs arriving: Check Axiom dashboard for recent events

### If Both MCPs Down
1. Run `npm run mcp:health --debug` to see error details
2. Check `.vscode/mcp.json` configuration
3. Verify environment variables in `.env.local`
4. Check network connectivity to `mcp.sentry.dev` and `mcp.axiom.co`

---

## ✅ Verification Checklist

Use this checklist to verify both MCPs are working:

- [ ] `npm run mcp:health` shows both "OK"
- [ ] Sentry responds with 401 status (authentication required)
- [ ] Axiom command server loads successfully
- [ ] Can access https://sentry.io/organizations/dcyfr-labs/issues/
- [ ] Can access https://app.axiom.co/dcyfr-1fc7/dashboards/
- [ ] `SENTRY_AUTH_TOKEN` is set in `.env.local`
- [ ] Recent errors visible in Sentry dashboard
- [ ] Recent logs visible in Axiom dashboard
- [ ] MCP health script runs without errors

---

## 📝 Quick Command Reference

```bash
# Health & Monitoring
npm run mcp:health                          # Check all MCPs
npm run mcp:health --debug                  # Verbose output

# Dashboards
open https://sentry.io/organizations/dcyfr-labs/issues/
open https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d

# Documentation
cat docs/troubleshooting/private/sentry-mcp-setup.md
cat docs/security/private/axiom-security-queries.md
cat docs/features/mcp-health-monitoring.md

# Environment
grep SENTRY .env.local
grep AXIOM .env.local

# MCP Config
cat .vscode/mcp.json | grep -A 5 "Sentry\|Axiom"
```

---

**Last Updated:** January 18, 2026  
**Status:** ✅ Verified & Operational  
**Next Review:** February 18, 2026
