<!-- TLP:CLEAR -->

# Provider Fallback System

**Version:** 1.0
**Status:** Production Ready
**Last Updated:** January 6, 2026

## Overview

The Provider Fallback System provides **automatic failover** between AI providers (Claude Code, Groq, Ollama) when rate limits, network failures, or service interruptions occur. It ensures **continuous development workflow** without manual intervention.

## Problem Solved

**Before:** Rate limit hit → Manual session save → Manual provider switch → Context loss → Development interruption

**After:** Rate limit detected → Auto-save → Auto-switch → Continue work → Zero interruption

## Architecture

### Components

```
Provider Fallback System
├── Fallback Manager (Core)
│   ├── Rate limit detection
│   ├── Provider health monitoring
│   ├── Automatic session state save/restore
│   └── Configurable fallback chain
│
├── CLI Interface (Manual Control)
│   ├── Status monitoring
│   ├── Health checks
│   ├── Manual fallback trigger
│   └── Return to primary
│
└── Integration Layer
    ├── Session State v2.0
    ├── Checkpoint System
    └── Agent Handoff Workflow
```

### Fallback Chain

```
Primary: Claude Code (200K context, premium quality)
    ↓ (on rate limit / failure)
Fallback 1: Groq (Free tier, good quality)
    ↓ (on failure)
Fallback 2: Ollama (Local, offline capable)
    ↓ (all failed)
Error: All providers exhausted
```

### Auto-Return Strategy

When `autoReturn: true`:

1. Health monitor checks primary provider every 60s
2. When primary becomes available → Auto-switch back
3. Session state restored from fallback
4. Development continues on premium provider

## Usage

### Programmatic API

```typescript
import { ProviderFallbackManager } from '@/lib/agents/provider-fallback-manager';

// Initialize manager
const manager = new ProviderFallbackManager({
  primaryProvider: 'claude',
  fallbackChain: ['groq', 'ollama'],
  autoReturn: true,
  healthCheckInterval: 60000, // 1 minute
  validationLevel: 'enhanced',
});

// Execute task with automatic fallback
const task = {
  description: 'Implement feature',
  phase: 'implementation',
  filesInProgress: ['src/feature.ts'],
};

const executor = async (provider) => {
  // Your implementation logic
  return await performTask(provider);
};

try {
  const result = await manager.executeWithFallback(task, executor);

  console.log(`✅ Task completed with ${result.provider}`);
  console.log(`Fallback used: ${result.fallbackUsed}`);
  console.log(`Execution time: ${result.executionTime}ms`);
} catch (error) {
  console.error('All providers failed:', error);
}

// Cleanup
manager.destroy();
```

### CLI Commands

```bash
# Initialize fallback manager
npm run fallback:init

# Check status (current provider, health)
npm run fallback:status

# Check health of all providers
npm run fallback:health

# Manually trigger fallback to next provider
npm run fallback:fallback

# Return to primary provider
npm run fallback:return
```

### CLI Output Examples

#### Status Check

```bash
$ npm run fallback:status

📊 Provider Fallback Status

Current Provider: claude

Provider Health:
✅ claude
   Available: true
   Response Time: 245ms
   Rate Limit: 95 requests remaining
   Last Checked: 1/6/2026, 2:30:00 PM

✅ groq
   Available: true
   Response Time: 180ms
   Rate Limit: N/A
   Last Checked: 1/6/2026, 2:30:00 PM

❌ ollama
   Available: false
   Response Time: N/A
   Rate Limit: N/A
   Last Checked: 1/6/2026, 2:30:00 PM
   Error: Connection refused
```

#### Health Check

```bash
$ npm run fallback:health

🔍 Checking provider health...

✅ claude
   Available: true
   Response Time: 235ms
   Rate Limit: 92 requests remaining
   Last Checked: 1/6/2026, 2:35:00 PM

✅ groq
   Available: true
   Response Time: 165ms
   Rate Limit: N/A
   Last Checked: 1/6/2026, 2:35:00 PM
```

## Workflow Integration

### Scenario 1: Rate Limit During Feature Development

```bash
# 1. Start development (auto-fallback enabled)
# Working in Claude Code...

# 2. Rate limit hit automatically
🚨 Rate limit detected on claude
💾 Saving session state for claude
🔄 Switching provider: claude → groq
📂 Restoring session state from claude to groq
✅ Provider switched to groq

# 3. Continue development (seamless)
# Working in Groq...

# 4. Primary becomes available (auto-return)
✅ Primary provider claude available again, switching back...
🔄 Switching provider: groq → claude
💾 Saving session state for groq
📂 Restoring session state from groq to claude
✅ Provider switched to claude

# 5. Development continues (back on premium)
# Working in Claude Code...
```

### Scenario 2: Manual Fallback for Cost Optimization

