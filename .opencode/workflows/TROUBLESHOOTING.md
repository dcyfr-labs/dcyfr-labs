# Troubleshooting OpenCode & AI Provider Issues

**Status**: Production Ready  
**Last Updated**: January 11, 2026  
**Version**: 2.0.0 (GitHub Copilot Migration)  
**Purpose**: Common issues, root cause analysis, and recovery procedures for OpenCode.ai fallback system

---

## Quick Diagnosis

Run the health check script to identify issues:

```bash
npm run opencode:health

# Output will show:
# ✅ Provider available
# ⚠️ Provider degraded (rate limited, slow response)
# ❌ Provider unavailable (auth failure, service down)
```

---

## Common Issues by Provider

### GitHub Copilot (Primary)

#### Issue: Authentication Failed

**Symptom**:
```
Error: GitHub Copilot authentication failed
Please authenticate using device code flow
```

**Root Cause**: Not authenticated with GitHub Copilot, or session expired.

**Immediate Fix**:
```bash
# Launch OpenCode and connect to GitHub Copilot
opencode

# In OpenCode UI:
# 1. Type: /connect
# 2. Select: "GitHub Copilot"
# 3. Follow device code authentication flow
# 4. Enter code at: https://github.com/login/device
# 5. Authorize OpenCode access

# Verify connection
# Type: /models
# Expected: gpt-5-mini, raptor-mini, gpt-4o
```

**Long-Term Fix**:
- Authenticate once per machine (session persists)
- Re-authenticate if token expires (rare)
- No API keys needed (device code flow)

**Prevention**:
- Keep GitHub Copilot subscription active
- Don't revoke OpenCode authorization in GitHub settings
- Session state stored in VS Code settings (automatic)

---

#### Issue: GitHub Copilot Model Not Available

**Symptom**:
```
Error: Model "gpt-5-mini" not found
Or: Model "raptor-mini" unavailable
```

**Root Cause**: Model name changed, or access tier insufficient.

**Immediate Fix**:
```bash
# Check available models
opencode
# Type: /models

# Expected models with GitHub Copilot subscription:
# - gpt-5-mini (GA, 16K context)
# - raptor-mini (Preview, 8K context)
# - gpt-4o (GA, 128K context)

# If model missing, verify subscription status:
# https://github.com/settings/copilot

# Update config if model name changed
nano .opencode/config.json
# Update "model" field to match available model
```

**Verification**:
```bash
# Test with available model
opencode --preset dcyfr-feature
# Should use gpt-5-mini

# Or use speed preset
opencode --preset dcyfr-quick
# Should use raptor-mini
```

**Prevention**:
- Keep GitHub Copilot subscription active ($10-20/month)
- Subscribe to GitHub Copilot changelog: https://github.blog/tag/copilot/
- Check model availability before major updates

---

#### Issue: Rate Limit / Usage Cap

**Symptom**:
```
Error: GitHub Copilot usage cap reached
Or: Too many requests, please slow down
```

**Root Cause**: Exceeded GitHub Copilot usage limits (varies by tier).

**Immediate Fix**:
```bash
# Option 1: Wait for limit reset (check error message for timing)
# GitHub Copilot limits reset hourly or daily depending on tier

# Option 2: Switch to alternative GitHub Copilot model (may have separate limits)
opencode --preset dcyfr-quick  # Try raptor-mini instead of gpt-5-mini

# Option 3: Escalate to premium (if critical)
npm run session:save opencode
opencode --preset claude
npm run session:restore opencode
```

**Long-Term Fix**:
```bash
# Monitor usage patterns
# Check GitHub Copilot usage dashboard:
# https://github.com/settings/copilot

# Optimize request patterns
# - Batch similar operations
# - Use session state to reduce context tokens
# - Reserve GitHub Copilot for active development (not exploratory)

# Consider upgrading GitHub Copilot tier if sustained high usage
```

**Prevention**:
- Monitor daily usage: Check GitHub Copilot dashboard weekly
- Use session state to reduce context tokens
- Batch operations when possible
- Strategic allocation: 80% GitHub Copilot, 20% premium (Claude)

---

#### Issue: Slow Response Times

**Symptom**: Each request takes >15 seconds.

**Root Cause**: GitHub Copilot service degradation or network issues.

**Immediate Fix**:
```bash
# Check GitHub Copilot status
# Visit: https://www.githubstatus.com/
# Look for: "Copilot" service status

# Option 1: Switch to faster model (if available)
opencode --preset dcyfr-quick  # raptor-mini may be faster

# Option 2: Escalate to premium (Claude Sonnet is fast)
opencode --preset claude

# Option 3: Check local network
ping github.com
# Expected: <100ms response times
```

