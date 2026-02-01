<!-- TLP:CLEAR -->

# GitHub Code Scanning API Workaround

**Issue:** 403 Error when accessing Code Scanning alerts via GitHub MCP Server
**Status:** Documented Limitation with Implemented Workaround
**Last Updated:** February 1, 2026

---

## Problem Statement

When attempting to access GitHub Code Scanning alerts through the GitHub MCP server, you may encounter this error:

```
failed to list alerts: GET https://api.github.com/repos/dcyfr/dcyfr-labs/code-scanning/alerts?state=open: 403 Resource not accessible by integration []
```

### Root Cause

The GitHub MCP server (hosted at `https://api.githubcopilot.com/mcp/`) lacks the `security-events: read` permission required to access the [Code Scanning API](https://docs.github.com/en/rest/code-scanning).

**Why this happens:**
- The MCP server is hosted by GitHub as a managed service
- It uses a GitHub Copilot integration token with limited scopes
- Code Scanning API requires `security-events: read` permission
- GitHub Copilot integration doesn't include this permission
- We cannot modify permissions on the hosted MCP server

---

## ✅ Solution: GitHub CLI Workaround

We've implemented a GitHub CLI-based workaround that provides the same functionality without the MCP server limitation.

### Quick Start

```bash
# Check all open security alerts
npm run security:check-alerts

# Check specific alert by number
npm run security:check-alert -- 42

# Audit LGTM suppressions
npm run security:audit-suppressions
```

### Prerequisites

1. **Install GitHub CLI** (if not already installed)

```bash
# macOS
brew install gh

# Windows (Winget)
winget install --id GitHub.cli

# Linux (Debian/Ubuntu)
sudo apt install gh

# Or see: https://cli.github.com/
```

2. **Authenticate GitHub CLI**

```bash
# Check current authentication status
gh auth status

# If not authenticated, login
gh auth login

# Follow prompts:
# 1. Choose "GitHub.com"
# 2. Choose "HTTPS" protocol
# 3. Authenticate via web browser
# 4. Select appropriate scopes (repo access required)
```

3. **Verify Access**

```bash
# Test API access
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts

# Should return JSON array of alerts or empty array []
# If 403 error, check authentication and repository access
```

---

## Available Commands

### 1. Check All Open Alerts

**Command:** `npm run security:check-alerts`

**Purpose:** Query all open Code Scanning alerts

**Output Example:**
```
🔍 Checking security alerts for dcyfr/dcyfr-labs...

📊 Open Security Alerts: 2

Alert #42
  Rule:     js/command-line-injection
  Severity: high
  State:    open
  Location: scripts/example.mjs:123-125
  Message:  Improper neutralization of special elements
  URL:      https://github.com/dcyfr/dcyfr-labs/security/code-scanning/42

Alert #43
  Rule:     js/log-injection
  Severity: medium
  State:    open
  Location: src/lib/logger.ts:67-69
  Message:  Log entry created from user input
  URL:      https://github.com/dcyfr/dcyfr-labs/security/code-scanning/43

⚠️  2 open alert(s) require attention
```

**Exit Codes:**
- `0` - No open alerts (repository is clean)
- `1` - Open alerts exist OR error occurred

---

### 2. Check Specific Alert

**Command:** `npm run security:check-alert -- <alert_number>`

**Purpose:** Get detailed information about a specific alert

**Example:**
```bash
npm run security:check-alert -- 42
```

**Output Example:**
```
🔍 Checking alert #42 in dcyfr/dcyfr-labs...

📋 Alert Details:
   Number: #42
   State: open
   Rule: js/command-line-injection
   Severity: high
   Description: Improper neutralization of special elements
   Location: scripts/example.mjs:123-125
   URL: https://github.com/dcyfr/dcyfr-labs/security/code-scanning/42

⚠️  Alert is OPEN and needs attention
```

**Exit Codes:**
- `0` - Alert is closed/fixed or doesn't exist (404)
- `1` - Alert is open and needs attention

---

### 3. Audit LGTM Suppressions

**Command:** `npm run security:audit-suppressions`

**Purpose:** Review all `lgtm` suppression comments in the codebase

**Output Example:**
```
📋 LGTM Suppression Audit
Date: 2026-02-01 10:30:00
Repository: dcyfr-labs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary Statistics
  Total Suppressions: 2
  Baseline (CI):      2
  Status: ✅ MATCHES BASELINE (2 = 2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Suppressions by Rule
  js/file-system-race: 2 occurrence(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 All Suppressions (with locations)
  [js/file-system-race] scripts/content/generate-project-hero.mjs:269
  [js/file-system-race] scripts/content/generate-blog-hero.mjs:349
```

---

## Using in GitHub Actions

The GitHub CLI approach works seamlessly in GitHub Actions workflows.

### Workflow Configuration

```yaml
name: Security Check

on:
  pull_request:
  workflow_dispatch:

permissions:
  contents: read
  security-events: read  # Required for Code Scanning API

jobs:
  check-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check for open security alerts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm run security:check-alerts || echo "⚠️ Open security alerts found"
```

**Key Points:**
- ✅ `GITHUB_TOKEN` automatically has required permissions
- ✅ `gh` CLI is pre-installed on GitHub Actions runners
- ✅ No additional authentication needed
- ✅ Works for public and private repos

---

## API Direct Access (Advanced)

For programmatic access, you can use the GitHub CLI API directly:

```bash
# List all open alerts
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts?state=open

# Get specific alert
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/42

# List alerts filtered by severity
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts?severity=high

# Dismiss an alert
gh api repos/dcyfr/dcyfr-labs/code-scanning/alerts/42 \
  -X PATCH \
  -f state=dismissed \
  -f dismissed_reason='false positive' \
  -f dismissed_comment='Confirmed safe pattern'
```

**Available Filters:**
- `state` - `open`, `closed`, `dismissed`, `fixed`
- `severity` - `critical`, `high`, `medium`, `low`, `warning`
- `ref` - Git reference (branch/tag)
- `tool_name` - CodeQL, Semgrep, etc.

---

## Troubleshooting

### Error: "gh: command not found"

**Solution:** Install GitHub CLI

```bash
# macOS
brew install gh

# Or see installation guide:
# https://cli.github.com/
```

---

### Error: "HTTP 401: Bad credentials"

**Solution:** Authenticate GitHub CLI

```bash
gh auth login
```

Follow the prompts to authenticate via web browser.

---

### Error: "HTTP 403: Forbidden"

**Possible Causes:**

1. **Insufficient Repository Access**
   - Ensure you have `read` access to the repository
   - For private repos, ensure your token has `repo` scope

2. **GitHub Advanced Security Not Enabled**
   - Code Scanning requires GitHub Advanced Security
   - Check: Settings → Security → Code security and analysis
   - Enable "Code scanning" if disabled

3. **No Code Scanning Results**
   - If CodeQL hasn't run yet, there are no alerts to query
   - Run CodeQL workflow first: Actions → CodeQL Analysis

---

### Error: "HTTP 404: Not Found"

**Possible Causes:**

1. **Alert Was Resolved**
   - Good! Alert was fixed and automatically closed
   - Check Git history for the fix

2. **Wrong Alert Number**
   - Verify alert number in GitHub Security tab
   - List all alerts: `npm run security:check-alerts`

3. **Code Scanning Not Enabled**
   - Enable Code Scanning in repository settings
   - Or run CodeQL workflow manually

---

## Why Not Self-Host GitHub MCP Server?

**Option:** Self-host GitHub MCP server with custom permissions

**Analysis:**

**Pros:**
- ✅ Full control over permissions
- ✅ Can include `security-events: read`
- ✅ Native MCP server integration

**Cons:**
- ❌ Additional infrastructure to maintain
- ❌ Requires Docker deployment
- ❌ Token management overhead
- ❌ May break with MCP server updates
- ❌ Duplicates functionality already provided by `gh` CLI

**Recommendation:** Use GitHub CLI workaround

**Reasons:**
- Simpler (no infrastructure)
- More maintainable (gh CLI is stable)
- Works everywhere (local dev + CI/CD)
- Already implemented and tested
- No security token storage required

---

## Future Enhancements

### Short Term

- [x] Implement GitHub CLI-based scripts
- [x] Add npm scripts for common operations
- [x] Document troubleshooting guide
- [ ] Add JSON output mode for programmatic use
- [ ] Support filtering by severity in npm scripts

### Long Term

- [ ] Request GitHub to add `security-events: read` to Copilot MCP
- [ ] Contribute Code Scanning tools to GitHub MCP server
- [ ] Create TypeScript SDK wrapper around `gh` CLI
- [ ] Build custom MCP server if team demand justifies it

---

## Related Documentation

- [Alert Closure Workflow](../../security/alert-closure-workflow.md) - How to resolve alerts
- [Code Scanning Quick Reference](../../security/code-scanning-quick-reference.md) - Command reference
- [GitHub Code Scanning Integration](../github-code-scanning-integration.md) - Original integration guide
- [GitHub Code Scanning API Docs](https://docs.github.com/en/rest/code-scanning) - Official API reference

---

## Scripts Reference

**Location:** `scripts/security/`

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-all-alerts.mjs` | List all open alerts | `npm run security:check-alerts` |
| `check-security-alert.mjs` | Get specific alert | `npm run security:check-alert -- 42` |
| `audit-suppressions.sh` | Audit LGTM comments | `npm run security:audit-suppressions` |

---

## Contact & Support

**Issue:** Code Scanning API 403 error
**Status:** ✅ Resolved via documented workaround
**Maintainer:** Security Team (@dcyfr)
**Last Verified:** February 1, 2026

**Need Help?**
- Security Channel: #security
- Documentation Issues: Create issue with `documentation` label
- Feature Requests: Create issue with `enhancement` label

---

**Status:** ✅ Documented Limitation with Working Workaround
**Recommended Solution:** Use GitHub CLI (`npm run security:check-alerts`)
**Alternative:** Self-host GitHub MCP server (not recommended)
