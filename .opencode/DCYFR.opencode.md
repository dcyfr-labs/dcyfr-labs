# DCYFR OpenCode.ai Agent

**Version:** 1.0.0 (Modular)  
**Last Updated:** January 5, 2026  
**Purpose:** Production-ready feature implementation with multi-provider AI fallback support and session state tracking

---

## 🎯 What This Agent Does

DCYFR OpenCode.ai is a **fallback AI agent** that enables continuous development when Claude Code encounters rate limits or token exhaustion. It provides:

- ✅ **Multi-provider flexibility** - Use free models (Groq Llama 3.3 70B) or offline models (CodeLlama 34B)
- ✅ **Cost optimization** - 10-100x cheaper development with budget providers
- ✅ **Offline support** - Continue development without internet via local models
- ✅ **Session state tracking** - Seamless handoffs between agents (Claude ↔ OpenCode ↔ Copilot)
- ✅ **DCYFR pattern enforcement** - Strict design token, layout, and import rules maintained
- ✅ **Enhanced validation** - Additional quality checks for free/offline provider output

---

## 🚀 When to Use This Agent

### ✅ Use OpenCode.ai for:

- **Claude Code rate limited** - Hit API limits or token budget exhausted
- **Extended sessions** - Development work lasting 6+ hours
- **Cost optimization** - Use free Groq models for planning, documentation, refactoring
- **Offline development** - Work without internet using Ollama local models
- **Provider diversity** - Test multiple AI perspectives (Llama 3.3, GPT-4, Gemini)

### ❌ Don't use OpenCode.ai for:

- **Initial implementation** - Prefer Claude Code for first pass (best quality)
- **Quick inline suggestions** - Use GitHub Copilot instead (faster, real-time)
- **Complex architecture decisions** - Use Claude (General) for deep research
- **When Claude Code is available** - Always prefer primary agent when possible

**See:** [AGENTS.md](../AGENTS.md) for complete multi-tier AI strategy

---

## 🛡️ Core Rules Summary

DCYFR enforces **7 core rules** with **hybrid enforcement** (strict + flexible):

### STRICT Rules (Hard Block on Violation)

These rules are **NON-NEGOTIABLE** regardless of provider used:

1. **Design Tokens** - Use `SPACING`, `TYPOGRAPHY`, `CONTAINER_WIDTHS` only (no hardcoded values)
2. **Layouts** - Use `PageLayout` for 90% of pages (exceptions: ArticleLayout, ArchiveLayout)
3. **Imports** - Barrel exports only (import from `@/components/blog` not `@/components/blog/post-list`)
4. **Test Data Prevention** - All test data must have environment checks (`NODE_ENV` + `VERCEL_ENV`)
5. **No Emojis** - Public content uses React icons from `lucide-react` only

### FLEXIBLE Rules (Warning Only)

These rules are **strongly recommended** but validated manually:

6. **API Routes** - Follow Validate→Queue→Respond pattern with Inngest
7. **Testing** - Maintain ≥99% test pass rate target

**See:** [enforcement/HYBRID_ENFORCEMENT.md](enforcement/HYBRID_ENFORCEMENT.md) for detailed enforcement strategy

---

## ⚡ Quick Commands

### Start OpenCode Session

```bash
# Use default preset (dcyfr-feature with Groq Llama 3.3 70B)
opencode

# Use specific preset
opencode --preset dcyfr-feature    # Feature implementation (Groq 3.3 70B)
opencode --preset dcyfr-plan       # Planning mode (Groq 3.1 70B)
opencode --preset dcyfr-quick      # Quick fixes (Groq SpecDec)
opencode --preset dcyfr-offline    # Offline work (CodeLlama 34B)
```

### Session State Management

```bash
# Save current session before handoff
npm run session:save opencode "Implementing blog filter" implementation "30min"

# Restore session from another agent
npm run session:restore claude opencode

# View session state
cat .opencode/.session-state.json | jq
```

### Validation

```bash
# Standard validation (all agents)
npm run check

# Enhanced validation (OpenCode free/offline providers)
npm run check:opencode

# Provider health check
npm run opencode:health
```

---

## 📚 Modular Documentation

### Patterns (How to Use OpenCode Effectively)

| Document | Covers |
|----------|--------|
| [**PROVIDER_SELECTION.md**](patterns/PROVIDER_SELECTION.md) | Decision tree for choosing providers, free vs premium trade-offs |
| [**VS_CODE_INTEGRATION.md**](patterns/VS_CODE_INTEGRATION.md) | Extension setup, keyboard shortcuts, file references |
| [**OFFLINE_DEVELOPMENT.md**](patterns/OFFLINE_DEVELOPMENT.md) | Ollama setup, model selection, offline workflows |

### Enforcement (Quality Gates & Validation)

| Document | Covers |
|----------|--------|
| [**HYBRID_ENFORCEMENT.md**](enforcement/HYBRID_ENFORCEMENT.md) | Strict vs flexible rules, provider capabilities |
| [**VALIDATION_ENHANCED.md**](enforcement/VALIDATION_ENHANCED.md) | Budget provider validation, manual review procedures |
| [**QUALITY_GATES.md**](enforcement/QUALITY_GATES.md) | Pre-completion checklists, provider-specific requirements |

