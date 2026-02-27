// Server wrapper: allow page only in development. The heavy client UI lives in
// `ApiCostsClient` so we can perform an environment check on the server and
// return a 404 for preview/production environments.

import type { Metadata } from 'next';
import { assertDevOr404 } from '@/lib/utils/dev-only';
import { createPageMetadata } from '@/lib/metadata';
// Import the client component directly - the client component file contains
// "use client" so it will be rendered on the client. We perform the server
// environment check below and return a 404 in non-dev environments.
import ApiCostsClient from './ApiCostsClient';

export const metadata: Metadata = createPageMetadata({
  title: 'API Cost Dashboard',
  description: 'Monitor API usage, costs, and budget across all services',
  path: '/dev/api-costs',
});

// Vercel optimization: assertDevOr404() calls notFound() in Preview/Production,
// which allows this page to be statically rendered. No dynamic function needed.

export default function Page() {
  // Centralized helper: assert dev or render 404. Keeps behavior consistent
  // across developer-only pages.
  assertDevOr404();

  return <ApiCostsClient />;
}
