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
import { TYPOGRAPHY, CONTAINER_PADDING, CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { createPageMetadata, getJsonLdScriptProps } from '@/lib/metadata';
import { PageLayout } from '@/components/layouts';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/common';
import { SearchButton } from '@/components/search';
import { posts } from '@/data/posts';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

const pageDescription =
  'Discover insights on cyber architecture, coding, and security at DCYFR Labs. Explore our latest articles, projects, and innovative solutions.';

export const metadata: Metadata = createPageMetadata({
  title: SITE_TITLE_PLAIN,
  description: pageDescription,
  path: '/',
});

export default async function Home() {
  const nonce = (await headers()).get('x-nonce') || '';
  const socialImage = getOgImageUrl();

  const latestPosts = posts
    .filter((p) => !p.draft && !p.archived)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

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
            Open-source AI engineering, built with security in mind.
          </p>

          <div className="mx-auto mt-10 max-w-md">
            <SearchButton variant="input" />
          </div>
        </div>
      </div>
      {latestPosts.length > 0 && (
        <section
          className={cn(
            'border-t border-border/50 py-10 md:py-14',
            'opacity-0 translate-y-2 animate-fade-in-up'
          )}
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          <div className={cn('mx-auto', CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={TYPOGRAPHY.h2.standard}>Latest Articles</h2>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestPosts.map((post) => {
                const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={cn(
                      'group flex flex-col rounded-lg border border-border/50 p-4 transition-colors',
                      'hover:bg-accent hover:border-border',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    )}
                  >
                    <h3
                      className={cn(
                        TYPOGRAPHY.h3.standard,
                        'group-hover:text-primary transition-colors line-clamp-2 mb-2'
                      )}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/30">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {publishedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readingTime.minutes} min
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
