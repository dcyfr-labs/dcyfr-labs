#!/bin/bash

# LGTM Suppression Audit Script
#
# Analyzes all LGTM suppressions in the codebase and generates
# a comprehensive audit report.
#
# Usage:
#   bash scripts/security/audit-suppressions.sh
#   npm run security:audit-suppressions

set -euo pipefail

echo "📋 LGTM Suppression Audit"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Repository: dcyfr-labs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count total suppressions
TOTAL=$(grep -r "lgtm \[" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.mjs" . 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Summary Statistics"
echo ""
echo "  Total Suppressions: $TOTAL"
echo "  Baseline (CI):      2"
echo ""

if [ "$TOTAL" -gt 2 ]; then
  echo "  Status: ❌ ABOVE BASELINE ($TOTAL > 2)"
  echo "  Action: Review and attempt to fix new suppressions"
elif [ "$TOTAL" -lt 2 ]; then
  echo "  Status: ✅ BELOW BASELINE ($TOTAL < 2)"
  echo "  Action: Update baseline in .github/workflows/codeql.yml"
else
  echo "  Status: ✅ MATCHES BASELINE ($TOTAL = 2)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Group suppressions by rule
echo "📂 Suppressions by Rule"
echo ""

grep -rh "lgtm \[" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.mjs" . 2>/dev/null \
  | sed 's/.*lgtm \[\([^]]*\)\].*/\1/' \
  | sort | uniq -c | sort -rn \
  | while read -r count rule; do
      echo "  $rule: $count occurrence(s)"
    done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# List all suppressions with file locations
echo "📍 All Suppressions (with locations)"
echo ""

grep -rn "lgtm \[" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.mjs" . 2>/dev/null \
  | while IFS=: read -r file line content; do
      # Extract just the rule ID
      rule=$(echo "$content" | sed 's/.*lgtm \[\([^]]*\)\].*/\1/')
      # Clean up file path (remove leading ./)
      clean_file=${file#./}
      echo "  [$rule] $clean_file:$line"
    done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Review questions
echo "✅ Review Checklist"
echo ""
echo "For each suppression above, verify:"
echo ""
echo "  1. Is the suppression still necessary?"
echo "  2. Has the underlying pattern or API changed?"
echo "  3. Is there a better fix available now?"
echo "  4. Is the justification still technically valid?"
echo "  5. Does the comment clearly explain why it's safe?"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Recommendations
echo "📋 Next Steps"
echo ""

if [ "$TOTAL" -gt 2 ]; then
  echo "  1. Review new suppressions (count: $((TOTAL - 2)))"
  echo "  2. Attempt to fix instead of suppress"
  echo "  3. See: docs/security/LGTM_APPROVAL_PROCESS.md"
  echo "  4. Update baseline if suppressions are approved"
elif [ "$TOTAL" -eq 2 ]; then
  echo "  1. Quarterly review: Validate existing suppressions"
  echo "  2. Check for new fix patterns in Node.js updates"
  echo "  3. Document any changes to justifications"
else
  echo "  1. ✅ Update baseline in .github/workflows/codeql.yml"
  echo "  2. Document which suppressions were eliminated"
  echo "  3. Share fix patterns with team"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Audit complete."
echo ""
