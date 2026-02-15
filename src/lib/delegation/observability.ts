/**
 * Delegation Observability Utilities
 *
 * Streams delegation events from MCP servers to Axiom and Sentry
 * for performance monitoring and failure tracking.
 *
 * This module connects the emitDelegationEvent() function from MCP servers
 * to the existing dcyfr-labs observability infrastructure.
 */

import { Logger } from 'next-axiom';
import * as Sentry from '@sentry/nextjs';

// Delegation event types that we'll track
export interface DelegationEvent {
  type: 'tool_executed' | 'delegation_start' | 'delegation_complete' | 'delegation_failed';
  contractId: string;
  delegatorAgentId?: string;
  taskId?: string;
  toolName?: string;
  executionTime?: number;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

// Axiom logger instance for delegation events
const delegationLogger = new Logger({
  source: 'delegation-framework',
  dataset: 'delegation-events',
});

/**
 * Stream delegation event to Axiom for real-time analytics
 */
export function streamToAxiom(event: DelegationEvent): void {
  try {
    delegationLogger.info('delegation_event', {
      event_type: event.type,
      contract_id: event.contractId,
      delegator_agent_id: event.delegatorAgentId,
      task_id: event.taskId,
      tool_name: event.toolName,
      execution_time_ms: event.executionTime,
      error: event.error,
      timestamp: event.timestamp,
      metadata: event.metadata,
    });

    // Flush immediately for important events
    if (event.type === 'delegation_failed' || event.error) {
      delegationLogger.flush();
    }
  } catch (error) {
    console.error('Failed to stream delegation event to Axiom:', error);
  }
}

/**
 * Add delegation context to Sentry for error tracking
 */
export function addDelegationContextToSentry(event: DelegationEvent): void {
  try {
    // Set delegation context for all subsequent Sentry events
    Sentry.setContext('delegation', {
      contract_id: event.contractId,
      delegator_agent_id: event.delegatorAgentId,
      task_id: event.taskId,
      tool_name: event.toolName,
      event_type: event.type,
    });

    // Add breadcrumb for event timeline
    Sentry.addBreadcrumb({
      category: 'delegation',
      message: `${event.type}: ${event.toolName || 'unknown'}`,
      level: event.error ? 'error' : 'info',
      data: {
        contractId: event.contractId,
        executionTime: event.executionTime,
        error: event.error,
      },
      timestamp: event.timestamp / 1000, // Sentry expects seconds
    });

    // Capture events as transactions for performance monitoring
    if (event.type === 'delegation_start') {
      const transaction = Sentry.startTransaction({
        name: `delegation.${event.contractId}`,
        op: 'delegation.chain',
        data: {
          contractId: event.contractId,
          delegatorAgentId: event.delegatorAgentId,
          taskId: event.taskId,
        },
      });

      // Store transaction reference for completion
      Sentry.setContext('delegation_transaction', {
        transaction_id: transaction.spanId,
      });
    }

    // Capture errors for failed delegations
    if (event.type === 'delegation_failed' && event.error) {
      Sentry.captureException(new Error(`Delegation failed: ${event.error}`), {
        tags: {
          delegation_contract: event.contractId,
          delegation_agent: event.delegatorAgentId,
          delegation_tool: event.toolName,
        },
        extra: {
          delegation_event: event,
        },
      });
    }
  } catch (error) {
    console.error('Failed to add delegation context to Sentry:', error);
  }
}

/**
 * Main function to stream delegation events to all observability platforms
 */
export function streamDelegationEvent(event: DelegationEvent): void {
  // Stream to Axiom for real-time monitoring
  streamToAxiom(event);

  // Add context to Sentry for error tracking
  addDelegationContextToSentry(event);

  // Log to console in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Delegation Event:', {
      type: event.type,
      contractId: event.contractId,
      toolName: event.toolName,
      executionTime: event.executionTime,
      error: event.error,
    });
  }
}

/**
 * Parse delegation event from MCP server emission string
 *
 * MCP servers emit events as:
 * "🔗 Delegation Event: {"type": "tool_executed", "contract_id": "...", ...}"
 */
export function parseMCPDelegationEvent(eventString: string): DelegationEvent | null {
  try {
    // Extract JSON from MCP event string
    const jsonMatch = eventString.match(/🔗 Delegation Event: (.+)/);
    if (!jsonMatch) return null;

    const eventData = JSON.parse(jsonMatch[1]);

    // Transform MCP event format to our DelegationEvent interface
    return {
      type: eventData.type || 'tool_executed',
      contractId: eventData.contract_id,
      delegatorAgentId: eventData.delegator_agent_id,
      taskId: eventData.task_id,
      toolName: eventData.tool_name,
      executionTime: eventData.execution_time,
      error: eventData.error,
      metadata: eventData.metadata,
      timestamp: eventData.timestamp || Date.now(),
    };
  } catch (error) {
    console.error('Failed to parse MCP delegation event:', error);
    return null;
  }
}

/**
 * Utility to create delegation event from MCP context
 */
export function createDelegationEventFromMCP(
  type: DelegationEvent['type'],
  contractId: string,
  delegatorAgentId?: string,
  taskId?: string,
  toolName?: string,
  executionTime?: number,
  error?: string,
  metadata?: Record<string, any>
): DelegationEvent {
  return {
    type,
    contractId,
    delegatorAgentId,
    taskId,
    toolName,
    executionTime,
    error,
    metadata,
    timestamp: Date.now(),
  };
}

// Export types for use in other modules
export type { DelegationEvent };
