#!/bin/bash
# Setup branch protection rules for dcyfr-labs repository
#
# This script configures branch protection for main and preview branches
# to prevent direct pushes and enforce code review + CI checks.
#
# Prerequisites:
# - GitHub CLI (gh) installed and authenticated
# - Admin access to dcyfr/dcyfr-labs repository
#
# Usage:
#   chmod +x scripts/setup-branch-protection.sh
#   ./scripts/setup-branch-protection.sh

set -e  # Exit on error

REPO="dcyfr-labs/dcyfr-labs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 Branch Protection Setup for $REPO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${YELLOW}⚠️  This will configure branch protection for:${NC}"
echo "  • main branch (strict protection)"
echo "  • preview branch (automated workflow friendly)"
echo ""
echo -e "${YELLOW}⚠️  Repository settings that will be changed:${NC}"
echo "  • Auto-delete head branches: enabled"
echo "  • Merge commits: disabled (squash-only)"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "�� Step 1: Configuring main branch protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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
    "required_approving_review_count": 1,
    "bypass_pull_request_allowances": {}
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF

echo -e "${GREEN}✅ Main branch protection configured${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 2: Configuring preview branch protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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
    "required_approving_review_count": 0,
    "bypass_pull_request_allowances": {}
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF

echo -e "${GREEN}✅ Preview branch protection configured${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 3: Enabling auto-delete head branches"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

gh api repos/$REPO \
  --method PATCH \
  --field delete_branch_on_merge=true

echo -e "${GREEN}✅ Auto-delete head branches enabled${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 4: Disabling merge commits (squash-only)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

gh api repos/$REPO \
  --method PATCH \
  --field allow_merge_commit=false

echo -e "${GREEN}✅ Merge commits disabled (squash-only)${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Branch protection setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Verify settings at: https://github.com/$REPO/settings/branches"
echo "2. Test direct push prevention:"
echo "   ${YELLOW}git push origin main${NC} (should fail)"
echo "3. Create a test PR to verify status checks work"
echo "4. Verify CODEOWNERS review requirement is enforced"
echo ""
echo -e "${YELLOW}⚠️  Important reminders:${NC}"
echo "• All changes to main/preview now REQUIRE pull requests"
echo "• PRs must pass all status checks before merging"
echo "• Code owner approval is required for main branch"
echo "• Direct pushes and force pushes are blocked"
echo ""
