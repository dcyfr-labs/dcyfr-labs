#!/bin/bash

# check-provider-health.sh
# Verify OpenCode AI provider health and connectivity

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
# 1. Groq API Check
# ============================================

echo -e "${BLUE}1. Groq (Free Tier)${NC}"

# Check API key
if [[ -z "${GROQ_API_KEY:-}" ]]; then
  echo -e "   API Key: ${RED}❌ Not set${NC}"
  echo "   Set with: export GROQ_API_KEY=your_key_here"
  OVERALL_STATUS="unhealthy"
else
  echo -e "   API Key: ${GREEN}✅ Set${NC}"
  
  # Check API connectivity
  if curl -s -f -H "Authorization: Bearer $GROQ_API_KEY" \
       "https://api.groq.com/openai/v1/models" > /dev/null 2>&1; then
    echo -e "   Connectivity: ${GREEN}✅ Connected${NC}"
    
    # Check available models
    MODELS=$(curl -s -H "Authorization: Bearer $GROQ_API_KEY" \
             "https://api.groq.com/openai/v1/models" | \
             grep -o '"id":"[^"]*"' | cut -d'"' -f4 || echo "")
    
    if echo "$MODELS" | grep -q "llama-3.3-70b-versatile"; then
      echo -e "   Model (llama-3.3-70b-versatile): ${GREEN}✅ Available${NC}"
    else
      echo -e "   Model (llama-3.3-70b-versatile): ${YELLOW}⚠️  Not found${NC}"
    fi
    
    if echo "$MODELS" | grep -q "llama-3.1-70b-versatile"; then
      echo -e "   Model (llama-3.1-70b-versatile): ${GREEN}✅ Available${NC}"
    else
      echo -e "   Model (llama-3.1-70b-versatile): ${YELLOW}⚠️  Not found${NC}"
    fi
    
  else
    echo -e "   Connectivity: ${RED}❌ Failed${NC}"
    echo "   Check API key validity or network connection"
    OVERALL_STATUS="unhealthy"
  fi
fi

echo ""

# ============================================
# 2. Ollama Check
# ============================================

echo -e "${BLUE}2. Ollama (Offline)${NC}"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
  echo -e "   Installation: ${YELLOW}⚠️  Not installed${NC}"
  echo "   Install with: brew install ollama (macOS)"
  OVERALL_STATUS="degraded"
else
  echo -e "   Installation: ${GREEN}✅ Installed${NC}"
  
  # Check if Ollama service is running
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "   Service: ${GREEN}✅ Running${NC}"
    
    # Check for recommended models
    MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")
    
    if echo "$MODELS" | grep -q "codellama:34b"; then
      echo -e "   Model (codellama:34b): ${GREEN}✅ Installed${NC}"
    else
      echo -e "   Model (codellama:34b): ${YELLOW}⚠️  Not installed${NC}"
      echo "   Pull with: ollama pull codellama:34b"
    fi
    
    if echo "$MODELS" | grep -q "qwen2.5-coder:7b"; then
      echo -e "   Model (qwen2.5-coder:7b): ${GREEN}✅ Installed${NC}"
    else
      echo -e "   Model (qwen2.5-coder:7b): ${YELLOW}⚠️  Not installed${NC}"
      echo "   Pull with: ollama pull qwen2.5-coder:7b"
    fi
    
  else
    echo -e "   Service: ${RED}❌ Not running${NC}"
    echo "   Start with: ollama serve"
    OVERALL_STATUS="degraded"
  fi
fi

echo ""

# ============================================
# 3. Claude API Check (Optional)
# ============================================

echo -e "${BLUE}3. Claude (Premium - Optional)${NC}"

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo -e "   API Key: ${YELLOW}⚠️  Not set (optional)${NC}"
  echo "   Set with: export ANTHROPIC_API_KEY=your_key_here"
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
  else
    echo -e "   Connectivity: ${RED}❌ Failed${NC}"
    echo "   Check API key validity or rate limits"
  fi
fi

echo ""

# ============================================
# 4. OpenCode CLI Check
# ============================================

