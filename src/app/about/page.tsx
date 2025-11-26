import type { Metadata } from "next";
import Link from "next/link";
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
import { SocialLinksGrid } from "@/components/sections/social-links-grid";
import {
  Logo,
  SectionNavigator,
  Section,
  AvailabilityBanner,
} from "@/components/common";
import { AboutAvatar, AboutStats, AboutTeam } from "@/components/about";
import { PostList } from "@/components/blog";
import { DownloadResumeButton } from "@/components/resume";
import dynamic from "next/dynamic";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const pageTitle = "About Drew";
const pageDescription = "Learn more about Drew, his professional background, skills, and how to connect.";

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
      
      <SectionNavigator scrollOffset={SCROLL_BEHAVIOR.offset.standard} className="space-y-10 md:space-y-14">
        {/* Page Hero */}
        <Section className={PAGE_LAYOUT.hero.container}>
          <div className="flex flex-col md:flex-row md:items-start md:gap-6 lg:gap-8">
            {/* Avatar */}
            <div className="shrink-0 mb-6 md:mb-0">
              <AboutAvatar size="md" />
            </div>
            {/* Content */}
            <div className="flex-1 space-y-4">
              <h1 className={TYPOGRAPHY.h1.hero}>
                <span className="flex items-center gap-2">
                  Drew <Logo className="pb-2" width={32} height={32} />
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
                My passion for cybersecurity stems from a deep-seated curiosity about technology and a commitment to making the digital world a safer place. I thrive on solving complex problems, staying ahead of emerging threats, and continuously learning in this ever-evolving field.
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
                className={`inline-flex items-center gap-2 text-primary ${HOVER_EFFECTS.link}`}
                href="/resume"
              >
                View full resume
              </Link>
              {/* <DownloadResumeButton /> */}
            </div>
            </div>
          </ScrollReveal>
        </Section>
        
        {/* Meet the Team 
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <AboutTeam />
          </div>
        </Section> */}

        {/* Featured Writing 
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <h2 className={TYPOGRAPHY.h2.standard}>Recent Writing</h2>
            <p className="text-muted-foreground mb-6">
              I write about cybersecurity, development practices, and technology trends. Here are some recent posts:
            </p>
            <PostList 
              posts={recentPosts} 
              layout="default"
              titleLevel="h3"
            />
            <div className="mt-6">
              <Link 
                className={`inline-flex items-center gap-2 text-primary ${HOVER_EFFECTS.link}`}
                href="/blog"
              >
                View all posts
              </Link>
            </div>
          </ScrollReveal>
        </Section> */}

        {/* Connect with Me */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <div className={SPACING.content}>
              <h2 className={TYPOGRAPHY.h2.standard}>Connect with Me</h2>
              <p className="text-muted-foreground mb-4">
              I&apos;m open to connecting with fellow builders, sharing knowledge, and exploring new opportunities. Feel free to reach out through any of the platforms below!
            </p>
              <AvailabilityBanner className="my-6" />
              <SocialLinksGrid />
            </div>
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
