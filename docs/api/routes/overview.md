<!-- TLP:CLEAR -->

# API Routes Overview

**Location:** `src/app/api/`

**Framework:** Next.js 16 App Router (Route Handlers)

## Overview

This project includes a minimal set of focused API endpoints that handle form submissions and external data fetching. All routes use Next.js Route Handlers with comprehensive error handling, rate limiting, and security protections.

## Architecture

### Request Flow

```
Client Request
    ↓
Route Handler (src/app/api/[route]/route.ts)
    ↓
Rate Limiting Check
    ↓
Input Validation
    ↓
Business Logic
    ↓
Error Handling
    ↓
Response with Headers
```

### Response Format

All API responses follow a consistent JSON structure:

**Success Response (2xx):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Error message describing what went wrong",
  "retryAfter": 60
}
```

### Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input/validation failed |
| 403 | Forbidden | Authorization failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

## Rate Limiting

**Status: ✅ VERIFIED (November 9, 2025)**

### Strategy

The project implements **distributed rate limiting** using Redis with a graceful fallback to in-memory storage for local development.

**Utility Location:** `src/lib/rate-limit.ts`

**Verification:** All rate limits tested and confirmed working with both Redis and in-memory fallback. See `scripts/test-tracking.mjs` for automated testing.

### Configuration

Each route defines its own rate limit config:

```tsx
const RATE_LIMIT_CONFIG = {
  limit: 3,              // Maximum requests
  windowInSeconds: 60,   // Per 60 seconds
};

const result = await rateLimit(clientIp, RATE_LIMIT_CONFIG);
```

**Current Limits:**
- `/api/contact`: 3 requests per 60 seconds ✅ Verified
- `/api/views`: 10 requests per 5 minutes ✅ Verified
- `/api/shares`: 3 requests per 60 seconds ✅ Verified
- `/api/github-contributions`: 10 requests per 1 minute ✅ Implemented

### Implementation

#### Redis (Production) ✅ Verified

When `REDIS_URL` environment variable is set:
- Uses Redis `INCR` command for atomic counting
- Sets expiration with `PXAT` (millisecond precision)
- Distributed across serverless instances
- Graceful error handling (fails open on Redis error)
- **Tested:** Successfully enforces limits with Redis persistence

#### In-Memory (Development) ✅ Verified

Fallback when Redis unavailable:
- Map-based storage: `Map<identifier, { count, resetTime }>`
- Automatic cleanup every 60 seconds
- Per-process rate limiting (separate limits per instance)
- Suitable for local development
- **Tested:** Fallback works correctly when Redis unavailable

### Headers

Standard rate limit headers included in all responses:

```
X-RateLimit-Limit: 3              // Max requests
X-RateLimit-Remaining: 2          // Requests left
X-RateLimit-Reset: 1729720945000  // Millisecond timestamp
Retry-After: 45                    // Seconds to retry (429 only)
```

### IP Detection

**Function:** `getClientIp(request)`

Extracts client IP from Vercel headers:
1. `x-forwarded-for` (first IP if multiple)
2. `x-real-ip`
3. Fallback: `"unknown"`

Works correctly on Vercel and local development.

## Input Validation

### Principles

1. **Whitelist Approach**: Only accept known fields
2. **Type Safety**: Validate types and structure
3. **Length Limits**: Enforce maximum lengths
4. **Format Validation**: Validate formats (email, etc.)
5. **Sanitization**: Trim and clean inputs

### Common Validation

```tsx
// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Input sanitization
function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Trim + truncate
}
```

### Validation Response

Invalid input returns 400 Bad Request:

```json
{
  "error": "Invalid email address"
}
```

## Error Handling

### Pattern

```tsx
try {
  // Rate limiting
  if (!rateLimitResult.success) {
    return 429 response;
  }

  // Validation
  if (!valid) {
    return 400 response;
  }

  // Business logic
  // ...

  return 200 response;
} catch (error) {
  console.error("Route error:", error);
  return 500 response;
}
```

### Error Logging

**Sensitive Data:** No PII logged
- ✅ User actions, success/failure
- ✅ Error categories and types
- ❌ Email addresses, names, message content
- ❌ Passwords, tokens, API keys

**Pattern:**
```tsx
console.log("Contact form submission:", {
  nameLength: data.name.length,
  emailDomain: data.email.split('@')[1],
  messageLength: data.message.length,
  timestamp: new Date().toISOString(),
});
```

## Security Features

### 1. Rate Limiting
- Per-IP rate limiting on all public routes
- Prevents brute force and abuse
- Distributed across instances (Redis)

### 2. Input Validation
- Type checking
- Format validation (email, etc.)
- Length limits
- Sanitization

### 3. Content Security Policy
- Implemented in middleware (`src/middleware.ts`)
- Nonce-based script/style CSP
- Protects against XSS attacks

### 4. CORS & Headers
- Security headers configured in `vercel.json`
- X-Frame-Options, X-Content-Type-Options
- Proper CORS handling

### 5. Data Protection
- No sensitive data in logs
- Secure external API calls
- Graceful error responses (no info leaks)

## Environment Variables

### Required

None - all routes work without environment variables

### Optional

**`RESEND_API_KEY`** (Contact API only)
- API key for email sending via Resend
- If not set, form submissions still succeed (200) with warning
- Graceful degradation

**`GITHUB_TOKEN`** (GitHub Contributions API only)
- GitHub Personal Access Token
- Increases rate limit from 60 to 5,000 req/hour
- No write permissions needed
- Optional but recommended

**`REDIS_URL`** (All routes)
- Redis connection string for distributed rate limiting
- Example: `redis://default:password@localhost:6379`
- Falls back to in-memory if not set
- Recommended for production

