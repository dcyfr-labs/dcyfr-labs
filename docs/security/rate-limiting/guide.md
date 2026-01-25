# Rate Limiting Implementation

**Status: ✅ VERIFIED AND DEPLOYED (November 9, 2025)**

## Overview

Rate limiting has been implemented across all public API endpoints to prevent abuse and protect against spam/DoS attacks. All rate limiting has been tested and verified working with both Redis and in-memory fallback.

**Verification Results:**
- ✅ Contact form rate limiting: Working
- ✅ View tracking rate limiting: Working (10/5min per IP)
- ✅ Share tracking rate limiting: Working (3/60s per IP)
- ✅ Redis persistence: Verified
- ✅ In-memory fallback: Working
- ✅ Rate limit headers: Correctly sent

## Current Implementation

### Configuration

- **Endpoint**: `/api/contact`
- **Limit**: 3 requests per 60 seconds per IP address
- **Storage**: In-memory (suitable for Vercel serverless functions)
- **Headers**: Standard rate limit headers included in responses

### Rate Limit Headers

All responses include the following headers:

```
X-RateLimit-Limit: 3          # Maximum requests allowed
X-RateLimit-Remaining: 2      # Requests remaining in window
X-RateLimit-Reset: 1696512000 # Unix timestamp when limit resets
```

When rate limit is exceeded, the response also includes:

```
Retry-After: 45               # Seconds to wait before retrying
```

### Response Format

#### Success (200 OK)
```json
{
  "success": true,
  "message": "Message received successfully"
}
```

#### Rate Limited (429 Too Many Requests)
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

## Technical Details

### In-Memory Storage

The current implementation uses an in-memory Map for tracking request counts. This approach:

✅ **Pros:**
- Zero external dependencies
- No setup required
- Works perfectly with Vercel's serverless architecture
- Automatic cleanup of expired entries
- Low latency

⚠️ **Limitations:**
- Each serverless function instance has its own memory
- Not shared across multiple regions or instances
- Resets on cold starts (which is acceptable for this use case)

### IP Address Detection

The implementation correctly handles Vercel's proxy headers:
1. `x-forwarded-for` (primary, contains client IP)
2. `x-real-ip` (fallback)

## Upgrading to Distributed Rate Limiting

For high-traffic sites or stricter rate limiting requirements, upgrade to a distributed solution:

### Option 1: Managed Redis via `REDIS_URL`

Use any hosted Redis provider (Upstash, Redis Cloud, Aiven, etc.) and connect with the official `redis` client:

1. **Install dependency:**
   ```bash
   npm install redis
   ```

2. **Configure environment:**
   - Provision a Redis database (e.g., Upstash → Redis database → copy connection string)
   - Add `REDIS_URL` to your Vercel project and local `.env` file

3. **Update `src/lib/rate-limit.ts`:**
   ```typescript
   import { createClient } from "redis";

  const client = createClient({ url: process.env.REDIS_URL });

   export async function rateLimit(
     identifier: string,
     config: RateLimitConfig
   ): Promise<RateLimitResult> {
     const key = `rate_limit:${identifier}`;
     const now = Date.now();
     const windowMs = config.windowInSeconds * 1000;

     if (!client.isOpen) {
       await client.connect();
     }

     const [count] = await client
       .multi()
       .incr(key)
       .pexpire(key, windowMs)
       .exec();

     const total = Number(count ?? 0);
     const remaining = Math.max(0, config.limit - total);

     return {
       success: total <= config.limit,
       limit: config.limit,
       remaining,
       reset: now + windowMs,
     };
   }
   ```

> **Note:** Vercel KV is now available through the Vercel Marketplace. If you prefer it, install the integration and replace the `redis` client with the `@vercel/kv` helper—logic stays the same (increment and set expiry per request).

### Option 2: Upstash Redis

Upstash offers a serverless Redis solution with a generous free tier:

1. **Install dependency:**
   ```bash
   npm install @upstash/redis
   ```

