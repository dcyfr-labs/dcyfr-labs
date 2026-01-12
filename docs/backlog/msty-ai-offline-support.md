# Msty.ai Offline Development Support

**Status:** Backlog  
**Priority:** P3 (Nice to Have)  
**Created:** January 11, 2026  
**Replaces:** Ollama offline support (removed in OpenCode v2.0.0)

---

## Overview

Add offline AI development capabilities using **Msty.ai** as a replacement for the removed Ollama integration. Msty.ai provides a modern, user-friendly interface for running local AI models with better performance and developer experience than Ollama.

---

## Background

### Why Ollama Was Removed

OpenCode.ai v2.0.0 migrated from Groq + Ollama to GitHub Copilot integration:

- **Removed:** Ollama local models (CodeLlama 34B, Qwen2.5 Coder 7B)
- **Reason:** GitHub Copilot provides better quality models (GPT-5 Mini, Raptor Mini) at no additional cost
- **Trade-off:** Lost offline development capability

### Why Msty.ai Is Better

Compared to Ollama:

- ✅ **Better UX** - Modern GUI with chat history, conversation management
- ✅ **Faster inference** - Optimized runtime with metal/CUDA acceleration
- ✅ **Model marketplace** - Easy model discovery and installation
- ✅ **Multi-provider support** - Can connect to OpenAI, Anthropic, Groq, and local models
- ✅ **Developer-friendly** - REST API for integration with tools like OpenCode
- ✅ **Cross-platform** - macOS, Windows, Linux support
- ✅ **Free** - Open-source with no usage fees

