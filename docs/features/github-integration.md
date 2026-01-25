{/* TLP:CLEAR */}

# GitHub Integration Guide

**Location:** Various (see Components & API Routes below)

**Status:** Production-Ready

## Overview

This guide provides a comprehensive overview of GitHub integration features in the portfolio. The project includes multiple GitHub-connected features that display contribution data, support GitHub-flavored markdown, and implement best practices for GitHub API integration.

## Features

### 1. GitHub Contributions Heatmap

**Visual display of GitHub contribution activity**

- **Component:** `GitHubHeatmap` (`src/components/github-heatmap.tsx`)
- **Data Source:** GitHub GraphQL API via `/api/github-contributions`
- **Display:** Calendar heatmap showing 1 year of contribution history
- **Colors:** 5-level intensity scale (empty → very high)
- **Location:** About page, portfolio sections

#### Key Characteristics

- Shows past 12 months of contributions
- Color-coded by activity intensity
- Total contribution count badge
- Link to GitHub profile
- Responsive design with horizontal scroll on mobile
- Error boundary with fallback UI

#### User Experience

```
GitHub Heatmap Component
├── Loading State: Skeleton loader
├── Success State: Rendered heatmap
│   ├── Color legend (less → more)
│   ├── Total contributions badge
│   └── Link to GitHub profile
└── Error State: Error boundary
    ├── Friendly error message
    ├── Retry button
    └── Fallback data (if cached)
```

### 2. GitHub GraphQL API Integration

**Server-side API for fetching contribution data**

- **Endpoint:** `GET /api/github-contributions?username={username}`
- **Rate Limit:** 10 requests/minute per IP
- **Caching:** 5-minute server-side cache
- **Authentication:** Optional `GITHUB_TOKEN` for higher limits
- **Fallback:** Synthetic data on API failure

#### What Gets Fetched

```graphql
{
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

#### Data Format

```json
{
  "contributions": [
    { "date": "2024-10-24", "count": 0 },
    { "date": "2024-10-25", "count": 5 },
    ...
    { "date": "2025-10-24", "count": 3 }
  ],
  "totalContributions": 1234,
  "source": "github-api",
  "warning": null
}
```

### 3. GitHub-Flavored Markdown Support

**Enhanced markdown rendering in blog posts**

- **Plugin:** `remark-gfm`
- **Features:**
  - Tables
  - Strikethrough (`~~text~~`)
  - Autolinks
  - Task lists
  - Footnotes

#### Example

```markdown
| Feature | Status |
|---------|--------|
| Tables | ✅ |
| ~~Strikethrough~~ | ✅ |
| Task lists | ✅ |

- [x] Completed task
- [ ] Pending task
```

Renders as styled table and task list in blog posts.

### 4. GitHub API Header Hygiene

**Clean HTTP headers based on authentication state**

- **Implementation:** Conditional header building
- **Behavior:**
  - With `GITHUB_TOKEN`: Sends `Authorization: Bearer ghp_xxx`
  - Without token: No Authorization header (unauthenticated)
- **Benefit:** Proper HTTP practices, clean requests

#### Code Pattern

```tsx
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'User-Agent': `${SITE_DOMAIN}-portfolio`,
};

// Only add if available
if (process.env.GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
}
```

## Setup & Configuration

### Environment Variables

#### Required
None - all GitHub features work without configuration

#### Recommended

**`GITHUB_TOKEN`**
- Personal Access Token from GitHub
- Increases rate limit: 60 → 5,000 requests/hour
- No write permissions needed

**Setup Steps:**

1. Visit https://github.com/settings/tokens
2. Create new token → Personal access tokens (classic)
3. Select scope: `public_repo` (read-only public data)
4. Copy token
5. Add to environment:

```bash
# .env.local (development)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# Vercel (production)
# Dashboard → Settings → Environment Variables
# GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

### Component Usage

**Basic integration:**

```tsx
import { GitHubHeatmap } from "@/components/github-heatmap";
import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary";

export function AboutPage() {
  return (
    <section>
      <h2>GitHub Activity</h2>
      <GitHubHeatmapErrorBoundary>
        <GitHubHeatmap username="dcyfr" />
      </GitHubHeatmapErrorBoundary>
    </section>
  );
}
```

### Security Restrictions

**Username Access Control:**

The API endpoint only allows fetching data for the portfolio owner (`dcyfr`):

```tsx
// Security: Only allow the hardcoded username
if (username !== ALLOWED_USERNAME) {
  return 403 Forbidden;
}
```

**Rationale:**
- Prevents scraping GitHub for arbitrary users
- Reduces unnecessary API calls
- Respects GitHub terms of service
- Protects privacy

## Rate Limiting

### Configuration

