#!/usr/bin/env node

/**
 * Memory Layer Load Testing Script
 *
 * This script performs comprehensive load testing of the memory layer APIs
 * to validate performance under realistic usage scenarios.
 *
 * Usage:
 *   npm run memory:load-test
 *   node scripts/memory-load-test.mjs --concurrent=10 --memories=100
 */

import { performance } from 'perf_hooks';
import fetch from 'node-fetch';

// Configuration
const CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 10,
  memoriesPerUser: parseInt(process.env.MEMORIES_PER_USER) || 20,
  searchesPerUser: parseInt(process.env.SEARCHES_PER_USER) || 10,
  testDurationMs: parseInt(process.env.TEST_DURATION) || 60000, // 1 minute
};

// Test data generators
const generateMemoryContent = (userId, index) => ({
  userId,
  message: `Memory ${index}: User ${userId} is working on ${getRandomTopic()} with ${getRandomTechnology()}`,
  context: {
    topic: getRandomTopic(),
    importance: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
    metadata: {
      testRun: true,
      batchId: Math.floor(Date.now() / 1000),
      userIndex: index
    }
  }
});

const generateSearchQuery = () => {
  const topics = ['programming', 'technology', 'development', 'project', 'learning'];
  const modifiers = ['best practices', 'frameworks', 'tools', 'experience', 'preferences'];

  return `${topics[Math.floor(Math.random() * topics.length)]} ${modifiers[Math.floor(Math.random() * modifiers.length)]}`;
};

const getRandomTopic = () => {
  const topics = ['react', 'typescript', 'nextjs', 'javascript', 'python', 'docker', 'aws', 'graphql'];
  return topics[Math.floor(Math.random() * topics.length)];
};

const getRandomTechnology = () => {
  const technologies = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GraphQL'];
  return technologies[Math.floor(Math.random() * technologies.length)];
};

// Performance metrics collection
class MetricsCollector {
  constructor() {
    this.metrics = {
      addMemory: [],
      searchMemory: [],
      errors: [],
      rateLimits: [],
    };
  }

  recordAddMemory(responseTime, success) {
    this.metrics.addMemory.push({ responseTime, success, timestamp: Date.now() });
  }

  recordSearchMemory(responseTime, success, resultCount) {
    this.metrics.searchMemory.push({
      responseTime,
      success,
      resultCount,
      timestamp: Date.now()
    });
  }

  recordError(operation, error, statusCode) {
    this.metrics.errors.push({
      operation,
      error: error.message,
      statusCode,
      timestamp: Date.now()
    });
  }

  recordRateLimit(operation, headers) {
    this.metrics.rateLimits.push({
      operation,
      limit: headers['x-ratelimit-limit'],
      remaining: headers['x-ratelimit-remaining'],
      reset: headers['x-ratelimit-reset'],
      timestamp: Date.now()
    });
  }

  getReport() {
    const addStats = this.calculateStats(this.metrics.addMemory.map(m => m.responseTime));
    const searchStats = this.calculateStats(this.metrics.searchMemory.map(m => m.responseTime));

    const successfulAdds = this.metrics.addMemory.filter(m => m.success).length;
    const successfulSearches = this.metrics.searchMemory.filter(m => m.success).length;

    const totalSearchResults = this.metrics.searchMemory
      .filter(m => m.success)
      .reduce((sum, m) => sum + (m.resultCount || 0), 0);

    return {
      summary: {
        totalRequests: this.metrics.addMemory.length + this.metrics.searchMemory.length,
        totalErrors: this.metrics.errors.length,
        totalRateLimits: this.metrics.rateLimits.length,
        successRate: ((successfulAdds + successfulSearches) / (this.metrics.addMemory.length + this.metrics.searchMemory.length) * 100).toFixed(2) + '%',
      },
      addMemory: {
        totalRequests: this.metrics.addMemory.length,
        successfulRequests: successfulAdds,
        successRate: (successfulAdds / this.metrics.addMemory.length * 100).toFixed(2) + '%',
        responseTime: addStats,
      },
      searchMemory: {
        totalRequests: this.metrics.searchMemory.length,
        successfulRequests: successfulSearches,
        successRate: (successfulSearches / this.metrics.searchMemory.length * 100).toFixed(2) + '%',
        responseTime: searchStats,
        averageResultCount: successfulSearches > 0 ? (totalSearchResults / successfulSearches).toFixed(2) : 0,
      },
      errors: this.metrics.errors.reduce((acc, error) => {
        acc[error.operation] = (acc[error.operation] || 0) + 1;
        return acc;
      }, {}),
      rateLimits: this.metrics.rateLimits.length,
    };
  }

