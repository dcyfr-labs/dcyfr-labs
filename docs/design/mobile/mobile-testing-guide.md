{/* TLP:CLEAR */}

# Mobile Layout Testing Guide

## Quick Visual Testing Checklist

Use browser DevTools to test at these key breakpoints:

### 1. Mobile Portrait (375x667 - iPhone SE)
- [ ] Header: Logo + "Drew's Lab" + nav links all visible
- [ ] Header: Navigation items have adequate tap spacing
- [ ] Footer: Stacks vertically with centered text
- [ ] Homepage: Buttons wrap without overflow
- [ ] Post list: Thumbnails are 80x64px (small but readable)
- [ ] Blog: Tag badges are 32px tall and wrap properly

### 2. Mobile Landscape (667x375)
- [ ] Header: All elements fit horizontally
- [ ] Footer: May stack or remain horizontal depending on content
- [ ] Post list: Metadata displays cleanly

### 3. Tablet (768x1024 - iPad Mini)
- [ ] Header: Environment badge still hidden
- [ ] Post thumbnails: Medium size (128x96px)
- [ ] Tag badges: 36px tall
- [ ] Footer: Horizontal layout with adequate spacing

### 4. Desktop (1280x800)
- [ ] Header: All elements including environment badge visible
- [ ] Post thumbnails: Default small size for lists
- [ ] Tag badges: Full 40px tall
- [ ] Footer: Horizontal with all links

## DevTools Mobile Testing

```bash
# Open in Chrome DevTools
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
# 3. Select device or set custom dimensions
# 4. Test both portrait and landscape

# Recommended test devices:
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPhone 14 Pro Max (430x932)
- Pixel 5 (393x851)
- iPad Mini (768x1024)
- iPad Pro (1024x1366)
```

## Common Issues to Watch For

### Header
- ❌ Logo and text wrapping to two lines
- ❌ Navigation links overlapping
- ❌ Theme toggle button cut off
- ✅ All elements have adequate spacing
- ✅ Text remains on single line

### Footer
- ❌ Links overflow horizontally
- ❌ Copyright text truncates with ellipsis
- ✅ Links wrap naturally or stack on mobile
- ✅ All text fully visible

### Post Lists
- ❌ Featured images too large, dominating card
- ❌ Card edges cut off
- ❌ Metadata wraps awkwardly (e.g., "5 min" wraps to next line)
- ✅ Images proportional to card
- ✅ All text readable without overflow
- ✅ Proper spacing between elements

### Buttons
- ❌ Buttons overflow container
- ❌ Button text truncates
- ✅ Buttons wrap to multiple rows if needed
- ✅ All text fully visible

### Tag Badges
- ❌ Badges too large on mobile
- ❌ Horizontal scroll required to see all tags
- ✅ Badges scale down on mobile
- ✅ Natural wrapping to multiple rows

## Touch Target Testing

Minimum size: 44x44px (Apple HIG standard)

Test with cursor:
1. Hover over interactive elements
2. Ensure adequate spacing between touch targets
3. Verify no accidental taps likely

Elements to test:
- [ ] Header navigation links
- [ ] Theme toggle button
- [ ] Homepage buttons (Learn more, Read my blog)
- [ ] Post list card links
- [ ] Tag filter badges
- [ ] Footer links

## Performance Testing

Mobile-specific metrics:
```bash
# Lighthouse mobile audit
npm run build
npm start
# Navigate to page in Chrome DevTools
# Run Lighthouse (mobile mode)
```

Key metrics:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## Visual Regression Testing

Compare before/after screenshots at each breakpoint:

```bash
# Take screenshots in DevTools
# Device toolbar → ... → Capture screenshot
# Save for each breakpoint and page:
- homepage-mobile-375.png
- homepage-tablet-768.png
- blog-mobile-375.png
- blog-tablet-768.png
```

## Actual Device Testing

Simulator testing is good, but test on actual devices when possible:

**High Priority:**
- iPhone (any recent model)
- Android phone (Pixel or Samsung)

**Medium Priority:**
- iPad or Android tablet
- Small Android phone (< 375px width)

**Test scenarios:**
1. Navigate through site
2. Use search on /blog
3. Filter by tags
4. Tap all interactive elements
5. Test in both portrait and landscape
6. Test with different text sizes (accessibility settings)

## Automated Testing

Consider adding visual regression tests:

```bash
# Example with Playwright
npm install -D @playwright/test
npx playwright test --project=mobile
```

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Test at specific viewport
# Use browser DevTools or tools like:
- responsively.app
- Chrome DevTools device mode
- Firefox Responsive Design Mode

# Check for horizontal scroll
# In DevTools Console:
document.documentElement.scrollWidth > document.documentElement.clientWidth
# Should return false (no overflow)
```

## Test Results Tracking

Create a simple checklist for each release:

| Page | 375px | 768px | 1280px | Notes |
|------|-------|-------|--------|-------|
| / (Homepage) | ✅ | ✅ | ✅ | All good |
| /blog | ✅ | ✅ | ✅ | All good |
| /blog/[slug] | ✅ | ✅ | ✅ | All good |
| /projects | ⏳ | ⏳ | ⏳ | Not yet tested |
| /about | ⏳ | ⏳ | ⏳ | Not yet tested |
| /contact | ⏳ | ⏳ | ⏳ | Not yet tested |

## Useful DevTools Snippets

```javascript
// Find elements wider than viewport
Array.from(document.querySelectorAll('*')).filter(el => 
  el.offsetWidth > document.documentElement.clientWidth
);

// Find touch targets smaller than 44x44
Array.from(document.querySelectorAll('a, button')).filter(el => 
  el.offsetWidth < 44 || el.offsetHeight < 44
);

// Check text overflow
Array.from(document.querySelectorAll('*')).filter(el => 
  el.scrollWidth > el.clientWidth
);
```

## Resources

- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [Firefox Responsive Design Mode](https://firefox-source-docs.mozilla.org/devtools-user/responsive_design_mode/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://m2.material.io/design/usability/accessibility.html#layout-and-typography)
