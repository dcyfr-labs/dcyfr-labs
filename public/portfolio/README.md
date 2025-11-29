# Project Featured Images

This directory contains featured images for projects displayed on the portfolio.

## Structure

```
public/
└── projects/
    ├── x64-publication.svg          # X64 Publication project
    ├── cyberdrew-portfolio.svg      # cyberdrew.dev portfolio
    └── default/                     # Default fallback images
        ├── tech.svg                 # Tech/development projects
        ├── design.svg               # Design/UI projects
        └── general.svg              # General projects
```

## Usage in Projects

Add an `image` field to your project in `/src/data/projects.ts`:

```typescript
{
  slug: "my-project",
  title: "My Project",
  // ... other fields
  image: {
    url: "/projects/my-project.svg",
    alt: "My Project - Brief description for accessibility",
    position: "center", // or "top", "bottom", "left", "right"
  },
}
```

## Image Specifications

### Dimensions
- **Recommended:** 1200x630px (OG image standard)
- **Aspect Ratio:** 1.9:1 (flexible)
- **Format:** SVG (preferred) or WebP/PNG

### Design Guidelines
- Use subtle, non-distracting backgrounds
- Ensure text readability with gradient overlays
- Keep file size under 100KB
- Test in both light and dark themes
- Consider the 20% opacity overlay in cards

## Background Position

The `position` field controls `object-position` for the background:
- `center` (default): Centered background
- `top`: Align to top (good for logos)
- `bottom`: Align to bottom
- `left`: Align to left
- `right`: Align to right

## Default Images

Projects without custom images automatically receive a default based on tags/tech:

- **Tech projects** (React, TypeScript, Node, etc.) → `tech.svg`
- **Design projects** (UI, UX, Figma, etc.) → `design.svg`
- **Other projects** → `general.svg`

See `/src/lib/default-project-images.ts` for selection logic.

## Creating New Project Images

1. **Create image file** (SVG recommended):
   - Size: 1200x630px
   - Include project branding/logo
   - Use gradient backgrounds
   - Add subtle patterns or textures
   - Keep colors aligned with project theme

2. **Save to `/public/projects/`**:
   ```
   /public/projects/my-project-name.svg
   ```

3. **Add to project data**:
   ```typescript
   image: {
     url: "/projects/my-project-name.svg",
     alt: "Project name - Description",
   }
   ```

4. **Test in ProjectCard** component to ensure readability

## Examples

See existing images for reference:
- **X64 Publication**: Red gradient with binary pattern, cyber theme
- **cyberdrew.dev**: Blue-violet gradient with code brackets, modern tech

## Accessibility

- **Alt text is required** for all images
- Describe the image content and project branding
- Keep alt text concise (under 125 characters)
- Example: "X64 Publication - Indie cyber publication logo and branding"

## Performance

- **SVG is preferred** for small file size and scalability
- Compress PNG/WebP images before adding
- Next.js automatically optimizes images
- Background images are lazy-loaded and optimized
