# AGENTS.md - AI Agent & Instruction System

**Centralized management hub for all AI agents, assistants, and instruction files in dcyfr-labs.**

This document serves as the **single source of truth** for discovering, routing, and managing AI instruction sets across the project. It maintains consistency, prevents version conflicts, and ensures optimal agent selection for each task type.

---

## 🎯 Development Strategy: Primary + Secondary Model

**DCYFR-labs uses a Primary/Secondary agent strategy** to maximize effectiveness for each tool:

- **🔴 PRIMARY: Claude Code** (80% development focus)
  - Auto-delegation, full reasoning, complete toolset
  - Handles complex production work, testing, pattern enforcement
  - Optimized for depth and correctness

- **🟡 SECONDARY: GitHub Copilot** (20% maintenance focus)
  - Real-time quick patterns, auto-synced from Claude Code
  - Handles inline suggestions and 80/20 quick reference
  - Optimized for speed (<2 seconds)

- **🔵 SUPPORTING: Claude General + VS Code Mode**
  - Research, architecture decisions, deep exploration
  - Pattern validation in conversation mode

**Rationale:** [See `docs/ai/AGENT_UNIFICATION_ANALYSIS.md`](docs/ai/AGENT_UNIFICATION_ANALYSIS.md) for detailed feasibility analysis and why unification isn't viable.

---

## 🎯 Quick Navigation

| Agent | Priority | Purpose | Best For | Instructions |
|-------|----------|---------|----------|--------------|
| **DCYFR (Claude Code)** | 🔴 **PRIMARY** | Production enforcement with auto-delegation | Feature work, testing, quick fixes, complex tasks | [`.claude/agents/`](./.claude/agents/) - 3 specialized agents |
| **GitHub Copilot** | 🟡 **SECONDARY** | Real-time code completion & quick suggestions | Inline coding, auto-fix, quick patterns | [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) |
| **Claude (General)** | 🔵 SUPPORTING | Deep research, architecture, complex debugging | System design, documentation, investigation | [`CLAUDE.md`](./CLAUDE.md) |
| **DCYFR (VS Code Mode)** | 🔵 SUPPORTING | Production enforcement, pattern validation, strict compliance | Feature work, bug fixes, detailed exploration | [`.github/agents/DCYFR.agent.md`](./.github/agents/DCYFR.agent.md) |

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

### 4. DCYFR Claude Code Agents (v2.1.0)
**Hub Directory:** [`.claude/agents/`](./.claude/agents/)  
**Lines:** 800+ (3 specialized agents + registry)  
**Last Updated:** December 10, 2025  
**Audience:** Claude Code with auto-delegation capabilities  
**Format:** Individual agent files optimized for Claude Code sub-agents

**Agent Collection:**

| Agent | File | Lines | Purpose | Model |
|-------|------|-------|---------|--------|
| **Production Enforcer** | [`DCYFR.md`](./.claude/agents/DCYFR.md) | 320 | Full production implementation with mandatory enforcement | Sonnet |
| **Quick Fix** | [`dcyfr-quick-fix.md`](./.claude/agents/dcyfr-quick-fix.md) | 120 | Fast pattern fixes and token compliance | Haiku |
| **Test Specialist** | [`dcyfr-test-specialist.md`](./.claude/agents/dcyfr-test-specialist.md) | 280 | Test coverage maintenance and quality assurance | Sonnet |
| **Agent Registry** | [`README.md`](./.claude/agents/README.md) | 180 | Agent coordination and selection guide | - |

**Claude Code Optimizations:**
- **Auto-delegation:** Agents automatically chosen based on task type
- **Permission handling:** `acceptEdits` mode for streamlined workflows
- **Tool specialization:** Each agent has optimized tool access
- **Model selection:** Haiku for speed, Sonnet for complexity
- **Proactive triggers:** "Use proactively" patterns for automatic invocation

**When to update:**
- **Production agent:** Core rules, enforcement changes, new patterns
- **Quick Fix agent:** Common violation patterns, token updates
- **Test Specialist:** Testing strategy, coverage targets, quality metrics
- **Registry:** New agents, capability changes, coordination rules

