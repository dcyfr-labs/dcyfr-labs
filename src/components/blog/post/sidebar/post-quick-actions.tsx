"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Link2, Linkedin, BookOpen, Heart } from "lucide-react";
import { toast } from "sonner";
import { AUTHOR_NAME, SITE_TITLE_PLAIN } from "@/lib/site-config";
import { SPACING } from "@/lib/design-tokens";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useShare } from "@/hooks/use-share";
import { useActivityReactions } from "@/hooks/use-activity-reactions";

interface PostQuickActionsProps {
  slug?: string;
  postTitle?: string;
  publishedAt?: string;
}

/**
 * Post Quick Actions Section
 * 
 * Provides bookmark, share, copy link, copy IEEE citation, and LinkedIn share buttons.
 */
export function PostQuickActions({ slug, postTitle, publishedAt }: PostQuickActionsProps) {
  const { isBookmarked, toggle, getBookmarkCount } = useBookmarks();
  const { getShareCount } = useShare();
  const { isLiked, toggleLike, getCount } = useActivityReactions();
  const [isHydrated, setIsHydrated] = React.useState(false);
  
  // Use same activity ID format as PostInteractions: "blog-{slug}"
  const activityId = slug ? `blog-${slug}` : undefined;
  
  const bookmarked = isHydrated && activityId ? isBookmarked(activityId) : false;
  const bookmarkCount = isHydrated && activityId ? getBookmarkCount(activityId) : 0;
  const shareCount = isHydrated && activityId ? getShareCount(activityId) : 0;
  const liked = isHydrated && activityId ? isLiked(activityId) : false;
  const likeCount = isHydrated && activityId ? getCount(activityId) : 0;

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = postTitle || "Check out this article";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href);
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(window.location.href);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const handleBookmark = () => {
    if (!activityId) return;
    
    toggle(activityId);
    toast.success(bookmarked ? "Bookmark removed" : "Bookmarked for later");
  };

  const handleLike = () => {
    if (!activityId) return;
    
    toggleLike(activityId);
    toast.success(liked ? "Like removed" : "Liked!");
  };

  const generateIEEECitation = (): string => {
    const url = window.location.href;
    const date = publishedAt ? new Date(publishedAt) : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    // IEEE format: [#] Initial(s). Surname, "Article title," Website Name, Month Day, Year. [Online]. Available: URL. [Accessed: Month Day, Year].
    const citation = `[1] ${AUTHOR_NAME}, "${postTitle}," ${SITE_TITLE_PLAIN}, ${formattedDate}. [Online]. Available: ${url}. [Accessed: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}].`;
    
    return citation;
  };

  const handleCopyIEEECitation = async () => {
    try {
      const citation = generateIEEECitation();
      await navigator.clipboard.writeText(citation);
      toast.success("Citation copied to clipboard!");
    } catch {
      toast.error("Failed to copy citation");
    }
  };

  return (
    <div className={`${SPACING.compact} pb-6 border-b`}>
      <h2 className="font-semibold mb-3 text-sm">Quick Actions</h2>

      {/* Like Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleLike}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-destructive text-destructive")} />
        {liked ? "Liked" : "Like"}
        {likeCount > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{likeCount}</span>
        )}
      </Button>

      {/* Bookmark Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleBookmark}
      >
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        {bookmarked ? "Bookmarked" : "Bookmark"}
        {bookmarkCount > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{bookmarkCount}</span>
        )}
      </Button>

      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        Share Post
        {shareCount > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{shareCount}</span>
        )}
      </Button>

      {/* Copy Link Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleCopyLink}
      >
        <Link2 className="h-4 w-4" />
        Copy Link
      </Button>

      {/* Citation Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleCopyIEEECitation}
        title="Copy webpage citation"
      >
        <BookOpen className="h-4 w-4" />
        Copy Citation
      </Button>

      {/* Share on LinkedIn Button 
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleLinkedInShare}
      >
        <Linkedin className="h-4 w-4" />
        Share on LinkedIn
      </Button> */}
    </div>
  );
}
