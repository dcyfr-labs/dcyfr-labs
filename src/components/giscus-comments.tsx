"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import siteConfig from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * GiscusComments component integrates GitHub Discussions as a commenting system.
 * 
 * Features:
 * - Automatic theme switching (light/dark) synced with site theme
 * - Lazy loading for better performance
 * - Graceful fallback when not configured
 * - Environment-based configuration
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_GISCUS_REPO: GitHub repository (format: "owner/repo")
 * - NEXT_PUBLIC_GISCUS_REPO_ID: Repository ID from Giscus setup
 * - NEXT_PUBLIC_GISCUS_CATEGORY: Discussion category name
 * - NEXT_PUBLIC_GISCUS_CATEGORY_ID: Category ID from Giscus setup
 * 
 * Setup Instructions:
 * 1. Enable GitHub Discussions on your repository
 * 2. Visit https://giscus.app/ to configure and get IDs
 * 3. Add environment variables to .env.local
 * 4. Deploy with environment variables set
 * 
 * @example
 * ```tsx
 * <GiscusComments />
 * ```
 */
export function GiscusComments() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Check if Giscus is configured using centralized config
  const isConfigured = siteConfig.features.enableComments && siteConfig.services.giscus.enabled;

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration-safe pattern
    setMounted(true);
  }, []);

  // Don't render if not configured or not mounted
  if (!isConfigured || !mounted) {
    return null;
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className={cn("mb-6", "text-2xl", "font-semibold")}>Comments</h2>
      <Giscus
        repo={siteConfig.services.giscus.repo!}
        repoId={siteConfig.services.giscus.repoId!}
        category={siteConfig.services.giscus.category!}
        categoryId={siteConfig.services.giscus.categoryId!}
        mapping={siteConfig.services.giscus.mapping}
        strict="0"
        reactionsEnabled={siteConfig.services.giscus.reactionsEnabled ? "1" : "0"}
        emitMetadata={siteConfig.services.giscus.emitMetadata ? "1" : "0"}
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
