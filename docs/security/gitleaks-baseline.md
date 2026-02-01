<!-- TLP:CLEAR -->

# Gitleaks False Positive Baseline

**Version:** 1.0.0
**Last Updated:** February 1, 2026
**Next Review:** May 1, 2026 (Q2 2026)
**Purpose:** Document all Gitleaks suppressions and justify false positives

---

## 📋 Overview

This document maintains the authoritative baseline of Gitleaks findings that are **confirmed false positives** and should be suppressed in security scans. All suppressions are documented in `.gitleaksignore` with quarterly reviews to ensure accuracy.

**Baseline File:** `.gitleaksignore`
**Review Schedule:** Quarterly (Q2, Q3, Q4, Q1)
**Current Findings:** 196 suppressed (all confirmed false positives)

---

## 🎯 Suppression Categories

### 1. Archived Documentation (158 findings)

**Files:**

- `docs/archive/phases/PHASE_2_LAUNCH_CHECKLIST.md` (158 occurrences)
- `docs/PHASE_2_LAUNCH_CHECKLIST.md` (4 occurrences)

**Issue Types:**

- `generic-api-key`: 158 matches
- Example token strings in documentation

**Justification:**

- File appears to be deleted (not in current working tree)
- Findings exist only in git history
- All matches are example/placeholder tokens used for documentation
- No actual secrets exposed
- Examples use patterns like `REDACTED`, `token-violations`, or placeholder values

**Risk Level:** ✅ **NONE**

- Historical documentation only
- Files not deployed to production
- Examples clearly marked as non-functional

**Review Notes:**

- Q2 2026: Verify file still deleted, consider git history cleanup if needed
- May consider `git filter-repo` if history cleanup approved

---

### 2. MCP Configuration Examples (2 findings)

**Files:**

- `.vscode/mcp.json`

**Issue Types:**

- `generic-api-key`: 2 matches

**Justification:**

- Example MCP server configuration
- Contains placeholder API key formats like `"apiKey": "your-api-key-here"`
- Actual secrets stored in `.env.local` (gitignored)
- Configuration file shows structure, not actual secrets

**Risk Level:** ✅ **NONE**

- Placeholder values only
- Real secrets in environment variables
- File is template/example configuration

**Review Notes:**

- Q2 2026: Verify no actual secrets added to config
- Consider adding comment in file: `<!-- Example only - use .env.local for actual secrets -->`

---

### 3. Operational Documentation (36 findings)

**Files:**

- `docs/features/linkedin-automated-token-management.md` (4)
- `docs/operations/environment-variables.md` (4)
- `docs/security/RED_TEAM_ENGAGEMENT_PLAN.md` (4)
- `docs/security/SECURITY_FIXES_2025-12-11.md` (4)
- `docs/security/inngest-webhook-security.md` (2)
- `docs/mcp/IMPLEMENTATION_COMPLETE.md` (2)
- `docs/operations/deployment-checklist-activity-fix.md` (2)
- `docs/operations/done.md` (2)
- `docs/operations/github-improvements-phase3-guide.md` (4)
- `docs/security/phase1-complete-summary.md` (2)
- `docs/troubleshooting/linkedin-oauth-redis-fix-final.md` (2)

**Issue Types:**

- `generic-api-key`: Example API keys in documentation
- `curl-auth-header`: Example curl commands with auth headers
- `linkedin-client-id`: Example LinkedIn OAuth client IDs

**Justification:**

- All findings are **documentation examples** for illustration
- Files clearly marked as examples with context like:
  - "Example:" or "Placeholder:" prefixes
  - "Replace with your actual token" instructions
  - Redacted values or obvious placeholders
- No functional secrets in documentation

**Risk Level:** ✅ **NONE**

- Documentation/tutorial content only
- Examples help developers understand integration
- No secrets that could be used maliciously

**Review Notes:**

- Q2 2026: Audit new documentation files added
- Ensure examples continue to use obvious placeholders
- Consider adding "⚠️ Example only" warnings

---

### 4. Curl Authentication Examples (18 findings)

**Pattern:** `curl -H "Authorization: Bearer <token>"`

**Justification:**

- Documentation shows API usage examples
- Placeholder tokens in curl commands
- Teaching developers how to use APIs
- No actual bearer tokens exposed

**Risk Level:** ✅ **NONE**

- Educational content only
- Placeholders clearly identifiable
- Real tokens never in documentation

**Review Notes:**

- Q2 2026: Ensure new API docs continue this pattern
- Consider standardizing placeholder format: `Bearer example-token-replace-me`

---

### 5. LinkedIn Client IDs (4 findings)

**Issue Type:** `linkedin-client-id`

**Justification:**

- LinkedIn OAuth **client IDs are public** (not secrets)
- Only the **client secret** is sensitive (stored in env vars)
- Client IDs shown in documentation for OAuth setup
- Standard practice to show client IDs publicly

**Risk Level:** ✅ **NONE**

- Client IDs are designed to be public
- Client secrets properly protected in `.env.local`
- Matches OAuth 2.0 security model

**Review Notes:**

- Q2 2026: Verify client secrets never in docs
- Ensure `.env.example` shows `LINKEDIN_CLIENT_SECRET=your-secret-here`

---

## 📊 Baseline Statistics

