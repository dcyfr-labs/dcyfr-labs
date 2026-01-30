<!-- TLP:CLEAR -->

# Filtered Tags Display in All Posts Section

**Added:** November 8, 2025  
**Feature:** Visual feedback for active tag filters in the All Posts table

## Overview

When tags are selected for filtering, the All Posts section header now displays the active filter tags with:
- Visual tag badges
- Click-to-remove functionality
- Quick "Clear all" button
- Post count indicator

## Visual Example

### Without Filters (Default)
```
┌─────────────────────────────────────────────┐
│ All Posts                                   │
│ Complete list of blog posts with analytics  │
├─────────────────────────────────────────────┤
│ Table content...                            │
└─────────────────────────────────────────────┘
```

### With Single Tag Filter
```
┌─────────────────────────────────────────────────┐
│ All Posts                              8 of 45  │
│ Complete list of blog posts with analytics      │
│ Filtered by: [nextjs ×] Clear all              │
├─────────────────────────────────────────────────┤
│ Table content (only Next.js posts)...           │
└─────────────────────────────────────────────────┘
```

### With Multiple Tag Filters
```
┌───────────────────────────────────────────────────┐
│ All Posts                                15 of 45 │
│ Complete list of blog posts with analytics        │
│ Filtered by: [nextjs ×] [react ×] [typescript ×] │
│              Clear all                             │
├───────────────────────────────────────────────────┤
│ Table content (Next.js OR React OR TypeScript)... │
└───────────────────────────────────────────────────┘
```

## Interactive Elements

### Tag Badge
```
[nextjs ×]
   ↓      ↓
   |      └─ Click × to remove this tag filter
   └──────── Tag name (primary color when selected)
```

### Post Count Indicator
```
8 of 45
↓    ↓
|    └─ Total posts in blog
└────── Filtered post count (how many match the tags)
```

### Clear All Button
```
Clear all
   ↓
   └─ Click to remove all tag filters at once
```

## User Interactions

### Remove Single Tag
1. User clicks the **×** on a tag badge
2. That tag is removed from the filter
3. Posts table updates to show more posts
4. If no tags remain, the "Filtered by" section disappears

### Remove All Tags
1. User clicks **"Clear all"** button
2. All tag filters are removed
3. Posts table shows all posts
4. "Filtered by" section disappears
5. Post count indicator disappears

### Adding Tags
Tags can be added by:
- Clicking tag rows in the Tag Analytics table
- Using the Tags dropdown in the control bar

## Layout Behavior

### Responsive Design

**Desktop (> 768px):**
```
┌────────────────────────────────────────────────────────┐
│ All Posts                                    15 of 45  │
│ Complete list of blog posts with analytics             │
│ Filtered by: [nextjs ×] [react ×] [typescript ×]      │
│              Clear all                                  │
└────────────────────────────────────────────────────────┘
```

**Mobile (< 768px):**
```
┌─────────────────────────────┐
│ All Posts         15 of 45  │
│ Complete list...            │
│ Filtered by:                │
│ [nextjs ×] [react ×]        │
│ [typescript ×] Clear all    │
└─────────────────────────────┘
```

The tag badges wrap naturally on smaller screens.

## Visual Hierarchy

### Colors and States
- **Tag Badge**: Primary color (blue) indicating active filter
- **× Symbol**: Slightly lighter shade, darkens on hover
- **Clear all**: Muted text with underline, becomes foreground color on hover
- **Post Count**: Muted text, right-aligned

### Spacing
- **Top margin**: 8px from description text
- **Tag gap**: 6px between badges
- **Badge padding**: 2px vertical, 6px horizontal
- **× spacing**: 4px left margin from tag name

## State Management

### URL Synchronization
When tags are displayed, they're also reflected in the URL:
```
/analytics?tags=nextjs,react,typescript
```

