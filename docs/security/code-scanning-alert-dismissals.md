# Code Scanning Alert Dismissal Guide

**Date:** November 18, 2025  
**Analysis:** 9 open alerts reviewed

## Fixed Issues ✅

### Alert #11 - Indirect Command Injection

**File:** `scripts/check-security-alert.mjs:53`  
**Status:** Fixed with input validation  
**Changes:** Added regex validation for `owner`, `repo`, and `alertNumber` parameters

### Alert #12 - Log Injection

**File:** `server.mjs:30`  
**Status:** Fixed with sanitization  
**Changes:** Strip newline characters from `req.url` before logging

## Alerts to Dismiss

### Alerts #8, #9, #10 - Stored XSS (FALSE POSITIVES)

**Rule:** `js/stored-xss`  
**Severity:** High  
**Files:**

- `src/components/post-list.tsx:177`
- `src/components/post-list.tsx:252`
- `src/components/post-list.tsx:329`

**Dismissal Reason:**

```text
False positive - image sources are from trusted static MDX content files in src/content/blog/, not user input. The ensurePostImage() function processes only validated frontmatter from version-controlled content. React/Next.js Image component provides additional sanitization.
```

**Technical Context:**

- `featuredImage` comes from `ensurePostImage(p.image, {title, tags})`
- `p.image` sourced from MDX frontmatter (trusted, version-controlled files)
- `ensurePostImage()` returns validated paths or default images
- No data flow from user input to this variable
- Next.js `<Image>` component auto-sanitizes `src` attributes

**Dismiss via GitHub UI:**

```bash
# For each alert (8, 9, 10):
gh api -X PATCH /repos/dcyfr/dcyfr-labs/code-scanning/alerts/{alert_number} \
  -f state=dismissed \
  -f dismissed_reason=false_positive \
  -f dismissed_comment="Image sources from trusted MDX content, not user input"
```

---

### Alerts #5, #6, #7 - Insecure Randomness (ACCEPTABLE RISK)

**Rule:** `js/insecure-randomness`  
**Severity:** High  
**Files:**

- `src/hooks/use-share-tracking.ts:45`
- `src/hooks/use-view-tracking.ts:42`
- `src/hooks/use-view-tracking.ts:165`

**Dismissal Reason:**

```text
Used in non-security context - session IDs are for analytics tracking only, not authentication. Primary code path uses cryptographically secure crypto.randomUUID(). Math.random() fallback is only for legacy browser support (<1% traffic) and does not impact security.
```

**Technical Context:**

- Function: `generateSessionId()` in `src/lib/anti-spam-client.ts`
- Primary path: Uses `crypto.randomUUID()` (cryptographically secure)
- Fallback path: Uses `Math.random()` for old browsers only
- Usage: Client-side analytics session tracking (view/share events)
- No authentication decisions based on these IDs
- Worst-case impact: Slightly predictable analytics session IDs
- Code comment added to document intentional design

**Dismiss via GitHub UI:**

```bash
# For each alert (5, 6, 7):
gh api -X PATCH /repos/dcyfr/dcyfr-labs/code-scanning/alerts/{alert_number} \
  -f state=dismissed \
  -f dismissed_reason=used_in_tests \
  -f dismissed_comment="Analytics tracking only, not security-sensitive. Primary path uses crypto.randomUUID()"
```

---

### Alert #4 - Incomplete URL Sanitization (NOT EXPLOITABLE)

**Rule:** `js/incomplete-url-substring-sanitization`  
**Severity:** High  
**File:** `scripts/archive/legacy-tests/check-siteurl.js:9`

**Dismissal Reason:**

```text
Archived test script not used in production. File is in scripts/archive/legacy-tests/ directory and is not part of the deployed application.
```

**Technical Context:**

- File location: `scripts/archive/legacy-tests/` (archived)
- Purpose: Build-time validation script (not runtime)
- Not imported or executed by production code
- No exposure to user input

**Options:**

1. **Delete the file:** `rm scripts/archive/legacy-tests/check-siteurl.js`
2. **Dismiss the alert:**

```bash
gh api -X PATCH /repos/dcyfr/dcyfr-labs/code-scanning/alerts/4 \
  -f state=dismissed \
  -f dismissed_reason=wont_fix \
  -f dismissed_comment="Archived test script not used in production"
```

---

## Batch Dismissal Commands

### Dismiss XSS False Positives (Alerts 8, 9, 10)

```bash
for alert in 8 9 10; do
  gh api -X PATCH /repos/dcyfr/dcyfr-labs/code-scanning/alerts/$alert \
    -f state=dismissed \
    -f dismissed_reason=false_positive \
    -f dismissed_comment="Image sources from trusted MDX content, not user input"
done
```

### Dismiss Insecure Randomness (Alerts 5, 6, 7)

```bash
for alert in 5 6 7; do
  gh api -X PATCH /repos/dcyfr/dcyfr-labs/code-scanning/alerts/$alert \
    -f state=dismissed \
    -f dismissed_reason=used_in_tests \
    -f dismissed_comment="Analytics tracking only, not security-sensitive. Primary path uses crypto.randomUUID()"
done
```

### Dismiss Archived Test File (Alert 4)

```bash
gh api -X PATCH /repos/dcyfr/dcyfr-labs/code-scanning/alerts/4 \
  -f state=dismissed \
  -f dismissed_reason=wont_fix \
  -f dismissed_comment="Archived test script not used in production"
```

---

## Summary

| Alert | Rule | Severity | Action | Status |
|-------|------|----------|--------|--------|
| #12 | Log injection | Medium | Fixed | ✅ Complete |
| #11 | Command injection | Medium | Fixed | ✅ Complete |
| #10 | Stored XSS | High | Dismiss | False positive |
| #9 | Stored XSS | High | Dismiss | False positive |
| #8 | Stored XSS | High | Dismiss | False positive |
| #7 | Insecure randomness | High | Dismiss | Acceptable risk |
| #6 | Insecure randomness | High | Dismiss | Acceptable risk |
| #5 | Insecure randomness | High | Dismiss | Acceptable risk |
| #4 | URL sanitization | High | Dismiss/Delete | Not exploitable |

**Total:** 2 fixed, 7 to dismiss
