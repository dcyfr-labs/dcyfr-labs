## [2026.04.19] - 2026-04-20

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Testing - round 5 coverage — 12 new test files (192 tests), expand exclusions
- **release** - version 2026.04.19
- Testing - round 4 coverage — 8 new test files (143 tests), expand exclusions
- **release** - version 2026.04.19
- Testing - add 80 tests for core lib modules (round 3)
- **release** - version 2026.04.19
- Testing - add 140 tests for lib modules + tune SonarCloud coverage exclusions
- **release** - version 2026.04.19
- Testing - add comprehensive tests for table-utils, api-cost-calculator, redis-client, api-usage-tracker
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org

### Fixed

- **ci** - use x-cron-secret header in cache-refresh workflow
- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Testing - round 4 coverage — 8 new test files (143 tests), expand exclusions
- **release** - version 2026.04.19
- Testing - add 80 tests for core lib modules (round 3)
- **release** - version 2026.04.19
- Testing - add 140 tests for lib modules + tune SonarCloud coverage exclusions
- **release** - version 2026.04.19
- Testing - add comprehensive tests for table-utils, api-cost-calculator, redis-client, api-usage-tracker
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org

### Fixed

- **ci** - use x-cron-secret header in cache-refresh workflow
- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Testing - add 80 tests for core lib modules (round 3)
- **release** - version 2026.04.19
- Testing - add 140 tests for lib modules + tune SonarCloud coverage exclusions
- **release** - version 2026.04.19
- Testing - add comprehensive tests for table-utils, api-cost-calculator, redis-client, api-usage-tracker
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore

### Fixed

- **ci** - use x-cron-secret header in cache-refresh workflow
- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Testing - add 140 tests for lib modules + tune SonarCloud coverage exclusions
- **release** - version 2026.04.19
- Testing - add comprehensive tests for table-utils, api-cost-calculator, redis-client, api-usage-tracker
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore

### Fixed

- **ci** - use x-cron-secret header in cache-refresh workflow
- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Testing - add comprehensive tests for table-utils, api-cost-calculator, redis-client, api-usage-tracker
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore

### Fixed

- **ci** - use x-cron-secret header in cache-refresh workflow
- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore

### Fixed

- **ci** - use x-cron-secret header in cache-refresh workflow
- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore

### Fixed

- **ci** - exclude cancelled conclusions from workflow failure monitor
- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore

### Fixed

