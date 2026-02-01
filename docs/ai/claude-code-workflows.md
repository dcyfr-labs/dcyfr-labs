<!-- TLP:CLEAR -->

# Claude Code Workflow Patterns

**Version:** 1.0.0
**Last Updated:** January 24, 2026
**Purpose:** Decision guide for selecting the right Claude Code workflow for your task

---

## 🎯 Workflow Selection Tree

```
START: "I need to build/fix something"
  │
  ├─ Building a NEW FEATURE?
  │  └─ Is it complex (multiple files, dependencies)?
  │     ├─ YES → Use FEATURE IMPLEMENTATION workflow
  │     └─ NO  → Use QUICK IMPLEMENTATION workflow
  │
  ├─ Fixing a BUG?
  │  └─ Is it in production (critical)?
  │     ├─ YES → Use BUG FIX + ROOT CAUSE workflow
  │     └─ NO  → Use QUICK FIX workflow
  │
  ├─ Building UI / Component?
  │  └─ Do you have a design reference?
  │     ├─ YES → Use VISUAL ITERATION workflow
  │     └─ NO  → Use COMPONENT SCAFFOLD workflow
  │
  ├─ Working on MULTIPLE FEATURES in parallel?
  │  └─ YES → Use PARALLEL DEVELOPMENT workflow
  │  └─ NO  → Single feature workflow above
  │
  ├─ Need HIGH CONFIDENCE (tests critical)?
  │  └─ YES → Use TEST-DRIVEN DEVELOPMENT (TDD)
  │
  └─ Need to RESEARCH production patterns?
     └─ YES → Use RESEARCH + BUILD workflow
```

---

## 🚀 Detailed Workflows

### Workflow 1: Feature Implementation (Complex)

**When to Use:** Building a new feature with multiple files, dependencies, or complexity
**Timeline:** 1-2 hours
**Best For:** New pages, major components, API integrations

**Step-by-Step:**

```bash
# Step 1: Plan approach (decide direction before coding)
claude
> /plan Create new /bookmarks page with category filtering and search
> [Claude creates detailed implementation plan]

# Step 2: Review & approve
[Review the plan - does it align with your vision?]
[Ask for adjustments if needed - press Escape to redirect]

# Step 3: Execute with automation
claude
> /ultrawork Implement the plan
> [Claude executes all subtasks in parallel]

# Step 4: Validate quality gates
> npm run check  # TypeScript, ESLint, tests
> /code-review  # Pre-commit validation
```

**Example Output:**

- ✅ New page with tests
- ✅ Design tokens enforced
- ✅ Metadata generated
- ✅ Responsive layout
- ✅ All tests passing

**When This Workflow Shines:**

- Complex logic requiring planning
- Multiple interconnected files
- Architectural decisions needed
- Team feedback important

---

### Workflow 2: Quick Implementation (Simple)

**When to Use:** Simple features, one-file changes, straightforward requirements
**Timeline:** 15-30 minutes
**Best For:** Simple pages, single components, quick improvements

**Step-by-Step:**

```bash
# Direct implementation (no planning needed)
claude
> Create /about page with hero section and team grid
> Use PageLayout, add design tokens, include metadata
> npm run test:run  # Run tests
```

**Example Output:**

- ✅ New page with tests in 20 minutes

**Decision Rule:**

- Skip `/plan` if requirements are clear and straightforward
- Use `/plan` if you're unsure about approach

---

### Workflow 3: Bug Fix with Root Cause

**When to Use:** Production bugs, critical issues, requires investigation
**Timeline:** 30-60 minutes
**Best For:** Debugging, performance issues, complex failures

**Step-by-Step:**

```bash
# Step 1: Provide context
claude
> Here's the error: "TypeError: Cannot read property 'map' of undefined"
> It happens when visiting /blog on mobile
> Logs show: [paste stack trace]

# Step 2: Identify root cause
> Read src/components/BlogList.tsx
> Why is data undefined?

# Step 3: Write test to reproduce
> Write test that reproduces this issue

# Step 4: Implement fix
> Fix the issue in BlogList.tsx

# Step 5: Verify
> npm run test:run  # All tests pass
> npm run check     # No regressions
```

**Example Output:**

- ✅ Root cause identified
- ✅ Test added to prevent regression
- ✅ Fix implemented with validation

---

### Workflow 4: Quick Fix (Hotfix)

**When to Use:** One-line changes, ESLint fixes, simple corrections
**Timeline:** 5-15 minutes
**Best For:** Typos, import fixes, quick patches

