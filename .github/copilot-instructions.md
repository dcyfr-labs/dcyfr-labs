# AI contributor guide for this repo

Full-stack developer portfolio with Next.js 15 App Router, TypeScript, Tailwind v4, shadcn/ui, MDX blog, GitHub integration, and Redis analytics. Optimized for server-first rendering, type safety, and maintainable architecture.

## AI Tool Context

**GitHub Copilot CLI Agent (Terminal)**: Task execution — runs commands, edits files, validates changes. Use for "do this task" workflows requiring investigation → implementation → testing.

**VS Code Copilot Chat (IDE)**: Learning & exploration — explains code, suggests patterns, generates snippets. Use for "help me understand/write this" workflows.

Both tools share these instructions but optimize differently: CLI focuses on actionable patterns and validation; Chat emphasizes architectural context and learning resources.

## GitHub Security Code Scanning Alerts

When asked to check or verify GitHub security code scanning alerts (URLs like `https://github.com/{owner}/{repo}/security/code-scanning/{alert_number}`):

**Approach**: Use GitHub API directly via terminal since the GitHub MCP server doesn't have dedicated code scanning tools.

**Available API Endpoints**:
- `GET /repos/{owner}/{repo}/code-scanning/alerts` — List all alerts
- `GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}` — Get specific alert
- `PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}` — Update alert (dismiss/reopen)

**Verification Workflow**:
1. Extract owner, repo, and alert number from URL
2. Use `gh api` command to fetch alert details:
   ```bash
   gh api /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}
   ```
3. Check `state` field: `open`, `closed`, `dismissed`, or `fixed`
4. If alert returns 404, it has been deleted/resolved
5. Validate with `npm audit` for dependency-related alerts

**Example Commands**:
```bash
# Get specific alert
gh api /repos/dcyfr/cyberdrew-dev/code-scanning/alerts/2

# List all alerts (with state filter)
gh api /repos/dcyfr/cyberdrew-dev/code-scanning/alerts --jq '.[] | {number, state, rule: .rule.id}'

# Check if dependency exists
npm ls @package/name
```

**Key Response Fields**:
- `number` — Alert ID
- `state` — Current status (open/closed/dismissed/fixed)
- `rule.id` — Vulnerability identifier
- `most_recent_instance.location` — File/line where issue exists
- `dismissed_reason` — Why alert was dismissed (if applicable)

## Stack & Commands

