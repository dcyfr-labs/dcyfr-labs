import type { Metadata } from 'next';
import { assertDevOr404 } from '@/lib/utils/dev-only';
import { createPageMetadata } from '@/lib/metadata';
import SeoDashboardClient from './seo-dashboard-client';

export const metadata: Metadata = createPageMetadata({
  title: 'SEO & IndexNow',
  description: 'Development dashboard for IndexNow configuration and manual submissions',
  path: '/dev/seo',
});

type SeoDashboardProps = {
  keyConfigured: boolean;
  appUrlConfigured: boolean;
  keyFilePath: string | null;
};

export default function SeoDashboardPage() {
  assertDevOr404();

  const indexNowApiKey = process.env.INDEXNOW_API_KEY;
  const keyConfigured = !!indexNowApiKey;
  const appUrlConfigured = !!process.env.NEXT_PUBLIC_SITE_URL;

  const props: SeoDashboardProps = {
    keyConfigured,
    appUrlConfigured,
    keyFilePath: indexNowApiKey ? `/${indexNowApiKey}.txt` : null,
  };

  return <SeoDashboardClient {...props} />;
}
