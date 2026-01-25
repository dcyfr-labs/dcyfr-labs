# CORS (Cross-Origin Resource Sharing) Policy

**Status:** Documented
**Last Updated:** December 12, 2025
**Security Rating:** Secure (Restrictive by Default)

---

## Overview

This application uses **Next.js default CORS policy**, which implements a **same-origin** strategy for security. This document outlines the current CORS configuration, rationale, and exceptions.

---

## Current Policy

### Default Behavior: Same-Origin Only

**Configuration:** Next.js built-in defaults (no custom CORS headers)

**What this means:**

- API routes accept requests from the same origin only
- Cross-origin requests are blocked by default
- Modern browsers enforce this via CORS preflight checks

**Example:**

```
Allowed:    https://dcyfr.ai → https://dcyfr.ai/api/*
Blocked:    https://example.com → https://dcyfr.ai/api/*
```

---

## Exceptions & Special Cases

### 1. Public Assets (Allowed Cross-Origin)

**Path:** `/public/*` (images, fonts, static files)

**Access:** Open to all origins

- `Access-Control-Allow-Origin: *` (implicit via Next.js static file serving)
- Required for: Image embeds, RSS readers, third-party sites

**Examples:**

- `/og-images/*` - Open Graph images
- `/robots.txt`, `/sitemap.xml` - SEO files
- `/favicon.ico` - Browser icons

**Rationale:** Public assets are designed to be embedded/referenced externally

---

### 2. RSS/Atom Feeds (Allowed Cross-Origin)

**Paths:**

- `/rss.xml`
- `/feed`
- `/work/feed`

**Access:** Open to all origins
**Rationale:** RSS readers and aggregators require cross-origin access

---

### 3. API Routes (Same-Origin Only)

**Paths:**

- `/api/*` (all API endpoints)

**Access:** Same-origin only (enforced by Next.js defaults)

**Examples:**

```
✓ ALLOWED:
  Request from: https://dcyfr.ai (same origin)
  Target: https://dcyfr.ai/api/contact

✗ BLOCKED:
  Request from: https://attacker.com (different origin)
  Target: https://dcyfr.ai/api/contact
```

**Additional Protection:**

- `/api/analytics` - Admin-only + API key required
- `/api/admin/*` - Admin-only + API key required + external access blocked
- `/api/contact` - Public but rate-limited (3 req/min)

---

## Security Layers

### Defense-in-Depth for API Routes

1. **CORS Policy** (Browser-level)
   - Enforced by modern browsers
   - Blocks unauthorized cross-origin requests
   - Preflight checks for complex requests

2. **External Access Blocking** (Server-level)
   - Admin endpoints: `blockExternalAccess()` in production
   - Verifies request origin/headers
   - Blocks non-internal requests

3. **API Key Authentication** (Application-level)
   - Required for admin endpoints
   - Timing-safe comparison
   - Validated before processing

4. **Rate Limiting** (Infrastructure-level)
   - Redis-backed per-IP limits
   - Contact form: 3 req/min
   - Analytics: 60 req/min (dev), 5 req/min (prod)

5. **CSRF Protection** (Framework-level)
   - Next.js SameSite cookies
   - Token-based validation for mutations
   - Prevents cross-site request forgery

---

## Configuration Details

### Next.js Default CORS Headers

**For API Routes:**

```typescript
// No CORS headers = same-origin only
// Browsers enforce CORS automatically
```

**For Static Files:**

```typescript
// Next.js serves with appropriate caching headers
// Public directory is accessible cross-origin
```

### Custom Headers (via next.config.ts)

**Current:** No custom CORS headers configured
**Why:** Next.js defaults provide appropriate security

**If cross-origin access is needed in the future:**

```typescript
// next.config.ts
{
  async headers() {
    return [
      {
        source: '/api/specific-endpoint',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://trusted-domain.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  }
}
```

---

## Common CORS Headers (Not Currently Used)

| Header                             | Purpose                  | Current Value                  |
| ---------------------------------- | ------------------------ | ------------------------------ |
| `Access-Control-Allow-Origin`      | Allowed origins          | _(not set - same-origin only)_ |
| `Access-Control-Allow-Methods`     | Allowed HTTP methods     | _(not set)_                    |
| `Access-Control-Allow-Headers`     | Allowed request headers  | _(not set)_                    |
| `Access-Control-Allow-Credentials` | Allow cookies/auth       | _(not set)_                    |
| `Access-Control-Max-Age`           | Preflight cache duration | _(not set)_                    |

