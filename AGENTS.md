# AGENTS.md - AI Agent & Instruction System

**Centralized management hub for all AI agents, assistants, and instruction files in dcyfr-labs.**

This document serves as the **single source of truth** for discovering, routing, and managing AI instruction sets across the project. It maintains consistency, prevents version conflicts, and ensures optimal agent selection for each task type.

---

## 🎯 Quick Navigation

| Agent | Purpose | Best For | Instructions |
|-------|---------|----------|--------------|
| **GitHub Copilot** | Real-time code completion & quick suggestions | Inline coding, auto-fix, refactoring | [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) |
| **Claude (General)** | Deep research, architecture, complex debugging | System design, documentation, investigation | [`CLAUDE.md`](./CLAUDE.md) |
| **DCYFR (Specialized)** | Production enforcement, pattern validation, strict compliance | Feature work, bug fixes, pattern implementation | [`.github/agents/DCYFR.agent.md`](./.github/agents/DCYFR.agent.md) |

---

## 📋 Instruction Files Registry

### 1. GitHub Copilot Instructions
**File:** [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)  
**Lines:** 240  
**Last Updated:** December 8, 2025  
**Audience:** GitHub Copilot users in VS Code  
**Format:** Quick-reference with 80/20 patterns

**Covers:**
- Essential commands (build, test, lint)
- Most common patterns (PageLayout, design tokens)
- Import strategies (barrel exports)
- API patterns (Inngest integration)
- Decision trees for layouts and metadata

**When to update:**
- New common patterns emerge
- Commands or setup change
- Decision logic shifts

**Version tracking:**
```json
{
  "file": ".github/copilot-instructions.md",
  "format": "copilot-instructions",
  "scope": "quick-reference",
  "coverage": "80/20 most common tasks",
  "source_of_truth": "AGENTS.md",
  "sync_status": "Manual (managed in DCYFR mode)"
}
```

---

### 2. Claude Instructions (Full)
**File:** [`CLAUDE.md`](./CLAUDE.md)  
**Lines:** 175  
**Last Updated:** December 8, 2025  
**Audience:** Claude AI assistant (general tasks)  
**Format:** Narrative + patterns

**Covers:**
- Project context and current focus
- Stack overview
- Essential patterns (layouts, metadata, design tokens)
- Design system rules (mandatory enforcement)
- Key constraints
- Workflow guidelines

**When to update:**
- Project status changes (phases complete, maintenance mode)
- New mandatory constraints
- Workflow changes

**Version tracking:**
```json
{
  "file": "CLAUDE.md",
  "format": "markdown",
  "scope": "general instructions",
  "coverage": "Full project context",
  "source_of_truth": "AGENTS.md",
  "sync_status": "Manual (updated as needed)"
}
```

---

### 3. DCYFR Agent Instructions (Modular v2.0)
**Hub File:** [`.github/agents/DCYFR.agent.md`](./.github/agents/DCYFR.agent.md)  
**Lines:** 195 (hub) + 2600+ (modular files)  
**Last Updated:** December 9, 2025  
**Audience:** DCYFR agent (specialized mode, activated in conversation)  
**Format:** Hub with links to modular documentation

**Hub File (.github/agents/DCYFR.agent.md) Covers:**
- Agent purpose and quick start
- When to use/not use DCYFR
- 5 core rules (Design Tokens, Layouts, Imports, API, Testing)
- Approval gates overview
- DCYFR philosophy
- Links to all modular documentation

**Modular Files Organization:**

#### Patterns Directory (.github/agents/patterns/)
| File | Lines | Covers |
|------|-------|--------|
| [COMPONENT_PATTERNS.md](patterns/COMPONENT_PATTERNS.md) | 466 | Layout selection (PageLayout 90% rule), barrel exports, import strategy, anti-patterns |
| [API_PATTERNS.md](patterns/API_PATTERNS.md) | 405 | Validate→Queue→Respond, Inngest integration, error handling, rate limiting |
| [TESTING_PATTERNS.md](patterns/TESTING_PATTERNS.md) | 370 | 99% pass rate target, strategic skips, when/when-not-to-test, E2E strategy |
| [CODEQL_SUPPRESSIONS.md](patterns/CODEQL_SUPPRESSIONS.md) | 310 | LGTM syntax, false positive patterns, common suppressions, verification |

