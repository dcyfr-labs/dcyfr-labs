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
├── components/layouts/     # PageLayout, PageHero, ArchiveLayout, ArticleLayout
├── components/ui/          # shadcn/ui primitives
├── content/blog/           # MDX posts
├── data/                   # Typed data (posts, projects, resume)
├── lib/                    # Utilities, metadata, design-tokens
└── inngest/                # Background jobs
```

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
gh api /repos/dcyfr/cyberdrew-dev/code-scanning/alerts/{id}
```

## MCP Servers (Chat)

Memory, Sequential Thinking, Context7, Sentry, Vercel, GitHub
