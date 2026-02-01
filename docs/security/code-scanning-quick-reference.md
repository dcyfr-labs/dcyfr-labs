<!-- TLP:CLEAR -->

# Security Code Scanning - Quick Reference

**Version:** 1.0.0
**Last Updated:** February 1, 2026
**Purpose:** Quick reference guide for security code scanning workflows

---

## 🚀 Quick Commands

```bash
# Check all open security alerts
npm run security:check-alerts

# Check specific alert by number
npm run security:check-alert -- <alert_number>

# Audit all LGTM suppressions
npm run security:audit-suppressions

# Run CodeQL analysis locally (if configured)
npm run codeql:analyze
```

---

## 📊 Current Status (February 2026)

- **LGTM Suppressions:** 2 (matches baseline ✅)
- **Open Alerts:** Unable to check via API (403 error)
- **Security Framework:** OWASP ASI 2026 aligned ✅
- **Fix-First Policy:** Active and enforced ✅

---

## 🔍 Current Suppressions

| Location | Rule | Justification |
|----------|------|---------------|
| `scripts/content/generate-project-hero.mjs:269` | `js/file-system-race` | mkdirSync with recursive:true is atomic |
| `scripts/content/generate-blog-hero.mjs:349` | `js/file-system-race` | mkdirSync with recursive:true is atomic |

**Status:** Both approved and documented as valid false positives

---

## 📋 Alert Resolution Workflow

### 1. Alert Detected → Triage

```bash
# Check alert details
npm run security:check-alert -- <number>

# Review in GitHub UI
https://github.com/dcyfr/dcyfr-labs/security/code-scanning
```

**SLA by Severity:**
- Critical: 24 hours
- High: 72 hours
- Medium: 1 week
- Low: 2 weeks

---

### 2. Fix Attempt (Mandatory First Step)

**Spend minimum 30 minutes attempting fix**

Try at least 2 approaches:
1. Input validation (allowlist patterns)
2. Comprehensive sanitization
3. Code restructuring
4. Alternative API usage

**Document attempts in PR description**

---

### 3. Resolution Method

**Option A: Fix the Vulnerability (Preferred)**
- Implement fix using security patterns
- Add security tests
- Verify alert closes after merge

**Option B: Suppress with LGTM (After Fix Attempts Fail)**
- Follow `LGTM_APPROVAL_PROCESS.md`
- Add detailed justification
- Get security reviewer approval
- Update baseline in CI config

**Option C: Dismiss via GitHub UI (One-Off False Positives)**
- Navigate to Security tab
- Click "Dismiss alert"
- Add explanation in comment

---

### 4. Verification

**For Fixes:**
```bash
# Wait 24 hours after merge
npm run security:check-alert -- <number>

# Expected: "404 Not Found" or "state": "closed"
```

**For Suppressions:**
```bash
# Check suppression count
npm run security:audit-suppressions

# Should match baseline (currently 2)
```

---

## 🛠️ New Tools (February 2026)

### 1. Alert Checker
**Script:** `scripts/security/check-all-alerts.mjs`
**Purpose:** Query all open GitHub Code Scanning alerts
**Usage:** `npm run security:check-alerts`

### 2. Suppression Auditor
**Script:** `scripts/security/audit-suppressions.sh`
**Purpose:** Analyze all LGTM suppressions in codebase
**Usage:** `npm run security:audit-suppressions`

### 3. Monthly Security Review Workflow
**File:** `.github/workflows/monthly-security-review.yml`
**Purpose:** Automated monthly security review
**Trigger:** First Monday of each month at 9:00 UTC
**Manual:** `gh workflow run monthly-security-review.yml`

---

## 📚 Documentation

### Core Guides
- **Analysis Report:** `docs/security/private/security-findings-analysis-2026-02-01.md`
- **Alert Closure:** `docs/security/alert-closure-workflow.md`
- **Approval Process:** `docs/security/LGTM_APPROVAL_PROCESS.md`
- **Suppression Patterns:** `.github/agents/patterns/CODEQL_SUPPRESSIONS.md`
- **Troubleshooting:** `.github/agents/patterns/SECURITY_VULNERABILITY_TROUBLESHOOTING.md`

### Monthly Reviews
- **Location:** `docs/security/private/monthly-review-YYYY-MM-DD.md`
- **Frequency:** First Monday of each month
- **Auto-generated:** Yes (via GitHub Actions)

---

## 🎯 Success Metrics

**Process Health:**
- ✅ LGTM suppression count: ≤2
- 🎯 New suppressions: 0 per month
- 🎯 Fix vs Suppress ratio: >90% fixes
- 🎯 Average fix time: <48 hours (High severity)

**Security Posture:**
- 🎯 Open alerts: 0
- 🎯 Critical alert SLA: 100% within 24 hours
- 🎯 Monthly review: 100% completion

---

## ⚡ Common Tasks

### Review All Current Suppressions
```bash
npm run security:audit-suppressions
```

### Check If Alert is Closed
```bash
npm run security:check-alert -- 42
```

### Validate Suppression Count Before Commit
```bash
# Should output: 2 (matches baseline)
grep -r "lgtm \[" --include="*.{ts,tsx,js,mjs}" . | wc -l
```

### Generate Monthly Review Manually
```bash
gh workflow run monthly-security-review.yml
```

---

## 🚨 Troubleshooting

### "403 Resource not accessible by integration"
**Issue:** GitHub MCP server lacks `security-events: read` permission

**This is the expected behavior.** The hosted GitHub MCP server at `https://api.githubcopilot.com/mcp/` doesn't have permissions to access the Code Scanning API. This is a limitation we cannot fix directly.

**Recommended Solution:**
- ✅ Use npm scripts: `npm run security:check-alerts` (GitHub CLI-based)
- ✅ Use GitHub CLI directly: `gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts`
- ✅ Manual check: GitHub Security tab

**Full Workaround Guide:** See [GitHub Code Scanning Workaround](../features/mcp/github-code-scanning-workaround.md)

---

### "Command 'gh' not found"
**Solution:**
```bash
# macOS
brew install gh

# Other platforms
# See: https://cli.github.com/
```

---

### "HTTP 404: Not Found" for Alert
**Meaning:** Alert was resolved and deleted (this is good!)

**Verify:**
- Check GitHub Security tab to confirm
- Review recent CodeQL workflow runs
- Confirm fix was merged

---

## 📞 Escalation

**Security Lead:** @dcyfr
**Security Channel:** #security
**Monthly Review:** First Monday of each month
**Incident Response:** See `AGENT-SECURITY-GOVERNANCE.md`

---

## 🔄 Monthly Cadence

**Week 1:** Automated monthly review (first Monday)
**Week 2:** Manual review and triage
**Week 3:** Fix implementation
**Week 4:** Verification and closure

---

## 📝 Next Steps (Immediate)

1. ✅ Analysis complete (see `security-findings-analysis-2026-02-01.md`)
2. ✅ New tools implemented (check-alerts, audit-suppressions)
3. ✅ Documentation created (alert-closure-workflow.md)
4. 🎯 Validate current suppressions (quarterly review)
5. 🎯 Monitor monthly review automation
6. 🎯 Track metrics dashboard

---

**Last Updated:** February 1, 2026
**Next Review:** March 1, 2026 (first Monday)
**Document Owner:** Security Team