| Aspect | Detail |
|--------|--------|
| Limit | 10 requests/minute per IP |
| Window | 60 seconds |
| Storage | Redis (distributed) or memory (dev) |
| Headers | `X-RateLimit-*` included |

### Behavior

```
Requests 1-10:    ✅ 200 OK, X-RateLimit-Remaining decreases
Request 11:       ❌ 429 Too Many Requests
After 60 seconds: ✅ Counter resets
```

### Client Handling

```tsx
const response = await fetch('/api/github-contributions?username=dcyfr');

if (response.status === 429) {
  const retryAfter = response.headers.get('retry-after');
  console.log(`Rate limited. Retry after ${retryAfter}s`);
  // Wait and retry
}
```

## Caching Strategy

### Server-Side Cache

**5-minute TTL cache** reduces GitHub API calls:

```
Request 1 (0s)   → Fetch from API → Cache → Return (source: "github-api")
Request 2 (30s)  → Return from cache (source: "server-cache")
Request 3 (5m30s) → Cache expired → Fetch from API
```

### Fallback Caching

When API fails, fallback data is cached for **1 minute only**:

```tsx
const CACHE_DURATION = 5 * 60 * 1000;        // 5 minutes for live data
const FALLBACK_CACHE = 60 * 1000;             // 1 minute for fallback
```

**Why shorter TTL for fallback?**
- Allows recovery when API returns online
- Prevents stale data if API was temporarily down
- Encourages retries of real data

### HTTP Cache Headers

**Success Response:**
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
X-Cache-Status: MISS (first) or HIT (subsequent)
```

**Fallback Response:**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
X-Cache-Status: FALLBACK
```

### Monitoring Cache

In development, check cache badge on heatmap:

```tsx
{process.env.NODE_ENV === "development" && source === "server-cache" && (
  <Badge variant="outline" className="text-xs">
    cached
  </Badge>
)}
```

## Error Handling & Fallbacks

### API Error Scenarios

| Scenario | Behavior | Result |
|----------|----------|--------|
| GitHub API down | Returns fallback data | Show synthetic but realistic pattern |
| Network timeout | Returns fallback data | User sees activity (not live) |
| Rate limited | Returns fallback data | Warning shown to user |
| Invalid username | 403 Forbidden | Component error boundary catches |
| Missing token | Unauthenticated request | Still works, lower rate limit |

### Fallback Data Generation

Generates realistic 1-year pattern:

```tsx
// Weekday: 70% chance of 0-12 contributions
// Weekend: 30% chance of 0-5 contributions
// Creates natural-looking activity pattern
```

### Component Error Boundary

```tsx
<GitHubHeatmapErrorBoundary>
  {/* Component catches errors */}
</GitHubHeatmapErrorBoundary>
```

**Fallback UI:**
- Friendly error message
- Retry button
- Link to GitHub profile
- Development-only error details

## Performance Characteristics

### Response Times

| Path | Time | Notes |
|------|------|-------|
| Cache hit | 20ms | Fastest |
| API call | 500-1000ms | Depends on GitHub |
| Fallback | 50ms | Instant synthetic data |
| Rate limit | 5ms | Immediate rejection |

### Optimization Strategies

1. **Server-Side Cache:** 5-minute window reduces API load by ~95%
2. **Fallback Data:** Provides instant response on failure
3. **Rate Limiting:** Prevents abuse and excessive API calls
4. **Lazy Loading:** Component only fetches when rendered
5. **Conditional Headers:** Sends only necessary headers

### Bundle Impact

- Component: ~3KB gzipped
- Dependencies: `react-calendar-heatmap` (~15KB)
- Total: ~18KB gzipped for feature

## Authentication & Rate Limits

### Without `GITHUB_TOKEN` (Unauthenticated)

- Rate limit: **60 requests/hour**
- Suitable for: Personal use, demo
- Warning shown: Yes
- Cost: Free

### With `GITHUB_TOKEN` (Authenticated)

- Rate limit: **5,000 requests/hour**
- Suitable for: Production, high traffic
- Warning shown: No
- Cost: Free (personal use)

### Recommendation

For production deployments, set `GITHUB_TOKEN`:

**Benefits:**
- 83× higher rate limit (5,000 vs 60)
- Handles traffic spikes
- No warning message
- Free tier sufficient

**Setup:**
1. Create token at https://github.com/settings/tokens
2. Set in Vercel environment variables
3. Restart deployment

## Best Practices

### 1. Always Wrap with Error Boundary

```tsx
// ❌ DON'T
<GitHubHeatmap />

// ✅ DO
<GitHubHeatmapErrorBoundary>
  <GitHubHeatmap />
</GitHubHeatmapErrorBoundary>
```

### 2. Handle Rate Limits Gracefully

