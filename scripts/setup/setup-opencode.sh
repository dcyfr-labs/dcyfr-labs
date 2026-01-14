#!/bin/bash

# OpenCode.ai Setup Script for dcyfr-labs
# This script helps configure OpenCode.ai as a fallback AI development tool

set -e

echo "=========================================="
echo "OpenCode.ai Setup for dcyfr-labs"
echo "Fallback AI Development Tool"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo "ℹ️  $1"
}

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    warning "Unsupported OS: $OSTYPE. Proceeding with manual installation."
    OS="other"
fi

# Step 1: Check Node.js version
echo "Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 20 or higher."
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 20 or higher."
fi
success "Node.js version $(node -v) detected"
echo ""

# Step 2: Install OpenCode.ai CLI
echo "Step 2: Installing OpenCode.ai CLI..."
if command -v opencode &> /dev/null; then
    info "OpenCode.ai already installed: $(opencode --version)"
    read -p "Reinstall? (y/N): " reinstall
    if [[ "$reinstall" =~ ^[Yy]$ ]]; then
        npm install -g opencode-ai || error "Failed to install OpenCode.ai"
    fi
else
    npm install -g opencode-ai || error "Failed to install OpenCode.ai"
fi
success "OpenCode.ai CLI installed"
echo ""

# Step 3: Initialize OpenCode.ai configuration
echo "Step 3: Initializing OpenCode.ai configuration..."
if [ -f "$HOME/.opencode/config.json" ]; then
    warning "Configuration already exists at ~/.opencode/config.json"
    read -p "Backup and overwrite? (y/N): " overwrite
    if [[ "$overwrite" =~ ^[Yy]$ ]]; then
        cp "$HOME/.opencode/config.json" "$HOME/.opencode/config.json.backup.$(date +%s)"
        success "Backed up existing config"
    else
        info "Keeping existing configuration"
        SKIP_CONFIG=true
    fi
fi

if [ "$SKIP_CONFIG" != "true" ]; then
    mkdir -p "$HOME/.opencode"
    cp .opencode.config.example.json "$HOME/.opencode/config.json"
    success "Configuration initialized"
fi
echo ""

# Step 4: Configure environment variables
echo "Step 4: Configuring environment variables..."
info "OpenCode.ai requires API keys for AI providers"
echo ""

# Check which shell is being used
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC="$HOME/.profile"
fi

info "Detected shell configuration: $SHELL_RC"
echo ""

# Function to add/update environment variable
add_env_var() {
    local var_name=$1
    local var_value=$2

    if grep -q "^export $var_name=" "$SHELL_RC" 2>/dev/null; then
        # Update existing
        if [[ "$OS" == "macos" ]]; then
            sed -i '' "s|^export $var_name=.*|export $var_name=\"$var_value\"|" "$SHELL_RC"
        else
            sed -i "s|^export $var_name=.*|export $var_name=\"$var_value\"|" "$SHELL_RC"
        fi
        info "Updated $var_name in $SHELL_RC"
    else
        # Add new
        echo "export $var_name=\"$var_value\"" >> "$SHELL_RC"
        info "Added $var_name to $SHELL_RC"
    fi
}

# Anthropic API Key (for primary fallback)
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Enter your Anthropic API key (or press Enter to skip):"
    read -s anthropic_key
    if [ -n "$anthropic_key" ]; then
        add_env_var "ANTHROPIC_API_KEY" "$anthropic_key"
        export ANTHROPIC_API_KEY="$anthropic_key"
    fi
else
    success "ANTHROPIC_API_KEY already set"
fi

# OpenAI API Key (for secondary fallback)
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Enter your OpenAI API key (or press Enter to skip):"
    read -s openai_key
    if [ -n "$openai_key" ]; then
        add_env_var "OPENAI_API_KEY" "$openai_key"
        export OPENAI_API_KEY="$openai_key"
    fi
else
    success "OPENAI_API_KEY already set"
fi

# Groq API Key (for cost-effective fallback)
if [ -z "$GROQ_API_KEY" ]; then
    echo "Enter your Groq API key (or press Enter to skip):"
    read -s groq_key
    if [ -n "$groq_key" ]; then
        add_env_var "GROQ_API_KEY" "$groq_key"
        export GROQ_API_KEY="$groq_key"
    fi
else
    success "GROQ_API_KEY already set"
fi

# Google API Key (for Gemini)
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "Enter your Google API key (or press Enter to skip):"
    read -s google_key
    if [ -n "$google_key" ]; then
        add_env_var "GOOGLE_API_KEY" "$google_key"
        export GOOGLE_API_KEY="$google_key"
    fi
else
    success "GOOGLE_API_KEY already set"
fi

echo ""
success "Environment variables configured"
info "Reload your shell or run: source $SHELL_RC"
echo ""

# Step 5: Install Ollama (optional, for local models)
echo "Step 5: Local model support (optional)..."
if command -v ollama &> /dev/null; then
    success "Ollama already installed: $(ollama --version)"
else
    echo "Install Ollama for local AI models (free, offline support)?"
    read -p "Install Ollama? (y/N): " install_ollama
    if [[ "$install_ollama" =~ ^[Yy]$ ]]; then
        if [[ "$OS" == "macos" ]]; then
            if command -v brew &> /dev/null; then
                brew install ollama || warning "Failed to install Ollama via Homebrew"
            else
                info "Download from: https://ollama.ai/download"
            fi
        elif [[ "$OS" == "linux" ]]; then
            curl -fsSL https://ollama.ai/install.sh | sh || warning "Failed to install Ollama"
        else
            info "Download from: https://ollama.ai/download"
        fi
    fi
fi
echo ""

# Step 6: Test OpenCode.ai
echo "Step 6: Testing OpenCode.ai installation..."
if opencode --version &> /dev/null; then
    success "OpenCode.ai CLI working: $(opencode --version)"
else
    error "OpenCode.ai CLI test failed"
fi
echo ""

# Step 7: Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Reload your shell: source $SHELL_RC"
echo "2. Test OpenCode.ai: opencode --help"
echo "3. Start a session: opencode"
echo "4. Review docs: docs/ai/opencode-fallback-architecture.md"
echo ""
echo "Quick commands:"
echo "  npm run ai:opencode           # Start OpenCode.ai session"
echo "  npm run ai:opencode:groq      # Use cost-effective provider"
echo "  npm run ai:opencode:local     # Use local models (offline)"
echo ""
echo "Provider hierarchy:"
echo "  1. Primary: Claude Code (200K context)"
echo "  2. Secondary: GitHub Copilot (~8K context)"
echo "  3. Fallback: OpenCode.ai (75+ providers)"
echo ""
echo "Trigger conditions for OpenCode.ai:"
echo "  ❌ Claude Code rate limit exceeded"
echo "  ❌ Token budget exhausted"
echo "  ✅ Extended development sessions"
echo "  ✅ Cost optimization needed"
echo "  ✅ Offline development"
echo ""
success "Setup complete! Happy coding! 🚀"