echo -e "${BLUE}4. OpenCode CLI${NC}"

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
# 5. Configuration Check
# ============================================

echo -e "${BLUE}5. Configuration${NC}"

# Check config file
if [[ ! -f .opencode/config.json ]]; then
  echo -e "   Config File: ${RED}❌ Missing${NC}"
  echo "   Create from template: cp .opencode/config.json.template .opencode/config.json"
  OVERALL_STATUS="unhealthy"
else
  echo -e "   Config File: ${GREEN}✅ Exists${NC}"
  
  # Validate JSON
  if command -v jq &> /dev/null; then
    if jq . .opencode/config.json > /dev/null 2>&1; then
      echo -e "   JSON Valid: ${GREEN}✅ Valid${NC}"
      
      # Count presets
      PRESETS=$(jq 'keys | length' .opencode/config.json)
      echo "   Presets: $PRESETS configured"
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
# 6. Environment Variables
# ============================================

echo -e "${BLUE}6. Environment Variables${NC}"

# Check for required variables
if [[ -n "${GROQ_API_KEY:-}" ]]; then
  echo -e "   GROQ_API_KEY: ${GREEN}✅ Set${NC}"
else
  echo -e "   GROQ_API_KEY: ${RED}❌ Missing${NC}"
  OVERALL_STATUS="unhealthy"
fi

if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo -e "   ANTHROPIC_API_KEY: ${GREEN}✅ Set (optional)${NC}"
else
  echo -e "   ANTHROPIC_API_KEY: ${YELLOW}⚠️  Not set (optional)${NC}"
fi

# Check .env.local
if [[ -f .env.local ]]; then
  echo -e "   .env.local: ${GREEN}✅ Exists${NC}"
else
  echo -e "   .env.local: ${YELLOW}⚠️  Missing${NC}"
  echo "   Copy from: .env.example"
fi

echo ""

# ============================================
# Summary
# ============================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ "$OVERALL_STATUS" == "healthy" ]]; then
  echo -e "${GREEN}✅ ALL PROVIDERS HEALTHY${NC}"
  echo ""
  echo "You can use:"
  echo "  - Groq (free tier): opencode --preset groq_primary"
  echo "  - Ollama (offline): opencode --preset offline_primary"
  if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "  - Claude (premium): opencode --preset claude"
  fi
  echo ""
  exit 0
elif [[ "$OVERALL_STATUS" == "degraded" ]]; then
  echo -e "${YELLOW}⚠️  PROVIDERS DEGRADED${NC}"
  echo ""
  echo "Some providers unavailable, but fallbacks exist:"
  
  if [[ -n "${GROQ_API_KEY:-}" ]]; then
    echo "  ✅ Groq available (free tier)"
  else
    echo "  ❌ Groq unavailable (set GROQ_API_KEY)"
  fi
  
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  ✅ Ollama available (offline)"
  else
    echo "  ⚠️  Ollama unavailable (start service)"
  fi
  
  if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "  ✅ Claude available (premium)"
  else
    echo "  ⚠️  Claude unavailable (optional)"
  fi
  
  echo ""
  exit 0
else
  echo -e "${RED}❌ PROVIDERS UNHEALTHY${NC}"
  echo ""
  echo "Critical issues found. Fix the following:"
  echo ""
  
  if [[ -z "${GROQ_API_KEY:-}" ]]; then
    echo "  1. Set GROQ_API_KEY:"
    echo "     export GROQ_API_KEY=your_key_here"
    echo "     Or add to .env.local"
    echo ""
  fi
  
  if [[ ! -f .opencode/config.json ]]; then
    echo "  2. Create config file:"
    echo "     cp .opencode/config.json.template .opencode/config.json"
    echo ""
  fi
  
  if ! command -v opencode &> /dev/null; then
    echo "  3. Install OpenCode extension:"
    echo "     code --install-extension sst-dev.opencode"
    echo ""
  fi
  
  echo "Run this script again after fixes: scripts/check-provider-health.sh"
  echo ""
  exit 1
fi
