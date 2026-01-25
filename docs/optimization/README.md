{/* TLP:CLEAR */}

# Analytics Documentation

Analytics dashboard documentation for tracking and analyzing blog post performance.

# Analytics Documentation

Analytics dashboard documentation for tracking and analyzing blog post performance.

## 🚀 Quick Links (Consolidated Guides)

- **[Tag Analytics (Complete)](./tag-analytics-consolidated)** - **Tag performance guide** (features + implementation + setup)
- **[24h Trends (Complete)](./24h-trends-consolidated)** - **Real-time analytics guide** (metrics + dashboard + setup)

## Other Optimization Guides

- **[JSON-LD Implementation](./json-ld-implementation)** - Structured data for SEO
- **[Alt Text Guide](./alt-text-guide)** - Accessibility optimization
- **Canonical URL Audit** - URL structure optimization

## Overview

The analytics dashboard (`/analytics`) provides comprehensive insights into blog post performance with real-time data, filtering, and export capabilities.

### Key Features

1. **Real-Time Metrics**
   - Total posts and views
   - 24-hour trends with percentage change
   - Average views per post
   - Top performing posts

2. **Tag Analytics** 🆕
   - Performance metrics by tag
   - Post count per tag
   - Total and average views
   - 24-hour engagement trends
   - Interactive filtering

3. **Advanced Filtering**
   - Search by post title
   - Filter by tags (single or multiple)
   - Hide drafts/archived posts
   - Date range selection (24h, 7d, 30d, 90d, all-time)

4. **Data Export**
   - CSV format for spreadsheets
   - JSON format for programmatic analysis
   - Includes all metrics and metadata

5. **Auto-Refresh**
   - Optional 30-second auto-refresh
   - Manual refresh button
   - Last updated timestamp

## Access

The analytics dashboard is **development-only**:
- ✅ Available: `NODE_ENV=development`
- ❌ Returns 404: Production and preview environments

This ensures analytics data remains private and not exposed to the public.

## Metrics Explained

### View Counts

- **Total Views**: All-time view count for a post
- **Range Views**: Views within the selected date range (7d, 30d, etc.)
- **24h Views**: Views in the last 24 hours
- **Average Views**: Mean views per post

### Trending Algorithm

Posts are marked as "trending" based on:
1. Significant 24h activity (views > 0)
2. Recent engagement patterns
3. Velocity compared to historical performance

### Tag Performance

Tag metrics aggregate data from all posts with that tag:
- **Post Count**: Number of posts tagged
- **Total/Average Views**: Accumulated and mean performance
- **24h Trend**: Recent engagement with percentage change

## Using the Dashboard

### 1. Basic Navigation

Access the dashboard in development mode:
```bash
npm run dev
# Navigate to http://localhost:3000/analytics
```

### 2. Filtering Posts

**By Tags:**
- Click "Tags" dropdown in the control bar
- Check one or more tags to filter
- Or click tag rows in the Tag Analytics table
- Selected tags appear highlighted

**By Status:**
- ✓ Hide archived - Excludes archived posts
- ✓ Hide drafts - Excludes draft posts

**By Search:**
- Type in the search box to filter by title
- Filters apply in real-time

**Clear All:**
- Click "Clear All" to reset all filters

### 3. Date Range Selection

Change the time window for metrics:
- **24 Hours** - Today's performance (default)
- **7 Days** - Weekly trends
- **30 Days** - Monthly overview
- **90 Days** - Quarterly analysis
- **All Time** - Complete history

Range selection affects:
- Summary cards
- "Range Views" column in tables
- Tag analytics calculations

### 4. Sorting

Click any column header to sort:
- **Title** - Alphabetically
- **Views (All)** - Total views
- **Range Views** - Views in selected period
- **Views (24h)** - Recent engagement
- **Published** - Post date

Click again to toggle ascending/descending order.

### 5. Exporting Data

**CSV Export:**
```
Title,Slug,Views (All),Views (Range),Views (24h),Published,Tags,Archived,Draft
"Post Title",post-slug,1234,56,12,2025-01-01,"tag1, tag2",No,No
```

**JSON Export:**
```json
{
  "metadata": {
    "exportDate": "2025-11-08T12:00:00Z",
    "dateRange": "24 Hours",
    "filters": { ... },
    "sorting": { "field": "views", "direction": "desc" }
  },
  "summary": { ... },
  "posts": [ ... ]
}
```

## Tag Analytics

### Overview
The Tag Analytics section shows performance metrics for each content tag, helping you understand which topics drive the most engagement.

### Key Metrics
- **Post Count** - Number of posts with this tag
- **Total Views** - All-time views for posts with this tag
- **24h Views** - Recent engagement
- **Average Views** - Mean performance per post
- **Trend %** - 24-hour growth/decline

### Interactive Features
- **Click to Filter** - Click any tag row to filter posts
- **Top Rankings** - Top 3 tags by total views are highlighted
- **Visual Indicators** - Flame icons and trend percentages

### Use Cases
1. **Content Strategy** - Identify high-performing topics
2. **Audience Insights** - Understand reader interests
3. **SEO Optimization** - Prioritize tags with strong reach
4. **Content Balance** - Ensure diverse topic coverage

See **Tag Analytics Guide** for detailed documentation.

## Performance

### Data Source
- View counts: Redis database (with in-memory fallback)
- Post metadata: Static generation at build time
- Real-time updates: API polling at 30-second intervals (optional)

### Caching Strategy
- API responses cached for 1 minute (server-side)
- Client-side state management prevents unnecessary re-renders
- Tag calculations memoized based on filter state

### Optimization
- All filtering happens client-side (no API calls)
- Sorting is instant (in-memory)
- Table virtualization for large post lists (future enhancement)

## URL State Management

All dashboard settings persist in the URL:
```
/analytics?dateRange=7&sortField=views24h&sortDirection=desc&tags=nextjs,react&hideDrafts=true
```

Benefits:
- ✅ Shareable analytics views
- ✅ Bookmarkable configurations
- ✅ Browser back/forward navigation
- ✅ Deep linking support

## Troubleshooting

### Dashboard returns 404
**Cause:** Not in development mode  
**Fix:** Run `npm run dev` and access via localhost

### No view data showing
**Cause:** Redis not configured or no traffic yet  
**Fix:** Set up Redis (see [environment variables](../operations/environment-variables)) or wait for organic traffic

### Filters not working
**Cause:** JavaScript not loaded  
**Fix:** Check browser console for errors, ensure Next.js dev server is running

### Export downloads empty file
**Cause:** No posts match current filters  
**Fix:** Clear filters and try again

## API Reference

### GET `/api/analytics`

Query parameters:
- `days` - Date range (1, 7, 30, 90, or "all")

Response:
```typescript
{
  success: boolean;
  timestamp: string;
  dateRange: string;
  summary: {
    totalPosts: number;
    totalViews: number;
    totalViews24h: number;
    totalViewsRange: number;
    averageViews: number;
    // ... more metrics
  };
  posts: PostAnalytics[];
  trending: PostAnalytics[];
}
```

## Future Enhancements

Planned improvements:
- [ ] Tag performance charts (sparklines)
- [ ] Related tags analysis
- [ ] Custom date range picker
- [ ] Exportable tag analytics
- [ ] Historical trend visualization
- [ ] AI-powered content recommendations

## See Also

- [Blog System Architecture](../blog/architecture)
- View Tracking Implementation
- [Redis Configuration](../operations/environment-variables)
