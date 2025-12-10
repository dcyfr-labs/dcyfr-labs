# Claude Code Instructions

Full-stack developer portfolio with Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, MDX blog, GitHub integration, and Redis analytics. Optimized for server-first rendering, type safety, and maintainable architecture.

> **For GitHub Copilot users:** See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for a concise quick-reference guide focusing on the 80/20 patterns you'll use most.

## Current Focus (December 2025)

**All major phases complete** ✅

Project is in **maintenance mode** with data-driven enhancements.

**Key Metrics** (see [`docs/operations/todo.md`](docs/operations/todo.md)):

- ✅ Phase 1-4 complete
- ✅ 1185/1197 passing (99.0%)
- ✅ 198 integration tests
- ✅ All Core Web Vitals monitored
- ✅ Zero security vulnerabilities
- ✅ SEO foundation complete

**Active Work:** Dependency maintenance, backlog prioritization

## Quick Reference

**Stack**: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + MDX
**Commands**: `npm run dev` • `npm run build` • `npm run lint` • `npm run test`
**Imports**: Always use `@/*` alias (never relative paths)

## Essential Patterns

**Layouts** (`src/components/layouts/`):

- Use `PageLayout` for all pages
- Use `PageHero` for hero sections
- Use `ArchiveLayout` for list pages
- Use `ArticleLayout` for blog posts

**Metadata** (`src/lib/metadata.ts`):
- `createPageMetadata()` for standard pages
- `createArchivePageMetadata()` for list pages
- `createArticlePageMetadata()` for blog posts

**Design Tokens** (`src/lib/design-tokens.ts`):
- Import `SPACING`, `TYPOGRAPHY`, `CONTAINER_WIDTHS`
- Never hardcode spacing or typography

## Design System Rules (MANDATORY)

**Before creating/modifying UI components:**

1. **Search for existing patterns** (use Grep/Glob)
2. **Check design tokens** in `src/lib/design-tokens.ts`
3. **Reuse components** from `layouts/` and `ui/`

**Always use:**
- ✅ `TYPOGRAPHY.h1.standard` for headings
- ✅ `SPACING.content` for spacing
- ✅ Semantic colors: `bg-card`, `text-primary`
- ✅ `PageLayout`, `PageHero` for layouts

**Never use:**
- ❌ Hardcoded spacing: `space-y-6`, `gap-8`, `p-7`
- ❌ Inline typography: `text-3xl font-semibold`
- ❌ Hardcoded colors: `bg-white dark:bg-gray-900`
- ❌ Duplicate existing components

**Automated Enforcement:**

- ✅ ESLint catches spacing/typography violations (warnings in real-time)
- ✅ Pre-commit hooks prevent violations from being committed
- ✅ GitHub Actions validate PRs and post violation reports
- ✅ Validation script: `node scripts/validate-design-tokens.mjs`
- ✅ VS Code snippets: Type `dt` + Tab for design token shortcuts

**See [`docs/ai/DESIGN_SYSTEM.md`](docs/ai/DESIGN_SYSTEM.md) for comprehensive validation checklist**

## Key Constraints

**Do NOT change without discussion:**
- UI framework (Tailwind + shadcn/ui)
- Import alias (`@/*`)
- SEO routes (`sitemap.ts`, `robots.ts` location)
- MDX pipeline
- Design tokens
- Test coverage (maintain ≥94%)

## Workflow Guidelines

**Starting a session:**

1. Check [`docs/operations/todo.md`](docs/operations/todo.md) for priorities
2. Review recent commits: `git log --oneline -5`
3. Run tests: `npm run test`

**During implementation:**

1. Use TodoWrite for multi-step tasks
2. Follow existing patterns (layouts, metadata, design tokens)
3. Maintain test coverage
4. Be token-conscious (see optimization guide)

**Completing work:**

1. ✅ TypeScript compiles (`npm run typecheck`)
2. ✅ All tests pass (`npm run test`)
3. ✅ Lint passes (`npm run lint`)
4. ✅ Design tokens used (no hardcoded values)
5. Update `todo.md` and `done.md`

## Documentation

**Comprehensive guides** (load only when needed):

- [`docs/ai/BEST_PRACTICES.md`](docs/ai/BEST_PRACTICES.md) - Workflow best practices
- [`docs/ai/DESIGN_SYSTEM.md`](docs/ai/DESIGN_SYSTEM.md) - Complete design validation
- [`docs/ai/OPTIMIZATION_STRATEGY.md`](docs/ai/OPTIMIZATION_STRATEGY.md) - Token optimization
- [`docs/ai/CLAUDE_CODE_SETUP.md`](docs/ai/CLAUDE_CODE_SETUP.md) - Claude Code integration setup

**Domain-specific docs:**

- `/docs/architecture/` - Patterns, migration guides
- `/docs/design/` - Design system enforcement
- `/docs/testing/` - Test infrastructure
- `/docs/features/` - Feature guides
- `/docs/operations/` - Todo system, done.md

## Token Optimization

**Be conscious of context window usage:**

- Use **Grep** instead of Read for searching
- Read files **only when editing** them
- Load detailed docs **only when needed**
- Use agents **judiciously** (prefer direct tools)

**Typical budgets:**
- Quick fix: <20k tokens
- Feature: <50k tokens
- Refactoring: <100k tokens

See [`docs/ai/OPTIMIZATION_STRATEGY.md`](docs/ai/OPTIMIZATION_STRATEGY.md) for details.

## CI/CD

**All PRs must pass:**

- ESLint (0 errors)
- TypeScript compilation
- Tests (≥99% pass rate, 1339/1346 passing)
- Lighthouse CI (≥90% perf, ≥95% a11y)

**GitHub Actions:**

- CodeQL security scanning (daily)
- Dependabot auto-merge
- Test suite on PR
- Lighthouse CI on deploy

## MCP Servers (Chat)


- Context7 (library documentation)
- Playwright (browser automation, E2E testing)
- Axiom (log queries, monitoring)
- Filesystem, GitHub, Vercel, Sentry

*Note: Memory and Sequential Thinking MCPs removed Dec 2025 - replaced by native Claude/Copilot capabilities and built-in memory tools.*

---

**For quick tasks**: Use this guide + design tokens
**For complex tasks**: Load relevant detailed guides from `/docs/ai/`
**For Phase 4 work**: See [`docs/operations/PHASE_4_GUIDE.md`](docs/operations/PHASE_4_GUIDE.md)
