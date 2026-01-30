<!-- TLP:CLEAR -->

# Branch Protection Configuration

This document provides the recommended branch protection rules for the `main` and `preview` branches.

## Critical Security Issue

**Current State**: ❌ Both `main` and `preview` branches have NO protection rules
**Risk Level**: 🔴 CRITICAL
**Impact**: Anyone with write access can bypass CI checks and push directly to production

## Recommended Configuration

### For `main` Branch

Navigate to: **Settings → Branches → Add rule**

**Branch name pattern**: `main`

#### Protect matching branches

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners
  - [ ] Restrict who can dismiss pull request reviews
  - [x] Allow specified actors to bypass required pull requests (leave empty - no bypassing)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - `Code Quality`
    - `Unit & Integration Tests`
    - `E2E Tests`
    - `Bundle Size Check`
    - `Security Checks`
    - `Design System Validation`
    - `Lighthouse CI`

- [x] **Require conversation resolution before merging**

- [x] **Require signed commits** (optional but recommended)

- [x] **Require linear history**
  - Forces squash merge or rebase (no merge commits)

- [x] **Require deployments to succeed before merging** (if using GitHub Deployments)

- [ ] **Lock branch** (only enable for hotfix scenarios)

- [x] **Do not allow bypassing the above settings**
  - Critical: Prevents even admins from bypassing

#### Rules applied to everyone including administrators

- [x] Restrict who can push to matching branches
  - Leave empty (no direct pushes allowed)

- [x] Allow force pushes: **Disabled**
  - Prevents accidental history rewrites

- [x] Allow deletions: **Disabled**
  - Prevents accidental branch deletion

### For `preview` Branch

**Branch name pattern**: `preview`

Use the same configuration as `main` with one modification:

- **Require approvals**: **0** (auto-merge from automated workflows allowed)
- All other settings: Same as `main`

**Rationale**: Preview branch is used for automated sync from `main`, so it needs less strict approval requirements but same protection from direct pushes.

## Additional Repository Settings

Navigate to: **Settings → Pull Requests**

### Merge Button

- [x] Allow squash merging
  - [x] Default to pull request title and description
- [ ] Allow merge commits (DISABLE THIS)
- [ ] Allow rebase merging (DISABLED - keep this way)

### After Merge

- [x] **Automatically delete head branches** ← ENABLE THIS

## Ruleset Alternative (Recommended for Enterprise)

GitHub now offers **Rulesets** as a more flexible alternative to branch protection rules. For a more maintainable approach:

**Settings → Rules → Rulesets → New ruleset**

```json
{
  "name": "Main Branch Protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          {
            "context": "Code Quality",
            "integration_id": null
          },
          {
            "context": "Unit & Integration Tests",
            "integration_id": null
          },
          {
            "context": "E2E Tests",
            "integration_id": null
          }
        ],
        "strict_required_status_checks_policy": true
      }
    },
    {
      "type": "required_linear_history"
    },
    {
      "type": "required_signatures"
    }
  ],
  "bypass_actors": []
}
```

## Terraform Configuration (Infrastructure as Code)

For version-controlled branch protection:

```hcl
# terraform/github_branch_protection.tf

resource "github_branch_protection" "main" {
  repository_id = github_repository.dcyfr_labs.node_id
  pattern       = "main"

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = true
    required_approving_review_count = 1
  }

  required_status_checks {
    strict   = true
    contexts = [
      "Code Quality",
      "Unit & Integration Tests",
      "E2E Tests",
      "Bundle Size Check",
      "Security Checks",
      "Design System Validation"
    ]
  }

  enforce_admins                  = true
  require_signed_commits          = true
  require_linear_history          = true
  require_conversation_resolution = true
  allows_deletions                = false
  allows_force_pushes             = false
}

resource "github_branch_protection" "preview" {
  repository_id = github_repository.dcyfr_labs.node_id
  pattern       = "preview"

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
    required_approving_review_count = 0
  }

  required_status_checks {
    strict   = true
    contexts = [
      "Code Quality",
      "Unit & Integration Tests",
      "Security Checks"
    ]
  }

  enforce_admins                  = true
  require_linear_history          = true
  require_conversation_resolution = false
  allows_deletions                = false
  allows_force_pushes             = false
}
```

## GitHub CLI Setup Script

For quick setup via CLI:

```bash
#!/bin/bash
# scripts/setup-branch-protection.sh

REPO="dcyfr/dcyfr-labs"

echo "Setting up branch protection for $REPO..."

# Main branch protection
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Code Quality",
      "Unit & Integration Tests",
      "E2E Tests",
      "Bundle Size Check",
      "Security Checks",
      "Design System Validation"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

echo "✅ Main branch protection configured"

# Preview branch protection
gh api repos/$REPO/branches/preview/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Code Quality",
      "Unit & Integration Tests",
      "Security Checks"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false
}
EOF

echo "✅ Preview branch protection configured"

# Enable auto-delete head branches
gh api repos/$REPO \
  --method PATCH \
  --field delete_branch_on_merge=true

echo "✅ Auto-delete head branches enabled"

# Disable merge commits
gh api repos/$REPO \
  --method PATCH \
  --field allow_merge_commit=false

echo "✅ Merge commits disabled (squash-only)"

echo ""
echo "🎉 Branch protection setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify settings at: https://github.com/$REPO/settings/branches"
echo "2. Test by attempting to push directly to main (should fail)"
echo "3. Create a test PR to verify status checks work"
```

## Verification Steps

After applying branch protection:

1. **Test direct push prevention**:
   ```bash
   git checkout main
   echo "test" >> test.txt
   git commit -am "Test direct push"
   git push origin main
   # Should fail with: "refusing to allow an OAuth App to create or update workflow"
   ```

2. **Test PR requirement**:
   ```bash
   git checkout -b test-branch-protection
   git push origin test-branch-protection
   # Create PR via GitHub UI
   # Verify status checks are required
   ```

3. **Test code owner review**:
   - PR should require review from @dcyfr (as defined in CODEOWNERS)

## Troubleshooting

### Status Checks Not Appearing

If required status checks don't show up:
1. Ensure workflows run at least once on the branch
2. Check workflow job names match exactly (case-sensitive)
3. Verify workflows have `pull_request` trigger for target branch

### Cannot Merge Despite Passing Checks

1. Verify all required status checks are green
2. Check conversation resolution requirement
3. Ensure branch is up to date with base

### Bypass Needed for Emergency Hotfix

1. Temporarily disable "Do not allow bypassing" setting
2. Apply hotfix
3. Re-enable protection immediately
4. Create post-mortem issue to review incident

## Related Documentation

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [CODEOWNERS](.github/CODEOWNERS)

---

**Last Updated**: 2025-12-22
**Priority**: 🔴 CRITICAL - Implement ASAP
