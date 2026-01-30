<!-- TLP:CLEAR -->

# Logo System

## Overview

The site uses a unified logo system based on a sparkle/star SVG that's consistently applied across all branding touchpoints.

## Architecture

### Core Component

**File:** `/src/components/logo.tsx`

The `Logo` component is a flexible, reusable React component that renders the sparkle SVG with customizable props:

```tsx
<Logo 
  width={24}           // Size in pixels or CSS units
  height={24}          // Size in pixels or CSS units
  fill="currentColor"  // Color (defaults to theme-aware currentColor)
  className=""         // Additional Tailwind classes
/>
```

**Key Features:**
- Theme-aware with `currentColor` default
- Accessible with `role="img"` and `aria-label`
- Fully typed with TypeScript
- Supports all standard SVG props

### Logo Path Data

The SVG path is defined in the Logo component:

```
M18.2 55.55Q17.65 52.3 15.3 48.52Q12.95 44.75 8.6 41.5Q4.3 38.25 0 37.35V35.25Q4.25 34.25 8.18 31.52Q12.1 28.8 14.75 24.95Q17.45 21 18.2 17.15h2.1Q20.75 19.65 22.1 22.27Q23.45 24.9 25.57 27.27Q27.7 29.65 30.35 31.55Q34.3 34.35 38.4 35.25v2.1Q35.65 37.9 32.73 39.6Q29.8 41.3 27.3 43.62Q24.8 45.95 23.2 48.5Q20.85 52.25 20.3 55.55Z
```

ViewBox: `0 17.15 38.4 38.4`

## Implementation Points

### 1. Site Header (`/src/components/site-header.tsx`)

```tsx
<Logo width={20} height={20} />
```

- Displayed in a bordered circular container
- 20×20px size for compact header appearance
- Automatically inherits theme colors

### 2. Home Page Hero (`/src/app/page.tsx`)

```tsx
<Logo width={28} height={28} className="select-none" />
```

- Inline with "Hi, I'm Drew" heading
- Slightly larger (28×28px) for prominence
- Non-selectable for better UX

### 3. Favicon & App Icons

**Dynamic Icon Generation** via Next.js metadata routes:

#### Main Favicon (`/src/app/icon.tsx`)
- **Size:** 512×512px
- **Background:** Dark gradient (`#020617` → `#111827`)
- **Logo:** 360×360px centered, `#f9fafb` fill
- **Runtime:** Edge
- **URL:** `/icon`

#### Apple Touch Icon (`/src/app/apple-icon.tsx`)
- **Size:** 180×180px
- **Background:** Dark gradient (same as favicon)
- **Logo:** 120×120px centered, `#f9fafb` fill
- **Runtime:** Edge
- **URL:** `/apple-icon`

**Benefits:**
- Generated on-demand (no static files)
- Single source of truth
- Consistent across platforms
- Edge-optimized delivery

### 4. Social Preview Images

#### Open Graph Image (`/src/app/opengraph-image.tsx`)

Used for Facebook, LinkedIn, Discord, Slack, etc.

- **Size:** 1200×630px
- **Logo:** 28×28px in footer alongside domain name
- **Background:** Dark gradient with title and description
- **Dynamic:** Supports custom title/description via query params

Example URL:
```
/opengraph-image?title=Custom+Title&description=Custom+Description
```

#### Twitter Card (`/src/app/twitter-image.tsx`)

Identical to OG image, optimized for Twitter/X.

- **Size:** 1200×630px
- **Card Type:** `summary_large_image`
- **Logo:** 28×28px in footer

### 5. Metadata Configuration (`/src/app/layout.tsx`)

```tsx
icons: {
  icon: "/icon",
  apple: "/icon",
}
```

Next.js automatically:
- Generates multiple favicon sizes
- Serves appropriate format per device
- Caches at the edge

## Usage Guidelines

### When to Use the Logo Component

✅ **DO use for:**
- Header/navigation branding
- Hero sections and page titles
- Inline text decorations
- Custom UI elements needing the brand mark

