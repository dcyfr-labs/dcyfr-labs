// This file configures the initialization of Sentry for edge features (proxy, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Disable Sentry in development - errors will still be logged to console
  enabled: process.env.NODE_ENV !== 'development',

  enableLogs: true,
  sendDefaultPii: false,

  tracesSampler(samplingContext) {
    const name = samplingContext.name || '';

    if (samplingContext.parentSampled !== undefined) return samplingContext.parentSampled;

    // Security-critical routes (proxy/middleware) — 15%
    if (name.includes('/private') || name.includes('/admin') || name.includes('/api/maintenance'))
      return 0.15;

    // Health/monitoring routes — 1%
    if (name.includes('/api/health') || name.includes('/monitoring')) return 0.01;

    return 0.05; // default for edge functions
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