**Long-Term Fix**:
- Monitor GitHub Status: https://www.githubstatus.com/
- Configure request timeouts in `.opencode/config.json`
- Set fallback providers for critical work

**Expected Speeds**:
- **GitHub Copilot GPT-5 Mini**: 50-100 tokens/second (typical)
- **GitHub Copilot Raptor Mini**: 100-200 tokens/second (faster, preview)
- **GitHub Copilot GPT-4o**: 30-60 tokens/second (slower, premium quality)
- **Claude Sonnet**: 40-80 tokens/second (premium baseline)

---

### Claude (Premium Fallback)

#### Issue: Rate Limit / Quota Exceeded

**Symptom**:
```
Error: Rate limit exceeded
Your organization has reached the maximum requests per minute
```

**Root Cause**: Claude API rate limits hit.

**Immediate Fix**:
```bash
# Fallback to GitHub Copilot (included with subscription)
npm run session:save claude
opencode --preset dcyfr-feature
npm run session:restore claude
```

**Long-Term Fix**:
- Upgrade to higher Claude tier (if available)
- Use Claude strategically (20% premium, 80% GitHub Copilot)
- Implement request queuing (batch operations)

**Recommended Allocation**:
- **GitHub Copilot (80%)**: Features, bug fixes, refactoring, UI updates
- **Claude (20%)**: Security, architecture, complex debugging, critical paths

---

#### Issue: API Key Invalid

**Symptom**:
```
Error: Invalid API key
Authentication failed
```

**Root Cause**: API key expired, revoked, or misconfigured.

**Immediate Fix**:
```bash
# Check API key in environment
echo $ANTHROPIC_API_KEY  # Should show key (sk-ant-...)

# If missing, add to .env.local
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local

# Verify key is valid
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'

# Expected: JSON response (not 401 error)
```

**Long-Term Fix**:
- Rotate API keys quarterly (security best practice)
- Store keys in secure password manager
- Never commit keys to git (check `.gitignore`)

---

### OpenCode Extension (VS Code)

#### Issue: Extension Not Found

**Symptom**: `opencode` command not available in terminal.

**Root Cause**: OpenCode extension not installed.

**Immediate Fix**:
```bash
# Install from VS Code Marketplace
code --install-extension sst-dev.opencode

# Or install via UI:
# 1. Open VS Code
# 2. Press Cmd+Shift+X (Extensions)
# 3. Search "OpenCode.ai"
# 4. Click Install

# Verify installation
code --list-extensions | grep opencode
# Expected: sst-dev.opencode
```

**Recommended Extensions** (from `.vscode/extensions.json`):
```bash
# Also install recommended extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

---

#### Issue: Extension Not Activated

**Symptom**: Extension installed but keyboard shortcuts not working.

**Root Cause**: Extension requires workspace trust or manual activation.

**Immediate Fix**:
```bash
# Trust workspace
# VS Code → File → Trust Workspace

# Manually activate extension
# VS Code → Command Palette (Cmd+Shift+P)
# Type: "OpenCode: Start"

# Verify activation
# Look for OpenCode icon in sidebar
```

**Keyboard Shortcuts** (from docs):
- `Cmd+Esc` - Launch OpenCode
- `Cmd+Shift+Esc` - New OpenCode session
- `Cmd+Option+K` - Add file references

---

#### Issue: Provider Configuration Not Loaded

**Symptom**:
```
Error: No provider configured
Please configure a provider in .opencode/config.json
```

**Root Cause**: `.opencode/config.json` missing or invalid JSON.

**Immediate Fix**:
```bash
# Verify config file exists
ls .opencode/config.json

# Validate JSON syntax
cat .opencode/config.json | jq .

# If missing or corrupted, restore from git
git checkout HEAD -- .opencode/config.json

# Or create fresh config (GitHub Copilot default)
mkdir -p .opencode
cat > .opencode/config.json <<'EOF'
{
  "primary": {
    "provider": "github-copilot",
    "model": "gpt-5-mini",
    "contextWindow": 16384,
    "description": "GitHub Copilot GPT-5 Mini - Primary model (GA, 16K context)"
  },
  "speed": {
    "provider": "github-copilot",
    "model": "raptor-mini",
    "contextWindow": 8192,
    "description": "GitHub Copilot Raptor Mini - Fast model (Preview, 8K context)"
  }
}
EOF

# Reload VS Code window
# Command Palette → "Reload Window"
```

---

## Validation Issues

### Issue: STRICT Rule Violations Not Caught

**Symptom**: GitHub Copilot generates code with design token violations, but no error.

**Root Cause**: Enhanced validation script not run.

**Immediate Fix**:
```bash
# Run enhanced validation manually
npm run check:opencode

