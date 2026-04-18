# AGENTS.md

<!-- audience: AI agents operating autonomously against this repo -->

**Canonical governance policy for agents.** If you're reading this, you're an **agent** (see [`docs/automation-glossary.md`](./docs/automation-glossary.md) for the distinction between bots, assistants, and agents). Agents load this file on wake. Assistants and bots do not — their contract surfaces are smaller by design.

> This file is policy. It is intentionally not a tutorial. For how-to content, follow the links out.

---

## Contract surface

You read:

1. [`.well-known/automation.yaml`](./.well-known/automation.yaml) — the manifest (load first, always)
2. This file — `AGENTS.md`
3. `dcyfr-workspace/openspec/` — active change proposals, specs, and archives
4. [`docs/automation-glossary.md`](./docs/automation-glossary.md) — definitions of bot/assistant/agent
5. The specific prose file for the task at hand (e.g., `docs/architecture/` for a refactor)

You do **not** read `README.md` (human-audience) or `.github/copilot-instructions.md` (assistant-audience) on wake. Those are out of your contract surface.

---

## Anti-assumption protocol

**Verify before acting.** Your mistakes are expensive because they run end-to-end without a human in the loop for every turn. Follow these rules:

1. **Read the source before implementing.** If you're about to modify a function, read the current implementation first. If you're about to delete a file, grep for references first.
2. **Read the spec before writing code.** If there's an openspec change for the work, load `proposal.md`, `tasks.md`, and `specs/<capability>/spec.md`. Implement against the spec, not against your intuition.
3. **Ask when intent is ambiguous.** If you don't know whether Drew wants approach A or approach B, ask. Do not guess.
4. **Verify test counts, file counts, and metrics before quoting them.** Do not restate numbers from memory. Run `wc -l`, `npm run test:run`, `grep -c`. Numbers in prose decay fast.
5. **Don't restate what the code already says.** If a function is self-documenting, don't add comments. If a filename is clear, don't add a README to the directory.

---

## OpenSpec-first workflow

This repo is managed via openspec. Non-trivial changes start as a change proposal, not a patch.

**When a change requires openspec:** new features, refactors touching more than one module, deletions of tracked code, changes to CI/CD, changes to branch protection, changes to `.well-known/automation.yaml`, changes to this file.

**When it does not:** single-file bug fixes, typo corrections, dependency bumps from Dependabot, generated-file regeneration, adding a test to cover an existing function.

**Workflow:**

1. Draft the change under `dcyfr-workspace/openspec/changes/<change-name>/`.
2. The change folder contains: `proposal.md` (why + what), `design.md` (architectural notes, optional), `tasks.md` (phased checklist), and `specs/<capability>/spec.md` (Requirement/Scenario format with WHEN/THEN clauses).
3. Open a PR referencing the change folder. Implement the tasks in order. Mark tasks `[x]` as you complete them.
4. When all tasks are complete and CI is green, move the change to `openspec/changes/archive/`.

See existing archived changes for reference format.

---

## Mutation policy

The machine-readable version is in [`.well-known/automation.yaml`](./.well-known/automation.yaml) under `mutation_policy:`. The prose version, for agents making judgment calls:

**You may mutate freely:** `src/**`, `content/**`, `tests/**`, `e2e/**`, `scripts/**`, `docs/**`, `package.json`, `package-lock.json`, `.github/workflows/**`.

**You must escalate for approval:** `.github/CODEOWNERS`, `.github/branch-protection.yml`, `vercel.json`, `next.config.ts`, `.well-known/automation.yaml`, `schemas/automation-manifest.schema.json`. These affect shared infrastructure or the contract surface itself. Changes require a human PR review even if CI is green.

**You must never touch:** `.env*`, `**/secrets/**`, `op://**`, `.gnupg/**`, `**/id_rsa*`, `**/id_ed25519*`. Secret material is outside your write surface. If a task genuinely needs a secret, escalate — do not read, copy, paste, or log it.

---

## Tool use

**Shell commands must be sandboxed.** Use the allowlist of safe binaries. No piping to `rm -rf`, no `sudo`, no `eval`, no unquoted user-supplied variables in shell strings.

**Network calls are restricted.** Fetching external URLs needs justification. SSRF-safe helpers block localhost and private IPs by default. If you need to reach an internal service, state why in the task context.

**Destructive git operations require confirmation.** Never `git reset --hard`, `git push --force`, `git clean -fdx`, or `git branch -D` without explicit authorization for that operation in that branch. A single `git push` authorization does not extend to `git push --force` later.

**Don't skip hooks.** `--no-verify`, `--no-gpg-sign`, `-c commit.gpgsign=false` are off-limits unless explicitly approved for a specific commit. If a pre-commit hook fails, diagnose the root cause — don't bypass it.