**Core**: Next.js 16 + React 19 + TypeScript (strict) + Tailwind v4 + shadcn/ui + MDX
**Data**: Redis (optional), Inngest (background jobs)
**Dev**: `npm run dev` (Turbopack) → localhost:3000
**Build**: `npm run build` • **Start**: `npm start` • **Lint**: `npm run lint`
**Hosting**: Vercel (analytics auto-enabled in `layout.tsx`)

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── <segment>/page.tsx  # Routes (server components default)
│   ├── api/               # API routes with rate limiting
│   │   ├── contact/       # Form submission (Inngest)
│   │   ├── github-contributions/  # Cached GitHub data
│   │   └── inngest/       # Background job handler
│   ├── layout.tsx         # Root layout (theme, toaster, analytics)
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # SEO config
├── components/
│   ├── layouts/           # Reusable page patterns (see below)
│   └── ui/                # shadcn/ui primitives
├── content/blog/          # MDX posts with frontmatter
├── data/                  # Typed data (posts, projects, resume)
├── lib/                   # Utilities, metadata, design tokens
└── inngest/               # Background job functions
```

**Import alias**: `@/*` → `src/*` (always use, avoid relative paths)

## Reusable Patterns

**Layout Components** (`src/components/layouts/`):
- `PageLayout` — Universal page wrapper with width/spacing constraints
- `PageHero` — Hero sections with style variants
- `ArchiveLayout` — List pages with filters/pagination (blog, projects)
- `ArticleLayout` — Individual content pages (blog posts)

**Metadata Helpers** (`src/lib/metadata.ts`):
- `createPageMetadata()` — Standard pages
- `createArchivePageMetadata()` — List/archive pages
- `createArticlePageMetadata()` — Blog posts
- `createCollectionSchema()` — JSON-LD structured data

**Design Tokens** (`src/lib/design-tokens.ts`):
- `PAGE_LAYOUT` — Container widths, spacing patterns
- `ARCHIVE_LAYOUT` — Grid and pagination spacing
- `ARTICLE_LAYOUT` — Typography and content spacing

**Quick Reference**:
- New page → `PageLayout` + `createPageMetadata()`
- List page → `ArchiveLayout` + `createArchivePageMetadata()`
- Blog post → `ArticleLayout` + `createArticlePageMetadata()`
- Deep dive → See `/docs/architecture/` for migration guides and examples

## Key Features

**Blog System** (`src/content/blog/` + `src/lib/blog.ts`):
- MDX with frontmatter (draft/archived/featured flags)
- Server-side rendering with `next-mdx-remote/rsc`
- Syntax highlighting (Shiki dual-theme)
- Search/filtering, ToC, related posts, reading progress
- Redis view counts (fallback to memory)
- See `/docs/blog/` for content creation guide

**Background Jobs** (Inngest at `/api/inngest`):
- Contact form emails, GitHub sync, blog analytics
- Use for operations >500ms or requiring retries
- Dev UI at `localhost:3000/api/inngest`
- See `/docs/features/inngest-integration.md`

**GitHub Integration** (`/api/github-contributions`):
- Contribution heatmap with 5-min cache
- Rate limiting: 10 req/min per IP
- Optional `GITHUB_TOKEN` env (60 → 5k req/hr limit boost)

**Security**:
- Nonce-based CSP (`src/proxy.ts`)
- Redis rate limiting on public APIs
- Input validation + error boundaries
- See `/docs/security/` for implementation details

## Conventions

**Styling**: Tailwind utilities only; use `cn()` from `@/lib/utils` to merge classes
**UI Components**: shadcn/ui in `@/components/ui/*` (Button, Card, Badge, Skeleton, etc.)
**Client Components**: Add `"use client"` only when needed for interactivity
**Error Handling**: Wrap async features in error boundaries (`*-error-boundary.tsx`)
**Loading States**: Provide skeleton loaders (`*-skeleton.tsx`)
**Data Layer**:
- `@/data/posts.ts` — Blog posts (computed from MDX)
- `@/data/projects.ts` — Project listings
- `@/data/resume.ts` — Resume data
**API Routes**: Validate inputs, use `NextResponse`, implement rate limiting
**Forms**: Client pages POST to API routes, use `sonner` for toast feedback

## Task Tracking

**Persistent**: `docs/operations/todo.md` (active work) + `done.md` (completed history)
**Session**: Use in-memory todo tool for multi-step tasks within a conversation
**Workflow**: 
1. Check `todo.md` for existing tasks
2. Create session list for current work using manage_todo_list tool
3. Update both files on completion (session → persistent)
4. Archive completed items to `done.md`

## Documentation

All docs in `/docs/` organized by domain:
- `/docs/architecture/` — Patterns, migration guides, examples
- `/docs/blog/` — Content creation, MDX pipeline, frontmatter schema
- `/docs/components/` — Component API docs with JSDoc
- `/docs/api/` — API routes, rate limiting, error handling
- `/docs/features/` — Feature guides (Inngest, GitHub integration)
- `/docs/security/` — CSP, rate limiting, security patterns
- `/docs/operations/` — Todo system, environment setup
- `/docs/platform/` — Vercel config, domain setup, analytics

**For Chat**: Explore these for learning context and architectural decisions
**For CLI**: Reference specific docs when implementing features or debugging

## Constraints

**Do NOT change without discussion**:
- UI library/CSS framework (stick to Tailwind + shadcn/ui)
- Import alias pattern (always use `@/*`)
- SEO routes location (`sitemap.ts`, `robots.ts` in `src/app/`)
- MDX processing pipeline (rehype/remark plugins)
- Blog post frontmatter schema (update types if changed)
- Error boundaries or skeleton loaders (maintain patterns)
- Security headers or CSP (discuss implications first)

**Key reference files**: `src/app/layout.tsx`, `src/lib/blog.ts`, `src/lib/metadata.ts`, `src/lib/design-tokens.ts`, `src/proxy.ts`

---

## CI/CD & Automation

**GitHub Workflows** (`.github/workflows/`):
- `test.yml` — Runs lint, typecheck, unit/e2e tests on push/PR
- `deploy.yml` — Deploys to Vercel (main → production, preview → staging)
- `dependabot-auto-merge.yml` — Auto-merges safe dependency updates
- `lighthouse-ci.yml` — Performance budgets on PRs to main
- `codeql.yml` — Security scanning (daily + on code changes)
- `sync-preview-branch.yml` — Keeps preview branch in sync with main
- `stale.yml` — Manages inactive issues/PRs

**Optimization principles**:
- Use concurrency groups to cancel redundant runs
- Cache dependencies and build artifacts
- Run independent jobs in parallel
- Fail fast on validation errors
- Use path filters to skip unnecessary runs

**Dependabot** (`.github/dependabot.yml`):
- Weekly npm updates (Monday 9am PT)
- Grouped by category (Next.js, dev deps, TypeScript, testing, UI, etc.)
- Auto-merge enabled for safe updates (dev deps patches/minors, prod patches)
- Manual review required for major versions or breaking changes

---

**VS Code Copilot Chat**: Available MCP servers for extended capabilities:
- Memory (context preservation), Sequential Thinking (complex planning), Context7 (library docs)
- Sentry (error monitoring), Vercel (deployments), GitHub PRs
Use these tools when relevant to the task at hand.