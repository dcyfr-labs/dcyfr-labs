# Preview Branch Workflow

**Last Updated:** December 27, 2025  
**Status:** Active Protection

---

## 🎯 Purpose

The `preview` branch is a **long-lived integration branch** used for testing features before merging to `main`. It should NEVER be auto-deleted.

---

## ⚠️ The Problem

The repository has `deleteBranchOnMerge: true` enabled, which automatically deletes ANY branch when its PR is merged. This means:

1. ❌ **Creating PR FROM preview** → When merged, preview gets deleted
2. ✅ **Creating PR TO preview** → Safe, preview branch preserved

---

## ✅ Correct Workflow

### Option 1: Feature Branches → Preview → Main (Recommended)

```bash
# 1. Create feature branch from main
git checkout main
git pull
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"
git push -u origin feature/my-feature

# 3. Create PR to preview branch (NOT from preview)
gh pr create --base preview --head feature/my-feature

# 4. After testing in preview, create PR to main
gh pr create --base main --head preview
```

### Option 2: Direct to Preview

```bash
# 1. Checkout preview
git checkout preview
git pull

# 2. Make changes directly
git add .
git commit -m "feat: add feature"
git push

# 3. When ready, create PR to main
gh pr create --base main --head preview
```

---

## 🚫 What NOT to Do

```bash
# ❌ WRONG: Creating PR FROM preview
git checkout main
git checkout -b some-branch
# ... make changes ...
git checkout preview
git merge some-branch
git push

# Then creating PR: preview → main
# This will DELETE preview when merged!
```

---

## 🛡️ Automatic Protection

The repository has automatic protection for the preview branch:

### 1. Auto-Restoration Workflow

**File:** `.github/workflows/protect-preview-branch.yml`

- Monitors for preview branch deletion
- Automatically recreates from main
- Creates notification issue
- **Trigger:** Any deletion of preview branch

### 2. Automated Workflows

The following automated workflows are configured to NOT delete branches:

- `ai-sync-consolidated.yml` - Creates sync branches (auto-deletes THOSE branches, not preview)
- Other automation workflows - Use temporary branches

---

## 🔧 Configuration Reference

### Repository Settings

```json
{
  "deleteBranchOnMerge": true  // ⚠️ Deletes ANY branch when PR merged
}
```

**This setting CANNOT be overridden per-branch** without GitHub Enterprise or branch protection rules.

### Branch Protection (Manual Setup Required)

To fully protect the preview branch from deletion, repository admins should:

1. Go to: `Settings` → `Branches` → `Branch protection rules`
2. Add rule for branch name pattern: `preview`
3. Enable:
   - ❌ Do not allow deletions
   - ✅ Allow force pushes (for preview workflow flexibility)
   - ❌ Do not lock branch

---

## 📊 Current Status

- ✅ Auto-restoration workflow active
- ✅ Documentation in place
- ⚠️ Manual branch protection NOT enabled (requires admin access)
- ✅ Preview branch currently exists

---

## 🚨 If Preview Branch Goes Missing

### Automatic Recovery

The `protect-preview-branch.yml` workflow will automatically:
1. Detect deletion
2. Recreate from main
3. Create notification issue

### Manual Recovery

If automatic restoration fails:

```bash
# Restore preview from main
git checkout main
git pull
git checkout -b preview
git push -u origin preview

# Or restore from a specific commit
git checkout -b preview <commit-sha>
git push -u origin preview --force
```

---

## 📚 Related Documentation

- [AGENTS.md](../../AGENTS.md) - Agent selection and workflows
- [docs/operations/todo.md](../../docs/operations/todo.md) - Current priorities
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines

---

## 🔍 Troubleshooting

### Issue: "Preview branch not found"

**Cause:** Branch was deleted during PR merge  
**Solution:** Check GitHub Actions for auto-restoration or manually restore

### Issue: "Cannot create PR from preview"

**Cause:** Trying to create PR with preview as head (source)  
**Solution:** Create PR TO preview, not FROM preview

### Issue: "Auto-restoration failed"

**Cause:** GitHub Actions permissions issue  
**Solution:** Check workflow logs, ensure `contents: write` permission

---

**Maintained by:** DCYFR Labs Team  
**Questions?** Create an issue with label `branch-management`