# Or run validation script directly
scripts/validate-after-fallback.sh

# Expected: Exit code 1 if STRICT violations found
echo $?  # 0 = pass, 1 = violations
```

**Long-Term Fix**:
```bash
# Pre-commit hook already configured (verify)
cat .git/hooks/pre-commit

# If missing, reinstall hooks
npm run prepare

# Now validation runs automatically on commit
```

**Validation Coverage**:
- ✅ **STRICT (Hard Block)**: Design tokens, PageLayout 90% rule, barrel exports, test data, emojis
- ⚠️ **FLEXIBLE (Warn)**: API patterns, test coverage, advanced patterns

---

### Issue: False Positive FLEXIBLE Warnings

**Symptom**: Validation warns about API pattern violations, but they're intentional.

**Root Cause**: Simple operation doesn't need Inngest (legitimate exception).

**Immediate Fix**:
```ts
// Add exception comment in code
// FLEXIBLE EXCEPTION: Simple contact form (low volume, synchronous)
export async function POST(request: Request) {
  await sendEmail(data);
  return Response.json({ success: true });
}
```

**Documentation**:
- No script changes needed
- Comment documents rationale
- Reviewed during PR process (not blocking)
- See: `.opencode/enforcement/HYBRID_ENFORCEMENT.md`

---

### Issue: Tests Fail After GitHub Copilot Changes

**Symptom**: `npm run test:run` shows new failures.

**Root Cause**: GitHub Copilot generated code with subtle bugs (missing edge cases).

**Immediate Fix**:
```bash
# Run tests in verbose mode
npm run test:run -- --reporter=verbose

# Identify failures
# Option 1: Fix tests if expectations wrong
# Option 2: Fix implementation if logic wrong

# Re-run validation
npm run check:opencode
```

**Escalation Trigger**:
- If >3 test failures AND implementation looks correct:
  - Escalate to Claude for review
  - GitHub Copilot may have misunderstood requirements
  - Claude has better reasoning for complex edge cases

**Workflow**:
```bash
# Save current state
npm run session:save opencode

# Switch to Claude for debugging
opencode --preset claude
# Prompt: "Review test failures and suggest fixes"

# Apply fixes, verify tests pass
npm run test:run

# Return to GitHub Copilot
opencode --preset dcyfr-feature
```

---

## Session Handoff Issues

### Issue: Session State Corrupted

**Symptom**: `npm run session:restore <agent>` shows garbled data.

**Root Cause**: Manual edit of JSON file, or incomplete save operation.

**Immediate Fix**:
```bash
# Delete corrupted session state
rm .opencode/.session-state.json

# Create fresh session state
npm run session:save opencode

# Manually document current context (if needed)
echo "Task: <description>" > .opencode/session-notes.txt
```

**Prevention**:
- Never manually edit session state files
- Always use `npm run session:save` script
- If script fails, check git status for uncommitted changes

---

### Issue: Session State Not Found

**Symptom**:
```
❌ No session state found for opencode
   Run: npm run session:save opencode
```

**Root Cause**: Session not saved yet, or file deleted.

**Immediate Fix**:
```bash
# Create session state
npm run session:save opencode

# Verify file created
ls -la .opencode/.session-state.json
```

**Session State Schema** (v2.0):
```json
{
  "version": "2.0",
  "timestamp": "2026-01-11T...",
  "git_branch": "main",
  "issues": [],
  "pull_requests": [],
  "time_estimate": "2 hours remaining",
  "validation_status": "STRICT_PASS"
}
```

---

## Network & Connectivity Issues

### Issue: No Internet Connection (Offline)

**Symptom**: GitHub Copilot/Claude requests fail with "Network unreachable".

**Root Cause**: No internet access.

**Immediate Fix**:
```bash
# OpenCode v2.0 does NOT support offline development
# GitHub Copilot requires internet connection

# Options:
# 1. Wait for internet to restore
# 2. Use mobile hotspot as temporary connection
# 3. Work on non-AI tasks (documentation, planning)

# When back online:
npm run opencode:health  # Verify connection
npm run check:opencode   # Validate any manual changes
```

**Future Offline Support**:
- See backlog: `docs/backlog/msty-ai-offline-support.md`
- Msty.ai planned for offline development (P3 priority)
- Uses local models (Qwen2.5-Coder, DeepSeek-Coder)

---

### Issue: Proxy/Firewall Blocking API Requests

**Symptom**: GitHub Copilot/Claude requests timeout after 30 seconds.

**Root Cause**: Corporate proxy or firewall blocking API endpoints.

**Immediate Fix**:
```bash
# Option 1: Configure proxy in environment
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Add to ~/.zshrc or ~/.bashrc for persistence
echo 'export HTTP_PROXY=http://proxy.company.com:8080' >> ~/.zshrc
echo 'export HTTPS_PROXY=http://proxy.company.com:8080' >> ~/.zshrc

