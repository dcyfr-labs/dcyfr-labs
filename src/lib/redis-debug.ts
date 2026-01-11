/**
 * Redis Connection Management with Enhanced Debugging
 *
 * Provides detailed debugging, timeout handling, and connection monitoring
 * for Redis operations to prevent hanging connections in development.
 *
 * Features:
 * - Connection timeout enforcement
 * - Operation timeout detection
 * - Detailed connection state logging
 * - Automatic retry with backoff
 * - Connection pool health monitoring
 * - Development-only verbose logging
 */

import { createClient, RedisClientType } from 'redis';
import { devLogger } from './dev-logger';

const isDev = process.env.NODE_ENV === 'development';

// Configuration
const REDIS_CONNECT_TIMEOUT = 5000; // 5 seconds
const REDIS_OPERATION_TIMEOUT = 3000; // 3 seconds
const REDIS_MAX_RETRIES = 3;
const REDIS_RETRY_DELAY = 1000; // 1 second

type RedisClient = ReturnType<typeof createClient>;

interface ConnectionStats {
  totalConnections: number;
  totalDisconnections: number;
  totalErrors: number;
  totalTimeouts: number;
  lastError?: string;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
}

class RedisConnectionManager {
  private clients: Map<string, RedisClient> = new Map();
  private stats: Map<string, ConnectionStats> = new Map();
  private connectionPromises: Map<string, Promise<RedisClient>> = new Map();

  /**
   * Get or create a Redis client with timeout and error handling
   */
  async getClient(
    clientId: string,
    url?: string,
    options?: {
      timeout?: number;
      maxRetries?: number;
    }
  ): Promise<RedisClient | null> {
    const redisUrl = url || process.env.REDIS_URL;
    if (!redisUrl) {
      devLogger.redis('Redis URL not configured', {
        operation: `getClient:${clientId}`,
        metadata: { clientId },
      });
      return null;
    }

    // If already connecting, wait for that connection
    const existingPromise = this.connectionPromises.get(clientId);
    if (existingPromise) {
      devLogger.redis('Reusing existing connection promise', {
        operation: `getClient:${clientId}`,
      });
      return existingPromise;
    }

    const client = this.clients.get(clientId);

    // Return existing client if connected
    if (client?.isOpen) {
      devLogger.debug(`Reusing existing Redis client: ${clientId}`);
      return client;
    }

    // Create new connection with timeout
    const connectionPromise = this.createConnection(
      clientId,
      redisUrl,
      options?.timeout || REDIS_CONNECT_TIMEOUT,
      options?.maxRetries || REDIS_MAX_RETRIES
    );

    this.connectionPromises.set(clientId, connectionPromise);

    try {
      const newClient = await connectionPromise;
      this.connectionPromises.delete(clientId);
      return newClient;
    } catch (error) {
      this.connectionPromises.delete(clientId);
      throw error;
    }
  }

