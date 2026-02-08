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

---

## Complete Example: Blog Post with All Features

Here's a comprehensive example showing all frontmatter fields and content structure:

**File:** `src/content/blog/getting-started-with-dcyfr-ai/index.mdx`

```mdx
---
title: "Getting Started with DCYFR AI: Build Your First Agent"
summary: "Learn how to build your first AI agent with the DCYFR AI framework in under 10 minutes. This step-by-step tutorial covers installation, configuration, and creating a simple customer service bot."
publishedAt: "2026-02-08"
updatedAt: "2026-02-09"
tags: ["AI", "Tutorial", "Getting Started", "Agents"]
featured: true
readingTime: 8
image:
  url: "/blog/getting-started-with-dcyfr-ai/assets/hero.jpg"
  alt: "DCYFR AI framework architecture diagram"
  width: 1200
  height: 630
  caption: "The DCYFR AI framework architecture"
  credit: "Design by DCYFR Labs"
sources:
  - label: "@dcyfr/ai Documentation"
    href: "https://github.com/dcyfr/dcyfr-ai"
  - label: "OpenAI API Reference"
    href: "https://platform.openai.com/docs"
---

## Introduction

Welcome to DCYFR AI! In this tutorial, you'll learn how to build your first AI agent from scratch...

## Prerequisites

Before we begin, make sure you have:
- Node.js ≥24.13.0
- npm ≥11.6.2
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))

## Step 1: Installation

```bash
npm install @dcyfr/ai
```

## Step 2: Configuration

Create a `.dcyfr.yaml` configuration file...

[Continue with tutorial content...]

## Conclusion

You've successfully built your first DCYFR AI agent! 🎉

## Next Steps

- Explore [Advanced Agent Patterns](/blog/advanced-agent-patterns)
- Read the [API Documentation](https://github.com/dcyfr/dcyfr-ai/docs)
- Join our [Discord Community](https://discord.gg/dcyfr)
```

**What this example demonstrates:**
- ✅ All required frontmatter fields (`title`, `summary`, `publishedAt`, `tags`)
- ✅ Optional fields (`updatedAt`, `featured`, `readingTime`, `image`, `sources`)
- ✅ Comprehensive hero image configuration with caption and credit
- ✅ Source attribution for referenced documentation
- ✅ Structured content with clear headings and code blocks
- ✅ Internal links to related posts
- ✅ External links to resources

---

### Writing Content

Use standard Markdown syntax in the body of your post. The content supports:

- Headings (`## Heading 2`, `### Heading 3`, etc.)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links and images
- Bold text
- Blockquotes

### Reading Time Calculation

The reading time is **automatically calculated** based on word count using the formula:

```
Reading Time (minutes) = Total Words ÷ 200 words per minute
```

**How it works:**
- System counts all words in your MDX content (excluding frontmatter)
- Calculates reading time assuming 200 words/minute average reading speed
- Rounds to nearest minute (minimum 1 minute)
- Displays as "5 min read" in blog listings and post headers

**Override automatic calculation:**

If you want to manually specify reading time (e.g., for posts with lots of code or diagrams that take longer to read), add `readingTime` to frontmatter:

```yaml
---
title: "Complex Tutorial with Code"
summary: "Step-by-step guide"
publishedAt: "2026-02-08"
tags: ["tutorial"]
readingTime: 12  # Override with 12 minutes
---
```

The manual `readingTime` value will always take precedence over automatic calculation.

## File Naming

The filename (without the `.mdx` extension) becomes the URL slug. For example:
- `my-new-post.mdx` → `/blog/my-new-post`
- `shipping-a-nextjs-tiny-portfolio.mdx` → `/blog/shipping-a-nextjs-tiny-portfolio`

Use lowercase letters and hyphens to separate words.

---

## Troubleshooting

### Issue: Hero Image Not Displaying

**Symptoms:** Post shows no hero image, or broken image icon appears

**Common Causes & Solutions:**

1. **Incorrect file path in frontmatter**
   - ✅ Ensure path starts with `/blog/`: `/blog/my-post/assets/hero.jpg`
   - ✅ Match exact filename (case-sensitive): `hero.jpg` vs `Hero.jpg`
   - ✅ Check file extension: `.jpg`, `.jpeg`, `.png`, `.svg`, `.webp`

2. **Image file not in correct location**
   - ✅ For auto-detection: Place `hero.svg` (or `.jpg/.png/.webp`) directly in post folder
   - ✅ For custom path: Place image in `assets/` subfolder
   - ✅ Verify file exists: `ls src/content/blog/my-post/hero.svg`

3. **Image URL doesn't match public path**
   - ✅ Public URL is `/blog/{slug}/assets/{filename}`
   - ✅ Example: `src/content/blog/my-post/hero.svg` → `/blog/my-post/assets/hero.svg`

**Example Fix:**
```yaml
# ❌ Wrong
image:
  url: "/my-post/hero.jpg"  # Missing /blog/ prefix

# ✅ Correct
image:
  url: "/blog/my-post/assets/hero.jpg"
```

### Issue: Frontmatter Parsing Errors

**Symptoms:** Post doesn't appear in listings, or build fails with YAML error

**Common Causes & Solutions:**

