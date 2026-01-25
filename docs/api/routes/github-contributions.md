{/* TLP:CLEAR */}

# GitHub Contributions API Endpoint

**Location:** `src/app/api/github-contributions/route.ts`

**Method:** `GET`

**Rate Limit:** 10 requests per 60 seconds per IP

## Overview

The `/api/github-contributions` endpoint fetches a user's GitHub contribution data for the past year and returns it in a format suitable for heatmap visualization. It features server-side caching, fallback data generation, and comprehensive error handling.

## Endpoint

```
GET /api/github-contributions?username={username}
```

## Request

### Query Parameters

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|------------|
| username | string | Yes | N/A | 1-39 chars, alphanumeric + hyphens only |

### Example Requests

```bash
# Basic request
curl "https://your-domain.com/api/github-contributions?username=dcyfr"

# With query string
curl "https://your-domain.com/api/github-contributions?username=torvalds"
```

### Request Headers

Standard HTTP headers are fine. No special headers required.

## Response

### Success Response (200)

```json
{
  "contributions": [
    {
      "date": "2025-10-24",
      "count": 5
    },
    {
      "date": "2025-10-23",
      "count": 0
    }
  ],
  "totalContributions": 1234,
  "source": "github-api",
  "warning": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| contributions | Array | Contribution data for past year |
| contributions[].date | string | ISO date format (YYYY-MM-DD) |
| contributions[].count | number | Number of contributions on that day |
| totalContributions | number | Sum of all contributions in period |
| source | string | Data source: "github-api", "server-cache", or "fallback" |
| warning | string \| null | Warning message if present (e.g., unauthenticated) |

### Source Types

| Source | Meaning | When Used |
|--------|---------|-----------|
| github-api | Fresh data from GitHub | On cache miss |
| server-cache | Cached data from memory | Within 1-hour window |
| fallback | Synthetic data | On GitHub API error |

### Example with Warning

```json
{
  "contributions": [...],
  "totalContributions": 1234,
  "source": "github-api",
  "warning": "Using unauthenticated GitHub API (subject to rate limits)"
}
```

## Error Responses

### 400 Bad Request

Missing or invalid username:

```json
{
  "error": "Username parameter is required"
}
```

Invalid username format:

```json
{
  "error": "Invalid username format"
}
```

### 403 Forbidden

Username not allowed (only portfolio owner):

```json
{
  "error": "Unauthorized: This endpoint only serves data for the portfolio owner"
}
```

### 429 Too Many Requests

Rate limit exceeded:

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1729720945000
Retry-After: 45
```

### 500 Internal Server Error

Server error (rare, returns fallback data instead):

```json
{
  "error": "Internal server error"
}
```

## Validation

### Username Validation

The endpoint validates GitHub usernames using this pattern:

```tsx
function isValidUsername(username: string): boolean {
  // GitHub usernames can only contain:
  // - Alphanumeric characters (a-z, A-Z, 0-9)
  // - Hyphens (-)
  // - Maximum 39 characters
  return /^[a-zA-Z0-9-]{1,39}$/.test(username);
}
```

### Security: Username Restriction

For security reasons, the endpoint **only allows fetching data for the portfolio owner** (`dcyfr`):

```tsx
if (username !== ALLOWED_USERNAME) {
  return 403 Forbidden;
}
```

**Rationale:**
- Prevents unauthorized data access
- Avoids scraping GitHub for all users
- Respects GitHub API terms of service
- Reduces unnecessary API calls

### Valid Username Examples

```
✅ valid
✅ Valid
✅ valid-user
✅ valid123
✅ v
❌ valid@user (contains invalid character)
❌ valid user (contains space)
❌ very-long-username-that-exceeds-39-characters-limit (too long)
```

## Rate Limiting

### Configuration

```tsx
const RATE_LIMIT_CONFIG = {
  limit: 10,             // 10 requests
  windowInSeconds: 60,   // per 60 seconds
};
```

### Behavior

- **First request**: 200 OK, remaining: 9
- **Requests 2-9**: 200 OK, remaining decreases
- **Tenth request**: 200 OK, remaining: 0
- **Eleventh request**: 429 Too Many Requests
- After 60 seconds: Counter resets

### Rate Limit Headers

Standard headers included in all responses:

```
X-RateLimit-Limit: 10              // Max requests per window
X-RateLimit-Remaining: 7           // Requests left in this window
X-RateLimit-Reset: 1729720945000   // Millisecond Unix timestamp
```

### Client Retry Logic

```tsx
async function fetchWithRetry(username, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `/api/github-contributions?username=${username}`
    );

    if (response.status === 429) {
      const retryAfter = parseInt(
        response.headers.get('retry-after') || '60'
      );
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => 
          setTimeout(resolve, retryAfter * 1000)
        );
        continue;
      }
    }

    return response;
  }
}
```

## Caching Strategy

### Server-Side Cache

The endpoint implements a **1-hour server-side cache** to reduce GitHub API calls:

