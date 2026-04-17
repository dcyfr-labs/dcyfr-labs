# dcyfr-labs

Personal site, blog, and project portfolio for Drew at [dcyfr.ai](https://www.dcyfr.ai).

Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind v4**, **shadcn/ui**, and **MDX**.

[![deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://www.dcyfr.ai)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

<!-- audience: humans evaluating the project -->

---

## Quick start

```bash
git clone https://github.com/dcyfr-labs/dcyfr-labs.git
cd dcyfr-labs
cp .env.example .env.local   # fill in any keys you need; most are optional
npm install
npm run dev                  # http://localhost:3000
```

Local development needs Node 20+. Most features degrade gracefully without API keys — contact form, analytics, GitHub integration, and Inngest background jobs are all optional.

---

## What's in the repo

| Path                 | Contents                                                              |
| -------------------- | --------------------------------------------------------------------- |
| `src/app/`           | Next.js App Router — pages, layouts, API route handlers               |
| `src/components/`    | UI components (layouts, shadcn primitives, page sections)             |
| `src/lib/`           | Utilities, metadata helpers, design tokens                            |
| `content/`           | MDX source for blog posts and projects                                |
| `public/`            | Static assets, fonts, images                                          |
| `tests/` + `e2e/`    | Vitest unit/integration + Playwright end-to-end                       |
| `docs/`              | Architecture, operations, features, governance, security, ai, testing |
| `scripts/`           | Build scripts, generators, one-shots                                  |
| `.github/workflows/` | CI, deployment, security scanning, release automation                 |

---

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run test:run     # run test suite once (no watch)
npm run lint         # eslint with design-token enforcement
npm run typecheck    # tsc --noEmit
npm run check        # typecheck + lint + test + build
```

See [`package.json`](./package.json) for the full script catalog. Every script is tagged with a `# used-by:` provenance comment — see [automation glossary](./docs/automation-glossary.md) for what that means.

---

## How automation works

This repo is operated by three distinct classes of automation: **bots**, **assistants**, and **agents**. Each has its own contract surface and instruction file.

- **Bots** (Dependabot, auto-calver, cron jobs) read [`.well-known/automation.yaml`](./.well-known/automation.yaml) — structured data only, no prose.
- **Assistants** (GitHub Copilot inline, Claude inline chat) read [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) and [`CLAUDE.md`](./CLAUDE.md).
- **Agents** (Claude Code sub-agents, workspace specialists) read [`AGENTS.md`](./AGENTS.md) + the `dcyfr-workspace/openspec/` change folders.

The definitions, axes, and read/write/needs contract for each class live in [`docs/automation-glossary.md`](./docs/automation-glossary.md). Start there if you're wiring new automation against this repo.

---

## Deployment

Production deploys from `main` to **Vercel** at <https://www.dcyfr.ai>. Preview deploys run on every PR. Required environment variables are declared in [`vercel.json`](./vercel.json) and documented under [`docs/operations/`](./docs/operations/). Background jobs run on **Inngest**. Analytics are stored in **Redis**.

---

## Contributing

1. **Read** [`AGENTS.md`](./AGENTS.md) if you're an AI agent — it contains the anti-assumption protocol, openspec routing, and mutation policy.
2. **Open a change proposal** in `dcyfr-workspace/openspec/changes/` before large refactors. This repo is an openspec-first project.
3. **Run `npm run check`** before opening a PR. All gates must pass: typecheck, lint, tests, build.
4. **Follow CalVer** for release tags — format is `YYYY.MM.DD`. See [`docs/operations/VERSIONING.md`](./docs/operations/VERSIONING.md).
5. **Use design tokens** from `src/lib/design-tokens.ts` — never hardcode spacing, typography, or colors. ESLint will flag violations.

---

## Project docs

All documentation lives under [`docs/`](./docs/) in eight canonical topics:

| topic           | what's in it                                           |
| --------------- | ------------------------------------------------------ |
| `architecture/` | System design, ADRs, migration guides                  |
| `operations/`   | Versioning, commands, maintenance, workflows catalog   |
| `features/`     | Per-feature guides (blog, analytics, Inngest, etc.)    |
| `governance/`   | Policy, documentation placement rules                  |
| `security/`     | Security scanning, vulnerability handling, SOC2        |
| `ai/`           | Design system validation, logging security, AI guides  |
| `testing/`      | Test infrastructure, coverage, E2E                     |
| `_private/`     | Status snapshots, dated reports (not surfaced to bots) |

Start at [`docs/README.md`](./docs/README.md) for the full index.

---

## License

[MIT](./LICENSE) — Copyright © Drew Gowan. See [`LICENSE`](./LICENSE) for details.
