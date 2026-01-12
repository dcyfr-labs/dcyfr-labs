# OpenCode Token Tracking Setup - Quick Start

## The Problem

You're seeing **$0 cost across all OpenCode prompts** because **GitHub Copilot models are included in your $20/month subscription** at no per-token charge. This is actually correct - you're paying flat-fee, not per-token.

**What you need to know:**
- ✅ GitHub Copilot (GPT-5 Mini, Raptor Mini): Free (included)
- ❌ Premium models (Claude, GPT-4o): Would cost $3-5 per 1M tokens

---

## Quick Verification (2 minutes)

### Check GitHub Copilot is Active

```bash
# 1. Verify GitHub Copilot subscription
# Visit: https://github.com/settings/copilot

# 2. Check OpenCode is using GitHub Copilot (not other provider)
opencode
/models
# Should show: gpt-5-mini, raptor-mini, gpt-4o

# 3. View OpenCode token usage in GitHub dashboard
# Visit: https://github.com/settings/copilot/logs
```

---

## New Token Tracking System (Added Today)

### Setup (1 minute)

```bash
# Already installed! No setup needed
# Scripts added to: .opencode/scripts/track-session.mjs
# NPM commands added to package.json
```

### Track Your Sessions

After completing an OpenCode session, log it:

```bash
npm run opencode:track log '{
  "userInput": "Implement blog filter component",
  "assistantResponse": "<full response>",
  "model": "gpt-5-mini",
  "task": "feature",
  "duration": 1800,
  "quality": 5
}'
```

### View Reports

```bash
# Text report (human-readable)
npm run opencode:report

# JSON report (for scripts/dashboards)
npm run opencode:report:json

# Last 5 sessions
npm run opencode:track:last

# Clear logs
npm run opencode:track:clear
```

### Sample Output

```
📊 OpenCode Token Usage Report
================================

Total Sessions: 5
Total Estimated Tokens: 45,230
  Input: 12,340
  Output: 32,890
Total Time: 87 minutes
Average Quality: 4.6/5

📍 By Model:
  gpt-5-mini:
    Sessions: 5
    Tokens: 45,230 (in: 12,340, out: 32,890)

🎯 By Task:
  feature:
    Sessions: 3
    Tokens: 28,450
    Avg Quality: 4.7/5
  bugfix:
    Sessions: 2
    Tokens: 16,780
    Avg Quality: 4.5/5

💰 Cost Estimation:
  GitHub Copilot: $0 (included with $20/month subscription)
  If Claude Sonnet 4: $0.14 (45,230 tokens @ $3/1M)
  If GPT-4o: $0.23 (45,230 tokens @ $5/1M)

✅ Savings with GitHub Copilot: $0.14-0.23/month
```

---

## Key Insights

### Why $0 in OpenCode?

GitHub Copilot pricing model:
```
$20/month subscription includes:
├─ GPT-5 Mini (16K context)
├─ Raptor Mini (8K context)
├─ GPT-4o (128K context)
└─ All usage is unlimited (per-token cost = $0)
```

### Cost Comparison

| Provider | Monthly Fee | Per-Token Cost | 45K Tokens |
|----------|------------|----------------|-----------|
| **GitHub Copilot** | $20 | $0 | **$0** ✅ |
| Claude Sonnet 4 | $0 | $3/1M | $0.14 |
| GPT-4o | $0 | $5/1M | $0.23 |
| Groq (old) | $0 | $0 (rate-limited) | $0 |

**You're saving $0.14-0.23 per 45K tokens by using GitHub Copilot!**

---

## Usage Recommendations

### What to Track

- **Task**: feature, bugfix, refactor, documentation, testing
- **Duration**: How long the session took (in seconds)
- **Quality**: 1-5 rating of output quality
- **Model**: gpt-5-mini (default), raptor-mini, or other

### Example Log Entry

```bash
npm run opencode:track log '{
  "userInput": "Implement dark mode toggle in settings",
  "assistantResponse": "<full response from OpenCode>",
  "model": "gpt-5-mini",
  "task": "feature",
  "duration": 2400,
  "quality": 5,
  "notes": "Needed 2 iterations, final output excellent"
}'
```

### When to Use Each Model

```
GPT-5 Mini (16K context)
├─ Default for most tasks
├─ Features, bugfixes, refactoring
└─ Use 80% of the time

Raptor Mini (8K context)
├─ Fast iterations
├─ Simple bug fixes
└─ Use 20% of the time (when time-critical)
```

---

## Advanced: Helicone Integration (Optional)

For **exact token counting**, use Helicone as a proxy:

1. Create account: https://app.helicone.ai
2. Get API key: https://app.helicone.ai/settings/api-keys
3. Update `.opencode/opencode.json` provider config
4. View detailed dashboards at https://app.helicone.ai

**Benefits:**
- Exact input/output tokens (not estimated)
- Request/response logging
- Session grouping
- Web dashboard

**Trade-off:** +100-200ms latency per request

---

## Files Added

```
.opencode/
├── OPENCODE_TOKEN_TRACKING.md      ← Full documentation
├── scripts/
│   └── track-session.mjs           ← Tracking script
└── .session-log.jsonl              ← Log file (auto-created)

package.json
├── "opencode:track"                ← Log a session
├── "opencode:report"               ← Generate text report
├── "opencode:report:json"          ← Generate JSON report
├── "opencode:track:last"           ← Show last 5 sessions
└── "opencode:track:clear"          ← Clear logs
```

---

## Next Steps

1. ✅ Verify GitHub Copilot is active
2. ✅ Start tracking sessions: `npm run opencode:track log '...'`
3. ✅ Review reports: `npm run opencode:report`
4. 📊 Optional: Set up Helicone for detailed tracking
5. 📈 Optional: Build custom dashboard from JSON logs

---

## FAQ

**Q: Why does OpenCode show $0?**
A: GitHub Copilot models are flat-fee ($20/month). No per-token charges.

**Q: Am I actually paying for token usage?**
A: No. You pay $20/month for unlimited usage of all GitHub Copilot models.

**Q: How do I know I'm not using premium models?**
A: Run `opencode /models` - should only show `gpt-5-mini`, `raptor-mini`, `gpt-4o`.

**Q: Can I track actual token counts?**
A: Yes! Set up Helicone proxy for exact counts (optional).

**Q: Should I switch to Claude?**
A: Only for security-sensitive work where the $0.14-0.23 premium cost is justified.

---

**Created:** January 12, 2026  
**Status:** Ready to Use  
**See Also:** [OPENCODE_TOKEN_TRACKING.md](OPENCODE_TOKEN_TRACKING.md)
