# Troubleshooting OpenCode & AI Provider Issues

**Status**: Production Ready  
**Last Updated**: January 5, 2026  
**Purpose**: Common issues, root cause analysis, and recovery procedures for OpenCode.ai fallback system

---

## Quick Diagnosis

Run the health check script to identify issues:

```bash
scripts/check-provider-health.sh

# Output will show:
# ✅ Provider available
# ⚠️ Provider degraded (rate limited, slow response)
# ❌ Provider unavailable (auth failure, service down)
```

---

## Common Issues by Provider

### Groq (Free Tier)

#### Issue: Rate Limit Exceeded

**Symptom**:
```
Error: Rate limit exceeded (30 requests/minute)
Please wait 45 seconds before retrying
```

**Root Cause**: Exceeded 30 requests/minute free tier limit.

**Immediate Fix**:
```bash
# Option 1: Wait for rate limit reset (1 minute)
sleep 60
opencode --preset groq_primary  # Retry

# Option 2: Switch to alternative Groq model (separate limit)
opencode --preset groq_speed  # Llama 3.3 70B SpecDec

# Option 3: Fallback to Ollama (offline)
opencode --preset offline_primary

# Option 4: Escalate to premium (if critical)
opencode --preset claude
```

**Long-Term Fix**:
```bash
# Add rate limit delay in OpenCode settings
# .vscode/settings.json:
{
  "opencode.rateLimit.delay": 2000  // 2 seconds between requests
}

# Or batch operations (combine multiple tasks in one request)
```

**Prevention**:
- Monitor daily request count: `cat .opencode/metrics/usage.json | jq '.providers.groq_primary.requests'`
- Use session state to reduce context tokens
- Batch similar operations

---

#### Issue: Daily Quota Exhausted

**Symptom**:
```
Error: Daily quota exceeded (14,400 requests/day)
Resets at midnight UTC
```

**Root Cause**: Exceeded 14,400 requests/day (rare for single developer).

**Immediate Fix**:
```bash
# Switch to Ollama (no quota limits)
opencode --preset offline_primary

# Or escalate to premium
opencode --preset claude
```

**Investigation**:
```bash
# Check if script/automation caused spike
cat .opencode/metrics/usage.json | jq '.providers.groq_primary.requests'

# Expected: <1,000 requests/day for normal development
# Concerning: >5,000 requests/day (investigate automation)
```

**Long-Term Fix**:
- Identify automation causing spike
- Add request throttling to scripts
- Consider premium tier if sustained high usage

---

#### Issue: Model Not Available

**Symptom**:
```
Error: Model "llama-3.3-70b-versatile" not found
```

**Root Cause**: Model name changed or deprecated by Groq.

**Immediate Fix**:
```bash
# List available models
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY" | jq '.data[].id'

# Update config with correct model name
nano .opencode/config.json
# Update "model" field to match available model
```

**Prevention**:
- Check Groq changelog quarterly: https://console.groq.com/docs/changelog
- Subscribe to Groq status updates: https://status.groq.com

---

### Ollama (Offline)

#### Issue: Ollama Service Not Running

**Symptom**:
```
Error: Failed to connect to Ollama at http://localhost:11434
Connection refused
```

**Root Cause**: Ollama service not started.

**Immediate Fix**:
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start service
ollama serve  # Foreground (for debugging)

# Or start as background service
brew services start ollama  # macOS
systemctl start ollama      # Linux
```

**Verification**:
```bash
# Test connection
curl http://localhost:11434/api/tags

# Expected: JSON response with installed models
```

**Prevention**:
```bash
# Enable auto-start on boot
brew services enable ollama  # macOS
systemctl enable ollama      # Linux
```

---

#### Issue: Model Not Pulled

**Symptom**:
```
Error: Model "codellama:34b" not found locally
Pull the model first with: ollama pull codellama:34b
```

**Root Cause**: Model not downloaded yet.

**Immediate Fix**:
```bash
# Pull recommended models
ollama pull codellama:34b     # Best quality (requires 40GB RAM)
ollama pull qwen2.5-coder:7b  # Balanced (requires 8GB RAM)

