#!/bin/bash
set -e

# Nuclei Integration Validation Script
# Tests local setup before pushing to CI/CD

# Get project root (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Validating Nuclei Integration"
echo "================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
failure_count=0

check_pass() {
  echo -e "${GREEN}✅ PASS:${NC} $1"
  success_count=$((success_count + 1))
}

check_fail() {
  echo -e "${RED}❌ FAIL:${NC} $1"
  failure_count=$((failure_count + 1))
}

check_warn() {
  echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

echo "1️⃣  Checking Nuclei installation..."
if command -v nuclei &> /dev/null; then
  VERSION=$(nuclei -version 2>&1 | head -n1)
  check_pass "Nuclei installed: $VERSION"
else
  check_fail "Nuclei not found - install from https://github.com/projectdiscovery/nuclei"
  exit 1
fi
echo ""

echo "2️⃣  Checking file structure..."
cd "$PROJECT_ROOT"

# Check config file
if [ -f ".github/nuclei/config.yaml" ]; then
  check_pass "Configuration file exists"
else
  check_fail "Configuration file missing: .github/nuclei/config.yaml"
fi

# Check submodule
if [ -d ".github/nuclei/templates/community" ]; then
  COMMUNITY_COUNT=$(find .github/nuclei/templates/community -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COMMUNITY_COUNT" -gt 0 ]; then
    check_pass "Community templates loaded: $COMMUNITY_COUNT templates"
  else
    check_fail "Community templates directory empty - run 'git submodule update --init --recursive'"
  fi
else
  check_fail "Community templates submodule missing"
fi

# Check custom templates
if [ -d ".github/nuclei/templates/custom" ]; then
  CUSTOM_COUNT=$(find .github/nuclei/templates/custom -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CUSTOM_COUNT" -gt 0 ]; then
    check_pass "Custom dcyfr templates found: $CUSTOM_COUNT templates"
  else
    check_warn "No custom templates found"
  fi
else
  check_warn "Custom templates directory missing"
fi

echo ""
echo "3️⃣  Validating custom templates..."

# Validate each custom template
for template in .github/nuclei/templates/custom/*.yaml; do
  if [ -f "$template" ]; then
    TEMPLATE_NAME=$(basename "$template")
    
    # Check for required fields
    if grep -q "^id:" "$template" && \
       grep -q "^info:" "$template" && \
       grep -q "^  name:" "$template" && \
       grep -q "^  severity:" "$template" && \
       grep -q "^  author:" "$template"; then
      check_pass "$TEMPLATE_NAME has required fields"
    else
      check_fail "$TEMPLATE_NAME missing required fields (id, info, name, severity, author)"
    fi
    
    # Check syntax with nuclei
    if nuclei -validate -templates "$template" &>/dev/null; then
      check_pass "$TEMPLATE_NAME syntax valid"
    else
      check_fail "$TEMPLATE_NAME syntax invalid - run 'nuclei -validate -templates $template'"
    fi
  fi
done

echo ""
echo "4️⃣  Checking git submodule configuration..."

# Check .gitmodules
if [ -f ".gitmodules" ]; then
  if grep -q "path = .github/nuclei/templates/community" .gitmodules; then
    check_pass "Submodule registered in .gitmodules"
  else
    check_fail "Submodule not registered in .gitmodules"
  fi
else
  check_fail ".gitmodules file missing"
fi

# Check submodule version
cd .github/nuclei/templates/community 2>/dev/null || exit 1
CURRENT_VERSION=$(git describe --tags --exact-match HEAD 2>/dev/null || echo "detached")
if [[ "$CURRENT_VERSION" =~ ^v9\.[0-9]+\.[0-9]+$ ]]; then
  check_pass "Submodule pinned to stable version: $CURRENT_VERSION"
else
  check_warn "Submodule not on tagged version: $CURRENT_VERSION"
fi
cd "$PROJECT_ROOT"

echo ""
echo "5️⃣  Testing configuration file..."

# Validate config syntax
if nuclei -config .github/nuclei/config.yaml -validate &>/dev/null; then
  check_pass "Configuration syntax valid"
else
  check_fail "Configuration syntax invalid - check .github/nuclei/config.yaml"
fi

# Check severity filters
if grep -q "severity:" .github/nuclei/config.yaml; then
  SEVERITY=$(grep "severity:" .github/nuclei/config.yaml | head -1 | cut -d: -f2 | tr -d ' ')
  check_pass "Severity filter configured: $SEVERITY"
else
  check_warn "No severity filter in config"
fi

echo ""
echo "6️⃣  Checking workflow integration..."

# Check workflow file
if [ -f ".github/workflows/nuclei-scan.yml" ]; then
  check_pass "Nuclei scan workflow exists"
  
  # Check for config and templates flags
  if grep -q -- "-config .github/nuclei/config.yaml" .github/workflows/nuclei-scan.yml && \
     grep -q -- "-templates .github/nuclei/templates/" .github/workflows/nuclei-scan.yml; then
    check_pass "Workflow uses custom config and templates"
  else
    check_fail "Workflow not configured to use custom config/templates"
  fi
else
  check_fail "Nuclei scan workflow missing"
fi

# Check sync workflow
if [ -f ".github/workflows/nuclei-templates-sync.yml" ]; then
  check_pass "Template sync workflow exists"
else
  check_warn "Template sync workflow missing - templates won't auto-update"
fi

echo ""
echo "7️⃣  Testing local scan (dry-run)..."

# Start dev server in background for testing (if not running)
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  check_warn "Dev server not running on :3000 - skipping local scan test"
  check_warn "To test: npm run dev (in another terminal), then re-run this script"
else
  check_pass "Dev server running on :3000"
  
  # Run quick test scan with custom templates only
  echo "   Running test scan (custom templates only)..."
  if nuclei \
    -target http://localhost:3000 \
    -templates .github/nuclei/templates/custom/ \
    -silent \
    -no-color \
    -timeout 10 \
    -retries 1 \
    &>/dev/null; then
    check_pass "Test scan completed successfully"
  else
    check_warn "Test scan failed - may need dev server running with valid responses"
  fi
fi

echo ""
echo "================================"
echo "📊 Validation Summary"
echo "================================"
echo -e "${GREEN}✅ Passed: $success_count${NC}"
echo -e "${RED}❌ Failed: $failure_count${NC}"
echo ""

if [ $failure_count -eq 0 ]; then
  echo -e "${GREEN}✅ All critical checks passed - ready to commit!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. git add .github/nuclei/ .gitmodules .github/workflows/nuclei-*.yml package.json"
  echo "  2. git commit -m 'feat(security): integrate nuclei-templates repository'"
  echo "  3. git push"
  exit 0
else
  echo -e "${RED}❌ Some checks failed - please fix errors before committing${NC}"
  exit 1
fi
