# MCP Servers Configuration & Usage Guide

## Overview

This project uses **Model Context Protocol (MCP)** servers in VS Code to enhance AI-assisted development with secure, local integrations and intelligent tools.

## Active MCP Servers

### 1. **Memory** (`@modelcontextprotocol/server-memory`)

**Purpose**: Maintains project context, decisions, and patterns across conversations

**Use Cases**:
- Track project decisions and architectural patterns
- Build context about code conventions and project-specific idioms
- Maintain continuity across multiple development sessions
- Reference previously learned project quirks and best practices

**How to Use**:
- Store decisions: "Remember: We prefer Tailwind utilities over CSS classes"
- Reference context: "What was our decision on error handling?"
- Track patterns: "Add this to project patterns: Always use `cn()` for class merging"

**Benefits**:
- ✅ No need to repeat context in every conversation
- ✅ Consistent patterns across the project
- ✅ Faster development with learned conventions
- ✅ Better continuity when switching between tasks

---

### 2. **Sequential Thinking** (`@modelcontextprotocol/server-sequential-thinking`)

**Purpose**: Complex problem-solving, planning, and multi-step task breakdown

**Use Cases**:
- Plan architectural decisions and design patterns
- Debug complex issues with structured reasoning
- Break down large refactoring tasks into steps
- Verify logic before implementation

**How to Use**:
- "Debug this race condition in the rate limiter"
- "Plan the migration from in-memory cache to Upstash Redis"
- "Help me design the CSP implementation strategy"
- "Break down the API integration into steps"

**Benefits**:
- ✅ Transparent reasoning process (see all thinking steps)
- ✅ Catches edge cases and potential issues early
- ✅ Produces well-structured plans
- ✅ Reduces bugs by thinking through problems systematically

---

### 3. **Context7** (`@upstash/context7-mcp@latest`)

**Purpose**: Documentation and knowledge base lookup for libraries and frameworks

**Use Cases**:
- Fetch up-to-date documentation for Next.js, React, Tailwind CSS, and shadcn/ui
- Get code examples and API references without leaving the editor
- Verify library APIs before making assumptions in implementations

**How to Use**:
- Ask about library-specific features: "How do I implement streaming in Next.js?"
- Request documentation: "Show me the latest shadcn/ui Button component API"
- Get code examples: "What's the pattern for using React hooks in Server Components?"

**Benefits**:
- ✅ Always up-to-date documentation
- ✅ No external web calls required
- ✅ Faster than searching manually
- ✅ Integrated directly into the coding workflow

---

### 4. **GitHub** (HTTP MCP)

**Purpose**: GitHub repository management and operations directly from VS Code

**Use Cases**:
- Repository management (create, fork, branches)
- File operations (create, update, delete files in remote repos)
- Issue tracking and management (with activation)
- Pull request creation and review (with activation)
- Code search across repositories (with activation)
- Team and label management
- Assign Copilot to issues for automated fixes

**How to Use**:
- "Create a new branch for this feature"
- "Update the README in the remote repository"
- "Fork this repository to my account"
- "Get my team members"
- "Assign Copilot to issue #123"

**Benefits**:
- ✅ Seamless GitHub operations without leaving the editor
- ✅ Direct file manipulation in remote repositories
- ✅ Integrated authentication using VS Code credentials
- ✅ On-demand tool activation for extended capabilities
- ✅ Automated issue resolution via Copilot assignment

**Tool Categories** (activated on-demand):
- **Issue Management**: Create, read, update issues, add comments, manage labels
- **Pull Request Management**: Create, update, merge PRs, add review comments
- **File Management**: Get file contents, push multiple files, list branches/commits
- **Search Tools**: Search code, issues, PRs, repositories, and users

---

### 5. **Sentry** (HTTP MCP)

**Purpose**: Production error monitoring and issue management

**Use Cases**:
- Monitor production errors in real-time
- Access detailed error traces and stack traces
- Track error frequency and user impact
- Manage issue status and assignment

**How to Use**:
- "Show me recent errors in production"
- "Get details for error [error-id]"
- "What's the impact of issue X?"
- "Mark issue Y as resolved"

**Benefits**:
- ✅ Real-time production visibility
- ✅ Detailed error context and traces
- ✅ Direct integration with issue tracking
- ✅ Faster incident response

---

### 6. **Vercel** (HTTP MCP)

**Purpose**: Deployment management and platform integration

**Use Cases**:
- Check deployment status and logs
- Manage projects and environments
- Access build and runtime information
- Monitor deployment performance
- Configure domains and environment variables

**How to Use**:
- "Show me recent deployments"
- "Get logs for deployment [id]"
- "What's the status of the production deployment?"
- "List all projects in my Vercel account"

**Benefits**:
- ✅ Direct deployment visibility from the editor
- ✅ Quick access to logs and build information
- ✅ Seamless platform integration
- ✅ Faster debugging of deployment issues

---

### 7. **Filesystem** (Official MCP) 🆕

**Purpose**: Secure file system operations for content management

**Use Cases**:
- Manage MDX blog posts (create, update, organize)
- Bulk operations on content files
- Template-based post creation
- Content organization and migration
- Documentation maintenance
- Asset management

**How to Use**:
- "List all MDX files in the blog directory"
- "Create a new blog post from template"
- "Find all posts with tag 'react'"
- "Update frontmatter for all draft posts"

