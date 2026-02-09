import { test, expect, Page } from '@playwright/test';
import type { Memory } from './utils/memory';

/**
 * End-to-End Memory Layer Tests
 *
 * These tests verify the memory layer works correctly in real browser
 * environments, testing memory persistence, search relevance, and
 * performance under realistic usage scenarios.
 */

// Test data for realistic memory scenarios
const testMemories = {
  programming: [
    'I prefer TypeScript over JavaScript for large applications because of type safety',
    'React hooks like useState and useEffect make functional components more powerful',
    'I always use Tailwind CSS for styling instead of writing custom CSS',
    'Next.js App Router is much better than Pages Router for new projects'
  ],
  preferences: [
    'I prefer dark mode interfaces over light themes',
    'I work best in the morning between 8 AM and 12 PM',
    'I like minimal design with lots of whitespace',
    'I prefer documentation with code examples over text explanations'
  ],
  context: [
    'I am building a React dashboard for data visualization',
    'My current project uses PostgreSQL with Prisma ORM',
    'I need to optimize performance for mobile devices',
    'I am working on integrating authentication with Clerk'
  ]
};

// Helper functions for memory testing
async function addMemory(page: Page, userId: string, message: string, context?: any) {
  const response = await page.request.post('/api/memory/add', {
    data: {
      userId,
      message,
      context
    }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.stored).toBe(true);
  expect(data.memoryId).toBeDefined();
  return data.memoryId;
}

async function searchMemories(page: Page, userId: string, query: string, limit = 3) {
  const response = await page.request.post('/api/memory/search', {
    data: {
      userId,
      query,
      limit
    }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(Array.isArray(data.memories)).toBe(true);
  return data;
}

test.describe('Memory Layer E2E', () => {
  const testUserId = `e2e-user-${Date.now()}`;

  test('should persist memories across page reloads', async ({ page }) => {
    // Navigate to homepage to establish session
    await page.goto('/');
    await expect(page).toHaveTitle(/DCYFR Labs/);

    // Add a memory via API
    const memoryId = await addMemory(
      page,
      testUserId,
      'I love building full-stack applications with Next.js',
      { topic: 'programming', importance: 0.9 }
    );

    // Reload the page to simulate session restart
    await page.reload();
    await expect(page).toHaveTitle(/DCYFR Labs/);

    // Search for the memory - should still be available
    const searchResults = await searchMemories(
      page,
      testUserId,
      'Next.js full-stack development'
    );

    expect(searchResults.count).toBeGreaterThan(0);
    expect(searchResults.memories[0].content).toContain('Next.js');
    expect(searchResults.memories[0].topic).toBe('programming');
  });

  test('should handle realistic user conversation flow', async ({ page }) => {
    await page.goto('/');

    // Simulate a conversation about programming preferences
    const programmingMemories = testMemories.programming;
    const storedMemoryIds: string[] = [];

    // Store conversation memories
    for (const memory of programmingMemories) {
      const memoryId = await addMemory(
        page,
        testUserId,
        memory,
        { topic: 'programming-conversation', importance: 0.8 }
      );
      storedMemoryIds.push(memoryId);
    }

    // Wait a moment to ensure all memories are processed
    await page.waitForTimeout(1000);

    // Search for specific programming topics
    const typescriptResults = await searchMemories(
      page,
      testUserId,
      'TypeScript JavaScript development'
    );

    expect(typescriptResults.count).toBeGreaterThan(0);
    expect(typescriptResults.memories[0].content).toContain('TypeScript');

    // Search for React-related memories
    const reactResults = await searchMemories(
      page,
      testUserId,
      'React hooks components'
    );

    expect(reactResults.count).toBeGreaterThan(0);
    expect(reactResults.memories[0].content).toContain('React');

    // Search for broader programming concepts
    const generalResults = await searchMemories(
      page,
      testUserId,
      'frontend development frameworks',
      5
    );

    expect(generalResults.count).toBeGreaterThanOrEqual(2);
    expect(generalResults.memories.some((m: Memory) => m.content.includes('TypeScript'))).toBe(true);
  });

  test('should maintain user-specific memory isolation', async ({ page }) => {
    await page.goto('/');

    const user1 = `${testUserId}-user1`;
    const user2 = `${testUserId}-user2`;

    // User 1 stores memories about React
    await addMemory(
      page,
      user1,
      'I prefer React class components over functional components',
      { topic: 'react-preferences' }
    );

    // User 2 stores memories about Vue
    await addMemory(
      page,
      user2,
      'I prefer Vue.js over React for smaller projects',
      { topic: 'vue-preferences' }
    );

    // User 1 searches for frontend frameworks
    const user1Results = await searchMemories(
      page,
      user1,
      'frontend framework preferences'
    );

    // User 2 searches for the same topic
    const user2Results = await searchMemories(
      page,
      user2,
      'frontend framework preferences'
    );

    // Verify isolation - each user only gets their own memories
    expect(user1Results.memories[0].content).toContain('React');
    expect(user1Results.memories[0].content).not.toContain('Vue');

    expect(user2Results.memories[0].content).toContain('Vue');
    expect(user2Results.memories[0].content).not.toContain('React');
  });

  test('should handle semantic search relevance', async ({ page }) => {
    await page.goto('/');

    // Add memories with related but different topics
    const memories = [
      { text: 'I use TypeScript for type safety in large applications', topic: 'typescript' },
      { text: 'JavaScript ES6 features like arrow functions are great', topic: 'javascript' },
      { text: 'Python is my favorite language for data science', topic: 'python' },
      { text: 'Type checking helps prevent runtime errors', topic: 'type-safety' },
      { text: 'Static typing makes code more maintainable', topic: 'typing' }
    ];

    // Store all memories
    for (const memory of memories) {
      await addMemory(
        page,
        testUserId,
        memory.text,
        { topic: memory.topic, importance: 0.8 }
      );
    }

    await page.waitForTimeout(1000);

    // Search for "type safety" - should prioritize related memories
    const typeResults = await searchMemories(
      page,
      testUserId,
      'type safety programming languages',
      5
    );

    expect(typeResults.count).toBeGreaterThan(0);

    // Verify semantic relevance - TypeScript and type-related memories should rank higher
    const hasTypeScript = typeResults.memories.some((m: Memory) => m.content.includes('TypeScript'));
    const hasTypeSafety = typeResults.memories.some((m: Memory) => m.content.includes('type safety'));
    const hasStaticTyping = typeResults.memories.some((m: Memory) => m.content.includes('Static typing'));

    expect(hasTypeScript || hasTypeSafety || hasStaticTyping).toBe(true);

    // Search for "data science" - should find Python memory
    const dataResults = await searchMemories(
      page,
      testUserId,
      'data science analytics'
    );

    expect(dataResults.count).toBeGreaterThan(0);
    expect(dataResults.memories[0].content).toContain('Python');
  });

  test('should handle high memory volume gracefully', async ({ page }) => {
    await page.goto('/');

    const bulkUserId = `${testUserId}-bulk`;
    const memoryPromises: Promise<string>[] = [];

    // Add 20 memories in parallel to test performance
    for (let i = 0; i < 20; i++) {
      const memory = `Memory entry ${i}: This is a test memory about topic ${i % 5} with some relevant content`;
      memoryPromises.push(
        addMemory(
          page,
          bulkUserId,
          memory,
          { topic: `topic-${i % 5}`, importance: Math.random() }
        )
      );
    }

    // Wait for all memories to be stored
    const memoryIds = await Promise.all(memoryPromises);
    expect(memoryIds).toHaveLength(20);

    // Search should still work efficiently
    const searchStart = Date.now();
    const results = await searchMemories(
      page,
      bulkUserId,
      'test memory topic',
      10
    );
    const searchTime = Date.now() - searchStart;

    expect(results.count).toBeGreaterThan(0);
    expect(results.memories.length).toBeLessThanOrEqual(10);

    // Search should complete within 2 seconds
    expect(searchTime).toBeLessThan(2000);
  });

  test('should validate API error handling', async ({ page }) => {
    await page.goto('/');

    // Test invalid userId
    const invalidUserResponse = await page.request.post('/api/memory/add', {
      data: {
        userId: '', // Empty userId
        message: 'Test message'
      }
    });

    expect(invalidUserResponse.status()).toBe(400);
    const invalidUserData = await invalidUserResponse.json();
    expect(invalidUserData.error).toContain('userId');

    // Test missing message
    const missingMessageResponse = await page.request.post('/api/memory/add', {
      data: {
        userId: testUserId,
        // Missing message
      }
    });

    expect(missingMessageResponse.status()).toBe(400);

    // Test message too long
    const longMessage = 'x'.repeat(10001); // Over 10k character limit
    const longMessageResponse = await page.request.post('/api/memory/add', {
      data: {
        userId: testUserId,
        message: longMessage
      }
    });

    expect(longMessageResponse.status()).toBe(413);

    // Test search with invalid query
    const emptyQueryResponse = await page.request.post('/api/memory/search', {
      data: {
        userId: testUserId,
        query: '' // Empty query
      }
    });

    expect(emptyQueryResponse.status()).toBe(400);

    // Test search with invalid limit
    const invalidLimitResponse = await page.request.post('/api/memory/search', {
      data: {
        userId: testUserId,
        query: 'test',
        limit: 50 // Over limit of 10
      }
    });

    expect(invalidLimitResponse.status()).toBe(400);
  });

  test('should handle concurrent memory operations', async ({ page }) => {
    await page.goto('/');

    const concurrentUserId = `${testUserId}-concurrent`;

    // Create promises for concurrent operations
    const addPromises = Array.from({ length: 5 }, (_, i) =>
      addMemory(
        page,
        concurrentUserId,
        `Concurrent memory ${i} about different topics and concepts`,
        { topic: `concurrent-${i}` }
      )
    );

    const searchPromises = Array.from({ length: 3 }, () =>
      searchMemories(page, concurrentUserId, 'concurrent memory topics')
    );

    // Execute operations concurrently
    const results = await Promise.allSettled([...addPromises, ...searchPromises]);

    // All operations should succeed
    const failures = results.filter(result => result.status === 'rejected');
    expect(failures).toHaveLength(0);

    // Final verification search
    const finalResults = await searchMemories(
      page,
      concurrentUserId,
      'concurrent memory',
      10
    );

    expect(finalResults.count).toBeGreaterThan(0);
  });

  test('should preserve memory context and metadata', async ({ page }) => {
    await page.goto('/');

    const contextUserId = `${testUserId}-context`;

    // Add memory with rich context
    const memoryId = await addMemory(
      page,
      contextUserId,
      'I am working on a machine learning project using TensorFlow',
      {
        topic: 'ml-project',
        importance: 0.95,
        metadata: {
          technology: 'tensorflow',
          domain: 'machine-learning',
          priority: 'high',
          dateAdded: new Date().toISOString()
        }
      }
    );

    // Search for the memory
    const results = await searchMemories(
      page,
      contextUserId,
      'machine learning TensorFlow project'
    );

    expect(results.count).toBeGreaterThan(0);

    const memory = results.memories[0];
    expect(memory.content).toContain('TensorFlow');
    expect(memory.topic).toBe('ml-project');
    expect(memory.importance).toBe(0.95);
    expect(memory.createdAt).toBeDefined();
  });
});

test.describe('Memory Layer Performance', () => {
  const perfUserId = `perf-user-${Date.now()}`;

  test('should meet response time SLAs', async ({ page }) => {
    await page.goto('/');

    // Test memory addition performance
    const addStart = Date.now();
    const memoryId = await addMemory(
      page,
      perfUserId,
      'Performance test memory for response time validation',
      { topic: 'performance' }
    );
    const addTime = Date.now() - addStart;

    expect(addTime).toBeLessThan(500); // Should complete within 500ms

    // Test search performance
    const searchStart = Date.now();
    const results = await searchMemories(
      page,
      perfUserId,
      'performance response time'
    );
    const searchTime = Date.now() - searchStart;

    expect(searchTime).toBeLessThan(200); // Should complete within 200ms
    expect(results.count).toBeGreaterThan(0);
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.goto('/');

    const rateLimitUserId = `${perfUserId}-rate`;
    const requests: Promise<any>[] = [];

    // Send 12 requests rapidly (over the 10/minute limit)
    for (let i = 0; i < 12; i++) {
      requests.push(
        page.request.post('/api/memory/add', {
          data: {
            userId: rateLimitUserId,
            message: `Rate limit test message ${i}`
          }
        })
      );
    }

    const responses = await Promise.all(requests);

    // Some requests should succeed (200)
    const successCount = responses.filter(r => r.status() === 200).length;

    // Some should be rate limited (429)
    const rateLimitedCount = responses.filter(r => r.status() === 429).length;

    expect(successCount).toBeGreaterThan(0);
    expect(rateLimitedCount).toBeGreaterThan(0);
    expect(successCount + rateLimitedCount).toBe(12);

    // Verify rate limit headers are present on 429 responses
    const rateLimitedResponse = responses.find(r => r.status() === 429);
    if (rateLimitedResponse) {
      const headers = rateLimitedResponse.headers();
      expect(headers['x-ratelimit-limit']).toBeDefined();
      expect(headers['x-ratelimit-remaining']).toBeDefined();
    }
  });
});
