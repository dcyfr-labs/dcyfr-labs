# Design tokens

The canonical source for color, typography, spacing, shadows, gradients, animations, and z-index layers is [`src/lib/design-tokens.ts`](../../src/lib/design-tokens.ts). It is the executable source of truth — documentation duplicates drift, so the file is authoritative.

## Rules

- Never hardcode color, spacing, typography, or shadow values in components. Use the exported tokens.
- `eslint-plugin-design-tokens` enforces this in pre-commit and CI. Lint failures pointing at raw values mean: look up the token and swap it in.
- Tokens resolve to CSS variables defined in [`src/app/globals.css`](../../src/app/globals.css). Light and dark modes are handled via the variable layer, not via component-level conditionals.
- Tailwind v4 is configured for CSS variables only — there is no JS theme config object to extend.

## What agents should do

- When generating a component, import from `@/lib/design-tokens` or reference the matching semantic utility class (`bg-primary`, `text-secure`, `ring-destructive`, etc.).
- When inferring brand colors from a Claude Design bundle, map them back to the nearest existing token rather than introducing a new one. File a change proposal under `openspec/changes/` if a net-new token is actually needed.

## Canonical file structure

```
src/lib/design-tokens.ts   # semantic colors, typography (35+ variants),
                           # spacing, shadows, gradients (40+), animations, z-index
src/app/globals.css        # CSS variables, light/dark theme layer
```

## Related

- [voice.md](./voice.md) — tone and copy rules
- [components.md](./components.md) — brand-aligned component registry
