#!/bin/bash
# Security Alerts Testing Script
# Purpose: Validate Sentry and Axiom security alerts are working correctly
# Date: December 11, 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
ADMIN_API_KEY="${ADMIN_API_KEY:-test_key_from_env}"
DELAY=2  # Delay between requests (seconds)

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Security Alerts Testing Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Target: ${GREEN}$BASE_URL${NC}"
echo -e "Testing Sentry + Axiom integration"
echo ""

# Helper function to make requests
make_request() {
    local endpoint=$1
    local auth_header=$2
    local description=$3

    echo -e "${YELLOW}Test:${NC} $description"

    if [ -z "$auth_header" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "x-internal-request: true" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -H "x-internal-request: true" -H "Authorization: $auth_header" "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    echo -e "  HTTP Status: ${BLUE}$http_code${NC}"
    echo ""

    sleep $DELAY
}

# Test 1: Invalid API Key (Should trigger Sentry "warning")
echo -e "${GREEN}=== Test 1: Invalid API Key ===${NC}"
echo "Expected: HTTP 401, Sentry warning logged"
echo ""

make_request "/api/analytics" "Bearer invalid_key_12345" "Invalid API key attempt"

# Test 2: Missing API Key (Should trigger Sentry "warning")
echo -e "${GREEN}=== Test 2: Missing API Key ===${NC}"
echo "Expected: HTTP 401, Sentry warning logged"
echo ""

make_request "/api/analytics" "" "Missing API key attempt"

# Test 3: Brute Force Simulation (10+ attempts)
echo -e "${GREEN}=== Test 3: Brute Force Attack Simulation ===${NC}"
echo "Expected: HTTP 401 x 15, Sentry HIGH alert after 10 attempts"
echo "Note: This will trigger 'Brute Force Attack' alert in Sentry"
echo ""

for i in {1..15}; do
    echo -e "${YELLOW}Attempt $i/15:${NC}"
    make_request "/api/analytics" "Bearer invalid_brute_force_$i" "Brute force attempt #$i"
done

echo -e "${YELLOW}✓${NC} Brute force simulation complete (15 attempts)"
echo -e "${YELLOW}→${NC} Check Sentry for 'Brute Force Attack' alert"
echo ""

# Test 4: Rate Limit Testing
echo -e "${GREEN}=== Test 4: Rate Limit Testing ===${NC}"
echo "Expected: HTTP 200 until rate limit, then HTTP 429"
echo "Note: Analytics has 60/min in dev, 5/min in production"
echo ""

if [ "$BASE_URL" == "http://localhost:3000" ]; then
    # Development: 60 requests per minute
    echo "Testing development rate limit (60/min)..."
    for i in {1..70}; do
        if [ $i -eq 61 ]; then
            echo -e "${YELLOW}Expecting rate limit starting now...${NC}"
        fi

        make_request "/api/analytics" "Bearer $ADMIN_API_KEY" "Rate limit test #$i" 2>&1 | head -n2

        # Short delay to stay within 1 minute window
        sleep 0.5
    done
else
    # Production/Preview: 5 requests per minute
    echo "Testing production rate limit (5/min)..."
    for i in {1..10}; do
        if [ $i -eq 6 ]; then
            echo -e "${YELLOW}Expecting rate limit starting now...${NC}"
        fi

        make_request "/api/analytics" "Bearer $ADMIN_API_KEY" "Rate limit test #$i"
    done
fi

echo -e "${YELLOW}✓${NC} Rate limit testing complete"
echo -e "${YELLOW}→${NC} Check Sentry for 'Rate Limit Violations' alert (if > 20 in 15 min)"
echo ""

# Test 5: Admin API Usage Endpoint (Strict Rate Limit: 1/min)
echo -e "${GREEN}=== Test 5: Admin API Usage Strict Rate Limit ===${NC}"
echo "Expected: HTTP 200 for first request, HTTP 429 for second (1 req/min limit)"
echo ""

make_request "/api/admin/api-usage" "Bearer $ADMIN_API_KEY" "First request (should succeed)"
make_request "/api/admin/api-usage" "Bearer $ADMIN_API_KEY" "Second request (should be rate limited)"

echo -e "${YELLOW}✓${NC} Strict rate limit testing complete"
echo ""

# Test 6: Successful Access (Should NOT alert, just log)
echo -e "${GREEN}=== Test 6: Successful Access (Audit Log) ===${NC}"
echo "Expected: HTTP 200, logged to Axiom (no Sentry alert)"
echo ""

make_request "/api/analytics" "Bearer $ADMIN_API_KEY" "Successful authenticated request"

echo -e "${YELLOW}✓${NC} Successful access test complete"
echo -e "${YELLOW}→${NC} Check Axiom logs for success event"
echo ""

# Test 7: Different Endpoints
echo -e "${GREEN}=== Test 7: Multiple Endpoint Testing ===${NC}"
echo "Testing both admin endpoints..."
echo ""

make_request "/api/analytics" "Bearer invalid_key" "Analytics endpoint - invalid key"
make_request "/api/admin/api-usage" "Bearer invalid_key" "Admin API Usage - invalid key"

echo -e "${YELLOW}✓${NC} Multi-endpoint testing complete"
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

echo -e "${GREEN}Tests Completed:${NC}"
echo "  ✓ Test 1: Invalid API Key"
echo "  ✓ Test 2: Missing API Key"
echo "  ✓ Test 3: Brute Force Attack (15 attempts)"
echo "  ✓ Test 4: Rate Limit Testing"
echo "  ✓ Test 5: Strict Rate Limit (Admin API Usage)"
echo "  ✓ Test 6: Successful Access"
echo "  ✓ Test 7: Multiple Endpoints"
echo ""

echo -e "${YELLOW}Expected Sentry Alerts:${NC}"
echo "  1. Brute Force Attack (HIGH) - After 10 invalid attempts"
echo "  2. Rate Limit Violations (MEDIUM) - If >20 in 15 minutes"
echo "  3. Individual 'Admin access denied' warnings (17 total from tests)"
echo ""

echo -e "${YELLOW}Expected Axiom Logs:${NC}"
echo "  • ~20 'admin_access' events logged"
echo "  • Mix of 'denied' and 'success' results"
echo "  • Various denial reasons (invalid key, rate limit, etc.)"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Check Sentry Issues: https://sentry.io"
echo "  2. Check Axiom Dashboard: https://app.axiom.co/dcyfr-1fc7/dashboards/jgTPB1LvUpcfnCTR5d"
echo "  3. Verify alerts were sent (email/Slack)"
echo "  4. Review log structure and content"
echo ""

echo -e "${GREEN}✓ Testing complete!${NC}"
echo ""

# Optional: Axiom query suggestions
echo -e "${BLUE}Axiom Queries to Run:${NC}"
echo ""
echo "1. All test events:"
echo "   ['event'] == \"admin_access\" | sort by timestamp desc | limit 50"
echo ""
echo "2. Failed attempts:"
echo "   ['event'] == \"admin_access\" and ['result'] == \"denied\""
echo ""
echo "3. Brute force attempts:"
echo "   ['event'] == \"admin_access\" and ['reason'] == \"invalid or missing API key\" | summarize count() by ip"
echo ""
echo "4. Rate limit violations:"
echo "   ['event'] == \"admin_access\" and ['reason'] == \"rate limit exceeded\""
echo ""
