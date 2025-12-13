#!/bin/bash

set -e

echo "================================"
echo "Sentry Alert Fix (Updated API)"
echo "================================"
echo ""
echo "Sentry has deprecated the old 'conditions' API."
echo "This script will DELETE old alerts and create new ones using the current API."
echo ""

read -p "Sentry Auth Token: " SENTRY_TOKEN
read -p "Organization Slug: " ORG_SLUG
read -p "Project Slug: " PROJECT_SLUG

if [ -z "$SENTRY_TOKEN" ] || [ -z "$ORG_SLUG" ] || [ -z "$PROJECT_SLUG" ]; then
  echo "❌ Error: All fields are required"
  exit 1
fi

echo ""
echo "Step 1: Getting existing alert rules..."

RULES=$(curl -s \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

echo "$RULES" | jq -r '.[] | "  • \(.name) (ID: \(.id))"'

echo ""
read -p "Delete all existing alerts and recreate? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Step 2: Deleting old alerts..."

echo "$RULES" | jq -r '.[].id' | while read RULE_ID; do
  echo "  Deleting rule $RULE_ID..."
  curl -s -X DELETE \
    -H "Authorization: Bearer $SENTRY_TOKEN" \
    "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/$RULE_ID/" \
    > /dev/null
done

echo "✓ Old alerts deleted"

echo ""
echo "Step 3: Creating new alerts with current API..."
echo ""

# Alert 1: Critical - Production Access (using filters only)
echo "1/4 Creating CRITICAL alert: Production Admin Access..."
cat > /tmp/sentry-alert-1.json << 'EOF'
{
  "name": "🔴 CRITICAL: Production Admin Access",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 5,
  "conditions": [
    {
      "id": "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.event_attribute.EventAttributeFilter",
      "attribute": "message",
      "match": "co",
      "value": "production"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners"
    }
  ]
}
EOF

ALERT1=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-1.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT1" | jq -e '.id' > /dev/null 2>&1; then
  echo "  ✓ Created (ID: $(echo "$ALERT1" | jq -r '.id'))"
else
  echo "  ❌ Error: $(echo "$ALERT1" | jq -r '.detail // .conditions[0] // .')"
fi

# Alert 2: High - Brute Force (frequency-based)
echo "2/4 Creating HIGH alert: Brute Force Detection..."
cat > /tmp/sentry-alert-2.json << 'EOF'
{
  "name": "🟠 HIGH: Brute Force Attack Detected",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 30,
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "value": 10,
      "interval": "5m"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.event_attribute.EventAttributeFilter",
      "attribute": "message",
      "match": "co",
      "value": "Admin access denied"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners"
    }
  ]
}
EOF

ALERT2=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-2.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT2" | jq -e '.id' > /dev/null 2>&1; then
  echo "  ✓ Created (ID: $(echo "$ALERT2" | jq -r '.id'))"
else
  echo "  ❌ Error: $(echo "$ALERT2" | jq -r '.detail // .conditions[0] // .')"
fi

# Alert 3: Medium - Rate Limits
echo "3/4 Creating MEDIUM alert: Rate Limit Violations..."
cat > /tmp/sentry-alert-3.json << 'EOF'
{
  "name": "🟡 MEDIUM: Rate Limit Violations",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 60,
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "value": 20,
      "interval": "15m"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.tagged_event.TaggedEventFilter",
      "key": "reason",
      "match": "eq",
      "value": "rate limit exceeded"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners"
    }
  ]
}
EOF

ALERT3=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-3.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT3" | jq -e '.id' > /dev/null 2>&1; then
  echo "  ✓ Created (ID: $(echo "$ALERT3" | jq -r '.id'))"
else
  echo "  ❌ Error: $(echo "$ALERT3" | jq -r '.detail // .conditions[0] // .')"
fi

# Alert 4: Info - All Admin Access
echo "4/4 Creating INFO alert: Admin Access Monitoring..."
cat > /tmp/sentry-alert-4.json << 'EOF'
{
  "name": "📊 INFO: Admin Access Activity",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 1440,
  "conditions": [
    {
      "id": "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.event_attribute.EventAttributeFilter",
      "attribute": "message",
      "match": "co",
      "value": "Admin access"
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners"
    }
  ]
}
EOF

ALERT4=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-4.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT4" | jq -e '.id' > /dev/null 2>&1; then
  echo "  ✓ Created (ID: $(echo "$ALERT4" | jq -r '.id'))"
else
  echo "  ❌ Error: $(echo "$ALERT4" | jq -r '.detail // .conditions[0] // .')"
fi

# Clean up
rm -f /tmp/sentry-alert-*.json

echo ""
echo "================================"
echo "✓ Alert Configuration Complete!"
echo "================================"
echo ""
echo "Configured alerts:"
echo "  1. 🔴 Production Admin Access (immediate)"
echo "  2. 🟠 Brute Force Detection (>10 in 5min)"
echo "  3. 🟡 Rate Limit Violations (>20 in 15min)"
echo "  4. 📊 Admin Access Activity (new issues only)"
echo ""
echo "View alerts:"
echo "  https://sentry.io/organizations/$ORG_SLUG/projects/$PROJECT_SLUG/alerts/rules/"
echo ""
echo "Test alerts:"
echo "  ./scripts/test-security-alerts.sh"
echo ""
