# Session Handoff Between AI Models

**Status**: Production Ready  
**Last Updated**: January 5, 2026  
**Purpose**: Seamless context transfer when switching between Claude, Copilot, and OpenCode agents

---

## Overview

Session handoff enables you to **switch between AI agents mid-task** while preserving:
- Current work context (files, changes, goals)
- Git state (branch, commits, staging)
- Task progress (todos, issues, PRs)
- Session metadata (start time, provider, estimated completion)

**Use Cases**:
- Claude → OpenCode (rate limit reached)
- Groq → Claude (escalation needed for complex fix)
- Ollama → Groq (back online after offline work)
- OpenCode → Claude (need deep research capabilities)

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
  "timestamp": "2026-01-05T12:30:00Z",
  "agent": "opencode",
  "provider": "groq_primary",
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

### 1. Claude Code → OpenCode (Rate Limit)

**Scenario**: Claude hits rate limit mid-implementation, need to continue with Groq.

**Process**:

```bash
# Step 1: Save Claude session state
npm run session:save claude
# Creates: .claude/.session-state.json

# Step 2: Review what was saved
cat .claude/.session-state.json | jq .

# Step 3: Commit current work (if stable)
git add .
git commit -m "wip: nextauth integration (switching to opencode)"

# Step 4: Start OpenCode
opencode --preset groq_primary

# Step 5: In OpenCode chat, restore context
npm run session:restore claude
# Displays: Task description, files modified, next steps

# Step 6: Continue work
# OpenCode now has full context to continue
```

**OpenCode Prompt Template**:
```
I'm continuing work from Claude Code. Session state restored:

Task: Implement user authentication with NextAuth
Progress: 45 minutes in, 1h 15m remaining
Status: in_progress

Modified files:
- app/api/auth/[...nextauth]/route.ts (staged)
- lib/auth.ts

Next steps:
1. Add session provider to layout
2. Test login flow
3. Update environment variables

Please continue from step 1.
```

---

### 2. OpenCode (Groq) → Claude Code (Escalation)

**Scenario**: Groq struggles with complex refactoring, need Claude's deeper reasoning.

**Process**:

```bash
# Step 1: Save OpenCode session state
npm run session:save opencode
# Creates: .opencode/.session-state.json

# Step 2: Run validation to identify issues
scripts/validate-after-fallback.sh
# Output: 3 STRICT rule violations (design tokens)

# Step 3: Document escalation reason
echo "Escalation: 3+ STRICT violations after 2 auto-fix attempts" >> .opencode/.session-state.json

# Step 4: Switch to Claude Code
# (Claude Code automatically detects .claude/.session-state.json if present)

# Step 5: In Claude Code, restore OpenCode session
npm run session:restore opencode

# Step 6: Claude Code fixes violations
# Uses premium model for pattern adherence

# Step 7: Save fixed state back to OpenCode format
npm run session:save claude
cp .claude/.session-state.json .opencode/.session-state.json
```

**Claude Code Handoff Message**:
```
Escalated from OpenCode (Groq) due to STRICT rule violations.

Issue: Design token compliance failures (3 violations)
- app/components/Header.tsx: hardcoded px-8
- app/components/Footer.tsx: hardcoded bg-blue-500
- app/page.tsx: hardcoded text-gray-600

Previous attempts: 2 auto-fix failures

Please fix violations using design tokens from @/design-system/tokens.
```

---

### 3. Ollama → Groq (Back Online)

**Scenario**: Drafted implementation offline, now online and need validation.

**Process**:

```bash
# Step 1: Save Ollama session state (while offline)
npm run session:save opencode
# Note: Uses "offline_primary" provider in metadata

# Step 2: Run local checks (offline)
npm run type-check
npm run lint
npm run test:run
# Record results in session state

# Step 3: When back online, restore session
npm run session:restore opencode

# Step 4: Run enhanced validation
scripts/validate-after-fallback.sh
# Output: Manual checklist for STRICT + FLEXIBLE rules

# Step 5: Fix violations with Groq
opencode --preset groq_primary
# Prompt: "Fix STRICT rule violations from offline session"

# Step 6: Validate fixes
npm run check:opencode
# Expected: All STRICT rules pass

# Step 7: Commit if clean
git add .
git commit -m "feat: implement feature (offline draft + online validation)"
```

**Groq Validation Prompt**:
```
Offline session completed with Ollama CodeLlama 34B.

Validation results:
✅ TypeScript: pass
✅ ESLint: pass
✅ Tests: 99% pass rate
⚠️ STRICT rules: 2 violations pending review

Violations:
1. PageLayout missing in app/new-page/page.tsx
2. Deep import in components/NewFeature.tsx

Please fix these violations before committing.
```

---

### 4. OpenCode → Claude (Research Needed)

**Scenario**: Implementation blocked by architectural question, need Claude's research tools.

**Process**:

