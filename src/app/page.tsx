import { featuredProjects, projects } from "@/data/projects";
import { posts, featuredPosts } from "@/data/posts";
import { visibleChangelog, changelog } from "@/data/changelog";
import { getSocialUrls } from "@/data/socials";
import { getPostBadgeMetadata } from "@/lib/post-badges";
import { getMultiplePostViews } from "@/lib/views";
import { calculateYearsWithCertifications } from "@/lib/years-calculator";
import {
  SITE_URL,
  SITE_TITLE,
  AUTHOR_NAME,
  getOgImageUrl,
  SITE_TITLE_PLAIN,
} from "@/lib/site-config";
import { headers } from "next/headers";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  SCROLL_BEHAVIOR,
  CONTAINER_VERTICAL_PADDING,
} from "@/lib/design-tokens";
import { Card } from "@/components/ui/card";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts/page-layout";
import { cn } from "@/lib/utils";
import {
  SectionHeader,
  SiteLogo,
  SectionNavigator,
  Section,
  TrendingPosts,
  SmoothScrollToHash,
} from "@/components/common";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
} from "@/lib/activity";
import type { ActivityItem } from "@/lib/activity/types";
import {
  transformPostsWithViews,
  transformTrendingPosts,
  transformMilestones,
  transformHighEngagementPosts,
  transformCommentMilestones,
  transformGitHubActivity,
  transformWebhookGitHubCommits,
  transformCredlyBadges,
  transformVercelAnalytics,
  transformGitHubTraffic,
  transformGoogleAnalytics,
  transformSearchConsole,
} from "@/lib/activity/sources.server";
import {
  HomepageStats,
  HomepageHeroActions,
  HomepageHeroHeadline,
  FlippableAvatar,
  QuickLinksRibbon,
} from "@/components/home";
import { ScrollReveal } from "@/components/features";

// Lazy-loaded below-fold components for better initial load performance
const FeaturedPostHero = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.FeaturedPostHero })),
  {
    loading: () => (
      <Card className="p-4 md:p-8 animate-pulse">
        <div className={cn("flex items-center", SPACING.compact)}>
          <div className="flex items-center gap-4">
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className={cn("mt-4", SPACING.compact)}>
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-full" />
        </div>
      </Card>
    ),
    ssr: true,
  }
);

const InfiniteActivitySection = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.InfiniteActivitySection })),
  {
    loading: () => (
      <div className={SPACING.content}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    ),
    ssr: true,
  }
);

const HomepageHeatmapMini = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.HomepageHeatmapMini })),
  {
    loading: () => (
      <div className="h-48 w-full bg-muted rounded-lg animate-pulse" />
    ),
    ssr: true,
  }
);

