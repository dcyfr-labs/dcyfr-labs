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
 * For server-only exports (telemetry, compat adapters):
 * import { telemetry } from '@/lib/agents/index.server';
 */

// Server actions for client components (browser-safe)
export { getAgentComparison, getHandoffPatterns } from "./actions";

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
  TaskContext,
  ExecutionResult,
  ProviderHealth,
} from "./provider-fallback-manager";
