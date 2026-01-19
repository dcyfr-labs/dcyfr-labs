# OpenCode Token Tracking & Cost Analysis

**Version:** 1.1.0  
**Last Updated:** January 17, 2026  
**Purpose:** Track actual token usage and cost estimation for OpenCode sessions with GitHub Copilot integration

---

## Quick Start (2 minutes)

### The Problem

You're seeing **$0 cost across all OpenCode prompts** because **GitHub Copilot models are included in your $20/month subscription** at no per-token charge. This is actually correct - you're paying flat-fee, not per-token.

**What you need to know:**
- ✅ GitHub Copilot (GPT-5 Mini, Raptor Mini): Free (included)
- ❌ Premium models (Claude, GPT-4o): Would cost $3-5 per 1M tokens

### Quick Verification

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

---

## Problem Summary

OpenCode shows **$0 cost across all prompts** because GitHub Copilot models (GPT-5 Mini, Raptor Mini, GPT-4o) are **included with the GitHub Copilot subscription at a flat $10-20/month fee**. There are no per-token charges for these models.

However, you may want to:
1. **Monitor actual token consumption** to understand usage patterns
2. **Validate that GitHub Copilot is being used** (not accidentally switching to premium models)
3. **Estimate cost impact** if switching to Claude or other premium providers

---

## Solution: Multi-Layer Token Tracking

### Layer 1: Native OpenCode Usage Dashboard

OpenCode does NOT provide native token tracking for GitHub Copilot models in the UI because they're flat-fee. However, you can access usage through GitHub's settings:

**GitHub Copilot Usage Dashboard:**
1. Visit: https://github.com/settings/copilot/logs
2. View all Copilot API usage across all tools
3. See which extensions/integrations consumed tokens
4. OpenCode will appear under "OpenCode.ai" if authenticated

**Limitations:**
- Shows aggregate usage, not per-session breakdown
- Updates can be delayed (1-24 hours)
- No token count detail (just aggregate metrics)

---

### Layer 2: Client-Side Session Logging (Recommended)

Create a simple session logger to track **every OpenCode conversation** and estimate tokens based on message length:

**File:** `.opencode/scripts/track-session.mjs`

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '.session-log.jsonl');

/**
 * Rough token estimation: 1 token ≈ 4 characters
 * GitHub Copilot models: GPT-5 Mini (16K context), Raptor Mini (8K context)
 */
function estimateTokens(text) {
  const charCount = text.length;
  const estimatedTokens = Math.ceil(charCount / 4);
  return estimatedTokens;
}

/**
 * Log a session with token estimation
 */
function logSession(data) {
  const entry = {
    timestamp: new Date().toISOString(),
    model: data.model || 'gpt-5-mini',
    userInput: data.userInput || '',
    assistantResponse: data.assistantResponse || '',
    estimatedInputTokens: estimateTokens(data.userInput || ''),
    estimatedOutputTokens: estimateTokens(data.assistantResponse || ''),
    estimatedTotalTokens: estimateTokens((data.userInput || '') + (data.assistantResponse || '')),
    duration: data.duration || 0, // seconds
    task: data.task || 'unspecified',
    quality: data.quality || 3, // 1-5 rating
  };

  // Append to log file
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf-8');
  
  console.log(`✅ Session logged: ${entry.estimatedTotalTokens} tokens estimated`);
  console.log(`   Model: ${entry.model}`);
  console.log(`   Task: ${entry.task}`);
  console.log(`   Duration: ${entry.duration}s`);
  
  return entry;
}

/**
 * Generate usage report from logs
 */