# Verify models
ollama list
```

**Download Time Estimates**:
- CodeLlama 34B (19GB): ~10-20 minutes on fast connection
- Qwen2.5 Coder 7B (4.7GB): ~3-5 minutes

**Prevention**:
- Pre-pull models during setup (documented in [OFFLINE_DEVELOPMENT.md](../patterns/OFFLINE_DEVELOPMENT.md))
- Verify models exist before first use: `ollama list`

---

#### Issue: Out of Memory (OOM)

**Symptom**:
```
Ollama process killed by system
Or: Response very slow (>2 min for simple request)
```

**Root Cause**: Model too large for available RAM.

**Immediate Fix**:
```bash
# Switch to smaller model
ollama pull qwen2.5-coder:7b  # Requires only 8GB RAM

# Update OpenCode config
nano .opencode/config.json
# Change "offline_primary" to use qwen2.5-coder:7b

# Or switch to Groq (free, no local memory required)
opencode --preset groq_primary
```

**Long-Term Fix**:
- Upgrade RAM (64GB recommended for CodeLlama 34B)
- Use cloud instance with sufficient RAM
- Stick with smaller models (Qwen2.5 Coder 7B)

**RAM Requirements**:
- CodeLlama 34B: 40GB minimum, 64GB recommended
- CodeLlama 13B: 16GB minimum, 32GB recommended
- Qwen2.5 Coder 7B: 8GB minimum, 16GB recommended
- DeepSeek Coder 6.7B: 4GB minimum, 8GB recommended

---

#### Issue: Slow Inference Speed

**Symptom**: Each request takes >30 seconds.

**Root Cause**: No GPU acceleration, or CPU-only inference.

**Immediate Fix**:
```bash
# Check if GPU detected
nvidia-smi  # Linux (NVIDIA)
# Or check Activity Monitor → GPU tab (macOS Metal)

# If no GPU, switch to faster model
ollama pull deepseek-coder:6.7b  # Faster on CPU

# Or use Groq (cloud inference, very fast)
opencode --preset groq_speed  # Llama 3.3 70B SpecDec
```

**Long-Term Fix**:
- **macOS**: Ollama auto-uses Metal on M1/M2/M3 (no config needed)
- **Linux**: Install NVIDIA drivers + CUDA toolkit
- **Windows**: Install CUDA toolkit from NVIDIA

**Expected Speeds**:
- **With GPU**: 50-100 tokens/second (acceptable)
- **Without GPU**: 5-20 tokens/second (slow but usable)
- **Groq Cloud**: 200-500 tokens/second (very fast, but rate limited)

---

### Claude (Premium)

#### Issue: Rate Limit / Quota Exceeded

**Symptom**:
```
Error: Rate limit exceeded
Your organization has reached the maximum requests per minute
```

**Root Cause**: Claude Pro/API rate limits hit.

**Immediate Fix**:
```bash
# Fallback to Groq (free tier)
npm run session:save claude
opencode --preset groq_primary
npm run session:restore claude
```

**Long-Term Fix**:
- Upgrade to higher Claude tier (if available)
- Use Claude strategically (20% premium, 80% free)
- Implement request queuing (batch operations)

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

# If missing, create from template
mkdir -p .opencode
cat > .opencode/config.json <<'EOF'
{
  "groq_primary": {
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "apiKey": "${GROQ_API_KEY}",
    "description": "Primary free model for feature implementation"
  }
}
EOF

# Reload VS Code window
# Command Palette → "Reload Window"
```

---

## Validation Issues

### Issue: STRICT Rule Violations Not Caught

**Symptom**: Free model generates code with design token violations, but no error.

**Root Cause**: Enhanced validation script not run.

**Immediate Fix**:
```bash
# Run enhanced validation manually
scripts/validate-after-fallback.sh

# Expected: Exit code 1 if STRICT violations found
echo $?  # 0 = pass, 1 = violations
```

**Long-Term Fix**:
```bash
# Add pre-commit hook
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
scripts/validate-after-fallback.sh || exit 1
EOF

chmod +x .git/hooks/pre-commit

# Now validation runs automatically on commit
```

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

---

### Issue: Tests Fail After Free Model Changes

**Symptom**: `npm run test:run` shows 5 new failures.

**Root Cause**: Free model generated code with subtle bugs (missing edge cases).

