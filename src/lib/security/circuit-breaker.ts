/**
 * Circuit Breaker Pattern - ASI08 Mitigation
 *
 * Prevents cascading failures when external services misbehave.
 * Implements the circuit breaker pattern with three states:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service failing, requests blocked immediately
 * - HALF_OPEN: Testing recovery, limited requests allowed
 *
 * Use cases:
 * - Inngest event sending
 * - MCP server calls
 * - External API requests (GitHub, Sentry, Perplexity, etc.)
 *
 * OWASP ASI-2026: ASI08 - External Service Dependency Failures
 */

// ============================================================================
// Types
// ============================================================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Service identifier (e.g., 'inngest', 'github-api', 'mcp-memory') */
  serviceName: string;

  /** Number of failures before opening circuit */
  failureThreshold: number;

  /** Number of successes in HALF_OPEN before closing circuit */
  successThreshold: number;

  /** Time to wait before attempting recovery (ms) */
  timeout: number;

  /** Request timeout for individual calls (ms) */
  requestTimeout?: number;

  /** Custom error detector (return true if error should count as failure) */
  isFailure?: (error: unknown) => boolean;

  /** Fallback function when circuit is OPEN */
  fallback?: () => unknown;

  /** Callback on state change */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

export interface CircuitMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  stateChangedAt: number;
  openedAt: number | null;
  halfOpenedAt: number | null;
}

export interface CircuitBreakerError extends Error {
  name: 'CircuitBreakerError';
  serviceName: string;
  state: CircuitState;
  metrics: CircuitMetrics;
}

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

export class CircuitBreaker {
  private readonly config: Required<CircuitBreakerConfig>;
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private stateChangedAt = Date.now();
  private openedAt: number | null = null;
  private halfOpenedAt: number | null = null;
  private nextAttempt = 0;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold,
      successThreshold: config.successThreshold,
      timeout: config.timeout,
      serviceName: config.serviceName,
      requestTimeout: config.requestTimeout ?? 30000,
      isFailure: config.isFailure ?? this.defaultIsFailure,
      fallback: config.fallback ?? this.defaultFallback,
      onStateChange: config.onStateChange ?? (() => {}),
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        // Circuit still open, use fallback
        throw this.createError('Circuit breaker is OPEN');
      }

      // Timeout expired, attempt recovery
      this.transitionTo('HALF_OPEN');
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);

      // Success
      this.onSuccess();
      return result;
    } catch (error) {
      // Check if this error should count as failure
      if (this.config.isFailure(error)) {
        this.onFailure(error);
      }

      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), this.config.requestTimeout)
      ),
    ]);
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        // Enough successes, close circuit
        this.transitionTo('CLOSED');
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(_error: unknown): void {
    this.lastFailureTime = Date.now();
    this.totalFailures++;
    this.failureCount++;

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.config.failureThreshold) {
      // Open circuit
      this.transitionTo('OPEN');
    }
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = Date.now();

    // Reset counters
    this.failureCount = 0;
    this.successCount = 0;

    // Update state-specific timestamps
    if (newState === 'OPEN') {
      this.openedAt = Date.now();
      this.nextAttempt = Date.now() + this.config.timeout;
    } else if (newState === 'HALF_OPEN') {
      this.halfOpenedAt = Date.now();
    }

    // Notify callback
    this.config.onStateChange(oldState, newState);
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      openedAt: this.openedAt,
      halfOpenedAt: this.halfOpenedAt,
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Force open circuit (for testing or manual intervention)
   */
  forceOpen(): void {
    this.transitionTo('OPEN');
  }

  /**
   * Force close circuit (for testing or manual intervention)
   */
  forceClose(): void {
    this.transitionTo('CLOSED');
  }

  /**
   * Reset circuit to initial state
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.totalSuccesses = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.stateChangedAt = Date.now();
    this.openedAt = null;
    this.halfOpenedAt = null;
    this.nextAttempt = 0;
  }

  /**
   * Default error detector
   */
  private defaultIsFailure(error: unknown): boolean {
    // Network errors, timeouts, 5xx errors count as failures
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')
      );
    }
    return true;
  }

  /**
   * Default fallback (throws error)
   */
  private defaultFallback(): never {
    throw this.createError('Circuit breaker is OPEN - no fallback configured');
  }

  /**
   * Create circuit breaker error
   */
  private createError(message: string): CircuitBreakerError {
    const error = new Error(message) as CircuitBreakerError;
    error.name = 'CircuitBreakerError';
    error.serviceName = this.config.serviceName;
    error.state = this.state;
    error.metrics = this.getMetrics();
    return error;
  }
}

