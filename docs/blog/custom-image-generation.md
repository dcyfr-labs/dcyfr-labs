# Custom Blog Image Generation

This guide covers the hybrid approach for generating custom blog post hero images: automated SVG generation for quick workflows and Unsplash integration for high-quality photography.

## Overview

Two complementary methods:

1. **SVG Generator** (Recommended for most posts) - Automated, fast, consistent branding
2. **Unsplash Integration** (For featured posts) - Professional photography, requires attribution

---

## Method 1: SVG Generator

### Quick Start

Generate for a specific post:

```bash
node scripts/generate-blog-hero.mjs --slug my-post-slug
```

Generate for all posts missing images:

```bash
node scripts/generate-blog-hero.mjs --all
```

Preview without saving:

```bash
node scripts/generate-blog-hero.mjs --slug my-post --preview
```

Force regeneration:

```bash
node scripts/generate-blog-hero.mjs --slug my-post --force
```

### Style Variants

The generator automatically selects styles based on post metadata:

| Variant | Auto-Selected When | Visual Style |
|---------|-------------------|--------------|
| **gradient** | General content | Blue-to-violet gradient, clean |
| **minimal** | Tech/code posts (`javascript`, `react`, `typescript`) | Dark with dot pattern, code icon |
| **geometric** | Design posts (`ui`, `ux`, `css`, `design`) | Dark-to-blue gradient, grid pattern |
| **waves** | Performance content (`performance`, `optimization`) | Dark with wave pattern |
| **circuit** | API/integration posts (`api`, `mcp`, `integration`) | Dark with circuit pattern |
| **security** | Security content (`security`, `cve`, `vulnerability`) | Red-to-orange gradient, hexagon pattern |

### Icon Selection

Icons are automatically chosen based on tags and category:

- `security` - Shield with checkmark
- `api` - Network nodes
- `design` - Layered hexagons
- `performance` - Clock/speedometer
- `data` - Database stack
- `tools` - Wrench/tool icon
- `docs` - Document icon
- `code` - Code brackets (default)

### Output

Generated SVGs are saved to:
```
public/blog/images/{slug}/hero.svg
```

Dimensions: 1200×630px (optimized for Open Graph/Twitter Cards)

### Update Frontmatter

After generation, add to your post's frontmatter:

```yaml
---
title: "My Blog Post"
# ... other fields
image:
  url: "/blog/images/my-post-slug/hero.svg"
  alt: "My Blog Post - Hero image"
  width: 1200
  height: 630
---
```

### Customization

To modify styles or add new variants, edit:
- `scripts/generate-blog-hero.mjs` - Style variants and icon sets
- Color constants in `COLORS` object (matches design tokens)
- Pattern generators in `generatePattern()` function

---

## Method 2: Unsplash Integration

### Setup

1. Get your Unsplash Access Key:
   - Visit https://unsplash.com/developers
   - Create a new application
   - Copy your Access Key

2. Add to `.env.local`:
   ```bash
   UNSPLASH_ACCESS_KEY=your_key_here
   ```

### Usage

**Interactive Mode** (recommended):

```bash
node scripts/fetch-unsplash-image.mjs --slug my-post --interactive
```

This will:
1. Prompt for search query
2. Display 5 results with previews
3. Let you select the best match
4. Download and save to `public/blog/images/{slug}/hero.jpg`

**Automatic Mode**:

```bash
node scripts/fetch-unsplash-image.mjs --slug my-post --query "developer coding"
```

Downloads the first matching result automatically.

**Advanced Options**:

```bash
# Portrait orientation
node scripts/fetch-unsplash-image.mjs --slug my-post --query "portrait" --orientation portrait

# More results in interactive mode
node scripts/fetch-unsplash-image.mjs --slug my-post --interactive --per-page 20
```

### Update Frontmatter

The script will output the exact frontmatter to add:

```yaml
image:
  url: "/blog/images/my-post-slug/hero.jpg"
  alt: "Developer working on laptop with code on screen"
  width: 4032
  height: 3024
  credit: "Photo by John Doe on Unsplash"
```

**⚠️ Important**: Always include the `credit` field. Unsplash requires attribution.

### API Compliance

The script automatically:
- Triggers download tracking (required by Unsplash API)
- Generates proper attribution text
- Adds UTM parameters to photographer links

---

## Workflow Recommendations

