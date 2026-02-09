import { Metadata } from 'next';
import { PageLayout } from '@/components/layouts';
import { LicensesClient } from './LicensesClient';

export const metadata: Metadata = {
  title: 'Open Source Licenses',
  description: 'See all open-source dependencies and their licenses used by DCYFR',
  openGraph: {
    title: 'DCYFR Open Source Licenses',
    description: 'Complete list of open-source dependencies and licenses',
    type: 'website',
  },
};

export default function LicensesPage() {
  return (
    <PageLayout>
      <LicensesClient />
    </PageLayout>
  );
}
