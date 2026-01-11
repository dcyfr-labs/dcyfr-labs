#!/bin/bash

# session-handoff.sh
# Combined save + restore + validation for seamless AI model switching

set -euo pipefail

# Color output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Parse arguments
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <from-agent> <to-agent> [--provider <provider>]"
  echo ""
  echo "Example:"
  echo "  $0 claude opencode"
  echo "  $0 opencode claude"
  echo "  $0 opencode opencode --provider groq_primary"
  exit 1
fi

FROM_AGENT=$1
TO_AGENT=$2
PROVIDER=""

# Parse optional provider argument
shift 2
while [[ $# -gt 0 ]]; do
  case $1 in
    --provider)
      PROVIDER=$2
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🔄 Session Handoff: $FROM_AGENT → $TO_AGENT${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================
# Step 1: Save current agent session state
# ============================================

echo -e "${BLUE}Step 1: Saving $FROM_AGENT session state...${NC}"

if ! bash scripts/save-session-state.sh "$FROM_AGENT"; then
  echo -e "${RED}❌ Failed to save session state${NC}"
  exit 1
fi

echo ""

# ============================================
# Step 2: Git status check
# ============================================

echo -e "${BLUE}Step 2: Git status check...${NC}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
  
  MODIFIED=$(git status --porcelain | wc -l | tr -d ' ')
  echo "   $MODIFIED files modified/staged"
  echo ""
  echo "   Consider committing before switching agents:"
  echo "   git add ."
  echo "   git commit -m \"wip: switching from $FROM_AGENT to $TO_AGENT\""
  echo ""
  echo "   Or stash changes:"
  echo "   git stash push -m \"$FROM_AGENT session handoff\""
  echo ""
  
  read -p "   Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Handoff cancelled${NC}"
    exit 1
  fi
  echo ""
else
  echo -e "${GREEN}✅ Working directory clean${NC}"
  echo ""
fi

# ============================================
# Step 3: Validation status
# ============================================

echo -e "${BLUE}Step 3: Validation status...${NC}"

# TypeScript
if npm run type-check --silent > /dev/null 2>&1; then
  echo -e "   TypeScript: ${GREEN}✅ pass${NC}"
else
  echo -e "   TypeScript: ${RED}❌ errors${NC}"
fi

# ESLint
if npm run lint --silent > /dev/null 2>&1; then
  echo -e "   ESLint: ${GREEN}✅ pass${NC}"
else
  echo -e "   ESLint: ${YELLOW}⚠️  violations${NC}"
fi

# Tests
if npm run test:run --silent > /dev/null 2>&1; then
  echo -e "   Tests: ${GREEN}✅ pass${NC}"
else
  echo -e "   Tests: ${YELLOW}⚠️  failures${NC}"
fi

echo ""

# ============================================
# Step 4: Restore target agent session state
# ============================================

echo -e "${BLUE}Step 4: Restoring $TO_AGENT session state...${NC}"

# If switching from OpenCode to OpenCode with different provider,
# update the provider in session state
if [[ "$FROM_AGENT" == "opencode" ]] && [[ "$TO_AGENT" == "opencode" ]] && [[ -n "$PROVIDER" ]]; then
  if command -v jq &> /dev/null; then
    SESSION_FILE=".opencode/.session-state.json"
    if [[ -f "$SESSION_FILE" ]]; then
      jq --arg provider "$PROVIDER" '.provider = $provider' "$SESSION_FILE" > "${SESSION_FILE}.tmp"
      mv "${SESSION_FILE}.tmp" "$SESSION_FILE"
    fi
  fi
fi

# Try to restore from target agent (may not exist yet)
if bash scripts/restore-session-state.sh "$TO_AGENT" 2>/dev/null; then
  echo ""
else
  # If target agent session doesn't exist, use FROM agent session
  echo -e "${YELLOW}⚠️  No session state found for $TO_AGENT${NC}"
  echo "   Using session state from $FROM_AGENT instead"
  echo ""
  
  # Copy FROM session to TO session
  if [[ -f ".$FROM_AGENT/.session-state.json" ]]; then
    mkdir -p ".$TO_AGENT"
    cp ".$FROM_AGENT/.session-state.json" ".$TO_AGENT/.session-state.json"
    
    # Update agent field in copied session
    if command -v jq &> /dev/null; then
      jq --arg agent "$TO_AGENT" '.agent = $agent' ".$TO_AGENT/.session-state.json" > ".$TO_AGENT/.session-state.json.tmp"
      mv ".$TO_AGENT/.session-state.json.tmp" ".$TO_AGENT/.session-state.json"
      
      # Update provider if specified
      if [[ -n "$PROVIDER" ]]; then
        jq --arg provider "$PROVIDER" '.provider = $provider' ".$TO_AGENT/.session-state.json" > ".$TO_AGENT/.session-state.json.tmp"
        mv ".$TO_AGENT/.session-state.json.tmp" ".$TO_AGENT/.session-state.json"
      fi
    fi
    
    # Display the session
    bash scripts/restore-session-state.sh "$TO_AGENT"
    echo ""
  fi
fi

# ============================================
# Step 5: Handoff complete
# ============================================

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ Handoff complete!${NC}"
echo ""

# Determine FROM and TO providers
FROM_PROVIDER="unknown"
TO_PROVIDER="unknown"

if [[ -f ".$FROM_AGENT/.session-state.json" ]] && command -v jq &> /dev/null; then
  FROM_PROVIDER=$(jq -r '.provider // "unknown"' ".$FROM_AGENT/.session-state.json")
fi

if [[ -f ".$TO_AGENT/.session-state.json" ]] && command -v jq &> /dev/null; then
  TO_PROVIDER=$(jq -r '.provider // "unknown"' ".$TO_AGENT/.session-state.json")
fi

# Override TO_PROVIDER if specified in arguments
if [[ -n "$PROVIDER" ]]; then
  TO_PROVIDER="$PROVIDER"
fi

echo -e "${BLUE}Ready to continue in $TO_AGENT${NC}"

# Provide next command based on target agent
if [[ "$TO_AGENT" == "opencode" ]]; then
  if [[ -n "$PROVIDER" ]]; then
    echo "   Run: opencode --preset $PROVIDER"
  else
    echo "   Run: opencode --preset ${TO_PROVIDER}"
  fi
elif [[ "$TO_AGENT" == "claude" ]]; then
  echo "   Open Claude Code in VS Code or Claude.ai"
elif [[ "$TO_AGENT" == "copilot" ]]; then
  echo "   Use GitHub Copilot in VS Code (inline suggestions)"
fi

echo ""
echo -e "${BLUE}📝 Handoff Summary:${NC}"
echo "   From: $FROM_AGENT ($FROM_PROVIDER)"
echo "   To: $TO_AGENT ($TO_PROVIDER)"

# Detect handoff reason based on providers
if [[ "$FROM_PROVIDER" == *"claude"* ]] && [[ "$TO_PROVIDER" == *"groq"* ]]; then
  echo "   Reason: Rate limit / cost optimization"
elif [[ "$FROM_PROVIDER" == *"groq"* ]] && [[ "$TO_PROVIDER" == *"claude"* ]]; then
  echo "   Reason: Escalation (complex task)"
elif [[ "$FROM_PROVIDER" == *"offline"* ]] && [[ "$TO_PROVIDER" == *"groq"* ]]; then
  echo "   Reason: Back online (validation needed)"
else
  echo "   Reason: Task handoff"
fi

# Show files in progress from session state
if [[ -f ".$TO_AGENT/.session-state.json" ]] && command -v jq &> /dev/null; then
  FILES_MODIFIED=$(jq -r '.context.files_modified[]?' ".$TO_AGENT/.session-state.json" 2>/dev/null | wc -l || echo "0")
  FILES_MODIFIED=$(echo "$FILES_MODIFIED" | tr -d ' ')
  
  if [[ "$FILES_MODIFIED" -gt 0 ]]; then
    echo "   Files in progress: $FILES_MODIFIED"
  fi
  
  # Show next action from next_steps
  NEXT_STEP=$(jq -r '.context.next_steps[0]?' ".$TO_AGENT/.session-state.json" 2>/dev/null || echo "")
  if [[ -n "$NEXT_STEP" ]]; then
    echo "   Next action: $NEXT_STEP"
  fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
