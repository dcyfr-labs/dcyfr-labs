<!-- TLP:CLEAR -->

# GitHub Heatmap Component

**Location:** `src/components/github-heatmap.tsx`

**Type:** Client Component (`"use client"`)

**Dependencies:** `react-calendar-heatmap`, Error Boundary, Skeleton Loader, API Route

## Overview

The `GitHubHeatmap` component displays a visual calendar heatmap of GitHub contributions for a user. It integrates with the GitHub GraphQL API via the `/api/github-contributions` endpoint to fetch contribution data for the past year and render an interactive heatmap similar to GitHub's own contribution graph.

## Features

- **Contribution Visualization**: Color-coded heatmap showing activity intensity (less → more)
- **One-Year Window**: Displays contributions for the past 12 months
- **Server-Side Caching**: 1-hour cache with fallback data to reduce API calls
- **Rate Limiting**: Per-IP rate limiting (10 requests/minute)
- **Error Handling**: Wrapped in error boundary with graceful degradation
- **Loading States**: Skeleton loader while data is fetching
- **Responsive**: Horizontal scrolling support for smaller screens
- **Accessible**: Semantic HTML with external link to GitHub profile
- **Development Indicators**: Shows cache status in development mode
- **Fallback Data**: Generates realistic synthetic data if API unavailable
- **Statistics**: Displays total contribution count and data source

## Usage

### Basic Usage

Wrap the component with its error boundary:

```tsx
import { GitHubHeatmap } from "@/components/github-heatmap";
import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary";

export function AboutPage() {
  return (
    <GitHubHeatmapErrorBoundary>
      <GitHubHeatmap username="dcyfr" />
    </GitHubHeatmapErrorBoundary>
  );
}
```

### Props

```tsx
interface GitHubHeatmapProps {
  username?: string;  // GitHub username (default: "dcyfr")
}
```

The component can be used with or without explicit username:

```tsx
// Uses default username (dcyfr)
<GitHubHeatmap />

// Custom username
<GitHubHeatmap username="torvalds" />
```

## Architecture

### Component Flow

```
GitHubHeatmap (Client Component)
├── useEffect: Fetch data on mount/username change
├── /api/github-contributions endpoint
│   ├── Rate limiting check
│   ├── Server-side cache check (1 hour)
│   └── GitHub GraphQL API (if not cached)
├── Loading state → GitHubHeatmapSkeleton
└── Render heatmap with CalendarHeatmap + metadata
```

### Data Flow

```
Client Request
    ↓
Rate Limit Check (per IP)
    ↓
Cache Check (1 hour TTL)
├─ Hit → Return cached data
└─ Miss → Fetch from GitHub API
         ↓
         GitHub GraphQL Query
         ├─ Success → Cache + Return
         └─ Error → Return fallback data
```

## API Integration

### Endpoint: `/api/github-contributions`

**Method:** `GET`

**Query Parameters:**
- `username` (required) - GitHub username to fetch contributions for

**Response Format:**

```tsx
interface ContributionResponse {
  contributions: Array<{
    date: string;        // ISO date (YYYY-MM-DD)
    count: number;       // Number of contributions
  }>;
  totalContributions: number;
  source: "github-api" | "server-cache" | "fallback";
  warning?: string;      // Only present if unauthenticated or errors
}
```

**Example Response:**

```json
{
  "contributions": [
    { "date": "2024-10-24", "count": 5 },
    { "date": "2024-10-23", "count": 0 },
    { "date": "2024-10-22", "count": 12 }
  ],
  "totalContributions": 1234,
  "source": "github-api",
  "warning": "Using unauthenticated GitHub API (subject to rate limits)"
}
```

### Security Features

1. **Username Restriction**: Only allows fetching data for the hardcoded portfolio owner (`dcyfr`)
   - Prevents unauthorized data access
   - Returns 403 Forbidden for other usernames

2. **Input Validation**: GitHub username format validation
   - Alphanumeric + hyphens only
   - Maximum 39 characters
   - Prevents injection attacks

3. **Rate Limiting**: Per-IP rate limiting
   - Limit: 10 requests/minute per IP
   - Returns 429 Too Many Requests with `Retry-After` header
   - Tracks via Redis with graceful in-memory fallback

