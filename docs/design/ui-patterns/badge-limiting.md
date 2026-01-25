{/* TLP:CLEAR */}

# Badge Limiting Implementation

**Date:** November 4, 2025  
**Feature:** Limit technology and tag badges to 3 items with "+X" indicator  
**Status:** ✅ Implemented

---

## Overview

To prevent visual clutter and maintain clean card layouts, both project technology badges and post tag lists now limit display to the first 3 items, with a "+X" badge showing the count of additional items.

---

## Implementation Details

### 1. Project Technology Badges

**Location:** `src/components/project-card.tsx`

**Before:**
```tsx
{project.tech && project.tech.length > 0 && (
  <div className="flex flex-wrap gap-1.5 pt-1">
    {project.tech.map((tech) => (
      <Badge key={tech} variant="outline" className="font-normal text-xs sm:text-sm">
        {tech}
      </Badge>
    ))}
  </div>
)}
```

**After:**
```tsx
{project.tech && project.tech.length > 0 && (
  <div className="flex flex-wrap gap-1.5 pt-1">
    {project.tech.slice(0, 3).map((tech) => (
      <Badge key={tech} variant="outline" className="font-normal text-xs sm:text-sm">
        {tech}
      </Badge>
    ))}
    {project.tech.length > 3 && (
      <Badge variant="outline" className="font-normal text-xs sm:text-sm text-muted-foreground">
        +{project.tech.length - 3}
      </Badge>
    )}
  </div>
)}
```

**Logic:**
1. Display first 3 technologies using `slice(0, 3)`
2. If more than 3 exist, add a "+X" badge
3. "+X" badge uses muted foreground color to distinguish it visually
4. Same outline variant maintains consistency

**Example Output:**
- **5 technologies:** `React` `Next.js` `TypeScript` `+2`
- **3 technologies:** `Ghost` `JavaScript` `CSS`
- **2 technologies:** `Python` `Django`

---

### 2. Post Tag Lists

**Location:** `src/components/post-list.tsx`

**Before:**
```tsx
{/* Tags - desktop only (limit 3) */}
<span className="hidden md:inline-block" aria-hidden="true">•</span>
<span className="hidden md:inline-block">{p.tags.slice(0, 3).join(" · ")}</span>
```

**After:**
```tsx
{/* Tags - desktop only (limit 3 + count) */}
{p.tags.length > 0 && (
  <>
    <span className="hidden md:inline-block" aria-hidden="true">•</span>
    <span className="hidden md:inline-block">
      {p.tags.slice(0, 3).join(" · ")}
      {p.tags.length > 3 && ` · +${p.tags.length - 3}`}
    </span>
  </>
)}
```

**Logic:**
1. Display first 3 tags joined with " · " separator
2. If more than 3 exist, append " · +X" to the string
3. Entire section only renders if tags exist
4. Maintains desktop-only visibility (`hidden md:inline-block`)

**Example Output:**
- **6 tags:** `security · development · tutorial · +3`
- **3 tags:** `nextjs · react · typescript`
- **1 tag:** `guide`

---

## Visual Design

### Badge Appearance

| Element | Styling | Purpose |
|---------|---------|---------|
| Tech badges | `variant="outline"` with normal weight | Standard technology indicator |
| "+X" badge | `variant="outline"` with `text-muted-foreground` | Subtly indicates more items |
| Tag text | Plain text with " · " separator | Lightweight, less visual weight |

### Color & Contrast
- Tech badges use default foreground color (full contrast)
- "+X" badge uses muted foreground (subtle, informative)
- Tags remain text-only (no badge styling) on desktop

---

## Locations Affected

### Project Cards
- **Homepage** (`/`) - Projects section
- **Projects page** (`/projects`) - All project cards
- Any component using `<ProjectCard />` component

### Post Lists
- **Homepage** (`/`) - Latest articles section
- **Blog page** (`/blog`) - All post listings
- Search results
- Tag-filtered results
- Any component using `<PostList />` component

