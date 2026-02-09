{/* TLP:CLEAR */}

# OpenCode VS Code Onboarding Assets

This directory holds small UI assets for the OpenCode VS Code onboarding page.

Required asset (optional but recommended):

- `opencode-vscode-onboarding.gif` (3-6s, 800x450 or 1280x720, under 2MB) — show quick flow: install extension -> Cmd+Esc -> start session -> `/models`.

Recording tips:

- Use a short clip (3-6 seconds) focused on the editor; avoid showing sensitive info.
- Use `kap` (macOS) or `gifcap` / `peek` (Linux) to record and optimize size.
- Compress with `gifsicle -O3 -o opencode-vscode-onboarding.gif opencode-vscode-onboarding.gif`.

Place the final file at: `docs/ai/assets/opencode-vscode-onboarding.gif` and update `docs/ai/opencode-vscode-onboarding.md` if you change the filename.
