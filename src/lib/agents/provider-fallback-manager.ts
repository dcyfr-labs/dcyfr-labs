/**
 * Provider Fallback Manager (v1.0)
 *
 * ⚠️ DEPRECATED: This module is being migrated to @dcyfr/ai framework.
 *
 * Migration path:
 * - Use @dcyfr/ai framework: import { ProviderRegistry } from '@dcyfr/ai'
 * - For backward compatibility: import { getCompatibilityProvider } from '@/lib/agents/compat'
 *
 * This file will be removed in a future version. All new code should use @dcyfr/ai.
 *
 * Automatically detects rate limits and failures in primary providers (Claude Code)
 * and falls back to secondary providers (Groq, Ollama) with session state preservation.
 *
 * Features:
 * - Rate limit detection
 * - Automatic session state save/restore
 * - Provider health monitoring
 * - Configurable fallback chain
 * - Context preservation across providers
 *
 * @example
 * ```typescript
 * // DEPRECATED - Old import:
 * // import { ProviderFallbackManager } from '@/lib/agents/provider-fallback-manager';
 *
 * // NEW - Use compat layer:
 * import { getCompatibilityProvider } from '@/lib/agents/compat';
 *
 * // Or use @dcyfr/ai directly:
 * import { ProviderRegistry } from '@dcyfr/ai';
 *
 * const manager = new ProviderFallbackManager({
 *   primaryProvider: 'claude',
 *   fallbackChain: ['groq', 'ollama'],
 *   autoReturn: true,
 *   healthCheckInterval: 60000, // 1 minute
 * });
 *
 * const result = await manager.executeWithFallback(task);
 * ```
 */

export type ProviderType = "claude" | "groq" | "ollama" | "copilot";

export interface ProviderConfig {
  name: ProviderType;
  apiEndpoint?: string;
  healthCheckUrl?: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export interface FallbackManagerConfig {
  primaryProvider: ProviderType;
  fallbackChain: ProviderType[];
  autoReturn: boolean; // Return to primary when available
  healthCheckInterval: number; // ms
  sessionStatePath?: string;
  validationLevel: "standard" | "enhanced" | "strict";
}

export interface TaskContext {
  description: string;
  phase: "planning" | "implementation" | "validation" | "complete";
  estimatedTime?: string;
  filesInProgress: string[];
  validationStatus?: {
    typescript?: "pass" | "fail" | "pending";
    eslint?: "pass" | "fail" | "pending";
    tests?: "pass" | "fail" | "pending";
    designTokens?: "pass" | "fail" | "pending";
  };
}

export interface ExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  provider: ProviderType;
  fallbackUsed: boolean;
  error?: Error;
  executionTime: number;
  validationsPassed: string[];
  validationsFailed: string[];
}

export interface ProviderHealth {
  provider: ProviderType;
  available: boolean;
  responseTime?: number;
  lastChecked: Date;
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
  error?: string;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public provider: ProviderType,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ProviderUnavailableError extends Error {
  constructor(
    message: string,
    public provider: ProviderType
  ) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

export class ProviderFallbackManager {
  private config: FallbackManagerConfig;
  private providerConfigs: Map<ProviderType, ProviderConfig>;
  private healthStatus: Map<ProviderType, ProviderHealth>;
  private currentProvider: ProviderType;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: FallbackManagerConfig) {
    this.config = config;
    this.currentProvider = config.primaryProvider;
    this.providerConfigs = new Map();
    this.healthStatus = new Map();

    // Initialize default provider configurations
    this.initializeProviderConfigs();

    // Start health monitoring if auto-return enabled
    if (config.autoReturn) {
      this.startHealthMonitoring();
    }
  }

  private initializeProviderConfigs(): void {
    const defaultConfigs: ProviderConfig[] = [
      {
        name: "claude",
        healthCheckUrl: "https://api.anthropic.com/v1/messages",
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
      },
      {
        name: "groq",
        healthCheckUrl: "https://api.groq.com/openai/v1/models",
        maxRetries: 2,
        retryDelay: 500,
        timeout: 20000,
      },
      {
        name: "ollama",
        apiEndpoint: "http://localhost:11434",
        healthCheckUrl: "http://localhost:11434/api/tags",
        maxRetries: 1,
        retryDelay: 100,
        timeout: 10000,
      },
      {
        name: "copilot",
        maxRetries: 2,
        retryDelay: 500,
        timeout: 15000,
      },
    ];

    defaultConfigs.forEach((config) => {
      this.providerConfigs.set(config.name, config);
      this.healthStatus.set(config.name, {
        provider: config.name,
        available: true,
        lastChecked: new Date(),
      });
    });
  }

  private async checkProviderHealth(
    provider: ProviderType
  ): Promise<ProviderHealth> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      return {
        provider,
        available: false,
        lastChecked: new Date(),
        error: "Provider configuration not found",
      };
    }

