# CLAUDE.md

<!-- audience: Claude inline chat / Claude Code sessions working on a specific file -->

**Task-routing cheat sheet for Claude.** This file is not policy. For governance (mutation policy, openspec workflow, anti-assumption protocol) load [`AGENTS.md`](./AGENTS.md) instead. For the definition of bot/assistant/agent classes, see [`docs/automation-glossary.md`](./docs/automation-glossary.md).

---

## What is this repo

Personal site + blog + portfolio for Drew at [dcyfr.ai](https://www.dcyfr.ai). Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, MDX. Deploys to Vercel. CalVer release tags.

## What you're likely being asked to do

| Task                     | Where to look                                         |
| ------------------------ | ----------------------------------------------------- |
| Add/edit a blog post     | `content/blog/*.mdx`                                  |
| Add/edit a project entry | `content/projects/*.mdx`                              |
| Change a page layout     | `src/app/**/page.tsx`, `src/components/layouts/`      |
| Tweak a UI primitive     | `src/components/ui/` (shadcn)                         |
| Adjust typography/color  | `src/lib/design-tokens.ts` (never hardcode)           |
| Fix an API route         | `src/app/api/**/route.ts`                             |
| Update a test            | `tests/` (Vitest) or `e2e/` (Playwright)              |
| Trace a CI failure       | `.github/workflows/` — each has an `# actor:` comment |

## Routing rules

- **MDX content changes** — edit the file under `content/`, no code changes needed. Frontmatter fields are validated by `src/lib/mdx/`. Don't invent new frontmatter keys without checking the validator.
- **Design token enforcement** — ESLint (`eslint-plugin-design-tokens`) rejects raw colors, spacing values, or font sizes. If the lint error points at a hardcoded value, look it up in `src/lib/design-tokens.ts` and use the token.
- **New dependency** — before `npm install <pkg>`, check whether an existing dep already covers the use case. The repo has a `depcheck` regression gate in CI, and new deps need to justify their weight.
- **New route** — add the file under `src/app/<route>/page.tsx`. Add a sitemap entry in `src/app/sitemap.ts` and an analytics event if applicable. See existing pages for the pattern.

## Don'ts

- Don't edit files outside `src/`, `content/`, `tests/`, `e2e/`, `scripts/`, `docs/` without reading the mutation policy in `AGENTS.md` first.
- Don't create a new topline file (`CHANGELOG_*.md`, `SUMMARY_*.md`, `SETUP_*.md`). Private/dated docs go under `docs/_private/`.
- Don't bypass pre-commit hooks with `--no-verify`. Design-token enforcement and secret scanning run there for a reason.
- Don't hardcode spacing, color, or typography values. Use `src/lib/design-tokens.ts`.
- Don't restate test counts, file counts, or coverage percentages from memory. Run the command and quote the fresh number.
- Don't create `README.md` files inside `src/` subdirectories to "document" what the code already says.

## Commands you'll actually run

- `npm run dev` — local server on :3000
- `npm run test:run` — one-shot test run. **Never `npm test`** — that triggers watch mode inside your session.
- `npm run lint` — design-token + a11y rules
- `npm run typecheck` — TS strict mode
- `npm run check` — the full pre-PR gate (type + lint + test + build)

Every script in `package.json` has a `# used-by:` comment declaring which workflow or human invokes it. If you add a script, add the comment.

## When you actually need governance

You usually don't. Most inline tasks are "add this component", "fix this test", "explain this function". Policy questions (can I refactor this module, can I delete this dep, can I touch this CI file) route to `AGENTS.md`. If the task is large enough to need a change proposal, it belongs in `dcyfr-workspace/openspec/changes/` — see `AGENTS.md` for how that workflow works.

## Escalation

Stop and ask when:

- The task requires touching `vercel.json`, `next.config.ts`, `.github/CODEOWNERS`, or `.well-known/automation.yaml` — these are approval-gated.
- The lint or type error isn't localizable to one file and seems to require a cross-cutting refactor.
- The user's request conflicts with the design system (e.g., "just hardcode this color for now").

## Related files

- [`AGENTS.md`](./AGENTS.md) — canonical agent-class governance policy
- [`README.md`](./README.md) — human-audience project overview
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) — Copilot inline quick reference
- [`docs/automation-glossary.md`](./docs/automation-glossary.md) — definitions for bot/assistant/agent
