<!-- TLP:CLEAR -->

# MCP Server Testing Guide

This guide helps you validate all configured MCP servers in Claude Chat.

## Prerequisites

- **Claude Chat** (claude.ai) with `.mcp.json` configured
- Environment variables set (see below)
- MCP servers enabled in Claude settings

## Required Environment Variables

```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc)
export PERPLEXITY_API_KEY="your_perplexity_api_key"
```

For HTTP-based MCPs (GitHub, Vercel, Sentry), authentication is handled via their respective platforms.

## Test Checklist

Copy-paste each test into Claude Chat and verify the response:

---

### 1. Perplexity (Web Search & Research)

**Test 1: Basic Search**
```
Using Perplexity, search for "Next.js 16 App Router new features 2025"
```

**Expected**: Recent articles and documentation about Next.js 16

**Test 2: Deep Research**
```
Using Perplexity, do a deep research query on "React 19 Server Components best practices"
```

**Expected**: Comprehensive research with citations and sources

---

### 2. Context7 (Library Documentation)

**Test 1: React Documentation**
```
Using Context7, look up the React documentation for the useTransition hook
```

**Expected**: Official React docs for useTransition with examples

**Test 2: Next.js Documentation**
```
Using Context7, find documentation for Next.js metadata API
```

**Expected**: Next.js metadata configuration docs

---

### 3. Playwright (Browser Automation)

**Test 1: Navigate and Screenshot**
```
Using Playwright, navigate to https://example.com and take a screenshot
```

**Expected**: Screenshot of example.com

**Test 2: Extract Content**
```
Using Playwright, navigate to https://github.com/dcyfr/dcyfr-labs and extract the repository description
```

**Expected**: Repository description text

---

### 4. Axiom (Log Monitoring)

**Test 1: Recent Logs**
```
Using Axiom, query logs from the last 24 hours
```

**Expected**: Recent log entries from your Axiom dataset

**Test 2: Error Logs**
```
Using Axiom, find all error-level logs from the past 7 days
```

**Expected**: Filtered error logs

---

### 5. Filesystem (MDX Content)

**Test 1: List Blog Posts**
```
Using the Filesystem MCP, list all files in src/content/blog
```

**Expected**: List of MDX blog post files

**Test 2: Read Blog Metadata**
```
Using the Filesystem MCP, read the frontmatter from src/content/blog/red-team-results-2025.mdx
```

**Expected**: Blog post metadata (title, date, description, etc.)

**Test 3: List Documentation**
```
Using the Filesystem MCP, list all files in docs/ai
```

**Expected**: List of AI documentation files

---

### 6. GitHub (Repository Management)

**Test 1: Recent Issues**
```
Using the GitHub MCP, show me the recent issues in the dcyfr-labs repository
```

**Expected**: List of recent GitHub issues

**Test 2: Recent Commits**
```
Using the GitHub MCP, show the last 5 commits on the main branch
```

**Expected**: Recent commit history

**Test 3: Pull Requests**
```
Using the GitHub MCP, list open pull requests
```

**Expected**: List of open PRs (or message if none)

---

### 7. Vercel (Deployment Status)

**Test 1: Recent Deployments**
```
Using the Vercel MCP, show my recent deployments for the dcyfr-labs project
```

**Expected**: List of recent deployments with status

**Test 2: Production Status**
```
Using the Vercel MCP, check the status of the production deployment
```

**Expected**: Current production deployment details

---

### 8. Sentry (Error Monitoring)

**Test 1: Recent Errors**
```
Using the Sentry MCP, show recent errors for the dcyfr-labs project
```

**Expected**: Recent error events (or message if none)

**Test 2: Error Trends**
```
Using the Sentry MCP, show error trends for the past 7 days
```

**Expected**: Error statistics and trends

---

## Troubleshooting

### MCP Not Appearing
1. Check Claude Chat settings → Enable MCP servers
2. Verify `.mcp.json` is in your project root
3. Restart Claude Desktop app

### Authentication Errors
- **Perplexity**: Verify `PERPLEXITY_API_KEY` environment variable
- **Axiom**: Check Axiom dataset permissions
- **GitHub**: Ensure GitHub Copilot access
- **Vercel**: Verify Vercel account connection
- **Sentry**: Check Sentry project URL and permissions

### Connection Errors
- **stdio servers** (Perplexity, Context7, Playwright, Axiom, Filesystem): Check npx can download packages
- **http servers** (GitHub, Vercel, Sentry): Check internet connectivity and service status

### Expected Results Not Appearing
1. Ask Claude: "What MCP servers do you have access to?"
2. Check Claude's response for tool usage
3. Verify the server appears in the active tools list

## Batch Test Script

Copy this entire prompt into Claude Chat for a comprehensive test:

```
Please test all my MCP servers in sequence:

1. Perplexity: Search for "Next.js 16 new features"
2. Context7: Look up React useTransition documentation
3. Playwright: Navigate to https://example.com and describe what you see
4. Axiom: Query logs from the last 24 hours
5. Filesystem: List files in src/content/blog
6. GitHub: Show recent commits on dcyfr-labs
7. Vercel: Show recent deployments
8. Sentry: Show recent errors

For each test, explicitly state which MCP tool you're using and whether it succeeded or failed.
```

---

## Success Criteria

✅ **All tests pass**: All 8 MCP servers respond correctly
⚠️ **Partial success**: Some servers work, others fail (check auth/config)
❌ **No MCP access**: Claude doesn't use any MCP tools (check setup)

## Next Steps

Once validated:
- Document any API keys needed in team wiki
- Set up monitoring for MCP service health
- Create custom workflows combining multiple MCPs
- Update this guide with project-specific examples

---

**Last Updated**: December 2025
**Maintainer**: Drew (dcyfr)
