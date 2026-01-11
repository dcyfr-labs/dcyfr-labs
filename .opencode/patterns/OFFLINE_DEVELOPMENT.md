# Offline Development with Ollama

**Status**: Production Ready  
**Last Updated**: January 5, 2026  
**Purpose**: Enable DCYFR pattern enforcement without internet connectivity using local AI models

---

## Overview

Ollama provides fully offline AI development capabilities, enabling you to continue working with DCYFR patterns when:
- Working without internet access (flights, remote locations)
- Avoiding API rate limits or costs
- Maintaining privacy for sensitive codebases
- Developing in air-gapped environments

**Trade-offs**:
- ✅ Zero API costs, full privacy, no rate limits
- ⚠️ Reduced quality compared to Groq/Claude (manual validation required)
- ⚠️ Slower inference speed (depends on hardware)
- ⚠️ Manual pattern enforcement (no automated validation)

---

## Quick Start

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

**Verify installation**:
```bash
ollama --version
# Expected: ollama version 0.x.x
```

### 2. Pull Recommended Models

**For Feature Implementation** (Llama 3.3 70B equivalent):
```bash
# Best quality (requires 40GB+ RAM)
ollama pull codellama:34b

# Balanced option (requires 8GB+ RAM)
ollama pull qwen2.5-coder:7b
```

**For Quick Fixes** (Llama 3.3 70B SpecDec equivalent):
```bash
# Lightweight for code completions
ollama pull deepseek-coder:6.7b
```

**Verify models**:
```bash
ollama list
# Expected output:
# NAME                      ID              SIZE
# codellama:34b            abc123...        19GB
# qwen2.5-coder:7b         def456...        4.7GB
# deepseek-coder:6.7b      ghi789...        3.8GB
```

### 3. Configure OpenCode

Update `.opencode/config.json` with offline presets:

```json
{
  "offline_primary": {
    "provider": "ollama",
    "model": "codellama:34b",
    "baseURL": "http://localhost:11434",
    "description": "Offline feature implementation (requires 40GB+ RAM)"
  },
  "offline_balanced": {
    "provider": "ollama",
    "model": "qwen2.5-coder:7b",
    "baseURL": "http://localhost:11434",
    "description": "Balanced offline work (requires 8GB+ RAM)"
  },
  "offline_quick": {
    "provider": "ollama",
    "model": "deepseek-coder:6.7b",
    "baseURL": "http://localhost:11434",
    "description": "Quick code completions (requires 4GB+ RAM)"
  }
}
```

### 4. Start Ollama Service

```bash
# macOS/Linux (background service)
ollama serve

# Or use system service
brew services start ollama  # macOS
systemctl start ollama      # Linux
```

**Verify service**:
```bash
curl http://localhost:11434/api/tags
# Expected: JSON response with installed models
```

---

## Model Selection Guide

### Hardware Requirements

| Model               | RAM Required | Quality      | Speed       | Best For                    |
|---------------------|--------------|--------------|-------------|-----------------------------|
| **codellama:34b**   | 40GB+        | ⭐⭐⭐⭐     | Slow        | Feature implementation      |
| **qwen2.5-coder:7b**| 8GB+         | ⭐⭐⭐       | Medium      | General development         |
| **deepseek-coder:6.7b** | 4GB+     | ⭐⭐         | Fast        | Quick fixes, completions    |
| **codellama:13b**   | 16GB+        | ⭐⭐⭐       | Medium      | Balanced alternative        |

**Recommended configuration**:
- **64GB+ RAM**: Use `codellama:34b` for primary work
- **16-32GB RAM**: Use `qwen2.5-coder:7b` or `codellama:13b`
- **8-16GB RAM**: Use `deepseek-coder:6.7b` with manual review
- **<8GB RAM**: Offline development not recommended

### Quality vs. Online Models

```
Quality Spectrum (DCYFR Pattern Adherence):

Claude Sonnet 3.5 ████████████████████ 95%
Groq Llama 3.3 70B ███████████████████  90%
CodeLlama 34B      ████████████         60%
Qwen2.5 Coder 7B   ██████████           50%
DeepSeek Coder     ████████             40%
```