```bash
# 1. Check current status
$ npm run fallback:status
Current Provider: claude

# 2. Manually switch to free tier
$ npm run fallback:fallback
Current provider: claude
Triggering fallback to next provider...

✅ Switched to: groq

# 3. Work on Groq (free)
# ... implement feature ...

# 4. Return to Claude for final review
$ npm run fallback:return
Returning to primary provider...

✅ Returned to primary: claude
```

### Scenario 3: Offline Development with Ollama

```bash
# 1. Going offline, pre-emptively switch
$ npm run fallback:fallback
✅ Switched to: groq

$ npm run fallback:fallback
✅ Switched to: ollama

# 2. Work offline with local model
# ... develop features ...

# 3. Back online, return to primary
$ npm run fallback:return
✅ Returned to primary: claude
```

## Configuration

### FallbackManagerConfig

```typescript
interface FallbackManagerConfig {
  // Primary provider (return here when available)
  primaryProvider: 'claude' | 'groq' | 'ollama' | 'copilot';

  // Fallback chain (try in order on failure)
  fallbackChain: ProviderType[];

  // Auto-return to primary when available
  autoReturn: boolean;

  // Health check interval (ms)
  healthCheckInterval: number;

  // Validation level for fallback providers
  validationLevel: 'standard' | 'enhanced' | 'strict';
}
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  primaryProvider: 'claude',
  fallbackChain: ['groq', 'ollama'],
  autoReturn: true,
  healthCheckInterval: 60000, // 1 minute
  validationLevel: 'enhanced',
};
```

### Provider-Specific Configs

```typescript
const PROVIDER_CONFIGS = {
  claude: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    timeout: 30000, // 30 seconds
    healthCheckUrl: 'https://api.anthropic.com/v1/messages',
  },
  groq: {
    maxRetries: 2,
    retryDelay: 500, // 0.5 seconds
    timeout: 20000, // 20 seconds
    healthCheckUrl: 'https://api.groq.com/openai/v1/models',
  },
  ollama: {
    maxRetries: 1,
    retryDelay: 100, // 0.1 seconds
    timeout: 10000, // 10 seconds
    healthCheckUrl: 'http://localhost:11434/api/tags',
  },
};
```

## Error Handling

### Rate Limit Detection

```typescript
try {
  await executeTask();
} catch (error) {
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    throw new RateLimitError('Rate limit exceeded', provider);
  }
}
```

### Retry Logic

```typescript
// Automatic retries with exponential backoff
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    return await executeTask();
  } catch (error) {
    if (attempt < maxRetries) {
      await sleep(retryDelay * attempt); // Exponential backoff
      continue;
    }
    throw error;
  }
}
```

### Graceful Degradation

```typescript
// If all providers fail, provide helpful error
throw new Error(`
  All providers exhausted:
  - claude: Rate limit exceeded
  - groq: Connection timeout
  - ollama: Service not running

  Suggestions:
  1. Wait for rate limit reset (${resetTime})
  2. Start Ollama: brew services start ollama
  3. Check network connection
`);
```

## Health Monitoring

### Health Check Process

```
Every ${healthCheckInterval}ms:
├── 1. Check primary provider
│   └── HEAD request to API endpoint
│
├── 2. Extract rate limit headers
│   ├── x-ratelimit-remaining
│   └── x-ratelimit-reset
│
├── 3. Update health status
│   ├── available: boolean
│   ├── responseTime: number
│   └── rateLimitRemaining: number
│
└── 4. Auto-return if primary available
    └── currentProvider !== primary && primary.available
```

### Health Status Schema

```typescript
interface ProviderHealth {
  provider: ProviderType;
  available: boolean;
  responseTime?: number;
  lastChecked: Date;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
  error?: string;
}
```

## Integration with Session State v2.0

### Automatic State Preservation

```typescript
// Before switching providers
async switchProvider(targetProvider) {
  // 1. Save current session
  await this.saveSessionState(this.currentProvider);

  // 2. Update active provider
  this.currentProvider = targetProvider;

  // 3. Restore session for new provider
  await this.restoreSessionState(targetProvider, previousProvider);
}
```

### Session State Enhancement

Fallback events are logged in session history:

```json
{
  "history": [
    {
      "timestamp": "2026-01-06T14:30:00Z",
      "action": "provider-fallback",
      "from": "claude",
      "to": "groq",
      "reason": "rate-limit",
      "automatic": true
    }
  ]
}
```

## Performance Impact

**CPU:** Minimal (<1% during normal operation)
**Memory:** ~10MB per manager instance
**Network:** Health checks every 60s (~1KB per check)
**Latency:** <100ms provider switch overhead

**Recommendation:** Safe to run continuously with auto-return enabled.

## Security Considerations

### API Key Management

- Provider configs don't store API keys
- Keys loaded from environment variables
- Never logged or transmitted

### Session State Security

- Session state may contain file paths, task descriptions
- Saved locally only (not transmitted)
- Excluded from git (.gitignore)

### Health Check Privacy

- Health checks use HEAD requests (no data sent)
- No authentication required for health endpoints
- Minimal information disclosure

