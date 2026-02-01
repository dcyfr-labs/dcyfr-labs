# AGENTS.md - AI Agent & Instruction System

**Centralized management hub for all AI agents, assistants, and instruction files in dcyfr-labs.**

This document serves as the **single source of truth** for discovering, routing, and managing AI instruction sets across the project. It maintains consistency, prevents version conflicts, and ensures optimal agent selection for each task type.

---

## ⚠️ Workspace Scope Limitation

**Important:** When working at the **workspace root**, GitHub Copilot has limited access to dcyfr-labs specific agents, skills, and enforcement rules.

**Why?** GitHub Copilot only discovers agents in `.github/agents/` at the **workspace root**. Agents in subdirectories (like `./dcyfr-labs/.github/agents/DCYFR.agent.md`) are invisible at workspace scope.

**Impact:**

- ❌ DCYFR Agent (560 lines) not available at workspace level
- ❌ 60+ Claude specialized agents inaccessible
- ❌ 23+ skills (design tokens, TDD, Inngest patterns) not available
- ⚠️ MCP servers now synced to workspace (via automation)
- ⚠️ Design token enforcement is manual

**Solution:** For production work in dcyfr-labs requiring full agent support:

1. **Open `dcyfr-labs/` as a dedicated VS Code workspace** ← Recommended
2. Full DCYFR Agent with proactive enforcement activates
3. All skills, MCPs, and quality gates available
4. Return to multi-repo workspace for cross-package coordination

**Workspace-Level Guidance:**

- See [`.github/copilot-workspace-instructions.md`](../.github/copilot-workspace-instructions.md) for cross-repo patterns
- See [`AI_AGENT_CONFIGURATION_ANALYSIS.md`](../AI_AGENT_CONFIGURATION_ANALYSIS.md) for detailed analysis and roadmap
- MCP servers auto-synced via `scripts/sync-mcp-workspace.mjs`

**AI Capability Catalogs:**

- **[Skills Catalog](../.ai/skills/README.md)** - 23 specialized skills (design tokens, TDD, architecture, React, testing)
- **[Agents Catalog](../.ai/agents/CATALOG.md)** - 60+ specialized agents (security, performance, documentation, DevOps)
- **[MCP Registry](../.ai/mcp/REGISTRY.md)** - 17 MCP servers (GitHub, Vercel, Sentry, testing, custom DCYFR tools)

---

## 📦 Framework Migration Notice

**DCYFR has successfully migrated to a modular AI framework architecture:**

- **@dcyfr/ai** (v1.0.0) - Portable AI framework (telemetry, providers, plugins, validation)
- **@dcyfr/agents** (v1.0.0) - DCYFR-specific validation plugins (proprietary)
- **dcyfr-labs** - Project code with compatibility adapter

**Migration Status:** ✅ **Complete** (January 27, 2026)
**Documentation:** See [Migration Guide](docs/ai/MIGRATION_GUIDE.md)
**Compatibility:** 100% backward compatible via adapter layer
**Breaking Changes:** None - all existing code continues to work

---

## ⚠️ Important for AI Agents

**Testing Commands:** Always use `npm run test:run` or `vitest run` instead of `npm test` to avoid watch mode hanging. See [Automated Testing Guide](docs/testing/automated-testing-guide.md) for details.

**Quick Commands:**

```bash
npm run test:run <file>    # Run tests once (no watch)
vitest run <file>           # Direct vitest (no watch)
npm run check               # Type + lint check
```

---

## 🎯 Development Strategy: Multi-Tier AI Architecture

**DCYFR-labs uses a multi-tier AI strategy** with primary, secondary, fallback, and supporting tools:

- **🔴 PRIMARY: Claude Code** (80% development focus)
  - Auto-delegation, full reasoning, complete toolset
  - Handles complex production work, testing, pattern enforcement
  - Optimized for depth and correctness
  - 200K token context window

- **🟡 SECONDARY: GitHub Copilot** (20% maintenance focus)
  - Real-time quick patterns, auto-synced from Claude Code
  - Handles inline suggestions and 80/20 quick reference
  - Optimized for speed (<2 seconds)
  - ~8K token context

- **🟢 FALLBACK: OpenCode.ai** (Token exhaustion scenarios)
  - 75+ AI provider options (OpenAI, Anthropic, Gemini, GitHub Copilot, local models)
  - GitHub Copilot integration (GPT-5 Mini + Raptor Mini included with subscription)
  - Cost optimization (0 multiplier for GitHub Copilot models)
  - Extended context windows (16K GitHub Copilot, up to 2M with Gemini)
  - VS Code extension with keyboard shortcuts
  - **Trigger conditions:** Rate limits, budget exhaustion, extended sessions (6+ hours)

- **🔵 SUPPORTING: Claude General + VS Code Mode**
  - Research, architecture decisions, deep exploration
  - Pattern validation in conversation mode
  - **CLAUDE.md has extended capability:** Contains production-level knowledge suitable for extended development sessions (when PRIMARY is rate-limited)

**Rationale:** [See `docs/ai/AGENT_UNIFICATION_ANALYSIS.md`](docs/ai/AGENT_UNIFICATION_ANALYSIS.md) for detailed feasibility analysis and why unification isn't viable.

---

## 🎯 Quick Navigation

| Agent                    | Priority         | Purpose                                                       | Best For                                          | Instructions                                                                             |
| ------------------------ | ---------------- | ------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **DCYFR (Claude Code)**  | 🔴 **PRIMARY**   | Production enforcement with auto-delegation                   | Feature work, testing, quick fixes, complex tasks | [`.claude/agents/`](./.claude/agents/) - 3 specialized agents                            |
| **GitHub Copilot**       | 🟡 **SECONDARY** | Real-time code completion & quick suggestions                 | Inline coding, auto-fix, quick patterns           | [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)                   |
| **OpenCode.ai**          | 🟢 **FALLBACK**  | Multi-provider AI fallback (75+ models)                       | Token exhaustion, cost optimization, offline work | [`docs/ai/opencode-fallback-architecture.md`](docs/ai/opencode-fallback-architecture.md) |
| **Claude (General)**     | 🔵 SUPPORTING\*  | Deep research, architecture, complex debugging                | System design, documentation, investigation       | [`CLAUDE.md`](./CLAUDE.md)                                                               |
| **DCYFR (VS Code Mode)** | 🔵 SUPPORTING    | Production enforcement, pattern validation, strict compliance | Feature work, bug fixes, detailed exploration     | [`.github/agents/DCYFR.agent.md`](./.github/agents/DCYFR.agent.md)                       |

\*CLAUDE.md also contains semi-PRIMARY capability for extended sessions when Claude Code is rate-limited

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

| File                                                                                            | Lines | Covers                                                                                               |
| ----------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| [COMPONENT_PATTERNS.md](patterns/COMPONENT_PATTERNS.md)                                         | 466   | Layout selection (PageLayout 90% rule), barrel exports, import strategy, anti-patterns               |
| [API_PATTERNS.md](patterns/API_PATTERNS.md)                                                     | 405   | Validate→Queue→Respond, Inngest integration, error handling, rate limiting                           |
| [TESTING_PATTERNS.md](patterns/TESTING_PATTERNS.md)                                             | 370   | 99% pass rate target, strategic skips, when/when-not-to-test, E2E strategy                           |
| [CODEQL_SUPPRESSIONS.md](patterns/CODEQL_SUPPRESSIONS.md)                                       | 310   | LGTM syntax, false positive patterns, common suppressions, verification                              |
| [SECURITY_VULNERABILITY_TROUBLESHOOTING.md](patterns/SECURITY_VULNERABILITY_TROUBLESHOOTING.md) | 510   | Code scanning analysis workflow, SSRF/CWE-918 prevention, security testing patterns, lessons learned |

#### Enforcement Directory (.github/agents/enforcement/)

| File                                                           | Lines | Covers                                                                               |
| -------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------ |
| [DESIGN_TOKENS.md](enforcement/DESIGN_TOKENS.md)               | 360   | Token enforcement (NON-NEGOTIABLE), categories, ESLint rules, compliance targets     |
| [APPROVAL_GATES.md](enforcement/APPROVAL_GATES.md)             | 380   | Breaking changes, architecture decisions, security-sensitive work, approval process  |
| [VALIDATION_CHECKLIST.md](enforcement/VALIDATION_CHECKLIST.md) | 360   | Pre-completion checks, automated/manual validation, common failures, bypass criteria |

