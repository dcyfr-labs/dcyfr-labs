# Share Buttons Component

## Overview

The `ShareButtons` component provides social media sharing functionality for blog posts. It includes buttons for Twitter, LinkedIn, and copy-to-clipboard, with responsive design and accessibility features.

**Location:** `src/components/share-buttons.tsx`  
**Type:** Client Component (`"use client"`)  
**Dependencies:** `lucide-react`, `sonner`, shadcn/ui `Button`

---

## Features

### Sharing Options
- **Twitter** - Share with pre-filled text, URL, and up to 3 hashtags from post tags
- **LinkedIn** - Share post URL (LinkedIn doesn't support pre-filled text)
- **Copy Link** - Copy URL to clipboard with visual feedback and toast notification

### User Experience
- ✅ Responsive design with labels hidden on mobile (icons only)
- ✅ Popup windows for social shares (fallback to new tab if blocked)
- ✅ Toast notifications for copy feedback
- ✅ Visual feedback: check icon for 2 seconds after copying
- ✅ Keyboard navigation support
- ✅ Accessible with proper ARIA labels

### Technical Details
- Uses modern Clipboard API with fallback for older browsers
- Proper URL encoding for all share parameters
- Error handling with console logging and toast feedback
- TypeScript strict mode compliance
- Clean hashtag generation (removes special characters)

---

## Usage

### Basic Example
```tsx
import { ShareButtons } from "@/components/share-buttons";

<ShareButtons
  url="https://example.com/blog/my-post"
  title="My Awesome Blog Post"
  tags={["react", "nextjs", "typescript"]}
/>
```

### Integration in Blog Posts
```tsx
// In src/app/blog/[slug]/page.tsx
<div className="mt-12 border-t pt-8">
  <ShareButtons
    url={`${SITE_URL}/blog/${post.slug}`}
    title={post.title}
    tags={post.tags}
  />
</div>
```

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | Yes | The full URL to share (must be absolute) |
| `title` | `string` | Yes | The title of the content being shared |
| `tags` | `string[]` | No | Array of tags for Twitter hashtags (max 3 used) |

---

## Implementation Details

### Twitter Share URL Generation
```tsx
const getTwitterShareUrl = () => {
  const text = title;
  // Take first 3 tags and clean them for hashtags
  const hashtags = tags
    .slice(0, 3)
    .map(tag => tag.replace(/[^a-zA-Z0-9]/g, ''))
    .join(',');
  
  const params = new URLSearchParams({
    text,
    url,
    ...(hashtags && { hashtags }),
  });
  
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};
```

**Features:**
- Uses Twitter's intent/tweet endpoint
- Properly encodes title and URL
- Converts post tags to hashtags (max 3)
- Removes special characters from hashtags

### LinkedIn Share URL Generation
```tsx
const getLinkedInShareUrl = () => {
  const params = new URLSearchParams({ url });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
};
```

**Note:** LinkedIn's share API only accepts URL parameter, not title or description.

### Copy to Clipboard
```tsx
const handleCopyLink = async () => {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    setCopied(true);
    toast.success("Link copied to clipboard!");
    
    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error('Failed to copy link:', error);
    toast.error("Failed to copy link");
  }
};
```

**Features:**
- Primary: Modern Clipboard API (`navigator.clipboard.writeText`)
- Fallback: `document.execCommand('copy')` for older browsers
- Error handling with toast notifications
- Temporary visual feedback (check icon)

### Share Window Handling
```tsx
const handleShare = (shareUrl: string, platform: string) => {
  try {
    const popup = window.open(
      shareUrl,
      `share-${platform}`,
      'width=600,height=400,toolbar=no,menubar=no,resizable=yes'
    );
    
    // Fallback if popup is blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error(`Failed to open ${platform} share:`, error);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }
};
```

**Features:**
- Opens share dialogs in popup windows (600x400px)
- Detects popup blockers and falls back to new tab
- Multiple error handling layers
- Security: `noopener,noreferrer` flags

---

## Styling & Responsiveness

### Desktop View
```
[Share2 Icon] Share this post
[Twitter Icon] Twitter  [LinkedIn Icon] LinkedIn  [Link Icon] Copy Link
```

### Mobile View (< 640px)
```
[Share2 Icon] Share this post
[Twitter Icon]  [LinkedIn Icon]  [Link Icon]
```

- Labels hidden on mobile with `hidden sm:inline`
- Icon-only buttons for compact mobile layout
- Flex-wrap ensures buttons don't overflow
- Consistent spacing with `gap-2`

### States
- **Normal:** Outline buttons with hover effects
- **Copied:** Green text color + check icon for 2 seconds
- **Hover:** shadcn/ui Button default hover state
- **Focus:** Keyboard focus ring (accessibility)

---

## Accessibility

### ARIA Labels
```tsx
<Button aria-label="Share on Twitter">
  <Twitter className="h-4 w-4" aria-hidden="true" />
  <span className="hidden sm:inline">Twitter</span>
</Button>
```

### Features
- ✅ All buttons have descriptive `aria-label` attributes
- ✅ Icons marked `aria-hidden="true"` (decorative)
- ✅ Text labels visible on larger screens
- ✅ Keyboard navigation support (Tab, Enter, Space)
- ✅ Focus indicators for keyboard users
- ✅ Toast notifications for screen readers

### Testing
```bash
# Check with keyboard navigation
Tab → Focus first button
Enter/Space → Activate share
Tab → Move to next button

# Screen reader test
VoiceOver: "Share on Twitter, button"
NVDA: "Share on Twitter button"
```

---

## Browser Compatibility

### Modern Browsers (Clipboard API)
- Chrome/Edge 66+
- Firefox 63+
- Safari 13.1+
- Opera 53+

### Fallback (execCommand)
- All browsers with JavaScript enabled
- Includes older versions of IE, Safari < 13.1

### Share Window Support
- All modern browsers
- Graceful degradation: opens in new tab if popup blocked

---

## Testing

### Manual Testing Checklist

1. **Twitter Share**
   - [ ] Opens Twitter intent URL
   - [ ] Title pre-filled in tweet
   - [ ] URL included
   - [ ] First 3 tags converted to hashtags
   - [ ] Special characters removed from hashtags

2. **LinkedIn Share**
   - [ ] Opens LinkedIn share dialog
   - [ ] URL correctly passed
   - [ ] Opens in popup (or new tab if blocked)

3. **Copy Link**
   - [ ] Copies URL to clipboard
   - [ ] Shows success toast
   - [ ] Icon changes to check mark
   - [ ] Check mark reverts after 2 seconds
   - [ ] Works in private/incognito mode

4. **Responsive Design**
   - [ ] Labels visible on desktop (≥640px)
   - [ ] Labels hidden on mobile (<640px)
   - [ ] Icons properly sized on all screens
   - [ ] Buttons don't overflow container

5. **Accessibility**
   - [ ] Keyboard navigation works (Tab, Enter, Space)
   - [ ] Focus indicators visible
   - [ ] Screen reader announces button labels
   - [ ] Toast notifications announced

### Automated Testing Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButtons } from '@/components/share-buttons';

describe('ShareButtons', () => {
  it('renders all share buttons', () => {
    render(
      <ShareButtons
        url="https://example.com/post"
        title="Test Post"
        tags={["react"]}
      />
    );
    
    expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy link to clipboard')).toBeInTheDocument();
  });
  
  it('copies link to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
    
    render(
      <ShareButtons
        url="https://example.com/post"
        title="Test Post"
      />
    );
    
    const copyButton = screen.getByLabelText('Copy link to clipboard');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/post'
    );
  });
});
```

---

## Troubleshooting

### Issue: Copy button doesn't work
**Cause:** HTTPS required for Clipboard API  
**Solution:** 
- In development: Use localhost (always allowed)
- In production: Ensure site uses HTTPS
- Fallback should work automatically

### Issue: Popup windows blocked
**Cause:** Browser popup blocker  
**Solution:** Component automatically falls back to new tab

### Issue: Hashtags not appearing on Twitter
**Cause:** Special characters or spaces in tags  
**Solution:** Component auto-removes special characters with `.replace(/[^a-zA-Z0-9]/g, '')`

### Issue: Toast not appearing
**Cause:** Toaster not in layout  
**Solution:** Ensure `<Toaster />` is in root layout (already configured)

---

## Customization

### Adding More Social Platforms

```tsx
// Example: Add Facebook share
const getFacebookShareUrl = () => {
  const params = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
};

