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
import { Card } from "@/components/ui/card";
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
  SmoothScrollToHash,
} from "@/components/common";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from "@/lib/activity";
import { HomepageStats, HomepageHeroActions, HomepageHeroHeadline, FlippableAvatar } from "@/components/home";
import { ScrollReveal } from "@/components/features";

// Lazy-loaded below-fold components for better initial load performance
const FeaturedPostHero = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.FeaturedPostHero })),
  {
    loading: () => (
      <Card className="p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-full" />
        </div>
      </Card>
    ),
    ssr: true,
  }
);

const ActivityFeed = dynamic(
  () => import("@/components/activity").then(mod => ({ default: mod.ActivityFeed })),
  {
    loading: () => (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    ),
    ssr: true,
  }
);

// Optimized meta description for homepage (157 characters)
const pageDescription = "Discover insights on cyber architecture, coding, and security at DCYFR Labs. Stay updated with our latest articles and projects.";

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

  // Transform content into activity items
  const blogActivities = await transformPosts(recentPosts);
  const projectActivities = transformProjects([...featuredProjects]);
  const changelogActivities = transformChangelog(visibleChangelog);
  
  const recentActivities = aggregateActivities(
    [
      ...blogActivities,
      ...projectActivities,
      ...changelogActivities,
    ],
    { limit: 7 }
  );

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className="space-y-10 md:space-y-14"
      >
        {/* Hero Section */}
        <Section id="hero">
          <ScrollReveal animation="fade-up">
            <div className={cn(PAGE_LAYOUT.hero.container, "flex flex-col items-center w-full")}>
              <div
                className={cn(
                  "space-y-4",
                  "text-center flex flex-col items-center w-full",
                  `${CONTAINER_WIDTHS.narrow} mx-auto`
                )}
              >
                {/* Avatar */}
                <div
                  className="flex justify-center w-full"
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
                    "mx-auto w-full",
                    "text-center"
                  )}
                >
                  Exploring cyber architecture, coding, and security insights to build a safer digital future.
                </p>

                {/* Actions */}
                <div className="w-full flex justify-center">
                  <HomepageHeroActions />
                </div>
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
                items={recentActivities}
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
