#!/bin/bash

echo "================================"
echo "List Sentry Alert Rules"
echo "================================"
echo ""

read -p "Sentry Auth Token: " SENTRY_TOKEN
read -p "Organization Slug: " ORG_SLUG
read -p "Project Slug: " PROJECT_SLUG

if [ -z "$SENTRY_TOKEN" ] || [ -z "$ORG_SLUG" ] || [ -z "$PROJECT_SLUG" ]; then
  echo "❌ Error: All fields are required"
  exit 1
fi

echo ""
echo "Fetching alert rules..."
echo ""

RULES=$(curl -s \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if ! echo "$RULES" | jq -e '.[0]' > /dev/null 2>&1; then
  echo "❌ No alert rules found or error occurred"
  echo "Response: $RULES"
  exit 1
fi

echo "Current Alert Rules:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$RULES" | jq -r '.[] | "\(.id) │ \(.name)\n     │ Status: \(if .status == "active" then "✓ Active" else "⚠ Inactive" end)\n     │ Frequency: \(.frequency) minutes\n     │ Created: \(.dateCreated)\n"'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Total rules: $(echo "$RULES" | jq '. | length')"
echo ""
echo "View in browser:"
echo "  https://sentry.io/settings/$ORG_SLUG/projects/$PROJECT_SLUG/alerts/"
echo ""
