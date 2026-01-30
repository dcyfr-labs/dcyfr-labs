<!-- TLP:CLEAR -->

# OpenCode vs Claude Code Usage Guide

**Version:** 1.0.0  
**Last Updated:** January 17, 2026

This guide helps you choose between OpenCode and Claude Code for different development scenarios in dcyfr-labs.

---

## Quick Decision Matrix

| Scenario | Recommended Tool | Why |
|----------|------------------|-----|
| Production feature work | **Claude Code** | Full DCYFR enforcement, ToS-compliant |
| Quick pattern fixes | **Claude Code** | Haiku agent is fast and cheap |
| Multi-model comparison | **OpenCode** | 75+ provider support |
| Token exhaustion | **OpenCode** | GitHub Copilot (free tier) |
| Extended sessions (6+ hrs) | **OpenCode** | Cost optimization |
| Security-sensitive work | **Claude Code** | Full audit trail, enforcement |
| True parallel agents | **OpenCode** | Background agent support |
| Offline development | **OpenCode** | Local model support (Ollama) |
| LSP-based refactoring | **OpenCode** | Built-in language server |

---

## Tool Comparison

### Claude Code

**Strengths:**
- Full DCYFR pattern enforcement via hooks
- 64 specialized agents with auto-delegation
- ToS-compliant (official Anthropic product)
- Deep integration with `.claude/` configuration
- Session state management and checkpoints
- Security audit trail (bash command logging)

**Limitations:**
- Single provider (Anthropic only)
- Rate limits during heavy usage
- Cost accumulates on long sessions
- No true background agents (sequential Task tool)

**Best For:**
- Day-to-day production work
- Features requiring strict pattern compliance
- Security-sensitive changes
- Work needing comprehensive audit trail

### OpenCode

**Strengths:**
- 75+ AI providers (OpenAI, Anthropic, Google, Groq, Ollama)
- Free tier via GitHub Copilot integration
- True parallel background agents
- LSP-based intelligent refactoring
- Multi-model workflows (use different models for different tasks)
- Offline support via local models

**Limitations:**
- No native DCYFR enforcement (manual validation required)
- Simpler agent system
- Less audit trail by default
- ToS gray area for some integrations

**Best For:**
- Cost-sensitive extended sessions
- Multi-model experimentation
- Offline development
- LSP-based refactoring tasks
- When Claude Code rate-limited

---

## Detailed Scenarios

### 1. Production Feature Implementation

**Use: Claude Code**

```bash
# Claude Code enforces all DCYFR patterns automatically
claude "Create new /dashboard page with analytics charts"
```

Why Claude Code:
- Automatic design token enforcement
- Barrel export validation
- PageLayout compliance check
- Test file generation prompts
- Full audit trail

### 2. Token Exhaustion Recovery

**Use: OpenCode with GitHub Copilot**

```bash
# When Claude Code rate-limited, switch to OpenCode
opencode --provider github-copilot
```

Configuration (`.opencode/config.json`):
```json
{
  "provider": {
    "name": "github-copilot",
    "model": "gpt-5-mini"
  }
}
```

Why OpenCode:
- GitHub Copilot models are free (included with subscription)
- 16K context window
- No separate API costs

### 3. Cost-Optimized Extended Sessions

**Use: OpenCode with Groq**

```bash
# 10-100x cheaper than direct Claude API
opencode --provider groq --model llama-3.3-70b-versatile
```

Cost comparison:
| Provider | Model | Cost per 1M tokens |
|----------|-------|--------------------|
| Anthropic | Claude Sonnet | $15 input / $75 output |
| Groq | Llama 3.3 70B | ~$0.59 input / $0.79 output |
| GitHub Copilot | GPT-5 Mini | $0 (included) |

### 4. Multi-File Refactoring

**Use: OpenCode (LSP mode)**

OpenCode's built-in LSP tools provide:
- Intelligent rename across files
- Type-aware refactoring
- Import reorganization
- Dead code detection

```bash
# Rename a function across entire codebase
opencode "Rename getUserData to fetchUserProfile using LSP"
```

Why OpenCode:
- LSP understands code structure, not just text
- Handles edge cases (string literals, comments) correctly
- Faster than manual find-replace

### 5. Parallel Research Tasks

**Use: OpenCode (background agents)**

```bash
# Launch parallel research agents
opencode "Research React 19 patterns, Next.js 15 features, and 
Tailwind v4 changes - use background agents in parallel"
```