const ExploreCards = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.ExploreCards })),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
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
  
  // Prepare posts for homepage (all posts for infinite scroll timeline)
  const recentPosts = [...posts]
    .filter(p => !p.archived)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    // No limit - use all posts for timeline
  
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

  // Gather activity from all sources (unified timeline)
  const activities: ActivityItem[] = [];

  await Promise.all([
    // Blog posts with views
    transformPostsWithViews(posts)
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Blog posts fetch failed:", err)),
    
    // Projects
    Promise.resolve(transformProjects([...projects]))
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Projects fetch failed:", err)),
    
    // Changelog
    Promise.resolve(transformChangelog(changelog))
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Changelog fetch failed:", err)),
    
    // Trending posts
    transformTrendingPosts(posts)
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Trending posts fetch failed:", err)),
    
    // Milestones
    transformMilestones(posts)
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Milestones fetch failed:", err)),
    
    // High engagement posts
    transformHighEngagementPosts(posts)
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] High engagement posts fetch failed:", err)),
    
    // Comment milestones
    transformCommentMilestones(posts)
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Comment milestones fetch failed:", err)),
    
    // GitHub activity
    transformGitHubActivity("dcyfr", ["dcyfr-labs"])
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] GitHub activity fetch failed:", err)),
    
    // Webhook GitHub commits
    transformWebhookGitHubCommits()
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Webhook commits fetch failed:", err)),
    
    // Credly badges
    transformCredlyBadges("dcyfr")
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Credly badges fetch failed:", err)),
    
    // Vercel Analytics
    transformVercelAnalytics()
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Vercel Analytics fetch failed:", err)),
    
    // GitHub Traffic
    transformGitHubTraffic()
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] GitHub Traffic fetch failed:", err)),
    
    // Google Analytics
    transformGoogleAnalytics()
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Google Analytics fetch failed:", err)),
    
    // Search Console
    transformSearchConsole()
      .then((items) => activities.push(...items))
      .catch((err) => console.error("[Homepage] Search Console fetch failed:", err)),
  ]);

  // Sort by timestamp (most recent first)
  const timelineActivities = activities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // All activities for heatmap
  const allActivities = timelineActivities;

  // Convert viewCounts to Map for TrendingPosts
  const viewCountsMap = new Map(Object.entries(viewCounts).map(([k, v]) => [k, v as number]));

  // Calculate stats for homepage
  const activePosts = posts.filter(p => !p.archived);
  const uniqueTechnologies = new Set(
    projects.flatMap(p => p.tech || [])
  );
  // Calculate years including certifications from Credly
  const yearsOfExperience = await calculateYearsWithCertifications();

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className={SPACING.section}
      >
        {/* 1. Hero Section */}
        <Section id="hero">
          <ScrollReveal animation="fade-up">
            <div
              className={cn(
                PAGE_LAYOUT.hero.container,
                "flex flex-col items-center w-full"
              )}
            >
              <div
                className={cn(
                  SPACING.content,
                  "text-center flex flex-col items-center w-full",
                  CONTAINER_WIDTHS.narrow,
                  "mx-auto"
                )}
              >
                {/* Avatar */}
                <div
                  className="flex justify-center w-full mb-4 md:mb-6"
                  role="img"
                  aria-label="Avatar - Click to flip"
                >
                  <FlippableAvatar size="md" priority animated backdrop />
                </div>

                {/* Logo Title */}
                <div className="mb-4 md:mb-6">
                  <SiteLogo
                    size="lg"
                    showIcon={false}
                    className="justify-center"
                  />
                </div>

                {/* Description */}
                <p
                  className={cn(
                    "text-muted-foreground leading-relaxed",
                    TYPOGRAPHY.description,
                    "mx-auto w-full text-center",
                    "mb-6 md:mb-8"
                  )}
                >
                  Exploring cyber architecture, coding, and security insights to
                  build a safer digital future.
                </p>

                {/* Actions */}
                <div className="w-full flex justify-center mb-4 md:mb-6">
                  <HomepageHeroActions />
                </div>

                {/* Quick Links Ribbon */}
                <QuickLinksRibbon />
              </div>
            </div>
          </ScrollReveal>
        </Section>

        {/* 2. Activity Heatmap 
        <Section id="activity-heatmap" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={50}>
            <div className={SPACING.content}>
              <HomepageHeatmapMini activities={allActivities} />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* 3. Featured Article - Highlighted section */}
        <Section
          id="featured-post"
          className={cn(
            PAGE_LAYOUT.section.container,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <ScrollReveal animation="fade-up" delay={100}>
            <div className={SPACING.content}>
              {/* <SectionHeader title="Featured" /> */}
              <FeaturedPostHero post={featuredPost} />
            </div>
          </ScrollReveal>
        </Section>

        {/* 4. Trending Now */}
        <Section id="trending" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={150}>
            <div className={SPACING.content}>
              {/* <SectionHeader
                title="Trending"
                actionHref="/blog"
                actionLabel="View all posts"
              /> */}
              <TrendingPosts
                posts={activePosts}
                viewCounts={viewCountsMap}
                limit={3}
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 5. Recent Activity - Infinite Scroll Timeline */}
        <Section id="recent-activity" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className={SPACING.content}>
              {/* <SectionHeader
                title="Recent Activity"
                actionHref="/activity"
                actionLabel="View all activity"
              /> */}
              <InfiniteActivitySection
                items={timelineActivities}
                totalActivities={timelineActivities.length}
                initialCount={7}
                pageSize={8}
                showProgress
                maxItemsBeforeCTA={20}
                ctaText="View all activity"
                ctaHref="/activity"
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 6. Explore Cards - Highlighted section 
        <Section
          id="explore"
          className={cn(
            PAGE_LAYOUT.section.container,
            CONTAINER_VERTICAL_PADDING,
            "bg-muted/30 dark:bg-muted/10",
            "border-y border-border/50"
          )}
        >
          <ScrollReveal animation="fade-up" delay={250}>
            <div className={SPACING.content}>
              <SectionHeader title="Explore" />
              <ExploreCards
                postCount={activePosts.length}
                projectCount={projects.length}
                activityCount={allActivities.length}
              />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* 7. Stats Dashboard 
        <Section id="stats" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={300}>
            <div className={SPACING.content}>
              <HomepageStats
                postsCount={activePosts.length}
                projectsCount={projects.length}
                yearsOfExperience={yearsOfExperience}
                technologiesCount={uniqueTechnologies.size}
              />
            </div>
          </ScrollReveal>
        </Section> */}
      </SectionNavigator>
    </PageLayout>
  );
}
