#!/bin/bash
# Cost Dashboard
# View AI usage costs by model, day, and session

echo "======================================"
echo "     AI COST DASHBOARD"
echo "======================================"
echo ""

USAGE_FILE="$HOME/.claude/usage/ai-usage.csv"

if [[ ! -f "$USAGE_FILE" ]]; then
  echo "❌ No usage data found"
  echo "   Run some Claude Code sessions first"
  exit 1
fi

# This month
MONTH=$(date +%Y-%m)
MONTHLY_COST=$(awk -F, -v month="$MONTH" '$1 ~ month {sum+=$4} END {printf "%.2f", sum}' "$USAGE_FILE")
echo "📊 This Month (${MONTH}): \$$MONTHLY_COST"

# Monthly budget check
MONTHLY_BUDGET=200.00
USAGE_PCT=$(echo "scale=1; ($MONTHLY_COST / $MONTHLY_BUDGET) * 100" | bc)
echo "   Budget: $${MONTHLY_BUDGET} (${USAGE_PCT}% used)"

# Today
TODAY=$(date +%Y-%m-%d)
DAILY_COST=$(awk -F, -v date="$TODAY" '$1 ~ date {sum+=$4} END {printf "%.2f", sum}' "$USAGE_FILE")
echo ""
echo "📅 Today (${TODAY}): \$$DAILY_COST"

# This week
WEEK_START=$(date -v-7d +%Y-%m-%d)
WEEKLY_COST=$(awk -F, -v start="$WEEK_START" '$1 >= start {sum+=$4} END {printf "%.2f", sum}' "$USAGE_FILE")
echo "📆 Last 7 Days: \$$WEEKLY_COST"

echo ""
echo "======================================"
echo "     BY MODEL"
echo "======================================"

awk -F, 'NR>1 {model[$2]+=$4; count[$2]++} END {
  for (m in model) {
    printf "%-20s $%-8.2f (%d sessions)\n", m, model[m], count[m]
  }
}' "$USAGE_FILE" | sort -k2 -rn

echo ""
echo "======================================"
echo "     TOP 10 EXPENSIVE SESSIONS"
echo "======================================"

sort -t, -k4 -rn "$USAGE_FILE" | head -11 | tail -10 | awk -F, '{
  split($1, dt, "T")
  split(dt[2], time, ":")
  date_time = dt[1] " " time[1] ":" time[2]
  printf "%-18s  $%-6s  %-20s  %s turns\n", date_time, $4, $2, $6
}'

echo ""
echo "======================================"
echo "     DAILY TREND (Last 7 Days)"
echo "======================================"

for i in {6..0}; do
  DAY=$(date -v-${i}d +%Y-%m-%d)
  DAY_COST=$(awk -F, -v date="$DAY" '$1 ~ date {sum+=$4} END {printf "%.2f", sum}' "$USAGE_FILE")
  DAY_SHORT=$(date -v-${i}d +%m/%d)

  # Create simple bar chart
  BARS=$(echo "scale=0; $DAY_COST * 2" | bc | sed 's/\..*$//')
  BAR_CHART=$(printf '█%.0s' $(seq 1 ${BARS} 2>/dev/null))

  printf "%-6s  $%-6s  %s\n" "$DAY_SHORT" "$DAY_COST" "$BAR_CHART"
done

echo ""
echo "======================================"
echo "     MCP SERVER USAGE"
echo "======================================"

if [[ -f "$HOME/.claude/bash-command-log.txt" ]]; then
  echo "Perplexity:  $(grep -c "mcp_perplexity" "$HOME/.claude/bash-command-log.txt" 2>/dev/null || echo 0) calls this month"
  echo "Context7:    $(grep -c "mcp_context7" "$HOME/.claude/bash-command-log.txt" 2>/dev/null || echo 0) calls this month"
  echo "Octocode:    $(grep -c "mcp_octocode" "$HOME/.claude/bash-command-log.txt" 2>/dev/null || echo 0) calls this month"
else
  echo "No MCP usage data available"
fi

echo ""
echo "======================================"
echo "Run 'npm run cost:export' for CSV export"
echo "Run 'npm run cost:check' for budget alerts"
echo "======================================"
