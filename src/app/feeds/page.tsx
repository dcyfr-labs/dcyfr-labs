/**
 * Feed Discovery Hub
 *
 * Central page for discovering and subscribing to all available feeds.
 * Lists available feeds with descriptions, update frequencies, and format options.
 *
 * Features:
 * - Modern responsive layout with staggered animations
 * - Interactive feed cards with hover effects
 * - Multiple format options (RSS 2.0, Atom, JSON Feed)
 * - Accessibility-first design with semantic HTML
 */

import { Metadata } from "next";
import { PageLayout } from "@/components/layouts";
import { PageHero } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/metadata";
import { SITE_URL, SITE_TITLE } from "@/lib/site-config";
import {
  SPACING,
  TYPOGRAPHY,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  ANIMATION,
} from "@/lib/design-tokens";
import { Rss, Activity, FileText, Briefcase, ArrowRight } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Web Feeds",
  description:
    "Stay updated with the latest content via our RSS/Atom feeds. Subscribe to blog posts, projects, and more in your preferred format.",
  path: "/feeds",
});

interface FeedInfo {
  id: string;
  title: string;
  description: string;
  url: string;
  updateFrequency: string;
  icon: React.ComponentType<{ className?: string }>;
  formats: Array<{
    label: string;
    url: string;
    type: string;
  }>;
}

const feeds: FeedInfo[] = [
  {
    id: "activity",
    title: "Activity Feed",
    description:
      "Complete timeline of all content: blog posts, projects, milestones, GitHub activity, and site updates. The most comprehensive feed available.",
    url: "/activity/feed",
    updateFrequency: "Updated hourly",
    icon: Activity,
    formats: [
      {
        label: "Atom",
        url: "/activity/feed",
        type: "application/atom+xml",
      },
      {
        label: "RSS",
        url: "/activity/feed?format=rss",
        type: "application/rss+xml",
      },
      {
        label: "JSON",
        url: "/activity/feed?format=json",
        type: "application/feed+json",
      },
    ],
  },
  {
    id: "blog",
    title: "Blog Feed",
    description:
      "Latest blog posts covering web development, security, TypeScript, and tech insights.",
    url: "/blog/feed",
    updateFrequency: "Updated daily",
    icon: FileText,
    formats: [
      {
        label: "Atom",
        url: "/blog/feed",
        type: "application/atom+xml",
      },
      {
        label: "RSS",
        url: "/blog/feed?format=rss",
        type: "application/rss+xml",
      },
      {
        label: "JSON",
        url: "/blog/feed?format=json",
        type: "application/feed+json",
      },
    ],
  },
  {
    id: "work",
    title: "Projects Feed",
    description:
      "Portfolio projects, open-source contributions, and creative works.",
    url: "/work/feed",
    updateFrequency: "Updated daily",
    icon: Briefcase,
    formats: [
      {
        label: "Atom",
        url: "/work/feed",
        type: "application/atom+xml",
      },
      {
        label: "RSS",
        url: "/work/feed?format=rss",
        type: "application/rss+xml",
      },
      {
        label: "JSON",
        url: "/work/feed?format=json",
        type: "application/feed+json",
      },
    ],
  },
];