**Version tracking:**
```json
{
  "directory": ".claude/agents/",
  "format": "claude-code-subagents",
  "version": "2.1.0",
  "scope": "production-enforcement-auto-delegated",
  "coverage": "Production patterns, quick fixes, test coverage",
  "last_updated": "2025-12-10",
  "source_of_truth": "AGENTS.md",
  "sync_status": "Manual (Claude Code managed)",
  "agent_structure": {
    "production": "DCYFR.md (320 lines)",
    "quick_fix": "dcyfr-quick-fix.md (120 lines)",
    "test_specialist": "dcyfr-test-specialist.md (280 lines)",
    "registry": "README.md (180 lines)",
    "total_agents": 3
  }
}
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
  ├─ Using Claude Code for production work?
  │  └─ YES → Use DCYFR (Claude Code)
  │     ├─ Auto-delegation: Based on task complexity
  │     ├─ Quick fixes: dcyfr-quick-fix (Haiku)
  │     ├─ Full features: DCYFR production (Sonnet)
  │     └─ Testing: dcyfr-test-specialist (Sonnet)
  │
  ├─ Building feature following strict patterns?
  │  └─ YES → Use DCYFR (VS Code Mode)
  │     └─ Reference: .github/agents/DCYFR.agent.md
  │
  ├─ Bug fix with compliance enforcement?
  │  └─ YES → Use DCYFR (VS Code Mode)
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
| "Create new /bookmarks page" | DCYFR (Claude Code/VS Code) | Pattern enforcement |
| "Fix SPACING token violation" | Quick Fix (Claude Code) | Fast compliance |
| "Bug in PostCard component" | DCYFR (Claude Code/VS Code) | Root cause + test fix |
| "Tests failing after changes" | Test Specialist (Claude Code) | Test coverage focus |
| "Should I use PageLayout?" | DCYFR (any mode) | Decision trees available |

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
   ├─ .github/copilot-instructions.md (SECONDARY)
   │  ├─ For: Real-time VS Code assistance
   │  ├─ Focus: 80/20 quick patterns (speed optimized)
   │  ├─ Source: Transforms FROM Claude Code patterns
   │  └─ Sync: Auto-synced monthly via sync-agents.mjs
   │
   ├─ CLAUDE.md
   │  ├─ For: General Claude conversation context
   │  ├─ Focus: Project status, constraints
   │  ├─ Source: Project lead updates
   │  └─ Sync: Update when project phase changes
   │
   ├─ .claude/agents/ (PRIMARY - Main Development Target)
   │  ├─ For: Claude Code auto-delegation system
   │  ├─ Focus: Task-specific agents with full enforcement
   │  ├─ Source: Architecture decisions + sync from .github/agents/
   │  ├─ Sync: Auto-synced when patterns change
   │  └─ Components: 3 specialized agents + registry
   │
   ├─ .github/agents/DCYFR.agent.md (HUB v2.0 Modular - Source of Truth)
   │  ├─ For: Specialized mode in conversation + sync source
   │  ├─ Focus: Core rules, philosophy, approval gates
   │  ├─ Source: Architecture decisions (docs/ai/)
   │  ├─ Sync: Syncs TO Claude Code + Copilot
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

| Aspect | Copilot (🟡) | Claude (🔵) | DCYFR VS Code (🔵) | DCYFR Claude Code (🔴) |
|--------|---------|--------|-----------------|---------------------|
| **Status** | Secondary | Supporting | Supporting | **PRIMARY** |
| **Development Focus** | Maintain/Sync | Reference | Pattern reference | **80% effort** |
| **Format** | Quick-ref, 80/20 | Narrative, full context | Modular hub v2.0 | 3 specialized agents |
| **Lines** | 240 | 175 | 195 (hub) + 2600 (modular) | 800+ (3 agents) |
| **Update Frequency** | Monthly (auto-sync) | On phase changes | On enforcement changes | **Ongoing development** |
| **Scope** | Real-time coding | Project-wide context | Strict pattern validation | **Auto-delegated enforcement** |
| **Decision Support** | Basic (layouts, imports) | Exploratory (why/how) | Systematic (10 modular files) | **Task-specific routing** |
| **Enforcement** | ESLint violations | Guidelines | Mandatory gates + tests | **Proactive compliance** |
| **Best For** | Speed (<2 sec) | Understanding (mins) | Rigor (hours) | **Balanced efficiency** |
| **Activation** | Always in VS Code | Always available | Conversation mode | **Auto-delegation** |
| **Structure** | Monolithic | Narrative | Hub + 3 directories | **3 agents + registry** |
| **Model Selection** | N/A | User choice | Single model | **Haiku + Sonnet** |
| **Sync Source** | ← Transforms FROM Claude Code | - | - | **← Source of Truth** |

---

## 🔄 Synchronization & Maintenance

### Implementation Synchronization Strategy (Primary → Secondary Model)

The dcyfr-labs project maintains **one source of truth with multiple optimized implementations**:

```
Development Flow:

.github/agents/ (Source of Truth)
├─ patterns/ (COMPONENT, API, TESTING, CODEQL)
├─ enforcement/ (DESIGN_TOKENS, APPROVAL_GATES, VALIDATION)
└─ learning/ (PERFORMANCE, CONTINUOUS_LEARNING, KNOWLEDGE_BASE)

    ↓ Syncs to ↓

🔴 PRIMARY Development Target:
.claude/agents/ (3 specialized agents + registry)
└─ AUTO-DELEGATION system for Claude Code
   ├─ Production agent (Sonnet) → Full enforcement
   ├─ Quick Fix agent (Haiku) → Fast pattern fixes
   └─ Test Specialist (Sonnet) → Coverage & quality

    ↓ Transforms to ↓

