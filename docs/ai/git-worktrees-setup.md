<!-- TLP:CLEAR -->

# Using Git Worktrees for Parallel Development with Claude Code

**Version:** 1.0.0
**Last Updated:** January 24, 2026
**Purpose:** Enable multiple Claude Code sessions working in parallel without conflicts

---

## 🎯 What Are Git Worktrees?

Git worktrees allow you to **work on multiple branches simultaneously** in different directories without switching branches repeatedly.

**Traditional Way (Slow):**

```bash
# Terminal 1: Work on feature-a
git checkout feature-a
# Build feature...
# When done, switch branches
git checkout main

# Terminal 2: Work on feature-b
git checkout feature-b
# Build feature...
# When done, switch branches
git checkout main
```

**Git Worktrees Way (Fast & Parallel):**

```bash
# Terminal 1: Feature A (independent directory)
git worktree add ../dcyfr-feature-a feature-a
cd ../dcyfr-feature-a
# Build feature-a independently

# Terminal 2: Feature B (independent directory)
git worktree add ../dcyfr-feature-b feature-b
cd ../dcyfr-feature-b
# Build feature-b independently (same time!)

# No branch switching, no conflicts, full parallelization
```

---

## ✅ Prerequisites

**Git Version:** 2.17+ (any modern git)

**Verify:**

```bash
git --version
git worktree list  # Should return empty initially
```

**Existing Setup:**

- Already on `main` or appropriate base branch
- No uncommitted changes in current worktree
- Sufficient disk space for multiple checkout copies

---

## 🚀 Setting Up Parallel Development

### Step 1: Create First Worktree (Feature A)

```bash
# From your main dcyfr-labs directory
cd ${WORKSPACE_ROOT}/dcyfr-labs

# Create worktree for feature-a on its own branch
git worktree add ../dcyfr-feature-a feature-a

# Navigate to the new worktree
cd ../dcyfr-feature-a

# Verify you're on the right branch
git status
# On branch feature-a
```

**What happened:**

- ✅ Created new directory: `../dcyfr-feature-a/`
- ✅ Checked out `feature-a` branch there
- ✅ `node_modules/`, `.git/`, etc. are independent copies
- ✅ Can run npm, git, and Claude Code independently

### Step 2: Create Second Worktree (Feature B)

**In a new terminal tab:**

```bash
# From main dcyfr-labs directory
cd ${WORKSPACE_ROOT}/dcyfr-labs

# Create worktree for feature-b
git worktree add ../dcyfr-feature-b feature-b

# Navigate to it
cd ../dcyfr-feature-b

# Verify
git status
# On branch feature-b
```

### Step 3: Start Claude in Each Worktree

**Terminal 1 (Feature A):**

```bash
cd ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-a
npm install  # Only needed once per worktree
claude
# Describe feature A tasks
```

**Terminal 2 (Feature B):**

```bash
cd ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-b
npm install  # Only needed once per worktree
claude
# Describe feature B tasks
```

**Both Claude sessions now work in parallel!** No conflicts, no waiting.

---

## 💡 Real-World Example: Sprint with 2 Features

### Setup (5 minutes)

```bash
# Terminal 1: Bookmarks Feature
git worktree add ../dcyfr-bookmarks bookmarks

cd ../dcyfr-bookmarks
npm install
claude
> /plan Create /bookmarks page with category filtering

# Terminal 2: Analytics Dashboard (new terminal)
cd ${WORKSPACE_ROOT}/dcyfr-labs
git worktree add ../dcyfr-analytics analytics

cd ../dcyfr-analytics
npm install
claude
> /plan Create /analytics page showing engagement metrics
```

### Development (Parallel Execution)

