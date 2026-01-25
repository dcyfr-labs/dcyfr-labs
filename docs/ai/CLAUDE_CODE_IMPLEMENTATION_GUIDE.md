<!-- TLP:CLEAR -->

# Implementation Guide: Claude Code Best Practices

**Quick Reference for Implementing Recommendations**

---

## 🎯 Three-Phase Implementation Plan

### PHASE 1: Quick Wins (2-3 hours) - HIGHEST ROI

_Implement this week for immediate improvements_

#### 1.1 Enhance CLAUDE.md with Real Examples

**File:** `CLAUDE.md`
**Add after line ~50 (Quick Reference section):**

````markdown
## Claude Code Workflow Examples

### Common Workflow: "I need to fix a bug"

```bash
claude
> Read src/components/BlogCard/index.tsx
> Show me test files for this component
> [Review Claude's suggestions]
> Implement fix using design tokens
> npm run test:run src/components/BlogCard/__tests__
```
````

### Common Workflow: "Create new page with tests"

```bash
claude
> /plan Create /bookmarks page following dcyfr patterns
> [Review plan]
> /ultrawork Implement the plan
> npm run check  # Validate all gates
```

### Common Workflow: "Fix all design token violations"

```bash
claude
> npm run lint  # Show violations
> [Paste output to Claude]
> Claude: "I see X hardcoded spacings and Y hardcoded colors"
> Claude: "Let me fix these using SPACING and SEMANTIC_COLORS tokens"
> npm run lint  # Verify fixed
```

````

**Effort:** 30 minutes | **Impact:** Better onboarding

---

#### 1.2 Create `.claude/COMMANDS_GUIDE.md`
**New file** - Copy-paste ready:

```markdown
# Available Claude Code Commands

Type `/` to see all available commands in Claude Code.

## Quick Command Finder

**Starting Work:**
- `/plan` - Create implementation plan (great before coding)
- `/quick-fix` - Fast pattern fixes (design tokens, imports, ESLint)

**Development:**
- `/dev` - Start development session
- `/test-strategy` - Plan test approach for a feature

**Research:**
- `/research` - Deep investigation across GitHub repos (Octocode)
- `/think` - Extended thinking mode (best for complex problems)

**GitHub Integration:**
- `/fix-github-issue 1234` - Analyze and fix GitHub issue #1234
- `/pr` - Create PR from current changes
- `/review-pr` - Code review with DCYFR checks

**Advanced:**
- `/ultrawork` - Parallel multi-task execution
- `/visual-iterate` - UI component iteration with screenshots

## When to Use `/plan` First

✅ Use `/plan` before coding for:
- New features (complex logic)
- Refactors (multiple files)
- Design decisions (layout selection)
- API integrations

❌ Skip `/plan` for:
- One-line fixes
- ESLint auto-fixes
- Simple copy-paste changes

## Command Chaining Example

````

/plan Implement new analytics dashboard
[Review plan - it looks good]
/ultrawork Implement the plan (all subtasks)
[Tests run, verification complete]

```

## Tips

- Commands are context-aware (read relevant files automatically)
- Add `$ARGUMENTS` in prompts to make them reusable
- Combine with `/clear` between major tasks
```

**Effort:** 45 minutes | **Impact:** Command discovery + adoption

---

#### 1.3 Add Course Correction Section to CLAUDE.md

**File:** `CLAUDE.md`
**Add new section (~50 lines):**

```markdown
## Course Correction During Development

Claude Code lets you redirect mid-execution or backtrack and retry.

### Pause and Redirect (Mid-Task)
```

You: Create the BlogCard component using PageLayout
Claude: [starts implementing, shows code preview]

You: [Press Escape] - Pause Claude
You: "Actually, let's use the ArchiveLayout for this. Can you switch?"
Claude: [resumes with new approach]

```

### Backtrack and Retry (Change Direction)

```

You: [Double-tap Escape] - Jump back in history
You: [Edit previous message]
You: "Actually, use ArchiveLayout instead"
You: [Press Enter] - Retry with new direction
Claude: [implements with ArchiveLayout]

```

### Explicit Undo

```

You: "Undo those changes"
Claude: [reverts recent commits/edits]

```

### When to Use Course Correction

