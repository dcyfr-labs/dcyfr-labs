# Session Handoff Between AI Models

**Status**: Production Ready  
**Last Updated**: January 11, 2026  
**Purpose**: Seamless context transfer when switching between Claude, GitHub Copilot, and OpenCode agents

---

## Overview

Session handoff enables you to **switch between AI agents mid-task** while preserving:
- Current work context (files, changes, goals)
- Git state (branch, commits, staging)
- Task progress (todos, issues, PRs)
- Session metadata (start time, provider, estimated completion)

**Use Cases**:
- Claude Code → OpenCode with GitHub Copilot (rate limit reached)
- GitHub Copilot → Claude Sonnet (escalation needed for complex logic)
- OpenCode → Claude (need deep research capabilities)
- GitHub Copilot GPT-5 Mini → Claude Sonnet (security-sensitive work)

---

## Session State Schema (v2.0)

All agents use a **universal session state format** for compatibility.

**File Locations**:
- **OpenCode**: `.opencode/.session-state.json`
- **Claude Code**: `.claude/.session-state.json`
- **GitHub Copilot**: `.github/copilot-session-state.json`

**Schema**:
```json
{
  "version": "2.0",
  "timestamp": "2026-01-11T12:30:00Z",
  "agent": "opencode",
  "provider": "github-copilot-gpt5-mini",
  "task": {
    "description": "Implement user authentication with NextAuth",
    "status": "in_progress",
    "priority": "high",
    "estimated_time": "2 hours",
    "time_spent": "45 minutes"
  },
  "context": {
    "files_modified": [
      "app/api/auth/[...nextauth]/route.ts",
      "lib/auth.ts"
    ],
    "files_created": [
      "components/auth/LoginButton.tsx"
    ],
    "next_steps": [
      "Add session provider to layout",
      "Test login flow",
      "Update environment variables"
    ]
  },
  "git": {
    "branch": "feat/nextauth-integration",
    "uncommitted_changes": true,
    "staged_files": ["app/api/auth/[...nextauth]/route.ts"],
    "last_commit": "abc123",
    "issues": ["#42"],
    "prs": []
  },
  "validation": {
    "typescript": "pass",
    "eslint": "pass",
    "tests": "not_run",
    "strict_rules": "pending"
  }
}
```

**Session state files are git-ignored** (excluded in `.gitignore`).

---

## Handoff Workflows

### 1. Claude Code → OpenCode with GitHub Copilot (Rate Limit)

**Scenario**: Claude hits rate limit mid-implementation, need to continue with GitHub Copilot GPT-5 Mini.

**Process**:

```bash
# Step 1: Save Claude session state
npm run session:save claude "Implementing auth" in_progress "2h"
# Creates: .claude/.session-state.json

# Step 2: Review what was saved
cat .claude/.session-state.json | jq .

# Step 3: Commit current work (if stable)
git add .
git commit -m "wip: auth implementation (switching to OpenCode)"

# Step 4: Restore session to OpenCode
npm run session:restore claude opencode

# Step 5: Launch OpenCode with GitHub Copilot
opencode --preset dcyfr-feature

# Step 6: In OpenCode, provide context
# "Continue implementing NextAuth integration from Claude session.
#  Files modified: [see .opencode/.session-state.json]
#  Next steps: Add session provider, test login flow"
```

**OpenCode Prompt Template**:
```
Continue implementing [TASK] from Claude Code session.

Context from session state:
- Task: [DESCRIPTION]
- Files modified: [LIST]
- Next steps: [LIST]
- Current branch: [BRANCH]
- Issues: [ISSUE_NUMBERS]

Please continue following DCYFR patterns (design tokens, PageLayout, barrel exports).
Run validation when complete: npm run check:opencode
```

---

### 2. OpenCode (GitHub Copilot) → Claude Sonnet (Escalation)

**Scenario**: GitHub Copilot GPT-5 Mini struggles with complex logic, need Claude Sonnet's deeper reasoning.

**Process**:

