# AI Contributor Guide

Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + MDX portfolio site.

**Status:** All major phases complete ✅ | Maintenance mode

## Quick Reference

**Commands**: `npm run dev` | `npm run build` | `npm run lint` | `npm run test`
**Alias**: `@/*` → `src/*` (always use)
**Hosting**: Vercel
**Tests**: 1185/1197 passing (99.0%)

## Architecture

```
src/
├── app/                    # App Router (server components default)
├── components/            
│   ├── about/              # About page components
│   ├── activity/           # Activity feed components  
│   ├── analytics/          # Analytics components
│   ├── blog/               # Blog components (barrel: index.ts)
│   ├── common/             # Shared components (barrel: index.ts)
│   ├── dashboard/          # Dashboard components
│   ├── features/           # Feature components (theme, comments, etc)
│   ├── home/               # Homepage components (barrel: index.ts)
│   ├── layouts/            # PageLayout, PageHero, ArchiveLayout, ArticleLayout
│   ├── navigation/         # SiteHeader, SiteFooter, etc (barrel: index.ts)
│   ├── projects/           # Project components (barrel: index.ts)
│   ├── resume/             # Resume components (barrel: index.ts)
│   ├── sections/           # Section components
│   └── ui/                 # shadcn/ui primitives
├── content/blog/           # MDX posts
├── data/                   # Typed data (posts, projects, resume)
├── lib/                    # Utilities, metadata, design-tokens
└── inngest/                # Background jobs
```

## Component Import Rules (CRITICAL)

**Always import from barrel files, never from root `@/components/`:**
```typescript
// ✅ CORRECT - import from organized subdirectories
import { PostList, BlogFilters } from "@/components/blog";
import { FeaturedPostHero } from "@/components/home";
import { SiteHeader, SiteFooter } from "@/components/navigation";
import { Logo, HighlightText } from "@/components/common";
import { PageLayout } from "@/components/layouts";

// ❌ WRONG - never import directly from components root
import { PostList } from "@/components/post-list";  // ORPHANED FILE
```

**Before editing any component:** Verify the file is exported from a barrel file (`index.ts` in its directory).

## Essential Patterns

| Task | Use |
|------|-----|
| New page | `PageLayout` + `createPageMetadata()` |
| List page | `ArchiveLayout` + `createArchivePageMetadata()` |
| Blog post | `ArticleLayout` + `createArticlePageMetadata()` |
| Styling | `cn()` from `@/lib/utils` |
| Components | `@/components/ui/*` (shadcn/ui) |

## Design System (MANDATORY)

**Before any UI changes:**
1. Search existing patterns: `src/components/layouts/`, `src/components/ui/`
2. Use design tokens from `@/lib/design-tokens.ts`
3. Never hardcode spacing/typography/colors

**Key tokens**: `SPACING`, `TYPOGRAPHY`, `HOVER_EFFECTS`, `CONTAINER_WIDTHS`

**Details**: See `/docs/ai/DESIGN_SYSTEM.md`

## Constraints (Do NOT change)

- Import alias (`@/*`)
- Tailwind + shadcn/ui
- MDX pipeline (rehype/remark)
- Error boundaries, skeleton patterns
- Security headers/CSP

## Documentation

| Domain | Location |
|--------|----------|
| Design system | `/docs/ai/DESIGN_SYSTEM.md` |
| Best practices | `/docs/ai/BEST_PRACTICES.md` |
| Token optimization | `/docs/ai/OPTIMIZATION_STRATEGY.md` |
| Architecture | `/docs/architecture/` |
| Security | `/docs/security/` |
| Operations | `/docs/operations/todo.md` |

## Context Optimization

**To preserve tokens:**
- Use `grep_search` before `read_file`
- Read docs by reference, not speculatively
- Batch parallel edits
- Trust tool outputs (don't re-read to verify)

**Token budgets:**
- Quick fixes: <20k tokens
- Features: <50k tokens
- Refactoring: <100k tokens

## Security Scanning

```bash
gh api /repos/dcyfr/dcyfr-labs/code-scanning/alerts/{id}
```

## MCP Servers (Chat)

Perplexity, Context, Playwright, Axiom, Filesystem, GitHub, Vercel, Sentry
