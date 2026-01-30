/**
 * @/lib/agents barrel export
 *
 * Central export point for agent telemetry and provider fallback management.
 *
 * MIGRATION NOTE: Now using @dcyfr/ai framework with compatibility adapter
 * for backward compatibility. Gradually migrate to direct @dcyfr/ai usage.
 *
 * Browser-safe exports:
 * - Server actions (getAgentComparison, getHandoffPatterns)
 * - Type definitions
 *
 * ⚠️  SERVER-ONLY exports (cannot be used in client components):
 * - routeTask, getAgent, listDcyfrAgents, listGenericAgents
 * - validateDesignTokens, requiresApproval
 * - AgentRegistry, AgentRouter, getAgentRegistry, getAgentRouter
 *
 * For server-only exports (telemetry, compat adapters):
 * import { telemetry } from '@/lib/agents/index.server';
 */

// Server actions for client components (browser-safe)
export { getAgentComparison, getHandoffPatterns } from "./actions";

// ⚠️  SERVER-ONLY exports moved to index.server.ts
// Import from '@/lib/agents/index.server' for:
// - routeTask, getAgent, listDcyfrAgents, listGenericAgents
// - validateDesignTokens, requiresApproval
// - AgentRegistry, AgentRouter, getAgentRegistry, getAgentRouter
//
// These exports use Node.js APIs and cannot be used in client components

// Type exports (safe for client)
export type { TaskContext, RoutingResult } from "@/lib/ai-compat.server";

// Re-export types from old system (for backward compatibility)
// Types are erased at runtime, so they're browser-safe
export type {
  AgentType,
  TaskType,
  TaskOutcome,
  ValidationStatus,
  TelemetrySession,
  TelemetryMetrics,
  ViolationRecord,
  HandoffRecord,
  CostEstimate,
  AgentStats,
  ComparisonStats,
} from "./agent-telemetry";

export type {
  ProviderType,
  ProviderConfig,
  FallbackManagerConfig,
  TaskContext as LegacyTaskContext, // Renamed to avoid conflict with new ai-compat TaskContext
  ExecutionResult,
  ProviderHealth,
} from "./provider-fallback-manager";