  /**
   * Create a new Redis connection with timeout and retries
   */
  private async createConnection(
    clientId: string,
    url: string,
    timeout: number,
    maxRetries: number
  ): Promise<RedisClient> {
    devLogger.redis(`Creating new Redis client: ${clientId}`, {
      operation: `createConnection:${clientId}`,
      metadata: { timeout, maxRetries },
    });

    let lastError: Error | unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = await this.attemptConnection(clientId, url, timeout, attempt);
        this.updateStats(clientId, 'connected');
        return client;
      } catch (error) {
        lastError = error;
        this.updateStats(clientId, 'error', error);

        if (attempt < maxRetries) {
          const delay = REDIS_RETRY_DELAY * attempt;
          devLogger.warn(`Redis connection attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms`, {
            operation: `createConnection:${clientId}`,
            error,
          });
          await this.sleep(delay);
        }
      }
    }

    devLogger.error(`Failed to connect to Redis after ${maxRetries} attempts`, {
      operation: `createConnection:${clientId}`,
      error: lastError,
    });

    throw new Error(
      `Failed to connect to Redis (${clientId}) after ${maxRetries} attempts: ${
        lastError instanceof Error ? lastError.message : 'Unknown error'
      }`
    );
  }

  /**
   * Attempt a single connection with timeout
   */
  private async attemptConnection(
    clientId: string,
    url: string,
    timeout: number,
    attempt: number
  ): Promise<RedisClient> {
    const startTime = Date.now();

    const client = createClient({
      url,
      socket: {
        connectTimeout: timeout,
        reconnectStrategy: false, // Disable auto-reconnect in dev
      },
    });

    // Setup error handler before connecting
    client.on('error', (error) => {
      devLogger.error(`Redis client error (${clientId})`, {
        operation: `redis:error:${clientId}`,
        error,
      });
      this.updateStats(clientId, 'error', error);
    });

    client.on('reconnecting', () => {
      devLogger.warn(`Redis client reconnecting (${clientId})`, {
        operation: `redis:reconnecting:${clientId}`,
      });
    });

    client.on('end', () => {
      devLogger.info(`Redis client connection ended (${clientId})`, {
        operation: `redis:end:${clientId}`,
      });
      this.updateStats(clientId, 'disconnected');
    });

    // Connect with timeout
    const connectPromise = client.connect();
    const timeoutPromise = this.createTimeoutPromise(timeout, `Redis connection timeout for ${clientId}`);

    await Promise.race([connectPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    devLogger.redis(`Redis connected successfully (${clientId})`, {
      operation: `attemptConnection:${clientId}`,
      duration,
      metadata: { attempt },
    });

    this.clients.set(clientId, client);
    return client;
  }

  /**
   * Execute a Redis operation with timeout
   */
  async withTimeout<T>(
    clientId: string,
    operation: (client: RedisClient) => Promise<T>,
    operationName: string,
    timeout: number = REDIS_OPERATION_TIMEOUT
  ): Promise<T | null> {
    const client = await this.getClient(clientId);
    if (!client) {
      devLogger.warn(`No Redis client available for operation: ${operationName}`, {
        operation: operationName,
      });
      return null;
    }

    try {
      const startTime = Date.now();

      const operationPromise = operation(client);
      const timeoutPromise = this.createTimeoutPromise(
        timeout,
        `Redis operation timeout: ${operationName}`
      );

      const result = await Promise.race([operationPromise, timeoutPromise]);

      const duration = Date.now() - startTime;
      devLogger.redis(`Redis operation completed: ${operationName}`, {
        operation: operationName,
        duration,
      });

      return result as T;
    } catch (error) {
      this.updateStats(clientId, 'error', error);

      if (error instanceof Error && error.message.includes('timeout')) {
        this.updateStats(clientId, 'timeout');
      }

      devLogger.error(`Redis operation failed: ${operationName}`, {
        operation: operationName,
        error,
      });

      // In dev, we fail gracefully
      if (isDev) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Create a timeout promise that rejects after specified ms
   */
  private createTimeoutPromise(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(message));
      }, ms);
    });
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update connection statistics
   */
  private updateStats(
    clientId: string,
    event: 'connected' | 'disconnected' | 'error' | 'timeout',
    error?: Error | unknown
  ): void {
    const stats = this.stats.get(clientId) || {
      totalConnections: 0,
      totalDisconnections: 0,
      totalErrors: 0,
      totalTimeouts: 0,
    };

    switch (event) {
      case 'connected':
        stats.totalConnections++;
        stats.lastConnectedAt = new Date();
        break;
      case 'disconnected':
        stats.totalDisconnections++;
        stats.lastDisconnectedAt = new Date();
        break;
      case 'error':
        stats.totalErrors++;
        stats.lastError = error instanceof Error ? error.message : String(error);
        break;
      case 'timeout':
        stats.totalTimeouts++;
        break;
    }

    this.stats.set(clientId, stats);
  }

  /**
   * Get connection statistics for a client
   */
  getStats(clientId: string): ConnectionStats | null {
    return this.stats.get(clientId) || null;
  }

  /**
   * Get all connection statistics
   */
  getAllStats(): Record<string, ConnectionStats> {
    const allStats: Record<string, ConnectionStats> = {};
    this.stats.forEach((stats, clientId) => {
      allStats[clientId] = stats;
    });
    return allStats;
  }

  /**
   * Disconnect a specific client
   */
  async disconnect(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      if (client.isOpen) {
        await client.quit();
        devLogger.info(`Disconnected Redis client: ${clientId}`, {
          operation: `disconnect:${clientId}`,
        });
      }
    } catch (error) {
      devLogger.error(`Error disconnecting Redis client: ${clientId}`, {
        operation: `disconnect:${clientId}`,
        error,
      });
    } finally {
      this.clients.delete(clientId);
      this.updateStats(clientId, 'disconnected');
    }
  }

  /**
   * Disconnect all clients
   */
  async disconnectAll(): Promise<void> {
    devLogger.info('Disconnecting all Redis clients');

    const disconnectPromises = Array.from(this.clients.keys()).map((clientId) =>
      this.disconnect(clientId)
    );

    await Promise.allSettled(disconnectPromises);
  }

  /**
   * Log current connection status
   */
  logStatus(): void {
    if (!isDev) return;

    const allStats = this.getAllStats();
    const clientIds = Array.from(this.clients.keys());

    devLogger.info('Redis Connection Status', {
      metadata: {
        activeClients: clientIds.length,
        clients: clientIds,
        stats: allStats,
      },
    });

    clientIds.forEach((clientId) => {
      const client = this.clients.get(clientId);
      const stats = this.stats.get(clientId);
      const isOpen = client?.isOpen || false;

      console.warn(`  ${clientId}:`, {
        connected: isOpen,
        stats,
      });
    });
  }
}

// Export singleton instance
export const redisManager = new RedisConnectionManager();

/**
 * Helper to create monitored Redis client getter
 */
export function createMonitoredRedisClient(clientId: string) {
  return async (): Promise<RedisClient | null> => {
    return redisManager.getClient(clientId);
  };
}

/**
 * Setup periodic connection monitoring in development
 */
export function setupRedisMonitoring(intervalMs: number = 30000): NodeJS.Timeout | null {
  if (!isDev) return null;

  const interval = setInterval(() => {
    redisManager.logStatus();
  }, intervalMs);

  return interval;
}
