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

Note: The repository runs a pre-commit scan for likely PII/Proprietary markers using `scripts/check-for-pii.mjs` (automatically via Husky pre-commit) and a PR-level scan via GitHub Action (`.github/workflows/pii-scan.yml`). This helps prevent accidental commits of sensitive content.

### Example files and private keys

If you include examples that show private key blocks or service account JSON, follow these rules:

- Use placeholders (e.g., `...`) and include `EXAMPLE` or `REDACTED` markers adjacent to the snippet.
- If a real key must be used for CI, store it securely in a secrets manager and never commit a real key into the repo.
- When in doubt, use `docs/operations/private/README.template.md` and external secure storage for sensitive examples.

## PII/Allowlist Handling

If you find that legitimate documentation (examples, placeholders, or definitions) is flagged by the PII/PI scanner, follow these steps to request an allowlist entry:

1. Open a non-breaking PR that updates `.pii-allowlist.json`.
2. Add the path (or domain/email) to `paths`/`proprietaryPaths` and add a `allowlistReasons` entry with a short justification and approver name.
3. In the PR description, provide a short explanation and why the path should be allowlisted (ex: `docs/ai/logging-security.md contains a definition; not real PI`).
4. At least one owner from the security/ops team (`@dcyfr`) must approve the change.

Note: Do not use allowlist entries as a shortcut to avoid redacting or removing real secrets. If a secret is found in the repo, remove it and add a remediation note to the PR instead.

If you maintain the allowlist or are preparing a change, use these helpers locally:

```bash
npm run validate:allowlist  # validate allowlist JSON has reasons for entries
npm run audit:allowlist     # print allowlist entries and reasons for audits
```

If you want to locally parse a gitleaks report (for debugging), run:

```bash
npm run parse:gitleaks-report ./gitleaks-report.json
```

### PII vs. PI Allowlisting Guidelines (Short Version)
- PII allowlist entries are for test data or placeholders (e.g., `example.com`, `test@test.com`) and should be treated conservatively; preference is to redact or mask. Add to `piiPaths` or `paths` as appropriate.
- PI allowlist entries (business or proprietary content) are for documentation that explains or defines proprietary systems (e.g., `docs/ai/logging-security.md`) and require stronger justification and an owner signoff; add to `piPaths` or `proprietaryPaths` as appropriate.

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
