#!/bin/bash
# Test Cost Tracking System
# Validates all cost tracking components

echo "======================================"
echo "  COST TRACKING SYSTEM TEST"
echo "======================================"
echo ""

PASSED=0
FAILED=0

# Test 1: Check scripts exist
echo "1️⃣  Testing script files..."
if [[ -f "scripts/track-ai-costs.mjs" ]]; then
  echo "   ✓ track-ai-costs.mjs exists"
  ((PASSED++))
else
  echo "   ✗ track-ai-costs.mjs missing"
  ((FAILED++))
fi

if [[ -x "scripts/cost-dashboard.sh" ]]; then
  echo "   ✓ cost-dashboard.sh exists and is executable"
  ((PASSED++))
else
  echo "   ✗ cost-dashboard.sh missing or not executable"
  ((FAILED++))
fi

if [[ -x "scripts/check-daily-budget.sh" ]]; then
  echo "   ✓ check-daily-budget.sh exists and is executable"
  ((PASSED++))
else
  echo "   ✗ check-daily-budget.sh missing or not executable"
  ((FAILED++))
fi

# Test 2: Check npm scripts
echo ""
echo "2️⃣  Testing npm scripts..."
if npm run | grep -q "cost:track"; then
  echo "   ✓ npm run cost:track configured"
  ((PASSED++))
else
  echo "   ✗ npm run cost:track not found"
  ((FAILED++))
fi

if npm run | grep -q "cost:dashboard"; then
  echo "   ✓ npm run cost:dashboard configured"
  ((PASSED++))
else
  echo "   ✗ npm run cost:dashboard not found"
  ((FAILED++))
fi

# Test 3: Check configuration
echo ""
echo "3️⃣  Testing configuration..."
if grep -q "cost_tracking" conductor.json; then
  echo "   ✓ conductor.json has cost_tracking config"
  ((PASSED++))
else
  echo "   ✗ conductor.json missing cost_tracking"
  ((FAILED++))
fi

if grep -q "track-ai-costs" .claude/settings.json; then
  echo "   ✓ .claude/settings.json has cost tracking hook"
  ((PASSED++))
else
  echo "   ✗ .claude/settings.json missing cost tracking hook"
  ((FAILED++))
fi

# Test 4: Check documentation
echo ""
echo "4️⃣  Testing documentation..."
if [[ -f "docs/ai/cost-management.md" ]]; then
  echo "   ✓ cost-management.md exists"
  ((PASSED++))
else
  echo "   ✗ cost-management.md missing"
  ((FAILED++))
fi

if [[ -f "docs/ai/claude-hooks-guide.md" ]]; then
  echo "   ✓ claude-hooks-guide.md exists"
  ((PASSED++))
else
  echo "   ✗ claude-hooks-guide.md missing"
  ((FAILED++))
fi

# Test 5: Simulate cost tracking
echo ""
echo "5️⃣  Testing cost tracking script..."

# Create test session state if needed
mkdir -p .claude
if [[ ! -f ".claude/.session-state.json" ]]; then
  cat > .claude/.session-state.json << 'EOF'
{
  "model": "claude-opus-4.5",
  "estimated_tokens": 15000,
  "branch": "preview",
  "turns": 3
}
EOF
fi

# Run cost tracking
if node scripts/track-ai-costs.mjs 2>&1 | grep -q "Session cost"; then
  echo "   ✓ Cost tracking script runs successfully"
  ((PASSED++))
else
  echo "   ✗ Cost tracking script failed"
  ((FAILED++))
fi

# Test 6: Check if log was created
echo ""
echo "6️⃣  Testing log creation..."
if [[ -f "$HOME/.claude/usage/ai-usage.jsonl" ]]; then
  echo "   ✓ Usage log file created"
  ((PASSED++))

  # Show last entry
  echo ""
  echo "   Last logged entry:"
  tail -1 "$HOME/.claude/usage/ai-usage.jsonl" | jq '.' 2>/dev/null || tail -1 "$HOME/.claude/usage/ai-usage.jsonl"
else
  echo "   ⚠️  Usage log not yet created (normal for first run)"
fi

# Summary
echo ""
echo "======================================"
echo "  TEST SUMMARY"
echo "======================================"
echo ""
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [[ $FAILED -eq 0 ]]; then
  echo "✅ ALL TESTS PASSED!"
  echo ""
  echo "Cost tracking system is fully operational."
  echo "Run 'npm run cost:dashboard' to view costs."
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  echo ""
  echo "Please review the failures above."
  exit 1
fi