# Restart VS Code to apply proxy settings

# Option 2: Configure proxy in VS Code settings
# .vscode/settings.json:
{
  "http.proxy": "http://proxy.company.com:8080",
  "http.proxyStrictSSL": false
}
```

**Verification**:
```bash
# Test connectivity to GitHub Copilot
curl -I https://api.github.com

# Expected: HTTP 200 or 401 (not timeout)

# Test connectivity to Claude API
curl -I https://api.anthropic.com

# Expected: HTTP 200 or 403 (not timeout)
```

**Corporate Network Checklist**:
- [ ] Whitelist: `api.github.com` (GitHub Copilot)
- [ ] Whitelist: `api.anthropic.com` (Claude)
- [ ] Configure proxy settings in environment
- [ ] Disable SSL verification if using MITM proxy (not recommended)

---

## Quality Issues

### Issue: GitHub Copilot Generates Low-Quality Code

**Symptom**: Code works but violates DCYFR patterns repeatedly.

**Root Cause**: GitHub Copilot has 70-85% pattern adherence (vs. Claude's 95%).

**Not a Bug**: This is expected behavior. Free-tier models require enhanced validation.

**Immediate Fix**:
```bash
# Run enhanced validation
npm run check:opencode

# Review manual checklist
cat .opencode/enforcement/VALIDATION_ENHANCED.md

# Fix violations manually or escalate
opencode --preset claude  # If too many violations (>5)
```

**Long-Term Fix**:
- Accept that GitHub Copilot needs more validation
- Budget 10-15% extra time for manual review
- Use GitHub Copilot for 80% of work, Claude for 20%
- Focus Claude usage on: security, architecture, complex bugs

**Expected Pattern Adherence**:
- **GitHub Copilot GPT-5 Mini**: 70-85% (good for drafting)
- **GitHub Copilot GPT-4o**: 80-90% (better, but slower)
- **Claude Sonnet**: 95%+ (premium, strategic use)

---

### Issue: GitHub Copilot Misses Patterns Entirely

**Symptom**: GitHub Copilot generates code without PageLayout, uses deep imports, etc.

**Root Cause**: Model context not fully loaded, or pattern not emphasized.

**Recommended Workflow**:
```bash
# Step 1: Draft with GitHub Copilot (fast, $0 additional)
opencode --preset dcyfr-feature
# Implement feature

# Step 2: Validate (automated)
npm run check:opencode
# Identify all violations

# Step 3: Fix STRICT violations (GitHub Copilot or manual)
opencode --preset dcyfr-feature
# Fix design tokens, PageLayout, barrel exports

# Step 4: Escalate if >5 violations (Claude)
opencode --preset claude
# Claude fixes complex pattern violations

# Step 5: Final validation
npm run check:opencode
# Ensure production-ready
```

**Expected Time**:
- GitHub Copilot draft: 2 hours
- Validation + fixes: 30 minutes (GitHub Copilot) or 15 minutes (Claude)
- Total: 2.5 hours (vs. 2 hours if Claude-only)

**Trade-off**: +25% time, but 55-85% cost savings.

---

## Emergency Recovery

### Complete OpenCode Reset

**When**: Multiple providers failing, session states corrupted, extensions broken.

**Process**:

```bash
# Step 1: Save git state
git stash push -m "emergency reset backup"

# Step 2: Remove all session states
rm .opencode/.session-state.json
rm .claude/.session-state.json
rm .github/copilot-session-state.json

# Step 3: Reset OpenCode config
git checkout HEAD -- .opencode/config.json

# Step 4: Reinstall OpenCode extension
code --uninstall-extension sst-dev.opencode
code --install-extension sst-dev.opencode

# Step 5: Reload VS Code
# Command Palette → "Reload Window"

# Step 6: Re-authenticate with GitHub Copilot
opencode
# Type: /connect
# Select: GitHub Copilot
# Follow device code flow

# Step 7: Test basic functionality
opencode --preset dcyfr-feature
# Prompt: "console.log('test')"

