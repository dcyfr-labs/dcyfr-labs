'use server';

/**
 * Compatibility Adapter for @dcyfr/ai Framework
 *
 * Bridges the old dcyfr-labs agent system with the new @dcyfr/ai framework.
 * Provides backward compatibility while migrating to the new modular architecture.
 *
 * Migration Strategy:
 * 1. Import new packages (@dcyfr/ai, @dcyfr/agents)
 * 2. Adapt old interfaces to new framework
 * 3. Maintain existing API surface
 * 4. Gradually deprecate old code
 *
 * IMPORTANT: This module is SERVER-ONLY - it imports @dcyfr/ai which uses Node.js
 * APIs including better-sqlite3. Must not be bundled for client.
 */

import {
  TelemetryEngine,
  TelemetrySessionManager,
  ProviderRegistry,
  loadConfig,
  type TelemetrySession as NewTelemetrySession,
  type ProviderRegistryConfig,
  type ComparisonStats,
  type HandoffPatterns,
  type ProviderHealth as NewProviderHealth,
  type ExecutionResult as NewExecutionResult,
} from '@dcyfr/ai';

import type {
  AgentType,
  TaskType,
  TaskOutcome,
  TelemetrySession as OldTelemetrySession,
  ViolationRecord,
  HandoffRecord,
  CostEstimate,
  ProviderType,
  TaskContext,
  ExecutionResult,
  ProviderHealth,
} from './legacy-types';

/**
 * Compatibility wrapper for TelemetryEngine
 * Adapts the new framework to the old agent-telemetry interface
 */
export class CompatibilityTelemetryAdapter {
  private engine: TelemetryEngine;

  constructor() {
    // Initialize with memory storage for now
    this.engine = new TelemetryEngine({
      storage: 'memory',
    });
  }

  /**
   * Load configuration from new framework
   */
  async initialize(): Promise<void> {
    try {
      const config = await loadConfig({
        projectRoot: process.cwd(),
        validate: true,
      });

      // Update engine with config settings if telemetry storage is configured
      if (config?.telemetry?.storage) {
        this.engine = new TelemetryEngine({
          storage: config.telemetry.storage as any,
          basePath: config.telemetry.storagePath,
        });
      }
    } catch (error) {
      console.warn('⚠️  Failed to load config, using defaults:', error);
      // Continue with memory storage
    }
  }

  /**
   * Start a telemetry session (old interface)
   */
  startSession(
    agent: AgentType,
    context: {
      taskType: TaskType;
      description: string;
      projectName?: string;
    }
  ): CompatibleTelemetrySession {
    const session = this.engine.startSession(agent as any, {
      taskType: context.taskType as any,
      description: context.description,
    });

    return new CompatibleTelemetrySession(session);
  }

  /**
   * Get agent statistics (old interface)
   */
  async getAgentStats(agent: AgentType, period: string = '30d'): Promise<any> {
    const stats = await this.engine.getAgentStats(agent as any, period);
    return stats;
  }

  /**
   * Compare all agents
   */
  async compareAgents(period: string = '30d'): Promise<ComparisonStats> {
    return await this.engine.compareAgents(period);
  }

  /**
   * Get handoff patterns
   */
  async getHandoffPatterns(period: string = '30d'): Promise<HandoffPatterns> {
    return await this.engine.getHandoffPatterns(period);
  }
}

/**
 * Compatible session wrapper
 */
