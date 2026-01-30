/**
 * @/lib/agents server-only exports
 *
 * Server-only exports for agent telemetry and provider fallback management.
 * These use Node.js APIs and should only be imported in server components or API routes.
 *
 * Import pattern: import { telemetry } from '@/lib/agents/index.server';
 */

// Compatibility adapter (wraps @dcyfr/ai) - Server only
export {
  telemetry,
  trackAgentSession,
  getCompatibilityTelemetry as TelemetrySessionManager,
  getCompatibilityTelemetry as AgentTelemetryManager,
  getCompatibilityProvider as ProviderFallbackManager,
  getCompatibilityProvider,
  getCompatibilityTelemetry,
} from './compat';

// Legacy exports (kept for backward compatibility)
// These now use the compatibility adapter under the hood
export {
  getGlobalFallbackManager,
  initializeGlobalFallbackManager,
  destroyGlobalFallbackManager,
  RateLimitError,
  ProviderUnavailableError,
} from "./provider-fallback-manager";
