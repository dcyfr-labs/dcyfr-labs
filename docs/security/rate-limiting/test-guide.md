# Rate Limiting Test Script

**Purpose:** Validate rate limiting implementation across API endpoints

**Last Updated:** October 20, 2025

## Overview

The rate limiting test script (`scripts/test-rate-limit.mjs`) validates that rate limiting is working correctly on both the Contact Form API and GitHub Contributions API endpoints.

## Usage

```bash
# Test contact form only (default)
npm run test:rate-limit
npm run test:rate-limit contact

# Test GitHub contributions only
npm run test:rate-limit github

# Test all endpoints
npm run test:rate-limit all
```

## Endpoints Tested

### Contact Form (`/api/contact`)

**Rate Limit:** 3 requests per 60 seconds per IP

**Tests:**
1. ✅ First 3 requests succeed (200 OK)
2. ✅ 4th request is rate limited (429)
3. ✅ Rate limit headers present
4. ✅ Graceful fallback when `RESEND_API_KEY` missing
5. ✅ Retry-After header included in 429 response

**Expected Behavior:**
- Returns 200 OK even without `RESEND_API_KEY` (shows warning)
- Rate limiting applies regardless of email configuration
- Clear error messages on rate limit

### GitHub Contributions (`/api/github-contributions`)

**Rate Limit:** 10 requests per 60 seconds per IP

**Tests:**
1. ✅ First 10 requests succeed (200 OK)
2. ✅ 11th request is rate limited (429)
3. ✅ Rate limit headers on 429 response
4. ✅ Server-side caching working (5-minute cache)
5. ✅ Retry-After header included in 429 response

**Expected Behavior:**
- Returns cached data for subsequent requests (within 5 minutes)
- Works with or without `GITHUB_TOKEN` (different rate limits on GitHub API)
- Rate limiting prevents excessive API calls

## Test Output

### Successful Run

```
🧪 Testing Contact Form Rate Limiting
============================================================
Endpoint: http://localhost:3000/api/contact
Expected Limit: 3 requests per 60 seconds

🔄 Contact Request 1...
   Status: 200 OK
   Rate Limit Headers:
     Limit: 3
     Remaining: 2
     Reset: 2025-10-21T03:59:08.291Z
   Response: {
     "success": true,
     "message": "Message received successfully"
   }

[... requests 2-3 ...]

🔄 Contact Request 4...
   Status: 429 Too Many Requests
   Rate Limit Headers:
     Limit: 3
     Remaining: 0
     Reset: 2025-10-21T03:59:08.291Z
     Retry After: 59s
   Response: {
     "error": "Too many requests. Please try again later.",
     "retryAfter": 59
   }

============================================================
📊 Contact Form Test Results
============================================================
✅ Request 1: SUCCESS (200 OK)
✅ Request 2: SUCCESS (200 OK)
✅ Request 3: SUCCESS (200 OK)
✅ Request 4: RATE LIMITED (429 Too Many Requests)
   Retry After: 59s
✅ Rate limit headers present

============================================================
🎯 Final Score: 5/5 tests passed
============================================================

🎉 All tests passed! Rate limiting is working correctly.
```

### With Graceful Fallback

When `RESEND_API_KEY` is not configured:

```
🔄 Contact Request 1...
   Status: 200 OK
   Rate Limit Headers:
     Limit: 3
     Remaining: 2
     Reset: 2025-10-21T03:59:08.291Z
   ⚠️  Warning: Email delivery unavailable
   Response: {
     "success": true,
     "message": "Message received. However, email service is not configured.",
     "warning": "Email delivery unavailable"
   }
```

## Implementation Details

### Rate Limit Headers

All endpoints return standard rate limit headers:

```
X-RateLimit-Limit: 3          # Maximum requests allowed
X-RateLimit-Remaining: 2      # Requests remaining in window
X-RateLimit-Reset: 1729565948 # Unix timestamp when limit resets
```

When rate limited (429 response):

```
Retry-After: 59               # Seconds until can retry
```

### Test Flow

1. **Server Check:** Verifies dev server is running at `BASE_URL`
2. **Request Loop:** Makes N+1 requests (where N is the limit)
3. **Validation:** Checks status codes, headers, and response data
4. **Summary:** Reports pass/fail for each test

### Error Handling

The script handles:
- ✅ Server not running → Clear error message
- ✅ Network errors → Caught and reported
- ✅ Missing environment variables → Tests graceful fallback
- ✅ Unexpected responses → Detailed error output

## Configuration

### Environment Variables

```bash
# Override base URL (default: http://localhost:3000)
BASE_URL=https://preview.dcyfr-preview.vercel.app npm run test:rate-limit
```

### Test Customization

Edit `scripts/test-rate-limit.mjs` to:
- Change test payloads
- Adjust delays between requests
- Add new endpoint tests
- Modify validation logic

## Troubleshooting

### "Cannot connect to http://localhost:3000"

**Cause:** Dev server not running

**Solution:**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:rate-limit
```

### All requests succeed (no rate limiting)

**Cause:** Rate limit window may have reset between runs

**Solution:**
- Wait 60 seconds and try again
- Check rate limit implementation in API routes
- Verify in-memory rate limit store is working

### 429 on first request

**Cause:** Previous test run within the same rate limit window

**Solution:**
- Wait for rate limit window to reset (shown in output)
- Use different IP/client identifier
- Restart dev server to clear in-memory rate limit store

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Rate Limit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run build
      
      # Start server in background
      - run: npm start &
      - run: sleep 5  # Wait for server to start
      
      # Run tests
      - run: npm run test:rate-limit all
```

## Related Documentation

- Rate Limiting Guide
- Rate Limiting Implementation
- Rate Limiting Quick Reference
- API Reference
- Environment Variables

## Maintenance

### Adding New Endpoint Tests

1. Create test function (e.g., `testNewEndpointRateLimiting()`)
2. Define expected rate limit and request count
3. Make N+1 requests and validate responses
4. Return `{ passed, failed, total }` object
5. Update `runTests()` to include new test
6. Update this documentation

### Updating Rate Limits

If rate limits change in API routes:

1. Update constants in test script
2. Update this documentation
3. Update related docs (guide, quick reference)
4. Run tests to verify

## Change Log

- **2025-10-20:** Enhanced test script with GitHub contributions endpoint support
- **2025-10-20:** Added graceful fallback detection for missing `RESEND_API_KEY`
- **2025-10-20:** Improved output formatting and validation
- **2025-10-20:** Added support for testing individual or all endpoints
