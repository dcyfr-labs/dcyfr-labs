<!-- TLP:CLEAR -->

# Alert Closure Workflow

**Version:** 1.0.0
**Effective Date:** February 1, 2026
**Status:** Active
**Scope:** All GitHub Code Scanning alerts in dcyfr-labs

---

## Purpose

This document defines the workflow for properly closing GitHub Code Scanning security alerts, ensuring all findings are either fixed, suppressed with justification, or dismissed with documentation.

---

## SLA by Severity

| Severity | Maximum Resolution Time | Notification | Escalation |
|----------|------------------------|--------------|------------|
| **Critical** | 24 hours | Immediate | Security Lead |
| **High** | 72 hours | Within 4 hours | Security Lead |
| **Medium** | 1 week | Daily standup | Team Lead |
| **Low** | 2 weeks | Weekly review | Optional |

**Note:** Clock starts when alert first appears in GitHub Security tab.

---

## Closure Criteria

An alert can be closed via one of these methods:

### Method 1: Fix the Vulnerability ✅ (Preferred)

**When to use:** Always attempt this first (Fix > Suppress policy)

**Process:**
1. Analyze the vulnerability using [SECURITY_VULNERABILITY_TROUBLESHOOTING.md](./SECURITY_VULNERABILITY_TROUBLESHOOTING.md)
2. Implement fix following documented patterns
3. Add security tests covering the vulnerability
4. Verify fix resolves the alert (see Verification section below)
5. Merge fix to main branch

**Result:** Alert automatically closes when fix is detected in subsequent CodeQL scan

**Documentation:** Add fix pattern to `CODEQL_SUPPRESSIONS.md` for team learning

---

### Method 2: Suppress with LGTM Comment ⚠️

**When to use:** Only for confirmed false positives after fix attempts fail

**Process:**
1. Follow [LGTM_APPROVAL_PROCESS.md](./LGTM_APPROVAL_PROCESS.md)
2. Spend minimum 30 minutes attempting fixes
3. Document fix attempts in PR description
4. Request approval from security reviewer
5. Add LGTM comment with detailed justification
6. Update suppression baseline in `.github/workflows/codeql.yml`

**Result:** Alert remains open in GitHub but is ignored by future scans

**Documentation Required:**
- Fix attempt log in PR description
- Technical justification in LGTM comment
- Approval from security reviewer

**Example:**
```javascript
/**
 * lgtm [js/file-system-race]
 *
 * False positive: mkdirSync with recursive:true is atomic internally.
 * No check-then-create pattern used. Path validated to prevent traversal.
 *
 * Fix attempts:
 * 1. Manual parent creation → Creates actual race condition
 * 2. Check-then-create → Creates vulnerability CodeQL warns about
 * 3. Alternative API → Same warning
 *
 * Approved by: @security-lead on 2026-01-21
 */
mkdirSync(outputDir, { recursive: true });
```

---

### Method 3: Dismiss via GitHub UI 🚫

**When to use:** One-off false positives that won't recur

**Process:**
1. Navigate to Security → Code scanning alerts
2. Click on alert number
3. Click "Dismiss alert" dropdown
4. Select reason:
   - **False positive** - Alert is incorrect
   - **Won't fix** - Accepted risk (requires justification)
   - **Used in tests** - Test/dev code only
5. Add detailed comment explaining dismissal
6. Click "Dismiss alert"

**Result:** Alert is hidden from GitHub Security tab

**Documentation Required:**
- Dismissal reason in GitHub comment
- Reference to supporting documentation if applicable

**When NOT to use:**
- ❌ Recurring patterns (use Method 2: Suppress instead)
- ❌ High/Critical severity (must fix)
- ❌ Quick dismissal without analysis

---

## Verification Checklist

Before closing an alert, verify:

### For Fixes (Method 1)

- [ ] Root cause identified and documented
- [ ] Fix implemented following security best practices
- [ ] Security tests added covering attack vectors
- [ ] Code review completed by security-aware developer
- [ ] All tests pass (≥99% pass rate)
- [ ] TypeScript compiles (0 errors)
- [ ] ESLint passes (0 errors)
- [ ] Fix deployed to main branch
- [ ] Alert status checked 24 hours after merge

**Verification Command:**
```bash
# Check if alert is still open
npm run security:check-alert -- <alert_number>

# Expected: "Alert #X is closed" or "404 Not Found"
```

---

### For Suppressions (Method 2)

- [ ] Fix attempts documented (minimum 2 approaches)
- [ ] Technical justification includes code references
- [ ] Safeguards in place are documented
- [ ] LGTM comment is clear and educational
- [ ] Security reviewer approved suppression
- [ ] Baseline updated in `.github/workflows/codeql.yml`
- [ ] CI passes with new suppression count

**Verification Command:**
```bash
# Check suppression count
grep -r "lgtm \[" --include="*.{ts,tsx,js,mjs}" . | wc -l

# Should match baseline in .github/workflows/codeql.yml
```

---

### For Dismissals (Method 3)

- [ ] Dismissal reason documented in GitHub comment
- [ ] Reason is valid (false positive, test code, accepted risk)
- [ ] Supporting documentation linked if applicable
- [ ] Security lead notified (for High/Critical)
- [ ] Dismissal recorded in monthly review log

---

## Alert Verification Methods

### Method A: GitHub CLI (Preferred)

```bash
# Check specific alert
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/<alert_number>

# Expected for closed alert:
# HTTP 404: Not Found (alert was deleted)
# OR
# "state": "closed" or "fixed"

# Check all open alerts
npm run security:check-alerts
```

---

### Method B: GitHub Web UI

