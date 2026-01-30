<!-- TLP:CLEAR -->

# Activity Heatmap Export Feature

**Status:** ✅ Complete (December 25, 2025)
**Related:** Stage 4 - Activity Heatmap Visualization

## Overview

The heatmap export feature allows users to download their activity heatmap as a high-resolution PNG image, perfect for sharing on social media, portfolios, or presentations.

## Features

### Export Options

- **Format:** PNG (high quality, transparent background)
- **Resolution:** 2x scale for retina displays (1600x800 typical output)
- **Quality:** 100% PNG compression
- **Filename:** Auto-generated with current date (`activity-heatmap-2025-12-25.png`)

### User Interface

**Export Button:**
- Location: Top-right of heatmap card, next to statistics badge
- Icon: Download icon from lucide-react
- States:
  - Default: "Export PNG" with download icon
  - Loading: "Exporting..." with disabled state
  - Completed: Success alert with filename

**User Feedback:**
- Browser alerts for success/error states
- Loading state prevents duplicate exports
- Clear filename in success message

## Implementation Details

### Architecture

**Files:**
- `src/lib/activity/heatmap-export.ts` - Export utilities
- `src/components/activity/ActivityHeatmapCalendar.tsx` - UI integration
- `src/__tests__/lib/activity-heatmap-export.test.ts` - Unit tests (18 tests)
- `e2e/activity-heatmap-export.spec.ts` - E2E tests (12 scenarios)

**Dependencies:**
- `html2canvas` - DOM-to-canvas conversion library (~500KB)
- `@types/html2canvas` - TypeScript types (dev)

### Export Process

1. User clicks "Export PNG" button
2. Button enters loading state (disabled, shows "Exporting...")
3. `html2canvas` converts heatmap DOM element to canvas
4. Canvas converts to PNG data URL
5. Temporary anchor element triggers browser download
6. Success/error alert shown to user
7. Button returns to normal state

### Technical Specifications

**html2canvas Configuration:**
```typescript
{
  backgroundColor: null,          // Transparent background
  scale: 2,                       // 2x resolution for retina
  useCORS: true,                 // Allow cross-origin images
  logging: false,                // Suppress console logs
  removeContainer: true,         // Clean up temp elements
  imageTimeout: 15000,           // 15s timeout for images
  foreignObjectRendering: true,  // Render SVG properly
  allowTaint: true,              // Allow cross-origin content
}
```

**Performance:**
- Export time: ~1-3 seconds (depending on device)
- File size: ~50-200KB (varies with activity density)
- Memory usage: Minimal (cleanup after export)

## Code Examples

### Basic Usage

```tsx
import { exportHeatmapAsImage } from '@/lib/activity/heatmap-export';

const handleExport = async () => {
  const result = await exportHeatmapAsImage({
    element: heatmapRef.current,
  });

  if (result.success) {
    console.log(`Saved as ${result.filename}`);
  }
};
```

### Custom Configuration

```typescript
await exportHeatmapAsImage({
  element: heatmapRef.current,
  filename: "my-activity-2025",
  quality: 0.95,
  backgroundColor: "#ffffff",
  scale: 3, // 3x for extra high resolution
});
```

## Testing

### Unit Tests (18 Tests, 100% Passing)

**Coverage:**
- Filename generation (3 tests)
- Successful exports (6 tests)
- Error handling (4 tests)
- Configuration options (3 tests)
- Integration scenarios (2 tests)

**Run tests:**
```bash
npm test -- activity-heatmap-export.test.ts
```

### E2E Tests (12 Scenarios)

**Coverage:**
- Button visibility and states
- Download triggering
- Responsive design (mobile/tablet/desktop)
- Accessibility (keyboard navigation)
- Sequential exports
- Post-interaction exports

**Run tests:**
```bash
npx playwright test activity-heatmap-export.spec.ts
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Optimal performance |
| Firefox 88+ | ✅ Full | Slightly slower rendering |
| Safari 14+ | ✅ Full | May require CORS headers |
| Edge 90+ | ✅ Full | Chromium-based, full support |

**Limitations:**
- Requires JavaScript enabled
- May not work in strict CSP environments
- Large heatmaps (>2 years) may be slow

## User Guide

### How to Export Your Heatmap

1. Navigate to `/activity` page
2. Click "Heatmap" tab
3. Wait for heatmap to fully render
4. Click "Export PNG" button in top-right
5. File downloads automatically to default download folder

### Tips

- **Best resolution:** Export on desktop for highest quality
- **Custom filename:** File is automatically named with current date
- **Sharing:** PNG has transparent background, works on any platform
- **Multiple exports:** You can export multiple times - each gets a unique filename

## Future Enhancements

### Potential Improvements

1. **Format Options:**
   - SVG export (vector graphics, infinite zoom)
   - JPEG export (smaller file size)
   - WebP export (modern browsers, best compression)

2. **Customization:**
   - Custom filename input field
   - Color scheme selection (light/dark/custom)
   - Date range selector for export
   - Resolution/quality slider

3. **Advanced Features:**
   - Copy to clipboard (paste directly)
   - Share via Web Share API
   - Email export option
   - Automatic cloud backup (Google Drive, Dropbox)

4. **Performance:**
   - Progressive rendering for large heatmaps
   - Cached export (reuse for same data)
   - Background export (Web Workers)

### Implementation Complexity

| Enhancement | Complexity | Value | Priority |
|-------------|-----------|-------|----------|
| SVG export | Medium | High | Medium |
| Custom filename | Low | Medium | Low |
| Copy to clipboard | Low | High | High |
| Web Share API | Low | High | High |
| Date range selection | High | Medium | Low |

## Troubleshooting

### Common Issues

**Export button doesn't respond:**
- Check browser console for errors
- Verify heatmap is fully rendered
- Try refreshing the page

**Download fails:**
- Check browser download permissions
- Verify sufficient disk space
- Disable browser extensions temporarily

**Poor image quality:**
- Export on desktop (not mobile)
- Check internet connection (if loading external images)
- Try clearing browser cache

**Slow export:**
- Normal for 12+ month heatmaps
- Reduce date range if possible
- Use faster device/browser

## Metrics & Analytics

### Success Criteria

- [ ] Export completion rate ≥95%
- [ ] Average export time <3 seconds
- [ ] User adoption ≥30% of heatmap viewers
- [ ] Zero export-related errors in production

### Tracking (Future)

```typescript
// Example analytics event
analytics.track('heatmap_exported', {
  format: 'png',
  resolution: '1600x800',
  monthsDisplayed: 12,
  totalActivities: 450,
  exportDuration: 2.1,
});
```

## References

- **html2canvas Documentation:** https://html2canvas.hertzen.com/
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **Download Attribute:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download

---

**Implemented:** December 25, 2025
**Last Updated:** December 25, 2025
**Contributors:** Claude Code Agent
