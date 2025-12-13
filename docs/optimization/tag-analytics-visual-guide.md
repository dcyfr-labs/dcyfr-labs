# Tag Analytics - Visual Guide

Quick visual reference for the Tag Analytics feature.

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Search] [Hide archived] [Hide drafts] [Clear All]         │
│ [📅 24 Hours ▼] [🏷️ Tags ▼] [💾 Export ▼] [🔄] [Auto]     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Summary Cards (4 cards)                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │Total     │ │Total     │ │Average   │ │24h       │      │
│ │Posts     │ │Views     │ │Views     │ │Trend     │      │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│ Top Posts (2 cards)                                         │
│ ┌────────────────────────┐ ┌────────────────────────┐     │
│ │Top Post (All-time)     │ │🔥 Trending (24h)      │     │
│ └────────────────────────┘ └────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│ 🆕 TAG ANALYTICS                                🏷️         │
│ ┌─────────────────────────────────────────────────────────┐│
│ │Tag          │Posts│Total  │Range │24h   │Avg  │Avg24h││
│ ├─────────────────────────────────────────────────────────┤│
│ │[nextjs]Top1 │ 8   │12,543 │1,234 │156↑  │1,568│19.5  ││
│ │[react]Top2  │ 12  │10,234 │987   │89↑   │853  │7.4   ││
│ │[typescript] │ 6   │8,901  │756   │67🔥  │1,484│11.2  ││
│ └─────────────────────────────────────────────────────────┘│
│ Click any tag to filter posts                               │
├─────────────────────────────────────────────────────────────┤
│ Trending Posts                                              │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│ │Post 1     │ │Post 2     │ │Post 3     │                │
│ └───────────┘ └───────────┘ └───────────┘                │
├─────────────────────────────────────────────────────────────┤
│ All Posts Table                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │Title                          │Views│24h│Published│Tags││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Tag Analytics Table - Column Details

### Desktop View (> 1024px)
```
┌─────────────┬──────┬─────────┬──────────┬─────────┬─────────┬──────────┐
│ Tag         │Posts │Total    │Range     │24h      │Avg      │Avg (24h) │
│             │      │Views    │Views     │Views    │Views    │          │
├─────────────┼──────┼─────────┼──────────┼─────────┼─────────┼──────────┤
│ nextjs      │  8   │ 12,543  │  1,234   │ 156 ↑   │ 1,568   │   19.5   │
│ [Top 1]     │      │         │          │ +12%    │         │          │
├─────────────┼──────┼─────────┼──────────┼─────────┼─────────┼──────────┤
│ react       │ 12   │ 10,234  │    987   │  89 🔥  │   853   │    7.4   │
│ [Top 2]     │      │         │          │  +5%    │         │          │
├─────────────┼──────┼─────────┼──────────┼─────────┼─────────┼──────────┤
│ typescript  │  6   │  8,901  │    756   │  67     │ 1,484   │   11.2   │
└─────────────┴──────┴─────────┴──────────┴─────────┴─────────┴──────────┘
```

### Tablet View (768px - 1024px)
```
┌─────────────┬──────┬─────────┬──────────┬─────────┬─────────┐
│ Tag         │Posts │Total    │Range     │24h      │Avg      │
│             │      │Views    │Views     │Views    │Views    │
├─────────────┼──────┼─────────┼──────────┼─────────┼─────────┤
│ nextjs      │  8   │ 12,543  │  1,234   │ 156 ↑   │ 1,568   │
│ [Top 1]     │      │         │          │ +12%    │         │
└─────────────┴──────┴─────────┴──────────┴─────────┴─────────┘
```

### Mobile View (< 768px)
```
┌─────────────┬──────┬─────────┬─────────┐
│ Tag         │Posts │Total    │24h      │
│             │      │Views    │Views    │
├─────────────┼──────┼─────────┼─────────┤
│ nextjs      │  8   │ 12,543  │ 156 ↑   │
│ [Top 1]     │      │         │ +12%    │
└─────────────┴──────┴─────────┴─────────┘
```

## Visual Indicators

### Badge Types
```
┌─────────────────────────────────────────┐
│ [nextjs] [Top 1]    ← Selected tag      │
│ [react]  [Top 2]    ← Outline badge     │
│ [typescript]        ← Regular tag       │
└─────────────────────────────────────────┘
```

