{/* TLP:CLEAR */}

# Maintenance Automation System

**Status:** Phase 1-4 Complete (All Automation + Dashboard Complete ✅)
**Last Updated:** November 29, 2025

---

## Overview

Automated recurring maintenance tasks with GitHub Issues, email alerts, and dashboard metrics. The system creates notification-based workflows that integrate with existing infrastructure (GitHub Actions, Inngest, Sentry, Redis).

**Priorities:**

- Testing (5) ✅ **Implemented**
- Security (4) ✅ **Implemented**
- Content (3) ✅ **Implemented**
- Cleanup (2) ✅ **Implemented**
- Dashboard & Observations (4) ✅ **Implemented**

---

## Phase 1: Testing Automation ✅

### Weekly Test Health Reports

**Workflow:** `.github/workflows/weekly-test-health.yml`

**Schedule:** Every Monday at 08:00 UTC (after Dependabot runs)

**What it does:**

1. Runs full test suite with coverage
2. Compares results to previous week's baseline
3. Queries Sentry API for related production errors
4. Creates GitHub Issue if:
   - Pass rate < 95%
   - Coverage decreased > 2%
   - Critical tests failing
5. Sends email alert for critical failures only

**Sentry Enrichment:**

- Automatically queries Sentry for errors matching test failures
- Includes error count, affected users, stack traces
- Links to Sentry issues for investigation

**Deduplication:**

- Checks for existing open Issues with `test-health` label
- Updates existing Issue instead of creating duplicates
- Uses Redis cache to prevent spam

### Scripts

**`scripts/analyze-test-health.mjs`**

- Main analysis script
- Parses Vitest JSON output
- Extracts metrics: pass rate, coverage, slow tests, flaky tests
- Compares to baseline from previous run
- Generates Issue body with markdown tables

**`scripts/sentry-enricher.mjs`**

- Queries Sentry API for related errors
- Matches test failures to production errors
- Formats enrichment data as markdown
- Rate-limited to prevent API throttling

**`scripts/github-api.mjs`**

- Shared GitHub API utilities
- Issue creation, updating, deduplication
- Branch management
- CodeQL alert fetching

### Issue Template

**`.github/ISSUE_TEMPLATE/test-health-report.md`**

- Standardized format for test health reports
- Includes metrics, failures, Sentry data, action items
- Auto-assigned to `drew` with `test-health` and `automated` labels

### Manual Triggering

You can manually trigger the workflow from GitHub Actions tab:

```
Actions → Weekly Test Health → Run workflow
```

Options:

- `create_issue`: Create Issue even if tests are healthy (for testing)

### Monitoring

**GitHub Actions:**