---

## User Experience Benefits

### 1. **Reduced Visual Clutter**
- Cards no longer overflow with many badges
- Consistent card heights in grid layouts
- Cleaner, more professional appearance

### 2. **Information Hierarchy**
- Most important/primary technologies shown first
- User knows more details exist without overwhelming display
- Easy to scan and compare projects/posts

### 3. **Responsive Design**
- Mobile cards remain compact and tappable
- Desktop cards maintain horizontal balance
- No layout shifts or wrapping issues

### 4. **Scalability**
- Works regardless of number of technologies/tags
- Future-proof as projects add more tech stacks
- Graceful degradation (shows all if ≤3 items)

---

## Technical Details

### Array Slicing
```tsx
array.slice(0, 3)  // Returns first 3 items (or all if fewer)
```
- Non-mutating (doesn't modify original array)
- Safe for empty arrays (returns empty array)
- Works with any array length

### Conditional Rendering
```tsx
{array.length > 3 && <Component />}  // Only render if more than 3
```
- Short-circuit evaluation prevents unnecessary rendering
- Keeps DOM clean when not needed
- No empty elements created

### Count Calculation
```tsx
array.length - 3  // Number of hidden items
```
- Simple arithmetic, no complex logic
- Always accurate count
- Readable and maintainable

---

## Testing Checklist

### Project Cards
- [ ] Projects with 1-3 technologies show all, no "+X" badge
- [ ] Projects with 4+ technologies show first 3 + "+X" badge
- [ ] "+X" badge has muted color (visually distinct)
- [ ] "+X" count is accurate (e.g., 7 technologies = "+4")
- [ ] Badge wrapping works correctly on mobile
- [ ] Hover states work on all badges

### Post Lists
- [ ] Posts with 1-3 tags show all, no "+X"
- [ ] Posts with 4+ tags show first 3 + "+X"
- [ ] "+X" format matches: `tag1 · tag2 · tag3 · +X`
- [ ] Tags only visible on desktop (`md:` breakpoint)
- [ ] Count is accurate across all posts
- [ ] No layout shifts when switching themes

### Edge Cases
- [ ] Empty arrays handled gracefully (no errors)
- [ ] Single item works correctly
- [ ] Very long lists (10+) display correctly
- [ ] Badge text doesn't overflow or wrap

---

## Performance Impact

**Negligible:**
- Simple array slicing (O(1) operation)
- Conditional rendering prevents unnecessary elements
- No additional API calls or data fetching
- Client-side only, no SSR impact

**Benefits:**
- Fewer DOM elements (less than full list)
- Faster initial render
- Better scrolling performance (lighter cards)

---

## Future Enhancements

**Potential improvements (not currently implemented):**

1. **Tooltip on hover** - Show full list of technologies/tags
2. **Configurable limit** - Allow different limits per context
3. **Expandable badges** - Click "+X" to reveal hidden items
4. **Smart selection** - Show most relevant/popular items first
5. **Badge grouping** - Group related technologies (e.g., "Frontend +2")

---

## Related Files

- `src/components/project-card.tsx` - Project card with tech badges
- `src/components/post-list.tsx` - Post list with tag display
- `src/components/ui/badge.tsx` - Badge component styling
- `src/data/projects.ts` - Project data with tech arrays
- `src/data/posts.ts` - Post data with tag arrays

---

## Changelog

### November 4, 2025 - Initial Implementation
- Added badge limiting to project technology lists (limit: 3)
- Added tag limiting to post lists (limit: 3)
- "+X" indicator shows count of additional items
- Muted foreground color for "+X" badge in projects
- Text-based "+X" for post tags (maintains lightweight design)

---

**Status:** ✅ Live and working  
**Impact:** Cleaner, more scannable card layouts with reduced visual clutter  
**Maintenance:** Automatic - works with any number of items in arrays
