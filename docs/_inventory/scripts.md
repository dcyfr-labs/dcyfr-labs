<!-- TLP:CLEAR -->

# Inventory — npm scripts

**Total:** 245 scripts (43 referenced, 202 orphan candidates)
**Generated:** 2026-04-12 via `scripts/_inventory.mjs`

**Status meaning:**

- `used` — at least one of: referenced from a workflow, husky hook, another npm script, or `vercel.json` `buildCommand`
- `orphan` — no automated reference found (still may be invoked by humans or external systems — verify before delete)

| script                            | definition                                                                            | referenced_by               | status     |
| --------------------------------- | ------------------------------------------------------------------------------------- | --------------------------- | ---------- |
| a11y:audit                        | `npm run validate:contrast && npm run test:e2e -- --grep "accessibility\|a11y"`       | —                           | **orphan** |
| ai                                | `node scripts/ai-cli.mjs`                                                             | —                           | **orphan** |
| ai:costs                          | `node scripts/ai-cli.mjs costs`                                                       | —                           | **orphan** |
| ai:costs:archive                  | `node scripts/ai-cli.mjs costs:archive`                                               | —                           | **orphan** |
| ai:costs:export:csv               | `node scripts/ai-cli.mjs costs export:csv`                                            | —                           | **orphan** |
| ai:costs:export:json              | `node scripts/ai-cli.mjs costs export:json`                                           | —                           | **orphan** |
| ai:costs:view                     | `node scripts/ai-cli.mjs costs view`                                                  | —                           | **orphan** |
| analytics:clear                   | `node scripts/clear-test-data.mjs`                                                    | —                           | **orphan** |
| analytics:populate                | `node scripts/populate-analytics-milestones.mjs`                                      | —                           | **orphan** |
| analytics:update                  | `curl -X POST http://localhost:3000/api/analytics/update-milestones`                  | —                           | **orphan** |
| analytics:update:prod             | `curl -X POST https://www.dcyfr.dev/api/analytics/update-milestones -H "Authoriza…`   | —                           | **orphan** |
| audit:suppressions                | `bash scripts/audit-suppressions.sh`                                                  | —                           | **orphan** |
| build                             | `npm run validate:content && npm run build:search && npm run build:populate-cache…`   | workflow, npm-script        | used       |
| build:populate-cache              | `node scripts/populate-build-cache.mjs`                                               | npm-script                  | used       |
| build:search                      | `tsx src/lib/search/build-index.ts`                                                   | npm-script                  | used       |
| changelog                         | `node scripts/changelog.mjs`                                                          | workflow                    | used       |
| changelog:check                   | `node scripts/validate-changelog-sync.mjs`                                            | workflow                    | used       |
| changelog:check:strict            | `node scripts/validate-changelog-sync.mjs --strict`                                   | —                           | **orphan** |
| changelog:generate                | `node scripts/generate-changelog-entry.mjs`                                           | —                           | **orphan** |
| changelog:validate                | `node scripts/validate-changelog-format.mjs`                                          | workflow                    | used       |
| check                             | `npm run lint && npm run typecheck`                                                   | workflow, npm-script        | used       |
| check:ai-visibility               | `npx tsx scripts/validation/validate-ai-visibility.ts`                                | —                           | **orphan** |
| check:docs                        | `node scripts/validate.mjs docs`                                                      | workflow                    | used       |
| check:emoji                       | `node scripts/analyze-emoji-usage.mjs`                                                | —                           | **orphan** |
| check:emoji:strict                | `node scripts/analyze-emoji-usage.mjs --strict`                                       | —                           | **orphan** |
| check:governance                  | `node scripts/validate-governance.mjs`                                                | workflow                    | used       |
| check:private-refs                | `node scripts/check-private-references.mjs`                                           | —                           | **orphan** |
| check:schema                      | `npx tsx scripts/validation/validate-structured-data.ts`                              | —                           | **orphan** |
| check:tokens                      | `node scripts/validate.mjs design-tokens`                                             | workflow                    | used       |
| check:voice                       | `node scripts/validate.mjs voice-compliance`                                          | —                           | **orphan** |
| check:voice:warn                  | `node scripts/validate.mjs voice-compliance --mode warn`                              | —                           | **orphan** |
| checkpoint:start                  | `bash scripts/auto-checkpoint.sh`                                                     | —                           | **orphan** |
| checkpoint:stop                   | `bash scripts/checkpoint-stop.sh`                                                     | —                           | **orphan** |
| ci:status                         | `node scripts/ci-status.mjs`                                                          | —                           | **orphan** |
| classify:docs                     | `node scripts/classify-docs.mjs`                                                      | —                           | **orphan** |
| classify:docs:execute             | `node scripts/classify-docs.mjs --execute`                                            | —                           | **orphan** |
| classify:docs:verbose             | `node scripts/classify-docs.mjs --verbose`                                            | —                           | **orphan** |
| claude:analyze:errors             | `bash scripts/claude-code-automation.sh analyze-errors`                               | —                           | **orphan** |
| claude:audit:tokens               | `bash scripts/claude-code-automation.sh design-token-audit`                           | —                           | **orphan** |
| claude:check:pre-commit           | `bash scripts/claude-code-automation.sh pre-commit-check`                             | —                           | **orphan** |
| claude:ci                         | `bash scripts/claude-code-automation.sh ci-pipeline`                                  | —                           | **orphan** |
| claude:help                       | `bash scripts/claude-code-automation.sh help`                                         | —                           | **orphan** |
| claude:lint                       | `bash scripts/claude-code-automation.sh lint-subjective`                              | —                           | **orphan** |
| cleanup:check                     | `node scripts/cleanup-check.mjs`                                                      | —                           | **orphan** |
| cleanup:links                     | `node scripts/cleanup-broken-links.mjs`                                               | —                           | **orphan** |
| clear-cache:repos                 | `node -e "const {rmSync,existsSync}=require('fs'); const dir='.cache/github-repos…`   | —                           | **orphan** |
| deploy:invalidate                 | `node scripts/invalidate-cache-on-deploy.mjs`                                         | workflow                    | used       |
| deploy:invalidate:force           | `node scripts/invalidate-cache-on-deploy.mjs --force`                                 | —                           | **orphan** |
| deploy:webhook                    | `bash scripts/deploy-github-webhook.sh`                                               | —                           | **orphan** |
| deps:tree                         | `node scripts/deps-tree.mjs`                                                          | —                           | **orphan** |
| dev                               | `op run --env-file=.env -- node scripts/dev-with-cache.mjs`                           | workflow                    | used       |
| dev:check                         | `node scripts/dev-utils.mjs check`                                                    | —                           | **orphan** |
| dev:check:fast                    | `node scripts/dev-utils.mjs check -- --fast`                                          | —                           | **orphan** |
| dev:check:fix                     | `node scripts/dev-utils.mjs check -- --fix`                                           | —                           | **orphan** |
| dev:clean                         | `node scripts/dev-utils.mjs clean`                                                    | —                           | **orphan** |
| dev:fast                          | `op run --env-file=.env -- next dev --turbopack --port 3000`                          | —                           | **orphan** |
| dev:fresh                         | `op run --env-file=.env -- node scripts/dev-with-cache.mjs --kill-port`               | —                           | **orphan** |
| dev:health                        | `node scripts/dev-utils.mjs health`                                                   | —                           | **orphan** |
| dev:https                         | `op run --env-file=.env -- node server.mjs`                                           | —                           | **orphan** |
| dev:reset                         | `node scripts/dev-utils.mjs reset`                                                    | —                           | **orphan** |
| dev:utils                         | `node scripts/dev-utils.mjs`                                                          | —                           | **orphan** |
| diagrams:generate                 | `bash scripts/generate-diagrams.sh`                                                   | —                           | **orphan** |
| docs:add-tlp-markers              | `node scripts/add-tlp-markers.mjs`                                                    | —                           | **orphan** |
| docs:add-tlp-markers:dry-run      | `node scripts/add-tlp-markers.mjs --dry-run`                                          | —                           | **orphan** |
| docs:cleanup                      | `node scripts/docs-archive-cleanup.mjs`                                               | —                           | **orphan** |
| docs:compliance-report            | `node scripts/generate-compliance-report.mjs`                                         | —                           | **orphan** |
| docs:fix-private-markers          | `node scripts/fix-private-tlp-markers.mjs`                                            | —                           | **orphan** |
| docs:fix-private-markers:dry-run  | `node scripts/fix-private-tlp-markers.mjs --dry-run`                                  | —                           | **orphan** |
| docs:rationalize                  | `node scripts/docs-rationalize.mjs execute`                                           | —                           | **orphan** |
| docs:rationalize:analyze          | `node scripts/docs-rationalize.mjs analyze --verbose`                                 | —                           | **orphan** |
| docs:rationalize:archive          | `node scripts/docs-rationalize.mjs archive`                                           | —                           | **orphan** |
| docs:rationalize:consolidate      | `node scripts/docs-rationalize.mjs consolidate`                                       | —                           | **orphan** |
| docs:rationalize:dry-run          | `node scripts/docs-rationalize.mjs execute --dry-run`                                 | —                           | **orphan** |
| doctor                            | `npm run check && npm run test && npm run perf:check`                                 | —                           | **orphan** |
| engagement:consolidate            | `node scripts/consolidate-event-driven-engagement.mjs`                                | —                           | **orphan** |
| engagement:consolidate:dry-run    | `node scripts/consolidate-event-driven-engagement.mjs --dry-run`                      | —                           | **orphan** |
| engagement:restore                | `node scripts/restore-engagement-data.mjs`                                            | —                           | **orphan** |
| engagement:verify                 | `node scripts/verify-engagement-fix.mjs`                                              | —                           | **orphan** |
| fix:barrels                       | `node scripts/fix-barrel-exports.mjs`                                                 | —                           | **orphan** |
| fix:barrels:auto                  | `node scripts/fix-barrel-exports.mjs --fix`                                           | —                           | **orphan** |
| generate:hero                     | `node scripts/content/generate-blog-hero.mjs`                                         | —                           | **orphan** |
| generate:hero:all                 | `node scripts/content/generate-blog-hero.mjs --all`                                   | —                           | **orphan** |
| generate:project-hero             | `node scripts/content/generate-project-hero.mjs --all`                                | —                           | **orphan** |
| github:clear-cache-warnings       | `node scripts/clear-github-cache-warnings.mjs`                                        | —                           | **orphan** |
| github:refresh                    | `curl -s http://localhost:3000/api/dev/refresh-github \| json_pp`                     | —                           | **orphan** |
| github:status                     | `node scripts/diagnose-github-cache.mjs`                                              | —                           | **orphan** |
| gitleaks:install                  | `echo 'Install with: brew install gitleaks (Mac) or see https://github.com/gitlea…`   | —                           | **orphan** |
| health                            | `node scripts/health-cli.mjs`                                                         | —                           | **orphan** |
| health:all                        | `node scripts/health-cli.mjs all`                                                     | —                           | **orphan** |
| health:dev                        | `node scripts/health-cli.mjs dev`                                                     | —                           | **orphan** |
| health:mcp                        | `node scripts/health-cli.mjs mcp`                                                     | —                           | **orphan** |
| health:providers                  | `node scripts/health-cli.mjs providers`                                               | —                           | **orphan** |
| learning:add                      | `node scripts/learning/add-learning.mjs`                                              | —                           | **orphan** |
| learning:collect                  | `node scripts/learning/collect-metrics.mjs`                                           | —                           | **orphan** |
| learning:query                    | `node scripts/learning/query-knowledge.mjs`                                           | —                           | **orphan** |
| learning:report                   | `node scripts/learning/generate-report.mjs`                                           | —                           | **orphan** |
| lhci:analyze                      | `node scripts/analyze-core-web-vitals.mjs`                                            | npm-script                  | used       |
| lhci:assert                       | `lhci assert --config .lighthouse/rc.json`                                            | workflow                    | used       |
| lhci:autorun                      | `lhci autorun --config .lighthouse/rc.json`                                           | workflow                    | used       |
| lhci:collect                      | `lhci collect --config .lighthouse/rc.json`                                           | npm-script                  | used       |
| lhci:upload                       | `lhci upload --config .lighthouse/rc.json`                                            | —                           | **orphan** |
| lib:consolidate                   | `node scripts/lib-consolidate.mjs analyze`                                            | —                           | **orphan** |
| lib:consolidate:analyze           | `node scripts/lib-consolidate.mjs analyze --verbose`                                  | —                           | **orphan** |
| lib:consolidate:consolidate       | `node scripts/lib-consolidate.mjs consolidate-all`                                    | —                           | **orphan** |
| lib:consolidate:dry-run           | `node scripts/lib-consolidate.mjs dry-run`                                            | —                           | **orphan** |
| lighthouse:baseline               | `npm run update:baseline && npm run build && npm run lhci:collect && npm run lhci…`   | —                           | **orphan** |
| lighthouse:ci                     | `npm run update:baseline && npm run build && lhci autorun --config .lighthouse/rc…`   | —                           | **orphan** |
| lint                              | `node scripts/run-eslint.mjs`                                                         | workflow, husky, npm-script | used       |
| lint:ci                           | `node scripts/run-eslint.mjs`                                                         | workflow                    | used       |
| lint:docs                         | `node scripts/validate-docs-links.mjs`                                                | —                           | **orphan** |
| lint:fix                          | `node scripts/run-eslint.mjs --fix`                                                   | workflow, husky             | used       |
| lint:mermaid                      | `node scripts/validate-cli.mjs mermaid`                                               | —                           | **orphan** |
| memory:load-test                  | `node scripts/memory-load-test.mjs`                                                   | —                           | **orphan** |
| memory:load-test:heavy            | `node scripts/memory-load-test.mjs --concurrent=20 --memories=50 --searches=25`       | —                           | **orphan** |
| memory:load-test:quick            | `node scripts/memory-load-test.mjs --concurrent=5 --memories=10 --searches=5`         | —                           | **orphan** |
| migrate:tokens                    | `tsx scripts/migrate-design-tokens.ts`                                                | —                           | **orphan** |
| migrate:tokens:apply              | `tsx scripts/migrate-design-tokens.ts -- --apply`                                     | —                           | **orphan** |
| migrate:tokens:report             | `tsx scripts/migrate-design-tokens.ts > docs/reports/MIGRATION_REPORT_$(date +%Y-…`   | —                           | **orphan** |
| migrate:v1                        | `node scripts/migrate-v1-content.mjs`                                                 | —                           | **orphan** |
| migrate:v1:dry-run                | `node scripts/migrate-v1-content.mjs --dry-run`                                       | —                           | **orphan** |
| migrate:v1:p0                     | `node scripts/migrate-v1-content.mjs --priority=P0`                                   | —                           | **orphan** |
| migrate:v1:verbose                | `node scripts/migrate-v1-content.mjs --verbose`                                       | —                           | **orphan** |
| perf:analyze                      | `ANALYZE=true npm run build`                                                          | —                           | **orphan** |
| perf:check                        | `npm run build && node scripts/performance/check-bundle-size.mjs`                     | workflow, npm-script        | used       |
| perf:metrics                      | `node scripts/analyze-perf-metrics.mjs`                                               | —                           | **orphan** |
| perf:metrics:30d                  | `node scripts/analyze-perf-metrics.mjs --days=30`                                     | —                           | **orphan** |
| perf:metrics:7d                   | `node scripts/analyze-perf-metrics.mjs --days=7`                                      | —                           | **orphan** |
| perf:monitor                      | `npm run perf:check && npm run test:coverage`                                         | —                           | **orphan** |
| populate:cache                    | `node scripts/populate-local-cache.mjs`                                               | —                           | **orphan** |
| port:check                        | `node scripts/port-utils.mjs check`                                                   | —                           | **orphan** |
| port:kill                         | `node scripts/port-utils.mjs kill`                                                    | —                           | **orphan** |
| prelhci:assert                    | `npm run update:baseline`                                                             | —                           | **orphan** |
| prelhci:autorun                   | `npm run update:baseline`                                                             | —                           | **orphan** |
| prelhci:collect                   | `npm run update:baseline`                                                             | —                           | **orphan** |
| prelighthouse:ci                  | `npm run update:baseline`                                                             | —                           | **orphan** |
| prepare                           | `husky`                                                                               | —                           | **orphan** |
| prose:check                       | `node scripts/validate-prose.mjs`                                                     | workflow                    | used       |
| prose:check:file                  | `node scripts/validate-prose.mjs --file`                                              | —                           | **orphan** |
| prose:check:picky                 | `node scripts/validate-prose.mjs --picky`                                             | —                           | **orphan** |
| prose:check:staged                | `node scripts/validate-prose.mjs --staged`                                            | —                           | **orphan** |
| prose:check:strict                | `node scripts/validate-prose.mjs --strict`                                            | —                           | **orphan** |
| prose:list-dictionary             | `node scripts/setup-languagetool-dictionary.mjs --list`                               | —                           | **orphan** |
| prose:setup-dictionary            | `node scripts/setup-languagetool-dictionary.mjs`                                      | —                           | **orphan** |
| redis:analyze                     | `node scripts/analyze-upstash-data-fast.mjs`                                          | —                           | **orphan** |
| redis:cleanup                     | `node scripts/cleanup-upstash-data.mjs`                                               | —                           | **orphan** |
| redis:cleanup:all                 | `node scripts/cleanup-upstash-data.mjs --include-stale`                               | —                           | **orphan** |
| redis:clear                       | `node scripts/clear-activity-cache.mjs`                                               | —                           | **orphan** |
| redis:health                      | `node scripts/health-cli.mjs redis`                                                   | —                           | **orphan** |
| redis:health:clean                | `node scripts/health-cli.mjs redis -- --clean`                                        | —                           | **orphan** |
| redis:health:github               | `node scripts/health-cli.mjs redis -- --github`                                       | —                           | **orphan** |
| redis:keys                        | `node scripts/check-redis-keys.mjs`                                                   | —                           | **orphan** |
| redis:test-upstash                | `node scripts/test-upstash-connection.mjs`                                            | —                           | **orphan** |
| release:bump                      | `node scripts/release/bump-version.mjs`                                               | —                           | **orphan** |
| release:bump:dry-run              | `node scripts/release/bump-version.mjs --dry-run`                                     | —                           | **orphan** |
| release:changelog                 | `node scripts/release/generate-changelog-entry.mjs`                                   | —                           | **orphan** |
| release:notes                     | `node scripts/release/create-release-notes.mjs`                                       | —                           | **orphan** |
| release:test                      | `vitest run scripts/release/__tests__`                                                | —                           | **orphan** |
| release:update                    | `node scripts/release/update-changelog.mjs`                                           | —                           | **orphan** |
| sbom:generate                     | `node scripts/security/generate-sbom.mjs`                                             | workflow                    | used       |
| scan:docs:secrets                 | `node scripts/ci/check-docs-secrets.mjs`                                              | —                           | **orphan** |
| scan:gitleaks:all                 | `gitleaks detect --source . --redact --config=.gitleaks.toml`                         | —                           | **orphan** |
| scan:gitleaks:local               | `gitleaks protect --staged --redact --config=.gitleaks.toml`                          | —                           | **orphan** |
| scan:pi                           | `node scripts/ci/check-for-pii.mjs`                                                   | workflow, husky             | used       |
| scan:pi:all                       | `node scripts/ci/check-for-pii.mjs --all`                                             | workflow                    | used       |
| scan:reports                      | `node scripts/validation/check-reports-for-pii.mjs`                                   | workflow                    | used       |
| scripts:list                      | `node scripts/scripts-list.mjs`                                                       | —                           | **orphan** |
| security:audit-suppressions       | `bash scripts/security/audit-suppressions.sh`                                         | —                           | **orphan** |
| security:audit:annual             | `node scripts/security/annual-audit.mjs`                                              | —                           | **orphan** |
| security:audit:monthly            | `node scripts/security/monthly-audit.mjs`                                             | —                           | **orphan** |
| security:audit:quarterly          | `node scripts/security/quarterly-audit.mjs`                                           | —                           | **orphan** |
| security:autofix                  | `node scripts/ci/security-autofix-cli.mjs`                                            | —                           | **orphan** |
| security:autofix:fix              | `node scripts/ci/security-autofix-cli.mjs fix`                                        | —                           | **orphan** |
| security:autofix:prs              | `node scripts/ci/security-autofix-cli.mjs prs`                                        | —                           | **orphan** |
| security:autofix:status           | `node scripts/ci/security-autofix-cli.mjs status`                                     | —                           | **orphan** |
| security:autofix:trigger          | `gh workflow run codeql-autofix.yml -f severity=high`                                 | —                           | **orphan** |
| security:autofix:trigger:critical | `gh workflow run codeql-autofix.yml -f severity=critical`                             | —                           | **orphan** |
| security:autofix:trigger:dry-run  | `gh workflow run codeql-autofix.yml -f severity=high -f dry_run=true`                 | —                           | **orphan** |
| security:check-alerts             | `node scripts/security/check-all-alerts.mjs`                                          | —                           | **orphan** |
| security:collect-evidence         | `node scripts/security/collect-evidence.mjs`                                          | —                           | **orphan** |
| security:nuclei                   | `nuclei -target http://localhost:3000 -config .github/nuclei/config.yaml -templat…`   | workflow                    | used       |
| security:nuclei:custom            | `nuclei -target http://localhost:3000 -templates .github/nuclei/templates/custom/…`   | —                           | **orphan** |
| security:nuclei:preview           | `nuclei -target https://dcyfr.dev -config .github/nuclei/config.yaml -templates .…`   | —                           | **orphan** |
| security:nuclei:production        | `nuclei -target https://www.dcyfr.ai -config .github/nuclei/config.yaml -template…`   | —                           | **orphan** |
| setup                             | `npm install && cp .env.example .env.local 2>/dev/null \|\| true && npm run build &…` | —                           | **orphan** |
| sitemap:validate                  | `node scripts/validate-sitemap.mjs`                                                   | workflow                    | used       |
| start                             | `next start`                                                                          | workflow                    | used       |
| sync:agents                       | `node scripts/ci/sync-agents.mjs`                                                     | —                           | **orphan** |
| sync:agents:claude                | `node scripts/ci/sync-agents.mjs --target=claude`                                     | —                           | **orphan** |
| sync:agents:copilot               | `node scripts/ci/sync-agents.mjs --target=copilot`                                    | —                           | **orphan** |
| sync:agents:dry                   | `node scripts/ci/sync-agents.mjs --dry-run`                                           | —                           | **orphan** |
| sync:agents:vscode                | `node scripts/ci/sync-agents.mjs --target=vscode`                                     | —                           | **orphan** |
| sync:metrics                      | `tsx scripts/sync-production-metrics.mjs`                                             | workflow, npm-script        | used       |
| sync:metrics:dry-run              | `tsx scripts/sync-production-metrics.mjs --dry-run`                                   | —                           | **orphan** |
| sync:metrics:quick                | `tsx scripts/sync-production-metrics.mjs --quick`                                     | workflow, npm-script        | used       |
| tasks:next                        | `npm run tasks:scan && npm run tasks:prioritize && node scripts/backlog/whats-nex…`   | —                           | **orphan** |
| tasks:next:quick                  | `npm run tasks:scan && npm run tasks:prioritize -- --time=quick && node scripts/b…`   | —                           | **orphan** |
| tasks:next:today                  | `npm run tasks:scan && npm run tasks:prioritize -- --time=half-day && node script…`   | —                           | **orphan** |
| tasks:next:week                   | `npm run tasks:scan && npm run tasks:prioritize -- --time=full-day --limit=10 && …`   | —                           | **orphan** |
| tasks:prioritize                  | `node scripts/backlog/prioritize-tasks.mjs`                                           | npm-script                  | used       |
| tasks:scan                        | `node scripts/backlog/scan-backlog.mjs`                                               | npm-script                  | used       |
| tasks:stats                       | `npm run tasks:scan && npm run tasks:prioritize && node scripts/backlog/whats-nex…`   | —                           | **orphan** |
| test                              | `vitest`                                                                              | workflow, npm-script        | used       |
| test:ci                           | `vitest run --coverage && playwright test`                                            | workflow                    | used       |
| test:coverage                     | `vitest run --coverage`                                                               | workflow, npm-script        | used       |
| test:delegation-events            | `node scripts/test-delegation-events.mjs`                                             | —                           | **orphan** |
| test:e2e                          | `PLAYWRIGHT_USE_PROD=1 playwright test`                                               | workflow, npm-script        | used       |
| test:e2e:debug                    | `playwright test --debug`                                                             | —                           | **orphan** |
| test:e2e:dev                      | `PLAYWRIGHT_USE_PROD=0 playwright test`                                               | —                           | **orphan** |
| test:e2e:memory                   | `playwright test e2e/memory.spec.ts`                                                  | —                           | **orphan** |
| test:e2e:ui                       | `playwright test --ui`                                                                | —                           | **orphan** |
| test:integration                  | `vitest run tests/integration`                                                        | —                           | **orphan** |
| test:run                          | `vitest run`                                                                          | workflow                    | used       |
| test:scripts                      | `vitest run scripts/__tests__`                                                        | —                           | **orphan** |
| test:scripts:integration          | `vitest run scripts/__tests__ --reporter=verbose`                                     | —                           | **orphan** |
| test:scripts:watch                | `vitest scripts/__tests__`                                                            | —                           | **orphan** |
| test:ui                           | `vitest --ui`                                                                         | —                           | **orphan** |
| test:unit                         | `vitest run src/__tests__`                                                            | —                           | **orphan** |
| test:visual                       | `playwright test e2e/visual --reporter=html`                                          | —                           | **orphan** |
| test:visual:baseline              | `playwright test e2e/visual --update-snapshots`                                       | —                           | **orphan** |
| test:visual:update                | `playwright test e2e/visual --update-snapshots`                                       | —                           | **orphan** |
| test:watch                        | `vitest watch`                                                                        | —                           | **orphan** |
| typecheck                         | `tsc -p tsconfig.json --noEmit`                                                       | workflow, npm-script        | used       |
| update:baseline                   | `node scripts/ci/update-baseline-browser-mapping.mjs`                                 | workflow, npm-script        | used       |
| validate                          | `node scripts/validate.mjs`                                                           | workflow, npm-script        | used       |
| validate:all                      | `node scripts/validate.mjs all`                                                       | —                           | **orphan** |
| validate:allowlist                | `node scripts/validate-cli.mjs allowlist`                                             | workflow                    | used       |
| validate:botid                    | `node scripts/validate-cli.mjs botid`                                                 | workflow                    | used       |
| validate:code                     | `node scripts/validate.mjs code`                                                      | —                           | **orphan** |
| validate:color-contrast           | `node scripts/validate.mjs color-contrast`                                            | —                           | **orphan** |
| validate:content                  | `node scripts/validate.mjs content`                                                   | workflow, npm-script        | used       |
| validate:design                   | `node scripts/validate.mjs design`                                                    | —                           | **orphan** |
| validate:docs-links               | `node scripts/validate.mjs docs-links`                                                | —                           | **orphan** |
| validate:emojis                   | `node scripts/validate.mjs emojis`                                                    | —                           | **orphan** |
| validate:frontmatter              | `node scripts/validate.mjs frontmatter`                                               | —                           | **orphan** |
| validate:governance               | `node scripts/validate.mjs governance`                                                | —                           | **orphan** |
| validate:infrastructure           | `node scripts/validate.mjs infrastructure`                                            | —                           | **orphan** |
| validate:redis                    | `node scripts/validate.mjs redis-connectivity`                                        | —                           | **orphan** |
| validate:tlp                      | `node scripts/validate.mjs tlp-compliance`                                            | —                           | **orphan** |
| vercel:prune:preview              | `node scripts/prune-vercel-preview-deployments.mjs`                                   | —                           | **orphan** |
| vercel:prune:preview:dry-run      | `DRY_RUN=true node scripts/prune-vercel-preview-deployments.mjs`                      | —                           | **orphan** |
| verify:links                      | `node scripts/verify-links.mjs`                                                       | —                           | **orphan** |
| version:bump                      | `node scripts/bump-version-manual.mjs`                                                | —                           | **orphan** |
| version:bump:dry-run              | `node scripts/bump-version-manual.mjs --dry-run`                                      | —                           | **orphan** |
| version:check                     | `node scripts/validate-version.mjs`                                                   | —                           | **orphan** |
| version:check:strict              | `node scripts/validate-version.mjs --strict`                                          | —                           | **orphan** |
