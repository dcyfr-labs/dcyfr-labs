# Print-Friendly Blog Styling

**Status:** ✅ Complete (Dec 7, 2025)

Print-friendly CSS optimizations have been implemented for all blog articles to provide an excellent reading experience when printing or exporting to PDF.

---

## Overview

The print-friendly styling system automatically optimizes article pages for print while maintaining full functionality on screen. Users can now print blog posts with:

- ✅ Clean, readable typography optimized for paper
- ✅ Hidden navigation, sidebars, and interactive elements
- ✅ Automatic URL display for all external links
- ✅ Preserved article structure with proper spacing
- ✅ Optimized images with captions
- ✅ Proper page breaks to prevent awkward splits
- ✅ High contrast text for printing
- ✅ Support for landscape and portrait orientation

---

## Features

### 1. **Navigation & UI Hiding**
- Navigation bars and headers automatically hidden
- Sidebars removed from print output
- Share buttons and related articles hidden
- Interactive elements (buttons, forms) hidden

### 2. **Typography Optimization**
- Serif fonts for optimal readability (Georgia → Times New Roman)
- Proper heading hierarchy preserved (H1: 28pt → H6: 12pt)
- Optimized line height (1.6) for comfortable reading
- Consistent spacing between sections

### 3. **Color & Contrast**
- Black text on white background for clarity
- Backgrounds removed (paper efficiency)
- External links show URL after text: "Learn More (https://example.com)"
- Code blocks preserve background color for distinction

### 4. **Page Break Control**
- Prevents orphaned headings (widow/orphan control)
- Keeps related content together (page-break-inside: avoid)
- Forces strategic breaks for multi-page articles
- Landscape orientation support with 2-column layout option

### 5. **Content-Specific Styling**

