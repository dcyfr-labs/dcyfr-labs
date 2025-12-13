<!-- TLP:CLEAR -->
# Blog Images - Complete Guide

**Status:** ✅ Production Ready  
**Last Updated:** December 9, 2025  
**Files Consolidated:** featured-images.md, custom-image-generation.md, og-image-integration.md, default-images-quick-ref.md

---

## 🚀 Quick Reference

### Image Options (5-Second Overview)

| Method | Time | Quality | Best For |
|--------|------|---------|----------|
| **🎯 Auto SVG** | 30 sec | Consistent | Most posts (recommended) |
| **📸 Unsplash** | 2 min | Professional | Featured posts |
| **🎨 Smart Default** | 0 sec | Good | Quick publishing |
| **✏️ Custom Upload** | 5 min | Variable | Specific needs |

### Quick Commands

```bash
# Generate custom SVG for specific post
npm run generate:hero -- --slug my-post-slug

# Generate for all posts missing images  
npm run generate:hero -- --all

# Download Unsplash image (interactive)
npm run fetch:unsplash

# Preview generation without saving
npm run generate:hero -- --slug post-slug --preview
```

### Image Integration At-a-Glance

```yaml
# Frontmatter example
title: "My Great Post"
image:
  url: "/blog/images/my-post/hero.svg"    # Auto-generated
  # OR: "/blog/images/my-post/hero.jpg"   # Unsplash/custom
  alt: "Description for accessibility"
  width: 1200                            # Optional: for OG metadata
  height: 600                            # Optional: for OG metadata
  attribution: "Photo by Name on Unsplash" # Required for Unsplash
```

---

## 📋 Implementation Details

### Image System Overview

Blog posts support optional featured images that display as thumbnails in list views and hero images on detail pages. The system uses Next.js Image component for automatic optimization and includes multiple generation methods.

#### **Core Features:**
- ✨ **Automated SVG generation**: Generate custom hero images programmatically
- 📸 **Unsplash integration**: Download royalty-free professional photos  
- 🎨 **Smart defaults**: Posts without custom images receive beautiful defaults based on content
- 🔗 **OG integration**: Hero images automatically used for social media previews
- ♿ **Accessibility**: Alt text support with validation

### Method 1: Automated SVG Generation (Recommended)

#### Quick Start Workflow
Generate a unique hero image for your post automatically:

```bash
npm run generate:hero -- --slug my-post-slug
```

This creates `/public/blog/images/my-post-slug/hero.svg` with styles based on your post's tags and category.

#### SVG Generation Features

**Intelligent Style Selection:**
- **Technology posts** (React, TypeScript, etc.) → Dark theme with code elements
- **Design posts** (UI, CSS, etc.) → Geometric patterns and design elements  
- **General posts** → Professional gradient backgrounds
- **Custom tags** → Color schemes based on tag categories

**Generated Structure:**
```
/public/blog/images/
└── post-slug/
    ├── hero.svg          # Main hero image (1200x600)
    ├── thumbnail.svg     # Small version (400x200) 
    └── og.svg           # Social media optimized (1200x630)
```

#### Command Options

```bash
# Basic generation
node scripts/generate-blog-hero.mjs --slug my-post

# Generate for all posts missing images
node scripts/generate-blog-hero.mjs --all

# Preview without saving  
node scripts/generate-blog-hero.mjs --slug post-slug --preview

# Force regeneration of existing images
node scripts/generate-blog-hero.mjs --slug post-slug --force

# Specify custom style
node scripts/generate-blog-hero.mjs --slug post-slug --style minimal
```

#### SVG Customization Options

**Available Styles:**
- `gradient` - Blue→violet gradient (default for general content)
- `minimal` - Dark with code elements (auto for tech content)
- `geometric` - Geometric patterns (auto for design content)
- `vibrant` - Bright colors with dynamic shapes

**Style Selection Logic:**
```typescript
// Automatic style selection based on tags
const getStyleFromTags = (tags: string[]) => {
  const techTags = ['javascript', 'typescript', 'react', 'node', 'code'];
  const designTags = ['design', 'ui', 'css', 'figma', 'ux'];
  
  if (tags.some(tag => techTags.includes(tag.toLowerCase()))) return 'minimal';
  if (tags.some(tag => designTags.includes(tag.toLowerCase()))) return 'geometric';
  return 'gradient';
};
```

### Method 2: Unsplash Integration (For Featured Posts)

#### Interactive Download Workflow

```bash
npm run fetch:unsplash
```

**Interactive Prompts:**
1. **Search terms** - Describe the image you want
2. **Quality selection** - Choose resolution (1920px, 1280px, 800px)
3. **Post association** - Link to specific post slug
4. **Attribution handling** - Automatically generates required credit

