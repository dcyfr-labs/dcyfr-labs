# Activity Feed Documentation

**Last Updated:** December 25, 2025
**Status:** Production Ready

The Activity Feed is a universal timeline that aggregates content from multiple sources (blog posts, projects, GitHub activity, milestones, etc.) into a unified, filterable, searchable stream with engagement-based trending indicators.

---

## Features

### Core Functionality
- ✅ **Multi-source aggregation** - Blog, projects, GitHub, milestones, certifications, analytics
- ✅ **Time-based filtering** - Today, week, month, year, all time
- ✅ **Source filtering** - Filter by content type
- ✅ **Saved filter presets** - Save and reuse filter combinations
- ✅ **Full-text search** - Search titles, descriptions, tags, and categories
- ✅ **Advanced query syntax** - `tag:`, `source:`, `-exclude`, `"exact phrases"`
- ✅ **Search history** - Recent 10 searches with result counts
- ✅ **Keyboard shortcuts** - Press `/` to open search
- ✅ **Activity heatmap** - Calendar view showing activity intensity over time
- ✅ **Trending badges** - Real-time engagement scoring with weekly/monthly indicators
- ✅ **Responsive design** - Mobile-optimized timeline and heatmap views

---

## Search Functionality

### Basic Search

Search across all activity items by entering text in the search input:

```
TypeScript
```

This searches in:
- **Titles** - Main activity title (boosted 2x)
- **Descriptions** - Activity descriptions
- **Tags** - Metadata tags (boosted 1.5x)
- **Categories** - Activity categories

### Advanced Query Syntax

#### Filter by Tag

Search for items with specific tags:

```
tag:typescript
tag:react tag:nextjs
```

#### Filter by Source

Limit search to specific content types:

```
source:blog
source:project
source:github
```

#### Exclude Sources

Exclude specific content types:

```
-github
-analytics
```

#### Exact Phrase Matching

Search for exact phrases:

```
"React Hooks"
"web development"
```

#### Combined Queries

Mix and match all syntax types:

```
tag:typescript source:blog "best practices"
source:project -github tag:nextjs
```

### Search Features

#### Fuzzy Matching

Search automatically handles typos (up to ~2 character edits):

```
typescrpt → matches "TypeScript"
raect → matches "React"
```

#### Search History

- Recent 10 searches automatically saved
- Shows result count for each query
- Click to re-apply previous search
- Clear history with one click
- Persisted in localStorage

#### Keyboard Shortcuts

