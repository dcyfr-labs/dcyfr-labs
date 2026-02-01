<!-- TLP:CLEAR -->

# Universal Agent Configuration Analysis

**Version:** 1.0.0
**Date:** January 17, 2026
**Status:** Analysis Complete

This document analyzes universal agent configuration standards and DCYFR-labs' approach.

---

## Executive Summary

**Current State:** No formal universal standard exists, but `AGENTS.md` is the emerging de facto standard with 60k+ open-source projects adopting it.

**DCYFR Decision:** Keep current multi-file architecture with tool-specific optimizations. Added OpenSkills integration for universal skill distribution.

---

## Industry Landscape

### The Emerging Standard: AGENTS.md

| Aspect         | Details                                                     |
| -------------- | ----------------------------------------------------------- |
| **Repository** | [agentsmd/agents.md](https://github.com/agentsmd/agents.md) |
| **Stars**      | 15.5k                                                       |
| **Adoption**   | 60k+ open-source projects                                   |
| **Governance** | Linux Foundation (Agentic AI Foundation)                    |
| **Format**     | Standard Markdown                                           |

### Tool Support Matrix

| Tool               | `AGENTS.md`  | Proprietary Format                | Notes                    |
| ------------------ | ------------ | --------------------------------- | ------------------------ |
| **Claude Code**    | Yes          | `CLAUDE.md`, `.claude/`           | Full skills/hooks system |
| **GitHub Copilot** | Yes          | `.github/copilot-instructions.md` | Most structured          |
| **Cursor**         | Yes          | `.cursorrules`, `.cursor/rules/`  | MDC format               |
| **Windsurf**       | Yes          | `.windsurfrules`                  | Simple                   |
| **Codex (OpenAI)** | Native       | -                                 | AGENTS.md primary        |
| **Jules (Google)** | Native       | `GEMINI.md`                       | Both supported           |
| **Aider**          | Configurable | -                                 | User choice              |
| **Zed**            | Native       | -                                 | AGENTS.md primary        |
| **OpenCode**       | Native       | `.opencode/`                      | AGENTS.md + config       |

---

## Why We Don't Fully Consolidate

### 1. GitHub Copilot Requires `.github/`

Copilot doesn't read `.agent/` or other universal directories. It requires:

- `.github/copilot-instructions.md` for repository-wide instructions
- `.github/instructions/*.instructions.md` for path-specific rules

### 2. Tool-Specific Features Aren't Portable

| Feature             | Claude Code             | Copilot | Cursor   | Portable?      |
| ------------------- | ----------------------- | ------- | -------- | -------------- |
| **Hooks**           | `.claude/settings.json` | N/A     | N/A      | No             |
| **Commands**        | `.claude/commands/`     | N/A     | N/A      | No             |
| **Model selection** | Per-agent               | N/A     | Per-rule | No             |
| **Skills**          | `.claude/skills/`       | N/A     | N/A      | Via OpenSkills |

### 3. No Formal Specification Yet

AGENTS.md is de facto, not a formal standard. The Linux Foundation governance may lead to a spec, but none exists today.

---

## DCYFR-Labs Architecture

### Current Setup (Optimized)

```
AGENTS.md              ← Universal hub (industry standard)
CLAUDE.md              ← Claude Code primary instructions
.github/
├── copilot-instructions.md    ← Copilot 80/20 patterns
└── agents/                    ← Shared modular documentation
.claude/
├── agents/                    ← 62 specialized agents
├── commands/                  ← 47 commands
├── skills/                    ← 22 skills (source of truth)
└── settings.json              ← Hooks, configuration
.opencode/
└── DCYFR.opencode.md          ← OpenCode fallback config
.agent/
└── skills -> ../.claude/skills  ← Universal skills symlink
```

### Why This Works

1. **AGENTS.md as universal hub** - Any tool can read it
2. **Tool-specific optimization** - Full Claude Code features
3. **Shared documentation** - `.github/agents/` referenced by all
4. **Universal skill distribution** - OpenSkills syncs to AGENTS.md

---

## OpenSkills Integration

### What OpenSkills Does

OpenSkills brings Claude Code's skills system to every AI coding agent by:

1. Generating `<available_skills>` XML in AGENTS.md
2. Providing `npx openskills read <skill>` for runtime loading
3. Supporting universal `.agent/skills/` directory

### Our Implementation

```bash
# .agent/skills is a symlink to .claude/skills
.agent/skills -> ../.claude/skills

# OpenSkills syncs skills to AGENTS.md
npx openskills sync
```

### Benefits

| Benefit                    | Impact                                        |
| -------------------------- | --------------------------------------------- |
| **Universal access**       | Skills work in Cursor, Windsurf, Aider, Codex |
| **Single source of truth** | `.claude/skills/` remains authoritative       |
| **No duplication**         | Symlink avoids copying skills                 |
| **Auto-discovery**         | AGENTS.md contains `<available_skills>`       |

### Usage in Non-Claude Tools

```bash
# In Cursor, Windsurf, Aider, etc.
npx openskills read dcyfr-design-tokens
npx openskills read dcyfr-accessibility,dcyfr-inngest-patterns
```

---

## Sync Strategy

### Flow Direction

```
.claude/skills/          ← Source of truth (Claude Code native)
       ↓
.agent/skills/           ← Symlink for universal access
       ↓
AGENTS.md                ← OpenSkills generates <available_skills>
       ↓
Cursor/Windsurf/Aider    ← Read skills via npx openskills read
```

### Maintenance Commands

```bash
# Sync skills to AGENTS.md after adding/removing skills
npx openskills sync

# List available skills
npx openskills list

# Update skills from external sources
npx openskills update
```

---

## When to Reconsider Full Consolidation

| Trigger                                      | Action                              |
| -------------------------------------------- | ----------------------------------- |
| **Linux Foundation releases AGENTS.md spec** | Evaluate formal directory structure |
| **Copilot adds `.agent/` support**           | Consider migration                  |
| **agentinit matures (currently 2 stars)**    | Evaluate auto-sync tools            |
| **MCP configuration standardizes**           | Unify `.vscode/mcp.json` approach   |

---

## Emerging Tools to Watch

### agentinit

**Repository:** [agentinit/agentinit](https://github.com/agentinit/agentinit)

Unified CLI for managing AI coding agent configurations:

- Syncs between Claude, Cursor, Windsurf, Codex
- Smart stack detection
- MCP management

**Status:** Early (2 stars), but concept is promising.

### agent-config-adapter

**Repository:** [PrashamTrivedi/agent-config-adapter](https://github.com/PrashamTrivedi/agent-config-adapter)

AI-powered format converter:

- Converts between Claude, Codex, Gemini formats
- MCP server implementation
- Web UI for management

---

## Key Decisions Documented

| Decision                    | Rationale                                            | Date       |
| --------------------------- | ---------------------------------------------------- | ---------- |
| Keep separate configs       | Copilot requires `.github/`, features not portable   | 2026-01-17 |
| Add OpenSkills              | Universal skill distribution without replacing setup | 2026-01-17 |
| Symlink `.agent/skills`     | Single source of truth, no duplication               | 2026-01-17 |
| Don't adopt `.agent/` fully | No spec, Copilot doesn't support                     | 2026-01-17 |

---

## Related Documentation

- [AGENTS.md](../../AGENTS.md) - Central AI hub
- claude-code-enhancements.md - Claude Code config
- [opencode-fallback-architecture.md](./opencode-fallback-architecture.md) - OpenCode setup

---

## References

1. [AGENTS.md Website](https://agents.md)
2. [agentsmd/agents.md GitHub](https://github.com/agentsmd/agents.md)
3. [OpenSkills GitHub](https://github.com/numman-ali/openskills)
4. [GitHub Copilot Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