### Workflows (Operational Procedures)

| Document | Covers |
|----------|--------|
| [**SESSION_HANDOFF.md**](workflows/SESSION_HANDOFF.md) | Agent transitions, context preservation, git integration |
| [**COST_OPTIMIZATION.md**](workflows/COST_OPTIMIZATION.md) | Free model strategies, usage tracking, ROI analysis |
| [**TROUBLESHOOTING.md**](workflows/TROUBLESHOOTING.md) | Common issues, recovery procedures, quality problems |

---

## 🔄 Typical Workflows

### Workflow 1: Claude Code Rate Limit → OpenCode Fallback

```
1. Hit Claude Code rate limit mid-feature
2. Save session: npm run session:save claude "Add blog filter" implementation "1h"
3. Start OpenCode: opencode --preset dcyfr-feature
4. Continue work with free Groq model
5. Complete feature, run enhanced validation: npm run check:opencode
6. Restore to Claude when available: npm run session:restore opencode claude
```

### Workflow 2: Cost-Optimized Planning

```
1. Use cheap model for planning: opencode --preset dcyfr-plan
2. Generate architecture plan and file list
3. Switch to premium model for implementation: Use Claude Code
4. Validate with budget model: opencode --preset dcyfr-feature (review changes)
```

### Workflow 3: Offline Development

```
1. Pull offline model: ollama pull codellama:34b-instruct
2. Start offline session: opencode --preset dcyfr-offline
3. Reference .github/agents/ docs for patterns (no tool access)
4. Manual validation required (run npm run check:opencode when online)
```

---

## 📋 Pre-Completion Validation

### Standard Checklist (All Providers)

- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests ≥99% pass rate (`npm run test:run`)
- [ ] Design tokens ≥90% compliance

### Enhanced Checklist (Free/Offline Providers)

Additional manual review required:

- [ ] Design tokens used (no hardcoded `gap-8`, `text-3xl`, etc.)
- [ ] Barrel imports used (no direct file imports)
- [ ] PageLayout used (unless ArticleLayout/ArchiveLayout justified)
- [ ] Test data has environment checks
- [ ] No emojis in public content (React icons from `lucide-react`)
- [ ] Run: `npm run check:opencode`

**See:** [enforcement/VALIDATION_ENHANCED.md](enforcement/VALIDATION_ENHANCED.md)

---

## 🔗 External Resources

### DCYFR Pattern Documentation

- [**.github/agents/DCYFR.agent.md**](../.github/agents/DCYFR.agent.md) - Full pattern documentation (shared)
- [**.github/agents/patterns/**](../.github/agents/patterns/) - Component, API, testing patterns
- [**.github/agents/enforcement/**](../.github/agents/enforcement/) - Design tokens, approval gates

### Project Documentation

- [**AGENTS.md**](../AGENTS.md) - Multi-tier AI strategy & agent selection
- [**CLAUDE.md**](../CLAUDE.md) - Project context & constraints
- [**docs/ai/quick-reference.md**](../docs/ai/quick-reference.md) - Commands, imports, common patterns

### OpenCode Setup

- [**docs/ai/opencode-fallback-architecture.md**](../docs/ai/opencode-fallback-architecture.md) - Installation & provider setup
- [**README.md**](README.md) - Quick start guide for OpenCode.ai

---

## ✅ Activation Checklist

**Before starting OpenCode work:**

- [ ] Read this hub file for core rules and navigation
- [ ] Check [patterns/PROVIDER_SELECTION.md](patterns/PROVIDER_SELECTION.md) for provider choice
- [ ] Review [enforcement/HYBRID_ENFORCEMENT.md](enforcement/HYBRID_ENFORCEMENT.md) for strict vs flexible rules
- [ ] If handoff: Run `npm run session:restore <source-agent> opencode`
- [ ] Verify provider health: `npm run opencode:health`

**After completing work:**

- [ ] Run enhanced validation: `npm run check:opencode`
- [ ] Complete manual review checklist
- [ ] Save session state: `npm run session:save opencode "task" complete`
- [ ] If handoff: Run `npm run session:restore opencode <target-agent>`

---

## 🎯 Provider Presets

Configured in [config.json](config.json):

| Preset | Provider | Model | Use For |
|--------|----------|-------|---------|
| `dcyfr-feature` | Groq | Llama 3.3 70B Versatile | Feature implementation, bug fixes |
| `dcyfr-plan` | Groq | Llama 3.1 70B | Planning, architecture decisions |
| `dcyfr-quick` | Groq | Llama 3.3 70B SpecDec | Quick fixes, fast iterations |
| `dcyfr-offline` | Ollama | CodeLlama 34B | Offline development, air-gapped work |

**All presets include DCYFR system prompts with pattern enforcement guidance.**

---

**Status:** Production Ready (Modular v1.0)  
**Scope:** dcyfr-labs multi-provider fallback  
**Maintained By:** DCYFR Labs Team

For agent selection guidance, see [AGENTS.md](../AGENTS.md)  
For modular pattern documentation, explore `patterns/`, `enforcement/`, `workflows/` directories
