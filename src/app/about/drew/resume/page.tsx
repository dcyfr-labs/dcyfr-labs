import type { Metadata } from "next";
import { headers } from "next/headers";
import { resume, getSummary } from "@/data/resume";
import {
  TYPOGRAPHY,
  PAGE_LAYOUT,
  SPACING,
  CONTAINER_WIDTHS,
  BORDERS,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/metadata";
import { getResumePageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import dynamic from "next/dynamic";
import { PageLayout, PageHero } from "@/components/layouts";
import { ResumeStats, ResumeSectionNav, DownloadResumeButton } from "@/components/resume";
import { UnifiedTimeline, SmoothScrollToHash } from "@/components/common";
import { BackToTop } from "@/components/navigation";
import { MiniBadgeList, MiniSkillsList } from "@/components/about";

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

const pageTitle = "Drew's Professional Resume";
const pageDescription =
  "Explore Drew's professional experience, badges, and skills in computer science and cybersecurity.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/about/drew/resume",
  keywords: [
    "security architect",
    "cyber security",
    "professional resume",
    "Drew Holt",
  ],
});

// Company website URLs for linking
const companyUrls: Record<string, string> = {
  Monks: "https://monks.com/",
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

      {/* Hero Section */}
      <section id="hero" className={PAGE_LAYOUT.hero.container}>
        <PageHero
          title={pageTitle}
          description={getSummary()}
          align="center"
        />
      </section>

      {/* Resume Navigation & Download - DISABLED */}
      {/* <section id="nav" className={cn(PAGE_LAYOUT.section.container, "py-4")}>
        <div className={cn("mx-auto", CONTAINER_WIDTHS.standard)}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <ResumeSectionNav />
            <DownloadResumeButton />
          </div>
        </div>
      </section> */}

      <div className={SPACING.section}>
        {/* Stats Overview */}
        <section
          id="stats"
          className={PAGE_LAYOUT.section.container}
          aria-labelledby="stats-heading"
        >
          <ScrollReveal animation="fade-up" delay={1}>
            <div className={cn("mx-auto", CONTAINER_WIDTHS.standard)}>
              <h2
                id="stats-heading"
                className={cn(TYPOGRAPHY.h2.standard, "mb-6")}
              >
                Career Metrics
              </h2>
              <ResumeStats />
            </div>
          </ScrollReveal>
        </section>

        {/* Professional Timeline (Experience + Education) */}
        <section
          id="timeline"
          className={PAGE_LAYOUT.section.container}
          aria-labelledby="timeline-heading"
        >
          <ScrollReveal animation="fade-up" delay={2}>
            <div className={cn("mx-auto", CONTAINER_WIDTHS.standard)}>
              <h2
                id="timeline-heading"
                className={cn(TYPOGRAPHY.h2.standard, "mb-6")}
              >
                Professional Timeline
              </h2>
              <UnifiedTimeline
                experiences={resume.experience}
                education={resume.education}
                companyUrls={companyUrls}
              />
            </div>
          </ScrollReveal>
        </section>

        {/* Badges */}
        <section
          id="badges"
          className={PAGE_LAYOUT.section.container}
          aria-labelledby="badges-heading"
        >
          <ScrollReveal animation="fade-up" delay={3}>
            <div className={cn("mx-auto", CONTAINER_WIDTHS.standard)}>
              <h2
                id="badges-heading"
                className={cn(TYPOGRAPHY.h2.standard, "mb-6")}
              >
                Professional Badges & Certifications
              </h2>
              <MiniBadgeList username="dcyfr" />
            </div>
          </ScrollReveal>
        </section>

        {/* Skills */}
        <section
          id="skills"
          className={PAGE_LAYOUT.section.container}
          aria-labelledby="skills-heading"
        >
          <ScrollReveal animation="fade-up" delay={4}>
            <div className={cn("mx-auto", CONTAINER_WIDTHS.standard)}>
              <h2
                id="skills-heading"
                className={cn(TYPOGRAPHY.h2.standard, "mb-6")}
              >
                Technical Skills & Expertise
              </h2>
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
