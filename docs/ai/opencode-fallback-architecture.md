# OpenCode.ai Fallback Architecture

**Last Updated:** January 5, 2026

## Overview

OpenCode.ai serves as a fallback AI development tool when Claude Code or GitHub Copilot encounter token exhaustion or rate limiting. This document outlines when and how to use OpenCode.ai as part of our multi-provider AI architecture.

---

## AI Tool Hierarchy

### Primary: Claude Code
- **Context Window**: 200K tokens
- **Best For**: Complex multi-file refactoring, architectural analysis, Phase 4 tasks
- **Limitations**: API rate limits, daily token budgets, cost constraints

### Secondary: GitHub Copilot
- **Context Window**: ~8K tokens
- **Best For**: Inline suggestions, single-file edits, quick completions
- **Limitations**: Limited context, no multi-file refactoring, restricted to GitHub

### Fallback: OpenCode.ai
- **Context Window**: Provider-dependent (100K+ with Claude, GPT-4, Gemini)
- **Best For**: Extended sessions, alternative providers, cost optimization
- **Advantages**:
  - 75+ AI provider options
  - No vendor lock-in
  - Local model support
  - Cost flexibility

---

## When to Use OpenCode.ai

### Trigger Conditions

#### 1. Token Exhaustion
```
❌ Claude Code: "Rate limit exceeded" or "Token budget exhausted"
✅ Switch to: OpenCode.ai with alternative provider (OpenAI, Gemini, Groq)
```

#### 2. Extended Development Sessions
```
Scenario: Multi-hour refactoring session (Phase 4 tasks)
Risk: Exceeding Claude API daily limits
Solution: Start with Claude Code, switch to OpenCode.ai mid-session
```

#### 3. Cost Optimization
```
Task: Exploratory analysis, documentation generation
Strategy: Use OpenCode.ai with cost-effective providers (Groq, local models)
Savings: 10-100x cost reduction vs Claude API
```

#### 4. Provider Diversity
```
Use Case: Testing multiple AI perspectives on complex problems
Workflow:
  1. Claude Code for initial analysis
  2. OpenCode.ai with GPT-4 for alternative approach
  3. OpenCode.ai with Gemini for third opinion
```

#### 5. Offline/Air-Gapped Development
```
Scenario: No internet or restricted network
Solution: OpenCode.ai with local models (Ollama, LM Studio)
```

---

## Supported AI Providers

OpenCode.ai connects to these providers (configure via `~/.opencode/config.json`):

### Cloud Providers

| Provider | Model Examples | Context | Cost | Speed |
|----------|---------------|---------|------|-------|
| **Anthropic** | Claude 3.5 Sonnet, Opus | 200K | High | Fast |
| **OpenAI** | GPT-4 Turbo, GPT-4o | 128K | High | Fast |
| **Google** | Gemini 1.5 Pro, Flash | 2M | Med | Fast |
| **Groq** | Llama 3 70B, Mixtral | 32K | Low | Ultra Fast |
| **AWS Bedrock** | Claude, Llama, Titan | Varies | Med | Fast |
| **Azure OpenAI** | GPT-4, GPT-3.5 | 128K | High | Fast |
| **OpenRouter** | 100+ models | Varies | Varies | Varies |

### Local Models (Offline)

| Provider | Model Examples | Context | Cost | Speed |
|----------|---------------|---------|------|-------|
| **Ollama** | Llama 3, CodeLlama, Mistral | 32K | Free | Med |
| **LM Studio** | Any GGUF model | Varies | Free | Med |
| **llama.cpp** | Llama, CodeLlama | 32K | Free | Fast |

---

## Installation & Setup

### 1. Install OpenCode CLI

```bash
# Using npm (recommended)
npm install -g opencode-ai

# Or using Homebrew (macOS)
brew install opencode-ai/tap/opencode

# Or download binary from GitHub releases
# https://github.com/opencode-ai/opencode/releases
```

### 2. Install VS Code Extension (Recommended)

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

### 3. Verify Installation

```bash
opencode --version
# Expected: opencode version 0.x.x
```

### 3. Initialize Configuration

```bash
opencode init

# Creates ~/.opencode/config.json with default settings
```

### 4. Configure Primary Fallback Provider

Edit `~/.opencode/config.json`:

```json
{
  "providers": {
    "primary": {
      "type": "anthropic",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 8192
    },
    "fallback": {
      "type": "openai",
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4-turbo-preview",
      "maxTokens": 4096
    },
    "cost-effective": {
      "type": "groq",
      "apiKey": "${GROQ_API_KEY}",
      "model": "llama3-70b-8192",
      "maxTokens": 8192
    },
    "local": {
      "type": "ollama",
      "baseUrl": "http://localhost:11434",
      "model": "codellama:34b"
    }
  },
  "defaultProvider": "primary",
  "agents": {
    "build": {
      "provider": "primary",
      "systemPrompt": "You are an expert full-stack developer specializing in Next.js, TypeScript, and React."
    },
    "plan": {
      "provider": "cost-effective",
      "systemPrompt": "You are a software architect focused on planning and design."
    }
  }
}
```

### 5. Set Environment Variables

Add to `.env.local` (project-level):

```bash
# OpenCode.ai Providers (Fallback)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AI...
```

Add to `~/.zshrc` or `~/.bashrc` (global):

```bash
# OpenCode.ai configuration
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

### Estimated Costs per Phase 4 Task

| Task | Claude Code | OpenCode (GPT-4) | OpenCode (Groq) | OpenCode (Local) |
|------|-------------|------------------|-----------------|------------------|
| **Phase 4.1** (6 hrs) | $15-20 | $12-15 | $0.50-1.00 | $0 |
| **Phase 4.2** (4 hrs) | $10-15 | $8-10 | $0.30-0.50 | $0 |
| **Phase 4.4** (5 hrs) | $12-18 | $10-12 | $0.40-0.60 | $0 |
| **Total Phase 4** | $50-75 | $40-50 | $2-5 | $0 |

**Savings**: 50-95% by using OpenCode.ai with cost-effective providers

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