❌ **DON'T use for:**
- Social preview images (use metadata routes)
- Favicons (use metadata routes)
- Static/print assets (export SVG separately)

### Sizing Recommendations

| Context | Size | Example |
|---------|------|---------|
| Header navigation | 20×20 | Site header |
| Inline with text | 24-28 | Page headings |
| Hero/prominent | 32-48 | Landing sections |
| Icons/buttons | 16-20 | UI elements |
| Favicons | Auto | Via metadata routes |
| Social previews | 28 | OG/Twitter images |

### Color Customization

**Default (recommended):**
```tsx
<Logo /> // Uses currentColor, inherits from parent
```

**Theme-specific:**
```tsx
<Logo className="text-primary" />
<Logo className="dark:text-white light:text-black" />
```

**Explicit color:**
```tsx
<Logo fill="#3b82f6" />
```

## Migration from Static Icons

### Before
- Static PNG files in `/public/icons/`
- Separate light/dark mode variants
- Manual icon generation and export

### After
- Dynamic SVG generation via metadata routes
- Automatic theme support
- Single Logo component as source
- Edge-optimized delivery

### Removed Files
- `/public/icons/icon-light.png` ⛔️
- `/public/icons/icon-dark.png` ⛔️

See `/public/icons/README.md` for migration details.

## Maintenance

### Updating the Logo

To modify the logo design, update **one file**:

**`/src/components/logo.tsx`**

Change the `path` element's `d` attribute with new SVG path data.

All instances automatically update:
- Site header
- Page headings
- Favicons
- Social preview images

### Adding New Icon Sizes

Create a new metadata route:

```tsx
// /src/app/icon-[size].tsx
import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

const logoPath = "..."; // Copy from Logo component

export default function Icon192() {
  return new ImageResponse(
    (
      <div style={{ /* container */ }}>
        <svg viewBox="0 17.15 38.4 38.4">
          <path d={logoPath} />
        </svg>
      </div>
    ),
    size
  );
}
```

## Testing

### Visual Testing
1. Start dev server: `npm run dev`
2. Check header: http://localhost:3000
3. Check favicon: Browser tab icon
4. Check OG: http://localhost:3000/opengraph-image
5. Check Twitter: http://localhost:3000/twitter-image

### Social Preview Testing
Use these validators:
- **Facebook:** https://developers.facebook.com/tools/debug/
- **Twitter:** https://cards-dev.twitter.com/validator
- **LinkedIn:** https://www.linkedin.com/post-inspector/

### Lighthouse/Accessibility
- Logo has `role="img"` ✅
- Logo has `aria-label` ✅
- SVG uses `currentColor` for theme support ✅

## Technical Details

### SVG Optimization
- Path uses relative commands (Q, V, h) for smaller filesize
- ViewBox precisely crops to logo bounds
- No unnecessary groups or transforms
- Fill color controlled via props

### Performance
- **Component:** Zero runtime cost, pure SVG
- **Favicons:** Generated once, cached at edge
- **Social images:** Generated on-demand, cached with stale-while-revalidate

### Browser Support
- All modern browsers (SVG support)
- Edge Runtime compatible
- iOS Safari (via apple-icon)
- Progressive Web Apps ready

## Related Files

| File | Purpose |
|------|---------|
| `/src/components/logo.tsx` | Core Logo component |
| `/src/components/site-header.tsx` | Header implementation |
| `/src/app/page.tsx` | Homepage hero usage |
| `/src/app/icon.tsx` | Favicon generation |
| `/src/app/apple-icon.tsx` | Apple touch icon |
| `/src/app/opengraph-image.tsx` | OG social preview |
| `/src/app/twitter-image.tsx` | Twitter card preview |
| `/src/app/layout.tsx` | Metadata configuration |
| `/public/icons/README.md` | Migration notes |

## Future Enhancements

Potential improvements:
- [ ] Add favicon manifest for PWA
- [ ] Generate Windows tile icons
- [ ] Create animated logo variant
- [ ] Add logo loading skeleton
- [ ] SVG sprite sheet for performance
- [ ] Logo color palette documentation
