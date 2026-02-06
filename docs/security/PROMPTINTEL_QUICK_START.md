# PromptIntel Quick Start Guide

**For Developers:** Quick reference for using PromptIntel threat intelligence in your code

---

## 🚀 Basic Usage

### 1. Scan a Single Prompt

```typescript
import { PromptIntelClient } from '@/mcp/shared/promptintel-client';

const client = new PromptIntelClient({
  apiKey: process.env.PROMPTINTEL_API_KEY!,
});

// Search for known threats
const threats = await client.getPrompts({
  severity: 'critical',
  limit: 10,
});

console.log(`Found ${threats.length} critical threats`);
```

### 2. Check Against IoPC Database

```typescript
async function scanUserInput(input: string): Promise<boolean> {
  const threats = await client.getPrompts({
    category: 'injection',
    limit: 100,
  });

  // Check if input matches known patterns
  const matches = threats.filter(threat =>
    input.toLowerCase().includes(threat.prompt?.toLowerCase() || '')
  );

  return matches.length === 0; // Safe if no matches
}
```

### 3. Get Threat Taxonomy

```typescript
const taxonomy = await client.getTaxonomy({ limit: 50 });

// Access categories
taxonomy.forEach(entry => {
  console.log(`Category: ${entry.category_type}`);
  console.log(`Techniques: ${entry.techniques.length}`);
});
```

### 4. Submit Security Finding

```typescript
await client.submitReport({
  agent_name: 'DCYFR Security Scanner',
  title: 'Prompt Injection Attempt Detected',
  description: 'User attempted to bypass system prompt using ignore previous instructions technique',
  severity: 'high',
  findings: {
    pattern: 'ignore previous instructions',
    detected_at: new Date().toISOString(),
    blocked: true,
  },
  metadata: {
    source: 'contact-form',
    ip_address: '192.0.2.1', // Anonymized
  },
});
```

---

## 🔧 API Integration Examples

### Express.js Middleware

```typescript
import { PromptIntelClient } from '@/mcp/shared/promptintel-client';

const client = new PromptIntelClient({
  apiKey: process.env.PROMPTINTEL_API_KEY!,
});

export async function promptSecurityCheck(req, res, next) {
  const userInput = req.body.prompt || req.body.message;

  if (!userInput) return next();

  try {
    const threats = await client.getPrompts({
      severity: 'high',
      limit: 50,
    });

    const isThreat = threats.some(t =>
      userInput.toLowerCase().includes(t.pattern)
    );

    if (isThreat) {
      return res.status(403).json({
        error: 'Security violation detected',
        code: 'PROMPT_INJECTION_ATTEMPT',
      });
    }

    next();
  } catch (error) {
    console.error('PromptIntel check failed:', error);
    next(); // Fail open on errors
  }
}
```

### Next.js API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PromptIntelClient } from '@/mcp/shared/promptintel-client';

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  // Initialize client
  const client = new PromptIntelClient({
    apiKey: process.env.PROMPTINTEL_API_KEY!,
  });

  // Check for threats
  const threats = await client.getPrompts({
    severity: 'critical',
    category: 'injection',
    limit: 20,
  });

  const hasThreats = threats.some(t =>
    message.includes(t.indicator)
  );

  if (hasThreats) {
    return NextResponse.json(
      { error: 'Potential security threat detected' },
      { status: 403 }
    );
  }

  // Process message...
  return NextResponse.json({ success: true });
}
```

---

## 📊 Response Formats

### Threat Search Response

```typescript
{
  data: [],  // Array of threats (may be empty)
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}
```

### Taxonomy Response

```typescript
{
  data: {
    title: "LLM Security Threats Classification",
    author: "Thomas Roccia (@fr0gger_)",
    categories: [
      {
        name: "Prompt Injection",
        techniques: [...],
        severity: "high"
      }
    ]
  }
}
```

---

## 💡 Best Practices

### 1. Caching

```typescript
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedThreats(severity: string) {
  const cacheKey = `threats:${severity}`;
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const threats = await client.getPrompts({ severity });
  cache.set(cacheKey, {
    data: threats,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return threats;
}
```

### 2. Error Handling

```typescript
async function safeScan(input: string): Promise<boolean> {
  try {
    const threats = await client.getPrompts({ limit: 100 });
    return !threats.some(t => input.includes(t.pattern));
  } catch (error) {
    console.error('Scan failed:', error);
    // Fail open - don't block on errors
    return true;
  }
}
```

### 3. Rate Limiting

```typescript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute',
});

async function rateLimitedScan(input: string) {
  await limiter.removeTokens(1);
  return await client.getPrompts({ limit: 50 });
}
```

---

## 🔍 Common Patterns

### Pattern 1: Input Validation

```typescript
const INJECTION_PATTERNS = [
  /ignore (previous|all) instructions/i,
  /system prompt/i,
  /you are now/i,
  /forget everything/i,
];

function hasInjectionPattern(input: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(input));
}
```

### Pattern 2: Severity-Based Blocking

```typescript
async function checkThreatLevel(input: string): Promise<'safe' | 'warn' | 'block'> {
  const critical = await client.getPrompts({ severity: 'critical' });
  const high = await client.getPrompts({ severity: 'high' });

  if (critical.some(t => input.includes(t.pattern))) return 'block';
  if (high.some(t => input.includes(t.pattern))) return 'warn';
  return 'safe';
}
```

### Pattern 3: Threat Reporting

```typescript
async function reportAndBlock(input: string, context: any) {
  // Block the request
  const response = { error: 'Security violation', code: 403 };

  // Report to PromptIntel
  await client.submitReport({
    agent_name: 'DCYFR Scanner',
    title: 'Injection Attempt',
    description: `Pattern detected: ${input.substring(0, 100)}`,
    severity: 'high',
    findings: context,
    metadata: { timestamp: new Date().toISOString() },
  });

  return response;
}
```

---

## 🧪 Testing

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { PromptIntelClient } from '@/mcp/shared/promptintel-client';

describe('Prompt Security', () => {
  it('should detect injection attempts', async () => {
    const client = new PromptIntelClient({
      apiKey: process.env.PROMPTINTEL_API_KEY!,
    });

    const threats = await client.getPrompts({
      severity: 'critical',
      limit: 10,
    });

    expect(threats).toBeDefined();
    expect(Array.isArray(threats)).toBe(true);
  });
});
```

---

## 📚 Additional Resources

- [PromptIntel API Documentation](https://promptintel.novahunting.ai/docs)
- [Integration Plan](./PROMPTINTEL_INTEGRATION_PLAN.md)
- [Test Suite](../tests/integration/threat-intel-integration.test.ts)
- [MCP Server](../src/mcp/promptintel-server.ts)

---

**Need Help?**
- Check [docs/PROMPTINTEL_INTEGRATION_PLAN.md](./PROMPTINTEL_INTEGRATION_PLAN.md)
- Review test examples in `tests/integration/`
- Contact security team

**Last Updated:** February 2, 2026
