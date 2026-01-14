# DCYFR OpenCode.ai Agent

**Version:** 2.0.0 (GitHub Copilot Integration)  
**Last Updated:** January 11, 2026  
**Purpose:** Production-ready feature implementation with GitHub Copilot integration and session state tracking

---

## 🎯 What This Agent Does

DCYFR OpenCode.ai is a **fallback AI agent** that enables continuous development when Claude Code encounters rate limits or token exhaustion. It provides:

- ✅ **GitHub Copilot integration** - Access GPT-5 Mini and Raptor Mini (free with subscription)
- ✅ **Code-specialized models** - Fine-tuned for coding tasks with 16K context windows
- ✅ **Zero additional cost** - Free models included with existing Copilot subscription
- ✅ **Session state tracking** - Seamless handoffs between agents (Claude ↔ OpenCode ↔ Copilot)
- ✅ **DCYFR pattern enforcement** - Strict design token, layout, and import rules maintained
- ✅ **Enhanced validation** - Additional quality checks for GitHub Copilot output

---

## 🚀 When to Use This Agent

### ✅ Use OpenCode.ai for:

- **Claude Code rate limited** - Hit API limits or token budget exhausted
- **Extended sessions** - Development work lasting 6+ hours
- **Cost optimization** - Use GitHub Copilot models included with subscription
- **Provider diversity** - Test multiple AI perspectives (GPT-5 Mini, Claude, Gemini)

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
6. **Documentation Location** - All .md files go ONLY in `/docs` folder (NOT in root)

### FLEXIBLE Rules (Warning Only)

These rules are **strongly recommended** but validated manually:

7. **API Routes** - Follow Validate→Queue→Respond pattern with Inngest
8. **Testing** - Maintain ≥99% test pass rate target

---

## 📁 Documentation Placement Rule (MANDATORY)

**ALL documentation must be created ONLY in the `/docs` folder structure.**

### Correct Placement
```
✅ docs/analysis/findings.md
✅ docs/security/private/audit.md
✅ docs/architecture/ADR-001.md
✅ docs/[category]/private/sensitive-report.md
```

### Incorrect Placement (BLOCKED)
```
❌ ANALYSIS.md (root - commits will be rejected)
❌ ./REPORT.md (root - pre-commit hook blocks)
❌ FINDINGS.md (root - fails validation)
```

### When Creating Documentation

1. Determine category (analysis, security, architecture, operations, etc.)
2. Create in: `docs/[category]/FILENAME.md`
3. If sensitive/internal: `docs/[category]/private/FILENAME.md`
4. Never create in root directory
5. Update `docs/README.md` index if new section

### Enforcement

- **Pre-commit hook**: Blocks root-level .md files (except allowed exceptions)
- **Validation script**: `npm run validate:docs-structure` audits structure
- **See:** `docs/governance/AGENT_DOCUMENTATION_ENFORCEMENT.md`

### Supported Categories (30+)

accessibility, analysis, api, architecture, authentication, automation, backlog, blog, components, content, debugging, design, design-system, features, governance, maintenance, mcp, operations, optimization, performance, platform, proposals, refactoring, research, security, sessions, templates, testing, troubleshooting

**See:** [enforcement/HYBRID_ENFORCEMENT.md](enforcement/HYBRID_ENFORCEMENT.md) for detailed enforcement strategy

---

## ⚡ Quick Commands

### Start OpenCode Session

```bash
# Use default preset (dcyfr-feature with GitHub Copilot GPT-5 Mini)
opencode

# Use specific preset
opencode --preset dcyfr-feature    # Feature implementation (GPT-5 Mini, 16K context)
opencode --preset dcyfr-quick      # Quick fixes (Raptor Mini, 8K context)
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

# Enhanced validation (GitHub Copilot providers)
npm run check:opencode

# Provider health check
npm run opencode:health
```

---

## 📚 Modular Documentation

### Patterns (How to Use OpenCode Effectively)

| Document | Covers |
|----------|--------|
| [**PROVIDER_SELECTION.md**](patterns/PROVIDER_SELECTION.md) | Decision tree for choosing providers, GitHub Copilot vs premium trade-offs |
| [**VS_CODE_INTEGRATION.md**](patterns/VS_CODE_INTEGRATION.md) | Extension setup, keyboard shortcuts, file references |

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
4. Continue work with GitHub Copilot GPT-5 Mini
5. Complete feature, run enhanced validation: npm run check:opencode
6. Restore to Claude when available: npm run session:restore opencode claude
```

### Workflow 2: Cost-Optimized Planning

```
1. Use GitHub Copilot for planning: opencode --preset dcyfr-feature
2. Generate architecture plan and file list
3. Switch to Claude Code for complex implementation if needed
4. Validate with GitHub Copilot: opencode --preset dcyfr-feature (review changes)
```

### Workflow 3: Multi-Provider Comparison

```
1. Implement feature with GitHub Copilot: opencode --preset dcyfr-feature
2. Review with Claude Sonnet (premium): Switch to Claude via OpenCode provider menu
3. Compare outputs and merge best approaches
4. Final validation: npm run check:opencode
```

---

## 📋 Pre-Completion Validation

### Standard Checklist (All Providers)

- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests ≥99% pass rate (`npm run test:run`)
- [ ] Design tokens ≥90% compliance

### Enhanced Checklist (GitHub Copilot Providers)

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

| Preset | Provider | Model | Context | Use For |
|--------|----------|-------|---------|---------|
| `dcyfr-feature` | GitHub Copilot | GPT-5 Mini | 16K | Feature implementation, bug fixes, planning |
| `dcyfr-quick` | GitHub Copilot | Raptor Mini | 8K | Quick fixes, fast iterations, refactoring |

**All presets include DCYFR system prompts with pattern enforcement guidance.**

**Note:** Both models included with GitHub Copilot subscription (0 cost multiplier).

---

**Status:** Production Ready (Modular v1.0)  
**Scope:** dcyfr-labs multi-provider fallback  
**Maintained By:** DCYFR Labs Team

For agent selection guidance, see [AGENTS.md](../AGENTS.md)  
For modular pattern documentation, explore `patterns/`, `enforcement/`, `workflows/` directories
