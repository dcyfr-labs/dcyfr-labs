# Image Optimization Guide

**Last Updated:** October 26, 2025  
**Status:** ✅ Project is fully optimized

---

## Current State

### ✅ Image Optimization Audit Complete

The project has been audited and **no traditional image optimization work is needed**:

- ✅ **No static images** - Zero `.png`, `.jpg`, `.jpeg`, `.gif`, or `.webp` files found
- ✅ **SVG-based graphics** - All visual elements use scalable vector graphics
- ✅ **Dynamic OG image generation** - Using Next.js `ImageResponse` API (Edge runtime)
- ✅ **No `<img>` tags** - No unoptimized HTML image elements in codebase
- ✅ **Blog posts** - No embedded images in MDX content

### Current Implementation

**Dynamic Image Generation:**
- **OG Images**: `src/app/opengraph-image.tsx` - 1200×630 PNG (Edge runtime)
- **Twitter Cards**: Uses same OG image generation with query params
- **Favicons**: `src/app/icon.tsx` - 512×512 PNG with light/dark variants (Edge runtime)
- **Logo**: SVG path data in `src/lib/logo-config.ts` (zero bytes, infinite scaling)

**Benefits of Current Approach:**
- 🚀 **Zero image downloads** - No static assets to load
- 🎨 **Infinite scalability** - SVG scales perfectly at any resolution
- 🌗 **Theme-aware** - Icons adapt to light/dark mode
- ⚡ **Edge-optimized** - OG images generated at CDN edge locations
- 📦 **Tiny bundle** - No image processing libraries needed

---

## Future Guidelines

When adding images to the project, follow these best practices:

### 1. Prefer SVG for Graphics

**When to use:**
- Icons, logos, diagrams
- Simple illustrations
- UI elements

**Benefits:**
- Zero HTTP requests (inline in HTML/CSS)
- Infinite scaling with no quality loss
- Tiny file sizes (often < 1KB)
- Easy to theme and animate

**Example:**
```tsx
// Inline SVG component
export function Icon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M..." />
    </svg>
  );
}
```

### 2. Next.js Image Component for Photos

**When to use:**
- Photography
- Screenshots
- Complex graphics that don't work as SVG
- External images from APIs

**Setup:**
```tsx
import Image from "next/image";

// Local image (in public/ folder)
<Image
  src="/photos/example.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
  quality={85}
  priority={false} // true for above-the-fold
/>

// External image
<Image
  src="https://example.com/image.jpg"
  alt="External image"
  width={800}
  height={600}
  unoptimized={false} // false = Next.js optimizes it
/>
```

### 3. Loading Strategies

**Priority images** (above the fold, LCP candidates):
```tsx
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={true} // Preloads, no lazy loading
/>
```

**Lazy loaded images** (below the fold):
```tsx
<Image
  src="/content.jpg"
  alt="Content image"
  width={800}
  height={600}
  loading="lazy" // Default behavior
/>
```

**Background images** (decorative):
```tsx
<Image
  src="/background.jpg"
  alt=""
  fill
  sizes="100vw"
  style={{ objectFit: "cover" }}
  quality={75}
/>
```

### 4. Responsive Images

**Use `sizes` prop** for responsive layouts:
```tsx
<Image
  src="/responsive.jpg"
  alt="Responsive image"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Explanation:**
- Mobile (≤768px): image takes 100% viewport width
- Tablet (≤1200px): image takes 50% viewport width  
- Desktop (>1200px): image takes 33% viewport width

Next.js automatically generates and serves the optimal size.

### 5. Quality Settings

**Recommended quality levels:**
- `quality={90}` - Photos with fine detail (hero images, portfolio)
- `quality={85}` - Default for most photos (good balance)
- `quality={75}` - Background images, decorative photos
- `quality={60}` - Thumbnails, small images

**Trade-offs:**
- Higher quality = larger file size + better detail
- Lower quality = smaller file size + faster loading
- Test with Lighthouse to find the sweet spot

### 6. Format Selection

Next.js automatically selects the best format:
- **WebP** - Default for most browsers (30% smaller than JPEG)
- **AVIF** - Even better compression, growing browser support
- **JPEG/PNG** - Fallback for older browsers

**Force a specific format:**
```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  format="webp" // or "avif", "jpeg", "png"
/>
```

### 7. External Images

**Configure `next.config.ts`** to allow external domains:
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "api.github.com",
        pathname: "/users/**",
      },
    ],
  },
};
```

