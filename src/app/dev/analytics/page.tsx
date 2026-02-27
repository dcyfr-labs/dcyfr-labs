// Server wrapper: allow page only in development. The heavy client UI lives in
// `AnalyticsClient` so we can perform an environment check on the server and
// return a 404 for preview/production environments.

import type { Metadata } from 'next';
import { assertDevOr404 } from '@/lib/utils/dev-only';
import { createPageMetadata } from '@/lib/metadata';
import { getAnalyticsData, getDailyAnalyticsData } from '@/lib/analytics.server';
// Import the client component directly - the client component file contains
// "use client" so it will be rendered on the client. We perform the server
// environment check below and return a 404 in non-dev environments.
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Analytics Dashboard',
  description: 'Development analytics dashboard for blog post metrics and performance',
  path: '/dev/analytics',
});

// Enable ISR (Incremental Static Regeneration) - revalidate every 5 minutes
// This caches the analytics data and reduces load on Redis
export const revalidate = 300;

export default async function Page() {
  // Centralized helper: assert dev or render 404. Keeps behavior consistent
  // across developer-only pages.
  assertDevOr404();

  // Fetch analytics data server-side using ADMIN_API_KEY (secure, never exposed to client)
  // This replaces the client-side useAnalyticsData hook that used NEXT_PUBLIC_ADMIN_API_KEY
  const data = await getAnalyticsData(null); // "all" time range by default
  const daily = await getDailyAnalyticsData(null); // 90 days of daily data

  return <AnalyticsClient initialData={data} initialDailyData={daily} />;
}