### For Most Posts (80% use case)
Use the **SVG generator**:
- Fast and automated
- Consistent branding
- No attribution required
- Zero-cost
- Deterministic output (same settings = same result)

```bash
node scripts/generate-blog-hero.mjs --slug my-post
```

### For Featured/High-Value Posts (20% use case)
Use **Unsplash**:
- Professional photography
- Higher visual impact
- Better for social sharing
- Requires attribution

```bash
node scripts/fetch-unsplash-image.mjs --slug my-featured-post --interactive
```

### For Specific Branding Needs
**Option A**: Modify SVG generator styles
**Option B**: Create custom SVG in design tool (Figma, Illustrator)
**Option C**: Commission custom illustrations (AI-generated or artist)

---

## npm Scripts (Convenience Wrappers)

Add to `package.json`:

```json
{
  "scripts": {
    "generate:hero": "node scripts/generate-blog-hero.mjs",
    "generate:hero:all": "node scripts/generate-blog-hero.mjs --all",
    "fetch:unsplash": "node scripts/fetch-unsplash-image.mjs"
  }
}
```

Usage:
```bash
npm run generate:hero -- --slug my-post
npm run generate:hero:all
npm run fetch:unsplash -- --slug my-post --interactive
```

---

## File Structure

```
scripts/
├── generate-blog-hero.mjs      # SVG generator
└── fetch-unsplash-image.mjs    # Unsplash downloader

src/lib/
└── unsplash.ts                 # Unsplash API client (TypeScript)

public/blog/images/
├── default/                     # Fallback images
│   ├── hero.svg
│   ├── minimal.svg
│   └── geometric.svg
└── {post-slug}/                 # Post-specific images
    └── hero.{svg|jpg}
```

---

## Troubleshooting

### SVG Generator Issues

**Problem**: "Post not found"
- Check that `{slug}.mdx` exists in `src/content/blog/`
- Verify slug matches filename exactly

**Problem**: Generated SVG doesn't match expected style
- Check post tags and category in frontmatter
- Use `--preview` flag to see style selection logic
- Manually override by editing `selectStyleVariant()` in script

### Unsplash Issues

**Problem**: "UNSPLASH_ACCESS_KEY environment variable is not set"
- Add key to `.env.local`
- Restart terminal to reload environment

**Problem**: "No images found"
- Try broader search terms
- Check orientation setting (landscape vs portrait)
- Verify Unsplash API key is valid

**Problem**: Rate limit errors
- Unsplash demo keys: 50 requests/hour
- Production keys: Higher limits (check your dashboard)
- Wait for rate limit reset or upgrade key

---

## Examples

### Security Post with Custom Icon

```bash
node scripts/generate-blog-hero.mjs --slug cve-analysis
```

Auto-detects security tags → Uses `security` variant with shield icon.

### Design Post with Unsplash Photo

```bash
node scripts/fetch-unsplash-image.mjs --slug ui-design-principles --query "minimalist interface design" --interactive
```

Browse results, pick the best match.

### Bulk Generation for New Posts

```bash
# Generate SVGs for all posts without custom images
node scripts/generate-blog-hero.mjs --all

# Review generated images
# Update frontmatter for each post
# Commit new images
git add public/blog/images/
git commit -m "Add generated hero images"
```

---

## Best Practices

1. **Use SVG for consistency**: Most posts should use generated SVGs for brand cohesion
2. **Reserve Unsplash for impact**: Use professional photos for featured/high-traffic posts
3. **Always preview**: Review generated images before committing
4. **Optimize for Open Graph**: All images are 1200×630px for social sharing
5. **Maintain attribution**: Never remove Unsplash credits (legal requirement)
6. **Version control**: Commit generated images to git (not too large, ~10-50KB each)
7. **Test locally**: Run `npm run build` to verify images load correctly

---

## Future Enhancements

Potential additions (not yet implemented):

- **AI-generated images**: DALL-E or Stable Diffusion integration
- **Batch frontmatter updates**: Automatically update MDX files after generation
- **Image optimization**: Post-process JPGs with Sharp for smaller file sizes
- **CDN upload**: Push images to Vercel Blob or Cloudinary
- **Template system**: User-defined SVG templates via JSON config

---

## Related Documentation

- [Featured Images Guide](./featured-images.md) - Using images in blog posts
- [Frontmatter Schema](./frontmatter-schema.md) - Image field reference
- [Design Tokens](../../architecture/design-tokens.md) - Color system used in SVGs
