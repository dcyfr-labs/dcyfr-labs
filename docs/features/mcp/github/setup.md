# GitHub MCP Setup & Getting Started

**Implementation Date**: October 18, 2025
**Last Updated**: January 5, 2026
**Current Status**: ✅ Configured (Awaiting First Use)

## Overview

You now have GitHub's official MCP Server integrated into your development environment. This guide walks you through setting it up for first use.

## Before You Start

### Requirements Checklist
- [ ] Docker is installed on your machine
- [ ] Docker app can be launched (`/Applications/Docker.app` on macOS)
- [ ] GitHub account with repository access
- [ ] VS Code 1.101 or later

### Quick Environment Check
```bash
# Check Docker installation
docker --version

# Verify VS Code version
code --version
```

## Step 1: Create GitHub Personal Access Token

**Time**: 2-3 minutes

1. Navigate to: https://github.com/settings/personal-access-tokens/new

2. Fill in the form:
   - **Token name**: `dcyfr-labs-mcp` (or your preferred name)
   - **Expiration**: 90 days (balances security and convenience)
   - **Description**: "MCP Server for VS Code AI assistants"

3. Select scopes based on what you need:
   
   **For General Development** (recommended):
   ```
   ☑ repo (full control of repositories)
   ☑ read:org (read organization data)
   ☑ read:discussion
   ☑ workflow (manage Actions)
   ```
   
   **For Full Features**:
   ```
   ☑ All of above, plus:
   ☑ admin:org_hook
   ☑ gist
   ```
   
   **Read-Only/Safe**:
   ```
   ☑ public_repo
   ☑ read:org
   ☑ read:discussion
   ```

4. Click "Generate token"

5. **Copy the token immediately** - You won't see it again!
   
   ```
   Your token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

6. Keep it safe - you'll enter it on first use

## Step 2: Prepare Docker

**Time**: 2-5 minutes (first time only)

### A. Start Docker

**macOS**:
```bash
open /Applications/Docker.app
# Wait 30 seconds for Docker to fully start
```

**Verify Docker is running**:
```bash
docker ps
```

You should see output like:
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### B. Pre-pull GitHub MCP Image (Optional but Recommended)

This prevents a delay on first use:

```bash
docker pull ghcr.io/github/github-mcp-server
```

Expected output:
```
latest: Pulling from github/github-mcp-server
[=====>                                     ] Pulling...
Status: Downloaded newer image for ghcr.io/github/github-mcp-server:latest
```

## Step 3: Launch VS Code with GitHub MCP

**Time**: 1 minute

### A. Open VS Code

```bash
code project-folder/
```

### B. Toggle Agent Mode

1. Open GitHub Copilot Chat or Claude Extension
2. Look for "Agent mode" button (near the chat input)
3. Toggle it ON

### C. Enter GitHub Token (First Use Only)

1. VS Code will prompt: **"GitHub Personal Access Token"**
2. Paste the token you created in Step 1
3. VS Code stores it securely
4. GitHub MCP server initializes

### D. Verify MCP is Ready

In the MCP settings or extension panel, you should see:

```
✅ context7
✅ sequential-thinking
✅ memory
✅ filesystem
✅ github ← NEW!
```

## Step 4: Test GitHub MCP

**Time**: 2-3 minutes

Try these queries in Copilot Chat:

1. **Simple test**:
   ```
   "What's the status of this repository?"
   ```

2. **List operations**:
   ```
   "Show me the recent commits"
   ```

3. **Search**:
   ```
   "Find rate limiting code in this repository"
   ```

4. **Issue operations**:
   ```
   "List all open issues"
   ```

Expected: AI responds with actual GitHub data from your repo

## Common First-Time Issues & Fixes

### Issue: "Cannot connect to Docker daemon"
**Cause**: Docker app not running  
**Fix**: 
```bash
open /Applications/Docker.app
sleep 30
# Try again
```

### Issue: "401 Unauthorized"
**Cause**: Token invalid or expired  
**Fix**:
- Verify token was copied completely
- Check token hasn't expired in GitHub settings
- Generate a new token if needed

### Issue: "MCP server won't start"
**Cause**: Missing Docker or VS Code version too old  
**Fix**:
- Update VS Code: `Code → About Visual Studio Code`
- Ensure Docker 1.10+: `docker --version`
- Pre-pull image: `docker pull ghcr.io/github/github-mcp-server`

### Issue: "Tools showing but not working"
**Cause**: Token lacks required permissions  
**Fix**:
- Verify token has `repo` scope at minimum
- Generate new token with broader permissions
- Test simpler operations first (reading vs writing)

## Security Best Practices

### Immediate
✅ Token only created for this specific purpose  
✅ Reasonable expiration set (90 days)  
✅ Minimal necessary permissions granted  
✅ Token stored securely by VS Code  

### Ongoing
- [ ] Set calendar reminder to rotate token every 90 days
- [ ] Review GitHub settings monthly
- [ ] Never share or commit token to git
- [ ] Rotate immediately if token appears compromised
- [ ] Review "Personal access tokens" in GitHub settings regularly

## What's Next?

### Immediate (First Day)
1. Test basic queries (see "Test GitHub MCP" above)
2. Try automating your most common GitHub tasks
3. Combine with other MCPs for powerful workflows

### Short Term (First Week)
- Explore different toolsets based on your needs
- Set up read-only mode for sensitive repos if needed
- Create custom tools/workflows using GitHub MCP
- Share feedback with team

### Long Term
- Integrate GitHub MCP into CI/CD processes
- Combine with Sequential Thinking for complex automation
- Use GitHub + Filesystem MCPs together for code analysis
- Build team workflows around MCP capabilities

## Command Reference

### Docker Management
```bash
# Start Docker
open /Applications/Docker.app

