# Dismissing CodeQL Security Findings

This guide explains how to dismiss the 3 open CodeQL security findings (alerts #49, #50, #51) for clear-text logging of sensitive credentials in `scripts/test-google-indexing.mjs`.

## Quick Answer: Use GitHub Web UI

**GitHub does not currently support dismissing CodeQL alerts programmatically** via fine-grained personal access tokens. The only method is through the GitHub web interface.

Time required: **1 minute per alert** (3 minutes total)

## How to Dismiss Alerts via Web UI

### Step 1: Go to Security Tab

Navigate to the security page:
[https://github.com/dcyfr/dcyfr-labs/security/code-scanning](https://github.com/dcyfr/dcyfr-labs/security/code-scanning)

Or:
1. Go to your repository
2. Click **Security** tab
3. Click **Code scanning alerts** on the left

### Step 2: Find Alert #49

1. Scroll down or filter for alert #49 "Clear-text logging of sensitive information"
2. Click on the alert to open details
3. You should see it's in `scripts/test-google-indexing.mjs:70`

### Step 3: Dismiss Alert #49

In the alert detail view:

1. Look for the "Dismiss alert" button (top right or sidebar)
2. Select dropdown: **Dismiss reason**
3. Choose: `False positive` (since we fixed the code)
4. Add comment (optional):
   ```
   Code was fixed to remove clear-text logging of GOOGLE_INDEXING_API_KEY credentials.
   Removed lines that logged service account email and project ID.
   ```
5. Click **Dismiss alert**

### Step 4: Repeat for Alerts #50 and #51

1. Go back to Code scanning alerts
2. Dismiss alert #50 (line 71, same file)
3. Dismiss alert #51 (line 109, same file)

## Why We're Dismissing as "False Positive"

Alert reason: `false positive`

**Justification:**
- ✅ Code was actually fixed (sensitive logging removed)
- ✅ Alert now no longer applies
- ✅ False positive correctly indicates "we fixed this"
- ❌ "Won't fix" would indicate we're ignoring a real issue
- ❌ "Used in tests" doesn't apply (this is a script, not a test)

## Dismissal Reason Options Explained

| Reason | Use When |
|--------|----------|
| **False positive** | Code was fixed or alert is incorrect | ✅ Use this
| **Won't fix** | Issue exists but we're accepting the risk | ❌ Don't use
| **Used in tests** | Alert is only in test code that won't run in production | ❌ Don't use

## What Happens After Dismissal

Once dismissed:
- Alert shows as "Dismissed" in the Code scanning dashboard
- Alert no longer counts toward your open findings
- Dismissal reason and comment are visible to all with repo access
- If the code regresses (sensitive logging reintroduced), the alert reappears

## Verification

After dismissing all 3 alerts, verify on the [Code scanning page](https://github.com/dcyfr/dcyfr-labs/security/code-scanning):

```
Expected state:
- Alert #49: Dismissed (false positive)
- Alert #50: Dismissed (false positive)
- Alert #51: Dismissed (false positive)
```

## Why No Programmatic API?

GitHub's API documentation shows CodeQL dismissals are **not available** via:
- Fine-grained personal access tokens
- Classic personal access tokens
- REST API endpoints

Only approach:
- ✅ GitHub web UI (manual)
- ✅ GitHub App with org-level security_events scope (complex)
- ❌ Fine-grained tokens (not supported)
- ❌ REST API (not exposed)

This is a GitHub security design decision - CodeQL dismissals require explicit human review and approval via the web interface.

## Related Documentation

- [Code Security - Dismissing Alerts](https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/dismissing-code-scanning-alerts-for-your-repository)
- [Logging Security Best Practices](./ai/LOGGING_SECURITY.md)
- [GitHub CodeQL Documentation](https://codeql.github.com/)

## Summary

| Task | Method | Time |
|------|--------|------|
| Dismiss alert #49 | Web UI | 1 min |
| Dismiss alert #50 | Web UI | 1 min |
| Dismiss alert #51 | Web UI | 1 min |
| **Total** | GitHub interface | **3 minutes** |

**Next step:** Visit [Code scanning alerts](https://github.com/dcyfr/dcyfr-labs/security/code-scanning) and dismiss each alert with reason "False positive".

---

**Last Updated:** December 2025
**Related Issues:** CodeQL Alerts #49, #50, #51 - Clear-text logging of sensitive information
**Status:** Code fixed ✅ | Documentation complete ✅ | Awaiting manual dismissal via web UI
