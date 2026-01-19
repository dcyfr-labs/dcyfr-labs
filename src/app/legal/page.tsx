import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { SITE_URL, AUTHOR_NAME } from '@/lib/site-config';
import { createArchivePageMetadata, getJsonLdScriptProps } from '@/lib/metadata';
import { PageLayout, ArchiveHero } from '@/components/layouts';
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { FileText, Shield, Eye, Scale, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering - don't attempt to prerender during build
// This page uses headers() for CSP nonce which requires runtime
export const dynamic = 'force-dynamic';

const pageTitle = 'Legal';
const pageDescription =
  'Browse our legal policies and terms including privacy, security, accessibility, and acceptable use guidelines.';

// Legal pages data
const legalPages = [
  {
    href: '/privacy',
    title: 'Privacy Policy',
    description:
      'How we collect, use, and protect your information. We prioritize privacy with minimal data collection and no tracking.',
    icon: Eye,
    lastUpdated: 'January 16, 2026',
    category: 'Data Protection',
  },
  {
    href: '/terms',
    title: 'Terms of Service',
    description:
      'Terms and conditions for using the DCYFR Labs website. Legal agreements and usage guidelines.',
    icon: FileText,
    lastUpdated: 'January 16, 2026',
    category: 'Legal',
  },
  {
    href: '/security',
    title: 'Security Policy',
    description:
      'Our security measures, vulnerability reporting process, and commitment to protecting your data.',
    icon: Shield,
    lastUpdated: 'January 16, 2026',
    category: 'Security',
  },
  {
    href: '/accessibility',
    title: 'Accessibility Statement',
    description:
      'WCAG 2.1 AA compliance, accessibility features, and our commitment to inclusive design for all users.',
    icon: AlertCircle,
    lastUpdated: 'January 16, 2026',
    category: 'Accessibility',
  },
  {
    href: '/acceptable-use',
    title: 'Acceptable Use Policy',
    description:
      'Guidelines for appropriate use of DCYFR Labs services including permitted uses, rate limits, and enforcement.',
    icon: Scale,
    lastUpdated: 'January 16, 2026',
    category: 'Usage Guidelines',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...createArchivePageMetadata({
      title: pageTitle,
      description: pageDescription,
      path: '/legal',
      itemCount: legalPages.length,
    }),
  };
}

export default async function LegalPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // JSON-LD structured data for legal page collection
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/legal`,
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: legalPages.map((page, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebPage',
          name: page.title,
          description: page.description,
          url: `${SITE_URL}${page.href}`,
        },
      })),
    },
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArchiveHero variant="full" title={pageTitle} description={pageDescription} align="center" />

      <div
        className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} ${SPACING.section}`}
      >
        {/* Introduction */}
        <section className={SPACING.content}>
          <p className={TYPOGRAPHY.description}>
            DCYFR Labs is committed to transparency and legal compliance. Our legal policies outline
            how we handle data, protect security, ensure accessibility, and maintain fair use of our
            services.
          </p>
        </section>

        {/* Legal Pages Grid */}
        <section className={SPACING.content}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {legalPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group block p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h2
                          className={`${TYPOGRAPHY.h3.standard} group-hover:text-primary transition-colors`}
                        >
                          {page.title}
                        </h2>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {page.category}
                        </span>
                      </div>
                      <p className={`${TYPOGRAPHY.body} text-muted-foreground mb-3`}>
                        {page.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {page.lastUpdated}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Contact Section */}
        <section className={SPACING.content}>
          <div className="text-center">
            <h2 className={TYPOGRAPHY.h3.standard}>Questions About Our Legal Policies?</h2>
            <p className={`${TYPOGRAPHY.body} mb-8 text-muted-foreground`}>
              If you have any questions about our legal policies or need clarification, please
              don&apos;t hesitate to reach out.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
