"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PostListSkeleton } from "@/components/blog/post/post-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogLayoutWrapper } from "@/components/blog";

/**
 * Layout-aware skeleton content that reads URL params
 */
function BlogLoadingContent() {
  const searchParams = useSearchParams();
  const layoutParam = searchParams.get("layout");
  const layout = (["grid", "list", "magazine", "compact"].includes(layoutParam || "")) 
    ? layoutParam as "grid" | "list" | "magazine" | "compact" 
    : "compact";

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-20 pb-8">
      <BlogLayoutWrapper>
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="space-y-6">
              {/* Search skeleton */}
              <Skeleton className="h-10 w-full rounded-md" />

              {/* Filter section skeletons */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="px-2 sm:px-4 lg:px-6 w-full">
          {/* Header with ViewToggle */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Blog</h1>
              <p className="text-muted-foreground">Articles on web development, cybersecurity, artificial intelligence, and more.</p>
            </div>
            <div className="shrink-0 hidden lg:flex items-center gap-3">
              <Skeleton className="h-10 w-40" /> {/* ViewToggle skeleton */}
            </div>
          </div>

          {/* Mobile filters (below lg breakpoint) */}
          <div className="lg:hidden mb-6 p-4 border rounded-lg">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Post list - layout-aware skeleton */}
          <PostListSkeleton count={12} layout={layout} />

          {/* Pagination skeleton */}
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </BlogLayoutWrapper>
    </div>
  );
}

/**
 * Loading state for blog listing page.
 * Layout-aware: reads ?layout= param to show matching skeleton.
 * Matches actual blog page structure with sidebar, filters, and custom layout.
 *
 * @see src/app/blog/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <Suspense fallback={<BlogLoadingFallback />}>
      <BlogLoadingContent />
    </Suspense>
  );
}

/**
 * Fallback for when searchParams aren't available yet
 */
function BlogLoadingFallback() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-20 pb-8">
      <BlogLayoutWrapper>
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-2 sm:px-4 lg:px-6 w-full">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Blog</h1>
              <p className="text-muted-foreground">Articles on web development, cybersecurity, artificial intelligence, and more.</p>
            </div>
            <div className="shrink-0 hidden lg:flex items-center gap-3">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <div className="lg:hidden mb-6 p-4 border rounded-lg">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <PostListSkeleton count={12} layout="compact" />
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </BlogLayoutWrapper>
    </div>
  );
}
