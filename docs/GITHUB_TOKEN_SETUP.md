# GitHub Fine-Grained Token Setup

This guide explains how to create a new GitHub fine-grained personal access token with the necessary permissions for Claude Code operations, including dismissing CodeQL security findings.

## Why a New Token?

Your current GitHub token (`gho_*`) has these scopes:
```
gist, read:org, repo, workflow
```

However, dismissing CodeQL security findings requires the `security_events:write` scope, which is **not available** in classic tokens. Fine-grained tokens provide more precise permission control.

## Step 1: Create Fine-Grained Token

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
   - Direct link: https://github.com/settings/personal-access-tokens/new

2. **Fill in the form:**

   | Field | Value |
   |-------|-------|
   | **Token name** | `Claude Code - dcyfr-labs` |
   | **Expiration** | 90 days (recommended) |
   | **Repository access** | Select repositories |
   | **Selected repositories** | `dcyfr/dcyfr-labs` |

3. **Select Repository Permissions:**

   Click "Repository permissions" and set:

   ```
   ✅ Contents:              Read and write
   ✅ Metadata:              Read-only (required)
   ✅ Commit statuses:       Read and write
   ✅ Checks:                Read and write
   ✅ Pull requests:         Read and write
   ✅ Workflows:             Read and write
   ✅ Deployments:           Read and write
   ✅ Security events:       Read and write  ← KEY FOR CODEQL
   ```

4. **Select Account Permissions:**

   Click "Account permissions" and set:

   ```
   ✅ read:user
   ✅ read:org
   ```

5. **Click "Generate token"**

6. **Copy the token** (starts with `github_pat_`)
   - ⚠️ This is your only chance to copy it!
   - Store it securely

## Step 2: Update GitHub CLI

Once you have the token, configure it:

### Option A: Interactive Login (Recommended)

```bash
gh auth logout
gh auth login
# Select: GitHub.com
# Select: HTTPS
# Select: Paste an authentication token
# Paste your new fine-grained token
```

### Option B: Environment Variable (Temporary)

```bash
export GITHUB_TOKEN="github_pat_your_token_here"
gh auth status  # Verify it works
```

### Option C: Update Keyring (Persistent)

The gh CLI will automatically store it in your system keyring after login.

## Step 3: Verify Token Configuration

```bash
# Check authentication status
gh auth status

# Should show:
# ✓ Logged in to github.com as dcyfr
# - Token: github_pat_***...
# - Token scopes: 'gist', 'read:org', 'repo', 'workflow', 'security_events:write'
```

**Key indicator:** Look for `security_events:write` in the scopes.

## Step 4: Dismiss CodeQL Alerts

Once the token is configured with `security_events:write`, run:

```bash
# Make sure GITHUB_TOKEN env var is cleared
unset GITHUB_TOKEN

# Run the dismiss script
./scripts/dismiss-codeql-alerts.sh
```

**Expected output:**
```
🔐 Dismissing CodeQL Security Findings
========================================

Repository: dcyfr/dcyfr-labs
Alerts: 49 50 51

🔍 Verifying GitHub authentication...
✅ Authenticated with scopes: gist, read:org, repo, workflow, security_events:write

📋 Dismissing alert #49...
   ✅ Alert #49 dismissed successfully
📋 Dismissing alert #50...
   ✅ Alert #50 dismissed successfully
📋 Dismissing alert #51...
   ✅ Alert #51 dismissed successfully

✨ All CodeQL security findings dismissed!
```

## Troubleshooting

### "Bad credentials" Error

```
gh: Bad credentials (HTTP 401)
```

**Solution:** Your token doesn't have the right permission.
- Verify `security_events:write` is enabled in token settings
- Create a new token if needed

### "Invalid request" Error with "fixed" Reason

```
Invalid request.
fixed is not a member of ["false positive", "won't fix", "used in tests"]
```

**Solution:** Use valid `dismissed_reason` values:
- `false_positive` - Correctly dismissed in our script ✅
- `won't_fix` - Code won't be changed
- `used_in_tests` - Alert is only in test code

### "GITHUB_TOKEN env var is being used"

```
The value of the GITHUB_TOKEN environment variable is being used for authentication.
```

**Solution:** Clear the invalid env var:
```bash
unset GITHUB_TOKEN
gh auth status  # Should use keyring token now
```

## Manual Alert Dismissal (if Script Fails)

If the script encounters issues, you can dismiss alerts manually:

```bash
# Alert #49
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/49 \
  -X PATCH \
  -f state='dismissed' \
  -f dismissed_reason='false_positive' \
  -f dismissed_comment='Fixed by removing clear-text logging of GOOGLE_INDEXING_API_KEY credentials.'

# Alert #50
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/50 \
  -X PATCH \
  -f state='dismissed' \
  -f dismissed_reason='false_positive' \
  -f dismissed_comment='Fixed by removing clear-text logging of GOOGLE_INDEXING_API_KEY credentials.'

# Alert #51
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/51 \
  -X PATCH \
  -f state='dismissed' \
  -f dismissed_reason='false_positive' \
  -f dismissed_comment='Fixed by removing clear-text logging of GOOGLE_INDEXING_API_KEY credentials.'
```

## Security Best Practices

1. **Token Storage:**
   - ✅ Use gh CLI's keyring (auto-encrypted)
   - ❌ Never commit tokens to git
   - ❌ Never paste in terminals where history is logged

2. **Token Rotation:**
   - Set expiration to 90 days
   - Rotate before expiration
   - Revoke old tokens after creating new ones

3. **Scope Minimization:**
   - Only enable `security_events:write` for CodeQL operations
   - Use read-only scopes when possible
   - Never enable `admin:*` or `delete_repo` scopes

4. **Audit Trail:**
   - Check GitHub Settings → Security log periodically
   - Review authorized applications and tokens

## Related Documentation

- [Logging Security Best Practices](./ai/LOGGING_SECURITY.md)
- [CodeQL Analysis Setup](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning)
- [GitHub Fine-Grained Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub CLI Authentication](https://cli.github.com/manual/gh_auth_login)

## Quick Reference

| Task | Command |
|------|---------|
| Check auth | `gh auth status` |
| Login | `gh auth login` |
| Logout | `gh auth logout` |
| Dismiss alerts | `./scripts/dismiss-codeql-alerts.sh` |
| Manual dismiss alert #49 | `gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/49 -X PATCH -f state='dismissed' -f dismissed_reason='false_positive'` |

---

**Last Updated:** December 2025
**Related Issues:** CodeQL Alerts #49, #50, #51 - Clear-text logging of sensitive information