#### Enforcement Directory (.github/agents/enforcement/)
| File | Lines | Covers |
|------|-------|--------|
| [DESIGN_TOKENS.md](enforcement/DESIGN_TOKENS.md) | 360 | Token enforcement (NON-NEGOTIABLE), categories, ESLint rules, compliance targets |
| [APPROVAL_GATES.md](enforcement/APPROVAL_GATES.md) | 380 | Breaking changes, architecture decisions, security-sensitive work, approval process |
| [VALIDATION_CHECKLIST.md](enforcement/VALIDATION_CHECKLIST.md) | 360 | Pre-completion checks, automated/manual validation, common failures, bypass criteria |

#### Learning Directory (.github/agents/learning/)
| File | Lines | Covers |
|------|-------|--------|
| [PERFORMANCE_METRICS.md](learning/PERFORMANCE_METRICS.md) | 340 | Token budgets, efficiency targets, dashboards, metrics tracking |
| [CONTINUOUS_LEARNING.md](learning/CONTINUOUS_LEARNING.md) | 420 | Pattern recognition, feedback loops, self-improvement triggers, knowledge base evolution |
| [KNOWLEDGE_BASE.md](learning/KNOWLEDGE_BASE.md) | 350 | Session handoff, knowledge transfer, long-term learning, monthly reports |

**When to update:**
- **Hub file:** When changing core rules, philosophy, approval gates, or adding new modular files
- **Pattern files:** When implementing or discovering new architectural patterns
- **Enforcement files:** When enforcement rules change (design tokens, validation gates)
- **Learning files:** When optimizing DCYFR performance or evolving self-improvement strategy

**Version tracking:**
```json
{
  "file": ".github/agents/DCYFR.agent.md",
  "format": "agent-instructions-modular",
  "version": "2.0.0",
  "scope": "specialized-mode-enforcement",
  "coverage": "Production patterns, validation, testing, learning",
  "last_updated": "2025-12-09",
  "source_of_truth": "AGENTS.md",
  "sync_status": "Automatic (embedded in conversation)",
  "modular_structure": {
    "hub": ".github/agents/DCYFR.agent.md (195 lines)",
    "patterns": 4,
    "enforcement": 3,
    "learning": 3,
    "total_modular_lines": 2600
  }
}
```

---

## 🔄 Agent Selection Logic

### Decision Tree: Which Instructions to Use?

```
START: "I need AI help with dcyfr-labs"
  │
  ├─ Real-time in VS Code while coding?
  │  └─ YES → Use GitHub Copilot
  │     └─ Reference: .github/copilot-instructions.md
  │
  ├─ Deep architectural/system design question?
  │  └─ YES → Use Claude (General)
  │     └─ Reference: CLAUDE.md + docs/ai/
  │
  ├─ Building feature following strict patterns?
  │  └─ YES → Use DCYFR (Specialized)
  │     └─ Reference: .github/agents/DCYFR.agent.md
  │
  ├─ Bug fix with compliance enforcement?
  │  └─ YES → Use DCYFR (Specialized)
  │     └─ Reference: .github/agents/DCYFR.agent.md
  │
  └─ General investigation/documentation?
     └─ Use Claude (General)
        └─ Reference: CLAUDE.md + docs/
```

### Quick Rules

