# Cost Optimization with Free AI Models

**Status**: Production Ready  
**Last Updated**: January 5, 2026  
**Purpose**: Strategic use of free/offline models (Groq, Ollama) to minimize AI development costs while maintaining quality

---

## Overview

OpenCode.ai supports **75+ AI providers**, enabling cost optimization through strategic model selection:

- **Premium models** (Claude Sonnet 3.5, GPT-4): $0.03/1K tokens (~$3/hour)
- **Free models** (Groq Llama 3.3 70B): $0.00/1K tokens
- **Offline models** (Ollama): $0.00 (hardware cost only)

**Strategy**: Use **free models for 80% of development** (routine work), premium for 20% (complex/critical).

---

## Cost Breakdown

### Premium Providers (Claude Sonnet 3.5)

**Pricing**: ~$0.03 per 1K tokens (input + output averaged)

**Typical Session Costs**:
```
Simple bug fix (30 min):      $1.50
Feature implementation (2h):  $6.00
Complex refactor (4h):        $12.00
Full day development (8h):    $24.00
```

**Monthly Cost** (assuming 160h/month):
- 100% premium usage: ~$480/month
- 80% free, 20% premium: ~$96/month
- 95% free, 5% premium: ~$24/month

**Break-even Analysis**:
- GitHub Copilot: $10/month (inline only, no conversation)
- Claude Pro: $20/month (no code execution)
- **OpenCode with Groq**: $0/month (free tier)

**Savings**: $480/month → $0-96/month (**80-100% cost reduction**)

---

### Free Providers (Groq Llama 3.3 70B)

**Pricing**: $0.00 (free tier with rate limits)

**Rate Limits**:
- **Llama 3.3 70B Versatile**: 30 requests/min, 14,400/day
- **Llama 3.1 70B**: 30 requests/min, 14,400/day
- **Llama 3.3 70B SpecDec**: 30 requests/min, 14,400/day

**Typical Usage**:
```
1 hour development session:
- ~60 requests (1 per minute average)
- Well within rate limits

Full day (8 hours):
- ~480 requests
- Still within 14,400/day limit
```

**Limitations**:
- Rate limits reset daily (not cumulative)
- No guaranteed SLA (best-effort)
- Quality 85-90% of Claude (requires enhanced validation)

**Best For**: 80% of routine development (bug fixes, refactoring, pattern-following).

---

### Offline Providers (Ollama)

**Pricing**: $0 API costs (hardware cost only)

**Hardware Requirements**:
- **CodeLlama 34B**: 64GB RAM, M2/M3 Mac or high-end PC (~$2,000-4,000 hardware)
- **Qwen2.5 Coder 7B**: 16GB RAM, any modern laptop (~$1,000+ hardware)

**Cost Analysis**:
```
Hardware amortized over 3 years:
- $3,000 laptop / 36 months = $83/month hardware cost
- vs. $480/month Claude usage
- Savings: $397/month after initial investment
```

**Limitations**:
- Quality 50-70% of Claude (requires full manual review)
- Slower inference (depends on hardware)
- No internet access during offline work

**Best For**: Drafting implementations when offline, cost-sensitive projects.

---

## Strategic Model Allocation

### 80/20 Rule: Free for Routine, Premium for Critical

**Recommended Allocation**:

| Task Type | Groq (Free) | Claude (Premium) | Ollama (Offline) |
|-----------|-------------|------------------|------------------|
| **Bug fixes** (following existing patterns) | ✅ 90% | ❌ 10% (complex) | ✅ 80% (offline) |
| **Refactoring** (within established architecture) | ✅ 85% | ❌ 15% (breaking changes) | ✅ 70% |
| **Feature implementation** (DCYFR patterns) | ✅ 75% | ⚠️ 25% (new patterns) | ⚠️ 50% (draft only) |
| **UI updates** (design system) | ✅ 95% | ❌ 5% (complex layouts) | ✅ 80% |
| **Documentation** | ✅ 100% | ❌ 0% | ✅ 100% |
| **Testing** (adding tests) | ✅ 90% | ❌ 10% (complex E2E) | ✅ 75% |
| **Security work** (auth, API keys) | ❌ 0% | ✅ 100% | ❌ 0% |
| **Architecture decisions** | ❌ 10% | ✅ 90% | ❌ 0% |
| **Complex debugging** (root cause unknown) | ⚠️ 50% (initial) | ✅ 50% (if stuck) | ❌ 25% |
| **API integration** (following patterns) | ✅ 80% | ⚠️ 20% (validation) | ⚠️ 60% |

