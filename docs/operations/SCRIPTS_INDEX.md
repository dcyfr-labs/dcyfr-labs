<!-- TLP:CLEAR -->

# Scripts Index

**Complete reference for all automation scripts in dcyfr-labs**

**Last Updated:** January 17, 2026  
**Total Scripts:** 120

---

## Quick Access

| Category | Scripts | npm Commands |
|----------|---------|--------------|
| [Validation](#validation-scripts) | 21 | `npm run validate:*` |
| [Testing](#testing-scripts) | 10 | `npm run test:*` |
| [Security](#security-scripts) | 9 | `npm run security:*` |
| [Performance](#performance-scripts) | 6 | `npm run perf:*` |
| [Content](#content-generation) | 2 | `npm run content:*` |
| [AI/Learning](#ailearning-scripts) | 8 | `npm run ai:*` |
| [CI/CD](#cicd-scripts) | 10 | (automated in workflows) |
| [Setup](#setup-scripts) | 12 | `npm run setup:*` |
| [Utilities](#utilities) | 14 | `npm run util:*` |
| [Development](#development-tools) | 8 | `npm run dev:*` |
| [Backlog](#backlog-management) | 3 | `npm run backlog:*` |
| [Session](#session-management) | 4 | `npm run session:*` |
| [Tests](#test-files) | 4 | (unit tests for scripts) |

---

## Validation Scripts

**Location:** `scripts/` and `scripts/validation/`  
**Purpose:** Content quality, compliance, and data integrity checks

| Script | npm Command | Description |
|--------|-------------|-------------|
| `validate-analytics-integration.mjs` | `npm run validate:analytics` | Verify analytics integration and tracking |
| `validate-botid-setup.mjs` | `npm run validate:botid` | Check BotID configuration |
| `validate-cli.mjs` | `npm run validate:cli` | CLI tool for running multiple validations |
| `validate-color-contrast.mjs` | `npm run validate:contrast` | WCAG color contrast compliance |
| `validate-design-tokens.mjs` | `npm run validate:tokens` | Design token usage compliance |
| `validate-emojis.mjs` | `npm run validate:emojis` | Emoji prohibition enforcement |
| `validate-feeds.mjs` | `npm run validate:feeds` | RSS/Atom feed validation |
| `validate-footnotes.mjs` | `npm run validate:footnotes` | Blog post footnote validation |
| `validate-frontmatter.mjs` | `npm run validate:frontmatter` | MDX frontmatter schema validation |
| `validate-instructions.mjs` | `npm run validate:instructions` | AI instruction file validation |
| `validate-markdown-content.mjs` | `npm run validate:markdown` | Markdown quality checks |
| `validate-mdx-components.mjs` | `npm run validate:mdx` | MDX component usage validation |
| `validate-post-categories.mjs` | `npm run validate:categories` | Blog category consistency |
| `validate-post-ids.mjs` | `npm run validate:ids` | Unique post ID enforcement |
| `validate-sitemap.mjs` | `npm run validate:sitemap` | Sitemap.xml validation |
| `validate-structured-data.mjs` | `npm run validate:schema` | JSON-LD structured data validation |
| `audit-allowlist.mjs` | `npm run audit:allowlist` | Review PII/PI allowlist entries |
| `check-reports-for-pii.mjs` | `npm run scan:pi` | Scan reports for personal information |
| `lint-mermaid-diagrams.mjs` | `npm run lint:mermaid` | Mermaid diagram syntax validation |
| `validate-allowlist.mjs` | (internal) | PII allowlist validation |
| `validate-frontmatter.mjs` | (duplicate) | Frontmatter validation (validation/) |

---

## Testing Scripts

**Location:** `scripts/testing/`  
**Purpose:** Automated testing utilities and accessibility checks

| Script | npm Command | Description |
|--------|-------------|-------------|
| `test-accessibility.mjs` | `npm run test:a11y` | Automated accessibility testing |
| `test-accessibility-manual.mjs` | `npm run test:a11y:manual` | Manual accessibility test runner |
| `test-canonical-urls.mjs` | `npm run test:canonical` | Canonical URL validation |
| `test-google-indexing.mjs` | `npm run test:indexing` | Google indexing status check |
| `test-skip-link.mjs` | `npm run test:skip-link` | Skip link functionality test |
| `test-skip-link-structure.mjs` | `npm run test:skip-link:structure` | Skip link structure validation |
| `check-headers.mjs` | `npm run test:headers` | HTTP security headers validation |
| `test-feed-endpoints.mjs` | `npm run test:feeds` | Feed endpoint availability test |
| `test-mcp-logic.mjs` | `npm run test:mcp` | MCP server logic testing |
| `test-engagement-mcp.mjs` | `npm run test:engagement` | Engagement MCP functionality test |

---

## Security Scripts

**Location:** `scripts/security/`  
**Purpose:** Security auditing, monitoring, and remediation

| Script | npm Command | Description |
|--------|-------------|-------------|
| `security-audit.mjs` | `npm run security:audit` | Comprehensive security audit |
| `api-security-audit.mjs` | `npm run security:api` | API route security analysis |
| `check-security-alert.mjs` | `npm run security:check` | Check for security alerts |
| `create-security-issue.mjs` | `npm run security:issue` | Create security issue from alert |
| `monitor-upstream-advisories.mjs` | `npm run security:monitor` | Monitor upstream security advisories |
| `branch-cleanup.mjs` | `npm run security:cleanup` | Clean up stale branches |
| `sentry-enricher.mjs` | (automated) | Enrich Sentry error reports |
| `check-test-data.mjs` | `npm run check:test-data` | Prevent test data in production |
| `check-comment-density.mjs` | `npm run check:comments` | Prevent excessive AI-generated comments |

---

## Performance Scripts

**Location:** `scripts/performance/`  
**Purpose:** Performance monitoring and optimization

| Script | npm Command | Description |
|--------|-------------|-------------|
| `analyze-core-web-vitals.mjs` | `npm run perf:vitals` | Analyze Core Web Vitals metrics |
| `analyze-perf-metrics.mjs` | `npm run perf:analyze` | Performance metrics analysis |
| `check-bundle-size.mjs` | `npm run perf:bundle` | Bundle size budget enforcement |
| `collect-perf-metrics.mjs` | `npm run perf:collect` | Collect performance data |
| `find-large-images.sh` | `npm run perf:images` | Find oversized images |
| `check-bundle-size.mjs` | (duplicate check) | Bundle size validation |

---

## Content Generation

**Location:** `scripts/content/`  
**Purpose:** Automated content and asset generation

| Script | npm Command | Description |
|--------|-------------|-------------|
| `generate-blog-hero.mjs` | `npm run content:blog-hero` | Generate blog post hero images |
| `generate-project-hero.mjs` | `npm run content:project-hero` | Generate project hero images |

---

## AI/Learning Scripts

**Location:** `scripts/` and `scripts/learning/`  
**Purpose:** AI agent management, learning, and metrics

| Script | npm Command | Description |
|--------|-------------|-------------|
| `ai-cli.mjs` | `npm run ai:cli` | AI agent management CLI |
| `unified-ai-costs.mjs` | `npm run ai:costs` | Unified AI cost tracking |
| `archive-ai-costs.mjs` | `npm run ai:archive` | Archive AI cost data |
| `provider-fallback-cli.ts` | `npm run ai:fallback` | Provider fallback CLI |
| `add-learning.mjs` | `npm run learning:add` | Add learning entry |
| `collect-metrics.mjs` | `npm run learning:metrics` | Collect learning metrics |
| `generate-report.mjs` | `npm run learning:report` | Generate learning report |
| `query-knowledge.mjs` | `npm run learning:query` | Query knowledge base |

---

## CI/CD Scripts

**Location:** `scripts/ci/`  
**Purpose:** Continuous integration and deployment automation

| Script | Workflow | Description |
|--------|----------|-------------|
| `analyze-test-health.mjs` | `weekly-test-health.yml` | Test suite health analysis |
| `check-for-pii.mjs` | `pii-scan.yml` | CI PII detection |
| `check-mcp-servers.mjs` | `mcp-server-check.yml` | MCP server health checks |
| `generate-mcp-health-report.mjs` | `mcp-server-check.yml` | MCP health report generation |
| `monthly-cleanup.mjs` | `monthly-cleanup.yml` | Monthly maintenance tasks |
| `parse-gitleaks-report.mjs` | `security-suite.yml` | Parse Gitleaks output |
| `sync-agents.mjs` | (manual) | Sync AI agent instructions |
| `update-baseline-browser-mapping.mjs` | `update-baseline-mapping.yml` | Update browser baseline mapping |
| `validate-critical-mcps.mjs` | `mcp-server-check.yml` | Validate critical MCP servers |
| `validate-docs-structure.mjs` | (pre-commit) | Enforce docs organization |
| `workflow-health-monitor.mjs` | `workflow-health-report.yml` | Monitor workflow health |

---

## Setup Scripts

**Location:** `scripts/setup/` and `scripts/setup/sentry/`  
**Purpose:** Project initialization and configuration

| Script | npm Command | Description |
|--------|-------------|-------------|
| `setup-opencode.sh` | `npm run setup:opencode` | OpenCode.ai setup |
| `setup-branch-protection.sh` | `npm run setup:branches` | Configure branch protection |
| `cleanup-maintenance.sh` | `npm run setup:cleanup` | Project cleanup utilities |
| `refactor-globals-css.sh` | `npm run setup:refactor-css` | Refactor global CSS |
| `configure-sentry.sh` | `npm run setup:sentry` | Sentry configuration |
| `create-sentry-metric-alerts.sh` | `npm run setup:sentry:metrics` | Create Sentry metric alerts |
| `fix-sentry-alerts.sh` | `npm run setup:sentry:fix` | Fix Sentry alert configuration |
| `list-sentry-alerts.sh` | `npm run setup:sentry:list` | List Sentry alerts |
| `setup-sentry-alerts.sh` | `npm run setup:sentry:alerts` | Setup Sentry alerts |
| `test-security-alerts.sh` | `npm run setup:sentry:test` | Test Sentry security alerts |
| `verify-sentry-events.sh` | `npm run setup:sentry:verify` | Verify Sentry event ingestion |
| `auto-checkpoint.sh` | (manual) | Automated checkpoint creation |

---

## Utilities

**Location:** `scripts/utilities/` and `scripts/`  
**Purpose:** General-purpose helper scripts

| Script | npm Command | Description |
|--------|-------------|-------------|
| `backfill-google-indexing.mjs` | `npm run util:backfill-indexing` | Backfill Google indexing data |
| `github-api.mjs` | (library) | GitHub API wrapper utilities |
| `migrate-blog-analytics.mjs` | `npm run util:migrate-analytics` | Migrate blog analytics data |
| `run-with-dev.mjs` | `npm run util:dev` | Run script with dev server |
| `secure-api-routes.mjs` | `npm run util:secure-routes` | API route security utilities |
| `cleanup-broken-links.mjs` | `npm run util:cleanup-links` | Clean up broken links |
| `cleanup-check.mjs` | `npm run util:cleanup-check` | Cleanup verification |
| `clear-activity-cache.mjs` | `npm run cache:clear:activity` | Clear activity cache |
| `clear-test-data.mjs` | `npm run cache:clear:test` | Clear test data from Redis |
| `convert-tokens.mjs` | `npm run util:convert-tokens` | Convert design tokens |
| `fix-barrel-exports.mjs` | `npm run util:fix-exports` | Fix barrel export patterns |
| `fix-mdx-less-than.mjs` | `npm run util:fix-mdx` | Fix MDX less-than escaping |
| `verify-links.mjs` | `npm run util:verify-links` | Verify link validity |
| `invalidate-cache-on-deploy.mjs` | `npm run util:invalidate-cache` | Invalidate CDN cache on deploy |

---

## Development Tools

**Location:** `scripts/` and `scripts/debug/`  
**Purpose:** Developer productivity and debugging

| Script | npm Command | Description |
|--------|-------------|-------------|
| `dev-utils.mjs` | `npm run dev:utils` | Development utilities CLI |
| `health-check.mjs` | `npm run health:check` | Project health check |
| `health-cli.mjs` | `npm run health:cli` | Health check CLI |
| `mcp-cli.mjs` | `npm run mcp:cli` | MCP server management CLI |
| `session-cli.mjs` | `npm run session:cli` | Session management CLI |
| `telemetry-cli.ts` | `npm run telemetry:cli` | Telemetry CLI |
| `check-images.mjs` | `npm run debug:images` | Debug image loading issues |
| `test-shiki-output.mjs` | `npm run debug:shiki` | Debug Shiki syntax highlighting |

---

## Backlog Management

**Location:** `scripts/backlog/`  
**Purpose:** Task prioritization and backlog analysis

| Script | npm Command | Description |
|--------|-------------|-------------|
| `prioritize-tasks.mjs` | `npm run backlog:prioritize` | Prioritize backlog tasks |
| `scan-backlog.mjs` | `npm run backlog:scan` | Scan for backlog items |
| `whats-next.mjs` | `npm run backlog:next` | Suggest next tasks |

---

## Session Management

**Location:** `scripts/`  
**Purpose:** AI session state management

| Script | npm Command | Description |
|--------|-------------|-------------|
| `save-session-state.sh` | `npm run session:save` | Save AI session state |
| `restore-session-state.sh` | `npm run session:restore` | Restore AI session state |
| `session-recovery.sh` | `npm run session:recover` | Recover from interrupted session |
| `checkpoint-stop.sh` | (manual) | Create checkpoint and stop |

---

## Test Files

**Location:** `scripts/__tests__/`  
**Purpose:** Unit tests for critical scripts

| Test File | Tests |
|-----------|-------|
| `check-mcp-servers.test.ts` | MCP server health check tests |
| `cleanup-broken-links.test.ts` | Link cleanup logic tests |
| `parse-gitleaks-report.test.ts` | Gitleaks parser tests |
| `validate-instructions.test.ts` | Instruction validation tests |

---

## Library/Shared Code

**Location:** `scripts/lib/`  
**Purpose:** Reusable validation and utility functions

| File | Purpose |
|------|---------|
| `validation.mjs` | Shared validation utilities |

---

## Deprecated/Redundant Scripts

| Script | Status | Replacement |
|--------|--------|-------------|
| `scripts/validation/validate-frontmatter.mjs` | Duplicate | Use `scripts/validate-frontmatter.mjs` |
| `populate-analytics-milestones.mjs` | ⚠️ Test data | Should only run in dev/preview |
| `redis-health-check.mjs` | Redundant | Use `health-cli.mjs` |

---

## Script Naming Conventions

**Prefixes:**
- `validate-*` - Validation and compliance checks
- `check-*` - Health checks and verification
- `test-*` - Testing utilities
- `generate-*` - Content/asset generation
- `analyze-*` - Data analysis
- `fix-*` - Automated fixes
- `setup-*` - Configuration and initialization
- `util-*` / `utilities/*` - General-purpose tools

**Suffixes:**
- `*.mjs` - ES module JavaScript
- `*.js` - CommonJS JavaScript
- `*.ts` - TypeScript
- `*.sh` - Shell script
- `*.test.ts` - Unit test

---

## Adding New Scripts

**Checklist:**
1. ✅ Choose appropriate directory (`scripts/[category]/`)
2. ✅ Follow naming conventions
3. ✅ Add npm script to `package.json`
4. ✅ Add entry to this index
5. ✅ Include `#!/usr/bin/env node` shebang (for CLI scripts)
6. ✅ Add description comment at top of file
7. ✅ Update `docs/QUICK_REFERENCE.md` if commonly used

**Script Template:**

```javascript
#!/usr/bin/env node
/**
 * @file script-name.mjs
 * @description Brief description of what this script does
 * @usage npm run category:name
 */

// Implementation...
```

---

## Related Documentation

- [Quick Reference Guide](../QUICK_REFERENCE.md) - Common commands and patterns
- Automated Updates - Automation system overview
- [Cleanup Log](./CLEANUP_LOG.md) - File removal history

---

**Maintenance:** Update this index when adding, removing, or renaming scripts.