| Scenario | Agent | Why |
|----------|-------|-----|
| "Complete this code snippet" | Copilot | Real-time, inline |
| "I need design token suggestions" | Copilot | Quick patterns |
| "Refactor this function" | Copilot | Line-level edits |
| "What's our architecture pattern?" | Claude | Deep context needed |
| "How should we approach X?" | Claude | Investigation mode |
| "Create new /bookmarks page" | DCYFR | Pattern enforcement |
| "Fix SPACING token violation" | DCYFR | Compliance validation |
| "Bug in PostCard component" | DCYFR | Root cause + test fix |
| "Should I use PageLayout?" | DCYFR | Decision trees available |

---

## 🔗 Instruction File Relationships

```
AGENTS.md (This file)
│
├─ Entry point for all AI work
├─ Routes to correct instructions
├─ Maintains version tracking
└─ Ensures consistency
   │
   ├─ .github/copilot-instructions.md
   │  ├─ For: Real-time VS Code assistance
   │  ├─ Focus: Quick patterns, 80/20 rules
   │  ├─ Source: DCYFR consensus, manual updates
   │  └─ Sync: Check against DCYFR.agent.md quarterly
   │
   ├─ CLAUDE.md
   │  ├─ For: General Claude conversation context
   │  ├─ Focus: Project status, constraints
   │  ├─ Source: Project lead updates
   │  └─ Sync: Update when project phase changes
   │
   ├─ .github/agents/DCYFR.agent.md (HUB v2.0 Modular)
   │  ├─ For: Specialized mode in conversation
   │  ├─ Focus: Core rules, philosophy, approval gates
   │  ├─ Source: Architecture decisions (docs/ai/)
   │  ├─ Sync: Automatic (embedded in session)
   │  └─ Links to:
   │     │
   │     ├─ .github/agents/patterns/ (4 files)
   │     │  ├─ COMPONENT_PATTERNS.md (layouts, imports, exports)
   │     │  ├─ API_PATTERNS.md (Inngest, validation, responses)
   │     │  ├─ TESTING_PATTERNS.md (99% target, when/when-not-to-test)
   │     │  └─ CODEQL_SUPPRESSIONS.md (LGTM syntax, false positives)
   │     │
   │     ├─ .github/agents/enforcement/ (3 files)
   │     │  ├─ DESIGN_TOKENS.md (token enforcement, categories)
   │     │  ├─ APPROVAL_GATES.md (breaking changes, security)
   │     │  └─ VALIDATION_CHECKLIST.md (pre-completion checks)
   │     │
   │     └─ .github/agents/learning/ (3 files)
   │        ├─ PERFORMANCE_METRICS.md (token budgets, dashboards)
   │        ├─ CONTINUOUS_LEARNING.md (pattern recognition, self-improvement)
   │        └─ KNOWLEDGE_BASE.md (session handoff, long-term learning)
   │
   ├─ docs/ai/ (Referenced by all)
   │  ├─ QUICK_REFERENCE.md
   │  ├─ COMPONENT_PATTERNS.md
   │  ├─ ENFORCEMENT_RULES.md
   │  ├─ DESIGN_SYSTEM.md
   │  └─ DECISION_TREES.md
   │
   └─ docs/templates/ (Copy-paste resources)
      ├─ NEW_PAGE.tsx.md
      ├─ ARCHIVE_PAGE.tsx.md
      ├─ API_ROUTE.ts.md
      └─ [etc]
```

---

## 📊 Instruction File Comparison

| Aspect | Copilot | Claude | DCYFR |
|--------|---------|--------|-------|
| **Format** | Quick-ref, 80/20 | Narrative, full context | Modular hub v2.0 |
| **Lines** | 240 | 175 | 195 (hub) + 2600 (modular) |
| **Update Frequency** | Quarterly or as patterns emerge | On phase changes | On enforcement changes |
| **Scope** | Real-time coding patterns | Project-wide context | Strict pattern validation |
| **Decision Support** | Basic (layouts, imports) | Exploratory (why/how) | Systematic (10 modular files) |
| **Enforcement** | ESLint violations | Guidelines | Mandatory gates + tests |
| **Best For** | Speed (seconds) | Understanding (minutes) | Rigor (hours) |
| **Activation** | Always active in VS Code | Always available | Conversation mode |
| **Structure** | Monolithic | Narrative | Hub + 3 directories (patterns, enforcement, learning) |

