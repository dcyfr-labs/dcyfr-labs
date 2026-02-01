<!-- TLP:CLEAR -->

# OpenCode VS Code Onboarding (Quick Start)

**Purpose:** Remove the UX blocker to increase adoption by providing a short, actionable VS Code onboarding for OpenCode sessions.

**Last Updated:** January 31, 2026

---

## Install the extension

1. Open VS Code (Cmd+P).
2. Open Extensions view (Cmd+Shift+X).
3. Search for and install: `sst-dev.opencode`.

> `sst-dev.opencode` is recommended in `.vscode/extensions.json` for quick access.

## Quick launch & shortcuts

- Open OpenCode in the editor: `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux)
- Start a new session: `Cmd+Shift+Esc` (Mac) or `Ctrl+Shift+Esc` (Win/Linux)
- Insert file refs into the session: `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Win/Linux)
- Start a preset session from terminal:

```bash
# Feature preset
npm run ai:opencode:feature

# Quick preset
npm run ai:opencode:quick
```

## Authenticate (GitHub Copilot)

1. Run `opencode` in your terminal or start via the extension.
2. In the OpenCode UI, run `/connect` and choose `GitHub Copilot`.
3. Follow device code flow at https://github.com/login/device.
4. Verify models: run `/models` (should show `gpt-5-mini`, `raptor-mini`, etc.).

## Recommended preset for dcyfr-labs

- `dcyfr-feature` — full context (16K) with DCYFR system prompt for pattern awareness.
- `dcyfr-quick` — fast edits and quick fixes using `raptor-mini`.

## Troubleshooting

- If extension doesn't appear, ensure `sst-dev.opencode` is installed and reload VS Code.
- If device auth fails, run `opencode` in a terminal and follow the `/connect` instructions there.
- Check provider health: `npm run opencode:health`.

## Adoption checklist (for maintainers)

- Add a short onboarding GIF to `docs/ai/assets/opencode-vscode-onboarding.gif` (screenshot of `Cmd+Esc` session flow).
- Add a short `docs/ai/README.md` note linking to this page and pin in relevant quick references.
- Re-check session logs in `.opencode/.session-log.jsonl` weekly; target: steady growth over 30–60 days.

---

If you'd like, I can add the small onboarding GIF placeholder and a one-line note in `docs/ai/quick-reference.md` next.