1. **Invalid YAML syntax**
   - ✅ Ensure proper indentation (2 spaces, not tabs)
   - ✅ Wrap strings with special characters in quotes: `title: "My Post: A Guide"`
   - ✅ Use array syntax for tags: `tags: ["AI", "Tutorial"]` not `tags: AI, Tutorial`

2. **Missing required fields**
   - ✅ Required: `title`, `summary`, `publishedAt`, `tags`
   - ✅ Check spelling: `publishedAt` not `publishDate`

3. **Invalid date format**
   - ✅ Use YYYY-MM-DD format: `"2026-02-08"` not `"02/08/2026"`
   - ✅ Wrap date in quotes: `publishedAt: "2026-02-08"`

**Example Fix:**
```yaml
# ❌ Wrong (missing quotes, wrong format)
publishedAt: 02/08/2026
tags: AI, Tutorial

# ✅ Correct
publishedAt: "2026-02-08"
tags: ["AI", "Tutorial"]
```

### Issue: Slug Conflicts (URL Already Exists)

**Symptoms:** Post not appearing at expected URL, or build warning about duplicate slugs

**Common Causes & Solutions:**

1. **Duplicate filenames**
   - ✅ Check for existing post: `ls src/content/blog/ | grep my-post`
   - ✅ Rename file or folder to unique slug: `my-post-2.mdx` or `my-post-updated.mdx`

2. **Folder and file with same name**
   - ✅ You can't have both `my-post.mdx` and `my-post/index.mdx`
   - ✅ Choose one structure and remove the other

**Prevention:**
- Search existing posts before creating: `grep -r "my-post" src/content/blog/`
- Use descriptive, unique slugs: `nextjs-15-features.mdx` not `nextjs.mdx`

### Issue: Reading Time Not Calculating

**Symptoms:** Reading time shows "0 min read" or is missing

**Common Causes & Solutions:**

1. **Empty or very short content**
   - ✅ Minimum ~200 words for "1 min read" to display
   - ✅ Add more content or manually set `readingTime: 1` in frontmatter

2. **Content only in MDX components**
   - ✅ System counts plain text, not text inside custom components
   - ✅ Workaround: Add a manual `readingTime` field in frontmatter

**Example Fix:**
```yaml
---
title: "Quick Tip"
summary: "A brief tip"
publishedAt: "2026-02-08"
tags: ["Tips"]
readingTime: 1  # Manually set for short posts
---
```

### Issue: Post Not Appearing in Blog Listings

**Symptoms:** Post exists but doesn't show in blog archive or homepage

**Common Causes & Solutions:**

1. **Future publish date**
   - ✅ Check `publishedAt` date isn't in the future
   - ✅ Use current or past date: `"2026-02-08"` not `"2026-12-31"`

2. **Draft mode enabled**
   - ✅ Some systems use `draft: true` flag (check if your system implements this)
   - ✅ Remove `draft: true` or change to `draft: false`

3. **Missing required frontmatter**
   - ✅ Ensure all required fields present: `title`, `summary`, `publishedAt`, `tags`
   - ✅ Run type check: `npm run typecheck` to catch frontmatter issues

4. **MDX syntax error**
   - ✅ Check terminal for build errors
   - ✅ Validate MDX syntax (closing tags, proper nesting)

### Issue: Images in Content Not Loading

**Symptoms:** Inline images (not hero image) show broken link

**Common Causes & Solutions:**

1. **Relative path instead of absolute**
   - ✅ Use absolute path: `![Screenshot](/blog/my-post/assets/screenshot.png)`
   - ✅ Not relative: `![Screenshot](./screenshot.png)` ❌

2. **Image not in assets folder**
   - ✅ Place all post images in `src/content/blog/my-post/` folder
   - ✅ They're served from `/blog/my-post/assets/` URL

**Example Fix:**
```mdx
<!-- ❌ Wrong (relative path) -->
![Demo](./demo.png)

<!-- ✅ Correct (absolute path) -->
![Demo](/blog/my-post/assets/demo.png)
```

---

## Tips for Content Authors

### Best Practices

1. **Use descriptive slugs** - `building-ai-agents-with-langchain.mdx` is better than `post-1.mdx`
2. **Write compelling summaries** - The summary appears in listings and social media previews (aim for 120-160 characters)
3. **Choose relevant tags** - Use 3-5 tags that accurately describe the topic
4. **Add alt text to images** - Always include descriptive `alt` text for accessibility
5. **Link to related posts** - Help readers discover more content with internal links
6. **Update old posts** - When you update a post, add `updatedAt` field to frontmatter
7. **Attribute sources** - Use `sources` array to credit referenced documentation or tutorials

### SEO Tips

- Use keyword-rich titles (but keep them natural and readable)
- Write meta descriptions (summary field) that include target keywords
- Use heading hierarchy properly (`##` for main sections, `###` for subsections)
- Include internal links to other blog posts
- Add external links to authoritative sources

### Performance Tips

- Optimize images before adding (use WebP format when possible, compress JPEGs)
- Keep hero images under 500KB
- Use SVG for diagrams and illustrations when possible
- Lazy-load images by default (handled automatically by Next.js)

---

## Need Help?

- **Documentation Issues:** [Open an issue](https://github.com/dcyfr/dcyfr-labs/issues)
- **Content Questions:** Ask in [GitHub Discussions](https://github.com/dcyfr/dcyfr-labs/discussions)
- **Blog Examples:** Browse existing posts in `src/content/blog/` for reference