---

## 🔄 Synchronization & Maintenance

### File Ownership & Update Responsibility

| File | Owner | Update Trigger | Frequency |
|------|-------|---|----------|
| `AGENTS.md` | Project Lead | Quarterly review or new agent | Quarterly |
| `.github/copilot-instructions.md` | DCYFR Mode | Pattern evolution | Quarterly |
| `CLAUDE.md` | Project Lead | Phase changes, constraints | As needed |
| `.github/agents/DCYFR.agent.md` | Architecture | Enforcement changes | As needed |

### Sync Checklist

**Quarterly (Every 3 months):**
- [ ] Review patterns in DCYFR.agent.md
- [ ] Update copilot-instructions.md if needed
- [ ] Verify decision trees match implementation
- [ ] Check docs/ai/ for new references
 - [ ] Confirm `ai-instructions-sync` workflow is configured to run sync & validation
 - [ ] Confirm `mcp-server-check` workflow is configured for scheduled health checks

**On Breaking Changes:**
- [ ] Update DCYFR.agent.md
- [ ] Update CLAUDE.md constraints
- [ ] Consider copilot-instructions.md impact
- [ ] Update docs/ai/ENFORCEMENT_RULES.md
- [ ] Add entry to AGENTS.md "Recent Updates"

**On Phase Completion:**
- [ ] Update CLAUDE.md "Current Focus"
- [ ] Archive completed patterns
- [ ] Update docs/operations/todo.md
- [ ] Review all instruction alignment

### Version Tracking Format

Each instruction file maintains this metadata:

```json
{
  "file": "path/to/file.md",
  "format": "instruction-type",
  "scope": "application-scope",
  "coverage": "what-it-covers",
  "last_updated": "YYYY-MM-DD",
  "version": "semver",
  "source_of_truth": "AGENTS.md",
  "sync_status": "manual|automatic|quarterly",
  "related_files": ["path/to/related/file.md"]
}
```

---

## 🚀 Using This System

### For Users Starting Work

1. **Determine task type** - Quick coding vs. design vs. implementation?
2. **Reference decision tree** (above) to pick agent
3. **Check appropriate instruction file** using registry
4. **Work within that context** - Don't mix agents

### For Maintainers

1. **Before pattern change** - Update DCYFR.agent.md
2. **Every quarter** - Run sync checklist
3. **On release** - Review all instruction alignment
4. **When adding features** - Update appropriate instruction file

### For New Contributors

1. Start with [`CLAUDE.md`](./CLAUDE.md) for project context
2. Use decision tree (above) to pick your agent
3. Reference the mapped instruction file
4. Consult [`docs/ai/QUICK_REFERENCE.md`](docs/ai/QUICK_REFERENCE.md) for commands

---

## 📚 Related Documentation

**Foundational (Read First):**
- [`CLAUDE.md`](./CLAUDE.md) - Project context & constraints
- [`docs/ai/QUICK_REFERENCE.md`](docs/ai/QUICK_REFERENCE.md) - Commands & imports
- [`docs/ai/DECISION_TREES.md`](docs/ai/DECISION_TREES.md) - Visual decision flowcharts
 - [`docs/ai/MCP_CHECKS.md`](docs/ai/MCP_CHECKS.md) - MCP server health checks & CI guidance

**Deep Dives (Reference as Needed):**
- [`docs/ai/COMPONENT_PATTERNS.md`](docs/ai/COMPONENT_PATTERNS.md) - Layout & import patterns
- [`docs/ai/ENFORCEMENT_RULES.md`](docs/ai/ENFORCEMENT_RULES.md) - Design token validation
- [`docs/ai/DESIGN_SYSTEM.md`](docs/ai/DESIGN_SYSTEM.md) - Token system deep dive