#### Unsplash Features

**Professional Quality:**
- High-resolution images (up to 1920px wide)
- Professional photography
- Curated collections
- Royalty-free usage

**Automatic Integration:**
```bash
# Interactive example flow
? Search terms: "coding workspace setup"
? Resolution: 1280px (Recommended)
? Post slug: my-workspace-post
? Save to: /public/blog/images/my-workspace-post/hero.jpg

✅ Downloaded: photo by John Doe on Unsplash
✅ Generated attribution: "Photo by John Doe on Unsplash"
✅ Updated frontmatter template
```

**Attribution Handling:**
```yaml
# Automatically added to frontmatter
image:
  url: "/blog/images/my-post/hero.jpg"
  alt: "Modern coding workspace with dual monitors"
  attribution: "Photo by John Doe on Unsplash"
  width: 1280
  height: 853
```

### Method 3: Smart Default Images (Zero Setup)

#### Automatic Default Selection

**All blog posts now have images** - if you don't specify one, the system picks a smart default based on your post's tags.

#### Three Default Styles

**🎨 Gradient (General Content)**
- **File:** `/blog/images/default/hero.svg`
- **Style:** Blue→Violet gradient, clean professional
- **Auto-selected for:** Posts without specific tech/design tags
- **Best for:** Tutorials, guides, general articles

**💻 Minimal (Tech/Code)**
- **File:** `/blog/images/default/minimal.svg`
- **Style:** Dark background, code icon, dot pattern
- **Auto-selected for:** JavaScript, TypeScript, React, Node, programming tags
- **Best for:** Technical posts, code tutorials

**🔷 Geometric (Design/UI)**
- **File:** `/blog/images/default/geometric.svg`
- **Style:** Geometric shapes, design elements
- **Auto-selected for:** Design, UI, CSS, Figma, UX tags
- **Best for:** Design posts, visual content

#### Default Selection Logic

```typescript
// Automatic default image selection
const getDefaultImage = (tags: string[]) => {
  const techTags = ['javascript', 'typescript', 'react', 'node', 'python', 'code'];
  const designTags = ['design', 'ui', 'css', 'figma', 'ux', 'visual'];
  
  if (tags.some(tag => techTags.includes(tag.toLowerCase()))) {
    return '/blog/images/default/minimal.svg';
  }
  if (tags.some(tag => designTags.includes(tag.toLowerCase()))) {
    return '/blog/images/default/geometric.svg';  
  }
  return '/blog/images/default/hero.svg';
};
```

### Open Graph & Social Media Integration

#### Automatic OG Image Usage

Blog posts automatically use hero images for Open Graph (OG) and Twitter Card metadata when available. This ensures social media shares display rich, custom images instead of generic text-based graphics.

#### Integration Implementation

```typescript
// from src/app/blog/[slug]/page.tsx
const generateMetadata = async ({ params }: { params: { slug: string } }) => {
  const post = await getPostBySlug(params.slug);
  
  // Use hero image for OG if available, otherwise fall back to dynamic generator
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

  return {
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: post.image?.alt || post.title,
        }
      ],
    },
    twitter: {
      images: [
        {
          url: twitterImageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: post.image?.alt || post.title,
        }
      ],
    },
  };
};
```

#### Social Media Optimization

**OG Image Best Practices:**
- **Dimensions:** 1200x630px (optimal for most platforms)
- **File size:** <1MB for fast loading
- **Text:** Readable at small sizes
- **Branding:** Include subtle brand elements

**Twitter Card Optimization:**
- **Summary Large Image** format used
- **Alt text** from frontmatter or post title fallback
- **Responsive design** for mobile/desktop

### File Structure & Organization

#### Standard Image Organization

```
/public/blog/images/
├── default/                    # Smart defaults (3 files)
│   ├── hero.svg               # Gradient style
│   ├── minimal.svg            # Tech/code style  
│   └── geometric.svg          # Design/UI style
│
├── post-slug-1/               # Per-post directories
│   ├── hero.svg              # Generated or custom
│   ├── thumbnail.svg         # Small version (optional)
│   └── og.svg               # Social optimized (optional)
│
└── post-slug-2/
    ├── hero.jpg              # Unsplash download
    └── attribution.txt       # Attribution file
```

#### Frontmatter Schema

**Complete Image Schema:**
```yaml
image:
  url: "/blog/images/post-slug/hero.svg"     # Required: Image path
  alt: "Descriptive text for accessibility"  # Required: Alt text
  width: 1200                                # Optional: Image width
  height: 600                                # Optional: Image height  
  attribution: "Photo by Name on Unsplash"   # Required for Unsplash
  caption: "Optional caption for display"    # Optional: Display caption
```

