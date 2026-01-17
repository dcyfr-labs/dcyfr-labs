# OpenCode vs VS Code/Claude Configuration Gap Analysis

**Generated:** January 17, 2026  
**Purpose:** Identify missing MCPs, skills, and configurations in OpenCode compared to VS Code and Claude

---

## 🔍 MCP Server Comparison

### VS Code MCPs (.vscode/mcp.json): 17 servers
### OpenCode MCPs (opencode.json): 12 servers

### ❌ Missing MCPs in OpenCode

| MCP Server | VS Code Config | OpenCode Status | Reason |
|------------|----------------|-----------------|--------|
| **DeepGraph Next.js** | ✅ Configured | ❌ **MISSING** | Code analysis tool |
| **DeepGraph TypeScript** | ✅ Configured | ❌ **MISSING** | Code analysis tool |
| **Playwright** | ✅ Configured | ❌ **MISSING** | Testing tool |
| **Chrome DevTools** | ✅ Configured | ❌ **MISSING** | Testing/debugging tool |
| **arXiv** | ✅ Configured | ❌ **MISSING** | Research papers |

### ⚠️ Configuration Differences

| MCP Server | VS Code | OpenCode | Issue |
|------------|---------|----------|-------|
| **Perplexity** | Uses `envFile: ${workspaceFolder}/.env.local` | Uses `environment: {PERPLEXITY_API_KEY}` | ✅ Equivalent (different syntax) |
| **DCYFR Analytics** | Uses `cwd` + `envFile` | Uses `environment` only | ⚠️ Missing `cwd` parameter |
| **DCYFR DesignTokens** | Uses `cwd` | Missing `cwd` | ⚠️ May fail if not in project root |
| **DCYFR ContentManager** | Uses `cwd` | Missing `cwd` | ⚠️ May fail if not in project root |

---

## 📚 Skills Comparison

### Claude Agent Documentation (.github/agents/): 12 files
### OpenCode Skills (.opencode/skill/): 3 skills

### ❌ Missing Skills in OpenCode

| Claude Documentation | OpenCode Skill | Status |
|---------------------|----------------|--------|
| **API_PATTERNS.md** | ❌ Missing | Should create `dcyfr-api-patterns` skill |
| **TESTING_PATTERNS.md** | ❌ Missing | Should create `dcyfr-testing` skill |
| **CODEQL_SUPPRESSIONS.md** | ❌ Missing | Should create `dcyfr-security` skill |
| **SECURITY_VULNERABILITY_TROUBLESHOOTING.md** | ❌ Missing | Should add to `dcyfr-security` skill |
| **TEST_DATA_PREVENTION.md** | ❌ Missing | Already covered in `dcyfr-quick-fix` ✅ |
| **VALIDATION_CHECKLIST.md** | ❌ Missing | Should create `dcyfr-validation` skill |
| **APPROVAL_GATES.md** | ❌ Missing | Should add to `dcyfr-validation` skill |
| **CONTINUOUS_LEARNING.md** | ❌ Missing | N/A (internal to agents, not user-facing) |
| **KNOWLEDGE_BASE.md** | ❌ Missing | N/A (internal to agents, not user-facing) |
| **PERFORMANCE_METRICS.md** | ❌ Missing | N/A (internal to agents, not user-facing) |

**Recommendation:** Create 4 additional skills:
1. `dcyfr-api-patterns` - API routes, Inngest integration
2. `dcyfr-testing` - Test patterns, coverage, E2E
3. `dcyfr-security` - CodeQL, vulnerability troubleshooting
4. `dcyfr-validation` - Pre-completion checklists, approval gates

---

## 🔧 Configuration Issues to Fix

### 1. Missing `cwd` Parameter for DCYFR MCPs

**Issue:** DCYFR custom MCPs (`mcp:analytics`, `mcp:tokens`, `mcp:content`) may fail if OpenCode is not launched from project root.

**Fix:**

```json
{
  "mcp": {
    "dcyfr_analytics": {
      "type": "local",
      "command": ["npm", "run", "mcp:analytics"],
      "cwd": "${workspaceFolder}",  // ADD THIS
      "environment": {
        "UPSTASH_REDIS_REST_URL": "{env:UPSTASH_REDIS_REST_URL}",
        "UPSTASH_REDIS_REST_TOKEN": "{env:UPSTASH_REDIS_REST_TOKEN}"
      },
      "enabled": true,
      "timeout": 5000
    }
  }
}
```

### 2. Missing Code Analysis MCPs

**Issue:** DeepGraph MCPs provide code graph analysis for Next.js and TypeScript repos.

