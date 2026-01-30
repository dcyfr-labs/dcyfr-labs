<!-- TLP:CLEAR -->

# Blog System Documentation

**Last Updated:** January 28, 2026
**Status:** Production

This directory contains comprehensive documentation for the blog system architecture, content creation workflows, and technical implementation details.

---

## 📚 Documentation Index

### For Content Creators

| Document                                             | Description                                         | Use When                 |
| ---------------------------------------------------- | --------------------------------------------------- | ------------------------ |
| [**content-creation.md**](./content-creation.md)     | Complete guide to writing and publishing blog posts | Creating new posts       |
| [**frontmatter-schema.md**](./frontmatter-schema.md) | Frontmatter configuration reference                 | Setting up post metadata |
| [**quick-reference.md**](./quick-reference.md)       | Quick commands and common patterns                  | Need fast answers        |
| [**diagrams-and-math.md**](./diagrams-and-math.md)   | Mermaid diagrams and LaTeX math support             | Adding visualizations    |

### For Developers

| Document                                     | Description                             | Use When                       |
| -------------------------------------------- | --------------------------------------- | ------------------------------ |
| [**architecture.md**](./architecture.md)     | Blog system architecture overview       | Understanding system design    |
| [**mdx-processing.md**](./mdx-processing.md) | MDX compilation and processing pipeline | Working with content rendering |
| [**features-index.md**](./features-index.md) | Complete feature reference              | Finding specific functionality |
| [**feeds/**](./feeds/)                       | RSS/Atom/JSON feed documentation        | Working with syndication feeds |

### Visual References

| Document                                               | Description                     | Use When                  |
| ------------------------------------------------------ | ------------------------------- | ------------------------- |
| [**visual-reference.md**](./visual-reference.md)       | Visual guides and quick lookups | Need diagrams/charts      |
| [**architecture-visual.md**](./architecture-visual.md) | Architecture diagrams           | Understanding system flow |

---

## 🚀 Quick Start

### Creating Your First Post

1. **Create MDX file:**

   ```bash
   touch src/content/blog/my-awesome-post/index.mdx
   ```

2. **Add frontmatter and content:**

   ```mdx
   ---
   title: 'My Awesome Post'
   summary: 'Brief description'
   publishedAt: '2026-01-28'
   tags: ['tutorial', 'next.js']
   ---

   ## Your content starts here...
   ```

3. **Preview locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/blog/my-awesome-post
   ```

See [content-creation.md](./content-creation.md) for complete guide.

---

## 🎯 Blog System Features

### Core Features

- ✅ MDX with custom components (KeyTakeaway, GlossaryTooltip, etc.)
- ✅ Syntax highlighting for code blocks
- ✅ Mermaid diagrams and LaTeX math
- ✅ Reading progress tracking
- ✅ Table of contents (mobile + desktop)
- ✅ Series navigation
- ✅ Social sharing (post + section level)
- ✅ RSS/Atom/JSON feeds
- ✅ Full-text search integration
- ✅ Print-friendly styling

### RIVET Framework Components

**P0 (Critical):**

- ReadingProgressBar
- KeyTakeaway
- TLDRSummary

**P1 (Enhanced Engagement):**

- GlossaryTooltip
- RoleBasedCTA
- SectionShare
- CollapsibleSection

See [content-creation.md](./content-creation.md) for usage examples.

---

## 📊 Performance & SEO

### Current Metrics

- **Lighthouse Score:** 95+ (Performance)
- **Core Web Vitals:** All green
- **Time to First Byte:** <200ms
- **Total Bundle Size:** <150KB (gzipped)

### SEO Features

- Automatic sitemap generation
- Open Graph meta tags
- Twitter Card support
- JSON-LD structured data
- Canonical URLs
- RSS/Atom feeds

---

## 🛠️ Technical Stack

- **Framework:** Next.js 16 (App Router)
- **Content:** MDX with custom components
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui + custom RIVET components
- **Syntax Highlighting:** Shiki
- **Diagrams:** Mermaid.js
- **Math:** KaTeX
- **Search:** Algolia (integration)
- **Analytics:** Vercel Analytics + Custom events

---

## 🔗 Related Documentation

**Architecture:**

- [Architecture Overview](./architecture.md)
- [MDX Processing Pipeline](./mdx-processing.md)
- [Features Index](./features-index.md)

**Content:**

- [Content Creation Guide](./content-creation.md)
- [Frontmatter Schema](./frontmatter-schema.md)
- [Component Library](../content/rivet-component-library.md)

**Feeds:**

- [RSS/Atom/JSON Feeds](./feeds/implementation.md)
- [Feed Testing Guide](./feeds/testing-guide.md)

**Operations:**

- [Blog Archive Improvements](./archive-improvements-phase-1.md)
- [Slug Redirects Guide](./slug-redirects-guide.md)

---

## 📝 Contributing

When contributing to blog content or system:

1. **Follow patterns:** Check [content-creation.md](./content-creation.md) for established patterns
2. **Use design tokens:** No hardcoded spacing/colors
3. **Test thoroughly:** Preview locally, check mobile, validate accessibility
4. **Document changes:** Update relevant docs when adding features

---

## ❓ Support

**For questions about:**

- **Writing posts:** See [content-creation.md](./content-creation.md)
- **MDX features:** See [mdx-processing.md](./mdx-processing.md)
- **Architecture:** See [architecture.md](./architecture.md)
- **Feeds:** See [feeds/implementation.md](./feeds/implementation.md)

---

**Status:** Production Ready
**Owner:** DCYFR Labs
**License:** See [LICENSE.md](../../LICENSE.md)
