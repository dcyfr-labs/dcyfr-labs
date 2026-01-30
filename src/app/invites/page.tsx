import type { Metadata } from 'next';
import { createPageMetadata, getJsonLdScriptProps } from '@/lib/metadata';
import { PageLayout } from '@/components/layouts';
import { PageHero } from '@/components/layouts';
import { Section, SmoothScrollToHash } from '@/components/common';
import { SPACING, PAGE_LAYOUT } from '@/lib/design-tokens';
import { inviteCodes, INVITE_CODE_CATEGORY_LABELS } from '@/data/invites';
import { cn } from '@/lib/utils';
import {
  InvitesStats,
  InvitesCTA,
  InvitesCategorySection,
  InvitesFeatured,
} from '@/components/invites';
import { groupInviteCodesByCategory, sortCategoriesByCount } from '@/lib/invites';
import { headers } from 'next/headers';

// Force dynamic rendering - don't attempt to prerender during build
// This page uses headers() for CSP nonce which requires runtime
export const dynamic = 'force-dynamic';

const pageTitle = 'Invites';
const pageDescription =
  'Join our favorite platforms and communities. Curated list of invite codes, referral links, and professional networks we recommend.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/invites',
});

export default async function InvitesPage() {
  const nonce = (await headers()).get('x-nonce') || '';
  const groupedCodes = groupInviteCodesByCategory(inviteCodes);
  const sortedCategories = sortCategoriesByCount(groupedCodes);
  const featuredCodes = inviteCodes.filter((c) => c.featured);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: pageDescription,
    url: 'https://www.dcyfr.ai/invites',
    isPartOf: {
      '@type': 'WebSite',
      name: 'dcyfr',
      url: 'https://www.dcyfr.ai',
    },
  };

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      <div className={SPACING.section}>
        {/* Hero Section */}
        <PageHero
          title={pageTitle}
          description={pageDescription}
          className={PAGE_LAYOUT.hero.content}
          align="center"
        />

        {/* Stats Summary */}
        <Section id="stats" className={PAGE_LAYOUT.section.container}>
          <InvitesStats
            totalInvites={inviteCodes.length}
            totalCategories={groupedCodes.size}
            featuredCount={inviteCodes.filter((c) => c.featured).length}
          />
        </Section>

        {/* Featured Invites */}
        {featuredCodes.length > 0 && (
          <Section id="featured" className={PAGE_LAYOUT.section.container}>
            <InvitesFeatured codes={featuredCodes} />
          </Section>
        )}

        {/* Invites by Category */}
        {sortedCategories.map(([category, codes]) => {
          // Filter out featured codes from category sections
          const nonFeaturedCodes = codes.filter((c) => !c.featured);

          // Skip category if all codes are featured
          if (nonFeaturedCodes.length === 0) {
            return null;
          }

          return (
            <Section
              key={category}
              id={`category-${category}`}
              className={PAGE_LAYOUT.section.container}
            >
              <InvitesCategorySection
                category={category}
                label={INVITE_CODE_CATEGORY_LABELS[category]}
                codes={nonFeaturedCodes}
              />
            </Section>
          );
        })}

        {/* Call to Action */}
        <Section id="cta" className={PAGE_LAYOUT.section.container}>
          <InvitesCTA />
        </Section>
      </div>
    </PageLayout>
  );
}
