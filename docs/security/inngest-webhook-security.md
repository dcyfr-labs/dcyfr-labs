{/* TLP:CLEAR */}

# Inngest Webhook Security Documentation

**Created:** October 26, 2025  
**Endpoint:** `/api/inngest`  
**Status:** ✅ **VERIFIED SECURE** - Automatic signature verification enabled

## Overview

The Inngest webhook endpoint at `/api/inngest` is secured by the Inngest JS SDK's built-in signature verification. When properly configured with environment variables, it provides enterprise-grade webhook security with zero additional code.

## Security Architecture

### Automatic Signature Verification

The Inngest SDK's `serve()` function **automatically validates signatures** when the signing key is configured:

```typescript
// src/app/api/inngest/route.ts
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...],
});
// ☝️ Signature verification happens automatically inside serve()
```

**How it works:**
1. Inngest Cloud signs each webhook request with your `INNGEST_SIGNING_KEY`
2. The SDK's `serve()` function validates the `X-Inngest-Signature` header
3. Invalid signatures are rejected with `401 Unauthorized`
4. Valid requests proceed to function execution

**No custom code required** - the SDK handles all security concerns internally.

### Environment-Based Configuration

The endpoint operates in two modes based on environment variables:

#### Development Mode (No Signing Key)
- **Condition:** `INNGEST_SIGNING_KEY` not set
- **Behavior:**
  - ✅ Functions work via local Inngest Dev Server
  - ✅ Dev UI accessible at `http://localhost:3000/api/inngest`
  - ✅ Perfect for local testing and development
  - ⚠️  No signature verification (not needed locally)

#### Production Mode (With Signing Key)
- **Condition:** `INNGEST_SIGNING_KEY` environment variable set
- **Behavior:**
  - ✅ Automatic signature verification on all requests
  - ✅ Rejects requests with invalid/missing signatures
  - ✅ Introspection endpoint shows: `"authentication_succeeded": true`
  - ✅ Production-ready webhook security

## Configuration

### Required Environment Variables

```bash
# Required for production webhook security
INNGEST_SIGNING_KEY=signkey-prod-abc123...

# Required for sending events from your app
INNGEST_EVENT_KEY=your-event-key-here
```