#### Learning Directory (.github/agents/learning/)

| File                                                      | Lines | Covers                                                                                   |
| --------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------- |
| [PERFORMANCE_METRICS.md](learning/PERFORMANCE_METRICS.md) | 340   | Token budgets, efficiency targets, dashboards, metrics tracking                          |
| [CONTINUOUS_LEARNING.md](learning/CONTINUOUS_LEARNING.md) | 420   | Pattern recognition, feedback loops, self-improvement triggers, knowledge base evolution |
| [KNOWLEDGE_BASE.md](learning/KNOWLEDGE_BASE.md)           | 350   | Session handoff, knowledge transfer, long-term learning, monthly reports                 |

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

### 4. DCYFR Claude Code Agents (v2.1.0) - PROPRIETARY/INTERNAL ONLY

**⚠️ NOTE:** Files in `.claude/agents/` are **proprietary and not available in the public repository**. This section is for documentation purposes only.

**Hub Directory:** `.claude/agents/` (Not in public repo)
**Last Updated:** December 10, 2025
**Audience:** Internal use only - Claude Code with auto-delegation capabilities
**Format:** Individual agent files optimized for Claude Code sub-agents

**Primary Agents (Used in Public Projects):**

| Agent                   | File                 | Purpose                                                   |
| ----------------------- | -------------------- | --------------------------------------------------------- |
| **Production Enforcer** | `DCYFR.md`           | Full production implementation with mandatory enforcement |
| **Quick Fix**           | `quick-fix.md`       | Fast pattern fixes and token compliance                   |
| **Test Specialist**     | `test-specialist.md` | Test coverage maintenance and quality assurance           |

**Supporting Agents (Proprietary Specializations):**

- `architecture-reviewer.md` - Architecture review and technical decisions
- `content-creator.md` - Content and documentation generation
- `content-editor.md` - Content refinement and polish
- `dependency-manager.md` - Dependency updates and compatibility
- `design-specialist.md` - Design system and UI enhancements
- `performance-specialist.md` - Performance optimization and metrics
- `security-specialist.md` - Security hardening and compliance
- `seo-specialist.md` - SEO optimization and metadata
- _(Additional agents may be added internally)_

**⚠️ Important Clarifications:**

- ✅ `.github/agents/` directory (patterns, enforcement, learning) - **PUBLIC/SHARED**
- ❌ `.claude/agents/` directory - **PROPRIETARY/INTERNAL ONLY**
- These proprietary agent files are **not included in the public repository**
- Public users should reference **`.github/agents/DCYFR.agent.md`** instead

**When to reference:**

- For **public/shared work:** Use `.github/agents/DCYFR.agent.md` and its modular documentation
- For **internal development:** Use `.claude/agents/` files (not available publicly)

---

### 5. OpenCode.ai Fallback System (v2.0.0)

**Hub Directory:** `.opencode/`
**Last Updated:** January 11, 2026
**Audience:** All developers (fallback tier when primary/secondary exhausted)
**Format:** Modular documentation with provider-specific guides

**Hub File:** [`.opencode/DCYFR.opencode.md`](./.opencode/DCYFR.opencode.md) (257 lines)

**Purpose**: Multi-provider AI fallback with GitHub Copilot integration (GPT-5 Mini + Raptor Mini).

**Core Components:**

