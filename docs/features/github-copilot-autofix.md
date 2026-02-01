{/_ TLP:CLEAR _/}

# GitHub Copilot Autofix: CodeQL Security Automation

**Status:** ✅ Implemented (Beta)
**Last Updated:** January 29, 2026
**Related:** [CodeQL Integration](./github-code-scanning-integration.md) · [Security Policy](../../SECURITY.md) · DCYFR Security Guidelines

---

## Summary

Automated GitHub Copilot-powered workflow that detects CodeQL security alerts, creates feature branches, generates fixes, and opens pull requests for human review. Follows the DCYFR "Fix > Suppress" philosophy by prioritizing actual security fixes over alert suppression.

**Key Features:**

- 🤖 Detects CodeQL alerts automatically (daily) or on-demand (manual)
- 🔧 Creates feature branches with semantic naming (`security/codeql-{number}-{rule}`)
- 🤝 Requests GitHub Copilot to generate fixes
- ✅ Validates fixes don't break tests or introduce new issues
- 📝 Creates pull requests with detailed security context
- 📊 Provides clear summary of fixes and review status

**Benefits:**

- Reduced time-to-fix for security vulnerabilities
- Consistent fix patterns following DCYFR standards
- Audit trail for compliance and security reviews
- Prevents "alert fatigue" by automating routine fixes

---

## Quick Start

### 1. Manual Trigger (Test It Now)

```bash
# Run workflow manually via GitHub UI or CLI
gh workflow run codeql-autofix.yml --ref main

# Or with specific options
gh workflow run codeql-autofix.yml --ref main \
  -f severity=high \
  -f dry_run=false
```

### 2. Automatic Daily Execution

The workflow runs automatically every day at 07:00 UTC (after CodeQL daily scan at 06:00 UTC):

```yaml
schedule:
  - cron: '0 7 * * *'
```

### 3. Review Generated PRs

Once the workflow completes:

