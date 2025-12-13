# Open Graph Image Integration

**Status**: ✅ Implemented (November 9, 2025)  
**Related**: [`featured-images.md`](./featured-images), [`frontmatter-schema.md`](./frontmatter-schema)

## Overview

Blog posts automatically use hero images for Open Graph (OG) and Twitter Card metadata when available. This ensures that social media shares display rich, custom images instead of generic generated graphics.

## How It Works

The `generateMetadata()` function in `src/app/blog/[slug]/page.tsx` checks for `post.image?.url`:

1. **Hero image present**: Uses the hero image URL for OG/Twitter metadata
2. **No hero image**: Falls back to dynamic OG image generator (text-based)

### Code Implementation

```typescript
// Use hero image for OG if available, otherwise use dynamic generator
const hasHeroImage = post.image?.url;
const ogImageUrl = hasHeroImage 
  ? `${SITE_URL}${post.image?.url}`
  : getOgImageUrl(post.title, post.summary);
const twitterImageUrl = hasHeroImage
  ? `${SITE_URL}${post.image?.url}`
  : getTwitterImageUrl(post.title, post.summary);

// Use hero image dimensions if provided, otherwise use default OG dimensions
const imageWidth = post.image?.width ?? 1200;
const imageHeight = post.image?.height ?? 630;
```

### Metadata Output

```typescript
openGraph: {
  images: [
    {
      url: ogImageUrl,              // Hero image or generated
      width: imageWidth,             // From frontmatter or default 1200
      height: imageHeight,           // From frontmatter or default 630
      type: hasHeroImage ? "image/jpeg" : "image/png",
      alt: post.image?.alt ?? `${post.title} — ${SITE_TITLE}`,
    },
  ],
}
```

## Frontmatter Configuration

Add an `image` field to your blog post frontmatter:

```yaml
---
title: "Your Post Title"
summary: "Post summary"
publishedAt: "2025-11-09"
tags: ["Next.js"]
image:
  url: "/blog/images/your-post/hero.jpg"
  alt: "Descriptive alt text for accessibility"
  width: 1200         # Optional, recommended for OG
  height: 630         # Optional, recommended for OG (1200x630 = 1.91:1)
  caption: "Optional caption shown below image"
  credit: "Photo by Photographer Name"
---
```

### Image Requirements for Social Sharing

**Recommended Dimensions**:
- **Open Graph**: 1200 × 630px (1.91:1 aspect ratio)
- **Twitter Card**: 1200 × 628px (also works with 1200 × 630)

**Format**:
- JPEG for photos (smaller file size)
- PNG for graphics/text (better quality, larger files)
- SVG works but may not be supported by all social platforms

**File Size**:
- Keep under 1MB for fast loading
- Optimize images with tools like [Squoosh](https://squoosh.app/)

## Testing Social Previews

### 1. Local Testing (Dev Server)

```bash
npm run dev
# Open http://localhost:3001/blog/your-post-slug
# View page source and check <meta property="og:image"> tag
```

### 2. Social Media Debuggers

After deploying to production, test with:

- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

**Note**: Social platforms cache OG images. If you update an image, you may need to force a refresh using these debugger tools.

## Fallback Behavior

If no hero image is provided, the system uses the **dynamic OG image generator**:

- Located at `/opengraph-image` and `/twitter-image` routes
- Generates text-based images with post title and summary
- Always returns 1200 × 630px PNG images
- Automatically adapts to light/dark theme

## Examples

### With Hero Image

```yaml
image:
  url: "/blog/images/nextjs-guide/hero.jpg"
  alt: "Next.js logo with code editor in background"
  width: 1200
  height: 630
```

**Result**: Social shares show the custom hero image.

### Without Hero Image

```yaml
# No image field
```

**Result**: Social shares show dynamically generated text image with title/summary.

## Image Storage

Hero images should be stored in:

```
public/blog/images/
├── default/          # Default/shared images
│   ├── hero.svg
│   ├── minimal.svg
│   └── geometric.svg
├── post-slug-1/      # Post-specific images
│   ├── hero.jpg
│   └── diagram.png
└── post-slug-2/
    └── hero.jpg
```

**Path Format**: `/blog/images/{post-slug}/{filename}`

## Type Definition

From `src/data/posts.ts`:

```typescript
export type PostImage = {
  url: string;          // local path or external URL
  alt: string;          // required for accessibility
  width?: number;       // optional, for next/image optimization
  height?: number;      // optional, maintains aspect ratio
  caption?: string;     // optional, displayed below image
  credit?: string;      // optional, photographer/source attribution
  position?: "top" | "left" | "right" | "background"; // list view hint
};
```

## Best Practices

### 1. Always Provide Alt Text
```yaml
image:
  url: "/blog/images/post/hero.jpg"
  alt: "Developer working on React code in VS Code"  # Required!
```

### 2. Optimize Images Before Upload
```bash
# Using ImageMagick
convert hero.png -resize 1200x630^ -gravity center -extent 1200x630 hero-og.jpg

# Using next/image (automatic)
# Just provide width/height in frontmatter
```

### 3. Test Accessibility
- Use descriptive alt text (don't just repeat the title)
- Ensure text overlays have sufficient contrast
- Test with screen readers

### 4. Monitor File Sizes
```bash
# Check image sizes
ls -lh public/blog/images/**/*

# Optimize with Squoosh or similar tools
# Target: < 200KB for fast loading
```

## Related Documentation

- [Featured Images Guide](./featured-images) - Hero image display on blog posts
- [Frontmatter Schema](./frontmatter-schema) - Complete frontmatter reference
- [Default Images](./default-images-quick-ref) - Using default/placeholder images

## Troubleshooting

### Social platforms show old image

**Solution**: Clear cache using platform-specific debuggers (see "Testing Social Previews" above).

### Image not showing in social preview

**Possible causes**:
1. Image path incorrect (check `/blog/images/...` prefix)
2. Image file missing from `public/` directory
3. Image dimensions don't match OG requirements
4. HTTPS required (some platforms reject HTTP images)

### Hero image shows but OG image doesn't

**Check**:
1. `SITE_URL` environment variable is set correctly
2. Image URL is absolute (includes domain)
3. Image is publicly accessible (not behind auth)

## Implementation Files

- **Metadata**: `src/app/blog/[slug]/page.tsx` (`generateMetadata`)
- **Type Definition**: `src/data/posts.ts` (`PostImage`)
- **Hero Display**: `src/components/post-hero-image.tsx`
- **Site Config**: `src/lib/site-config.ts` (`SITE_URL`, OG generators)
