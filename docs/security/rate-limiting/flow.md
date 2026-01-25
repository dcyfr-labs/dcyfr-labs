{/* TLP:CLEAR */}

# Rate Limiting Flow Diagram

## Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│                  (Contact Form Submission)                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               │ POST /api/contact
                               │ { name, email, message }
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                           │
│                   (Proxy Headers Added)                          │
│                                                                   │
│  Headers:                                                         │
│    x-forwarded-for: 203.0.113.42                                 │
│    x-real-ip: 203.0.113.42                                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 API Route: /api/contact                          │
│                (Next.js Serverless Function)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  1. Extract Client IP│
                    │  getClientIp(request)│
                    └──────────┬───────────┘
                               │
                               │ IP: "203.0.113.42"
                               │
                               ▼
                    ┌──────────────────────┐
                    │  2. Check Rate Limit │
                    │   rateLimit(ip, cfg) │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
          Rate Limit OK              Rate Limit Exceeded
                │                             │
                ▼                             ▼
    ┌───────────────────────┐    ┌──────────────────────────┐
    │ 3. Validate Input     │    │  Return 429 Response     │
    │   - Required fields   │    │                          │
    │   - Email format      │    │  Headers:                │
    │   - Sanitize data     │    │   X-RateLimit-Limit: 3   │
    └───────┬───────────────┘    │   X-RateLimit-Remaining: 0│
            │                    │   X-RateLimit-Reset: ...  │
            ▼                    │   Retry-After: 45         │
    ┌───────────────────────┐    │                          │
    │ 4. Send Email         │    │  Body:                   │
    │   via Resend API      │    │   { error, retryAfter }  │
    └───────┬───────────────┘    └──────────┬───────────────┘
            │                               │
            ▼                               │
    ┌───────────────────────┐               │
    │ 5. Return Success     │               │
    │                       │               │
    │  Headers:             │               │
    │   X-RateLimit-Limit: 3│               │
    │   X-RateLimit-        │               │
    │     Remaining: 2      │               │
    │   X-RateLimit-Reset:  │               │
    │     ...               │               │
    │                       │               │
    │  Body:                │               │
    │   { success: true }   │               │
    └───────┬───────────────┘               │
            │                               │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Client Receives     │
            │   Response            │
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
   200 Success                     429 Rate Limited
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│ Show Success     │          │ Show Error Toast:    │
│ Toast            │          │ "Too many requests.  │
│ "Message sent!"  │          │  Try again in 45s"   │
│                  │          │                      │
│ Clear Form       │          │ Keep Form Data       │
└──────────────────┘          └──────────────────────┘
```

## Rate Limit Storage (In-Memory)

```
┌─────────────────────────────────────────────────────────────┐
│              Rate Limit Store (Map)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Key: "203.0.113.42"                                         │
│  Value: {                                                     │
│    count: 2,                    ← Current request count     │
│    resetTime: 1696512060000     ← Unix timestamp (ms)       │
│  }                                                            │
│                                                               │
│  Key: "198.51.100.15"                                        │
│  Value: {                                                     │
│    count: 1,                                                  │
│    resetTime: 1696512120000                                  │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                         ▼

              ┌──────────────────────┐
              │   Automatic Cleanup  │
              │   Every 60 seconds   │
              │                      │
              │  Removes entries     │
              │  where:              │
              │  now > resetTime     │
              └──────────────────────┘
```

## Rate Limit Decision Logic

```
Request arrives with IP: "203.0.113.42"
         │
         ▼
┌────────────────────┐
│ Check if IP exists │
│ in rate limit map  │
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    │         └─────────────────────────┐
    │                                   │
    ▼                                   ▼
┌────────────────────┐      ┌────────────────────────┐
│ Check if window    │      │ Create new entry:      │
│ has expired        │      │   count = 1            │
└────────┬───────────┘      │   resetTime = now + 60s│
         │                  │                        │
    ┌────┴────┐             │ ALLOW REQUEST ✓        │
    │         │             └────────────────────────┘
  Expired   Active
    │         │
    ▼         ▼
┌─────────┐  ┌────────────────────┐
│ Reset:  │  │ Check count        │
│ count=1 │  └────────┬───────────┘
│ new     │           │
│ window  │      ┌────┴────┐
│         │      │         │
│ ALLOW ✓ │   count < 3  count >= 3
└─────────┘      │         │
                 ▼         ▼
         ┌────────────┐  ┌────────────┐
         │ Increment  │  │ REJECT     │
         │ count      │  │ REQUEST ✗  │
         │            │  │            │
         │ ALLOW ✓    │  │ Return 429 │
         └────────────┘  └────────────┘
```

## Configuration Variables

```
┌─────────────────────────────────────────────────────────────┐
│                     RATE_LIMIT_CONFIG                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  limit: 3                                                     │
│    ↑                                                          │
│    └─ Maximum number of requests allowed                     │
│                                                               │
│  windowInSeconds: 60                                         │
│    ↑                                                          │
│    └─ Time window for the limit (in seconds)                 │
│                                                               │
│  Meaning: 3 requests per 60 seconds per IP address          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Example Scenarios

### Scenario 1: Normal User (within limits)

```
Time    Action              Count   Result
────    ──────              ─────   ──────
00:00   Submit form         1/3     ✓ 200 OK
00:15   Submit form         2/3     ✓ 200 OK
00:30   Submit form         3/3     ✓ 200 OK
01:00   [Window resets]     0/3     -
01:05   Submit form         1/3     ✓ 200 OK
```

### Scenario 2: Spam Bot (exceeds limits)

```
Time    Action              Count   Result
────    ──────              ─────   ──────
00:00   Submit form         1/3     ✓ 200 OK
00:01   Submit form         2/3     ✓ 200 OK
00:02   Submit form         3/3     ✓ 200 OK
00:03   Submit form         3/3     ✗ 429 (Rate Limited)
00:04   Submit form         3/3     ✗ 429 (Rate Limited)
00:05   Submit form         3/3     ✗ 429 (Rate Limited)
...     ...                 3/3     ✗ 429 (Rate Limited)
01:00   [Window resets]     0/3     -
01:01   Submit form         1/3     ✓ 200 OK
```

### Scenario 3: Multiple Users (different IPs)

```
Time    IP              Action          Count   Result
────    ──              ──────          ─────   ──────
00:00   203.0.113.42   Submit form     1/3     ✓ 200 OK
00:01   198.51.100.15  Submit form     1/3     ✓ 200 OK
00:02   203.0.113.42   Submit form     2/3     ✓ 200 OK
00:03   198.51.100.15  Submit form     2/3     ✓ 200 OK
00:04   203.0.113.42   Submit form     3/3     ✓ 200 OK
00:05   198.51.100.15  Submit form     3/3     ✓ 200 OK
00:06   203.0.113.42   Submit form     3/3     ✗ 429
00:07   198.51.100.15  Submit form     3/3     ✗ 429

Each IP has its own independent rate limit counter.
```

## HTTP Headers Reference

### Request Headers (from Vercel)
```
x-forwarded-for: 203.0.113.42, 198.51.100.15
x-real-ip: 203.0.113.42
```

### Response Headers (all requests)
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1696512060000
```

### Response Headers (when rate limited)
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696512060000
Retry-After: 45
```

## Performance Characteristics

```
Operation              Time Complexity    Space Complexity
─────────────────────  ─────────────────  ────────────────
rateLimit()            O(1)               O(n) where n = unique IPs
getClientIp()          O(1)               O(1)
cleanup()              O(n)               O(n)

Memory Usage: ~100 bytes per tracked IP
Cleanup Frequency: Every 60 seconds
Max Memory: Bounded by cleanup (entries expire)
```
