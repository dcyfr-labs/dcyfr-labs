<!-- TLP:CLEAR -->

# Phase 2: Global Configuration & Permissions Enhancement

**Status:** Implementation Guide
**Duration:** 2-3 hours (can be done incrementally)
**Complexity:** Medium
**Team Impact:** Enable global defaults + project overrides

---

## 🎯 Phase 2 Objectives

✅ Implement team-wide global configuration
✅ Fine-grained permission controls per agent
✅ Enhanced MCP server authentication
✅ Unified configuration hierarchy
✅ 90/100 compliance score

---

## 📋 Phase 2 Tasks (Complete in Order)

### Task 1: Create Global Configuration (30 minutes)

**Location:** `~/.config/opencode/opencode.jsonc`

**Purpose:** Team-wide defaults for all developers

**Steps:**

1. Create directory structure:

```bash
mkdir -p ~/.config/opencode
```

2. Copy template and customize:

```bash
cp docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc ~/.config/opencode/opencode.jsonc
```

3. Edit `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  // ============================================
  // TEAM GLOBAL CONFIGURATION
  // ============================================
  // This applies to ALL projects using OpenCode.ai
  // Project-specific settings in opencode.jsonc override these

  // Team's preferred models
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",

  // Global instruction files (applies to all projects)
  "instructions": ["~/.config/opencode/global-instructions.md"],

  // Theme preferences
  "theme": "dark",

  // TUI customization
  "tui": {
    "scrollAcceleration": 3,
    "scrollDelay": 50,
  },

  // Global MCP servers (used by all projects)
  "mcp": {
    "memory": {
      "type": "local",
      "command": ["npx", "@modelcontextprotocol/server-memory"],
      "enabled": true,
      "autoRestart": true,
    },
  },

  // Default agent
  "agent": "default",

  // Logging
  "logging": {
    "level": "info",
    "file": "~/.opencode/logs/opencode.log",
  },
}
```

4. Verify configuration:

```bash
# Test config is valid
opencode --config ~/.config/opencode/opencode.jsonc --validate-config

# Should output: ✓ Config is valid
```

**Success Criteria:**

- [ ] Directory `~/.config/opencode/` exists
- [ ] `opencode.jsonc` exists in directory
- [ ] `opencode --validate-config` passes
- [ ] All team members have global config

---

### Task 2: Implement Fine-Grained Permissions (45 minutes)

**Purpose:** Control which agents can use which tools

**Location:** `opencode.jsonc` (root project config)

**New Section:** Add permissions matrix

**Steps:**

1. Read current `opencode.jsonc`:

```bash
head -150 opencode.jsonc
```

2. Add permissions section after MCP configuration:

```jsonc
{
  // ... existing config ...

  // ============================================
  // FINE-GRAINED PERMISSIONS
  // ============================================

  "permissions": {
    // Agent: default (full access - trusted)
    "default": {
      "mcp": {
        "memory": true,
        "filesystem": ["read", "write"],
        "github": ["read"],
      },
      "models": ["anthropic/claude-sonnet-4-5", "anthropic/claude-haiku-4-5"],
      "instructions": true,
      "maxTokens": 200000,
      "timeout": 600000,
    },

    // Agent: dcyfr-quick (restricted - quick fixes only)
    "dcyfr-quick": {
      "mcp": {
        "memory": true,
        "filesystem": ["read", "write"],
        "github": ["read"],
      },
      "models": ["anthropic/claude-haiku-4-5"],
      "instructions": [".opencode/DCYFR.opencode.md"],
      "maxTokens": 50000,
      "timeout": 300000,
    },

    // Agent: dcyfr-feature (full featured)
    "dcyfr-feature": {
      "mcp": {
        "memory": true,
        "filesystem": ["read", "write"],
        "github": ["read", "write"],
        "octocode": ["read"],
      },
      "models": ["anthropic/claude-sonnet-4-5"],
      "instructions": true,
      "maxTokens": 200000,
      "timeout": 600000,
    },

    // Agent: dcyfr-content (content creation - restricted tools)
    "dcyfr-content": {
      "mcp": {
        "memory": true,
        "filesystem": ["read", "write"],
      },
      "models": ["anthropic/claude-sonnet-4-5"],
      "instructions": [".opencode/DCYFR.opencode.md", "docs/ai/dcyfr-mdx-authoring/SKILL.md"],
      "maxTokens": 100000,
      "timeout": 600000,
    },

    // Agent: dcyfr-analytics (data analysis - restricted)
    "dcyfr-analytics": {
      "mcp": {
        "memory": true,
        "filesystem": ["read"],
      },
      "models": ["anthropic/claude-sonnet-4-5"],
      "instructions": [".opencode/DCYFR.opencode.md"],
      "maxTokens": 150000,
      "timeout": 600000,
    },
  },

  // ============================================
  // PERMISSION RULES
  // ============================================

  "permissionRules": {
    // Enforce minimum token window
    "minTokenWindow": 30000,

    // Token exhaustion behavior
    "onTokenExhaustion": "warn",

    // Timeout behavior
    "onTimeout": "fail",

    // MCP access logging
    "logMcpAccess": true,

    // Require approval for file modifications
    "requireApprovalForFileWrite": false,
  },
}
```

