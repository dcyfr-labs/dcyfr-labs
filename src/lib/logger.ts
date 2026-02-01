/**
 * Production-safe logging utility
 *
 * Provides environment-aware logging with structured output.
 * Prevents sensitive data leakage in production environments.
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * // Debug (development only)
 * logger.debug('Processing request', { userId: '123' });
 *
 * // Info (development only)
 * logger.info('operation_complete', { duration: 150, count: 5 });
 *
 * // Warning (all environments)
 * logger.warn('Rate limit approaching', { remaining: 10 });
 *
 * // Error (all environments)
 * logger.error('API request failed', error, { endpoint: '/api/data' });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

const isDevelopment = !isProduction;

/**
 * Format context object for logging
 */
function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }

  try {
    return JSON.stringify(context);
  } catch {
    return String(context);
  }
}

/**
 * Sanitize error messages for production
 * Removes potentially sensitive information
 */
function sanitizeError(error: Error): string {
  if (isDevelopment) {
    return error.message;
  }

  // In production, strip file paths and stack traces
  return error.message
    .replace(/\/[^\s]*/g, '<path>') // Remove file paths
    .replace(/at [^\n]*/g, '') // Remove stack trace lines
    .trim()
    .substring(0, 200); // Limit length
}

export const logger = {
  /**
   * Debug logging - development only
   * Use for verbose debugging information
   *
   * @param message - Debug message
   * @param context - Additional context (optional)
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      const ctx = formatContext(context);
      console.log(`[DEBUG] ${message}`, ctx || '');
    }
  },

  /**
   * Info logging - development only
   * Use for general informational messages
   *
   * @param event - Event name (e.g., 'user_login', 'data_fetched')
   * @param context - Event context (optional)
   */
  info(event: string, context?: LogContext): void {
    if (isDevelopment) {
      const ctx = formatContext(context);
      console.log(`[INFO] ${event}`, ctx || '');
    }
  },

  /**
   * Warning logging - all environments
   * Use for recoverable issues that need attention
   *
   * @param message - Warning message
   * @param context - Additional context (optional)
   */
  warn(message: string, context?: LogContext): void {
    const ctx = formatContext(context);
    console.warn(`[WARN] ${message}`, ctx || '');
  },

  /**
   * Error logging - all environments
   * Use for errors and exceptions
   *
   * @param message - Error description
   * @param error - Error object (optional)
   * @param context - Additional context (optional)
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorMsg = error ? sanitizeError(error) : '';
    const ctx = formatContext(context);

    console.error(`[ERROR] ${message}`, errorMsg || '', ctx || '');

    // In development, also log stack trace
    if (isDevelopment && error?.stack) {
      console.error(error.stack);
    }
  },

  /**
   * Conditional logging based on environment
   *
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context (optional)
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case 'debug':
        this.debug(message, context);
        break;
      case 'info':
        this.info(message, context);
        break;
      case 'warn':
        this.warn(message, context);
        break;
      case 'error':
        this.error(message, undefined, context);
        break;
    }
  },
};

/**
 * Structured logger for API routes
 * Provides consistent logging format for API endpoints
 */
export const apiLogger = {
  /**
   * Log API request start
   */
  request(method: string, path: string, context?: LogContext): void {
    logger.debug(`API ${method} ${path}`, context);
  },

  /**
   * Log API request success
   */
  success(method: string, path: string, duration?: number): void {
    logger.debug(`API ${method} ${path} completed`, { duration });
  },

  /**
   * Log API request error
   */
  error(method: string, path: string, error: Error, context?: LogContext): void {
    logger.error(`API ${method} ${path} failed`, error, context);
  },
};

/**
 * Structured logger for data operations
 * Provides consistent logging for data fetching and mutations
 */
export const dataLogger = {
  /**
   * Log data fetch operation
   */
  fetch(source: string, context?: LogContext): void {
    logger.debug(`Fetching data from ${source}`, context);
  },

  /**
   * Log data fetch success
   */
  fetchSuccess(source: string, count?: number, cached?: boolean): void {
    logger.debug(`Data fetched from ${source}`, { count, cached });
  },

  /**
   * Log data fetch error
   */
  fetchError(source: string, error: Error): void {
    logger.error(`Data fetch failed: ${source}`, error);
  },

  /**
   * Log cache hit/miss
   */
  cache(key: string, hit: boolean): void {
    logger.debug(`Cache ${hit ? 'HIT' : 'MISS'}`, { key });
  },
};

/**
 * Check if logging is enabled for a specific level
 */
export function isLogLevelEnabled(level: LogLevel): boolean {
  switch (level) {
    case 'debug':
    case 'info':
      return isDevelopment;
    case 'warn':
    case 'error':
      return true;
    default:
      return false;
  }
}
