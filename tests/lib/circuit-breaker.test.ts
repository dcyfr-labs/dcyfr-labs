import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CircuitBreaker,
  circuitBreakerRegistry,
  withCircuitBreaker,
  getCircuitMetrics,
  getAllCircuitMetrics,
  createMCPCircuit,
  createExternalAPICircuit,
} from '@/lib/security/circuit-breaker';
import type { CircuitBreakerConfig, CircuitState } from '@/lib/security/circuit-breaker';

function makeConfig(overrides?: Partial<CircuitBreakerConfig>): CircuitBreakerConfig {
  return {
    serviceName: 'test-service',
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 1000,
    ...overrides,
  };
}

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(makeConfig());
  });

  it('starts in CLOSED state', () => {
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('executes successfully in CLOSED state', async () => {
    const result = await breaker.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('tracks metrics', async () => {
    await breaker.execute(() => Promise.resolve('ok'));
    const metrics = breaker.getMetrics();
    expect(metrics.totalRequests).toBe(1);
    expect(metrics.totalSuccesses).toBe(1);
    expect(metrics.totalFailures).toBe(0);
  });

  it('opens after failure threshold', async () => {
    const stateChanges: [CircuitState, CircuitState][] = [];
    breaker = new CircuitBreaker(
      makeConfig({
        onStateChange: (from, to) => stateChanges.push([from, to]),
        isFailure: () => true,
      })
    );

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }

    expect(breaker.getState()).toBe('OPEN');
    expect(stateChanges).toContainEqual(['CLOSED', 'OPEN']);
  });

  it('rejects requests when OPEN', async () => {
    breaker = new CircuitBreaker(makeConfig({ isFailure: () => true }));

    // Trigger OPEN state
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }

    expect(breaker.getState()).toBe('OPEN');
    await expect(breaker.execute(() => Promise.resolve('ok'))).rejects.toThrow(
      'Circuit breaker is OPEN'
    );
  });

  it('transitions to HALF_OPEN after timeout', async () => {
    breaker = new CircuitBreaker(makeConfig({ timeout: 10, isFailure: () => true }));

    // Trigger OPEN state
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }

    // Wait for timeout
    await new Promise((r) => setTimeout(r, 20));

    // Next call should transition to HALF_OPEN and succeed
    const result = await breaker.execute(() => Promise.resolve('recovered'));
    expect(result).toBe('recovered');
  });

  it('closes from HALF_OPEN after success threshold', async () => {
    breaker = new CircuitBreaker(
      makeConfig({ timeout: 10, successThreshold: 2, isFailure: () => true })
    );

    // Trigger OPEN state
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }

    await new Promise((r) => setTimeout(r, 20));

    // Two successes in HALF_OPEN should close circuit
    await breaker.execute(() => Promise.resolve('ok'));
    await breaker.execute(() => Promise.resolve('ok'));
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('returns to OPEN from HALF_OPEN on failure', async () => {
    breaker = new CircuitBreaker(makeConfig({ timeout: 10, isFailure: () => true }));

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }

    await new Promise((r) => setTimeout(r, 20));

    try {
      await breaker.execute(() => Promise.reject(new Error('still failing')));
    } catch {
      // expected
    }

    expect(breaker.getState()).toBe('OPEN');
  });

  it('force open works', () => {
    breaker.forceOpen();
    expect(breaker.getState()).toBe('OPEN');
  });

  it('force close works', async () => {
    breaker.forceOpen();
    breaker.forceClose();
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('reset clears all metrics', async () => {
    await breaker.execute(() => Promise.resolve('ok'));
    breaker.reset();
    const metrics = breaker.getMetrics();
    expect(metrics.totalRequests).toBe(0);
    expect(metrics.totalSuccesses).toBe(0);
    expect(metrics.state).toBe('CLOSED');
  });

  it('handles request timeout', async () => {
    breaker = new CircuitBreaker(makeConfig({ requestTimeout: 10 }));
    await expect(
      breaker.execute(() => new Promise((r) => setTimeout(() => r('late'), 100)))
    ).rejects.toThrow('Request timeout');
  });

  it('default isFailure detects timeout errors', async () => {
    breaker = new CircuitBreaker(makeConfig({ failureThreshold: 1 }));
    try {
      await breaker.execute(() => Promise.reject(new Error('Request timeout')));
    } catch {
      // expected
    }
    expect(breaker.getState()).toBe('OPEN');
  });

  it('default isFailure detects network errors', async () => {
    breaker = new CircuitBreaker(makeConfig({ failureThreshold: 1 }));
    try {
      await breaker.execute(() => Promise.reject(new Error('network error')));
    } catch {
      // expected
    }
    expect(breaker.getState()).toBe('OPEN');
  });

  it('resets failure count on success in CLOSED', async () => {
    breaker = new CircuitBreaker(makeConfig({ failureThreshold: 3, isFailure: () => true }));

    // Two failures, then success
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }
    await breaker.execute(() => Promise.resolve('ok'));

    // Two more failures shouldn't open (count was reset)
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('fail')));
      } catch {
        // expected
      }
    }
    expect(breaker.getState()).toBe('CLOSED');
  });
});

