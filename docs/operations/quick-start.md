<!-- TLP:CLEAR -->
{/_ TLP:CLEAR _/}

# Quick Start Guide

**Purpose:** Single entry point for all quick-reference documentation across the project.
**Information Classification:** TLP:CLEAR (Public)

---

## 🚀 Getting Started

Welcome! This guide helps you quickly find what you need across the documentation.

### First Time Setup

**Start here:** [Environment Variables](./platform/environment-variables)
Set up your `.env.local` to get the dev server running.

```bash
cp .env.example .env.local
npm run dev
```

---

## 📑 Documentation by Topic

### Components & UI

Quick references for all reusable components:

| Component                 | Purpose                                       | Quick Ref                                                      |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| **About Page Components** | Avatar, stats, skills, certifications         | [about-page-components.md](./components/about-page-components) |
| **Post Badges**           | Status indicators (Draft, Archived, New, Hot) | [post-badges.md](./components/post-badges)                     |
| **Error Boundaries**      | Error handling for async components           | [error-boundaries.md](./components/error-boundaries)           |
| **Loading States**        | Skeleton loaders and loading indicators       | [loading-states.md](./components/loading-states)               |
| **Related Posts**         | Algorithm for finding related blog content    | [related-posts.md](./components/related-posts)                 |
| **Table of Contents**     | Auto-generated navigation for blog posts      | [table-of-contents.md](./components/table-of-contents)         |
| **Reading Progress**      | Visual reading progress indicator             | [reading-progress.md](./components/reading-progress)           |
| **Syntax Highlighting**   | Code block highlighting with Shiki            | [syntax-highlighting.md](./components/syntax-highlighting)     |
| **Blog Search Form**      | Search and filter blog posts                  | [blog-search-form.md](./components/blog-search-form)           |
| **GitHub Heatmap**        | Contribution graph visualization              | [github-heatmap.md](./components/github-heatmap)               |
| **MDX Components**        | MDX rendering and custom components           | [mdx.md](./components/mdx)                                     |
| **Giscus Comments**       | GitHub-based comments system                  | [giscus-comments.md](./components/giscus-comments)             |
| **Share Buttons**         | Social sharing functionality                  | [share-buttons.md](./components/share-buttons)                 |
| **Post List**             | Rendering lists of blog posts                 | [post-list.md](./components/post-list)                         |
| **Blog Post Skeleton**    | Loading skeleton for post pages               | [blog-post-skeleton.md](./components/blog-post-skeleton)       |
| **Logo**                  | Site logo component                           | [logo.md](./components/logo)                                   |

**All components docs:** [`/docs/components/`](./components/)

### Blog System

Quick references for blog content and features:

| Topic                  | Purpose                      | Doc                                                     |
| ---------------------- | ---------------------------- | ------------------------------------------------------- |
| **Architecture**       | Blog system design overview  | [blog/architecture.md](./blog/architecture)             |
| **Quick Reference**    | Common blog tasks            | [blog/quick-reference.md](./blog/quick-reference)       |
| **Content Creation**   | Writing and publishing posts | [blog/content-creation.md](./blog/content-creation)     |
| **MDX Processing**     | MDX pipeline and plugins     | [blog/mdx-processing.md](./blog/mdx-processing)         |
| **Frontmatter Schema** | Post metadata reference      | [blog/frontmatter-schema.md](./blog/frontmatter-schema) |

**All blog docs:** [`/docs/blog/`](./blog/)

### Platform & Configuration

Quick references for project setup and configuration:

| Topic                     | Purpose                | Doc                                                                   |
| ------------------------- | ---------------------- | --------------------------------------------------------------------- |
| **Environment Variables** | All env vars and setup | [platform/environment-variables.md](./platform/environment-variables) |
| **Site Configuration**    | Domain and URL setup   | [platform/site-config.md](./platform/site-config)                     |
| **View Counts**           | Blog analytics setup   | [platform/view-counts.md](./platform/view-counts)                     |

**All platform docs:** [`/docs/platform/`](./platform/)

### Security

Quick references for security features and best practices:

| Topic                  | Purpose                       | Doc                                                                         |
| ---------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **CSP Implementation** | Content Security Policy setup | [security/csp/nonce-implementation.md](./security/csp/nonce-implementation) |
| **Rate Limiting**      | API rate limiting guide       | [security/rate-limiting/guide.md](./security/rate-limiting/guide)           |

**All security docs:** [`/docs/security/`](./security/)

### API Routes

Quick references for API endpoints:

| Route                    | Purpose                     | Doc                                                                     |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------- |
| **API Overview**         | All routes and architecture | [api/routes/overview.md](./api/routes/overview)                         |
| **Contact Endpoint**     | Contact form API            | [api/routes/contact.md](./api/routes/contact)                           |
| **GitHub Contributions** | Heatmap data endpoint       | [api/routes/github-contributions.md](./api/routes/github-contributions) |

**All API docs:** [`/docs/api/`](./api/)

### Features

Detailed guides for major features:

| Feature                 | Purpose                           | Doc                                                               |
| ----------------------- | --------------------------------- | ----------------------------------------------------------------- |
| **GitHub Integration**  | Heatmap and contribution tracking | [features/github-integration.md](./features/github-integration)   |
| **Inngest Integration** | Background jobs and async tasks   | [features/inngest-integration.md](./features/inngest-integration) |
| **OG Image Generation** | OpenGraph image automation        | [features/og-image-generation.md](./features/og-image-generation) |
| **Analytics Dashboard** | Analytics and metrics             | [features/analytics-dashboard.md](./features/analytics-dashboard) |

**All feature docs:** [`/docs/features/`](./features/)

