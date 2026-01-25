{/* TLP:CLEAR */}

# LGTM Suppression Approval Process

**Version:** 1.0.0
**Effective Date:** January 21, 2026
**Scope:** All LGTM suppression comments in dcyfr-labs codebase
**Status:** Active - Mandatory for all developers and AI agents

---

## Purpose

This document establishes a mandatory approval process for adding LGTM (CodeQL) suppression comments to the codebase. The goal is to ensure security findings are properly addressed through fixes rather than suppressions whenever possible.

---

## Core Principle: Fix > Suppress

**Primary Rule:** Always attempt to fix the underlying security issue before considering a suppression.

**Why this matters:**

- Suppressions can mask real security vulnerabilities
- Fixes improve code quality and security posture
- Suppressions create technical debt
- Fixes demonstrate security-first development culture

---

## Process Overview

```
Security Finding Detected
         ↓
1. Attempt Fix (30+ minutes)
         ↓
2. Document Fix Attempts
         ↓
3. Evaluate Alternatives
         ↓
    Fix Found?
    ↙      ↘
  YES      NO
   ↓        ↓
Implement  Request
  Fix     Approval
   ↓        ↓
  Done   Review
          ↓
      Approved?
       ↙   ↘
     YES    NO
      ↓     ↓
   Suppress Retry
              ↓
             Fix
```

---

## Step 1: Attempt a Fix (MANDATORY)

Before requesting suppression approval, developer MUST spend **at least 30 minutes** attempting to fix the issue.

### Required Fix Attempts

Try at least TWO of these approaches:

#### 1. Input Validation

```typescript
// ✅ Allowlist pattern for package names
const validPattern = /^[@a-z0-9][a-z0-9._/-]*$/i;
if (!validPattern.test(packageName)) {
  console.error(`❌ Invalid package name: ${packageName}`);
  process.exit(1);
}
```

#### 2. Comprehensive Sanitization

```typescript
// ✅ Multi-pass sanitization
const safe = input
  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Control characters
  .replace(/[\r\n\t]/g, ' ') // Whitespace
  .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') // ANSI codes
  .replace(/\s+/g, ' ') // Normalize
  .trim()
  .substring(0, 200); // Limit length
```

#### 3. Code Restructuring

```typescript
// ✅ Make security check more explicit
const isAllowedOrigin = ALLOWED_ORIGINS.includes(event.origin);
if (!isAllowedOrigin) return;

// Safe to process - origin validated above
processMessage(event.data);
```

#### 4. Alternative API Usage

```typescript
// ❌ Unsafe: String interpolation in execSync
execSync(`command ${userInput}`);

// ✅ Safe: Use array syntax (if available)
execFileSync('command', [userInput]);
```

#### 5. Defense in Depth

```typescript
// ✅ Validate even "trusted" inputs
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

if (!isValidURL(configUrl)) {
  throw new Error('Invalid URL in config');
}
```

---

## Step 2: Document Fix Attempts (MANDATORY)

Developer must document what was tried in **commit message** or **PR description**:

### Template

```markdown
## Security Finding Fix Attempt

**CodeQL Rule:** js/command-line-injection
**File:** scripts/example.mjs:42
**Severity:** Medium

### Fix Attempts

**Attempt 1: Input validation with allowlist**

- Tried: `/^[a-z0-9._-]+$/i` pattern for workflow names
- Result: ✅ SUCCESSFUL - Implemented in commit
- Files changed: scripts/example.mjs

**Attempt 2: Alternative API (execFileSync)**

- Tried: Using execFileSync with array arguments
- Result: ❌ Not available for this use case
- Reason: Need shell features (pipes, redirects)

**Attempt 3: Restructure to avoid exec**

- Tried: Using Node.js API instead of shell command
- Result: ❌ Not feasible
- Reason: No Node.js API for git log formatting

### Conclusion

✅ Fix implemented using Attempt 1 (input validation)
```

---

## Step 3: Suppression Request (Only if Fix Failed)

If all fix attempts failed, submit a suppression request for approval.

### Suppression Request Template

````markdown
## LGTM Suppression Request

**CodeQL Rule:** js/file-system-race
**File:** scripts/generate-hero.mjs:331
**Severity:** Low
**Requested By:** @developer-name
**Date:** 2026-01-21

### Why Suppression is Needed

This is a **false positive**. CodeQL warns about TOCTOU race conditions
when checking directory existence before creating it.

### Technical Justification

1. **No check is performed** - We call `mkdirSync` directly without checking first
2. **`recursive: true` is atomic** - Node.js handles this atomically internally
3. **No race condition exists** - There's no time gap between check and use
4. **Path is validated** - Input validated via `validateSlug()` preventing traversal