```
Timeline:

10:00 AM
├─ Terminal 1: Claude planning bookmarks feature
├─ Terminal 2: Claude planning analytics feature

10:10 AM
├─ Terminal 1: Review bookmarks plan ✓
├─ Terminal 2: Review analytics plan ✓

10:15 AM
├─ Terminal 1: /ultrawork Implement bookmarks
├─ Terminal 2: /ultrawork Implement analytics
│  (BOTH running simultaneously!)

11:15 AM
├─ Terminal 1: Bookmarks tests passing ✓
├─ Terminal 2: Analytics tests passing ✓
│  (Finished at same time, not sequentially!)

11:20 AM
├─ Terminal 1: /code-review Validate bookmarks
├─ Terminal 2: /code-review Validate analytics
```

**Time Savings:**

- Sequential: 2-3 hours per feature × 2 = 4-6 hours
- Parallel: Both at same time = 2-3 hours **50% faster!**

---

## 🔄 Managing Multiple Worktrees

### View All Worktrees

```bash
# From any worktree or main directory
git worktree list

# Output:
# ${WORKSPACE_ROOT}/dcyfr-labs              (bare)
# ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-a  feature-a
# ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-b  feature-b
```

### Switch Between Worktrees

```bash
# From main directory, switch to feature-a worktree
cd ../dcyfr-feature-a

# From feature-a, switch to feature-b worktree
cd ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-b

# From any worktree, get back to main
cd ${WORKSPACE_ROOT}/dcyfr-labs
```

### Run Commands in Specific Worktree

```bash
# Without navigating there
git -C ../dcyfr-feature-a status
git -C ../dcyfr-feature-a pull
git -C ../dcyfr-feature-b npm run test:run
```

---

## ✅ Cleanup After Feature Completion

### When Feature A is Done

**In Terminal 1:**

```bash
cd ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-a

# Final validation
npm run check  # All tests, linting passing

# Commit and push
git push origin feature-a

# Create pull request (or merge locally)
# After merge is complete...

# Back to main directory
cd ${WORKSPACE_ROOT}/dcyfr-labs

# Remove the worktree
git worktree remove ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-a
# or
git worktree prune

# Verify removal
git worktree list
# Should only show remaining worktrees now
```

### Complete Cleanup

```bash
# Remove all worktrees (when sprint is done)
git worktree list | grep -v bare | awk '{print $1}' | xargs git worktree remove

# Verify all removed
git worktree list
# Should only show main directory
```

---

## 🛠️ Troubleshooting

### "Worktree already exists"

```bash
error: 'feature-a' is already checked out at '.../dcyfr-feature-a'
```

**Solution:**

```bash
# Either remove the existing worktree first
git worktree remove ../dcyfr-feature-a

# Or use different worktree name
git worktree add ../dcyfr-feature-a-v2 feature-a
```

### "Can't remove worktree - path is in use"

```bash
error: Cannot remove '/Users/.../dcyfr-feature-a': Directory not empty
```

**Solution:**

```bash
# Close terminals using that worktree
# Then try again
cd ${WORKSPACE_ROOT}/dcyfr-labs  # Exit the worktree
git worktree remove ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-a

# Or force remove
rm -rf ${WORKSPACE_ROOT}/dcyfr-labs/../dcyfr-feature-a
git worktree prune
```

### "npm install fails in worktree"

```bash
# Each worktree needs its own node_modules
cd ../dcyfr-feature-a
npm install  # Full install, not fast
npm run dev  # Should work now
```

### "Git merge conflicts between worktrees"

**Good news:** Git handles this automatically!

```bash
# Both features can modify different files with no conflicts
# Git only conflicts if SAME file modified on both branches

# If conflict occurs:
# - It's a real conflict (same file, both branches)
# - Merge one feature to main first
# - Then merge second feature (will see actual conflict)
# - Normal git conflict resolution applies
```

---

## 📋 Worktree Best Practices

### Do's ✅

- ✅ Create one worktree per independent feature
- ✅ Use descriptive names: `dcyfr-feature-name`
- ✅ Run `npm install` in each new worktree
- ✅ Keep worktrees for duration of feature work
- ✅ Use different Claude sessions per worktree
- ✅ Clean up worktrees when feature is merged
- ✅ Use `git worktree list` to track all worktrees

### Don'ts ❌