export class CompatibleTelemetrySession {
  constructor(private session: TelemetrySessionManager) {}

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number): void {
    if (this.session && typeof this.session.recordMetric === 'function') {
      this.session.recordMetric(name as any, value);
    }
  }

  /**
   * Record a violation
   */
  recordViolation(violation: ViolationRecord): void {
    if (this.session && typeof this.session.recordViolation === 'function') {
      this.session.recordViolation({
        type: violation.type as any,
        severity: violation.severity as any,
        message: violation.message,
        file: violation.file,
        line: violation.line,
        fixed: violation.fixed,
      });
    }
  }

  /**
   * Record a handoff
   */
  recordHandoff(handoff: HandoffRecord): void {
    if (this.session && typeof this.session.recordHandoff === 'function') {
      this.session.recordHandoff({
        toAgent: handoff.toAgent as any,
        reason: handoff.reason as any,
        automatic: handoff.automatic,
      });
    }
  }

  /**
   * End session
   */
  async end(outcome: TaskOutcome): Promise<OldTelemetrySession> {
    let finalSession: NewTelemetrySession | undefined;

    if (this.session && typeof this.session.end === 'function') {
      finalSession = await this.session.end(outcome as any);
    }

    const sessionData = finalSession || this.session.getSession();

    // Adapt violations to old format (filter out unsupported types)
    const supportedViolationTypes = ['design-token', 'eslint', 'typescript', 'test', 'security'];
    const adaptedViolations: ViolationRecord[] = (sessionData.violations || [])
      .filter((v: any) => supportedViolationTypes.includes(v.type))
      .map((v: any) => ({
        timestamp: v.timestamp,
        type: v.type as ViolationRecord['type'],
        severity: v.severity as ViolationRecord['severity'],
        message: v.message,
        file: v.file,
        line: v.line,
        fixed: v.fixed,
      }));

    // Adapt handoffs to old format (filter out unsupported reasons)
    const supportedHandoffReasons = [
      'rate-limit',
      'quality',
      'manual',
      'cost-optimization',
      'offline',
    ];
    const adaptedHandoffs: HandoffRecord[] = (sessionData.handoffs || [])
      .filter((h: any) => supportedHandoffReasons.includes(h.reason))
      .map((h: any) => ({
        timestamp: h.timestamp,
        fromAgent: h.fromAgent as AgentType,
        toAgent: h.toAgent as AgentType,
        reason: h.reason as HandoffRecord['reason'],
        automatic: h.automatic,
      }));

    // Create properly typed cost estimate
    const cost: CostEstimate = {
      provider: sessionData.agent,
      inputTokens: sessionData.cost?.inputTokens || 0,
      outputTokens: sessionData.cost?.outputTokens || 0,
      estimatedCost: sessionData.cost?.estimatedCost || 0,
      currency: 'USD',
    };

    // Return adapted session
    return {
      sessionId: sessionData.sessionId,
      agent: sessionData.agent as AgentType,
      taskType: sessionData.taskType as TaskType,
      taskDescription: sessionData.taskDescription,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime || new Date(),
      outcome,
      metrics: {
        tokenCompliance: sessionData.metrics.tokenCompliance,
        testPassRate: sessionData.metrics.testPassRate,
        lintViolations: sessionData.metrics.lintViolations,
        typeErrors: sessionData.metrics.typeErrors,
        executionTime: sessionData.metrics.executionTime,
        tokensUsed: sessionData.metrics.tokensUsed,
        filesModified: sessionData.metrics.filesModified,
        linesChanged: sessionData.metrics.linesChanged,
        validations: sessionData.metrics.validations as any,
      },
      violations: adaptedViolations,
      handoffs: adaptedHandoffs,
      cost,
    };
  }

  /**
   * Get current session data
   */
  getSession(): NewTelemetrySession {
    return this.session.getSession();
  }
}

/**
 * Compatibility wrapper for ProviderRegistry
 * Adapts the new framework to the old provider-fallback-manager interface
 */
export class CompatibilityProviderAdapter {
  private registry: ProviderRegistry;

  constructor() {
    const defaultConfig: ProviderRegistryConfig = {
      primaryProvider: 'claude',
      fallbackChain: ['groq', 'ollama', 'copilot'],
      autoReturn: true,
      healthCheckInterval: 60000,
    };
    this.registry = new ProviderRegistry(defaultConfig);
  }

  /**
   * Initialize with configuration
   */
  async initialize(): Promise<void> {
    try {
      await loadConfig({
        projectRoot: process.cwd(),
        validate: true,
      });
      // Config loaded successfully, but FrameworkConfig doesn't include provider settings
      // Keep using default registry configuration
    } catch (error) {
      console.warn('⚠️  Failed to load provider config, using defaults:', error);
    }
  }

