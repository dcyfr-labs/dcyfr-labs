/**
 * Developer News Aggregator (Beta)
 *
 * Displays curated RSS feeds from tech blogs, GitHub, npm, security advisories.
 * Requires Inoreader OAuth authentication.
 *
 * Route: /dev/news
 */

import { Suspense } from "react";
import { PageLayout, PageHero } from "@/components/layouts";
import { FeedsContent, FeedsAuth } from "@/components/inoreader";
import { createPageMetadata } from "@/lib/metadata";
import { SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";

export const metadata = createPageMetadata({
  title: "Developer News (Beta)",
  description:
    "Curated RSS feeds from tech blogs, GitHub, npm, and security advisories. Stay up-to-date with industry trends and news.",
  path: "/dev/news",
});

export default function DevNewsPage() {
  return (
    <PageLayout>
      <PageHero
        title="Developer News (Beta)"
        description="Curated RSS feeds from tech blogs, GitHub, npm, and security advisories. Stay up-to-date with industry trends and news."
      />

      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 md:px-8 pb-8 md:pb-12`}
      >
        <div className={SPACING.section}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading feeds...</div>
              </div>
            }
          >
            <NewsAuthWrapper />
          </Suspense>
        </div>
      </section>
    </PageLayout>
  );
}

/**
 * Wrapper to check authentication status and render appropriate component
 */
async function NewsAuthWrapper() {
  const isAuthenticated = await checkInoreaderAuth();

  if (!isAuthenticated) {
    return <FeedsAuth />;
  }

  return <FeedsContent />;
}

/**
 * Check if user has authenticated with Inoreader
 * Returns true if valid tokens exist in Redis
 */
async function checkInoreaderAuth(): Promise<boolean> {
  try {
    // Check environment variables
    if (!process.env.INOREADER_CLIENT_ID || !process.env.INOREADER_CLIENT_SECRET) {
      return false;
    }

    // Check if we're using Redis
    const { redis } = await import("@/lib/redis");
    if (!redis) {
      return false;
    }

    // Check for stored tokens
    const tokensJson = await redis.get("inoreader:tokens");
    if (!tokensJson) {
      return false;
    }

    const tokens = JSON.parse(tokensJson as string);

    // Verify tokens haven't expired
    if (!tokens.accessToken || !tokens.refreshToken) {
      return false;
    }

    // Check if access token is still valid (with 5-minute buffer)
    const bufferTime = 5 * 60 * 1000;
    if (tokens.expiresAt && Date.now() >= tokens.expiresAt - bufferTime) {
      // Token is expired or about to expire - need refresh
      // For now, return false to force re-auth
      // TODO: Implement automatic token refresh
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking Inoreader auth:", error);
    return false;
  }
}
