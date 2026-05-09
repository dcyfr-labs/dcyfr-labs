/**
 * Circuit Breaker Tests - ASI08 Validation
 *
 * Comprehensive test coverage for circuit breaker pattern:
 * - State transitions (CLOSED → OPEN → HALF_OPEN → CLOSED)
 * - Failure threshold enforcement
 * - Timeout and recovery
 * - Metrics tracking
 * - Registry management
 * - Predefined circuits (Inngest, GitHub, MCP)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CircuitBreaker,
  circuitBreakerRegistry,
  withCircuitBreaker,
  getCircuitMetrics,
  getAllCircuitMetrics,
  inngestCircuit,
  githubCircuit,
  createMCPCircuit,
  createExternalAPICircuit,
} from '@/lib/security/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      serviceName: 'test-service',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      requestTimeout: 500,
    });
  });

  afterEach(() => {
    circuitBreakerRegistry.clear();
    vi.clearAllTimers();
  });

  describe('CLOSED State (Normal Operation)', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should execute function successfully', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await breaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledOnce();
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should reset failure count on success', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));
      const successFn = vi.fn().mockResolvedValue('success');

      // Fail twice
      await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      await expect(breaker.execute(failFn)).rejects.toThrow('network error');

      // Success should reset failure count
      await breaker.execute(successFn);

      const metrics = breaker.getMetrics();
      expect(metrics.state).toBe('CLOSED');
      expect(metrics.failureCount).toBe(0); // Reset
      expect(metrics.totalFailures).toBe(2); // Historical count
    });

    it('should track metrics correctly', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      await breaker.execute(fn);

      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.totalSuccesses).toBe(1);
      expect(metrics.totalFailures).toBe(0);
      expect(metrics.lastSuccessTime).toBeGreaterThan(0);
      expect(metrics.lastFailureTime).toBeNull();
    });
  });

  describe('OPEN State (Circuit Opened)', () => {
    it('should open circuit after failure threshold', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('network error'));

      // Fail 3 times (threshold)
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(fn)).rejects.toThrow('network error');
      }

      expect(breaker.getState()).toBe('OPEN');
    });

    it('should block requests when circuit is OPEN', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('network error'));

      // Open circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(fn)).rejects.toThrow('network error');
      }

      // Next request should be blocked immediately
      const blockedFn = vi.fn().mockResolvedValue('should not execute');
      await expect(breaker.execute(blockedFn)).rejects.toThrow('Circuit breaker is OPEN');

      expect(blockedFn).not.toHaveBeenCalled();
    });

    it('should track openedAt timestamp', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('network error'));

      const before = Date.now();
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(fn)).rejects.toThrow('network error');
      }
      const after = Date.now();

      const metrics = breaker.getMetrics();
      expect(metrics.openedAt).toBeGreaterThanOrEqual(before);
      expect(metrics.openedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('HALF_OPEN State (Testing Recovery)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      // Open circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      }
      expect(breaker.getState()).toBe('OPEN');

      // Advance time past timeout
      vi.advanceTimersByTime(1500);

      // Next request should transition to HALF_OPEN
      const testFn = vi.fn().mockResolvedValue('testing');
      await breaker.execute(testFn);

      expect(breaker.getState()).toBe('HALF_OPEN');
      expect(testFn).toHaveBeenCalledOnce();
    });

    it('should close circuit after success threshold in HALF_OPEN', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));
      const successFn = vi.fn().mockResolvedValue('success');

      // Open circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      }

      // Wait for timeout
      vi.advanceTimersByTime(1500);

      // Succeed twice (success threshold)
      await breaker.execute(successFn);
      expect(breaker.getState()).toBe('HALF_OPEN');

      await breaker.execute(successFn);
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should re-open circuit on failure in HALF_OPEN', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));
      const successFn = vi.fn().mockResolvedValue('success');

      // Open circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      }

      // Wait for timeout
      vi.advanceTimersByTime(1500);

      // Succeed once
      await breaker.execute(successFn);
      expect(breaker.getState()).toBe('HALF_OPEN');

      // Fail again - should re-open
      await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      expect(breaker.getState()).toBe('OPEN');
    });
  });

  describe('Request Timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should timeout slow requests', async () => {
      const slowFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 2000)));

      const promise = breaker.execute(slowFn);

      // Advance past request timeout (500ms)
      vi.advanceTimersByTime(600);

      await expect(promise).rejects.toThrow('Request timeout');
    });

    it('should count timeout as failure', async () => {
      const slowFn = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 2000)));

      // Timeout 3 times
      for (let i = 0; i < 3; i++) {
        const promise = breaker.execute(slowFn);
        vi.advanceTimersByTime(600);
        await expect(promise).rejects.toThrow('Request timeout');
      }

      expect(breaker.getState()).toBe('OPEN');
    });
  });

  describe('Custom Error Detection', () => {
    it('should use custom isFailure function', async () => {
      const customBreaker = new CircuitBreaker({
        serviceName: 'custom',
        failureThreshold: 2,
        successThreshold: 1,
        timeout: 1000,
        isFailure: (error) => {
          // Only network errors count as failures
          return error instanceof Error && error.message.includes('network');
        },
      });

      // This error should NOT count as failure
      const clientErrorFn = vi.fn().mockRejectedValue(new Error('400 Bad Request'));
      await expect(customBreaker.execute(clientErrorFn)).rejects.toThrow('400 Bad Request');
      expect(customBreaker.getState()).toBe('CLOSED');

      // This error SHOULD count as failure
      const networkErrorFn = vi.fn().mockRejectedValue(new Error('network timeout'));
      await expect(customBreaker.execute(networkErrorFn)).rejects.toThrow('network timeout');
      await expect(customBreaker.execute(networkErrorFn)).rejects.toThrow('network timeout');

      expect(customBreaker.getState()).toBe('OPEN');
    });
  });

  describe('State Change Callbacks', () => {
    it('should call onStateChange callback', async () => {
      const onStateChange = vi.fn();
      const callbackBreaker = new CircuitBreaker({
        serviceName: 'callback-test',
        failureThreshold: 2,
        successThreshold: 1,
        timeout: 1000,
        onStateChange,
      });

      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      // Fail twice to open circuit
      await expect(callbackBreaker.execute(failFn)).rejects.toThrow('network error');
      await expect(callbackBreaker.execute(failFn)).rejects.toThrow('network error');

      expect(onStateChange).toHaveBeenCalledWith('CLOSED', 'OPEN');
    });
  });

  describe('Manual Control', () => {
    it('should force open circuit', () => {
      expect(breaker.getState()).toBe('CLOSED');
      breaker.forceOpen();
      expect(breaker.getState()).toBe('OPEN');
    });

    it('should force close circuit', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      // Open circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      }
      expect(breaker.getState()).toBe('OPEN');

      // Force close
      breaker.forceClose();
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should reset circuit', async () => {
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      // Create some history
      await expect(breaker.execute(failFn)).rejects.toThrow('network error');
      await expect(breaker.execute(failFn)).rejects.toThrow('network error');

      breaker.reset();

      const metrics = breaker.getMetrics();
      expect(metrics.state).toBe('CLOSED');
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.totalFailures).toBe(0);
      expect(metrics.failureCount).toBe(0);
    });
  });

  describe('Metrics', () => {
    it('should provide comprehensive metrics', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const failFn = vi.fn().mockRejectedValue(new Error('network error'));

      await breaker.execute(successFn);
      await expect(breaker.execute(failFn)).rejects.toThrow('network error');

      const metrics = breaker.getMetrics();

      expect(metrics).toMatchObject({
        state: 'CLOSED',
        failureCount: 1,
        successCount: 0,
        totalRequests: 2,
        totalFailures: 1,
        totalSuccesses: 1,
      });

      expect(metrics.lastSuccessTime).toBeGreaterThan(0);
      expect(metrics.lastFailureTime).toBeGreaterThan(0);
      expect(metrics.stateChangedAt).toBeGreaterThan(0);
    });
  });
});

describe('Circuit Breaker Registry', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('should create and retrieve circuit breakers', () => {
    const breaker = circuitBreakerRegistry.getOrCreate({
      serviceName: 'test',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });

    expect(breaker).toBeInstanceOf(CircuitBreaker);
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should return existing circuit breaker', () => {
    const breaker1 = circuitBreakerRegistry.getOrCreate({
      serviceName: 'test',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });

    const breaker2 = circuitBreakerRegistry.getOrCreate({
      serviceName: 'test',
      failureThreshold: 5, // Different config
      successThreshold: 1,
      timeout: 2000,
    });

    expect(breaker1).toBe(breaker2); // Same instance
  });

  it('should get all metrics', () => {
    circuitBreakerRegistry.getOrCreate({
      serviceName: 'service1',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });

    circuitBreakerRegistry.getOrCreate({
      serviceName: 'service2',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });

    const allMetrics = circuitBreakerRegistry.getAllMetrics();

    expect(Object.keys(allMetrics)).toHaveLength(2);
    expect(allMetrics['service1']).toBeDefined();
    expect(allMetrics['service2']).toBeDefined();
  });

  it('should reset all circuits', async () => {
    const breaker = circuitBreakerRegistry.getOrCreate({
      serviceName: 'test',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });

    const failFn = vi.fn().mockRejectedValue(new Error('network error'));
    await expect(breaker.execute(failFn)).rejects.toThrow('network error');

    circuitBreakerRegistry.resetAll();

    const metrics = breaker.getMetrics();
    expect(metrics.totalRequests).toBe(0);
  });

  it('should remove circuit breaker', () => {
    circuitBreakerRegistry.getOrCreate({
      serviceName: 'test',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
    });

    expect(circuitBreakerRegistry.get('test')).toBeDefined();

    circuitBreakerRegistry.remove('test');

    expect(circuitBreakerRegistry.get('test')).toBeUndefined();
  });
});

describe('Convenience Functions', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('should execute with circuit breaker via withCircuitBreaker', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withCircuitBreaker('test-service', fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should get circuit metrics via getCircuitMetrics', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    await withCircuitBreaker('test-service', fn);

    const metrics = getCircuitMetrics('test-service');

    expect(metrics).toBeDefined();
    expect(metrics?.totalRequests).toBe(1);
  });

  it('should get all circuit metrics via getAllCircuitMetrics', async () => {
    await withCircuitBreaker('service1', vi.fn().mockResolvedValue('success'));
    await withCircuitBreaker('service2', vi.fn().mockResolvedValue('success'));

    const allMetrics = getAllCircuitMetrics();

    expect(Object.keys(allMetrics)).toHaveLength(2);
  });
});

describe('Predefined Circuits', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('should have Inngest circuit configured', () => {
    expect(inngestCircuit).toBeInstanceOf(CircuitBreaker);
    expect(inngestCircuit.getState()).toBe('CLOSED');

    const metrics = inngestCircuit.getMetrics();
    expect(metrics).toBeDefined();
  });

  it('should have GitHub circuit configured', () => {
    expect(githubCircuit).toBeInstanceOf(CircuitBreaker);
    expect(githubCircuit.getState()).toBe('CLOSED');
  });

  it('should create MCP circuit', () => {
    const memoryCircuit = createMCPCircuit('memory');

    expect(memoryCircuit).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakerRegistry.get('mcp-memory')).toBe(memoryCircuit);
  });

  it('should create external API circuit', () => {
    const perplexityCircuit = createExternalAPICircuit('perplexity');

    expect(perplexityCircuit).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakerRegistry.get('api-perplexity')).toBe(perplexityCircuit);
  });

  it('should not count 4xx errors as Inngest failures', async () => {
    const badRequestFn = vi.fn().mockRejectedValue(new Error('400 Bad Request'));

    // Execute 5 times (more than failure threshold)
    for (let i = 0; i < 5; i++) {
      await expect(inngestCircuit.execute(badRequestFn)).rejects.toThrow('400 Bad Request');
    }

    // Circuit should still be CLOSED (4xx errors don't count)
    expect(inngestCircuit.getState()).toBe('CLOSED');
  });

  it('should not count rate limits as GitHub failures', async () => {
    const rateLimitFn = vi.fn().mockRejectedValue(new Error('403 rate limit exceeded'));

    // Execute 10 times (more than failure threshold)
    for (let i = 0; i < 10; i++) {
      await expect(githubCircuit.execute(rateLimitFn)).rejects.toThrow('403 rate limit exceeded');
    }

    // Circuit should still be CLOSED (rate limits don't count)
    expect(githubCircuit.getState()).toBe('CLOSED');
  });
});