This enables:
- ✅ Shareable filtered views
- ✅ Browser back/forward navigation
- ✅ Bookmark filtered states
- ✅ Deep linking to specific tag combinations

### Consistency Across UI
The filtered tags shown in the All Posts header match:
- Tags selected in the Tag Analytics table (highlighted rows)
- Tags shown in the filter dropdown (checkmarks)
- Tags in the URL query parameter

## Accessibility

### Keyboard Navigation
```
Tab       → Focus next tag badge
Enter     → Remove focused tag
Space     → Remove focused tag
Shift+Tab → Focus previous element
```

### Screen Reader Announcements
```
"Filtered by: nextjs, react, typescript. 
 nextjs, button, press to remove filter.
 react, button, press to remove filter.
 typescript, button, press to remove filter.
 Clear all filters, button."
```

### Focus Indicators
```
┌───────────────────────────────────────┐
│ Filtered by: ┏━━━━━━━━━━┓ [react ×]  │
│              ┃[nextjs ×]┃             │
│              ┗━━━━━━━━━━┛ Clear all   │
└───────────────────────────────────────┘
                    ↑
            Keyboard focus ring
```

## Implementation Details

### Component Structure
```tsx
{selectedTags.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mt-2">
    <span className="text-xs text-muted-foreground">
      Filtered by:
    </span>
    {selectedTags.map((tag) => (
      <Badge
        key={tag}
        variant="default"
        className="text-xs cursor-pointer hover:bg-primary/80"
        onClick={() => removeTag(tag)}
      >
        {tag}
        <span className="ml-1">×</span>
      </Badge>
    ))}
    <button onClick={() => clearAllTags()}>
      Clear all
    </button>
  </div>
)}
```

### Click Handlers
- **Tag × click**: Removes that specific tag from `selectedTags` state
- **Clear all click**: Sets `selectedTags` to empty array `[]`
- Both trigger immediate re-filtering of the posts table

## Benefits

### User Experience
1. **Immediate Feedback** - Users see which filters are active
2. **Quick Removal** - One-click to remove individual filters
3. **Context Awareness** - Post count shows filter impact
4. **Discoverability** - Clear call-to-action to clear filters

### Consistency
- Matches the filter status display in the control bar
- Aligns with the Tag Analytics table highlighting
- Follows the same badge styling used throughout the app

### Efficiency
- No need to scroll back to top to manage filters
- Filters are visible while browsing the posts table
- Quick access to remove unwanted filters

## Use Case Examples

### Scenario 1: Research Next.js Content
```
1. User clicks "nextjs" in Tag Analytics
2. Header shows: "Filtered by: [nextjs ×]"
3. User sees 8 Next.js posts in table
4. User clicks × to see all posts again
```

### Scenario 2: Compare Multiple Topics
```
1. User selects "react", "vue", and "svelte"
2. Header shows all three badges with ×
3. Post count shows: "23 of 45"
4. User clicks "Clear all" to reset
```

### Scenario 3: Refine Filters
```
1. User has 5 tags selected
2. Header shows all 5 badges
3. User clicks × on 3 unwanted tags
4. Only 2 tags remain, table updates
```

## Testing Checklist

- [ ] Tags appear when filter is applied
- [ ] × click removes individual tag
- [ ] Clear all removes all tags
- [ ] Post count updates correctly
- [ ] Layout wraps properly on mobile
- [ ] Hover states work correctly
- [ ] Keyboard navigation functions
- [ ] Screen reader announces properly
- [ ] URL updates with tag changes
- [ ] No console errors or warnings

## Future Enhancements

Potential improvements:
- [ ] Drag-to-reorder tag badges
- [ ] Tag color coding by category
- [ ] Tooltip showing post count per tag
- [ ] Animation when adding/removing tags
- [ ] Save common filter combinations
- [ ] Export filtered view directly

## See Also

- Tag Analytics Documentation
- Tag Analytics Quick Reference
- [Analytics Dashboard Guide](./readme)
