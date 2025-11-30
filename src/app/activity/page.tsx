import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { visibleProjects } from "@/data/projects";
import { visibleChangelog } from "@/data/changelog";
import { headers } from "next/headers";
import { createPageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { CONTAINER_WIDTHS, TYPOGRAPHY } from "@/lib/design-tokens";
import { ActivityPageClient } from "./activity-client";
import {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
} from "@/lib/activity";

const pageTitle = "Activity";
const pageDescription =
  "Timeline of recent blog posts, project updates, GitHub commits, and site activity.";

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/activity",
});

// Enable ISR for activity page
export const revalidate = 3600; // 1 hour

export default async function ActivityPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // Transform all content into activity items
  const blogActivities = transformPosts(
    posts.filter((p) => !p.archived && !p.draft)
  );
  const projectActivities = transformProjects([...visibleProjects]);
  const changelogActivities = transformChangelog(visibleChangelog);

  // Aggregate all activities
  const allActivities = aggregateActivities([
    ...blogActivities,
    ...projectActivities,
    ...changelogActivities,
  ]);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/activity`,
    url: `${SITE_URL}/activity`,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    inLanguage: "en-US",
  };

  // Serialize activities for client component
  const serializedActivities = allActivities.map((activity) => ({
    ...activity,
    timestamp: activity.timestamp.toISOString(),
  }));

  return (
    <>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />

      <div className={`container ${CONTAINER_WIDTHS.standard} mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-8`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className={TYPOGRAPHY.h1.hero}>{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        {/* Activity Feed */}
        <ActivityPageClient activities={serializedActivities} />
      </div>
    </>
  );
}
