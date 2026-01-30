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
 * - New AI framework helpers (routeTask, getAgent, etc.)
 *
 * For server-only exports (telemetry, compat adapters):
 * import { telemetry } from '@/lib/agents/index.server';
 */

// Server actions for client components (browser-safe)
export { getAgentComparison, getHandoffPatterns } from "./actions";

// New @dcyfr/ai framework helpers (via compatibility adapter)
export {
  routeTask,
  getAgent,
  listDcyfrAgents,
  listGenericAgents,
  validateDesignTokens,
  requiresApproval,
  AgentRegistry,
  AgentRouter,
  getAgentRegistry,
  getAgentRouter,
} from "@/lib/ai-compat";

export type { TaskContext, RoutingResult } from "@/lib/ai-compat";

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
