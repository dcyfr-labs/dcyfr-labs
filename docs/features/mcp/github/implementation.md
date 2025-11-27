# GitHub MCP (Model Context Protocol) Implementation

**Date Implemented**: October 18, 2025  
**Status**: ✅ Active and Configured  
**Version**: GitHub MCP Server v0.18.0+

## Overview

The GitHub MCP Server is GitHub's official Model Context Protocol implementation that enables AI assistants and LLM-powered tools to securely interact with GitHub repositories, issues, pull requests, actions, and more through natural language.

This implementation connects VS Code and MCP-compatible AI tools directly to your GitHub workflows, allowing automation of:
- Repository management and code analysis
- Issue and PR triage and automation
- CI/CD workflow monitoring
- Code security analysis
- Team collaboration features

## Prerequisites

### Required
1. **Docker**: GitHub MCP Server runs in a containerized environment
   - Verify installation: `docker --version`
   - Ensure Docker daemon is running

2. **GitHub Personal Access Token (PAT)**
   - Create at: https://github.com/settings/personal-access-tokens/new
   - **Recommended Permissions** (select based on your needs):
     - `repo` - Full control of repositories
     - `read:org` - Read organization data
     - `read:discussion` - Read discussions
     - `gist` - Full control of gists
     - `workflow` - Full control of GitHub Actions workflows
     - `admin:org_hook` - Full control of organization webhooks

3. **VS Code 1.101+** (for remote MCP support)
   - Or Claude Desktop, Cursor, Windsurf, or other MCP-compatible clients

### Optional
- Git CLI for local repository operations
- GitHub CLI (`gh`) for additional GitHub operations

## Installation & Setup

### 1. Create GitHub Personal Access Token

Navigate to: **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**

