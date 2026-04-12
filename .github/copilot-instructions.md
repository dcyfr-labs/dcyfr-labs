# Copilot quick reference

<!-- audience: GitHub Copilot inline suggestions + Copilot Chat in the editor -->

**Cheat sheet for Copilot.** Not governance. Not policy. If you're Claude Code or an agent, load [`AGENTS.md`](../AGENTS.md) instead. For the distinction between bot/assistant/agent, see [`docs/automation-glossary.md`](../docs/automation-glossary.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui · MDX. Deploys to Vercel from `main`. CalVer release tags.

## Where things live

| Path               | Contents                                     |
| ------------------ | -------------------------------------------- |
| `src/app/`         | App Router pages, layouts, API routes        |
| `src/components/`  | UI primitives (`ui/`) + page sections        |
| `src/lib/`         | Utilities, metadata helpers, design tokens   |
| `content/`         | MDX for blog posts and projects              |
| `tests/` + `e2e/`  | Vitest unit + Playwright E2E                 |
| `docs/`            | Project docs in eight canonical topics       |

## Patterns that show up a lot

- **Server components by default** — add `"use client"` only when the component needs state, effects, or browser APIs.
- **Design tokens, not raw values** — import from `src/lib/design-tokens.ts`. ESLint rejects hardcoded colors, spacing, and font sizes.
- **MDX frontmatter is validated** — schemas live in `src/lib/mdx/`. Don't invent new fields; extend the schema if you need one.
- **API routes return `NextResponse`** — see `src/app/api/*/route.ts` for the pattern.
- **Metadata helpers** — use `generateMetadata()` from `src/lib/metadata.ts` for page `<head>` content rather than hand-rolling.
- **Analytics events** — `src/lib/analytics/` wraps Redis. Fire events from server actions, not client-side where possible.

## Commands

```bash
npm run dev          # dev server on :3000
npm run test:run     # one-shot test run
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run check        # the full pre-PR gate
```

## Don'ts

- No hardcoded spacing, color, or typography values — use design tokens.
- No `--no-verify` on commits. Pre-commit hooks are there for a reason.
- No new topline files at the repo root. Private/dated docs go under `docs/_private/`.
- No `README.md` inside a `src/` subdirectory to explain what the code already says.
- No editing `.env*`, `vercel.json`, or CODEOWNERS from an inline suggestion — those are approval-gated.

## If you're about to suggest a big change

Copilot is a suggestion engine — the human accepts, rejects, or edits your completion. If the suggested change crosses multiple files, touches CI, or removes a dependency, the human should escalate it to a change proposal rather than accept a multi-file diff inline. See `AGENTS.md` if you're curious about the full workflow — but as Copilot, your job ends at the suggestion.
