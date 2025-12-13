# MCP Server Test - Quick Reference

## Run the Test

```bash
npm run test:mcp-servers
```

## Test Results Interpretation

### ✅ Success (100% Pass Rate)
```
Total Tests: 33
✅ Passed: 33
❌ Failed: 0
Success Rate: 100.0%
```
**Your MCP servers are properly configured!**

### ⚠️ Warnings
Some packages couldn't be fully validated, but npm search succeeded.  
**This is normal.** Continue development.

### ❌ Failures
Review the specific test that failed and see troubleshooting below.

---

## What Gets Tested

| Component | Tests | Status |
|-----------|-------|--------|
| `mcp.json` Configuration | 5 | ✅ |
| Memory Server | 3 | ✅ |
| Sequential Thinking | 3 | ✅ |
| Context7 Server | 3 | ✅ |
| Sentry (HTTP) | 2 | ✅ |
| Vercel (HTTP) | 2 | ✅ |
| Filesystem Server | - | 🆕 |
| npm/npx Availability | 2 | ✅ |
| Documentation | 3 | ✅ |
| Project Scripts | 2 | ✅ |
| **Total** | **25+** | **✅** |

---

## Troubleshooting Quick Fixes

### "mcp.json not found"
```bash
# macOS
mkdir -p ~/Library/Application\ Support/Code/User
# Then configure VS Code with MCP servers
```

See: [Troubleshooting](./tests/servers-test#troubleshooting)

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

---

## MCP Servers Validated

1. **Memory** — Project context and decisions
2. **Sequential Thinking** — Problem solving
3. **Context7** — Documentation lookup
4. **Sentry** — Production error monitoring (HTTP MCP)
5. **Vercel** — Deployment management and platform integration (HTTP MCP)
6. **Filesystem** — File and content management 🆕

All ✅ configured and accessible

---

## Documentation

| Link | Purpose |
|------|---------|
| [Setup Guide](./servers) | How to use each server |
| [Test Guide](./tests/servers-test) | Detailed test documentation |
| [Implementation](./tests/servers-test-implementation) | Technical details |
| [Full Reference](./tests/dependency-validation) | Complete reference |

---

## Commands

```bash
# Test
npm run test:mcp-servers

# Dev (with MCP servers available)
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Need Help?

1. **Quick answer**: Run `npm run test:mcp-servers`
2. **Setup issues**: Read [MCP Servers Guide](./servers)
3. **Test details**: Review [MCP Servers Test Guide](./tests/servers-test)
4. **Full reference**: Consult [MCP Dependency Validation](./tests/dependency-validation)

---

✅ **MCP Servers validated as project dependencies**
