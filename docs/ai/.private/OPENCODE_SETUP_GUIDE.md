<!-- TLP:CLEAR -->

# OpenCode.ai Setup & Migration Guide

**Status:** Phase 1 Complete (JSONC Migration)
**Date:** January 24, 2026
**Objective:** Migrate from JSON to JSONC format with variables, comments, and best practices

---

## 📋 Quick Summary

Your OpenCode.ai configuration has been enhanced with:

✅ **JSONC Format** - Comments explaining every setting
✅ **Variable Substitution** - Secrets via `{env:VAR}` syntax
✅ **Comprehensive Comments** - Self-documenting configuration
✅ **Enhanced MCP Servers** - Added `autoRestart` and auth configs
✅ **Global Config Template** - Team-wide default setup guide
✅ **.env Template** - All environment variables documented

---

## 🚀 Phase 1 Implementation: Migration Steps

### Step 1: Backup Current Configuration

```bash
# Save original for reference
cp opencode.json opencode.json.bak
git add opencode.json.bak
git commit -m "backup: original JSON configuration"
```

### Step 2: Replace Configuration File

The new `opencode.jsonc` file is ready to use:

```bash
# The new enhanced config is at: opencode.jsonc
# Your old JSON file: opencode.json (kept for reference)

# Verify JSONC is valid
npx opencode --validate-config opencode.jsonc

# Expected output: ✅ Config is valid
```

### Step 3: Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env.opencode.local

# Edit with your actual credentials
# NEVER commit .env.opencode.local
nano .env.opencode.local
```

**Required variables:**

- `ANTHROPIC_API_KEY` - Your Claude API key
- `PERPLEXITY_API_KEY` - Optional, for web search

**Optional variables:**

- `OPENCODE_MODEL` - Override default model
- `OPENCODE_TIMEOUT` - Custom timeout

### Step 4: Test Configuration

```bash
# Launch OpenCode with enhanced config
opencode --config opencode.jsonc

# Or set as default
export OPENCODE_CONFIG="$(pwd)/opencode.jsonc"

# Verify config loaded
/models
# Should show available models
```

### Step 5: Commit Changes

```bash
# Stage new JSONC config
git add opencode.jsonc
git add .env.opencode.example
git add docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc
git add docs/ai/OPENCODE_SETUP_GUIDE.md

# Commit
git commit -m "feat: upgrade to JSONC config with variable substitution and enhanced MCP

- Convert JSON to JSONC for self-documenting configuration
- Add environment variable substitution ({env:VAR} syntax)
- Enhance MCP server config with autoRestart and auth options
- Add comprehensive comments explaining all settings
- Include global config template for team setup
- Document all environment variables in .env.example

See: docs/ai/OPENCODE_BEST_PRACTICES_ANALYSIS.md for full details"
```

---

## 🌍 Phase 2: Global Configuration (Optional Team Setup)

### For Team Members

Copy the global config template to your machine:

```bash
# Create directory if needed
mkdir -p ~/.config/opencode

# Copy template
cp docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc ~/.config/opencode/opencode.jsonc

# Customize for your preferences
nano ~/.config/opencode/opencode.jsonc

# Verify
opencode --validate-config ~/.config/opencode/opencode.jsonc
```

**Precedence after setup:**

```
1. ~/.config/opencode/opencode.jsonc (global - your preferences)
2. opencode.jsonc (project-specific overrides)
3. OPENCODE_CONFIG env var (runtime overrides)
```

### For Team Lead (Organizational Defaults)

If managing 5+ developers, create a shared `.well-known/opencode` endpoint:

```bash
# This would go on your team's web server
# Example: https://company.com/.well-known/opencode

