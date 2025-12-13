#!/bin/bash

set -e

echo "================================"
echo "Sentry Metric Alert Setup"
echo "================================"
echo ""
echo "This creates metric-based alerts (more reliable than issue alerts)"
echo ""

read -p "Sentry Auth Token: " SENTRY_TOKEN
read -p "Organization Slug: " ORG_SLUG
read -p "Project Slug: " PROJECT_SLUG

if [ -z "$SENTRY_TOKEN" ] || [ -z "$ORG_SLUG" ] || [ -z "$PROJECT_SLUG" ]; then
  echo "❌ Error: All fields are required"
  exit 1
fi

echo ""
echo "Verifying connection..."

# Get organization
ORG=$(curl -s -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/organizations/$ORG_SLUG/")

if ! echo "$ORG" | jq -e '.id' > /dev/null 2>&1; then
  echo "❌ Failed to connect"
  exit 1
fi

# Get project
PROJECT=$(curl -s -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/")

PROJECT_ID=$(echo "$PROJECT" | jq -r '.id')
echo "✓ Connected to project: $PROJECT_SLUG (ID: $PROJECT_ID)"

echo ""
echo "================================"
echo "Creating Metric Alerts"
echo "================================"
echo ""

# Alert 1: High Error Rate (Brute Force Detection)
echo "1/2 Creating: Brute Force Detection (>10 events in 5min)..."

cat > /tmp/metric-alert-1.json << EOF
{
  "name": "🟠 Brute Force: >10 Failed Auth in 5min",
  "queryType": 0,
  "dataset": "events",
  "query": "event.type:error message:\"Admin access denied\"",
  "aggregate": "count()",
  "timeWindow": 5,
  "triggers": [
    {
      "label": "critical",
      "alertThreshold": 10,
      "actions": [
        {
          "type": "email",
          "targetType": "team",
          "targetIdentifier": "1"
        }
      ]
    }
  ],
  "resolveThreshold": 0,
  "thresholdType": 0,
  "eventTypes": [
    "error"
  ],
  "comparisonDelta": null,
  "projects": [
    "$PROJECT_ID"
  ]
}
EOF

ALERT1=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/metric-alert-1.json \
  "https://sentry.io/api/0/organizations/$ORG_SLUG/alert-rules/")

if echo "$ALERT1" | jq -e '.id' > /dev/null 2>&1; then
  echo "  ✓ Created (ID: $(echo "$ALERT1" | jq -r '.id'))"
else
  echo "  ℹ️  Response: $(echo "$ALERT1" | jq -c '.')"
fi

# Alert 2: Production Access
echo "2/2 Creating: Production Access Detection..."

cat > /tmp/metric-alert-2.json << EOF
{
  "name": "🔴 CRITICAL: Production Admin Access",
  "queryType": 0,
  "dataset": "events",
  "query": "message:\"production\" event.type:error",
  "aggregate": "count()",
  "timeWindow": 1,
  "triggers": [
    {
      "label": "critical",
      "alertThreshold": 1,
      "actions": [
        {
          "type": "email",
          "targetType": "team",
          "targetIdentifier": "1"
        }
      ]
    }
  ],
  "resolveThreshold": 0,
  "thresholdType": 0,
  "eventTypes": [
    "error"
  ],
  "comparisonDelta": null,
  "projects": [
    "$PROJECT_ID"
  ]
}
EOF

ALERT2=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/metric-alert-2.json \
  "https://sentry.io/api/0/organizations/$ORG_SLUG/alert-rules/")

if echo "$ALERT2" | jq -e '.id' > /dev/null 2>&1; then
  echo "  ✓ Created (ID: $(echo "$ALERT2" | jq -r '.id'))"
else
  echo "  ℹ️  Response: $(echo "$ALERT2" | jq -c '.')"
fi

rm -f /tmp/metric-alert-*.json

echo ""
echo "================================"
echo "Note: Metric Alerts vs Issue Alerts"
echo "================================"
echo ""
echo "Metric alerts may not be available on all Sentry plans."
echo "If you got errors above, let's try the simpler approach:"
echo ""
echo "MANUAL SETUP (Recommended):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to: https://sentry.io/organizations/$ORG_SLUG/alerts/rules/"
echo ""
echo "2. Click 'Create Alert Rule'"
echo ""
echo "3. Choose 'Issues'"
echo ""
echo "4. Configure:"
echo "   Name: Brute Force Detection"
echo "   When: An event is seen"
echo "   If: ALL of these conditions are met:"
echo "       - The issue's title contains 'Admin access denied'"
echo "   Then: Send a notification to Team"
echo "   Frequency: Alert on every new issue"
echo ""
echo "5. Save the alert"
echo ""
echo "6. Test by running: ./scripts/test-security-alerts.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