**Implication**: Offline models require **enhanced manual validation** (see [VALIDATION_ENHANCED.md](../enforcement/VALIDATION_ENHANCED.md))

---

## Offline Workflow Strategy

### When to Use Offline Models

✅ **Good offline use cases**:
- Quick bug fixes with existing patterns
- Code refactoring following established architecture
- Local testing and experimentation
- Non-critical feature additions
- Emergency fixes without internet

❌ **Poor offline use cases**:
- Complex architectural decisions (use Claude when online)
- Security-sensitive changes (requires premium validation)
- New pattern creation (needs research via Octocode)
- Breaking changes (requires approval gates)
- Production deployments (must validate online first)

### Hybrid Offline Strategy

**Recommended approach**: Use offline models for drafting, validate online before committing.

```bash
# Step 1: Draft implementation offline
opencode --preset offline_primary

# Step 2: Save session state
npm run session:save opencode

# Step 3: When back online, restore and validate
npm run session:restore opencode
npm run check:opencode  # Validates against STRICT rules

# Step 4: If STRICT rules fail, fix with premium model
opencode --preset groq_primary  # Fix violations
```

---

## Pattern Enforcement Limitations

### What Works Offline

✅ **Can be checked locally**:
- TypeScript compilation (`npm run type-check`)
- ESLint violations (`npm run lint`)
- Test execution (`npm run test:run`)
- Import structure (barrel exports)
- Basic code formatting

### What Requires Manual Review

⚠️ **Manual checks required**:
- Design token compliance (check against `src/design-system/tokens/`)
- PageLayout decision tree (90% rule requires context)
- API pattern adherence (Validate→Queue→Respond)
- Test coverage quality (99% pass rate target)
- Security vulnerability patterns

**Strategy**: Use `.opencode/enforcement/VALIDATION_ENHANCED.md` checklist after offline sessions.

---

## Enhanced Validation Workflow

### 1. Pre-Offline Preparation

```bash
# Pull latest patterns from main
git pull origin main

# Verify local tooling works
npm run check
npm run test:run

# Save baseline state
npm run session:save opencode
```

### 2. Offline Development

```bash
# Start Ollama service
ollama serve

# Use OpenCode with offline preset
opencode --preset offline_primary

# Run local validations frequently
npm run type-check
npm run lint
npm run test:run
```

### 3. Post-Offline Validation

```bash
# When back online, run enhanced validation
npm run check:opencode

# Review STRICT rule violations
scripts/validate-after-fallback.sh

# If violations found, fix with premium model
opencode --preset groq_primary
```

**Manual checklist**: See [VALIDATION_ENHANCED.md](../enforcement/VALIDATION_ENHANCED.md)

---

## Troubleshooting

### Ollama Service Not Starting

**Symptom**: `curl http://localhost:11434/api/tags` fails

**Fixes**:
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart service
brew services restart ollama  # macOS
systemctl restart ollama      # Linux

# Check logs
journalctl -u ollama -f  # Linux
brew services log ollama # macOS
```

### Model Not Found

**Symptom**: OpenCode returns "model not available"

**Fixes**:
```bash
# Verify model is pulled
ollama list

# Re-pull if missing
ollama pull codellama:34b

# Test model directly
ollama run codellama:34b "console.log('test')"
```

### Out of Memory Errors

**Symptom**: Ollama crashes or becomes unresponsive

**Fixes**:
```bash
# Switch to smaller model
ollama pull qwen2.5-coder:7b
# Update .opencode/config.json to use offline_balanced

# Reduce context window in OpenCode settings
# (Smaller context = less memory usage)

# Monitor memory usage
htop  # Linux/macOS
```

### Poor Quality Output

**Symptom**: Generated code violates DCYFR patterns

**Strategy**:
1. Use offline models for **drafting only**
2. Run `npm run check:opencode` when back online
3. Fix violations with `opencode --preset groq_primary`
4. Always validate before committing

**Not a bug**: Offline models have lower pattern adherence by design.

---

## Performance Optimization

### GPU Acceleration

**macOS (Metal)**:
```bash
# Ollama automatically uses Metal on M1/M2/M3 Macs
# Verify GPU usage in Activity Monitor → GPU tab
```

**Linux (NVIDIA)**:
```bash
# Install NVIDIA drivers + CUDA toolkit
# Ollama will automatically detect and use GPU
nvidia-smi  # Verify GPU detection
```

**Windows (NVIDIA)**:
```powershell
# Install CUDA toolkit from NVIDIA
# Ollama will automatically use GPU
```

### Model Quantization

**Trade speed for quality**:
```bash
# Default: Q4 quantization (balanced)
ollama pull codellama:34b