# Step 8: Restore work if successful
git stash pop
```

**If still failing**:
- Check provider status pages:
  - GitHub Copilot: https://www.githubstatus.com/
  - Claude: https://status.anthropic.com
  
- Escalate:
  - File issue with OpenCode: https://github.com/sst-dev/opencode/issues
  - Check GitHub Copilot subscription status: https://github.com/settings/copilot
  - Use VS Code GitHub Copilot extension as temporary alternative

---

## Diagnostic Commands

### Provider Health Check

```bash
npm run opencode:health

# Checks:
# - GitHub Copilot connectivity (manual verification)
# - OpenCode CLI installation
# - Configuration file validity
# - Environment variables (Claude API key if configured)

# Output:
# ✅ OpenCode CLI installed
# ✅ Config file valid
# ⚠️ GitHub Copilot auth required (run: opencode → /connect)
# ✅ Claude API key configured (optional)
```

---

### Environment Validation

```bash
# Check all required environment variables
cat <<'EOF' > /tmp/check-env.sh
#!/bin/bash
echo "🔍 Environment Check (OpenCode v2.0 - GitHub Copilot)"
echo ""

# Check API keys (Claude optional)
[ -n "$ANTHROPIC_API_KEY" ] && echo "✅ ANTHROPIC_API_KEY set (optional)" || echo "⚠️ ANTHROPIC_API_KEY missing (Claude won't work)"

# Check OpenCode CLI
command -v opencode > /dev/null && echo "✅ OpenCode CLI installed" || echo "❌ OpenCode CLI not found"

# Check config
[ -f .opencode/config.json ] && echo "✅ Config file exists" || echo "❌ Config file missing"
jq . .opencode/config.json > /dev/null 2>&1 && echo "✅ Config valid JSON" || echo "❌ Config invalid JSON"

# Check GitHub Copilot subscription
echo ""
echo "📋 Manual Checks:"
echo "   1. Verify GitHub Copilot subscription: https://github.com/settings/copilot"
echo "   2. Authenticate OpenCode: opencode → /connect → GitHub Copilot"
echo "   3. Verify models: opencode → /models (should show gpt-5-mini, raptor-mini)"
EOF

bash /tmp/check-env.sh
```

---

### Validation Status

```bash
# Run all validation checks
npm run check:opencode

# Individual checks
npm run type-check    # TypeScript
npm run lint          # ESLint
npm run test:run      # Vitest

# DCYFR-specific validation
scripts/validate-after-fallback.sh --strict-only    # Hard blocks
scripts/validate-after-fallback.sh --flexible-only  # Warnings
```

---

## Getting Help

### Internal Resources

1. **Documentation**:
   - [Provider Selection Guide](../patterns/PROVIDER_SELECTION.md) - GitHub Copilot decision tree
   - [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md) - Quality checks
   - [VS Code Integration](../patterns/VS_CODE_INTEGRATION.md) - Extension setup

2. **Scripts**:
   - `npm run opencode:health` - Provider health check
   - `npm run check:opencode` - Full validation suite
   - `npm run session:handoff` - Session state management

3. **Config**:
   - `.opencode/config.json` - GitHub Copilot provider configuration
   - `.env.local` - API keys (Claude optional)

---

### External Resources

1. **OpenCode**:
   - GitHub: https://github.com/sst-dev/opencode
   - Issues: https://github.com/sst-dev/opencode/issues
   - Docs: https://opencode.ai/docs

2. **GitHub Copilot**:
   - Status: https://www.githubstatus.com/
   - Subscription: https://github.com/settings/copilot
   - Docs: https://docs.github.com/copilot
   - Changelog: https://github.blog/tag/copilot/

3. **Claude**:
   - Status: https://status.anthropic.com
   - Docs: https://docs.anthropic.com
   - Support: https://support.anthropic.com

---

## Related Documentation

**Workflows**:
- [Session Handoff](./SESSION_HANDOFF.md) - Model switching procedures (GitHub Copilot ↔ Claude)
- [Cost Optimization](./COST_OPTIMIZATION.md) - Strategic provider usage (80/20 split)

**Patterns**:
- [Provider Selection](../patterns/PROVIDER_SELECTION.md) - Decision tree (GitHub Copilot-focused)
- [VS Code Integration](../patterns/VS_CODE_INTEGRATION.md) - Extension setup and keyboard shortcuts

**Enforcement**:
- [Hybrid Enforcement](../enforcement/HYBRID_ENFORCEMENT.md) - STRICT vs FLEXIBLE rules
- [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md) - Quality checks for GitHub Copilot
- [Quality Gates](../enforcement/QUALITY_GATES.md) - Pre-commit validation

---

**Status**: Production Ready  
**Version**: 2.0.0 (GitHub Copilot Migration)  
**Maintenance**: Update as new issues discovered  
**Owner**: Developer Experience Team