3. Update each agent definition to reference permissions:

```jsonc
{
  "agents": [
    {
      "name": "dcyfr-quick",
      "model": "{env:OPENCODE_MODEL:anthropic/claude-haiku-4-5}",
      "description": "Quick fixes and token-efficient improvements",
      "instructions": [".opencode/DCYFR.opencode.md"],
      "permissions": "dcyfr-quick", // Reference permissions block
      "autoRestart": true,
    },
    // ... other agents ...
  ],
}
```

4. Test permissions:

```bash
# Validate config
opencode --config opencode.jsonc --validate-config

# Check permissions are loaded
opencode --agent dcyfr-quick --info
```

**Success Criteria:**

- [ ] Permissions section added to opencode.jsonc
- [ ] All 5 agents have permission definitions
- [ ] Token limits properly configured
- [ ] MCP access logging enabled
- [ ] `opencode --validate-config` passes

---

### Task 3: Enhanced MCP Authentication (30 minutes)

**Purpose:** Secure MCP server connections with proper auth

**Location:** `opencode.jsonc` (MCP section)

**Current State:** Basic MCP configuration
**Enhanced State:** Auth tokens, headers, certificates

**Steps:**

1. Add auth configuration for remote MCP servers:

```jsonc
{
  "mcp": {
    // ... existing servers ...

    // Remote GitHub API server with auth
    "github": {
      "type": "remote",
      "url": "http://localhost:3001",
      "enabled": true,
      "timeout": 10000,
      "autoRestart": false, // Remote server, don't auto-restart

      // Authentication configuration
      "auth": {
        "type": "bearer",
        "token": "{env:GITHUB_TOKEN}", // From environment
      },

      // Custom headers
      "headers": {
        "X-Client-ID": "{env:OPENCODE_CLIENT_ID}",
        "User-Agent": "opencode-ai/2.0.0",
      },

      // Connection retry policy
      "retry": {
        "maxAttempts": 3,
        "delayMs": 1000,
        "backoffMultiplier": 2,
      },

      // Health check
      "healthCheck": {
        "enabled": true,
        "intervalMs": 30000,
        "endpoint": "/health",
      },
    },

    // Octocode MCP server
    "octocode": {
      "type": "remote",
      "url": "http://localhost:3002",
      "enabled": true,
      "timeout": 15000,
      "auth": {
        "type": "bearer",
        "token": "{env:OCTOCODE_API_KEY}",
      },
      "healthCheck": {
        "enabled": true,
        "intervalMs": 60000,
        "endpoint": "/health",
      },
    },

    // Anthropic MCP server
    "anthropic": {
      "type": "local",
      "command": ["npx", "@modelcontextprotocol/server-anthropic"],
      "enabled": true,
      "timeout": 10000,
      "autoRestart": true,
      "env": {
        "ANTHROPIC_API_KEY": "{env:ANTHROPIC_API_KEY}",
      },
    },
  },
}
```

2. Add environment variables to `.env.opencode.local`:

```bash
# Authentication tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
OCTOCODE_API_KEY=sk-xxxxxxxxxxxxxxxxxx
OPENCODE_CLIENT_ID=octocode-ai

# MCP server URLs (if using remote)
GITHUB_MCP_URL=http://localhost:3001
OCTOCODE_MCP_URL=http://localhost:3002
```

3. Add authentication validation script:

```bash
# Create: scripts/validate-opencode-auth.sh
#!/bin/bash

echo "Validating OpenCode.ai authentication..."

# Check required env vars
required_vars=("ANTHROPIC_API_KEY" "OPENCODE_CLIENT_ID")
missing=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing+=("$var")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${missing[@]}"
  exit 1
fi

# Test config validity
if ! opencode --config opencode.jsonc --validate-config > /dev/null 2>&1; then
  echo "❌ Configuration is invalid"
  exit 1
fi

# Test MCP connections
echo "Testing MCP server connections..."
opencode --check-mcp-health

if [ $? -ne 0 ]; then
  echo "⚠️  Some MCP servers are not reachable (this is OK for remote servers)"
fi

echo "✅ Authentication validation complete"
```

4. Make script executable:

```bash
chmod +x scripts/validate-opencode-auth.sh
```

5. Test authentication:

```bash
# Validate auth setup
./scripts/validate-opencode-auth.sh

# Should output: ✅ Authentication validation complete
```

**Success Criteria:**

- [ ] Auth configuration added for all remote MCP servers
- [ ] Environment variables defined in `.env.opencode.local`
- [ ] `scripts/validate-opencode-auth.sh` created and executable
- [ ] `./scripts/validate-opencode-auth.sh` passes
- [ ] Health checks enabled for all remote servers

---

### Task 4: Configuration Hierarchy Documentation (20 minutes)

**Purpose:** Clear documentation of 6-layer precedence

**Location:** `docs/ai/OPENCODE_CONFIG_HIERARCHY.md`

**Create:** New file documenting the complete configuration stack

````markdown
# OpenCode.ai Configuration Hierarchy

## 6-Layer Precedence System

OpenCode.ai uses a hierarchical configuration system where each layer can override the previous one.

### Layer 1: Defaults (Lowest Priority)

**Built into OpenCode.ai**

- Default model: `gpt-4`
- Default timeout: 30000ms
- All providers disabled by default

### Layer 2: Global User Configuration

**Location:** `~/.config/opencode/opencode.jsonc`
**Scope:** All projects on your machine
**Use for:** Team preferences, theme, default model

Example:

```jsonc
{
  "model": "anthropic/claude-sonnet-4-5",
  "theme": "dark",
  "tui": { "scrollAcceleration": 3 },
}
```
````

### Layer 3: Organization Configuration (Future)

**Location:** Not yet implemented
**Scope:** All team members
**Use for:** Team-wide security policies

### Layer 4: Project Configuration

**Location:** `./opencode.jsonc` (in repository)
**Scope:** This project only
**Use for:** Project-specific agents, MCP servers, instructions

Example:

```jsonc
{
  "agents": [
    { "name": "dcyfr-feature", "model": "anthropic/claude-sonnet-4-5" }
  ],
  "mcp": { "filesystem": { ... } },
}
```

### Layer 5: User Overrides

**Method:** Command-line arguments
**Scope:** Current command only
**Use for:** One-time changes

Example:

```bash
opencode --model anthropic/claude-haiku-4-5 --agent dcyfr-quick
```

### Layer 6: Runtime Configuration (Highest Priority)

**Method:** Environment variables
**Scope:** Current session
**Use for:** Secrets, temporary changes

Example:

```bash
OPENCODE_MODEL=anthropic/claude-sonnet-4-5 opencode --help
```

## Precedence Resolution

When a setting appears in multiple layers:

```
Runtime Env Vars (6)
    ↓ overrides ↓
Command-line Args (5)
    ↓ overrides ↓
Project Config (4)
    ↓ overrides ↓
Org Config (3) [future]
    ↓ overrides ↓
Global Config (2)
    ↓ overrides ↓
Defaults (1)
```

### Example: Model Selection

```
OPENCODE_MODEL=claude-haiku-4-5        # Layer 6 - WINS
  --model claude-opus                    # Layer 5
    project's "model": "claude-sonnet"   # Layer 4
      global "model": "claude-sonnet"    # Layer 2
        default: "gpt-4"                 # Layer 1
```

**Result:** `claude-haiku-4-5` (from Layer 6)

## Configuration Merge Strategy

Different settings are merged at different levels:

### Array Settings (e.g., instructions)

- **Merge type:** Append (Layer 6 + Layer 5 + Layer 4, etc.)
- **Behavior:** All instructions from all layers are loaded

### Object Settings (e.g., provider options)

- **Merge type:** Deep merge (Layer 6 overwrites Layer 5, etc.)
- **Behavior:** Nested values are preserved unless overwritten

### String/Number Settings (e.g., model, timeout)

- **Merge type:** Replace
- **Behavior:** Lower layer completely overwritten by higher layer

## Best Practices

### For Team Leads

1. Set team preferences in `~/.config/opencode/opencode.jsonc`
2. Share template with team: `docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc`
3. Document required environment variables in `.env.example`

### For Developers

1. Keep project `opencode.jsonc` in version control
2. Put secrets in `~/.env.opencode.local` (not committed)
3. Use environment variables for API keys, tokens

### For CI/CD

1. Set all configuration via environment variables
2. Use Layer 6 (runtime) for maximum flexibility
3. Don't commit `.env` files
4. Validate config in pipeline

## Conflict Resolution

If you see unexpected behavior:

1. **Check which layer is active:**

```bash
opencode --show-config  # Shows merged config
opencode --show-config --verbose  # Shows layer by layer
```

2. **Disable layers to debug:**

```bash
# Disable global config
opencode --config ./opencode.jsonc --no-global-config

# Disable environment variables
opencode --config ./opencode.jsonc --no-env-vars
```

3. **Check precedence explicitly:**