// ============================================================================
// Circuit Breaker Registry
// ============================================================================

/**
 * Global registry for circuit breakers
 */
class CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create circuit breaker for service
   */
  getOrCreate(config: CircuitBreakerConfig): CircuitBreaker {
    const existing = this.breakers.get(config.serviceName);
    if (existing) return existing;

    const breaker = new CircuitBreaker(config);
    this.breakers.set(config.serviceName, breaker);
    return breaker;
  }

  /**
   * Get circuit breaker by service name
   */
  get(serviceName: string): CircuitBreaker | undefined {
    return this.breakers.get(serviceName);
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Get metrics for all circuits
   */
  getAllMetrics(): Record<string, CircuitMetrics> {
    const metrics: Record<string, CircuitMetrics> = {};
    for (const [name, breaker] of this.breakers) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Remove circuit breaker
   */
  remove(serviceName: string): boolean {
    return this.breakers.delete(serviceName);
  }

  /**
   * Clear all circuit breakers
   */
  clear(): void {
    this.breakers.clear();
  }
}

// Singleton instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Execute function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = circuitBreakerRegistry.getOrCreate({
    serviceName,
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
    ...config,
  });

  return breaker.execute(fn);
}

/**
 * Get circuit breaker metrics
 */
export function getCircuitMetrics(serviceName: string): CircuitMetrics | undefined {
  const breaker = circuitBreakerRegistry.get(serviceName);
  return breaker?.getMetrics();
}

/**
 * Get all circuit breaker metrics
 */
export function getAllCircuitMetrics(): Record<string, CircuitMetrics> {
  return circuitBreakerRegistry.getAllMetrics();
}

// ============================================================================
// Predefined Circuit Breakers
// ============================================================================

/**
 * Inngest event sending
 */
export const inngestCircuit = circuitBreakerRegistry.getOrCreate({
  serviceName: 'inngest',
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000, // 30 seconds
  requestTimeout: 10000, // 10 seconds
  isFailure: (error) => {
    if (error instanceof Error) {
      // Don't count 4xx errors as failures (client errors)
      if (error.message.includes('400') || error.message.includes('401')) {
        return false;
      }
    }
    return true;
  },
  onStateChange: (from, to) => {
    console.warn(`[CircuitBreaker] Inngest: ${from} → ${to}`);
  },
});

/**
 * GitHub API
 */
export const githubCircuit = circuitBreakerRegistry.getOrCreate({
  serviceName: 'github-api',
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  requestTimeout: 30000, // 30 seconds
  isFailure: (error) => {
    if (error instanceof Error) {
      // GitHub rate limiting (403) is not a circuit breaker failure
      if (error.message.includes('403') || error.message.includes('rate limit')) {
        return false;
      }
    }
    return true;
  },
  onStateChange: (from, to) => {
    console.warn(`[CircuitBreaker] GitHub API: ${from} → ${to}`);
  },
});

/**
 * MCP servers (generic)
 */
export function createMCPCircuit(serverName: string): CircuitBreaker {
  return circuitBreakerRegistry.getOrCreate({
    serviceName: `mcp-${serverName}`,
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 30000, // 30 seconds
    requestTimeout: 15000, // 15 seconds
    onStateChange: (from, to) => {
      console.warn(`[CircuitBreaker] MCP ${serverName}: ${from} → ${to}`);
    },
  });
}

/**
 * External API (generic)
 */
export function createExternalAPICircuit(apiName: string): CircuitBreaker {
  return circuitBreakerRegistry.getOrCreate({
    serviceName: `api-${apiName}`,
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
    requestTimeout: 30000, // 30 seconds
    onStateChange: (from, to) => {
      console.warn(`[CircuitBreaker] ${apiName} API: ${from} → ${to}`);
    },
  });
}
