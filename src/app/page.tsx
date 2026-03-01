import { getSocialUrls } from '@/data/socials';
import {
  SITE_URL,
  SITE_TITLE,
  AUTHOR_NAME,
  getOgImageUrl,
  SITE_TITLE_PLAIN,
  SITE_LAUNCH_DATE,
  SITE_LAST_UPDATED_DATE,
} from '@/lib/site-config';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { TYPOGRAPHY, CONTAINER_PADDING } from '@/lib/design-tokens';
import { createPageMetadata, getJsonLdScriptProps } from '@/lib/metadata';
import { PageLayout } from '@/components/layouts';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/common';
import { SearchButton } from '@/components/search';

const pageDescription =
  'DCYFR Labs builds @dcyfr/ai — an open-source AI agent framework with plugin marketplace, delegation system, and 20+ specialist agents. Explore cyber architecture, security, and AI engineering.';

export const metadata: Metadata = createPageMetadata({
  title: SITE_TITLE_PLAIN,
  description: pageDescription,
  path: '/',
});

export default async function Home() {
  const nonce = (await headers()).get('x-nonce') || '';
  const socialImage = getOgImageUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_TITLE,
        description: pageDescription,
        publisher: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: AUTHOR_NAME,
        url: SITE_URL,
        image: socialImage,
        description: pageDescription,
        jobTitle: 'Founding Architect',
        sameAs: getSocialUrls(),
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_TITLE,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        description: pageDescription,
        inLanguage: 'en-US',
        image: socialImage,
        datePublished: SITE_LAUNCH_DATE,
        dateModified: SITE_LAST_UPDATED_DATE,
      },
    ],
  };

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      <div className="flex min-h-[60vh] items-center justify-center md:min-h-[70vh]">
        <div
          className={cn(
            'w-full max-w-2xl mx-auto text-center',
            CONTAINER_PADDING,
            'opacity-0 translate-y-2 animate-fade-in-up'
          )}
          style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
        >
          <h1 className="sr-only">DCYFR Labs</h1>
          <SiteLogo size="xl" showIcon={false} />

          <p className={cn(TYPOGRAPHY.description, 'text-muted-foreground mt-3')}>
            AI agent framework. Cyber architecture & security.
          </p>

          <div className="mx-auto mt-10 max-w-md">
            <SearchButton variant="input" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