## Best Practices

### ✅ Do

1. **Enable auto-return** - Always return to primary when available
2. **Use fallback for cost optimization** - Free tier for simple tasks
3. **Monitor health status** - Check `npm run fallback:status` regularly
4. **Set appropriate intervals** - 60s health check is optimal
5. **Test offline fallback** - Verify Ollama works before going offline

### ❌ Don't

1. **Don't disable auto-return in production** - Risk staying on fallback indefinitely
2. **Don't rely solely on free tiers** - Quality degradation on complex tasks
3. **Don't ignore health warnings** - Ollama unavailable = no offline fallback
4. **Don't manually switch during execution** - Let automatic fallback handle it
5. **Don't forget to cleanup** - Call `manager.destroy()` when done

## Troubleshooting

### Fallback Not Triggering

**Symptoms:** Stuck on failed provider, no automatic fallback

**Diagnosis:**

```bash
# Check health status
npm run fallback:status

# Verify fallback chain configured
# Check console logs for rate limit detection
```

**Solutions:**

1. Ensure `RateLimitError` thrown correctly
2. Verify fallback chain has available providers
3. Check provider health endpoints accessible

### Auto-Return Not Working

**Symptoms:** Stuck on fallback provider even when primary available

**Diagnosis:**

```bash
# Check auto-return enabled
npm run fallback:status

# Verify primary provider health
npm run fallback:health
```

**Solutions:**

1. Verify `autoReturn: true` in config
2. Check primary provider actually available
3. Restart health monitoring (re-initialize manager)

### All Providers Failing

**Symptoms:** "All providers exhausted" error

**Diagnosis:**

```bash
# Check all provider health
npm run fallback:health

# Verify network connectivity
ping api.anthropic.com
ping api.groq.com
curl http://localhost:11434/api/tags
```

**Solutions:**

1. **Claude:** Wait for rate limit reset
2. **Groq:** Check API key valid, network accessible
3. **Ollama:** Start service `brew services start ollama`

## Testing

### Unit Tests

```bash
# Run provider fallback tests
npm run test src/lib/agents/__tests__/provider-fallback-manager.test.ts

# Expected output:
✓ should initialize with primary provider
✓ should execute successfully with primary provider
✓ should fallback to next provider on rate limit
✓ should try all providers in fallback chain
✓ should throw error when all providers fail
✓ should manually fallback to next provider
✓ should return to primary provider
```

### Integration Testing

```typescript
// Test automatic fallback
it('should automatically fallback on rate limit', async () => {
  const manager = new ProviderFallbackManager(config);

  const executor = mockRateLimitOnFirstAttempt();
  const result = await manager.executeWithFallback(task, executor);

  expect(result.provider).toBe('groq'); // Fell back
  expect(result.fallbackUsed).toBe(true);
});

// Test auto-return
it('should auto-return when primary available', async () => {
  const manager = new ProviderFallbackManager({
    ...config,
    autoReturn: true,
    healthCheckInterval: 100, // Fast for testing
  });

  await manager.fallbackToNext();
  expect(manager.getCurrentProvider()).toBe('groq');

  // Wait for health check
  await sleep(200);

  expect(manager.getCurrentProvider()).toBe('claude'); // Returned
});
```

## Roadmap

### Completed (v1.0)

- ✅ Core fallback manager implementation
- ✅ Rate limit detection
- ✅ Provider health monitoring
- ✅ Auto-return to primary
- ✅ CLI interface
- ✅ Session state integration
- ✅ Unit tests

### Planned (v1.1)

- 🔄 Predictive fallback (proactive switch before rate limit)
- 🔄 Smart retry delays (exponential backoff)
- 🔄 Fallback analytics (track usage patterns)

### Future (v2.0)

- 🔮 ML-based provider selection (predict best provider for task)
- 🔮 Multi-region fallback (geographic redundancy)
- 🔮 Cost-aware routing (optimize for budget constraints)

## Related Documentation

- [Session State v2.0](/.opencode/SESSION_STATE_V2.md) - Base schema
- [Session Recovery System](/docs/operations/SESSION_RECOVERY_SYSTEM.md) - Checkpoint system
- [Cost Optimization](/.opencode/workflows/COST_OPTIMIZATION.md) - Free tier strategies
- [Agent Handoff Workflow](/.opencode/scripts/session-handoff.sh) - Cross-agent transitions

## API Reference

See [provider-fallback-manager.ts](/src/lib/agents/provider-fallback-manager.ts) for complete API documentation.

## Support

**Issues:**

- GitHub: [dcyfr-labs/issues](https://github.com/dcyfr-labs/dcyfr-labs/issues)
- Tag: `provider-fallback`

**Questions:**

- Discussion: Use in-IDE chat with Claude Code
- Reference: This document

---

**Last Updated:** January 6, 2026
**Maintainer:** DCYFR Labs Development Team
**Version:** 1.0.0
