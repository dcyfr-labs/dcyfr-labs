// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {
  serverTracesSampler,
  beforeSendTransaction,
  SHARED_SENTRY_CONFIG,
} from './sentry.sampling.config';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable Sentry in production environments
  // Development errors should not be sent to production monitoring
  enabled: process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production',

  // Use shared server-side sampling strategy
  tracesSampler: serverTracesSampler,

  // Use shared transaction filtering
  beforeSendTransaction,

  // Use shared configuration options
  enableLogs: SHARED_SENTRY_CONFIG.enableLogs,
  sendDefaultPii: SHARED_SENTRY_CONFIG.sendDefaultPii,
});
