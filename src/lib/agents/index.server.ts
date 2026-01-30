/**
 * @/lib/agents/index.server - SERVER-ONLY exports
 *
 * ⚠️  This file contains server-only exports that use Node.js APIs
 * DO NOT import from this file in client components
 *
 * For client-safe exports, use '@/lib/agents' instead
 */

// Server-only exports from ai-compat
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
  type TaskContext,
  type RoutingResult,
  type Agent,
  type AgentManifest,
} from "@/lib/ai-compat.server";

// Re-export from main index for convenience (already server-safe)
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
  TaskContext as LegacyTaskContext,
  ExecutionResult,
  ProviderHealth,
} from "./provider-fallback-manager";
