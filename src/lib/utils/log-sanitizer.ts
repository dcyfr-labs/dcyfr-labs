/**
 * Log Sanitization Utilities
 *
 * Prevents log injection attacks by sanitizing user-controlled input before logging.
 * See: https://owasp.org/www-community/attacks/Log_Injection
 */

/**
 * Sanitizes user input for safe logging
 * Prevents log injection attacks via newlines, ANSI codes, and control characters
 *
 * @param input - User-controlled string to sanitize
 * @returns Sanitized string safe for logging
 *
 * @example
 * ```typescript
 * const userInput = "normal\n[CRITICAL] fake alert";
 * const safe = sanitizeForLog(userInput);
 * console.warn(`User input: ${safe}`); // "normal[CRITICAL] fake alert"
 * ```
 */
export function sanitizeForLog(input: string | null | undefined): string {
  if (!input) return '';

  return (
    input
      // Remove all ANSI escape sequences (must be first to catch all variations)
      .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
      // Remove control chars (newlines, null bytes, C0/C1 controls, Unicode line/paragraph separators)
      .replace(/[\r\n\x00-\x1F\x7F\u0080-\u009F\u2028\u2029]/g, '')
      // Limit length to prevent log spam
      .slice(0, 200)
  );
}

/**
 * Safe structured logging for user-influenced data
 * Automatically sanitizes string values in metadata
 *
 * @param level - Log level (info, warn, error)
 * @param message - Static log message (should not contain user input)
 * @param metadata - Optional structured data (strings will be sanitized)
 *
 * @example
 * ```typescript
 * safeLog('info', 'OAuth parameters received', {
 *   hasCode: true,
 *   state: userProvidedState, // Will be sanitized
 *   error: userProvidedError   // Will be sanitized
 * });
 * ```
 */
export function safeLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>
): void {
  const sanitized: Record<string, unknown> = {};

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeForLog(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value === null || value === undefined) {
        sanitized[key] = value;
      } else {
        sanitized[key] = '[object]';
      }
    }
  }

  const logData = {
    level,
    message,
    ...sanitized,
    timestamp: new Date().toISOString(),
  };

  console.warn(JSON.stringify(logData));
}
