#!/bin/bash

echo "================================"
echo "Sentry Event Verification"
echo "================================"
echo ""

echo "This script will:"
echo "  1. Send a test event to your API"
echo "  2. Check if Sentry received it"
echo ""

read -p "Sentry Auth Token: " SENTRY_TOKEN
read -p "Organization Slug: " ORG_SLUG
read -p "Project Slug: " PROJECT_SLUG

if [ -z "$SENTRY_TOKEN" ] || [ -z "$ORG_SLUG" ] || [ -z "$PROJECT_SLUG" ]; then
  echo "❌ Error: All fields are required"
  exit 1
fi

echo ""
echo "Step 1: Sending test request to API..."
curl -s http://localhost:3000/api/analytics \
  -H "x-internal-request: true" \
  -H "Authorization: Bearer verify_test_$(date +%s)" \
  > /dev/null

echo "✓ Test request sent (should trigger: 'Admin access denied: invalid or missing API key')"
echo ""
echo "Waiting 3 seconds for Sentry to process..."
sleep 3

echo ""
echo "Step 2: Checking Sentry for events..."
echo ""

# Get recent issues from Sentry
ISSUES=$(curl -s \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/issues/?query=is:unresolved&limit=10")

if ! echo "$ISSUES" | jq -e '.[0]' > /dev/null 2>&1; then
  echo "❌ No recent issues found in Sentry"
  echo ""
  echo "Possible reasons:"
  echo "  1. Sentry DSN not configured correctly"
  echo "  2. Events haven't reached Sentry yet (try again in 10 seconds)"
  echo "  3. @sentry/nextjs not initialized properly"
  echo ""
  echo "Debug steps:"
  echo "  1. Check .env.local has SENTRY_DSN set"
  echo "  2. Restart dev server: npm run dev"
  echo "  3. Check Sentry dashboard manually"
  exit 1
fi

echo "Recent Sentry Issues:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$ISSUES" | jq -r '.[] | "  • \(.title) (\(.count) events, last seen: \(.lastSeen))"'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for our specific event
ADMIN_ISSUE=$(echo "$ISSUES" | jq -r '.[] | select(.title | contains("Admin access denied")) | .id' | head -1)

if [ -n "$ADMIN_ISSUE" ]; then
  echo "✓ Found 'Admin access denied' issue in Sentry! (ID: $ADMIN_ISSUE)"
  echo "✓ Sentry integration is working correctly"
  echo ""
  echo "View in browser:"
  echo "  https://sentry.io/organizations/$ORG_SLUG/issues/$ADMIN_ISSUE/"
else
  echo "⚠️  No 'Admin access denied' issue found"
  echo "   This might be normal if it's the first event"
  echo "   Check Sentry dashboard manually"
fi

echo ""
echo "Next step: Configure alerts"
echo "  → Run: ./scripts/setup-sentry-alerts.sh"