  calculateStats(values) {
    if (values.length === 0) return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1]),
      avg: Math.round(sum / values.length),
      p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      p99: Math.round(sorted[Math.floor(sorted.length * 0.99)]),
    };
  }
}

// HTTP client with retry logic
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, data, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        return {
          ok: response.ok,
          status: response.status,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (error) {
        if (attempt === retries) throw error;

        // Exponential backoff for retries
        await this.sleep(Math.pow(2, attempt) * 100);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Load test executor
class LoadTestRunner {
  constructor(config, metricsCollector) {
    this.config = config;
    this.metrics = metricsCollector;
    this.client = new ApiClient(config.baseUrl);
    this.testStartTime = null;
  }

  async runLoadTest() {
    console.log('🚀 Starting Memory Layer Load Test');
    console.log(`📊 Configuration:`, this.config);
    console.log('');

    this.testStartTime = performance.now();

    // Create user simulation promises
    const userPromises = Array.from({ length: this.config.concurrentUsers }, (_, i) =>
      this.simulateUser(`load-test-user-${i}-${Date.now()}`)
    );

    // Run all users concurrently
    await Promise.allSettled(userPromises);

    const testDuration = performance.now() - this.testStartTime;

    console.log(`✅ Load test completed in ${Math.round(testDuration)}ms`);
    console.log('');

    return this.metrics.getReport();
  }

  async simulateUser(userId) {
    const userStartTime = performance.now();

    try {
      // Phase 1: Add memories
      await this.addMemoriesPhase(userId);

      // Phase 2: Search memories
      await this.searchMemoriesPhase(userId);

      // Phase 3: Mixed operations
      await this.mixedOperationsPhase(userId);

    } catch (error) {
      this.metrics.recordError('user-simulation', error, 0);
    } finally {
      const userDuration = performance.now() - userStartTime;
      console.log(`👤 User ${userId} completed in ${Math.round(userDuration)}ms`);
    }
  }

  async addMemoriesPhase(userId) {
    const promises = [];

    for (let i = 0; i < this.config.memoriesPerUser; i++) {
      promises.push(this.addMemoryWithMetrics(userId, i));

      // Small delay to avoid overwhelming the API
      if (i % 5 === 0 && i > 0) {
        await Promise.all(promises.splice(0, 5));
        await this.randomDelay(50, 150);
      }
    }

    // Wait for remaining promises
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  async searchMemoriesPhase(userId) {
    const promises = [];

    for (let i = 0; i < this.config.searchesPerUser; i++) {
      promises.push(this.searchMemoryWithMetrics(userId));

      // Small delay between searches
      if (i % 3 === 0 && i > 0) {
        await Promise.all(promises.splice(0, 3));
        await this.randomDelay(100, 200);
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  async mixedOperationsPhase(userId) {
    // Alternate between adding and searching
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        await this.addMemoryWithMetrics(userId, `mixed-${i}`);
      } else {
        await this.searchMemoryWithMetrics(userId);
      }

      await this.randomDelay(200, 500);
    }
  }

  async addMemoryWithMetrics(userId, index) {
    const startTime = performance.now();

    try {
      const response = await this.client.request(
        '/api/memory/add',
        generateMemoryContent(userId, index)
      );

      const responseTime = performance.now() - startTime;

      if (response.ok) {
        this.metrics.recordAddMemory(responseTime, true);
      } else {
        this.metrics.recordAddMemory(responseTime, false);

        if (response.status === 429) {
          this.metrics.recordRateLimit('addMemory', response.headers);
        } else {
          this.metrics.recordError('addMemory', new Error(response.data.error), response.status);
        }
      }

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.metrics.recordAddMemory(responseTime, false);
      this.metrics.recordError('addMemory', error, 0);
    }
  }

  async searchMemoryWithMetrics(userId) {
    const startTime = performance.now();

    try {
      const response = await this.client.request('/api/memory/search', {
        userId,
        query: generateSearchQuery(),
        limit: Math.floor(Math.random() * 5) + 1, // 1-5 results
      });

      const responseTime = performance.now() - startTime;

      if (response.ok) {
        this.metrics.recordSearchMemory(responseTime, true, response.data.count);
      } else {
        this.metrics.recordSearchMemory(responseTime, false, 0);

        if (response.status === 429) {
          this.metrics.recordRateLimit('searchMemory', response.headers);
        } else {
          this.metrics.recordError('searchMemory', new Error(response.data.error), response.status);
        }
      }

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.metrics.recordSearchMemory(responseTime, false, 0);
      this.metrics.recordError('searchMemory', error, 0);
    }
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Report generator
function generateReport(results) {
  console.log('📈 Load Test Results');
  console.log('===================');
  console.log('');

  // Summary
  console.log('📊 Summary:');
  console.log(`   Total Requests: ${results.summary.totalRequests}`);
  console.log(`   Success Rate: ${results.summary.successRate}`);
  console.log(`   Total Errors: ${results.summary.totalErrors}`);
  console.log(`   Rate Limits Hit: ${results.summary.totalRateLimits}`);
  console.log('');

  // Add Memory Performance
  console.log('🔄 Add Memory Performance:');
  console.log(`   Total: ${results.addMemory.totalRequests} requests`);
  console.log(`   Success: ${results.addMemory.successfulRequests} (${results.addMemory.successRate})`);
  console.log(`   Response Times:`, results.addMemory.responseTime);
  console.log('');

  // Search Memory Performance
  console.log('🔍 Search Memory Performance:');
  console.log(`   Total: ${results.searchMemory.totalRequests} requests`);
  console.log(`   Success: ${results.searchMemory.successfulRequests} (${results.searchMemory.successRate})`);
  console.log(`   Response Times:`, results.searchMemory.responseTime);
  console.log(`   Avg Results per Search: ${results.searchMemory.averageResultCount}`);
  console.log('');

  // Errors breakdown
  if (Object.keys(results.errors).length > 0) {
    console.log('❌ Errors by Operation:');
    Object.entries(results.errors).forEach(([operation, count]) => {
      console.log(`   ${operation}: ${count} errors`);
    });
    console.log('');
  }

  // Rate limiting
  if (results.rateLimits > 0) {
    console.log(`⚠️  Rate limiting triggered ${results.rateLimits} times`);
    console.log('');
  }

  // Performance assessment
  console.log('🎯 Performance Assessment:');

  const addP95 = results.addMemory.responseTime.p95;
  const searchP95 = results.searchMemory.responseTime.p95;

  console.log(`   Add Memory P95: ${addP95}ms ${addP95 > 500 ? '❌ (Target: <500ms)' : '✅'}`);
  console.log(`   Search Memory P95: ${searchP95}ms ${searchP95 > 200 ? '❌ (Target: <200ms)' : '✅'}`);

  const overallSuccess = parseFloat(results.summary.successRate.replace('%', ''));
  console.log(`   Success Rate: ${results.summary.successRate} ${overallSuccess < 95 ? '❌ (Target: >95%)' : '✅'}`);
}

// Main execution
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  args.forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    if (key === 'concurrent') CONFIG.concurrentUsers = parseInt(value);
    if (key === 'memories') CONFIG.memoriesPerUser = parseInt(value);
    if (key === 'searches') CONFIG.searchesPerUser = parseInt(value);
    if (key === 'duration') CONFIG.testDurationMs = parseInt(value);
  });

  const metrics = new MetricsCollector();
  const runner = new LoadTestRunner(CONFIG, metrics);

  try {
    const results = await runner.runLoadTest();
    generateReport(results);

    // Exit with error code if performance targets not met
    const successRate = parseFloat(results.summary.successRate.replace('%', ''));
    const addP95 = results.addMemory.responseTime.p95;
    const searchP95 = results.searchMemory.responseTime.p95;

    if (successRate < 95 || addP95 > 500 || searchP95 > 200) {
      console.log('❌ Performance targets not met');
      process.exit(1);
    }

    console.log('✅ All performance targets met');

  } catch (error) {
    console.error('❌ Load test failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Load test interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
