# GitHub Improvements Phase 3 - Implementation Guide

**Date**: 2025-12-21
**Phase**: Advanced Quality & Security
**Status**: Ready for Deployment

This guide covers Phase 3 improvements: SAST scanning, visual regression testing, and advanced performance monitoring.

---

## 📋 Phase 3 Overview

### New Capabilities

**Security Enhancement:**
1. `sast-semgrep.yml` - Static Application Security Testing with Semgrep
   - OWASP Top 10 detection
   - React/TypeScript/Next.js security rules
   - SARIF integration with GitHub Security

**Visual Quality:**
2. `visual-regression.yml` - Visual Regression Testing
   - Chromatic integration for Storybook-based testing
   - Playwright fallback for screenshot comparison
   - PR visual change detection

**Performance Tracking:**
3. `performance-monitoring.yml` - Advanced Performance Monitoring
   - Weekly Core Web Vitals tracking
   - Bundle size budget enforcement
   - Lighthouse CI integration with trend analysis

---

## 🚀 Implementation Steps

### Part 1: SAST Security Scanning

#### 1.1 Enable Semgrep SAST

**File:** `.github/workflows/sast-semgrep.yml`

**Prerequisites:**
- GitHub Advanced Security enabled (or public repository)
- Optional: Semgrep Cloud account for advanced features

**Setup Steps:**

```bash
# 1. Test Semgrep locally (optional)
docker run --rm -v "${PWD}:/src" returntocorp/semgrep semgrep scan \
  --config=auto \
  --config="p/security-audit" \
  --config="p/owasp-top-ten"

# 2. (Optional) Add Semgrep Cloud token to repository secrets
# Navigate to repository Settings > Secrets > Actions
# Add new secret: SEMGREP_APP_TOKEN
# Get token from: https://semgrep.dev/orgs/-/settings/tokens

# 3. Enable workflow
git add .github/workflows/sast-semgrep.yml
git commit -m "feat(security): Add Semgrep SAST scanning"
git push origin preview

# 4. Test manually
gh workflow run sast-semgrep.yml
gh run watch
```

**What it does:**
- Scans code for security vulnerabilities on every PR and push
- Reports findings to GitHub Security > Code scanning alerts
- Blocks PRs with critical security issues
- Creates automated issues for critical findings on scheduled scans
- Includes rulesets:
  - Security audit
  - OWASP Top 10
  - React best practices
  - TypeScript security
  - Next.js patterns

**Expected findings:**
- First run may detect existing issues
- Review and triage findings in Security > Code scanning alerts
- Mark false positives or fix genuine security issues

---

### Part 2: Visual Regression Testing

#### 2.1 Setup Prerequisites

**Option A: Chromatic (Recommended)**

Visual regression requires Storybook. If not already configured:

```bash
# 1. Install Storybook
npx storybook@latest init

# 2. Configure for Next.js
# Follow prompts to integrate with Next.js App Router

# 3. Create example stories
# See docs/testing/visual-regression-setup.md for examples

# 4. Sign up for Chromatic
# Visit: https://www.chromatic.com/
# Connect GitHub repository

# 5. Add Chromatic token to repository secrets
# Settings > Secrets > Actions
# Add new secret: CHROMATIC_PROJECT_TOKEN
```

**Option B: Playwright Fallback**

If Storybook setup is deferred, the workflow automatically falls back to basic Playwright screenshot comparison.

#### 2.2 Enable Visual Regression Workflow

```bash
# Enable workflow
git add .github/workflows/visual-regression.yml
git commit -m "feat(testing): Add visual regression testing"
git push origin preview

# Test on a PR that changes UI components
# Workflow will detect Storybook presence and run appropriate tests
```

**What it does:**
- **With Storybook/Chromatic:**
  - Captures component snapshots
  - Detects visual changes in components
  - Provides UI for reviewing and approving changes
  - Blocks PRs until visual changes are approved

- **Without Storybook (fallback):**
  - Comments on PR noting Storybook not configured
  - Provides setup instructions
  - Uses basic Playwright screenshot comparison if configured

---

### Part 3: Advanced Performance Monitoring

#### 3.1 Setup Lighthouse CI

**Prerequisites:**

Create Lighthouse CI configuration:

```bash
# 1. Create Lighthouse CI config
mkdir -p .github/lighthouse
cat > .github/lighthouse/ci.json << 'EOF'
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run start",
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/blog",
        "http://localhost:3000/projects"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.95}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
EOF

# 2. Verify bundle size budget exists
cat scripts/performance/bundle-size-budget.json
```

#### 3.2 Enable Performance Monitoring