1. Go to [Pull Requests](https://github.com/dcyfr/dcyfr-labs/pulls?q=label%3Acodeql-fix)
2. Filter by label: `codeql-fix`
3. Review fix approach and validate it solves the alert
4. Approve and merge if satisfied

---

## How It Works

### Workflow Architecture

```
┌─────────────────────────────────────────────────┐
│ 1. Analyze Alerts                               │
│    ├─ Fetch all open CodeQL alerts              │
│    ├─ Filter by severity (high, critical, etc)  │
│    ├─ Identify fixable alerts                   │
│    └─ Output: alerts_json (for matrix build)    │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ 2. Generate Fixes (Parallel, 1 at a time)       │
│    ├─ Create feature branch                     │
│    ├─ Request Copilot fix                       │
│    ├─ Validate fix quality                      │
│    └─ Create pull request                       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ 3. Summary & Reporting                          │
│    ├─ Count total alerts analyzed               │
│    ├─ Count fixable alerts                      │
│    ├─ Generate workflow summary                 │
│    └─ Output: GitHub Step Summary               │
└─────────────────────────────────────────────────┘
```

### Alert Classification

**Fixable Alerts (Auto-fixed):**

- JavaScript/TypeScript logging security issues
- Input validation vulnerabilities
- Command/SQL injection risks
- Basic XSS vulnerabilities
- Path traversal issues

**Manual Review Required (Skipped):**

- DOM XSS (often false positives)
- Complex path validation
- Alerts with unclear context

**Filtering Criteria:**

- Minimum severity: configurable (default: `high`)
- Known fixable rules: whitelist of 11 rule types
- Must have valid location information
- Must not be dismissed/suppressed already

---

## Configuration

### Workflow Input Parameters

**Via Manual Trigger:**

| Parameter      | Type   | Default | Description                                                          |
| -------------- | ------ | ------- | -------------------------------------------------------------------- |
| `alert_number` | string | (empty) | Specific alert to fix (e.g., `2`). Leave blank for all               |
| `severity`     | string | `high`  | Min severity: `critical`, `high`, `medium`, `low`, `warning`, `note` |
| `dry_run`      | string | `false` | Preview changes without creating branches/PRs                        |

**Example:**

```bash
# Fix all critical alerts (dry run first)
gh workflow run codeql-autofix.yml \
  -f severity=critical \
  -f dry_run=true

# Fix specific alert
gh workflow run codeql-autofix.yml \
  -f alert_number=2 \
  -f dry_run=false
```

### Schedule Configuration

Edit `.github/workflows/codeql-autofix.yml` to adjust timing:

```yaml
schedule:
  - cron: '0 7 * * *' # Daily at 07:00 UTC
  # Other options:
  # - cron: '0 7 * * 1'  # Weekly on Monday
  # - cron: '0 9 1 * *'  # Monthly on 1st
```

### Fixable Rules Configuration

Edit `scripts/ci/analyze-codeql-alerts.mjs` to add/remove rules:

```javascript
const FIXABLE_RULES = new Set([
  'javascript/CleartextLogging',
  'javascript/InputValidation',
  // Add more rules here...
]);

const REQUIRES_MANUAL_REVIEW = new Set([
  'javascript/DOMXSS', // Known false positives
  // Add rules needing manual review here...
]);
```

---

## Usage Examples

### Example 1: Fix All High-Severity Alerts

```bash
# Run workflow with default settings
gh workflow run codeql-autofix.yml

# Monitor execution
gh run list --workflow=codeql-autofix.yml --limit=1 --status=in_progress

# View results
gh run view <run-id> --log
```

**Output:**

```
## CodeQL Alerts Analysis

Total alerts found: 5
Potentially fixable: 3

## Generated Fixes

Alert #2 (CleartextLogging) → PR #123
Alert #5 (InputValidation) → PR #124
Alert #8 (RequiresManualReview) → Skipped
```

### Example 2: Dry Run (Preview Changes)

```bash
# Dry run - no changes committed
gh workflow run codeql-autofix.yml \
  -f severity=high \
  -f dry_run=true

# View what would have been done (no branches/PRs created)
gh run view <run-id> --log
```

### Example 3: Fix Specific Alert

```bash
# Fix alert #7 only
gh workflow run codeql-autofix.yml \
  -f alert_number=7 \
  -f dry_run=false

# Creates:
# - Branch: security/codeql-7-rulename
# - PR: #XYZ with description
```

### Example 4: Critical Only

```bash
# Auto-fix all critical severity alerts
gh workflow run codeql-autofix.yml \
  -f severity=critical \
  -f dry_run=false
```

---

## Generated Artifacts

### Feature Branch Naming

```
security/codeql-{alert-number}-{rule-short-name}

Examples:
  security/codeql-2-cleartext-logging
  security/codeql-5-input-validation
  security/codeql-8-domxss
```

### Pull Request Details

**Title:**

```
fix(security): resolve javascript/CleartextLogging CodeQL alert #2
```

**Labels:**

- `security` - Security-related change
- `automated` - Generated by automation
- `codeql-fix` - From CodeQL autofix workflow

**Description Includes:**

- 📋 Alert details (rule, severity, location)
- 🔒 Security issue explanation
- ✅ Fix validation checklist
- 🔗 Links to Code Scanning dashboard
- 📚 References to DCYFR security guidelines

### Commit Messages

```
fix(security): resolve javascript/CleartextLogging alert #2

Alert: CodeQL #2
Rule: javascript/CleartextLogging
File: src/lib/logger.ts:42
Severity: high

Changes:
- Remove sensitive data from console.log statements
- Use generic logging message instead
- Added security comment explaining approach

Fixes: https://github.com/dcyfr/dcyfr-labs/security/code-scanning/2
See: .github/agents/patterns/CODEQL_SUPPRESSIONS.md
```

---

## Validation & Quality Checks

### Pre-Fix Validation

The workflow validates before creating a PR:

✅ **TypeScript Compilation** - No type errors
✅ **ESLint** - Code quality passes (0 errors)
✅ **npm audit** - No new dependency vulnerabilities
✅ **Test Suite** - ≥99% tests still passing
✅ **Design Tokens** - UI changes use design tokens (if applicable)

### If Validation Fails

The workflow:

1. **Halts** the PR creation process
2. **Logs** the validation failure
3. **Creates** a branch comment with failure details
4. **Skips** to next alert in the matrix

Manual fix required:

```bash
# Checkout the branch
git checkout security/codeql-2-cleartext-logging

# Review the issue
npm run lint

# Fix manually
npm run lint -- --fix

# Commit and push
git add .
git commit -m "fix: resolve linting issues"
git push origin security/codeql-2-cleartext-logging
```

---

## Integration with DCYFR Security Policy

### "Fix > Suppress" Philosophy

This automation enforces DCYFR's security-first approach:

❌ **Never do this:**

```javascript
// Bad: Suppressing alerts instead of fixing
console.log(`API Key: ${apiKey}`); // lgtm [cleartext-logging]
```

✅ **Always do this:**

```javascript
// Good: Remove sensitive data logging entirely
console.log('API key configured successfully');

// Or use masking if verification needed:
const masked = apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.slice(-4);
console.log(`API key: ${masked}`);
```

### LGTM Suppression Policy

If Copilot-generated fix includes a suppression comment:

1. **Review** the justification
2. **Verify** it meets the 30-minute fix attempt requirement
3. **Ensure** it documents technical barriers to fixing
4. **Approve** only if truly infeasible to fix

See: CODEQL_SUPPRESSIONS.md

---

## Troubleshooting

### Workflow Not Running

**Issue:** Scheduled workflow never executes

**Solution:**

1. Verify schedule is correct: `.github/workflows/codeql-autofix.yml` line 8-10
2. Check Actions are enabled: Settings → Actions → Allow all actions
3. Verify branch protection doesn't block workflows
4. Check workflow syntax: `gh workflow validate .github/workflows/codeql-autofix.yml`

### No Alerts Found

**Issue:** "No open alerts found" in workflow logs

**Likely causes:**

- No new CodeQL alerts in the repository ✅ (this is good!)
- CodeQL scan hasn't run yet (check codeql.yml schedule)
- All alerts are below minimum severity threshold
- Alerts are dismissed/suppressed

**Solution:**

```bash
# Check open CodeQL alerts manually
gh api /repos/dcyfr/dcyfr-labs/code-scanning/alerts --jq '.[] | {number, state, rule: .rule.id}'

# Trigger CodeQL scan manually if needed
gh workflow run codeql.yml
```

### PR Creation Failed

**Issue:** PR not created even though fix was generated

**Likely causes:**

- Validation failed (see logs for ESLint/TypeScript errors)
- Branch push failed (check GitHub token permissions)
- GitHub API rate limit exceeded

**Solution:**

```bash
# Check workflow logs for specific error
gh run view <run-id> --log

# If rate limited, wait 1 hour and retry
gh workflow run codeql-autofix.yml -f dry_run=true

# If permissions issue, verify GitHub token has:
# - contents:write
# - pull-requests:write
# - security-events:read
```

### Branch Already Exists

**Issue:** "Branch already exists" in logs

**Solution:**

The workflow detects this and reuses the existing branch. If you want to retry:

```bash
# Delete the old branch
git push origin --delete security/codeql-2-cleartext-logging

# Rerun workflow
gh workflow run codeql-autofix.yml -f alert_number=2
```

---

## Advanced Configuration

### Customize Fixable Rules

Edit `scripts/ci/analyze-codeql-alerts.mjs`:

```javascript
// Add more rules to auto-fix
const FIXABLE_RULES = new Set([
  'javascript/CleartextLogging',
  'javascript/XSS',
  'javascript/SqlInjection',
  'javascript/CommandInjection',
  'javascript/PathTraversal',
  'javascript/IncorrectRegexpParse',
  'javascript/IncorrectRegexpEscape',
  'javascript/InputValidation',
  'javascript/CleartextStorage',
  'typescript/CleartextLogging',
  'typescript/InputValidation',
  // Add new rules here
]);

// Mark rules that need human review
const REQUIRES_MANUAL_REVIEW = new Set([
  'javascript/DOMXSS', // Known false positives
  'javascript/TaintedPath', // Complex patterns
  'javascript/NoHardcodedPasswords', // May be in tests
  // Add more here
]);
```

### Change Severity Thresholds

```bash
# Only fix critical alerts
gh workflow run codeql-autofix.yml -f severity=critical

# Fix medium and above
gh workflow run codeql-autofix.yml -f severity=medium
```

### Adjust Schedule

For different deployment cadences:

```yaml
# Multiple schedules
schedule:
  # Daily (default)
  - cron: '0 7 * * *'
  # Weekly check (optional)
  # - cron: '0 7 * * 1'
```

---

## Performance & Cost

### Resource Usage

**Per workflow run:**

- GitHub Actions time: ~5-10 minutes (varies with alert count)
- GitHub Copilot: 0-N requests (varies with fixable alerts)
- API calls: ~50-100 (GitHub + gh CLI)

**Cost:**

- GitHub Actions: ~0.05-0.15 credits per run
- GitHub Copilot: Included with GitHub Copilot subscription
- Total: Minimal (already part of standard GitHub pricing)

### Optimization Tips

**Reduce API calls:**

```bash
# Only check specific severity
gh workflow run codeql-autofix.yml -f severity=critical

# Limit to specific alert
gh workflow run codeql-autofix.yml -f alert_number=2
```

**Parallel processing:**

Current: Sequential (1 alert at a time)

- Prevents GitHub API rate limiting
- Easier to debug individual failures
- Could parallelize with rate limit management if needed

---

## Monitoring & Reporting

### View Workflow Status

```bash
# List recent runs
gh run list --workflow=codeql-autofix.yml --limit=10

# View specific run
gh run view <run-id> --log

# Check for failures
gh run list --workflow=codeql-autofix.yml --status=failed
```

### Pull Request Dashboard

Filter PRs created by this workflow:

```bash
# All codeql-fix PRs
gh pr list --label codeql-fix

# Open fixes
gh pr list --label codeql-fix --state open

# Merged (completed fixes)
gh pr list --label codeql-fix --state closed --json merged
```

### Metrics

Monthly tracking (useful for security reports):

```bash
# Count automated fixes this month
gh pr list --label codeql-fix --state closed \
  --json title,mergedAt \
  --jq '.[] | select(.mergedAt > "2026-01-01") | .title'

# Typical output:
# 5 PRs merged
# 2 PRs in review
# 1 PR failed validation
```

---

## Related Documentation

- [CodeQL Integration](./github-code-scanning-integration.md) - How to check alerts programmatically
- DCYFR Security Guidelines - Suppression policies
- [Logging Security Best Practices](../../docs/ai/logging-security.md) - Common security patterns
- [Security Policy](../../SECURITY.md) - Overall security approach

---

## FAQ

**Q: Can I edit the fix before merging?**
A: Yes! PRs are drafts until you approve them. You can:

1. Check out the branch: `git checkout security/codeql-2-rule`
2. Make additional fixes or refinements
3. Push updates: `git push origin security/codeql-2-rule`
4. The PR updates automatically

**Q: What if the Copilot fix is wrong?**
A: The validation step catches most issues. If validation passes but the fix is semantically wrong:

1. Reject the PR (close without merging)
2. Delete the branch: `git push origin --delete security/codeql-2-rule`
3. Manually fix the alert
4. Report as issue in repo if pattern is common

**Q: Does this replace human review?**
A: No. The workflow generates candidate fixes for review. All PRs require:

- Validation checklist completed
- Code review (ESLint, TypeScript pass)
- Security review (fix doesn't introduce new issues)
- Manual approval before merge

**Q: Can I disable this workflow?**
A: Yes. Either:

1. Delete `.github/workflows/codeql-autofix.yml`
2. Or disable in GitHub UI: Actions → Workflows → "CodeQL Autofix" → "···" → Disable

**Q: What's the error recovery process?**
A: If a fix fails:

1. Check logs: `gh run view <run-id> --log`
2. Identify failure reason
3. Delete branch if created: `git push origin --delete security/codeql-X-Y`
4. Manual fix or create issue for later review

---

## Future Enhancements

**Planned:**

- [ ] Integration with Copilot Extensions API (for more reliable fixes)
- [ ] Custom fix templates per rule type
- [ ] Pre-review validation with security team
- [ ] Metrics dashboard (fixes/month, success rate, etc)
- [ ] Integration with Sentry for context-aware fixes

**Backlog:**

- [ ] Support for Semgrep/ESLint alerts (not just CodeQL)
- [ ] Automatic rollback if fix introduces regressions
- [ ] Machine learning-based confidence scoring
- [ ] Multi-language support (Python, Java, etc)

---

**Last Updated:** January 29, 2026
**Maintained By:** DCYFR Labs Team
**Status:** ✅ Beta (Ready for production use)

For issues or questions: See [SECURITY.md](../../SECURITY.md) or [GitHub Discussions](https://github.com/dcyfr/dcyfr-labs/discussions)