### Fix Attempts (Required)

**Attempt 1: Remove recursive option**

- Tried: Create parent directories manually
- Result: ❌ Creates actual race condition (worse than warning)

**Attempt 2: Restructure to check-then-create**

- Tried: `if (!existsSync()) mkdirSync()`
- Result: ❌ Creates the exact vulnerability CodeQL warns about

**Attempt 3: Use alternative API**

- Tried: fs.promises.mkdir with recursive
- Result: ❌ Same warning (async version has same pattern)

### Similar Patterns in Codebase

- `scripts/generate-blog-hero.mjs:331` - Same pattern, same justification
- Both use validated paths only

### Proposed Suppression Comment

```javascript
// SECURITY: Directory creation is atomic with recursive:true option
// lgtm [js/file-system-race] - mkdirSync with recursive:true is atomic
// and prevents TOCTOU vulnerabilities. No check-then-create pattern used.
// Path validated via validateSlug() to prevent directory traversal.
mkdirSync(outputDir, { recursive: true });
```
````

### Reviewer Checklist

- [ ] Fix attempts documented (minimum 2 approaches tried)
- [ ] Technical justification includes references (line numbers, docs)
- [ ] Safeguards in place are referenced
- [ ] Comment is clear and educational
- [ ] Similar patterns are handled consistently

**Approval:** ⬜ Approved ⬜ Rejected (retry fix)
**Reviewer:** ******\_\_******
**Date:** ******\_\_******

````

---

## Step 4: Review & Approval

### Reviewer Responsibilities

Reviewer MUST verify:

#### ✅ Approval Criteria

- [ ] **Fix attempts documented** - Minimum 2 different approaches tried
- [ ] **Technical justification** - Includes code references, line numbers
- [ ] **Safeguards referenced** - Points to validation/checks in code
- [ ] **Educational value** - Comment helps team understand pattern
- [ ] **Consistent handling** - Similar patterns handled the same way
- [ ] **Not a real vulnerability** - Confirmed false positive with proof

#### ❌ Automatic Rejection Criteria

Reject immediately if ANY of these are true:

- ❌ No documented fix attempts
- ❌ Only tried 1 approach (need minimum 2)
- ❌ Comment says "not user input" without validation proof
- ❌ Comment says "safe because..." without technical details
- ❌ Comment says "TODO fix later"
- ❌ No explanation at all in comment
- ❌ Copying justification from another suppression
- ❌ High severity finding (must be fixed, not suppressed)

### Reviewer Actions

**If Approved:**
1. Add comment to PR: "LGTM suppression approved - [brief reason]"
2. Add suppression to `.github/agents/patterns/CODEQL_SUPPRESSIONS.md`
3. Update suppression count baseline in CI config
4. Merge PR

**If Rejected:**
1. Add comment to PR: "LGTM suppression rejected - [reason]"
2. Provide specific guidance on fix approach to try
3. Link to relevant fix examples in documentation
4. Request developer retry with suggested approach

---

## Automation & Enforcement

### Pre-Commit Hook

Warns when new LGTM comments detected:

```bash
#!/bin/bash
# .git/hooks/pre-commit

if git diff --cached | grep -i "lgtm \[" >/dev/null; then
  echo "⚠️  WARNING: New LGTM suppression detected!"
  echo "   Required: docs/security/LGTM_APPROVAL_PROCESS.md"
  echo ""
  read -p "Have you completed fix attempts? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please attempt fixes first (minimum 30 minutes)"
    echo "   See: docs/security/private/CODEQL_FINDINGS_RESOLVED.md"
    exit 1
  fi
fi
````

### CI Check

Fails if suppression count increases without approval:

```yaml
- name: Check LGTM Suppression Count
  run: |
    CURRENT=$(grep -r "lgtm \[" --include="*.{ts,tsx,js,mjs}" src/ scripts/ | wc -l)
    BASELINE=5  # Current approved count

    if [ $CURRENT -gt $BASELINE ]; then
      echo "❌ Suppression count increased: $BASELINE → $CURRENT"
      echo "   New suppressions require approval"
      echo "   See: docs/security/LGTM_APPROVAL_PROCESS.md"
      exit 1
    fi

    echo "✅ Suppression count: $CURRENT (baseline: $BASELINE)"
```

### Monthly Audit

Automated task to review existing suppressions:

```bash
#!/bin/bash
# scripts/audit-suppressions.sh

echo "📋 LGTM Suppression Audit - $(date)"
echo ""