🟡 SECONDARY Maintenance:
.github/copilot-instructions.md (80/20 quick reference)
└─ Auto-synced monthly via sync-agents.mjs
   ├─ Essential patterns only
   ├─ Speed optimized (<2 seconds)
   └─ No auto-delegation (Copilot limitation)

Supporting:
VS Code DCYFR mode → Modular hub with comprehensive validation
Claude General → Deep research and architecture decisions
```

**Development Allocation:**

- **Claude Code**: 80% of development effort (primary target)
- **Copilot**: 20% (auto-sync maintenance)
- **Result**: One strong primary tool + one optimized secondary

**Key Optimizations by Tool:**

- **Copilot (🟡 Secondary)**: 80/20 patterns, quick templates, speed-optimized
- **Claude Code (🔴 Primary)**: Auto-delegation, model selection (Haiku/Sonnet), proactive triggers, full reasoning
- **VS Code (🔵 Supporting)**: Comprehensive validation, approval gates, learning system

**Automated Sync**: Use `npm run sync:agents` to maintain consistency while preserving tool-specific optimizations.

**Detailed Strategy**: See [`docs/ai/AGENT_SYNC_STRATEGY.md`](docs/ai/AGENT_SYNC_STRATEGY.md) and [`docs/ai/AGENT_UNIFICATION_ANALYSIS.md`](docs/ai/AGENT_UNIFICATION_ANALYSIS.md) for complete plans and design rationale.

### File Ownership & Update Responsibility

| File | Owner | Primary? | Update Trigger | Frequency |
|------|-------|----------|---|----------|
| `AGENTS.md` | Project Lead | - | Strategy/governance changes | Quarterly |
| **`.claude/agents/*.md`** | **DCYFR Team** | **🔴 YES** | Pattern/capability changes | **Ongoing development** |
| `.github/agents/DCYFR.agent.md` | Architecture | Source of Truth | Enforcement changes | As needed |
| `.github/copilot-instructions.md` | Sync System | 🟡 NO | Auto-synced from Claude patterns | Monthly (automated) |
| `CLAUDE.md` | Project Lead | Supporting | Phase changes, constraints | As needed |

### Sync Checklist (Primary → Secondary Model)

**Monthly Automated Sync (Copilot ← Claude Code):**

The `ai-instructions-sync` GitHub Actions workflow automatically:

- [ ] Extracts Claude Code patterns (`.claude/agents/`)
- [ ] Transforms to 80/20 reference (`.github/copilot-instructions.md`)
- [ ] Validates sync completeness
- [ ] Generates sync report

**Quarterly Manual Review (Every 3 months):**

- [ ] Review Claude Code agents for new capabilities
- [ ] Check if new patterns should be added to sync
- [ ] Verify Copilot quick reference covers 80% of use cases
- [ ] Review decision trees against implementation
- [ ] Check docs/ai/ for missing references
- [ ] Validate cross-implementation consistency
- [ ] Confirm GitHub Actions workflows are running

**Manual Sync Commands (For Testing/Updates):**

```bash
# Run full sync with validation
npm run sync:agents

# Preview changes without writing
npm run sync:agents --dry-run

# Sync specific target
npm run sync:agents --target=copilot
npm run sync:agents --target=claude
npm run sync:agents --target=vscode

# Check sync status
npm run sync:agents --status
```

**On Breaking Changes:**
- [ ] Update DCYFR.agent.md
- [ ] Update CLAUDE.md constraints
- [ ] Run `npm run sync:agents` to propagate changes
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

### December 10, 2025
- ✅ **Created DCYFR Claude Code Agent Collection (v2.1.0)**
  - Replicated `.github/agents/DCYFR.agent.md` to `.claude/agents/`
  - Optimized for Claude Code sub-agent specifications
  - Created 3 specialized agents: Production, Quick Fix, Test Specialist
  - Added auto-delegation capabilities with model optimization (Haiku/Sonnet)
  - Configured `acceptEdits` permission mode for streamlined workflows
  - Added proactive trigger patterns for automatic agent invocation
  - Created agent registry with coordination and selection guide
- ✅ **Designed Agent Synchronization Strategy**
  - Created comprehensive sync strategy comparing all implementations
  - Built automated sync script foundation (`scripts/sync-agents.mjs`)
  - Added sync commands to package.json (`npm run sync:agents`)
  - Documented tool-specific optimizations and sync procedures
  - Created implementation comparison matrix and content flow strategy
- ✅ Updated AGENTS.md with Claude Code agent documentation
  - Added Claude Code to quick navigation and decision tree
  - Updated instruction file comparison table with Claude Code column
  - Added file ownership and sync responsibility for Claude Code agents
  - Documented synchronization strategy and automated commands

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
**Last Reviewed:** December 10, 2025  
**Next Review:** March 10, 2026 (Quarterly)

For issues, updates, or new agents: Submit PR with AGENTS.md changes first.
