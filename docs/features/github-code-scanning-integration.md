<!-- TLP:CLEAR -->

# GitHub Code Scanning Alert Integration

This document describes how to check GitHub security code scanning alerts programmatically since the GitHub MCP server doesn't natively support this functionality.

## Problem

The GitHub MCP server (used by Copilot) provides tools for issues, pull requests, and other GitHub features, but doesn't include tools for accessing the [Code Scanning API](https://docs.github.com/en/rest/code-scanning).

**Common Error:**
```
failed to list alerts: GET https://api.github.com/repos/dcyfr/dcyfr-labs/code-scanning/alerts?state=open: 403 Resource not accessible by integration []
```

**Root Cause:** The GitHub MCP server lacks the `security-events: read` permission required to access Code Scanning alerts. This is a limitation of the hosted MCP service.

**Quick Solution:** Use the GitHub CLI workaround implemented in `npm run security:check-alerts`. See [detailed workaround guide](mcp/github-code-scanning-workaround.md).

## Solution

We've implemented three complementary approaches:

### 1. AI Instructions Enhancement

Updated `.github/copilot-instructions.md` with a dedicated section on "GitHub Security Code Scanning Alerts" that teaches Copilot to:

- Recognize code scanning alert URLs
- Use the GitHub CLI (`gh api`) to query the Code Scanning API
- Interpret alert states and provide actionable feedback

**Key workflow documented:**

```bash
# Get specific alert
gh api /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}

# List all alerts with filtering
gh api /repos/{owner}/{repo}/code-scanning/alerts \
  --jq '.[] | {number, state, rule: .rule.id}'

# Check dependency existence
npm ls @package/name
```

### 2. Dedicated Script Tool

Created `scripts/check-security-alert.mjs` - a standalone Node.js script that simplifies alert checking:

**Features:**
- Accepts alert number (defaults to `dcyfr/dcyfr-labs`) or full URL
- Shows formatted alert details (state, rule, severity, location)
- Returns appropriate exit codes for automation
- Handles 404s gracefully (indicates alert was resolved/deleted)

**Usage:**

```bash
# By alert number
node scripts/check-security-alert.mjs 2

# By full URL
node scripts/check-security-alert.mjs https://github.com/dcyfr/dcyfr-labs/security/code-scanning/2
```

**Example output:**

```
🔍 Checking alert #2 in dcyfr/dcyfr-labs...

📋 Alert Details:
   Number: #2
   State: open
   Rule: javascript/DOMXSS
   Severity: warning
   Description: DOM-based Cross-site Scripting (XSS)
   Location: src/components/github-heatmap.tsx:495-495
   URL: https://github.com/dcyfr/dcyfr-labs/security/code-scanning/2

⚠️  Alert is OPEN and needs attention
```

### 3. Documentation

Added comprehensive guides:
- `scripts/README.md` - Script usage documentation
- `.github/copilot-instructions.md` - AI behavior guidelines
- This file - Technical reference

## API Reference

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/repos/{owner}/{repo}/code-scanning/alerts` | GET | List all alerts with filters |
| `/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}` | GET | Get specific alert details |
| `/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}` | PATCH | Update alert (dismiss/reopen) |

### Response Fields

**Important fields in alert responses:**

```json
{
  "number": 2,                    // Alert ID
  "state": "open",                // open | closed | dismissed | fixed
  "rule": {
    "id": "javascript/DOMXSS",    // Vulnerability identifier
    "severity": "warning",        // critical | high | medium | low | warning
    "description": "..."          // Human-readable description
  },
  "most_recent_instance": {
    "location": {
      "path": "src/file.ts",     // File path
      "start_line": 495,          // Line numbers
      "end_line": 495
    }
  },
  "dismissed_reason": "...",      // If state is 'dismissed'
  "dismissed_comment": "...",     // Optional explanation
  "fixed_at": "2024-01-01T00:00:00Z"  // If state is 'fixed'
}
```

## Authentication

All approaches require GitHub CLI (`gh`) to be authenticated:

```bash
# Check authentication
gh auth status

# Login if needed
gh auth login
```

## Why Not Extend the MCP Server?

The GitHub MCP server is hosted by GitHub at `https://api.githubcopilot.com/mcp/` and isn't directly modifiable. Options for enhancement would be:

1. **Request feature from GitHub** - File an issue/feature request for code scanning support
2. **Create custom MCP server** - Build a wrapper or extension server
3. **Use terminal workaround** (current approach) - Leverage `gh api` through terminal commands

We chose option 3 because:
- ✅ Immediate availability
- ✅ No additional infrastructure
- ✅ Leverages existing GitHub CLI auth
- ✅ Easy to maintain and understand
- ❌ Requires GitHub CLI installation

## Future Enhancements

### Short Term
- [ ] Add npm script: `npm run check-alert -- 2`
- [ ] Support bulk alert checking
- [ ] Add alert filtering by severity/state

### Long Term
- [ ] Contribute code scanning tools to GitHub MCP server
- [ ] Create custom MCP server extension
- [ ] Integrate with CI/CD for automated alert tracking

## Related Links

- [GitHub Code Scanning API Docs](https://docs.github.com/en/rest/code-scanning)
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [SARIF Format Spec](https://docs.oasis-open.org/sarif/sarif/v2.1.0/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

## Testing

Test the integration with known alerts:

```bash
# Test open alert (should return exit code 1)
node scripts/check-security-alert.mjs 2

# Test non-existent alert (should return exit code 0)
node scripts/check-security-alert.mjs 999999

# Test via Copilot
# Ask: "Check if GitHub security alert #2 is resolved"
```

## Troubleshooting

**"gh: command not found"**
```bash
# Install GitHub CLI
brew install gh  # macOS
# or follow https://cli.github.com/
```

**"HTTP 401: Bad credentials"**
```bash
gh auth login
```

**"HTTP 404: Not Found"**
- Alert may have been resolved and deleted (this is good!)
- Alert number might be wrong
- Repository might not have code scanning enabled

**"HTTP 403: Resource not accessible by integration"**
- **Root Cause:** GitHub MCP server lacks `security-events: read` permission
- **Solution:** Use GitHub CLI workaround instead of MCP server
- **Quick Fix:** `npm run security:check-alerts` (uses `gh` CLI)
- **Full Guide:** See [GitHub Code Scanning Workaround](mcp/github-code-scanning-workaround.md)
- Check repository access permissions
- Ensure GitHub Advanced Security is enabled for private repos

---

**Last Updated:** November 16, 2025  
**Maintainer:** Drew (@dcyfr)