    const startTime = Date.now();

    try {
      if (!config.healthCheckUrl) {
        // For providers without health check URL, assume available
        return {
          provider,
          available: true,
          responseTime: 0,
          lastChecked: new Date(),
        };
      }

      // Simple HEAD request to check availability
      const response = await fetch(config.healthCheckUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(config.timeout),
      });

      const responseTime = Date.now() - startTime;

      // Extract rate limit info from headers (if available)
      const rateLimitRemaining = response.headers.get("x-ratelimit-remaining")
        ? parseInt(response.headers.get("x-ratelimit-remaining")!, 10)
        : undefined;

      const rateLimitReset = response.headers.get("x-ratelimit-reset")
        ? new Date(
            parseInt(response.headers.get("x-ratelimit-reset")!, 10) * 1000
          )
        : undefined;

      return {
        provider,
        available: response.ok,
        responseTime,
        lastChecked: new Date(),
        rateLimitRemaining,
        rateLimitReset,
      };
    } catch (error) {
      return {
        provider,
        available: false,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      // Check primary provider health
      const primaryHealth = await this.checkProviderHealth(
        this.config.primaryProvider
      );
      this.healthStatus.set(this.config.primaryProvider, primaryHealth);

      // If current provider is fallback and primary is healthy, switch back
      if (
        this.currentProvider !== this.config.primaryProvider &&
        primaryHealth.available
      ) {
        console.warn(
          `✅ Primary provider ${this.config.primaryProvider} available again, switching back...`
        );
        await this.switchProvider(this.config.primaryProvider);
      }
    }, this.config.healthCheckInterval);
  }

  private async switchProvider(targetProvider: ProviderType): Promise<void> {
    if (this.currentProvider === targetProvider) {
      return;
    }

    console.warn(
      `🔄 Switching provider: ${this.currentProvider} → ${targetProvider}`
    );

    // Save current session state
    await this.saveSessionState(this.currentProvider);

    // Update current provider
    const previousProvider = this.currentProvider;
    this.currentProvider = targetProvider;

    // Restore session state for new provider
    await this.restoreSessionState(targetProvider, previousProvider);

    console.warn(`✅ Provider switched to ${targetProvider}`);
  }

  private async saveSessionState(provider: ProviderType): Promise<void> {
    // This would integrate with your existing session state system
    // For now, log the action
    console.warn(`💾 Saving session state for ${provider}`);

    // In production, this would call:
    // await execAsync(`npm run session:save ${provider} "Auto-save before fallback"`);
  }

  private async restoreSessionState(
    targetProvider: ProviderType,
    sourceProvider: ProviderType
  ): Promise<void> {
    console.warn(
      `📂 Restoring session state from ${sourceProvider} to ${targetProvider}`
    );

    // In production, this would call:
    // await execAsync(`npm run session:handoff ${sourceProvider} ${targetProvider}`);
  }

  private async executeWithProvider<T>(
    provider: ProviderType,
    task: TaskContext,
    executor: (provider: ProviderType) => Promise<T>
  ): Promise<ExecutionResult<T>> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      throw new Error(`Provider configuration not found: ${provider}`);
    }

    const startTime = Date.now();
    let lastError: Error | undefined;

    // Retry logic
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        console.warn(
          `🔄 Executing with ${provider} (attempt ${attempt}/${config.maxRetries})`
        );

        const data = await executor(provider);
        const executionTime = Date.now() - startTime;

        return {
          success: true,
          data,
          provider,
          fallbackUsed: provider !== this.config.primaryProvider,
          executionTime,
          validationsPassed: [],
          validationsFailed: [],
        };
      } catch (error) {
        lastError = error as Error;

        // Check if rate limit error
        if (
          error instanceof Error &&
          (error.message.includes("rate limit") ||
            error.message.includes("429"))
        ) {
          throw new RateLimitError(
            `Rate limit exceeded for ${provider}`,
            provider
          );
        }

        // Retry with delay if not last attempt
        if (attempt < config.maxRetries) {
          console.warn(
            `⏳ Retrying in ${config.retryDelay}ms (attempt ${attempt}/${config.maxRetries})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, config.retryDelay)
          );
        }
      }
    }

    // All retries failed
    throw new ProviderUnavailableError(
      `Provider ${provider} unavailable after ${config.maxRetries} attempts: ${lastError?.message}`,
      provider
    );
  }

  /**
   * Execute a task with automatic fallback on failure
   */
  public async executeWithFallback<T>(
    task: TaskContext,
    executor: (provider: ProviderType) => Promise<T>
  ): Promise<ExecutionResult<T>> {
    const providers = [this.currentProvider, ...this.config.fallbackChain];
    let lastError: Error | undefined;

    for (const provider of providers) {
      try {
        // Check provider health first
        const health = await this.checkProviderHealth(provider);
        this.healthStatus.set(provider, health);

        if (!health.available) {
          console.warn(`⚠️  Provider ${provider} not available, skipping...`);
          continue;
        }

        // Attempt execution
        const result = await this.executeWithProvider(provider, task, executor);

        // Update current provider if fallback was used
        if (result.fallbackUsed && provider !== this.currentProvider) {
          await this.switchProvider(provider);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof RateLimitError) {
          console.warn(
            `⏱️  Rate limit hit on ${provider}, trying next provider...`
          );
          continue;
        }

        if (error instanceof ProviderUnavailableError) {
          console.warn(
            `❌ Provider ${provider} unavailable, trying next provider...`
          );
          continue;
        }

        // Unknown error, try next provider
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(
          `⚠️  Error with ${provider}: ${errorMessage}, trying next provider...`
        );
        continue;
      }
    }

    // All providers failed
    throw new Error(
      `All providers exhausted. Last error: ${lastError?.message || "Unknown"}`
    );
  }

  /**
   * Get current provider health status
   */
  public getHealthStatus(): Map<ProviderType, ProviderHealth> {
    return new Map(this.healthStatus);
  }

  /**
   * Get current active provider
   */
  public getCurrentProvider(): ProviderType {
    return this.currentProvider;
  }

  /**
   * Manually trigger fallback to next provider
   */
  public async fallbackToNext(): Promise<void> {
    const currentIndex = this.config.fallbackChain.indexOf(
      this.currentProvider
    );
    const nextProvider =
      this.config.fallbackChain[currentIndex + 1] ||
      this.config.fallbackChain[0];

    await this.switchProvider(nextProvider);
  }

  /**
   * Manually return to primary provider
   */
  public async returnToPrimary(): Promise<void> {
    await this.switchProvider(this.config.primaryProvider);
  }

  /**
   * Stop health monitoring
   */
  public destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }
}

/**
 * Singleton instance for global access
 */
let globalManager: ProviderFallbackManager | null = null;

export function initializeGlobalFallbackManager(
  config: FallbackManagerConfig
): ProviderFallbackManager {
  if (globalManager) {
    globalManager.destroy();
  }

  globalManager = new ProviderFallbackManager(config);
  return globalManager;
}

export function getGlobalFallbackManager(): ProviderFallbackManager | null {
  return globalManager;
}

export function destroyGlobalFallbackManager(): void {
  if (globalManager) {
    globalManager.destroy();
    globalManager = null;
  }
}