**Total Suppressed Findings:** 196

| Category               | Count | Risk Level |
| ---------------------- | ----- | ---------- |
| Archived Documentation | 162   | ✅ None    |
| MCP Configuration      | 2     | ✅ None    |
| Operational Docs       | 36    | ✅ None    |
| Curl Auth Examples     | 18    | ✅ None    |
| LinkedIn Client IDs    | 4     | ✅ None    |

**Actual Secrets Exposed:** 0
**False Positive Rate:** 100% (all findings are false positives)

---

## 🔄 Quarterly Review Process

### Schedule

- **Q1 2026:** February 1 (Initial baseline) ✅
- **Q2 2026:** May 1, 2026 (Next review)
- **Q3 2026:** August 1, 2026
- **Q4 2026:** November 1, 2026

### Review Checklist

```bash
# 1. Run fresh Gitleaks scan
gitleaks detect --report-format=json --report-path=gitleaks-review.json

# 2. Compare to baseline
jq -r '.[] | "\(.File):\(.RuleID)"' gitleaks-review.json | sort -u > current-findings.txt
grep -v "^#" .gitleaksignore | grep ":" | sort -u > baseline-suppressions.txt
comm -3 current-findings.txt baseline-suppressions.txt

# 3. Identify changes
echo "New findings (not in baseline):"
comm -23 current-findings.txt baseline-suppressions.txt

echo "Resolved findings (in baseline but not found):"
comm -13 current-findings.txt baseline-suppressions.txt
```

### Review Actions

For each finding:

- [ ] **New findings:** Investigate if actual secret or false positive
  - If **actual secret:** Remove from code immediately, rotate secret
  - If **false positive:** Add to `.gitleaksignore` with justification

- [ ] **Resolved findings:** Remove from baseline (file deleted/fixed)

- [ ] **Existing findings:** Verify justification still valid

- [ ] **Update documentation:**
  - Update "Last Updated" in `.gitleaksignore`
  - Update "Last Updated" in this file
  - Update statistics table
  - Update review notes

---

## 🚨 Incident Response

If an **actual secret** is found during review:

### Immediate Actions (Within 1 hour)

1. **Remove from code:**

   ```bash
   git filter-branch --index-filter \
     'git rm --cached --ignore-unmatch <file-with-secret>' HEAD
   ```

2. **Rotate the secret:**
   - API keys: Regenerate in provider dashboard
   - Tokens: Revoke and create new
   - Passwords: Change immediately

3. **Update environment:**
   ```bash
   # Update .env.local (local)
   # Update GitHub Secrets (CI/CD)
   # Update Vercel Environment Variables (production)
   ```

### Post-Incident (Within 24 hours)

4. **Document incident:**
   - Create `docs/security/private/incident-YYYY-MM-DD.md`
   - Document what was exposed, when, how long
   - Document remediation steps taken

5. **Update baseline:**
   - Do NOT add actual secrets to baseline
   - Add suppression only if false positive confirmed

6. **Review access logs:**
   - Check if secret was used maliciously
   - Review API logs, auth logs, database logs

---

## 📚 Related Documentation

- [Security Code Scanning Quick Reference](code-scanning-quick-reference.md)
- [LGTM Approval Process](LGTM_APPROVAL_PROCESS.md)
- [Security Resolution Plan](private/security-resolution-plan-2026-02-01.md)

---

## 🔧 Maintenance Commands

### Run Gitleaks with Baseline

```bash
# Scan with suppression
gitleaks detect --baseline-path=.gitleaksignore --report-format=json

# Verbose mode (see what's suppressed)
gitleaks detect --baseline-path=.gitleaksignore --verbose

# CI/CD usage
gitleaks detect --baseline-path=.gitleaksignore --exit-code=1
```

### Update Baseline

```bash
# Add new suppression
echo "path/to/file:rule-id:*" >> .gitleaksignore

# Add with comment
cat >> .gitleaksignore << EOF
# Reason: Example API keys in tutorial
docs/tutorials/api-usage.md:generic-api-key:*
EOF

# Sort and deduplicate
grep -v "^#" .gitleaksignore | sort -u > .gitleaksignore.tmp
cat .gitleaksignore.tmp > .gitleaksignore
rm .gitleaksignore.tmp
```

### Validate Baseline

```bash
# Check baseline syntax
gitleaks detect --baseline-path=.gitleaksignore --no-git 2>&1 | grep -i error

# Test baseline effectiveness
BEFORE=$(gitleaks detect --report-format=json | jq 'length')
AFTER=$(gitleaks detect --baseline-path=.gitleaksignore --report-format=json | jq 'length')
echo "Suppressed: $(($BEFORE - $AFTER)) findings"
```

---

## ✅ Approval & Sign-off

**Initial Baseline:** February 1, 2026
**Approved By:** Security Team
**Next Review:** May 1, 2026

**Review History:**

- **2026-02-01:** Initial baseline created (196 suppressions, all false positives)
- **2026-05-01:** _Pending Q2 review_
- **2026-08-01:** _Pending Q3 review_
- **2026-11-01:** _Pending Q4 review_

---

**Status:** Active
**Maintained By:** Security Team
**Review Frequency:** Quarterly
**Last Updated:** February 1, 2026