- Claude took a different approach than you expected
- You changed your mind mid-implementation
- You want to try an alternative without starting fresh
- Plan isn't working out (get feedback, adjust, retry)
```

**Effort:** 20 minutes | **Impact:** Faster iteration

---

### PHASE 2: Documentation (1-2 hours) - FOUNDATION

_Implement next week after Phase 1_

#### 2.1 Create Workflow Documentation Index

**New file:** `docs/ai/claude-code-workflows.md`

````markdown
# Claude Code Workflow Patterns

Quick reference for common development patterns.

## Workflow: Feature Implementation

**Timeline:** 1-2 hours
**Use When:** Building a new feature

1. `/plan` - Create implementation plan
2. Review plan with team
3. `/ultrawork` - Execute all subtasks in parallel
4. Manual review + testing
5. Commit to git

**Key Steps:**

```bash
claude
> /plan Create new /projects page with filtering
> [Review suggested approach]
claude
> /ultrawork Implement the plan
> npm run check  # Validate
```
````

## Workflow: Test-Driven Development (TDD)

**Timeline:** 1-3 hours
**Use When:** Feature requires high confidence

1. Ask Claude to write tests from requirements
2. Verify tests fail
3. Commit failing tests
4. Ask Claude to implement code
5. Verify all tests pass
6. Check design token compliance

## Workflow: Bug Fix with Root Cause

**Timeline:** 30-60 minutes
**Use When:** Production bug

1. Provide error logs + reproduction steps
2. Ask Claude to identify root cause
3. Write targeted tests to reproduce
4. Implement fix
5. Verify no regressions

## Workflow: Visual Iteration

**Timeline:** 30-90 minutes
**Use When:** Building/refining UI

1. Provide design reference (screenshot)
2. Claude implements component
3. Claude takes screenshot of result
4. Compare with target
5. Ask for adjustments iteratively
6. 2-3 iterations typically optimal

## Workflow: Parallel Development

**Timeline:** Varies
**Use When:** Multiple independent features

1. Create git worktrees:
   ```bash
   git worktree add ../dcyfr-feature-a feature-a
   git worktree add ../dcyfr-feature-b feature-b
   ```
2. Start Claude in each directory
3. Work in parallel in separate terminals
4. Merge independently when ready
5. Clean up worktrees

## Quick Reference Table

| Task              | Workflow               | Time   | Command                |
| ----------------- | ---------------------- | ------ | ---------------------- |
| New feature       | Feature Implementation | 1-2h   | `/plan` + `/ultrawork` |
| High confidence   | TDD                    | 1-3h   | dcyfr-tdd skill        |
| Bug in production | Bug Fix                | 30-60m | `claude`               |
| Building UI       | Visual Iteration       | 30-90m | `/visual-iterate`      |
| Multiple features | Parallel Work          | varies | git worktrees          |

````

**Effort:** 1 hour | **Impact:** Team knows which workflow to use

---

#### 2.2 Create Git Worktrees Setup Guide
**New file:** `docs/ai/git-worktrees-setup.md`

```markdown
# Using Git Worktrees for Parallel Development

Run multiple Claude sessions on different tasks without merge conflicts.

## One-Time Setup

```bash
# Verify git supports worktrees (any recent version)
git worktree list
````

## Starting Parallel Work

### Feature A - Terminal Tab 1

```bash
git worktree add ../dcyfr-feature-a feature-a-branch
cd ../dcyfr-feature-a
claude
# Tell Claude: "Implement feature A"
```

### Feature B - Terminal Tab 2

```bash
git worktree add ../dcyfr-feature-b feature-b-branch
cd ../dcyfr-feature-b
claude
# Tell Claude: "Implement feature B"
```

Both Claude instances work independently with no conflicts!

## After Feature Completion

```bash
# Back in main repo
git worktree remove ../dcyfr-feature-a
git worktree remove ../dcyfr-feature-b
```

## Benefits

- ✅ Parallel development without waiting
- ✅ Independent test runs per worktree
- ✅ Each Claude has focused context
- ✅ Faster feature delivery for independent tasks

````

**Effort:** 30 minutes | **Impact:** 30-50% faster parallel work

---

### PHASE 3: Automation (4-5 hours) - STRATEGIC
*Implement in 2 weeks after Phase 1 & 2 are stable*

#### 3.1 Create Headless Mode Script
**New file:** `scripts/claude-code-automation.sh`

```bash
#!/bin/bash
# Claude Code automation for CI/CD and batch processing