**Step-by-Step:**

```bash
# Direct fix (no planning)
claude
> Fix the typo in BlogCard.tsx line 45
> npm run lint  # Verify
```

**When NOT to use Quick Fix:**

- ❌ Bug needs investigation
- ❌ Multiple files affected
- ❌ Complex logic involved

---

### Workflow 5: Visual Iteration

**When to Use:** Building UI, refining components, design-heavy work
**Timeline:** 30-90 minutes (2-3 iterations typical)
**Best For:** Components, page layouts, visual refinement

**Step-by-Step:**

```bash
# Step 1: Provide design reference
claude
> Here's a screenshot of the target design [paste/describe]
> Build this component with similar styling and layout

# Step 2: Claude implements
[Claude creates component based on description]

# Step 3: Screenshot comparison
claude
> Compare your result with my target
> Any differences?

# Step 4: Iterate (typically 2-3 times)
> Adjust spacing - use SPACING.large instead
> The button should be full-width on mobile
> [Claude adjusts]

# Step 5: Finalize
> Looks great! Please add tests and validation
```

**Pro Tips:**

- Be specific: "Padding should be 24px" vs "add padding"
- Reference design tokens: "Use SPACING.content" not "space-8"
- 2-3 iterations is optimal; beyond that, restart

**Example Output:**

- ✅ Component matching design
- ✅ Fully responsive
- ✅ Design tokens used
- ✅ Tests added

---

### Workflow 6: Test-Driven Development (TDD)

**When to Use:** High-confidence requirements, critical business logic, complex features
**Timeline:** 1-3 hours
**Best For:** Payment processing, authentication, complex algorithms

**Step-by-Step:**

```bash
# Step 1: Write tests from requirements
claude
> Based on this requirement, write tests:
> "Bookmarks can be filtered by category"
> [Claude writes comprehensive test suite]

# Step 2: Verify tests fail (RED phase)
> npm run test:run
# Tests fail because feature doesn't exist yet ✓

# Step 3: Commit failing tests
git add tests/
git commit -m "test: add bookmark filtering tests"

# Step 4: Implement code (GREEN phase)
claude
> Now implement the code to make these tests pass
> npm run test:run  # All tests passing ✓

# Step 5: Verify compliance (BLUE phase - DCYFR addition)
claude
> /design-audit Check for design token violations
> /code-review Pre-commit validation
> npm run check  # All gates passing ✓
```

**Benefits:**

- ✅ 100% test coverage (tests written first)
- ✅ Confidence in correctness
- ✅ Easier refactoring later
- ✅ Documentation through tests

---

### Workflow 7: Parallel Development

**When to Use:** Multiple independent features, team parallelization, fast delivery
**Timeline:** Varies (but allows parallel execution)
**Best For:** Multiple features in same sprint, team of developers

**Setup:**

```bash
# Terminal 1: Feature A
git worktree add ../dcyfr-feature-a feature-a-branch
cd ../dcyfr-feature-a
claude
# Tell Claude: "Implement bookmarks feature"

# Terminal 2: Feature B (in separate tab/window)
cd ${WORKSPACE_ROOT}/dcyfr-labs  # Back to main repo
git worktree add ../dcyfr-feature-b feature-b-branch
cd ../dcyfr-feature-b
claude
# Tell Claude: "Implement analytics dashboard"
```

**Both features develop in parallel without conflicts!**

**Benefits:**

- ✅ No merge conflicts (different worktrees)
- ✅ Focused Claude context for each feature
- ✅ Independent testing per feature
- ✅ 50%+ faster delivery for independent tasks

**See:** [Git Worktrees Setup Guide](./git-worktrees-setup.md) for detailed instructions

---

### Workflow 8: Research + Build

**When to Use:** Building features that exist in production elsewhere, learning from examples
**Timeline:** 30-120 minutes (depending on research depth)
**Best For:** Complex implementations, security-sensitive work, reference implementations

**Step-by-Step:**

```bash
# Step 1: Research production patterns
claude
> /research How do production Next.js 16 projects implement design tokens?
> /research OAuth 2.0 authentication best practices
> [Claude researches across GitHub codebases]

# Step 2: Analyze findings
claude
> Compare the 3 approaches - which is best for our use case?
> [Claude provides comparison and recommendation]

# Step 3: Build based on research
claude
> Implement approach #2 from the research findings
> Make sure to follow the same patterns

# Step 4: Validate against research
> Does our implementation match the production patterns?
```

**Example:** Implementing OAuth 2.0

