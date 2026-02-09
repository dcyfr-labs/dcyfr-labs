import type { Metadata } from 'next';
import { assertDevOr404 } from '@/lib/dev-only';
import { createPageMetadata } from '@/lib/metadata';
import { LicensesClient } from './LicensesClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Open Source Licenses',
  description: 'Development-only view of all open-source dependencies and their licenses',
  path: '/dev/licensing',
});

export default function LicensingPage() {
  // Dev-only: returns 404 in preview/production
  assertDevOr404();

  return <LicensesClient />;
}