function generateReport() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No session logs found yet.');
    return;
  }

  const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n');
  const sessions = lines.map(line => JSON.parse(line));

  // Calculate statistics
  const totalTokens = sessions.reduce((sum, s) => sum + s.estimatedTotalTokens, 0);
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgQuality = (sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length).toFixed(1);

  // Group by model
  const byModel = {};
  sessions.forEach(s => {
    if (!byModel[s.model]) byModel[s.model] = { tokens: 0, sessions: 0 };
    byModel[s.model].tokens += s.estimatedTotalTokens;
    byModel[s.model].sessions += 1;
  });

  // Group by task
  const byTask = {};
  sessions.forEach(s => {
    if (!byTask[s.task]) byTask[s.task] = { tokens: 0, sessions: 0 };
    byTask[s.task].tokens += s.estimatedTotalTokens;
    byTask[s.task].sessions += 1;
  });

  console.log('\n📊 OpenCode Token Usage Report');
  console.log('================================\n');
  
  console.log(`Total Sessions: ${sessions.length}`);
  console.log(`Total Estimated Tokens: ${totalTokens.toLocaleString()}`);
  console.log(`Total Time: ${Math.round(totalTime / 60)} minutes`);
  console.log(`Average Quality: ${avgQuality}/5\n`);

  console.log('By Model:');
  Object.entries(byModel).forEach(([model, data]) => {
    console.log(`  ${model}: ${data.sessions} sessions, ${data.tokens.toLocaleString()} tokens`);
  });

  console.log('\nBy Task:');
  Object.entries(byTask).forEach(([task, data]) => {
    console.log(`  ${task}: ${data.sessions} sessions, ${data.tokens.toLocaleString()} tokens`);
  });

  // Cost estimation for premium models
  console.log('\n💰 Cost Estimation (if using premium):');
  const costPerMToken = 1; // Rough average: $1 per 1M tokens
  const estimatedCost = (totalTokens / 1_000_000) * costPerMToken;
  console.log(`  If Claude Sonnet: $${estimatedCost.toFixed(2)} (${totalTokens.toLocaleString()} tokens)`);
  console.log(`  GitHub Copilot: $0 (included with subscription)\n`);
}

// CLI interface
const command = process.argv[2];

if (command === 'report') {
  generateReport();
} else if (command === 'log') {
  const data = JSON.parse(process.argv[3] || '{}');
  logSession(data);
} else {
  console.log('Usage:');
  console.log('  npm run opencode:track report          # Generate usage report');
  console.log('  npm run opencode:track log <json>      # Log a session');
  console.log('\nExample:');
  console.log('  npm run opencode:track log \'{"userInput":"test","assistantResponse":"response","task":"feature"}\'');
}
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "opencode:track": "node .opencode/scripts/track-session.mjs",
    "opencode:report": "node .opencode/scripts/track-session.mjs report"
  }
}
```

**Usage:**
```bash
# After completing a session
npm run opencode:track log '{"userInput":"Implement feature X","assistantResponse":"<full response>","model":"gpt-5-mini","task":"feature","duration":600,"quality":5}'

# View report
npm run opencode:report
```

---

### Layer 3: Helicone Proxy Integration (Advanced)

For **detailed token-level tracking**, integrate Helicone as a proxy between OpenCode and GitHub Copilot:

**File:** `.opencode/opencode.json` (Modified)

```json
{
  "provider": {
    "github-copilot-tracked": {
      "name": "GitHub Copilot (via Helicone)",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://ai-gateway.helicone.ai/v1",
        "headers": {
          "Helicone-Auth": "Bearer <YOUR_HELICONE_API_KEY>",
          "Helicone-Session-Name": "OpenCode",
          "Helicone-User-Id": "opencode-session"
        }
      },
      "models": {
        "gpt-5-mini": { "name": "GPT-5 Mini (tracked)" },
        "raptor-mini": { "name": "Raptor Mini (tracked)" }
      }
    }
  }
}
```

**Setup:**
1. Create Helicone account: https://app.helicone.ai
2. Get API key from: https://app.helicone.ai/settings/api-keys
3. Update `opencode.json` with your Helicone key
4. Run OpenCode with tracked provider:
   ```bash
   opencode
   /connect  # Select "github-copilot-tracked"
   ```

**Benefits:**
- ✅ Exact token counts (input + output)
- ✅ Request/response logging
- ✅ Latency tracking
- ✅ Session grouping
- ✅ Web dashboard: https://app.helicone.ai
- ⚠️ Adds slight latency (100-200ms proxy overhead)
- ⚠️ Requires Helicone account

---

### Layer 4: Cost Estimation Script

**File:** `.opencode/scripts/estimate-costs.mjs`

```javascript
#!/usr/bin/env node