- Check workflow runs: [Actions tab](https://github.com/dcyfr/dcyfr-labs/actions/workflows/weekly-test-health.yml)
- View test artifacts: Uploaded for 90 days
- Coverage reports: Uploaded for 30 days

**GitHub Issues:**

- Filter by label: [`test-health`](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Atest-health)
- Auto-assigned to `drew`

**Email Alerts:**

- Sent via Resend for critical failures only
- Pass rate < 90% triggers immediate alert

---

## Phase 2: Security Automation ✅

### Monthly Security Reviews

**Workflow:** `.github/workflows/monthly-security-review.yml`

**Schedule:** First day of each month at 09:00 UTC

**What it does:**

1. Runs `npm audit` to check for dependency vulnerabilities
2. Queries CodeQL for security findings (last 30 days)
3. Lists open Dependabot PRs and categorizes them
4. Analyzes branches for cleanup (merged + stale)
5. Generates SBOM (Software Bill of Materials)
6. Creates GitHub Issue if:
   - Critical or high severity vulnerabilities found
   - More than 5 open Dependabot PRs
   - Critical/high CodeQL findings
7. Auto-deletes merged branches (optional, dry run by default)

### Scripts

**`scripts/security-audit.mjs`**

- Runs npm audit and parses JSON output
- Fetches CodeQL alerts via GitHub API
- Lists Dependabot PRs using gh CLI
- Generates SBOM (CycloneDX format)
- Aggregates all findings into single Issue

**`scripts/branch-cleanup.mjs`**

- Lists all repository branches
- Categorizes: protected, merged, stale, active
- Auto-deletes merged branches >7 days old (if enabled)
- Flags stale branches (>90 days inactive) for manual review
- Generates cleanup checklist for Issue

### Issue Template

**`.github/ISSUE_TEMPLATE/monthly-security-review.md`**

- Standardized format for security reviews
- Includes CodeQL, npm audit, Dependabot, branch cleanup
- Auto-assigned to `drew` with `security` and `automated` labels

### Branch Cleanup Criteria

**Auto-delete (when enabled):**

- Merged into main or preview
- Last commit >7 days ago
- Not protected (main/preview/production)

**Manual review required:**

- Unmerged branches >90 days inactive
- Branches with open PRs
- Feature/fix branches not yet merged

### Manual Triggering

Trigger workflow manually:

```
Actions → Monthly Security Review → Run workflow
```

Options:

- `auto_delete_branches`: Set to `true` to actually delete branches (default: dry run)

### Monitoring

**GitHub Actions:**

- Workflow runs: [Actions tab](https://github.com/dcyfr/dcyfr-labs/actions/workflows/monthly-security-review.yml)
- SBOM artifacts: Uploaded for 90 days
- Branch cleanup reports: Uploaded for 30 days

**GitHub Issues:**

- Filter by label: [`security`](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Asecurity)
- Auto-assigned to `drew`

**Email Alerts:**

- Sent for critical/high severity findings only

---

## Phase 3: Content & Cleanup Automation ✅

### Content Validation

**Workflow:** `.github/workflows/validate-content.yml`

**Triggers:**

- Pull requests modifying `src/content/**/*.mdx`
- Weekly on Wednesdays at 10:00 UTC
- Manual dispatch

**What it does:**

1. Validates MDX blog post frontmatter for:
   - Required fields (title, summary, publishedAt, tags)
   - SEO compliance (title 10-70 chars, summary 50-160 chars)
   - Date validation (ISO 8601 format, publishedAt ≤ today)
   - Tag validation (1-5 tags, no empty values)
   - Accessibility (imageAlt required if image present)
2. Posts validation results as PR comment (on PRs)
3. Blocks PR merge if validation fails
4. Creates Issue for scheduled runs if errors found

**Script:** `scripts/validate-frontmatter.mjs`

- Recursively scans `src/content/` for `.mdx` files
- Parses frontmatter using gray-matter + js-yaml
- Validates all fields against SEO and accessibility requirements
- Outputs markdown summary for GitHub Actions

**Validation Rules:**

- **Title:** 10-70 characters (SEO optimization)
- **Summary:** 50-160 characters (meta description length)
- **publishedAt:** Required, must be ≤ today
- **updatedAt:** Optional, must be ≥ publishedAt
- **Tags:** 1-5 tags required, no empty values
- **Image:** If present, imageAlt required (WCAG compliance)
- **Draft:** Warns if post marked as draft

### Monthly Cleanup

**Workflow:** `.github/workflows/monthly-cleanup.yml`

**Schedule:** 15th of every month at 11:00 UTC

**What it does:**

1. Detects unused exports via ts-prune
2. Finds unused dependencies via depcheck
3. Identifies large files (>500 lines) for refactoring
4. Scans for TODO/FIXME/HACK comments
5. Checks for duplicate package versions
6. Generates workspace cleanup checklist
7. Creates GitHub Issue with all findings

**Script:** `scripts/monthly-cleanup.mjs`

- Uses ts-prune to detect unused exports
- Uses depcheck to find unused dependencies
- Scans codebase for large files and technical debt
- Analyzes npm dependency tree for duplicates
- Generates comprehensive cleanup report

**Issue Creation:**

- Updates existing Issue for current month if present
- Creates new Issue otherwise
- Labels: `cleanup`, `automated`, `monthly-cleanup`
- Includes action items checklist

**Workspace Cleanup Checklist:**

- Clear `.next` build cache
- Clear node_modules and reinstall
- Clear test coverage
- Review and close stale Issues
- Archive old branches
- Update dependencies
- Clean git objects
- Review `.gitignore`

### Phase 3 Issue Template

**`.github/ISSUE_TEMPLATE/monthly-cleanup.md`**

- Standardized format for cleanup reports
- Includes summary table with counts
- Lists unused exports, dependencies, large files
- Shows TODO comments and duplicate packages
- Provides workspace cleanup checklist
- Auto-assigned to `drew` with `cleanup` labels

### Phase 3 Manual Triggering

**Content Validation:**

```bash
# Trigger workflow manually
gh workflow run validate-content.yml

# Or run script directly
node scripts/validate-frontmatter.mjs
```

**Cleanup Analysis:**

```bash
# Trigger workflow manually
gh workflow run monthly-cleanup.yml

# Or run script directly
node scripts/monthly-cleanup.mjs
```

### Phase 3 Monitoring

**GitHub Actions:**

- Content validation: [Actions tab](https://github.com/dcyfr/dcyfr-labs/actions/workflows/validate-content.yml)
- Cleanup reports: [Actions tab](https://github.com/dcyfr/dcyfr-labs/actions/workflows/monthly-cleanup.yml)
- Artifacts retained for 30-90 days

**GitHub Issues:**

- Content: Filter by [`content`](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Acontent) and [`validation`](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Avalidation) labels
- Cleanup: Filter by [`cleanup`](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Acleanup) and [`monthly-cleanup`](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Amonthly-cleanup) labels

---

## Environment Variables

**Required:**

- `GITHUB_TOKEN` - Already configured, needs `repo` and `issues:write` scopes ✅
- `SENTRY_AUTH_TOKEN` - Already configured for source maps, reused for API queries ✅

**Optional:**

- `SENTRY_ORG` - Defaults to `dcyfr-labs`
- `SENTRY_PROJECT` - Defaults to `dcyfr-labs`

---

## Dependencies

**Added in Phase 1:**

- `@octokit/rest@^20.0.0` - GitHub API client

---

## Metrics Tracked

### Test Health

- **Pass rate** - Percentage of tests passing (target: ≥95%)
- **Coverage** - Average code coverage (lines, statements, functions, branches)
- **Flaky tests** - Tests with inconsistent pass/fail patterns
- **Slow tests** - Tests taking >1s to execute
- **Test failures** - Details, error messages, stack traces

### Sentry Enrichment

- **Related errors** - Production errors matching test failures
- **User impact** - Number of users affected by errors
- **Error frequency** - Occurrences in last 7 days
- **Stack traces** - Links to Sentry issues for investigation

---

## Troubleshooting

### Workflow fails with "test-results.json not found"

The workflow expects Vitest to generate `test-results.json` using the `--reporter=json` flag.

**Fix:** Ensure Vitest is configured with JSON reporter:

```bash
npm run test:coverage -- --reporter=json --outputFile=test-results.json
```

### Sentry enrichment shows "No related errors found"

This is normal if:

- No production errors match the test failure signature
- Errors occurred >7 days ago (query window)
- SENTRY_AUTH_TOKEN not set (enrichment skipped)

### Issue not created despite test failures

Check the logs:

1. View workflow run in Actions tab
2. Check "Analyze test health" step
3. Look for "Test health is good! No Issue needed."

The workflow only creates Issues if:

- Pass rate < 95%
- Coverage decreased > 2%
- Critical tests failing

### Too many Issues created

The deduplication logic should prevent this. If it's happening:

1. Check Redis cache is working
2. Verify signature generation is consistent
3. Review open Issues with `test-health` label

---

## Phase 4: Maintenance Dashboard ✅

### Dashboard Overview

**Route:** `/dev/maintenance` (dev environment only)

**Access:** Integrates with existing dev tools dropdown, blocked in production

**Features:**

1. API Health monitoring (Edge Runtime, Vercel status, region info)
2. Workflow status grid (4 tracked workflows with real-time data)
3. 52-week trend visualization (test pass rate, coverage, security score)
4. Workflow history table (recent runs across all workflows)
5. Observation logging system (AI performance, dev tools, workflow notes)

### API Health Monitoring

**Endpoint:** `/api/health`

**Displays:**

- Overall system health status (Healthy/Degraded/Unhealthy)
- Edge Runtime operational status
- Vercel platform status
- Server region information
- Last health check timestamp

**Auto-refresh:** Included in 60-second dashboard refresh cycle

### Workflow Status Grid

**API:** `/api/maintenance/workflows`

**Tracks 4 workflows:**

1. **Weekly Test Health** - Every Monday at 08:00 UTC
2. **Monthly Security Review** - First day of month at 09:00 UTC
3. **Content Validation** - Weekly on Wednesdays at 10:00 UTC
4. **Monthly Cleanup** - 15th of month at 11:00 UTC

**Metrics per workflow:**

- Last run status and conclusion
- Pass rate (last 10 runs)
- Total/successful/failed run counts
- Run number, timestamp, branch, SHA
- Direct links to GitHub Actions

**Caching:** Redis 5-minute TTL with graceful fallback

### 52-Week Trends

**API:** `/api/maintenance/metrics?period=52weeks`

**Visualizes:**

- Test pass rate (%) over time
- Code coverage (%) over time
- Security score (0-100) over time

**Chart:** Interactive line chart using Recharts

- 3 metrics plotted on same chart
- Weekly data points (52 weeks)
- Color-coded lines (green=pass rate, blue=coverage, purple=security)

**Data source:** Mock data initially, Redis cache when Inngest aggregation implemented

### Workflow History Table

**Displays:**

- Recent runs across all 4 workflows (3 per workflow = 12 total)
- Workflow name, run number, timestamp
- Status badges (Success, Failed, Running, etc.)
- Direct links to GitHub Actions run

**Real-time updates:** Part of 60-second auto-refresh

### Observation Logger

**API:**

- GET `/api/maintenance/observations?limit=10`
- POST `/api/maintenance/observations`

**Categories:**

- AI Performance (Claude Code issues, context usage, prompt effectiveness)
- Dev Tools (dashboard bugs, analytics issues, dev server problems)
- Workflow (GitHub Actions failures, script errors, automation issues)
- General (miscellaneous notes and observations)

**Severities:**

- Info (blue) - Informational notes
- Warning (yellow) - Issues needing attention
- Error (red) - Critical problems requiring immediate action

**Features:**

- Form with category, severity, title, description, tags
- Tag system with add/remove functionality
- Observation list showing last 10 entries
- Redis storage (LPUSH/LRANGE, max 100 observations)
- Auto-refresh after logging new observation

### Auto-Refresh System

**Interval:** 60 seconds (configurable via toggle)

**Fetches:**

- Workflow summaries (4 workflows)
- API health status
- 52-week trend data
- Recent observations (last 10)

**Manual refresh:** Button with loading spinner

**Last updated:** Timestamp display in dashboard header

### Dashboard Architecture

**Server wrapper:** `src/app/dev/maintenance/page.tsx`

- Uses `assertDevOr404()` for dev-only access
- Force dynamic rendering
- Follows analytics dashboard pattern

**Client component:** `src/app/dev/maintenance/MaintenanceClient.tsx`

- ~860 lines total
- Components:
  - ApiHealthCard (health status display)
  - WorkflowStatusBadge (status indicators)
  - WorkflowCard (workflow summary cards)
  - TrendChart (52-week line chart)
  - ObservationLogger (logging form)
  - ObservationList (recent observations)
- State management for workflows, health, trends, observations
- Parallel API fetching for performance

**Type definitions:** `src/types/maintenance.ts`

- WorkflowRun, WorkflowSummary, WeeklyMetrics
- Observation types and categories
- MaintenanceMetrics interface
- TRACKED_WORKFLOWS configuration

**GitHub API client:** `src/lib/github-workflows.ts`

- `getWorkflowRuns()` - Fetch runs for specific workflow
- `calculateWorkflowSummary()` - Calculate statistics
- `getAllWorkflowSummaries()` - Parallel fetch all workflows
- `getWorkflowRunById()` - Get single run details
- `rerunWorkflow()` - Trigger workflow re-run (not exposed in UI yet)

### API Endpoints

**`/api/maintenance/workflows`**

- Returns workflow summaries with pass rates
- Redis caching (5-min TTL)
- Query params: `limit` (default: 10), `skip_cache`

**`/api/maintenance/metrics`**

- Returns 52-week trend data or current metrics
- Redis caching (1-hour TTL)
- Query param: `period` (52weeks | current)
- Mock data generation for trends (until Inngest aggregation implemented)

**`/api/maintenance/observations`**

- GET: Fetch recent observations with optional filters
- POST: Create new observation
- Redis storage: LPUSH to front of list, LTRIM to max 100
- Query params: `limit`, `category`, `severity`

### Security

**Dev-only access:**

- `assertDevOr404()` blocks production access
- Allowed: development, preview environments
- Blocked: production environment

**API security:**

- GitHub token server-side only (never exposed to client)
- Redis credentials server-side only
- No API keys required for client

**Data privacy:**

- Observations stored in Redis (ephemeral, last 100 only)
- No PII or sensitive data logged
- Manual observations only (no automated tracking)

### Performance Optimizations

**Parallel fetching:**

- All 4 API endpoints fetched simultaneously
- Reduces page load time
- Graceful degradation if any endpoint fails

**Redis caching:**

- Workflows: 5-minute TTL
- Trends: 1-hour TTL
- Reduces GitHub API calls
- Faster dashboard loads

**Dynamic imports:**

- Recharts loaded dynamically to avoid SSR issues
- Reduces initial bundle size
- Better performance on first render

**Auto-refresh optimization:**

- Only refreshes when tab is active (browser native)
- Configurable toggle to disable if needed
- Manual refresh button for immediate updates

### Manual Triggering

Access dashboard:

```
http://localhost:3001/dev/maintenance  (development)
https://preview-url.vercel.app/dev/maintenance  (preview)
```

Log observation programmatically:

```bash
curl -X POST http://localhost:3001/api/maintenance/observations \
  -H "Content-Type: application/json" \
  -d '{
    "category": "ai-performance",
    "severity": "warning",
    "title": "Context window approaching limit",
    "description": "Used 85k tokens in last session, consider optimization",
    "tags": ["context-usage", "optimization"]
  }'
```

### Monitoring

**Dashboard access:**

- Via Dev Tools dropdown in site header
- Shows in development and preview only
- 404 in production (security measure)

**GitHub API rate limits:**

- 5000 requests/hour for authenticated users
- Dashboard uses ~4 requests per refresh
- ~1250 refreshes/hour possible (well within limits)

**Redis storage:**

- Observations: ~100 items max (auto-trimmed)
- Trends cache: 52-week data (~50KB)
- Workflow cache: 4 workflows x 10 runs (~20KB)

### Future Enhancements (Deferred)

**Inngest functions:**

- Daily aggregation of metrics for 52-week trends
- Automated observation creation from workflow failures
- Email notifications for critical observations
- Scheduled cleanup of old Redis data

**Advanced features:**

- Public-facing admin dashboard (authenticated)
- Multi-user observation assignment
- Observation search and filtering
- Export observations to CSV/JSON
- Sentry integration for observation errors

---

## Resources

**GitHub Workflows:**

- [`.github/workflows/weekly-test-health.yml`](../../.github/workflows/weekly-test-health.yml)
- [`.github/workflows/monthly-security-review.yml`](../../.github/workflows/monthly-security-review.yml)
- [`.github/workflows/validate-content.yml`](../../.github/workflows/validate-content.yml)
- [`.github/workflows/monthly-cleanup.yml`](../../.github/workflows/monthly-cleanup.yml)

**Phase 1 Scripts (Testing):**

- `scripts/analyze-test-health.mjs`
- `scripts/sentry-enricher.mjs`
- `scripts/github-api.mjs`

**Phase 2 Scripts (Security):**

- `scripts/security-audit.mjs`
- `scripts/branch-cleanup.mjs`

**Phase 3 Scripts (Content & Cleanup):**

- `scripts/validate-frontmatter.mjs`
- `scripts/monthly-cleanup.mjs`

**Issue Templates:**

- [`.github/ISSUE_TEMPLATE/test-health-report.md`](../../.github/issue_template/test-health-report)
- [`.github/ISSUE_TEMPLATE/monthly-security-review.md`](../../.github/issue_template/monthly-security-review)
- [`.github/ISSUE_TEMPLATE/monthly-cleanup.md`](../../.github/issue_template/monthly-cleanup)

---

## Contact

Questions or issues? Open a GitHub Issue with the `maintenance-automation` label.
