"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Share2, Bookmark, Link2, Linkedin, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { AUTHOR_NAME, SITE_TITLE_PLAIN } from "@/lib/site-config";

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
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // Check if post is bookmarked on mount
  React.useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    const bookmarks = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]");
    setIsBookmarked(bookmarks.includes(slug));
  }, [slug]);

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
    if (!slug) return;
    
    const bookmarks = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]");
    const newBookmarks = isBookmarked
      ? bookmarks.filter((s: string) => s !== slug)
      : [...bookmarks, slug];
    
    localStorage.setItem("bookmarked-posts", JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Bookmark removed" : "Bookmarked for later");
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
    <div className="space-y-2 pb-6 border-b">
      <h2 className="font-semibold mb-3 text-sm">Quick Actions</h2>

      {/* Bookmark Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleBookmark}
      >
        <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
        {isBookmarked ? "Bookmarked" : "Bookmark"}
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