**Expected Overall Split**:
- **Groq**: 70-80% of tasks
- **Claude**: 15-25% of tasks
- **Ollama**: 5-10% of tasks (offline only)

**Cost Impact**:
```
Premium-only: $480/month
80% Groq, 20% Claude: $96/month (80% savings)
90% Groq, 10% Claude: $48/month (90% savings)
```

---

## Cost Tracking

### Usage Metrics Dashboard

**Location**: `.opencode/metrics/usage.json`

**Schema**:
```json
{
  "month": "2026-01",
  "providers": {
    "groq_primary": {
      "requests": 3420,
      "tokens": 856000,
      "cost": 0.00,
      "hours": 28.5
    },
    "claude": {
      "requests": 180,
      "tokens": 95000,
      "cost": 2.85,
      "hours": 3.0
    },
    "ollama": {
      "requests": 240,
      "tokens": 120000,
      "cost": 0.00,
      "hours": 4.0
    }
  },
  "total": {
    "hours": 35.5,
    "cost": 2.85,
    "cost_if_premium": 106.50,
    "savings": 103.65,
    "savings_percent": 97.3
  }
}
```

**Update Automatically** (via OpenCode extension telemetry):
```bash
# View current month
cat .opencode/metrics/usage.json | jq .

# Generate report
npm run metrics:cost-report
# Output: Markdown report in docs/metrics/cost-report-2026-01.md
```

---

### ROI Analysis

**Calculate return on investment** for free model strategy:

```bash
npm run metrics:roi-analysis

# Output:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧮 ROI Analysis: Free Model Strategy
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Time Period: January 2026 (35.5 hours)
#
# Cost Breakdown:
# - Premium-only cost: $106.50
# - Actual cost (hybrid): $2.85
# - Savings: $103.65 (97.3%)
#
# Model Allocation:
# - Groq (free): 28.5h (80.3%)
# - Claude (premium): 3.0h (8.5%)
# - Ollama (offline): 4.0h (11.3%)
#
# Quality Impact:
# - STRICT rule violations: 3 (all caught by validation)
# - FLEXIBLE warnings: 8 (reviewed during PR)
# - Escalations to premium: 2 (6.7% of tasks)
#
# Recommendation: ✅ Strategy working well
# - Continue 80/20 allocation
# - Quality maintained with enhanced validation
# - Significant cost savings achieved
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Task-Specific Cost Strategies

### Bug Fixes (Use Groq 90%)

**Workflow**:
```bash
# Step 1: Diagnose with Groq
opencode --preset groq_primary
# Prompt: "Debug issue in UserProfile component"

# Step 2: If stuck after 30 min, escalate
npm run session:save opencode
opencode --preset claude
npm run session:restore opencode
# Prompt: "Continue debugging (stuck on root cause)"

# Expected cost: $0 (Groq) + $1.50 (Claude) = $1.50 total
# vs. $3.00 if Claude-only
```

**ROI**: 50% cost savings

---

### Feature Implementation (Use Groq 75%)

**Workflow**:
```bash
# Step 1: Draft with Groq
opencode --preset groq_primary
# Prompt: "Implement user notifications feature"

# Step 2: Validate with enhanced checks
scripts/validate-after-fallback.sh

# Step 3: If STRICT violations, fix with Groq auto-retry
# (Groq usually succeeds on 2nd attempt)

# Step 4: Only escalate if 3+ violations
# (5-10% of features require escalation)

