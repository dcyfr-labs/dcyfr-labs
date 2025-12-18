"use client";

import * as React from "react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { PostList } from "@/components/blog/post/post-list";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layouts/page-hero";
import { AlertCircle, Trash2, BookmarkX } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS, CONTAINER_WIDTHS, CONTAINER_PADDING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
  const { bookmarks, clearBookmarks, count } = useBookmarks();
  const [layout] = React.useState<"grid" | "list" | "magazine" | "compact">("magazine");
  const [isMounted, setIsMounted] = React.useState(false);

  // Filter posts to only show bookmarked ones
  const bookmarkedPosts = React.useMemo(() => {
    return posts.filter(post => bookmarks.includes(post.slug));
  }, [posts, bookmarks]);

  // Prevent hydration mismatch by only showing client-only content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClearAll = () => {
    if (window.confirm(`Clear all ${count} bookmarked ${count === 1 ? "post" : "posts"}? This action cannot be undone.`)) {
      clearBookmarks();
      toast.success("All bookmarks cleared");
    }
  };

  // Show loading state during SSR/initial render
  if (!isMounted) {
    return (
      <>
        <PageHero
          title="Bookmarks"
          description="Your saved blog posts for later reading"
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
        description="Your saved blog posts for later reading"
      />

      {/* Dynamic Count and Actions */}
      {count > 0 && (
        <div className={cn("mx-auto flex items-center justify-between gap-4 -mt-6 mb-8", CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
          <p className={TYPOGRAPHY.metadata}>
            {count} {count === 1 ? "post" : "posts"} saved for later
          </p>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {/* Post List or Empty State */}
      <div className={cn("mx-auto", CONTAINER_WIDTHS.standard, CONTAINER_PADDING)}>
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BookmarkX className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className={TYPOGRAPHY.h2.standard}>No bookmarks yet</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Bookmark posts you want to read later by clicking the bookmark icon on any post card.
            </p>
            <Button asChild>
              <Link href="/blog">
                Browse Blog Posts
              </Link>
            </Button>
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
        {count > 0 && (
          <div className={cn("mt-8 p-4 rounded-lg border flex items-start gap-3", SEMANTIC_COLORS.alert.info.container, SEMANTIC_COLORS.alert.info.border)}>
            <AlertCircle className={cn("h-5 w-5 shrink-0 mt-0.5", SEMANTIC_COLORS.alert.info.icon)} />
            <div className="text-sm">
              <p className={cn("font-medium mb-1", SEMANTIC_COLORS.alert.info.label)}>Bookmarks are stored locally</p>
              <p className={SEMANTIC_COLORS.alert.info.text}>
                Your bookmarks are saved in your browser&apos;s local storage and will persist across sessions.
                They won&apos;t sync across devices or browsers.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
