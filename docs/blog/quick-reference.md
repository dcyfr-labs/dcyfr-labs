{/* TLP:CLEAR */}

# Blog System Quick Reference

**For:** Developers and content authors  
**Last Updated:** October 23, 2025  
**Related:** [Architecture](./architecture) · [Content Creation](./content-creation) · [MDX Processing](./mdx-processing)

---

## Quick Links

| Task | Go To |
|------|-------|
| Create a new post | [Creating Posts](#creating-posts) |
| Add code blocks | [Code Blocks](#code-blocks) |
| Work with tags | [Tags](#tags) |
| Mark as draft | [Draft Posts](#draft-posts) |
| Feature on homepage | [Featured Posts](#featured-posts) |
| Archive old content | [Archived Posts](#archived-posts) |
| Add sources/references | [Sources](#sources) |
| Test locally | [Local Development](#local-development) |

---

## Creating Posts

### 1. Create the File

```bash
# File: src/content/blog/my-new-post.mdx
touch src/content/blog/my-new-post.mdx
```

**Filename = URL slug:**
- `my-new-post.mdx` → `/blog/my-new-post`
- Use lowercase and hyphens
- Keep it concise and descriptive

### 2. Add Frontmatter

```mdx
---
title: "Your Post Title"
summary: "A concise 1-2 sentence summary"
publishedAt: "2025-10-23"
tags: ["tag1", "tag2", "tag3"]
---

Your content goes here...
```

### 3. Write Content

Use standard Markdown or MDX (Markdown + React components).

### 4. Preview

```bash
npm run dev
# Visit http://localhost:3000/blog/my-new-post
```

---

## Frontmatter Fields

### Required Fields

```yaml
title: "Your Post Title"           # Displayed everywhere
summary: "Brief description"        # Used in lists and SEO
publishedAt: "2025-10-23"          # ISO date (YYYY-MM-DD)
tags: ["tag1", "tag2"]             # Array of strings
```

### Optional Fields

```yaml
updatedAt: "2025-10-24"            # When content was last updated
featured: true                      # Show on homepage (default: false)
draft: true                         # Dev-only visibility (default: false)
archived: true                      # Mark as outdated (default: false)
sources:                            # External references
  - label: "Next.js Docs"
    href: "https://nextjs.org/docs"
  - label: "GitHub Repo"
    href: "https://github.com/..."
```

---

## Post Types & Badges

### Draft Posts
```yaml
draft: true
```
- ✅ Visible in development
- ❌ Hidden in production (404)
- 🔵 Blue "Draft" badge

### Featured Posts
```yaml
featured: true
```
- ⭐ Shown on homepage
- 📈 +0.5 score in related posts
- Use sparingly (2-3 posts)

### Archived Posts
```yaml
archived: true
```
- 🟠 Amber "Archived" badge
- 📉 -0.5 score in related posts
- Visible but marked outdated

### New Posts
- 🟢 Green "New" badge (automatic)
- Published < 7 days ago
- Auto-calculated

### Hot Posts
- 🔴 Red "Hot" badge (automatic)
- Most views across all posts
- Based on Redis view counts

---

## Code Blocks

### Basic Syntax

```markdown
```typescript
const greeting = "Hello, world!";
console.log(greeting);
```
```

### Supported Languages

- TypeScript/JavaScript: `ts`, `tsx`, `js`, `jsx`
- Markup: `html`, `css`, `scss`, `mdx`
- Shell: `bash`, `sh`, `zsh`
- Data: `json`, `yaml`, `toml`
- Other: `python`, `rust`, `go`, `sql`, etc.

### Themes

- **Light mode:** `github-light`
- **Dark mode:** `github-dark-dimmed`
- Automatic theme switching via `next-themes`

---

## Tags

### Best Practices

```yaml
# Good
tags: ["next.js", "typescript", "react"]

# Avoid
tags: ["NextJS", "Next.js", "nextjs"]  # Use consistent casing
tags: ["web development"]               # Too broad
```

### Tag Guidelines

- **Lowercase:** Use lowercase for consistency
- **Specific:** Be specific (not "programming" but "python")
- **3-5 tags:** Sweet spot for most posts
- **Hyphens:** Use hyphens for multi-word tags (`next.js`, `vs-code`)

### Tag Features

- **Search:** Filter posts by tag in search
- **Related Posts:** Algorithm uses shared tags
- **Tag Counts:** Auto-calculated in `postTagCounts`

---

## Markdown Features

### Headings

```markdown
## Heading 2
### Heading 3
#### Heading 4
```

**Note:** H2 and H3 automatically appear in Table of Contents

### Lists

```markdown
- Unordered list
- Another item
  - Nested item

1. Ordered list
2. Second item
```

### Links

```markdown
[Link text](https://example.com)
Internal link
```

**External links** automatically open in new tab.

### Images

```markdown
![Alt text](image-url.jpg)
```

### Blockquotes

```markdown
> This is a quote
> It can span multiple lines
```

### Horizontal Rules

```markdown
---
```

### Tables

```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

---

## Sources

Add external references:

```yaml
sources:
  - label: "Next.js Documentation"
    href: "https://nextjs.org/docs"
  - label: "GitHub Repository"
    href: "https://github.com/user/repo"
```

Displayed at the end of the post with external link icons.

---

## Local Development

### Start Dev Server

```bash
npm run dev
```

### Preview All Posts

```
http://localhost:3000/blog
```

### Preview Specific Post

```
http://localhost:3000/blog/your-slug
```

### Draft Posts

- ✅ Visible at `http://localhost:3000/blog/draft-slug`
- Test before publishing

### Hot Reload

Content changes automatically reload (no server restart needed).

---

## Publishing Workflow

### 1. Write Draft

```yaml
draft: true
```

Preview locally, iterate on content.

### 2. Review

- Check spelling and grammar
- Verify code blocks render correctly
- Test all links
- Review in both light and dark mode

### 3. Remove Draft Flag

```yaml
# Remove or set to false
draft: false
```

### 4. Deploy

```bash
git add src/content/blog/your-post.mdx
git commit -m "Add post: Your Post Title"
git push
```

Vercel automatically builds and deploys.

### 5. Verify Production

Visit `https://yourdomain.com/blog/your-slug`

---

## Updating Posts

### Update Content

1. Edit `src/content/blog/your-post.mdx`
2. Update `updatedAt` field:

```yaml
updatedAt: "2025-10-24"
```

3. Commit and push

### Update Shows

- Displayed next to publish date
- Shown in post metadata
- Included in RSS feeds

---

## Common Patterns

### Callout/Note Box

```markdown
> **Note:** This is important information.
```

### Multi-Line Code

```markdown
```typescript
export function myFunction() {
  return "Hello";
}
```
```

### Inline Code

```markdown
Use `npm run dev` to start the server.
```

### Emoji

```markdown
Use emoji directly: ✅ ❌ 🚀 📝
```

---

## File Organization

```
src/content/blog/
├── my-first-post.mdx
├── another-post.mdx
├── markdown-demo.mdx        # Draft example
└── your-new-post.mdx
```

**Guidelines:**
- One post per file
- Use descriptive filenames
- Keep files in flat structure (no subdirectories)

---

## Metadata Generation

### SEO

Automatically generated from frontmatter:
- `<title>` - Post title + site name
- `<meta name="description">` - Post summary
- OpenGraph tags (Facebook, LinkedIn)
- Twitter Card tags

### Structured Data

JSON-LD automatically generated:
- Article schema
- Author information
- Published/updated dates
- View count (if available)
- Keywords from tags

---

## Troubleshooting

### Post Not Appearing

**Check:**
1. File in `src/content/blog/`?
2. Valid frontmatter?
3. Draft flag set? (dev only)
4. Dev server running?
5. Browser cache cleared?

**Fix:**
```bash
# Restart dev server
npm run dev
```

### Code Block Not Highlighting

**Check:**
1. Language specified? ````typescript` vs ````
2. Valid language name?
3. Code fences balanced?

**Fix:**
```markdown
# Before (no highlighting)
```
code here
```

# After (with highlighting)
```typescript
code here
```
```

### Related Posts Not Showing

**Check:**
1. Are there other posts with shared tags?
2. Related posts also drafts? (filtered in production)
3. At least one shared tag?

**Fix:**
- Add more tags to posts
- Ensure tags match exactly (case-sensitive)

### View Count Not Working

**Check:**
1. `REDIS_URL` environment variable set?
2. Redis accessible?
3. In production deployment?

**Note:** View counts are optional; posts work without Redis.

---

## Performance Tips

### Keep Posts Focused

- Shorter posts load faster
- Better reading experience
- Easier to maintain

### Optimize Images

```bash
# Use next/image when possible
# Or optimize before adding to public/
```

### Limit Tags

- 3-5 tags per post (optimal)
- Too many dilutes related posts

### Use Headings

- H2 and H3 auto-generate TOC
- Improves navigation
- Better SEO

---

## Advanced Features

### Table of Contents

Auto-generated from H2 and H3 headings:
- Fixed sidebar (XL+ screens)
- Active section tracking
- Smooth scroll navigation

**Tip:** Structure posts with clear H2/H3 hierarchy.

### Reading Progress

Automatic scroll-based progress bar:
- Fixed at top of page
- GPU-accelerated animation
- Theme-aware styling

### Related Posts

Automatic recommendations:
- Based on shared tags
- Top 3 most relevant
- Scoring algorithm (tags + featured bonus)

### View Counts

Automatic tracking (requires Redis):
- Increments on page view
- Displays in badge
- Used for "Hot" badge

---

## Keyboard Shortcuts (in VS Code)

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+V` | Preview Markdown |
| `Cmd+K V` | Open preview side-by-side |
| `Cmd+B` | Toggle bold |
| `Cmd+I` | Toggle italic |

---

## Resources

### Documentation
- [Architecture](./architecture) - System overview
- [MDX Processing](./mdx-processing) - How MDX is transformed
- [Content Creation](./content-creation) - Detailed authoring guide
- [Frontmatter Schema](./frontmatter-schema) - Complete field reference

### Examples
- `src/content/blog/shipping-tiny-portfolio.mdx` - Full-featured example
- `src/content/blog/markdown-and-code-demo.mdx` - Markdown patterns (draft)

### External
- [MDX Documentation](https://mdxjs.com/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Shiki Themes](https://shiki.style/themes)

---

_For detailed information, see the [full architecture documentation](./architecture)._
