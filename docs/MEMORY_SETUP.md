<!-- TLP:AMBER - Internal Use Only -->
# Memory Setup Guide for dcyfr-labs

**Information Classification:** TLP:AMBER (Limited Distribution)
**Audience:** Internal Team Only

Production memory layer configuration for dcyfr-labs application.

---

## Environment Configuration

### Required Variables

Add to `.env.local` (development) or deployment environment:

```bash
# Vector Database (Production: Qdrant Cloud)
VECTOR_DB_PROVIDER=qdrant
QDRANT_URL=https://your-cluster.qdrant.tech:6333
QDRANT_API_KEY=your-production-api-key

# LLM Provider (OpenAI)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-production-key

# Optional: Memory Caching
ENABLE_MEMORY_CACHING=true
MEMORY_CACHE_TTL=300  # 5 minutes

# Optional: Debug Mode
DEBUG=dcyfr:memory*  # Development only
```

### Development Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your development credentials
VECTOR_DB_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=dev-key

LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-dev-key
```

---

## Docker Configuration

### Local Development

Start Qdrant for local development:

```bash
# Start Qdrant container
docker run -d \
  --name qdrant-dev \
  -p 6333:6333 \
  -v $(pwd)/.data/qdrant:/qdrant/storage \
  qdrant/qdrant:latest

# Verify it's running
curl http://localhost:6333/health
```

### Production (Docker Compose)

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:v1.7.0
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      QDRANT__SERVICE__HTTP_PORT: 6333
      QDRANT__SERVICE__GRPC_PORT: 6334
      QDRANT__CLUSTER__ENABLED: false
      QDRANT__STORAGE__OPTIMIZERS__VACUUM_MIN_VECTOR_NUMBER: 1000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  qdrant_data:
```

---

## API Endpoints

The memory layer is exposed through these dcyfr-labs API routes:

### POST /api/memory/add

Store a user memory.

```bash
curl -X POST http://localhost:3000/api/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "message": "I prefer TypeScript over JavaScript",
    "context": {
      "topic": "programming",
      "importance": 0.8
    }
  }'
```

**Response:**
```json
{
  "memoryId": "mem-abc123",
  "stored": true
}
```

### POST /api/memory/search

Search user memories.

```bash
curl -X POST http://localhost:3000/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "query": "programming languages",
    "limit": 3
  }'
```

**Response:**
```json
{
  "memories": [
    {
      "id": "mem-abc123",
      "content": "I prefer TypeScript over JavaScript",
      "importance": 0.8,
      "topic": "programming",
      "createdAt": "2026-02-08T10:30:00.000Z"
    }
  ],
  "count": 1,
  "limit": 3
}
```

### Rate Limits

- `/api/memory/add`: 10 requests per minute per IP
- `/api/memory/search`: 20 requests per minute per IP

### Error Responses

```json
// Validation error
{
  "error": "userId is required and must be a string"
}

// Rate limit exceeded
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}

// Server error
{
  "error": "Failed to store memory. Please try again later."
}
```

---

## Integration with Chat Interface

### Adding Memory to Chat Flow

Update your chat implementation to include memory context:

```typescript
// In your chat API route
import { getMemory } from '@dcyfr/ai';

export async function POST(request: NextRequest) {
  const { userId, message } = await request.json();

  const memory = getMemory();

  // 1. Retrieve relevant memories
  const memories = await memory.searchUserMemories(userId, message, 3);

  // 2. Build enhanced prompt
  const memoryContext = memories
    .map(m => `Previous: ${m.content}`)
    .join('\n');

  const enhancedPrompt = `
${memoryContext ? `Context:\n${memoryContext}\n\n` : ''}
User: ${message}
  `;

  // 3. Call LLM with memory context
  const response = await callLLM(enhancedPrompt);

  // 4. Store the interaction
  await memory.addUserMemory(userId, message, {
    topic: 'chat',
    importance: 0.7
  });

  return NextResponse.json({
    response,
    memoriesUsed: memories.length
  });
}
```

### Frontend Integration

```typescript
// React hook for memory-enhanced chat
export function useMemoryChat(userId: string) {
  const sendMessage = async (message: string) => {
    // Send to enhanced chat endpoint
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message })
    });

    const data = await response.json();

    console.log(`Used ${data.memoriesUsed} memories from context`);
    return data.response;
  };

  return { sendMessage };
}
```

---

## Monitoring & Analytics

### Memory Usage Tracking

```typescript
// Add to your analytics system
export async function trackMemoryUsage(userId: string) {
  const memory = getMemory();
  const userMemories = await memory.getUserMemories(userId);

  // Track metrics
  analytics.track('memory_usage', {
    userId,
    memoryCount: userMemories.length,
    topics: [...new Set(userMemories.map(m => m.topic).filter(Boolean))],
    avgImportance: userMemories.reduce((sum, m) => sum + (m.importance || 0), 0) / userMemories.length
  });
}
```

### Health Monitoring

Add to your health check endpoint:

