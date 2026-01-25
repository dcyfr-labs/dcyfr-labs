{/* TLP:CLEAR */}

# Dependabot Setup Guide

**Status:** ✅ **ACTIVE** (November 11, 2025)

This guide covers the complete setup and configuration of GitHub Dependabot for automated dependency updates and security vulnerability monitoring.

---

## Table of Contents
- [Overview](#overview)
- [Quick Setup Checklist](#quick-setup-checklist)
- [Configuration Details](#configuration-details)
- [Security Alerts Setup](#security-alerts-setup)
- [Auto-Merge Configuration](#auto-merge-configuration)
- [PR Management Strategy](#pr-management-strategy)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Dependabot** provides three key services:
1. **Security Alerts**: Immediate notifications for known vulnerabilities
2. **Security Updates**: Automatic PRs to fix vulnerabilities
3. **Version Updates**: Regular PRs to keep dependencies current

**Benefits:**
- ⚡ **Proactive Security**: Catch vulnerabilities before they're exploited
- ⏱️ **Time Savings**: 4-8 hours/month on manual dependency updates
- 🛡️ **Risk Mitigation**: Stay current with patches and fixes
- 📊 **Visibility**: Clear tracking of dependency health

---

## Quick Setup Checklist

### Step 1: Enable Dependabot Features (GitHub Web UI)

1. **Navigate to Repository Settings**:
   ```
   https://github.com/dcyfr/dcyfr-labs/settings/security_analysis
   ```

2. **Enable Security Features**:
   - ✅ **Dependency graph** (should already be enabled)
   - ✅ **Dependabot alerts** - Click "Enable"
   - ✅ **Dependabot security updates** - Click "Enable"

3. **Configure Notification Preferences**:
   - Go to: https://github.com/settings/notifications
   - Under **"Dependabot alerts"**:
     - ✅ Enable email notifications
     - ✅ Enable web notifications
     - Choose: "Only participating" or "Watching and participating" (recommended)

4. **Set Alert Severity Threshold** (Optional):
   - Settings → Code security and analysis → Dependabot alerts
   - Configure to receive alerts for: **"Critical" and "High"** severity (recommended)

### Step 2: Verify Configuration File

The `.github/dependabot.yml` file is already created and configured with:
- ✅ **Weekly updates** every Monday at 9 AM PST
- ✅ **Grouped PRs** for related packages (Next.js, TypeScript, testing, etc.)
- ✅ **10 concurrent PRs** maximum
- ✅ **Proper labeling** for easy filtering
- ✅ **Semantic commit messages** with conventional commits format

### Step 3: Test the Setup

After enabling in GitHub settings, Dependabot will:
1. **Immediate**: Scan for security vulnerabilities (within minutes)
2. **Within 24 hours**: Open first batch of update PRs (if updates available)
3. **Weekly**: Check for new updates every Monday at 9 AM PST

**To verify it's working:**
```bash
# Check if Dependabot has opened any PRs
gh pr list --label "dependencies"

# Or visit:
https://github.com/dcyfr/dcyfr-labs/pulls?q=is%3Apr+is%3Aopen+label%3Adependencies
```

---

## Configuration Details

### Update Schedule

- **Frequency**: Weekly (Monday at 9:00 AM PST)
- **Why Weekly**: Balances staying current without PR fatigue
- **Override**: Security updates open immediately regardless of schedule

### Package Grouping Strategy

Dependabot groups related packages to reduce PR noise:

| Group Name | Packages | Purpose |
|------------|----------|---------|
| `nextjs` | Next.js, React, Vercel packages | Keep framework in sync |
| `typescript` | TypeScript, @types/* | Type definitions together |
| `testing` | Vitest, Testing Library, Playwright | Test infrastructure |
| `code-quality` | ESLint, Prettier, TS-ESLint | Linting/formatting tools |
| `ui-packages` | Tailwind, Radix UI, shadcn/ui deps | UI library updates |
| `content` | MDX, Shiki, rehype/remark plugins | Content processing |
| `monitoring` | Sentry packages | Error tracking |
| `background-jobs` | Inngest | Background jobs |
| `development-dependencies` | All dev deps (minor/patch) | Non-production deps |

### Commit Message Format

All Dependabot PRs use **Conventional Commits**:
```
chore(deps): bump next from 15.0.0 to 15.0.1
chore(deps-dev): bump eslint from 8.0.0 to 8.1.0
chore(ci): bump actions/checkout from 3 to 4
```

This integrates with automated changelogs and release notes.

---

## Security Alerts Setup

### Alert Workflow

1. **Vulnerability Detected** → GitHub scans npm advisory database
2. **Alert Created** → Dependabot opens a security advisory
3. **Notification Sent** → Email/web notification based on preferences
4. **PR Opened** → Dependabot creates PR with fix (if available)
5. **Review & Merge** → Team reviews and merges security updates

### Alert Severity Levels

| Severity | Response Time | Example |
|----------|---------------|---------|
| **Critical** | Within 24 hours | Remote code execution, auth bypass |
| **High** | Within 72 hours | SQL injection, XSS vulnerabilities |
| **Moderate** | Within 1 week | DoS, information disclosure |
| **Low** | Next sprint | Minor security improvements |

### Viewing Active Alerts

**GitHub Web UI:**
```
https://github.com/dcyfr/dcyfr-labs/security/dependabot
```

**GitHub CLI:**
```bash
# List all security alerts
gh api /repos/dcyfr/dcyfr-labs/dependabot/alerts

# List only open alerts
gh api /repos/dcyfr/dcyfr-labs/dependabot/alerts?state=open
```

---

## Auto-Merge Configuration

### GitHub Actions Workflow (Optional)

For hands-off dependency management, create `.github/workflows/dependabot-auto-merge.yml`:

```yaml
name: Dependabot Auto-Merge
on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"
      
      - name: Auto-merge minor and patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-minor' || steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{github.event.pull_request.html_url}}
          GH_TOKEN: ${{secrets.GITHUB_TOKEN}}
      
      - name: Auto-approve security updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr review --approve "$PR_URL"
        env:
          PR_URL: ${{github.event.pull_request.html_url}}
          GH_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

### Auto-Merge Rules

**Safe to auto-merge:**
- ✅ Patch updates (1.2.3 → 1.2.4)
- ✅ Minor updates for dev dependencies
- ✅ Security updates (after CI passes)

**Requires manual review:**
- ⚠️ Major version updates (breaking changes)
- ⚠️ Updates to core dependencies (Next.js, React)
- ⚠️ Updates that fail CI checks

---

## PR Management Strategy

### Weekly PR Review Process

**Monday (Update Day):**
1. Dependabot opens PRs (up to 10 at once)
2. CI runs automatically (build, lint, type-check)
3. Review grouped PRs by category

**Review Priority:**
1. **🚨 Security Updates** - Merge ASAP (within 24-48 hours)
2. **🔧 Bug Fixes** - Review and merge within week
3. **📦 Feature Updates** - Test locally if significant
4. **🎨 Dev Dependencies** - Quick review, merge if CI passes

### PR Labels

Dependabot automatically adds labels for filtering:
- `dependencies` - All dependency updates
- `automated` - Automated PRs
- `github-actions` - CI/CD workflow updates

**Custom labels you can add:**
- `priority: high` - Security or blocking issues
- `ready to merge` - Approved and tested
- `needs testing` - Requires local verification

### Bulk Actions

**Close all dev dependency PRs:**
```bash
gh pr list --label "dependencies" --label "automated" \
  --json number --jq '.[].number' | \
  xargs -I {} gh pr close {}
```

**Merge all patch updates:**
```bash
gh pr list --label "dependencies" --search "chore(deps): bump" \
  --json number --jq '.[].number' | \
  xargs -I {} gh pr merge {} --squash --auto
```

---

## Troubleshooting

### Issue: No PRs Being Created

**Possible Causes:**
1. Dependabot not enabled in repo settings
2. All dependencies are up to date
3. Open PR limit reached (10 max)
4. Configuration file has syntax errors

**Solutions:**
```bash
# Validate dependabot.yml syntax
npx @dependabot/cli validate .github/dependabot.yml

# Check Dependabot logs (web UI only)
# Settings → Code security and analysis → Dependabot → View logs
```

### Issue: Too Many PRs

**Solution: Adjust configuration**
```yaml
# In .github/dependabot.yml
open-pull-requests-limit: 5  # Reduce from 10 to 5

# Or increase grouping
groups:
  all-minor-patch:
    update-types:
      - "minor"
      - "patch"
```

### Issue: Failed Security Updates

**Common causes:**
1. Breaking changes in dependency
2. Test failures after update
3. Incompatible peer dependencies

**Resolution:**
```bash
# Locally reproduce and fix
git checkout -b fix/dependabot-security-update
npm update [package-name]@[version]
npm test
# Fix any breaking changes
git commit -m "fix: resolve breaking changes from security update"
git push
```

### Issue: Notifications Too Noisy

**Adjust notification settings:**
1. GitHub Settings → Notifications
2. Under **"Dependabot alerts"**:
   - Change to "Only critical and high severity"
   - Or disable email, keep web notifications only

---

## Maintenance

### Monthly Review

**First Monday of each month:**
1. Review open Dependabot PRs (should be < 5)
2. Check for any ignored/postponed security alerts
3. Review auto-merge success rate
4. Adjust grouping or schedule if needed

### Quarterly Audit

**Every 3 months:**
1. Review ignored dependencies in `dependabot.yml`
2. Update grouping strategy based on update patterns
3. Review major version updates that were deferred
4. Audit npm dependencies for unused packages

### Metrics to Track

- **Security Alert Response Time**: Target < 48 hours for critical
- **PR Merge Rate**: Target > 80% within 1 week
- **CI Success Rate**: Target > 95% for Dependabot PRs
- **Time Saved**: ~4-8 hours/month on manual updates

---

## Related Documentation

- **GitHub Docs**: [About Dependabot](https://docs.github.com/en/code-security/dependabot)
- **npm Advisories**: [npm Security Advisories](https://www.npmjs.com/advisories)
- **Project Security**: `/docs/security/` directory
- **CI/CD Pipeline**: `.github/workflows/` directory

---

## Success Metrics

**After 1 month, you should see:**
- ✅ Zero critical/high severity vulnerabilities
- ✅ 80%+ of minor/patch updates merged
- ✅ 4-8 hours saved on manual dependency management
- ✅ Proactive security posture (alerts before exploits)

**ROI Calculation:**
- **Setup Time**: 1 hour (one-time)
- **Weekly Maintenance**: 30 minutes (review PRs)
- **Time Saved**: 4-8 hours/month (manual updates + security research)
- **Net Benefit**: ~6 hours/month saved

---

**Last Updated:** November 11, 2025  
**Status:** Active and monitoring  
**Next Review:** December 9, 2025 (Monthly review)
