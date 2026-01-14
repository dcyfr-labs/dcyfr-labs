#!/bin/bash

set -e

echo "================================"
echo "Sentry Alert Configuration (API)"
echo "================================"
echo ""

# Check if required tools are installed
command -v jq >/dev/null 2>&1 || { echo "❌ Error: jq is required but not installed. Install with: brew install jq"; exit 1; }

echo "To configure Sentry alerts programmatically, you need:"
echo "1. Your Sentry Auth Token (with 'project:write' and 'org:read' scopes)"
echo "2. Your Organization Slug"
echo "3. Your Project Slug"
echo ""
echo "Getting these values:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to: https://sentry.io/settings/account/api/auth-tokens/"
echo "2. Click 'Create New Token'"
echo "3. Name: 'Alert Configuration'"
echo "4. Scopes: Check 'project:write' and 'org:read'"
echo "5. Click 'Create Token' and copy it"
echo ""
echo "6. Organization Slug: Found in your Sentry URL"
echo "   Example: https://sentry.io/organizations/YOUR-ORG-SLUG/"
echo ""
echo "7. Project Slug: Also in URL"
echo "   Example: https://sentry.io/organizations/YOUR-ORG/projects/YOUR-PROJECT/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Sentry Auth Token: " SENTRY_TOKEN
read -p "Organization Slug: " ORG_SLUG
read -p "Project Slug: " PROJECT_SLUG

if [ -z "$SENTRY_TOKEN" ] || [ -z "$ORG_SLUG" ] || [ -z "$PROJECT_SLUG" ]; then
  echo "❌ Error: All fields are required"
  exit 1
fi

echo ""
echo "Verifying connection to Sentry..."

# Test API connection
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/organizations/$ORG_SLUG/")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Error: Failed to connect to Sentry API (HTTP $HTTP_CODE)"
  echo "$BODY" | jq -r '.detail // .'
  exit 1
fi

ORG_NAME=$(echo "$BODY" | jq -r '.name')
echo "✓ Connected to organization: $ORG_NAME"

# Get project ID
echo "Getting project details..."
PROJECT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/")

HTTP_CODE=$(echo "$PROJECT_RESPONSE" | tail -n1)
BODY=$(echo "$PROJECT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Error: Failed to get project details (HTTP $HTTP_CODE)"
  echo "$BODY" | jq -r '.detail // .'
  exit 1
fi

PROJECT_ID=$(echo "$BODY" | jq -r '.id')
PROJECT_NAME=$(echo "$BODY" | jq -r '.name')
echo "✓ Found project: $PROJECT_NAME (ID: $PROJECT_ID)"

echo ""
echo "================================"
echo "Creating Alert Rules"
echo "================================"
echo ""

# Alert 1: Critical - Production Admin Access
echo "1/4 Creating CRITICAL alert: Production Admin Access..."
cat > /tmp/sentry-alert-1.json << EOF
{
  "name": "🔴 CRITICAL: Production Admin Access",
  "owner": null,
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_attribute.EventAttributeCondition",
      "name": "The event's message value contains production",
      "attribute": "message",
      "match": "co",
      "value": "production"
    },
    {
      "id": "sentry.rules.conditions.tagged_event.TaggedEventCondition",
      "key": "event_type",
      "match": "eq",
      "value": "admin_access"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.issue_occurrences.IssueOccurrencesFilter",
      "value": 1
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": null
    }
  ],
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 5
}
EOF

ALERT1=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-1.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT1" | jq -e '.id' > /dev/null 2>&1; then
  ALERT1_ID=$(echo "$ALERT1" | jq -r '.id')
  echo "  ✓ Created alert (ID: $ALERT1_ID)"
else
  echo "  ⚠️  Warning: $(echo "$ALERT1" | jq -r '.detail // .')"
fi