// Add button
<Button
  variant="outline"
  size="sm"
  onClick={() => handleShare(getFacebookShareUrl(), 'facebook')}
  className="gap-2"
  aria-label="Share on Facebook"
>
  <Facebook className="h-4 w-4" aria-hidden="true" />
  <span className="hidden sm:inline">Facebook</span>
</Button>
```

### Changing Button Styles

```tsx
// Use different variant
<Button variant="default" size="sm">

// Add custom colors
<Button className="bg-blue-500 hover:bg-blue-600">

// Make buttons full-width on mobile
<div className="flex flex-col sm:flex-row gap-2">
```

### Customizing Toast Messages

```tsx
// In handleCopyLink
toast.success("Link copied!", {
  description: "Share this post with your network",
  duration: 3000,
});

// Add error details
toast.error("Failed to copy", {
  description: error.message,
});
```

---

## Related Documentation

- [Blog System Architecture](../blog/architecture)
- [Component JSDoc Guide](../operations/component-jsdoc-implementation)
- [shadcn/ui Button Component](https://ui.shadcn.com/docs/components/button)
- [lucide-react Icons](https://lucide.dev/icons/)
- [Sonner Toast Library](https://sonner.emilkowal.ski/)

---

## Performance Considerations

### Bundle Size
- Icons tree-shaken from `lucide-react` (~1KB each)
- Component adds ~2KB gzipped
- No additional dependencies

### Runtime Performance
- Minimal re-renders (only on copy state change)
- No network requests (all share URLs are client-side generated)
- Popup windows don't block main thread

### SEO Impact
- Client component (`"use client"`) doesn't affect SSR
- Share buttons rendered after static content
- No impact on First Contentful Paint (FCP)

---

## Future Enhancements

- [ ] Add native Web Share API support for mobile (`navigator.share()`)
- [ ] Track share button clicks with analytics
- [ ] Add Reddit, Hacker News share buttons
- [ ] Email share option with `mailto:` link
- [ ] Customizable button order and visibility
- [ ] Share counts from social APIs (Twitter, LinkedIn)
- [ ] A/B test button placement and styling

---

**Last Updated:** October 24, 2025  
**Status:** ✅ Implemented and tested
