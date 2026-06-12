# OpenSpec — DCYFR Labs

OpenSpec is the canonical project-management system for the DCYFR Labs site + brand.

## Scope

This OpenSpec instance governs `dcyfr-labs/dcyfr-labs` product + brand work — the
production Next.js app at https://www.dcyfr.ai, its design system, and **the DCYFR
brand mark** (favicon, OG, logos, identity tokens), which lives in and is owned by this
repo.

## Structure

```
openspec/
  README.md                       — this file
  changes/<change-id>/            — scoped work items
    proposal.md                   — why / what
    tasks.md                      — discrete work items
    status.md                     — status of record (not the tasks.md checkboxes)
    design-decisions.md           — locked design/engineering decisions (optional)
    specs/<capability>/spec.md    — requirement deltas (ADDED/MODIFIED/REMOVED)
```

## Conventions

- Short kebab-case `change-id`s (e.g. `dcyfr-crystal-brand-mark`).
- **status.md is the status of record** — `tasks.md` checkboxes drift.
- A brand-mark change MUST reference the completed brand-mark exploration (governance
  gate — see `changes/dcyfr-crystal-brand-mark/specs/dcyfr-brand-mark/spec.md`).
- Prefer OpenSpec over GitHub Projects for workflow tracking in this repo.

## Active changes

- [`dcyfr-crystal-brand-mark`](./changes/dcyfr-crystal-brand-mark/) — the crystal-facet
  evolution of the DCYFR mark. Vectors authored; **awaiting brand-owner approval before
  any production (favicon/OG/token) cutover.** Migrated 2026-06-05 from the rei-workspace
  exploration (`~/Code`, branches `docs/crystal-brand-mark-change` + `claude/vibrant-merkle-3009b1`).
