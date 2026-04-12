<!-- TLP:CLEAR -->

# Inventory — external references

**Findings:** 54
**Generated:** 2026-04-12

**Note:** Branch protection required-checks need `gh api repos/dcyfr/dcyfr-labs/branches/main/protection` (not run by this script). Check manually before any workflow consolidation that touches required-status names.

| source                                                        | kind                 | target                                | detail                              |
| ------------------------------------------------------------- | -------------------- | ------------------------------------- | ----------------------------------- |
| vercel.json                                                   | cron                 | /api/admin/populate-cache             | schedule: 0 6 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/update-analytics-milestones | schedule: 0 2 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/refresh-credly-cache        | schedule: 0 6 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/refresh-github-data         | schedule: 0 \* \* \* \*             |
| vercel.json                                                   | cron                 | /api/cron/verify-indexnow-key         | schedule: 0 _/12 _ \* \*            |
| vercel.json                                                   | cron                 | /api/cron/session-cleanup             | schedule: 0 2 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/session-monitoring          | schedule: 0 0,4,8,12,16,20 \* \* \* |
| vercel.json                                                   | cron                 | /api/cron/session-security-audit      | schedule: 0 3 \* \* 0               |
| vercel.json                                                   | cron                 | /api/cron/daily-security-test         | schedule: 0 1 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/ip-reputation-check         | schedule: 0 0,4,8,12,16,20 \* \* \* |
| vercel.json                                                   | cron                 | /api/cron/security-advisory-monitor   | schedule: 0 0,8,16 \* \* \*         |
| vercel.json                                                   | cron                 | /api/cron/sync-vercel-analytics       | schedule: 0 2 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/sync-inoreader-feeds        | schedule: 0 _/6 _ \* \*             |
| vercel.json                                                   | cron                 | /api/cron/aggregate-referrals         | schedule: 0 2 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/sync-devto-metrics          | schedule: 0 _/6 _ \* \*             |
| vercel.json                                                   | cron                 | /api/cron/refresh-activity-feed       | schedule: 0 \* \* \* \*             |
| vercel.json                                                   | cron                 | /api/cron/calculate-trending          | schedule: 0 \* \* \* \*             |
| vercel.json                                                   | cron                 | /api/cron/daily-analytics-summary     | schedule: 0 0 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/monitor-api-costs           | schedule: 0 9 \* \* \*              |
| vercel.json                                                   | cron                 | /api/cron/monthly-api-cost-report     | schedule: 0 10 1 \* \*              |
| .github/dependabot.yml                                        | dependabot           | npm,github-actions                    | auto-PR ecosystems                  |
| scripts/\_inventory.mjs                                       | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/cache-refresh.yml                           | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/lighthouse-ci.yml                           | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/nuclei-scan.yml                             | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/prose-validation.yml                        | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/sonarcloud.yml                              | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/sync-production-metrics.yml                 | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/test-preview-fast.yml                       | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/test.yml                                    | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/vercel-checks.yml                           | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/vercel-deployment-remediation.yml           | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/visual-regression.yml                       | 1password-secret-ref | op://                                 | secret reference                    |
| .github/workflows/weekly-test-health.yml                      | 1password-secret-ref | op://                                 | secret reference                    |
| src/instrumentation-client.ts                                 | sentry               | SENTRY_DSN                            | telemetry env var                   |
| scripts/\_inventory.mjs                                       | sentry               | SENTRY_DSN                            | telemetry env var                   |
| scripts/setup/sentry/configure-sentry.sh                      | sentry               | SENTRY_DSN                            | telemetry env var                   |
| scripts/setup/sentry/verify-sentry-events.sh                  | sentry               | SENTRY_DSN                            | telemetry env var                   |
| docs/configuration/ENV_SETUP.md                               | sentry               | SENTRY_DSN                            | telemetry env var                   |
| docs/debugging/debugging-quick-ref.md                         | sentry               | SENTRY_DSN                            | telemetry env var                   |
| docs/debugging/dev-debugging-guide.md                         | sentry               | SENTRY_DSN                            | telemetry env var                   |
| docs/delegation/observability-integration.md                  | sentry               | SENTRY_DSN                            | telemetry env var                   |
| docs/features/api-cost-monitoring.md                          | sentry               | SENTRY_DSN                            | telemetry env var                   |
| docs/features/inngest-error-alerting-checklist.md             | sentry               | SENTRY_DSN                            | telemetry env var                   |
| src/app/api/inngest/route.ts                                  | inngest              | INNGEST\_\*                           | background-job env var              |
| src/content/blog/building-event-driven-architecture/index.mdx | inngest              | INNGEST\_\*                           | background-job env var              |
| src/inngest/error-handler.ts                                  | inngest              | INNGEST\_\*                           | background-job env var              |
| src/lib/site-config.ts                                        | inngest              | INNGEST\_\*                           | background-job env var              |
| scripts/\_inventory.mjs                                       | inngest              | INNGEST\_\*                           | background-job env var              |
| scripts/invalidate-cache-on-deploy.mjs                        | inngest              | INNGEST\_\*                           | background-job env var              |
| scripts/utilities/backfill-google-indexing.mjs                | inngest              | INNGEST\_\*                           | background-job env var              |
| docs/architecture/cache-versioning-guide.md                   | inngest              | INNGEST\_\*                           | background-job env var              |
| docs/configuration/ENV_SETUP.md                               | inngest              | INNGEST\_\*                           | background-job env var              |
| docs/deployment/github-webhook-setup.md                       | inngest              | INNGEST\_\*                           | background-job env var              |
