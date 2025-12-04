"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import type { Post } from "@/data/posts";
import { HOVER_EFFECTS, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface FeaturedPostHeroProps {
  post: Post;
}

/**
 * FeaturedPostHero Component
 *
 * Large hero card showcasing a featured blog post.
 * Designed to be visually prominent on the homepage between
 * the hero section and regular post listings.
 *
 * Features:
 * - Large, prominent card design
 * - Featured tag badge
 * - Post metadata (date, reading time)
 * - Tag display with clickable links
 * - Clear call-to-action button
 * - Responsive layout (stacks on mobile, horizontal on desktop)
 * - Dark mode support
 * - Hover effects for interactivity
 *
 * @component
 * @param {FeaturedPostHeroProps} props - Component props
 * @param {Post} props.post - Featured post to display
 *
 * @example
 * const featuredPost = posts.find(p => p.featured);
 * if (featuredPost) {
 *   <FeaturedPostHero post={featuredPost} />
 * }
 *
 * @accessibility
 * - Semantic HTML with proper heading levels
 * - ARIA labels on interactive elements
 * - Keyboard navigable
 * - Screen reader friendly dates
 *
 * @styling
 * - Uses Card component for consistent design
 * - Gradient border for visual emphasis
 * - Hover scale effect for interactivity
 * - Responsive padding and spacing
 */
export function FeaturedPostHero({ post }: FeaturedPostHeroProps) {
  const router = useRouter();
  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className={`group relative overflow-hidden border-2 ${HOVER_EFFECTS.cardFeatured}`}>
        {/* Background Image with gradient overlay - matches project card style */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-background/60 via-background/70 to-background/80 transition-opacity duration-300 group-hover:from-background/50 group-hover:via-background/60 group-hover:to-background/70" />
        </div>
        
        <div className="relative z-10 p-5 space-y-4">
          {/* Featured Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className={cn("text-xs", "font-medium")}>
              Featured
            </Badge>
            {post.tags.slice(0, 2).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/blog?tag=${encodeURIComponent(tag)}`);
                }}
                className="cursor-pointer"
              >
                <Badge 
                  variant="outline" 
                  className="text-xs hover:bg-accent transition-colors cursor-pointer"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>

          {/* Title & Summary */}
          <div className="space-y-2">
            <h2 className={cn(TYPOGRAPHY.h2.featured, "md:text-4xl")}>
              {post.title}
            </h2>
            {post.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground font-medium">
                {post.subtitle}
              </p>
            )}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.summary}
            </p>
          </div>

          {/* Metadata & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={post.publishedAt}>{publishedDate}</time>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime.text}
              </span>
            </div>
            
            <div className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
              Read post
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