**Benefits**:
- ✅ Automated content management
- ✅ Sandboxed access to specific directories only
- ✅ Bulk operations save time
- ✅ Template-based workflows

**Documentation**: [Filesystem MCP Implementation Guide](./implementation-plans/filesystem-mcp.md)

---

### 8. **Fetch** (Official MCP) 🆕

**Purpose**: HTTP requests for link validation and API testing

**Use Cases**:
- Validate external links in blog posts
- Test API endpoints
- Check RSS feed validity
- Verify deployment status
- Research public web content

**How to Use**:
- "Fetch https://example.com and show the title"
- "Validate all external links in this post"
- "Check if my RSS feed is working"
- "Test the GitHub API endpoint"

**Benefits**:
- ✅ Automated link checking
- ✅ API validation during development
- ✅ RSS feed testing
- ✅ No external dependencies

**Documentation**: [Fetch MCP Implementation Guide](./implementation-plans/fetch-mcp.md)

---

## Additional Tools

### Snyk Extension
**Purpose**: Security scanning and vulnerability analysis

**Features**:
- Scan for vulnerabilities in dependencies (SCA)
- Static Application Security Testing (SAST)
- Container image security scanning
- Infrastructure as Code (IaC) security analysis

### GitHub Pull Requests Extension
**Purpose**: PR management and review directly in VS Code

**Features**:
- Create, view, and manage pull requests
- Review code changes
- Add comments and suggestions
- Merge PRs without switching to the browser

---

## Configuration

### File Location
```
~/.config/Code/User/mcp.json  (Linux/macOS)
%APPDATA%\Code\User\mcp.json  (Windows)
```

### Current Configuration

```json
{
  "servers": {
    "Memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "type": "stdio",
      "disabled": false
    },
    "Thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "type": "stdio",
      "disabled": false
    },
    "Context": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "type": "stdio",
      "disabled": false
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "Sentry": {
      "url": "https://mcp.sentry.dev/mcp/dcyfr-labs-gj/dcyfr-labs",
      "type": "http",
      "disabled": false
    },
    "Vercel": {
      "url": "https://mcp.vercel.com",
      "type": "http"
    }
  }
}
```

---

## Security & Best Practices

### ✅ Do's
- ✅ Use MCP servers for documentation lookups instead of external web calls
- ✅ Use Memory to track project context and decisions
- ✅ Use Sequential Thinking for complex architectural decisions
- ✅ Keep secrets in environment variables and `.env.local`
- ✅ Use server routes (`src/app/api/*`) for third-party API calls

### ❌ Don'ts
- ❌ Never print tokens or API keys
- ❌ Don't exfiltrate secrets outside MCP boundaries
- ❌ Don't assume library APIs without checking Context7
- ❌ Don't make direct network calls when an MCP server can help

---

## When to Use Each MCP Server

| Task | Server | Why |
|------|--------|-----|
| "What's our pattern for X?" | Memory | Reference project conventions |
| "Debug this complex issue" | Sequential Thinking | Think through problems systematically |
| "How do I use X in Next.js?" | Context7 | Get authoritative, up-to-date docs |
| "Create a new branch" | GitHub | Repository and file management |
| "Update remote file" | GitHub | Direct file operations on GitHub |
| "Assign Copilot to issue" | GitHub | Automated issue resolution |
| "Show me production errors" | Sentry | Monitor and debug production issues |
| "Check deployment status" | Vercel | View deployments and logs |
| "Add security feature Y" | Snyk Extension | Scan and research best practices |
| "Manage/review a PR" | GitHub PRs Extension | Integrated PR workflow |

---

## Troubleshooting

### MCP Server Not Responding
1. Check that the server is configured in `mcp.json`
2. Ensure `npx` is available in your PATH
3. Restart VS Code
4. Check the MCP extension logs

### Memory Not Persisting

- Check VS Code MCP extension logs
- Ensure the Memory server is enabled in `mcp.json`
- Restart VS Code to reinitialize the server
- Verify `npx` can access the package

### Context7 Documentation Outdated
- Context7 pulls from up-to-date sources
- If results seem outdated, describe your issue more specifically
- The tool will fetch the most current available documentation

---

## Integration with Project Workflow

### Development
1. Start dev server: `npm run dev`
2. Use **Context7** for API lookups
3. Use **Sequential Thinking** for architectural decisions
4. Use **Memory** to maintain project context

### Testing
1. Write tests locally
2. Use **Snyk** for security analysis
3. Use **Sequential Thinking** to plan test cases

### Code Review
1. Use **GitHub Pull Requests** to manage PRs
2. Use **Snyk** to scan for vulnerabilities
3. Use **Sequential Thinking** to review complex logic

### Deployment
1. Build: `npm run build`
2. Scan with **Snyk** before merging
3. Use **Sequential Thinking** to plan deployment steps

---

## Reference Files

Key project files that benefit from MCP server support:
- `.github/copilot-instructions.md` — Main contributor guide
- `agents.md` — Auto-synced agent instructions
- `src/app/layout.tsx` — Theme provider, SEO setup
- `src/app/api/*` — API routes (server-side operations)
- `src/lib/rate-limit.ts` — Rate limiting logic
- `src/components/*` — UI components

---

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Context7 Documentation](https://context7.upstash.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
