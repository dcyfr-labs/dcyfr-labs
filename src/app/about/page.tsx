import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { resume, getShortSummary } from "@/data/resume";
import { getOgImageUrl } from "@/lib/site-config";
import { getAboutPageSchema, getJsonLdScriptProps } from "@/lib/json-ld";
import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { posts } from "@/data/posts";
import { visibleProjects } from "@/data/projects";
import { getYearsOfExperience } from "@/data/resume";
import {
  TYPOGRAPHY,
  SPACING,
  HOVER_EFFECTS,
  PAGE_LAYOUT,
  SCROLL_BEHAVIOR,
} from "@/lib/design-tokens";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import {
  Logo,
  SectionNavigator,
  Section,
  GitHubHeatmapErrorBoundary,
  ProfileAvatar,
} from "@/components/common";
import { AboutStats, TeamSpotlights, ConnectWithUs } from "@/components/about";
import { PostList } from "@/components/blog";
import { DownloadResumeButton } from "@/components/resume";
import { LazyGitHubHeatmap } from "@/components/features/github/lazy-github-heatmap";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const pageTitle = "About";
const pageDescription = "Learn more about us, our mission, team, and professional background in cybersecurity.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/about",
});

export default async function AboutPage() {
  const currentRole = resume.experience[0];
  
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Prepare recent posts (3 most recent, excluding drafts/archived)
  const recentPosts = [...posts]
    .filter(p => !p.archived && !p.draft)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);
  
  // JSON-LD structured data for about page
  const socialImage = getOgImageUrl(pageTitle, pageDescription);
  const jsonLd = getAboutPageSchema(pageDescription, socialImage);

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      
      <SectionNavigator scrollOffset={SCROLL_BEHAVIOR.offset.standard} className="space-y-12">
        {/* Page Hero */}
        <Section className={PAGE_LAYOUT.hero.container}>
          <div className={cn("flex flex-col md:flex-row items-center md:items-start gap-4", SPACING.content)}>
            {/* Avatar */}
            <div className="shrink-0 mb-6 md:mb-0">
              <ProfileAvatar size="md" />
            </div>
            {/* Content */}
            <div className="flex-1 space-y-4">
              <h1 className={cn(TYPOGRAPHY.h1.hero, "font-serif")}>
                <span className="flex items-center gap-2 ">
                  About Drew
                </span>
              </h1>
              <p className={TYPOGRAPHY.description}>
                {getShortSummary()}
              </p>
            </div>
          </div>
        </Section>
        
        {/* About me */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={0}>
            <div className={SPACING.content}>
              <h2 className={TYPOGRAPHY.h2.standard}>What Drives Me</h2>
              <div className="space-y-3 text-muted-foreground">
              <p>
                My passion for cybersecurity stems from a deep-seated curiosity about technology and a commitment to making the digital world a safer and more secure place. I thrive on solving complex problems, staying ahead of emerging threats, and continuously learning in this ever-evolving field.
              </p>
              <p>
                Beyond the technical aspects, I believe that effective cybersecurity is about people—educating users, fostering a security-first culture, and collaborating across teams to build resilient systems. I&apos;m dedicated to empowering organizations to protect their assets while enabling innovation and growth.
              </p>
              <p>
                When I&apos;m not immersed in security challenges, you can find me exploring the latest tech trends, contributing to open-source projects, or sharing insights through writing and speaking engagements. I&apos;m always eager to connect with fellow professionals and enthusiasts who share my passion for cybersecurity.
              </p>
            </div>
            </div>
          </ScrollReveal>
        </Section>
        
        {/* Professional Background */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={50}>
            <div className={SPACING.content}>
              <h2 className={TYPOGRAPHY.h2.standard}>Professional Background</h2>

              <p className="text-muted-foreground mb-6">
              With over {getYearsOfExperience()} years of experience in the cybersecurity industry, I have had the privilege of working with diverse organizations ranging from startups to established enterprises. My journey has equipped me with a comprehensive understanding of security frameworks, risk management, and incident response strategies.
            </p>

            {/* By the Numbers  */}
            <div className="mb-12">
              <AboutStats 
                blogCount={posts.filter(p => !p.archived && !p.draft).length}
                projectCount={visibleProjects.length}
              />
            </div>

            {/* Current Role  */}
            <div className="mb-6">
              <div className="space-y-3">
                <h3 className={TYPOGRAPHY.h3.standard}>Currently at {currentRole.company}</h3>
                <Card className="p-5 space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">{currentRole.title}</p>
                    <p className="text-sm text-muted-foreground">{currentRole.duration}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    {currentRole.responsibilities.map((item, idx) => (
                      <li key={idx}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link 
                className={`underline inline-flex items-center gap-2 text-primary ${HOVER_EFFECTS.link}`}
                href="/resume"
              >
                View full resume
              </Link>
              {/* <DownloadResumeButton /> */}
            </div>
            </div>
          </ScrollReveal>
        </Section>

        {/* GitHub Activity */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={60}>
            <div className={SPACING.content}>
              <h2 className={TYPOGRAPHY.h2.standard}>GitHub Activity</h2>
              <p className="text-muted-foreground mb-6">
                A snapshot of my open source contributions and coding activity over the past year.
              </p>
              <GitHubHeatmapErrorBoundary>
                <LazyGitHubHeatmap username="dcyfr" />
              </GitHubHeatmapErrorBoundary>
            </div>
          </ScrollReveal>
        </Section>
        
        {/* Meet the Team */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={75}>
            <TeamSpotlights />
          </ScrollReveal>
        </Section>

        {/* Connect with Us */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <ConnectWithUs />
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
