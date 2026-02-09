/**
 * Memory E2E Test Utilities
 *
 * Helper functions and types for memory layer E2E testing
 */

import { Page, expect } from '@playwright/test';

export interface MemoryContext {
  topic?: string;
  importance?: number;
  metadata?: Record<string, any>;
}

export interface Memory {
  id: string;
  content: string;
  importance?: number;
  topic?: string;
  createdAt: string;
}

export interface SearchResults {
  memories: Memory[];
  count: number;
  limit: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  memoryCount: number;
  searchRelevance: number;
}

/**
 * Add a memory via API and validate response
 */
export async function addMemory(
  page: Page,
  userId: string,
  message: string,
  context?: MemoryContext
): Promise<string> {
  const startTime = Date.now();

  const response = await page.request.post('/api/memory/add', {
    data: {
      userId,
      message,
      context
    }
  });

  const responseTime = Date.now() - startTime;

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.stored).toBe(true);
  expect(data.memoryId).toBeDefined();
  expect(typeof data.memoryId).toBe('string');

  // Log performance metrics for slow responses
  if (responseTime > 1000) {
    console.warn(`Slow memory addition: ${responseTime}ms for user ${userId}`);
  }

  return data.memoryId;
}

/**
 * Search memories via API and validate response
 */
export async function searchMemories(
  page: Page,
  userId: string,
  query: string,
  limit: number = 3
): Promise<SearchResults> {
  const startTime = Date.now();

  const response = await page.request.post('/api/memory/search', {
    data: {
      userId,
      query,
      limit
    }
  });

  const responseTime = Date.now() - startTime;

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(Array.isArray(data.memories)).toBe(true);
  expect(typeof data.count).toBe('number');
  expect(typeof data.limit).toBe('number');
  expect(data.count).toBeLessThanOrEqual(limit);
  expect(data.memories.length).toBeLessThanOrEqual(limit);

  // Validate memory structure
  data.memories.forEach((memory: Memory) => {
    expect(memory.id).toBeDefined();
    expect(memory.content).toBeDefined();
    expect(memory.createdAt).toBeDefined();
    expect(Date.parse(memory.createdAt)).not.toBeNaN();
  });

  // Log performance metrics for slow responses
  if (responseTime > 500) {
    console.warn(`Slow memory search: ${responseTime}ms for query "${query}"`);
  }

  return data;
}

/**
 * Add multiple memories in sequence with delay
 */
export async function addMemoriesBatch(
  page: Page,
  userId: string,
  memories: Array<{ message: string; context?: MemoryContext }>,
  delayMs: number = 100
): Promise<string[]> {
  const memoryIds: string[] = [];

  for (const { message, context } of memories) {
    const memoryId = await addMemory(page, userId, message, context);
    memoryIds.push(memoryId);

    if (delayMs > 0) {
      await page.waitForTimeout(delayMs);
    }
  }

  return memoryIds;
}

/**
 * Validate memory persistence across page reloads
 */
export async function testMemoryPersistence(
  page: Page,
  userId: string,
  testMemory: string,
  searchQuery: string
): Promise<boolean> {
  // Add memory
  const memoryId = await addMemory(page, userId, testMemory);

  // Reload page to simulate session restart
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Search for memory
  const results = await searchMemories(page, userId, searchQuery);

  // Verify memory is still findable
  return results.count > 0 &&
         results.memories.some(m => m.content.includes(testMemory.split(' ')[0]));
}

/**
 * Calculate search relevance score based on query match
 */
export function calculateRelevanceScore(
  query: string,
  memories: Memory[]
): number {
  if (memories.length === 0) return 0;

  const queryTerms = query.toLowerCase().split(' ');
  let totalRelevance = 0;

  memories.forEach((memory, index) => {
    const content = memory.content.toLowerCase();
    const matches = queryTerms.filter(term => content.includes(term));

    // Higher weight for earlier results, more matches = higher relevance
    const positionWeight = 1 / (index + 1);
    const matchWeight = matches.length / queryTerms.length;

    totalRelevance += positionWeight * matchWeight;
  });

  return totalRelevance / memories.length;
}

/**
 * Test error response structure and status codes
 */