- **security** - pin GitHub Action to SHA + fix CORS wildcard in OPTIONS handler
- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **agents** - Documentation - stock vs brand-variant sibling adoption rule
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install Wave 1 primitives + migrate ReviewForm to @dcyfr-labs
- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **ui** - install @dcyfr-labs/{dcyfr-card,dcyfr-badge,dcyfr-dialog}
- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- fix/issue triage cross repo token (#462)
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- prevent issue-triage workflow failure loops on inaccessible script repo (#457)
- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- add missing workflows to failure monitor coverage (#453) (#454)
- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remediate GHSA-rp42-5vxx-qpwr DoS via basic-ftp@5.3.0 override (#452)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- deprecate stale prompt security workflow to prevent false scheduled failures
- **release** - version 2026.04.19
- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.19
- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- resolve sitemap validation and SonarCloud quality gate failures (#435)
- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.19...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.19...v2026.04.19)

## [2026.04.19] - 2026-04-19

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.18
- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- **security** - remediate 25 CodeQL/Semgrep alerts (closes #421)
- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.18...2026.04.19](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.18...v2026.04.19)

## [2026.04.18] - 2026-04-18

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **release** - version 2026.04.18
- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- **tests** - topline dedup regex misses ` | ` table separators (#426)
- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.18...2026.04.18](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.18...v2026.04.18)

## [2026.04.18] - 2026-04-18

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **auto-calver** - make tag creation idempotent (#424)
- **vercel-remediation** - scope to Production deployments only (#423)
- chore(deps)(deps): bump protobufjs, @opentelemetry/exporter-trace-otlp-proto, @opentelemetry/auto-instrumentations-node and @opentelemetry/exporter-trace-otlp-http (#419)
- **release** - version 2026.04.18
- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- **red-team** - drop pool/poolOptions config — incompatible with vitest 4.x (#425)
- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.18...2026.04.18](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.18...v2026.04.18)

## [2026.04.18] - 2026-04-18

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- **security-review** - skip Claude Code on Dependabot PRs (#422)
- **release** - version 2026.04.18
- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.18...2026.04.18](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.18...v2026.04.18)

## [2026.04.18] - 2026-04-18

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Revert "Refactor code structure for improved readability and maintainability"
- **release** - version 2026.04.18
- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.4.18...2026.04.18](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.4.18...v2026.04.18)

## [2026.04.18] - 2026-04-18

### Added

- **chrome** - reference shell — SiteNav, SiteFooter, PageShell, ThemeSwitcher
- **design-system** - consume @dcyfr-labs registry + publish brand surface
- **security** - add red-team CI/CD pipeline and test runner (Phase 4)

### Changed

- Refactor code structure for improved readability and maintainability
- **ci** - prune 22 redundant and deprecated workflows
- chore(deps)(deps): bump langsmith from 0.5.18 to 0.5.20 (#413)
- chore(deps)(deps): bump react-is from 19.2.4 to 19.2.5 (#410)
- chore(deps)(deps): bump dotenv from 17.4.1 to 17.4.2 (#409)
- chore(deps-dev)(deps-dev): bump @types/node (#404)
- chore(deps)(deps): bump lucide-react in the ui-framework group (#405)
- chore(deps)(deps): bump inngest in the background-jobs group (#406)
- chore(deps)(deps): bump the email group with 2 updates (#407)
- chore(deps-dev)(deps-dev): bump ts-morph from 27.0.2 to 28.0.0 (#408)
- chore(deps)(deps): bump follow-redirects from 1.15.11 to 1.16.0 (#412)
- chore(deps)(deps): bump @anthropic-ai/sdk from 0.82.0 to 0.89.0 (#415)
- chore(deps)(deps): bump the nextjs-core group across 1 directory with 3 updates (#416)
- chore(deps)(deps): bump dompurify from 3.3.3 to 3.4.0 (#417)
- chore(deps-dev)(deps-dev): bump the dev-tools group across 1 directory with 13 updates (#418)
- chore(deps)(deps): bump hono from 4.12.12 to 4.12.14 (#414)
- **repo** - update repository URLs to dcyfr-labs org
- fix TLP compliance + depcheck ratchet for _private/ and peer-chain restore
- dcyfr-labs-cleanup (phases 0,3,4,5,6,8 + Phase 1 conservative) (#399)

### Fixed

- update repository references from dcyfr/dcyfr-labs to dcyfr-labs/dcyfr-labs across documentation, scripts, and codebase
- **validator** - verify withBotId import subpath actually resolves
- **next-config** - import withBotId from botid/next/config (#400)
- re-enable BotID validation in contact API and next.config (#398)

### Security

- remove internal docs and repair CI contracts (#397)

---

**Full Changelog**: [2026.02.12...2026.04.18](https://github.com/dcyfr-labs/dcyfr-labs/compare/v2026.02.12...v2026.04.18)

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Calendar Versioning](https://calver.org/) with the `YYYY.MM.DD[.MICRO]` format.

**Breaking changes** are marked with ⚠️ BREAKING in the version header.

## [2026.02.26]

### Security

- **Phase 1–3 Security Hardening** — Comprehensive three-phase security engagement reducing overall risk posture by ~74–79%

  **Phase 1 (P0 — Critical):**
  - JWT `fail-hard` mode: unauthenticated callers now receive 401 immediately instead of degraded access
  - Timing-safe comparison helper (`src/lib/security/timing-safe.ts`) used across `analytics/update-milestones`, `github/refresh`, and cron-auth routes to prevent timing oracle attacks
  - Axiom proxy route hardened with rate limiting (60 req/min) and `blockExternalAccess()`

  **Phase 2 (P1 — High):**
  - `basic-ftp` pinned to non-vulnerable version via `overrides` in `package.json`
  - `src/proxy.ts` updated to Next.js 16 named-export API (`export function proxy`, `export const config`) — removes dev-mode deprecation warning
  - Cron endpoint auth tightened with `withCronAuth` wrapper
  - API security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control`) added to public-facing routes

  **Phase 3 (P2/P3 — Medium):**
  - Zod validation library added (`src/lib/validation/schemas.ts`, `src/lib/validation/middleware.ts`) with 16 reusable schemas and `validateRequestBody` / `validateQueryParams` helpers
  - `social-analytics/dev-to` route hardened: `blockExternalAccess()`, Zod-validated POST body and query params, wildcard CORS `OPTIONS` handler removed
  - SonarCloud quality gate enforcement: `sonar.qualitygate.wait=true` added to `sonar-project.properties`

### Fixed

- Integration test `security.test.ts` updated for Next.js 16 proxy named-export API



### Added

- **IndexNow Real-Time Indexing Integration** - Complete IndexNow protocol implementation for instant search engine indexing
  - Key file verification route (`/<uuid>.txt`) for domain ownership proof — edge runtime
  - URL submission API (`/api/indexnow/submit`) with Zod validation and Inngest queuing
  - Admin bulk submission endpoint (`/api/admin/indexnow/bulk`) with Bearer auth
  - Inngest background functions: `process-indexnow-submission`, `verify-indexnow-key-file`
  - IndexNow helper library (`src/lib/indexnow/`) — client, events, rate limiting, utils
  - Dev dashboard at `/dev/seo` for local testing and diagnostics
  - Feature flag `FEATURES.enableIndexNow` in `site-config.ts`
  - 54 unit and integration tests covering all routes, Inngest functions, and helpers

## [2026.02.12]

### Changed

- **Design Token Standardization - Production Deployment** - Merged 21 commits from preview branch delivering critical quality improvements
  - Achieved zero design token violations (155 violations → 0)
  - Fixed all test failures (77 failures → 0)
  - 95%+ design token compliance across all components (exceeds quality gate threshold)
  - All components now use SPACING, TYPOGRAPHY, and SEMANTIC_COLORS tokens
  - Eliminated hardcoded spacing (`space-y-*`, `mb-*`, `mt-*`)
  - Eliminated hardcoded typography (`text-*`, `font-*`)
  - Production-ready design system compliance achieved

### Added

- **Comprehensive API Utilities** - Enhanced security, monitoring, and usage tracking capabilities
  - API security layer improvements
  - Monitoring and observability utilities
  - Usage tracking and analytics infrastructure
  - Enhanced error handling and logging

- **MCP Server Integration** - Model Context Protocol functionality enabled in production
  - MCP server functionality activated
  - Tests updated and passing
  - Integration verified and production-ready

- **Developer Tools** - Improved internal tooling and security
  - Dev tools index page and navigation
  - `/licenses` and `/analytics` moved to dev-only pages
  - Security isolation for internal tools
  - Enhanced developer experience

### Fixed

- **Agent Type Refactoring** - Resolved naming conflicts and improved type safety
  - Renamed agent types to avoid conflicts
  - Updated AgentRouter initialization to use `getGlobalAgentRouter` from `@dcyfr/ai`
  - Improved import paths for `getMemory` in API routes

- **Documentation Organization** - Improved compliance and discoverability
  - Reorganized documentation to proper `docs/` subdirectories
  - TLP classification compliance
  - Dev tools comprehensive audit report added

### Technical

- **Merge Details** - preview → main (commit 04990c84)
  - 21 preview commits merged
  - 5 main commits reconciled
  - Zero conflicts (clean automatic merge)
  - Nuclei templates submodule updated to latest version
  - next-mdx-remote dependency updated to 6.0.0

- **Dependency Updates** - Post-merge Dependabot updates (commits 04990c84..30b6ed39)
  - jsdom 27.4.0 → 28.0.0
  - eslint (linting-formatting group)
  - framer-motion (ui-framework group)
  - inngest (background-jobs group)
  - googleapis 170.1.0 → 171.4.0
  - typescript-stack group (2 updates)
  - dev-tools group (3 updates)
  - qs 6.14.1 → 6.14.2

- **Quality Gates** - All validation passed before production deployment
  - Linting: ✅ (eslint clean)
  - Tests: ✅ (128 passed, 13 skipped)
  - Build validations: ✅ (categories, frontmatter, search index, cache)
  - Merge test: ✅ (no conflicts detected)

### Rationale

This release represents a major quality milestone for DCYFR Labs, delivering the design token standardization work that establishes production-ready design system compliance. The merge also brings critical infrastructure improvements (MCP integration, API utilities, dev tools) that enhance both security and developer experience. All changes were validated through comprehensive testing and merge analysis before deployment.

## [2026.01.31]

### Changed

- **Preview deployments now include draft blog posts** - Vercel preview builds and local development will display posts from `src/content/blog/private/` and drafts marked `draft: true` for pre-production testing. Drafts remain hidden in production builds and private assets remain gitignored.

## [2026.01.21]

### Added

- **Changelog Automation & Guardrails System** - Complete 3-tier system for changelog management
  - `scripts/validate-changelog-sync.mjs` - Detects stale changelogs (>7 days default)
  - `scripts/validate-changelog-format.mjs` - Validates CalVer format and structure
  - `npm run changelog:check` - Warning mode for stale detection
  - `npm run changelog:check:strict` - Strict enforcement mode for CI/CD
  - `npm run changelog:validate` - Format compliance validation
  - Comprehensive implementation guide (`docs/operations/CHANGELOG_AUTOMATION_IMPLEMENTATION.md`)

### Changed

- **Improved `scripts/changelog.mjs`** - Enhanced user experience and compliance
  - Removed emojis (📝 → text) for DCYFR compliance
  - Added input validation for count and format arguments
  - Better error messages with helpful guidance
  - Format validation with warnings before fallback
  - Improved output formatting and usage instructions

- **Updated `.github/agents/enforcement/VALIDATION_CHECKLIST.md`**
  - Added dedicated changelog requirements section to documentation checks
  - Documented when to update (new features, breaking changes)
  - Specified validation commands to run before completion
  - Established 7-day update frequency guideline
  - Added DCYFR enforcement for AI agents

- **Updated `.github/PULL_REQUEST_TEMPLATE.md`**
  - Enhanced documentation section with changelog guidelines
  - Added specific validation commands and examples
  - Clarified criteria for when changelog updates are required
  - Provided clear guidance for developers

### Rationale

The changelog automation system addresses the need for consistent changelog maintenance by:

- Preventing stale changelogs (>7 days without updates)
- Ensuring proper CalVer format compliance
- Providing both warnings (local dev) and strict enforcement (CI/CD)
- Creating structured guardrails in DCYFR enforcement documentation
- Helping AI agents remember changelog requirements via VALIDATION_CHECKLIST.md

## [2026.01.11]

### Added

- **Environment Variable Documentation** - Comprehensive setup for academic research and AI development tools
  - `SEMANTIC_SCHOLAR_API_KEY` documentation for academic research and citation analysis
  - Multiple AI provider API keys (OpenAI, Groq, Google, etc.) for multi-provider fallback via OpenCode.ai
  - Advanced setup instructions in `.env.example`

### Changed

- **DCYFR Agent Documentation Overhaul** - Major improvements to `.github/agents/DCYFR.agent.md`
  - Expanded tool support including arxiv, octocode, and dcyfr-\* modules
  - Updated references to core patterns, enforcement rules, and learning resources
  - Clarified best practices for component patterns, design tokens, API routes, and testing
  - Added explicit guidance prohibiting emojis in public content with React icon requirements
  - Updated all documentation links to point to new or reorganized locations
  - Enhanced DCYFR philosophy section emphasizing consistency, validation, and test-driven development
- Updated `.github/ISSUE_TEMPLATE/gitleaks-critical-secret.md` to reference new PI/PII policy documentation location
- Improved formatting and clarity of automated workflow messages in security templates
- **Content & SEO Standards** - Standardized punctuation guidelines for descriptions
  - Established rule: Always end descriptions with periods (meta and hero descriptions)
  - Updated homepage hero description for consistency ("Emerging technology, security insights, and practical code.")
  - Added content guidelines to CLAUDE.md and design system documentation
  - Based on 2026 SEO best practices research (Google preference for complete sentences)
  - Improves readability, professionalism, and SEO performance

### Removed

- **Pre-commit Hook Removal** - Removed `.githooks/pre-commit` script
  - Previously enforced documentation governance checks, sensitive file detection, and pre-commit validations
  - Decision made to streamline local development workflow

## [2026.01.05]

### Added

- **OpenCode.ai Fallback Integration** - Multi-provider AI development tool for token exhaustion scenarios
  - Comprehensive architecture documentation (`docs/ai/opencode-fallback-architecture.md`)
  - 75+ AI provider support (OpenAI, Anthropic, Google Gemini, Groq, local models)
  - Cost optimization (10-100x cheaper with Groq vs Claude Code)
  - Offline development support via Ollama local models
  - NPM scripts: `ai:opencode`, `ai:opencode:groq`, `ai:opencode:local`, `ai:setup`
  - Example configuration file (`.opencode.config.example.json`)
  - Automated setup script (`scripts/setup-opencode.sh`)
  - Environment variable support for all major AI providers
  - Three-tier AI tool hierarchy: Claude Code → GitHub Copilot → OpenCode.ai
  - Provider-specific agents (build, plan, debug, review, document)
  - Design system enforcement in OpenCode.ai configuration
  - Session management and token usage tracking
  - **VS Code Extension Integration** (`sst-dev.opencode`)
    - Keyboard shortcuts: `Cmd+Esc` (launch), `Cmd+Shift+Esc` (new session), `Cmd+Option+K` (file refs)
    - Context awareness: Automatically shares current selection/tab
    - Editor integration: Button in title bar for quick access
    - Independent terminal sessions per OpenCode instance
    - Compatible with VS Code, Cursor, Windsurf, and VSCodium

### Changed

- Updated `CLAUDE.md` with AI tool hierarchy, OpenCode.ai trigger conditions, and VS Code extension info
- Updated `AGENTS.md` with OpenCode.ai fallback tier (🟢 FALLBACK) and multi-tier AI architecture
- Updated `.env.example` with comprehensive OpenCode.ai provider configuration
- Updated `.vscode/extensions.json` to recommend `sst-dev.opencode` extension
- Updated `.gitignore` to exclude OpenCode.ai session data and configs

## [2026.01.02]

### Added

- **Bookmark/Reading List Feature** - Complete bookmark functionality for blog posts
  - `useBookmarks` hook with localStorage persistence and cross-tab sync
  - `BookmarkButton` component for all post layouts (grid, list, magazine, compact)
  - `/bookmarks` page displaying saved posts with clear all functionality
  - Integration with existing `PostQuickActions` sidebar component
  - Empty states, confirmation dialogs, and user feedback via toasts
- Comprehensive production deployment documentation (`docs/operations/production-deployment.md`)
- Test skip documentation explaining 7 intentionally skipped tests
- Production readiness validation and deployment runbook

### Changed

- Updated testing documentation to reflect 99.5% pass rate (1339/1346 tests)
- Clarified that 7 "failing" tests are strategic skips, not failures
- Enhanced deployment checklist with pre/post production deployment steps
- Updated environment variables documentation for December 2025
- Temporarily disabled Vercel BotID in `/api/contact` due to false positives; added `ENABLE_BOTID` env var to toggle check and added tests + documentation to re-enable safely when Vercel configuration validated
- Improve robustness of `security-advisory-monitor`:
  - Implemented fetch helper with exponential backoff and special-case handling for 422 responses
  - Added a small delay between package requests to reduce spam/validation errors from the GHSA API
  - Improved diagnostic logging to capture response bodies and rate-limit headers

## [2025.12.07] - Production Deployment ⚠️ BREAKING

### Summary

**Production Deployment Ready** - All testing on preview branch completed successfully. Project validated for production deployment with 99.5% test pass rate, zero security vulnerabilities, and comprehensive documentation.

### Status

- ✅ **Test Pass Rate:** 1339/1346 tests (99.5%)
- ✅ **Security:** 0 vulnerabilities, Grade A- security audit
- ✅ **Performance:** Infrastructure ready, baselines pending first deployment
- ✅ **Documentation:** Comprehensive coverage across 15 directories, 300+ files
- ✅ **Code Quality:** 0 TypeScript errors, 0 ESLint warnings

### Validated

**Testing:**

- All 198 integration tests passing
- All critical E2E tests passing (with strategic WebKit skips)
- All unit tests passing (with 5 skipped tests for component refactors)
- Test health automation active (weekly reports)

**Deployment Infrastructure:**

- Vercel deployment workflow configured and validated
- Preview deployments tested and working
- Environment variable requirements documented
- GitHub secrets setup documented
- Monitoring integrations ready (Sentry, Vercel Analytics, Inngest)

**Documentation:**

- Production deployment runbook created
- Test skip strategy documented
- Environment variables guide updated
- Deployment checklist enhanced
- All AI contributor guides current

### Notes

- 7 tests intentionally skipped (see `docs/testing/README.md`)
- Performance baselines will be populated after first production deployment
- All blocking items resolved; ready for production deployment

## [2025.12.06]

### Added

- Repository documentation templates (PR template, issue templates, code of conduct)
- MIT license
- Vercel Blob integration plan for future asset storage

### Changed

- Updated all repository documentation to reflect Phase 4 completion
- Updated test metrics across documentation (1339/1346 tests passing, 99.5%)
- Optimized GitHub Actions workflows with concurrency and timeouts
- Updated github-script actions to v8

## [2025.11.26] - Initial Release ⚠️ BREAKING

### Summary

Production-ready Next.js 16 portfolio with comprehensive testing, security, and documentation.

### Added

**Core Features:**

- MDX-powered blog system with syntax highlighting, TOC, and related posts
- Real-time analytics with Redis and Inngest background jobs
- GitHub contribution heatmap integration
- Contact form with email delivery (Resend)
- RSS/Atom feeds for blog and projects
- Dark mode support with next-themes

**Testing Infrastructure:**

- 1185/1197 tests passing (99.0% pass rate)
- 198 integration tests
- Unit tests with Vitest and Testing Library
- E2E tests with Playwright
- Test coverage reporting

**Security Features:**

- Content Security Policy (CSP) with nonce-based implementation
- Redis-backed rate limiting with in-memory fallback
- Input validation on all API endpoints
- Security headers (HSTS, X-Frame-Options, etc.)
- Zero security vulnerabilities (CodeQL + Dependabot)

**Performance Optimizations:**

- Server components by default
- Image optimization with Next.js Image
- Edge caching and ISR
- Lighthouse CI integration (≥90% performance, ≥95% accessibility)
- Core Web Vitals monitoring

**Developer Experience:**

- Comprehensive documentation (14 directories, 300+ files)
- AI contributor guides (Claude Code + GitHub Copilot)
- Design system with reusable components and design tokens
- TypeScript strict mode throughout
- ESLint + Prettier configuration

**Documentation:**

- Architecture guides and migration patterns
- Component documentation (26 components)
- Security implementation guides
- Testing infrastructure documentation
- API route documentation

### Tech Stack

- **Framework:** Next.js 16.0.4 (App Router)
- **Language:** TypeScript 5.9.3
- **UI:** React 19.2.0, Tailwind CSS v4, shadcn/ui
- **Content:** MDX with next-mdx-remote
- **Background Jobs:** Inngest
- **Database/Cache:** Redis (Upstash)
- **Email:** Resend
- **Testing:** Vitest 4.0.14, Playwright 1.57.0
- **Deployment:** Vercel

### Dependencies

**Major Version Updates (Nov 26, 2025):**

- Next.js 16.0.3 → 16.0.4
- Vitest 4.0.10 → 4.0.14
- @playwright/test 1.56.1 → 1.57.0
- @types/react 19.2.5 → 19.2.7
- lucide-react 0.554.0 → 0.555.0
- msw 2.12.2 → 2.12.3

### Security

- **Vulnerabilities:** 0 (as of 2025-11-26)
- **Security Rating:** A+ (Excellent)
- **CodeQL:** No issues detected
- **Dependabot:** Active with auto-merge

### Known Issues

- 11 test failures related to React 19 `act()` strictness (non-blocking, see [#TODO](docs/operations/todo.md#testing--quality))

---

For detailed project history, see [docs/operations/done.md](docs/operations/done.md).