```bash
# Show which value wins
opencode --debug-config model
# Output: model = claude-sonnet-4-5 (from Layer 4: project config)
```

## Migration Checklist

When updating from Phase 1 to Phase 2:

- [ ] Create global config: `~/.config/opencode/opencode.jsonc`
- [ ] Copy template: `cp docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc ~/.config/opencode/opencode.jsonc`
- [ ] Set project config: Keep `./opencode.jsonc` in version control
- [ ] Add environment file: Create `~/.env.opencode.local` with secrets
- [ ] Validate: `opencode --show-config` shows expected merged config
- [ ] Test: Run `opencode --agent dcyfr-feature --info` successfully
- [ ] Verify precedence: Change global and project config, confirm project wins

---

## Configuration Validation

Test your configuration:

```bash
# Validate syntax
opencode --validate-config

# Show merged configuration
opencode --show-config

# Show configuration with layer information
opencode --show-config --verbose

# Check specific MCP servers
opencode --list-mcp-servers

# Validate MCP connections
opencode --check-mcp-health
```

## Troubleshooting

### "Configuration not found" error

```bash
# Check expected locations
ls -la ~/.config/opencode/opencode.jsonc
ls -la ./opencode.jsonc

# Verify config path
opencode --config ~/.config/opencode/opencode.jsonc --validate-config
```

### "Invalid configuration" error

```bash
# Validate JSON syntax
cat opencode.jsonc | jq .

# Check for common issues
opencode --validate-config --verbose
```

### "Model not available" error

```bash
# Check enabled providers
opencode --show-config | grep enabled_providers

# Verify API key is set
echo $ANTHROPIC_API_KEY  # Should not be empty
```

### "MCP server not responding" warning

```bash
# Check MCP health
opencode --check-mcp-health

# Verify MCP server is running
curl http://localhost:3001/health

# Check auth configuration
grep -A5 '"auth"' opencode.jsonc
```

---

**Phase 2 Complete:** Team now has full configuration control with 6-layer precedence system.

````

**Success Criteria:**
- [ ] File created: `docs/ai/OPENCODE_CONFIG_HIERARCHY.md`
- [ ] Complete with all 6 layers documented
- [ ] Precedence examples included
- [ ] Best practices provided
- [ ] Troubleshooting section included

---

## 📊 Phase 2 Progress

| Task | Time | Status |
|------|------|--------|
| 1. Global configuration | 30 min | ⏳ Ready |
| 2. Fine-grained permissions | 45 min | ⏳ Ready |
| 3. Enhanced MCP auth | 30 min | ⏳ Ready |
| 4. Hierarchy documentation | 20 min | ⏳ Ready |
| **Total** | **2 hours** | **Ready** |

---

## ✅ Phase 2 Completion Checklist

```bash
# After completing all tasks:

# 1. Verify global config exists and is valid
[ ] ~/.config/opencode/opencode.jsonc exists
[ ] opencode --config ~/.config/opencode/opencode.jsonc --validate-config passes

# 2. Verify project config has permissions
[ ] opencode.jsonc has "permissions" section
[ ] All 5 agents have permission blocks
[ ] opencode --validate-config passes

# 3. Verify MCP auth is configured
[ ] All remote MCP servers have "auth" section
[ ] Environment variables are documented in .env.opencode.example
[ ] ./scripts/validate-opencode-auth.sh passes

# 4. Verify hierarchy documentation exists
[ ] docs/ai/OPENCODE_CONFIG_HIERARCHY.md exists
[ ] All 6 layers documented with examples
[ ] Troubleshooting section complete

# 5. Test merged configuration
[ ] opencode --show-config displays merged config correctly
[ ] Project config overrides global config when expected
[ ] Environment variables are applied correctly

# 6. Team verification
[ ] Share docs/ai/OPENCODE_CONFIG_HIERARCHY.md with team
[ ] All team members have ~/.config/opencode/opencode.jsonc
[ ] All team members can run: opencode --show-config
````

---

## 🎯 Compliance Progress

| Metric                   | Phase 1    | Phase 2     | Status     |
| ------------------------ | ---------- | ----------- | ---------- |
| Configuration format     | JSONC ✅   | JSONC ✅    | Complete   |
| Variable substitution    | ✅         | ✅          | Complete   |
| MCP configuration        | ✅         | Enhanced ✅ | Complete   |
| Fine-grained permissions | ✅         | ✅          | Complete   |
| Global configuration     | Template   | Implemented | Complete   |
| Documentation            | ✅         | Enhanced    | Complete   |
| **Compliance Score**     | **85/100** | **90/100**  | **Target** |

---

**Ready to implement?** Start with Task 1: Global Configuration (30 minutes)

After Phase 2 is complete, proceed to **Phase 3: Optimization** for advanced token management and TUI enhancements.
