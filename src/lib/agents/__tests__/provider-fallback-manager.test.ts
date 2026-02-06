/**
 * Provider Fallback Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ProviderFallbackManager,
  RateLimitError,
  ProviderUnavailableError,
  type FallbackManagerConfig,
  type TaskContext,
} from '../provider-fallback-manager';

// Store original fetch to restore it later
const originalFetch = global.fetch;

// Mock fetch globally to avoid actual network calls
const mockFetch = vi.fn();

describe('ProviderFallbackManager', () => {
  let manager: ProviderFallbackManager;

  const mockConfig: FallbackManagerConfig = {
    primaryProvider: 'claude',
    fallbackChain: ['groq', 'ollama'],
    autoReturn: false, // Disable for tests
    healthCheckInterval: 1000,
    validationLevel: 'enhanced',
  };

  const mockTask: TaskContext = {
    description: 'Test task',
    phase: 'implementation',
    filesInProgress: [],
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Reset fetch mock and make all providers appear healthy
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({
        'x-ratelimit-remaining': '100',
      }),
    });
    // Replace global fetch with our mock for each test
    global.fetch = mockFetch as any;
    manager = new ProviderFallbackManager(mockConfig);
  });

  afterEach(() => {
    manager.destroy();
    // Restore original fetch after each test
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with primary provider', () => {
      expect(manager.getCurrentProvider()).toBe('claude');
    });

    it('should have health status for all providers', () => {
      const healthStatus = manager.getHealthStatus();
      expect(healthStatus.size).toBeGreaterThan(0);
      expect(healthStatus.has('claude')).toBe(true);
      expect(healthStatus.has('groq')).toBe(true);
      expect(healthStatus.has('ollama')).toBe(true);
    });
  });

  describe('Fallback Execution', () => {
    it('should execute successfully with primary provider', async () => {
      const executor = vi.fn().mockResolvedValue({ data: 'success' });

      const result = await manager.executeWithFallback(mockTask, executor);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('claude');
      expect(result.fallbackUsed).toBe(false);
      expect(executor).toHaveBeenCalledWith('claude');
    });

    it('should fallback to next provider on rate limit', async () => {
      let callCount = 0;
      const executor = vi.fn().mockImplementation((provider) => {
        callCount++;
        if (provider === 'claude') {
          throw new Error('rate limit exceeded');
        }
        return Promise.resolve({ data: 'success from groq' });
      });

      const result = await manager.executeWithFallback(mockTask, executor);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('groq');
      expect(result.fallbackUsed).toBe(true);
    });

    it('should try all providers in fallback chain', async () => {
      const providersAttempted: string[] = [];
      const executor = vi.fn().mockImplementation((provider) => {
        providersAttempted.push(provider);
        if (provider === 'ollama') {
          return Promise.resolve({ data: 'success from ollama' });
        }
        throw new Error('Provider unavailable');
      });

      const resultPromise = manager.executeWithFallback(mockTask, executor);
      await vi.advanceTimersByTimeAsync(15000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.provider).toBe('ollama');
      expect(providersAttempted).toContain('claude');
      expect(providersAttempted).toContain('groq');
      expect(providersAttempted).toContain('ollama');
    });

    it('should throw error when all providers fail', async () => {
      const executor = vi.fn().mockRejectedValue(new Error('All failed'));

      const resultPromise = manager.executeWithFallback(mockTask, executor).catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(15000);
      const error = await resultPromise;

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('All providers exhausted');
    });
  });

  describe('Manual Provider Switching', () => {
    it('should manually fallback to next provider', async () => {
      expect(manager.getCurrentProvider()).toBe('claude');

      await manager.fallbackToNext();

      expect(manager.getCurrentProvider()).toBe('groq');
    });

    it('should return to primary provider', async () => {
      await manager.fallbackToNext();
      expect(manager.getCurrentProvider()).toBe('groq');

      await manager.returnToPrimary();
      expect(manager.getCurrentProvider()).toBe('claude');
    });
  });

  describe('Health Monitoring', () => {
    it('should check provider health', async () => {
      const healthStatus = manager.getHealthStatus();

      healthStatus.forEach((health) => {
        expect(health).toHaveProperty('provider');
        expect(health).toHaveProperty('available');
        expect(health).toHaveProperty('lastChecked');
        expect(health.lastChecked).toBeInstanceOf(Date);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle RateLimitError correctly', () => {
      const error = new RateLimitError('Rate limit', 'claude', 3600);

      expect(error.name).toBe('RateLimitError');
      expect(error.provider).toBe('claude');
      expect(error.retryAfter).toBe(3600);
    });

    it('should handle ProviderUnavailableError correctly', () => {
      const error = new ProviderUnavailableError('Unavailable', 'groq');

      expect(error.name).toBe('ProviderUnavailableError');
      expect(error.provider).toBe('groq');
    });
  });
});
