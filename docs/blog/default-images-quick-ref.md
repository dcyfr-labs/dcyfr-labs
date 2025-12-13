# Default Blog Images - Quick Reference

**Status:** ✅ Production Ready  
**Last Updated:** November 3, 2025  
**Related:** [Featured Images Guide](./featured-images)

---

## TL;DR

**All blog posts now have images** - if you don't specify one, we pick a smart default based on your post's tags.

---

## Three Default Styles

### 🎨 Gradient (General Content)
- **File:** `/blog/images/default/hero.svg`
- **Style:** Blue→Violet gradient, clean professional
- **Auto-selected for:** Posts without specific tech/design tags
- **Best for:** Tutorials, guides, general articles

### 💻 Minimal (Tech/Code)
- **File:** `/blog/images/default/minimal.svg`
- **Style:** Dark background, code icon, dot pattern
- **Auto-selected for:** JavaScript, TypeScript, React, Node, programming tags
- **Best for:** Technical posts, code tutorials

### 🔷 Geometric (Design/UI)
- **File:** `/blog/images/default/geometric.svg`
- **Style:** Geometric patterns, hexagon icon
- **Auto-selected for:** CSS, Tailwind, UI, UX, design tags
- **Best for:** Design posts, UI/UX content

---

## How It Works

### Automatic Selection Logic

```typescript
// 1. Check tags first
if (tags includes ["javascript", "typescript", "react", "node"...])
  → Use MINIMAL

if (tags includes ["design", "ui", "ux", "css", "tailwind"...])
  → Use GEOMETRIC

// 2. Otherwise, hash the title for consistency
title hash → Select variant deterministically

// 3. Fallback
→ Use GRADIENT
```

### Example Scenarios

```yaml
# Post with React tag → Gets MINIMAL
tags: ["react", "hooks"]

# Post with CSS tag → Gets GEOMETRIC  
tags: ["css", "tailwind"]

# Post without special tags → Gets GRADIENT
tags: ["productivity", "workflow"]

# Post with custom image → Uses custom (no default)
image:
  url: "/blog/images/my-post/hero.jpg"
```

---

## For Developers

### Files & Locations

```
src/
├── lib/
│   └── default-images.ts          # Selection logic & utilities
├── app/
│   └── api/
│       └── default-blog-image/
│           └── route.tsx          # Dynamic generation API
├── components/
│   └── post-list.tsx              # Consumes defaults
public/
└── blog/
    └── images/
        └── default/
            ├── hero.svg           # Gradient variant
            ├── minimal.svg        # Minimal variant
            ├── geometric.svg      # Geometric variant
            └── README.md          # Design guidelines
```

### Key Functions

```typescript
// Ensure post has image (custom or default)
import { ensurePostImage } from "@/lib/default-images";
const image = ensurePostImage(post.image, { title, tags });

// Get specific default variant
import { getDefaultBlogImage } from "@/lib/default-images";
const image = getDefaultBlogImage({ variant: "minimal" });

// Generate dynamic image with title overlay
import { getDynamicDefaultImage } from "@/lib/default-images";
const image = getDynamicDefaultImage("Post Title", "gradient");
```

### Customization Points

1. **Replace SVGs** in `/public/blog/images/default/`
2. **Modify tag logic** in `/src/lib/default-images.ts` → `getDefaultBlogImage()`
3. **Update API styling** in `/src/app/api/default-blog-image/route.tsx`
4. **Add new variants** - create SVG + add to `DEFAULT_IMAGES` object

---

## FAQ

**Q: Can I override the automatic selection?**  
A: Yes, specify a custom `image` field in frontmatter.

**Q: Can I disable default images?**  
A: Modify `PostList` component to make image conditional again.

**Q: Can I add more variants?**  
A: Yes! Add SVG to `/public/blog/images/default/`, add to `DEFAULT_IMAGES` in `default-images.ts`, update selection logic.

**Q: What about OG images?**  
A: Phase 2 feature - defaults will extend to social preview images.

**Q: Performance impact?**  
A: Zero - SVGs are tiny (<10KB each), Next.js optimizes automatically.

---

## Migration Notes

### Existing Posts

✅ **No breaking changes** - posts work exactly as before

Posts with custom images:
- ✅ Continue using custom image

Posts without images:
- ✅ Now automatically get appropriate default
- ✅ Visual consistency across blog listing
- ✅ Better social sharing (OG images in Phase 2)

### New Posts

Just write your post - image handled automatically! 🎉

```yaml
---
title: "My New Post"
tags: ["react"]
# That's it! Gets minimal variant automatically
---
```

---

## What's Next (Phase 2)

- [ ] Hero images on detail pages using defaults
- [ ] OG image fallback to featured defaults
- [ ] RSS feed image inclusion
- [ ] Custom overlay text on defaults
- [ ] More variant styles (dark mode optimized, seasonal, etc.)

---

**Questions?** See [Featured Images Guide](./featured-images) for complete documentation.