**Website:** [msty.app](https://msty.app)

---

## Use Cases

### When Offline Support Is Needed

1. **Air-gapped development** - Secure environments without internet access
2. **Travel/remote work** - Unreliable internet connectivity
3. **Data privacy** - Code must not leave local machine
4. **Cost optimization** - Avoid cloud API fees for exploratory work
5. **Experimentation** - Test different models without API costs

### Realistic Usage (80/20 Rule)

- **80% of work:** GitHub Copilot (GPT-5 Mini, Raptor Mini) - Requires internet
- **15% of work:** Claude Sonnet (premium) - Requires internet
- **5% of work:** Msty.ai offline - When internet unavailable

**Conclusion:** Offline support is a nice-to-have, not critical for most workflows.

---

## Technical Specification

### Architecture

```
OpenCode.ai CLI
    ↓
Msty.ai REST API (http://localhost:10000)
    ↓
Local Model (running on Msty.ai)
    ↓
Code generation (stays on local machine)
```

### Recommended Models

For code generation tasks:

| Model | Size | RAM Required | Quality | Speed |
|-------|------|--------------|---------|-------|
| **CodeLlama 34B** | 19GB | 32GB | Best | Medium |
| **Qwen2.5-Coder 14B** | 8GB | 16GB | Good | Fast |
| **DeepSeek Coder 6.7B** | 4GB | 8GB | Decent | Very Fast |

**Recommendation:** Start with Qwen2.5-Coder 14B (balanced quality/speed)

### Integration with OpenCode

Add Msty.ai provider to `.opencode/config.json`:

```json
{
  "offline": {
    "provider": "msty",
    "baseURL": "http://localhost:10000/v1",
    "model": "qwen2.5-coder:14b",
    "temperature": 0.2,
    "maxTokens": 8192,
    "description": "Offline development via Msty.ai"
  },
  "presets": {
    "dcyfr-offline": {
      "providerId": "offline",
      "systemPrompt": "DCYFR pattern enforcement (design tokens, PageLayout, barrel exports). You are working offline - reference .github/agents/ docs for patterns."
    }
  }
}
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "opencode:offline": "opencode --preset dcyfr-offline",
    "msty:health": "curl -s http://localhost:10000/v1/models | jq",
    "msty:start": "open -a Msty"
  }
}
```

---

## Implementation Tasks

### Phase 1: Basic Setup (2-3 hours)

- [ ] Download and install Msty.ai from [msty.app](https://msty.app)
- [ ] Pull recommended model: Qwen2.5-Coder 14B
- [ ] Test REST API: `curl http://localhost:10000/v1/models`
- [ ] Add Msty provider to `.opencode/config.json`
- [ ] Create `dcyfr-offline` preset
- [ ] Test with simple code generation task

### Phase 2: Documentation (1-2 hours)

- [ ] Create `.opencode/patterns/OFFLINE_DEVELOPMENT_MSTY.md`
- [ ] Document model selection guidelines
- [ ] Add troubleshooting section (connection issues, OOM, slow inference)
- [ ] Update `.opencode/README.md` with Msty.ai reference
- [ ] Update `AGENTS.md` with offline capability restoration note

### Phase 3: Validation Scripts (1-2 hours)

- [ ] Create `scripts/check-msty-health.sh`
- [ ] Add Msty connectivity check to `npm run opencode:health`
- [ ] Create `scripts/setup-msty.sh` for first-time setup
- [ ] Add offline validation workflow

### Phase 4: Testing (2-3 hours)

- [ ] Test feature implementation with Qwen2.5-Coder 14B
- [ ] Verify DCYFR pattern enforcement works offline
- [ ] Test enhanced validation: `npm run check:opencode`
- [ ] Compare quality vs GitHub Copilot GPT-5 Mini
- [ ] Document quality trade-offs

---

## Quality Expectations

### Expected Performance

| Aspect | GitHub Copilot GPT-5 Mini | Msty.ai Qwen2.5-Coder 14B |
|--------|---------------------------|---------------------------|
| **Code Quality** | 95% | 70-80% |
| **Pattern Following** | Good (with prompts) | Fair (requires explicit reference) |
| **Speed** | Fast (cloud) | Medium (local, depends on hardware) |
| **Context Window** | 16K tokens | 8-32K tokens |
| **DCYFR Enforcement** | Manual review required | Manual review required |
| **Cost** | $0 (included) | $0 (hardware only) |

### Validation Requirements

All offline-generated code must pass enhanced validation:

```bash
# After offline session, run full validation
npm run check:opencode

# Expected checks:
# - Design tokens compliance
# - Barrel exports used
# - PageLayout used (90% rule)
# - Test data has environment checks
# - No emojis in public content
```

**Escalation:** If offline model produces low-quality code repeatedly, escalate to GitHub Copilot (when online) or Claude Sonnet (premium).

---

## Acceptance Criteria

- [ ] Msty.ai installed and running locally
- [ ] OpenCode can connect to Msty.ai REST API
- [ ] `dcyfr-offline` preset works end-to-end
- [ ] Code generated passes `npm run check:opencode` validation
- [ ] Documentation complete (setup, usage, troubleshooting)
- [ ] Performance benchmarked (quality, speed vs GitHub Copilot)

---

## Risks & Mitigations

### Risk 1: Hardware Requirements

**Problem:** Local models require significant RAM (16-32GB minimum)

**Mitigation:**
- Document hardware requirements clearly
- Offer multiple model sizes (6B, 14B, 34B)
- Mark as optional capability (not required for DCYFR development)

### Risk 2: Quality Lower Than GitHub Copilot

**Problem:** Local models (Qwen2.5-Coder 14B) ~70-80% quality vs GPT-5 Mini ~95%

**Mitigation:**
- Enhanced validation required (`npm run check:opencode`)
- Document expected quality trade-off
- Recommend offline mode only for drafting, use GitHub Copilot for polish

### Risk 3: Setup Complexity

**Problem:** Installing Msty.ai, pulling models, configuring OpenCode may be complex

**Mitigation:**
- Create `scripts/setup-msty.sh` automation
- Provide step-by-step documentation with screenshots
- Offer support via GitHub Discussions

---

## Cost-Benefit Analysis

### Implementation Cost

- **Time:** 6-10 hours total
- **Effort:** Low-Medium (mostly documentation and configuration)
- **Dependencies:** Msty.ai (free), local hardware (existing)

### Benefit

- **Value:** Nice-to-have (enables offline development ~5% of time)
- **Users affected:** Developers needing offline capability (subset of users)
- **ROI:** Low-Medium (not critical, but useful for edge cases)

### Decision

**Defer to backlog** - Not critical for v2.0.0 launch. Implement if user requests increase or offline development becomes more common.

---

## Alternative Solutions

### Option A: Keep Ollama (Rejected)

**Pros:** Already implemented in v1.0  
**Cons:** Poor UX, slower than Msty.ai, harder to configure

**Decision:** Msty.ai is superior replacement

### Option B: No Offline Support (Current)

**Pros:** Simpler architecture, rely on GitHub Copilot (included)  
**Cons:** No offline capability

**Decision:** Acceptable for now, add Msty.ai later if needed

### Option C: Use LM Studio

**Pros:** Mature, stable, similar to Msty.ai  
**Cons:** Less modern UX, slower development

**Decision:** Msty.ai is better developer experience

---

## References

- **Msty.ai:** [msty.app](https://msty.app)
- **Qwen2.5-Coder:** [huggingface.co/Qwen/Qwen2.5-Coder-14B](https://huggingface.co/Qwen/Qwen2.5-Coder-14B)
- **OpenCode Provider Docs:** [opencode.ai/docs/providers](https://opencode.ai/docs/providers)
- **Removed Ollama Implementation:** `.opencode/patterns/OFFLINE_DEVELOPMENT.md` (deleted in v2.0.0)

---

**Status:** Backlog (P3)  
**Next Steps:** Await user requests or offline development need increase  
**Owner:** Architecture Team
