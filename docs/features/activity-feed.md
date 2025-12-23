# Activity Feed Documentation

**Last Updated:** December 23, 2025  
**Status:** Production Ready

The Activity Feed is a universal timeline that aggregates content from multiple sources (blog posts, projects, GitHub activity, milestones, etc.) into a unified, filterable, searchable stream.

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
- ✅ **Keyboard shortcuts** - Cmd/Ctrl+K to focus search
- ✅ **Responsive design** - Mobile-optimized timeline view

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

- **Cmd+K** (Mac) / **Ctrl+K** (Windows/Linux) - Focus search input
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

## Future Enhancements (Stage 4+)

### Stage 4: Activity Heatmap Visualization
- Calendar heatmap showing activity over time
- Contribution graph style display
- Hover tooltips with daily activity counts

### Stage 5: AI-Powered Recommendations
- "You might also like" based on viewing patterns
- Related activities algorithm
- Trending topics detection

---

## Resources

**Files:**
- [ActivityFilters.tsx](../../src/components/activity/ActivityFilters.tsx) - Filter UI + search
- [search.ts](../../src/lib/activity/search.ts) - Search engine
- [activity-search.test.ts](../../src/__tests__/lib/activity-search.test.ts) - Unit tests
- [activity-search.spec.ts](../../e2e/activity-search.spec.ts) - E2E tests

**Related Documentation:**
- [Activity Feed Metrics](../operations/todo.md#stage-3-full-text-search-complete)
- [Testing Strategy](../testing/README.md)
- [Design Tokens](../ai/design-system.md)

**External:**
- [MiniSearch Documentation](https://lucaong.github.io/minisearch/)
- [Web Search UX Best Practices](https://uxplanet.org/search-interface-20-things-to-consider-4b1466e98881)

---

**Status:** Production Ready  
**Completed:** December 23, 2025  
**Maintained By:** DCYFR Labs Team