**Immediate Fix**:
```bash
# Run tests in verbose mode
npm run test -- --reporter=verbose

# Identify failures
# Option 1: Fix tests if expectations wrong
# Option 2: Fix implementation if logic wrong

# Re-run validation
npm run check:opencode
```

**Escalation Trigger**:
- If >3 test failures AND implementation looks correct:
  - Escalate to Claude for review
  - Free model may have misunderstood requirements

---

## Session Handoff Issues

### Issue: Session State Corrupted

**Symptom**: `npm run session:restore <agent>` shows garbled data.

**Root Cause**: Manual edit of JSON file, or incomplete save operation.

**Immediate Fix**:
```bash
# Delete corrupted session state
rm .<agent>/.session-state.json

# Create fresh session state
npm run session:save <agent>

# Manually document current context (if needed)
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

---

## Network & Connectivity Issues

### Issue: No Internet Connection (Offline)

**Symptom**: Groq/Claude requests fail with "Network unreachable".

**Root Cause**: No internet access.

**Immediate Fix**:
```bash
# Switch to Ollama (offline capable)
opencode --preset offline_primary

# Verify Ollama service running locally
curl http://localhost:11434/api/tags
```

**Recovery** (when back online):
```bash
# Run enhanced validation
scripts/validate-after-fallback.sh

# Fix any STRICT violations
opencode --preset groq_primary

# Commit if clean
npm run check:opencode && git commit
```

---

### Issue: Proxy/Firewall Blocking API Requests

**Symptom**: Groq/Claude requests timeout after 30 seconds.

**Root Cause**: Corporate proxy or firewall blocking API endpoints.

**Immediate Fix**:
```bash
# Option 1: Configure proxy in environment
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Restart VS Code to apply proxy settings

# Option 2: Use Ollama (no external requests)
opencode --preset offline_primary
```

**Verification**:
```bash
# Test connectivity to Groq API
curl -I https://api.groq.com/openai/v1/models

# Expected: HTTP 200 or 401 (not timeout)
```

---

## Quality Issues

### Issue: Free Model Generates Low-Quality Code

**Symptom**: Code works but violates DCYFR patterns repeatedly.

**Root Cause**: Free model (Groq/Ollama) has 60-90% pattern adherence (vs. Claude's 95%).

**Not a Bug**: This is expected behavior. Free models require enhanced validation.

**Immediate Fix**:
```bash
# Run enhanced validation
scripts/validate-after-fallback.sh

# Review manual checklist
cat .opencode/enforcement/VALIDATION_ENHANCED.md

# Fix violations manually or escalate
opencode --preset claude  # If too many violations
```

**Long-Term Fix**:
- Accept that free models need more validation
- Budget 10-15% extra time for manual review
- Use free models for 80% of work, premium for 20%

---

### Issue: Offline Model Misses Patterns Entirely

**Symptom**: Ollama generates code without PageLayout, uses deep imports, etc.

**Root Cause**: Offline models (CodeLlama, Qwen) have 50-70% pattern adherence.

**Not a Bug**: Offline models are for **drafting only**, not production-ready code.

**Recommended Workflow**:
```bash
# Step 1: Draft offline (Ollama)
opencode --preset offline_primary
# Implement feature (fast, zero cost)

# Step 2: When back online, validate
scripts/validate-after-fallback.sh
# Identify all violations

# Step 3: Fix with Groq (free, online)
opencode --preset groq_primary
# Fix STRICT violations

# Step 4: Final validation
npm run check:opencode
# Ensure production-ready
```

**Expected Time**:
- Offline draft: 2 hours
- Online validation + fixes: 30 minutes
- Total: 2.5 hours (vs. 2 hours if Claude-only)

**Trade-off**: +25% time, but 100% cost savings.

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
rm .opencode/config.json
cp .opencode/config.json.template .opencode/config.json

# Step 4: Reinstall OpenCode extension
code --uninstall-extension sst-dev.opencode
code --install-extension sst-dev.opencode

# Step 5: Reload VS Code
# Command Palette → "Reload Window"

# Step 6: Test basic functionality
opencode --preset groq_primary
# Prompt: "console.log('test')"

# Step 7: Restore work if successful
git stash pop
```

