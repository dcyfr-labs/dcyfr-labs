# Components

Brand-aligned components ship from `@dcyfr-labs/registry` — a shadcn/ui v4 custom registry under `dcyfr-labs/dcyfr-labs-registry/`. Agents with the shadcn MCP connected install them by name.

## When to reach for the registry

- You need a button, card, dialog, or block with dcyfr-labs brand variants (`brand`, `secure`, `ghostly`, `danger`).
- You want tokens and variants wired in without re-authoring the component.

## When to reach for raw shadcn/ui

- You need a primitive that is not yet published to `@dcyfr-labs/registry`. Install from the default shadcn registry, then propose a brand-aligned wrapper via OpenSpec.

## Install (once wired)

```bash
npx shadcn@latest add @dcyfr-labs/dcyfr-button
```

The consumer app's `components.json` must have `@dcyfr-labs` mapped under `registries`. Wiring is tracked in `openspec/changes/dcyfr-labs-registry/` Phase 3.

## Authoring new registry items

Do not author brand-aligned variants inside this app. Contribute them upstream:

1. Add source to `dcyfr-labs/dcyfr-labs-registry/src/registry/new-york/ui/`.
2. Register in `registry.json`.
3. Run `npm run build`.
4. Open a change proposal.

## Related

- `dcyfr-labs/dcyfr-labs-registry/README.md` — registry authoring guide
- `openspec/changes/dcyfr-labs-registry/` — initiative tracking
- [voice.md](./voice.md), [tokens.md](./tokens.md)
