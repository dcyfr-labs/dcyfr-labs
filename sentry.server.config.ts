// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable Sentry in production environments
  enabled: process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production',

  enableLogs: true,
  sendDefaultPii: false,

  tracesSampler(samplingContext) {
    const name = samplingContext.name || '';
    const op = samplingContext.attributes?.['sentry.op'] || '';

    if (samplingContext.parentSampled !== undefined) return samplingContext.parentSampled;

    // High-value routes: contact form, CSP reports, POST requests — 20%
    if (
      name.includes('/api/contact') ||
      name.includes('/api/csp-report') ||
      (op === 'http.server' && name.includes('POST'))
    )
      return 0.2;

    // Health/monitoring routes — 1% (noise)
    if (name.includes('/api/health') || name.includes('/monitoring') || name.includes('/_next/'))
      return 0.01;

    // High-traffic pages — 5%
    if (name === '/' || name === '/blog' || name.startsWith('/blog/')) return 0.05;

    return 0.1; // default
  },

  beforeSendTransaction(transaction) {
    const name = transaction.transaction || '';
    if (
      name.includes('/_next/static') ||
      name.includes('/favicon.ico') ||
      /\.(js|css|png|jpg|svg|woff2?)$/.exec(name)
    )
      return null;
    return transaction;
  },
});