# Higher quality (slower, more memory)
ollama pull codellama:34b-q5

# Faster (lower quality)
ollama pull codellama:34b-q3
```

**Recommendation**: Stick with default Q4 unless you have specific needs.

---

## Integration with OpenCode CLI

### Using Offline Presets

```bash
# Quick fix mode (lightweight)
opencode --preset offline_quick

# Feature implementation (best quality)
opencode --preset offline_primary

# Balanced development
opencode --preset offline_balanced
```

### Switching Between Online/Offline

**Scenario**: Start offline, go online midway

```bash
# Step 1: Work offline
opencode --preset offline_primary
# ... make changes ...
npm run session:save opencode

# Step 2: Switch to online when available
opencode --preset groq_primary
npm run session:restore opencode
# Continue from where you left off
```

**Session state is preserved** across online/offline transitions.

---

## Best Practices

### ✅ Do

- **Use offline models for drafting** initial implementations
- **Run local checks frequently** (`npm run type-check`, `npm run lint`)
- **Save session state** before switching contexts
- **Validate online** before committing to main
- **Document offline work** in commit messages (e.g., "Drafted offline, validated with Groq")
- **Keep models updated** (`ollama pull <model>` monthly)

### ❌ Don't

- **Commit without online validation** (STRICT rules may be violated)
- **Use offline models for security work** (requires premium validation)
- **Skip manual review checklists** (offline models miss patterns)
- **Assume offline = same quality** (expect 40-60% pattern adherence)
- **Use offline for breaking changes** (requires approval gates)

---

## Related Documentation

**Setup & Configuration**:
- [Provider Selection Guide](./PROVIDER_SELECTION.md) - Online vs. offline decision tree
- [VS Code Integration](./VS_CODE_INTEGRATION.md) - OpenCode extension setup

**Validation & Enforcement**:
- [Hybrid Enforcement](../enforcement/HYBRID_ENFORCEMENT.md) - STRICT vs. FLEXIBLE rules
- [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md) - Manual review checklists
- [Quality Gates](../enforcement/QUALITY_GATES.md) - Pre-commit validation

**Workflows**:
- [Session Handoff](../workflows/SESSION_HANDOFF.md) - Offline→Online transitions
- [Troubleshooting](../workflows/TROUBLESHOOTING.md) - Common issues and fixes

**Scripts**:
- `scripts/check-provider-health.sh` - Verify Ollama service status
- `scripts/validate-after-fallback.sh` - Enhanced offline validation

---

## FAQ

**Q: Can I use offline models in production?**  
A: No. Offline models are for **drafting only**. Always validate with `npm run check:opencode` and fix violations with online models before committing.

**Q: Which offline model should I use?**  
A: Depends on your hardware:
- **64GB+ RAM**: `codellama:34b` (best quality)
- **16-32GB RAM**: `qwen2.5-coder:7b` (balanced)
- **8-16GB RAM**: `deepseek-coder:6.7b` (lightweight)

**Q: Do offline models enforce DCYFR patterns?**  
A: Partially (~40-60% adherence). Use [VALIDATION_ENHANCED.md](../enforcement/VALIDATION_ENHANCED.md) checklist for manual review.

**Q: Can I fine-tune Ollama models for DCYFR patterns?**  
A: Technically yes, but **not recommended**. Fine-tuning requires significant compute resources and ongoing maintenance. Better to use online models for pattern enforcement.

**Q: How often should I update Ollama models?**  
A: Pull updates **monthly** or when Ollama releases new versions:
```bash
ollama pull codellama:34b
ollama pull qwen2.5-coder:7b
```

---

**Status**: Production Ready  
**Maintenance**: Update model recommendations quarterly  
**Owner**: Architecture Team
