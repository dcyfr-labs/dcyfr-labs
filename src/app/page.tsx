import { posts, featuredPosts } from "@/data/posts";
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
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts";
import { cn } from "@/lib/utils";
import {
  SectionHeader,
  SiteLogo,
  SectionNavigator,
  Section,
  SmoothScrollToHash,
} from "@/components/common";
// Import components for loading fallbacks (using loading prop pattern)
import {
  FeaturedPostHero as FeaturedPostHeroComponent,
  QuickLinksRibbon,
} from "@/components/home";
import { SearchButton } from "@/components/search";

// Lazy-loaded below-fold components for better initial load performance
// Using new loading prop pattern - components render their own skeletons
const FeaturedPostHero = dynamic(
  () =>
    import("@/components/home").then((mod) => ({
      default: mod.FeaturedPostHero,
    })),
  {
    loading: () => <FeaturedPostHeroComponent loading />,
  }
);

// Optimized meta description for homepage (158 characters - within 150-160 range)
const pageDescription =
  "Discover insights on cyber architecture, coding, and security at DCYFR Labs. Explore our latest articles, projects, and innovative solutions.";

export const metadata: Metadata = createPageMetadata({
  title: SITE_TITLE_PLAIN,
  description: pageDescription,
  path: "/",
});

export default async function Home() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // Get featured post for hero section
  const featuredPost = featuredPosts[0];

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

  // Calculate stats for homepage
  const activePosts = posts.filter((p) => !p.archived);

  // Calculate topic data for TopicNavigator
  const tagCounts = new Map<string, number>();
  activePosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      <SectionNavigator
        scrollOffset={SCROLL_BEHAVIOR.offset.standard}
        className={SPACING.section}
      >
        <Section
          id="hero"
          className="relative flex items-center justify-center min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] xl:min-h-[80vh]"
        >
          {/* Hero Content - Centered and Minimal */}
          <div
            className={cn(
              "max-w-2xl mx-auto text-center",
              CONTAINER_PADDING,
              "opacity-0 translate-y-2 animate-fade-in-up"
            )}
            style={{
              animationDelay: "150ms",
              animationFillMode: "forwards",
            }}
          >
            {/* Logo - Subtle presence */}
            <div className="mb-2 flex justify-center">
              <SiteLogo size="lg" />
            </div>

            {/* Subheadline - Supportive description */}
            <p
              className={cn(
                TYPOGRAPHY.description,
                "text-muted-foreground mb-4"
              )}
            >
              Security insights, AI research, and practical code
            </p>

            {/* Search - Primary CTA */}
            <div className="mx-auto mb-4 mt-12 max-w-md">
              <SearchButton variant="input" />
            </div>

            {/* Quick Links - Secondary navigation */}
            <div className="mt-4">
              <QuickLinksRibbon />
            </div>
          </div>
        </Section>
      </SectionNavigator>
    </PageLayout>
  );
}
