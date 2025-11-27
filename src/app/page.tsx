import { featuredProjects, projects } from "@/data/projects";
import { posts, featuredPosts } from "@/data/posts";
import { getSocialUrls } from "@/data/socials";
import { getPostBadgeMetadata } from "@/lib/post-badges";
import { getMultiplePostViews } from "@/lib/views";
import {
  SITE_URL,
  SITE_TITLE,
  AUTHOR_NAME,
  getOgImageUrl,
  SITE_TITLE_PLAIN,
} from "@/lib/site-config";
import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  SCROLL_BEHAVIOR,
  getContainerClasses,
} from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { ProjectCard } from "@/components/projects";
import { PostList } from "@/components/blog";
import {
  SectionHeader,
  Logo,
  SectionNavigator,
  Section,
  TrendingPosts,
  RecentActivity,
} from "@/components/common";
import { FeaturedPostHero, HomepageStats, HomepageHeroActions } from "@/components/home";
import { WhatIDo, TechStack, SocialProof } from "@/components/about";
import { GitHubHeatmap } from "@/components/features/github/github-heatmap";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

// Optimized meta description for homepage (157 characters)
const pageDescription = "DCYFR Labs - Cybersecurity architect and tinkerer helping organizations build resilient security programs that empower teams to move fast and stay secure.";

export const metadata: Metadata = createPageMetadata({
  title: SITE_TITLE_PLAIN,
  description: pageDescription,
  path: "/",
});

// Enable Incremental Static Regeneration for homepage
export const revalidate = 3600; // 1 hour

export default async function Home() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Get featured post for hero section
  const featuredPost = featuredPosts[0];
  
  // Prepare recent posts for homepage
  const recentPosts = [...posts]
    .filter(p => !p.archived)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);
  
  // Get badge metadata (latest and hottest posts)
  const { latestSlug, hottestSlug } = await getPostBadgeMetadata(posts);
  
  // Get view counts for trending posts
  const viewCounts = await getMultiplePostViews(posts.map(p => p.id));
  
  const socialImage = getOgImageUrl();
  // JSON-LD structured data for home page
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_TITLE,
        description: pageDescription,
        publisher: {
          "@id": `${SITE_URL}/#person`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: AUTHOR_NAME,
        url: SITE_URL,
        image: socialImage,
        description: pageDescription,
        jobTitle: "Cybersecurity Architect & Tinkerer",
        sameAs: getSocialUrls(),
        knowsAbout: [
          "Cybersecurity",
          "Artificial Intelligence",
          "Web Development",
          "Cloud Security",
          "Risk Management",
          "Incident Response",
          "Compliance",
          "DevSecOps",
          "Programming",
          "Information Security",
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://cyberdrew.dev/#webpage",
        url: "https://cyberdrew.dev",
        name: "DCYFR Labs",
        isPartOf: {
          "@id": "https://cyberdrew.dev/#website",
        },
        about: {
          "@id": "https://cyberdrew.dev/#person",
        },
        description: pageDescription,
        inLanguage: "en-US",
        image: socialImage,
      },
    ],
  };

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      
      <SectionNavigator scrollOffset={SCROLL_BEHAVIOR.offset.standard} className="space-y-10 md:space-y-14">
        {/* Hero Section */}
        <Section>
          <ScrollReveal animation="fade-up">
            <PageHero
              contentClassName="max-w-2xl mx-auto text-center"
              variant="homepage"
              align="center"
              title={
                <span className="flex items-center gap-2 justify-center">
                  Drew&apos;s Lab <Logo className="pb-2" width={32} height={32} />
                </span>
              }
              description="Hi! I'm Drew, a cybersecurity architect and tinkerer. Welcome to my lab where I share insights on security, development, and tech."
              image={
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Drew's profile picture"
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                    className="rounded-full object-cover ring-4 ring-border shadow-lg"
                    priority
                  />
                </div>
              }
              actions={<HomepageHeroActions />}
            />
          </ScrollReveal>
        </Section>

        {/* featured article */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <div className={SPACING.content}>
              <FeaturedPostHero post={featuredPost} />
            </div>
          </ScrollReveal>
        </Section>

        {/* Latest Activity */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={215}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Recent Activity"
              />
              <RecentActivity 
                posts={recentPosts}
                projects={[...featuredProjects]}
                limit={5}
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* Blog articles 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={150}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Blog Articles"
                actionHref="/blog"
              />
              <PostList 
                posts={recentPosts}
                latestSlug={latestSlug ?? undefined}
                hottestSlug={hottestSlug ?? undefined}
                viewCounts={viewCounts}
              />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* Featured project 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Featured Project"
                actionHref="/projects"
              />
              <ProjectCard project={featuredProjects[0]} />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* Latest projects 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Projects"
                actionHref="/projects"
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {projects
                  .filter(p => !p.hidden)
                  .sort((a, b) => {
                    // Sort by timeline (most recent first) - extract year from "YYYY → Present" format
                    const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || "0") : 0;
                    const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || "0") : 0;
                    return bYear - aYear;
                  })
                  .slice(0, 2)
                  .map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))
                }
              </div>
            </div>
          </ScrollReveal>
        </Section> */}

        {/* What I Do - Core Pillars 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={75}>
            <div className={SPACING.content}>
              <SectionHeader title="What I do" />
              <WhatIDo />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* Homepage Stats 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <HomepageStats
              postsCount={posts.length}
              projectsCount={projects.filter(p => !p.hidden).length}
              yearsOfExperience={5}
              technologiesCount={90}
            />
          </ScrollReveal>
        </Section> */}

        {/* GitHub Activity 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={125}>
            <div className={SPACING.content}>
              <SectionHeader
                title="GitHub Activity"
                actionHref="https://github.com/dcyfr"
                actionLabel="View Profile"
              />
              <GitHubHeatmap username="dcyfr" />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* Tech Stack & Social Proof 
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={225}>
            <div className="grid gap-4 lg:grid-cols-2">
              <TechStack />
              <SocialProof />
            </div>
          </ScrollReveal>
        </Section> */}

      </SectionNavigator>
    </PageLayout> 
  );
}