```bash
# Step 1: Save OpenCode session state
npm run session:save opencode "Complex auth logic" blocked "1h"

# Step 2: Run validation to identify issues
npm run check:opencode
# Note violations/failures

# Step 3: Commit current work (even if incomplete)
git add .
git commit -m "wip: auth logic (escalating to Claude for complex issue)"

# Step 4: Switch to Claude Sonnet via OpenCode provider menu
opencode
/connect
# Select "Claude Sonnet 4"

# Step 5: Provide escalation context
# "GitHub Copilot session struggled with complex auth state management.
#  Validation issues: [LIST]
#  Need deeper reasoning for edge cases."
```

**Claude Escalation Prompt**:
```
Escalated from OpenCode (GitHub Copilot GPT-5 Mini) due to complex logic.

Session context:
- Task: [DESCRIPTION]
- Issue: [PROBLEM_DESCRIPTION]
- Validation failures: [LIST]
- Files involved: [LIST]

Please review implementation and fix logic issues.
Ensure DCYFR compliance (design tokens, PageLayout, barrel exports).
```

---

### 3. GitHub Copilot Raptor Mini → GPT-5 Mini (Context Exceeded)

**Scenario**: Started with Raptor Mini (8K context), need more context for multi-file refactoring.

**Process**:

```bash
# Step 1: Save current session
npm run session:save opencode "Refactor auth" in_progress "30min"

# Step 2: Switch to GPT-5 Mini (16K context)
opencode --preset dcyfr-feature

# Step 3: In OpenCode, switch model
/models
# Select "gpt-5-mini" (16K context)

# Step 4: Continue work with larger context
# "Continue refactoring auth module.
#  Previous session used Raptor Mini but hit 8K context limit.
#  Need to analyze [LIST_FILES] together."
```

---

### 4. GitHub Copilot → Claude Sonnet (Security Work)

**Scenario**: Implementing OAuth - security-sensitive, always use premium Claude Sonnet.

**Process**:

```bash
# Step 1: Save OpenCode session (if already started)
npm run session:save opencode "OAuth integration" planning "2h"

# Step 2: Switch to Claude Sonnet
opencode
/connect
# Select "Claude Sonnet 4"

# Step 3: Security-focused prompt
# "Implementing OAuth 2.0 authentication with GitHub provider.
#  Security-sensitive work requiring careful PKCE flow implementation.
#  Follow DCYFR patterns + OWASP best practices."
```

**Why use Claude Sonnet**: Security work always uses premium model (100% allocation, no GitHub Copilot).

---

## Handoff Script Usage

### Automated Handoff

```bash
# General syntax
scripts/session-handoff.sh <from-agent> <to-agent> [--provider <provider>]

# Examples:
scripts/session-handoff.sh claude opencode
scripts/session-handoff.sh opencode claude
scripts/session-handoff.sh opencode opencode --provider dcyfr-feature
```

**What the script does**:
1. Saves current agent session state
2. Checks git status (warns if uncommitted changes)
3. Restores session state to target agent
4. Provides context prompt template
5. Validates session transfer

### Manual Handoff

```bash
# Step 1: Save current session
npm run session:save <agent> "<task>" <status> "<estimate>"

# Step 2: Review state
cat .<agent>/.session-state.json | jq .

# Step 3: Commit work (optional)
git add .
git commit -m "wip: switching agents"

# Step 4: Restore to new agent
npm run session:restore <from-agent> <to-agent>

# Step 5: Launch new agent
opencode --preset dcyfr-feature  # Or other agent
```

---

## Provider Transition Patterns

### Pattern 1: Performance → Quality

**Transition**: Raptor Mini (fast, 8K) → GPT-5 Mini (balanced, 16K) → Claude Sonnet (best, 200K)

**Use when**: Task complexity increases during development.

```bash
# Start fast
opencode --preset dcyfr-quick  # Raptor Mini

# If complexity increases, upgrade to GPT-5 Mini
opencode --preset dcyfr-feature

# If still stuck, escalate to Claude Sonnet
opencode
/connect → Claude Sonnet 4
```

