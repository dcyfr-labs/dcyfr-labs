import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import {
  getOgImageUrl,
  SITE_URL,
  SITE_LAUNCH_DATE,
  SITE_LAST_UPDATED_DATE,
} from '@/lib/site-config';
import { getAboutPageSchema, getJsonLdScriptProps } from '@/lib/json-ld';
import { createBreadcrumbSchema } from '@/lib/metadata';
import { headers } from 'next/headers';
import { SPACING, PAGE_LAYOUT, SCROLL_BEHAVIOR } from '@/lib/design-tokens';
import { createPageMetadata } from '@/lib/metadata';
import { PageLayout, PageHero } from '@/components/layouts';
import { SectionNavigator, Section, SmoothScrollToHash } from '@/components/common';
import {
  TeamSpotlights,
  ConnectWithUs,
  AboutDcyfrLabs,
  ServerBadgeWallet,
  ServerSkillsWallet,
  AgentProfilesSection,
} from '@/components/about';

const ScrollReveal = dynamic(
  () =>
    import('@/components/features/scroll-reveal').then((mod) => ({
      default: mod.ScrollReveal,
    })),
  {
    loading: () => <div className="contents" />,
    ssr: true,
  }
);

const pageTitle = 'About DCYFR Labs';
const pageDescription =
  'DCYFR Labs builds @dcyfr/ai — an open-source AI agent framework with plugin marketplace, delegation system, and 20+ specialist agents. Learn about our mission at the intersection of cybersecurity and modern AI engineering.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/about',
});

export default async function AboutPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // JSON-LD structured data for about page
  const socialImage = getOgImageUrl(pageTitle, pageDescription);
  const jsonLd = getAboutPageSchema(pageDescription, socialImage, {
    datePublished: SITE_LAUNCH_DATE,
    dateModified: SITE_LAST_UPDATED_DATE,
  });
  const breadcrumbJsonLd = createBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'About DCYFR Labs', url: `${SITE_URL}/about` },
  ]);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <script {...getJsonLdScriptProps(breadcrumbJsonLd, nonce)} />
      <SmoothScrollToHash />

      {/* Hero Section - Organization Introduction */}
      <ScrollReveal animation="fade-up" delay={0}>
        <PageHero
          title={pageTitle}
          description={pageDescription}
          variant="standard"
          align="center"
        />
      </ScrollReveal>

      <SectionNavigator scrollOffset={SCROLL_BEHAVIOR.offset.standard} className={SPACING.section}>
        {/* Organization Philosophy */}
        <Section id="our-philosophy" className={PAGE_LAYOUT.proseSection.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <AboutDcyfrLabs />
          </ScrollReveal>
        </Section>

        {/* Meet the Team */}
        <Section id="meet-the-team" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <TeamSpotlights />
          </ScrollReveal>
        </Section>

        {/* Team Certifications */}
        <Section id="certifications" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <ServerBadgeWallet
              username="dcyfr"
              showLatestOnly
              limit={3}
              viewMoreUrl="/about/drew/resume#certifications"
              viewMoreText="View all certifications"
            />
          </ScrollReveal>
        </Section>

        {/* Team Skills */}
        <Section id="skills" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <ServerSkillsWallet
              username="dcyfr"
              limit={9}
              excludeSkills={['CompTIA']}
              viewMoreUrl="/about/drew/resume#skills"
              viewMoreText="View all skills"
            />
          </ScrollReveal>
        </Section>

        {/* AI Agent Team */}
        <Section id="ai-agents" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <AgentProfilesSection />
          </ScrollReveal>
        </Section>

        {/* Connect with Us */}
        <Section id="connect-with-us" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <ConnectWithUs />
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
