{/* TLP:CLEAR */}

# Table of Contents (TOC) Feature

**Status:** ✅ Implemented  
**Date:** October 21, 2025  
**Location:** Blog post pages (`/blog/[slug]`)

---

## Overview

Automatically generates a table of contents for blog posts by extracting headings (H2 and H3) from MDX content. The TOC is displayed as a fixed sidebar on large screens (XL+) with smooth scrolling and active section tracking.

---

## Implementation

### 1. Heading Extraction (`src/lib/toc.ts`)

Server-side utility that parses MDX content to extract H2 (`##`) and H3 (`###`) headings:

```typescript
export type TocHeading = {
  id: string;      // URL-safe slug (matches rehype-slug)
  text: string;    // Heading text
  level: number;   // 2 for H2, 3 for H3
};

export function extractHeadings(content: string): TocHeading[];
```

**Features:**
- Regex-based extraction from raw MDX content
- Generates slugs using same logic as `rehype-slug`
- Returns structured heading data for client component

### 2. TOC Component (`src/components/table-of-contents.tsx`)

Client component that renders the table of contents:

```tsx
<TableOfContents headings={headings} />
```

**Features:**
- **Fixed positioning:** Stays visible on right side (XL+ screens only)
- **Collapsible:** Toggle with "On this page" button
- **Active tracking:** Uses IntersectionObserver to highlight current section
- **Smooth scrolling:** Animated scroll to clicked heading
- **Nested display:** H3 headings indented under H2s
- **Accessible:** Proper ARIA labels and semantic markup

**UI States:**
- Active heading: Primary color with bold font
- Inactive headings: Muted color
- Hover: Border highlight

### 3. Integration (`src/app/blog/[slug]/page.tsx`)

```typescript
// Server-side: Extract headings
const headings = extractHeadings(post.body);

// Client-side: Render TOC
return (
  <>
    <TableOfContents headings={headings} />
    <article>{/* Blog content */}</article>
  </>
);
```

---

## User Experience

### Desktop (XL+ screens, ≥1280px)
- TOC appears as fixed sidebar on right
- Collapses/expands with toggle button
- Tracks scroll position and highlights active section
- Smooth scroll navigation on click

### Mobile/Tablet (<1280px)
- TOC is hidden (via `hidden xl:block`)
- Blog content takes full width
- No performance impact from observer

---

## Technical Details

### Active Section Tracking

Uses IntersectionObserver with optimized settings:

```typescript
{
  rootMargin: "-80px 0px -80% 0px",  // Activate near viewport top
  threshold: 1.0                      // Fully visible
}
```

This ensures the active heading updates as user scrolls, with 80px offset to account for header.

### Positioning

- `fixed top-24 right-8`: Stays below header (6rem = 96px)
- `max-h-[calc(100vh-8rem)]`: Prevents overflow, allows scrolling
- `overflow-y-auto`: Scrollable if TOC is long

### Performance

- Zero re-renders during scroll (observer handles state internally)
- Cleanup on unmount (disconnect observer)
- Only runs on client (`"use client"`)
- No impact on server-side rendering

---

## Styling

### Visual Hierarchy

```
Border indicators:
├─ Active: Primary color, 2px border
├─ Hover: Border appears on hover
└─ Inactive: Transparent border

Indentation:
├─ H2: No indent
└─ H3: 1rem left margin (ml-4)
```

### Colors (Theme-aware)

- Active text: `text-primary`
- Inactive text: `text-muted-foreground`
- Hover: `hover:text-foreground`
- Border: `border-border` (theme-aware)

---

## Dependencies

- **React:** `useEffect` for observer lifecycle
- **rehype-slug:** Already installed, ensures consistent heading IDs
- **Tailwind CSS:** Utility classes for styling
- **No new packages:** Uses built-in browser APIs

---

## Future Enhancements

### Potential Improvements

1. **Mobile TOC:** Add drawer or dropdown for mobile users
2. **Copy link button:** Add share icon next to active heading
3. **Progress indicator:** Show reading progress within TOC
4. **Sticky behavior:** Keep TOC visible as user scrolls past article end
5. **Keyboard navigation:** Add arrow key support for TOC items
6. **Analytics:** Track most-clicked TOC sections

### Accessibility

- All interactions are keyboard-accessible
- Proper semantic HTML (`<nav>`, `<ul>`, `<li>`)
- ARIA labels for screen readers (`aria-label="Table of contents"`)
- Focus management for smooth scroll

---

## Testing Checklist

- [x] TOC renders on blog posts with headings
- [x] TOC hidden when no headings present
- [x] Active section updates on scroll
- [x] Smooth scroll works on click
- [x] Collapse/expand toggle functions
- [x] Hidden on mobile/tablet screens
- [x] H3 headings properly indented
- [x] Theme-aware colors work in dark mode
- [ ] Test with very long blog posts (20+ headings)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

---

## Files Modified

```
src/lib/toc.ts                          (new)
src/components/table-of-contents.tsx    (new)
src/app/blog/[slug]/page.tsx           (modified)
```

---

## Example Usage

```typescript
// In any blog post MDX file:

## Introduction
Some content here...

### Background
More details...

### Goals
Project objectives...

## Implementation
Technical details...

### Architecture
System design...

## Conclusion
Wrap up...
```

This structure will generate a TOC with:
- Introduction
  - Background
  - Goals
- Implementation
  - Architecture
- Conclusion

---

## Notes

- Only H2 and H3 are included (H1 is page title)
- Headings without text are skipped
- Special characters in headings are sanitized for IDs
- TOC starts collapsed by default
- Requires at least one heading to display
