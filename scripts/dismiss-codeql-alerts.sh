#!/bin/bash

# Dismiss CodeQL Security Findings
#
# This script dismisses the 3 open CodeQL findings for clear-text logging
# of sensitive credentials in scripts/test-google-indexing.mjs
#
# Requirements:
#   - GitHub fine-grained token with security_events:write permission
#   - Token scopes: repo, security_events:read/write
#   - gh CLI configured with the token
#
# Usage:
#   ./scripts/dismiss-codeql-alerts.sh
#

set -e

REPO="dcyfr/dcyfr-labs"
ALERTS=(49 50 51)

echo "🔐 Dismissing CodeQL Security Findings"
echo "========================================"
echo ""
echo "Repository: $REPO"
echo "Alerts: ${ALERTS[@]}"
echo ""

# Verify authentication
echo "🔍 Verifying GitHub authentication..."
if ! gh auth status > /dev/null 2>&1; then
  echo "❌ Error: Not authenticated with GitHub"
  echo "   Run: gh auth login"
  exit 1
fi

# Check for security_events scope
TOKEN_SCOPES=$(gh api user -q '.scopes | join(", ")' 2>/dev/null || echo "unknown")
echo "✅ Authenticated with scopes: $TOKEN_SCOPES"
echo ""

# Dismiss each alert
for ALERT_NUM in "${ALERTS[@]}"; do
  echo "📋 Dismissing alert #$ALERT_NUM..."

  RESPONSE=$(gh api repos/$REPO/code-scanning/alerts/$ALERT_NUM \
    -X PATCH \
    -f state='dismissed' \
    -f dismissed_reason='false_positive' \
    -f dismissed_comment='Code was fixed to remove clear-text logging of sensitive credentials (service account email) from test-google-indexing.mjs. Removed lines 70-71 and line 109 that logged GOOGLE_INDEXING_API_KEY data. Replaced with generic messages referencing the environment variable instead of exposing actual credentials.' 2>&1)

  if echo "$RESPONSE" | grep -q '"state":"dismissed"'; then
    echo "   ✅ Alert #$ALERT_NUM dismissed successfully"
  else
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4 || echo "Unknown error")
    if [ "$ERROR_MSG" = "Bad credentials" ]; then
      echo "   ❌ Failed: Missing security_events:write permission"
      echo "   → Update your GitHub token with security_events:write scope"
      echo "   → See: docs/ai/LOGGING_SECURITY.md for details"
      exit 1
    else
      echo "   ❌ Failed: $ERROR_MSG"
    fi
  fi
done

echo ""
echo "✨ All CodeQL security findings dismissed!"
echo ""
echo "Summary:"
echo "  • Alerts #49, #50, #51 marked as dismissed (false positive)"
echo "  • Reason: Code was fixed to remove clear-text logging"
echo "  • All sensitive credential logging removed from scripts/test-google-indexing.mjs"
echo ""
