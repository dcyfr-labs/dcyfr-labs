"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";
import { trackToCClick } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, Tag, Share2, Bookmark, BookOpen, ChevronRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Post } from "@/data/posts";

interface BlogPostSidebarProps {
  headings: TocHeading[];
  slug?: string;
  metadata?: {
    publishedAt: Date;
    readingTime: string;
    viewCount?: number;
    tags?: string[];
  };
  postTitle?: string;
  series?: {
    name: string;
    order: number;
  };
  seriesPosts?: Post[];
  relatedPosts?: Post[];
}

/**
 * Blog Post Sidebar Component
 * 
 * Left-aligned sidebar for blog post pages containing table of contents
 * and other post-related navigation/metadata.
 * 
 * Features:
 * - Post metadata (date, reading time, views, tags)
 * - Quick actions (share, bookmark)
 * - Series navigation (if part of a series)
 * - Related posts suggestions
 * - Table of contents with active heading tracking
 * - Sticky positioning within viewport
 * - Hierarchical heading display (h2/h3)
 * - Smooth scroll navigation
 */
export function BlogPostSidebar({ headings, slug, metadata, postTitle, series, seriesPosts, relatedPosts }: BlogPostSidebarProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // Check if post is bookmarked on mount
  React.useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    const bookmarks = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]");
    setIsBookmarked(bookmarks.includes(slug));
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = postTitle || "Check out this article";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // Fallback to copy
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
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

  React.useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 1.0,
      }
    );

    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, heading: TocHeading) => {
    e.preventDefault();
    
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    if (slug) {
      trackToCClick(slug, heading.text, heading.level);
    }

    window.history.pushState(null, "", `#${id}`);
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Post Metadata */}
        {metadata && (
          <div className="space-y-3 pb-6 border-b">
            <h2 className="font-semibold mb-3 text-sm">Post Details</h2>
            
            {/* Published Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <time dateTime={metadata.publishedAt.toISOString()}>
                {metadata.publishedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </time>
            </div>
            
            {/* Reading Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{metadata.readingTime}</span>
            </div>
            
            {/* View Count */}
            {typeof metadata.viewCount === "number" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 shrink-0" />
                <span>{metadata.viewCount.toLocaleString()} {metadata.viewCount === 1 ? "view" : "views"}</span>
              </div>
            )}
            
            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="space-y-2 pb-6 border-b">
          <h2 className="font-semibold mb-3 text-sm">Quick Actions</h2>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleBookmark}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
        </div>
        
        {/* Series Navigation */}
        {series && seriesPosts && seriesPosts.length > 0 && (
          <div className="space-y-3 pb-6 border-b">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">{series.name}</h2>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">
              Part {series.order} of {seriesPosts.length}
            </p>
            
            <nav aria-label="Series navigation" className="space-y-1.5">
              {seriesPosts.map((post) => {
                const isCurrent = post.slug === slug;
                const order = post.series?.order ?? 0;

                return (
                  <div key={post.slug} className="flex items-start gap-2">
                    <Badge 
                      variant="outline" 
                      className="mt-0.5 shrink-0 min-w-6 h-5 text-xs justify-center px-1"
                    >
                      {order}
                    </Badge>
                    
                    {isCurrent ? (
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-primary block truncate">
                          {post.title}
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex-1 min-w-0 group flex items-start gap-1"
                      >
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
                          {post.title}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
        
        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="space-y-3 pb-6 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Related Posts</h2>
            </div>
            
            <nav aria-label="Related posts" className="space-y-3">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{post.readingTime.text}</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{post.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        )}
        
        {/* Table of Contents */}
        <div>
          <h2 className="font-semibold mb-3 text-sm">On this page</h2>
          <nav aria-label="Table of contents">
            <ul className="space-y-2 text-sm">
              {headings.map((heading) => {
                const isActive = activeId === heading.id;
                const isH3 = heading.level === 3;

                return (
                  <li key={heading.id} className={cn(isH3 && "ml-4")}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleClick(e, heading.id, heading)}
                      className={cn(
                        "block py-1 transition-colors hover:text-foreground",
                        isActive
                          ? "text-foreground font-medium border-l-2 border-primary pl-3 -ml-0.5"
                          : "text-muted-foreground hover:underline"
                      )}
                    >
                      {heading.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}
