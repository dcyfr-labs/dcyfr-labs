# Content Creation Guide

**Status:** ✅ Production  
**Last Updated:** October 24, 2025  
**Related:** [Blog Architecture](./architecture) · [MDX Processing](./mdx-processing) · [Frontmatter Schema](./frontmatter-schema)

---

## Summary

This guide covers everything you need to know about creating, editing, and publishing blog posts. From frontmatter configuration to markdown syntax, SEO optimization to workflow best practices—this is your complete reference for content authoring.

---

## Table of Contents

- [Quick Start](#quick-start)
- [File Structure](#file-structure)
- [Frontmatter Configuration](#frontmatter-configuration)
- [Writing Content](#writing-content)
- [Markdown Features](#markdown-features)
- [Post States](#post-states)
- [SEO Best Practices](#seo-best-practices)
- [Workflow Guide](#workflow-guide)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Creating Your First Post

1. **Create a new MDX file:**
   ```bash
   touch src/content/blog/my-awesome-post.mdx
   ```

2. **Add frontmatter and content:**
   ```mdx
   ---
   title: "My Awesome Post"
   summary: "A brief description that appears in listings and social previews"
   publishedAt: "2025-10-24"
   tags: ["tutorial", "next.js"]
   featured: false
   ---

   ## Introduction

   Your content starts here...
   ```

3. **Preview locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/blog/my-awesome-post
   ```

4. **Deploy:**
   ```bash
   git add src/content/blog/my-awesome-post.mdx
   git commit -m "Add: My Awesome Post"
   git push
   ```

**That's it!** The post is now live (or in draft mode if you set `draft: true`).

---

## File Structure

### Location

All blog posts live in:
```
src/content/blog/
├── my-first-post.mdx
├── another-post.mdx
└── latest-post.mdx
```

### Naming Conventions

**File names become URL slugs:**
- `my-first-post.mdx` → `/blog/my-first-post`
- `shipping-tiny-portfolio.mdx` → `/blog/shipping-tiny-portfolio`
- `nextjs-app-router-guide.mdx` → `/blog/nextjs-app-router-guide`

**Best Practices:**
- ✅ Use lowercase letters
- ✅ Separate words with hyphens (`-`)
- ✅ Keep slugs concise but descriptive
- ✅ Use keywords for SEO
- ❌ Avoid special characters (`!`, `@`, `#`, etc.)
- ❌ Avoid underscores (use hyphens instead)
- ❌ Avoid dates in filenames (use frontmatter instead)

**Examples:**
```bash
# Good
building-a-blog-with-nextjs.mdx
mastering-typescript-generics.mdx
css-grid-layout-guide.mdx

# Avoid
2025-10-24-my-post.mdx        # Date in filename
My_Post_Title.mdx             # Underscores and capitals
my-post!!!.mdx                # Special characters
```

---

## Frontmatter Configuration

Frontmatter is YAML metadata at the top of each MDX file, enclosed in `---` markers.

### Required Fields

```yaml
---
title: "Your Post Title"
summary: "A brief description (150-160 chars recommended)"
publishedAt: "2025-10-24"
tags: ["tag1", "tag2"]
---
```

### All Available Fields

```yaml
---
# Required
title: "Complete Guide to Next.js App Router"
summary: "Learn how to build modern web apps with Next.js 16 App Router, server components, and streaming."
publishedAt: "2025-10-24"
tags: ["Next.js", "React", "Tutorial"]

# Optional
updatedAt: "2025-10-25"
featured: true
archived: false
draft: false

# Optional - Sources/References
sources:
  - label: "Next.js Documentation"
    href: "https://nextjs.org/docs"
  - label: "React Server Components RFC"
    href: "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md"
---
```

### Field Descriptions

#### `title` (required)
- **Type:** String
- **Purpose:** Main post heading, appears in listings, browser tabs, and social previews
- **Best Practices:**
  - Keep under 60 characters for SEO
  - Use sentence case or title case consistently
  - Make it descriptive and compelling
  - Include primary keyword when possible

**Examples:**
```yaml
title: "Building a Blog with Next.js and MDX"
title: "TypeScript Generics: A Complete Guide"
title: "How I Optimized My Site to Load in Under 1 Second"
```

#### `summary` (required)
- **Type:** String
- **Purpose:** Brief description for listings, meta descriptions, and social cards
- **Best Practices:**
  - 150-160 characters ideal for SEO
  - Summarize key takeaways
  - Include call to action when appropriate
  - Front-load important information

**Examples:**
```yaml
summary: "Learn how to build a modern blog with Next.js 16 App Router, MDX for content, and Tailwind CSS for styling. Includes full source code."

summary: "A deep dive into TypeScript generics with practical examples, common patterns, and advanced techniques for type-safe code."
```

#### `publishedAt` (required)
- **Type:** String (ISO date format)
- **Purpose:** Publication date for sorting and display
- **Format:** `YYYY-MM-DD`

**Examples:**
```yaml
publishedAt: "2025-10-24"
publishedAt: "2025-01-15"
```

#### `tags` (required)
- **Type:** Array of strings
- **Purpose:** Categorization, filtering, and related post recommendations
- **Best Practices:**
  - Use 2-5 tags per post
  - Keep tags consistent across posts (check existing tags first)
  - Use lowercase or title case consistently
  - Be specific enough to be useful, broad enough to group posts

**View all existing tags:**
```typescript
import { allPostTags, postTagCounts } from "@/data/posts";
console.log(allPostTags); // All unique tags
console.log(postTagCounts); // Tag usage counts
```

**Examples:**
```yaml
tags: ["Next.js", "React", "Tutorial"]
tags: ["TypeScript", "JavaScript", "Types"]
tags: ["CSS", "Design", "Frontend"]
tags: ["Performance", "Optimization", "Web Vitals"]
```

#### `updatedAt` (optional)
- **Type:** String (ISO date format)
- **Purpose:** Last significant update date
- **Format:** `YYYY-MM-DD`
- **When to use:** Major content revisions, not minor typo fixes

**Examples:**
```yaml
publishedAt: "2025-09-10"
updatedAt: "2025-10-24"  # Updated 6 weeks later
```

#### `featured` (optional)
- **Type:** Boolean
- **Purpose:** Highlight post on homepage and featured sections
- **Default:** `false`
- **Best Practices:**
  - Feature 2-5 posts maximum
  - Choose high-quality, evergreen content
  - Update periodically to keep homepage fresh

**Examples:**
```yaml
featured: true   # Show on homepage
featured: false  # Don't feature (default)
```

#### `archived` (optional)
- **Type:** Boolean
- **Purpose:** Mark posts as outdated but keep them accessible
- **Default:** `false`
- **When to use:** Content is no longer current but has historical value

**Examples:**
```yaml
archived: true   # Show "Archived" badge
archived: false  # Current content (default)
```

**Effect:**
- Shows "Archived" badge on post
- Still visible in search and listings
- Still indexed by search engines
- Signals to readers content may be outdated

#### `draft` (optional)
- **Type:** Boolean
- **Purpose:** Hide post in production, visible only in development
- **Default:** `false`
- **When to use:** Work-in-progress content, unpublished posts

**Examples:**
```yaml
draft: true   # Visible only in development
draft: false  # Published (default)
```

**Behavior:**
- **Development (`npm run dev`):** Drafts visible at `/blog/slug`
- **Production:** Drafts completely hidden (404)
- Shows "Draft" badge in development

#### `sources` (optional)
- **Type:** Array of objects with `label` and `href`
- **Purpose:** Cite references, link to related resources
- **Best Practices:**
  - Link to official documentation
  - Credit original sources
  - Provide further reading
  - Order by relevance

**Examples:**
```yaml
sources:
  - label: "Next.js Documentation"
    href: "https://nextjs.org/docs"
  - label: "React Server Components RFC"
    href: "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md"
  - label: "Tailwind CSS v4 Alpha"
    href: "https://tailwindcss.com/blog/tailwindcss-v4-alpha"
```

---

## Writing Content

### Content Structure

After frontmatter, write your content using standard Markdown/MDX syntax.

**Recommended Structure:**
```mdx
---
# ... frontmatter ...
---

> Optional: Introductory callout, update notice, or key takeaway

## Introduction

Hook the reader with the problem/topic and what they'll learn.

## Main Section 1

Core content with examples, explanations, and code samples.

### Subsection 1.1

Break down complex topics into digestible chunks.

## Main Section 2

Continue building on the topic.

## Conclusion

Summarize key points and provide next steps or calls to action.
```

### Heading Hierarchy

- **H1** - Reserved for post title (auto-generated from frontmatter)
- **H2** - Main sections (used in Table of Contents)
- **H3** - Subsections (used in Table of Contents)
- **H4-H6** - Fine-grained organization (not in TOC)

**Example:**
```markdown
## Getting Started

### Installation

#### Prerequisites

##### System Requirements
```

**Best Practices:**
- Start with H2 for main sections
- Don't skip heading levels
- Keep headings concise and descriptive
- Use sentence case for consistency

---

## Markdown Features

### GitHub-Flavored Markdown

All standard GFM features are supported via `remark-gfm`.

#### Text Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`inline code`
```

**Rendered:**
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `inline code`

#### Links

```markdown
[Link text](https://example.com)
[Internal link](/blog/another-post)
```

**Auto-detected:**
- External links open in new tab with `rel="noopener noreferrer"`
- Internal links navigate normally

#### Lists

**Unordered:**
```markdown
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3
```

**Ordered:**
```markdown
1. First step
2. Second step
3. Third step
```

**Task Lists:**
```markdown
- [x] Completed task
- [ ] Pending task
- [ ] Another task
```

#### Blockquotes

```markdown
> This is a blockquote.
> It can span multiple lines.

> **Tip:** Use blockquotes for important callouts, tips, or updates.
```

**Rendered:**
> This is a blockquote.
> It can span multiple lines.

#### Horizontal Rules

```markdown
---
```

Use for section breaks or thematic transitions.

#### Tables

```markdown
| Feature       | Status | Notes          |
|---------------|--------|----------------|
| Server Comps  | ✅     | Default        |
| Client Comps  | ✅     | When needed    |
| Streaming     | ✅     | Built-in       |
```

**Rendered:**

| Feature       | Status | Notes          |
|---------------|--------|----------------|
| Server Comps  | ✅     | Default        |
| Client Comps  | ✅     | When needed    |
| Streaming     | ✅     | Built-in       |

**Alignment:**
```markdown
| Left    | Center  | Right   |
|---------|:-------:|--------:|
| A       | B       | C       |
```

---

### Code Blocks

#### Inline Code

```markdown
Use the `npm run dev` command to start the dev server.
```

**Rendered:**
Use the `npm run dev` command to start the dev server.

#### Code Blocks with Syntax Highlighting

Specify language for automatic syntax highlighting:

````markdown
```typescript
const greeting: string = "Hello, World!";
console.log(greeting);
```
````

**Supported Languages:**
- `typescript`, `javascript`, `jsx`, `tsx`
- `html`, `css`, `scss`, `json`
- `bash`, `shell`, `zsh`
- `python`, `rust`, `go`
- `yaml`, `toml`, `sql`
- [200+ more languages](https://shiki.style/languages)

#### Multi-Line Code Examples

````markdown
```tsx
import { Button } from "@/components/ui/button";

export default function Example() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Click Me</Button>
      <Button variant="outline">Outline</Button>
    </div>
  );
}
```
````

#### Code Without Language

````markdown
```
Plain text code block
No syntax highlighting
```
````

---

### Images (Coming Soon)

**Current State:**
```markdown
![Alt text](https://example.com/image.jpg)
```

**Future Enhancement:**
- Use `next/image` for optimization
- Store images in `public/blog/` or external CDN
- Automatic responsive images and lazy loading

---

### Custom Components (MDX)

MDX allows you to use React components in markdown.

**Example - Custom Callout (future):**
```mdx
<Callout type="warning">
  This feature is experimental and may change in future releases.
</Callout>
```

**Current Custom Components:**
- Standard HTML elements with Tailwind styling
- See [MDX Component docs](../components/mdx) for full list

---

## Post States

### Draft Posts

**Purpose:** Work-in-progress content not ready for publication

**Configuration:**
```yaml
draft: true
```

**Behavior:**
- ✅ Visible in development (`npm run dev`)
- ❌ Hidden in production builds
- 🏷️ Shows "Draft" badge in development
- 🔍 Not included in search results
- 📊 Not counted in post statistics

**Workflow:**
1. Create post with `draft: true`
2. Develop and preview locally
3. When ready, change to `draft: false`
4. Commit and deploy

### Archived Posts

**Purpose:** Outdated content with historical value

**Configuration:**
```yaml
archived: true
```

**Behavior:**
- ✅ Visible in all environments
- 🏷️ Shows "Archived" badge
- 📋 Appears in listings (sorted by date)
- 🔍 Searchable and indexable
- 📊 Counted in statistics

**When to Archive:**
- Technology has moved on
- Better alternatives exist
- Content is historically interesting
- Don't want to delete for SEO/history

**Example:**
```yaml
---
title: "Getting Started with Webpack 4"
summary: "Learn how to configure Webpack 4 for modern web development."
publishedAt: "2019-05-15"
updatedAt: "2025-10-24"
archived: true
tags: ["Webpack", "Build Tools"]
---

> **Note:** This post is archived. Webpack 5 is now stable, and many projects have moved to Vite or Turbopack. This content remains for historical reference.
```

### Featured Posts

**Purpose:** Highlight best/most important content

**Configuration:**
```yaml
featured: true
```

**Behavior:**
- 🌟 Appears on homepage
- 📋 Included in featured post sections
- 🎯 Prioritized in recommendations

**Best Practices:**
- Feature 2-5 posts maximum
- Choose evergreen, high-quality content
- Update periodically
- Consider analytics (most popular posts)

---

## SEO Best Practices

### Title Optimization

**Guidelines:**
- 50-60 characters for optimal display in search results
- Include primary keyword near the beginning
- Make it compelling and click-worthy
- Use pipes (`|`) or colons (`:`) for subtitles

**Examples:**
```yaml
# Good
title: "Next.js App Router: Complete Guide to Server Components"
title: "TypeScript Generics Explained | Practical Examples"
title: "CSS Grid Layout: From Basics to Advanced Techniques"

# Avoid
title: "My Post"  # Too vague
title: "The Complete Comprehensive Ultra-Detailed Guide to Everything About Building Modern Web Applications with Next.js"  # Too long
```

### Summary/Meta Description

**Guidelines:**
- 150-160 characters for optimal search result display
- Include primary and secondary keywords naturally
- Describe what readers will learn or gain
- Include a call to action when appropriate

**Examples:**
```yaml
# Good
summary: "Learn how to use TypeScript generics to build reusable, type-safe functions and classes. Includes practical examples and common patterns."

summary: "A step-by-step guide to migrating from Pages Router to App Router in Next.js, with code examples and best practices."

# Avoid
summary: "A post about Next.js"  # Too vague
summary: "Read this now!"  # No information
```

### Tags for Discoverability

**Guidelines:**
- Use 2-5 tags per post
- Check existing tags for consistency
- Mix broad and specific tags
- Consider what readers might search for

**Example Strategy:**
```yaml
tags: ["Next.js", "Tutorial", "Performance"]
# "Next.js" - broad category
# "Tutorial" - content type
# "Performance" - specific topic
```

### URL Slugs

**Guidelines:**
- Keep slugs short but descriptive
- Include primary keyword
- Use hyphens to separate words
- Avoid stop words when possible

**Examples:**
```bash
# Good
nextjs-app-router-guide.mdx
typescript-generics-tutorial.mdx
css-grid-layout-basics.mdx

# Avoid
post1.mdx                    # Not descriptive
the-ultimate-guide-to-using-nextjs-app-router-in-2025.mdx  # Too long
```

### Content Freshness

**Update Strategy:**
1. Add `updatedAt` for significant revisions
2. Add update notices for major changes
3. Archive outdated content instead of deleting
4. Refresh featured posts periodically

**Example Update Notice:**
```mdx
> **Update (Oct 2025):** This post has been updated to reflect Next.js 16 and React 19 changes. The original concepts still apply.
```

---

## Workflow Guide

### Creating a New Post

**Step-by-step:**

1. **Research existing content:**
   ```bash
   # List all posts
   ls src/content/blog/
   
   # Check existing tags
   grep -h "^tags:" src/content/blog/*.mdx | sort | uniq
   ```

2. **Create the file:**
   ```bash
   touch src/content/blog/your-post-slug.mdx
   ```

3. **Start with frontmatter template:**
   ```mdx
   ---
   title: ""
   summary: ""
   publishedAt: "YYYY-MM-DD"
   tags: []
   draft: true
   ---
   ```

4. **Write content:**
   - Start with introduction
   - Build out main sections
   - Add code examples
   - Write conclusion

5. **Preview locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/blog/your-post-slug
   ```

6. **Iterate and refine:**
   - Check formatting
   - Test code examples
   - Review headings for TOC
   - Proofread content

7. **Publish:**
   ```yaml
   draft: false  # Change from true to false
   ```

8. **Deploy:**
   ```bash
   git add src/content/blog/your-post-slug.mdx
   git commit -m "Add: Your Post Title"
   git push
   ```

### Updating Existing Posts

**Minor Updates (typos, formatting):**
```bash
# Edit the file
vim src/content/blog/post-slug.mdx

# Commit
git add src/content/blog/post-slug.mdx
git commit -m "Fix: Typo in post title"
git push
```

**Major Updates (content changes):**
```mdx
---
title: "..."
summary: "..."
publishedAt: "2025-09-10"
updatedAt: "2025-10-24"  # Add this
---

> **Update (Oct 2025):** This post has been updated with new information about [topic].

[rest of content...]
```

### Archiving Posts

**When technology/info becomes outdated:**

1. Add `archived: true` to frontmatter
2. Add archive notice at top
3. Update summary if needed
4. Keep content for historical reference

**Example:**
```mdx
---
title: "Getting Started with Webpack 4"
archived: true
updatedAt: "2025-10-24"
---

> **Archived:** This post covers Webpack 4, which has been superseded by Webpack 5 and alternatives like Vite. Content preserved for historical reference.
```

---

## Common Patterns

### Series Posts

**Link related posts in sequence:**

```mdx
---
title: "Part 1: Introduction to TypeScript"
tags: ["TypeScript", "Series"]
---

> **Series:** This is Part 1 of 3. Continue with [Part 2: Advanced Types](/blog/typescript-part-2) and [Part 3: Generics](/blog/typescript-part-3).

## Introduction
...
```

**End with next post link:**
```markdown
## Next Steps

Continue to [Part 2: Advanced Types](/blog/typescript-part-2) to learn about union types, intersection types, and type guards.
```

### Update Notices

**At the top of post:**
```mdx
> **Update (Oct 2025):** This post is now part of a series! Check out [Part 2: Advanced Topics](/blog/post-part-2) for the follow-up.
```

**For deprecation:**
```mdx
> **Deprecation Notice:** The approach described here has been replaced by [newer method]. See [Updated Guide](/blog/new-guide) for current best practices.
```

### Code Samples with Explanations

**Pattern:**
```markdown
Here's how to implement this feature:

```typescript
export function myFunction(param: string): string {
  return `Hello, ${param}!`;
}
```

**Key points:**
- The function takes a `string` parameter
- It returns a formatted string
- TypeScript enforces type safety
```

### External References

```yaml
sources:
  - label: "Official Documentation"
    href: "https://example.com/docs"
  - label: "GitHub Repository"
    href: "https://github.com/user/repo"
```

**In content:**
```markdown
For more details, see the [official documentation](https://example.com/docs).
```

---

## Troubleshooting

### Post Not Showing Up

**Checklist:**
1. ✅ File is in `src/content/blog/` directory
2. ✅ File has `.mdx` extension
3. ✅ Frontmatter is valid YAML (no syntax errors)
4. ✅ All required fields present (`title`, `summary`, `publishedAt`, `tags`)
5. ✅ Not marked as `draft: true` (if in production)
6. ✅ Build succeeded without errors

**Debug:**
```bash
# Rebuild the project
npm run build

# Check for errors in logs
# Verify post appears in build output
```

### Syntax Highlighting Not Working

**Checklist:**
1. ✅ Code block has language identifier
2. ✅ Language is supported by Shiki
3. ✅ No extra spaces before/after backticks

**Example:**
````markdown
❌ Wrong:
``` typescript
const x = 1;
```

✅ Correct:
```typescript
const x = 1;
```
````

### Table of Contents Empty

**Cause:** Post has no H2 or H3 headings

**Solution:**
```markdown
## First Section

Content here...

### Subsection

More content...
```

### Frontmatter Parsing Errors

**Common Issues:**

1. **Missing quotes around values with colons:**
   ```yaml
   # ❌ Wrong
   title: Next.js: A Guide
   
   # ✅ Correct
   title: "Next.js: A Guide"
   ```

2. **Incorrect date format:**
   ```yaml
   # ❌ Wrong
   publishedAt: 10/24/2025
   publishedAt: Oct 24, 2025
   
   # ✅ Correct
   publishedAt: "2025-10-24"
   ```

3. **Tags not as array:**
   ```yaml
   # ❌ Wrong
   tags: Next.js, React
   
   # ✅ Correct
   tags: ["Next.js", "React"]
   ```

### Build Errors

**"Cannot read property 'title'"**
- Missing required frontmatter field
- Check all required fields are present

**"Invalid date"**
- Check date format: `YYYY-MM-DD`
- Ensure dates are strings in quotes

**"Unexpected token"**
- YAML syntax error in frontmatter
- Check for unescaped special characters
- Ensure proper indentation

---

## Related Documentation

- **[Blog Architecture](./architecture)** - Overall system design
- **[MDX Processing](./mdx-processing)** - How content is transformed
- **[Frontmatter Schema](./frontmatter-schema)** - Complete field reference
- **[Quick Reference](./quick-reference)** - Command cheat sheet

---

## Additional Resources

### External Links

- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [MDX Documentation](https://mdxjs.com/)
- [Shiki Language Support](https://shiki.style/languages)

### Internal Tools

- **Preview:** `npm run dev` → http://localhost:3000/blog
- **Build:** `npm run build` (verifies all posts)
- **Test TOC:** `npm run test:toc` (validates heading extraction)
- **Test Related Posts:** `npm run test:related-posts` (validates recommendations)

---

**Last Updated:** October 24, 2025  
**Maintained By:** Project Team  
**Status:** ✅ Production-ready
