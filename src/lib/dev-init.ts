/**
 * Development Initialization Script
 *
 * Sets up comprehensive debugging and monitoring for development environment.
 * This should be called during Next.js instrumentation to enable all dev tools.
 *
 * Features:
 * - Hang detection monitoring
 * - Redis connection monitoring
 * - Process event handlers
 * - Graceful shutdown handling
 * - Verbose startup logging
 */

import { devLogger, setupHangDetection } from './dev-logger';
// TODO: redis-debug is deprecated, remove this import
// import { setupRedisMonitoring, redisManager } from './redis-debug';

const isDev = process.env.NODE_ENV === 'development';

let initialized = false;
let hangDetectionInterval: NodeJS.Timeout | null = null;
let redisMonitorInterval: NodeJS.Timeout | null = null;

/**
 * Initialize development debugging tools
 */
export function initializeDevTools() {
  if (!isDev || initialized) return;

  devLogger.info('🔧 Initializing development debugging tools...');

  // Setup hang detection (check every 10 seconds)
  hangDetectionInterval = setupHangDetection(10000);
  if (hangDetectionInterval) {
    devLogger.info('✓ Hang detection enabled (10s interval)');
  }

  // TODO: Redis monitoring deprecated with Upstash migration
  // Setup Redis monitoring (check every 30 seconds)
  // redisMonitorInterval = setupRedisMonitoring(30000);
  // if (redisMonitorInterval) {
  //   devLogger.info('✓ Redis connection monitoring enabled (30s interval)');
  // }

  // Setup process event handlers
  setupProcessHandlers();

  // Log environment info
  logEnvironmentInfo();

  initialized = true;
  devLogger.info('✓ Development debugging tools initialized successfully');
}

/**
 * Setup process event handlers for debugging
 */
function setupProcessHandlers() {
  // Unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    devLogger.error('Unhandled Promise Rejection', {
      operation: 'unhandledRejection',
      error: reason,
      metadata: {
        promise: String(promise),
      },
    });
  });

  // Uncaught exception handler
  process.on('uncaughtException', (error, origin) => {
    devLogger.error('Uncaught Exception', {
      operation: 'uncaughtException',
      error,
      metadata: {
        origin,
      },
    });
  });

  // Warning handler
  process.on('warning', (warning) => {
    devLogger.warn('Process Warning', {
      operation: 'processWarning',
      metadata: {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      },
    });
  });

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    devLogger.info(`Received ${signal} signal, cleaning up...`);

    // Clear intervals
    if (hangDetectionInterval) {
      clearInterval(hangDetectionInterval);
      hangDetectionInterval = null;
    }

    if (redisMonitorInterval) {
      clearInterval(redisMonitorInterval);
      redisMonitorInterval = null;
    }

    // Log pending operations
    devLogger.logPendingOperations();

    // TODO: Redis disconnection deprecated with Upstash (REST API, no connections)
    // Disconnect Redis clients
    // try {
    //   await redisManager.disconnectAll();
    //   devLogger.info('✓ All Redis connections closed');
    // } catch (error) {
    //   devLogger.error('Error closing Redis connections', { error });
    // }

    devLogger.info('Cleanup complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  devLogger.info('✓ Process event handlers registered');
}

/**
 * Log environment and configuration info
 */
function logEnvironmentInfo() {
  const info = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      REDIS_URL_SET: !!process.env.REDIS_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  };

  devLogger.info('Environment Information', {
    metadata: info,
  });
}

/**
 * Cleanup development tools
 */
export function cleanupDevTools() {
  if (!isDev || !initialized) return;

  devLogger.info('Cleaning up development tools...');

  if (hangDetectionInterval) {
    clearInterval(hangDetectionInterval);
    hangDetectionInterval = null;
  }

  if (redisMonitorInterval) {
    clearInterval(redisMonitorInterval);
    redisMonitorInterval = null;
  }

  initialized = false;
  devLogger.info('✓ Development tools cleaned up');
}

/**
 * Check if dev tools are initialized
 */
export function isDevToolsInitialized(): boolean {
  return initialized;
}