**Security note:** Only allowlist trusted domains.

### 8. MDX Blog Images

**For images in blog posts**, use the Image component through MDX:

**Option 1: MDX custom component**
```mdx
---
title: "My Blog Post"
---

<Image
  src="/blog/screenshot.png"
  alt="Application screenshot"
  width={1200}
  height={800}
/>

Regular MDX content continues here...
```

**Option 2: Markdown syntax with custom renderer**
Update `src/components/mdx.tsx`:
```tsx
const components = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={props.src || ""}
      alt={props.alt || ""}
      width={1200}
      height={800}
      className="rounded-lg"
    />
  ),
};
```

Then use standard markdown:
```markdown
![Screenshot of app](optimized-screenshot.jpg)
```

### 9. Performance Checklist

Before deploying images:

- [ ] **Alt text** - Descriptive, unique, explains image purpose
- [ ] **Dimensions** - Always specify `width` and `height` to prevent layout shift
- [ ] **Priority** - Set `priority={true}` for above-the-fold images only
- [ ] **Quality** - Test different quality settings, aim for smallest acceptable size
- [ ] **Sizes** - Use `sizes` prop for responsive images
- [ ] **Format** - Let Next.js auto-select, or force WebP/AVIF for modern browsers
- [ ] **Lazy loading** - Default behavior for below-the-fold images
- [ ] **Lighthouse** - Run audit, aim for score ≥90

### 10. Debugging

**Check generated images:**
```bash
# Development (images optimized on-demand)
npm run dev
# Visit: http://localhost:3000/_next/image?url=/photo.jpg&w=1200&q=85

# Production (images optimized at build time)
npm run build
npm start
```

**Common issues:**

1. **"Invalid src prop"** - Check `remotePatterns` in `next.config.ts`
2. **Layout shift** - Always specify `width` and `height`
3. **Blurry images** - Increase `quality` prop or source image resolution
4. **Slow loading** - Use `priority={true}` for critical images
5. **Large bundle** - Images are NOT in the bundle (served separately)

---

## Next.js Image API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image URL (local or external) |
| `alt` | string | required | Alt text for accessibility |
| `width` | number | required* | Image width in pixels |
| `height` | number | required* | Image height in pixels |
| `fill` | boolean | false | Fill parent container (replaces width/height) |
| `sizes` | string | "100vw" | Responsive sizes for srcset |
| `quality` | number | 85 | Image quality (1-100) |
| `priority` | boolean | false | Preload image (disable lazy loading) |
| `loading` | "lazy" \| "eager" | "lazy" | Loading strategy |
| `placeholder` | "blur" \| "empty" | "empty" | Placeholder while loading |
| `blurDataURL` | string | - | Base64 blur placeholder |
| `unoptimized` | boolean | false | Skip Next.js optimization |

*Required unless using `fill` prop

### Configuration (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"], // Preferred formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon sizes
    minimumCacheTTL: 60, // Cache duration in seconds
    remotePatterns: [], // Allowed external image domains
  },
};
```

---

## Resources

- **Next.js Image Docs**: https://nextjs.org/docs/app/api-reference/components/image
- **Image Optimization**: https://nextjs.org/docs/app/building-your-application/optimizing/images
- **OG Image Generation**: https://vercel.com/docs/og-image-generation
- **Web.dev Image Guide**: https://web.dev/fast/#optimize-your-images

---

## Summary

✅ **Current Status:** Zero optimization work needed - project uses SVG and dynamic generation  
📋 **Future Reference:** Follow guidelines above when adding raster images  
🎯 **Goal:** Maintain 90+ Lighthouse performance score with optimized assets