```bash
# Enable workflow
git add .github/workflows/performance-monitoring.yml
git add .github/lighthouse/ci.json
git commit -m "feat(monitoring): Add advanced performance monitoring"
git push origin preview

# Test manually
gh workflow run performance-monitoring.yml --field create_report=true
gh run watch

# Check for performance report issue
gh issue list --label "performance" --label "monitoring"
```

**What it does:**
- Runs weekly on Monday at 10:00 UTC
- Analyzes Core Web Vitals (LCP, FID, CLS, TTI, TBT)
- Tracks bundle sizes against budgets
- Creates/updates GitHub issue with performance report
- Provides actionable recommendations for improvements

**Metrics tracked:**
- Performance Score (target: ≥90%)
- LCP - Largest Contentful Paint (target: <2.5s)
- FID - First Input Delay (target: <100ms)
- CLS - Cumulative Layout Shift (target: <0.1)
- TTI - Time to Interactive (target: <3.8s)
- TBT - Total Blocking Time (target: <200ms)
- JavaScript bundle size (budget: defined in bundle-size-budget.json)
- CSS bundle size (budget: defined in bundle-size-budget.json)

---

## 📊 Expected Impact

### Security Posture

| Capability | Before | After |
|------------|--------|-------|
| SAST Coverage | CodeQL only | CodeQL + Semgrep (OWASP Top 10) |
| Security Rulesets | Basic | React, TypeScript, Next.js specific |
| Finding Automation | Manual review | Auto-issue creation for critical findings |

### Visual Quality

| Capability | Before | After |
|------------|--------|-------|
| Visual Testing | Manual QA | Automated component snapshot testing |
| Change Detection | Git diff only | Visual diff with approval workflow |
| Component Coverage | 0% | Storybook coverage % |

### Performance Monitoring

| Capability | Before | After |
|------------|--------|-------|
| Core Web Vitals | Lighthouse CI on PR | Weekly trend tracking |
| Bundle Monitoring | Manual checks | Automated budget enforcement |
| Performance Reports | None | Weekly automated reports |
| Historical Tracking | None | 90-day artifact retention |

---

## ✅ Testing & Validation

### Phase 3A: Test SAST Scanning (Week 1)

```bash
# 1. Trigger manual scan
gh workflow run sast-semgrep.yml

# 2. Monitor results
gh run watch

# 3. Review findings in Security tab
open "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/security/code-scanning"

# 4. Test PR blocking (create test PR with intentional security issue)
git checkout -b test/sast-blocking
# Add intentional security issue (e.g., hardcoded secret)
echo "const API_KEY = 'sk-1234567890abcdef';" > src/test-security.ts
git add src/test-security.ts
git commit -m "test: intentional security issue"
git push origin test/sast-blocking
gh pr create --title "Test: SAST Blocking" --body "Should be blocked by Semgrep"

# Verify workflow fails and blocks PR
```

**Success criteria:**
- Semgrep scan completes successfully
- Findings appear in Security > Code scanning alerts
- Critical findings block PR merge
- Automated issue created for scheduled scans with critical findings

### Phase 3B: Test Visual Regression (Week 2)

**With Storybook:**
```bash
# 1. Create test PR with UI change
git checkout -b test/visual-change
# Modify a component's styling
git commit -am "test: visual change"
git push origin test/visual-change
gh pr create --title "Test: Visual Change" --body "Should trigger visual regression"

# 2. Review visual changes in Chromatic
# Check PR comment for Chromatic build URL

# 3. Approve or reject changes in Chromatic UI

# 4. Verify workflow passes after approval
```

**Without Storybook:**
```bash
# Workflow should comment on PR with setup instructions
# Verify fallback message appears
```

**Success criteria:**
- Visual changes detected in Chromatic
- PR comment includes Storybook and build URLs
- Workflow blocks until changes approved
- Fallback works correctly without Storybook

### Phase 3C: Test Performance Monitoring (Weeks 3-4)

```bash
# 1. Trigger manual performance analysis
gh workflow run performance-monitoring.yml --field create_report=true

# 2. Wait for completion
gh run watch

# 3. Check performance report issue
gh issue list --label "performance" --label "monitoring"

# 4. Verify metrics in issue
# Should include: Performance score, Core Web Vitals, bundle sizes, recommendations

# 5. Test budget enforcement
# Temporarily reduce budget in scripts/performance/bundle-size-budget.json
# Re-run workflow and verify warnings for exceeded budgets
```

**Success criteria:**
- Performance report generated successfully
- All Core Web Vitals metrics populated
- Bundle size budgets checked correctly
- Recommendations provided when metrics fail
- Issue created/updated on schedule

---

## 🔄 Rollback Plan

### Disable SAST Scanning