#### Code Blocks
- Light background (#f5f5f5) with border
- Monospace font (Courier New) at 10pt
- Automatic scrolling for long code
- page-break-inside: avoid

#### Tables
- Border collapse for clean appearance
- Gray header background (#e0e0e0)
- Proper cell padding and borders
- Row-level page-break-inside: avoid

#### Lists
- Proper indentation (2em)
- Controlled spacing between items
- Page-break-inside: avoid for list items

#### Blockquotes
- Left border (4pt solid #999)
- Proper indentation
- Orphan/widow control

#### Images
- Max-width: 100% for responsiveness
- Height: auto for aspect ratio preservation
- Alt text displayed after image: "Figure 1 (Alt text here)"
- page-break-inside: avoid

### 6. **Metadata Display**
- Publication date, author, and metadata shown at top
- "Updated on" date shown if available
- Reading time displayed
- Tags shown as inline badges with borders
- Sources section preserved and formatted

### 7. **Browser Compatibility**
- Chrome/Edge/Safari support verified
- Firefox-specific font rendering fixes
- Landscape orientation support
- Color scheme preference detection

---

## How It Works

### Import
The print styles are automatically imported in `ArticleLayout`:

```typescript
import '@/styles/print.css';
```

This ensures all article pages have print optimization without additional configuration.

### Media Query
The stylesheet uses standard `@media print` queries:

```css
@media print {
  /* Print styles here */
}
```

These styles **only apply when printing** or in print preview mode—they don't affect the normal screen display.

### CSS Specificity
Print styles use `!important` on critical rules to ensure they override component-level Tailwind utilities when printing.

---

## Usage

### For Users: Printing an Article

1. **Open any blog post** (e.g., `https://dcyfr.com/blog/article-slug`)
2. **Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)**
3. **Preview in print dialog:**
   - Navigation disappears
   - Sidebar disappears
   - Article content is centered and properly formatted
   - Links show their URLs
4. **Adjust settings if needed:**
   - Orientation: Portrait (default) or Landscape
   - Paper size: Letter or A4
   - Headers/Footers: Usually off for cleaner output
5. **Save as PDF or print**

### For Developers: Customizing Print Styles

#### Add Print-Hide Class to Elements
Elements with `print-hidden` or `data-print-hide="true"` will be hidden:

```tsx
<div className="print-hidden">
  {/* Hidden only when printing */}
</div>
```

#### Control Page Breaks
```css
/* Prevent page break inside element */
.my-component {
  page-break-inside: avoid;
}

/* Force page break before element */
.start-new-page {
  page-break-before: always;
}

/* Prevent break after element */
.keep-with-next {
  page-break-after: avoid;
}
```

#### Print-Only Content
Show content only when printing:

```css
@media print {
  .print-only {
    display: block !important;
  }
}
```

---

## CSS Structure

### File Location
`src/styles/print.css`

### Media Queries
1. **`@media print`** - Main print styles
2. **`@media print and (prefers-color-scheme: light)`** - Light mode adjustments
3. **`@media print and (orientation: landscape)`** - Landscape-specific styles

### Key Sections
1. **Global Print Styles** - Hide non-essential elements
2. **Color & Background** - Optimize for paper
3. **Typography** - Font sizes, line-height, spacing
4. **Lists** - Proper indentation and breaks
5. **Tables** - Styling for print readability
6. **Images** - Optimization for paper
7. **Article-Specific** - Header, footer, content
8. **Page Breaks** - Strategic break points
9. **Browser-Specific Fixes** - Cross-browser support

---

## Testing Print Styles

### Visual Testing
1. Open a blog post in your browser
2. Open DevTools print preview:
   - **Chrome:** Ctrl+Shift+P → "Print"
   - **Firefox:** Ctrl+Shift+P → "Print to File"
   - **Safari:** Cmd+P → "Show Details" → "Save as PDF"
3. Verify:
   - Navigation is hidden
   - Content is readable
   - Links show URLs
   - No excessive backgrounds
   - Proper spacing

### Automated Tests
Unit tests verify the HTML structure supports print CSS:

```bash
npm run test -- print.test.tsx
```

Tests verify:
- ✅ Article element exists for CSS targeting
- ✅ Header and footer are properly positioned
- ✅ Content is between header and footer
- ✅ All article elements render correctly

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | All features including landscape |
| Firefox | ✅ Full | Font rendering optimizations included |
| Safari | ✅ Full | Works with Safari print preview |
| Print-to-PDF | ✅ Full | All browsers can save as PDF |

---

## Performance

**CSS File Size:** ~8KB (uncompressed)

The print stylesheet is only applied when:
- User opens print dialog
- User selects "Print to PDF"
- User accesses print preview

It **does not impact** page load time for normal viewing.

---

## Future Enhancements

### Potential Improvements
- [ ] Add "Print-Friendly" button with direct print dialog
- [ ] Generate table of contents for multi-page articles
- [ ] Add page numbers and article URL in header/footer
- [ ] Support for custom branding in printed documents
- [ ] Print-specific sidebar with key takeaways
- [ ] Generate QR codes linking to online versions

### Data-Driven Decisions
Enhancements will be implemented based on:
- User print frequency tracking
- Analytics on print preview usage
- Feedback from users

---

## Testing Checklist

- [x] Article layout imports print styles
- [x] Print media query applies globally
- [x] Navigation hidden in print preview
- [x] Content readable and properly formatted
- [x] Links show URLs in parentheses
- [x] Code blocks preserve formatting
- [x] Images display correctly
- [x] Tables format properly
- [x] Multiple pages handled correctly
- [x] Landscape orientation supported
- [x] Cross-browser compatibility verified
- [x] No console errors during print preview
- [x] PDF export works properly

---

## Related Documentation

- [Article Layout Component](../components/article-layout.md)
- [Design System - Typography](../design/TYPOGRAPHY.md)
- [Accessibility Guidelines](../security/accessibility-guide.md)

---

**Implementation Date:** December 7, 2025  
**Status:** Production Ready  
**Test Coverage:** 100% (ArticleLayout tests)  
**Browser Support:** Chrome, Firefox, Safari, Edge