Why OpenCode:
- True parallel execution (not sequential like Claude Code Task tool)
- Each agent can use different models
- Results aggregated automatically

### 6. Security-Sensitive Work

**Use: Claude Code**

```bash
# Claude Code with full audit trail
claude "Review authentication flow for vulnerabilities"
```

Why Claude Code:
- All bash commands logged (`~/.claude/bash-command-log.txt`)
- Session checkpoints for recovery
- Security specialist agent available
- DCYFR security patterns enforced

### 7. Offline Development

**Use: OpenCode with Ollama**

```bash
# Run locally when no internet
opencode --provider ollama --model codellama:34b
```

Setup:
```bash
# Install Ollama
brew install ollama

# Pull model
ollama pull codellama:34b

# Configure OpenCode
cat > .opencode/config.json << 'EOF'
{
  "provider": {
    "name": "ollama",
    "model": "codellama:34b",
    "baseUrl": "http://localhost:11434"
  }
}
EOF
```

---

## Hybrid Workflow: Best of Both

For optimal results, use both tools strategically:

```
Session Start
    │
    ▼
┌─────────────────────────────────────────┐
│ Use Claude Code for:                    │
│ - Initial implementation                │
│ - Pattern compliance                    │
│ - Security-sensitive work               │
└───────────────────┬─────────────────────┘
                    │
                    ▼ (Rate limit hit OR 4+ hours)
                    │
┌─────────────────────────────────────────┐
│ Switch to OpenCode for:                 │
│ - Continuation of work                  │
│ - Cost optimization                     │
│ - Parallel research                     │
└───────────────────┬─────────────────────┘
                    │
                    ▼ (Before commit)
                    │
┌─────────────────────────────────────────┐
│ Return to Claude Code for:              │
│ - Final validation                      │
│ - DCYFR compliance check                │
│ - Commit message generation             │
└─────────────────────────────────────────┘
```

### Session Handoff Script

Use the session handoff workflow to switch between tools:

```bash
# Save Claude Code session state
npm run session:save

# Work in OpenCode
opencode

# Restore session and validate
npm run session:restore
npm run check:opencode
```

---

## Validation After OpenCode Usage

Since OpenCode doesn't enforce DCYFR patterns automatically, always run validation:

```bash
# Full DCYFR compliance check
npm run check

# Specific checks
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test:run      # Tests

# OpenCode-specific validation
node scripts/validate-after-fallback.sh
```

**What gets checked:**
- Design token usage (STRICT - hard block)
- PageLayout compliance (STRICT - hard block)
- Barrel export usage (STRICT - hard block)
- API patterns (FLEXIBLE - warning only)
- Test coverage (FLEXIBLE - warning only)

---

## Environment Setup

### Claude Code (Already Configured)

```bash
# Check Claude Code is available
which claude

# Verify configuration
cat .claude/settings.json
```

### OpenCode Installation

```bash
# Install OpenCode CLI
npm install -g opencode

# Or use VS Code extension
code --install-extension sst-dev.opencode
```

### VS Code Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Esc` | Launch OpenCode |
| `Cmd+Shift+Esc` | New OpenCode session |
| `Cmd+Option+K` | Add file references |

---

## Cost Tracking

Track AI costs across both tools:

```bash
# View unified AI costs
npm run ai:costs

# Archive monthly costs
npm run ai:costs:archive
```

Monthly cost targets:
- GitHub Copilot: $0 (included)
- OpenCode (Groq): < $10/month
- Claude Code: Variable (monitor usage)

---

## Troubleshooting

### "Rate limited" in Claude Code

1. Switch to OpenCode: `opencode --provider github-copilot`
2. Complete current task
3. Return to Claude Code when limit resets

### "Model not available" in OpenCode

1. Check provider configuration: `cat .opencode/config.json`
2. Verify API keys in `.env.local`
3. Try alternative provider: `opencode --provider groq`

### DCYFR Violations After OpenCode Work

1. Run validation: `npm run check`
2. Fix violations manually or with Claude Code
3. Commit only after all checks pass

---

## See Also

- [AGENTS.md](../../AGENTS.md) - Multi-tier AI architecture overview
- [OpenCode Fallback Architecture](./opencode-fallback-architecture.md) - Detailed fallback system
- [Session Management](./../claude-code-enhancements.md#session-management) - Session state handling
- [.opencode/](../../.opencode/) - OpenCode configuration directory