**Practical (Copy-Paste Ready):**
- [`docs/templates/`](docs/templates/) - Component, page, and API templates
- [`docs/operations/todo.md`](docs/operations/todo.md) - Current priorities
- `scripts/check-mcp-servers.mjs` - MCP server health checks (dev/CI)

---

## 📋 Recent Updates

### December 9, 2025
- ✅ **Enhanced automation system**
  - Enabled full Dependabot auto-merge for safe updates
  - Created `scheduled-instruction-sync.yml` for quarterly doc updates
  - Created `automated-metrics-collection.yml` for continuous metrics
  - Created `automated-security-checks.yml` for daily security scanning
  - Added `docs/automation/AUTOMATED_UPDATES.md` with complete automation guide
- ✅ Completed modular refactoring of DCYFR.agent.md
  - Extracted 10 modular documentation files
  - Created 3 directories: patterns/, enforcement/, learning/
  - Reduced hub from 719 to 195 lines
  - Total modular content: 2600+ lines across 10 files
- ✅ Updated AGENTS.md with modular file structure and automation reference

### December 8, 2025
- ✅ Created `AGENTS.md` as centralized hub
- ✅ Documented all three instruction files
- ✅ Established decision tree for agent selection
- ✅ Created sync checklist and maintenance procedures
- ✅ Mapped file relationships and ownership

---

## 🤖 Automated Updates & Maintenance

dcyfr-labs uses a **comprehensive multi-layer automation system** to keep dependencies, documentation, and metrics current automatically.

**Full Documentation:** [`docs/automation/AUTOMATED_UPDATES.md`](docs/automation/AUTOMATED_UPDATES.md)

### What's Automated

| System | Frequency | Purpose |
|--------|-----------|---------|
| **Dependabot Updates** | Weekly | Auto-updates npm and GitHub Actions |
| **Auto-Merge Workflow** | Per PR | Safely auto-merges patches & minor updates |
| **Instruction Sync** | Monthly | Keeps AI docs in sync with project metrics |
| **Security Pre-Checks** | Daily | Scans for vulnerabilities |
| **Test Metrics** | Per run | Captures test & performance data |
| **Lighthouse CI** | Per push | Validates performance & accessibility |

### Quick Reference

```bash
# Manually trigger instruction sync
npm run sync:ai

# Check MCP server health
npm run mcp:check

# Run all quality gates
npm run check
```

**For detailed automation setup and configuration, see:** [`docs/automation/AUTOMATED_UPDATES.md`](docs/automation/AUTOMATED_UPDATES.md)

---

## ❓ FAQ

**Q: Which file should I read first?**  
A: Start with [`CLAUDE.md`](./CLAUDE.md) for context, then use the decision tree in this file to pick your agent.

**Q: Can I use multiple agents?**  
A: Yes, but serially (not simultaneously). Finish one task with one agent before switching.

**Q: What if instructions conflict?**  
A: DCYFR (specialized) supersedes Claude (general) for DCYFR-specific work. Copilot is always for quick, inline tasks.

**Q: How do I report an instruction issue?**  
A: Create an issue in `.github/ISSUE_TEMPLATE/` or update the relevant instruction file directly with a PR.

**Q: When should AGENTS.md be updated?**  
A: Quarterly automatic review, or immediately when adding new agents or major instruction changes.

---

## 🔐 Consistency Rules

**Always:**
- [ ] Reference AGENTS.md as source of truth
- [ ] Keep file paths absolute (from repo root)
- [ ] Update sync metadata when changing instructions
- [ ] Test decision tree before committing changes

**Never:**
- [ ] Create instructions without updating AGENTS.md
- [ ] Have conflicting patterns in different files
- [ ] Leave sync status undefined
- [ ] Update instructions in conversation without PR

---

**Status:** Production Ready  
**Last Reviewed:** December 8, 2025  
**Next Review:** March 8, 2026 (Quarterly)

For issues, updates, or new agents: Submit PR with AGENTS.md changes first.