describe('CircuitBreakerRegistry', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('creates new breaker', () => {
    const breaker = circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'reg-test' }));
    expect(breaker).toBeInstanceOf(CircuitBreaker);
  });

  it('returns existing breaker', () => {
    const first = circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'reg-test' }));
    const second = circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'reg-test' }));
    expect(first).toBe(second);
  });

  it('get returns undefined for unknown service', () => {
    expect(circuitBreakerRegistry.get('nonexistent')).toBeUndefined();
  });

  it('getAll returns all breakers', () => {
    circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'a' }));
    circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'b' }));
    expect(circuitBreakerRegistry.getAll().size).toBe(2);
  });

  it('getAllMetrics returns metrics for all', () => {
    circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'a' }));
    const metrics = circuitBreakerRegistry.getAllMetrics();
    expect(metrics.a).toBeDefined();
    expect(metrics.a.state).toBe('CLOSED');
  });

  it('resetAll resets all breakers', () => {
    const breaker = circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'a' }));
    breaker.forceOpen();
    circuitBreakerRegistry.resetAll();
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('remove deletes breaker', () => {
    circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'a' }));
    expect(circuitBreakerRegistry.remove('a')).toBe(true);
    expect(circuitBreakerRegistry.get('a')).toBeUndefined();
  });

  it('clear removes all breakers', () => {
    circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'a' }));
    circuitBreakerRegistry.getOrCreate(makeConfig({ serviceName: 'b' }));
    circuitBreakerRegistry.clear();
    expect(circuitBreakerRegistry.getAll().size).toBe(0);
  });
});

describe('withCircuitBreaker', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('executes function through circuit breaker', async () => {
    const result = await withCircuitBreaker('wt-test', () => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('creates circuit with default config', async () => {
    await withCircuitBreaker('wt-default', () => Promise.resolve('ok'));
    const breaker = circuitBreakerRegistry.get('wt-default');
    expect(breaker).toBeDefined();
  });
});

describe('getCircuitMetrics', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('returns metrics for existing circuit', async () => {
    await withCircuitBreaker('metrics-test', () => Promise.resolve('ok'));
    const metrics = getCircuitMetrics('metrics-test');
    expect(metrics).toBeDefined();
    expect(metrics?.totalRequests).toBe(1);
  });

  it('returns undefined for unknown circuit', () => {
    expect(getCircuitMetrics('nonexistent')).toBeUndefined();
  });
});

describe('getAllCircuitMetrics', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('returns all metrics', async () => {
    await withCircuitBreaker('a', () => Promise.resolve('ok'));
    await withCircuitBreaker('b', () => Promise.resolve('ok'));
    const metrics = getAllCircuitMetrics();
    expect(Object.keys(metrics)).toContain('a');
    expect(Object.keys(metrics)).toContain('b');
  });
});

describe('createMCPCircuit', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('creates circuit with mcp- prefix', () => {
    const breaker = createMCPCircuit('memory');
    expect(breaker).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakerRegistry.get('mcp-memory')).toBe(breaker);
  });
});

describe('createExternalAPICircuit', () => {
  beforeEach(() => {
    circuitBreakerRegistry.clear();
  });

  it('creates circuit with api- prefix', () => {
    const breaker = createExternalAPICircuit('perplexity');
    expect(breaker).toBeInstanceOf(CircuitBreaker);
    expect(circuitBreakerRegistry.get('api-perplexity')).toBe(breaker);
  });
});
