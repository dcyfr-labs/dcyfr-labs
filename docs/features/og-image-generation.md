<!-- TLP:CLEAR -->

# Dynamic OG Image Generation

Dynamic social preview images for blog posts and pages using Next.js's native `next/og` API.

## Overview

This feature generates beautiful, dynamic Open Graph (OG) and Twitter images for all blog posts and pages. When shared on social media, each post displays a custom preview image with the post title and description.

## Architecture

### Metadata Routes

- **`/opengraph-image`** - Generates OG images (1200×630px)
  - Used for Facebook, LinkedIn, Discord, and other platforms
  - Accessed via `getOgImageUrl(title, description)` helper
  - File: `src/app/opengraph-image.tsx`
  
- **`/twitter-image`** - Generates Twitter-specific images (1200×630px)
  - Optimized for Twitter card display
  - Accessed via `getTwitterImageUrl(title, description)` helper
  - File: `src/app/twitter-image.tsx`

### Design

Both routes use the same visual design with:
- Dark gradient background (from #020617 to #1f2937)
- Large, bold typography (Geist/Inter)
- Post title and description
- Site domain and logo indicator
- Professional, minimal aesthetic

### Implementation Details

**Edge Runtime**: Both routes use `export const runtime = "edge"` for:
- Fast generation and caching
- Reduced latency
- Automatic Vercel CDN distribution

**Query Parameters**:
- `title` - Post/page title (defaults to site title)
- `description` - Post/page summary (defaults to site description)

**API**: Uses Next.js native `next/og` ImageResponse component

## Usage

### Homepage & Default Pages

The layout automatically uses default OG images:

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: getOgImageUrl(), // Uses default title/description
        width: 1200,
        height: 630,
      },
    ],
  },
};
```

### Blog Posts

Blog post pages automatically generate custom images:

```typescript
// src/app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = posts.find((p) => p.slug === slug);
  const imageUrl = getOgImageUrl(post.title, post.summary);
  
  return {
    openGraph: {
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
```

### Custom Pages

To add OG images to custom pages:

```typescript
import { getOgImageUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: getOgImageUrl("Page Title", "Page description"),
        width: 1200,
        height: 630,
      },
    ],
  },
};
```

## Testing

### Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit image routes directly:
   - `http://localhost:3000/opengraph-image?title=Test&description=Description`
   - `http://localhost:3000/twitter-image?title=Test&description=Description`

3. View generated images in browser

### Social Media Preview

Use these tools to preview how images appear on social platforms:

- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- **Discord**: Share link in Discord to see preview

### Lighthouse & SEO

OG images improve:
- Social media engagement
- Click-through rates from social platforms
- SEO signals (rich previews)
- Accessibility (alt text for images)

## Performance

### Caching Strategy

- **Edge Runtime**: Vercel automatically caches generated images
- **CDN Distribution**: Images served from Vercel's global CDN
- **Revalidation**: Images regenerated on-demand if parameters change

### Bundle Impact

- Uses Next.js native `next/og` (no additional dependencies)
- Edge runtime keeps main bundle unaffected
- No client-side JavaScript required

## Customization

### Styling

To customize the design, edit the JSX in:
- `src/app/opengraph-image/route.tsx`
- `src/app/twitter-image/route.tsx`

Common customizations:
- Colors: Update `backgroundColor`, `color` properties
- Typography: Adjust `fontSize`, `fontWeight`, `lineHeight`
- Layout: Modify flexbox properties
- Gradients: Update `backgroundImage` radial-gradient values

### Fonts

Currently uses Geist Sans. To use different fonts:

1. Add font import to route
2. Fetch font file
3. Pass to `fonts` array in `ImageResponse`

Example:
```typescript
const customFont = await fetch(
  new URL("@/assets/fonts/custom.woff2", import.meta.url)
).then((res) => res.arrayBuffer());

// In ImageResponse options:
fonts: [
  {
    name: "Custom Font",
    data: customFont,
    style: "normal",
    weight: 400,
  },
]
```

## Troubleshooting

### Images Not Generating

1. Check build output for errors
2. Verify query parameters are URL-encoded
3. Ensure fonts are accessible
4. Check Vercel logs for edge runtime errors

### Images Look Different Locally vs Production

- Local: Uses system fonts as fallback
- Production: Uses Vercel's optimized rendering
- Solution: Test on Vercel preview deployment

### Social Media Not Showing Images

1. Clear social platform cache:
   - Facebook: Use Sharing Debugger
   - Twitter: Use Card Validator
2. Verify `og:image` meta tag in HTML
3. Check image URL is publicly accessible
4. Ensure image dimensions match declared sizes

## Related Documentation

- [Next.js Image Metadata Routes](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Vercel OG Documentation](https://vercel.com/docs/og-image-generation)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

## Files

- `src/app/opengraph-image.tsx` - OG image generation (metadata route)
- `src/app/twitter-image.tsx` - Twitter image generation (metadata route)
- `src/lib/site-config.ts` - Image URL helpers (`getOgImageUrl`, `getTwitterImageUrl`)
- `src/lib/logo-config.ts` - Logo SVG path and viewBox for image rendering
- `src/app/layout.tsx` - Default OG metadata
- `src/app/blog/[slug]/page.tsx` - Blog post OG metadata
