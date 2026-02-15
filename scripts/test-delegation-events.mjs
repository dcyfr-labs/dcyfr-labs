#!/usr/bin/env node

/**
 * Test Delegation Events Integration
 *
 * Smoke test for delegation event streaming from MCP servers to dcyfr-labs
 * observability stack (Axiom + Sentry).
 *
 * This script verifies the complete delegation observability flow:
 * 1. MCP servers emit delegation events via emitDelegationEvent()
 * 2. Events are streamed to /api/delegation/events
 * 3. API processes events and sends to Axiom/Sentry
 * 4. Observability platforms receive and store delegation data
 *
 * Usage:
 *   node scripts/test-delegation-events.mjs
 *   npm run test:delegation-events
 */

import fetch from 'node-fetch';

const API_BASE = process.env.DCYFR_LABS_API_URL || 'http://localhost:3000';
const DELEGATION_API = `${API_BASE}/api/delegation/events`;

// Test delegation events
const testEvents = [
  {
    type: 'tool_executed',
    contractId: 'test-contract-001',
    delegatorAgentId: 'architecture-reviewer',
    taskId: 'task-001',
    toolName: 'analytics:query',
    executionTime: 150,
    timestamp: Date.now(),
  },
  {
    type: 'delegation_failed',
    contractId: 'test-contract-002',
    delegatorAgentId: 'security-specialist',
    taskId: 'task-002',
    toolName: 'tokens:validate',
    error: 'Rate limit exceeded',
    timestamp: Date.now(),
  },
  {
    type: 'delegation_complete',
    contractId: 'test-contract-003',
    delegatorAgentId: 'content-creator',
    taskId: 'task-003',
    toolName: 'content:analyze',
    executionTime: 2450,
    metadata: {
      words_analyzed: 1287,
      topics_found: 5,
    },
    timestamp: Date.now(),
  },
];

async function testDelegationAPI() {
  console.log('🧪 Testing Delegation Events API Integration...');
  console.log(`📡 Target API: ${DELEGATION_API}`);

  // Test health check first
  try {
    console.log('\\n1. Testing health check...');
    const healthResponse = await fetch(DELEGATION_API, { method: 'GET' });
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthData);
      return;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    console.log('💡 Make sure dcyfr-labs is running on', API_BASE);
    return;
  }

  // Test delegation event processing
  console.log('\\n2. Testing delegation events...');

  for (const [index, event] of testEvents.entries()) {
    const testNum = index + 1;
    console.log(`\\n   Test ${testNum}: ${event.type} event`);

    try {
      const response = await fetch(DELEGATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`   ✅ Event processed successfully:`, {
          contractId: result.contractId,
          eventType: result.eventType,
          timestamp: result.timestamp,
        });
      } else {
        console.log(`   ❌ Event processing failed:`, result);
      }
    } catch (error) {
      console.log(`   ❌ Event streaming error:`, error.message);
    }
  }

  // Test MCP event string format
  console.log('\\n3. Testing MCP event string parsing...');

  const mcpEventString =
    '🔗 Delegation Event: {"type": "tool_executed", "contract_id": "mcp-test-001", "delegator_agent_id": "test-agent", "tool_name": "test:tool", "timestamp": ' +
    Date.now() +
    '}';

  try {
    const response = await fetch(DELEGATION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: mcpEventString,
    });

    const result = await response.json();

    if (response.ok) {
      console.log('   ✅ MCP event string parsed successfully:', result);
    } else {
      console.log('   ❌ MCP event string parsing failed:', result);
    }
  } catch (error) {
    console.log('   ❌ MCP event string error:', error.message);
  }

  console.log('\\n🏁 Delegation events integration test completed!');
  console.log('\\n📊 Next steps:');
  console.log('   • Check Axiom dashboard for delegation events');
  console.log('   • Check Sentry for delegation context and errors');
  console.log('   • Monitor performance in observability platforms');
}

// Run tests
testDelegationAPI().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