```tsx
if (response.status === 429) {
  const retryAfter = parseInt(response.headers.get('retry-after') || '60');
  // Wait and retry, or show friendly message
}
```

### 3. Monitor Cache Status

In development, check `source` field:

```tsx
console.log(`Data source: ${data.source}`); // "github-api", "server-cache", or "fallback"
```

### 4. Validate Environment Variables

```tsx
// Check token is set
if (process.env.GITHUB_TOKEN) {
  console.log('GitHub authentication enabled');
} else {
  console.log('Using unauthenticated rate limits (60/hour)');
}
```

### 5. Use Semantic HTML

Component uses:
- `<article>` for structure
- External link with `rel="noopener noreferrer"`
- Semantic cards and badges
- ARIA labels for accessibility

### 6. Plan for Graceful Degradation

```tsx
// Component works without token
// Component works with fallback data
// Component handles network errors
// User always sees something (loaded state)
```

## Monitoring & Debugging

### Development

**Enable detailed logging:**

```bash
npm run dev
```

Monitor console for:
- Rate limit decisions
- Cache hits/misses
- API call results
- Error messages

**Check response headers:**

```bash
curl -i "https://your-domain.com/api/github-contributions?username=dcyfr"
```

Look for:
- `X-Cache-Status: HIT|MISS|FALLBACK`
- `X-RateLimit-Remaining: N`
- `X-RateLimit-Reset: timestamp`

### Production (Vercel)

1. Navigate to Vercel Dashboard
2. Project → Functions
3. Filter by `/api/github-contributions`
4. Monitor:
   - Response times
   - Error rates
   - Cache status
   - Rate limit hits

### Health Check Script

```bash
#!/bin/bash
# Test GitHub contributions endpoint
curl -s "https://your-domain.com/api/github-contributions?username=dcyfr" | jq '.'

# Expected response:
# {
#   "contributions": [...],
#   "totalContributions": 1234,
#   "source": "github-api|server-cache|fallback",
#   "warning": null
# }
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Unable to Load" message | API error or rate limit | Check network tab, verify token |
| Fallback data shown | GitHub API down | Wait for recovery, check status |
| 429 Too Many Requests | Rate limit exceeded | Wait 60s, add GITHUB_TOKEN |
| Token not working | Wrong token format | Verify it's a valid PAT token |
| Cache always showing | Clock skew | Check server time sync |
| Component not rendering | Error not caught | Ensure ErrorBoundary is present |

## Migration Guide

### Adding to New Pages

```tsx
import { GitHubHeatmap } from "@/components/github-heatmap";
import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary";

export function NewFeaturePage() {
  return (
    <div>
      <h1>My GitHub Profile</h1>
      <GitHubHeatmapErrorBoundary>
        <GitHubHeatmap username="dcyfr" />
      </GitHubHeatmapErrorBoundary>
    </div>
  );
}
```

### Customizing the Component

**Change username:**
```tsx
<GitHubHeatmap username="torvalds" />
// ⚠️ Note: API only allows "dcyfr", will return 403
```

**Error boundary fallback:**
```tsx
<GitHubHeatmapErrorBoundary>
  <CustomFallback />
  <GitHubHeatmap />
</GitHubHeatmapErrorBoundary>
```

## Related Documentation

- **GitHub Heatmap Component:** `docs/components/github-heatmap.md`
- **GitHub API Endpoint:** `docs/api/routes/github-contributions.md`
- **API Overview:** `docs/api/routes/overview.md`
- **Rate Limiting:** `src/lib/rate-limit.ts`
- **Header Hygiene:** `docs/api/github-api-header-hygiene.md`

## External Resources

- [GitHub GraphQL API Docs](https://docs.github.com/en/graphql)
- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Personal Access Tokens](https://github.com/settings/tokens)

## Changelog

- **2025-10-24** - Initial GitHub Integration Guide
  - Documented heatmap component and API
  - Setup instructions for GITHUB_TOKEN
  - Caching strategy explanation
  - Best practices and troubleshooting

## Future Enhancements

Possible additions to GitHub integration:

- [ ] GitHub activity feed (recent contributions)
- [ ] Repository showcase (pinned repos)
- [ ] GitHub statistics dashboard (repos, followers)
- [ ] Contribution streak counter
- [ ] Social badges integration
- [ ] GitHub webhook support
- [ ] Multi-user profiles support

## Summary

The GitHub integration provides:

✅ **Visual contribution display** - Heatmap component  
✅ **Real-time data** - GraphQL API integration  
✅ **Resilience** - Fallback data, error boundaries  
✅ **Performance** - Server-side caching, rate limiting  
✅ **Security** - Access control, input validation  
✅ **Accessibility** - Semantic HTML, ARIA labels  
✅ **Flexibility** - Environment configuration, customization  

All features are production-ready and follow GitHub best practices.