---

## Delegation to sub-agents

Claude Code sub-agents live in `.claude/agents/`. Each owns a narrow specialty (design check, security audit, deps audit, architecture review, etc.). Use them when:

- The task exceeds your single-session context budget.
- Independent work can run in parallel (e.g., research two libraries at once).
- A specialized agent's system prompt contains domain knowledge you don't have loaded.

Do not delegate for small tasks. Do not delegate understanding — brief the sub-agent on what you've already learned so it doesn't re-derive the premise.

---

## Scope boundaries

**This file governs dcyfr-labs only.** The parent `dcyfr-workspace/` repository has its own `AGENTS.md` with workspace-wide policy (worktree isolation, cross-package coordination, intelligence gateway access). When working inside dcyfr-labs, this file takes precedence. When working at the workspace level, load the workspace's `AGENTS.md` instead.

**Do not modify files outside this repo.** If a task requires touching `dcyfr-ai/`, `dcyfr-ai-agents/`, `dcyfr-workspace-agents/`, or any other workspace package, stop and route the work to that package's own agent session. Cross-repo edits from inside dcyfr-labs are a governance violation.

---

## Design system

This app consumes the `@dcyfr-labs` shadcn registry hosted at [registry.dcyfr.ai](https://registry.dcyfr.ai). The mapping lives in `components.json` under `registries`.

**Installing a UI primitive:** prefer `npx shadcn@latest add @dcyfr-labs/<name>`. Only install from the default shadcn registry when the primitive is not yet published to `@dcyfr-labs`.

**Authoring a new brand-aligned variant:** do not author it inside this repo. Contribute it upstream to `dcyfr-labs/dcyfr-labs-registry/` under the `dcyfr-labs-registry` OpenSpec change. Cross-repo work follows the scope-boundaries rule above — open a session against the registry repo.

**Brand surface for agents and tools:** `docs/brand/` is the public-safe distillation of the TLP:AMBER source at `nexus/context/user/brand-voice.md`. Claude Design and Claude Code handoff bundles read from `docs/brand/`, not from the private source. Keep the two in sync when the private source changes — but never paste TLP:AMBER content into `docs/brand/`.

---

## Documentation placement

**Public docs** go under `docs/<topic>/` in one of the eight canonical topics (see [`docs/README.md`](./docs/README.md)).

**Private / dated / status docs** go under `docs/_private/`. File names matching `*-summary.md`, `*-complete.md`, `*-status.md`, `*-report.md`, `*-validation.md`, or `*-YYYY-MM-DD.md` are private-pattern and MUST live under `_private/` — they will not be surfaced to bots via the automation manifest.

**Never create topline docs.** Do not create `CHANGELOG_*.md`, `INTEGRATION_*.md`, `SETUP_*.md`, or any other `CAPS_CAPS.md` at the repo root. Policy lives in `AGENTS.md`. History lives in `CHANGELOG.md`. Everything else lives under `docs/`.

---

## Quality gates

Before committing, run `npm run check` (typecheck + lint + test + build). Pre-commit hooks enforce design-token compliance and secret scanning — don't bypass them.

Before opening a PR, read [`docs/operations/workflows-catalog.md`](./docs/operations/workflows-catalog.md) (if it exists) to understand which CI checks are required. Every surviving workflow declares its actor class (`# actor: bot|assistant|agent`) in a top-of-file comment.

---

## Escalation

**Stop and ask when:**

- The task requires touching a path under `requires_approval:` or `forbid:`.
- The spec is ambiguous and multiple valid implementations exist.
- You discover a non-obvious risk not captured in `design.md`.
- A destructive git operation would be needed to make progress.
- The work you've done so far no longer matches the original task description.

**Keep going when:**

- A lint/test failure has a clear root cause and a focused fix.
- The spec is clear and you have a single obvious implementation path.
- An error message points at a specific file and line.

The cost of a brief pause is low. The cost of an unwanted destructive action is high.

---

## Related files

- [`.well-known/automation.yaml`](./.well-known/automation.yaml) — machine-readable contract
- [`docs/automation-glossary.md`](./docs/automation-glossary.md) — bot/assistant/agent definitions
- [`docs/brand/`](./docs/brand/) — public-safe brand surface (voice, tokens, components)
- [`CLAUDE.md`](./CLAUDE.md) — Claude inline task routing (assistant surface, not governance)
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) — Copilot quick reference (assistant surface)
- [`docs/_archived/AGENTS-2026-04.md`](./docs/_archived/AGENTS-2026-04.md) — previous 1788-line version (archived for one quarter)