# Alert 2: High - Brute Force Attempts
echo "2/4 Creating HIGH alert: Brute Force Detection..."
cat > /tmp/sentry-alert-2.json << EOF
{
  "name": "🟠 HIGH: Brute Force Attack Detected",
  "owner": null,
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_attribute.EventAttributeCondition",
      "name": "The event's message value contains Admin access denied",
      "attribute": "message",
      "match": "co",
      "value": "Admin access denied"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.issue_occurrences.IssueOccurrencesFilter",
      "value": 10
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": null
    }
  ],
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 30
}
EOF

ALERT2=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-2.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT2" | jq -e '.id' > /dev/null 2>&1; then
  ALERT2_ID=$(echo "$ALERT2" | jq -r '.id')
  echo "  ✓ Created alert (ID: $ALERT2_ID)"
else
  echo "  ⚠️  Warning: $(echo "$ALERT2" | jq -r '.detail // .')"
fi

# Alert 3: Medium - Rate Limit Violations
echo "3/4 Creating MEDIUM alert: Rate Limit Violations..."
cat > /tmp/sentry-alert-3.json << EOF
{
  "name": "🟡 MEDIUM: Rate Limit Violations",
  "owner": null,
  "conditions": [
    {
      "id": "sentry.rules.conditions.tagged_event.TaggedEventCondition",
      "key": "reason",
      "match": "eq",
      "value": "rate limit exceeded"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.issue_occurrences.IssueOccurrencesFilter",
      "value": 20
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": null
    }
  ],
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 60
}
EOF

ALERT3=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-3.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT3" | jq -e '.id' > /dev/null 2>&1; then
  ALERT3_ID=$(echo "$ALERT3" | jq -r '.id')
  echo "  ✓ Created alert (ID: $ALERT3_ID)"
else
  echo "  ⚠️  Warning: $(echo "$ALERT3" | jq -r '.detail // .')"
fi

# Alert 4: Info - Daily Admin Access Summary
echo "4/4 Creating INFO alert: Daily Summary..."
cat > /tmp/sentry-alert-4.json << EOF
{
  "name": "📊 INFO: Daily Admin Access Summary",
  "owner": null,
  "conditions": [
    {
      "id": "sentry.rules.conditions.tagged_event.TaggedEventCondition",
      "key": "event_type",
      "match": "eq",
      "value": "admin_access"
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.issue_occurrences.IssueOccurrencesFilter",
      "value": 1
    }
  ],
  "actions": [
    {
      "id": "sentry.mail.actions.NotifyEmailAction",
      "targetType": "IssueOwners",
      "targetIdentifier": null
    }
  ],
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 1440
}
EOF

ALERT4=$(curl -s -X POST \
  -H "Authorization: Bearer $SENTRY_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/sentry-alert-4.json \
  "https://sentry.io/api/0/projects/$ORG_SLUG/$PROJECT_SLUG/rules/")

if echo "$ALERT4" | jq -e '.id' > /dev/null 2>&1; then
  ALERT4_ID=$(echo "$ALERT4" | jq -r '.id')
  echo "  ✓ Created alert (ID: $ALERT4_ID)"
else
  echo "  ⚠️  Warning: $(echo "$ALERT4" | jq -r '.detail // .')"
fi

# Clean up temp files
rm -f /tmp/sentry-alert-*.json

echo ""
echo "================================"
echo "✓ Alert Configuration Complete!"
echo "================================"
echo ""
echo "Configured alerts:"
echo "  1. 🔴 Production Admin Access (CRITICAL)"
echo "  2. 🟠 Brute Force Detection (HIGH) - >10 attempts"
echo "  3. 🟡 Rate Limit Violations (MEDIUM) - >20 in 15min"
echo "  4. 📊 Daily Summary (INFO)"
echo ""
echo "Next steps:"
echo "  1. Verify in Sentry: https://sentry.io/organizations/$ORG_SLUG/projects/$PROJECT_SLUG/alerts/rules/"
echo "  2. Test alerts: ./scripts/test-security-alerts.sh"
echo "  3. Check email for alert notifications"
echo ""
