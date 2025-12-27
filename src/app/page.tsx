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
  CONTAINER_PADDING,
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
  HomepageHeroHeadline,
  FlippableAvatar,
  NetworkBackground,
  FeaturedCVEBanner,
  TrendingSection,
  QuickLinksRibbon,
} from "@/components/home";
import { getTrendingProjects } from "@/lib/activity/trending-projects";
import { SearchButton } from "@/components/search";
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

  // Calculate trending projects with real GitHub stats
  const trendingProjects = await getTrendingProjects([...projects], { limit: 5 });

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />
      <ScrollProgressIndicator />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className={SPACING.section}
      >
        {/* 1. Hero Section - Full-screen immersive experience (accounts for header height) */}
        <Section
          id="hero"
          className="relative overflow-hidden min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)]"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          {/* 3D Network Background */}
          <NetworkBackground />

          {/* Centered Content Container */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <ScrollReveal animation="fade-up" className="w-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full",
                  CONTAINER_PADDING
                )}
              >
                <div
                  className={cn(
                    "text-center flex flex-col items-center w-full mx-auto",
                    SPACING.content
                  )}
                  style={{ maxWidth: "48rem" }}
                >
                  {/* Avatar - Larger for full-screen impact  
                  <div
                    className={cn(
                      "flex justify-center w-full",
                      ANIMATION.effects.pulse
                    )}
                    role="img"
                    aria-label="Avatar - Click to flip"
                  >
                    <FlippableAvatar size="md" priority animated backdrop />
                  </div> */}

                  {/* Logo Title - Larger scale for hero */}
                  <div>
                    <SiteLogo
                      size="lg"
                      className="justify-center scale-110 md:scale-125"
                    />
                  </div>

                  {/* Description - Larger text for readability 
                  <p
                    className={cn(
                      "text-muted-foreground leading-relaxed",
                      "mx-auto w-full text-center max-w-2xl",
                      "text-base md:text-lg lg:text-xl",
                      "px-4 md:px-0"
                    )}
                  >
                    Exploring cyber architecture, coding, and security insights to
                    build a safer digital future.
                  </p> */}

                  {/* Search Bar - Prominent, wide placement */}
                  <div className={`w-full mt-4 md:mt-6 *:md:w-3/4 lg:w-2/3`}>
                    <div
                      className="w-full mx-auto"
                      style={{ maxWidth: "28rem" }}
                    >
                      <SearchButton variant="input" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Section>

        {/* TODO: 1.5. Featured CVE Alert - Cybersecurity focus -- needs something
        <Section
          id="cve-alert"
          className={cn(PAGE_LAYOUT.section.container)}
        >
          <ScrollReveal animation="fade-up" delay={75}>
            <div className={SPACING.content}>
              <FeaturedCVEBanner />
            </div>
          </ScrollReveal>
        </Section> */}

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

        {/* 4. Unified Trending Section - Posts, Topics, and Projects */}
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
                actionLabel="View all"
              />
              <TrendingSection
                posts={activePosts.filter((p) => p.id !== featuredPost?.id)}
                viewCounts={viewCountsMap}
                topics={topTopics}
                projects={trendingProjects}
                defaultTab="posts"
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* 6. Blog Series - Organized content paths */}
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
        )}

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
        
        {/* 3. Explore Cards - Primary navigation hub (consolidated) */}
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
              <SectionHeader title="Explore More" />
              <ExploreCards
                postCount={activePosts.length}
                projectCount={projects.length}
                activityCount={allActivities.length}
              />
            </div>
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
