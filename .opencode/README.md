# OpenCode.ai Integration for DCYFR Labs

**Multi-provider AI fallback system with 75+ models, cost optimization, and offline support.**

---

## Quick Start

### 1. Install OpenCode Extension

```bash
# VS Code extension
code --install-extension sst-dev.opencode

# Or install via UI: Extensions → Search "OpenCode.ai"
```

### 2. Set Up API Keys

```bash
# Add to .env.local (preferred)
echo "GROQ_API_KEY=your_key_here" >> .env.local

# Or export in shell
export GROQ_API_KEY=your_key_here
```

**Get free Groq API key**: [console.groq.com](https://console.groq.com/)

### 3. Verify Setup

```bash
# Health check
scripts/check-provider-health.sh

# Expected: ✅ ALL PROVIDERS HEALTHY
```

### 4. Start Using OpenCode

```bash
# Launch with Groq (free tier)
opencode --preset groq_primary

# Or use keyboard shortcut in VS Code
# Cmd+Esc (macOS) / Ctrl+Esc (Windows/Linux)
```

---

## Common Workflows

### Development with Free Models

```bash
# Feature implementation (Groq free tier)
opencode --preset groq_primary

# Validate before committing
npm run check:opencode

# If violations, auto-fix
npm run lint -- --fix
```

### Offline Development

```bash
# Install Ollama models (one-time setup)
brew install ollama
ollama pull codellama:34b  # Best quality (64GB RAM)
ollama pull qwen2.5-coder:7b  # Balanced (16GB RAM)

# Start Ollama service
ollama serve

# Use offline model
opencode --preset offline_primary

# When back online, validate
scripts/validate-after-fallback.sh
```

### Model Switching (Handoff)

```bash
# Save current session
npm run session:save opencode

# Switch to different model
opencode --preset claude  # Premium escalation

# Restore session context
npm run session:restore opencode
```

---

## Available Providers

| Provider | Cost | Quality | Speed | Best For |
|----------|------|---------|-------|----------|
| **Groq (Llama 3.3 70B)** | Free | 90% | Very Fast | 80% of development |
| **Ollama (CodeLlama 34B)** | Free | 60% | Medium | Offline drafting |
| **Claude Sonnet 3.5** | $0.03/1K | 95% | Fast | Critical 20% |

**Recommendation**: Use Groq for routine work, Claude for complex/security tasks.

---

## NPM Scripts

```bash
# Validation
npm run check:opencode          # Full validation (STRICT + FLEXIBLE)
scripts/validate-after-fallback.sh  # Enhanced validation with manual checklist

# Session Management
npm run session:save <agent>    # Save session state (opencode|claude|copilot)
npm run session:restore <agent> # Restore session state

# Health Checks
scripts/check-provider-health.sh    # Check all providers
scripts/session-handoff.sh <from> <to>  # Combined handoff workflow

# Metrics
npm run metrics:cost-report     # Monthly cost analysis (coming soon)
npm run metrics:roi-analysis    # ROI calculation (coming soon)
```

---

## Configuration

### Provider Presets (`.opencode/config.json`)

```json
{
  "groq_primary": {
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "apiKey": "${GROQ_API_KEY}",
    "description": "Primary free model for feature implementation"
  },
  "groq_speed": {
    "provider": "groq",
    "model": "llama-3.3-70b-specdec",
    "apiKey": "${GROQ_API_KEY}",
    "description": "Fast model for quick fixes"
  },
  "offline_primary": {
    "provider": "ollama",
    "model": "codellama:34b",
    "baseURL": "http://localhost:11434",
    "description": "Offline feature implementation"
  },
  "claude": {
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "apiKey": "${ANTHROPIC_API_KEY}",
    "description": "Premium model for complex tasks"
  }
}
```

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "opencode.rateLimit.delay": 2000,
  "opencode.defaultPreset": "groq_primary",
  "opencode.autoSaveSession": true
}
```

---

## Documentation

### Patterns
- [Provider Selection](patterns/PROVIDER_SELECTION.md) - Decision tree for model selection
- [VS Code Integration](patterns/VS_CODE_INTEGRATION.md) - Extension setup & keyboard shortcuts
- [Offline Development](patterns/OFFLINE_DEVELOPMENT.md) - Ollama workflow guide

### Enforcement
- [Hybrid Enforcement](enforcement/HYBRID_ENFORCEMENT.md) - STRICT vs. FLEXIBLE rules
- [Enhanced Validation](enforcement/VALIDATION_ENHANCED.md) - Manual checklists for free models
- [Quality Gates](enforcement/QUALITY_GATES.md) - Pre-commit validation by provider

### Workflows
- [Session Handoff](workflows/SESSION_HANDOFF.md) - Switching between AI models
- [Cost Optimization](workflows/COST_OPTIMIZATION.md) - Strategic free model usage (80/20 rule)
- [Troubleshooting](workflows/TROUBLESHOOTING.md) - Common issues & fixes

### Hub
- [DCYFR.opencode.md](DCYFR.opencode.md) - Main agent instructions

---

## Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| `Cmd+Esc` (macOS) / `Ctrl+Esc` (Windows) | Launch OpenCode |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | New session |
| `Cmd+Option+K` / `Ctrl+Alt+K` | Add file references |

---

## Cost Optimization

### 80/20 Strategy

**Use free models (Groq/Ollama) for 80% of work:**
- Bug fixes following existing patterns
- Refactoring within established architecture
- UI updates using design system
- Documentation
- Adding tests

**Use premium models (Claude) for 20% of work:**
- Security-sensitive changes (auth, API keys)
- Complex architectural decisions
- Breaking changes
- Emergency production fixes
- Performance optimization requiring benchmarks

### Expected Savings

```
Premium-only cost: $480/month (160h @ $3/hour)
80% Groq, 20% Claude: $96/month (80% savings)
90% Groq, 10% Claude: $48/month (90% savings)
```

**Track your savings**: `npm run metrics:cost-report` (coming soon)

---

## Enforcement Rules

### STRICT Rules (Hard Block)

These violations **must be fixed** before committing:

1. **Design Tokens** - All visual properties use `@/design-system/tokens`
2. **PageLayout** - 90% of pages use `<PageLayout>` wrapper
3. **Barrel Exports** - All imports use barrel exports (no deep imports)
4. **Test Data** - No fabricated data in production environment
5. **Emoji Usage** - No emojis in public-facing content (use React icons)

**Auto-detection**: `scripts/validate-after-fallback.sh`

### FLEXIBLE Rules (Warn Only)

These violations generate warnings (reviewed during PR):

6. **API Patterns** - 80% of POST routes should use Inngest (Validate→Queue→Respond)
7. **Test Coverage** - 99% test pass rate target (strategic skips allowed)

**Manual review**: See [VALIDATION_ENHANCED.md](enforcement/VALIDATION_ENHANCED.md)

---

## Troubleshooting

### Groq Rate Limit

```bash
# Error: Rate limit exceeded (30 requests/minute)

