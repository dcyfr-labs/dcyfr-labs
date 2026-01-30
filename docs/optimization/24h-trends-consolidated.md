<!-- TLP:CLEAR -->
# 24-Hour Trends Analytics - Complete Guide

**Status:** ✅ Complete (November 8, 2025)  
**Location:** `/analytics` dashboard  
**Files Consolidated:** 24h-trends.md, 24h-trends-quick-ref.md

---

## 🚀 Quick Reference

### What Changed (5-Second Overview)

Your analytics dashboard now tracks **24-hour trends** for all posts and metrics. See which posts are gaining traction right now, not just historically.

### New Metrics At-a-Glance

| Metric | Old (All-time) | New (24h) | Purpose |
|--------|----------------|-----------|---------|
| **Post Views** | `views: 1,234` | `views24h: 45` | Real-time engagement |
| **Trend %** | N/A | `+15% ↑` / `-8% ↓` | Growth direction |
| **Dashboard Summary** | Total: 1,234 | Total: 1,234 (45 in 24h) | Breakdown visibility |
| **Top Post Card** | All-time leader | All-time + 24h data | Complete picture |

### Quick Commands

```bash
# Access 24h trends
Navigate to: /analytics → All metrics show 24h data

# View trending posts
Check: "🔥 Trending (24h)" card → Top performers

# Monitor growth
Look for: Green ↑ arrows (growth) vs Red ↓ arrows (decline)
```

---

## 📋 Implementation Details

### Complete Feature Overview

The analytics system now supports 24-hour trend tracking across all metrics. This allows you to see which posts are trending in real-time and how your blog's overall performance is changing over the last 24 hours.

### New Metrics System

#### Per-Post 24-Hour Tracking

**New Fields Added:**
1. **24-Hour View Counts** (`views24h`)
   - Each post now tracks views from the last 24 hours separately
   - Displayed in analytics dashboard and trending sections
   - Automatically cleaned up after 24 hours

2. **Trend Percentage Calculation**
   - Compares current 24h period with previous 24h period
   - Shows percentage change: `+15%`, `-8%`, `+0%`
   - Color-coded indicators: Green (growth), Red (decline), Neutral (stable)

#### Dashboard 24-Hour Summaries

**Enhanced Summary Cards:**
1. **`totalViews24h`** - Total views in last 24 hours across all posts
2. **`averageViews24h`** - Average views per post in last 24 hours
3. **`topPost24h`** - Top trending post by 24-hour views
4. **`trend24hPercentage`** - Overall blog growth in last 24 hours

### Visual Indicators & UI Updates

#### Dashboard Cards Enhancement

**Total Views Card:**
```
Before: Total Views: 1,234
After:  Total Views: 1,234
        (45 in last 24h) ↑
```

**Average Views Card:**
```
Before: Average Views: 25
After:  Average Views: 25
        (3 avg in 24h) ↑
```

**New 24h Trend Card:**
```
24h Trend: 67 views
+12% ↑ 🔥
```

#### Top Posts Section Updates

**Existing "Top Post (All-time)" Card:**
- Still shows all-time leader
- Now includes 24h performance data
- Format: `"Post Title" - 1,234 views (23 in 24h)`

**New "🔥 Trending (24h)" Card:**
- Shows post with highest 24h views
- Displays trend percentage
- Updates in real-time

#### Posts Table Enhancements

**New Columns Added:**
- **24h Views**: Shows `views24h` count
- **Trend**: Shows percentage with color-coded arrows
  - 🟢 `+15% ↑` (Green for growth)
  - 🔴 `-8% ↓` (Red for decline)  
  - ⚪ `+0%` (Neutral for stable)

**Enhanced Sorting:**
- Sort by 24h views (trending now)
- Sort by trend percentage (biggest gainers/losers)
- Combined with existing total views sorting

### Technical Implementation

#### Data Structure Changes

```typescript
// Enhanced post analytics interface
interface PostAnalytics {
  slug: string;
  title: string;
  views: number;              // All-time views (existing)
  views24h: number;           // NEW: Last 24 hours
  trend24h: number;           // NEW: Percentage change
  tags: string[];
  publishedAt: string;
  // ... other fields
}

// Enhanced dashboard summary
interface DashboardSummary {
  totalPosts: number;
  totalViews: number;
  totalViews24h: number;      // NEW
  averageViews: number;
  averageViews24h: number;    // NEW
  topPost: PostAnalytics;
  topPost24h: PostAnalytics;  // NEW
  trend24hPercentage: number; // NEW
}
```

#### Data Collection Logic

