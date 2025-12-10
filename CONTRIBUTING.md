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

### Proprietary Specifications

This project uses specialized AI agent instructions and pattern enforcement systems that are proprietary to dcyfr-labs.

#### What You CAN Do

✅ **Learn and reference** patterns from `/docs/ai/`  
✅ **Use templates** from `/docs/templates/` in your own projects  
✅ **Follow** documented design patterns and standards  
✅ **Request DCYFR mode** for your feature work  
✅ **Suggest improvements** via GitHub Issues  
✅ **Contribute** code that follows published patterns  

#### What You CANNOT Do

❌ **Redistribute** `.github/agents/` files or DCYFR specifications  
❌ **Use DCYFR architecture** in competing projects  
❌ **Modify** proprietary specifications without approval  
❌ **Copy** enforcement system to other repositories  
❌ **Claim ownership** of DCYFR system components  

#### How to Extend DCYFR

Want to improve DCYFR patterns or suggest new features?

1. **Open an issue** describing your suggestion
2. **Provide examples** of the pattern or problem
3. **Get approval** from @dcyfr before implementing
4. **Submit PR** linked to the approved issue
5. **Work collaboratively** on integration

This ensures proprietary systems remain secure while allowing collaborative evolution.

### Licensing

This repository uses multiple licenses:

- **MIT License** - All source code in `/src/`, `/tests/`, `/scripts/`
- **CC BY-SA 4.0** - Documentation in `/docs/`
- **Proprietary** - DCYFR specifications in `.github/agents/`

See [LICENSE.md](LICENSE.md) for complete details.

For questions about what's protected and why, see [.github/DCYFR_STATEMENT.md](.github/DCYFR_STATEMENT.md).

---

Thanks — and happy hacking!