export async function testErrorResponse(
  page: Page,
  endpoint: string,
  requestData: any,
  expectedStatus: number,
  expectedErrorMessage?: string
): Promise<void> {
  const response = await page.request.post(endpoint, {
    data: requestData
  });

  expect(response.status()).toBe(expectedStatus);

  if (expectedStatus >= 400) {
    const errorData = await response.json();
    expect(errorData.error).toBeDefined();

    if (expectedErrorMessage) {
      expect(errorData.error).toContain(expectedErrorMessage);
    }
  }
}

/**
 * Measure API performance metrics
 */
export async function measurePerformance(
  page: Page,
  userId: string,
  operations: number = 10
): Promise<PerformanceMetrics> {
  const startTime = Date.now();
  const memoryPromises: Promise<string>[] = [];

  // Add multiple memories
  for (let i = 0; i < operations; i++) {
    memoryPromises.push(
      addMemory(
        page,
        userId,
        `Performance test memory ${i} with unique content`,
        { topic: 'performance', importance: Math.random() }
      )
    );
  }

  await Promise.all(memoryPromises);

  // Perform search test
  const searchStart = Date.now();
  const searchResults = await searchMemories(
    page,
    userId,
    'performance test memory',
    operations
  );
  const searchTime = Date.now() - searchStart;

  const totalTime = Date.now() - startTime;

  // Calculate relevance score
  const relevanceScore = calculateRelevanceScore(
    'performance test memory',
    searchResults.memories
  );

  return {
    responseTime: totalTime / operations, // Average response time per operation
    memoryCount: searchResults.count,
    searchRelevance: relevanceScore
  };
}

/**
 * Generate realistic test data for different scenarios
 */
export const TestDatasets = {
  programmingConversation: [
    {
      message: 'I prefer TypeScript over JavaScript for large applications',
      context: { topic: 'programming', importance: 0.9 }
    },
    {
      message: 'React hooks make functional components much more powerful',
      context: { topic: 'react', importance: 0.8 }
    },
    {
      message: 'Next.js App Router is better than Pages Router for SEO',
      context: { topic: 'nextjs', importance: 0.85 }
    },
    {
      message: 'Tailwind CSS saves time compared to writing custom styles',
      context: { topic: 'css', importance: 0.7 }
    }
  ],

  userPreferences: [
    {
      message: 'I prefer dark mode interfaces over light themes',
      context: { topic: 'ui-preferences', importance: 0.6 }
    },
    {
      message: 'I work best in the morning between 8 AM and 12 PM',
      context: { topic: 'schedule', importance: 0.8 }
    },
    {
      message: 'I like documentation with code examples',
      context: { topic: 'learning-style', importance: 0.9 }
    }
  ],

  projectContext: [
    {
      message: 'I am building a React dashboard for data visualization',
      context: { topic: 'current-project', importance: 1.0 }
    },
    {
      message: 'The project uses PostgreSQL with Prisma ORM',
      context: { topic: 'database', importance: 0.9 }
    },
    {
      message: 'Authentication is handled by Clerk for user management',
      context: { topic: 'auth', importance: 0.8 }
    }
  ],

  mixedTopics: [
    {
      message: 'Machine learning models need proper data preprocessing',
      context: { topic: 'ml', importance: 0.85 }
    },
    {
      message: 'I cook Italian food every Sunday with my family',
      context: { topic: 'personal', importance: 0.5 }
    },
    {
      message: 'Microservices architecture requires careful planning',
      context: { topic: 'architecture', importance: 0.9 }
    },
    {
      message: 'I prefer hiking in the mountains during summer',
      context: { topic: 'hobbies', importance: 0.4 }
    }
  ]
};

/**
 * Clean up test memories for a user
 */
export async function cleanupTestMemories(
  page: Page,
  userId: string
): Promise<void> {
  // Search for all memories for the user
  const allMemories = await searchMemories(page, userId, '', 50);

  if (allMemories.count === 0) {
    return;
  }

  console.log(`Cleanup: Found ${allMemories.count} memories for user ${userId}`);

  // Note: In a real implementation, we would need a delete endpoint
  // For now, this is a placeholder for cleanup logic
  // The memories will be cleaned up when the test vector DB is reset
}

/**
 * Wait for memory operations to stabilize (useful for eventual consistency)
 */
export async function waitForMemoryStability(
  page: Page,
  userId: string,
  expectedCount: number,
  timeoutMs: number = 5000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const results = await searchMemories(page, userId, '', expectedCount);

    if (results.count >= expectedCount) {
      return true;
    }

    await page.waitForTimeout(100);
  }

  return false;
}