**Current:** All default to restrictive (same-origin only)

---

## Testing CORS Policy

### Test 1: Same-Origin Request (Should Succeed)

```bash
# From your domain
curl https://dcyfr.ai/api/contact \
  -H "Origin: https://dcyfr.ai" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# Expected: 200 OK (or 429 if rate limited)
```

### Test 2: Cross-Origin Request (Should Fail)

```bash
# From different domain
curl https://dcyfr.ai/api/contact \
  -H "Origin: https://attacker.com" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# Expected: CORS error in browser console
# Note: curl doesn't enforce CORS (browsers do)
```

### Test 3: Preflight Request

```bash
# OPTIONS request (browser preflight)
curl -X OPTIONS https://dcyfr.ai/api/contact \
  -H "Origin: https://attacker.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

# Expected: No CORS headers in response
# Browser will block the actual request
```

---

## Browser Console Errors

**When CORS is blocked, you'll see:**

```
Access to fetch at 'https://dcyfr.ai/api/contact' from origin
'https://attacker.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**This is expected and correct behavior for security.**

---

## Future Considerations

### When to Allow Cross-Origin Access

**Consider allowing if:**

1. Building a public API for third-party integrations
2. Partnering with specific trusted domains
3. Creating embeddable widgets
4. Providing data for mobile apps

**How to allow safely:**

1. **Specific origins only** - Never use `*` for sensitive endpoints
2. **Specific methods** - Only allow necessary HTTP methods
3. **Authentication required** - Still validate API keys/tokens
4. **Rate limiting** - Enforce strict limits
5. **Audit logging** - Track all cross-origin requests

### Example: Public API Endpoint

```typescript
// If we wanted to expose a read-only API endpoint:
// next.config.ts
{
  source: '/api/public/data',
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: 'https://trusted-partner.com'
    },
    {
      key: 'Access-Control-Allow-Methods',
      value: 'GET, OPTIONS' // Read-only
    }
  ]
}
```

---

## Security Best Practices

### ✅ Current Implementation

- ✅ Same-origin by default (secure)
- ✅ No wildcard (`*`) CORS headers
- ✅ Public assets explicitly allowed
- ✅ API routes protected with additional auth
- ✅ CSRF protection via SameSite cookies

### ⚠️ What to Avoid

- ❌ `Access-Control-Allow-Origin: *` on API routes
- ❌ Allowing credentials with wildcard origins
- ❌ Overly permissive methods (DELETE, PUT for public endpoints)
- ❌ Long `Max-Age` for sensitive endpoints
- ❌ Trusting `Origin` header without additional validation

---

## Related Security Measures

**Other browser security policies in use:**

1. **Content Security Policy (CSP)**
   - File: `src/middleware.ts`
   - Prevents XSS, clickjacking, code injection
   - Configured via middleware

2. **SameSite Cookies**
   - Set on all authentication cookies
   - Prevents CSRF attacks
   - Automatic via Next.js

3. **HTTPS Only**
   - Enforced in production (Vercel)
   - All cookies marked `Secure`
   - HSTS header recommended

4. **X-Frame-Options**
   - Prevents clickjacking
   - Set via middleware/Vercel config

---

## Compliance & Standards

**Follows:**

- ✅ OWASP Top 10 (2024) - A01:2021 Broken Access Control
- ✅ OWASP API Security Top 10 (2023) - API1:2023 Broken Object Level Authorization
- ✅ W3C CORS Specification
- ✅ RFC 6454 (The Web Origin Concept)

---

## Monitoring & Logging

**How to detect CORS issues:**

1. **Browser Console**
   - Users see CORS errors directly
   - Can be reported via support

2. **Sentry Error Tracking**
   - CORS errors may trigger client-side exceptions
   - Monitor for unexpected cross-origin requests

3. **Server Logs (Axiom)**
   - Preflight OPTIONS requests logged
   - Can detect unusual origin patterns

**Query for suspicious cross-origin attempts:**

```apl
['method'] == "OPTIONS"
| summarize count() by ['headers.origin']
| where count > 10
```

---

## Summary

**CORS Policy:** Same-origin only (Next.js default)
**Exceptions:** Public assets, RSS feeds
**Security:** Multiple defense layers beyond CORS
**Changes Required:** None (current policy is appropriate)

**Status:** ✅ Secure and appropriate for current use case

---

## References

- [W3C CORS Specification](https://www.w3.org/TR/cors/)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/headers)
- [OWASP Cross-Origin Resource Sharing](https://owasp.org/www-community/attacks/cors)
- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
