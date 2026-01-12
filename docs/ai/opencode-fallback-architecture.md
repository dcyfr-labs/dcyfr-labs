# OpenCode.ai Fallback Architecture

**Last Updated:** January 11, 2026

## Overview

OpenCode.ai serves as a fallback AI development tool when Claude Code or GitHub Copilot encounter token exhaustion or rate limiting. With GitHub Copilot integration (GPT-5 Mini + Raptor Mini), OpenCode provides free, high-quality AI assistance included with your existing Copilot subscription.

---

## AI Tool Hierarchy

### Primary: Claude Code
- **Context Window**: 200K tokens
- **Best For**: Complex multi-file refactoring, architectural analysis, critical production work
- **Limitations**: API rate limits, daily token budgets, cost constraints

### Secondary: GitHub Copilot (Inline)
- **Context Window**: ~8K tokens
- **Best For**: Inline suggestions, single-file edits, quick completions
- **Limitations**: Limited context, no multi-file refactoring, inline-only

### Fallback: OpenCode.ai (GitHub Copilot Integration)
- **Context Window**: 16K (GPT-5 Mini), 8K (Raptor Mini), up to 200K (Claude Sonnet)
- **Best For**: Extended sessions, multi-file work when Claude Code rate-limited
- **Advantages**:
  - GitHub Copilot models included (GPT-5 Mini, Raptor Mini, GPT-4o at 0 multiplier)
  - 75+ AI provider options (Claude, Gemini, OpenAI, etc.)
  - No vendor lock-in
  - Cost flexibility (free with Copilot subscription)

---

## When to Use OpenCode.ai

### Trigger Conditions

#### 1. Token Exhaustion
```
❌ Claude Code: "Rate limit exceeded" or "Token budget exhausted"
✅ Switch to: OpenCode.ai with GitHub Copilot GPT-5 Mini (free, 16K context)
```

#### 2. Extended Development Sessions
```
Scenario: Multi-hour refactoring session
Risk: Exceeding Claude API daily limits
Solution: Start with Claude Code, switch to OpenCode.ai GitHub Copilot mid-session
Benefit: Continue work with no additional cost (included with subscription)
```

#### 3. Cost Optimization
```
Task: Routine development, refactoring, documentation
Strategy: Use OpenCode.ai with GitHub Copilot models (0 multiplier)
Savings: $0 additional cost vs Claude API usage fees
```

#### 4. Provider Diversity
```
Use Case: Testing multiple AI perspectives on complex problems
Workflow:
  1. Claude Code for initial analysis
  2. OpenCode.ai with GitHub Copilot GPT-5 Mini for implementation
  3. OpenCode.ai with Claude Sonnet for validation (premium, if needed)
```

#### 5. Multi-File Operations
```
Scenario: GitHub Copilot inline limited to single file
Need: Cross-file refactoring, architecture analysis
Solution: OpenCode.ai with GitHub Copilot GPT-5 Mini (16K context, multi-file support)
```

---

## Supported AI Providers

OpenCode.ai connects to these providers (configure via device authentication):

### GitHub Copilot Models (Included with Subscription)

| Provider | Model | Context | Cost Multiplier | Speed |
|----------|-------|---------|-----------------|-------|
| **GitHub Copilot** | GPT-5 Mini | 16K | 0 (free*) | Fast |
| **GitHub Copilot** | Raptor Mini | 8K | 0 (free*) | Very Fast |
| **GitHub Copilot** | GPT-4o | 128K | 0 (free*) | Fast |

**Included with GitHub Copilot subscription ($10-20/month flat fee)*

### Premium Cloud Providers (Occasional Use)

| Provider | Model Examples | Context | Cost Multiplier | Speed |
|----------|---------------|---------|-----------------|-------|
| **Anthropic** | Claude Sonnet 4, Opus | 200K | 1 | Fast |
| **Google** | Gemini 1.5 Pro, Flash | 1M | 1 | Fast |
| **OpenAI** | GPT-4 Turbo | 128K | 1 | Fast |