export default function FeedsPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <PageHero
        title="Subscribe to our Web Feeds"
        description={`Stay up to date with the latest content from ${SITE_TITLE}. Choose from our various feeds based on your interests and preferred update frequency.`}
        align="center"
      />

      {/* Main Content */}
      <div
        className={`mx-auto mt-24 ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`}
      >
        {/* Section: What are feeds */}
        <section className={`${SPACING.section}`}>
          <div className="space-y-4">
            <h2 className={TYPOGRAPHY.h2.standard}>What are Web Feeds?</h2>
            <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
              Web feeds allow you to subscribe to content updates without
              visiting the website. You can use a feed reader like{" "}
              <a
                href="https://www.inoreader.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-primary/40 hover:decoration-primary transition-colors"
              >
                Inoreader
              </a>{" "}
              or{" "}
              <a
                href="https://netnewswire.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-primary/40 hover:decoration-primary transition-colors"
              >
                NetNewsWire
              </a>{" "}
              to aggregate updates from multiple sources in one place.
            </p>
          </div>

          {/* Format Options Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormatOption
              title="Atom"
              description="Modern XML feed format with enhanced features, strict validation, excellent reader support, and standardized fields."
              index={0}
            />
            <FormatOption
              title="RSS"
              description="Widely supported XML format with excellent compatibility across all feed readers. Includes rich metadata and engagement stats."
              index={1}
            />
            <FormatOption
              title="JSON"
              description="Modern JSON-based format that's easier to parse for developers building custom integrations and automation."
              index={2}
            />
          </div>
        </section>

        {/* Section: Available Feeds */}
        <section className={`${SPACING.section} pt-6 md:pt-8`}>
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-8`}>Available Feeds</h2>

          {/* Feed Cards Grid */}
          <div className="grid gap-4">
            {feeds.map((feed, index) => (
              <FeedCard key={feed.id} feed={feed} index={index} />
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

// ============================================================================
// FEED CARD COMPONENT
// ============================================================================

interface FeedCardProps {
  feed: FeedInfo;
  index: number;
}

function FeedCard({ feed, index }: FeedCardProps) {
  const Icon = feed.icon;
  // Start feed cards after the format options finish animating for top-to-bottom flow
  const animationDelay = 400 + index * 120;

  return (
    <div
      className="group animate-fade-in-up"
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <div
        className={`
          border rounded-xl p-4 md:p-8
          bg-card hover:bg-accent/50
          transition-all duration-300
          hover:border-primary/50 hover:shadow-lg
          active:scale-95
        `}
      >
        <div className="flex items-start gap-4">
          {/* Icon Container */}
          <div
            className={`
              flex-shrink-0 p-3 rounded-lg
              bg-muted group-hover:bg-primary/10
              transition-colors duration-300
            `}
          >
            <Icon
              className={`
                h-6 w-6
                text-muted-foreground group-hover:text-primary
                transition-colors duration-300
              `}
              aria-hidden="true"
            />
          </div>

          {/* Content Container */}
          <div className="flex-1 space-y-3 min-w-0">
            {/* Title and Description */}
            <div>
              <h3 className={`${TYPOGRAPHY.h3.standard}`}>{feed.title}</h3>
              <p className={`${TYPOGRAPHY.body} text-muted-foreground mt-2`}>
                {feed.description}
              </p>
            </div>

            {/* Update Frequency 
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full bg-primary/40"
                aria-hidden="true"
              />
              {feed.updateFrequency}
            </div> */}

            {/* Format Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {feed.formats.map((format, formatIndex) => (
                <Button
                  key={format.label}
                  variant="outline"
                  size="sm"
                  asChild
                  className={`
                    ${ANIMATION.transition.base}
                    hover:bg-primary/10 hover:border-primary/50
                  `}
                  style={{
                    transitionDelay: `${(formatIndex + 1) * 50}ms`,
                  }}
                >
                  <a
                    href={`${SITE_URL}${format.url}`}
                    type={format.type}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Rss className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>{format.label}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORMAT OPTION COMPONENT
// ============================================================================

interface FormatOptionProps {
  title: string;
  description: string;
  index: number;
}

function FormatOption({ title, description, index }: FormatOptionProps) {
  const animationDelay = index * 120;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <div
        className={`
          p-4 rounded-lg border border-muted
          hover:border-primary/30 hover:bg-muted/50
          transition-all duration-300
          h-full flex flex-col
        `}
      >
        <h3 className={`${TYPOGRAPHY.h3.standard} mb-3`}>{title}</h3>
        <p className={`${TYPOGRAPHY.body} text-muted-foreground flex-1`}>
          {description}
        </p>
      </div>
    </div>
  );
}
