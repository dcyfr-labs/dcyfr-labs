import type { Metadata } from "next";
import { headers } from "next/headers";
import { SPACING, PAGE_LAYOUT, SCROLL_BEHAVIOR } from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import { getAboutPageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import dynamic from "next/dynamic";
import { PageLayout } from "@/components/layouts/page-layout";
import {
  SectionNavigator,
  Section,
  SmoothScrollToHash,
} from "@/components/common";
import {
  CompanyOverview,
  ServiceOfferings,
  TechnicalCapabilities,
  CaseStudies,
  ClientValueProps,
} from "@/components/company-resume";
import { BackToTop } from "@/components/navigation";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const pageTitle = "Services & Capabilities";
const pageDescription = "Explore DCYFR Labs' cyber architecture and security services, technical capabilities, and client success stories.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/resume",
  keywords: [
    "cyber architecture",
    "security services",
    "web development",
    "AI integration",
    "DevSecOps",
    "Next.js development",
    "security consulting",
  ],
});

export default async function CompanyResumePage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // JSON-LD structured data for organization/services page
  const jsonLd = getAboutPageSchema(pageDescription);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className={`space-y-${SPACING.section}`}
      >
        {/* Company Overview */}
        <Section id="overview" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <CompanyOverview />
          </ScrollReveal>
        </Section>

        {/* Service Offerings */}
        <Section id="services" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={50}>
            <ServiceOfferings />
          </ScrollReveal>
        </Section>

        {/* Technical Capabilities */}
        <Section id="capabilities" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <TechnicalCapabilities />
          </ScrollReveal>
        </Section>

        {/* Case Studies */}
        <Section id="work" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={150}>
            <CaseStudies />
          </ScrollReveal>
        </Section>

        {/* Value Propositions & CTA */}
        <Section id="value" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={200}>
            <ClientValueProps />
          </ScrollReveal>
        </Section>
      </SectionNavigator>

      {/* Back to Top Button */}
      <BackToTop />
    </PageLayout>
  );
}