### Future: Offline Support (Msty.ai)

| Provider | Model Examples | Context | Cost | Speed |
|----------|---------------|---------|------|-------|
| **Msty.ai** | Llama 3, CodeLlama, Qwen | 32K | Free | Med |

**Note:** Offline support via Ollama removed in v2.0. See `docs/backlog/msty-ai-offline-support.md` for future plans.

---

## Installation & Setup

### 1. Install VS Code Extension (Recommended)

OpenCode has a native VS Code extension that provides seamless IDE integration:

**Extension:** [sst-dev.opencode](https://marketplace.visualstudio.com/items?itemName=sst-dev.opencode)

**Installation:**
1. Open VS Code
2. Go to Extensions (Cmd/Ctrl+Shift+X)
3. Search for "OpenCode"
4. Install "opencode" by sst-dev
5. Reload VS Code

**Features:**
- **Quick Launch:** `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux) - Open OpenCode in split terminal
- **New Session:** `Cmd+Shift+Esc` (Mac) or `Ctrl+Shift+Esc` (Windows/Linux) - Start fresh session
- **File References:** `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Linux/Windows) - Insert file refs (@File#L37-42)
- **Context Awareness:** Automatically shares current selection/tab with OpenCode
- **Editor Integration:** Button in editor title bar for quick access
- **Independent Sessions:** Each terminal is an isolated OpenCode instance

**Benefits:**
- Faster workflow (keyboard shortcuts vs typing commands)
- Automatic file context sharing
- Visual integration with VS Code UI
- No need to switch between terminal and editor

**Compatibility:** Works with VS Code, Cursor, Windsurf, and VSCodium

### 2. Authenticate with GitHub Copilot

OpenCode uses device code authentication (no API keys required):

```bash
# Launch OpenCode
opencode

# In OpenCode interface, connect to GitHub Copilot
/connect

# Select "GitHub Copilot" from provider list

# Follow on-screen instructions:
# 1. Navigate to: https://github.com/login/device
# 2. Enter code shown in terminal
# 3. Authorize OpenCode.ai

# Verify connection
/models
# Should show: gpt-5-mini, raptor-mini, gpt-4o, claude-sonnet-4, etc.
```

**No API key needed** - Uses your existing GitHub Copilot subscription.

### 3. Configure Project Presets

The project includes pre-configured presets in `.opencode/config.json`:

```json
{
  "primary": {
    "provider": "github-copilot",
    "model": "gpt-5-mini",
    "temperature": 0.3,
    "maxTokens": 16384,
    "description": "Primary GitHub Copilot model (16K context)"
  },
  "speed": {
    "provider": "github-copilot",
    "model": "raptor-mini",
    "temperature": 0.2,
    "maxTokens": 8192,
    "description": "Fast GitHub Copilot model (8K context, code-tuned)"
  },
  "presets": {
    "dcyfr-feature": {
      "providerId": "primary",
      "systemPrompt": "DCYFR pattern enforcement (design tokens, PageLayout, barrel exports)"
    },
    "dcyfr-quick": {
      "providerId": "speed",
      "systemPrompt": "DCYFR quick fixes (use existing patterns)"
    }
  }
}
```

### 4. Optional: Add Premium Providers

If you need occasional premium model access:

```bash
# Add to .env.local (optional)
ANTHROPIC_API_KEY=sk-ant-...    # For Claude Sonnet 4
GOOGLE_API_KEY=...              # For Gemini 1.5 Pro
OPENAI_API_KEY=sk-...           # For direct GPT-4 access
```

### 5. Verify Setup

```bash
# Check provider health
npm run opencode:health

# Launch OpenCode with GitHub Copilot
opencode --preset dcyfr-feature

# Test connection
/models
# Should show GitHub Copilot models
```

---
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GROQ_API_KEY="gsk_..."
```

---

## Usage Workflows

### Workflow 1: Direct Replacement for Claude Code

When Claude Code hits rate limits:

```bash
# Instead of Claude Code, start OpenCode.ai session
cd /path/to/dcyfr-labs
opencode

# At the prompt:
> Start Phase 4.1: Component directory reorganization

# OpenCode.ai will:
# 1. Read project structure
# 2. Analyze current component organization
# 3. Plan reorganization (using cheaper model for planning)
# 4. Execute changes (using primary model)
# 5. Run tests and verify
```

### Workflow 2: Cost-Optimized Long Sessions

For extended development work:

```bash
# Use Groq (ultra-fast, low-cost) for routine tasks
opencode --provider cost-effective

> Extract common filter logic from duplicated components

# OpenCode.ai with Groq:
# - 10-100x cheaper than Claude
# - Comparable quality for code refactoring
# - Ultra-fast responses (100+ tokens/sec)
```

### Workflow 3: Multi-Provider Comparison

For complex architectural decisions:

```bash
# Get Claude's opinion
claude-code "Should we use server components or client components for the activity feed?"

# Get GPT-4's opinion
opencode --provider fallback
> Should we use server components or client components for the activity feed?

# Get Gemini's opinion (massive context window)
opencode --provider gemini
> Should we use server components or client components for the activity feed?

# Compare and synthesize best approach
```

### Workflow 4: Offline Development

For air-gapped or offline work:

```bash
# Install local model (one-time)
ollama pull codellama:34b

# Use OpenCode.ai with local model
opencode --provider local

> Help me debug this TypeScript error in src/lib/analytics.ts

# Works completely offline (no API calls)
```

---

## GitHub Integration

OpenCode.ai can integrate with GitHub workflows:

### 1. PR Review with OpenCode

```yaml
# .github/workflows/opencode-review.yml
name: OpenCode PR Review
on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run OpenCode Review
        run: |
          npx opencode-ai review --pr ${{ github.event.pull_request.number }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
```

### 2. Automated Issue Analysis

```bash
# Comment on GitHub issue with @opencode
@opencode analyze this bug and suggest a fix

# OpenCode.ai will:
# 1. Read issue description
# 2. Analyze relevant code
# 3. Comment with diagnosis and fix
```

---

## Best Practices

### 1. Provider Selection Strategy

```
Planning & Documentation → Groq (fast, cheap)
Code Generation → Claude/GPT-4 (high quality)
Debugging & Analysis → Gemini (massive context)
Offline/Testing → Ollama (free, private)
```

### 2. Token Budget Management

Track usage across providers:

```bash
# Check current usage
opencode usage --provider primary
opencode usage --provider fallback

# Set budget alerts
opencode config set budget.daily 1000000  # 1M tokens/day
opencode config set budget.alert 0.8      # Alert at 80%
```

### 3. Quality Validation

Always validate OpenCode.ai output:

```bash
# After OpenCode.ai makes changes
npm run typecheck  # TypeScript validation
npm run test       # Test suite
npm run lint       # ESLint
```

### 4. Context Preservation

OpenCode.ai supports session management:

```bash
# Save current session
opencode save-session phase-4-1-refactor

# Resume later
opencode load-session phase-4-1-refactor
```

---

## Comparison with Claude Code

| Feature | Claude Code | OpenCode.ai |
|---------|-------------|-------------|
| **Multi-file refactoring** | ✅ Excellent | ✅ Excellent |
| **Provider options** | 1 (Anthropic) | 75+ providers |
| **Cost flexibility** | Fixed | Variable (free to premium) |
| **Offline support** | ❌ No | ✅ Yes (local models) |
| **VS Code integration** | ✅ Native | ⚠️ Terminal-based |
| **Context window** | 200K (fixed) | Up to 2M (Gemini) |
| **Setup complexity** | Low | Medium |
| **Response speed** | Fast | Varies by provider |
| **Design system enforcement** | ✅ Built-in | ⚠️ Manual configuration |
| **Test integration** | ✅ Automatic | ⚠️ Manual |
| **MCP server access** | ✅ Yes | ⚠️ Limited |

---

## Troubleshooting

### Issue: "Provider authentication failed"

```bash
# Verify API keys are set
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Test provider connection
opencode test-provider --name primary
```

### Issue: "Model not found"

```bash
# List available models for provider
opencode models --provider anthropic
opencode models --provider openai

# Update config with valid model name
```

### Issue: "Response quality lower than Claude Code"

```
Solution:
1. Switch to higher-quality model (GPT-4 Turbo, Claude Opus)
2. Adjust temperature (lower = more focused)
3. Provide more detailed prompts
4. Use multi-step prompting (plan first, then execute)
```

### Issue: "Slow responses with local models"

```
Optimization:
1. Use smaller quantized models (Q4, Q5 vs Q8)
2. Increase GPU memory allocation
3. Use faster models (Llama 3 8B vs 70B)
4. Enable GPU acceleration (CUDA, Metal)
```

---

## Cost Analysis

### Cost Comparison per Development Session

| Task | Claude Code | OpenCode (GitHub Copilot) | OpenCode (Claude Sonnet) |
|------|-------------|---------------------------|--------------------------|
| **Feature Development** (6 hrs) | $15-20 | $0* | $15-20 |
| **Bug Fixes** (4 hrs) | $10-15 | $0* | $10-15 |
| **Refactoring** (5 hrs) | $12-18 | $0* | $12-18 |
| **Total** | $50-75 | $0* | $50-75 |

**GitHub Copilot models included with subscription ($10-20/month flat fee)*

**Key Insight**: Use GitHub Copilot models (GPT-5 Mini, Raptor Mini) for 80% of work at $0 additional cost, reserve Claude Sonnet for complex/security tasks (20%).

---

## Integration with Project Workflow

### 1. Update `.vscode/tasks.json`

Add OpenCode.ai tasks:

```json
{
  "label": "OpenCode: Start Session",
  "type": "shell",
  "command": "opencode",
  "problemMatcher": []
},
{
  "label": "OpenCode: Review Changes",
  "type": "shell",
  "command": "opencode review",
  "problemMatcher": []
}
```

### 2. Update `package.json` Scripts

```json
{
  "scripts": {
    "ai:opencode": "opencode",
    "ai:opencode:groq": "opencode --provider cost-effective",
    "ai:opencode:local": "opencode --provider local",
    "ai:usage": "opencode usage --all"
  }
}
```

### 3. Add to Development Workflow

```bash
# Morning: Start with Claude Code (fresh token budget)
claude-code

# Afternoon: Switch to OpenCode.ai if needed
npm run ai:opencode

# Evening: Use cost-effective provider for cleanup
npm run ai:opencode:groq
```

---

## Future Enhancements

### Planned Improvements

1. **Automatic Failover**
   - Detect Claude rate limits automatically
   - Switch to OpenCode.ai fallback seamlessly
   - Track token usage across all providers

2. **Unified Interface**
   - Single CLI for all AI tools
   - Consistent command syntax
   - Shared session history

3. **Provider Routing**
   - Route tasks to optimal provider based on:
     - Task complexity
     - Token budget remaining
     - Cost constraints
     - Response time requirements

4. **Quality Monitoring**
   - Track output quality by provider
   - A/B test different models
   - Learn optimal provider for each task type

---

## Resources

### Documentation
- **OpenCode.ai Docs**: https://opencode.ai/docs/
- **Provider Comparison**: https://opencode.ai/docs/models/
- **GitHub Repository**: https://github.com/opencode-ai/opencode

### Related Guides
- [Claude Code Integration](claude-code-integration.md)
- [Best Practices](best-practices.md)
- [Token Optimization](private/optimization-strategy.md)

---

**Status**: Architecture designed, ready for implementation
**Next Steps**: Install OpenCode.ai, configure providers, test fallback workflow