**Minimal Schema:**
```yaml
image:
  url: "/blog/images/post-slug/hero.svg"
  alt: "Hero image description"
```

---

## ✅ Setup & Usage Checklist

### Initial Setup Verification

- [ ] **Image Generation Scripts**
  - [ ] `npm run generate:hero --help` shows options
  - [ ] `npm run fetch:unsplash` interactive prompt works
  - [ ] `/public/blog/images/default/` contains 3 SVG files

- [ ] **Directory Structure**
  - [ ] `/public/blog/images/` directory exists
  - [ ] Write permissions for script generation
  - [ ] `.gitignore` excludes large image files if needed

### Content Creation Workflow

#### For New Posts (Recommended Flow)
- [ ] **Write Content First**
  - [ ] Create post MDX file with frontmatter
  - [ ] Add tags (influences auto-generation style)
  - [ ] Test post renders without image
  
- [ ] **Add Image**
  - [ ] Run `npm run generate:hero --slug post-slug`
  - [ ] Preview generated image
  - [ ] Update frontmatter with image details
  - [ ] Add descriptive alt text

#### For Featured Posts (Professional Images)
- [ ] **Unsplash Integration**
  - [ ] Run `npm run fetch:unsplash`
  - [ ] Search for relevant professional photos
  - [ ] Download and save with attribution
  - [ ] Update frontmatter with attribution details

### Quality Assurance Checklist

#### Image Quality
- [ ] **Visual Check**
  - [ ] Hero images display correctly on post pages
  - [ ] Thumbnails show properly in post lists
  - [ ] Images scale responsively on mobile
  
- [ ] **Accessibility**
  - [ ] All images have descriptive alt text
  - [ ] Alt text is meaningful (not just "hero image")
  - [ ] Contrast sufficient for any overlaid text

#### Technical Validation
- [ ] **File Optimization**
  - [ ] SVG files are clean (no unnecessary elements)
  - [ ] JPG files are compressed appropriately
  - [ ] File sizes reasonable for web delivery

- [ ] **Social Media Testing**
  - [ ] Share post URL → correct image appears
  - [ ] Twitter Card Preview shows hero image
  - [ ] LinkedIn/Facebook previews work correctly

### Troubleshooting Common Issues

#### Generation Script Issues
```bash
# Debug SVG generation
npm run generate:hero -- --slug test-post --preview --verbose

# Check file permissions
ls -la public/blog/images/
sudo chmod -R 755 public/blog/images/

# Verify script dependencies
node --version  # Should be >=16
npm list sharp  # Image processing library
```

#### Missing Images in Production
```bash
# Verify build includes images
npm run build
ls -la .next/static/

# Check Next.js image optimization
npm run dev
# Visit: /_next/image?url=/blog/images/post/hero.svg&w=1200&q=75
```

#### OG Image Issues
```bash
# Test OG meta generation
curl -s "https://yourdomain.com/blog/post-slug" | grep -i "og:image"

# Validate OG tags
# Use: https://developers.facebook.com/tools/debug/
# Use: https://cards-dev.twitter.com/validator
```

### Performance Optimization

#### Image Loading Performance
- **Next.js Image Component**: Automatic optimization enabled
- **Lazy Loading**: Images load only when needed
- **Responsive Images**: Multiple sizes generated automatically
- **WebP Conversion**: Modern formats used when supported

#### Build Performance  
- **Generation Timing**: Run hero generation before build
- **Caching**: Generated images cached between builds
- **Selective Generation**: Only generate missing images

---

## 📚 Related Documentation

**Core Blog System:**
- [`blog/architecture.md`](./architecture) - Complete blog system overview
- [`blog/content-creation.md`](./content-creation) - Content authoring workflow
- [`blog/frontmatter-schema.md`](./frontmatter-schema) - Complete metadata reference

**Technical Implementation:**
- [`components/mdx.md`](../components/mdx) - MDX image rendering
- [`optimization/alt-text-guide.md`](../optimization/alt-text-guide) - Accessibility guide
- [`design/mobile/mobile-first-optimization.md`](../design/mobile/mobile-first-optimization) - Mobile image optimization

**Social Media & SEO:**
- [`optimization/json-ld-implementation.md`](../optimization/json-ld-implementation) - Structured data for images
- [`optimization/meta-descriptions.md`](../optimization/meta-descriptions) - Meta tag optimization

---

**Last Updated:** December 9, 2025  
**Version:** 1.0.0 (Consolidated)  
**Contributors:** DCYFR Team

For issues or enhancements, see [`operations/todo.md`](../operations/todo).