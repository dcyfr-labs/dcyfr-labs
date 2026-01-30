<!-- TLP:CLEAR -->

# Public Analytics Dashboard

Development-only analytics dashboard for monitoring blog performance and viewing real-time statistics with responsive mobile-first design.

## Overview

The analytics dashboard provides comprehensive insights into blog post performance, including:
- **Total views** across all posts with 24-hour trends
- **Average views** per post with daily comparisons
- **Top-performing posts** (all-time and 24h rankings)
- **Trending posts** with hot/cold indicators
- **Complete post listing** with interactive filters
- **Real-time metrics** from Redis with trend analysis

**Important**: This dashboard is **only available in development mode** and will return a 403 error in preview or production environments.

## Features

### Summary Statistics (4 Cards)

1. **Total Posts**
   - Count of published blog posts
   - Respects draft/archived filters
   - Icon: FileText

2. **Total Views**
   - Cumulative views across all posts
   - Shows 24h views as secondary metric
   - Icon: Eye
   - Format: `1,234` (locale-formatted with commas)

3. **Average Views**
   - Mean views per post
   - Shows 24h average as secondary metric  
   - Icon: TrendingUp
   - Format: `417` (locale-formatted)

4. **24h Trend**
   - Total views in last 24 hours
   - Trend percentage vs previous period
   - Visual indicators: ⬆️ green (positive), ⬇️ red (negative), ➖ gray (neutral)
   - Icon: Flame (🔥)
   - Format: `+15%` or `-5%`

### Filter Controls

Interactive checkboxes with enhanced touch targets:
- **Hide drafts** - Exclude draft posts from all metrics
- **Hide archived** - Exclude archived posts from all metrics
- Minimum 44px touch targets for mobile accessibility
- Cursor pointer on hover
- Real-time filtering (no page reload)

### Top Posts (2 Cards)

#### All-Time Top Post
- Single highest-viewed post overall
- Shows total views prominently
- Displays 24h views as secondary metric
- Direct link to post with 44px touch target
- Card layout: Title → Total views → 24h views → Link

#### Trending Post (24h)
- Hottest post in last 24 hours
- Shows 24h views prominently
- Displays total views as secondary metric
- Flame icon (🔥) indicator
- Card layout: Title → 24h views → Total views → Link

### Trending Posts Grid

Top 3 trending posts from Inngest calculations:
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Each card shows:
  - Post title (line-clamp-2 for overflow)
  - Post summary (line-clamp-2, ~150 chars)
  - 24h views badge (with flame icon)
  - All-time views badge
  - Reading time
  - View link with touch target
- Hover effects: shadow-md transition

### Complete Post Table

Full listing with responsive design:
- **Mobile** (< 768px): Title, All-time views, 24h views
- **Tablet** (≥ 768px): + Published date
- **Desktop** (≥ 1024px): + Tags column
- **Sorting**: Highest views first (all-time)
- **Interactive rows**: Hover background color
- **Touch-optimized links**: 44px minimum target
- **Flame indicators**: 🔥 icon for posts with 24h activity
- **Badge system**: Draft/Archived status badges
- **Tag overflow**: Shows first 2 tags + "+N more" badge
- **Horizontal scroll**: Overflow-x-auto for narrow screens

### Data Sources
- **View Counts**: Real-time from Redis (via `src/lib/views.ts`)
- **Trending Data**: From Inngest calculations (if available)
### Data Sources

- **View Counts**: Real-time from Redis (via `src/lib/views.ts`)
  - All-time views per post (key: `post:views:${postId}`)
  - 24-hour views (key: `post:views24h:${postId}`)
  - Updated on every post view via `/api/views/[postId]/increment`
  
- **Trending Data**: From Inngest calculations (if available)
  - Scheduled background job calculates trending posts
  - Stored in Redis: `trending:posts`
  - Updated periodically
  
- **Post Metadata**: From blog post frontmatter
  - Title, slug, summary, tags
  - Publication date
  - Draft/archived status
  - Reading time calculations

## Responsive Design

### Breakpoints