2. **Set up Upstash:**
   - Create account at https://upstash.com
   - Create a Redis database
   - Get `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

3. **Add to `.env.local`:**
   ```
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

4. **Update `src/lib/rate-limit.ts`:**
   ```typescript
   import { Redis } from "@upstash/redis";
   
   const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL!,
     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
   });
   
   export async function rateLimit(
     identifier: string,
     config: RateLimitConfig
   ): Promise<RateLimitResult> {
     const key = `rate_limit:${identifier}`;
     const now = Date.now();
     const windowMs = config.windowInSeconds * 1000;
     
     const count = await redis.incr(key);
     
     if (count === 1) {
       await redis.expire(key, config.windowInSeconds);
     }
     
     const remaining = Math.max(0, config.limit - count);
     const success = count <= config.limit;
     
     return {
       success,
       limit: config.limit,
       remaining,
       reset: now + windowMs,
     };
   }
   ```

## Testing

### Manual Testing

1. **Normal request:**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
   ```

2. **Trigger rate limit:**
   ```bash
   # Run this 4 times quickly
   for i in {1..4}; do
     curl -X POST http://localhost:3000/api/contact \
       -H "Content-Type: application/json" \
       -d '{"name":"Test","email":"test@example.com","message":"Test message"}' \
       -i
   done
   ```

3. **Check headers:**
   Look for `X-RateLimit-*` and `Retry-After` headers in the response.

### Automated Testing

Consider adding tests with Playwright or Vitest:

```typescript
// Example test
test("rate limits contact form after 3 requests", async () => {
  const payload = {
    name: "Test User",
    email: "test@example.com",
    message: "Test message",
  };

  // First 3 requests should succeed
  for (let i = 0; i < 3; i++) {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(200);
  }

  // 4th request should be rate limited
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  expect(response.status).toBe(429);
});
```

## Monitoring

### Manual Monitoring
Consider logging rate limit violations for monitoring:

```typescript
// In src/app/api/contact/route.ts
if (!rateLimitResult.success) {
  console.warn("Rate limit exceeded:", {
    ip: clientIp,
    timestamp: new Date().toISOString(),
    remaining: rateLimitResult.remaining,
    reset: new Date(rateLimitResult.reset).toISOString(),
  });
  // ... return 429 response
}
```

### Automated Testing
Run comprehensive rate limit tests:

```bash
# Test all API rate limits
node scripts/test-tracking.mjs

# Expected output:
# ✓ Rate limiting enforced correctly
# ⚠ Share rate limit triggered (expected behavior)
```

**Test coverage:**
- Contact form: 3 requests per 60 seconds
- View tracking: 10 requests per 5 minutes
- Share tracking: 3 requests per 60 seconds

## Verification Status

**Last tested:** November 9, 2025  
**Contact form:** ✅ Working (3/60s enforced)  
**View tracking:** ✅ Working (10/5min enforced)  
**Share tracking:** ✅ Working (3/60s enforced, tested in rapid succession)  
**Redis backend:** ✅ Verified  
**In-memory fallback:** ✅ Verified  
**Headers:** ✅ Correctly sent with all responses

## Current Rate Limits by Endpoint

| Endpoint | Limit | Window | Status |
|----------|-------|--------|--------|
| `/api/contact` | 3 | 60s | ✅ Verified |
| `/api/views` | 10 | 5min | ✅ Verified |
| `/api/shares` | 3 | 60s | ✅ Verified |
| `/api/github-contributions` | 10 | 1min | ✅ Implemented |

## Future Enhancements

- [x] ✅ Add rate limiting to all public API routes
- [x] ✅ Implement Redis-backed distributed rate limiting
- [x] ✅ Add in-memory fallback for resilience
- [ ] Implement different rate limits for authenticated users
- [ ] Add allowlist for trusted IPs
- [ ] Analytics dashboard for rate limit violations
- [ ] Set up alerts for excessive rate limit violations
- [ ] Consider CAPTCHA for repeated violations

## References

- [MDN: 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [IETF Draft: RateLimit Header Fields](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Upstash Documentation](https://docs.upstash.com/redis)
