// This file configures the initialization of Sentry for edge features (proxy, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Disable Sentry in development - errors will still be logged to console
  enabled: !isDev,

  // Dynamic trace sampling based on route importance
  // Reduces span usage while preserving observability for critical paths
  tracesSampler: (samplingContext) => {
    const name = samplingContext.name || "";

    // Always sample errors and slow transactions
    if (samplingContext.parentSampled !== undefined) {
      return samplingContext.parentSampled;
    }

    // Security-related routes (proxy/middleware): sample at 15%
    if (
      name.includes("/private") ||
      name.includes("/admin") ||
      name.includes("/api/maintenance")
    ) {
      return 0.15;
    }

    // Health/monitoring routes: sample at 1%
    if (
      name.includes("/api/health") ||
      name.includes("/monitoring")
    ) {
      return 0.01;
    }

    // Default: 5% for edge functions
    return 0.05;
  },

  // Filter out low-value transactions before sending
  beforeSendTransaction: (transaction) => {
    const name = transaction.transaction || "";

    // Drop static asset transactions entirely
    if (
      name.includes("/_next/static") ||
      name.includes("/favicon.ico") ||
      name.match(/\.(js|css|png|jpg|svg|woff2?)$/)
    ) {
      return null;
    }

    return transaction;
  },

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Disable sending user PII (Personally Identifiable Information) for privacy compliance
  // The app handles its own PII masking (IP anonymization, email domain-only logging)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