- **Mobile** (< 640px): 
  - 2-column grid for summary cards
  - Stacked top posts (1 column)
  - Single-column trending posts
  - Table shows: Title, Views (All), Views (24h)
  - Touch targets: minimum 44px height

- **Tablet** (640px - 767px):
  - 2-column grid for summary cards
  - 2-column top posts
  - 2-column trending grid
  - Table shows: Title, Views (All), Views (24h)

- **Tablet+ (768px - 1023px)**:
  - 4-column grid for summary cards
  - 2-column top posts
  - 2-column trending grid
  - Table adds: Published date column

- **Desktop** (≥ 1024px):
  - 4-column grid for summary cards
  - 2-column top posts  
  - 3-column trending grid
  - Table adds: Tags column
  - Optimized spacing and padding

### Touch Targets & Accessibility

- **Minimum touch target**: 44px × 44px (WCAG 2.1 AA)
- **Applied to**:
  - Filter checkboxes with labels
  - All interactive links (post titles, "View post →")
  - Table row links
- **Implementation**: `.touch-target` utility class
  - Adds minimum height/padding for sufficient clickable area
  - Consistent across all interactive elements

### Padding & Spacing

- **Progressive padding**: Increases with screen size
  - Container: `px-4 sm:px-6 md:px-8`
  - Cards: `p-4 sm:p-6`
  - Gaps: `gap-4 sm:gap-6`
- **Consistent spacing**: `mb-8` for major sections
- **Card headers**: `border-b border-border` for visual separation

## Usage

### Accessing the Dashboard

**Development Only:**
```
http://localhost:3000/analytics
```

**Preview/Production:**
Returns 403 Forbidden error

### API Endpoint

The dashboard uses the `/api/analytics` endpoint:

```bash
# Development
curl http://localhost:3000/api/analytics

# Preview/Production
curl https://preview.example.com/api/analytics
# Returns: { "error": "Analytics only available in development" }
```

### Response Format

```json
{
  "success": true,
  "timestamp": "2025-10-26T12:34:56.789Z",
  "summary": {
    "totalPosts": 3,
    "totalViews": 1250,
    "averageViews": 417,
    "topPost": {
      "slug": "hardening-tiny-portfolio",
      "title": "Hardening Developer Portfolio",
      "views": 500
    }
  },
  "posts": [
    {
      "slug": "hardening-tiny-portfolio",
      "title": "Hardening Developer Portfolio",
      "summary": "...",
      "publishedAt": "2025-10-20T00:00:00Z",
      "tags": ["security", "portfolio"],
      "views": 500,
      "readingTime": {
        "words": 2500,
        "minutes": 12,
        "text": "12 min read"
      }
    }
    // ... more posts
  ],
  "trending": [
    // Top trending posts from Inngest
  ]
}
```

## Architecture

### Files

- **`src/app/analytics/page.tsx`** - Server wrapper component
  - Enforces dev-only access via `assertDevOr404()`
  - Returns 404 in preview/production
  - Renders `AnalyticsClient` component

- **`src/app/analytics/AnalyticsClient.tsx`** - Main dashboard UI (client component)
  - Fetches data from `/api/analytics` on mount
  - Loading skeleton with structural matching
  - Error boundary with Card components
  - Interactive filters (hideDrafts, hideArchived)
  - Responsive layout with progressive padding
  - Touch-optimized interactive elements
  - Real-time trend calculations

- **`src/app/api/analytics/route.ts`** - Analytics API endpoint
  - Checks `NODE_ENV === "development"`
  - Returns 403 if not in development
  - Fetches view counts from Redis (all-time + 24h)
  - Combines with post metadata
  - Retrieves trending data from Inngest/Redis
  - Calculates summary statistics

### Data Flow

```
Dashboard Page (Server)
    ↓
    assertDevOr404() - Ensure dev environment
    ↓
AnalyticsClient (Client Component)
    ↓
    useEffect: fetch("/api/analytics")
    ↓
API Route (/api/analytics)
    ↓
    Check: isDev? → 403 if not
    ↓
    Get post data from posts.ts
    ↓
    Redis: Fetch view counts
      - post:views:${postId} (all-time)
      - post:views24h:${postId} (24h)
    ↓
    Redis: Fetch trending:posts (from Inngest)
    ↓
    Calculate summary statistics
    ↓
    Return JSON response
    ↓
AnalyticsClient
    ↓
    Filter posts (hideDrafts/hideArchived)
    ↓
    Calculate trends (24h % change)
    ↓
    Render dashboard sections
    Return JSON response
    ↓
Dashboard renders data
```

