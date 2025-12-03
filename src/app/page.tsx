import { featuredProjects, projects } from "@/data/projects";
import { posts, featuredPosts } from "@/data/posts";
import { visibleChangelog } from "@/data/changelog";
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
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  SCROLL_BEHAVIOR,
  getContainerClasses,
} from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts/page-layout";
import { cn } from "@/lib/utils";
import { PostList } from "@/components/blog";
import {
  SectionHeader,
  SiteLogo,
  SectionNavigator,
  Section,
  TrendingPosts,
  ScrollIndicator,
} from "@/components/common";
import { ActivityFeed } from "@/components/activity";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from "@/lib/activity";
import { FeaturedPostHero, HomepageStats, HomepageHeroActions, HomepageHeroHeadline, FlippableAvatar } from "@/components/home";
import { WhatIDo, TechStack, SocialProof } from "@/components/about";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

// Optimized meta description for homepage (157 characters)
const pageDescription = "Cyber architecture and design insights from DCYFR Labs. Exploring coding, security, and tech trends.";

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
    .slice(0, 5);
  
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
        jobTitle: "Founding Architect",
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
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_TITLE,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#person`,
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

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className="space-y-10 md:space-y-14"
      >
        {/* Hero Section */}
        <Section id="hero">
          <ScrollReveal animation="fade-up">
            <div className={`${PAGE_LAYOUT.hero.container}`}>
              <div
                className={cn(
                  PAGE_LAYOUT.hero.content,
                  "text-center",
                  `${CONTAINER_WIDTHS.narrow} mx-auto space-y-6`
                )}
              >
                {/* Avatar */}
                <div
                  className="flex justify-center"
                  role="img"
                  aria-label="Avatar - Click to flip"
                >
                  <FlippableAvatar size="md" priority animated backdrop />
                </div>

                {/* Logo Title */}
                <SiteLogo size="lg" showIcon={false} className="justify-center" />

                {/* Professional Headline 
                <HomepageHeroHeadline /> */}

                {/* Description */}
                <p
                  className={cn(
                    "text-muted-foreground leading-relaxed",
                    TYPOGRAPHY.description,
                    CONTAINER_WIDTHS.narrow,
                    "mx-auto"
                  )}
                >
                  Helping builders create secure, resilient digital experiences
                  through cyber architecture and design insights.
                </p>

                {/* Actions */}
                <HomepageHeroActions />

                {/* Scroll Indicator 
                <div className="pt-8">
                  <ScrollIndicator />
                </div> */}
              </div>
            </div>
          </ScrollReveal>
        </Section>

        {/* featured article */}
        <Section id="featured-post" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={100}>
            <div className={SPACING.content}>
              <FeaturedPostHero post={featuredPost} />
            </div>
          </ScrollReveal>
        </Section>

        {/* Recent Activity */}
        <Section id="recent-activity" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={215}>
            <div className={SPACING.content}>
              <SectionHeader title="Activity" />
              <ActivityFeed
                items={aggregateActivities(
                  [
                    ...transformPosts(recentPosts),
                    ...transformProjects([...featuredProjects]),
                    ...transformChangelog(visibleChangelog),
                  ],
                  { limit: 8 }
                )}
                variant="timeline"
                viewAllHref="/activity"
              />
            </div>
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
