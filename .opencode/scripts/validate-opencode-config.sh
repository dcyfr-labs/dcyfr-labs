#!/usr/bin/env bash
# OpenCode Configuration Validator
# Validates opencode.json, MCPs, and skills

set -euo pipefail

echo "🔍 OpenCode Configuration Validation"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Helper functions
pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((PASS++))
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((FAIL++))
}

warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
  ((WARN++))
}

info() {
  echo "ℹ️  $1"
}

# 1. Check opencode.json exists
echo "1. Checking opencode.json..."
if [ -f "opencode.json" ]; then
  pass "opencode.json exists in project root"
else
  fail "opencode.json not found in project root"
fi

# 2. Validate JSON syntax
echo ""
echo "2. Validating JSON syntax..."
if command -v jq &> /dev/null; then
  if jq empty opencode.json 2>/dev/null; then
    pass "opencode.json has valid JSON syntax"
  else
    fail "opencode.json has invalid JSON syntax"
  fi
else
  warn "jq not installed, skipping JSON validation"
fi

# 3. Check MCP servers count
echo ""
echo "3. Checking MCP servers..."
if command -v jq &> /dev/null; then
  MCP_COUNT=$(jq '.mcp | length' opencode.json 2>/dev/null || echo "0")
  if [ "$MCP_COUNT" -gt 0 ]; then
    pass "Found $MCP_COUNT MCP servers configured"
  else
    fail "No MCP servers configured"
  fi
else
  warn "jq not installed, skipping MCP count check"
fi

# 4. Check skills directory
echo ""
echo "4. Checking skills directory..."
if [ -d ".opencode/skill" ]; then
  pass ".opencode/skill directory exists"
  
  # Count skills
  SKILL_COUNT=$(find .opencode/skill -name "SKILL.md" | wc -l | tr -d ' ')
  if [ "$SKILL_COUNT" -gt 0 ]; then
    pass "Found $SKILL_COUNT skills configured"
  else
    fail "No skills found (.opencode/skill/*/SKILL.md)"
  fi
else
  fail ".opencode/skill directory not found"
fi

# 5. Validate skill frontmatter
echo ""
echo "5. Validating skill frontmatter..."
for skill in .opencode/skill/*/SKILL.md; do
  if [ -f "$skill" ]; then
    skill_name=$(basename "$(dirname "$skill")")
    
    # Check for frontmatter delimiters
    if grep -q "^---$" "$skill"; then
      pass "$skill_name: Has frontmatter"
      
      # Check for required fields
      if grep -q "^name:" "$skill"; then
        pass "$skill_name: Has 'name' field"
      else
        fail "$skill_name: Missing 'name' field in frontmatter"
      fi
      
      if grep -q "^description:" "$skill"; then
        pass "$skill_name: Has 'description' field"
      else
        fail "$skill_name: Missing 'description' field in frontmatter"
      fi
    else
      fail "$skill_name: No frontmatter found"
    fi
  fi
done

# 6. Check agent instructions
echo ""
echo "6. Checking agent instructions..."
if [ -f ".opencode/DCYFR.opencode.md" ]; then
  pass "DCYFR.opencode.md exists"
else
  warn "DCYFR.opencode.md not found"
fi

# 7. Check for legacy config
echo ""
echo "7. Checking for legacy config..."
if [ -f ".opencode/config.json" ]; then
  warn "Legacy .opencode/config.json found (superseded by opencode.json)"
else
  pass "No legacy .opencode/config.json"
fi

# Summary
echo ""
echo "======================================"
echo "📊 Validation Summary"
echo "======================================"
echo -e "${GREEN}PASS: $PASS${NC}"
echo -e "${YELLOW}WARN: $WARN${NC}"
echo -e "${RED}FAIL: $FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}✅ OpenCode configuration is valid!${NC}"
  exit 0
else
  echo -e "${RED}❌ OpenCode configuration has errors. Please fix and re-run.${NC}"
  exit 1
fi