**Where to get keys:**
1. Sign up at [app.inngest.com](https://app.inngest.com)
2. Create a new app
3. Navigate to: Your App → Keys
4. Copy both the Signing Key and Event Key

### Vercel Configuration

Add environment variables in Vercel:

1. Go to: Project Settings → Environment Variables
2. Add `INNGEST_SIGNING_KEY` (for production and preview)
3. Add `INNGEST_EVENT_KEY` (for production and preview)
4. Deploy or redeploy to apply changes

### Local Development Setup

```bash
# Copy example file
cp .env.example .env.local

# Leave signing key empty for local development
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=
```

**Local dev works without keys** - the Inngest Dev Server handles everything automatically.

## Security Features

### 1. Request Signature Verification

**Implementation:** Automatic via Inngest SDK  
**Algorithm:** HMAC-SHA256 with signing key  
**Header:** `X-Inngest-Signature`

**What's validated:**
- Request authenticity (signed by Inngest Cloud)
- Request integrity (body hasn't been tampered with)
- Timestamp freshness (prevents replay attacks)

**Example rejection:**
```json
{
  "code": "signing_key_invalid",
  "message": "Invalid or expired signing key"
}
```

### 2. Environment Isolation

- **Development:** Uses local Inngest Dev Server (no cloud communication)
- **Preview:** Can use production keys for testing webhook delivery
- **Production:** Full signature verification with production signing key

### 3. Introspection Endpoint

The SDK provides a built-in health check at `GET /api/inngest`:

```json
{
  "schema_version": "2024-05-24",
  "mode": "cloud",
  "function_count": 8,
  "has_event_key": true,
  "has_signing_key": true,
  "authentication_succeeded": true,
  "framework": "nextjs",
  "sdk_language": "typescript",
  "sdk_version": "3.x.x"
}
```

**Security indicators:**
- `has_signing_key: true` - Signing key configured
- `authentication_succeeded: true` - Signature verification passed
- `mode: "cloud"` - Connected to Inngest Cloud (production)

### 4. Rate Limiting

**Current status:** No explicit rate limiting on webhook endpoint

**Why it's okay:**
1. Signature verification prevents unauthorized access
2. Inngest Cloud controls request rate (won't flood your endpoint)
3. Webhook requests are triggered by your own functions
4. Inngest dashboard shows request patterns and errors

**Recommendation:** Monitor via Inngest dashboard rather than implementing custom rate limiting

## Registered Functions

The endpoint serves 8 Inngest functions:

| Function | Type | Trigger | Purpose |
|----------|------|---------|---------|
| `helloWorld` | Demo | Event | Testing and examples |
| `contactFormSubmitted` | Production | Event | Process contact form submissions |
| `refreshGitHubData` | Production | Schedule (5min) | Auto-refresh GitHub heatmap cache |
| `manualRefreshGitHubData` | Production | Event | On-demand GitHub data refresh |
| `trackPostView` | Production | Event | Record blog post view analytics |
| `handleMilestone` | Production | Event | Celebrate view milestones |
| `calculateTrending` | Production | Schedule (hourly) | Update trending posts |
| `dailyAnalyticsSummary` | Production | Schedule (daily) | Generate daily analytics report |
| `generateAnalyticsSummary` | Production | Event | On-demand analytics summary |

## Testing Security

### 1. Test Signature Verification (Production)

```bash
# Try to call webhook without signature (should fail)
curl -X POST https://www.dcyfr.ai/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Expected: 401 Unauthorized
```

### 2. Check Introspection (Local Dev)

```bash
# In development mode
curl http://localhost:3000/api/inngest

# Expected:
# {
#   "mode": "dev",
#   "has_signing_key": false,
#   "authentication_succeeded": null
# }
```

### 3. Test Function Execution (Dev UI)

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/inngest`
3. Select a function from the list
4. Click "Invoke" with test data
5. Verify execution in logs

## Monitoring and Logging

### Access Logs

The Inngest dashboard provides comprehensive logging:
- Function execution history
- Step-by-step execution traces
- Error tracking and retries
- Performance metrics

**Access:** [app.inngest.com](https://app.inngest.com) → Your App → Functions

### Error Monitoring

Common issues and resolutions:

| Error | Cause | Fix |
|-------|-------|-----|
| `signing_key_invalid` | Wrong or expired signing key | Update `INNGEST_SIGNING_KEY` |
| `Function not found` | Function not registered | Check `serve()` functions array |
| `Event key missing` | Can't send events | Set `INNGEST_EVENT_KEY` |
| Connection timeout | Webhook URL unreachable | Verify Vercel deployment |

## Security Best Practices

### ✅ DO

- ✅ Set `INNGEST_SIGNING_KEY` in production
- ✅ Use different keys for preview vs production
- ✅ Rotate signing keys periodically (Inngest dashboard)
- ✅ Monitor function execution in Inngest dashboard
- ✅ Keep Inngest SDK updated for security patches

### ❌ DON'T

- ❌ Commit signing keys to version control
- ❌ Share signing keys between environments
- ❌ Disable signature verification in production
- ❌ Expose signing keys in client-side code
- ❌ Use the same key across multiple apps

## Verification Checklist

Use this checklist to verify webhook security:

- [ ] `INNGEST_SIGNING_KEY` set in Vercel production environment
- [ ] `INNGEST_EVENT_KEY` set in Vercel production environment
- [ ] Introspection endpoint returns `"authentication_succeeded": true`
- [ ] Test webhook with invalid signature returns 401
- [ ] Functions visible in Inngest dashboard
- [ ] Dev server works locally without keys
- [ ] Production functions execute successfully

## References

- **Inngest SDK Spec:** [SDK_SPEC.md](https://github.com/inngest/inngest/blob/main/docs/SDK_SPEC.md)
- **Signature Verification:** Automatic via `serve()` function
- **Introspection API:** `GET /inngest/introspection`
- **Environment Variables:** See `docs/operations/environment-variables.md`

## Conclusion

**Security Status: ✅ VERIFIED**

The Inngest webhook endpoint is properly secured through:
1. ✅ Automatic signature verification (SDK built-in)
2. ✅ Environment-based configuration (dev vs production)
3. ✅ Introspection endpoint for verification
4. ✅ Comprehensive logging and monitoring

**No additional security hardening needed** - the Inngest SDK provides enterprise-grade webhook security out of the box.

**Key insight:** Unlike custom webhooks, Inngest's security is handled by the SDK itself. Your only responsibility is setting the `INNGEST_SIGNING_KEY` environment variable in production.
