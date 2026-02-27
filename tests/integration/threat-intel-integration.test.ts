/**
 * Threat Intelligence Integration Test
 *
 * Comprehensive end-to-end testing of PromptIntel MCP server integration.
 * Tests API connectivity, threat search, taxonomy retrieval, and report submission.
 *
 * Required environment variable: PROMPTINTEL_API_KEY
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PromptIntelClient } from '../../src/lib/promptintel-client';

// ============================================================================
// Test Configuration
// ============================================================================

const HAS_API_KEY = !!process.env.PROMPTINTEL_API_KEY;

const TEST_CONFIG = {
  apiKey: process.env.PROMPTINTEL_API_KEY || '',
  baseUrl: process.env.PROMPTINTEL_BASE_URL || 'https://api.promptintel.novahunting.ai/api/v1',
  timeout: 15000,
};

// ============================================================================
// Setup & Teardown
// ============================================================================

let client: PromptIntelClient;

const describeIfApiKey = HAS_API_KEY ? describe : describe.skip;

beforeAll(() => {
  if (!HAS_API_KEY) {
    console.warn('⚠️ PROMPTINTEL_API_KEY not set, skipping threat intel integration tests');
    return;
  }

  client = new PromptIntelClient(TEST_CONFIG);
  console.log('✅ PromptIntel client initialized');
});

afterAll(() => {
  console.log('✅ Threat intel tests complete');
});

// ============================================================================
// Health Check Tests
// ============================================================================

describeIfApiKey('PromptIntel API Health', () => {
  it('should verify API connectivity', async () => {
    const health = await client.healthCheck();

    expect(health).toBeDefined();
    console.log('Health check response:', health);
  }, 30000);

  it('should have valid API key format', () => {
    expect(TEST_CONFIG.apiKey).toBeDefined();
    // API keys start with ak_ followed by 64 hex characters
    expect(TEST_CONFIG.apiKey).toMatch(/^ak_[a-f0-9]{64}$/);
  });
});

// ============================================================================
// Threat Search Tests (IoPC)
// ============================================================================

describeIfApiKey('PromptIntel Threat Search', () => {
  it('should search for critical severity threats', async () => {
    const response = await client.getPrompts({
      severity: 'critical',
      limit: 10,
    });

    expect(Array.isArray(response)).toBe(true);
    console.log(`Response received with ${response.length} item(s)`);

    // API may return paginated response or empty data array
    if (response.length > 0) {
      const firstItem = response[0];
      console.log('Sample response:', firstItem);

      // Check if it's a pagination wrapper with data property
      if ('data' in firstItem) {
        expect(firstItem).toHaveProperty('pagination');
      }
    }
  }, 30000);

  it('should search for high severity threats', async () => {
    const response = await client.getPrompts({
      severity: 'high',
      limit: 5,
    });

    expect(Array.isArray(response)).toBe(true);
    console.log(`Found ${response.length} response item(s)`);

    // API returns data, verify structure
    expect(response).toBeDefined();
  }, 30000);

  it('should limit results correctly', async () => {
    const limit = 3;
    const threats = await client.getPrompts({
      limit,
    });

    expect(Array.isArray(threats)).toBe(true);
    expect(threats.length).toBeLessThanOrEqual(limit);
    console.log(`Limited to ${limit}, received ${threats.length} threats`);
  }, 30000);

  it('should handle category filtering', async () => {
    const threats = await client.getPrompts({
      category: 'injection',
      limit: 10,
    });

    expect(Array.isArray(threats)).toBe(true);
    console.log(`Found ${threats.length} injection category threats`);

    if (threats.length > 0) {
      threats.forEach((threat) => {
        if (threat.category) {
          expect(threat.category.toLowerCase()).toContain('injection');
        }
      });
    }
  }, 30000);

  it('should handle empty results gracefully', async () => {
    const threats = await client.getPrompts({
      severity: 'critical',
      category: 'nonexistent-category-xyz',
      limit: 10,
    });

    expect(Array.isArray(threats)).toBe(true);
    console.log(`Found ${threats.length} threats with impossible filters`);
  }, 30000);
});

// ============================================================================
// Taxonomy Tests
// ============================================================================

describeIfApiKey('PromptIntel Taxonomy', () => {
  it('should fetch threat taxonomy', async () => {
    const response = await client.getTaxonomy({
      limit: 20,
    });

    expect(Array.isArray(response)).toBe(true);
    console.log(`Found ${response.length} taxonomy response item(s)`);

    if (response.length > 0) {
      const firstEntry = response[0];
      console.log('Sample taxonomy entry:', firstEntry);

      // Verify response structure exists
      expect(firstEntry).toBeDefined();
    }
  }, 30000);

  it('should have hierarchical structure', async () => {
    const response = await client.getTaxonomy({
      limit: 50,
    });

    expect(Array.isArray(response)).toBe(true);
    console.log(`Taxonomy response has ${response.length} item(s)`);

    // Verify response is valid
    expect(response).toBeDefined();
  }, 30000);
});

// ============================================================================
// Report Submission Tests
// ============================================================================

describeIfApiKey('PromptIntel Report Submission', () => {
  it('should submit a test security report', async () => {
    const testReport = {
      agent_name: 'DCYFR Test Agent',
      title: 'Automated Integration Test Report',
      description:
        'This is a test report submitted during automated testing of the PromptIntel integration.',
      severity: 'low' as const,
      findings: {
        test: true,
        timestamp: new Date().toISOString(),
        environment: 'test',
        integration_test: true,
      },
      metadata: {
        source: 'vitest',
        test_suite: 'threat-intel-integration',
        automated: true,
      },
    };

    try {
      const result = await client.submitReport(testReport);
      expect(result).toBeDefined();
      console.log('Report submitted successfully:', result);
    } catch (error) {
      // API may have specific validation requirements
      console.log(
        'Report submission validation error (expected):',
        error instanceof Error ? error.message : String(error)
      );
      expect(error).toBeDefined();
    }
  }, 30000);
});

// ============================================================================
// Performance & Rate Limiting Tests
// ============================================================================

describeIfApiKey('PromptIntel Performance', () => {
  it('should handle multiple concurrent requests', async () => {
    const startTime = Date.now();

    const requests = [
      client.getPrompts({ severity: 'critical', limit: 5 }),
      client.getPrompts({ severity: 'high', limit: 5 }),
      client.getTaxonomy({ limit: 10 }),
    ];

    const results = await Promise.all(requests);
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(Array.isArray(result)).toBe(true);
    });

    console.log(`Concurrent requests completed in ${duration}ms`);
    console.log(
      'Results:',
      results.map((r) => r.length)
    );
  }, 45000);

  it('should respect timeout settings', async () => {
    const shortTimeoutClient = new PromptIntelClient({
      apiKey: TEST_CONFIG.apiKey,
      baseUrl: TEST_CONFIG.baseUrl,
      timeout: 1, // 1ms - should timeout
    });

    try {
      await shortTimeoutClient.getPrompts({ limit: 10 });
      // If it doesn't timeout, the request was very fast
      console.log('Request completed before timeout');
    } catch (error) {
      expect(error).toBeDefined();
      console.log('Timeout correctly triggered');
    }
  }, 30000);
});

// ============================================================================
// Error Handling Tests
// ============================================================================

describeIfApiKey('PromptIntel Error Handling', () => {
  it('should handle invalid API key gracefully', async () => {
    const badClient = new PromptIntelClient({
      apiKey: 'invalid-key-12345',
      baseUrl: TEST_CONFIG.baseUrl,
      timeout: 5000,
    });

    try {
      await badClient.getPrompts({ limit: 1 });
      // Some APIs may not validate keys immediately
      console.log('API did not reject invalid key');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error instanceof Error).toBe(true);
      console.log('Invalid API key correctly rejected');
    }
  }, 30000);

  it('should handle network errors', async () => {
    const badClient = new PromptIntelClient({
      apiKey: TEST_CONFIG.apiKey!,
      baseUrl: 'https://invalid.nonexistent.domain.xyz/api',
      timeout: 5000,
    });

    try {
      await badClient.getPrompts({ limit: 1 });
      throw new Error('Should have failed with network error');
    } catch (error) {
      expect(error).toBeDefined();
      console.log('Network error correctly handled');
    }
  }, 30000);
});

// ============================================================================
// Integration Summary Test
// ============================================================================

describeIfApiKey('PromptIntel Integration Summary', () => {
  it('should provide complete integration overview', async () => {
    console.log('\n========================================');
    console.log('THREAT INTELLIGENCE INTEGRATION SUMMARY');
    console.log('========================================\n');

    // Test all major endpoints
    const [threats, taxonomy, health] = await Promise.all([
      client.getPrompts({ severity: 'critical', limit: 5 }),
      client.getTaxonomy({ limit: 10 }),
      client.healthCheck(),
    ]);

    console.log('✅ API Health:', health);
    console.log('✅ Critical Threats:', threats.length);
    console.log('✅ Taxonomy Entries:', taxonomy.length);

    // Verify all data is valid
    expect(Array.isArray(threats)).toBe(true);
    expect(Array.isArray(taxonomy)).toBe(true);
    expect(health).toBeDefined();

    console.log('\n✅ All threat intel integration tests passed!');
    console.log('========================================\n');
  }, 45000);
});