### Trend Indicators
```
┌───────────────────────────────────────┐
│ 156 🔥 +12%  ← Flame + positive trend │
│  89    +5%   ← Positive trend only    │
│  67          ← Neutral (no change)    │
│  23    -8%   ← Negative trend         │
└───────────────────────────────────────┘
```

### Color Coding
- **Green (+X%)**: Positive 24h growth
- **Red (-X%)**: Negative 24h decline
- **Orange (🔥)**: Active engagement
- **Primary (Selected)**: Tag currently filtering

## Interaction States

### Default State
```
┌────────────────────────────────────────────┐
│ nextjs  [Top 1] │ 8 │ 12,543 │ 156 🔥 +12%│  ← Hover effect
└────────────────────────────────────────────┘
```

### Selected State
```
┌════════════════════════════════════════════┐
║ nextjs  [Top 1] │ 8 │ 12,543 │ 156 🔥 +12%║  ← Highlighted
╚════════════════════════════════════════════╝
```

### Click Action
```
Before:                After:
┌──────────┐          ┌════════════┐
│ nextjs   │   →      ║ [nextjs]  ║  Filter applied
└──────────┘          ╚════════════╝

Posts Table:
  Showing 8 of 45 posts • Tags: nextjs
```

## Filter Status Display

```
┌─────────────────────────────────────────────────────────┐
│ Controls Bar                                            │
│ [Search...] [Hide archived ✓] [🏷️ Tags (2)]           │
│                                                         │
│ Showing 15 of 45 posts • Tags: nextjs, react           │
└─────────────────────────────────────────────────────────┘
```

## Empty State

When no tags exist (unlikely):
```
┌─────────────────────────────────────────┐
│ Tag Analytics                           │
│                                         │
│ No tags found in posts.                 │
└─────────────────────────────────────────┘
```

## Mobile Optimization

```
📱 Mobile View (< 768px)
┌─────────────────────┐
│ Tag Analytics    🏷️ │
├─────────────────────┤
│Tag    │Posts│Total │
├───────┼─────┼──────┤
│nextjs │  8  │12.5K │
│[Top1] │     │      │
├───────┼─────┼──────┤
│react  │ 12  │10.2K │
│[Top2] │     │      │
└─────────────────────┘
```

## Complete Flow Example

### 1. User arrives at `/analytics`
```
[Dashboard loads with all metrics]
↓
[Tag Analytics shows all tags sorted by views]
```

### 2. User clicks "nextjs" tag
```
[Tag row highlights in primary color]
↓
[Posts table filters to show only Next.js posts]
↓
[URL updates: /analytics?tags=nextjs]
↓
[Status shows: "Showing 8 of 45 posts • Tags: nextjs"]
```

### 3. User clicks "react" tag
```
[React row also highlights]
↓
[Posts table shows Next.js OR React posts]
↓
[URL updates: /analytics?tags=nextjs,react]
↓
[Status shows: "Showing 15 of 45 posts • Tags: nextjs, react"]
```

### 4. User clicks "Clear All"
```
[All tag highlights removed]
↓
[Posts table shows all posts]
↓
[URL resets: /analytics]
↓
[Status shows all posts]
```

## Accessibility Features

### Keyboard Navigation
```
Tab       → Move to next tag row
Enter     → Select/deselect tag
Space     → Select/deselect tag
Shift+Tab → Move to previous tag row
```

### Screen Reader Announcements
```
"Tag: nextjs, 8 posts, 12,543 total views, 156 views in 24 hours, 
 trending up 12 percent, button, press to filter posts"
```

### Focus Indicators
```
┌─────────────────────────────────────────┐
│┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓│
│┃ nextjs [Top 1] │ 8 │ 12,543 │ 156   ┃│  ← Keyboard focus
│┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛│
└─────────────────────────────────────────┘
```

## Performance Indicators

The table footer shows context when many tags exist:

```
┌─────────────────────────────────────────────────────────┐
│ Showing all 24 tags • Click any tag to filter posts    │
└─────────────────────────────────────────────────────────┘
```

## See Also

- [Tag Analytics Documentation](./tag-analytics)
- [Analytics Dashboard Guide](./readme)
- [Design System Patterns](../design/component-patterns)