- ❌ Don't use worktrees for same branch (git prevents this)
- ❌ Don't delete worktree directories manually (use `git worktree remove`)
- ❌ Don't nest worktrees inside each other
- ❌ Don't leave abandoned worktrees (cleanup regularly)
- ❌ Don't share worktree paths between developers
- ❌ Don't try to use worktree without checking out branch first

---

## 🚀 Advanced Patterns

### Pattern 1: Feature + Hotfix in Parallel

```bash
# Working on feature, but bug found in production

# Terminal 1: Continue feature work
cd ../dcyfr-feature-x
claude
# Continue building

# Terminal 2: Fix production bug
git worktree add ../dcyfr-hotfix main  # Branch from main, not feature
cd ../dcyfr-hotfix
# Fix bug quickly
git push origin  # Push hotfix to main independently
git worktree remove ../dcyfr-hotfix

# Back to terminal 1: Feature work unaffected
# When ready, merge feature independently
```

### Pattern 2: Dependent Features (Sequential)

```bash
# If features depend on each other:

# Feature A: Create API endpoint
git worktree add ../dcyfr-api api-feature
# Complete and merge to main

# Feature B: Use the API endpoint
git worktree add ../dcyfr-ui ui-feature
# Can now use the API from main
```

### Pattern 3: Quick Testing Worktree

```bash
# Need to test something without affecting main work

# Main dev: Already working on feature
cd ../dcyfr-feature-x

# Quick test: New terminal
git worktree add ../dcyfr-test main  # Temporary test branch
cd ../dcyfr-test
# Try something, verify, clean up
git worktree remove ../dcyfr-test

# Back to feature work
```

---

## 📊 Performance Comparison

### Single Branch (No Worktrees)

```
Task 1: Feature A
├─ Checkout feature-a (2 sec)
├─ npm install (if needed)
├─ Develop 60 min
├─ Tests 10 min
└─ Checkout main (2 sec)

Task 2: Feature B
├─ Checkout feature-b (2 sec)
├─ npm install (if needed)
├─ Develop 60 min
├─ Tests 10 min
└─ Checkout main (2 sec)

TOTAL: 140+ minutes (sequential)
```

### Multiple Worktrees (Parallel)

```
Task 1: Feature A           Task 2: Feature B
├─ Setup worktree (30 sec)  ├─ Setup worktree (30 sec)
├─ npm install (30 sec)     ├─ npm install (30 sec)
├─ Develop 60 min           ├─ Develop 60 min (simultaneous!)
├─ Tests 10 min             ├─ Tests 10 min (simultaneous!)
└─ Merge (5 min)            └─ Merge (5 min)

TOTAL: ~76 minutes (parallel)
SAVINGS: 64 minutes (46% faster)
```

---

## 🔗 Related Documentation

- **Workflow Patterns:** [Claude Code Workflows](./claude-code-workflows.md)
- **Commands Reference:** [.claude/COMMANDS_GUIDE.md](../../.claude/COMMANDS_GUIDE.md)
- **Feature Implementation:** Claude Code Workflows - Feature Implementation
- **DCYFR Patterns:** [Component Patterns](./component-patterns.md)

---

## ✅ Quick Reference Card (Printable)

```
GIT WORKTREES QUICK START

Create worktree:
  git worktree add ../dcyfr-FEATURE BRANCHNAME
  cd ../dcyfr-FEATURE

List worktrees:
  git worktree list

Remove worktree (when done):
  git worktree remove ../dcyfr-FEATURE

Parallel development:
  Terminal 1: cd ../dcyfr-FEATURE1 && claude
  Terminal 2: cd ../dcyfr-FEATURE2 && claude
  → Both work simultaneously!

Cleanup all:
  git worktree list | grep -v bare | awk '{print $1}' | xargs git worktree remove
```

**Post near your desk!**

---

**Status:** Production Ready
**Last Review:** January 24, 2026
**Maintained By:** DCYFR Team

For workflow selection guidance, see [Claude Code Workflows](./claude-code-workflows.md)