- Research production implementations (30 min)
- Select best approach based on codebase (10 min)
- Implement with confidence (60 min)
- Validate security (15 min)

**Benefits:**

- ✅ Informed by production patterns
- ✅ Security best practices applied
- ✅ Reduced design time
- ✅ Higher confidence

---

## 📊 Workflow Quick Reference Table

| Workflow                   | Complexity | Timeline | Tools                  | Best For             |
| -------------------------- | ---------- | -------- | ---------------------- | -------------------- |
| **Feature Implementation** | High       | 1-2h     | `/plan` + `/ultrawork` | Complex features     |
| **Quick Implementation**   | Low        | 15-30m   | Direct claude          | Simple changes       |
| **Bug Fix + Root Cause**   | Medium     | 30-60m   | Read + Test + Fix      | Investigation needed |
| **Quick Fix**              | Low        | 5-15m    | Direct claude          | One-line fixes       |
| **Visual Iteration**       | Medium     | 30-90m   | `/visual-iterate`      | UI building          |
| **TDD**                    | High       | 1-3h     | dcyfr-tdd skill        | High confidence      |
| **Parallel Development**   | Varies     | Varies   | git worktrees          | Multiple features    |
| **Research + Build**       | High       | 30-120m  | `/research`            | Reference impl.      |

---

## 🤔 Common Decision Points

### Should I Use `/plan` Before Coding?

**Use `/plan` if:**

- ✅ Feature is complex (multiple files, many decisions)
- ✅ Multiple approach options exist
- ✅ Architectural decision needed
- ✅ Team feedback important
- ✅ Unsure about direction

**Skip `/plan` if:**

- ❌ Requirements are crystal clear
- ❌ One-file change
- ❌ Simple logic
- ❌ Following established pattern
- ❌ Time is critical (but only for <30 min tasks)

---

### Should I Use TDD?

**Use TDD if:**

- ✅ Business logic is critical (payments, auth)
- ✅ Algorithm is complex
- ✅ Need 100% test coverage
- ✅ Team requires high confidence

**Skip TDD if:**

- ❌ Simple UI changes
- ❌ Maintenance work
- ❌ Well-established patterns
- ❌ Tight time constraints
- ❌ Exploratory work (spike)

---

### Should I Use Parallel Development?

**Use if:**

- ✅ Working on 2+ independent features
- ✅ Team of developers
- ✅ Features don't interact
- ✅ Need to maximize throughput

**Skip if:**

- ❌ Features are dependent
- ❌ Complex merge scenarios
- ❌ Shared code heavily modified
- ❌ Single developer (context switching overhead)

---

## 🔄 Context Switching Between Workflows

**Can you switch mid-way?**

Yes! Use course correction (press Escape):

```bash
claude
> /plan Create feature  # Started with planning
[Plan looks too simple]
> Actually, let's skip to quick implementation
[Press Escape]
> Let me just implement this directly
```

**Best Practice:** Complete one workflow per session. Starting fresh with new workflow is often cleaner than mid-execution switching.

---

## 📚 Related Documentation

- **Commands Reference:** [.claude/COMMANDS_GUIDE.md](../../.claude/COMMANDS_GUIDE.md)
- **Course Correction:** CLAUDE.md - Course Correction Guide
- **Git Worktrees:** [Git Worktrees Setup Guide](./git-worktrees-setup.md)
- **Component Patterns:** [Component Patterns](./component-patterns.md)
- **Testing Guide:** [Testing Strategy](../testing/README.md)

---

## ✅ Quick Decision Flowchart (Printable)

```
What are you building?
│
├─ Feature (complex)
│  └─ /plan → review → /ultrawork ✓
│
├─ Feature (simple)
│  └─ Direct claude ✓
│
├─ Bug (critical)
│  └─ Root cause + tests + fix ✓
│
├─ Bug (simple)
│  └─ Direct fix ✓
│
├─ UI/Component
│  └─ Visual iteration (2-3 passes) ✓
│
├─ Multiple features in parallel
│  └─ Git worktrees + parallel sessions ✓
│
├─ Need research first
│  └─ /research → analyze → build ✓
│
└─ High confidence needed
   └─ TDD workflow ✓
```

**Print this and post near your desk!**

---

**Status:** Production Ready
**Last Review:** January 24, 2026
**Maintained By:** DCYFR Team

For workflow-related questions, see FAQ in [CLAUDE.md](../../CLAUDE.md) or [.claude/COMMANDS_GUIDE.md](../../.claude/COMMANDS_GUIDE.md)