```bash
# Step 1: Save OpenCode session state
npm run session:save opencode

# Step 2: Switch to Claude (conversation mode)
# Use Claude web interface or VS Code extension

# Step 3: In Claude, provide context
cat .opencode/.session-state.json

# Step 4: Ask architectural question
# Claude uses Octocode, web search, docs to research

# Step 5: Claude provides recommendation

# Step 6: Return to OpenCode to implement
opencode --preset groq_primary
npm run session:restore opencode

# Step 7: Implement based on Claude's research
```

**Claude Research Handoff**:
```
Context from OpenCode session:

Task: Implement real-time notifications
Blocker: Unsure whether to use WebSockets, SSE, or polling

Files in progress:
- app/api/notifications/route.ts (empty)
- lib/notifications.ts (planning)

Question: What's the best approach for real-time notifications in Next.js App Router?

Please research using Octocode/web search and provide architectural recommendation.
```

---

## Session State Scripts

### `npm run session:save <agent>`

**Purpose**: Save current session state for specified agent.

**Usage**:
```bash
# Save Claude session
npm run session:save claude

# Save OpenCode session
npm run session:save opencode

# Save Copilot session
npm run session:save copilot
```

**Implementation** (uses `scripts/save-session-state.sh`):
```bash
#!/bin/bash
# Saves current session state to agent-specific file

AGENT=$1
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git branch --show-current)
MODIFIED=$(git diff --name-only)
STAGED=$(git diff --cached --name-only)
LAST_COMMIT=$(git rev-parse --short HEAD)
ISSUES=$(gh issue list --assignee @me --json number --jq '.[].number' | paste -sd "," -)

# Detect current provider (from OpenCode config or defaults)
PROVIDER="unknown"
if command -v opencode &> /dev/null; then
  PROVIDER=$(cat .opencode/config.json | jq -r '.default_provider // "groq_primary"')
fi

# Build session state JSON
cat > ".${AGENT}/.session-state.json" <<EOF
{
  "version": "2.0",
  "timestamp": "$TIMESTAMP",
  "agent": "$AGENT",
  "provider": "$PROVIDER",
  "git": {
    "branch": "$BRANCH",
    "uncommitted_changes": $([ -n "$MODIFIED" ] && echo true || echo false),
    "staged_files": [$(echo "$STAGED" | jq -R -s -c 'split("\n") | map(select(length > 0))')],
    "last_commit": "$LAST_COMMIT",
    "issues": [$(echo "$ISSUES" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')]
  }
}
EOF

echo "✅ Session state saved to .${AGENT}/.session-state.json"
```

---

### `npm run session:restore <agent>`

**Purpose**: Display saved session state from specified agent.

**Usage**:
```bash
# Restore Claude session
npm run session:restore claude

# Restore OpenCode session
npm run session:restore opencode
```

**Implementation** (uses `scripts/restore-session-state.sh`):
```bash
#!/bin/bash
# Displays saved session state from agent-specific file

AGENT=$1
SESSION_FILE=".${AGENT}/.session-state.json"

if [ ! -f "$SESSION_FILE" ]; then
  echo "❌ No session state found for $AGENT"
  echo "   Run: npm run session:save $AGENT"
  exit 1
fi

echo "📋 Restoring session from $AGENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Parse and display session state
TIMESTAMP=$(jq -r '.timestamp' "$SESSION_FILE")
PROVIDER=$(jq -r '.provider' "$SESSION_FILE")
BRANCH=$(jq -r '.git.branch' "$SESSION_FILE")
LAST_COMMIT=$(jq -r '.git.last_commit' "$SESSION_FILE")
MODIFIED_FILES=$(jq -r '.context.files_modified[]?' "$SESSION_FILE" | wc -l)

echo "🕐 Session saved: $TIMESTAMP"
echo "🤖 Previous agent: $AGENT ($PROVIDER)"
echo "🌿 Git branch: $BRANCH"
echo "📝 Last commit: $LAST_COMMIT"
echo "📁 Modified files: $MODIFIED_FILES"

if [ "$MODIFIED_FILES" -gt 0 ]; then
  echo ""
  echo "Modified files:"
  jq -r '.context.files_modified[]?' "$SESSION_FILE" | sed 's/^/  - /'
fi

NEXT_STEPS=$(jq -r '.context.next_steps[]?' "$SESSION_FILE" | wc -l)
if [ "$NEXT_STEPS" -gt 0 ]; then
  echo ""
  echo "Next steps:"
  jq -r '.context.next_steps[]?' "$SESSION_FILE" | nl -w2 -s'. '
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

**Example Output**:
```
📋 Restoring session from claude
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Session saved: 2026-01-05T12:30:00Z
🤖 Previous agent: claude (claude-sonnet-3.5)
🌿 Git branch: feat/nextauth-integration
📝 Last commit: abc123
📁 Modified files: 2

Modified files:
  - app/api/auth/[...nextauth]/route.ts
  - lib/auth.ts

Next steps:
 1. Add session provider to layout
 2. Test login flow
 3. Update environment variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Advanced Handoff: `scripts/session-handoff.sh`

