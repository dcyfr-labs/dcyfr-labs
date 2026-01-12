# OpenCode.ai Integration for DCYFR Labs

**Multi-provider AI fallback system with GitHub Copilot integration (GPT-5 Mini + Raptor Mini).**

---

## Quick Start

### 1. Install OpenCode Extension

```bash
# VS Code extension
code --install-extension sst-dev.opencode

# Or install via UI: Extensions → Search "OpenCode.ai"
```

### 2. Authenticate with GitHub Copilot

OpenCode uses device code authentication (no API key required):

```bash
# Launch OpenCode
opencode

# In OpenCode interface, run:
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

### 3. Verify Setup

```bash
# Health check
npm run opencode:health

# Expected: ✅ GitHub Copilot connected
```

### 4. Start Using OpenCode

```bash
# Launch with GitHub Copilot (GPT-5 Mini)
opencode --preset dcyfr-feature

# Or use keyboard shortcut in VS Code
# Cmd+Esc (macOS) / Ctrl+Esc (Windows/Linux)
```

---

## Common Workflows

### Development with GitHub Copilot

```bash
# Feature implementation (GPT-5 Mini, 16K context)
opencode --preset dcyfr-feature

# Quick fixes (Raptor Mini, 8K context, fine-tuned for code)
opencode --preset dcyfr-quick

# Validate before committing
npm run check:opencode

# If violations, auto-fix
npm run lint -- --fix
```

### Premium Model Escalation

```bash
# Save current session
npm run session:save opencode "Feature X" implementation "30min"

# Switch to Claude Sonnet for complex logic
# In OpenCode: /connect → Select "Claude Sonnet 4"

# Restore session context
npm run session:restore opencode
```

### Multi-Model Comparison

```bash
# Implement with GPT-5 Mini
opencode --preset dcyfr-feature

# Compare with Claude Sonnet (if needed)
# Switch provider via /connect menu

# Merge best approaches from both
```

---

## Available Providers

| Provider | Cost | Context | Quality | Speed | Best For |
|----------|------|---------|---------|-------|----------|
| **GitHub Copilot (GPT-5 Mini)** | $0* | 16K | 95% | Fast | 80% of development |
| **GitHub Copilot (Raptor Mini)** | $0* | 8K | 90% | Very Fast | Quick fixes, refactoring |
| **Claude Sonnet 4** | $0* | 200K | 98% | Fast | Complex logic, security |

**Included with GitHub Copilot subscription (0 cost multiplier)*

**Recommendation**: Use GPT-5 Mini for routine work, escalate to Claude Sonnet for complex/security tasks.

---

## NPM Scripts

```bash
# Validation
npm run check:opencode          # Full validation (STRICT + FLEXIBLE)
npm run check                   # Standard validation (type + lint + test)

# Session Management
npm run session:save opencode "task" <phase> <estimate>
npm run session:restore <source-agent> opencode

# Health Checks
npm run opencode:health         # Check GitHub Copilot connection

# Provider Management
opencode /connect               # Change provider (GitHub Copilot ↔ Claude ↔ etc.)
opencode /models                # List available models
```

---

## Configuration

### Provider Presets (`.opencode/config.json`)

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

**Authentication**: Device code flow (no API keys in config)

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "opencode.defaultPreset": "dcyfr-feature",
  "opencode.autoSaveSession": true
}
```

---

## Documentation

### Patterns
- [Provider Selection](patterns/PROVIDER_SELECTION.md) - Decision tree for model selection
- [VS Code Integration](patterns/VS_CODE_INTEGRATION.md) - Extension setup & keyboard shortcuts

### Enforcement
- [Hybrid Enforcement](enforcement/HYBRID_ENFORCEMENT.md) - STRICT vs. FLEXIBLE rules
- [Enhanced Validation](enforcement/VALIDATION_ENHANCED.md) - Manual checklists for GitHub Copilot
- [Quality Gates](enforcement/QUALITY_GATES.md) - Pre-commit validation by provider

### Workflows
- [Session Handoff](workflows/SESSION_HANDOFF.md) - Switching between AI models
- [Cost Optimization](workflows/COST_OPTIMIZATION.md) - Strategic model usage (80/20 rule)
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

**Use GitHub Copilot (GPT-5 Mini) for 80% of work:**
- Bug fixes following existing patterns
- Refactoring within established architecture
- UI updates using design system
- Documentation
- Adding tests

**Use premium models (Claude Sonnet) for 20% of work:**
- Security-sensitive changes (auth, API keys)
- Complex architectural decisions
- Breaking changes
- Emergency production fixes
- Performance optimization requiring benchmarks

### Expected Value

```
GitHub Copilot subscription: $10-20/month (fixed cost)
All models at 0 multiplier: No usage fees
Claude Sonnet (when needed): 1x multiplier (occasional use)

Benefit: Unlimited GPT-5 Mini + Raptor Mini usage at no extra cost
```

**No cost tracking needed** - GitHub Copilot models are included with subscription.

---

## Enforcement Rules

### STRICT Rules (Hard Block)

These violations **must be fixed** before committing:

1. **Design Tokens** - All visual properties use `@/design-system/tokens`
2. **PageLayout** - 90% of pages use `<PageLayout>` wrapper
3. **Barrel Exports** - All imports use barrel exports (no deep imports)
4. **Test Data** - No fabricated data in production environment
5. **Emoji Usage** - No emojis in public-facing content (use React icons)

**Auto-detection**: `npm run check:opencode`

### FLEXIBLE Rules (Warn Only)

These violations generate warnings (reviewed during PR):

6. **API Patterns** - 80% of POST routes should use Inngest (Validate→Queue→Respond)
7. **Test Coverage** - 99% test pass rate target (strategic skips allowed)

**Manual review**: See [VALIDATION_ENHANCED.md](enforcement/VALIDATION_ENHANCED.md)

---

## Troubleshooting

### GitHub Copilot Connection Issues

```bash
# Error: Not authenticated

# Fix: Re-authenticate via device code
opencode
/connect
# Select "GitHub Copilot"
# Follow authentication flow

# Verify
opencode /models
# Should show: gpt-5-mini, raptor-mini, etc.
```

### Model Not Available

```bash
# Error: Model not found

# Check available models
opencode /models

# Ensure GitHub Copilot subscription is active
# Visit: https://github.com/settings/copilot

# Restart VS Code if needed
```

### Validation Failures

```bash
# STRICT rule violations detected

# Auto-fix ESLint violations
npm run lint -- --fix

# Re-validate
npm run check:opencode

# If still failing, review manually or escalate
npm run session:save opencode "Issue X" blocked "15min"
# Switch to Claude Code or Claude (General) for investigation
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
- **GitHub Copilot**: [github.com/features/copilot](https://github.com/features/copilot)
- **Authentication Help**: [github.com/login/device](https://github.com/login/device)

---

## Status

- **Version**: 2.0.0 (GitHub Copilot Integration)
- **Last Updated**: January 11, 2026
- **Maintainer**: Architecture Team
- **Status**: Production Ready ✅

---

**Next Steps:**

1. Authenticate with GitHub Copilot: `opencode` → `/connect`
2. Review [PROVIDER_SELECTION.md](patterns/PROVIDER_SELECTION.md) decision tree
3. Start development: `opencode --preset dcyfr-feature`
4. Validate before commit: `npm run check:opencode`

**Happy coding with AI! 🚀**
