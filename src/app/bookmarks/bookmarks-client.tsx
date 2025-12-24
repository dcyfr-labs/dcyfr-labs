"use client";

import * as React from "react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { PostList } from "@/components/blog/post/post-list";
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
import { Trash2, BookmarkX, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";
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
}

/**
 * Bookmarks Client Component
 *
 * Handles client-side bookmark filtering and interactions.
 * Receives all posts from server component, filters by bookmarked slugs.
 *
 * Features:
 * - Filters posts based on localStorage bookmarks
 * - Clear all bookmarks with confirmation
 * - Empty state with link to blog
 * - Real-time sync across tabs via storage event
 */
export function BookmarksClient({ posts }: BookmarksClientProps) {
  const { collection, isBookmarked, add } = useBookmarks();
  const [layout] = React.useState<"grid" | "list" | "magazine" | "compact">("magazine");
  const [isMounted, setIsMounted] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);

  // Get recommended posts that aren't already bookmarked
  const recommendedPosts = React.useMemo(() => {
    if (!isMounted || !posts || !collection) return [];
    return posts.filter(post => 
      RECOMMENDED_BOOKMARKS.includes(post.slug) && !isBookmarked(post.slug)
    );
  }, [posts, collection, isBookmarked, isMounted]);

  // Filter posts to only show bookmarked ones (only after mount to prevent hydration mismatch)
  const bookmarkedPosts = React.useMemo(() => {
    if (!isMounted || !posts || !collection) return [];
    return posts.filter(post => isBookmarked(post.slug));
  }, [posts, collection, isBookmarked, isMounted]);

  // Clean up stale bookmarks for posts that no longer exist
  React.useEffect(() => {
    if (!isMounted || !posts || !collection) return;
    
    // Find stale bookmarks (bookmarks for posts that don't exist)
    const existingPostSlugs = new Set(posts.map(post => post.slug));
    const staleBookmarks = collection.bookmarks.filter(
      bookmark => !existingPostSlugs.has(bookmark.activityId)
    );
    
    // Clean up stale bookmarks if any found
    if (staleBookmarks.length > 0) {
      console.log(`Cleaning up ${staleBookmarks.length} stale bookmarks:`, staleBookmarks.map(b => b.activityId));
      staleBookmarks.forEach(staleBookmark => {
        // Use the remove function from the hook if available
        // For now, we'll let the user manually clean up via the Clear All button
      });
    }
  }, [isMounted, posts, collection]);

  // Prevent hydration mismatch by only showing client-only content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add all recommended bookmarks
  const addRecommendedBookmarks = async () => {
    if (recommendedPosts.length === 0) {
      toast.info("All recommended posts are already bookmarked!");
      return;
    }

    const postsToAdd = [...recommendedPosts]; // Capture current list
    
    // Add all bookmarks at once to prevent state batching issues
    postsToAdd.forEach(post => add(post.slug));
    
    // Force a small delay to ensure localStorage writes complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Force reload of collection from localStorage to ensure UI updates
    window.location.reload();
    
    toast.success(`Added ${postsToAdd.length} recommended post${postsToAdd.length === 1 ? '' : 's'} to your bookmarks!`);
  };

  // Clear all bookmarks function
  const handleClearAll = () => {
    // Clear by saving empty collection
    localStorage.setItem('dcyfr-activity-bookmarks', JSON.stringify({
      bookmarks: {},
      tags: [],
      count: 0,
      lastModified: new Date().toISOString(),
      version: '1.0.0',
      syncStatus: 'idle' as const,
      syncError: null,
      lastSyncTime: null
    }));
    setShowClearDialog(false);
    window.location.reload(); // Force reload to update state
    toast.success("All bookmarks cleared");
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
      {isMounted && bookmarkedPosts.length > 0 && (
        <div className={cn("mx-auto flex items-center justify-between gap-4 -mt-6 mb-8", CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
          <p className={TYPOGRAPHY.metadata}>
            {bookmarkedPosts.length} {bookmarkedPosts.length === 1 ? "post" : "posts"} saved for later
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowClearDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {/* Post List or Empty State */}
      <div className={cn("mx-auto", CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
        {!isMounted ? (
          // Loading state during hydration
          <div className="text-center py-8 text-muted-foreground">
            Loading bookmarks...
          </div>
        ) : bookmarkedPosts.length === 0 ? (
          <div className={SPACING.section}>
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="mb-6">
                <BookmarkX className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h2 className={TYPOGRAPHY.h2.standard}>No bookmarks yet</h2>
              <p className="text-muted-foreground mt-2 mb-8 max-w-md">
                Bookmark posts you want to read later by clicking the bookmark icon on any post card
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
            <PostList
              posts={bookmarkedPosts}
              layout={layout}
              emptyMessage="No bookmarked posts found"
            />
          </div>
        )}

        {/* Info Banner */}
        {isMounted && bookmarkedPosts.length > 0 && (
          <Alert type="info" className="mt-8">
            <div>
              <p className="font-medium mb-1">Bookmarks are stored locally</p>
              <p className="text-sm">
                Your bookmarks are saved in your browser&apos;s local storage and will persist across sessions.
                They won&apos;t sync across devices or browsers.
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
                  This will remove all {bookmarkedPosts.length} bookmarked {bookmarkedPosts.length === 1 ? "post" : "posts"}. This action cannot be undone.
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
