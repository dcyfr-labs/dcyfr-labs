# MCP Validation Test Plan

**Date:** 2025-12-04
**Purpose:** Validate whether Memory, Sequential Thinking, and Context7 MCPs are required

---

## MCPs Under Review

### 1. Memory MCP (`@modelcontextprotocol/server-memory`)
**Purpose:** Store and retrieve context across Claude Code sessions
**Status:** Testing required

### 2. Sequential Thinking MCP (`@modelcontextprotocol/server-sequential-thinking`)
**Purpose:** Enable step-by-step reasoning in Claude responses
**Status:** Testing required

### 3. Context7 MCP (`@upstash/context7-mcp`)
**Purpose:** Long-term context storage via Upstash
**Status:** Testing required

---

## Validation Approach

### Quick Test (5 minutes)

1. **Create backup of current config:**
   ```bash
   cp .vscode/mcp.json .vscode/mcp.json.backup
   ```

2. **Test without MCPs:**
   - Disable one MCP at a time
   - Use Claude Code for typical tasks
   - Check for any errors or degraded functionality

3. **Tasks to test:**
   - Ask Claude Code to remember something from earlier in session
   - Request complex multi-step reasoning
   - Check if context persists across sessions

### Expected Outcomes

**If MCPs are NOT needed:**
- ✅ Claude Code functions normally
- ✅ No error messages about missing context
- ✅ Code quality remains the same
- ✅ Vercel MCP provides sufficient context

**If MCPs ARE needed:**
- ❌ Context loss between sessions
- ❌ Degraded reasoning quality
- ❌ Error messages about missing services

---

## My Analysis (Before Testing)

### Memory MCP - Likely REDUNDANT ❌

**Reasoning:**
1. Claude Code has **automatic summarization** for long contexts
2. Vercel MCP already handles deployment context
3. Filesystem MCP handles file state
4. No explicit calls to Memory MCP in codebase

**Verdict:** Remove and test

---

### Sequential Thinking MCP - Likely REDUNDANT ❌

**Reasoning:**
1. Claude Code (Sonnet 4.5) has **native chain-of-thought**
2. Plan mode provides structured thinking
3. No evidence of explicit thinking tool calls
4. Modern models have built-in reasoning

**Test:** Disable and check if code quality drops

**Verdict:** Remove and test

---

### Context7 MCP - REDUNDANT ❌

**Reasoning:**
1. **Direct overlap with Vercel MCP**
2. Vercel MCP provides:
   - Deployment history
   - Environment variables
   - Build logs
   - Project context
3. Both use similar context storage patterns
4. Adds Upstash dependency unnecessarily

**Evidence:**
```json
// Vercel MCP provides context management
"Vercel": {
  "url": "https://mcp.vercel.com",
  "type": "http"
}

// Context7 duplicates this via Upstash
"Context": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"]
}
```

**Verdict:** Remove - Vercel MCP is sufficient

---

## Recommended MCP Configuration

### Keep (Essential)

```json
{
  "servers": {
    "Filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "src/content/blog",
        "public/blog/images",
        "docs",
        "src/data"
      ],
      "type": "stdio"
    },
    "GitHub": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "Vercel": {
      "url": "https://mcp.vercel.com",
      "type": "http"
    },
    "Sentry": {
      "url": "https://mcp.sentry.dev/mcp/dcyfr-labs/dcyfr-labs",
      "type": "http"
    }
  }
}
```

### Remove (Redundant)

- ❌ Memory MCP (Claude has native context)
- ❌ Sequential Thinking MCP (Sonnet 4.5 has native reasoning)
- ❌ Context7 MCP (Vercel MCP provides context)

---

## Testing Instructions

### Step 1: Backup Current Config
```bash
cd /path/to/dcyfr-labs
cp .vscode/mcp.json .vscode/mcp.json.backup
```

### Step 2: Apply Minimal Config
Replace `.vscode/mcp.json` with the recommended configuration above.

### Step 3: Restart Claude Code
Close and reopen VS Code to reload MCP configuration.

### Step 4: Test Typical Workflows

**Test 1 - Context Retention:**
```
Ask Claude: "Remember that I'm working on optimizing API costs"
(later in session)
Ask Claude: "What was I working on earlier?"
```
Expected: Claude should maintain session context naturally

**Test 2 - Complex Reasoning:**
```
Ask Claude: "Analyze the trade-offs between keeping Giscus vs removing it"
```
Expected: Should provide structured, multi-step analysis

**Test 3 - Deployment Context:**
```
Ask Claude: "What's the current Vercel deployment status?"
```
Expected: Vercel MCP should provide this info

**Test 4 - Code Context:**
```
Ask Claude: "What files handle Redis caching?"
```
Expected: Filesystem + Grep should find files

### Step 5: Monitor for Errors

Check for any error messages like:
- "Context not available"
- "Memory service unavailable"
- "Thinking service error"

### Step 6: Validate Quality

Compare code suggestions and analysis quality:
- Before removal (with all MCPs)
- After removal (streamlined config)

---

## Rollback Plan

If issues occur:
```bash
cd /path/to/dcyfr-labs
cp .vscode/mcp.json.backup .vscode/mcp.json
```

Restart VS Code.

---

## Expected Benefits of Streamlined Config

### Performance
- ✅ Faster Claude Code startup (fewer MCP connections)
- ✅ Reduced memory usage
- ✅ Fewer network calls

### Maintenance
- ✅ Simpler configuration
- ✅ Fewer dependencies to update
- ✅ Clearer purpose for each MCP

### Cost
- ✅ No Upstash usage for Context7
- ✅ Reduced npx downloads

---

## Conclusion

Based on architecture analysis:
- **Memory MCP:** Redundant with native Claude capabilities
- **Sequential Thinking MCP:** Redundant with Sonnet 4.5 reasoning
- **Context7 MCP:** Redundant with Vercel MCP

**Recommendation:** Remove all three and test for 24-48 hours.

**Risk Level:** Low (easy rollback, no production impact)

**Next Steps:**
1. Get user approval
2. Apply streamlined config
3. Test for 24 hours
4. Document results
