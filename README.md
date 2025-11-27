# Next.js Developer Blog & Portfolio

A modern, full-featured developer blog and portfolio built with Next.js (App Router), TypeScript, Tailwind CSS v4, and shadcn/ui. Features an MDX-powered blog with advanced analytics, GitHub integration, Redis-backed view counts, background job processing, and comprehensive security features.

**🤖 AI Contributors:**

- **Claude Code**: See [`.github/claude-instructions.md`](./.github/claude-instructions.md) for comprehensive development guide
- **GitHub Copilot**: See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for quick reference

## ✨ Features

- **📝 MDX Blog System** - Rich blog posts with syntax highlighting, table of contents, reading progress, and related posts
- **📊 Real-time Analytics** - View tracking, trending posts, milestone detection (powered by Redis + Inngest)
- **⚡ Background Jobs** - Asynchronous processing with Inngest (contact form, GitHub sync, analytics)
- **🔒 Security First** - CSP with nonces, rate limiting, input validation, secure headers
- **🎨 Modern UI** - Tailwind CSS v4, shadcn/ui components, dark mode, responsive design
- **🚀 Performance** - Server components, image optimization, edge caching, ISR
- **📈 GitHub Integration** - Contribution heatmap with real-time data
- **🔍 SEO Optimized** - Dynamic metadata, sitemap, RSS/Atom feeds, structured data

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI + CVA)
- **Content:** MDX with next-mdx-remote
- **Background Jobs:** Inngest
- **Database/Cache:** Redis (Upstash)
- **Email:** Resend
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics + Speed Insights
- **Monitoring:** Sentry (error tracking)

## 🚀 Quick Start

### Installation

```bash
# Clone and install
git clone <your-repo-url>
cd dcyfr-labs
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

Visit **http://localhost:3000** to see your site.

### HTTPS Development (Safari)

Safari on macOS requires HTTPS for certain APIs. Use the HTTPS dev server:

```bash
npm run dev:https
```

Visit **https://localhost:3000** (certificates auto-generated via mkcert).

See [`certs/README.md`](./certs/README.md) for certificate details.

## 📁 Project Structure

```
dcyfr-labs/
├── src/
│   ├── app/              # Next.js App Router (pages + API routes)
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui primitives
│   │   ├── layouts/     # Page and section layouts
│   │   └── sections/    # Reusable page sections
│   ├── content/blog/    # MDX blog posts
│   ├── data/            # Static data (projects, resume)
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   └── inngest/         # Background job functions
├── docs/                # Comprehensive documentation
├── public/              # Static assets
└── scripts/             # Build and test scripts
```

## 🎯 Key Architecture

### Page Layouts (Reusable Patterns)
- **`PageLayout`** - Universal page wrapper with consistent spacing
- **`ArchiveLayout`** - List pages (blog, projects) with filtering/pagination
- **`ArticleLayout`** - Individual content pages (blog posts)

### Metadata Generation
- **`createPageMetadata()`** - Standard page metadata
- **`createArchivePageMetadata()`** - List page metadata
- **`createArticlePageMetadata()`** - Blog post metadata

See [`/docs/architecture/`](./docs/architecture/) for detailed guides.

## 📝 Blog System

### Content Creation

Create MDX files in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Post description"
date: "2025-11-10"
tags: ["nextjs", "typescript"]
featured: true
draft: false
---

Your content here with full MDX support...
```

See [`/docs/blog/content-creation.md`](./docs/blog/content-creation.md) for complete guide.

### Blog Features
- ✅ Search and tag filtering
- ✅ Draft and archived post states
- ✅ Auto-generated table of contents
- ✅ Syntax highlighting (Shiki, dual-theme)
- ✅ Related posts algorithm
- ✅ Reading progress indicator
- ✅ View counts and trending detection
- ✅ RSS/Atom feeds (`/rss.xml`, `/atom.xml`)

