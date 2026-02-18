/**
 * Development-only verbose logging utility
 *
 * Provides detailed logging for debugging async operations, performance bottlenecks,
 * and hanging processes in development environment.
 *
 * Features:
 * - Color-coded log levels
 * - Timing information
 * - Stack traces for errors
 * - Operation tracking with duration
 * - Memory usage monitoring
 * - Completely disabled in production
 */

const isDev = process.env.NODE_ENV === 'development';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  TIMING = 'TIMING',
  REDIS = 'REDIS',
  API = 'API',
  ASYNC = 'ASYNC',
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const levelColors: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: colors.gray,
  [LogLevel.INFO]: colors.blue,
  [LogLevel.WARN]: colors.yellow,
  [LogLevel.ERROR]: colors.red,
  [LogLevel.TIMING]: colors.green,
  [LogLevel.REDIS]: colors.magenta,
  [LogLevel.API]: colors.cyan,
  [LogLevel.ASYNC]: colors.yellow,
};

interface LogContext {
  operation?: string;
  duration?: number;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}

class DevLogger {
  private startTimes: Map<string, number> = new Map();
  private operationCounts: Map<string, number> = new Map();

  /** Build the log output string from parts (no side effects) */
  private buildLogOutput(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const color = levelColors[level];
    const memUsage = this.getMemoryUsage();

    let output = `${colors.gray}[${timestamp}]${colors.reset} ${color}${colors.bright}[${level}]${colors.reset} ${message}`;

    if (context?.operation) {
      output += ` ${colors.dim}(${context.operation})${colors.reset}`;
    }

    if (context?.duration !== undefined) {
      const durationColor = context.duration > 1000 ? colors.red : context.duration > 500 ? colors.yellow : colors.green;
      output += ` ${durationColor}[${context.duration}ms]${colors.reset}`;
    }

    if (context?.metadata) {
      output += `\n${colors.gray}  Metadata: ${JSON.stringify(context.metadata, null, 2)}${colors.reset}`;
    }

    if (level === LogLevel.TIMING) {
      output += ` ${colors.gray}[${memUsage}]${colors.reset}`;
    }

    return output;
  }

  /** Emit error details to console (no side effects on state) */
  private emitErrorDetails(error: unknown): void {
    if (error instanceof Error) {
      console.warn(`${colors.red}  Error: ${error.message}${colors.reset}`);
      if (error.stack) {
        console.warn(`${colors.dim}  ${error.stack.split('\n').slice(1).join('\n  ')}${colors.reset}`);
      }
    } else {
      console.warn(`${colors.red}  Error: ${JSON.stringify(error)}${colors.reset}`);
    }
  }

  /**
   * Log a message with specified level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    if (!isDev) return;

    console.warn(this.buildLogOutput(level, message, context));

    if (context?.error) {
      this.emitErrorDetails(context.error);
    }
  }

  /**
   * Start timing an operation
   */
  startTiming(operationId: string, description?: string): void {
    if (!isDev) return;

    this.startTimes.set(operationId, Date.now());
    const count = (this.operationCounts.get(operationId) || 0) + 1;
    this.operationCounts.set(operationId, count);

    this.log(LogLevel.TIMING, `Started: ${description || operationId}`, {
      operation: operationId,
      metadata: { count },
    });
  }

  /**
   * End timing an operation and log the duration
   */
  endTiming(operationId: string, description?: string, metadata?: Record<string, unknown>): number {
    if (!isDev) return 0;

    const startTime = this.startTimes.get(operationId);
    if (!startTime) {
      this.log(LogLevel.WARN, `No start time found for operation: ${operationId}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operationId);

    this.log(LogLevel.TIMING, `Completed: ${description || operationId}`, {
      operation: operationId,
      duration,
      metadata,
    });

    return duration;
  }

  /**
   * Track an async operation with automatic timing
   */
  async trackAsync<T>(
    operationId: string,
    operation: () => Promise<T>,
    description?: string
  ): Promise<T> {
    if (!isDev) {
      return operation();
    }

    this.startTiming(operationId, description);

    try {
      const result = await operation();
      this.endTiming(operationId, description, { success: true });
      return result;
    } catch (error) {
      this.endTiming(operationId, description, { success: false });
      this.log(LogLevel.ERROR, `Failed: ${description || operationId}`, {
        operation: operationId,
        error,
      });
      throw error;
    }
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level log
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level log
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level log
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Redis-specific log
   */
  redis(message: string, context?: LogContext): void {
    this.log(LogLevel.REDIS, message, context);
  }

  /**
   * API-specific log
   */
  api(message: string, context?: LogContext): void {
    this.log(LogLevel.API, message, context);
  }

  /**
   * Async operation log
   */
  async(message: string, context?: LogContext): void {
    this.log(LogLevel.ASYNC, message, context);
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): string {
    if (typeof process === 'undefined') return 'N/A';

    const usage = process.memoryUsage();
    const heapUsed = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(usage.heapTotal / 1024 / 1024);
    return `${heapUsed}MB/${heapTotal}MB`;
  }

  /**
   * Log all pending operations (useful for detecting hangs)
   */
  logPendingOperations(): void {
    if (!isDev) return;

    if (this.startTimes.size === 0) {
      this.info('No pending operations');
      return;
    }

    this.warn(`Found ${this.startTimes.size} pending operations:`);
    const now = Date.now();

    this.startTimes.forEach((startTime, operationId) => {
      const elapsed = now - startTime;
      const color = elapsed > 5000 ? colors.red : elapsed > 2000 ? colors.yellow : colors.white;
      console.warn(`  ${color}${operationId}: ${elapsed}ms elapsed${colors.reset}`);
    });
  }

  /**
   * Get operation statistics
   */
  getStats(): Record<string, number> {
    if (!isDev) return {};

    const stats: Record<string, number> = {};
    this.operationCounts.forEach((count, operation) => {
      stats[operation] = count;
    });
    return stats;
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.startTimes.clear();
    this.operationCounts.clear();
  }
}

// Export singleton instance
export const devLogger = new DevLogger();

// Utility function to detect hanging operations
export function setupHangDetection(intervalMs: number = 10000): NodeJS.Timeout | null {
  if (!isDev) return null;

  const interval = setInterval(() => {
    devLogger.logPendingOperations();
  }, intervalMs);

  return interval;
}