### Pattern 2: Free → Premium

**Transition**: GitHub Copilot (included) → Claude Sonnet (premium)

**Use when**: Encountering security-sensitive work or complex logic.

```bash
# Start with included model
opencode --preset dcyfr-feature  # GitHub Copilot GPT-5 Mini ($0)

# Escalate to premium if needed
opencode
/connect → Claude Sonnet 4  # Premium (usage fee)
```

### Pattern 3: Multi-Model Validation

**Transition**: GPT-5 Mini → GPT-4o (cross-validation) → Claude Sonnet (tiebreaker)

**Use when**: Uncertainty about implementation approach.

```bash
# Implementation with GPT-5 Mini
opencode --preset dcyfr-feature

# Cross-validate with GPT-4o (different architecture)
opencode
/models → gpt-4o

# If discrepancy, use Claude Sonnet as tiebreaker
opencode
/connect → Claude Sonnet 4
```

---

## Git Workflow Integration

### Recommended Git Strategy

**Commit before handoff** (recommended):
```bash
# Save clean state before switching
git add .
git commit -m "wip: feature X (switching from GitHub Copilot to Claude)"
npm run session:restore opencode claude
```

**Stash if uncommitted** (alternative):
```bash
# Stash work if not ready to commit
git stash push -m "feature X mid-implementation"
npm run session:restore opencode claude
# After handoff, restore if needed:
git stash pop
```

**Branch per agent** (advanced):
```bash
# Create feature branch per agent session
git checkout -b feat/auth-copilot
# Work with GitHub Copilot...
git commit -m "feat: auth implementation (GitHub Copilot)"

# Switch to Claude branch
git checkout -b feat/auth-claude
git merge feat/auth-copilot
# Continue with Claude...
```

---

## Session State Management

### Save Session State

```bash
# Manual save
npm run session:save <agent> "<task>" <status> "<estimate>"

# Examples:
npm run session:save opencode "Implement auth" in_progress "2h"
npm run session:save claude "Debug OAuth" blocked "30min"
npm run session:save copilot "Refactor components" planning "1h"

# Status options: planning, in_progress, blocked, complete
```

### Restore Session State

```bash
# Restore from one agent to another
npm run session:restore <from-agent> <to-agent>

# Examples:
npm run session:restore claude opencode
npm run session:restore opencode claude
npm run session:restore copilot opencode
```

### View Session State

```bash
# View OpenCode session
cat .opencode/.session-state.json | jq .

# View Claude session
cat .claude/.session-state.json | jq .

# View GitHub Copilot session
cat .github/copilot-session-state.json | jq .

# Compare sessions
diff <(cat .opencode/.session-state.json | jq .) \
     <(cat .claude/.session-state.json | jq .)
```

---

## Validation After Handoff

### Standard Validation

After any agent handoff, run validation:

```bash
# Type + lint + test
npm run check

# Enhanced validation (GitHub Copilot sessions)
npm run check:opencode
```

### STRICT Rule Validation

Ensure STRICT rules followed:

```bash
# Check design tokens
npm run lint | grep "@dcyfr/no-hardcoded-values"

# Check PageLayout usage
grep -r "<PageLayout" app --include="page.tsx" | wc -l

# Check barrel exports
# (Manual review - ensure no deep imports like @/components/blog/PostCard)

# Check test data environment checks
grep -r "fabricated\|test data" --include="*.ts" --include="*.tsx"

# Check no emojis in public content
grep -r "[😀-🙏]" app src --include="*.tsx" --include="*.md"
```

---

## Troubleshooting

### Issue 1: Session State Not Saved

**Symptoms**: `.opencode/.session-state.json` missing or outdated

**Fix**:
```bash
# Manually save session
npm run session:save opencode "Current task" in_progress "estimate"

# Verify file created
ls -la .opencode/.session-state.json
```

### Issue 2: Context Lost During Handoff

**Symptoms**: New agent doesn't have full context

