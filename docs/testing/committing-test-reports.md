Committing Test Reports
=======================

Some teams prefer committing test reports (HTML, JSON summaries) for historical visibility. This repo allows committing *sanitized* textual reports (HTML/JSON/TXT) but has a few important rules:

What to commit
- `playwright-report/` (HTML report) — useful for sharing a stable HTML report with reviewers.
- `coverage/` (coverage reports) — useful for historical coverage tracking.
- `test-results/` (CI-friendly test summaries in JSON) — good for automation and dashboards.

What not to commit
- Screenshots, videos, diffs (e.g., `reports/e2e-artifacts/`) — these can be large and may contain sensitive information.
- Any raw logs that may contain PII, tokens, or system paths.

Before committing
1. Run the PII scanner on reports:

```bash
npm run scan:reports
```

2. If the scanner reports issues, remove or redact the offending content before committing.

3. Make sure binary artifacts (images/videos) are intentionally excluded or moved to an external artifact store.

Automating checks
- The repo includes `scripts/validation/check-reports-for-pii.mjs` which scans for common PII patterns in text files under `reports/`.
- Consider adding a CI job to run `npm run scan:reports` on PRs that add or modify artifacts in `reports/`.

Notes:
- The existing `npm run scan:pi` will perform a repository-wide PII scan and is a good pre-commit step for all changes.
- Use `reports/performance/baselines/` for per-deployment budget files (see `docs/development/performance-budgets.md`).