```
Request arrives
    ↓
Check server-side cache
    ├─ Hit (< 1 hour old) → Return cached data
    └─ Miss (expired/new) → Fetch from GitHub API
         ↓
         Store in cache
         ↓
         Return data
```

### Cache Key

```tsx
// Single cache entry for the hardcoded username
cachedData = {
  data: ContributionResponse,
  timestamp: Date.now()
}
```

### Cache Duration

```tsx
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
```

### Fallback Data Caching

When GitHub API fails, fallback data is cached for **only 1 minute** to allow recovery:

```tsx
// Cache fallback for shorter duration
cachedData = {
  data: fallbackResponse,
  timestamp: Date.now() - (CACHE_DURATION - 60000)
  // Expires in 1 minute instead of 5
}
```

### HTTP Caching Headers

The endpoint includes standard HTTP cache headers for browser/CDN caching:

**On Success:**
```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200
X-Cache-Status: MISS (first request) or HIT (subsequent)
```

**On Fallback:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
X-Cache-Status: FALLBACK
```

### Cache Timing

```
Client Request 1 (0s)
    → Fetch from GitHub API
    → Cache result
    → Return (source: "github-api")

Client Request 2 (30s)
    → Cache hit
    → Return cached (source: "server-cache")

Client Request 3 (5min 30s)
    → Cache expired
    → Fetch from GitHub API
    → Return (source: "github-api")
```

## GitHub API Integration

### GraphQL Query

The endpoint uses GitHub's GraphQL API:

```graphql
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
```

### Authentication

**With `GITHUB_TOKEN`:**
```tsx
headers: {
  'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
}
```
- Rate limit: 5,000 requests/hour
- No write permissions needed
- Read-only access sufficient

**Without `GITHUB_TOKEN`:**
```tsx
headers: {
  'Authorization': ''  // Empty, not sent
}
```
- Rate limit: 60 requests/hour
- Still works but limited
- Warning message returned

### Request Headers

```tsx
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${GITHUB_TOKEN}` || '', // Only if configured
  'User-Agent': '{your-domain}-portfolio',
}
```

### Timeout

Requests have a **10-second timeout** to prevent hanging:

```tsx
signal: AbortSignal.timeout(10000)
```

## Fallback Data

When the GitHub API is unavailable or returns invalid data, the endpoint generates realistic synthetic contribution data:

### Fallback Data Generation

```tsx
function generateFallbackData(): ContributionDay[] {
  // Generate data for past year (365 days)
  // Pattern:
  // - Weekdays: 70% chance of 0-12 contributions
  // - Weekends: 30% chance of 0-5 contributions
  // - Creates realistic-looking activity patterns
}
```

### When Fallback is Used

- GitHub API unreachable
- Network timeout (10 seconds)
- GraphQL query error
- Invalid API response structure
- Rate limited by GitHub

### Fallback Response

```json
{
  "contributions": [
    { "date": "2025-10-24", "count": 5 },
    { "date": "2025-10-23", "count": 0 },
    ...
  ],
  "totalContributions": 1234,
  "source": "fallback",
  "warning": "Unable to fetch live data."
}
```

### Recovery

Once GitHub API recovers, normal data will be fetched within 1 minute (fallback cache TTL).

## Data Format

### Contribution Object

```tsx
interface ContributionDay {
  date: string;   // ISO 8601 date: "2025-10-24"
  count: number;  // Integer >= 0
}
```

### Date Range

- **End Date**: Today (current date)
- **Start Date**: Exactly 1 year ago
- **Duration**: 365 days

### Example Data

```json
{
  "contributions": [
    { "date": "2024-10-24", "count": 0 },    // 1 year ago
    { "date": "2024-10-25", "count": 3 },
    { "date": "2024-10-26", "count": 5 },
    ...
    { "date": "2025-10-22", "count": 2 },
    { "date": "2025-10-23", "count": 0 },
    { "date": "2025-10-24", "count": 5 }     // Today
  ],
  "totalContributions": 1234,
  "source": "github-api"
}
```

## Usage Examples

### Basic Fetch

```tsx
// Simple fetch
const response = await fetch('/api/github-contributions?username=dcyfr');
const data = await response.json();

console.log(`Total contributions: ${data.totalContributions}`);
console.log(`Data source: ${data.source}`);

if (data.warning) {
  console.warn(`Warning: ${data.warning}`);
}
```

### With Error Handling

```tsx
async function getContributions(username) {
  try {
    const response = await fetch(
      `/api/github-contributions?username=${username}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new Error(`Rate limited. Retry after ${retryAfter}s`);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch contributions:', error);
    return null;
  }
}
```

### React Component

```tsx
'use client';

import { useEffect, useState } from 'react';