**Fix:**

```json
{
  "mcp": {
    "deepgraph_nextjs": {
      "type": "local",
      "command": ["npx", "-y", "mcp-code-graph@latest", "vercel/next.js"],
      "enabled": false,  // Disabled by default (adds context)
      "timeout": 10000
    },
    "deepgraph_typescript": {
      "type": "local",
      "command": ["npx", "-y", "mcp-code-graph@latest", "microsoft/TypeScript"],
      "enabled": false,  // Disabled by default (adds context)
      "timeout": 10000
    }
  }
}
```

### 3. Missing Testing MCPs

**Issue:** Playwright and Chrome DevTools MCPs are useful for E2E testing workflows.

**Fix:**

```json
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@executeautomation/playwright-mcp-server"],
      "enabled": false,  // Disabled by default (optional)
      "timeout": 5000
    },
    "chrome_devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest"],
      "enabled": false,  // Disabled by default (optional)
      "timeout": 5000
    }
  }
}
```

### 4. Missing arXiv MCP

**Issue:** arXiv MCP provides access to research papers (requires Python/uvx).

**Fix:**

```json
{
  "mcp": {
    "arxiv": {
      "type": "local",
      "command": ["uvx", "arxiv-mcp-server"],
      "enabled": false,  // Disabled by default (requires uvx/Python)
      "timeout": 5000
    }
  }
}
```

---

## 📊 Summary Statistics

### MCP Coverage

| Category | VS Code | OpenCode | Coverage |
|----------|---------|----------|----------|
| **Total MCPs** | 17 | 12 | 71% |
| **Core MCPs** | 14 | 12 | 86% |
| **Optional MCPs** | 3 | 0 | 0% |

**Missing:** 5 MCPs (DeepGraph Next.js, DeepGraph TypeScript, Playwright, Chrome DevTools, arXiv)

### Skills Coverage

| Category | Claude Docs | OpenCode Skills | Coverage |
|----------|-------------|-----------------|----------|
| **Total Documentation** | 12 files | 3 skills | 25% |
| **User-Facing Patterns** | 8 files | 3 skills | 38% |
| **Internal Docs** | 4 files | N/A | N/A |

**Missing:** 5 recommended skills (API patterns, testing, security, validation, advanced patterns)

---

## ✅ Recommended Actions

### Priority 1: Fix Critical Issues

1. **Add `cwd` parameter to DCYFR MCPs** ⚠️ HIGH PRIORITY
   - Prevents failures when OpenCode launched from subdirectories
   - Affects: dcyfr_analytics, dcyfr_tokens, dcyfr_content

### Priority 2: Add Missing MCPs

2. **Add DeepGraph MCPs** (Optional, disabled by default)
   - Useful for deep code analysis
   - Large context addition (disable by default)

3. **Add Testing MCPs** (Optional, disabled by default)
   - Playwright, Chrome DevTools
   - Useful for E2E testing workflows

4. **Add arXiv MCP** (Optional, disabled by default)
   - Requires Python/uvx (may not be installed)
   - Research papers access

### Priority 3: Create Missing Skills

5. **Create 4 additional skills:**
   - `dcyfr-api-patterns` - API route patterns
   - `dcyfr-testing` - Testing patterns and coverage
   - `dcyfr-security` - CodeQL and security
   - `dcyfr-validation` - Pre-completion validation

---

## 🎯 Implementation Plan

### Step 1: Fix Critical Issues (5 min)
- Update `opencode.json` with `cwd` for DCYFR MCPs

### Step 2: Add Missing MCPs (10 min)
- Add 5 missing MCPs (all disabled by default to avoid context bloat)
- Update tool permissions

### Step 3: Create Missing Skills (60 min)
- Create 4 new skill directories
- Write SKILL.md files with frontmatter
- Extract content from `.github/agents/` documentation

### Step 4: Validate (5 min)
- Run `.opencode/scripts/validate-opencode-config.sh`
- Test MCP connections
- Test skill loading

---

## 📋 Validation Checklist

After fixes:

- [ ] All 17 MCPs from VS Code migrated to OpenCode
- [ ] DCYFR MCPs have `cwd` parameter
- [ ] Optional MCPs disabled by default (DeepGraph, Playwright, Chrome DevTools, arXiv)
- [ ] 7 skills created (3 existing + 4 new)
- [ ] Tool permissions updated for new MCPs
- [ ] Validation script passes

---

**Status:** Gap analysis complete  
**Next Step:** Implement fixes (Priority 1 → Priority 3)
