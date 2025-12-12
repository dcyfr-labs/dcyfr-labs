#!/bin/bash

echo "================================"
echo "Sentry DSN Configuration"
echo "================================"
echo ""
echo "To enable Sentry logging, you need to add your Sentry DSN."
echo ""
echo "Steps:"
echo "1. Go to: https://sentry.io"
echo "2. Navigate to: Your Project → Settings → Client Keys (DSN)"
echo "3. Copy the DSN (looks like: https://abc123@o123456.ingest.sentry.io/987654)"
echo ""
echo -n "Paste your Sentry DSN here: "
read -r SENTRY_DSN

if [ -z "$SENTRY_DSN" ]; then
  echo "❌ No DSN provided. Exiting."
  exit 1
fi

# Validate DSN format
if [[ ! "$SENTRY_DSN" =~ ^https://.*@.*\.ingest\.sentry\.io/.* ]]; then
  echo "⚠️  Warning: DSN format doesn't look correct"
  echo "Expected format: https://...@...ingest.sentry.io/..."
  echo ""
  echo -n "Continue anyway? (y/n): "
  read -r CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo "Cancelled."
    exit 1
  fi
fi

# Update .env.local
echo ""
echo "Updating .env.local..."

# Backup first
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

# Update both DSN variables
sed -i.tmp "s|^SENTRY_DSN=.*|SENTRY_DSN=${SENTRY_DSN}|" .env.local
sed -i.tmp "s|^NEXT_PUBLIC_SENTRY_DSN=.*|NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}|" .env.local
rm -f .env.local.tmp

echo "✓ Sentry DSN configured!"
echo ""
echo "⚠️  IMPORTANT: Restart your dev server for changes to take effect:"
echo "   1. Stop the server (Ctrl+C)"
echo "   2. Run: npm run dev"
echo ""
echo "Then run: ./scripts/test-security-alerts.sh"
echo "Or quick test: curl -H 'x-internal-request: true' -H 'Authorization: Bearer test' http://localhost:3000/api/analytics"
