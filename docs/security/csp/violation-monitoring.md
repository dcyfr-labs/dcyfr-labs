# CSP Violation Monitoring - Quick Reference

**Last Updated:** October 24, 2025

---

## Overview

Content Security Policy (CSP) violation monitoring helps detect:
- ✅ XSS attack attempts
- ✅ Misconfigured CSP directives
- ✅ Browser extension interference
- ✅ Third-party script issues

---

## Endpoint

**URL:** `/api/csp-report`
**Method:** POST only
**Rate Limit:** 30 reports/minute per IP
**Status:** ✅ Active

---

## Testing

### Quick Test
```bash
npm run test:csp-report
```

### Manual Test (curl)
```bash
curl -X POST http://localhost:3000/api/csp-report \
  -H "Content-Type: application/json" \
  -d '{
    "csp-report": {
      "document-uri": "https://www.dcyfr.ai/test",
      "violated-directive": "script-src '\''self'\''",
      "blocked-uri": "https://evil.com/script.js"
    }
  }'
```

### Browser Console Test
```javascript
// Inject inline script (should be blocked and reported)
document.body.innerHTML += '<script>alert("test")</script>';

// Check Network tab for POST to /api/csp-report
```

---

## Viewing Reports

### Vercel Logs
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select project → **Logs**
3. Filter: `CSP Violation Report`

### Console Output (Development)
```bash
npm run dev
# Violations appear in terminal
```

---

## Common Violations

### 1. Inline Script (Attack or Bug)
```json
{
  "violatedDirective": "script-src 'self' 'nonce-abc'",
  "blockedUri": "inline",
  "disposition": "enforce"
}
```
**Meaning:** Inline script without nonce was blocked  
**Action:** If expected, add nonce. If unexpected, investigate XSS attempt.

### 2. External Script (Attack)
```json
{
  "violatedDirective": "script-src 'self'",
  "blockedUri": "https://malicious.com/script.js"
}
```
**Meaning:** External script from non-whitelisted domain blocked  
**Action:** Check if site was compromised. Review logs for injection point.

### 3. Browser Extension (False Positive)
```json
{
  "blockedUri": "chrome-extension://abcdefg/script.js"
}
```
**Meaning:** User's browser extension tried to inject script  
**Action:** Ignore - expected behavior, not a security issue.

### 4. Google Fonts (Misconfiguration)
```json
{
  "violatedDirective": "font-src 'self'",
  "blockedUri": "https://fonts.gstatic.com/..."
}
```
**Meaning:** CSP missing allowed font domain  
**Action:** Update CSP to include `https://fonts.gstatic.com` in `font-src`.

---

## Report Fields

| Field | Description | Example |
|-------|-------------|---------|
| `document-uri` | Page where violation occurred | `https://www.dcyfr.ai/blog/post` |
| `violated-directive` | CSP directive that was violated | `script-src 'self' 'nonce-abc'` |
| `effective-directive` | Specific directive enforced | `script-src` |
| `blocked-uri` | Resource that was blocked | `https://evil.com/script.js` or `inline` |
| `source-file` | File containing violation | `https://www.dcyfr.ai/page` |
| `line-number` | Line in source file | `42` |
| `column-number` | Column in source file | `13` |
| `disposition` | `enforce` or `report` | `enforce` |

---

## Privacy & Anonymization

**Automatically Removed:**
- ❌ Query parameters (`?token=secret`)
- ❌ Hash fragments (`#section`)
- ❌ User data in URIs

**Example:**
```
Input:  https://www.dcyfr.ai/page?token=abc123#section
Output: https://www.dcyfr.ai/page
```

---

## Rate Limiting

**Limits:**
- **30 reports per minute** per IP address
- **Distributed** (Redis-backed in production)
- **Fallback** (in-memory for development)

**When Rate Limited:**
```json
{
  "error": "Too many reports",
  "status": 429
}
```

**Headers:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 60
```

---

## Troubleshooting

### No Reports Appearing

**Check:**
1. CSP header includes `report-uri /api/csp-report`
2. Middleware is running (`src/middleware.ts`)
3. Browser is actually blocking something (check Console)
4. Report endpoint is reachable (not rate limited)

**Verify CSP:**
```bash
curl -I http://localhost:3000 | grep -i content-security-policy
# Should see: report-uri /api/csp-report
```

### Too Many Reports

**Possible Causes:**
- Browser extensions (normal, ignore)
- Misconfigured CSP (fix directive)
- Actual attack (investigate)
- Bot traffic (rate limiting will help)

**Filter Out Extensions:**
```typescript
// In src/app/api/csp-report/route.ts
if (cspReport["blocked-uri"]?.includes("chrome-extension://")) {
  return NextResponse.json({ success: true });
}
```

### Rate Limit Too Strict

**Adjust Limit:**
```typescript
// src/app/api/csp-report/route.ts
const rateLimitResult = await rateLimit(clientIp, {
  limit: 60,  // Increase from 30
  windowInSeconds: 60,
});
```

---

## Integration

### Sentry (Optional)

**Install:**
```bash
npm install @sentry/nextjs
```

**Configure:**
```typescript
// src/app/api/csp-report/route.ts
import * as Sentry from "@sentry/nextjs";

// After logging violation
Sentry.captureMessage('CSP Violation', {
  level: 'warning',
  extra: violationData,
  tags: {
    violatedDirective: cspReport["violated-directive"],
    blockedUri: anonymizeUri(cspReport["blocked-uri"]),
  }
});
```

### Custom Monitoring Service

**Send to External Endpoint:**
```typescript
// src/app/api/csp-report/route.ts
await fetch('https://your-monitoring.com/csp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(violationData),
});
```

---

## Metrics to Track

### Weekly Review
- **Total violations:** Trend up/down?
- **Unique blocked URIs:** New domains?
- **Most violated pages:** CSP too strict?
- **False positives:** Extensions, etc.

### Monthly Review
- **Attack attempts:** Real threats detected?
- **CSP effectiveness:** Blocking expected threats?
- **Policy adjustments:** Need to relax/tighten?

---

## Commands

```bash
# Test CSP reporting endpoint
npm run test:csp-report

# Check CSP header in development
curl -I http://localhost:3000 | grep CSP

# Check CSP header in production
curl -I https://www.dcyfr.ai | grep CSP

# View Vercel logs
vercel logs --follow

# Test rate limiting
for i in {1..35}; do 
  curl -X POST http://localhost:3000/api/csp-report \
    -H "Content-Type: application/json" \
    -d '{"csp-report": {}}'; 
done
```

---

## Files

| File | Purpose |
|------|---------|
| `src/app/api/csp-report/route.ts` | API endpoint |
| `src/middleware.ts` | CSP header with report-uri |
| `scripts/test-csp-report.mjs` | Test script |
| `docs/security/security-status.md` | Full documentation |

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Monitor logs for first week
3. ⏳ Review false-positive rate
4. ⏳ Adjust CSP if needed
5. ⏳ Consider Sentry integration
6. ⏳ Set up alerting for anomalies

---

**Quick Links:**
- [Full Security Status](/docs/security/security-status.md)
- [CSP Nonce Implementation](/docs/security/csp/nonce-implementation.md)
- [Rate Limiting Guide](/docs/security/rate-limiting/guide.md)