- **/** - Open search / command palette
- **Enter** - Submit search and save to history
- **Escape** - Clear focus (browser default)

---

## Filter Presets

Save frequently-used filter combinations for quick access:

### Default Presets

- **Code Projects** - `source:project + source:blog + source:github`
- **Trending This Month** - `source:trending + timeRange:month`
- **Recent Blog Posts** - `source:blog + timeRange:week`
- **All Achievements** - `source:milestone + source:certification + source:engagement`

### Creating Custom Presets

1. Configure your desired filters (sources, time range, search)
2. Click "Save Current" button
3. Name your preset
4. Access from "Presets" dropdown

### Managing Presets

- **Apply** - Click preset in dropdown
- **Rename** - Use Preset Manager
- **Delete** - Use Preset Manager
- **Reorder** - Drag and drop in Preset Manager
- **Export/Import** - Share presets with others

---

## Trending Badges

**Implementation Date:** December 25, 2025

Engagement-based trending indicators that appear as badges on published events instead of creating duplicate "trending" events.

### How It Works

**Engagement Score Calculation:**
```
Raw Score = (views × 1) + (likes × 5) + (comments × 10) + (completion × 2)
Daily Score = Raw Score / periodDays
Normalized Score = min(100, (Daily Score / 10) × 100)
```

**Time Windows:**
- **Weekly Trending** (🔥 orange badge): Score ≥ 60 with views from past 7 days
- **Monthly Trending** (📈 blue badge): Score ≥ 50 with views from past 30 days

**Anti-Spam Protection:**
- Minimum 10 views required in time window
- Comments weighted 10x higher than views (strongest engagement signal)
- Likes weighted 5x higher than views

### Data Sources

- **Views**: Time-windowed from Redis (past 7/30 days only)
- **Likes**: All-time counts from Giscus API
- **Comments**: All-time counts from Giscus API
- **Reading Completion**: Not yet implemented (placeholder set to 0)

### Visual Design

**Badge Hierarchy:**
```
[Source] [Verb] [Trending (if applicable)]
  ↓       ↓            ↓
[Blog] [published] [🔥 Trending this week]
```

**Badge Priority:**
- Weekly badge shown preferentially if both conditions met
- Compact variants for reply threads (shortened labels)

### Storage

- View history retained for 90 days in Redis sorted sets
- Enables historical trending analysis and long-term analytics

**See:** [Trending Badges Implementation Guide](./trending-badges-implementation.md)

---

## Component Architecture

### File Structure

```
src/
├── app/activity/
│   ├── page.tsx                    # Server component, data fetching
│   └── activity-client.tsx         # Client component, filters + search
├── components/activity/
│   ├── ActivityFeed.tsx            # Timeline display
│   ├── ActivityFilters.tsx         # Filter UI + search input
│   ├── ActivityItem.tsx            # Individual activity card
│   ├── ActivitySkeleton.tsx        # Loading states
│   ├── PresetManager.tsx           # Preset management UI
│   ├── SearchHighlight.tsx         # Search term highlighting
│   └── index.ts                    # Barrel exports
├── lib/activity/
│   ├── index.ts                    # Types + constants
│   ├── types.ts                    # TypeScript interfaces
│   ├── sources.ts                  # Data transformers (client)
│   ├── sources.server.ts           # Data transformers (server)
│   ├── presets.ts                  # Filter preset logic
│   └── search.ts                   # Search engine (MiniSearch)
└── __tests__/lib/
    └── activity-search.test.ts     # 35 unit tests
```

### Data Flow

```
1. Server (page.tsx)
   ├─ Fetch from multiple sources
   ├─ Transform to ActivityItem[]
   └─ Serialize timestamps

2. Client (activity-client.tsx)
   ├─ Deserialize timestamps
   ├─ Create search index (MiniSearch)
   ├─ Apply search filter
   ├─ Apply source filters
   ├─ Apply time range filter
   └─ Render filtered results

3. Search Engine (search.ts)
   ├─ Parse query syntax
   ├─ Execute fuzzy search
   ├─ Apply tag/source filters
   ├─ Sort by relevance
   └─ Return SearchResult[]

4. Display (ActivityFeed.tsx)
   ├─ Group by month (optional)
   ├─ Render timeline
   └─ Show empty state if no results
```

---

## Usage Examples

### Adding a New Activity Source

1. **Define data transformer** in `sources.ts` or `sources.server.ts`:

```typescript
export function transformNewSource(data: RawData[]): ActivityItem[] {
  return data.map((item) => ({
    id: item.id,
    source: "new-source",
    verb: "published",
    title: item.title,
    description: item.description,
    timestamp: new Date(item.createdAt),
    href: `/new-source/${item.slug}`,
    meta: {
      tags: item.tags,
      category: item.category,
    },
  }));
}
```

2. **Update types** in `types.ts`:

```typescript
export type ActivitySource =
  | "blog"
  | "project"
  | "github"
  | "changelog"
  | "milestone"
  | "trending"
  | "engagement"
  | "certification"
  | "analytics"
  | "github-traffic"
  | "seo"
  | "new-source"; // Add here
```

3. **Add source styling** in `lib/activity/index.ts`:

```typescript
export const ACTIVITY_SOURCE_COLORS: Record<ActivitySource, ColorPair> = {
  // ... existing sources
  "new-source": {
    bg: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-900 dark:text-purple-100",
    border: "border-purple-200 dark:border-purple-800",
  },
};

export const ACTIVITY_SOURCE_LABELS: Record<ActivitySource, string> = {
  // ... existing sources
  "new-source": "New Source",
};
```

4. **Fetch and aggregate** in `page.tsx`:

```typescript
const newSourceItems = transformNewSource(await fetchNewSourceData());
const allActivities = aggregateActivities([
  // ... existing sources
  newSourceItems,
]);
```

### Customizing Search Behavior

Edit `src/lib/activity/search.ts`:

```typescript
const SEARCH_CONFIG = {
  fields: ["title", "description", "tags", "category"],
  storeFields: ["id"],
  searchOptions: {
    boost: { 
      title: 2,        // Increase title importance
      tags: 1.5,       // Increase tag importance
      description: 1,
      category: 1 
    },
    fuzzy: 0.2,        // Adjust typo tolerance (0.0-1.0)
    prefix: true,      // Match word prefixes
    combineWith: "AND" as const, // OR for broader results
  },
};
```

---

## Performance

### Benchmarks

**Search Performance (1000 items):**
- Basic search: ~14ms (target: <100ms) ✅
- Complex query: ~9ms (target: <100ms) ✅
- Fuzzy search: ~15ms ✅

**Optimization Strategies:**
1. **Pre-built search index** - Created once on mount, reused for all searches
2. **Memoized deserialization** - Timestamps deserialized once
3. **Efficient filtering** - Filters applied after search, not during
4. **Lazy loading** - Only visible items rendered initially

### Bundle Size

- **MiniSearch**: 6KB gzipped
- **Search utilities**: ~3KB gzipped
- **Total search overhead**: ~9KB gzipped

---

## Testing

### Unit Tests (35 tests)

**Coverage:**
- Query parsing (6 tests)
- Search functionality (11 tests)
- Performance benchmarks (2 tests)
- Search history (6 tests)
- Term extraction (4 tests)
- Highlighting (6 tests)

**Run tests:**
```bash
npm test -- activity-search.test.ts
```

### E2E Tests (15 scenarios)

**Coverage:**
- Basic search
- Advanced syntax (tag:, source:, -, "exact")
- Keyboard shortcuts (Cmd+K)
- Search history
- Filter combinations
- UI interactions

**Run E2E tests:**
```bash
npm run test:e2e -- activity-search.spec.ts
```

---

## Accessibility

### Keyboard Navigation
- **Cmd+K / Ctrl+K** - Focus search input
- **Enter** - Submit search
- **Escape** - Blur search input
- **Tab** - Navigate through filters
- **Arrow keys** - Navigate search history dropdown

### Screen Readers
- Search input has descriptive label
- Keyboard shortcut hint is visible
- Results count announced
- Filter badges are properly labeled
- ARIA attributes on interactive elements

### Color Contrast
- Search input meets WCAG AA standards
- Highlighted search terms have sufficient contrast
- Focus indicators are visible

---

## Troubleshooting

### Search returns no results

**Possible causes:**
1. **Typo tolerance too strict** - Increase `fuzzy` setting in `SEARCH_CONFIG`
2. **Query syntax error** - Check for malformed tag: or source: filters
3. **No matching items** - Verify data is loaded correctly

**Solutions:**
```typescript
// Lower threshold for more lenient fuzzy matching
fuzzy: 0.3  // Default: 0.2

// Check browser console for search debug info
console.log('Parsed query:', parseSearchQuery(query));
```

### Search is slow

**Possible causes:**
1. **Large dataset** - Optimize search index
2. **Re-creating index** - Ensure index is memoized
3. **Complex regex** - Simplify search terms

**Solutions:**
```typescript
// Pre-build index and pass to searchActivities
const searchIndex = useMemo(() => createSearchIndex(items), [items]);
const results = searchActivities(items, query, searchIndex);
```

### Search history not saving

**Possible causes:**
1. **localStorage disabled** - Check browser settings
2. **Private/incognito mode** - localStorage is session-only
3. **Storage quota exceeded** - Clear other localStorage data

**Solutions:**
```javascript
// Check localStorage availability
if (typeof window !== 'undefined' && window.localStorage) {
  // Safe to use localStorage
}

// Clear search history manually
localStorage.removeItem('dcyfr-activity-search-history');
```

---

## Activity Heatmap Visualization (Stage 4) ✅

### Overview

The Activity Heatmap provides a calendar-based visualization of activity intensity over time, similar to GitHub's contribution graph. It offers an at-a-glance view of activity patterns and enables quick filtering to specific dates.

### Features

#### Calendar View
- **12-month view** - Desktop displays full year of activity
- **6-month view** - Tablet displays half year
- **3-month view** - Mobile displays quarter
- **Responsive** - Automatically adjusts based on viewport

#### Color Intensity Scale
- **Empty** - No activities (gray)
- **Low (1-3)** - Light green
- **Medium (4-6)** - Medium green
- **High (7-9)** - Dark green
- **Very High (10+)** - Darkest green

#### Interactive Features
- **Hover tooltips** - Show date, activity count, and top 3 sources
- **Click-to-filter** - Click any date to filter timeline view to that day
- **Statistics cards** - Display:
  - Active days (days with at least 1 activity)
  - Current streak (consecutive days from today)
  - Best streak (longest consecutive streak)
  - Busiest day (date + count)
- **Smooth animations** - Framer Motion transitions for data loading

#### Performance
- **Optimized rendering** - Uses useMemo for expensive calculations
- **<500ms render time** - Tested with 1 year of data
- **Lazy loading** - Calendar library only loads visible cells

### Usage

```tsx
import { ActivityHeatmapCalendar } from "@/components/activity";

<ActivityHeatmapCalendar
  activities={activities}
  onDateClick={(date, activityIds) => {
    // Filter timeline to this date
    console.log(`Clicked ${date}`, activityIds);
  }}
  monthsToShow={12}
/>
```

### Integration

The heatmap is integrated into the /activity page via a tab interface:

- **Timeline View** - Traditional chronological feed (default)
- **Heatmap View** - Calendar-based visualization

Both views share the same filters (sources, time range, search), allowing users to analyze activity patterns and then drill down into specific dates.

### Technical Details

**Data Aggregation:**
- Groups activities by date (ISO format YYYY-MM-DD)
- Counts activities per day
- Tracks top 3 sources by frequency
- Stores activity IDs for click-to-filter

**Color Mapping:**
- `getHeatmapColorClass()` - Maps count to CSS class
- `getHeatmapIntensity()` - Returns 0-4 intensity level
- Uses chart visualization color exception (green gradient)

**Statistics Calculation:**
- Total activities across all days
- Active days count (count > 0)
- Average activities per day (rounded to 1 decimal)
- Current/longest streak algorithm

**Files:**
- [ActivityHeatmapCalendar.tsx](../../src/components/activity/ActivityHeatmapCalendar.tsx) - Main component
- [heatmap.ts](../../src/lib/activity/heatmap.ts) - Aggregation utilities
- [activity-heatmap.test.ts](../../src/__tests__/lib/activity-heatmap.test.ts) - Unit tests (21 tests)
- [activity-client.tsx](../../src/app/activity/activity-client.tsx) - Tab integration

---

## Stage 5: Virtual Scrolling for Performance ✅

**Status:** Complete (December 2025)  
**Objective:** Optimize rendering performance for feeds with 1000+ items using virtual scrolling.

### Features Implemented

#### 1. Virtual Scrolling Engine
- Uses `@tanstack/react-virtual` (14.2KB, TypeScript-first)
- Only renders visible items (saves memory)
- Variable item heights by source type:
  - Blog posts: 250px (has more content)
  - Projects: 200px (medium content)
  - Default (milestones, etc.): 150px
- Overscan: 5 items above/below viewport for smooth scrolling
- **Performance:** 100+ items render with <100 DOM nodes

#### 2. Scroll-to-Top Button
- Floating button with Framer Motion animations
- Appears after scrolling 500px
- Smooth scroll to top with visual feedback
- Fixed bottom-right positioning
- Accessible with `aria-label`

#### 3. Scroll Position Restoration
- Saves scroll offset to `sessionStorage`
- Restores position on back button navigation
- Clears on page refresh (fresh start)
- Custom `useScrollRestoration` hook

#### 4. Infinite Scroll Support
- Loads more items at 90% scroll threshold
- Batch loading with loading indicator
- Prevents duplicate requests with ref flag
- Optional `onLoadMore` callback
- `hasMore` and `isLoadingMore` state props

#### 5. Time Group Headers
- Sticky headers stay visible during scroll
- Flattened virtual items array (headers + activities)
- Backdrop blur for visual separation
- Preserves TIME_GROUP_ORDER (today → this-week → this-month → older)

### API Reference

**VirtualActivityFeed Component:**

```typescript
import { VirtualActivityFeed } from "@/components/activity";

<VirtualActivityFeed
  items={activities}           // ActivityItem[]
  variant="timeline"           // timeline | compact | minimal | standard
  showGroups                   // Show time group headers
  isLoading={false}            // Show skeleton loaders
  emptyMessage="No activity"   // Custom empty state
  
  // Infinite scroll (optional)
  enableInfiniteScroll
  onLoadMore={loadMoreActivities}
  isLoadingMore={loading}
  hasMore={hasNextPage}
  
  className="custom-class"     // CSS overrides
/>
```

**useScrollRestoration Hook:**

```typescript
import { useScrollRestoration } from "@/hooks/useScrollRestoration";

const scrollRef = useRef<HTMLDivElement>(null);
useScrollRestoration("unique-key", scrollRef);

return <div ref={scrollRef}>...</div>;
```

### Performance Characteristics

| Metric | Standard ActivityFeed | VirtualActivityFeed |
|--------|----------------------|---------------------|
| DOM Nodes (1000 items) | ~3000 nodes | ~100 nodes |
| Memory Usage | ~50MB | ~8MB |
| Initial Render | ~800ms | ~150ms |
| Scroll FPS | ~45 FPS | ~60 FPS |
| Scroll Smoothness | Janky at 500+ items | Smooth at 5000+ items |

### Files Created

- [VirtualActivityFeed.tsx](../../src/components/activity/VirtualActivityFeed.tsx) - Virtual scrolling component (384 lines)
- [useScrollRestoration.ts](../../src/hooks/useScrollRestoration.ts) - Scroll restoration hook
- [VirtualActivityFeed.test.tsx](../../src/__tests__/components/VirtualActivityFeed.test.tsx) - Unit tests (16 tests ✅)
- [virtual-scrolling-evaluation.md](../../docs/architecture/virtual-scrolling-evaluation.md) - Library comparison

### Testing

**Unit Tests (16 tests):**
- ✅ Loading & empty states
- ✅ Rendering with/without groups
- ✅ All 4 variants (timeline, compact, minimal, standard)
- ✅ Infinite scroll logic
- ✅ Accessibility & performance optimizations

---

## RSS Feed

The activity feed is available as an RSS 2.0 feed for syndication. All major content sections (Activity, Blog, Projects) support RSS 2.0, Atom, and JSON Feed formats.

### Available Feeds

| Feed | RSS 2.0 | Atom | JSON Feed |
|------|---------|------|-----------|
| **Activity** | `/activity/rss.xml` | `/activity/feed` | `/activity/feed.json` |
| **Blog** | `/blog/rss.xml` | `/blog/feed` | `/blog/feed.json` |
| **Projects** | `/work/rss.xml` | `/work/feed` | `/work/feed.json` |

**Discovery:** All feeds are listed on the [/feeds](https://dcyfr.com/feeds) page with format descriptions and subscription buttons.

### Accessing the Feed

**Feed URL:** `https://dcyfr.com/activity/rss.xml`

The RSS feed includes all activity types with proper metadata formatting:
- Blog posts with reading time, views, and comments
- Projects with star counts
- Milestones with achievement metrics
- GitHub activity
- Certifications and analytics achievements

**Discovery:** The feed is listed on the [/feeds](https://dcyfr.com/feeds) page alongside other available feeds (Atom, JSON Feed).

### Feed Features

- ✅ **RSS 2.0 compliant** - Validates with W3C Feed Validator
- ✅ **Autodiscovery** - Feed readers automatically detect the feed
- ✅ **Rich metadata** - Includes tags, categories, and engagement stats
- ✅ **Performance** - Cached for 1 hour, revalidates every 5 minutes
- ✅ **CDATA descriptions** - HTML-formatted descriptions for rich content
- ✅ **Proper GUIDs** - Stable identifiers for feed readers

### Feed Format

Each activity item in the RSS feed includes:

| Field | Content |
|-------|---------|
| **Title** | Verb + Activity Title (e.g., "Published: Test Blog Post") |
| **Link** | Full URL to the activity |
| **Description** | HTML-formatted description with metadata badges |
| **Category** | Activity source type (Blog Post, Project, Milestone, etc.) |
| **PubDate** | RFC 2822 formatted timestamp |
| **GUID** | Unique stable identifier |

### Subscribe via Feed Reader

Add this feed to your favorite RSS reader:

**Popular readers:**
- [Feedly](https://feedly.com/)
- [Inoreader](https://www.inoreader.com/)
- [NewsBlur](https://newsblur.com/)
- [The Old Reader](https://theoldreader.com/)

**Manual subscription:** Copy `https://dcyfr.com/activity/rss.xml` into your feed reader

### API Reference

```typescript
import { generateRSSFeed, filterActivitiesForRSS } from "@/lib/activity/rss";

// Generate RSS feed
const rssXML = generateRSSFeed(activities, {
  title: "Custom Feed Title",
  description: "Custom description",
  ttl: 60, // Minutes until refresh
  maxItems: 100, // Limit feed size
});

// Filter activities (currently includes all types)
const rssActivities = filterActivitiesForRSS(activities);
```

**Route:** `/activity/rss.xml`  
**Revalidation:** 5 minutes (ISR)  
**Cache:** 1 hour public cache with stale-while-revalidate

---

## 📦 Backlog (Future Consideration)

### Stage 6+ Ideas
- Export heatmap as image (PNG/SVG)
- Real-time activity updates (WebSocket/Polling)
- Activity detail modal with deep context
- Collaborative filtering ("Similar to you" recommendations)

### Next Priority: Stage 6 (Content Extensions & Integrations)
See [todo.md](../operations/todo.md#stage-6-content-extensions--integrations--next) for detailed planning:
- RSS Feed Generation (#51)
- Bookmarking System (#47)
- Real-time GitHub Commit Feed (#123)
- Activity Embeds (#57)
- AI-Powered Topic Clustering (#31)

---

## Resources

**Files:**
- [ActivityFilters.tsx](../../src/components/activity/ActivityFilters.tsx) - Filter UI + search
- [ActivityHeatmapCalendar.tsx](../../src/components/activity/ActivityHeatmapCalendar.tsx) - Heatmap visualization
- [VirtualActivityFeed.tsx](../../src/components/activity/VirtualActivityFeed.tsx) - Virtual scrolling
- [search.ts](../../src/lib/activity/search.ts) - Search engine
- [heatmap.ts](../../src/lib/activity/heatmap.ts) - Heatmap utilities
- [rss.ts](../../src/lib/activity/rss.ts) - RSS 2.0 feed generation
- [/activity/rss.xml/route.ts](../../src/app/activity/rss.xml/route.ts) - RSS feed API route
- [activity-search.test.ts](../../src/__tests__/lib/activity-search.test.ts) - Search unit tests (35 tests)
- [activity-heatmap.test.ts](../../src/__tests__/lib/activity-heatmap.test.ts) - Heatmap unit tests (21 tests)
- [activity-rss.test.ts](../../src/__tests__/lib/activity-rss.test.ts) - RSS feed tests (19 tests)
- [VirtualActivityFeed.test.tsx](../../src/__tests__/components/VirtualActivityFeed.test.tsx) - Virtual scrolling tests (16 tests)
- [activity-search.spec.ts](../../e2e/activity-search.spec.ts) - Search E2E tests (15 tests)

**Related Documentation:**
- [Activity Feed Stages](../operations/todo.md#-active-development-activity-feed-enhancement-5-stage-plan)
- [Stage 6 RSS Feed](../operations/todo.md#stage-6-content-extensions--integrations--next)
- [Virtual Scrolling Evaluation](../architecture/virtual-scrolling-evaluation.md)
- [Testing Strategy](../testing/README.md)
- [Design Tokens](../ai/design-system.md)

**External:**
- [MiniSearch Documentation](https://lucaong.github.io/minisearch/)
- [react-calendar-heatmap](https://github.com/kevinsqi/react-calendar-heatmap)
- [TanStack Virtual Documentation](https://tanstack.com/virtual/latest)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [W3C Feed Validator](https://validator.w3.org/feed/)
- [Web Search UX Best Practices](https://uxplanet.org/search-interface-20-things-to-consider-4b1466e98881)

---

**Status:** Production Ready  
**Completed:** December 23, 2025  
**Maintained By:** DCYFR Labs Team