export function GitHubStats({ username = 'dcyfr' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/github-contributions?username=${username}`
        );
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error);
        }

        setData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <p>Total contributions: {data?.totalContributions}</p>
      <p>Data from: {data?.source}</p>
      {data?.warning && <p>⚠️ {data.warning}</p>}
    </div>
  );
}
```

## Testing

### Manual Testing

```bash
# Success case
curl "http://localhost:3000/api/github-contributions?username=dcyfr"

# Invalid username format
curl "http://localhost:3000/api/github-contributions?username=invalid@user"

# Unauthorized username
curl "http://localhost:3000/api/github-contributions?username=torvalds"

# Missing username
curl "http://localhost:3000/api/github-contributions"

# Rate limit test (make 11+ requests rapidly)
for i in {1..15}; do
  curl "http://localhost:3000/api/github-contributions?username=dcyfr"
  echo "Request $i"
done
```

### Development Testing

Check cache behavior:

```bash
# First request (cache miss)
curl -i "http://localhost:3000/api/github-contributions?username=dcyfr"
# Look for: X-Cache-Status: MISS

# Second request (cache hit)
curl -i "http://localhost:3000/api/github-contributions?username=dcyfr"
# Look for: X-Cache-Status: HIT and source: "server-cache"

# After 1 hour
# Cache expires, next request shows source: "github-api"
```

### Unit Test Example (Playwright)

```tsx
import { test, expect } from '@playwright/test';

test.describe('GET /api/github-contributions', () => {
  test('should fetch contributions successfully', async ({ page }) => {
    const response = await page.request.get(
      '/api/github-contributions?username=dcyfr'
    );

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.contributions).toBeInstanceOf(Array);
    expect(data.totalContributions).toBeGreaterThan(0);
    expect(['github-api', 'server-cache', 'fallback']).toContain(data.source);
  });

  test('should reject invalid username', async ({ page }) => {
    const response = await page.request.get(
      '/api/github-contributions?username=invalid@user'
    );

    expect(response.status()).toBe(400);
  });

  test('should reject unauthorized username', async ({ page }) => {
    const response = await page.request.get(
      '/api/github-contributions?username=torvalds'
    );

    expect(response.status()).toBe(403);
  });

  test('should rate limit after 10 requests', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      const response = await page.request.get(
        '/api/github-contributions?username=dcyfr'
      );
      expect(response.status()).toBe(200);
    }

    const response = await page.request.get(
      '/api/github-contributions?username=dcyfr'
    );
    expect(response.status()).toBe(429);
  });

  test('should include rate limit headers', async ({ page }) => {
    const response = await page.request.get(
      '/api/github-contributions?username=dcyfr'
    );

    expect(response.headers()['x-ratelimit-limit']).toBe('10');
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers()['x-ratelimit-reset']).toBeDefined();
  });
});
```

## Performance

### Response Times

| Scenario | Time | Notes |
|----------|------|-------|
| Cache hit | 20ms | Fastest path |
| GitHub API | 500-1000ms | Depends on GitHub |
| Fallback | 50ms | Synthetic data |
| Rate limited | 5ms | Instant error |

### Data Size

```
Contributions array: 365 items (1 year)
Per item: ~40 bytes
Total JSON: ~15KB gzipped
```

### Optimization Tips

1. **Client-side caching**: Cache results on client for hours
2. **Batch requests**: Group multiple fetches together
3. **Use fallback**: Fallback data loads instantly
4. **Monitor rate limits**: Watch X-RateLimit-Remaining header

## Security

### Data Protection

- ✅ Input validation (username format)
- ✅ Access control (only portfolio owner)
- ✅ Rate limiting (10 req/min per IP)
- ✅ No sensitive data in responses
- ✅ HTTPS only (enforced by Vercel)

### API Token Security

If using `GITHUB_TOKEN`:
- Only set in environment variables
- Never commit to code
- No write permissions needed
- Can be safely disclosed (read-only, scoped)

## Environment Configuration

### Required

None - endpoint works without environment variables

### Optional

**`GITHUB_TOKEN`**
- GitHub Personal Access Token
- Increases rate limit from 60 to 5,000 req/hour
- Recommended for production
- See GitHub docs for token creation

**`REDIS_URL`**
- Redis connection string
- Used for distributed rate limiting
- Falls back to in-memory if not set
- Recommended for production

## Related Documentation

- **API Overview:** `overview.md`
- **Contact Endpoint:** `contact.md`
- **GitHub Heatmap Component:** `docs/components/github-heatmap.md`
- **Rate Limiting:** `src/lib/rate-limit.ts`
- **Environment Variables:** `docs/platform/environment-variables.md`

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 429 Too Many Requests | Rate limit exceeded | Wait 60s, check X-RateLimit headers |
| 400 Invalid username | Bad format | Use alphanumeric + hyphens only |
| 403 Unauthorized | Wrong username | Only "dcyfr" is allowed |
| Stale data | Cache not expired | Wait 1 hour or restart |
| Fallback data | GitHub API down | Wait for GitHub to recover |
| No data | Invalid response | Check GitHub API status |

## Changelog

- **2025-10-24** - Initial GitHub contributions API documentation
