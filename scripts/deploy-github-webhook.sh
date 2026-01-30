#!/usr/bin/env bash

# GitHub Webhook Deployment Script
# Automates the deployment process for GitHub webhook integration
# Usage: ./scripts/deploy-github-webhook.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Banner
echo ""
echo "================================================"
echo " GitHub Webhook Deployment"
echo " Real-time commit tracking for Activity feed"
echo "================================================"
echo ""

# Check prerequisites
info "Checking prerequisites..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi
success "Vercel CLI installed"

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    error "OpenSSL not found. Required for generating webhook secret."
    exit 1
fi
success "OpenSSL available"

echo ""

# Step 1: Generate webhook secret
info "Step 1/5: Generate webhook secret"
echo ""
echo "Generating secure 256-bit secret..."
WEBHOOK_SECRET=$(openssl rand -base64 32)
success "Secret generated"
echo ""
echo -e "${YELLOW}IMPORTANT: Copy this secret - you'll need it for GitHub webhook settings${NC}"
echo ""
echo -e "  ${GREEN}${WEBHOOK_SECRET}${NC}"
echo ""
read -p "Press Enter to continue (secret copied to clipboard if available)..."

# Try to copy to clipboard (macOS/Linux)
if command -v pbcopy &> /dev/null; then
    echo "$WEBHOOK_SECRET" | pbcopy
    success "Secret copied to clipboard (macOS)"
elif command -v xclip &> /dev/null; then
    echo "$WEBHOOK_SECRET" | xclip -selection clipboard
    success "Secret copied to clipboard (Linux)"
fi

echo ""

# Step 2: Add environment variable to Vercel
info "Step 2/5: Add environment variable to Vercel"
echo ""
warning "Opening Vercel CLI to add GITHUB_WEBHOOK_SECRET..."
echo ""
echo "When prompted:"
echo -e "  1. Paste the secret: ${GREEN}${WEBHOOK_SECRET}${NC}"
echo -e "  2. Select environment: ${GREEN}Production${NC} (and optionally Preview)"
echo ""
read -p "Press Enter to continue..."

# Add to Vercel (production)
if vercel env add GITHUB_WEBHOOK_SECRET production; then
    success "Environment variable added to production"
else
    error "Failed to add environment variable"
    exit 1
fi

echo ""
read -p "Add to Preview environment too? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add GITHUB_WEBHOOK_SECRET preview
    success "Environment variable added to preview"
fi

echo ""

# Step 3: Verify current production URL
info "Step 3/5: Verify production URL"
echo ""
echo -e "Current production URL: ${GREEN}https://www.dcyfr.ai${NC}"
echo -e "Webhook endpoint: ${GREEN}https://www.dcyfr.ai/api/github/webhook${NC}"
echo ""
read -p "Is this correct? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    error "Update the webhook URL in this script and GitHub webhook settings"
    exit 1
fi
success "Production URL verified"

echo ""

# Step 4: Deploy to production
info "Step 4/5: Deploy to production"
echo ""
warning "This will trigger a production deployment with the new environment variable."
echo ""
read -p "Deploy now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Deploying to production..."
    if vercel --prod; then
        success "Deployment successful"
    else
        error "Deployment failed"
        exit 1
    fi
else
    warning "Skipping deployment. Remember to deploy manually!"
    echo ""
    echo -e "Deploy with: ${YELLOW}vercel --prod${NC}"
fi

echo ""

# Step 5: Configure GitHub webhook
info "Step 5/5: Configure GitHub webhook"
echo ""
echo "Next steps (manual):"
echo ""
echo -e "1. Go to: ${BLUE}https://github.com/dcyfr/dcyfr-labs/settings/hooks${NC}"
echo "2. Click 'Add webhook'"
echo "3. Configure:"
echo "   - Payload URL: https://www.dcyfr.ai/api/github/webhook"
echo "   - Content type: application/json"
echo "   - Secret: (paste the secret from clipboard)"
echo "   - SSL verification: Enable SSL verification"
echo "   - Events: Just the push event"
echo "4. Click 'Add webhook'"
echo ""
echo "5. Verify webhook ping:"
echo "   - GitHub will send a test ping immediately"
echo "   - You should see a green checkmark"
echo "   - Response: 200 OK"
echo ""

read -p "Press Enter when webhook is configured..."

echo ""

# Verification
info "Verification steps"
echo ""
echo "Test webhook delivery with a commit:"
echo ""
echo -e "  ${YELLOW}git commit --allow-empty -m \"test: verify webhook delivery\"${NC}"
echo -e "  ${YELLOW}git push origin main${NC}"
echo ""
echo "Then verify:"
echo "  1. GitHub → Settings → Webhooks → Recent Deliveries (200 OK)"
echo "  2. Inngest Dashboard → github/commit.pushed (Completed)"
echo "  3. Activity feed → GitHub Commits (commit appears < 30 sec)"
echo ""

# Final summary
echo ""
echo "================================================"
echo " Deployment Complete"
echo "================================================"
echo ""
success "GITHUB_WEBHOOK_SECRET configured in Vercel"
success "Production deployment complete"
echo ""
warning "Manual step remaining: Configure webhook in GitHub repository settings"
echo ""
echo -e "Documentation: ${BLUE}docs/deployment/github-webhook-setup.md${NC}"
echo ""