| Directory        | Files   | Purpose                                                                  |
| ---------------- | ------- | ------------------------------------------------------------------------ |
| **patterns/**    | 2 files | Provider selection, VS Code integration                                  |
| **enforcement/** | 3 files | Hybrid enforcement (STRICT/FLEXIBLE), enhanced validation, quality gates |
| **workflows/**   | 3 files | Session handoff, cost optimization, troubleshooting                      |
| **scripts/**     | 3 files | Validation, health checks, session management                            |

**Detailed Files:**

#### Patterns Directory (.opencode/patterns/)

| File                                                      | Lines | Covers                                                                |
| --------------------------------------------------------- | ----- | --------------------------------------------------------------------- |
| [PROVIDER_SELECTION.md](patterns/PROVIDER_SELECTION.md)   | 200+  | Decision tree, free model optimization, when to use each provider     |
| [VS_CODE_INTEGRATION.md](patterns/VS_CODE_INTEGRATION.md) | 150+  | Extension setup, keyboard shortcuts (Cmd+Esc), provider configuration |

#### Enforcement Directory (.opencode/enforcement/)

| File                                                         | Lines | Covers                                                                                                                                      |
| ------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [HYBRID_ENFORCEMENT.md](enforcement/HYBRID_ENFORCEMENT.md)   | 400+  | STRICT rules (hard block): design tokens, PageLayout, barrel exports, test data, emojis; FLEXIBLE rules (warn): API patterns, test coverage |
| [VALIDATION_ENHANCED.md](enforcement/VALIDATION_ENHANCED.md) | 450+  | Manual checklists for GitHub Copilot models, escalation triggers, provider capability matrix                                                |
| [QUALITY_GATES.md](enforcement/QUALITY_GATES.md)             | 500+  | Pre-commit validation by provider tier, security gates, performance gates                                                                   |

#### Workflows Directory (.opencode/workflows/)

| File                                                   | Lines | Covers                                                                           |
| ------------------------------------------------------ | ----- | -------------------------------------------------------------------------------- |
| [SESSION_HANDOFF.md](workflows/SESSION_HANDOFF.md)     | 400+  | Claude ↔ OpenCode switching, session state schema v2.0, git workflow integration |
| [COST_OPTIMIZATION.md](workflows/COST_OPTIMIZATION.md) | 450+  | 80/20 strategy (80% free, 20% premium), monthly cost tracking, ROI analysis      |
| [TROUBLESHOOTING.md](workflows/TROUBLESHOOTING.md)     | 600+  | Provider-specific issues (GitHub Copilot auth, rate limits, validation failures) |

#### Scripts Directory (.opencode/scripts/)

| File                         | Purpose                                    | Integration               |
| ---------------------------- | ------------------------------------------ | ------------------------- |
| `validate-after-fallback.sh` | STRICT rules hard block, FLEXIBLE warnings | `npm run check:opencode`  |
| `session-handoff.sh`         | Combined save + restore + validation       | `npm run session:handoff` |
| `check-provider-health.sh`   | GitHub Copilot/Claude connectivity         | `npm run opencode:health` |

**Session State System (Universal v2.0):**

- **Schema**: Git branch, issues/PRs, time estimates, validation status
- **Locations**: `.opencode/.session-state.json`, `.claude/.session-state.json`, `.github/copilot-session-state.json`
- **Scripts**: `scripts/save-session-state.sh`, `scripts/restore-session-state.sh` (shared across all agents)
- **Git-ignored**: Added to `.gitignore` (never committed)

**Provider Configuration (.opencode/config.json):**

```json
{
  "primary": "gpt-5-mini (GitHub Copilot, 16K context, 0 multiplier)",
  "speed": "raptor-mini (GitHub Copilot, 8K context, 0 multiplier)",
  "claude": "claude-sonnet-4 (premium, 200K context, 1 multiplier)"
}
```

**Recommended Allocation:**

- **GitHub Copilot (included)**: 80% of tasks (features, bug fixes, refactoring, UI updates)
- **Claude (premium)**: 20% of tasks (security, architecture, complex debugging)

**When to update:**

- **Hub file**: When adding new providers or changing fallback strategy
- **Pattern files**: When discovering new free model optimization techniques
- **Enforcement files**: When enforcement rules change (shared with `.github/agents/`)
- **Workflow files**: When optimizing cost allocation or handoff procedures

**Version tracking:**

```json
{
  "file": ".opencode/",
  "format": "modular-fallback-system",
  "version": "2.0.0",
  "scope": "multi-provider-fallback",
  "coverage": "GitHub Copilot (free), premium (Claude)",
  "last_updated": "2026-01-11",
  "source_of_truth": "AGENTS.md",
  "modular_structure": {
    "hub": ".opencode/DCYFR.opencode.md (257 lines)",
    "patterns": 2,
    "enforcement": 3,
    "workflows": 3,
    "scripts": 3,
    "total_modular_lines": 3000
  }
}
```

---

### 6. AITMPL.com Template Agents (v1.0.0)

**Hub Directory:** `.claude/agents/` (4 specialized agents from aitmpl.com templates)
**Last Updated:** January 16, 2026
**Audience:** Claude Code auto-delegation system (internal use)
**Format:** Individual agent files optimized for specific tasks from community templates

**Purpose**: Enhanced capabilities from [aitmpl.com](https://www.aitmpl.com/) template library for React optimization, TypeScript mastery, code review automation, and test engineering.

**Template Agents:**

| Agent                  | File                    | Lines | Purpose                                                              |
| ---------------------- | ----------------------- | ----- | -------------------------------------------------------------------- |
| **Frontend Developer** | `frontend-developer.md` | 50    | React UI components, responsive design, accessibility                |
| **TypeScript Pro**     | `typescript-pro.md`     | 55    | Advanced type system, generic constraints, strict typing             |
| **Code Reviewer**      | `code-reviewer.md`      | 40    | Quality gates, security scanning, pre-commit validation              |
| **Test Engineer**      | `test-engineer.md`      | 936   | Test pyramid, coverage optimization, E2E automation (Comprehensive!) |

**Template Commands (New from Integration):**

| Command          | File               | Agent              | Purpose                                  |
| ---------------- | ------------------ | ------------------ | ---------------------------------------- |
| `/code-review`   | `code-review.md`   | code-reviewer      | Pre-commit validation, security scanning |
| `/frontend`      | `frontend.md`      | frontend-developer | React optimization, accessibility        |
| `/typescript`    | `typescript.md`    | typescript-pro     | Advanced types, generic constraints      |
| `/test-strategy` | `test-strategy.md` | test-engineer      | Test coverage, E2E planning              |

**Skills (from aitmpl.com):**

| Skill                  | Category        | Status       | Integration                               |
| ---------------------- | --------------- | ------------ | ----------------------------------------- |
| `react-best-practices` | web-development | ✅ Installed | React 19 patterns, performance guidelines |

**Integration with DCYFR:**

Enhanced `.claude/agents/DCYFR.md` (v2.2.0) now includes:

- **Delegation strategy** to template agents
- **Proactive triggers** for automatic agent invocation
- **Quality gates** from code-reviewer patterns
- **Skills array** with template capabilities

**Delegation Map:**

```yaml
# When DCYFR encounters:
UI Component Work → frontend-developer
Complex TypeScript → typescript-pro
Code Review → code-reviewer
Test Strategy → test-engineer
```

**When to update:**

- **Template agents**: When new versions available on aitmpl.com
- **Commands**: When adding new template-based workflows
- **Skills**: When installing new skills from aitmpl.com/skills
- **DCYFR integration**: When delegation patterns evolve

**Version tracking:**

```json
{
  "file": ".claude/agents/[template-name].md",
  "format": "aitmpl-template-agent",
  "version": "1.0.0",
  "source": "https://www.aitmpl.com/agents",
  "scope": "specialized-delegation",
  "coverage": "React, TypeScript, Testing, Code Quality",
  "last_updated": "2026-01-16",
  "source_of_truth": "AGENTS.md",
  "integration": {
    "dcyfr_agent": "v2.2.0 (enhanced with delegation)",
    "new_commands": 4,
    "new_skills": 1,
    "total_agents": 15
  }
}
```

**Resources:**

- **AITMPL.com**: https://www.aitmpl.com/
- **Agents Gallery**: https://www.aitmpl.com/agents (174+ agents)
- **Skills Gallery**: https://www.aitmpl.com/skills (355+ skills)
- **Documentation**: https://docs.aitmpl.com/
- **Installation**: `npx claude-code-templates@latest --agent=<name> --yes`

**See Also:**

- [Enhancement Plan](docs/ai/aitmpl-enhancement-plan.md) - Full integration strategy
- [Integration Summary](docs/ai/aitmpl-integration-summary.md) - What was integrated

---

## 🌐 External Context Sources: Octocode-MCP

**Status:** ✅ Integrated December 28, 2025
**Repository:** [bgauryy/octocode-mcp](https://github.com/bgauryy/octocode-mcp)
**Version:** Latest (`octocode-mcp@latest`)
**Configuration:** [`.vscode/mcp.json`](./.vscode/mcp.json)

### What Octocode Provides

Octocode is an **agentic code research MCP server** that gives AI assistants intelligent access to GitHub repositories for deep code research and pattern discovery.

**Core Tools:**

- `githubSearchCode` - Find code patterns across repositories
- `githubSearchRepositories` - Discover repos by topic/keywords
- `githubViewRepoStructure` - Explore directory structures
- `githubGetFileContent` - Read files with smart extraction
- `githubSearchPullRequests` - Analyze PR changes and discussions

**AI Commands:**

- `/research` - Deep code investigation (patterns, flows, best practices)
- `/plan` - Research → Plan → Implement complex features
- `/review_pull_request` - Expert-level PR analysis
- `/review_security` - Security audit of reference implementations

### When to Use Octocode

✅ **Use Octocode for:**

- Researching production patterns from high-quality codebases
- Understanding how popular projects solve architectural problems
- Learning security best practices and auth implementations
- Finding reference implementations for complex features
- Cross-repository flow analysis and pattern comparison

❌ **Don't use Octocode for:**

- Quick code fixes (use Copilot)
- Internal dcyfr-labs code analysis (use GitHub MCP or local tools)
- General conversations (use Claude)
- When Perplexity/GitHub MCP are sufficient

### Setup & Authentication

**GitHub CLI (Recommended):**

```bash
brew install gh          # or your package manager
gh auth login           # Authenticate with your GitHub account
```

**Personal Access Token (Alternative):**

1. Create token at [github.com/settings/tokens](https://github.com/settings/tokens)
2. Scopes: `repo`, `read:user`, `read:org`
3. Add to `.env.local` (never commit)

### Usage Examples

**Research Production Patterns:**

```
/research How do popular Next.js portfolios (vercel/next.js, examples)
structure design tokens and metadata generation?
```

**Plan Implementation:**

```
/plan Implement an Inngest integration similar to production codebases.
Research best practices first, then create implementation plan.
```

**Security Review:**

```
/review_security https://github.com/popular-auth-lib/repo
Analyze authentication and authorization patterns.
```

**PR Analysis:**

```
/review_pull_request https://github.com/facebook/react/pull/28000
Spot potential issues, performance concerns, and design decisions.
```

### Integration with DCYFR

Octocode is available to DCYFR agents as `mcp_octocode/*` tools. When building features or researching patterns:

1. **Research Phase**: Use `/research` to discover production implementations
2. **Planning Phase**: Use `/plan` to synthesize research into implementation strategy
3. **Building Phase**: Reference findings from Octocode in code comments
4. **Validation Phase**: Use `/review_pull_request` for pre-merge analysis

### Documentation & Support

- **Official Docs:** [octocode.ai](https://octocode.ai/)
- **GitHub Discussions:** [bgauryy/octocode-mcp discussions](https://github.com/bgauryy/octocode-mcp/discussions)
- **Video Tutorials:** [YouTube Channel](https://www.youtube.com/@Octocode-ai)

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
  │  └─ YES → Use DCYFR (VS Code Mode)
  │     └─ Reference: .github/agents/DCYFR.agent.md
  │     └─ May use: Octocode /research for pattern discovery
  │
  ├─ Need to research production implementations?
  │  └─ YES → Use Octocode MCP
  │     └─ Commands: /research, /plan, /review_security
  │
  ├─ Bug fix with compliance enforcement?
  │  └─ YES → Use DCYFR (VS Code Mode)
  │     └─ Reference: .github/agents/DCYFR.agent.md
  │
  └─ General investigation/documentation?
     └─ Use Claude (General)
        └─ Reference: CLAUDE.md + docs/
```

**When to use Octocode in DCYFR work:**

- Research existing patterns before implementing new features
- Understand security best practices from production codebases
- Discover how high-quality projects structure similar features
- Validate architectural decisions against real implementations

### Quick Rules

| Scenario                           | Agent           | Tool     | Why                              |
| ---------------------------------- | --------------- | -------- | -------------------------------- |
| "Complete this code snippet"       | Copilot         | -        | Real-time, inline                |
| "I need design token suggestions"  | Copilot         | -        | Quick patterns                   |
| "Refactor this function"           | Copilot         | -        | Line-level edits                 |
| "What's our architecture pattern?" | Claude          | -        | Deep context needed              |
| "How should we approach X?"        | Claude          | Octocode | Investigation + pattern research |
| "Create new /bookmarks page"       | DCYFR           | Octocode | Pattern enforcement + research   |
| "Research auth patterns"           | DCYFR           | Octocode | `/research` command              |
| "Fix SPACING token violation"      | Quick Fix       | -        | Fast compliance                  |
| "Bug in PostCard component"        | DCYFR           | -        | Root cause + test fix            |
| "Tests failing after changes"      | Test Specialist | -        | Test coverage focus              |

├─ Bug fix with compliance enforcement?
│ └─ YES → Use DCYFR (VS Code Mode)
│ └─ Reference: .github/agents/DCYFR.agent.md
│
├─ General investigation/documentation?
│ └─ Use Claude (General)
│ └─ Reference: CLAUDE.md + docs/

```

**Note on Claude Code:** Claude Code users in your organization may have access to proprietary `.claude/agents/` files for auto-delegation and specialized task routing. These are **not** included in the public repository. For public contributions, use `.github/agents/DCYFR.agent.md` instead.
  │     └─ Reference: .github/agents/DCYFR.agent.md
  │
  └─ General investigation/documentation?
     └─ Use Claude (General)
        └─ Reference: CLAUDE.md + docs/
```

### Quick Rules

| Scenario                           | Agent                         | Why                      |
| ---------------------------------- | ----------------------------- | ------------------------ |
| "Complete this code snippet"       | Copilot                       | Real-time, inline        |
| "I need design token suggestions"  | Copilot                       | Quick patterns           |
| "Refactor this function"           | Copilot                       | Line-level edits         |
| "What's our architecture pattern?" | Claude                        | Deep context needed      |
| "How should we approach X?"        | Claude                        | Investigation mode       |
| "Create new /bookmarks page"       | DCYFR (Claude Code/VS Code)   | Pattern enforcement      |
| "Fix SPACING token violation"      | Quick Fix (Claude Code)       | Fast compliance          |
| "Bug in PostCard component"        | DCYFR (Claude Code/VS Code)   | Root cause + test fix    |
| "Tests failing after changes"      | Test Specialist (Claude Code) | Test coverage focus      |
| "Should I use PageLayout?"         | DCYFR (any mode)              | Decision trees available |

---

## 🟢 When CLAUDE.md Becomes PRIMARY-Level Tool

**CLAUDE.md is positioned as SUPPORTING tier but contains semi-PRIMARY-level knowledge suitable for extended development sessions:**

### Scenarios Where CLAUDE.md Is Primary-Capable

- ✅ **Extended sessions** (4+ hours) when Claude Code rate limits near
- ✅ **Security vulnerability analysis** - Contains production vulnerability procedures
- ✅ **Architecture decisions** - System design and pattern enforcement guidance
- ✅ **Project maintenance** - Health monitoring, cleanup procedures, maintenance playbooks
- ✅ **Deep research** - Comprehensive project context and constraints
- ✅ **Operational knowledge** - Session recovery systems, provider fallback strategies

### How CLAUDE.md Differs from PRIMARY Tier

| Aspect          | PRIMARY (Claude Code)         | CLAUDE.md (SUPPORTING)                      |
| --------------- | ----------------------------- | ------------------------------------------- |
| **Automation**  | Auto-delegation to sub-agents | Manual validation gates                     |
| **Speed**       | Fast execution (Sonnet)       | Research-oriented (extended context)        |
| **Enforcement** | Proactive pattern enforcement | Guidance + examples                         |
| **Scope**       | Single tasks, features        | Deep investigation, architecture            |
| **When to Use** | Quick fixes, features, bugs   | When PRIMARY is rate-limited or unavailable |

### Recommended Workflow

```
START: Need to implement feature
  │
  ├─ Claude Code available? → YES → Use PRIMARY
  │                        → NO  → Check CLAUDE.md capability
  │
  ├─ CLAUDE.md can handle? → YES → Use CLAUDE.md (semi-PRIMARY mode)
  │                       → NO  → Wait for PRIMARY or use OpenCode + enhanced validation
  │
  └─ Extended session (6+ hours)? → YES → Preemptively switch to CLAUDE.md (cheaper)
                                 → NO  → Stay in PRIMARY
```

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
   ├─ .claude/agents/ (PRIMARY - PROPRIETARY/INTERNAL ONLY)
   │  ├─ Status: ⚠️ NOT in public repository
   │  ├─ For: Claude Code auto-delegation system (internal use only)
   │  ├─ Focus: Task-specific agents with full enforcement
   │  ├─ Components: 11 specialized agents
   │  └─ Public Alternative: Use .github/agents/ instead
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

| Aspect                | Copilot (🟡)                  | Claude (🔵)             | DCYFR VS Code (🔵)            | DCYFR Claude Code (🔴)         |
| --------------------- | ----------------------------- | ----------------------- | ----------------------------- | ------------------------------ |
| **Status**            | Secondary                     | Supporting              | Supporting                    | **PRIMARY**                    |
| **Development Focus** | Maintain/Sync                 | Reference               | Pattern reference             | **80% effort**                 |
| **Format**            | Quick-ref, 80/20              | Narrative, full context | Modular hub v2.0              | 3 specialized agents           |
| **Lines**             | 240                           | 175                     | 195 (hub) + 2600 (modular)    | 800+ (3 agents)                |
| **Update Frequency**  | Monthly (auto-sync)           | On phase changes        | On enforcement changes        | **Ongoing development**        |
| **Scope**             | Real-time coding              | Project-wide context    | Strict pattern validation     | **Auto-delegated enforcement** |
| **Decision Support**  | Basic (layouts, imports)      | Exploratory (why/how)   | Systematic (10 modular files) | **Task-specific routing**      |
| **Enforcement**       | ESLint violations             | Guidelines              | Mandatory gates + tests       | **Proactive compliance**       |
| **Best For**          | Speed (<2 sec)                | Understanding (mins)    | Rigor (hours)                 | **Balanced efficiency**        |
| **Activation**        | Always in VS Code             | Always available        | Conversation mode             | **Auto-delegation**            |
| **Structure**         | Monolithic                    | Narrative               | Hub + 3 directories           | **11 specialized agents**      |
| **Model Selection**   | N/A                           | User choice             | Single model                  | **Internal use only**          |
| **Sync Source**       | ← Transforms FROM shared docs | -                       | -                             | **← Source of Truth**          |

---

## 🔄 Synchronization & Maintenance

### Implementation Synchronization Strategy (Public + Proprietary Model)

The dcyfr-labs project maintains **public shared documentation with private internal optimization**:

```
Documentation Flow:

.github/agents/ (PUBLIC - Source of Truth for Shared Docs)
├─ patterns/ (COMPONENT, API, TESTING, CODEQL)
├─ enforcement/ (DESIGN_TOKENS, APPROVAL_GATES, VALIDATION)
└─ learning/ (PERFORMANCE, CONTINUOUS_LEARNING, KNOWLEDGE_BASE)

    ↓ Used by ↓

🔵 SUPPORTING (Public-Facing):
- DCYFR VS Code Mode (.github/agents/DCYFR.agent.md)
- GitHub Copilot (.github/copilot-instructions.md)
- General Claude (CLAUDE.md)

    ↓ May inform ↓

🔴 PRIMARY (Internal Only):
.claude/agents/ (11 specialized agents)
└─ AUTO-DELEGATION system for Claude Code (NOT in public repo)
   ├─ Production Enforcer (Sonnet) → Full enforcement
   ├─ Quick Fix (Haiku) → Fast pattern fixes
   ├─ Test Specialist (Sonnet) → Coverage & quality
   └─ 8 Additional Specialized Agents → Domain-specific optimization
```

    ↓ Transforms to ↓

🟡 SECONDARY Maintenance:
.github/copilot-instructions.md (80/20 quick reference)
└─ Auto-synced from shared docs
├─ Essential patterns only
├─ Speed optimized (<2 seconds)
└─ No auto-delegation (Copilot limitation)

Supporting:
VS Code DCYFR mode → Modular hub with comprehensive validation
Claude General → Deep research and architecture decisions

````

**Development Allocation:**

- **Public Work**: 100% follows `.github/agents/` (shared/open source)
- **Internal Development**: May reference `.claude/agents/` (proprietary optimizations)
- **Result**: Unified public base + optimized internal tools

**Key Clarifications:**

- **Public/Shared (🔵 SUPPORTING)**: `.github/agents/` directory - available to all users
- **Proprietary/Internal (🔴 PRIMARY)**: `.claude/agents/` directory - internal use only
- **Secondary (🟡)**: GitHub Copilot gets 80/20 patterns from public docs
- **NO PUBLIC SYNC FROM PROPRIETARY**: `.claude/agents/` files are never referenced in public documentation

**Detailed Strategy**: See [`docs/ai/AGENT_SYNC_STRATEGY.md`](docs/ai/AGENT_SYNC_STRATEGY.md) and [`docs/ai/AGENT_UNIFICATION_ANALYSIS.md`](docs/ai/AGENT_UNIFICATION_ANALYSIS.md) for complete plans and design rationale.

### File Ownership & Update Responsibility

| File | Owner | Public? | Update Trigger | Frequency |
|------|-------|---------|---|----------|
| `AGENTS.md` | Project Lead | ✅ Yes | Strategy/governance changes | Quarterly |
| `.claude/agents/*.md` | Internal Team | ❌ **NO** | ⚠️ **Proprietary only** | Ongoing (internal only) |
| `.github/agents/DCYFR.agent.md` | Architecture | ✅ Yes | Enforcement changes | As needed |
| `.github/copilot-instructions.md` | Community | ✅ Yes | Updates from `.github/agents/` | As needed |
| `CLAUDE.md` | Project Lead | ✅ Yes | Phase changes, constraints | As needed |

### Sync Strategy (Shared vs. Proprietary)

**Shared Documentation Flow (`.github/agents/` ← public):**
- Source of truth: `.github/agents/` directory (patterns, enforcement, learning)
- Used for: Public contributions, DCYFR VS Code mode, shared documentation
- Availability: ✅ In public repository

**Proprietary Development Flow (`.claude/agents/` ← internal only):**
- Internal optimization: `.claude/agents/` directory (11 specialized agents)
- Used for: Claude Code auto-delegation, internal development
- Availability: ❌ NOT in public repository
- Access: Internal team members only

**Sync Considerations:**
- `.github/agents/` is the source of truth for public documentation
- `.claude/agents/` contains proprietary optimizations NOT shared publicly
- Updates to `.github/agents/` may inform internal improvements to `.claude/agents/`
- Public repository only references `.github/agents/` documentation

### Manual Review (As Needed)

- [ ] Verify `.github/agents/` documentation is current and complete
- [ ] Check that `.github/agents/` is the primary reference for public users
- [ ] Confirm no proprietary `.claude/agents/` files are referenced in public docs
- [ ] Review decision trees against implementation
- [ ] Check docs/ai/ for missing references
- [ ] Validate cross-implementation consistency

**Manual Update Commands (For Shared Docs):**

```bash
# Update shared .github/agents/ documentation
git add .github/agents/
git commit -m "docs: update shared agent documentation"
git push origin <branch>
```

**On Breaking Changes:**

- [ ] Update DCYFR.agent.md
- [ ] Update CLAUDE.md constraints
- [ ] Run `npm run sync:agents` to propagate changes
- [ ] Consider copilot-instructions.md impact
- [ ] Update docs/ai/enforcement-rules.md
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
4. Consult [`docs/ai/quick-reference.md`](docs/ai/quick-reference.md) for commands

---

## 🔐 Governance Compliance

**Status:** ✅ ACTIVE ENFORCEMENT (as of January 2026)

### Automated Enforcement

Governance compliance is enforced at three levels to prevent accidental exposure of sensitive or proprietary content:

#### 1. Pre-Commit Hooks (CRITICAL BLOCK)

**Location:** `.git/hooks/pre-commit` (installed from `scripts/hooks/pre-commit-governance`)

**Validation Layers:**
- ✅ **Layer 1:** LGTM suppression validation (30+ min fix requirement)
- ✅ **Layer 2:** Sensitive file location check (blocks FINDINGS, AUDIT, ANALYSIS outside `.private/`)
- ✅ **Layer 3:** AI configuration check (blocks `.claude/` files, session state)
- ✅ **Layer 4:** API key & credential detection (blocks hardcoded secrets)
- ✅ **Layer 5:** Private docs validation (warns on unexpected `.private/` commits)

**Enforcement Mode:**
- **CRITICAL violations:** BLOCK commit (exit 1)
- **MEDIUM warnings:** WARN with user confirmation (exit 0 after confirmation)

**Install/Update:**
```bash
cp scripts/hooks/pre-commit-governance .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

#### 2. .gitignore Protection

**Protected Content:**
- ❌ `.claude/` - Proprietary agents (INTERNAL ONLY)
- ❌ `.opencode/node_modules/` - OpenCode dependencies
- ❌ `**/.private/**` - Sensitive documentation
- ❌ `*.session-state.json` - Local AI session state
- ❌ `.env.local` - Environment secrets
- ✅ `.github/agents/` - Public agent patterns (SOURCE OF TRUTH)
- ✅ `.vscode/mcp.json` - MCP server configuration (workspace)
- ✅ `.vscode/settings.json` - VS Code workspace settings

**Test Coverage:**
```bash
# Test .opencode/node_modules/ is ignored
touch .opencode/node_modules/test.js
git status  # Should not appear

# Test .vscode/ workspace files are tracked
git status .vscode/mcp.json  # Should appear if untracked/modified
```

#### 3. GitHub Actions (Active Governance Validation)

**Workflow:** [`.github/workflows/governance-validation.yml`](.github/workflows/governance-validation.yml) (active in CI)

**Validation:**
- Sensitive files in public docs (CI check)
- Private file references are valid
- AI configuration compliance
- TLP compliance enforcement
- .gitignore coverage
- Secret scanning

### Manual Validation

**Quarterly Review Checklist:**

```bash
# Run governance checks
npm run check:governance

# Validate private file references
npm run check:private-refs

# Review .gitignore coverage
git status --ignored | grep -E "\.(claude|opencode|private)"
```

**Validation Scripts:**
- `scripts/check-private-references.mjs` - Verify private file references exist
- `scripts/hooks/pre-commit-governance` - Enhanced pre-commit validation

### Compliance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Proprietary Files Protected** | 100% | 100% | ✅ PASS |
| **VS Code Workspace Public** | 100% | 100% | ✅ PASS |
| **Pre-Commit Coverage** | 5 layers | 5 layers | ✅ PASS |
| **Sensitive Doc Placement** | 0 violations | 0 violations | ✅ PASS |
| **Overall Compliance Score** | ≥90/100 | 95/100 | ✅ PASS |

### Public vs. Proprietary Distinction

**✅ PUBLIC (in git, publicly visible):**
- `.github/agents/` - Source of truth for agent patterns
- `.github/copilot-instructions.md` - Quick-reference patterns
- `.opencode/` - Fallback configuration (no secrets)
- `.vscode/mcp.json` - MCP server setup (with example template)
- `.vscode/settings.json` - Workspace defaults
- `docs/` - Public documentation (except `.private/` subdirectories)

**❌ PROPRIETARY (gitignored, internal only):**
- `.claude/` - Proprietary Claude Code agents
- `.claude/agents/` - 10 specialized agents (internal use)
- `.claude/commands/` - 34 custom commands (internal use)
- `.claude/skills/` - 6 installed skills (internal use)
- Session state files (`.session-state.json`)
- Environment files (`.env.local`)

**⚠️ PRIVATE (gitignored subdirectories):**
- `docs/**/.private/` - Sensitive docs (security, operations, performance)
- Examples: `docs/security/.private/`, `docs/operations/.private/`

### Justification

**Why `.claude/` is Proprietary:**
- Contains internal optimization strategies
- Includes proprietary task routing logic
- May reference internal tools and workflows
- Public users have `.github/agents/` as complete public alternative

**Why `.vscode/` is Public:**
- MCP server configuration benefits all contributors
- Workspace settings ensure consistent development experience
- Design token snippets improve developer productivity
- Example template (`.vscode/mcp.json.example`) guides setup

**Why `.opencode/` is Public:**
- Configuration contains no secrets (uses `.env.local`)
- Provider presets are useful for contributors
- Fallback strategy is documented for transparency
- Validation scripts are reusable patterns

### Incident Response

**If sensitive content is committed:**

1. **Immediate Actions:**
   ```bash
   # Remove from staging
   git reset HEAD <sensitive-file>

   # Remove from history if already committed
   git filter-branch --index-filter 'git rm --cached --ignore-unmatch <sensitive-file>' HEAD

   # Force push (ONLY if not on main/preview)
   git push --force-with-lease
   ```

2. **Rotate Credentials:**
   - If API keys exposed: Rotate immediately
   - If tokens exposed: Revoke and regenerate
   - Update `.env.local` and GitHub Secrets

3. **Post-Incident:**
   - Update pre-commit hook if gap found
   - Add to governance documentation
   - Review quarterly audit process

### Success Criteria

**Phase 1 Complete (January 2026):**
- [x] `.opencode/node_modules/` gitignored
- [x] `.vscode/` workspace files tracked
- [x] Enhanced pre-commit hook installed
- [x] `.vscode/mcp.json.example` template created
- [x] All tests passing

**Phase 2 (Future):**
- [ ] GitHub Actions workflow created
- [ ] `npm run check:governance` script added
- [ ] Quarterly review scheduled
- [ ] Team trained on governance requirements

---

## 📚 Related Documentation

**Foundational (Read First):**

- [`CLAUDE.md`](./CLAUDE.md) - Project context & constraints
- [`docs/ai/quick-reference.md`](docs/ai/quick-reference.md) - Commands & imports
- [`docs/ai/decision-trees.md`](docs/ai/decision-trees.md) - Visual decision flowcharts
- [`docs/ai/mcp-checks.md`](docs/ai/mcp-checks.md) - MCP server health checks & CI guidance

**Deep Dives (Reference as Needed):**

- [`docs/ai/component-patterns.md`](docs/ai/component-patterns.md) - Layout & import patterns
- [`docs/ai/enforcement-rules.md`](docs/ai/enforcement-rules.md) - Design token validation
- [`docs/ai/design-system.md`](docs/ai/design-system.md) - Token system deep dive

**Practical (Copy-Paste Ready):**

- [`docs/templates/`](docs/templates/) - Component, page, and API templates
- [`docs/operations/todo.md`](docs/operations/todo.md) - Current priorities
- `scripts/check-mcp-servers.mjs` - MCP server health checks (dev/CI)

---

## 📋 Recent Updates

### January 30, 2026

- ✅ **Implemented Production Metrics Sync System**
  - Created `scripts/sync-production-metrics.mjs` - Automatic sync from production to preview Redis
  - Integrated into build process: `npm run build` now syncs metrics automatically
  - Added 3 new npm scripts: `sync:metrics`, `sync:metrics:dry-run`, `sync:metrics:quick`
  - Created comprehensive documentation: `docs/operations/PRODUCTION_METRICS_SYNC.md` (385 lines)
  - Added integration tests: `tests/integration/sync-production-metrics.test.ts` (238 lines, 9 tests passing)
  - Created GitHub Actions workflow: `.github/workflows/sync-production-metrics.yml` (daily scheduled sync)
  - **Key features:** One-way sync, automatic key prefixing (`preview:`), comprehensive security exclusions
  - **Synced data:** Analytics milestones, trending posts, page views, engagement metrics
  - **Excluded data:** Sessions, API tokens, rate limits, IP blocks (security-sensitive)
  - **Performance:** Quick mode ~1-2s (4 keys), full mode ~5-15s (50-200 keys)
  - Updated `.github/copilot-instructions.md` with sync documentation
  - See `docs/operations/private/production-metrics-sync-implementation-2026-01-30.md` for complete implementation details

### January 24, 2026

- ✅ **Removed redundant MCP servers for performance optimization**
  - Removed `Memory` MCP from `.vscode/mcp.json` - Duplicate of VS Code built-in `memory` tool
  - Removed `Filesystem` MCP from `.vscode/mcp.json` - Duplicate of VS Code built-in `read`, `edit`, `create_file` tools
  - **KEPT in `opencode.json`** - OpenCode.ai requires these MCPs (no built-in alternatives)
  - **Performance gains:** ~200ms faster startup, 2 fewer NPX spawns, 18% simpler VS Code config
  - **Active MCP servers:** 9 in VS Code (down from 11), 14 in OpenCode (unchanged)
  - **Key finding:** Each AI tool uses separate MCP configuration (VS Code ≠ OpenCode)
  - Created comprehensive analysis: `docs/ai/mcp-overlap-analysis-2026-01-24.md`
  - Updated `.vscode/mcp.json` with removal notes and analysis reference
  - Updated `docs/ai/mcp-checks.md` to reflect current MCP inventory

### February 1, 2026

- ✅ **Removed incomplete Superpowers integration**
  - Removed 3 DCYFR override skills (dcyfr-tdd, dcyfr-brainstorming, dcyfr-code-review)
  - Removed documentation: `docs/ai/superpowers-integration.md`
  - Removed command: `.claude/commands/superpowers.md`
  - Updated all documentation references (AGENTS.md, README.md, todo.md, etc.)
  - **Reason:** Plugin was never installed; integration was documentation-only (67% complete)
  - **Impact:** No functional changes - skills were never active in workflows
  - Skills remain at 19 active (dcyfr-code-reviewer, dcyfr-design-tokens, etc.)

### January 17, 2026

- ✅ **Integrated OpenSkills universal skill distribution (v1.5.0)**
  - Added [numman-ali/openskills](https://github.com/numman-ali/openskills) (5.4k stars) for universal skill access
  - Created `.agent/skills` symlink to `.claude/skills` for universal tool compatibility
  - Generated `<available_skills>` XML in AGENTS.md (22 skills available)
  - Skills now accessible in Cursor, Windsurf, Aider, Codex via `npx openskills read <skill>`
  - Created `docs/ai/universal-agent-configuration.md` - Analysis of agent config standards
  - **Key finding:** No formal universal standard exists; AGENTS.md is de facto (60k+ projects)
  - **Decision:** Keep current multi-file architecture; Copilot requires `.github/`
  - See `docs/ai/universal-agent-configuration.md` for full analysis

- ✅ **Created Accessibility Specialist Agent (v1.0.0)**
  - New agent: `.claude/agents/accessibility-specialist.md` (WCAG 2.1 AA expertise)
  - New command: `/a11y-audit` for comprehensive accessibility audits
  - New skill: `dcyfr-accessibility` for OpenSkills compatibility
  - Updated AGENT_TAXONOMY.md to v1.2.0 (62 active agents, 3 archived)
  - Fills gap identified in "Missing Capabilities" section
  - Integrates with existing: `e2e/utils/accessibility.ts`, `scripts/validate-color-contrast.mjs`

- ✅ **Agent Consolidation (v1.3.0)**
  - Archived 3 redundant agents to `.claude/agents/_archived/`:
    - `architect-review.md` → Use `architecture-reviewer.md`
    - `performance-engineer.md` → Use `performance-profiler.md`
    - `security-auditor.md` → Use `security-engineer.md`
  - Updated AGENT_TAXONOMY.md to v1.1.0 (61 active agents, 3 archived)
  - Simplified decision trees for Architecture, Security, and Performance families

- ✅ **Added native oh-my-opencode features (Phase 7)**
  - Created `scripts/check-todos-complete.mjs` - Sisyphus pattern todo completion checker
  - Created `scripts/check-comment-density.mjs` - Prevents excessive AI-generated comments
  - Created `.claude/commands/ultrawork.md` - Aggressive parallel agent orchestration
  - Created `docs/ai/opencode-usage-guide.md` - OpenCode vs Claude Code decision guide
  - Added Stop hook for todo completion enforcement
  - Added PostToolUse hook for comment density checking

### January 16, 2026

- ✅ **Installed claude-code-templates plugins and organized documentation**
  - Installed 10 plugin packages from claude-code-templates marketplace
  - Plugins: ai-ml-toolkit, devops-automation, documentation-generator, git-workflow, nextjs-vercel-pro, performance-optimizer, project-management-suite, security-pro, testing-suite, supabase-toolkit
  - Executed utilities: ultra-think, generate-tests, create-architecture-documentation, code-review, refactor-code, commit, update-docs
  - Relocated 11 root-level summary files to `docs/operations/sessions/2026-01/`
  - Created session archive README for operational tracking
  - Updated `docs/INDEX.md` with new sections (performance, governance directories)
  - Enhanced `docs/ai/INSTRUCTION_ALIGNMENT_INDEX.md` with extended AI documentation
  - Added comprehensive AI documentation: AITMPL integration, testing strategy, component lifecycle, error handling, state management, animation patterns
  - Documentation now organized into 18 focused directories

- ✅ **Integrated AITMPL.com template agents (v1.0.0)**
  - Added 4 specialized agents from aitmpl.com community templates
  - Installed: frontend-developer, typescript-pro, code-reviewer, test-engineer
  - Created 4 new commands: `/code-review`, `/frontend`, `/typescript`, `/test-strategy`
  - Enhanced DCYFR.md (v2.2.0) with delegation strategy and proactive triggers
  - Updated AGENTS.md with template agent documentation section
  - Created comprehensive enhancement plan (`docs/ai/aitmpl-enhancement-plan.md`)
  - Created integration summary (`docs/ai/aitmpl-integration-summary.md`)
  - Total agents: 15 (11 existing + 4 from templates)
  - Enhanced capabilities: React optimization, TypeScript mastery, code review automation, test engineering

### January 11, 2026

- ✅ **Migrated OpenCode.ai to GitHub Copilot integration (v2.0.0)**
  - Removed Groq provider entirely (llama-3.3-70b-versatile, llama-3.1-70b, specdec)
  - Removed Ollama offline support (codellama:34b, qwen2.5-coder:7b)
  - Added GitHub Copilot models (GPT-5 Mini, Raptor Mini, GPT-4o)
  - Updated authentication (Groq API keys → GitHub Copilot device code flow)
  - Cost optimization (free tier → included with GitHub Copilot subscription, 0 multiplier)
  - Context windows (8K → 16K for primary model)
  - Updated `.opencode/config.json` with GitHub Copilot provider configuration
  - Updated `.env.example` to remove Groq API key instructions
  - Complete rewrite of `.opencode/DCYFR.opencode.md` (257 lines)
  - Complete rewrite of `.opencode/README.md` (347 lines)
  - Complete rewrite of `.opencode/patterns/PROVIDER_SELECTION.md` (400+ lines)
  - Updated `AGENTS.md` OpenCode.ai Fallback System section (v2.0.0)
  - Created Msty.ai backlog task for future offline support
  - Updated all provider references throughout documentation

### January 10, 2026

- ✅ **Enhanced blog engagement and SEO strategy documentation**
  - Updated `.github/copilot-instructions.md` with MDX components table (SectionShare, CollapsibleSection, GlossaryTooltip)
  - Added "Engagement Best Practices" section to Copilot instructions
  - Updated `docs/ai/component-patterns.md` with comprehensive SectionShare and CollapsibleSection sections
  - Added SEO benefits documentation (trackable URLs, backlinks, social sharing)
  - Added UX benefits documentation (progressive disclosure, scanability, accessibility)
  - Updated `docs/blog/content-creation.md` with interactive components guide
  - Added social sharing strategy (place `<SectionShare>` after major sections)
  - Added progressive disclosure strategy (use `<CollapsibleSection>` for role-specific content)
  - Updated `CLAUDE.md` with MDX components quick reference
  - Updated `docs/content/rivet-component-library.md` with Week 2 P1 completion status
  - Documented all three P1 components: GlossaryTooltip (26/26 tests), SectionShare (13/20 tests), CollapsibleSection (26/26 tests)
  - Overall Week 2 metrics: 65/72 tests passing (90% coverage)

### January 7, 2026

- ✅ **Removed quarterly sync automation system** (complete removal)
  - Deleted `.github/workflows/ai-instructions-sync.yml` workflow
  - Merged all 13 open pull requests (171-183) into preview branch
  - Removed quarterly instruction sync process entirely (was creating duplicate PRs)
  - No more automated AI instructions or metrics collection workflows
  - Documentation now maintained manually as needed

### January 5, 2026

- ✅ **Integrated OpenCode.ai as AI fallback tool**
  - Added OpenCode.ai to AI tool hierarchy (🟢 FALLBACK tier)
  - Comprehensive architecture documentation (`docs/ai/opencode-fallback-architecture.md`)
  - VS Code extension integration (`sst-dev.opencode`)
  - Added to `.vscode/extensions.json` recommendations
  - 75+ AI provider support (OpenAI, Anthropic, Gemini, Groq, Ollama)
  - Cost optimization capabilities (10-100x cheaper with Groq)
  - Offline development support via local models
  - NPM scripts: `ai:opencode`, `ai:opencode:groq`, `ai:opencode:local`, `ai:setup`
  - Trigger conditions: Rate limits, token exhaustion, extended sessions, cost optimization
  - VS Code keyboard shortcuts: `Cmd+Esc` (launch), `Cmd+Shift+Esc` (new session), `Cmd+Option+K` (file refs)

### December 28, 2025

- ✅ **Integrated Octocode-MCP as external context source**
  - Added Octocode to `.vscode/mcp.json` MCP server configuration
  - Updated DCYFR.agent.md tools list to include `mcp_octocode/*`
  - Added "External Context Sources" section to DCYFR.agent.md with Octocode documentation
  - Updated `docs/ai/mcp-checks.md` to include Octocode health checks and authentication guidance
  - Documented `/research`, `/plan`, `/review_pull_request`, `/review_security` commands
  - Configured for GitHub CLI auth (recommended) or Personal Access Token
  - Use case: Research production patterns, architecture decisions, security implementations from GitHub codebases

### December 28, 2025 (Earlier)

- ✅ **Added emoji prohibition rule to all AI instructions**
  - Created `scripts/analyze-emoji-usage.mjs` for comprehensive emoji analysis
  - Updated `.github/copilot-instructions.md` with emoji prohibition rule
  - Updated `CLAUDE.md` with emoji usage guidelines
  - Added rule to `.github/agents/DCYFR.agent.md`
  - Identified 17 emojis in public content requiring replacement with React icons
  - Documented acceptable emoji locations (internal docs, comments, logs, tests)

### December 25, 2025

- ✅ **Created comprehensive Test Data Prevention enforcement**
  - Created `.github/agents/enforcement/TEST_DATA_PREVENTION.md` (300+ lines)
  - Added 7 best practice patterns with before/after examples
  - Established environment-aware code patterns (NODE_ENV + VERCEL_ENV)
  - Documented cleanup utilities and pre-deployment safety checks
- ✅ **Updated all AI instructions with test data guidance**
  - Added test data rule #6 to DCYFR.agent.md
  - Added test data prevention section to CLAUDE.md with examples
  - Added test data rule to GitHub Copilot instructions
  - Added test data validation checks to VALIDATION_CHECKLIST.md
  - Added test data failures section with fixes to VALIDATION_CHECKLIST.md
- ✅ **Implemented production safeguards**
  - `scripts/populate-analytics-milestones.mjs` blocks in production ✅
  - `src/lib/github-data.ts` warns when using fallback in production ✅
  - `scripts/clear-test-data.mjs` available for cleanup ✅
  - Added `npm run analytics:clear` script ✅
- ✅ **Production cleanup completed**
  - Removed 13 fabricated analytics items from production Redis
  - Verified all test data keys cleared (4 keys: CLEARED status)
  - Updated TEST_DATA_USAGE.md documentation
- ✅ **Updated AGENTS.md**
  - Added TEST_DATA_PREVENTION.md to enforcement file registry
  - Updated last review date to December 25, 2025
  - Documented decision tree now includes data quality considerations

### December 17, 2025

- ✅ **Removed Playwright MCP support** to optimize tool availability (138 tool limit)
  - Removed Playwright MCP server from `.vscode/mcp.json`
  - Updated `docs/ai/mcp-checks.md` to remove Playwright references
  - Verified no other documentation references `@playwright/mcp`
  - Note: VS Code Playwright extension (`ms-playwright.playwright`) remains for local E2E test execution

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

| System                  | Frequency | Purpose                                    |
| ----------------------- | --------- | ------------------------------------------ |
| **Dependabot Updates**  | Weekly    | Auto-updates npm and GitHub Actions        |
| **Auto-Merge Workflow** | Per PR    | Safely auto-merges patches & minor updates |
| **Instruction Sync**    | Monthly   | Keeps AI docs in sync with project metrics |
| **Security Pre-Checks** | Daily     | Scans for vulnerabilities                  |
| **Test Metrics**        | Per run   | Captures test & performance data           |
| **Lighthouse CI**       | Per push  | Validates performance & accessibility      |

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
- [ ] **Store sensitive files in `**/.private/**` directories** (see below)

**Never:**

- [ ] Create instructions without updating AGENTS.md
- [ ] Have conflicting patterns in different files
- [ ] Leave sync status undefined
- [ ] Update instructions in conversation without PR
- [ ] **Put security findings, audits, or vulnerability analysis in public `/docs/`**

### Sensitive Files Policy

**All sensitive/internal documentation must be stored in subdirectory `.private/` folders under each docs category.**

**What qualifies as sensitive:**

- Security vulnerability details and findings
- CodeQL/security scanning results and remediation
- Audit reports and analysis (API security, infrastructure, etc.)
- Incident reports and root cause analysis
- Red team engagement plans and results
- Internal security assessments
- Deployment secrets or sensitive configurations
- Third-party security reviews
- PII/PI audit results and taxonomies

**Directory structure (subdirectory-specific approach):**

```text
/docs/
├── security/
│   ├── public docs...
│   └── .private/       # Security audits, findings, vulnerabilities
├── operations/
│   ├── public docs...
│   └── .private/       # Internal operations and deployment docs
├── design/
│   ├── public docs...
│   └── .private/       # Design analysis and metrics
└── ...
```

**Examples:**

- ✅ `/docs/security/.private/CODEQL_FINDINGS_RESOLVED.md`
- ✅ `/docs/security/.private/SECURITY_AUDIT_SUMMARY.md`
- ✅ `/docs/operations/.private/PERFORMANCE_METRICS.md`
- ❌ `/docs/security/VULNERABILITY_REPORT.md` (should be in .private/ subfolder)

**Rationale:** Subdirectory-specific `private/` folders prevent duplicate content and keep related materials together. See [DOCS_GOVERNANCE.md](docs/governance/DOCS_GOVERNANCE.md) for complete policy.

---

**Status:** Production Ready
**Last Reviewed:** January 11, 2026 (Project Cleanup & Organization Update)
**Next Review:** April 11, 2026 (Quarterly)

For issues, updates, or new agents: Submit PR with AGENTS.md changes first.
````

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:

- Invoke: `npx openskills read <skill-name>` (run in your shell)
  - For multiple: `npx openskills read skill-one,skill-two`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:

- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
  </usage>

<available_skills>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.</description>
<location>project</location>
</skill>

<skill>
<name>code-reviewer</name>
<description>Comprehensive code review skill for TypeScript, JavaScript, Python, Swift, Kotlin, Go. Includes automated code analysis, best practice checking, security scanning, and review checklist generation. Use when reviewing pull requests, providing code feedback, identifying issues, or ensuring code quality standards.</description>
<location>project</location>
</skill>

<skill>
<name>dcyfr-accessibility</name>
<description>DCYFR accessibility patterns for WCAG 2.1 AA compliance, focus states, color contrast, screen readers, and keyboard navigation. Use when auditing pages for accessibility, implementing accessible components, or fixing a11y violations.</description>
<location>project</location>
</skill>

<skill>
<name>dcyfr-design-tokens</name>
<description>DCYFR design token system for consistent styling using SPACING, TYPOGRAPHY, and SEMANTIC_COLORS tokens. Use when creating/modifying UI components, enforcing design consistency, or fixing hardcoded style violations.</description>
<location>project</location>
</skill>

<skill>
<name>dcyfr-inngest-patterns</name>
<description>DCYFR Inngest integration patterns for background jobs, event-driven workflows, and the Validate→Queue→Respond API pattern. Use when building API routes, background tasks, or event-driven features.</description>
<location>project</location>
</skill>

<skill>
<name>dcyfr-mdx-authoring</name>
<description>DCYFR MDX authoring patterns for blog posts and content with custom components (SectionShare, CollapsibleSection, GlossaryTooltip). Use when creating blog content, adding interactive elements, or optimizing content for engagement.</description>
<location>project</location>
</skill>

<skill>
<name>file-organizer</name>
<description>Intelligently organizes your files and folders across your computer by understanding context, finding duplicates, suggesting better structures, and automating cleanup tasks. Reduces cognitive load and keeps your digital workspace tidy without manual effort.</description>
<location>project</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.</description>
<location>project</location>
</skill>

<skill>
<name>git-commit-helper</name>
<description>Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.</description>
<location>project</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>project</location>
</skill>

<skill>
<name>next-app-router</name>
<description>Next.js 15 App Router patterns for server components, layouts, metadata, streaming, and caching. Use when building pages, implementing data fetching, or optimizing Next.js applications.</description>
<location>project</location>
</skill>

<skill>
<name>pdf-processing-pro</name>
<description>Production-ready PDF processing with forms, tables, OCR, validation, and batch operations. Use when working with complex PDF workflows in production environments, processing large volumes of PDFs, or requiring robust error handling and validation.</description>
<location>project</location>
</skill>

<skill>
<name>react-best-practices</name>
<description>Comprehensive React and Next.js performance optimization guide with 40+ rules for eliminating waterfalls, optimizing bundles, and improving rendering. Use when optimizing React apps, reviewing performance, or refactoring components.</description>
<location>project</location>
</skill>

<skill>
<name>senior-architect</name>
<description>Comprehensive software architecture skill for designing scalable, maintainable systems using ReactJS, NextJS, NodeJS, Express, React Native, Swift, Kotlin, Flutter, Postgres, GraphQL, Go, Python. Includes architecture diagram generation, system design patterns, tech stack decision frameworks, and dependency analysis. Use when designing system architecture, making technical decisions, creating architecture diagrams, evaluating trade-offs, or defining integration patterns.</description>
<location>project</location>
</skill>

<skill>
<name>senior-backend</name>
<description>Comprehensive backend development skill for building scalable backend systems using NodeJS, Express, Go, Python, Postgres, GraphQL, REST APIs. Includes API scaffolding, database optimization, security implementation, and performance tuning. Use when designing APIs, optimizing database queries, implementing business logic, handling authentication/authorization, or reviewing backend code.</description>
<location>project</location>
</skill>

<skill>
<name>senior-frontend</name>
<description>Comprehensive frontend development skill for building modern, performant web applications using ReactJS, NextJS, TypeScript, Tailwind CSS. Includes component scaffolding, performance optimization, bundle analysis, and UI best practices. Use when developing frontend features, optimizing performance, implementing UI/UX designs, managing state, or reviewing frontend code.</description>
<location>project</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>project</location>
</skill>

<skill>
<name>ui-design-system</name>
<description>UI design system toolkit for Senior UI Designer including design token generation, component documentation, responsive design calculations, and developer handoff tools. Use for creating design systems, maintaining visual consistency, and facilitating design-dev collaboration.</description>
<location>project</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>"Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"</description>
<location>project</location>
</skill>

</available_skills>

<!-- SKILLS_TABLE_END -->

</skills_system>
