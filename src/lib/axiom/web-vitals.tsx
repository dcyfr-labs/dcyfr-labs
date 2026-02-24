'use client';

/**
 * Axiom Web Vitals component for client-side Core Web Vitals reporting.
 *
 * Uses ProxyTransport so the Axiom token is never exposed to the browser —
 * all events are forwarded through /api/axiom which holds the server-side
 * credentials.
 *
 * Usage (in layout.tsx):
 *   import { AxiomWebVitals } from '@/lib/axiom/web-vitals';
 *   // ...
 *   <AxiomWebVitals />
 */

import { Logger, ProxyTransport } from '@axiomhq/logging';
import { createWebVitalsComponent } from '@axiomhq/react';

const clientLogger = new Logger({
  transports: [new ProxyTransport({ url: '/api/axiom' })],
});

export const AxiomWebVitals = createWebVitalsComponent(clientLogger);
