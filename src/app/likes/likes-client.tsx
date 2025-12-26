"use client";

import * as React from "react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import type { ActivityItem } from "@/lib/activity/types";
import { PostList } from "@/components/blog/post/post-list";
import { ActivityFeed } from "@/components/activity";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layouts/page-hero";
import { Alert } from "@/components/common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Heart, HeartOff, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useActivityReactions } from "@/hooks/use-activity-reactions";
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// Recommended starter posts to like
const RECOMMENDED_LIKES = [
  "shipping-developer-portfolio",
  "hardening-developer-portfolio",
  "owasp-top-10-agentic-ai",
  "ai-development-workflow",
];

interface LikesClientProps {
  posts: Post[];
  activities: ActivityItem[];
}

/**
 * Likes Client Component
 *
 * Uses unified reactions system with useActivityReactions hook.
 * Displays ALL liked content: blog posts, projects, GitHub activity, etc.
 *
 * Features:
 * - Unified useActivityReactions hook for state management
 * - Shows both blog posts AND activity items
 * - Proper like removal using hook methods
 * - Real-time sync across tabs
 * - Magazine layout by default (consistent with blog)
 */
export function LikesClient({ posts, activities }: LikesClientProps) {
  const { isLiked, toggleLike, getLikedIds } = useActivityReactions();
  const [layout] = React.useState<"grid" | "list" | "magazine" | "compact">("magazine");
  const [isMounted, setIsMounted] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);

  // Get recommended posts that aren't already liked
  const recommendedPosts = React.useMemo(() => {
    if (!isMounted || !posts) return [];
    return posts.filter(post => {
      const inRecommended = RECOMMENDED_LIKES.includes(post.slug);
      if (!inRecommended) return false;
      return !isLiked(post.slug);
    });
  }, [posts, isLiked, isMounted]);

  // Filter posts to only show liked ones (only after mount to prevent hydration mismatch)
  const likedPosts = React.useMemo(() => {
    if (!isMounted || !posts) return [];
    return posts.filter(post => isLiked(post.slug));
  }, [posts, isLiked, isMounted]);

  // Filter activities to only show liked ones
  // This catches all activity types: blog posts, projects, GitHub commits, etc.
  const likedActivities = React.useMemo(() => {
    if (!isMounted || !activities) return [];
    return activities.filter(activity => {
      // For blog posts, check if slug from href is liked
      if (activity.source === "blog" && activity.href.startsWith("/blog/")) {
        const slug = activity.href.replace("/blog/", "");
        return isLiked(slug);
      }
      // For all other activities, check activity ID
      return isLiked(activity.id);
    });
  }, [activities, isLiked, isMounted]);

  // Total count of all liked items
  const totalLiked = React.useMemo(() => {
    if (!isMounted) return 0;
    // Count unique items (avoid double-counting blog posts that appear in both lists)
    const postSlugs = new Set(likedPosts.map(p => p.slug));
    const nonBlogActivities = likedActivities.filter(a =>
      !(a.source === "blog" && a.href.startsWith("/blog/"))
    );
    return postSlugs.size + nonBlogActivities.length;
  }, [likedPosts, likedActivities, isMounted]);

  // Non-blog activities to display (avoid duplicating blog posts shown in PostList)
  const nonBlogLikedActivities = React.useMemo(() => {
    if (!isMounted) return [];
    return likedActivities.filter(a =>
      !(a.source === "blog" && a.href.startsWith("/blog/"))
    );
  }, [likedActivities, isMounted]);

  // Prevent hydration mismatch by only showing client-only content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add all recommended likes
  const addRecommendedLikes = () => {
    if (recommendedPosts.length === 0) {
      toast.info("All recommended posts are already liked!");
      return;
    }

    recommendedPosts.forEach(post => toggleLike(post.slug));
    toast.success(
      `Liked ${recommendedPosts.length} recommended post${recommendedPosts.length === 1 ? '' : 's'}!`,
      { duration: 3000 }
    );
  };

  // Clear all likes using the hook's method
  const handleClearAll = () => {
    const likedIds = getLikedIds("like");
    likedIds.forEach(id => toggleLike(id));
    setShowClearDialog(false);
    toast.success("All likes cleared");
  };

  // Show loading state during SSR/initial render
  if (!isMounted) {
    return (
      <>
        <PageHero
          title="Likes"
          description="Content you've liked and engaged with"
        />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <HeartOff className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className={TYPOGRAPHY.h2.standard}>Loading likes...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page Hero */}
      <PageHero
        title="Likes"
        description="Content you've liked and engaged with"
      />

      {/* Dynamic Count and Actions */}
      {isMounted && totalLiked > 0 && (
        <div className={cn(
          "mx-auto flex items-center justify-between gap-4 -mt-6 mb-8",
          CONTAINER_WIDTHS.standard,
          CONTAINER_PADDING
        )}>
          <p className={TYPOGRAPHY.metadata}>
            {totalLiked} {totalLiked === 1 ? "item" : "items"} liked
            {likedActivities.length > likedPosts.length && (
              <span className="text-muted-foreground ml-2">
                ({likedActivities.length} total activities)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowClearDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Post List or Empty State */}
      <div className={cn("mx-auto", CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
        {!isMounted ? (
          // Loading state during hydration
          <div className="text-center py-8 text-muted-foreground">
            Loading likes...
          </div>
        ) : totalLiked === 0 ? (
          <div className={SPACING.section}>
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="mb-6">
                <HeartOff className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h2 className={TYPOGRAPHY.h2.standard}>No liked items yet</h2>
              <p className="text-muted-foreground mt-2 mb-8">
                Like posts and activities you enjoy by clicking the heart icon on any card
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="default">
                  <Link href="/blog">Browse Blog Posts</Link>
                </Button>
                {recommendedPosts.length > 0 && (
                  <Button variant="outline" onClick={addRecommendedLikes}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Like {recommendedPosts.length} Recommended
                  </Button>
                )}
              </div>
            </div>

            {/* Recommended starter posts */}
            {recommendedPosts.length > 0 && (
              <div className="mt-16">
                <div className="mb-6 text-center">
                  <h3 className={TYPOGRAPHY.h3.standard}>Recommended to Get Started</h3>
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
            {/* Liked Blog Posts */}
            {likedPosts.length > 0 && (
              <div>
                <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-6")}>
                  Blog Posts
                </h3>
                <PostList
                  posts={likedPosts}
                  layout={layout}
                  emptyMessage=""
                />
              </div>
            )}

            {/* Liked Activities (non-blog) */}
            {nonBlogLikedActivities.length > 0 && (
              <div className={likedPosts.length > 0 ? "mt-12" : ""}>
                <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-6")}>
                  Other Activities
                </h3>
                <ActivityFeed
                  items={nonBlogLikedActivities}
                  emptyMessage=""
                />
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        {isMounted && totalLiked > 0 && (
          <Alert type="info" className="mt-8">
            <div>
              <p className="font-medium mb-1">Likes are stored locally</p>
              <p className="text-sm">
                Your likes are saved in your browser&apos;s local storage and will persist across sessions.
                Global like counts are tracked across all users in Redis.
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
                <DialogTitle>Clear all likes?</DialogTitle>
                <DialogDescription>
                  This will remove all {totalLiked} liked {totalLiked === 1 ? "item" : "items"}. This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All Likes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
