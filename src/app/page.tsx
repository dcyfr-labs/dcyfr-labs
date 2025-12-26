import { featuredProjects, projects } from "@/data/projects";
import { posts, featuredPosts, allSeries } from "@/data/posts";
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
  ANIMATION,
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
  // transformGitHubActivity, (DISABLED)
  // transformWebhookGitHubCommits, (DISABLED)
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
import { ScrollReveal, ScrollProgressIndicator } from "@/components/features";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    ),
    ssr: true,
  }
);

const TopicNavigator = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.TopicNavigator })),
  {
    loading: () => (
      <div className="flex flex-wrap gap-2 justify-center">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
    ),
    ssr: true,
  }
);

const SeriesShowcase = dynamic(
  () => import("@/components/home").then(mod => ({ default: mod.SeriesShowcase })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
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
    
    // Trending posts - DISABLED: Now shown as badges on published events
    // transformTrendingPosts(posts)
    //   .then((items) => activities.push(...items))
    //   .catch((err) => console.error("[Homepage] Trending posts fetch failed:", err)),

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
    
    // GitHub activity (DISABLED)
    // transformGitHubActivity("dcyfr", ["dcyfr-labs"])
    //   .then((items) => activities.push(...items))
    //   .catch((err) => console.error("[Homepage] GitHub activity fetch failed:", err)),
    
    // Webhook GitHub commits (DISABLED)
    // transformWebhookGitHubCommits()
    //   .then((items) => activities.push(...items))
    //   .catch((err) => console.error("[Homepage] Webhook commits fetch failed:", err)),
    
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

  // Calculate topic data for TopicNavigator
  const tagCounts = new Map<string, number>();
  activePosts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Convert to array and sort by frequency
  const sortedTopics = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // Assign color variants (cycles through colors)
  const colorVariants = ["cyan", "lime", "orange", "purple", "magenta"] as const;
  const topTopics = sortedTopics.slice(0, 12).map((topic, index) => ({
    ...topic,
    colorVariant: colorVariants[index % colorVariants.length],
  }));

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />
      <ScrollProgressIndicator />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className={SPACING.section}
      >
        {/* 1. Hero Section */}
        <Section id="hero" className="relative">
          {/* Gradient background overlay */}
          <div
            className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            }}
            aria-hidden="true"
          />

          <ScrollReveal animation="fade-up">
            <div
              className={cn(
                PAGE_LAYOUT.hero.container,
                "flex flex-col items-center w-full relative z-10"
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
                  className={cn(
                    "flex justify-center w-full",
                    ANIMATION.effects.pulse
                  )}
                  role="img"
                  aria-label="Avatar - Click to flip"
                >
                  <FlippableAvatar size="md" priority animated backdrop />
                </div>

                {/* Logo Title */}
                <div>
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
                    "text-sm md:text-base"
                  )}
                >
                  Exploring cyber architecture, coding, and security insights to
                  build a safer digital future.
                </p>

                {/* Actions */}
                <div className="w-full flex justify-center">
                  <HomepageHeroActions />
                </div>

                {/* Quick Links Ribbon */}
                <QuickLinksRibbon />
              </div>
            </div>
          </ScrollReveal>
        </Section>

        {/* 2. TODO: Activity Heatmap -- needs work
        <Section id="activity-heatmap" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={50}>
            <div className={SPACING.content}>
              <HomepageHeatmapMini activities={allActivities} />
            </div>
          </ScrollReveal>
        </Section> */}

        {/* 2. Featured Article - Highlighted section */}
        <Section
          id="featured-post"
          className={cn(PAGE_LAYOUT.section.container)}
        >
          <ScrollReveal animation="fade-up" delay={100}>
            <div className={SPACING.content}>
              <FeaturedPostHero post={featuredPost} />
            </div>
          </ScrollReveal>
        </Section>

        {/* 3. Explore Cards - Primary navigation hub */}
        <Section
          id="explore"
          className={cn(
            PAGE_LAYOUT.section.container,
            CONTAINER_VERTICAL_PADDING,
            "bg-muted/30 dark:bg-muted/10",
            "border-y border-border/50"
          )}
        >
          <ScrollReveal animation="fade-up" delay={125}>
            <div className={SPACING.content}>
              <SectionHeader title="Explore" />
              <ExploreCards
                postCount={activePosts.length}
                projectCount={projects.length}
                activityCount={allActivities.length}
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 4. Trending Now */}
        <Section
          id="trending"
          className={cn(
            PAGE_LAYOUT.section.container,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <ScrollReveal animation="fade-up" delay={150}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Trending"
                actionHref="/blog"
                actionLabel="View all posts"
              />
              <TrendingPosts
                posts={activePosts.filter((p) => p.id !== featuredPost?.id)}
                viewCounts={viewCountsMap}
                limit={3}
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 5. Topic Navigator - Discover content by topic */}
        <Section
          id="topics"
          className={cn(
            PAGE_LAYOUT.section.container,
            CONTAINER_VERTICAL_PADDING
          )}
        >
          <ScrollReveal animation="fade-up" delay={175}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Popular Topics"
                actionHref="/blog"
                actionLabel="Browse all topics"
              />
              <TopicNavigator
                topics={topTopics}
                maxTopics={12}
                variant="homepage"
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 6. TODO: Blog Series - Organized content paths -- need 3+ series
        {allSeries.length > 0 && (
          <Section
            id="series"
            className={cn(
              PAGE_LAYOUT.section.container,
              CONTAINER_VERTICAL_PADDING
            )}
          >
            <ScrollReveal animation="fade-up" delay={200}>
              <div className={SPACING.content}>
                <SectionHeader
                  title="Featured Series"
                  actionHref="/blog/series"
                  actionLabel="View all series"
                />
                <SeriesShowcase series={allSeries} maxSeries={3} />
              </div>
            </ScrollReveal>
          </Section>
        )} */}

        {/* 7. Recent Activity - Updates feed */}
        <Section
          id="recent-activity"
          className={cn(PAGE_LAYOUT.section.container)}
        >
          <ScrollReveal animation="fade-up" delay={225}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Recent Activity"
                actionHref="/activity"
                actionLabel="View all activity"
              />
              <InfiniteActivitySection
                items={timelineActivities}
                totalActivities={timelineActivities.length}
                initialCount={3}
                pageSize={0}
                showProgress
                maxItemsBeforeCTA={3}
                ctaText="View all activity"
                ctaHref="/activity"
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 8. TODO: Stats Dashboard -- needs validation
        <Section id="stats" className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={350}>
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
