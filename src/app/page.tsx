import { featuredProjects } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";
import { PostList } from "@/components/post-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { posts, featuredPosts } from "@/data/posts";
import { getPostBadgeMetadata } from "@/lib/post-badges";
import { Logo } from "@/components/logo";
import { getSocialUrls } from "@/data/socials";
import {
  SITE_URL,
  SITE_TITLE,
  AUTHOR_NAME,
  getOgImageUrl,
  SITE_TITLE_PLAIN,
} from "@/lib/site-config";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { FeaturedPostHero } from "@/components/featured-post-hero";
import dynamic from "next/dynamic";
import { SectionNavigator, Section } from "@/components/section-navigator";

const ScrollReveal = dynamic(() => import("@/components/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});
import Image from "next/image";
import { 
  TYPOGRAPHY, 
  SPACING,
  PAGE_LAYOUT,
  CONTAINER_WIDTHS,
  SCROLL_BEHAVIOR,
} from "@/lib/design-tokens";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";

// Optimized meta description for homepage (157 characters)
const pageDescription = "Cybersecurity architect and tinkerer helping organizations build resilient security programs that empower teams to move fast and stay secure.";

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
        jobTitle: "Cybersecurity Architect & Developer",
        sameAs: getSocialUrls(),
        knowsAbout: [
          "Cybersecurity",
          "Software Development",
          "Web Development",
          "Cloud Computing",
          "DevOps",
          "Programming",
          "Technology",
          "Open Source",
          "Networking",
          "System Administration"
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://cyberdrew.dev/#webpage",
        url: "https://cyberdrew.dev",
        name: "Drew's Lab - Cybersecurity Architect & Developer",
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
      
      <SectionNavigator scrollOffset={SCROLL_BEHAVIOR.offset.standard}>
        {/* Hero Section */}
        <Section>
          <ScrollReveal animation="fade-up">
            <PageHero
              variant="homepage"
              align="center"
              title={
                <span className="flex items-center gap-2 justify-center">
                  Hi, I&apos;m Drew <Logo className="pb-2" width={32} height={32} />
                </span>
              }
              description="Cybersecurity architect and tinkerer helping organizations build resilient security programs that empower teams to move fast and stay secure."
              image={
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Drew's profile picture"
                    fill
                    sizes="(max-width: 768px) 128px, 160px"
                    className="rounded-full object-cover ring-4 ring-border shadow-lg"
                    priority
                  />
                </div>
              }
              actions={
                <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 justify-center">
                  <Button asChild size="default">
                    <Link href="/about">Learn more</Link>
                  </Button>
                  <Button variant="outline" asChild size="default">
                    <Link href="/blog">Read my blog</Link>
                  </Button>
                  <Button variant="outline" className="hidden sm:inline-flex" asChild size="default">
                    <Link href="/projects">View Projects</Link>
                  </Button>
                </div>
              }
            />
          </ScrollReveal>
        </Section>

        {/* stats section 
        <Section className="mt-12 md:mt-16">
          <ScrollReveal animation="fade-up" delay={75}>
            <HomepageStats
              postsCount={posts.length}
              projectsCount={projects.filter(p => !p.hidden).length}
              yearsOfExperience={5}
              technologiesCount={90}
            />
          </ScrollReveal>
        </Section>
        */}

        {/* featured post hero */}
        {featuredPost && (
          <Section className={PAGE_LAYOUT.section.container}>
            <ScrollReveal animation="fade-up" delay={100}>
              <FeaturedPostHero post={featuredPost} />
            </ScrollReveal>
          </Section>
        )}

        {/* latest blog articles */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={200}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Latest articles"
                actionHref="/blog"
              />
              <PostList 
                posts={recentPosts}
                latestSlug={latestSlug ?? undefined}
                hottestSlug={hottestSlug ?? undefined}
                titleLevel="h3"
              />
            </div>
          </ScrollReveal>
        </Section>

        {/* latest projects */}
        <Section className={PAGE_LAYOUT.section.container}>
          <ScrollReveal animation="fade-up" delay={300}>
            <div className={SPACING.content}>
              <SectionHeader
                title="Projects"
                actionHref="/projects"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredProjects.slice(0, 2).map((p) => (
                  <ProjectCard key={p.title} project={p} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