**If still failing**:
- Check provider status pages:
  - Groq: https://status.groq.com
  - Anthropic: https://status.anthropic.com
  - Ollama: `systemctl status ollama`

- Escalate to premium provider:
  - Switch to Claude temporarily
  - File issue with OpenCode: https://github.com/sst-dev/opencode/issues

---

## Diagnostic Commands

### Provider Health Check

```bash
scripts/check-provider-health.sh

# Checks:
# - Groq API connectivity + rate limits
# - Ollama service status + models
# - OpenCode CLI installation
# - Environment variables (API keys)

# Output:
# ✅ All providers healthy
# ⚠️ Groq rate limited (retry in 30s)
# ❌ Ollama service down (start with: ollama serve)
```

---

### Environment Validation

```bash
# Check all required environment variables
cat <<'EOF' > /tmp/check-env.sh
#!/bin/bash
echo "🔍 Environment Check"
echo ""

# Check API keys
[ -n "$GROQ_API_KEY" ] && echo "✅ GROQ_API_KEY set" || echo "❌ GROQ_API_KEY missing"
[ -n "$ANTHROPIC_API_KEY" ] && echo "✅ ANTHROPIC_API_KEY set" || echo "⚠️ ANTHROPIC_API_KEY missing (optional)"

# Check services
curl -s http://localhost:11434/api/tags > /dev/null && echo "✅ Ollama running" || echo "⚠️ Ollama not running"

# Check OpenCode CLI
command -v opencode > /dev/null && echo "✅ OpenCode CLI installed" || echo "❌ OpenCode CLI not found"

# Check config
[ -f .opencode/config.json ] && echo "✅ Config file exists" || echo "❌ Config file missing"
jq . .opencode/config.json > /dev/null 2>&1 && echo "✅ Config valid JSON" || echo "❌ Config invalid JSON"
EOF

bash /tmp/check-env.sh
```

---

### Validation Status

```bash
# Run all validation checks
npm run check:opencode

# Check TypeScript
npm run type-check

# Check ESLint
npm run lint

# Check tests
npm run test:run

# Check STRICT rules
scripts/validate-after-fallback.sh --strict-only

# Check FLEXIBLE rules
scripts/validate-after-fallback.sh --flexible-only
```

---

## Getting Help

### Internal Resources

1. **Documentation**:
   - [Provider Selection Guide](../patterns/PROVIDER_SELECTION.md)
   - [Offline Development](../patterns/OFFLINE_DEVELOPMENT.md)
   - [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md)

2. **Scripts**:
   - `scripts/check-provider-health.sh`
   - `scripts/validate-after-fallback.sh`
   - `scripts/session-handoff.sh`

3. **Config Templates**:
   - `.opencode/config.json.template`
   - `.claude/.session-state.json.template`

---

### External Resources

1. **OpenCode**:
   - GitHub: https://github.com/sst-dev/opencode
   - Issues: https://github.com/sst-dev/opencode/issues
   - Docs: https://opencode.ai/docs

2. **Groq**:
   - Status: https://status.groq.com
   - Docs: https://console.groq.com/docs
   - Rate Limits: https://console.groq.com/docs/rate-limits

3. **Ollama**:
   - GitHub: https://github.com/ollama/ollama
   - Issues: https://github.com/ollama/ollama/issues
   - Models: https://ollama.com/library

4. **Claude**:
   - Status: https://status.anthropic.com
   - Docs: https://docs.anthropic.com
   - Support: https://support.anthropic.com

---

## Related Documentation

**Workflows**:
- [Session Handoff](./SESSION_HANDOFF.md) - Model switching procedures
- [Cost Optimization](./COST_OPTIMIZATION.md) - Strategic provider usage

**Patterns**:
- [Provider Selection](../patterns/PROVIDER_SELECTION.md) - Decision tree
- [VS Code Integration](../patterns/VS_CODE_INTEGRATION.md) - Extension setup
- [Offline Development](../patterns/OFFLINE_DEVELOPMENT.md) - Ollama workflow

**Enforcement**:
- [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md) - Quality checks
- [Quality Gates](../enforcement/QUALITY_GATES.md) - Pre-commit validation

---

**Status**: Production Ready  
**Maintenance**: Update as new issues discovered  
**Owner**: Developer Experience Team
