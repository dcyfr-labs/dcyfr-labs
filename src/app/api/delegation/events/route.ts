/**
 * Delegation Events API Route
 *
 * Receives delegation events from MCP servers and streams them to
 * observability platforms (Axiom and Sentry).
 *
 * This endpoint allows MCP servers to send delegation events to the
 * dcyfr-labs observability infrastructure for monitoring and alerting.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  streamDelegationEvent,
  parseMCPDelegationEvent,
  createDelegationEventFromMCP,
  type DelegationEvent,
} from '@/lib/delegation/observability';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle different input formats
    let delegationEvent: DelegationEvent | null = null;

    if (contentType.includes('application/json')) {
      // Direct JSON event from MCP server
      const eventData = await request.json();

      if (typeof eventData === 'string') {
        // Parse MCP event string format
        delegationEvent = parseMCPDelegationEvent(eventData);
      } else {
        // Direct event object
        delegationEvent = createDelegationEventFromMCP(
          eventData.type,
          eventData.contractId,
          eventData.delegatorAgentId,
          eventData.taskId,
          eventData.toolName,
          eventData.executionTime,
          eventData.error,
          eventData.metadata
        );
      }
    } else {
      // Handle raw string events (MCP server console output)
      const eventString = await request.text();
      delegationEvent = parseMCPDelegationEvent(eventString);
    }

    if (!delegationEvent) {
      return NextResponse.json({ error: 'Invalid delegation event format' }, { status: 400 });
    }

    // Validate required fields
    if (!delegationEvent.contractId) {
      return NextResponse.json({ error: 'Missing required field: contractId' }, { status: 400 });
    }

    // Stream to observability platforms
    streamDelegationEvent(delegationEvent);

    return NextResponse.json({
      success: true,
      eventType: delegationEvent.type,
      contractId: delegationEvent.contractId,
      timestamp: delegationEvent.timestamp,
    });
  } catch (error) {
    console.error('Delegation events API error:', error);

    return NextResponse.json({ error: 'Failed to process delegation event' }, { status: 500 });
  }
}

// Health check endpoint for monitoring
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'delegation-events-api',
    timestamp: Date.now(),
  });
}