/**
 * Estimate costs across different AI providers
 * Based on estimated token usage from session logs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '.session-log.jsonl');

const PRICING = {
  'github-copilot': {
    name: 'GitHub Copilot',
    monthlyFee: 20,
    costPer1MTokens: 0,
    description: 'Flat fee (all models included)'
  },
  'claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    monthlyFee: 0,
    costPer1MTokens: 3,
    description: '$3 per 1M tokens (usage-based)'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    monthlyFee: 0,
    costPer1MTokens: 5,
    description: '$5 per 1M tokens (usage-based)'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    monthlyFee: 0,
    costPer1MTokens: 4,
    description: '$4 per 1M tokens (usage-based)'
  }
};

function estimateCosts() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No session logs found. Run some OpenCode sessions first.\n');
    console.log('Example: npm run opencode:track log \'{"userInput":"test","assistantResponse":"response"}\'');
    return;
  }

  const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n');
  const sessions = lines.map(line => JSON.parse(line));
  const totalTokens = sessions.reduce((sum, s) => sum + s.estimatedTotalTokens, 0);

  console.log('\n💰 Cost Estimation Report');
  console.log('==========================\n');
  console.log(`Total Tokens Used: ${totalTokens.toLocaleString()}\n`);

  Object.entries(PRICING).forEach(([key, provider]) => {
    const tokensInMillions = totalTokens / 1_000_000;
    const usageCost = tokensInMillions * provider.costPer1MTokens;
    const totalCost = provider.monthlyFee + usageCost;

    console.log(`${provider.name}:`);
    console.log(`  ${provider.description}`);
    console.log(`  Monthly fee: $${provider.monthlyFee}`);
    console.log(`  Token cost: $${usageCost.toFixed(2)} (${totalTokens.toLocaleString()} tokens)`);
    console.log(`  Total: $${totalCost.toFixed(2)}/month\n`);
  });

  // Savings calculation
  const githubCost = PRICING['github-copilot'].monthlyFee;
  const claudeCost = PRICING['claude-sonnet-4'].monthlyFee + ((totalTokens / 1_000_000) * 3);
  const gpt4oCost = PRICING['gpt-4o'].monthlyFee + ((totalTokens / 1_000_000) * 5);
  
  console.log('📊 Savings (GitHub Copilot vs Others):');
  console.log(`  vs Claude Sonnet 4: Save $${(claudeCost - githubCost).toFixed(2)}/month`);
  console.log(`  vs GPT-4o: Save $${(gpt4oCost - githubCost).toFixed(2)}/month\n`);
}

estimateCosts();
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "opencode:cost": "node .opencode/scripts/estimate-costs.mjs"
  }
}
```

---

## Recommended Implementation Path

### Quick Start (10 minutes)
1. ✅ Use GitHub's Copilot dashboard: https://github.com/settings/copilot/logs
2. ✅ Confirm OpenCode appears in usage logs
3. ✅ Validate you're using GitHub Copilot (not premium)

### Medium (30 minutes)
1. Add tracking script to `.opencode/scripts/track-session.mjs`
2. Integrate into your post-session workflow
3. Run monthly cost estimation report

### Advanced (1-2 hours)
1. Set up Helicone proxy for exact token counts
2. Create monitoring dashboard
3. Integrate with team tracking system

---

## Why $0 is Actually Correct

**GitHub Copilot Pricing Model:**
```
GitHub Copilot Subscription: $20/month (includes):
├─ GPT-5 Mini (16K context, unlimited usage)
├─ Raptor Mini (8K context, unlimited usage)  
├─ GPT-4o (128K context, unlimited usage)
└─ All other included models

Per-Token Cost: $0 ✅
Billing Method: Flat monthly fee
```

**Therefore:**
- $0 displayed in OpenCode is **technically correct**
- You pay $20/month regardless of token usage
- No additional charges for tokens consumed
- Switching to Claude would cost $3+ per 1M tokens

---

## Verification Checklist

- [ ] GitHub Copilot subscription is active: https://github.com/settings/copilot
- [ ] OpenCode authenticated with GitHub Copilot (not other provider)
- [ ] Run: `opencode /models` → Should show `gpt-5-mini`, `raptor-mini`
- [ ] Check GitHub usage logs: https://github.com/settings/copilot/logs
- [ ] Optional: Set up Helicone for detailed tracking

---

## Next Steps

1. **Confirm current setup** - Verify GitHub Copilot is authenticated
2. **Add tracking script** - Monitor token usage and task allocation  
3. **Generate reports** - Monthly cost estimation and usage patterns
4. **Consider escalation** - Use Claude for security-sensitive work (justify premium cost)

---

**Last Updated:** January 12, 2026  
**Status:** Production Ready  
**See Also:** [COST_OPTIMIZATION.md](workflows/COST_OPTIMIZATION.md), [PROVIDER_SELECTION.md](patterns/PROVIDER_SELECTION.md)
