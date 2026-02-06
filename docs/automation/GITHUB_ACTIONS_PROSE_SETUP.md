<!-- TLP:CLEAR -->
# GitHub Actions Setup for Prose Validation

## Overview

Automated prose validation runs on:

- **Pull Requests:** Checks MDX content changes before merge
- **Weekly Schedule:** Runs every Monday at 9:00 AM UTC
- **Manual Trigger:** Can be run on-demand via workflow dispatch

## Required GitHub Secrets

The workflow requires LanguageTool Pro API credentials to be configured as repository secrets:

### 1. Navigate to Repository Settings

```
GitHub → dcyfr/dcyfr-labs → Settings → Secrets and variables → Actions
```

### 2. Add the following secrets:

#### `LANGUAGETOOL_API_KEY`

- **Value:** Your LanguageTool Pro API key
- **Source:** Available in your LanguageTool account settings
- **Format:** Long alphanumeric string (e.g., `abc123def456...`)

#### `LANGUAGETOOL_USERNAME`

- **Value:** Your LanguageTool Pro username/email
- **Source:** Your LanguageTool account email
- **Format:** Email address (e.g., `user@example.com`)

### 3. Verification

After adding secrets:

1. Go to **Actions** tab
2. Select **Prose Validation** workflow
3. Click **Run workflow** (manual trigger)
4. Verify it completes successfully

## Workflow Features

### Pull Request Checks

- ✅ Validates prose quality before merge
- ✅ Posts detailed comment with issues found
- ✅ Blocks merge if validation fails
- ✅ Shows summary in PR checks

### Weekly Scans

- ✅ Catches issues that slip through
- ✅ Runs every Monday morning
- ✅ Generates downloadable report
- ✅ Can be configured to notify on failures

### Validation Report

- **Artifact:** `prose-validation-report.json` (30-day retention)
- **Contents:** Detailed issues with line numbers and suggestions
- **Download:** Available in workflow run summary

## Usage Examples

### For Contributors

When creating a PR with MDX content changes:

1. Push your changes
2. GitHub Actions automatically runs prose validation
3. Review results in PR checks
4. Fix any issues locally with `npm run prose:check`
5. Push fixes and re-run validation

### For Maintainers

To run manual validation:

1. Go to **Actions** → **Prose Validation**
2. Click **Run workflow**
3. Select branch (default: `main`)
4. Click **Run workflow** button
5. Review results in workflow summary

## Troubleshooting

### Workflow fails with "API key not found"

**Solution:** Verify GitHub secrets are configured correctly

```bash
# Check if secrets exist (won't show values)
gh secret list
```

### Workflow times out

**Solution:** Increase timeout in `.github/workflows/prose-validation.yml`:

```yaml
timeout-minutes: 15 # Increase from 10 to 15
```

### False positives in validation

**Solution:** Add rules to disabled list in `scripts/validate-prose.mjs`:

```javascript
disabledRules: [
  // ... existing rules
  'NEW_RULE_ID', // Description of why disabled
];
```

## Performance Metrics

Current validation speed:

- **14 MDX files:** ~8-10 seconds
- **Network calls:** 1-2 per file (batched)
- **Cache:** npm dependencies cached between runs

Expected CI run time:

- **Setup (Node + deps):** ~30-45 seconds
- **Validation:** ~10-15 seconds
- **Total:** ~1 minute per run

## Cost Considerations

LanguageTool Pro API limits:

- **Rate limit:** 80 requests/min (sufficient for CI)
- **Character limit:** 300K chars/min (far exceeds needs)
- **Concurrent requests:** 5 (workflow runs sequentially)

Estimated API usage per run:

- **Weekly scan:** ~14 files = ~14 requests
- **PR check:** ~1-3 files (only changed files) = ~1-3 requests
- **Monthly total:** ~4 weekly + ~20 PR checks = ~56-76 requests

**Result:** Well within Pro plan limits (no additional cost)

## Integration with Development Workflow

### Pre-commit Hook (Optional)

Add to `.husky/pre-commit` to catch issues before push:

```bash
# Run prose validation on staged MDX files
npm run prose:check:staged
```

### VS Code Integration (Optional)

Install LanguageTool extension:

```json
{
  "languageTool.enabled": true,
  "languageTool.apiUrl": "https://api.languagetoolplus.com/v2",
  "languageTool.username": "${env:LANGUAGETOOL_USERNAME}",
  "languageTool.apiKey": "${env:LANGUAGETOOL_API_KEY}"
}
```

## Maintenance

### Update Schedule

To change weekly scan timing, edit `.github/workflows/prose-validation.yml`:

```yaml
schedule:
  # Run every Wednesday at 2:00 PM UTC
  - cron: '0 14 * * 3'
```

Cron syntax helper:

- `0 9 * * 1` = Monday at 9:00 AM
- `0 14 * * 3` = Wednesday at 2:00 PM
- `0 0 * * 0` = Sunday at midnight

### Disable Workflow

To temporarily disable without deleting:

```yaml
on:
  workflow_dispatch: # Only manual runs
  # pull_request: # Commented out
  # schedule: # Commented out
```

## Next Steps

1. **Add GitHub secrets** (LANGUAGETOOL_API_KEY, LANGUAGETOOL_USERNAME)
2. **Test workflow** with manual run
3. **Monitor first PR** to verify automated checks work
4. **Review weekly reports** after first scheduled run
5. **Consider notifications** for scheduled scan failures (optional)

## Support

For issues with:

- **Workflow configuration:** Check `.github/workflows/prose-validation.yml`
- **Validation logic:** Check `scripts/validate-prose.mjs`
- **GitHub Actions:** [GitHub Actions documentation](https://docs.github.com/en/actions)
- **LanguageTool API:** [LanguageTool API docs](https://languagetool.org/http-api/)
