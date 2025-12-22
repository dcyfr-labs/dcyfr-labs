import type { Metadata } from "next";
import { headers } from "next/headers";
import { resume, getSummary } from "@/data/resume";
import { TYPOGRAPHY, PAGE_LAYOUT, SPACING, SHADOWS, BORDERS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/metadata";
import { getResumePageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import dynamic from "next/dynamic";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { ResumeStats } from "@/components/resume";
import { UnifiedTimeline, SmoothScrollToHash } from "@/components/common";
import { BackToTop } from "@/components/navigation";
import { MiniBadgeList, MiniSkillsList } from "@/components/about";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const pageTitle = "Drew's Professional Resume";
const pageDescription = "Explore Drew's professional experience, skills, and certifications as a cyber architect and security engineer.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/about/drew/resume",
  keywords: ["security architect", "cyber security", "professional resume", "Drew Holt"],
});

// Company website URLs for linking
const companyUrls: Record<string, string> = {
  "Monks": "https://monks.com/",
  "Creative Breakthroughs, Inc.": "https://convergetp.com/our-story/cbi/",
  "Escambia County Commissioners Office": "https://myescambia.com/",
};

export default async function DrewResumePage() {
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
      <SmoothScrollToHash />
      <div className={SPACING.section}>
      <section id="hero">
        <PageHero
          title="Drew's Resume"
          description={getSummary()}
        />
      </section>

      {/* Stats Overview */}
      <section id="stats" className={PAGE_LAYOUT.section.container}>
        <ScrollReveal animation="fade-up" delay={50}>
          <div className={cn(
            SPACING.content,
            "p-4",
            SHADOWS.tier2.combined,
            "bg-card"
          )}>
            <ResumeStats />
          </div>
        </ScrollReveal>
      </section>

      {/* Professional Timeline (Experience + Education) */}
      <section id="timeline" className={PAGE_LAYOUT.section.container} aria-labelledby="timeline-heading">
        <ScrollReveal animation="fade-up" delay={150}>
          <div className={cn(
            SPACING.content,
            "p-4",
            SHADOWS.tier2.combined,
            "bg-card"
          )}>
            <h2 id="timeline-heading" className={TYPOGRAPHY.h2.standard}>Professional Timeline</h2>
            <UnifiedTimeline 
              experiences={resume.experience} 
              education={resume.education}
              companyUrls={companyUrls} 
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Certifications */}
      <section id="certifications" className={PAGE_LAYOUT.section.container} aria-labelledby="certifications-heading">
        <ScrollReveal animation="fade-up" delay={200}>
          <div className={cn(
            SPACING.content,
            "p-4",
            SHADOWS.tier2.combined,
            "bg-card"
          )}>
            <MiniBadgeList username="dcyfr" />
          </div>
        </ScrollReveal>
      </section>

      {/* Skills */}
      <section id="skills" className={PAGE_LAYOUT.section.container} aria-labelledby="skills-heading">
        <ScrollReveal animation="fade-up" delay={250}>
          <div className={cn(
            SPACING.content,
            "p-4",
            SHADOWS.tier2.combined,
            "bg-card"
          )}>
            <MiniSkillsList username="dcyfr" />
          </div>
        </ScrollReveal>
      </section>
      </div>

      {/* Back to Top Button */}
      <BackToTop />
    </PageLayout>
  );
}