4. **Authentication Header**: Only sends `Authorization` header if `GITHUB_TOKEN` is configured
   - Prevents unnecessary header leaks
   - Increases rate limits from 60 to 5,000 req/hour when token present

## Caching Strategy

### Server-Side Caching (1 hour)

```
First Request
  ├─ Fetch from GitHub API
  ├─ Cache result in memory
  └─ Return with X-Cache-Status: MISS

Subsequent Requests (within 1 hour)
  ├─ Check cache
  ├─ Return cached result
  └─ Return with X-Cache-Status: HIT

Cache Expired (after 1 hour)
  └─ Repeat process
```

### HTTP Cache Headers

- **Success (GitHub API)**: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200`
- **Fallback Data**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`
- **Rate Limit Hit**: No caching

### Response Headers

| Header | Value | Meaning |
|--------|-------|---------|
| `X-Cache-Status` | MISS, HIT, FALLBACK | Cache hit/miss indicator |
| `X-RateLimit-Limit` | 10 | Rate limit cap |
| `X-RateLimit-Remaining` | 7 | Remaining requests |
| `X-RateLimit-Reset` | timestamp | When limit resets |
| `Retry-After` | 45 | Seconds to retry (429 only) |

## Fallback Data

When the GitHub API is unavailable, the endpoint generates realistic synthetic contribution data:

**Pattern Logic:**
- Weekends: 30% activity chance (0-5 contributions)
- Weekdays: 70% activity chance (0-12 contributions)
- Spans past year (365 days)
- Includes zero-activity days

**When Used:**
- GitHub API unavailable
- Network timeout
- Invalid API response
- Rate limited by GitHub

**Caching:** Fallback data cached for only 1 minute to allow recovery when API recovers

## Color Scale

The heatmap uses a 5-level color scale:

| Level | Range | Color | Usage |
|-------|-------|-------|-------|
| Empty | 0 | Gray (muted) | No contributions |
| 1 | 1-2 | Green-200 / Green-900 (dark) | Low activity |
| 2 | 3-5 | Green-400 / Green-700 (dark) | Moderate activity |
| 3 | 6-8 | Green-600 / Green-500 (dark) | High activity |
| 4 | 9+ | Green-800 / Green-300 (dark) | Very high activity |

Colors automatically adapt to light/dark theme via CSS class names and Tailwind dark mode.

## Error Boundary Integration

### GitHubHeatmapErrorBoundary

Located in `src/components/github-heatmap-error-boundary.tsx`

**Catches:**
- API fetch errors
- Invalid response data
- Network timeouts
- Rate limit errors
- GraphQL errors

**Fallback UI:**
- Amber-colored card with warning icon
- User-friendly error message
- "Try Again" button to retry
- "View on GitHub" link to profile
- Development-only error details in collapsible section

### Error Handling in Component

```tsx
try {
  const response = await fetch(`/api/github-contributions?username=${username}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch contributions: ${response.status}`);
  }
  const data = await response.json();
  // Process data
} catch (err) {
  // Thrown error caught by error boundary
  throw new Error(err.message || "Failed to load GitHub contributions");
}
```

## Loading States

### GitHubHeatmapSkeleton

While data is loading, displays a skeleton that matches the actual component structure:
- **Header skeleton** - Title + username link
- **Statistics grid** - 4 stat cards (current streak, longest streak, total contributions, avg/day)
- **Heatmap grid** - 53 weeks × 7 days contribution grid
- **Footer skeleton** - Total contributions summary + date range

**Structure:**
```tsx
Card with p-6 padding
├── Header (title + username)
├── Statistics Grid (2x2 on mobile, 4 columns on desktop)
│   └── 4 stat cards with label, value, and unit
├── Heatmap Grid (53 weeks × 7 days with overflow-x-auto)
└── Footer (contributions summary + date range)
```

Provides visual feedback that content is loading without layout shift or page jump.

## Component Rendering

### Layout Structure

```tsx
<Card>
  {/* Header */}
  <h3>GitHub Activity</h3>
  HTML anchor@username <ExternalLink /></a>

  {/* Warning banner (if present) */}
  {warning && <WarningCard>{warning}</WarningCard>}

  {/* Content */}
  <CalendarHeatmap {...props} />

  {/* Footer stats */}
  <Legend />
  <Badges>
    <TotalContributions />
    {isDevelopment && <CacheBadge />}
  </Badges>
</Card>
```

