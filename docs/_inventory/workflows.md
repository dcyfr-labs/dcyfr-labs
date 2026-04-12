<!-- TLP:CLEAR -->

# Inventory — workflows

**Total:** 54 workflow files
**Generated:** 2026-04-12

**Note:** `required_by_branch_protection` field is not populated by this script — it requires `gh api repos/dcyfr/dcyfr-labs/branches/main/protection` and authenticated access. Check manually before deletion.

| file                              | triggers                                                                      | overlapping_with_same_prefix                                      | last_touched |
| --------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------ |
| accessibility.yml                 | pull_request, paths, push, branches, schedule, workflow_dispatch              | —                                                                 | 2026-01-14   |
| auto-calver.yml                   | push, branches                                                                | —                                                                 | 2026-04-07   |
| automated-metrics-collection.yml  | workflow_run, workflows, types, workflow_dispatch, inputs                     | —                                                                 | 2026-01-14   |
| cache-refresh.yml                 | schedule, workflow_dispatch                                                   | —                                                                 | 2026-04-07   |
| codeql-autofix.yml                | workflow_dispatch, inputs, schedule                                           | codeql.yml                                                        | 2026-02-17   |
| codeql.yml                        | push, branches, paths, pull_request, schedule                                 | codeql-autofix.yml                                                | 2026-04-07   |
| dependabot-auto-merge.yml         | pull_request, types, workflow_dispatch                                        | —                                                                 | 2026-03-05   |
| dependency-dashboard.yml          | schedule, workflow_dispatch, inputs                                           | —                                                                 | 2026-01-14   |
| deploy.yml                        | push, branches, paths, workflow_dispatch                                      | —                                                                 | 2026-01-14   |
| design-token-validation.yml       | pull_request, paths, push, branches                                           | —                                                                 | 2026-02-15   |
| governance-validation.yml         | pull_request, paths, push, branches                                           | —                                                                 | 2026-02-15   |
| issue-triage-automation.yml       | issues, types, schedule, workflow_dispatch, inputs                            | —                                                                 | 2026-02-24   |
| lighthouse-ci.yml                 | pull_request, branches, paths, workflow_dispatch                              | —                                                                 | 2026-04-10   |
| mcp-server-check.yml              | schedule, workflow_dispatch                                                   | —                                                                 | 2026-02-15   |
| monthly-cleanup.yml               | schedule, workflow_dispatch                                                   | monthly-security-review.yml                                       | 2026-01-14   |
| monthly-security-review.yml       | schedule, workflow_dispatch, inputs                                           | monthly-cleanup.yml                                               | 2026-01-14   |
| nuclei-scan.yml                   | workflow_run, workflows, types, branches, schedule, workflow_dispatch, inputs | nuclei-templates-sync.yml                                         | 2026-04-07   |
| nuclei-templates-sync.yml         | schedule, workflow_dispatch, inputs                                           | nuclei-scan.yml                                                   | 2026-02-01   |
| perf-monitor.yml                  | workflow_dispatch, schedule                                                   | —                                                                 | 2026-01-14   |
| performance-monitoring.yml        | push, branches, paths, schedule, workflow_dispatch, inputs                    | —                                                                 | 2026-01-14   |
| post-deploy-refresh.yml           | deployment_status                                                             | post-deploy.yml                                                   | 2026-01-30   |
| post-deploy.yml                   | deployment_status, workflow_dispatch, inputs                                  | post-deploy-refresh.yml                                           | 2026-02-01   |
| pr-automation.yml                 | pull_request, types                                                           | pr-resolution-plan.yml, pr-review-automation.yml                  | 2026-02-17   |
| pr-resolution-plan.yml            | pull_request, types, branches, workflow_dispatch, inputs                      | pr-automation.yml, pr-review-automation.yml                       | 2026-02-17   |
| pr-review-automation.yml          | pull_request, types, branches, workflow_dispatch, inputs                      | pr-automation.yml, pr-resolution-plan.yml                         | 2026-03-28   |
| privacy-suite.yml                 | pull_request, paths, push, branches, schedule, workflow_dispatch, inputs      | —                                                                 | 2026-02-17   |
| prose-validation.yml              | pull_request, paths, schedule, workflow_dispatch                              | —                                                                 | 2026-02-22   |
| protect-preview-branch.yml        | delete                                                                        | —                                                                 | 2025-12-27   |
| regenerate-diagrams.yml           | push, branches, paths, workflow_dispatch, inputs                              | —                                                                 | 2026-03-28   |
| release-automation.yml            | push, branches, workflow_dispatch, inputs                                     | —                                                                 | 2026-02-17   |
| sast-semgrep.yml                  | push, branches, paths, pull_request, schedule, workflow_dispatch, inputs      | —                                                                 | 2026-03-24   |
| sbom-generation.yml               | push, tags, schedule, workflow_dispatch, inputs                               | —                                                                 | 2026-02-17   |
| security-prompt-scan.yml          | push, branches, paths, pull_request, schedule, workflow_dispatch, inputs      | security-review.yml, security-suite.yml                           | 2026-02-17   |
| security-review.yml               | pull_request, types                                                           | security-prompt-scan.yml, security-suite.yml                      | 2026-03-03   |
| security-suite.yml                | pull_request, paths, push, branches, schedule, workflow_dispatch, inputs      | security-prompt-scan.yml, security-review.yml                     | 2026-02-17   |
| sonarcloud.yml                    | pull_request, branches, paths, push                                           | —                                                                 | 2026-03-24   |
| stale.yml                         | schedule, workflow_dispatch                                                   | —                                                                 | 2025-12-04   |
| sync-preview-branch.yml           | push, branches, workflow_dispatch, inputs                                     | sync-production-metrics.yml                                       | 2025-11-26   |
| sync-production-metrics.yml       | schedule, workflow_dispatch, inputs                                           | sync-preview-branch.yml                                           | 2026-04-10   |
| test-preview-fast.yml             | push, branches, paths, pull_request                                           | test.yml                                                          | 2026-04-07   |
| test.yml                          | push, branches, paths, pull_request                                           | test-preview-fast.yml                                             | 2026-04-10   |
| universal-pr-auto-merge.yml       | pull_request, types, check_suite, status, workflow_dispatch, inputs           | —                                                                 | 2026-02-24   |
| update-baseline-mapping.yml       | schedule, workflow_dispatch                                                   | —                                                                 | 2026-01-14   |
| validate-botid.yml                | push, branches, paths, pull_request                                           | validate-dependabot.yml, validate-feeds.yml, validate-sitemap.yml | 2026-01-14   |
| validate-dependabot.yml           | push, branches, pull_request                                                  | validate-botid.yml, validate-feeds.yml, validate-sitemap.yml      | 2025-12-11   |
| validate-feeds.yml                | pull_request, paths                                                           | validate-botid.yml, validate-dependabot.yml, validate-sitemap.yml | 2026-02-15   |
| validate-sitemap.yml              | pull_request, paths, push, branches                                           | validate-botid.yml, validate-dependabot.yml, validate-feeds.yml   | 2026-02-15   |
| validation-suite.yml              | pull_request, paths, push, branches, schedule, workflow_dispatch              | —                                                                 | 2026-02-17   |
| vercel-checks.yml                 | deployment_status, workflow_dispatch, inputs                                  | vercel-deployment-remediation.yml                                 | 2026-04-07   |
| vercel-deployment-remediation.yml | deployment_status, workflow_dispatch, inputs                                  | vercel-checks.yml                                                 | 2026-04-10   |
| verified-commits.yml              | (unknown)                                                                     | —                                                                 | 2026-03-24   |
| visual-regression.yml             | pull_request, branches, paths, workflow_dispatch, inputs                      | —                                                                 | 2026-04-07   |
| weekly-test-health.yml            | schedule, workflow_dispatch, inputs                                           | —                                                                 | 2026-04-07   |
| workflow-health-report.yml        | schedule, workflow_dispatch, inputs                                           | —                                                                 | 2026-01-14   |
