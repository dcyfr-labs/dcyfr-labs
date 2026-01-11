// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // TEMPORARY: Enable Sentry in development for testing alerts
  // TODO: Revert to `enabled: !isDev` after alert testing is complete
  enabled: true,

  // Dynamic trace sampling based on route importance
  // Reduces span usage while preserving observability for critical paths
  tracesSampler: (samplingContext) => {
    const name = samplingContext.name || "";
    const op = samplingContext.attributes?.["sentry.op"] || "";

    // Always sample errors and slow transactions
    if (samplingContext.parentSampled !== undefined) {
      return samplingContext.parentSampled;
    }

    // High-value routes: sample at 20%
    if (
      name.includes("/api/contact") ||
      name.includes("/api/csp-report") ||
      (op === "http.server" && name.includes("POST"))
    ) {
      return 0.2;
    }

    // Health/monitoring routes: sample at 1% (mostly noise)
    if (
      name.includes("/api/health") ||
      name.includes("/monitoring") ||
      name.includes("/_next/")
    ) {
      return 0.01;
    }

    // High-traffic pages: sample at 5%
    if (name === "/" || name === "/blog" || name.startsWith("/blog/")) {
      return 0.05;
    }

    // Default: 10% for everything else
    return 0.1;
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
