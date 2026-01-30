<!-- TLP:CLEAR -->

# MCP Configuration Guide

## Overview

This project uses Model Context Protocol (MCP) servers to enhance AI-assisted development. MCP configuration is stored in `.vscode/mcp.json`.

## Quick Reference

### Active MCP Servers

| Server | Type | Purpose |
|--------|------|---------|
| Memory | stdio | Project context persistence |
| Sequential Thinking | stdio | Multi-step reasoning |
| Context7 | stdio | Library documentation lookup |
| GitHub | http | Repository operations |
| Vercel | http | Deployment management |
| Sentry | http | Error monitoring |
| Filesystem | stdio | Local file access |

## Configuration

### File Location

- **Active config**: `.vscode/mcp.json` (gitignored, contains secrets)
- **Template**: `.vscode/mcp.json.template` (committed, safe to share)

### Setup Steps

1. **Copy the template**:
   ```bash
   cp .vscode/mcp.json.template .vscode/mcp.json
   ```

2. **Add your API keys**:
   ```json
   {
     "servers": {
       "Sentry": {
         "url": "https://mcp.sentry.dev/mcp/YOUR_ORG/YOUR_PROJECT"
       }
     }
   }
   ```

3. **Restart VS Code** to load the new configuration

## Environment Variables

### Why Not Use .env.local?

MCP servers run in the VS Code/Copilot environment, **not in your Next.js app**. This means:

- ❌ `.env.local` files are NOT automatically loaded
- ❌ `${VARIABLE}` syntax only works if the variable is in the shell environment
- ✅ Set values directly in `mcp.json` for local development
- ✅ Keep `mcp.json` gitignored to protect secrets

### Alternative: Shell Environment

If you want to use environment variables instead of hardcoded values:

1. **Add to your shell config** (`~/.zshrc` or `~/.bashrc`)

2. **Reload your shell**:
   ```bash
   source ~/.zshrc
   ```

3. **Restart VS Code completely** (quit and relaunch, not just reload window)

4. **Use variable syntax in mcp.json**

**Note**: This only works if VS Code inherits the shell environment, which may not happen if launched from Finder or Dock.

## Troubleshooting

### Authentication Errors

**Symptom**: `SUBSCRIPTION_TOKEN_INVALID` or authentication failures

**Solution**:
1. Verify the API key is correct in `mcp.json`
2. Don't use `${VARIABLE}` syntax unless the variable is in VS Code's environment
3. Restart VS Code after changing `mcp.json`

### Rate Limits

**Symptom**: `Rate limit exceeded` errors

**Solutions**:
- **GitHub**: Add `GITHUB_TOKEN` to increase from 60 to 5,000 req/hour
- **Sentry**: Check your organization's plan limits

### MCP Server Not Found

**Symptom**: `npx` commands failing to find packages

**Solution**:
```bash
# Clear npx cache
npm cache clean --force

# Test the server directly
npx -y @modelcontextprotocol/server-memory
```

### Filesystem Access Denied

**Symptom**: MCP can't read certain files

**Solution**: Check the allowed directories in `mcp.json`:
```json
{
  "Filesystem": {
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/full/path/to/allowed/directory"
    ]
  }
}
```

## Security Best Practices

### ✅ DO

- Keep `mcp.json` in `.gitignore`
- Use the template file for documentation
- Rotate API keys regularly
- Grant minimal necessary permissions
- Audit MCP server sources before installing

### ❌ DON'T

- Commit `mcp.json` with secrets to git
- Share API keys in screenshots or logs
- Use production credentials in development
- Install untrusted MCP servers
- Disable security features for convenience

## API Keys Reference

### Where to Get Keys

| Service | URL | Notes |
|---------|-----|-------|
| GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) | Personal access token |
| Sentry | Project settings → Auth Tokens | Organization-level token |
| Vercel | Automatically configured via Copilot | No manual setup needed |

### Key Permissions

- **GitHub**: `repo`, `read:org` (read-only recommended)
- **Sentry**: `project:read`, `org:read`

## Testing MCP Configuration

### Verify Server Status

Use GitHub Copilot Chat in VS Code:

```
@workspace /tests Which MCP servers are currently active?
```

### Test Specific Servers

```
Use the Memory MCP to store a test entity
Use Context7 to lookup Next.js documentation
```

### Check Logs

MCP server logs appear in:
- **VS Code**: Output panel → "GitHub Copilot Chat MCP"
- **Terminal**: Run servers manually for debugging

```bash
npx -y @modelcontextprotocol/server-memory
```

## Updating MCP Servers

### Update All Servers

MCP servers are run via `npx -y`, which uses the latest version automatically. To force updates:

```bash
npm cache clean --force
```

### Pin Specific Versions

To use a specific version instead of `@latest`:

```json
{
  "args": [
    "-y",
    "@modelcontextprotocol/server-memory@1.0.0"
  ]
}
```

## Related Documentation

- Inngest Integration - Background job processing
- Environment Variables - Environment setup guide
- API Routes - API architecture overview