1. Click "Generate new token (classic)"
2. Set token name: `dcyfr-labs-mcp` (or your preference)
3. Select expiration (90 days recommended for security)
4. Grant permissions based on intended use
5. Copy the token (you won't see it again)

### 2. VS Code Configuration

GitHub MCP is configured in two locations:

#### A. Local Configuration (for this workspace)
File: `mcp.json` (project root)

```json
{
  "github": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}"
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "github_token",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ]
}
```

#### B. Global VS Code Configuration
File: `~/Library/Application Support/Code/User/mcp.json`

The GitHub MCP server is configured in this global file with all other project MCPs.

### 3. First-Time Usage

When you first use the GitHub MCP in VS Code:

1. VS Code will prompt you for the GitHub Personal Access Token
2. Enter the PAT you created (it will be stored securely)
3. The MCP server will initialize
4. Available GitHub tools will be loaded

## Configuration & Customization

### Toolsets

The GitHub MCP supports enabling/disabling specific functionality groups via toolsets. You can customize which capabilities are available:

#### Available Toolsets
- **context** - User and GitHub context information (recommended)
- **repos** - Repository management and analysis
- **issues** - GitHub Issues operations
- **pull_requests** - PR management and analysis
- **actions** - GitHub Actions and CI/CD workflows
- **discussions** - GitHub Discussions
- **code_security** - Code scanning and security features
- **dependabot** - Dependabot alerts and management
- **labels** - Label management
- **notifications** - GitHub Notifications
- **orgs** - Organization management
- **projects** - GitHub Projects
- **gists** - Gist management
- **stargazers** - Stargazer information
- **secret_protection** - Secret scanning
- **security_advisories** - Security advisories
- **users** - User information
- **experiments** - Experimental features

#### Default Toolsets (Currently Enabled)
- context
- repos
- issues
- pull_requests
- users

#### To Customize Toolsets

Modify the Docker command in `mcp.json` to include `GITHUB_TOOLSETS`:

```json
{
  "github": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "-e", "GITHUB_TOOLSETS", "ghcr.io/github/github-mcp-server"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}",
      "GITHUB_TOOLSETS": "default,actions,code_security"
    }
  }
}
```

### Read-Only Mode

To run the server in read-only mode (prevent any modifications):

```json
{
  "github": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "-e", "GITHUB_READ_ONLY", "ghcr.io/github/github-mcp-server"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}",
      "GITHUB_READ_ONLY": "1"
    }
  }
}
```

## Usage Examples

Once configured, you can use natural language queries with AI tools to:

### Repository Operations
```
"List all files in the src/ directory of my repository"
"Show recent commits to the main branch"
"Search for files containing 'useState'"
"What's the structure of the project?"
```

### Issue Management
```
"Create an issue for a bug in the rate limiting"
"List all open issues labeled 'bug'"
"Update issue #42 to add a comment explaining the fix"
"Close issues that have been resolved"
```

### Pull Request Automation
```
"Create a PR from preview to main with my recent changes"
"List all open PRs and their review status"
"Add a comment to my PR linking the related issue"
"Merge the PR if all checks pass"
```

### Code Analysis
```
"Find security vulnerabilities in the codebase"
"Show me the latest code scanning results"
"What are the Dependabot alerts?"
"List files with high code complexity"
```

### Workflow Automation
```
"Trigger a GitHub Actions workflow"
"Show status of recent CI/CD builds"
"Retrieve logs from the last failed workflow run"
```

## Security Considerations

### Token Security
- **Never commit tokens** to version control
- **Prompt-based input** - The token is requested when MCP activates
- **Secure storage** - VS Code stores the PAT securely using OS keychain
- **Scope principle** - Grant only the permissions you need

### Best Practices
1. **Use fine-grained tokens** over classic PATs when possible
2. **Set reasonable expiration dates** (30-90 days)
3. **Audit permissions regularly** - Review what capabilities your token has
4. **Rotate tokens** - Create new tokens periodically
5. **Use read-only mode** for sensitive operations when possible
6. **Review toolsets** - Only enable functionality you actually need

### Permission Reference for Token
```
Recommended: repo, read:org, read:discussion, workflow
High privilege: admin:org_hook, admin:repo_hook
Caution: Full repos, admin:org (requires careful consideration)
```

## Troubleshooting

### Docker Connection Issues
**Problem**: "Cannot connect to Docker daemon"
**Solution**: 
- Ensure Docker is running: `open /Applications/Docker.app`
- Wait 30 seconds for Docker to start
- Verify: `docker ps`

### Token Authentication Fails
**Problem**: "401 Unauthorized" or token rejected
**Solution**:
- Verify token has not expired
- Check token has correct permissions
- Regenerate token if necessary
- Confirm token is being entered correctly

### MCP Server Won't Start
**Problem**: Server fails to initialize
**Solution**:
- Check VS Code version: `Code → About Visual Studio Code`
- Update if necessary (v1.101+)
- Verify Docker image is available: `docker pull ghcr.io/github/github-mcp-server`
- Check MCP configuration syntax in JSON files
- Review VS Code output panel for specific error messages

### Toolset Errors
**Problem**: Specific tools not available
**Solution**:
- Verify toolset names in configuration
- Check that `GITHUB_TOOLSETS` is properly formatted (comma-separated)
- Verify token has permissions for requested toolsets
- Ensure environment variables are being passed to Docker

## Administration

### Docker Image Management

**Pull Latest Image**:
```bash
docker pull ghcr.io/github/github-mcp-server
```

**View Available Tags**:
```bash
# Check GitHub releases for version tags
# https://github.com/github/github-mcp-server/releases
```

**List Local Images**:
```bash
docker images | grep github-mcp-server
```

### Monitoring

**View Docker Processes**:
```bash
docker ps | grep github-mcp-server
```

**Clean Up Unused Images**:
```bash
docker image prune -a
```

## Feature Roadmap & Capabilities

### Current Capabilities (v0.18.0+)
✅ Repository browsing and analysis  
✅ Issue management (create, read, update, close)  
✅ Pull request operations  
✅ GitHub Actions integration  
✅ Code scanning results  
✅ Dependabot alerts  
✅ Code security analysis  
✅ User and organization data  
✅ Discussion management  

### Roadmap (Subject to Change)
🔄 Enhanced code analysis features  
🔄 Advanced workflow automation  
🔄 Real-time webhook support  
🔄 GitHub Apps integration  

## Related Documentation

- **GitHub MCP Official Repo**: https://github.com/github/github-mcp-server
- **Installation Guides**: https://github.com/github/github-mcp-server/tree/main/docs/installation-guides
- **API Reference**: https://github.com/github/github-mcp-server/tree/main/docs
- **GitHub PAT Documentation**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

## Integration with Other MCPs

This GitHub MCP works alongside your other active MCPs:
- **Filesystem MCP**: Browse code files and manage local project structure
- **Sequential Thinking MCP**: Plan complex GitHub automation workflows
- **Memory MCP**: Remember GitHub context across conversations
- **Context7 MCP**: Look up documentation while working with GitHub

## Configuration Files Reference

### Files Modified
1. `~/.../Library/Application Support/Code/User/mcp.json` - VS Code global MCP configuration
2. `mcp.json` - Project reference configuration
3. `.github/copilot-instructions.md` - Updated MCP list
4. `agents.md` - Team guide (synced from copilot-instructions)

### Configuration Format
All MCP configurations follow the standardized JSON format supporting:
- Command execution (npx, docker, executable paths)
- Environment variables with secure input
- Conditional arguments and toolsets
- Multi-MCP server management

## Support & Communication

**Issues or Questions?**
- File issues at: https://github.com/github/github-mcp-server/issues
- Check existing discussions: https://github.com/github/github-mcp-server/discussions

**Security Issues?**
- Follow responsible disclosure: https://github.com/github/github-mcp-server/security/policy

---

**Last Updated**: October 18, 2025  
**Maintained By**: dcyfr-labs Team  
**Status**: Production Ready ✅
