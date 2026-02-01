<!-- TLP:CLEAR -->

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
updatedAt: "2025-10-24" # Updated 6 weeks later
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
_Italic text_
~~Strikethrough~~
`inline code`
```

**Rendered:**

- **Bold text**
- _Italic text_
- ~~Strikethrough~~
- `inline code`

#### Links

```markdown
[Link text](https://example.com)
Internal link
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
| Feature      | Status | Notes       |
| ------------ | ------ | ----------- |
| Server Comps | ✅     | Default     |
| Client Comps | ✅     | When needed |
| Streaming    | ✅     | Built-in    |
```

**Rendered:**

| Feature      | Status | Notes       |
| ------------ | ------ | ----------- |
| Server Comps | ✅     | Default     |
| Client Comps | ✅     | When needed |
| Streaming    | ✅     | Built-in    |

**Alignment:**

```markdown
| Left | Center | Right |
| ---- | :----: | ----: |
| A    |   B    |     C |
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

````

**Supported Languages:**
- `typescript`, `javascript`, `jsx`, `tsx`
- `html`, `css`, `scss`, `json`
- `bash`, `shell`, `zsh`
- `python`, `rust`, `go`
- `yaml`, `toml`, `sql`
- [200+ more languages](https://shiki.style/languages)

#### Multi-Line Code Examples

```markdown
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
````

````

#### Code Without Language

```markdown
````

Plain text code block
No syntax highlighting

```

```

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

**Available Interactive Components:**

| Component                | Purpose                      | Usage                                                                  |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------------- |
| `<KeyTakeaway>`          | Highlight key insights       | `<KeyTakeaway>Your insight</KeyTakeaway>`                              |
| `<ContextClue>`          | Provide background context   | `<ContextClue>Background info</ContextClue>`                           |
| `<Alert type="warning">` | Warnings and status messages | `<Alert type="warning">Warning</Alert>`                                |
| `<SectionShare>`         | Social sharing buttons       | `<SectionShare sectionId="id" sectionTitle="Title" />`                 |
| `<CollapsibleSection>`   | Expandable content           | `<CollapsibleSection id="id" title="Title">...</CollapsibleSection>`   |
| `<GlossaryTooltip>`      | Interactive tooltips         | `<GlossaryTooltip term="Term" definition="Def">text</GlossaryTooltip>` |

**Engagement Best Practices:**

**Social Sharing with `<SectionShare>`:**

- Place after major sections for maximum engagement
- Increases backlinks through trackable section-specific URLs
- Creates hash anchors (e.g., `/blog/post#section-id`) for SEO
- Example usage:

  ```mdx
  ## Major Section Title

  Content here...

  <SectionShare
    sectionId="major-section-title"
    sectionTitle="Major Section Title"
  />
  ```

**Progressive Disclosure with `<CollapsibleSection>`:**

- Use for role-specific content (developers, security pros, business leaders)
- Reduces initial page complexity while maintaining depth
- Persists user preferences via LocalStorage
- Example usage:
  ```mdx
  <CollapsibleSection
    id="developer-actions"
    title="For Developers Building Agentic Systems"
    defaultExpanded={false}
  >
    - Action item 1 - Action item 2 - Action item 3
  </CollapsibleSection>
  ```

**Technical Terms with `<GlossaryTooltip>`:**

- Improves accessibility for technical content
- Persists "visited" state so readers don't see tooltips twice
- Example usage:
  ```mdx
  The <GlossaryTooltip term="SSR" definition="Server-Side Rendering">SSR</GlossaryTooltip>
  approach improves initial page load.
  ```

**SEO & Engagement Benefits:**

- **SectionShare**:
  - Increases social shares and viral distribution
  - Generates trackable backlinks to specific sections
  - Improves content discoverability through granular URLs
- **CollapsibleSection**:
  - Improves scanability for different audiences
  - Reduces bounce rate by allowing self-paced exploration
  - Better mobile UX (less scrolling for casual readers)
- **GlossaryTooltip**:
  - Enhances comprehension without disrupting flow
  - Reduces need for external glossary pages
  - Improves accessibility scores

**See Full Documentation:**

- [Component Patterns Guide](../ai/component-patterns.md)
- [RIVET Component Library](../content/rivet-component-library.md)

### Specialized Components

**Post-Specific Custom Components:**

Some blog posts use specialized components for unique content needs. These are **not** part of the standard RIVET library and should be used sparingly.

| Component | Purpose | Used In | Props |
|-----------|---------|---------|-------|
| `<Figure>` | Captioned images/diagrams | `cve-2025-55182-react2shell` | `src`, `alt`, `caption` |
| `<MCPArchitecture>` | MCP architecture diagram | `building-with-ai` | `height` (optional) |
| `<RoleBasedCTA>` | Role-specific CTAs | `owasp-top-10-agentic-ai` | `role`, `children` |
| `<TLDRSummary>` | Executive summary | `owasp-top-10-agentic-ai` | `children` |
| `<FAQ>` | FAQ accordion | `owasp-top-10-agentic-ai` | `question`, `answer` |
| `<RiskAccordion>` | Security risk details | `owasp-top-10-agentic-ai` | `riskId`, `title`, `children` |
| `<RiskAccordionGroup>` | Risk accordion wrapper | `owasp-top-10-agentic-ai` | `children` |

**Icon Components:**

Direct icon imports from `lucide-react` can be used for inline visual emphasis:

```mdx
import { LockIcon, BarChartIcon, ZapIcon, RocketIcon, ShieldIcon } from 'lucide-react';

<LockIcon className="inline-block h-4 w-4" />
```

**Used in:**
- `hardening-developer-portfolio` (LockIcon, BarChartIcon, ZapIcon, RocketIcon, ShieldIcon)

**Guidelines:**

- ⚠️ **Use sparingly** - Custom components increase maintenance burden
- ✅ **Document usage** - If creating a new custom component, document it here
- ✅ **Consider RIVET first** - Check if existing RIVET components can solve the need
- ❌ **Avoid duplication** - Don't create custom components that duplicate RIVET functionality
- ❌ **No undocumented components** - Every custom component must be listed here

**Migration Path:**

If a custom component is used in 3+ posts, consider:
1. Moving it to the RIVET component library
2. Writing comprehensive tests (see `docs/content/rivet-component-library.md`)
3. Adding it to the standard MDX components table above

### Component Usage Guidelines Matrix

**Quick Reference for Content Creators:**

| Component | When to Use | Count Per Post | Placement Strategy | Example Use Case |
|-----------|-------------|----------------|-------------------|------------------|
| **SectionShare** | Major sections for social engagement | 1-3 | After H2 headings | "Share this security checklist" |
| **GlossaryTooltip** | First usage of technical terms | 5-10+ | Inline with technical content | CSP, XSS, API, SDK, RSC |
| **CollapsibleSection** | Optional/advanced content | 0-10 | Around supplementary info | Implementation details, statistics |
| **Alert** | Important notices | 0-3 | Top of post or before critical sections | Breaking changes, deprecations |
| **KeyTakeaway** | Highlight key insights | 1-3 | After important explanations | "80% of breaches use this vector" |
| **ContextClue** | Post introduction | 1 | Very top (after frontmatter) | Article summary/preview |

**Usage Best Practices:**

✅ **DO:**
- Use SectionShare after your best/most shareable sections
- Add GlossaryTooltip for every acronym and domain-specific term
- Use CollapsibleSection for role-specific content ("For Developers", "For Security Pros")
- Place Alert components at the top for critical information
- Use KeyTakeaway to emphasize important statistics or insights

❌ **DON'T:**
- Add SectionShare to every section (1-3 is ideal)
- Hide core content in CollapsibleSection (only optional/advanced content)
- Overuse Alert components (reserve for truly important notices)
- Use custom components when RIVET components exist
- Create undocumented custom components

**Good vs. Bad Examples:**

**❌ Bad: No engagement components**
```mdx
## Important Security Finding

Content about CSP and XSS...

## Implementation Guide

More content...
```

**✅ Good: Balanced component usage**
```mdx
## Important Security Finding

Content about <GlossaryTooltip term="CSP" definition="Content Security Policy">CSP</GlossaryTooltip> 
and <GlossaryTooltip term="XSS" definition="Cross-Site Scripting">XSS</GlossaryTooltip>...

<KeyTakeaway variant="security" title="Critical Insight">
  80% of XSS attacks can be prevented with proper CSP implementation.
</KeyTakeaway>

<SectionShare sectionId="important-security-finding" sectionTitle="Important Security Finding" />

## Implementation Guide

<CollapsibleSection id="technical-details" title="Technical Implementation Details" defaultExpanded={false}>
  Advanced configuration steps...
</CollapsibleSection>
```

**For Complete Audit Guidance:**
- See Content Audit Checklist for pre-publication validation
- See [Component Patterns Guide](../ai/component-patterns.md) for detailed usage examples

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
   draft: false # Change from true to false
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
updatedAt: "2025-10-24" # Add this
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

> **Series:** This is Part 1 of 3. Continue with Part 2: Advanced Types and Part 3: Generics.

## Introduction

...
```

**End with next post link:**

```markdown
## Next Steps

Continue to Part 2: Advanced Types to learn about union types, intersection types, and type guards.
```

### Update Notices

**At the top of post:**

```mdx
> **Update (Oct 2025):** This post is now part of a series! Check out Part 2: Advanced Topics for the follow-up.
```

**For deprecation:**

```mdx
> **Deprecation Notice:** The approach described here has been replaced by [newer method]. See Updated Guide for current best practices.
```

### Code Samples with Explanations

**Pattern:**

````markdown
Here's how to implement this feature:

```typescript
export function myFunction(param: string): string {
  return `Hello, ${param}!`;
}
```
````

**Key points:**

- The function takes a `string` parameter
- It returns a formatted string
- TypeScript enforces type safety

````

### External References

```yaml
sources:
  - label: "Official Documentation"
    href: "https://example.com/docs"
  - label: "GitHub Repository"
    href: "https://github.com/user/repo"
````

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

```typescript
const x = 1;
```
````

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
````

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
