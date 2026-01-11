# MCP (Model Context Protocol) Quick Reference

**Comprehensive guide** for using MCP servers with dcyfr-labs.

**Last Updated:** January 5, 2026
**Status:** ✅ All 6 MCPs Active

---

## Table of Contents

1. [Overview](#overview)
2. [Testing & Validation](#testing--validation)
3. [Filesystem & Git MCP](#filesystem--git-mcp)
4. [GitHub MCP](#github-mcp)
5. [Other MCP Servers](#other-mcp-servers)
6. [Workflows & Best Practices](#workflows--best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Active MCP Servers

| Server | Type | Purpose | Status |
|--------|------|---------|--------|
| **Memory** | Native | Project context and decisions | ✅ Active |
| **Sequential Thinking** | Native | Problem solving | ✅ Active |
| **Context7** | Native | Documentation lookup | ✅ Active |
| **Filesystem** | Native | File and content management | ✅ Active |
| **Git** | Native | Version control operations | ✅ Active |
| **GitHub** | HTTP | Repository management & automation | ✅ Active |

### Quick Links

| Resource | Location |
|----------|----------|
| Configuration | `.vscode/mcp.json` |
| Setup Guide | `docs/features/mcp/servers.md` |
| Test Suite | `npm run test:mcp-servers` |
| Full Docs | `docs/features/mcp/` |

---

## Testing & Validation

### Run the Test

```bash
npm run test:mcp-servers
```

### Test Results Interpretation

#### ✅ Success (100% Pass Rate)
```
Total Tests: 33
✅ Passed: 33
❌ Failed: 0
Success Rate: 100.0%
```
**Your MCP servers are properly configured!**

#### ⚠️ Warnings
Some packages couldn't be fully validated, but npm search succeeded.
**This is normal.** Continue development.

#### ❌ Failures
Review the specific test that failed and see troubleshooting section.

### What Gets Tested

| Component | Tests | Status |
|-----------|-------|--------|
| `mcp.json` Configuration | 5 | ✅ |
| Memory Server | 3 | ✅ |
| Sequential Thinking | 3 | ✅ |
| Context7 Server | 3 | ✅ |
| Sentry (HTTP) | 2 | ✅ |
| Vercel (HTTP) | 2 | ✅ |
| Filesystem Server | - | ✅ |
| npm/npx Availability | 2 | ✅ |
| Documentation | 3 | ✅ |
| Project Scripts | 2 | ✅ |
| **Total** | **25+** | **✅** |

---

## Filesystem & Git MCP

### 🚀 Quick Start

#### Filesystem MCP Commands

| Task | Prompt |
|------|--------|
| Browse directory | "What files are in `src/components`?" |
| View file | "Show me `src/lib/rate-limit.ts`" |
| Find files | "Find all TypeScript files in src/app/api" |
| Create file | "Create a new file at `src/data/skills.ts`" |
| Edit file | "Update the description in `src/data/resume.ts`" |
| Delete file | "Remove the old component at `src/components/old-button.tsx`" |
| Move file | "Rename `src/lib/utils.ts` to `src/lib/helpers.ts`" |
| List structure | "Show me the entire src directory structure" |

#### Git MCP Commands

| Task | Prompt |
|------|--------|
| View history | "Show recent commits" |
| See changes | "What changed in the last commit?" |
| Compare branches | "Show diff between main and preview" |
| Branch status | "What branches exist?" |
| File history | "When was `rate-limit.ts` last modified?" |
| Specific commit | "Show me the CSP implementation commit" |
| Who changed | "Who last modified `middleware.ts` and when?" |
| Recent changes | "What's been changed in the last 5 commits?" |

### 🔄 Common Workflows

#### Workflow 1: Understanding Recent Changes
```
You: "What changed recently in security-related files?"
  ↓
Git MCP: Shows recent commits
  ↓
You: "Show me the CSP implementation changes"
  ↓
Git MCP: Shows full diff
Filesystem MCP: Displays current file
```

#### Workflow 2: Adding a New Feature
```
You: "Navigate to the API routes"
  ↓
Filesystem MCP: Shows src/app/api structure
  ↓
You: "Create a new route for analytics"
  ↓
Filesystem MCP: Creates the file
  ↓
You: "Show me the new file"
  ↓
Filesystem MCP: Displays the created file
```

#### Workflow 3: Code Review
```
You: "Show me what's in the preview branch"
  ↓
Git MCP: Lists commits since main
  ↓
You: "What's the diff for the contact form changes?"
  ↓
Git MCP: Shows changes to contact form
Filesystem MCP: Shows current implementation
```

#### Workflow 4: Debugging
```
You: "Find all rate limiting code"
  ↓
Filesystem MCP: Searches and finds files
  ↓
You: "Show me rate-limit.ts"
  ↓
Filesystem MCP: Displays file
  ↓
You: "When was this last changed?"
  ↓
Git MCP: Shows commit history for that file
```

### 💡 Pro Tips

#### Filesystem MCP
- **Combine with Sequential Thinking**: "Find all Button usages and plan a refactoring"
- **Search first**: Always ask to find files before editing
- **Use patterns**: "Find all .tsx files in components/"
- **Verify before delete**: Always review before removing files
- **Keep diffs**: Use Git MCP to track changes

#### Git MCP
- **Check status first**: Always ask "What branch am I on?"
- **Understand context**: Check recent commits before making changes
- **Compare carefully**: Use diff to understand what changed
- **Document changes**: Reference related commits in commit messages
- **Use for learning**: Review commits to understand code evolution

#### Combined Power
- **Filesystem + Git**: "Show me all changes to components since last Thursday"
- **Filesystem + Sequential**: "Find all API routes and document them"
- **Git + Sequential**: "Analyze the commits related to CSP and explain the changes"

### 📊 Project Structure Reference

```
dcyfr-labs/
├── src/
│   ├── app/           ← Page routes
│   ├── components/    ← React components
│   ├── content/       ← MDX blog posts
│   ├── data/          ← Static data
│   └── lib/           ← Utilities
├── docs/              ← Documentation
├── scripts/           ← Build scripts
└── public/            ← Static assets
```

---

## GitHub MCP

### ⚡ Quick Start

#### Configuration

The GitHub MCP is configured as an HTTP server that uses your existing VS Code GitHub authentication:

```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/"
  }
}
```

**No additional token setup required!** The server uses your VS Code GitHub credentials automatically.

#### Activate the Server

1. Reload VS Code window: `Cmd+Shift+P` → "Developer: Reload Window"
2. GitHub MCP tools become available immediately

#### Start Using

```
"Create a new branch for this feature"
"Update the README in the remote repository"
"Fork this repository to my account"
"Get my team members"
"Assign Copilot to issue #123"
```

### 📦 Available Toolsets

Default enabled:
- `context` - User/org context
- `repos` - Repository operations
- `issues` - Issue management
- `pull_requests` - PR operations
- `users` - User information

Add more by modifying Docker env:
```json
"GITHUB_TOOLSETS": "default,actions,code_security"
```

### 🔑 What You Can Do

#### Code Discovery
```
"Find all files that import React"
"Search for TODO comments in the codebase"
"Show the project structure"
```

#### Issue Automation
```
"Create a bug report for the login issue"
"List all high-priority open issues"
"Add a comment to issue #42"
```

#### PR Operations
```
"Create a PR with my changes"
"Show PR reviews and comments"
"Merge PR #15 when ready"
```

#### CI/CD Intelligence
```
"What's the status of the latest workflow run?"
"Show failed tests from the last build"
"Trigger a deployment workflow"
```

### 🔒 Security Checklist

- [ ] Token created with minimal necessary permissions
- [ ] Token has reasonable expiration date
- [ ] Token never committed to git
- [ ] Review what repo/org scopes you're allowing
- [ ] Rotate token every 3-6 months

### 💡 Pro Tips

1. **Use read-only mode** for sensitive/production repos
2. **Limit toolsets** to what you actually need (faster, cleaner)
3. **Rotate tokens regularly** for security
4. **Combine with Filesystem MCP** for powerful code analysis
5. **Check GitHub Actions logs** when diagnosing CI failures

---

## Other MCP Servers

### Memory MCP
**Purpose:** Project context and decisions
**Use Cases:**
- Remember previous conversations
- Track project decisions
- Maintain context across sessions

**Example:**
```
"Remember that we decided to use Redis for rate limiting"
"What did we discuss about CSP implementation?"
```

### Sequential Thinking MCP
**Purpose:** Complex problem solving
**Use Cases:**
- Plan multi-step solutions
- Analyze architectural decisions
- Break down complex tasks

**Example:**
```
"Plan the implementation of a new authentication system"
"Analyze the best approach for migrating to Tailwind v4"
```

### Context7 MCP
**Purpose:** Documentation lookup
**Use Cases:**
- Query library documentation
- Find API references
- Understand framework patterns

**Example:**
```
"How do I use Next.js Server Actions?"
"Show me React 19 use() hook documentation"
```

---

## Workflows & Best Practices

### 🎯 Use Case Examples

#### Content Updates
**Question**: "What markdown files exist in content/blog?"
**Workflow**: Filesystem MCP → Browse structure → Edit file → Git MCP → Review changes

#### Code Improvements
**Question**: "Show me all TypeScript errors from the last commit"
**Workflow**: Git MCP → Show commit → Filesystem MCP → View affected files → Sequential Thinking → Plan fixes

#### Feature Development
**Question**: "I want to add a new page. What's the pattern in src/app?"
**Workflow**: Filesystem MCP → Show structure → View example page → Create new page → Git MCP → Verify

#### Security Review
**Question**: "What security changes were made recently?"
**Workflow**: Git MCP → Show commits with "security" in message → Filesystem MCP → View implementation → Sequential Thinking → Analyze

### 🔒 Security Reminders

✅ **Safe to use**:
- All MCPs work locally (except GitHub HTTP)
- No credentials exposed (except configured tokens)
- No unnecessary external API calls
- All tracked by git

❌ **Avoid**:
- Don't try to access files outside the project
- Don't commit sensitive data
- Don't use git/filesystem to handle secrets
- Use environment variables instead

### 🚦 Next Steps

1. **Try basic commands**:
   - Filesystem: "What's in src/components?"
   - Git: "Show recent commits"
   - GitHub: "List open issues"

2. **Combine MCPs**:
   - "Find all blog posts and when they were modified"
   - "Show me all changes to the rate limiting since Tuesday"
   - "Create an issue for the bug we just found"

3. **Use in workflows**:
   - Next feature development
   - Code reviews
   - Debugging issues

4. **Advanced usage**:
   - Automation scripts
   - Bulk refactoring
   - Release planning

---

## Troubleshooting

### "mcp.json not found"
```bash
# macOS
mkdir -p ~/Library/Application\ Support/Code/User
# Then configure VS Code with MCP servers
```

See: `docs/features/mcp/servers.md`

### "npm/npx not available"
```bash
# Verify installation
npm --version
npx --version

# Install Node.js if needed: https://nodejs.org/
```

### "Package not accessible"
```bash
# Clean cache and retry
npm cache clean --force
npm run test:mcp-servers
```

### Filesystem MCP Not Working
```bash
# Check if directory is correct
ls /project-folder  # replace with your project path

# Verify in mcp.json
cat ~/.vscode/mcp.json | grep filesystem
```

### Git MCP Not Working
```bash
# Check if we're in a git repo
cd /project-folder  # replace with your project path
git status

# Verify git is installed
which git
git --version
```

### GitHub MCP Issues

| Issue | Fix |
|-------|-----|
| "Cannot connect to Docker" | Start Docker app and wait 30s |
| "Token rejected" | Verify token has correct permissions |
| "MCP won't start" | Update VS Code to 1.101+ |
| "Specific tool unavailable" | Check toolset is enabled in config |

### Still Having Issues?
- Restart VS Code
- Check the full integration guide
- Review console for error messages
- Run `npm run test:mcp-servers` for diagnostics

---

## Commands Reference

```bash
# Test all MCP servers
npm run test:mcp-servers

# Dev (with MCP servers available)
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## 📚 Full Documentation

| Link | Purpose |
|------|---------|
| [Setup Guide](./servers) | How to use each server |
| [Test Guide](./tests/servers-test) | Detailed test documentation |
| [Implementation](./tests/servers-test-implementation) | Technical details |
| [Full Reference](./tests/dependency-validation) | Complete reference |
| [Filesystem/Git Guide](./filesystem-git/integration.md) | Filesystem & Git integration |
| [GitHub Guide](./github/implementation.md) | GitHub MCP setup (30min) |

---

## Need Help?

1. **Quick answer**: Run `npm run test:mcp-servers`
2. **Setup issues**: Read [MCP Servers Guide](./servers)
3. **Test details**: Review [MCP Servers Test Guide](./tests/servers-test)
4. **Full reference**: Consult [MCP Dependency Validation](./tests/dependency-validation)

---

**Ready to go!** All 6 MCP servers validated and active. 🚀

**Consolidates:** 3 MCP quick-reference files into single comprehensive guide
