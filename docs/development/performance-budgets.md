Performance Budgets
====================

This repository supports defining performance budgets that are checked during CI.

Location (CI): `reports/performance/baselines/performance-budgets.json`

Example file (in repo): `docs/development/performance-budgets.example.json`

Workflow:
1. Deploy a production build and inspect bundle sizes.
2. Copy `docs/development/performance-budgets.example.json` to `reports/performance/baselines/performance-budgets.json` (this folder is intentionally gitignored to prevent leaking measurements).
3. Update numeric targets to reflect realistic goals for your app.
4. Commit `reports/performance/baselines/performance-budgets.json` to enforce checks in CI.

Notes:
- The `scripts/performance/check-bundle-size.mjs` script will warn if `performance-budgets.json` is missing and uses permissive defaults.
- Use `npm run perf:analyze` to inspect per-file bundle composition when tuning budgets.
