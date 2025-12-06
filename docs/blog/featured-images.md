# Featured Images Quick Start

**Status:** ✅ Production Ready  
**Last Updated:** December 6, 2025  
**Related:** [Frontmatter Schema](./frontmatter-schema.md) · [Content Creation](./content-creation.md) · [Custom Image Generation](./custom-image-generation.md)

---

## Overview

Blog posts support optional featured images that display as thumbnails in list views and as hero images on detail pages. The system uses Next.js Image component for automatic optimization.

**New Features:**
- ✨ **Automated SVG generation**: Generate custom hero images programmatically
- 📸 **Unsplash integration**: Download royalty-free professional photos
- 🎨 **Smart defaults**: Posts without custom images receive beautiful defaults based on content

---

## Quick Start

### Option 1: Generate Custom SVG (Recommended)

Generate a unique hero image for your post automatically:

```bash
npm run generate:hero -- --slug my-post-slug
```

This creates `/public/blog/images/my-post-slug/hero.svg` with styles based on your post's tags and category.

See [Custom Image Generation Guide](./custom-image-generation.md) for full details.

### Option 2: Download from Unsplash

Get professional photography with interactive search:

```bash
npm run fetch:unsplash -- --slug my-post-slug --interactive
```

Follow the prompts to search and select from results.

### Option 3: Manual Image

Add the `image` field to your post's frontmatter:

```yaml
---
title: "Your Post Title"
summary: "Post summary"
publishedAt: "2025-11-03"
tags: ["web", "design"]
image:
  url: "/blog/images/my-post/hero.jpg"
  alt: "Descriptive alt text for accessibility"
  caption: "Optional: Image caption text"
  credit: "Optional: Photo by John Doe"
---
```

### Image Field Schema

```typescript
image?: {
  url: string;           // Required: local path or external URL
  alt: string;           // Required: accessibility description
  width?: number;        // Optional: image width for optimization
  height?: number;       // Optional: image height for aspect ratio
  caption?: string;      // Optional: displayed below image
  credit?: string;       // Optional: photographer/source attribution
  position?: "top" | "left" | "right" | "background"; // List view hint
}
```

---

## Default Images

**All posts now display an image** - if no custom image is specified, the system automatically selects an appropriate default image.

### Automatic Selection

The default image system intelligently selects from three variants based on:

1. **Post tags** (most relevant):
   - **Tech/code posts** (JavaScript, TypeScript, React, Node, etc.) → Minimal dark style with code icon
   - **Design posts** (CSS, Tailwind, UI/UX, etc.) → Geometric pattern style
   - **Other content** → Gradient style (default)

2. **Post title hash** (consistent selection for same title)

3. **Fallback** → Gradient variant

### Default Image Variants

Three professionally designed defaults are available:

#### 1. **Gradient** (`/blog/images/default/hero.svg`)
- Blue-to-violet gradient background
- Clean, professional look
- Generic "Blog Post" branding
- Best for: General content, tutorials, guides

#### 2. **Minimal** (`/blog/images/default/minimal.svg`)
- Dark slate background with dot pattern
- Code bracket icon in blue/violet
- Best for: Technical posts, coding tutorials, development content

#### 3. **Geometric** (`/blog/images/default/geometric.svg`)
- Dark-to-blue gradient with grid pattern
- Hexagon geometric icon
- Best for: Design posts, UI/UX content, visual topics

### Using Default Images

**Option 1: Automatic (Recommended)**

Simply omit the `image` field - the system selects automatically:

```yaml
---
title: "Building a React Component"
tags: ["react", "typescript"]
# No image field - automatically gets "minimal" variant based on tags
---
```

**Option 2: Specify Variant**

Use the default image utility in code:

```typescript
import { getDefaultBlogImage } from "@/lib/default-images";

const image = getDefaultBlogImage({ 
  variant: "geometric" // or "gradient", "minimal"
});
```

**Option 3: Dynamic with Title**

Generate a custom default with your post title overlaid:

```typescript
import { getDynamicDefaultImage } from "@/lib/default-images";

const image = getDynamicDefaultImage(
  "Your Post Title",
  "gradient" // style variant
);
// Returns: /api/default-blog-image?title=Your+Post+Title&style=gradient
```

### Customizing Defaults

To use your own default images:

1. Replace files in `/public/blog/images/default/`:
   - `hero.svg` (gradient variant)
   - `minimal.svg` (minimal variant)
   - `geometric.svg` (geometric variant)

2. Or update the API route in `/src/app/api/default-blog-image/route.tsx` for dynamic generation

3. Modify selection logic in `/src/lib/default-images.ts`

---

## Image Storage

### Local Images (Recommended)

Store images in `/public/blog/images/{post-slug}/`:

```
public/
└── blog/
    └── images/
        └── my-post-slug/
            ├── hero.jpg         # Main featured image
            ├── screenshot-1.png  # Additional images (future)
            └── diagram.svg       # Diagrams, illustrations
```

**Usage in frontmatter:**
```yaml
image:
  url: "/blog/images/my-post-slug/hero.jpg"
  alt: "Screenshot of the application dashboard"
```

### External Images

Use full URLs for images hosted elsewhere (Unsplash, Cloudinary, etc.):

