/**
 * Error Handling Utilities
 * 
 * Centralized error handling for API routes with special handling for
 * connection errors (EPIPE, ECONNRESET, ECONNABORTED).
 * 
 * These errors occur when:
 * - Client closes connection before response completes (EPIPE)
 * - Network connection is reset (ECONNRESET)
 * - Request is aborted by client (ECONNABORTED)
 * 
 * These are expected in production and should be handled gracefully
 * without alarming error logs.
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Connection error codes that indicate client disconnection
 */
const CONNECTION_ERROR_CODES = [
  "EPIPE",           // Broken pipe - client closed connection
  "ECONNRESET",      // Connection reset by peer
  "ECONNABORTED",    // Connection aborted
  "ECANCELED",       // Request canceled
] as const;

/**
 * Connection error messages that indicate client disconnection
 */
const CONNECTION_ERROR_MESSAGES = [
  "aborted",
  "socket hang up",
  "connection reset",
  "connection closed",
  "client disconnected",
] as const;

/**
 * Check if an error is a connection error caused by client disconnection
 */
export function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as NodeJS.ErrnoException & { message?: string };

  // Check error code
  if (err.code && CONNECTION_ERROR_CODES.includes(err.code as any)) {
    return true;
  }

  // Check error message
  if (err.message) {
    const lowerMessage = err.message.toLowerCase();
    return CONNECTION_ERROR_MESSAGES.some(msg => lowerMessage.includes(msg));
  }

  return false;
}

/**
 * Handle API route errors with appropriate logging and response
 * 
 * @param error - The error to handle
 * @param context - Additional context for error reporting
 * @returns Error details for response
 */
export function handleApiError(
  error: unknown,
  context?: {
    route?: string;
    method?: string;
    userId?: string;
    additionalData?: Record<string, unknown>;
  }
) {
  const isConnError = isConnectionError(error);

  // For connection errors, log at debug level (not an error)
  if (isConnError) {
    console.warn(
      `Client connection closed ${context?.route ? `(${context.route})` : ""}:`,
      error instanceof Error ? error.message : "Unknown error"
    );

    // Report to Sentry as breadcrumb, not error
    Sentry.addBreadcrumb({
      category: "connection",
      message: `Client disconnected: ${context?.route || "unknown"}`,
      level: "info",
      data: {
        error: error instanceof Error ? error.message : String(error),
        ...(context?.additionalData || {}),
      },
    });

    return {
      isConnectionError: true,
      shouldRetry: false,
      statusCode: 499, // Client Closed Request (non-standard but widely used)
      message: "Client closed connection",
      logLevel: "debug" as const,
    };
  }

  // For other errors, log at error level and report to Sentry
  console.error(
    `API error ${context?.route ? `(${context.route})` : ""}:`,
    error
  );

  // Report to Sentry with full context
  Sentry.captureException(error, {
    tags: {
      route: context?.route,
      method: context?.method,
    },
    user: context?.userId ? { id: context.userId } : undefined,
    extra: context?.additionalData,
  });

  return {
    isConnectionError: false,
    shouldRetry: true,
    statusCode: 500,
    message: "Internal server error",
    logLevel: "error" as const,
  };
}

/**
 * Wrap an async API handler with error handling
 * 
 * @param handler - The async handler function
 * @param context - Context for error reporting
 * @returns Wrapped handler with error handling
 * 
 * @example
 * ```typescript
 * export const POST = withErrorHandling(
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *     return NextResponse.json({ success: true });
 *   },
 *   { route: "/api/views", method: "POST" }
 * );
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  context?: {
    route?: string;
    method?: string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const errorInfo = handleApiError(error, context);

      // For connection errors, don't return a response (connection is already closed)
      // For other errors, return appropriate error response
      if (errorInfo.isConnectionError) {
        // Return a minimal response, but it likely won't be sent
        return new Response(null, { status: errorInfo.statusCode });
      }

      return new Response(
        JSON.stringify({
          error: errorInfo.message,
          code: "INTERNAL_ERROR",
        }),
        {
          status: errorInfo.statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }) as T;
}

/**
 * Check if a response can be sent (connection is still open)
 * 
 * Useful for long-running operations to check periodically
 * if the client is still connected.
 */
export function isResponseWritable(response?: Response): boolean {
  // In Next.js API routes, if we get this far, we can write
  // The error will be thrown when trying to write to closed connection
  return true;
}

/**
 * Error severity levels for monitoring and alerting
 */
export enum ErrorSeverity {
  DEBUG = "debug",       // Connection errors, expected issues
  INFO = "info",         // Rate limits, validation failures
  WARNING = "warning",   // Retry-able errors, timeouts
  ERROR = "error",       // Unexpected errors requiring investigation
  CRITICAL = "critical", // System failures, data corruption
}

/**
 * Determine error severity for monitoring
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isConnectionError(error)) {
    return ErrorSeverity.DEBUG;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Rate limit errors
    if (message.includes("rate limit") || message.includes("too many requests")) {
      return ErrorSeverity.INFO;
    }

    // Validation errors
    if (message.includes("validation") || message.includes("invalid")) {
      return ErrorSeverity.INFO;
    }

    // Timeout errors
    if (message.includes("timeout") || message.includes("timed out")) {
      return ErrorSeverity.WARNING;
    }

    // Database errors
    if (message.includes("database") || message.includes("redis")) {
      return ErrorSeverity.ERROR;
    }
  }

  // Default to error for unknown issues
  return ErrorSeverity.ERROR;
}