**Fix**:
```bash
# Review session state file
cat .opencode/.session-state.json | jq .

# Manually provide context in prompt:
# "Continue from OpenCode session:
#  Task: [DESCRIPTION]
#  Files: [LIST]
#  Next steps: [LIST]"
```

### Issue 3: Git Conflicts After Handoff

**Symptoms**: Merge conflicts when switching branches/agents

**Fix**:
```bash
# Commit before handoff (always)
git add .
git commit -m "wip: before switching agents"

# Or stash:
git stash push -m "before agent switch"

# After handoff:
git stash pop  # If stashed
```

### Issue 4: Provider Switch Failed

**Symptoms**: OpenCode can't switch to GitHub Copilot

**Fix**:
```bash
# Check GitHub Copilot authentication
opencode
/connect → GitHub Copilot
# Follow device code flow if needed

# Verify models available
/models
# Should show: gpt-5-mini, raptor-mini, gpt-4o

# Check provider health
npm run opencode:health
```

---

## Best Practices

### 1. Always Save Before Switching

```bash
# GOOD: Save before switching
npm run session:save opencode "Task" in_progress "1h"
npm run session:restore opencode claude

# BAD: Switch without saving (context lost)
opencode  # Stop
opencode  # Restart (context lost)
```

### 2. Commit Frequently

```bash
# Commit at natural breakpoints
git commit -m "feat: implement auth flow (GitHub Copilot)"
# Switch agents...
git commit -m "feat: refine auth logic (Claude Sonnet)"
```

### 3. Use Descriptive Session Names

```bash
# GOOD: Descriptive
npm run session:save opencode "Implement OAuth PKCE flow with GitHub provider" in_progress "2h"

# BAD: Vague
npm run session:save opencode "Auth stuff" in_progress "1h"
```

### 4. Validate After Premium Escalation

```bash
# After using Claude Sonnet (premium), validate quality
npm run check:opencode

# Ensure premium model delivered expected quality
# If issues remain, consider different approach
```

### 5. Document Handoff Reasoning

```bash
# In git commit message:
git commit -m "wip: switching from GitHub Copilot to Claude Sonnet

Reason: Complex state management logic requires deeper reasoning.
GitHub Copilot GPT-5 Mini struggled with edge cases after 3 attempts.
Escalating to Claude Sonnet 4 for premium quality."
```

---

## Provider Selection Decision Tree

```
Need to switch agents?
    ↓
What's the reason?
    │
    ├─ Rate limit → Use OpenCode with GitHub Copilot ($0)
    ├─ Complex logic → Escalate to Claude Sonnet (premium)
    ├─ Security work → Always use Claude Sonnet (premium)
    ├─ Context exceeded → Switch to larger context model
    │   ├─ 8K → 16K: Raptor Mini → GPT-5 Mini ($0)
    │   ├─ 16K → 128K: GPT-5 Mini → GPT-4o ($0)
    │   └─ 128K+: Use Claude Sonnet (premium, 200K)
    └─ Quality issues → Try different model or escalate premium
```

---

## Summary

**Handoff Process**:
1. Save current session: `npm run session:save <agent> "<task>" <status> "<estimate>"`
2. Commit work: `git commit -m "wip: switching agents"`
3. Restore session: `npm run session:restore <from> <to>`
4. Launch new agent: `opencode --preset dcyfr-feature` (or other)
5. Validate: `npm run check:opencode`

**Common Transitions**:
- Claude Code → OpenCode (GitHub Copilot): Rate limit
- GitHub Copilot → Claude Sonnet: Escalation
- Raptor Mini → GPT-5 Mini: Context limit
- GPT-5 Mini → Claude Sonnet: Security/complex work

**Cost Optimization**:
- Use GitHub Copilot (GPT-5 Mini, Raptor Mini) for 80% of work ($0)
- Escalate to Claude Sonnet for 20% of work (premium)

---

**Status**: Production Ready  
**Next Review**: February 11, 2026  
**See Also**: [COST_OPTIMIZATION.md](COST_OPTIMIZATION.md), [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