```typescript
// In /api/health/route.ts
import { getMemory } from '@dcyfr/ai';

export async function GET() {
  try {
    const memory = getMemory();

    // Test memory operations
    const testId = await memory.addUserMemory('health-check', 'test');
    const results = await memory.searchUserMemories('health-check', 'test', 1);
    await memory.deleteUserMemory('health-check', testId);

    return NextResponse.json({
      status: 'healthy',
      memory: {
        status: 'operational',
        tested: true,
        searchWorking: results.length > 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      memory: {
        status: 'error',
        error: error.message
      }
    }, { status: 503 });
  }
}
```

---

## Performance Optimization

### Caching Strategy

Memory operations are cached by default. Configure cache behavior:

```bash
# Cache settings
ENABLE_MEMORY_CACHING=true
MEMORY_CACHE_TTL=300  # 5 minutes

# Redis cache (if using Redis for other features)
REDIS_URL=redis://localhost:6379
```

### Search Optimization

```typescript
// Optimize search queries
const optimizeSearchQuery = (userInput: string) => {
  // Remove stop words, focus on key terms
  return userInput
    .toLowerCase()
    .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, '')
    .trim();
};

const memories = await memory.searchUserMemories(
  userId,
  optimizeSearchQuery(query),
  3
);
```

### Batch Operations

```typescript
// Batch memory additions for better performance
const addMemoriesBatch = async (userId: string, messages: string[]) => {
  const promises = messages.map(message =>
    memory.addUserMemory(userId, message, {
      topic: 'chat',
      importance: 0.5
    })
  );

  return await Promise.all(promises);
};
```

---

## Testing

### Test Configuration

```typescript
// In vitest setup
import { resetMemory } from '@dcyfr/ai';

beforeEach(() => {
  // Reset memory instance for clean tests
  resetMemory();

  // Mock environment
  vi.stubEnv('VECTOR_DB_PROVIDER', 'qdrant');
  vi.stubEnv('LLM_PROVIDER', 'openai');
  vi.stubEnv('QDRANT_URL', 'http://localhost:6333');
});
```

### Integration Tests

Run the memory API tests:

```bash
# Test memory API routes
npm run test tests/integration/memory-api.test.ts

# Test with coverage
npm run test:coverage -- tests/integration/memory-api.test.ts
```

### Load Testing

```bash
# Install k6 for load testing
brew install k6

# Test memory endpoints
k6 run scripts/load-test-memory.js
```

Example load test script:

```javascript
// scripts/load-test-memory.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '60s', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  const payload = JSON.stringify({
    userId: `user-${Math.floor(Math.random() * 1000)}`,
    message: 'Test message for load testing',
    context: { topic: 'test' }
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  let response = http.post('http://localhost:3000/api/memory/add', payload, params);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });
}
```

---

## Deployment

### Vercel Deployment

Add environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add production values:
   - `VECTOR_DB_PROVIDER=qdrant`
   - `QDRANT_URL=https://your-cluster.qdrant.tech:6333`
   - `QDRANT_API_KEY=your-production-key`
   - `LLM_PROVIDER=openai`
   - `OPENAI_API_KEY=sk-your-production-key`

### Qdrant Cloud Setup

1. Create account at [cloud.qdrant.tech](https://cloud.qdrant.tech)
2. Create cluster (1GB free tier available)
3. Note cluster URL and API key
4. Configure collection settings for optimal performance

### Monitoring

Add memory metrics to your monitoring dashboard:

```typescript
// Send metrics to your monitoring service
const trackMemoryMetrics = async () => {
  const memory = getMemory();

  // Track operation latency
  const start = Date.now();
  await memory.searchUserMemories('test', 'query', 1);
  const latency = Date.now() - start;

  metrics.gauge('memory.search_latency_ms', latency);
  metrics.increment('memory.operations_total');
};
```

---

## Security Considerations

### Data Privacy

- User memories are isolated by userId
- No cross-user data leakage
- API logs anonymize user identifiers
- Vector embeddings cannot be reverse-engineered

### Rate Limiting

- Implemented at API layer (Redis-backed)
- Fail-closed on Redis errors
- Per-IP rate limiting to prevent abuse
- Exponential backoff recommended for clients

### API Security

```typescript
// Add authentication to memory endpoints (recommended)
export async function POST(request: NextRequest) {
  // Verify user authentication
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user can access this userId
  if (body.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Continue with memory operations...
}
```

---

## Troubleshooting

### Common Issues

**Memory not persisting**
- Check environment variables are set
- Verify Qdrant connection
- Check API endpoint responses

**Search returns no results**
- Verify memories were added successfully
- Try broader search terms
- Check user ID consistency

**Rate limit errors**
- Implement exponential backoff
- Consider user-based limits vs IP-based
- Cache frequent searches

**Performance issues**
- Enable memory caching
- Optimize search queries
- Consider batch operations
- Review vector database performance

### Debug Commands

```bash
# Check memory configuration
cd dcyfr-labs && npm run health:memory

# Test memory operations
curl -X POST http://localhost:3000/api/health

# View debug logs
DEBUG=dcyfr:memory* npm run dev
```

---

**Last Updated:** February 8, 2026
**Environment:** dcyfr-labs v2026.01.02
**Memory Layer:** @dcyfr/ai v1.0.0+
