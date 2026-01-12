#!/bin/bash

# check-provider-health.sh
# Verify OpenCode AI provider health and connectivity (GitHub Copilot integration)

set -euo pipefail

# Color output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏥 OpenCode Provider Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

OVERALL_STATUS="healthy"

# ============================================
# 1. GitHub Copilot Check (Primary)
# ============================================

echo -e "${BLUE}1. GitHub Copilot (Primary - Included)${NC}"

# Check if OpenCode can access GitHub Copilot models
# Note: This requires device authentication via OpenCode CLI
echo "   Authentication: Device code flow (no API key needed)"
echo "   To authenticate: opencode → /connect → GitHub Copilot"
echo ""
echo "   Expected models:"
echo "     - gpt-5-mini (16K context, 0 multiplier)"
echo "     - raptor-mini (8K context, 0 multiplier)"
echo "     - gpt-4o (128K context, 0 multiplier)"
echo ""

# We can't check GitHub Copilot directly without OpenCode CLI running
# So we just inform the user
echo -e "   ${YELLOW}ℹ️  Manual verification required${NC}"
echo "   Run: opencode → /models"
echo "   Should show: gpt-5-mini, raptor-mini, gpt-4o"

echo ""

# ============================================
# 2. Claude API Check (Optional Premium)
# ============================================

echo -e "${BLUE}2. Claude Sonnet 4 (Premium - Optional)${NC}"

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo -e "   API Key: ${YELLOW}⚠️  Not set (optional)${NC}"
  echo "   Set with: export ANTHROPIC_API_KEY=your_key_here"
  echo "   Only needed for complex/security-sensitive tasks (20% of work)"
else
  echo -e "   API Key: ${GREEN}✅ Set${NC}"
  
  # Check API connectivity
  if curl -s -f -X POST "https://api.anthropic.com/v1/messages" \
       -H "x-api-key: $ANTHROPIC_API_KEY" \
       -H "anthropic-version: 2023-06-01" \
       -H "content-type: application/json" \
       -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}' \
       > /dev/null 2>&1; then
    echo -e "   Connectivity: ${GREEN}✅ Connected${NC}"
    echo "   Model: claude-sonnet-4 (200K context, 1x multiplier)"
  else
    echo -e "   Connectivity: ${RED}❌ Failed${NC}"
    echo "   Check API key validity or rate limits"
  fi
fi

echo ""

# ============================================
# 3. OpenCode CLI Check
# ============================================

echo -e "${BLUE}3. OpenCode CLI${NC}"

if ! command -v opencode &> /dev/null; then
  echo -e "   Installation: ${RED}❌ Not installed${NC}"
  echo "   Install VS Code extension: sst-dev.opencode"
  OVERALL_STATUS="unhealthy"
else
  echo -e "   Installation: ${GREEN}✅ Installed${NC}"
  
  # Check version
  VERSION=$(opencode --version 2>/dev/null || echo "unknown")
  echo "   Version: $VERSION"
fi

echo ""

# ============================================
# 4. Configuration Check
# ============================================

echo -e "${BLUE}4. Configuration${NC}"

# Check config file
if [[ ! -f .opencode/config.json ]]; then
  echo -e "   Config File: ${RED}❌ Missing${NC}"
  echo "   Expected location: .opencode/config.json"
  OVERALL_STATUS="unhealthy"
else
  echo -e "   Config File: ${GREEN}✅ Exists${NC}"
  
  # Validate JSON
  if command -v jq &> /dev/null; then
    if jq . .opencode/config.json > /dev/null 2>&1; then
      echo -e "   JSON Valid: ${GREEN}✅ Valid${NC}"
      
      # Check for GitHub Copilot presets
      if jq -e '.presets["dcyfr-feature"]' .opencode/config.json > /dev/null 2>&1; then
        echo -e "   Preset (dcyfr-feature): ${GREEN}✅ Configured${NC}"
      else
        echo -e "   Preset (dcyfr-feature): ${YELLOW}⚠️  Missing${NC}"
      fi
      
      if jq -e '.presets["dcyfr-quick"]' .opencode/config.json > /dev/null 2>&1; then
        echo -e "   Preset (dcyfr-quick): ${GREEN}✅ Configured${NC}"
      else
        echo -e "   Preset (dcyfr-quick): ${YELLOW}⚠️  Missing${NC}"
      fi
    else
      echo -e "   JSON Valid: ${RED}❌ Invalid${NC}"
      OVERALL_STATUS="unhealthy"
    fi
  else
    echo -e "   JSON Valid: ${YELLOW}⚠️  Cannot verify (jq not installed)${NC}"
  fi
fi

echo ""

# ============================================
# 5. Environment Variables
# ============================================

echo -e "${BLUE}5. Environment Variables${NC}"

# GitHub Copilot uses device authentication (no API key needed)
echo "   GitHub Copilot: Device authentication (no env var needed)"

# Claude is optional
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo -e "   ANTHROPIC_API_KEY: ${GREEN}✅ Set (optional)${NC}"
else
  echo -e "   ANTHROPIC_API_KEY: ${YELLOW}⚠️  Not set (optional)${NC}"
fi

# Check .env.local
if [[ -f .env.local ]]; then
  echo -e "   .env.local: ${GREEN}✅ Exists${NC}"
else
  echo -e "   .env.local: ${YELLOW}⚠️  Missing (optional)${NC}"
  echo "   Copy from: .env.example"
fi

echo ""

# ============================================
# Summary
# ============================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ "$OVERALL_STATUS" == "healthy" ]]; then
  echo -e "${GREEN}✅ OPENCODE READY${NC}"
  echo ""
  echo "You can use:"
  echo "  - GitHub Copilot (included): opencode --preset dcyfr-feature"
  echo "  - GitHub Copilot (fast): opencode --preset dcyfr-quick"
  if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "  - Claude Sonnet (premium): Switch via /connect in OpenCode"
  fi
  echo ""
  echo "Next steps:"
  echo "  1. Launch OpenCode: opencode"
  echo "  2. Connect to GitHub Copilot: /connect → GitHub Copilot"
  echo "  3. Verify models: /models"
  echo ""
  exit 0
else
  echo -e "${RED}❌ OPENCODE NOT READY${NC}"
  echo ""
  echo "Critical issues found. Fix the following:"
  echo ""
  
  if ! command -v opencode &> /dev/null; then
    echo "  1. Install OpenCode extension:"
    echo "     code --install-extension sst-dev.opencode"
    echo ""
  fi
  
  if [[ ! -f .opencode/config.json ]]; then
    echo "  2. Config file missing:"
    echo "     Ensure .opencode/config.json exists"
    echo ""
  fi
  
  echo "After fixes:"
  echo "  1. Run: npm run opencode:health"
  echo "  2. Authenticate: opencode → /connect → GitHub Copilot"
  echo "  3. Test: opencode --preset dcyfr-feature"
  echo ""
  exit 1
fi
