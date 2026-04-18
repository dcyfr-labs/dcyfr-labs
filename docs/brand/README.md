# Brand surface

Public-safe brand reference for agent and tooling ingestion. The canonical private source lives in `nexus/context/user/brand-voice.md` (TLP:AMBER, workspace-local). This directory is the distilled, shareable slice.

## What this is for

- **Claude Design / Claude Code handoff** — codebase and design files Claude Design reads to infer brand colors, typography, components.
- **Agents** (Rei, shinji, frontend-developer) — tone + component preferences when generating UI or copy.
- **External contributors** — canonical brand rules without exposing private workflow notes.

## Files

- [`voice.md`](./voice.md) — tone, vocabulary, formatting rules
- [`tokens.md`](./tokens.md) — pointer to design tokens and enforcement rules
- [`components.md`](./components.md) — pointer to the `@dcyfr-labs/registry` component library

## Classification

All files in this directory are cleared for public consumption. Do not paste TLP:AMBER content here.

## Related

- `src/lib/design-tokens.ts` — executable source of truth for color, typography, spacing
- `dcyfr-labs/dcyfr-labs-registry/` — brand-aligned shadcn/ui registry
- `openspec/changes/dcyfr-labs-registry/` — initiative tracking
