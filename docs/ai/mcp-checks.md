## MCP Servers - Health Checks & CI Guidance

## Overview

This page documents recommended checks for MCP (Model Context Protocol) servers, guidance for local development, and CI integration. It is intentionally short and prescriptive – follow these minimal steps to ensure MCP servers are discoverable, reachable, and documented in `AGENTS.md`.

## Why this matters

- MCP servers provide runtime context and services used by the AI agents this repository integrates with (e.g., Perplexity, Context, Axiom, Filesystem, arXiv, Octocode, Google Scholar, OpenReview, DBLP). Monitoring them improves developer ergonomics and reduces flaky CI runs.

## Local validation

1. Confirm the workspace MCP configuration is present at `.vscode/mcp.json`.
2. Ensure sensitive tokens in `.env.local` are not committed and are present in local environment when testing (example: `PERPLEXITY_API_KEY`).

## Recommended MCP health checks (manual)

- **Perplexity**: If a token is present, send a minimal request (or run `isPerplexityConfigured()` helper in `src/lib/perplexity.ts`).
- **Context**: Confirm the Context MCP server is accessible if it uses an http URL.
- **Axiom / Sentry / Vercel**: Confirm public endpoints respond with 200/401 (401 is okay if token required) and that the host resolves.
- **arXiv / Google Scholar / OpenReview / DBLP**: Free research servers - verify npx can resolve packages. No auth required.
- **Octocode**: GitHub CLI auth (`gh auth login`) or Personal Access Token. Verify with `/research` command; no validation endpoint required.
- **Analytics (Custom)**: Local MCP server requiring Redis credentials (`REDIS_URL`). Test with `npm run mcp:inspect:analytics` or verify startup with `npm run mcp:analytics` (stdio mode).

## Recommended `check-mcp-servers.mjs` script

Suggested behavior for `scripts/check-mcp-servers.mjs` (not implemented here):

- Read `.vscode/mcp.json` and enumerate servers.
- For each server, attempt:
  - If `url` exists: `HEAD` to that URL and log HTTP status + time (script will fall back to `GET` on 405 or on Abort to confirm reachability).
  - If `command` exists (local): spawn `npx <command> --version` to confirm it's installed and runnable.
  - If `envFile` or secrets are present, attempt authenticated call where applicable (or skip with `--no-auth`).
- Return a machine-readable JSON object with statuses for CI and a human-friendly table for logs.
  - The script accepts a `server.auth.envVar` property so the server can declare the env var to use for auth, for example:
    - `"Vercel": { "url": "https://mcp.vercel.com", "auth": { "envVar": "VERCEL_TOKEN" } }`
  - The script exposes a `--debug` flag to print request/response diagnostics (method used, token name, elapsed time, etc.) for troubleshooting.

Implemented in this repo: `scripts/check-mcp-servers.mjs` (lightweight checks)

## Tests:

Unit tests for the script can be found at `tests/scripts/check-mcp-servers.test.ts`.

## How to run locally

Run the MCP check locally (non-strict by default):

```bash
npm run mcp:check -- --no-auth
```

To run in strict mode and fail on any unreachable server (use in CI only if you have secrets):

```bash
npm run mcp:check -- --fail
```

## CI Integration

Add a simple GitHub Actions job to keep `AGENTS.md` in sync and verify instruction files, including the optional MCP check if implemented and secrets are available to the Action.

Key guidance for pipeline:

- Run `npm ci` or `npm install` depending on your pipeline.
- Run `node scripts/validate-instructions.mjs` to ensure instruction files remain consistent.
- Optionally run `node scripts/check-mcp-servers.mjs` (strict or non-strict depending on token availability) and publish a summary to PR checks.

## Secrets & Tokens

- For CI to run authenticated health checks, store tokens in GitHub Actions secrets and restrict usage.
- Provide a `--no-auth` or `--public` mode to `check-mcp-servers.mjs` to allow reachability checks without tokens.

## Further reading

- `AGENTS.md` - central hub (decision tree & instructions)
- `.vscode/mcp.json` - MCP configuration (project workspace)
- `scripts/ci/sync-agents.mjs` - agent sync script

Status: informational – add a minimal script and CI integration when ready.
