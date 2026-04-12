---
version: '1.0.0'
audience: humans + agents (canonical definition of actor classes)
---

<!-- TLP:CLEAR -->

# Automation Glossary

**Purpose.** Define what we mean by **bot**, **assistant**, and **agent** in this repository, and name the contract surface each consumes. This file is the single source of truth. If another document in this repo contradicts it, this file wins and the other should be fixed.

**How to read.** If you're an AI operating against this repo, load this file and `.well-known/automation.yaml` first. Only then load your class's primary instruction file. See the contract surface table below.

---

## The three actor classes

A **bot**, an **assistant**, and an **agent** are not three points on a continuum. They are three different things that happen to overlap in one narrow sense — each acts on behalf of a human. Everything else is different.

> A bot is a function call wrapped in a trigger.
> An assistant is a chat turn wrapped in a context window.
> An agent is a goal wrapped in a control loop.

The six axes below separate them cleanly.

| axis               | bot                               | assistant                            | agent                                         |
| ------------------ | --------------------------------- | ------------------------------------ | --------------------------------------------- |
| autonomy           | none — triggered                  | low — one turn, always human-invited | high — owns a goal, self-drives to completion |
| interaction model  | event → action                    | human turn ↔ model turn              | goal → plan → act → observe → repeat          |
| state              | stateless (or process state only) | per-conversation context window      | persistent across turns, writes own memory    |
| decision authority | none — follows rules              | advisory — human merges every change | bounded — acts within `mutation_policy`       |
| tool use           | one or two fixed APIs             | suggests code; IDE applies it        | writes files, runs commands, opens PRs        |
| concurrency        | many in parallel, independently   | one per human session                | one task deep per agent instance              |

If a system has high autonomy and one fixed API, it's a bot with an ambitious scope. If it has a control loop and multi-step tool use, it's an agent regardless of what its marketing calls it.

---

## Bot

**Definition.** A scheduled or event-triggered program that performs a narrow, deterministic operation. No natural-language reasoning. No context window. No multi-step planning. It reads structured data, emits structured data, and stops.

**Concrete examples operating against this repo:**

- **Dependabot** — scans `package.json`, opens PRs for version bumps.
- **auto-calver.yml** — on push to `main`, computes the CalVer tag and writes `CHANGELOG.md`.
- **monthly-cleanup.yml** — scheduled cron, deletes stale branches and merged PRs.
- **Vercel preview deploys** — triggered by every push, no reasoning step.

**Why bots need a dedicated contract surface.** If a bot had to read `CLAUDE.md` to decide what `npm run build` does, it would be an agent. The reason we can write deterministic automation at all is that bots consume `.well-known/automation.yaml` and `package.json` scripts — structured fields with stable names — and nothing else.

---

## Assistant

**Definition.** An LLM that participates in a single human-driven turn. The human is in the loop for every substantive action. The assistant reads the current file, suggests a completion or rewrite, and the human accepts, rejects, or edits. It does not own tasks end to end. When the conversation ends, its state ends.

**Concrete examples operating against this repo:**

- **GitHub Copilot inline** — suggests the next line as you type.
- **Claude inline chat in Cursor / VS Code** — answers questions about the file you're looking at.
- **Cursor Tab** — accepts a multi-line completion you triggered by hitting Tab.

**Why assistants have a tight token budget.** Every assistant turn starts from scratch. Loading `AGENTS.md` (governance policy) on every turn burns the context window before the assistant has seen the user's code. The assistant class reads `.github/copilot-instructions.md` (quick-reference, ≤120 lines) and `CLAUDE.md` (task routing, ≤150 lines) — that's it. Policy lives in `AGENTS.md`, which the **agent** class loads.

---

## Agent

**Definition.** A program that receives a goal, plans how to achieve it, acts (reads files, runs commands, writes code, opens PRs), observes the outcome, and loops until the goal is satisfied or it escalates. It manages its own context across many turns. It owns the task end to end. It must obey `mutation_policy` declared in the manifest.

**Concrete examples operating against this repo:**

- **Claude Code sub-agents** — `.claude/agents/*.md` — each owns a workflow (design check, security audit, deps audit) and runs to completion.
- **Rei daemon** (upstream in `~/Code/scripts/rei-daemon/`) — 15-minute autonomy loop, observes repo state, plans, acts, records.
- **dcyfr-workspace specialists** — `.claude/agents/dcyfr-*.md` — fullstack, frontend, security, database, test, devops engineers that own multi-step tasks.

**Why agents load `AGENTS.md`.** Agents make consequential decisions — what to refactor, what dep to remove, what test to delete — and they need the anti-assumption protocol, the openspec-first workflow, and the mutation policy in front of them. Assistants don't need this because they never act unilaterally. Bots don't need this because they can't act outside their narrow rule set.

---

## Contract surface

Each actor class reads a specific set of files. Prose documents link here; this table is the source of truth.

| class     | reads                                                                              | writes                                           | needs                                                                                                 |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| bot       | `.well-known/automation.yaml`, `package.json` scripts with `# used-by:` comments   | workflow logs, artifacts, PRs with fixed titles  | stable script names, stable capability ids, deterministic inputs                                      |
| assistant | `.well-known/automation.yaml`, `.github/copilot-instructions.md`, `CLAUDE.md`      | code suggestions in the current file             | tight token budget (≤10k), cheat-sheet style, task-routing pointers, **no governance policy payload** |
| agent     | `.well-known/automation.yaml`, `AGENTS.md`, `dcyfr-workspace/openspec/`, this file | new files, PRs, commits, openspec change folders | mutation policy, anti-assumption protocol, openspec workflow, access to read/write/run tools          |

**Read in this order.** Every actor class starts with `.well-known/automation.yaml`. That file tells it which prose file to load next and what its token budget is. Prose files never contradict the manifest — if there's a conflict, the manifest wins and the prose gets updated.

**Do not cross surfaces.** An assistant reading `AGENTS.md` is a waste of its context window. A bot reading `CLAUDE.md` is a category error — bots do not reason over prose. An agent that skips `AGENTS.md` will skip the anti-assumption protocol and make assumptive edits. Each class reads what it reads for a reason.

---

## Why this matters

Most repos do not distinguish these classes. The result is that:

- Topline docs swell to thousands of lines trying to be legible to every reader at once.
- Assistants burn their context window loading governance they cannot act on.
- Bots break when prose changes structure around the script name they depend on.
- Agents miss the mutation policy because it's buried in a 1,700-line `AGENTS.md`.

Separating the three classes lets each file serve one reader. `.github/copilot-instructions.md` gets smaller. `AGENTS.md` becomes a policy file, not a catch-all. `.well-known/automation.yaml` becomes the stable contract bots depend on. The total prose shrinks, not grows.

---

## Versioning

This file is versioned in lockstep with `.well-known/automation.yaml` via the `glossary_version:` field. If you change the classes, the axes, or the contract surface, bump the `version:` in the frontmatter at the top of this file AND update `glossary_version:` in the manifest. CI will fail otherwise.

---

## Further reading

- `.well-known/automation.yaml` — machine-readable manifest
- `schemas/automation-manifest.schema.json` — schema the manifest must validate against
- `AGENTS.md` — canonical governance policy (agent class only)
- `.github/copilot-instructions.md` — assistant class quick reference
- `CLAUDE.md` — Claude-inline task routing
