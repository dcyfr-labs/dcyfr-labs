<!-- TLP:CLEAR -->

# Superpowers Integration

**Version:** 1.0.0  
**Date:** January 17, 2026  
**Status:** Integrated

This document describes the integration of obra/superpowers into dcyfr-labs.

---

## Overview

[Superpowers](https://github.com/obra/superpowers) (27.4k stars) is an agentic skills framework and software development methodology by Jesse Vincent (@obra). It enforces disciplined development practices through composable skills.

### Why We Integrated

| DCYFR Need | Superpowers Solution |
|------------|---------------------|
| Stricter TDD enforcement | "Watch it fail" discipline, delete code written before tests |
| Structured design phase | Mandatory brainstorming skill with one-question-at-a-time approach |
| Subagent coordination | Two-stage review (spec compliance, then code quality) |
| Systematic debugging | 4-phase root cause process |
| Verification rigor | "Verify before declaring success" philosophy |

---

## Installation

### Claude Code (Recommended)

```bash
# Step 1: Add the marketplace
/plugin marketplace add obra/superpowers-marketplace

# Step 2: Install the plugin
/plugin install superpowers@superpowers-marketplace

# Step 3: Verify
/help
# Should show superpowers commands
```

### OpenCode

```bash
# Clone to OpenCode config
mkdir -p ~/.config/opencode/superpowers
git clone https://github.com/obra/superpowers.git ~/.config/opencode/superpowers

# Create plugin symlink
mkdir -p ~/.config/opencode/plugin
ln -sf ~/.config/opencode/superpowers/.opencode/plugin/superpowers.js ~/.config/opencode/plugin/superpowers.js
```

### Codex

Tell Codex:
```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
```

---

## Superpowers Skills

### Core Workflow Skills

| Skill | Purpose | When Activated |
|-------|---------|----------------|
| `brainstorming` | Socratic design refinement | Before any creative work |
| `writing-plans` | Detailed implementation plans | After design approval |
| `executing-plans` | Batch execution with checkpoints | With approved plan |
| `subagent-driven-development` | Fresh subagent per task + two-stage review | Same session execution |

### Development Discipline

| Skill | Purpose | When Activated |
|-------|---------|----------------|
| `test-driven-development` | RED-GREEN-REFACTOR enforcement | Any feature/bugfix |
| `systematic-debugging` | 4-phase root cause process | Bug investigation |
| `verification-before-completion` | Ensure it's actually fixed | Before declaring done |

### Git Workflow

| Skill | Purpose | When Activated |
|-------|---------|----------------|
| `using-git-worktrees` | Isolated development branches | After design approval |
| `finishing-a-development-branch` | Merge/PR decision workflow | When tasks complete |

### Code Review

| Skill | Purpose | When Activated |
|-------|---------|----------------|
| `requesting-code-review` | Pre-review checklist | Between tasks |
| `receiving-code-review` | Responding to feedback | After review received |

### Meta

| Skill | Purpose | When Activated |
|-------|---------|----------------|
| `writing-skills` | Create new skills (TDD for docs) | Creating skills |
| `using-superpowers` | Introduction to system | Onboarding |

---

## DCYFR Override Skills

We created three project-specific skills that extend Superpowers with DCYFR patterns:

### `dcyfr-tdd`

**Extends:** `superpowers:test-driven-development`

Adds DCYFR validation phase after GREEN:

```
RED → GREEN → DCYFR-VALIDATE → REFACTOR
```

**DCYFR-VALIDATE checks:**
- Design token compliance (no hardcoded spacing/typography)
- Barrel export usage (no direct component imports)
- PageLayout usage (for page components)

**Location:** `.claude/skills/dcyfr-tdd/SKILL.md`

### `dcyfr-brainstorming`

**Extends:** `superpowers:brainstorming`

Adds DCYFR design decisions to brainstorming:

1. **Layout Decision** - PageLayout vs custom (90% rule)
2. **Design Token Strategy** - Plan token usage upfront
3. **API Pattern Decision** - Validate→Queue→Respond vs synchronous
4. **Component Composition** - Identify reusable components
5. **Test Strategy** - Plan test types

**Location:** `.claude/skills/dcyfr-brainstorming/SKILL.md`

### `dcyfr-code-review`

**Extends:** `superpowers:requesting-code-review`

Adds DCYFR checklist to code review:

**Critical (blocks merge):**
- Design tokens used correctly
- Barrel exports (no direct imports)
- PageLayout on pages
- Test coverage

**Important (should fix):**
- API patterns
- Error handling
- Accessibility

**Location:** `.claude/skills/dcyfr-code-review/SKILL.md`

---

## Skill Priority

When both Superpowers and DCYFR skills exist, project skills take precedence:

```
Project Skills (.claude/skills/) → Superpowers Skills → User Skills
```

So `dcyfr-tdd` overrides `superpowers:test-driven-development` in this project.

---

## Philosophy Alignment

| Principle | Superpowers | DCYFR | Alignment |
|-----------|-------------|-------|-----------|
| Test-First | "Delete code written before tests" | 99% test pass rate | Superpowers is stricter |
| Design Phase | Mandatory brainstorming | Ad-hoc design | Superpowers adds structure |
| Verification | "Verify before declaring success" | Validation hooks | Strong alignment |
| Systematic | "Process over guessing" | Pattern enforcement | Strong alignment |
| Simplicity | YAGNI ruthlessly | Design tokens only | Strong alignment |

---

## Usage Workflow

### Standard Feature Development

```
1. User describes feature
   └─ brainstorming activates (superpowers:brainstorming + dcyfr-brainstorming)

2. Design approved
   └─ using-git-worktrees creates isolated branch
   └─ writing-plans creates implementation plan

3. Implementation begins
   └─ subagent-driven-development executes tasks
   └─ test-driven-development + dcyfr-tdd enforces TDD
   └─ dcyfr-code-review validates after each task

4. All tasks complete
   └─ verification-before-completion final check
   └─ finishing-a-development-branch decides merge/PR

5. Done
```

### Quick Bugfix

```
1. Bug reported
   └─ systematic-debugging activates

2. Root cause found
   └─ test-driven-development writes failing test first
   └─ dcyfr-tdd validates tokens after fix

3. Fix verified
   └─ verification-before-completion confirms resolution
```

---

## Commands

Superpowers adds these commands to Claude Code:

| Command | Purpose |
|---------|---------|
| `/superpowers:brainstorm` | Start interactive design refinement |
| `/superpowers:write-plan` | Create implementation plan |
| `/superpowers:execute-plan` | Execute plan in batches |

---

## Updating

```bash
# Claude Code
/plugin update superpowers

# OpenCode
cd ~/.config/opencode/superpowers && git pull
```

---

## Troubleshooting

### Skills not loading

1. Verify plugin installed: `/help` should show superpowers commands
2. Check skill exists: `ls ~/.claude/plugins/cache/superpowers*/skills/`
3. Force reload: Restart Claude Code session

### DCYFR overrides not working

1. Verify skill files exist: `ls .claude/skills/dcyfr-*/SKILL.md`
2. Check frontmatter format: `name` and `description` fields required
3. Project skills should override automatically

### Conflicts with existing DCYFR skills

The DCYFR override skills are designed to **extend** Superpowers, not replace our existing skills like `dcyfr-design-tokens`. They complement each other:

- `dcyfr-design-tokens` - Full token reference
- `dcyfr-tdd` - TDD process with token validation

---

## See Also

- [Superpowers GitHub](https://github.com/obra/superpowers) - Official repository
- [AGENTS.md](../../AGENTS.md) - AI architecture overview
- claude-code-enhancements.md - Claude Code configuration
- [opencode-usage-guide.md](./opencode-usage-guide.md) - OpenCode integration