# Expected cost: $0 (Groq) + $0-1.50 (rare Claude) = $0-1.50
# vs. $6.00 if Claude-only
```

**ROI**: 75-100% cost savings

---

### Refactoring (Use Groq 85%)

**Workflow**:
```bash
# Step 1: Refactor with Groq
opencode --preset groq_primary
# Prompt: "Refactor PostCard to use design tokens"

# Step 2: Run validation
npm run check:opencode

# Step 3: Fix violations with Groq
# (Design token refactoring is well-defined, Groq handles well)

# Expected cost: $0 (Groq)
# vs. $3.00 if Claude-only
```

**ROI**: 100% cost savings

---

### Security Work (Use Claude 100%)

**Workflow**:
```bash
# ALWAYS use premium model for security
opencode --preset claude
# Prompt: "Implement API key rotation"

# No Groq/Ollama for:
# - Authentication (NextAuth, OAuth)
# - API keys/secrets
# - User data handling
# - External integrations (payment, third-party APIs)

# Expected cost: $3.00 (Claude)
# vs. $0 (Groq) + $10.00 (security incident if wrong)
```

**ROI**: Risk mitigation (not cost savings)

---

## Groq Rate Limit Management

### Understanding Rate Limits

**Groq Free Tier Limits**:
- **Per Minute**: 30 requests
- **Per Day**: 14,400 requests

**Typical Development Usage**:
```
Real-time coding (fast iteration):
- 1-2 requests/min → ~120 requests/hour
- Within 30/min limit ✅

Batch operations (refactoring):
- 5-10 requests/min → ~600 requests/hour
- Within 30/min limit ✅

Aggressive usage (rapid debugging):
- 15-20 requests/min → ~1,200 requests/hour
- Near 30/min limit ⚠️
```

**Daily Capacity**:
```
Full 8-hour day at 1 req/min:     480 requests  (3.3% of daily limit)
Full 8-hour day at 10 req/min:  4,800 requests (33.3% of daily limit)
Maximum sustainable usage:     14,400 requests (100% of daily limit)

Conclusion: Daily limit rarely an issue for single developer
```

---

### Rate Limit Mitigation

**If you hit rate limits**:

```bash
# Option 1: Slow down (add delay between requests)
# OpenCode extension settings:
{
  "opencode.rateLimit.delay": 2000  // 2 seconds between requests
}

# Option 2: Switch to alternative Groq model
opencode --preset groq_speed  # Llama 3.3 70B SpecDec (separate limit)

# Option 3: Fallback to Ollama (offline)
opencode --preset offline_primary

# Option 4: Escalate to premium (if critical)
opencode --preset claude
```

**Prevention**:
- Batch operations (multiple changes in single request)
- Use editor context (avoid re-explaining same context)
- Leverage session state (restore context instead of re-generating)

---

## Cost Optimization Checklist

### ✅ Before Starting Task

- [ ] **Classify task complexity** (routine vs. critical)
- [ ] **Choose appropriate model** (Groq for 80%, Claude for 20%)
- [ ] **Estimate task duration** (know when to escalate)
- [ ] **Check rate limit status** (if using Groq heavily today)

### ✅ During Development

- [ ] **Run local validation first** (TypeScript, ESLint, tests)
- [ ] **Use enhanced validation** (catch issues before escalation)
- [ ] **Track time spent** (escalate if >30 min stuck)
- [ ] **Save session state** (enable seamless escalation)

### ✅ After Completion

- [ ] **Run final validation** (ensure quality maintained)
- [ ] **Update cost tracking** (record provider usage)
- [ ] **Review escalations** (were they necessary?)
- [ ] **Document exceptions** (learn patterns for next time)

---

## Monthly Cost Review

**Template** (run first Monday of each month):

```bash
npm run metrics:cost-report

# Review output:
# 1. Total cost vs. budget
# 2. Model allocation (is 80/20 ratio maintained?)
# 3. Escalation frequency (too high = need better patterns)
# 4. Quality metrics (STRICT violations, test pass rate)
# 5. Recommendations (adjust strategy if needed)
```

**Example Report**:
```markdown
# Cost Report: January 2026