# Pull latest image
docker pull ghcr.io/github/github-mcp-server

# List running MCP containers
docker ps | grep github

# Clean up unused images
docker image prune -a
```

### VS Code Management
```bash
# Check VS Code version (should be 1.101+)
code --version

# Reload VS Code window (Cmd+K Cmd+R)
# This refreshes MCP connections

# Check MCP settings
# Settings → Model Context Protocol
```

### Verification
```bash
# Verify Docker daemon is running
docker ps

# Check if token is valid (requires 'gh' CLI)
gh auth status
```

## File Locations Reference

| File | Purpose |
|------|---------|
| `~/.../Code/User/mcp.json` | VS Code MCP configuration (includes GitHub) |
| `./mcp.json` | Project reference configuration |
| `docs/mcp/github/implementation.md` | Full documentation |
| `docs/features/mcp/MCP_QUICK_REFERENCE.md` | Consolidated MCP quick reference (all 6 MCPs) |
| `docs/mcp/github/setup.md` | This file |

## Getting Help

### Troubleshooting Resources
1. **GitHub MCP Docs**: https://github.com/github/github-mcp-server#readme
2. **GitHub MCP Issues**: https://github.com/github/github-mcp-server/issues
3. **VS Code MCP Support**: https://github.com/modelcontextprotocol
4. **Docker Troubleshooting**: https://docs.docker.com/troubleshoot/

### For This Project
- Check `docs/` directory for detailed guides
- Review `.github/copilot-instructions.md` for project context
- Examine `mcp.json` for current configuration

## Success Indicators

You know it's working when:

✅ VS Code shows "github" in MCP list  
✅ No error messages in VS Code output panel  
✅ Queries return actual GitHub data  
✅ You can list repos, issues, or PRs  
✅ Token prompt appeared on first use (and not again)  

## Next Steps

Once verified:

1. **Read** `docs/features/mcp/MCP_QUICK_REFERENCE.md` (5 min) - Common operations across all 6 MCPs
2. **Explore** `docs/mcp/github/implementation.md` (30 min) - Full GitHub MCP capabilities
3. **Experiment** - Try different queries and toolsets
4. **Integrate** - Use GitHub MCP in your daily workflow
5. **Share** - Help teammates set up their GitHub MCPs

---

**Support**: If issues persist, check GitHub MCP GitHub issues:  
https://github.com/github/github-mcp-server/issues

**Status**: Ready to use! 🚀
