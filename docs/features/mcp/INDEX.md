<!-- TLP:CLEAR -->

# MCP (Model Context Protocol) Integration Guide

**Last Updated:** January 21, 2026
**Status:** Production-ready

---

## Overview

Model Context Protocol (MCP) servers enable AI assistants to interact with external services through well-defined tools. DCYFR Labs integrates multiple MCP servers to enhance development capabilities with real-time data, analytics, and external API access.

**Key Benefits:**

- **Real-time data access** from external services (GitHub, Axiom, Perplexity)
- **Centralized configuration** in `.vscode/mcp.json`
- **Health monitoring** via `npm run mcp:check`
- **AI-powered research** with Perplexity and Context7

---

## Available MCP Servers

### 🔍 Perplexity MCP

**Purpose:** AI-powered search, reasoning, and research

**Capabilities:**

- Natural language search with citations
- Deep reasoning for complex questions
- Research synthesis across multiple sources
- Web search with ranked results

**Tools Available:**

- `perplexity_ask` - Conversational search
- `perplexity_reason` - Logical reasoning
- `perplexity_research` - In-depth research with citations
- `perplexity_search` - Web search

**Documentation:** [perplexity-mcp.md](./perplexity-mcp.md)

---

### 📚 Context7 MCP

**Purpose:** Library documentation and code examples

**Capabilities:**

- Resolve library IDs for packages/frameworks
- Query up-to-date documentation
- Fetch code examples and usage patterns
- Access authoritative library references

**Tools Available:**

- `context7_resolve-library-id` - Find library IDs
- `context7_query-docs` - Get documentation and examples

**Documentation:** [context7-mcp.md](./context7-mcp.md)

---

### 📊 Axiom MCP

**Purpose:** Analytics and logging integration

**Capabilities:**

- Query datasets using Axiom Processing Language (APL)
- Monitor dashboards and performance metrics
- Track monitor status and history
- Analyze application logs and events

**Tools Available:**

- `axiom_queryDataset` - Query analytics data
- `axiom_listDashboards` - List available dashboards
- `axiom_getDashboard` - Get dashboard details
- `axiom_checkMonitors` - Check monitor statuses
- `axiom_getMonitorHistory` - Get monitor history

**Documentation:** [axiom-mcp.md](./axiom-mcp.md)

---

### 🐙 GitHub MCP

**Purpose:** Repository and code management

**Capabilities:**

- Create and manage repositories, branches, pull requests
- Search code, issues, and repositories
- Manage files, labels, and releases
- Review pull requests and manage comments

**Tools Available:**

- Repository management (create, list, search)
- File operations (read, create, update, delete)
- Issue and PR management
- Code search and navigation
- Copilot review integration

**Documentation:** [github-mcp.md](./github-mcp.md)

---

## Quick Start

### 1. Configuration

MCP servers are configured in `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@upstreetai/perplexity-mcp"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstreetai/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      }
    },
    "axiom": {
      "command": "npx",
      "args": ["-y", "@upstreetai/axiom-mcp"],
      "env": {
        "AXIOM_API_TOKEN": "${AXIOM_API_TOKEN}",
        "AXIOM_ORG_ID": "${AXIOM_ORG_ID}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@upstreetai/github-mcp"]
    }
  }
}
```

### 2. Environment Variables

Add API keys to `.env.local`:

```bash
# Perplexity (AI-powered search)
PERPLEXITY_API_KEY=your_key_here

# Context7 (library documentation)
CONTEXT7_API_KEY=your_key_here

# Axiom (analytics)
AXIOM_API_TOKEN=your_token_here
AXIOM_ORG_ID=your_org_id_here
```

**Note:** GitHub MCP uses GitHub CLI authentication (`gh auth login`)

### 3. Health Check

Verify all MCP servers are configured correctly:

```bash
npm run mcp:check
```

Expected output:

```
✅ Perplexity MCP: Configured
✅ Context7 MCP: Configured
✅ Axiom MCP: Configured
✅ GitHub MCP: Configured (using GitHub CLI)

All MCP servers are healthy!
```

---

## Common Use Cases

### Research & Documentation

**Tools:** Perplexity, Context7

```
# Research a topic with citations
Use Perplexity to research "Next.js 16 App Router performance patterns"

# Find library documentation
Use Context7 to get React 19 usage patterns
```

### Analytics & Monitoring

**Tools:** Axiom

```
# Query page view analytics
Use Axiom to query dataset 'analytics' for page views in last 24 hours

# Check monitor status
Use Axiom to check all monitor statuses
```

### Code Management

**Tools:** GitHub

```
# Search for implementation patterns
Use GitHub to search for "Inngest error handling" in repositories

# Create a pull request
Use GitHub to create PR with bug fix changes
```

---

## Troubleshooting

### MCP Server Not Responding

**Symptoms:** Tools not available or timing out

**Solutions:**

1. Verify API keys in `.env.local`
2. Run `npm run mcp:check` to diagnose
3. Check server logs in VS Code Output panel (select MCP server)
4. Restart VS Code to reload MCP servers

### Authentication Errors

**GitHub:**

```bash
gh auth login  # Re-authenticate with GitHub CLI
```

**Other services:**

- Verify API keys are correct in `.env.local`
- Check API key permissions and quotas
- Ensure environment variables are loaded (restart VS Code)

### Rate Limiting

**Symptoms:** "Rate limit exceeded" errors

**Solutions:**

- Wait for rate limit reset (check service status)
- For Perplexity: Upgrade to higher tier or reduce query frequency
- For GitHub: Use personal access token with higher limits

---

## Best Practices

### 1. Efficient Querying

- **Perplexity:** Ask specific questions, not open-ended prompts
- **Axiom:** Use time ranges to reduce data scanned
- **Context7:** Query only when library ID is known

### 2. Error Handling

- Always check for rate limits before bulk operations
- Handle timeouts gracefully (MCP servers may be slow)
- Use health checks before critical workflows

### 3. Security

- Never commit API keys to version control
- Use `.env.local` for local development
- Use environment variables for production deployments
- Rotate API keys regularly

### 4. Performance

- Cache frequently accessed data
- Batch requests when possible
- Use specific queries to reduce response times

---

## Additional Resources

### Configuration

- **MCP Configuration:** [.vscode/mcp.json](../../../.vscode/mcp.json)
- **Health Check Script:** [scripts/check-mcp-servers.mjs](../../../scripts/check-mcp-servers.mjs)

### Documentation

- **AI MCP Guide:** [docs/ai/mcp-checks.md](../../ai/mcp-checks.md)
- **MCP Quick Reference:** [MCP_QUICK_REFERENCE.md](./MCP_QUICK_REFERENCE.md)
- **Server Documentation:** [servers.md](./servers.md)

### Testing

- **MCP Tests:** [tests/](./tests/)
- **FileSystem/Git MCP:** [filesystem-git/](./filesystem-git/)

---

## Support

**Issues with MCP servers?**

1. Check [Troubleshooting](#troubleshooting) section
2. Run `npm run mcp:check` for diagnostics
3. Review [docs/ai/mcp-checks.md](../../ai/mcp-checks.md)
4. Check VS Code Output panel for detailed logs

**Contributing:**

- MCP server improvements welcome!
- See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for guidelines

---

**Last Updated:** January 21, 2026
**Maintainers:** DCYFR Labs Team
