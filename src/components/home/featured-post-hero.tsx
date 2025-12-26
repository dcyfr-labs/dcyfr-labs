"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import type { Post } from "@/data/posts";
import { TYPOGRAPHY, SPACING, ANIMATION } from "@/lib/design-tokens";
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
      <div className={cn(
        "group relative overflow-hidden rounded-xl border shadow-lg"
      )}>
        {/* Accent bar with glow effect */}
        <div
          className={cn("absolute inset-x-0 top-0 h-1 z-20 rounded-t-xl group-hover:h-1.5 group-hover:shadow-lg bg-primary", ANIMATION.transition.base)}
        />
        
        {/* Background image - fills entire container */}
        {post.image && !post.image.hideCard && (
          <div className="absolute inset-0 z-0">
            <Image
              src={post.image.url}
              alt={post.image.alt || post.title}
              fill
              className={cn("object-cover", ANIMATION.transition.slow)}
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
            {/* Dark overlay for text contrast */}
            <div className={cn("absolute inset-0 bg-linear-to-b from-background/45 via-background/70 to-background/95", ANIMATION.transition.appearance)} />
          </div>
        )}
        
        <div className={cn("relative z-10 p-4 md:p-8", SPACING.content)}>
          {/* Featured Badge */}
          <div className="flex items-center gap-4">
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
          <div className="space-y-2 md:space-y-3">
            <h2 className={cn(TYPOGRAPHY.h2.featured, "md:text-4xl text-foreground")}>
              {post.title}
            </h2>
            {post.subtitle && (
              <p className="text-base md:text-lg lg:text-xl text-foreground/80 font-medium">
                {post.subtitle}
              </p>
            )}
            <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
              {post.summary}
            </p>
          </div>

          {/* Metadata & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-3 md:pt-4">
            <div className="flex items-center gap-4 text-sm">
              <time dateTime={post.publishedAt} className="text-foreground/60">{publishedDate}</time>
              <span className="flex items-center gap-1 text-foreground/60">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime.text}
              </span>
            </div>
            
            <div className={cn("inline-flex items-center gap-1 text-primary font-medium hover:underline group-hover:gap-2", ANIMATION.transition.base)}>
              Read post
              <ArrowRight className={cn("h-4 w-4 group-hover:translate-x-1", ANIMATION.transition.movement)} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