```yaml
image:
  url: "https://images.unsplash.com/photo-12345?w=1200"
  alt: "Mountain landscape at sunset"
  credit: "Photo by Jane Doe on Unsplash"
```

**Note:** External images require configuration in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
},
```

---

## Image Specifications

### Recommended Dimensions

- **Thumbnails (list view):** 400x300px (4:3 aspect ratio)
- **Hero images (detail page):** 1200x675px (16:9 aspect ratio) *future feature*
- **File size:** Under 500 KB (optimized automatically by Next.js)

### Supported Formats

- **JPEG** (photos, complex images)
- **PNG** (screenshots, transparency)
- **WebP** (modern format, best compression)
- **SVG** (illustrations, diagrams)

Next.js automatically converts to WebP/AVIF for supported browsers.

---

## Display Locations

### Current Implementation

- ✅ **Post List** - Small thumbnail (200x150px) displayed left of post content
- ✅ **Scroll Animations** - Images fade in with staggered effect

### Coming Soon (Phase 2)

- 🔜 **Hero Images** - Full-width featured image at top of post detail pages
- 🔜 **OG Images** - Use featured image for social media previews
- 🔜 **RSS Feeds** - Include images in feed items
- 🔜 **Related Posts** - Thumbnails in related posts section

---

## Examples

### Minimal Example

```yaml
image:
  url: "/blog/images/getting-started/cover.jpg"
  alt: "Getting started with the platform"
```

### Full Example

```yaml
image:
  url: "/blog/images/nextjs-performance/hero.jpg"
  alt: "Next.js performance optimization dashboard showing metrics"
  width: 1200
  height: 675
  caption: "Performance metrics before and after optimization"
  credit: "Screenshot from Vercel Analytics"
  position: "top"
```

### External Image with Credit

```yaml
image:
  url: "https://images.unsplash.com/photo-1234567890?w=1200&h=675"
  alt: "Developer working on laptop at desk"
  credit: "Photo by John Doe on Unsplash"
```

---

## Accessibility

### Alt Text Best Practices

- **Be descriptive:** Explain what's in the image
- **Provide context:** How does it relate to the post?
- **Avoid redundancy:** Don't start with "Image of..." or "Picture of..."
- **Be concise:** 125 characters or less

**Good examples:**
```yaml
alt: "Terminal output showing successful build completion"
alt: "Database schema diagram with user and posts tables"
alt: "Bar chart comparing load times across frameworks"
```

**Poor examples:**
```yaml
alt: "Image"  # Too vague
alt: "screenshot.png"  # Filename, not description
alt: "A picture of a terminal showing some code output"  # Too wordy
```

---

## Animation Behavior

### Scroll Animations

Featured images in post lists automatically animate on scroll:

- **Fade-in:** Opacity 0 → 1 over 600ms
- **Slide-up:** Translate Y from 20px → 0
- **Stagger:** 100ms delay between each post
- **Respects `prefers-reduced-motion`:** Instant appearance if user prefers

### Hover Effects

- **Scale:** Image scales to 105% on hover (hover:scale-105)
- **Duration:** 300ms transition
- **Smooth:** Uses CSS transforms for GPU acceleration

---

## Testing Your Images

1. **Add image to frontmatter** in your MDX file
2. **Place image file** in `/public/blog/images/{slug}/`
3. **Run dev server:** `npm run dev`
4. **Visit blog list:** http://localhost:3000/blog
5. **Verify thumbnail** appears next to your post
6. **Test animation:** Scroll down to see fade-in effect
7. **Check accessibility:** Verify alt text in browser inspector

---

## Troubleshooting

### Image Not Showing

- ✅ Check file path is correct (relative to `/public`)
- ✅ Verify image file exists at specified location
- ✅ Ensure frontmatter YAML is valid (no syntax errors)
- ✅ For external images, check `remotePatterns` in `next.config.ts`

### Image Too Large

- Resize images before uploading (use ImageOptim, Squoosh, etc.)
- Next.js will optimize automatically but large sources slow down builds
- Target: 1200px wide maximum, under 500 KB

### Animation Not Working

- Check console for errors
- Verify `ScrollReveal` component is wrapping article
- Test with `prefers-reduced-motion` disabled
- Clear browser cache and reload

---

## Migration Guide

### Adding Images to Existing Posts

No breaking changes! Posts without images work exactly as before.

To add images:

1. Create directory: `public/blog/images/{post-slug}/`
2. Add optimized image: `hero.jpg`
3. Update frontmatter with `image` field
4. Commit and deploy

---

## Future Enhancements

**Phase 2: Hero Images** (Coming Soon)
- Full-width hero images on detail pages
- Gradient overlays with title/metadata
- Caption and credit display below image

**Phase 3: Advanced Features**
- Multiple images per post (galleries)
- Image zoom/lightbox viewer
- Automatic OG image generation from featured image
- Image CDN integration (Cloudinary, imgix)

---

## Related Documentation

- [Frontmatter Schema Reference](./frontmatter-schema.md) - Complete field reference
- [Content Creation Guide](./content-creation.md) - Writing posts
- [Blog Architecture](./architecture.md) - System design
- [PostThumbnail Component](../components/post-thumbnail.md) - Technical docs

---

**Need help?** Check existing posts with images for examples, or open an issue on GitHub.