**24-Hour View Tracking:**
```typescript
// Redis key pattern for 24h tracking
const view24hKey = `views:24h:${postSlug}:${currentHour}`;

// Store hourly buckets (24 buckets = 24 hours)
await redis.incr(view24hKey);
await redis.expire(view24hKey, 24 * 60 * 60); // Expire after 24 hours

// Calculate 24h total
const views24h = await redis.eval(`
  local sum = 0
  for i = 0, 23 do
    local key = KEYS[1] .. ":" .. ((ARGV[1] - i) % 24)
    sum = sum + (redis.call('GET', key) or 0)
  end
  return sum
`, 1, `views:24h:${postSlug}`, currentHour);
```

**Trend Calculation:**
```typescript
// Compare current 24h with previous 24h
const calculateTrend = (current24h: number, previous24h: number): number => {
  if (previous24h === 0) return current24h > 0 ? 100 : 0;
  return Math.round(((current24h - previous24h) / previous24h) * 100);
};
```

### Real-time Updates & Performance

#### Auto-refresh System
- **Dashboard Updates**: Every 5 minutes automatically
- **Manual Refresh**: Button available for instant updates
- **Live Indicators**: Show last update timestamp

#### Performance Optimizations
- **Caching**: 24h metrics cached for 5 minutes
- **Batch Processing**: Multiple post trends calculated together
- **Efficient Queries**: Redis operations optimized for speed

---

## ✅ Setup & Usage Checklist

### Initial Setup Verification

- [ ] **24-Hour Tracking Active**
  - [ ] Navigate to `/analytics` page
  - [ ] Verify "24h" columns appear in posts table
  - [ ] Check that 24h data is populating (may take 24h for full data)

- [ ] **Dashboard Updates**
  - [ ] Summary cards show 24h breakdowns
  - [ ] New "🔥 Trending (24h)" card appears
  - [ ] 24h trend card shows percentage with arrows

### Feature Testing Checklist

#### Basic 24h Functionality
- [ ] **View Tracking**
  - [ ] Visit a blog post → 24h count increases
  - [ ] Wait 5 minutes → analytics reflect new view
  - [ ] Check Redis → 24h keys are being created

- [ ] **Trend Calculations**  
  - [ ] Posts with recent views show positive trends
  - [ ] Older posts show neutral/negative trends
  - [ ] Trend percentages are reasonable (not inflated)

#### Dashboard Integration
- [ ] **Summary Cards**
  - [ ] Total views card shows "(X in last 24h)"
  - [ ] Average views card shows 24h average
  - [ ] 24h trend card displays overall blog growth

- [ ] **Top Posts Section**
  - [ ] All-time top post includes 24h data
  - [ ] Trending card shows different post than all-time leader
  - [ ] Trend indicators are color-coded correctly

#### Posts Table Features
- [ ] **Column Display**
  - [ ] "24h Views" column visible and populated
  - [ ] "Trend" column shows percentages with arrows
  - [ ] Sorting by 24h views works correctly

### Monitoring & Maintenance

#### Daily Health Checks
```bash
# Check 24h data collection
redis-cli KEYS "views:24h:*" | wc -l  # Should show active keys

# Verify trend calculations
curl /api/analytics/health | jq '.trends24h'

# Monitor performance
npm run analytics:performance
```

#### Weekly Reviews
- [ ] Review trending patterns for content insights
- [ ] Check for any posts with unusual trend spikes
- [ ] Validate 24h data accuracy vs. server logs

### Troubleshooting Common Issues

#### Missing 24h Data
```bash
# Check Redis configuration
redis-cli CONFIG GET maxmemory-policy  # Should not be 'noeviction'

# Verify key expiration
redis-cli TTL views:24h:some-post:12  # Should show time remaining
```

#### Incorrect Trend Calculations
```typescript
// Debug trend calculation
const debug24hTrend = (postSlug: string) => {
  console.log('Current 24h views:', current24h);
  console.log('Previous 24h views:', previous24h);
  console.log('Calculated trend:', trend);
};
```

#### Performance Issues
- Monitor Redis memory usage (24h keys use additional storage)
- Consider sampling for high-traffic sites
- Implement data compression for historical trends

---

## 📚 Related Documentation

**Core Analytics:**
- [`optimization/tag-analytics-consolidated.md`](./tag-analytics-consolidated) - Tag performance analytics
- [`platform/view-counts.md`](../platform/view-counts) - View tracking system

**Implementation Details:**
- `features/redis-caching.md` - Redis configuration
- `development/analytics-api.md` - API endpoints

**Monitoring & Performance:**
- `operations/monitoring.md` - System health monitoring
- [`development/performance-monitoring.md`](../development/performance-monitoring) - Performance optimization

---

**Last Updated:** December 9, 2025  
**Version:** 1.0.0 (Consolidated)  
**Contributors:** DCYFR Team

For issues or enhancements, see `operations/todo.md`.