import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getOgImageUrl } from "@/lib/site-config";
import { getAboutPageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import { headers } from "next/headers";
import { SPACING, PAGE_LAYOUT, SCROLL_BEHAVIOR } from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import { PageLayout, PageHero } from "@/components/layouts";
import {
  SectionNavigator,
  Section,
  SmoothScrollToHash,
} from "@/components/common";
import {
  TeamSpotlights,
  ConnectWithUs,
  AboutDcyfrLabs,
  BadgeWallet,
  SkillsWallet,
} from "@/components/about";

const ScrollReveal = dynamic(
  () =>
    import("@/components/features/scroll-reveal").then((mod) => ({
      default: mod.ScrollReveal,
    })),
  {
    loading: () => <div className="contents" />,
    ssr: true,
  }
);

const pageTitle = "About DCYFR Labs";
const pageDescription =
  "Learn about DCYFR Labs, our team, and our mission to build secure, innovative solutions for the modern web.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/about",
});

export default async function AboutPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // JSON-LD structured data for about page
  const socialImage = getOgImageUrl(pageTitle, pageDescription);
  const jsonLd = getAboutPageSchema(pageDescription, socialImage);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className={SPACING.section}
      >
        {/* Hero Section - Organization Introduction */}
        <Section id="about-hero">
          <ScrollReveal animation="fade-up" delay={0}>
            <PageHero
              title={pageTitle}
              description={pageDescription}
              variant="homepage"
              align="center"
            />
          </ScrollReveal>
        </Section>

        {/* Organization Philosophy */}
        <Section
          id="our-philosophy"
          className={PAGE_LAYOUT.proseSection.container}
        >
          <ScrollReveal animation="fade-up" delay={1}>
            <AboutDcyfrLabs />
          </ScrollReveal>
        </Section>

        {/* Meet the Team */}
        <Section id="meet-the-team" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={2}>
            <TeamSpotlights />
          </ScrollReveal>
        </Section>

        {/* Team Certifications */}
        <Section id="certifications" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={3}>
            <BadgeWallet
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
          <ScrollReveal animation="fade-up" delay={4}>
            <SkillsWallet
              username="dcyfr"
              limit={9}
              excludeSkills={["CompTIA"]}
              viewMoreUrl="/about/drew/resume#skills"
              viewMoreText="View all skills"
            />
          </ScrollReveal>
        </Section>

        {/* Connect with Us */}
        <Section id="connect-with-us" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={5}>
            <ConnectWithUs />
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
