/**
 * @/lib/agents barrel export
 *
 * Central export point for agent telemetry and provider fallback management.
 */

// Export everything from agent-telemetry
export {
  telemetry,
  trackAgentSession,
  TelemetrySessionManager,
  AgentTelemetryManager,
} from "./agent-telemetry";

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

// Export everything from provider-fallback-manager
export {
  getGlobalFallbackManager,
  initializeGlobalFallbackManager,
  destroyGlobalFallbackManager,
  ProviderFallbackManager,
  RateLimitError,
  ProviderUnavailableError,
} from "./provider-fallback-manager";

export type {
  ProviderType,
  ProviderConfig,
  FallbackManagerConfig,
  TaskContext,
  ExecutionResult,
  ProviderHealth,
} from "./provider-fallback-manager";
