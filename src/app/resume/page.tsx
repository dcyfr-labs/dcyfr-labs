import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resume, getSummary } from "@/data/resume";
import { highlightMetrics } from "@/lib/highlight-metrics";
import { TYPOGRAPHY, PAGE_LAYOUT, SPACING, HOVER_EFFECTS } from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import { getResumePageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import dynamic from "next/dynamic";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import {
  DownloadResumeButton,
  ResumeStats,
  ResumeSectionNav,
  SkillsAndCertifications,
} from "@/components/resume";
import { UnifiedTimeline } from "@/components/common";
import { BackToTop } from "@/components/navigation";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const pageTitle = "Resume";
const pageDescription = "Professional resume for Drew - cybersecurity architect with expertise in risk management, incident response, cloud security, and compliance (ISO 27001, SOC2).";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/resume",
});

// Company website URLs for linking
const companyUrls: Record<string, string> = {
  "Monks": "https://monks.com/",
  "Creative Breakthroughs, Inc.": "https://convergetp.com/our-story/cbi/",
  "Escambia County Commissioners Office": "https://myescambia.com/",
};

export default async function ResumePage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // JSON-LD structured data for resume page
  const jsonLd = getResumePageSchema(
    pageDescription,
    resume.experience.slice(0, 3) // Include top 3 roles for schema
  );

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <div className="space-y-10 md:space-y-14">
      <PageHero
        title="Drew's Resume"
        description={getSummary()}
      />
      
      {/* Download Button 
      <ScrollReveal animation="fade-up" delay={0}>
        <div className="flex justify-center -mt-4 mb-8">
          <DownloadResumeButton />
        </div>
      </ScrollReveal> */}

      {/* Stats Overview */}
      <section className={PAGE_LAYOUT.section.container}>
        <ScrollReveal animation="fade-up" delay={50}>
          <div className={SPACING.content}>
            <ResumeStats />
          </div>
        </ScrollReveal>
      </section>

      {/* Section Navigation 
      <section className={PAGE_LAYOUT.section.container}>
        <ScrollReveal animation="fade-up" delay={100}>
          <div className={SPACING.content}>
            <ResumeSectionNav />
          </div>
        </ScrollReveal>
      </section> */}

      {/* Professional Timeline (Experience + Education) */}
      <section id="timeline" className={PAGE_LAYOUT.section.container} aria-labelledby="timeline-heading">
        <ScrollReveal animation="fade-up" delay={150}>
          <div className={SPACING.content}>
            <h2 id="timeline-heading" className={TYPOGRAPHY.h2.standard}>Professional Timeline</h2>
            <UnifiedTimeline 
              experiences={resume.experience} 
              education={resume.education}
              companyUrls={companyUrls} 
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Skills & Certifications */}
      <section id="skills" className={PAGE_LAYOUT.section.container} aria-labelledby="skills-heading">
        <ScrollReveal animation="fade-up" delay={200}>
          <div className={SPACING.content}>
            <SkillsAndCertifications 
              skills={resume.skills} 
              certifications={resume.certifications}
            />
          </div>
        </ScrollReveal>
      </section>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </PageLayout>
  );
}