### Configuration

```bash
# .env.local (development)
# Leave these commented for default behavior

# RESEND_API_KEY=re_...
# GITHUB_TOKEN=ghp_...
# REDIS_URL=redis://...
```

## Routes

This project includes 2 main API routes:

### 1. **POST /api/contact** - Contact Form
- Receives form submissions
- Validates input
- Sends email via Resend
- Rate limited (3 requests/minute per IP)
- **Documentation:** `contact.md`

### 2. **GET /api/github-contributions** - GitHub Data
- Fetches GitHub contribution data
- Caches results (1 hour)
- Fallback data on errors
- Rate limited (10 requests/minute per IP)
- **Documentation:** `github-contributions.md`

## Performance Considerations

### Response Times

| Route | Cached | Uncached | Notes |
|-------|--------|----------|-------|
| `/api/contact` | ~100ms | ~200-500ms | Depends on Resend API |
| `/api/github-contributions` | ~20ms | ~500-1000ms | Depends on GitHub API |

### Caching Strategy

**GitHub Contributions:**
- Server-side cache: 1 hour TTL
- HTTP cache: 3600 seconds (`s-maxage`)
- Stale while revalidate: 7200 seconds

**Contact Form:**
- No caching (transactional)

### Optimization Tips

1. **Use HTTP Caching**: Browser/CDN caching for repeated requests
2. **Monitor Rate Limits**: Watch for 429 responses
3. **Batch Operations**: Avoid making multiple simultaneous requests
4. **Handle Timeouts**: Implement client-side timeout handling (10s recommended)

## Monitoring & Debugging

### Development

Enable detailed logging in development:

```bash
npm run dev
```

Monitor console for:
- Rate limit decisions
- Validation errors
- API call results
- Cache hits/misses

### Production

Log aggregation available via Vercel:
1. Visit Vercel Dashboard
2. Navigate to project
3. View "Functions" or "Logs" tab
4. Filter by route

### Health Checks

Check route health via curl:

```bash
# Contact API
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello world"}'

# GitHub API
curl "http://localhost:3000/api/github-contributions?username=dcyfr"
```

## Testing

### Manual Testing

Using curl:

```bash
# Test rate limiting
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Hello world"}'
  echo "Request $i"
done
```

Using browser DevTools:

1. Open Network tab
2. Make request
3. Check response status and headers
4. Verify rate limit headers

### Unit Testing

Example test structure (for Playwright/Jest):

```tsx
describe("POST /api/contact", () => {
  it("should reject invalid email", async () => {
    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Test",
        email: "invalid",
        message: "Hello",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("should rate limit after 3 requests", async () => {
    // Make 3 requests
    // 4th request should return 429
  });
});
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 429 Too Many Requests | Rate limit exceeded | Wait 60 seconds, retry |
| 400 Bad Request | Invalid input | Check field values |
| 500 Server Error | Unexpected error | Check logs, retry |
| Email not sending | RESEND_API_KEY not set | Set env var or accept 200 with warning |
| GitHub data stale | Using cached response | Wait 1 hour or check cache status |

## Best Practices

### Client-Side

```tsx
// 1. Implement retry logic
const response = await fetch("/api/contact", {
  method: "POST",
  body: JSON.stringify(data),
});

if (response.status === 429) {
  const retryAfter = response.headers.get("retry-after");
  // Wait retryAfter seconds before retrying
}

// 2. Handle errors gracefully
if (!response.ok) {
  const error = await response.json();
  showError(error.message);
}
```

### Server-Side

```tsx
// 1. Always validate input
if (!name || !email || !message) {
  return NextResponse.json(
    { error: "All fields required" },
    { status: 400 }
  );
}

// 2. Never leak sensitive info
// BAD: return { error: `Database connection failed: ${error.message}` };
// GOOD: return { error: "Internal server error" };

// 3. Log safely (no PII)
console.log("Action:", { userId, action, timestamp });
```

## Deployment

### Vercel

Routes automatically deployed with each commit:

```bash
# Deployment
git push origin main

# Live at
https://your-domain.com/api/contact
https://your-domain.com/api/github-contributions
```

### Environment Setup

1. Navigate to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add:
   - `RESEND_API_KEY` (optional)
   - `GITHUB_TOKEN` (optional)
   - `REDIS_URL` (optional)

### Monitoring

Check Vercel Logs for:
- Function execution time
- Error rates
- Rate limit hits

## Related Documentation

- **Contact Endpoint:** `contact.md`
- **GitHub Contributions:** `github-contributions.md`
- **Rate Limiting Utility:** `src/lib/rate-limit.ts`
- **Environment Variables:** `docs/platform/environment-variables.md`
- **Security:** `docs/security/`

## Changelog

- **2025-10-24** - Initial API routes documentation