# Count suppressions by rule
echo "Suppressions by rule:"
grep -rh "lgtm \[" --include="*.{ts,tsx,js,mjs}" src/ scripts/ \
  | sed 's/.*lgtm \[\([^]]*\)\].*/\1/' \
  | sort | uniq -c | sort -rn

echo ""
echo "Review questions for each suppression:"
echo "1. Is it still necessary?"
echo "2. Has the pattern changed?"
echo "3. Is there a fix available now?"
echo "4. Is the justification still valid?"
```

---

## Examples

### Example 1: Approved Suppression (File System Race)

**Scenario:** `mkdirSync` with `recursive: true` triggers TOCTOU warning

**Fix Attempts:**

1. ❌ Manual parent creation → Creates actual race condition
2. ❌ Check-then-create → Creates the vulnerability CodeQL warns about
3. ❌ Alternative API → Same warning

**Justification:**

- Node.js `recursive: true` is atomic internally
- No check-before-create pattern used
- Path validated to prevent traversal

**Outcome:** ✅ **APPROVED** - Valid false positive

### Example 2: Rejected Suppression (Command Injection)

**Scenario:** `execSync` with user input triggers command injection warning

**Fix Attempts:**

1. ❌ Comment claiming "not user input" (insufficient)

**Reviewer Feedback:**

- Need to try input validation with allowlist
- Need to try execFileSync alternative
- Must document both attempts before suppression

**Outcome:** ❌ **REJECTED** - Insufficient fix attempts

### Example 3: Fixed Instead of Suppressed (Log Injection)

**Scenario:** Error message only sanitized for newlines

**Fix Attempts:**

1. ✅ Comprehensive sanitization (control chars + ANSI + normalize)

**Outcome:** ✅ **FIXED** - No suppression needed

---

## Integration with Development Workflow

### For Pull Requests

1. **Developer submits PR** with LGTM comment
2. **CI check fails** if count increased
3. **Developer updates PR description** with fix attempt documentation
4. **Security reviewer assigned** automatically
5. **Review completed** within 24 hours
6. **PR merged** if approved, or sent back with fix guidance

### For AI Agents

AI agents (DCYFR, Copilot) are configured to:

1. **Attempt fixes first** - Use patterns from resolved findings
2. **Document attempts** - Include in commit messages
3. **Request approval** - Tag human reviewer if fix fails
4. **Never auto-approve** - Human review always required

### For Security Reviews

Monthly security review includes:

1. **Suppression audit** - Review all existing suppressions
2. **Pattern analysis** - Look for new fix opportunities
3. **Consistency check** - Ensure similar patterns handled uniformly
4. **Documentation update** - Add new examples to guides

---

## Metrics & Reporting

### Key Metrics

Track monthly:

- **Suppression count trend** - Should stay flat or decrease
- **Fix success rate** - % of findings fixed vs suppressed
- **Average fix time** - Time to resolve security findings
- **False positive rate** - % of suppressions that are valid

### Reporting

Include in monthly security review:

```markdown
## LGTM Suppression Metrics - January 2026

**Current Count:** 1 active suppression (down from 5)
**This Month:**

- Findings detected: 6
- Fixed: 6 (100%)
- Suppressed: 0 (0%)
- Average fix time: 45 minutes

**Trend:** ✅ Improving (4 suppressions eliminated)

**Action Items:**

- Continue fix-first policy
- Document new patterns in guide
- Train team on validation techniques
```

---

## References

### Documentation

- **Fix Examples:** [`docs/security/private/CODEQL_FINDINGS_RESOLVED.md`](./CODEQL_FINDINGS_RESOLVED.md)
- **Suppression Analysis:** [`docs/security/private/LGTM_SUPPRESSION_ANALYSIS.md`](./LGTM_SUPPRESSION_ANALYSIS.md)
- **Suppression Patterns:** [`.github/agents/patterns/CODEQL_SUPPRESSIONS.md`](../../.github/agents/patterns/CODEQL_SUPPRESSIONS.md)

### Tools & Scripts

- **Pre-commit hook:** `.git/hooks/pre-commit`
- **CI check:** `.github/workflows/codeql.yml`
- **Audit script:** `scripts/audit-suppressions.sh`

### Contact

- **Security Lead:** @dcyfr (for approval questions)
- **Security Team:** #security channel (for guidance)
- **Monthly Review:** First Monday of each month

---

## Changelog

### v1.0.0 - January 21, 2026

- Initial policy creation
- Established fix-first principle
- Created approval workflow
- Added automation scripts
- Integrated with AI agents

---

**Status:** Active and Enforced
**Next Review:** February 21, 2026
**Policy Owner:** Security Team