```bash
git mv .github/workflows/sast-semgrep.yml .github/workflows/_disabled/
git commit -m "chore: disable SAST scanning temporarily"
git push
```

### Disable Visual Regression

```bash
git mv .github/workflows/visual-regression.yml .github/workflows/_disabled/
git commit -m "chore: disable visual regression temporarily"
git push
```

### Disable Performance Monitoring

```bash
git mv .github/workflows/performance-monitoring.yml .github/workflows/_disabled/
git commit -m "chore: disable performance monitoring temporarily"
git push
```

---

## 📝 Maintenance

### Weekly Tasks

**Monday Morning (10:00 UTC):**
1. Review performance report issue
   - Check Core Web Vitals trends
   - Review bundle size changes
   - Prioritize performance improvements if needed

**Throughout the week:**
1. Review SAST findings in Security > Code scanning alerts
   - Triage new findings
   - Mark false positives
   - Create issues for genuine security concerns

2. Review visual regression changes in Chromatic (if enabled)
   - Approve intentional UI changes
   - Reject unintended visual regressions

### Monthly Tasks

1. **Review SAST coverage:**
   ```bash
   # Check Semgrep rule effectiveness
   gh api repos/:owner/:repo/code-scanning/alerts \
     --jq '.[] | select(.tool.name == "Semgrep") | {rule: .rule.id, state: .state}'
   ```

2. **Analyze performance trends:**
   - Review last 4 weekly performance reports
   - Identify degradation trends
   - Plan optimization sprints if needed

3. **Update Semgrep rules:**
   ```bash
   # Update to latest rulesets
   # Edit .github/workflows/sast-semgrep.yml
   # Check for new rulesets at https://semgrep.dev/explore
   ```

---

## 🎯 Success Metrics

Track these metrics after Phase 3 implementation:

**Week 1-2:**
- [ ] SAST scanning running successfully on all PRs
- [ ] Security findings triaged and addressed
- [ ] Visual regression workflow tested (with or without Storybook)
- [ ] No false positive PR blocks

**Week 3-4:**
- [ ] First performance report generated
- [ ] Core Web Vitals metrics within targets (or improvement plan created)
- [ ] Bundle budgets enforced
- [ ] Team actively reviewing weekly reports

**Month 1:**
- [ ] Zero critical unresolved SAST findings
- [ ] Visual regression process integrated into development workflow
- [ ] Performance metrics stable or improving
- [ ] All workflows running reliably

---

## 🆘 Troubleshooting

### SAST Scan Failing

**Problem**: Semgrep scan times out or fails
**Solution**:
```bash
# Reduce ruleset scope
# Edit .github/workflows/sast-semgrep.yml
# Remove --config lines for less critical rulesets
# Start with just --config=auto
```

### Visual Regression Not Detecting Changes

**Problem**: Chromatic not detecting visual changes
**Solution**:
```bash
# Verify Storybook build
npm run build-storybook

# Check Chromatic configuration
# Ensure stories exist for changed components
# Verify CHROMATIC_PROJECT_TOKEN is set correctly
```

### Performance Monitoring Missing Metrics

**Problem**: Lighthouse metrics not populating
**Solution**:
```bash
# Test Lighthouse CI locally
npm install -g @lhci/cli
lhci autorun --config=.github/lighthouse/ci.json

# Verify build completes successfully
npm run build

# Check if application starts correctly
npm run start
# Visit http://localhost:3000 to verify
```

### False Positive SAST Findings

**Problem**: Semgrep reporting false positives
**Solution**:
```bash
# Add inline suppression comment
// nosemgrep: rule-id
const value = potentiallyFlaggedCode();

# Or create .semgrepignore file
echo "src/test-fixtures/" >> .semgrepignore
echo "**/*.test.ts" >> .semgrepignore
```

---

## 📚 Related Documentation

- [Phase 1 Implementation Guide](./github-improvements-implementation-guide.md)
- [Phase 2 Implementation Guide](./github-improvements-phase2-guide.md)
- [Visual Regression Setup Guide](../testing/visual-regression-setup.md)
- [Logging Security Best Practices](../ai/logging-security.md)
- [Bundle Size Budget Configuration](../../scripts/performance/bundle-size-budget.json)

---

## 🔗 External Resources

**SAST / Semgrep:**
- [Semgrep Documentation](https://semgrep.dev/docs/)
- [Semgrep Rule Registry](https://semgrep.dev/explore)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

**Visual Regression:**
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook for Next.js](https://storybook.js.org/docs/get-started/nextjs)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)

**Performance:**
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**Maintained by**: @dcyfr
**Last updated**: 2025-12-21
**Phase**: 3 (Advanced Quality & Security)
**Status**: Ready for deployment