# Fix 1: Wait 60 seconds
sleep 60 && opencode --preset groq_primary

# Fix 2: Switch to alternative model
opencode --preset groq_speed  # Separate rate limit

# Fix 3: Fallback to Ollama
opencode --preset offline_primary
```

### Ollama Service Not Running

```bash
# Error: Connection refused (http://localhost:11434)

# Fix: Start Ollama service
ollama serve  # Foreground
brew services start ollama  # Background (macOS)

# Verify
curl http://localhost:11434/api/tags
```

### Validation Failures

```bash
# STRICT rule violations detected

# Auto-fix ESLint violations
npm run lint -- --fix

# Re-validate
scripts/validate-after-fallback.sh

# If still failing, escalate to premium
npm run session:save opencode
opencode --preset claude
npm run session:restore opencode
```

**More issues**: See [TROUBLESHOOTING.md](workflows/TROUBLESHOOTING.md)

---

## Getting Help

### Internal Resources
- [Quick Reference](../docs/ai/quick-reference.md) - Commands & patterns
- [AGENTS.md](../AGENTS.md) - Multi-tier AI architecture overview
- [Testing Guide](../docs/testing/automated-testing-guide.md) - Test commands

### External Resources
- **OpenCode**: [opencode.ai/docs](https://opencode.ai/docs)
- **Groq**: [console.groq.com/docs](https://console.groq.com/docs)
- **Ollama**: [ollama.com/library](https://ollama.com/library)

---

## Status

- **Version**: 1.0.0
- **Last Updated**: January 5, 2026
- **Maintainer**: Architecture Team
- **Status**: Production Ready ✅

---

**Next Steps:**

1. Run health check: `scripts/check-provider-health.sh`
2. Review [PROVIDER_SELECTION.md](patterns/PROVIDER_SELECTION.md) decision tree
3. Start development: `opencode --preset groq_primary`
4. Validate before commit: `npm run check:opencode`

**Happy coding with AI! 🚀**
