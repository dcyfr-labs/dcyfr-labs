# Blog Content

This directory contains blog posts as MDX files. Posts can be organized as flat files or folders with co-located assets.

## Directory Structure

```
src/content/blog/
├── README.md
├── simple-post.mdx                    # Flat file (no assets)
├── post-with-assets/                  # Folder structure (with assets)
│   ├── index.mdx                      # Post content
│   ├── hero.png                       # Co-located image
│   ├── diagram.svg                    # Co-located SVG
│   └── demo.mp4                       # Co-located video
└── another-post.mdx
```

## Adding a New Blog Post

### Option 1: Flat File (Simple Posts)

For posts without custom assets, create a single `.mdx` file:

```bash
touch src/content/blog/my-new-post.mdx
```

### Option 2: Folder Structure (Posts with Assets)

For posts with images, videos, or other assets, create a folder:

```bash
mkdir src/content/blog/my-new-post
touch src/content/blog/my-new-post/index.mdx
# Add assets to the same folder
```

**Referencing co-located assets in your MDX:**

```mdx
![Screenshot](/blog/my-new-post/assets/screenshot.png)

<video src="/blog/my-new-post/assets/demo.mp4" controls />
```

Assets are served from `/blog/{slug}/assets/{filename}`.

## Frontmatter

```mdx
---
title: "Your Post Title"
summary: "A brief summary of your post"
publishedAt: "2025-10-01"
tags: ["Tag1", "Tag2", "Tag3"]
featured: true
image:
  url: "/blog/my-new-post/assets/hero.svg"
  alt: "Hero image description"
---

Your blog post content goes here...
```

### Frontmatter Fields

- **title** (required): The title of your blog post
- **summary** (required): A brief description that appears in listings and metadata
- **publishedAt** (required): Publication date in YYYY-MM-DD format
- **tags** (required): Array of tags for categorization
- **featured** (optional): Set to `true` to feature this post on the homepage
- **updatedAt** (optional): Date the post was last updated (YYYY-MM-DD format)
- **sources** (optional): Array of source links with `label` and `href` properties
- **image** (optional): Hero image for the post (see Hero Images section below)

## Hero Images

Posts can have custom hero images that display at the top of the post detail page.

### Automatic Detection

If you place a file named `hero.svg`, `hero.jpg`, `hero.jpeg`, `hero.png`, or `hero.webp` in your post's folder, it will be automatically detected and used as the hero image.

**Example:**
```
src/content/blog/my-new-post/
├── index.mdx
└── hero.svg          # Automatically detected!
```

No frontmatter configuration needed - the system will automatically use `/blog/my-new-post/assets/hero.svg` as the hero image.

### Manual Configuration

You can also explicitly specify the hero image in frontmatter for more control:

```yaml
image:
  url: "/blog/my-new-post/assets/custom-hero.jpg"
  alt: "Descriptive alt text for accessibility" # optional - if omitted, caption (when present) will be used as alt
  width: 1200
  height: 630
  caption: "Optional caption displayed below image"
  credit: "Photo by John Doe"
```

**Frontmatter image takes precedence** over automatic detection.

### Writing Content

Use standard Markdown syntax in the body of your post. The content supports:

- Headings (`## Heading 2`, `### Heading 3`, etc.)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links and images
- Bold text
- Blockquotes

The reading time is automatically calculated based on word count.

## File Naming

The filename (without the `.mdx` extension) becomes the URL slug. For example:
- `my-new-post.mdx` → `/blog/my-new-post`
- `shipping-a-nextjs-tiny-portfolio.mdx` → `/blog/shipping-a-nextjs-tiny-portfolio`

Use lowercase letters and hyphens to separate words.