## Development-Only Implementation

### Environment Check

The API route checks `NODE_ENV === "development"`:

```typescript
const isDev = process.env.NODE_ENV === "development";

export async function GET() {
  if (!isDev) {
    return NextResponse.json(
      { error: "Analytics only available in development" },
      { status: 403 }
    );
  }
  // ... fetch and return analytics
}
```

### Build Behavior

- **Development**: `npm run dev` → Full analytics available
- **Production Build**: `npm run build` → Page builds but returns 403 at runtime
- **Preview**: Vercel preview deployments → Returns 403

## Data Sources

### Redis View Counts

View counts are stored in Redis with the key pattern:
```
views:post:{slug}
```

Example:
```
views:post:hardening-tiny-portfolio → 500
views:post:shipping-tiny-portfolio → 400
views:post:passing-comptia-security-plus → 350
```

### Inngest Trending Data

Trending posts are calculated hourly by the `calculateTrending` function in `src/inngest/blog-functions.ts`:

```
blog:trending → JSON array of trending posts
```

The trending calculation uses:
- Views in last 7 days
- Trending score = recent views × (recent/total ratio)
- Top 10 posts

### Post Metadata

Post data comes from `src/data/posts.ts`:
- Title, summary, slug
- Publication date
- Tags
- Reading time

## Performance Considerations

### Caching

- **View Counts**: Cached in Redis (persistent)
- **Trending Data**: Cached in Redis for 1 hour
- **Post Metadata**: Loaded at build time

### Optimization

- Uses `getMultiplePostViews()` for batch Redis queries
- Single Redis connection per request
- Graceful fallback if Redis unavailable
- Efficient sorting and filtering

## Troubleshooting

### Dashboard Shows 403 Error

**Cause**: Not running in development mode

**Solution**: 
```bash
npm run dev
# Then visit http://localhost:3000/analytics
```

### No View Data Showing

**Cause**: Redis not configured or no views tracked yet

**Solution**:
1. Ensure `REDIS_URL` environment variable is set
2. Visit blog posts to generate view data
3. Check Redis connection in logs

### Trending Data Not Showing

**Cause**: Inngest trending calculation hasn't run yet

**Solution**:
- Trending is calculated hourly
- Check Inngest dev UI at http://localhost:3001/api/inngest
- Manually trigger `calculateTrending` function if needed

## Future Enhancements

### Potential Features

1. **Charts & Graphs**
   - View trends over time
   - Post performance comparison
   - Tag-based analytics

2. **Time Range Filtering**
   - Last 7 days, 30 days, all time
   - Custom date ranges

3. **Export Functionality**
   - CSV export of analytics
   - PDF reports

4. **Advanced Metrics**
   - Bounce rate (if tracking)
   - Time on page
   - Referrer sources

5. **Alerts & Notifications**
   - Milestone notifications
   - Trending post alerts
   - Performance warnings

## Security Notes

- **Development Only**: No sensitive data exposed in production
- **No Authentication**: Assumes local development environment
- **Redis Access**: Uses existing Redis connection
- **No Rate Limiting**: Not needed for dev-only feature

## Related Documentation

- `/docs/features/github-integration.md` - GitHub contribution tracking
- `/docs/blog/architecture.md` - Blog system design
- `/docs/api/routes/overview.md` - API architecture
- `src/inngest/blog-functions.ts` - Inngest analytics functions
- `src/lib/views.ts` - View count utilities

## Files

- `src/app/analytics/page.tsx` - Dashboard UI
- `src/app/api/analytics/route.ts` - Analytics API
- `src/inngest/blog-functions.ts` - Inngest analytics functions
- `src/lib/views.ts` - View count utilities
- `src/data/posts.ts` - Post metadata
