// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { initBotId } from "botid/client/core";

const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Disable Sentry in development - log errors locally instead
  enabled: !isDev,

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  // Conservative rate (0.5) to stay within quota (~25 replays/month)
  replaysOnErrorSampleRate: 0.5,

  // Filter out common browser extension and third-party noise
  ignoreErrors: [
    // Browser extensions and plugins
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error exception captured",
    "Non-Error promise rejection captured",
    // Network errors that are expected
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // Browser-specific quirks
    "Cannot read properties of undefined",
    "Cannot read property 'style' of null",
    // Third-party script errors
    /^Script error\.?$/,
    /^Javascript error: Script error\.? on line 0$/,
  ],

  // Ignore errors from third-party scripts and browser extensions
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i,
    /^safari-web-extension:\/\//i,
    // Common third-party scripts that may error
    /^https?:\/\/[^/]*\.googletagmanager\.com\//i,
    /^https?:\/\/[^/]*\.google-analytics\.com\//i,
    /^https?:\/\/[^/]*\.doubleclick\.net\//i,
    /^https?:\/\/[^/]*\.hotjar\.com\//i,
    /^https?:\/\/[^/]*\.intercom\.io\//i,
  ],

  // Disable sending user PII (Personally Identifiable Information) for privacy compliance
  // The app handles its own PII masking (IP anonymization, email domain-only logging)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

// Initialize BotID for bot detection and protection
// Protects API routes that are configured in the protect array
// See: https://vercel.com/docs/botid/get-started
//
// IMPORTANT: BotID client-side protection is temporarily disabled for /api/contact
// until proper production configuration is verified. The API route handles
// bot protection via rate limiting, honeypot field, and input validation.
//
// To re-enable BotID protection:
// 1. Verify BotID is properly configured in Vercel dashboard
// 2. Set ENABLE_BOTID=1 environment variable in production
// 3. Uncomment the contact route below
// 4. Test thoroughly in preview environment first
initBotId({
  protect: [
    // Temporarily disabled - causing 403 errors without proper setup
    // {
    //   path: "/api/contact",
    //   method: "POST",
    // },
    // Add more protected routes as needed
    // Example:
    // {
    //   path: "/api/user/*",
    //   method: "POST",
    // },
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
