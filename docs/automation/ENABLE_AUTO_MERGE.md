# Quick Setup: Enable Auto-Merge on GitHub

**Status:** Ready to enable  
**Time to complete:** 2 minutes  
**Required permissions:** Repository admin

---

## ✅ Step-by-Step Instructions

### 1. Enable Auto-Merge in Repository Settings

1. Go to **Settings** → **Pull Requests**
2. Check the box: **Allow auto-merge** ✓
3. Select **Squash and merge** as the preferred method
4. Save

**Screenshot location:** Settings tab → Pull Requests section (upper area)

### 2. Verify Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions" select:
   - ✓ **Read and write permissions**
   - ✓ **Allow GitHub Actions to create and approve pull requests**
3. Save

### 3. Test Auto-Merge (Optional)

Create a test PR or wait for next Dependabot update:
- Dependabot will create PR
- Workflow will evaluate safety
- If safe: PR auto-merges when CI passes
- If risky: PR gets "review-required" label

---

## 🎯 What Happens After Enabling

### For Patch Updates (Safe)
```
PR created by Dependabot
  ↓
Workflow evaluates: "Is this safe?"
  ↓
Result: YES → Auto-approved + Auto-merged
  (No manual review needed)
```

### For Major Updates (Risky)
```
PR created by Dependabot
  ↓
Workflow evaluates: "Is this safe?"
  ↓
Result: NO → Label added: "review-required"
  (Manual review required before merge)
```

---

## 📋 Checklist

- [ ] Navigated to Settings → Pull Requests
- [ ] Enabled "Allow auto-merge" ✓
- [ ] Selected "Squash and merge" method
- [ ] Went to Settings → Actions → General
- [ ] Enabled "Read and write permissions"
- [ ] Enabled "Allow GitHub Actions to create and approve pull requests"
- [ ] Saved all changes

---

## 🔍 Verify It's Working

After enabling, you should see:

✅ **When Dependabot creates a PR:**
- GitHub shows auto-merge option is available
- Workflow `dependabot-auto-merge.yml` runs
- If safe: Auto-merge gets enabled automatically
- PR merges when CI checks pass

✅ **In workflow logs:**
- "Auto-merge enabled" message appears
- Or "Manual review required" + label added

---

## 🚀 Current Automation (Now Active)

Once auto-merge is enabled, these workflows run automatically:

| Workflow | When | Action |
|----------|------|--------|
| **Dependabot** | Weekly Mondays | Creates update PRs |
| **Auto-Merge** | On PR creation | Evaluates + auto-merges safe updates |
| **Security Check** | Daily + on PR | Scans for vulnerabilities |
| **Instruction Sync** | Monthly | Updates docs with metrics |
| **Test Metrics** | After tests | Captures performance data |

---

## 💡 Pro Tips

1. **No more manual approvals for patches** — Workflow handles it
2. **Still review major updates** — "review-required" label prevents auto-merge
3. **Works alongside Dependabot** — Not replacing, just automating safe merges
4. **Safe to enable now** — Workflow has built-in safety checks

---

## ❓ FAQ

**Q: Will this auto-merge breaking changes?**  
A: No. Breaking changes get "review-required" label and require manual approval.

**Q: What if CI fails?**  
A: Auto-merge is disabled. Fix the failure and the workflow re-evaluates.

**Q: Can I disable it?**  
A: Yes. Settings → Pull Requests → Uncheck "Allow auto-merge"

**Q: What about security?**  
A: Workflow checks for critical vulnerabilities. Security PRs get manual review.

---

**Next step:** Go to Settings → Pull Requests and enable auto-merge!
