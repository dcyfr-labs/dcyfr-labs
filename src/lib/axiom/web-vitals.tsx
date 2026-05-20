'use client';

/**
 * Axiom Web Vitals component for client-side Core Web Vitals reporting.
 *
 * Forwards all events through /api/axiom (which holds the server-side
 * credentials) so the Axiom token is never exposed to the browser.
 *
 * Usage (in layout.tsx):
 *   import { AxiomWebVitals } from '@/lib/axiom/web-vitals';
 *   // ...
 *   <AxiomWebVitals />
 */

import { Logger, SimpleFetchTransport } from '@axiomhq/logging';
import { createWebVitalsComponent } from '@axiomhq/react';

// SimpleFetchTransport is what ProxyTransport wraps — using it directly lets
// us pass `init: { keepalive: true }` (part of the typed FetchConfig).
// Web Vitals flush on `visibilitychange`/`pagehide`; a plain fetch issued
// during page teardown is aborted by the browser and surfaces as an
// uncaught `TypeError: Failed to fetch` in the console on every navigation.
// `keepalive` lets the request outlive the document so the final batch
// actually reaches /api/axiom.
const clientLogger = new Logger({
  transports: [
    new SimpleFetchTransport({
      input: '/api/axiom',
      init: { keepalive: true },
    }),
  ],
});

export const AxiomWebVitals = createWebVitalsComponent(clientLogger);
