# Tag Analytics

Comprehensive tag performance analytics added to the `/analytics` dashboard (November 8, 2025).

## Overview

The Tag Analytics section provides insights into how content tags perform across your blog, helping you understand which topics resonate most with your audience.

## Features

### Metrics Per Tag
- **Post Count**: Number of posts with this tag
- **Total Views**: All-time views across all posts with this tag
- **Range Views**: Views within the selected date range (7 days, 30 days, etc.)
- **24h Views**: Views in the last 24 hours
- **Average Views**: Average views per post with this tag
- **Average 24h Views**: Average 24-hour views per post with this tag

### Visual Indicators
- **Top 3 Badge**: Tags ranked 1-3 by total views get a "Top N" badge
- **Trend Percentage**: Shows 24h growth/decline percentage with color coding:
  - 🟢 Green: Positive growth
  - 🔴 Red: Negative trend
- **Flame Icon** 🔥: Indicates active 24h engagement
- **Selected State**: Tags currently filtering the posts list are highlighted

### Interactive Filtering
- **Click to Filter**: Click any tag row to filter the posts table
- **Multi-Select**: Select multiple tags to combine filters
- **URL State**: Tag selections persist in the URL for sharing and bookmarking
- **Clear All**: Quick reset button to remove all filters

## Layout

The Tag Analytics table is positioned between the Top Posts cards and the Trending Posts section, providing a natural flow from overview metrics → tag performance → individual post performance.

### Column Layout
| Desktop | Tablet | Mobile |
|---------|--------|--------|
| Tag, Posts, Total, Range*, 24h, Avg, Avg(24h) | Tag, Posts, Total, Range*, 24h, Avg | Tag, Posts, Total, Range*, 24h |

*Range column only shows when date range filter is not "All Time"

## Sorting

Tags are automatically sorted by **Total Views** (descending), showing the highest-performing tags first. This makes it easy to identify your most popular content categories.

## Responsive Design

- **Mobile** (< 768px): Shows essential columns (Tag, Posts, Total, 24h)
- **Tablet** (768px - 1024px): Adds average views column
- **Desktop** (> 1024px): Shows all columns including 24h averages

## Integration with Existing Filters

Tag Analytics respects the dashboard's global filters:
- ✅ **Hide Drafts**: Excludes draft posts from tag calculations
- ✅ **Hide Archived**: Excludes archived posts from tag calculations
- ✅ **Date Range**: Adjusts the "Range Views" column accordingly
- ✅ **Search**: Tag list remains constant (doesn't filter by search)
- ✅ **Selected Tags**: Highlights selected tags in the table

## Use Cases

### Content Strategy
- Identify high-performing topics for future content planning
- Discover underutilized tags with potential
- Track tag performance trends over time

### Audience Insights
- Understand which topics drive the most engagement
- Compare average performance across different content categories
- Spot trending topics in the 24h window

### SEO and Discovery
- Prioritize tags with strong organic reach
- Identify opportunities to create more content in popular categories
- Balance content across tags to maintain diverse coverage

## Technical Implementation

### Data Calculation
```typescript
// Tag stats are computed client-side from post data
const tagAnalytics = allPosts.reduce((acc, post) => {
  for (const tag of post.tags) {
    if (!acc[tag]) acc[tag] = { postCount: 0, totalViews: 0, ... };
    acc[tag].postCount++;
    acc[tag].totalViews += post.views;
    acc[tag].totalViews24h += post.views24h;
    acc[tag].posts.push(post);
  }
  return acc;
}, {});
```

### Performance
- **Client-Side**: All calculations happen in the browser (no API calls)
- **Memoization**: Tag stats are recalculated only when filters change
- **Efficient**: Linear time complexity O(n) where n = number of posts

### Accessibility
- **Keyboard Navigation**: Full keyboard support for table navigation
- **Screen Readers**: Semantic HTML with proper ARIA labels
- **Focus Indicators**: Clear visual focus states for keyboard users
- **Click Targets**: Adequate touch target sizes (44x44px minimum)

## Future Enhancements

Potential improvements for future iterations:

1. **Tag Sorting Options**: Allow users to sort by different metrics (post count, 24h views, etc.)
2. **Tag Trends Chart**: Visualize tag performance over time with sparklines or mini-charts
3. **Related Tags**: Show which tags often appear together
4. **Tag Insights**: AI-powered suggestions for tag optimization
5. **Export Tag Data**: Include tag analytics in CSV/JSON exports
6. **Tag Comparison**: Side-by-side comparison of 2-3 tags

## See Also

- [Analytics Dashboard Documentation](./dashboard)
- [24h Trends Guide](./24h-trends)
- [Blog Tag System](../blog/frontmatter-schema#tags)