## ⚡ Background Jobs (Inngest)

Asynchronous task processing with automatic retries:

- **Contact Form** - Send emails without blocking API response
- **GitHub Sync** - Refresh contribution data every 5 minutes
- **Blog Analytics** - Track views, calculate trending posts
- **Daily Summaries** - Automated analytics reports (midnight UTC)

**Dev UI:** http://localhost:3000/api/inngest

See [`/docs/features/inngest-integration.md`](./docs/features/inngest-integration.md) for setup.

## 🔒 Security Features

- **Content Security Policy (CSP)** - Nonce-based with zero `unsafe-inline`
- **Rate Limiting** - Redis-backed with in-memory fallback
- **Input Validation** - All API routes validated
- **Security Headers** - HSTS, X-Frame-Options, CSP, etc.
- **PII Protection** - Logs sanitized, no sensitive data exposure

See [`/docs/security/`](./docs/security/) for implementation details.

## 🌐 Deployment

### Vercel (Recommended)

1. Import this repo to Vercel
2. Configure environment variables (see [`.env.example`](./.env.example))
3. Deploy!

**Automatic Features on Vercel:**
- Edge caching and CDN
- Analytics and Speed Insights (already wired in `layout.tsx`)
- Automatic HTTPS
- Preview deployments for PRs

### Environment Variables

Required variables:
```bash
# Contact form
CONTACT_EMAIL=your-email@example.com
RESEND_API_KEY=re_...

# Blog analytics (optional)
REDIS_URL=redis://...

# GitHub integration (optional, increases rate limits)
GITHUB_TOKEN=ghp_...
GITHUB_USERNAME=your-username

# Inngest (optional for local dev)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

See [`/docs/platform/environment-variables.md`](./docs/platform/environment-variables.md) for complete reference.

## 📚 Documentation

Comprehensive docs in `/docs`:

| Topic | Primary Docs |
|-------|-------------|
| **Getting Started** | [`QUICK_START.md`](./docs/QUICK_START.md) |
| **Architecture** | [`/docs/architecture/`](./docs/architecture/) |
| **Blog System** | [`/docs/blog/architecture.md`](./docs/blog/architecture.md) |
| **Components** | [`/docs/components/`](./docs/components/) |
| **API Routes** | [`/docs/api/routes/overview.md`](./docs/api/routes/overview.md) |
| **Security** | [`/docs/security/`](./docs/security/) |
| **Features** | [`/docs/features/`](./docs/features/) |
| **Operations** | [`/docs/operations/todo.md`](./docs/operations/todo.md) |

## 🧪 Testing

**Current Status:** 1185/1197 tests passing (99.0%)

```bash
# Lint and type-check
npm run lint
npm run typecheck
npm run check             # Both lint + typecheck

# Run tests
npm run test              # Run all tests (Vitest)
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e          # End-to-end tests (Playwright)
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode

# Test UI
npm run test:ui           # Vitest UI
npm run test:e2e:ui       # Playwright UI
```

**Testing Infrastructure:**

- **Unit & Integration Tests:** Vitest + Testing Library
- **E2E Tests:** Playwright
- **Coverage:** 99.0% pass rate across 1197 tests
- **Test Documentation:** See [`/docs/testing/`](./docs/testing/)

## 🎨 Customization

### Update Site Content
- **Homepage**: `src/app/page.tsx`
- **About**: `src/app/about/page.tsx`
- **Projects**: `src/data/projects.ts`
- **Resume**: `src/data/resume.ts`

### Styling
- **Theme colors**: `src/app/globals.css`
- **Design tokens**: `src/lib/design-tokens.ts`
- **Tailwind config**: `tailwind.config.ts`

### Metadata
- **Global metadata**: `src/app/layout.tsx`
- **SEO routes**: `src/app/sitemap.ts`, `src/app/robots.ts`

---

**Built with:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Inngest, Redis, and ❤️
