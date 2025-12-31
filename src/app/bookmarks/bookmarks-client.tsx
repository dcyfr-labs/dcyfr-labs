"use client";

import * as React from "react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import type { ActivityItem } from "@/lib/activity";
import { PostList } from "@/components/blog/client";
import { ActivityFeed } from "@/components/activity";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layouts";
import { Alert } from "@/components/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  BookmarkX,
  Sparkles,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  TYPOGRAPHY,
  SPACING,
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// Recommended starter bookmarks
const RECOMMENDED_BOOKMARKS = [
  "shipping-developer-portfolio",
  "hardening-developer-portfolio",
  "owasp-top-10-agentic-ai",
  "ai-development-workflow",
];

interface BookmarksClientProps {
  posts: Post[];
  activities: ActivityItem[];
}

/**
 * Bookmarks Client Component
 *
 * Uses unified bookmarking system with useBookmarks hook.
 * Displays ALL bookmarked content: blog posts, projects, GitHub activity, etc.
 *
 * Features:
 * - Unified useBookmarks hook for state management
 * - Shows both blog posts AND activity items
 * - Proper bookmark removal using hook methods
 * - Export functionality (JSON/CSV)
 * - Real-time sync across tabs
 * - Magazine layout by default (consistent with blog)
 */
export function BookmarksClient({ posts, activities }: BookmarksClientProps) {
  const { collection, isBookmarked, add, remove } = useBookmarks();
  const [layout] = React.useState<"grid" | "list" | "magazine" | "compact">(
    "magazine"
  );
  const [isMounted, setIsMounted] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<
    "posts" | "activities" | "all"
  >("all");

  // Get recommended posts that aren't already bookmarked
  const recommendedPosts = React.useMemo(() => {
    if (!isMounted || !posts || !collection) return [];
    return posts.filter((post) => {
      const inRecommended = RECOMMENDED_BOOKMARKS.includes(post.slug);
      if (!inRecommended) return false;

      // Use normalized slug format (consistent with ThreadActions normalization)
      return !isBookmarked(post.slug);
    });
  }, [posts, collection, isBookmarked, isMounted]);

  // Filter posts to only show bookmarked ones (only after mount to prevent hydration mismatch)
  const bookmarkedPosts = React.useMemo(() => {
    if (!isMounted || !posts || !collection) return [];
    return posts.filter((post) => {
      // Use normalized slug format (consistent with ThreadActions normalization)
      return isBookmarked(post.slug);
    });
  }, [posts, collection, isBookmarked, isMounted]);

  // Filter activities to only show bookmarked ones
  // This catches all activity types: blog posts, projects, GitHub commits, etc.
  const bookmarkedActivities = React.useMemo(() => {
    if (!isMounted || !activities || !collection) return [];
    return activities.filter((activity) => {
      // For blog posts, check if slug from href is bookmarked
      if (activity.source === "blog" && activity.href.startsWith("/blog/")) {
        const slug = activity.href.replace("/blog/", "");
        return isBookmarked(slug);
      }
      // For all other activities, check activity ID
      return isBookmarked(activity.id);
    });
  }, [activities, collection, isBookmarked, isMounted]);

  // Total count of all bookmarked items
  const totalBookmarked = React.useMemo(() => {
    if (!isMounted) return 0;
    // Count unique items (avoid double-counting blog posts that appear in both lists)
    const postSlugs = new Set(bookmarkedPosts.map((p) => p.slug));
    const nonBlogActivities = bookmarkedActivities.filter(
      (a) => !(a.source === "blog" && a.href.startsWith("/blog/"))
    );
    return postSlugs.size + nonBlogActivities.length;
  }, [bookmarkedPosts, bookmarkedActivities, isMounted]);

  // Non-blog activities to display (avoid duplicating blog posts shown in PostList)
  const nonBlogBookmarkedActivities = React.useMemo(() => {
    if (!isMounted) return [];
    return bookmarkedActivities.filter(
      (a) => !(a.source === "blog" && a.href.startsWith("/blog/"))
    );
  }, [bookmarkedActivities, isMounted]);

  // Clean up stale bookmarks for posts that no longer exist
  // IMPORTANT: Only run once after initial mount to avoid deleting bookmarks on every state change
  React.useEffect(() => {
    if (
      !isMounted ||
      !posts ||
      posts.length === 0 ||
      !collection ||
      collection.bookmarks.length === 0
    ) {
      return;
    }

    // Use normalized slug format (consistent with ThreadActions normalization)
    const existingPostSlugs = new Set(posts.map((post) => post.slug));

    const staleBookmarks = collection.bookmarks.filter((bookmark) => {
      // Keep bookmarks that match normalized slug format
      return !existingPostSlugs.has(bookmark.activityId);
    });

    if (staleBookmarks.length > 0) {
      console.warn(
        `[BookmarksClient] Cleaning up ${staleBookmarks.length} stale bookmarks from ${collection.bookmarks.length} total`
      );
      // Remove stale bookmarks using the hook's remove method
      staleBookmarks.forEach((staleBookmark) => {
        remove(staleBookmark.activityId);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]); // Only run once after mount, not on every collection change

  // Prevent hydration mismatch by only showing client-only content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add all recommended bookmarks
  const addRecommendedBookmarks = () => {
    if (recommendedPosts.length === 0) {
      toast.info("All recommended posts are already bookmarked!");
      return;
    }

    recommendedPosts.forEach((post) => add(post.slug));
    toast.success(
      `Added ${recommendedPosts.length} recommended post${recommendedPosts.length === 1 ? "" : "s"}!`,
      { duration: 3000 }
    );
  };

  // Clear all bookmarks using the hook's remove method
  const handleClearAll = () => {
    collection.bookmarks.forEach((bookmark) => {
      remove(bookmark.activityId);
    });
    setShowClearDialog(false);
    toast.success("All bookmarks cleared");
  };

  // Export bookmarks as JSON
  const handleExportJSON = () => {
    try {
      const exportData = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        bookmarks: collection.bookmarks.map((b) => ({
          slug: b.activityId,
          createdAt: b.createdAt.toISOString(),
          notes: b.notes,
          tags: b.tags,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookmarks-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Bookmarks exported");
    } catch (error) {
      toast.error("Failed to export bookmarks");
      console.error("Export error:", error);
    }
  };

  // Show loading state during SSR/initial render
  if (!isMounted) {
    return (
      <>
        <PageHero
          title="Bookmarks"
          description="Your saved content for later reading"
        />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <BookmarkX className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className={TYPOGRAPHY.h2.standard}>Loading bookmarks...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page Hero */}
      <PageHero
        title="Bookmarks"
        description="Your saved content for later reading"
      />

      {/* Dynamic Count and Actions */}
      {isMounted && totalBookmarked > 0 && (
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-4 -mt-6 mb-8",
            CONTAINER_WIDTHS.standard,
            CONTAINER_PADDING
          )}
        >
          <p className={TYPOGRAPHY.metadata}>
            {totalBookmarked} {totalBookmarked === 1 ? "item" : "items"} saved
            for later
            {bookmarkedActivities.length > bookmarkedPosts.length && (
              <span className="text-muted-foreground ml-2">
                ({bookmarkedActivities.length} total activities)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Activity List or Empty State */}
      <div
        className={cn("mx-auto", CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}
      >
        {!isMounted ? (
          // Loading state during hydration
          <div className="text-center py-8 text-muted-foreground">
            Loading bookmarks...
          </div>
        ) : totalBookmarked === 0 ? (
          <div className={SPACING.section}>
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="mb-6">
                <BookmarkX className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h2 className={TYPOGRAPHY.h2.standard}>No bookmarks yet</h2>
              <p className="text-muted-foreground mt-2 mb-8">
                Bookmark posts you want to read later by clicking the bookmark
                icon on any post card
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="default">
                  <Link href="/blog">Browse Blog Posts</Link>
                </Button>
                {recommendedPosts.length > 0 && (
                  <Button variant="outline" onClick={addRecommendedBookmarks}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add {recommendedPosts.length} Recommended
                  </Button>
                )}
              </div>
            </div>

            {/* Recommended starter posts */}
            {recommendedPosts.length > 0 && (
              <div className="mt-16">
                <div className="mb-6 text-center">
                  <h3 className={TYPOGRAPHY.h3.standard}>
                    Recommended to Get Started
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Popular posts to explore first
                  </p>
                </div>
                <PostList
                  posts={recommendedPosts}
                  layout="magazine"
                  emptyMessage=""
                />
              </div>
            )}
          </div>
        ) : (
          <div className={SPACING.section}>
            {/* Bookmarked Blog Posts */}
            {bookmarkedPosts.length > 0 && (
              <div>
                <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-6")}>
                  Blog Posts
                </h3>
                <PostList
                  posts={bookmarkedPosts}
                  layout={layout}
                  emptyMessage=""
                />
              </div>
            )}

            {/* Bookmarked Activities (non-blog) */}
            {nonBlogBookmarkedActivities.length > 0 && (
              <div className={bookmarkedPosts.length > 0 ? "mt-12" : ""}>
                <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-6")}>
                  Other Activities
                </h3>
                <ActivityFeed
                  items={nonBlogBookmarkedActivities}
                  emptyMessage=""
                />
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        {isMounted && totalBookmarked > 0 && (
          <Alert type="info" className="mt-8">
            <div>
              <p className="font-medium mb-1">Bookmarks stored locally</p>
              <p className="text-sm">
                Your bookmarks are saved in your browser&apos;s local storage.
                They won&apos;t sync across devices or be visible to others.
              </p>
            </div>
          </Alert>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 space-y-2">
                <DialogTitle>Clear all bookmarks?</DialogTitle>
                <DialogDescription>
                  This will remove all {totalBookmarked} bookmarked{" "}
                  {totalBookmarked === 1 ? "item" : "items"}. This action cannot
                  be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All Bookmarks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
