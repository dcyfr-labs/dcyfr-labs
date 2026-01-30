<!-- TLP:CLEAR -->

# CSP Violation Monitoring Guide

**Implementation Date:** November 9, 2025  
**Status:** ✅ Production Ready

This guide explains how CSP (Content Security Policy) violations are monitored and tracked using Sentry.

---

## Overview

CSP violations are automatically captured and sent to Sentry for centralized monitoring, alerting, and trend analysis.

**Key Features:**
- ✅ Real-time violation tracking
- ✅ Rate limiting: 10 violations/minute per IP
- ✅ Privacy-compliant (no PII, anonymized URIs)
- ✅ Full metadata capture (directive, URI, source file, line/column)
- ✅ Graceful fallback if Sentry unavailable

---

## Architecture

### Data Flow

```
Browser detects CSP violation
    ↓
Browser sends violation report to /api/csp-report
    ↓
Middleware adds nonce to response
    ↓
API route validates and rate limits request
    ↓
Sentry.captureMessage() called with metadata
    ↓
Violation appears in Sentry dashboard
    ↓
Alerts triggered (if configured)
```

### Implementation Files

| File | Purpose |
|------|---------|
| `src/app/api/csp-report/route.ts` | CSP violation endpoint with Sentry integration |
| `sentry.server.config.ts` | Server-side Sentry configuration |
| `sentry.client.config.ts` | Client-side Sentry configuration |
| `src/middleware.ts` | CSP header injection with `report-uri` |
| `.env.local` | Sentry DSN and auth token |

---

## Setup

### 1. Sentry Configuration

**Required Environment Variables:**

```bash
# .env.local or Vercel environment variables
SENTRY_DSN=https://[key]@[orgid].ingest.sentry.io/[projectid]
SENTRY_AUTH_TOKEN=sntrys_[token]  # Optional, for source maps
```

See `/docs/platform/environment-variables.md` for complete setup instructions.

### 2. Vercel Integration (Recommended)

**For automatic source map uploads and seamless deployment:**

1. Install [Sentry Vercel Integration](https://vercel.com/integrations/sentry)
2. Link your Sentry project
3. Auth token automatically managed
4. Source maps uploaded on every deployment

**Without Vercel integration:**
- Add `SENTRY_DSN` to Vercel environment variables
- Add `SENTRY_AUTH_TOKEN` for source map uploads
- Manually trigger builds to upload source maps

### 3. Local Development

**For testing CSP violations locally:**

```bash
# Start dev server
npm run dev

# Visit a page and open DevTools Console
# Check for CSP violations (shown as errors)
```

**Note:** CSP violations in development are normal (HMR, dev tools). Production violations are what matter.

---

## Viewing Violations in Sentry

### Dashboard Access

1. Go to [sentry.io](https://sentry.io)
2. Navigate to your project
3. Click **Issues** in left sidebar
4. Filter by tag: `type:csp_violation`

### Issue Details

Each CSP violation includes:

**Tags:**
- `type: csp_violation`
- `directive: [violated-directive]` (e.g., `script-src`, `style-src`)
- `blocked_uri_type: inline` or `external`
- `environment: production` or `development`

**Contexts:**
```json
{
  "csp": {
    "violated-directive": "script-src 'self'",
    "blocked-uri": "https://evil.com/script.js",
    "document-uri": "https://yoursite.com/page",
    "source-file": "https://yoursite.com/script.js",
    "line-number": 42,
    "column-number": 10
  }
}
```

**Breadcrumbs:**
- Request IP (hashed for privacy)
- User agent
- Timestamp
- Rate limit status

---

## Setting Up Alerts

### Email Alerts (Basic)

1. Go to **Project Settings** → **Alerts**
2. Click **Create Alert Rule**
3. Select **Issues**
4. Add filter: `tags.type:csp_violation`
5. Set threshold (e.g., "more than 10 violations in 1 hour")
6. Add email notification

### Slack Alerts (Recommended)

1. Install [Sentry Slack Integration](https://sentry.io/integrations/slack/)
2. Create alert rule as above
3. Add Slack channel as notification destination
4. Customize message template

### Alert Examples

**High-priority alert (potential attack):**
- Trigger: More than 50 violations in 5 minutes
- Directive: `script-src` or `object-src`
- Action: Immediate investigation

**Medium-priority alert (configuration issue):**
- Trigger: More than 10 violations in 1 hour
- Directive: Any
- Action: Review CSP configuration

**Low-priority alert (tracking):**
- Trigger: Any new violation type
- Action: Log for analysis

---

## Interpreting Violations

### Common Violation Types

#### 1. External Script Blocked

```json
{
  "violated-directive": "script-src 'self'",
  "blocked-uri": "https://cdn.example.com/script.js"
}
```

**Meaning:** An external script tried to load but CSP blocked it.

**Actions:**
- ✅ Expected: Third-party script or browser extension
- ⚠️ Investigate: Unknown domain or suspicious pattern
- 🔧 Fix: Add domain to CSP allowlist if legitimate

#### 2. Inline Script Blocked

```json
{
  "violated-directive": "script-src 'self'",
  "blocked-uri": "inline"
}
```

**Meaning:** An inline `<script>` tag tried to execute without a nonce.

**Actions:**
- 🔧 Fix: Add `nonce={cspNonce}` to script tag
- 📝 Review: Check if script is necessary
- ⚠️ Investigate: Could be XSS attempt

#### 3. Eval/Function Blocked

```json
{
  "violated-directive": "script-src 'self'",
  "blocked-uri": "eval"
}
```

**Meaning:** Code tried to use `eval()` or `new Function()`.

**Actions:**
- ⚠️ High risk: `eval` is dangerous
- 🔧 Fix: Refactor to avoid `eval`
- 📝 Review: Check for malicious code injection

#### 4. Style Injection Blocked

```json
{
  "violated-directive": "style-src 'self'",
  "blocked-uri": "inline"
}
```

**Meaning:** Inline styles blocked (e.g., `style="..."` or `<style>` tag).

**Actions:**
- 🔧 Fix: Add `nonce={cspNonce}` to style tag
- 📝 Review: Move to CSS file if possible
- ✅ Expected: Some libraries inject styles

### Rate Limiting Violations

If you see many violations from the same IP:

1. Check if it's legitimate traffic
2. Verify rate limit isn't too aggressive
3. Consider blocking IP if suspicious
4. Review for potential DDoS

**Current limit:** 10 violations/minute per IP

---

## Privacy & Compliance

### What We Capture

✅ **Captured (Safe):**
- Violated directive (e.g., `script-src`)
- Blocked URI (anonymized, domain only)
- Source file (anonymized)
- Line/column number
- Environment (production/development)

❌ **Not Captured (PII):**
- User email/username
- Session tokens
- Query parameters with sensitive data
- Full URIs with personal data

### URI Anonymization

**Function:** `anonymizeUri()`

**Transforms:**
```typescript
// Before
"https://site.com/user/12345/profile?token=abc123"

// After
"https://site.com/[redacted]"
```

**Implementation:**
```typescript
function anonymizeUri(uri: string | undefined): string {
  if (!uri) return 'unknown';
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.hostname}/[redacted]`;
  } catch {
    return uri.split('?')[0]; // Remove query params
  }
}
```

---

## Troubleshooting

### No Violations Appearing

**Check:**
1. ✅ `SENTRY_DSN` set in environment variables
2. ✅ Sentry initialized (`sentry.server.config.ts` loaded)
3. ✅ CSP header includes `report-uri /api/csp-report`
4. ✅ No ad blocker blocking Sentry requests
5. ✅ Check browser DevTools for CSP errors

**Test manually:**
```bash
# Terminal
curl -X POST http://localhost:3000/api/csp-report \
  -H "Content-Type: application/csp-report" \
  -d '{
    "csp-report": {
      "violated-directive": "script-src",
      "blocked-uri": "https://evil.com/script.js",
      "document-uri": "http://localhost:3000/"
    }
  }'