### Design & UX

Quick references for design patterns and styling:

| Topic                | Purpose                    | Doc                                         |
| -------------------- | -------------------------- | ------------------------------------------- |
| **Typography**       | Font and text styling      | [design/typography.md](./design/typography) |
| **Print Stylesheet** | Print-specific styles      | design/print-stylesheet.md                  |
| **Color Contrast**   | Accessibility improvements | design/color-contrast-improvements.md       |

**All design docs:** [`/docs/design/`](./design/)

### Project Management

Guides for project organization and operations:

| Topic              | Purpose                             | Doc                |
| ------------------ | ----------------------------------- | ------------------ |
| **Current Work**   | Active tasks and priorities         | operations/todo.md |
| **Completed Work** | Historical record of finished items | operations/done.md |

**All operations docs:** [`/docs/operations/`](./operations/)

---

## 🔍 Find by Use Case

### I need to...

**Add a new component**

1. Check existing components: [`/docs/components/`](./components/)
2. Copy similar component pattern
3. Add TypeScript types
4. Add JSDoc comments
5. Add error boundary wrapper

**Write a blog post**

1. Read [Content Creation Guide](./blog/content-creation)
2. Check [Frontmatter Schema](./blog/frontmatter-schema)
3. Review [MDX Processing](./blog/mdx-processing) for available features
4. Create file in `src/content/blog/`

**Set up environment variables**

1. Read [Environment Variables](./platform/environment-variables)
2. Copy `.env.example` to `.env.local`
3. Add credentials as needed

**Deploy to production**

1. Check [Environment Variables](./platform/environment-variables) for production config
2. Check [Site Configuration](./platform/site-config) for domain setup
3. Check Deployment Guide for pre-flight checklist

**Fix an error**

1. Check [Error Boundaries](./components/error-boundaries)
2. Review component's quick reference
3. Check [API Routes](./api/routes/overview) if API-related
4. Check security docs if security-related

**Improve performance**

1. Read Bundle Analysis
2. Check specific component docs
3. Review [GitHub Integration](./features/github-integration) (has caching)

**Style something**

1. Check [Typography](./design/typography)
2. Check Color Contrast
3. Check Print Stylesheet for print styles

**Debug API issues**

1. Check [API Overview](./api/routes/overview)
2. Check specific endpoint documentation
3. Check [Rate Limiting](./security/rate-limiting/guide)
4. Check [Environment Variables](./platform/environment-variables) for missing config

**Understand a feature**

1. Check [Features](./features/) directory
2. Check related component docs
3. Check API route docs if backend-heavy

---

## 📚 Full Directory Structure

```
/docs/
├── README.md                        (Overview - start here)
├── QUICK_START.md                  (This file - quick lookup)
├── INDEX.md                        (Full navigation index)
├── deployment-guide.md             (Deployment checklist)
├──
├── api/                            (API Documentation)
│   ├── routes/
│   │   ├── overview.md
│   │   ├── contact.md
│   │   └── github-contributions.md
│   └── reference.md
├──
├── blog/                           (Blog System)
│   ├── architecture.md
│   ├── quick-reference.md
│   ├── content-creation.md
│   ├── mdx-processing.md
│   └── frontmatter-schema.md
├──
├── components/                     (UI Components)
│   ├── post-badges.md
│   ├── error-boundaries.md
│   ├── loading-states.md
│   ├── related-posts.md
│   ├── table-of-contents.md
│   ├── reading-progress.md
│   ├── syntax-highlighting.md
│   ├── blog-search-form.md
│   ├── github-heatmap.md
│   ├── mdx.md
│   ├── giscus-comments.md
│   ├── share-buttons.md
│   ├── post-list.md
│   ├── blog-post-skeleton.md
│   └── logo.md
├──
├── design/                         (Design & UX)
│   ├── typography.md
│   ├── print-stylesheet.md
│   └── color-contrast-improvements.md
├──
├── features/                       (Major Features)
│   ├── github-integration.md
│   ├── inngest-integration.md
│   ├── og-image-generation.md
│   └── analytics-dashboard.md
├──
├── mcp/                            (MCP Servers)
│   ├── quick-reference.md
│   ├── servers.md
│   └── tests/
├──
├── operations/                     (Project Management)
│   ├── todo.md
│   ├── done.md
│   └── automation-backlog.md
├──
├── platform/                       (Configuration)
│   ├── environment-variables.md
│   ├── site-config.md
│   └── view-counts.md
├──
├── performance/                    (Performance)
│   └── bundle-analysis.md
├──
├── security/                       (Security)
│   ├── csp/
│   │   └── nonce-implementation.md
│   └── rate-limiting/
│       └── guide.md
├──
├── seo/                           (SEO)
├── rss/                           (RSS/Feeds)
├── ai/                            (AI/Research)
│   └── discovery/
└── archive/                       (Completed Work)
    ├── csp-implementation-complete.md
    └── ... (historical implementations)
```

---

## 💡 Tips

- **New to project?** Start with [README.md](./readme) overview
- **Looking for something specific?** Use [INDEX.md](./index) for full navigation
- **Quick lookup?** Use this page (QUICK_START.md)
- **Details on a component?** Check its doc in [`/docs/components/`](./components/)
- **Writing a post?** Go to [Content Creation](./blog/content-creation)
- **Deploying?** Check Deployment Guide

---

## 🔗 Related

- **Source Code:** See comments and JSDoc in component files
- **Examples:** Check blog posts in `src/content/blog/`
- **Tests:** See `scripts/test-*.mjs` for implementation examples

---

**Last Updated:** October 27, 2025
**Consolidated documentation** from operations/ for easier navigation and maintenance.