## Summary
- **Total Development Hours**: 160h
- **Actual Cost**: $48.00
- **Premium-Only Cost**: $480.00
- **Savings**: $432.00 (90%)

## Model Allocation
- Groq (free): 136h (85%)
- Claude (premium): 16h (10%)
- Ollama (offline): 8h (5%)

## Quality Metrics
- STRICT violations: 12 (0.075 per hour)
- Escalations: 8 (5% of tasks)
- Test pass rate: 99.1% (target: ≥99%)

## Recommendations
✅ Strategy working well
✅ Quality maintained
⚠️ Consider increasing Ollama usage for offline work (save more)
```

---

## Advanced Optimization Strategies

### 1. Task Batching (Reduce Request Count)

**Strategy**: Combine multiple small tasks into single request.

**Example**:
```
❌ Inefficient (3 separate requests):
Request 1: "Add type annotations to function A"
Request 2: "Add type annotations to function B"
Request 3: "Add type annotations to function C"

✅ Efficient (1 request):
Request 1: "Add type annotations to functions A, B, and C"
```

**Savings**: 66% fewer requests (2 requests saved)

---

### 2. Context Reuse (Reduce Token Usage)

**Strategy**: Use session state to avoid re-explaining context.

**Example**:
```
❌ Inefficient (re-explaining each time):
"I'm working on a NextAuth integration. The app uses App Router.
I need to add a login button..."

✅ Efficient (reference session state):
npm run session:restore opencode
"Continue from previous session. Next: add login button"
```

**Savings**: ~500 tokens per request (context included in session state)

---

### 3. Offline Drafting (Zero API Costs)

**Strategy**: Draft implementation offline, validate online.

**Example**:
```bash
# Offline: Draft with Ollama (0 cost)
opencode --preset offline_primary
# Implement feature (2 hours)

# Online: Validate with Groq (free)
scripts/validate-after-fallback.sh
opencode --preset groq_primary
# Fix violations (15 min)

# Cost: $0 vs. $6 if Claude-only
```

**Savings**: 100% cost savings for drafting phase

---

### 4. Strategic Escalation (Minimize Premium Usage)

**Strategy**: Exhaust free options before escalating to premium.

**Decision Tree**:
```
Task blocked or stuck?
│
├─ Try Groq auto-retry (2 attempts) → Still failing?
│  │
│  ├─ Run enhanced validation → Clear issue identified?
│  │  │
│  │  ├─ Fix manually → Success? ✅ Done ($0 cost)
│  │  │
│  │  └─ Still failing? → Try different Groq model
│  │     │
│  │     └─ Still failing after 3 total attempts?
│  │        │
│  │        └─ ESCALATE to Claude ($1.50-3.00 cost)
│  │
│  └─ Issue unclear? → Use Claude for diagnosis
│
└─ Security/architecture decision? → IMMEDIATE Claude (no free tier)
```

**Result**: Only 5-10% of tasks reach premium escalation.

---

## Related Documentation

**Workflows**:
- [Session Handoff](./SESSION_HANDOFF.md) - Model switching for cost optimization
- [Provider Selection](../patterns/PROVIDER_SELECTION.md) - When to use each model
- [Offline Development](../patterns/OFFLINE_DEVELOPMENT.md) - Zero-cost development

**Enforcement**:
- [Enhanced Validation](../enforcement/VALIDATION_ENHANCED.md) - Ensure free model quality
- [Quality Gates](../enforcement/QUALITY_GATES.md) - Maintain standards across providers

**Scripts**:
- `npm run metrics:cost-report` - Monthly cost analysis
- `npm run metrics:roi-analysis` - ROI calculation
- `scripts/check-provider-health.sh` - Rate limit status

---

**Status**: Production Ready  
**Maintenance**: Review pricing quarterly (providers may change)  
**Owner**: Finance + Engineering Teams