```

### Too Many False Positives

**Common causes:**
1. Browser extensions (common, safe to ignore)
2. Development tools (HMR, React DevTools)
3. Third-party scripts (legitimate, add to allowlist)

**Solutions:**
- Filter by environment: `production` only
- Add known domains to CSP allowlist
- Adjust alert thresholds

### Rate Limiting Too Aggressive

**Current:** 10 violations/minute per IP

**If too low:**
```typescript
// src/app/api/csp-report/route.ts
const rateLimitResult = await rateLimit(identifier, {
  interval: 60 * 1000,     // 1 minute
  limit: 20,               // Increase from 10 → 20
  context: 'csp-report',
});
```

---

## Metrics & Analysis

### Key Metrics to Track

1. **Violation count by directive**
   - Which CSP directives are violated most?
   - Are `script-src` violations increasing?

2. **Violation count by URI**
   - Which external domains are blocked?
   - Are new domains appearing?

3. **Violation count over time**
   - Are violations increasing?
   - Spikes after deployments?

4. **Violation count by environment**
   - Production vs. development ratio
   - Expected: More in development

### Sentry Queries

**All CSP violations:**
```
tags.type:csp_violation
```

**Script violations only:**
```
tags.type:csp_violation tags.directive:script-src
```

**External resources blocked:**
```
tags.type:csp_violation tags.blocked_uri_type:external
```

**Production violations only:**
```
tags.type:csp_violation environment:production
```

---

## Next Steps

### Recommended Actions

1. **Set up alerts** - Email or Slack for high-priority violations
2. **Review baseline** - Check first week of data for patterns
3. **Adjust CSP** - Add legitimate domains to allowlist
4. **Document patterns** - Create runbook for common violations
5. **Regular reviews** - Weekly check of violation trends

### Optional Enhancements

- **Custom dashboard** - Create Sentry dashboard with violation graphs
- **Automated responses** - Auto-block IPs with high violation rates
- **Integration tests** - Add tests for CSP configuration
- **CSP Level 3** - Implement `'strict-dynamic'` for better security

---

## Reference

### Documentation
- [CSP Nonce Implementation](/docs/security/csp/nonce-implementation)
- [Environment Variables](/docs/platform/environment-variables)
- [Security Findings](/docs/security/findings-and-action-items)

### External Resources
- [Sentry CSP Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/filtering/#content-security-policy)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator Tool](https://csp-evaluator.withgoogle.com/)

---

**Last Updated:** November 9, 2025  
**Status:** ✅ Production Ready  
**Next Review:** December 9, 2025