{
  "model": "anthropic/claude-sonnet-4-5",
  "theme": "opencode",
  "disabled_providers": ["groq", "ollama"],
  "mcp": {
    "jira": {
      "type": "remote",
      "url": "https://company-jira.com/mcp",
      "enabled": false
    }
  }
}
```

---

## 📊 Configuration Precedence Explained

**Lowest to Highest Priority:**

```
┌─────────────────────────────────────────┐
│ 1. OpenCode defaults (hardcoded)        │ ← Lowest priority
├─────────────────────────────────────────┤
│ 2. Remote org config (.well-known/)     │
├─────────────────────────────────────────┤
│ 3. Global config (~/.config/opencode/)  │
├─────────────────────────────────────────┤
│ 4. Custom path (OPENCODE_CONFIG env)    │
├─────────────────────────────────────────┤
│ 5. Project config (opencode.jsonc)      │
├─────────────────────────────────────────┤
│ 6. Inline config (OPENCODE_CONFIG_CONTENT) │ ← Highest priority
└─────────────────────────────────────────┘
```

**Example Hierarchy:**

```
Global: model=claude-sonnet-4-5, theme=opencode
Project: model=claude-haiku-4-5 (overrides global model only)
Result: model=claude-haiku-4-5 (project), theme=opencode (global)
```

---

## 🔐 Environment Variables Reference

### Required

| Variable            | Purpose                   | Example      |
| ------------------- | ------------------------- | ------------ |
| `ANTHROPIC_API_KEY` | Claude API authentication | `sk-ant-...` |

### Optional

| Variable               | Purpose                      | Default             | Example            |
| ---------------------- | ---------------------------- | ------------------- | ------------------ |
| `OPENCODE_MODEL`       | Override default model       | `claude-sonnet-4-5` | `claude-opus-4`    |
| `OPENCODE_SMALL_MODEL` | Override small model         | `claude-haiku-4-5`  | `claude-haiku-4-5` |
| `OPENCODE_TIMEOUT`     | Request timeout (ms)         | `600000`            | `1200000`          |
| `PERPLEXITY_API_KEY`   | Web search API               | -                   | `pplx_...`         |
| `CUSTOM_INSTRUCTIONS`  | Additional instruction files | -                   | `docs/custom.md`   |

### Setup

```bash
# Option 1: .env.opencode.local (gitignored)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.opencode.local

# Option 2: Shell environment
export ANTHROPIC_API_KEY="sk-ant-..."

# Option 3: GitHub Actions (team setup)
# Add to GitHub Secrets, then reference in workflow
```

---

## ✅ Validation Checklist

After implementing Phase 1:

- [ ] `opencode.jsonc` created with enhanced config
- [ ] `.env.opencode.example` created with all variables
- [ ] Global config template at `docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc`
- [ ] Config validates: `npx opencode --validate-config opencode.jsonc`
- [ ] Environment variables documented in `.env.opencode.example`
- [ ] Team members can copy global template to `~/.config/opencode/`
- [ ] Git commits reference OPENCODE_BEST_PRACTICES_ANALYSIS.md

---

## 🔧 Troubleshooting

### Config Not Loading?

```bash
# Check which config OpenCode is using
opencode --show-config

# Expected: Path to opencode.jsonc

# If loading old JSON:
export OPENCODE_CONFIG="$(pwd)/opencode.jsonc"
opencode
```

### Variables Not Substituting?

```bash
# Check environment
echo $ANTHROPIC_API_KEY

# Should show your API key (not empty)

# If empty:
export ANTHROPIC_API_KEY="your-key-here"
```

### MCP Server Issues?

```bash
# Check MCP server health
npm run opencode:health

# Check specific server
opencode --check-mcp=memory

# See detailed logs
export MCP_DEBUG=true
opencode
```

---

## 📚 Next Steps

### Phase 2 (When Ready)

- [ ] Create global config: `~/.config/opencode/opencode.jsonc`
- [ ] Setup org-wide `.well-known/opencode` (if team >5)
- [ ] Document team standards in `.opencode/DCYFR.opencode.md`

### Phase 3 (Enhancement)

- [ ] Add fine-grained permissions
- [ ] Configure formatters (prettier + eslint)
- [ ] Setup MCP auth for remote servers

### Phase 4 (Optimization)

- [ ] Monitor token usage with compaction
- [ ] Optimize MCP server timeouts based on usage
- [ ] Create team-specific presets

---

## 📖 Related Documentation

- OPENCODE_BEST_PRACTICES_ANALYSIS.md - Full gap analysis
- .opencode/DCYFR.opencode.md - DCYFR enforcement rules
- [Official OpenCode Docs](https://opencode.ai/docs/config/) - OpenCode.ai reference

---

## 🔗 Key Files

| File                                            | Purpose                                             |
| ----------------------------------------------- | --------------------------------------------------- |
| `opencode.jsonc`                                | **NEW** - Enhanced config with comments & variables |
| `opencode.json`                                 | **OLD** - Original JSON config (kept as backup)     |
| `.env.opencode.example`                         | **NEW** - Environment variable template             |
| `docs/ai/OPENCODE_GLOBAL_CONFIG_TEMPLATE.jsonc` | **NEW** - Team global config template               |
| `docs/ai/OPENCODE_BEST_PRACTICES_ANALYSIS.md`   | **NEW** - Gap analysis & recommendations            |

---

**Status:** Phase 1 Complete ✅
**Next Review:** After Phase 2 global config implementation
**Questions?** See OPENCODE_BEST_PRACTICES_ANALYSIS.md section "Questions & Next Steps"