set -e

case "$1" in
  lint-subjective)
    # Use Claude for code review beyond ESLint
    echo "Running subjective linting with Claude..."
    claude -p "
      Review the src/ directory for:
      1. Misleading function names
      2. Stale or incorrect comments
      3. Design token violations
      4. Complex logic without explanation

      Format: filepath:line:problem
      Only output issues, one per line.
    " --allowedTools Read,Grep,Edit --output-format stream-json
    ;;

  triage-issues)
    # Analyze GitHub issues and suggest labels
    echo "Triaging GitHub issues..."
    claude -p "
      Analyze all open GitHub issues. For each, determine:
      1. Priority (critical/high/medium/low)
      2. Category (bug/feature/docs/refactor)
      3. Effort (S/M/L/XL)

      Output JSON:
      [
        {issue_number: 1, priority: 'high', category: 'bug', effort: 'M'}
      ]
    " --allowedTools Bash(gh:*) --output-format stream-json
    ;;

  analyze-logs)
    # Parse error patterns in logs
    echo "Analyzing error logs..."
    cat "$2" | claude -p "
      Summarize error patterns:
      1. Top 3 root causes
      2. Frequency per cause
      3. Recommended fixes
    "
    ;;

  *)
    echo "Usage: $0 {lint-subjective|triage-issues|analyze-logs <logfile>}"
    exit 1
    ;;
esac
````

**Effort:** 1.5 hours | **Impact:** Automate repetitive linting tasks

---

#### 3.2 Add GitHub Actions Integration

**New file:** `.github/workflows/claude-code-linting.yml`

```yaml
name: Claude Code Linting

on:
  pull_request:
    paths:
      - 'src/**'
      - '.claude/**'

jobs:
  subjective-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude subjective linting
        run: |
          bash scripts/claude-code-automation.sh lint-subjective > /tmp/lint-report.txt || true

      - name: Comment on PR if issues found
        if: hashFiles('/tmp/lint-report.txt') != ''
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('/tmp/lint-report.txt', 'utf8');
            if (report.trim()) {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: `## 🤖 Claude Code Linting\n\`\`\`\n${report}\n\`\`\``
              });
            }
```

**Effort:** 1 hour | **Impact:** Automated code review in CI/CD

---

## ✅ Validation Checklist

After each phase, verify:

### After Phase 1:

- [ ] CLAUDE.md has 3+ workflow examples
- [ ] `.claude/COMMANDS_GUIDE.md` created and discoverable
- [ ] Course correction guide added to CLAUDE.md
- [ ] Team can discover commands without searching

### After Phase 2:

- [ ] Workflow documentation index created
- [ ] Git worktrees guide documented
- [ ] Team is using `/plan` + `/ultrawork` pattern
- [ ] 0 questions about "which workflow should I use?"

### After Phase 3:

- [ ] Headless script working locally
- [ ] GitHub Actions workflow triggers on PRs
- [ ] Claude code reviews appearing on PRs
- [ ] Time on manual linting reduced by 10-20%

---

## 📊 Expected Impact

| Phase | Time | Onboarding | Velocity | Automation |
| ----- | ---- | ---------- | -------- | ---------- |
| 1     | 2-3h | +30%       | +10%     | —          |
| 1+2   | 3-4h | +60%       | +25%     | —          |
| 1+2+3 | 7-8h | +60%       | +35%     | +15%       |

---

## 🚀 Start Today

**Right now (5 minutes):**

1. Open `CLAUDE.md`
2. Add 2-3 workflow examples to the "Quick Reference" section
3. Commit: "docs: add Claude Code workflow examples"

**Tomorrow (1 hour):** 4. Create `.claude/COMMANDS_GUIDE.md` 5. Share with team

**This week (2 hours):** 6. Implement Phase 1 completions 7. Run team walkthrough

---

**Document Version:** 1.0
**Target Audience:** Dev team implementing Claude Code best practices
**Estimated Time to Complete All Phases:** 7-8 hours spread over 2-3 weeks
