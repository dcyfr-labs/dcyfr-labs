# Contributing — Local dev & checks

Welcome — this file contains the minimal steps for a single developer to run and validate the project locally.

## Quick commands

Install dependencies:

```bash
npm ci
```

Run development server (fast, Turbopack):

```bash
npm run dev
```

Run HTTPS development server (Safari macOS TLS issues):

```bash
npm run dev:https
```

Build for production (local check):

```bash
npm run build
```

Run the repository checks (lint + strict typecheck):

```bash
npm run check
```

- `npm run check` is an alias for running a strict lint (`npm run lint:ci`) followed by `tsc` type-checking. It is safe to run locally and is a canonical pre-merge gate used in CI.
- To auto-fix fixable lint issues for staged files, use `npm run lint:fix` or set up `lint-staged` (not configured by default).

## Security Scanning

This repo uses GitHub CodeQL for automated security scanning. CodeQL runs automatically on:

- Every push to `main` and `preview` branches
- Every pull request to `main`
- Daily at 06:00 UTC

You can also run dependency checks locally:

```sh
npm audit
```

## Pre-commit / pre-push hooks (recommended)

For a single-developer workflow, we do not enforce commit hooks by default. Consider adding `husky` + `lint-staged` to automatically format and lint staged files before commits.

## Environment

If you rely on services (Redis, Resend, GitHub token) for local features, use `.env.local` or `vercel env pull .env.development.local` to populate environment variables. Example keys used by the app:

- `REDIS_URL` — Redis for view counts
- `RESEND_API_KEY` — emails via Resend
- `GITHUB_TOKEN` — optional GitHub token for higher API rate limits

## How to contribute

- Make a small change in a branch.
- Run `npm run check` locally and fix errors/warnings.
- Open a pull request against the default branch and include a short description of the change.

Thanks — and happy hacking!