### Date Range

- **End Date**: Today
- **Start Date**: 1 year ago
- **Span**: 365 days

## Development Features

### Cache Badge

In development mode (when `source === "server-cache"`), shows a "cached" badge to indicate data was served from cache.

```tsx
{process.env.NODE_ENV === "development" && source === "server-cache" && (
  <Badge variant="outline" className="text-xs text-muted-foreground">
    cached
  </Badge>
)}
```

### Error Details

In development mode, error fallback shows:
- Full error message
- Stack trace (first 5 lines)
- Collapsible details

In production, only user-friendly message shown.

## Performance Considerations

### Optimization Strategies

1. **Server-Side Caching**: Reduces GitHub API calls by 95%+
2. **Image Lazy Loading**: If heatmap is below fold, loads on demand
3. **Minimal Dependencies**: Only `react-calendar-heatmap` library
4. **Efficient Re-renders**: Only refetches on username change
5. **Network Optimization**: Single API call per component instance

### Bundle Impact

- Component size: ~3KB (gzipped)
- `react-calendar-heatmap` library: ~15KB (shared)
- CSS: ~2KB (calendar styles)

## Accessibility

### ARIA & Semantics

```tsx
HTML anchor
  @username
  <ExternalLink className="w-3 h-3" />
</a>
```

- External link properly marked with `target="_blank"` and `rel="noopener noreferrer"`
- Icon included for visual feedback
- Semantic `<a>` tag for keyboard navigation

### Color Contrast

- Dark mode verified for WCAG AA compliance
- Light mode verified for WCAG AA compliance
- See `docs/operations/color-contrast-improvements.md` for full audit

## Environment Configuration

### Required

None - component works without environment variables.

### Optional

**`GITHUB_TOKEN`** (API route only)
- GitHub Personal Access Token
- Increases rate limit from 60 to 5,000 requests/hour
- If not set, uses unauthenticated rate limits
- No write permissions needed (read-only)

## Integration Points

### Where It's Used

- About page
- Portfolio/resume page
- Developer profiles
- Team pages

### Current Usage

- Rendered on the About page with error boundary
- Username defaults to portfolio owner (`dcyfr`)

### Adding to New Pages

```tsx
import { GitHubHeatmap } from "@/components/github-heatmap";
import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary";

export default function NewPage() {
  return (
    <section>
      <h2>My GitHub Activity</h2>
      <GitHubHeatmapErrorBoundary>
        <GitHubHeatmap />
      </GitHubHeatmapErrorBoundary>
    </section>
  );
}
```

## Testing

### Manual Testing

1. **Cache Hit**: Reload page within 5 minutes → should see "cached" badge
2. **Cache Miss**: Wait 5+ minutes → should see new "github-api" source
3. **Error Handling**: Disconnect network → should show error boundary with fallback
4. **Rate Limiting**: Make 15+ requests in 1 minute → should get 429 response
5. **Accessibility**: Use screen reader → should announce all elements

### Development Testing

```bash
# Clear cache by restarting dev server
npm run dev

# Monitor API calls in browser Network tab
# Look for X-Cache-Status header
```

## Related Files

| File | Purpose |
|------|---------|
| `src/components/github-heatmap.tsx` | Main component |
| `src/components/github-heatmap-error-boundary.tsx` | Error handling |
| `src/components/github-heatmap-skeleton.tsx` | Loading state |
| `src/app/api/github-contributions/route.ts` | API endpoint |
| `src/lib/rate-limit.ts` | Rate limiting utility |
| `react-calendar-heatmap` | Calendar rendering library |

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Shows "Unable to Load" | API error or rate limit | Check network tab for 429 or error |
| Shows fallback data | GitHub API offline | Temporary; will recover |
| Cache always shows | Clock skew | Verify server time sync |
| No contributions | Wrong username | Check username parameter |
| Mobile layout broken | Small screen width | Horizontal scroll should work |

## Changelog

- **2025-10-20** - Refactored to work with error boundaries; removed component-level caching
- **2025-10-18** - Initial implementation with server-side caching and rate limiting
