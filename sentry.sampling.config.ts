/**
 * Shared Sentry Sampling Configuration
 *
 * Unified sampling strategies for both server and edge Sentry configurations.
 * This module exports reusable sampling functions and transaction filtering logic
 * to avoid duplication between sentry.server.config.ts and sentry.edge.config.ts.
 *
 * Sampling strategy:
 * - Critical routes (contact, payments): 20% sampling (high value, lower traffic)
 * - Health checks: 1% sampling (low value, high traffic)
 * - High-traffic pages: 5% sampling (moderate value, very high traffic)
 * - Everything else: 10% default (balanced coverage)
 *
 * Transaction filtering:
 * - Drop static assets entirely (no value for monitoring)
 * - Drop favicon requests (noise)
 * - Drop binary file requests (optimization)
 */

/**
 * Server-side sampling configuration
 *
 * Routes that should be monitored server-side for maximum coverage
 * Includes API endpoints, webhooks, and critical server operations
 */
export function serverTracesSampler(samplingContext: any): number {
  const name = samplingContext.name || '';
  const op = samplingContext.attributes?.['sentry.op'] || '';

  // Always sample if parent was sampled (distributed tracing)
  if (samplingContext.parentSampled !== undefined) {
    return samplingContext.parentSampled;
  }

  // High-value routes: contact form, CSP reports, POST requests
  // Sample at 20% due to lower traffic volume and high business value
  if (
    name.includes('/api/contact') ||
    name.includes('/api/csp-report') ||
    (op === 'http.server' && name.includes('POST'))
  ) {
    return 0.2;
  }

  // Health/monitoring routes: sample at 1% (mostly noise)
  if (name.includes('/api/health') || name.includes('/monitoring') || name.includes('/_next/')) {
    return 0.01;
  }

  // High-traffic pages: sample at 5% (blog, homepage)
  if (name === '/' || name === '/blog' || name.startsWith('/blog/')) {
    return 0.05;
  }

  // Default: 10% for everything else
  return 0.1;
}

/**
 * Edge/Middleware sampling configuration
 *
 * Routes monitored at the edge for security and performance
 * Includes proxy operations, admin routes, middleware
 */
export function edgeTracesSampler(samplingContext: any): number {
  const name = samplingContext.name || '';

  // Always sample if parent was sampled (distributed tracing)
  if (samplingContext.parentSampled !== undefined) {
    return samplingContext.parentSampled;
  }

  // Security-related routes (proxy/middleware): sample at 15%
  // These are lower traffic and security-critical
  if (name.includes('/private') || name.includes('/admin') || name.includes('/api/maintenance')) {
    return 0.15;
  }

  // Health/monitoring routes: sample at 1%
  if (name.includes('/api/health') || name.includes('/monitoring')) {
    return 0.01;
  }

  // Default: 5% for edge functions (lower traffic at edge vs server)
  return 0.05;
}

/**
 * Transaction filtering for both server and edge
 *
 * Filters out low-value transactions before sending to Sentry
 * Reduces costs by not monitoring noisy, unimportant transactions
 */
export function beforeSendTransaction(transaction: any): any {
  const name = transaction.transaction || '';

  // Drop static asset transactions entirely (zero monitoring value)
  if (
    name.includes('/_next/static') ||
    name.includes('/favicon.ico') ||
    name.match(/\.(js|css|png|jpg|svg|woff2?)$/)
  ) {
    return null;
  }

  return transaction;
}

/**
 * Configuration options that are shared across server and edge
 */
export const SHARED_SENTRY_CONFIG = {
  enableLogs: true,
  sendDefaultPii: false,
};