1. Navigate to https://github.com/dcyfr/dcyfr-labs/security/code-scanning
2. Filter by alert number or rule ID
3. Verify alert state:
   - ✅ **Fixed** - Green checkmark, automated closure
   - ⚠️ **Dismissed** - Gray icon, manual dismissal
   - ❌ **Open** - Red icon, needs attention

---

### Method C: CodeQL Workflow Logs

1. Navigate to Actions → CodeQL Analysis
2. Click latest workflow run
3. Check "Perform CodeQL Analysis" step
4. Look for alert in SARIF output

---

## Communication Protocol

### When Alert Detected

**Trigger:** GitHub sends notification email

**Action:**
1. Acknowledge within SLA (see table above)
2. Assign to developer in GitHub Issues
3. Add to security tracking board
4. Update status in daily standup

---

### When Fix Implemented

**Trigger:** PR merged to main

**Action:**
1. Wait 24 hours for CodeQL scan
2. Verify alert closure (see Verification section)
3. Document fix pattern in team knowledge base
4. Update monthly security metrics

---

### When Suppressed

**Trigger:** LGTM comment added with approval

**Action:**
1. Update suppression baseline in CI config
2. Add to suppression audit log
3. Schedule quarterly review of suppression
4. Notify team in #security channel

---

### When Dismissed

**Trigger:** Alert dismissed via GitHub UI

**Action:**
1. Document dismissal in monthly review log
2. Add to knowledge base (if false positive pattern)
3. Update security metrics dashboard

---

## Monthly Review Process

**Schedule:** First Monday of each month

**Tasks:**
1. Review all open alerts
2. Check SLA compliance
3. Audit all suppressions
4. Verify dismissed alerts still appropriate
5. Generate metrics report

**Output:** `docs/security/private/monthly-review-YYYY-MM-DD.md`

**Template:**
```markdown
# Monthly Security Review - YYYY-MM-DD

## Open Alerts
- Total: X
- Critical: X
- High: X
- Medium: X
- Low: X

## SLA Compliance
- Within SLA: X%
- Overdue: X alerts

## Suppressions Audit
- Total: X (baseline: 2)
- New this month: X
- Removed this month: X

## Dismissed Alerts
- Total dismissed: X
- Reason: False positive (X), Won't fix (X), Used in tests (X)

## Action Items
- [ ] Review overdue alerts
- [ ] Update suppression baseline if changed
- [ ] Document new fix patterns
```

---

## Metrics & KPIs

### Success Metrics

Track monthly:

- **Mean Time to Resolution (MTTR)** by severity
- **SLA Compliance Rate** (target: 100%)
- **Fix vs Suppress Ratio** (target: >90% fixes)
- **Suppression Trend** (target: flat or decreasing)
- **Alert Recurrence Rate** (target: <5%)

### Dashboard

**Location:** GitHub Security Overview

**Key Metrics:**
- Open alerts by severity
- Alerts closed this month
- Average resolution time
- Current suppression count

---

## Escalation Path

### Standard Alerts (Low/Medium)

1. **Developer** - Analyze and propose fix
2. **Team Lead** - Review and approve approach
3. **Security Reviewer** - Final approval for suppressions

### High-Priority Alerts (High/Critical)

1. **Developer** - Immediate acknowledgment
2. **Security Lead** - Assigned within 4 hours
3. **Project Owner** - Informed within 24 hours
4. **Emergency Fix** - Bypass normal PR process if needed

---

## Common Pitfalls

### ❌ Don't Do This

1. **Dismiss without analysis**
   - Always investigate before dismissing
   - Document why it's a false positive

2. **Suppress high severity without approval**
   - Critical/High must be fixed
   - Suppression requires security lead sign-off

3. **Ignore SLA deadlines**
   - Set reminders
   - Escalate before deadline

4. **Copy-paste suppression justifications**
   - Each suppression needs specific reasoning
   - Generic comments are rejected

5. **Forget to verify fix**
   - Always check alert status after merge
   - Don't assume CodeQL detected the fix

---

### ✅ Best Practices

1. **Fix first, suppress only if necessary**
   - Spend 30+ minutes on fix attempts
   - Document what you tried

2. **Add security tests**
   - Cover attack vectors
   - Test both malicious and valid inputs

3. **Clear documentation**
   - Explain why it's safe
   - Reference code line numbers
   - Link to relevant documentation

4. **Regular reviews**
   - Monthly suppression audit
   - Quarterly security assessment
   - Annual deep dive

5. **Team learning**
   - Share fix patterns
   - Document common pitfalls
   - Update guides based on learnings

---

## Related Documentation

- [LGTM_APPROVAL_PROCESS.md](./LGTM_APPROVAL_PROCESS.md) - Suppression approval workflow
- [CODEQL_SUPPRESSIONS.md](../.github/agents/patterns/CODEQL_SUPPRESSIONS.md) - Suppression patterns
- [SECURITY_VULNERABILITY_TROUBLESHOOTING.md](../.github/agents/patterns/SECURITY_VULNERABILITY_TROUBLESHOOTING.md) - Fix workflows

---

## Quick Reference

| Task | Command | Expected Output |
|------|---------|----------------|
| Check all alerts | `npm run security:check-alerts` | List of open alerts or "No open alerts" |
| Check specific alert | `npm run security:check-alert -- 42` | Alert details or "404 Not Found" |
| Audit suppressions | `bash scripts/security/audit-suppressions.sh` | Suppression count and locations |
| Run CodeQL locally | `npm run codeql:analyze` | SARIF results file |
| View in GitHub UI | Navigate to Security → Code scanning | Visual alert list |

---

**Last Updated:** February 1, 2026
**Next Review:** March 1, 2026
**Document Owner:** Security Team
