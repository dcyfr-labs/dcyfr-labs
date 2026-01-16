# Content Audit Checklist

**Status:** ✅ Production  
**Last Updated:** January 14, 2026  
**Related:** [Content Creation](./content-creation.md) · [Frontmatter Schema](./frontmatter-schema.md) · [Component Patterns](../ai/component-patterns.md)

---

## Purpose

Use this checklist when creating or reviewing blog posts to ensure compliance with content standards and best practices.

---

## Pre-Publication Checklist

### ✅ Frontmatter Validation

**Run automated validation:**
```bash
npm run validate:frontmatter
```

**Manual checks:**
- [ ] `id` follows format: `post-YYYYMMDD-XXXXXXXX` (8-digit hex)
- [ ] `title` is concise (≤200 characters) and descriptive
- [ ] `subtitle` (optional) provides additional context (≤300 characters)
- [ ] `summary` is SEO-optimized (50-500 characters)
- [ ] `authors` includes at least one author ID
- [ ] `publishedAt` is valid ISO 8601 datetime
- [ ] `updatedAt` (if present) is valid ISO 8601 datetime
- [ ] `category` is one of the valid categories (see `src/lib/post-categories.ts`)
- [ ] `tags` includes 1-10 relevant tags
- [ ] `image.credit` is "Perplexity Labs" (NOT "AI Generated")
- [ ] `image.alt` describes the image for accessibility
- [ ] `image.url` points to a valid image file

---

### ✅ Content Quality

**Readability:**
- [ ] Post length is appropriate for topic (minimum 300 words recommended)
- [ ] Headings follow logical hierarchy (H2 → H3 → H4)
- [ ] Paragraphs are concise (3-5 sentences max)
- [ ] Code examples have syntax highlighting and language tags
- [ ] Links open in correct context (internal vs. external)

**SEO Optimization:**
- [ ] Primary keyword appears in title, summary, and first paragraph
- [ ] Meta description (summary) is compelling and accurate
- [ ] Internal links to related posts/pages included where relevant
- [ ] External links include proper attribution
- [ ] Images have descriptive alt text

**Accessibility:**
- [ ] All images have alt text
- [ ] Code blocks have language identifiers
- [ ] Tables have proper headers
- [ ] Links have descriptive text (not "click here")

---

### ✅ MDX Component Usage

**SectionShare (Social Sharing):**
- [ ] **1-3 instances per post** (placed after major sections)
- [ ] `sectionId` matches heading slug
- [ ] `sectionTitle` matches heading text exactly
- [ ] Placed strategically for maximum engagement

**Example:**
```mdx
## Major Section Title

Content here...

<SectionShare 
  sectionId="major-section-title" 
  sectionTitle="Major Section Title" 
/>
```

**GlossaryTooltip (Technical Terms):**
- [ ] **5-10 instances per technical post** (more for deep-dive content)
- [ ] First usage of acronyms or domain-specific terms
- [ ] `term` is the technical term
- [ ] `definition` is clear and concise
- [ ] `children` (optional) defaults to term if omitted

**Example:**
```mdx
<GlossaryTooltip 
  term="CSP" 
  definition="Content Security Policy - an HTTP header that prevents XSS attacks by controlling which resources can be loaded"
>
  CSP
</GlossaryTooltip>
```

**CollapsibleSection (Progressive Disclosure):**
- [ ] Used for optional/advanced content
- [ ] Used for role-specific information
- [ ] NOT hiding core content readers need
- [ ] `id` is unique and descriptive
- [ ] `title` is clear and indicates what's inside
- [ ] `defaultExpanded` is `false` for optional content

**Example:**
```mdx
<CollapsibleSection
  id="developer-actions"
  title="For Developers Building Agentic Systems"
  defaultExpanded={false}
>
  - Action item 1
  - Action item 2
</CollapsibleSection>
```

**Specialized Components (Use Sparingly):**
- [ ] Custom components are documented in `docs/blog/content-creation.md`
- [ ] RIVET library components preferred over custom ones
- [ ] If creating new custom component, add to documentation

---

### ✅ Code Quality

**Code Blocks:**
- [ ] All code blocks have language tags (```typescript, ```bash, etc.)
- [ ] Code is properly formatted and indented
- [ ] No sensitive information (API keys, tokens, credentials)
- [ ] Examples are runnable or clearly marked as pseudo-code

**Inline Code:**
- [ ] Technical terms in backticks: `variable`, `function()`, `className`
- [ ] File paths in backticks: `src/components/Button.tsx`
- [ ] Consistent formatting throughout post

---

### ✅ Design System Compliance

**Design Tokens:**
- [ ] No hardcoded colors (use `--color-*` tokens)
- [ ] No hardcoded spacing (use `--spacing-*` tokens)
- [ ] No hardcoded fonts (use `--font-*` tokens)
- [ ] Custom styling (if any) uses design tokens

**Component Usage:**
- [ ] Alert components use correct types: `info`, `warning`, `error`, `success`, `critical`
- [ ] KeyTakeaway components use correct variants: `default`, `security`, `warning`
- [ ] ContextClue components used for post introductions

---

### ✅ Performance & Build

**Image Optimization:**
- [ ] Hero images are WebP format
- [ ] Hero images are 1200×630 (OG image standard)
- [ ] Images are compressed (under 200KB for hero images)
- [ ] Inline images have width/height specified

