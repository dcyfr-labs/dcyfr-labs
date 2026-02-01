<!-- TLP:CLEAR -->

# MCP (Model Context Protocol) Features

This directory contains documentation for MCP server integrations and workarounds for known limitations.

## What is MCP?

Model Context Protocol (MCP) is an open standard for connecting AI assistants to external data sources and tools. DCYFR Labs uses several MCP servers for enhanced development capabilities.

## MCP Servers in Use

See [`.vscode/mcp.json`](../../.vscode/mcp.json) for full configuration.

### Tier 1: Essential (Always On)
- **GitHub** - Repos, issues, PRs, code search
- **Vercel** - Deployment management
- **DCYFR Analytics** - Project metrics
- **DCYFR DesignTokens** - Design system validation
- **DCYFR ContentManager** - Blog content management

### Tier 2: On Demand
- **Sentry** - Error tracking
- **Axiom** - Log aggregation
- **Context7** - Enhanced context retrieval
- **Octocode** - GitHub code research
- **Perplexity** - AI-powered search

### Tier 3: Specialized (Disabled by default)
- **DeepGraph** - Deep code analysis (Next.js, TypeScript)
- **Playwright** - Browser automation
- **Chrome DevTools** - Performance profiling
- **arXiv** - Academic paper search

## Known Limitations & Workarounds

### GitHub Code Scanning API (403 Error)

**Issue:** The GitHub MCP server lacks `security-events: read` permission to access Code Scanning alerts.

**Error Message:**
```
failed to list alerts: GET https://api.github.com/repos/dcyfr/dcyfr-labs/code-scanning/alerts?state=open: 403 Resource not accessible by integration []
```

**Solution:** Use GitHub CLI workaround

**Quick Commands:**
```bash
# Check all open security alerts
npm run security:check-alerts

# Check specific alert
npm run security:check-alert -- 42

# Audit LGTM suppressions
npm run security:audit-suppressions
```

**Full Guide:** [GitHub Code Scanning Workaround](github-code-scanning-workaround.md)

---

## Directory Structure

```
docs/features/mcp/
├── README.md (this file)
├── github-code-scanning-workaround.md  # Detailed 403 error workaround
└── github/
    ├── setup.md                        # GitHub MCP server setup
    └── implementation.md               # Implementation details
```

## Related Documentation

- **MCP Configuration:** [`.vscode/mcp.json`](../../.vscode/mcp.json)
- **Security Quick Reference:** [`docs/security/code-scanning-quick-reference.md`](../../security/code-scanning-quick-reference.md)
- **GitHub Integration:** [`docs/features/github-code-scanning-integration.md`](../github-code-scanning-integration.md)
- **Model Context Protocol Spec:** https://modelcontextprotocol.io/

---

**Last Updated:** February 1, 2026
**Maintainer:** DCYFR Labs Team