**Purpose**: Combined save + restore + validation for seamless model switching.

**Usage**:
```bash
# Switch from Claude to OpenCode
scripts/session-handoff.sh claude opencode

# Switch from OpenCode to Claude
scripts/session-handoff.sh opencode claude

# Switch from Ollama to Groq (both use OpenCode)
scripts/session-handoff.sh opencode opencode --provider groq_primary
```

**Workflow**:
1. Save current agent session state
2. Run git status check (warn if uncommitted changes)
3. Display validation status
4. Restore target agent session state
5. Print handoff summary

**Example Output**:
```
🔄 Session Handoff: claude → opencode

Step 1: Saving claude session state...
✅ Session saved to .claude/.session-state.json

Step 2: Git status check...
⚠️  Uncommitted changes detected (2 files)
   Consider committing before switching agents

Step 3: Validation status...
✅ TypeScript: pass
✅ ESLint: pass
⚠️  Tests: not run yet

Step 4: Restoring opencode session state...
📋 Restoring session from claude
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Session saved: 2026-01-05T12:30:00Z
🤖 Previous agent: claude (claude-sonnet-3.5)
🌿 Git branch: feat/nextauth-integration
📁 Modified files: 2

Next steps:
 1. Add session provider to layout
 2. Test login flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5: Handoff complete!

✨ Ready to continue in opencode
   Run: opencode --preset groq_primary

📝 Handoff Summary:
   From: claude (claude-sonnet-3.5)
   To: opencode (groq_primary)
   Reason: Rate limit / cost optimization
   Files in progress: 2
   Next action: Implement session provider
```

---

## Git Workflow Integration

### Commit Before Handoff (Recommended)

**Why**: Prevents work-in-progress loss if session state gets corrupted.

**Process**:
```bash
# Step 1: Save session state
npm run session:save claude

# Step 2: Commit work-in-progress
git add .
git commit -m "wip: nextauth integration (switching agents)"

# Step 3: Switch agents
opencode --preset groq_primary
npm run session:restore claude

# Step 4: Continue work
# If things go wrong, can `git reset HEAD~1` to undo WIP commit
```

### Stash Before Handoff (Alternative)

**Why**: Keep git history clean (no WIP commits).

**Process**:
```bash
# Step 1: Save session state
npm run session:save claude

# Step 2: Stash uncommitted changes
git stash push -m "claude session handoff"

# Step 3: Switch agents
opencode --preset groq_primary
npm run session:restore claude

# Step 4: Restore changes
git stash pop

# Step 5: Continue work
```

**Recommendation**: Use **commit** for long handoffs (>1 hour), **stash** for quick switches.

---

## Best Practices

### ✅ Do

- **Save session state before switching** (always)
- **Commit or stash changes** before handoff (prevents loss)
- **Document escalation reason** in session state
- **Run validation** before handoff (know what needs fixing)
- **Use session:restore** to load context (don't re-explain manually)
- **Update session state** if task changes mid-work

### ❌ Don't

- **Switch agents without saving state** (lose context)
- **Mix sessions** (one task = one session state file)
- **Commit session state files** (git-ignored for a reason)
- **Edit session state manually** (use scripts only)
- **Skip validation** before handoff (next agent inherits problems)

---

## Troubleshooting

### Session State File Not Found

**Symptom**: `npm run session:restore <agent>` says "No session state found"

**Cause**: Session state not saved yet, or file deleted

**Fix**:
```bash
# Create new session state
npm run session:save <agent>

# Verify file exists
ls -la .<agent>/.session-state.json
```

---

### Session State Out of Sync

**Symptom**: Restored session shows old files/branches

**Cause**: Session saved long ago, git state changed since

**Fix**:
```bash
# Delete old session state
rm .<agent>/.session-state.json

# Create fresh session state
npm run session:save <agent>
```

**Prevention**: Re-save session state after major git changes (branch switch, large commits).

---

### Handoff Script Fails

**Symptom**: `scripts/session-handoff.sh` exits with error

**Cause**: Missing dependencies (jq, gh CLI)

**Fix**:
```bash
# Install jq (JSON parser)
brew install jq

# Install GitHub CLI
brew install gh
gh auth login

# Verify installation
jq --version
gh --version
```

---

## Related Documentation

**Workflows**:
- [Provider Selection](../patterns/PROVIDER_SELECTION.md) - When to switch models
- [Cost Optimization](./COST_OPTIMIZATION.md) - Strategic handoff for budget
- [Troubleshooting](./TROUBLESHOOTING.md) - Common handoff issues

**Enforcement**:
- [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md) - Pre-handoff checks
- [Quality Gates](../enforcement/QUALITY_GATES.md) - Validation before switching

**Scripts**:
- `scripts/save-session-state.sh` - Save session
- `scripts/restore-session-state.sh` - Restore session
- `scripts/session-handoff.sh` - Combined handoff workflow

---

**Status**: Production Ready  
**Maintenance**: Update schema when new fields added  
**Owner**: Developer Experience Team