**Build Validation:**
```bash
# Run all validation checks
npm run validate:frontmatter
npm run validate:categories
npm run check

# Build the site
npm run build
```

**Checks:**
- [ ] `npm run validate:frontmatter` passes
- [ ] `npm run validate:categories` passes
- [ ] `npm run check` (lint + typecheck) passes
- [ ] `npm run build` completes without errors
- [ ] Preview build locally (`npm run start`) to verify rendering

---

## Component Usage Matrix

| Component              | When to Use                                       | Count Per Post | Placement                              |
| ---------------------- | ------------------------------------------------- | -------------- | -------------------------------------- |
| `<SectionShare>`       | After major sections for social engagement        | 1-3            | After H2 headings                      |
| `<GlossaryTooltip>`    | First usage of technical terms/acronyms           | 5-10+          | Inline with technical content          |
| `<CollapsibleSection>` | Optional/advanced content, role-specific info     | 0-10           | Around supplementary content           |
| `<Alert>`              | Important notices, warnings, critical information | 0-3            | Top of post or before critical sections |
| `<KeyTakeaway>`        | Highlight key insights                            | 1-3            | After important explanations           |
| `<ContextClue>`        | Post introduction summary                         | 1              | Very top of post (after frontmatter)   |

---

## Common Violations & Fixes

### Frontmatter Errors

**❌ Missing required fields:**
```yaml
---
title: "My Post"
# Missing: id, summary, publishedAt, tags, authors
---
```

**✅ Fixed:**
```yaml
---
id: "post-20260114-b4f5e2c2"
title: "My Post"
summary: "A comprehensive guide to..."
authors: ["dcyfr"]
publishedAt: "2026-01-14T12:00:00Z"
category: "DevSecOps"
tags: ["Tutorial", "Next.js"]
---
```

### Component Errors

**❌ No SectionShare components:**
```mdx
## Important Section

Content...

## Another Important Section

More content...
```

**✅ Fixed (1-3 per post):**
```mdx
## Important Section

Content...

<SectionShare sectionId="important-section" sectionTitle="Important Section" />

## Another Important Section

More content...

<SectionShare sectionId="another-important-section" sectionTitle="Another Important Section" />
```

**❌ Missing GlossaryTooltips for technical terms:**
```mdx
This uses CSP to prevent XSS attacks.
```

**✅ Fixed:**
```mdx
This uses <GlossaryTooltip term="CSP" definition="Content Security Policy - prevents XSS by controlling loadable resources">CSP</GlossaryTooltip> to prevent <GlossaryTooltip term="XSS" definition="Cross-Site Scripting - injection attack executing malicious scripts">XSS</GlossaryTooltip> attacks.
```

### Image Credit Errors

**❌ Incorrect credit:**
```yaml
image:
  url: "/blog/my-post/hero.webp"
  alt: "Hero image"
  credit: "AI Generated"
```

**✅ Fixed:**
```yaml
image:
  url: "/blog/my-post/hero.webp"
  alt: "Descriptive alt text for hero image"
  credit: "Perplexity Labs"
```

---

## Automated Validation Scripts

### Validate Frontmatter
```bash
npm run validate:frontmatter
```
- Validates all frontmatter against Zod schema
- Checks required fields, formats, and data types
- Runs during build process

### Validate Categories
```bash
npm run validate:categories
```
- Ensures all categories are valid
- Warns about missing categories
- Runs during build process

### Full Validation Suite
```bash
npm run validate:all
```
- Runs all validation checks
- Includes design tokens, emojis, feeds, sitemap
- Comprehensive pre-deployment check

---

## Pre-Deployment Workflow

1. **Create Content:**
   - Write post in `src/content/blog/my-post/index.mdx`
   - Add frontmatter with all required fields
   - Add hero image to `src/content/blog/my-post/assets/`

2. **Add Components:**
   - Add 1-3 `<SectionShare>` components
   - Add 5-10 `<GlossaryTooltip>` components
   - Add `<CollapsibleSection>` for optional content

3. **Run Validation:**
   ```bash
   npm run validate:frontmatter
   npm run check
   ```

4. **Build & Preview:**
   ```bash
   npm run build
   npm run start
   ```
   - Visit `http://localhost:3000/blog/my-post`
   - Verify rendering and functionality

5. **Deploy:**
   ```bash
   git add src/content/blog/my-post/
   git commit -m "Add: My Post"
   git push
   ```

---

## Resources

**Documentation:**
- [Content Creation Guide](./content-creation.md)
- [Frontmatter Schema Reference](./frontmatter-schema.md)
- [Component Patterns](../ai/component-patterns.md)
- [RIVET Component Library](../content/rivet-component-library.md)

**Validation Scripts:**
- `scripts/validate-frontmatter.mjs` - Frontmatter validation
- `scripts/validate-post-categories.mjs` - Category validation
- `src/schemas/frontmatter.ts` - Zod schema definitions

**Examples:**
- `src/content/blog/owasp-top-10-agentic-ai/` - Full component usage
- `src/content/blog/building-with-ai/` - Technical tooltips
- `src/content/blog/hardening-developer-portfolio/` - Security content

---

**Status:** Production Ready  
**Last Updated:** January 14, 2026  
**Maintained By:** Content Team

For questions or improvements, create an issue or contact the content team.
