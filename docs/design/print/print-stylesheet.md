# Print Stylesheet Documentation

**Last Updated:** October 24, 2025

## Overview

The print stylesheet (`src/app/print.css`) provides optimized styling for printing blog posts and other content from www.dcyfr.ai. It ensures that printed pages are clean, readable, and professional-looking while hiding unnecessary interactive elements.

## Features

### 📄 Page Layout
- **Page Size:** Letter portrait with 2cm/2.5cm margins
- **First Page:** Reduced top margin (1.5cm) to fit more content
- **Font Size:** 11pt base with 1.6 line-height for readability
- **Typography:** Georgia/Times New Roman serif for body text

### 🎨 Typography Optimization
- **Headings:** Serif font family with appropriate sizing
  - H1: 22pt (page titles)
  - H2: 16pt (major sections)
  - H3: 13pt (subsections)
- **Paragraphs:** Justified text with widow/orphan control
- **Code:** Courier New monospace at 8.5pt with wrap

### 📝 Blog Post Specific Features
- **Header Section:** Bordered header with metadata
- **Post Metadata:** Smaller font (9pt) for dates, reading time, views
- **Badges:** Print-friendly with subtle borders
- **Related Posts:** Section with border separator
- **Sources/References:** Formatted footer section
- **TOC/Comments:** Hidden (not useful in print)

### 🔗 Link Handling
- **External Links:** Show full URL in parentheses (8pt gray text)
- **Internal Links:** URLs hidden (not useful in print)
- **Heading Anchors:** URLs hidden

### 💻 Code Block Optimization
- **Pre-formatted:** Gray background (#f8f8f8) with border
- **Font Size:** 8.5pt for better fit
- **Word Wrap:** Enabled to prevent overflow
- **Syntax Colors:** Simplified grayscale preservation
  - Comments: Gray, italic
  - Keywords: Bold, black
  - Strings: Dark gray

### 🖼️ Media Handling
- **Images:** Max-width 100%, auto height, centered
- **Figures:** Page-break avoidance with italic captions
- **Videos/Embeds:** Hidden (not printable)

### 🚫 Hidden Elements
The following elements are hidden in print:
- Site header and footer
- Navigation menus
- Interactive buttons
- Theme toggle
- Table of contents
- Reading progress indicator
- Share buttons
- Comment sections (Giscus)
- Video/audio embeds
- iframes

### 📐 Smart Page Breaks
- **Avoid Breaks In:**
  - Headings
  - Code blocks
  - Blockquotes
  - Tables
  - Figures
  - Cards/sections
- **Orphans/Widows:** Minimum 3 lines

### 🔗 "Read Online" URL Footer
- **Feature:** Automatically displays the blog post URL at the bottom of printed pages
- **Scope:** Only appears on full blog post pages (`/blog/[slug]`), NOT on post list views
- **Implementation:** Uses `article[data-url]:after` pseudo-element with `attr(data-url)`
- **Selector:** Specific to articles with `data-url` attribute (prevents appearing on homepage/blog list)
- **Format:** "Read online: https://www.dcyfr.ai/blog/[slug]"
- **Styling:** Small gray text (8pt) with top border separator
- **Purpose:** Allows readers to reference the online version for updates, links, or sharing

## Usage

### Testing Print Styles

**Method 1: Browser Print Preview**
1. Navigate to any blog post
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux)
3. Review the print preview
4. Check for proper formatting and hidden elements

**Method 2: Save as PDF**
1. Open print dialog
2. Select "Save as PDF" as destination
3. Review the generated PDF for quality

### Best Practices for Content Authors

When creating blog posts, keep print-friendly formatting in mind:

1. **Code Blocks:** Keep code snippets under 80 characters when possible
2. **Images:** Use appropriate sizes (not too large)
3. **Links:** Descriptive text for external links (URLs will show)
4. **Tables:** Keep tables simple and narrow enough to fit on page
5. **Lists:** Use moderate nesting (2-3 levels max)

### Testing Checklist

- [ ] Blog post title and metadata visible
- [ ] Post content readable with good typography
- [ ] Code blocks properly formatted and wrapped
- [ ] Images display correctly
- [ ] External link URLs shown in parentheses
- [ ] Internal link URLs hidden
- [ ] Header/footer/navigation hidden
- [ ] Interactive elements hidden
- [ ] Page breaks in appropriate places
- [ ] Sources/references section formatted
- [ ] "Read online: [URL]" appears at bottom of article

## Technical Details

### File Location
```
src/app/print.css
```

### Import
The print stylesheet is imported in `src/app/layout.tsx`:
```tsx
import "./print.css";
```

### Media Query
All styles are wrapped in `@media print { }` to only apply when printing.

### Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support

### CSS Features Used
- `@page` rule for page margins and size
- `page-break-*` properties for break control
- `orphans` and `widows` for typography
- CSS content for link URLs
- `!important` for critical overrides

## Customization

### Adjusting Page Margins
```css
@page {
  margin: 2cm 2.5cm; /* top/bottom left/right */
}
```

### Changing Font Sizes
```css
body {
  font-size: 11pt; /* Base font size */
}
```

### Hiding Additional Elements
```css
.my-element {
  display: none !important;
}
```

### Custom Page Breaks
```css
.always-break-before {
  page-break-before: always;
}

.never-break-inside {
  page-break-inside: avoid;
}
```

## Future Enhancements

Potential improvements for future iterations:

- [ ] **QR Code:** Add QR code with article URL in footer
- [ ] **Print-specific images:** Optimize images for print resolution
- [ ] **Citation formatting:** Add proper citation format for sources
- [ ] **Table of contents:** Optional printable TOC for long articles
- [ ] **Footnotes:** Better footnote handling for references
- [ ] **Multi-column layout:** Consider for certain page types
- [ ] **Page numbers:** Add page numbers for multi-page documents
- [ ] **Header/footer:** Optional custom headers for long articles

## Related Documentation

- [Blog Architecture](/docs/blog/architecture.md) - Blog system overview
- [Typography Guide](/docs/design/typography.md) - Typography system
- [Component: MDX](/docs/components/mdx.md) - MDX rendering

## Troubleshooting

### Issue: Code blocks cut off at page breaks
**Solution:** Code blocks have `page-break-inside: avoid` but very long blocks may still break. Consider splitting long code examples.

### Issue: External URLs make text hard to read
**Solution:** The URL display can be disabled by removing the `a[href^="http"]:after` rule.

### Issue: Images too large for page
**Solution:** Images are set to `max-width: 100%` but may need manual resizing in the source.

### Issue: Dark mode colors bleeding through
**Solution:** The stylesheet forces all dark mode elements to white background and black text.

### Issue: Header still showing
**Solution:** Verify the element has class `.site-header` or is within `header > nav`.

## Browser Print Settings Recommendations

For best results, recommend these print settings to users:

- **Layout:** Portrait
- **Paper size:** Letter (8.5" x 11")
- **Margins:** Default (handled by CSS)
- **Headers/Footers:** Off
- **Background graphics:** Off (forced by CSS anyway)
- **Scale:** 100%

---

**Pro Tip:** When testing print styles during development, use Chrome DevTools' Rendering panel to toggle "Emulate CSS media type: print" to see print styles without opening the print dialog.
