#!/bin/bash
# Daily Budget Check
# Alerts when daily AI costs exceed threshold

USAGE_FILE="$HOME/.claude/usage/ai-usage.csv"
DAILY_LIMIT=10.00
TODAY=$(date +%Y-%m-%d)

if [[ ! -f "$USAGE_FILE" ]]; then
  echo "ℹ️  No usage data yet"
  exit 0
fi

DAILY_COST=$(awk -F, -v date="$TODAY" '$1 ~ date {sum+=$4} END {printf "%.2f", sum}' "$USAGE_FILE")

if (( $(echo "$DAILY_COST > $DAILY_LIMIT" | bc -l) )); then
  echo "⚠️  BUDGET ALERT: Daily cost (\$$DAILY_COST) exceeds limit (\$$DAILY_LIMIT)"
  echo ""
  echo "Recommendations:"
  echo "  1. Switch to Sonnet model (60% cheaper)"
  echo "  2. Batch similar tasks together"
  echo "  3. Use Haiku for simple fixes (75% cheaper)"
  echo ""
  exit 1
else
  PCT=$(echo "scale=1; ($DAILY_COST / $DAILY_LIMIT) * 100" | bc)
  echo "✓ Daily budget OK: \$$DAILY_COST / \$$DAILY_LIMIT (${PCT}%)"

  if (( $(echo "$PCT > 80" | bc -l) )); then
    echo "⚠️  Approaching limit - consider cost optimization"
  fi
fi
