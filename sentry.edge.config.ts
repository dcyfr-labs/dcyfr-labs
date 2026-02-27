// This file configures the initialization of Sentry for edge features (proxy, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  edgeTracesSampler,
  beforeSendTransaction,
  SHARED_SENTRY_CONFIG,
} from './sentry.sampling.config';

const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Disable Sentry in development - errors will still be logged to console
  enabled: !isDev,

  // Use shared edge-side sampling strategy
  tracesSampler: edgeTracesSampler,

  // Use shared transaction filtering
  beforeSendTransaction,

  // Use shared configuration options
  enableLogs: SHARED_SENTRY_CONFIG.enableLogs,
  sendDefaultPii: SHARED_SENTRY_CONFIG.sendDefaultPii,
});