  /**
   * Execute with provider (old interface)
   */
  async executeWithProvider<T>(
    provider: ProviderType,
    context: TaskContext,
    executor: (provider: ProviderType) => Promise<T>
  ): Promise<ExecutionResult<T>> {
    try {
      const result: NewExecutionResult<T> = await this.registry.executeWithFallback(
        context as any,
        executor as any
      );

      return {
        success: result.success,
        data: result.data as T,
        provider: result.provider as ProviderType,
        fallbackUsed: result.fallbackUsed,
        executionTime: result.executionTime,
        error: result.error,
        validationsPassed: result.validationsPassed || [],
        validationsFailed: result.validationsFailed || [],
      };
    } catch (error) {
      return {
        success: false,
        data: undefined as any,
        provider,
        fallbackUsed: false,
        executionTime: 0,
        error: error instanceof Error ? error : new Error(String(error)),
        validationsPassed: [],
        validationsFailed: [],
      };
    }
  }

  /**
   * Get provider health
   */
  getProviderHealth(provider: ProviderType): ProviderHealth | undefined {
    const healthStatus = this.registry.getHealthStatus();
    const health = healthStatus.get(provider as any) as NewProviderHealth | undefined;
    if (!health) return undefined;

    return {
      provider: health.provider as ProviderType,
      available: health.available,
      responseTime: health.responseTime,
      lastChecked: health.lastChecked,
      rateLimitRemaining: health.rateLimitRemaining,
      rateLimitReset: health.rateLimitReset,
      error: health.error,
    };
  }

  /**
   * Get all provider health statuses
   */
  getAllHealthStatus(): Map<ProviderType, ProviderHealth> {
    const newStatus = this.registry.getHealthStatus();
    const result = new Map<ProviderType, ProviderHealth>();

    newStatus.forEach((health, key) => {
      result.set(key as ProviderType, {
        provider: health.provider as ProviderType,
        available: health.available,
        responseTime: health.responseTime,
        lastChecked: health.lastChecked,
        rateLimitRemaining: health.rateLimitRemaining,
        rateLimitReset: health.rateLimitReset,
        error: health.error,
      });
    });

    return result;
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): ProviderType {
    return this.registry.getCurrentProvider() as ProviderType;
  }

  /**
   * Fallback to next provider
   */
  async fallbackToNext(): Promise<void> {
    await this.registry.fallbackToNext();
  }

  /**
   * Return to primary provider
   */
  async returnToPrimary(): Promise<void> {
    await this.registry.returnToPrimary();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.registry.destroy();
  }
}

/**
 * Global compatibility adapters
 */
let globalTelemetryAdapter: CompatibilityTelemetryAdapter | null = null;
let globalProviderAdapter: CompatibilityProviderAdapter | null = null;

/**
 * Get or create global telemetry adapter
 */
export function getCompatibilityTelemetry(): CompatibilityTelemetryAdapter {
  if (!globalTelemetryAdapter) {
    globalTelemetryAdapter = new CompatibilityTelemetryAdapter();
    // Initialize asynchronously
    globalTelemetryAdapter.initialize().catch(console.error);
  }
  return globalTelemetryAdapter;
}

/**
 * Get or create global provider adapter
 */
export function getCompatibilityProvider(): CompatibilityProviderAdapter {
  if (!globalProviderAdapter) {
    globalProviderAdapter = new CompatibilityProviderAdapter();
    // Initialize asynchronously
    globalProviderAdapter.initialize().catch(console.error);
  }
  return globalProviderAdapter;
}

/**
 * Reset adapters (for testing)
 */
export function resetCompatibilityAdapters(): void {
  if (globalProviderAdapter) {
    globalProviderAdapter.destroy();
  }
  globalTelemetryAdapter = null;
  globalProviderAdapter = null;
}

/**
 * Backward compatible exports matching old agent-telemetry interface
 */
export const telemetry = getCompatibilityTelemetry();

/**
 * Track agent session (old interface wrapper)
 */
export function trackAgentSession(
  agent: AgentType,
  taskType: TaskType,
  executor: (session: CompatibleTelemetrySession) => Promise<void>
): Promise<OldTelemetrySession> {
  return new Promise(async (resolve, reject) => {
    const session = telemetry.startSession(agent, {
      taskType,
      description: `${taskType} task`,
    });

    try {
      await executor(session);
      const result = await session.end('success');
      resolve(result);
    } catch (error) {
      await session.end('failed');
      reject(error);
    }
  });
}
