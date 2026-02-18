# Next.js Developer Blog & Portfolio

[![CI](https://img.shields.io/github/actions/workflow/status/dcyfr/dcyfr-labs/test.yml?branch=main&label=Tests&style=flat-square&logo=github)](https://github.com/dcyfr/dcyfr-labs/actions)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-92%2B-28a745?style=flat-square&logo=lighthouse&logoColor=white)](https://github.com/dcyfr/dcyfr-labs/actions/workflows/lighthouse-ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/dcyfr/dcyfr-labs/codeql.yml?branch=main&label=CodeQL&style=flat-square&logo=github)](https://github.com/dcyfr/dcyfr-labs/security/code-scanning)
[![Coverage](https://img.shields.io/badge/Coverage-96.7%25-28a745?style=flat-square&logo=vitest&logoColor=white)](./docs/testing/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://dcyfr-labs.vercel.app)

<a href="https://peerlist.io/dcyfr/project/dcyfr-labs" target="_blank" rel="noreferrer"><img src="https://peerlist.io/api/v1/projects/embed/PRJHJKNGMRMELKAQQ2ANMNEA7QRLNK?showUpvote=true&theme=dark" alt="DCYFR Labs on Peerlist" style="width: auto; height: 72px;" /></a>

A modern, full-featured developer blog and portfolio built with Next.js (App Router), TypeScript, Tailwind CSS v4, and shadcn/ui. Features an MDX-powered blog with advanced analytics, GitHub integration, Redis-backed view counts, background job processing, and comprehensive security features.

**🤖 AI Contributors:**

- **Claude Code**: See [`CLAUDE.md`](./CLAUDE.md) for comprehensive development guide (detailed patterns, workflows, documentation references)
- **GitHub Copilot**: See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for quick-reference guide (80/20 patterns you'll use most)
- **Transparency**: See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on open vs. proprietary components

## 🎯 Why dcyfr-labs?

**Not Just Another Next.js Starter** - This is a production-grade, **real-world application** with battle-tested patterns you can actually use.

### What Makes It Different

- **🏗️ Architecture First:** Design token system + PageLayout components = consistent, maintainable UI
- **📊 Real Analytics:** Redis-backed view tracking with trending detection (not just Google Analytics)
- **⚡ Background Jobs:** Inngest integration showing async patterns (contact forms, GitHub sync, analytics)
- **🔒 Enterprise Security:** CSP with nonces, rate limiting, input validation - production-ready from day one
- **🧪 Test-Driven:** 3176/3263 tests passing (97.3%), strict quality gates, comprehensive E2E coverage
- **📖 Documentation-Rich:** 100+ docs files covering architecture, testing, deployment, troubleshooting
- **🤖 AI-Assisted:** Built with Claude Code + GitHub Copilot - includes instructions for both

### vs. Next.js Starters

| Feature                   | Most Starters         | dcyfr-labs                                |
| ------------------------- | --------------------- | ----------------------------------------- |
| **Architecture Patterns** | Basic structure       | Design tokens + PageLayout system         |
| **Analytics**             | Google Analytics link | Redis + Inngest + trending detection      |
| **Security**              | Basic setup           | CSP nonces, rate limiting, PII protection |
| **Testing**               | Minimal               | 3176 tests (97.3% pass rate)              |
| **Background Jobs**       | None                  | Inngest with retry + monitoring           |
| **Documentation**         | README only           | 100+ docs covering everything             |
| **Production Ready**      | Template              | Real app, deployed at dcyfr.ai            |

### vs. Astro

- **React Ecosystem:** Full access to shadcn/ui, Radix UI, React 19 features
- **App Router:** Server components, streaming, ISR patterns
- **Type Safety:** TypeScript strict mode with Zod validation
- **Background Jobs:** Inngest for async processing (Astro requires external services)

**Perfect for:** Developers who want to learn modern Next.js patterns from a real, production-grade application.

## Table of Contents

<details>
<summary>📑 Table of Contents</summary>

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
  - [Installation](#installation)
  - [HTTPS Development (Safari)](#https-development-safari)
- [Project Structure](#-project-structure)
- [Key Architecture](#-key-architecture)
  - [Page Layouts](#page-layouts-reusable-patterns)
  - [Metadata Generation](#metadata-generation)
- [Blog System](#-blog-system)
  - [Content Creation](#content-creation)
  - [Blog Features](#blog-features)
- [Background Jobs (Inngest)](#-background-jobs-inngest)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Environment Variables](#environment-variables)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

</details>

## ✨ Features

- **📝 MDX Blog System** - Rich blog posts with syntax highlighting, table of contents, reading progress, and related posts
- **📊 Real-time Analytics** - View tracking, trending posts, milestone detection (powered by Redis + Inngest)
- **⚡ Background Jobs** - Asynchronous processing with Inngest (contact form, GitHub sync, analytics)
- **🔒 Security First** - CSP with nonces, rate limiting, input validation, secure headers
- **🎨 Modern UI** - Tailwind CSS v4, shadcn/ui components, dark mode, responsive design
- **🚀 Performance** - Server components, image optimization, edge caching, ISR
- **📈 GitHub Integration** - Contribution heatmap with real-time data
- **🔍 SEO Optimized** - Dynamic metadata, sitemap, RSS/Atom feeds, structured data
- **📡 Real-time Indexing (IndexNow)** - Instant URL submission pipeline with API + background processing

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

# Start development server (auto-populates cache)
npm run dev
```

Visit **http://localhost:3000** to see your site.

**✨ New:** Cache is now automatically populated when running `npm run dev`! GitHub Activity, Badge Wallet, and Skills Wallet will work immediately in local development.

### HTTPS Development (Safari)

Safari on macOS requires HTTPS for certain APIs. Use the HTTPS dev server:

```bash
npm run dev:https
```

Visit **https://localhost:3000** (certificates auto-generated via mkcert).

See [`certs/README.md`](./certs/README.md) for certificate details.

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

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
title: 'Your Post Title'
description: 'Post description'
date: '2025-11-10'
tags: ['nextjs', 'typescript']
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
- **GitHub Sync** - Refresh contribution data every hour
- **Blog Analytics** - Track views, calculate trending posts
- **Daily Summaries** - Automated analytics reports (midnight UTC)

**Dev UI:** http://localhost:3000/api/inngest

See [`/docs/features/inngest-integration.md`](./docs/features/inngest-integration.md) for setup.

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

## 🔒 Security Features

- **Content Security Policy (CSP)** - Nonce-based with zero `unsafe-inline`
- **Rate Limiting** - Redis-backed with in-memory fallback
- **Input Validation** - All API routes validated
- **Security Headers** - HSTS, X-Frame-Options, CSP, etc.
- **PII Protection** - Logs sanitized, no sensitive data exposure

See [`/docs/security/`](./docs/security/) for implementation details.

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

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

# IndexNow (real-time indexing)
INDEXNOW_API_KEY=<uuid-v4-key>

# Admin APIs (bulk re-submission endpoints)
ADMIN_API_KEY=<strong-random-token>
```

See [`/docs/platform/environment-variables.md`](./docs/platform/environment-variables.md) for complete reference.

## 📚 Documentation

Comprehensive docs in `/docs` ([TLP:CLEAR](./docs/security/tlp-classification-implementation.md) - publicly accessible):

| Topic               | Primary Docs                                                    |
| ------------------- | --------------------------------------------------------------- |
| **Getting Started** | [`QUICK_REFERENCE.md`](./docs/QUICK_REFERENCE.md)               |
| **Architecture**    | [`/docs/architecture/`](./docs/architecture/)                   |
| **Blog System**     | [`/docs/blog/architecture.md`](./docs/blog/architecture.md)     |
| **Components**      | [`/docs/components/`](./docs/components/)                       |
| **API Routes**      | [`/docs/api/routes/overview.md`](./docs/api/routes/overview.md) |
| **Security**        | [`/docs/security/`](./docs/security/)                           |
| **Features**        | [`/docs/features/`](./docs/features/)                           |
| **Operations**      | [`/docs/operations/todo.md`](./docs/operations/todo.md)         |

## 🧪 Testing

**Current Status:** 3176/3263 tests passing (97.3%)

```bash
# Lint and type-check
npm run lint
npm run typecheck
npm run check             # Both lint + typecheck

# Run tests
npm run test              # Run all tests (Vitest)
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e          # End-to-end tests (Playwright) - runs production build by default (to avoid dev overlay). Use npm run test:e2e:dev to run against dev server.
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode

# Test UI
npm run test:ui           # Vitest UI
npm run test:e2e:ui       # Playwright UI
```

**Testing Infrastructure:**

- **Unit & Integration Tests:** Vitest + Testing Library
- **E2E Tests:** Playwright
- **Coverage:** 96.7% pass rate across 1944 tests
- **Test Documentation:** See [`/docs/testing/`](./docs/testing/)

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

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

## 🔧 Troubleshooting

### Common Development Issues

**Issue: Dev server won't start (port 3000 in use)**

- **Cause:** Previous dev server still running or another process using port 3000
- **Solution:** Kill process: `lsof -ti:3000 | xargs kill -9` or use different port: `PORT=3001 npm run dev`
- **Alternative:** Use `npm run dev:fast` which may use a different port
- **Prevention:** Always stop dev server with Ctrl+C before closing terminal

**Issue: Tests fail locally but pass in CI**

- **Cause:** Environment differences (Redis unavailable, missing env vars, file path issues)
- **Solution:**
  1. Copy `.env.example` to `.env.local` and populate required values
  2. Run `npm run populate:cache` to warm Redis cache
  3. Restart dev server: `npm run dev`
  4. Run tests: `npm run test`
- **Verify:** Run `npm run check` (lint + typecheck) before pushing
- **Debug:** Check `.env.local` has `REDIS_URL`, `CONTACT_EMAIL`, `RESEND_API_KEY`

**Issue: Lighthouse CI fails with low performance score**

- **Cause:** Local dev server includes hot-reload overhead, not representative of production
- **Solution:** Run production build before Lighthouse: `npm run build && npm start`, then run Lighthouse
- **Threshold:** ≥90 performance, ≥95 accessibility, ≥95 best practices, 100 SEO
- **Debug:** Use Chrome DevTools Lighthouse to identify specific issues
- **Common fixes:** Optimize images, reduce bundle size, lazy load components

**Issue: Design token validation errors after component changes**

- **Cause:** Hardcoded spacing/typography/colors in components instead of design tokens
- **Solution:**
  1. Import design tokens: `import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens'`
  2. Replace hardcoded values: `p-4` → `p-[${SPACING.md}]`, `text-gray-900` → `text-[${SEMANTIC_COLORS.text.primary}]`
  3. Run validation: `npm run validate:design-tokens`
- **Tool:** Use design-tokens agent for automated fixing
- **Prevention:** Use design token ESLint rules (enabled in `.eslintrc.js`)

**Issue: MDX blog post not rendering**

- **Cause:** Invalid frontmatter or unsupported MDX syntax
- **Solution:**
  1. Run `npm run validate:frontmatter` to check YAML syntax
  2. Ensure required frontmatter fields: `title`, `date`, `tags` (array), `excerpt`
  3. Check date format: YYYY-MM-DD (e.g., `2026-02-02`)
  4. Verify tags is array: `tags: ['nextjs', 'typescript']` not `tags: nextjs, typescript`
- **Example:** See `src/content/blog/example-post.mdx` for proper frontmatter format
- **Debug:** Check browser console for MDX parsing errors

### Redis/Cache Issues

**Issue: View counts not updating**

- **Cause:** Redis connection failure or missing `REDIS_URL` environment variable
- **Solution:**
  1. Check `npm run redis:health` for connection status
  2. Verify Upstash Redis connection string in `.env.local`
  3. Test connection: `node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(console.log)"`
- **Fallback:** App works without Redis (analytics features disabled)
- **Alternative:** Use in-memory fallback (automatically enabled if Redis unavailable)

**Issue: GitHub activity heatmap blank**

- **Cause:** Cache miss or GitHub API rate limit exceeded
- **Solution:**
  1. Run `npm run populate:cache` to warm cache
  2. Set `GITHUB_TOKEN` in `.env.local` for higher rate limits (5000 req/hour vs 60 req/hour)
  3. Wait for rate limit reset (check headers in browser DevTools Network tab)
- **Dev:** Heatmap auto-populates on `npm run dev` (runs cache warmup script)
- **Production:** Inngest background job refreshes cache every 6 hours

### Build/Deployment Issues

**Issue: Vercel deployment fails**

- **Cause:** Missing environment variables or build errors
- **Solution:**
  1. Check Vercel dashboard logs for specific error
  2. Verify all env vars from `.env.example` are set in Vercel project settings
  3. Required: `CONTACT_EMAIL`, `RESEND_API_KEY`
  4. Optional: `REDIS_URL`, `GITHUB_TOKEN`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- **Test locally:** Run `npm run build` to catch build errors before deploying
- **Debug:** Use `vercel logs` command to see deployment logs

**Issue: Type errors after dependency update**

- **Cause:** Breaking changes in `@dcyfr/ai` or other dependencies
- **Solution:**
  1. Run `npm run typecheck` to see all type errors
  2. Check `CHANGELOG.md` in updated package for migration guide
  3. Update imports and API usage to match new types
- **Tool:** Use `npm outdated` to see which packages have new versions
- **Prevention:** Review changelogs before updating dependencies

**Issue: Inngest functions not triggering**

- **Cause:** Inngest dev server not running or missing signing keys
- **Solution:**
  1. Start Inngest dev server: `npx inngest-cli@latest dev`
  2. Verify Inngest dashboard shows functions registered (http://localhost:8288)
  3. Check `.env.local` has `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
  4. Trigger function manually from Inngest dashboard to test
- **Debug:** Check `src/inngest/functions/` for function definitions
- **Logs:** View function logs in Inngest dashboard

### Safari/HTTPS Issues

**Issue: Safari APIs not working (clipboard, etc.)**

- **Cause:** Safari requires HTTPS for certain Web APIs, even on localhost
- **Solution:** Use HTTPS dev server: `npm run dev:https` (auto-generates certs via mkcert)
- **Access:** Visit https://localhost:3000 (note HTTPS protocol)
- **Trust cert:** First run may require trusting self-signed certificate
- **Alternative:** Test in Chrome/Firefox for development, Safari only for final testing

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

## 📚 FAQ

**Q: How do I create a new blog post?**

A: Create MDX file in `src/content/blog/my-post-slug.mdx` with proper frontmatter:

```yaml
---
title: 'My Post Title'
date: '2026-02-02'
tags: ['nextjs', 'typescript']
excerpt: 'Brief description of the post'
---
```

Then write content in MDX (Markdown + JSX). See [blog/README.md](./src/content/blog/README.md) for detailed guide.

**Q: What's the difference between Claude Code and GitHub Copilot agents?**

A: **Claude Code** uses agents in `.claude/agents/` (65+ specialized agents for complex refactoring, architecture, testing). **GitHub Copilot** uses `.github/copilot-instructions.md` for inline suggestions and quick-reference patterns. Use Claude for complex tasks, Copilot for day-to-day coding.

**Q: How do I add a new page with proper SEO?**

A: Use `PageLayout` component + `createPageMetadata()` helper:

```tsx
import { PageLayout } from '@/components/layouts/PageLayout';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'About',
  description: 'About this site',
});

export default function AboutPage() {
  return (
    <PageLayout>
      <h1>About</h1>
    </PageLayout>
  );
}
```

See `src/app/about/page.tsx` for complete example.

**Q: Can I use emojis in blog posts or public-facing content?**

A: **No.** Emojis are prohibited in public-facing content for accessibility and professionalism. Use React icons from `lucide-react` instead. See [DCYFR.agent.md - Never Use Emojis](./.github/agents/DCYFR.agent.md) for policy.

**Q: How do I run tests for a specific component?**

A: Use path filtering:

```bash
npm run test src/components/MyComponent/__tests__
npm run test:watch  # Interactive mode with filtering
npm run test:ui     # Vitest UI for visual test running
```

**Q: What's the AI fallback strategy when Claude Code rate limits?**

A: Use **OpenCode.ai** with cost-effective providers (Groq, Ollama). See [opencode-fallback-architecture.md](./docs/ai/opencode-fallback-architecture.md). Run `npm run ai:opencode` to generate OpenCode configuration from Claude agents.

**Q: How do I test API routes locally?**

A: Use the built-in test utilities:

```bash
npm run test src/app/api  # Run all API route tests
```

Or test manually with curl/Postman:

```bash
curl http://localhost:3000/api/contact -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","message":"Hello"}'
```

**Q: Why are some tests failing in CI but passing locally?**

A: Common causes:

1. **Environment variables:** CI may not have `.env.local` values (check GitHub Secrets)
2. **Redis:** CI may not have Redis instance (tests should mock or skip Redis-dependent tests)
3. **Timezones:** Date/time tests may fail due to timezone differences (use UTC in tests)
4. **File paths:** Windows vs. Unix path separators (use `path.join()` instead of string concatenation)

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

## 📊 Performance Benchmarks

### Production Metrics

- **Lighthouse Score:** 92+ (Performance 90+, Accessibility 95+, Best Practices 95+, SEO 100)
- **Core Web Vitals:**
  - **LCP (Largest Contentful Paint):** <2.5s
  - **INP (Interaction to Next Paint):** <200ms
  - **CLS (Cumulative Layout Shift):** <0.1
- **Bundle Size:** ~450KB initial JS (Next.js production build)
- **Test Suite:** 3176/3263 passing (97.3%, goal: ≥95%)

### Build Performance

- **Clean build:** ~45s
- **Incremental build:** ~10s
- **Test suite:** ~46s
- **Type check:** ~15s

### Runtime Performance

- **First paint:** <1s
- **Time to interactive:** <2s
- **API response time:** <100ms (avg)
- **Cache hit rate:** ~85% (Redis)

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

## 🔒 Security

### Reporting Vulnerabilities

Found a security issue? Report it privately:

- **GitHub Security Advisories:** [dcyfr-labs/security](https://github.com/dcyfr/dcyfr-labs/security/advisories/new)
- **Security.md:** See [SECURITY.md](./SECURITY.md) for full policy

### Security Features

- **Content Security Policy:** Nonce-based CSP with zero `unsafe-inline`
- **Rate Limiting:** Redis-backed with in-memory fallback (100 requests/15min per IP)
- **Input Validation:** Zod schemas on all API routes
- **Security Headers:** HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- **PII Protection:** Logs sanitized, no sensitive data exposure
- **Dependency Scanning:** Dependabot + CodeQL + npm audit
- **External Scanning:** Nuclei on deploy + daily schedule

See [docs/security/](./docs/security/) for implementation details.

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

## ⚙️ Known Issues / Limitations

### Current Limitations

- **Safari HTTPS requirement:** Some APIs require HTTPS (use `npm run dev:https` for Safari testing)
- **Redis optional but recommended:** App works without Redis, but analytics features disabled
- **Test pass rate:** 3176/3263 (97.3%) - remaining failures under investigation (goal: ≥99%)
- **Node.js version:** Requires ≥24.13.0 (uses native fetch, modern APIs)
- **Bundle size:** ~450KB initial JS (monitoring in progress, goal: <400KB)

### Tracked Issues

- [ ] Lighthouse CI occasional flakiness on CI (network throttling sensitivity)
- [ ] GitHub Activity heatmap rate limits (mitigated with `GITHUB_TOKEN`)
- [ ] Test coverage gaps in legacy components (incremental improvement ongoing)
- [ ] Design token migration incomplete (80% complete, 20% hardcoded values remain)

See [docs/operations/todo.md](./docs/operations/todo.md) for current priorities.

[⬆️ Back to top](#nextjs-developer-blog--portfolio)

---

## 📄 License & Sponsorship

**License:** MIT (code) + CC BY-SA 4.0 (docs) + Proprietary (DCYFR specs)

**Code:** MIT License for personal/non-commercial use. Commercial use requires paid tier.
**Documentation:** CC BY-SA 4.0 (docs/ directory) - Share with attribution.
**DCYFR Specs:** Proprietary - View only, commercial use restricted.

### Sponsorship Tiers

Support DCYFR development and gain exclusive access:

- 🌍 **Community** ($5/mo) - Signal community access (DCYFR.NET, Quantum Flux)
- 💚 **Sponsors** ($10/mo) - Your bio on dcyfr.ai website + private channels
- 👨‍💻 **Developer** ($20/mo) - Limited commercial license + pre-release + portfolio support
- 🚀 **Founder** ($2,400/yr) - Full commercial license + 1hr consultation/mo
- 💼 **Executive** ($4,800/yr) - Business license + 2hr consultation/mo
- 🏢 **Enterprise** ($9,600/yr) - Enterprise license + 4hr consultation/mo + SLA

**Learn more:** [LICENSE.md](./LICENSE.md) | [SPONSORS.md](../SPONSORS.md)
**Join:** [GitHub Sponsors](https://github.com/sponsors/dcyfr)
**Contact:** licensing@dcyfr.ai

**Trademark:** "DCYFR" is a trademark of DCYFR Labs. See [TRADEMARK.md](../TRADEMARK.md)

---

**Built with:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Inngest, Redis, and ❤️
