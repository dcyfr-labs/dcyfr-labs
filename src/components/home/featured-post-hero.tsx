"use client";

import { useState } from "react";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Calculate tilt values (subtle effect)
  const tiltX = isHovered ? (mousePosition.y - 0.5) * -8 : 0;
  const tiltY = isHovered ? (mousePosition.x - 0.5) * 8 : 0;

  return (
    <Link href={`/blog/${post.slug}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border shadow-lg",
          ANIMATION.transition.base
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        style={{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: 'transform 0.2s ease-out',
          willChange: isHovered ? 'transform' : 'auto',
        }}
      >
        {/* Animated gradient glow following mouse */}
        <div
          className={cn("absolute inset-0 z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", ANIMATION.duration.normal)}
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, hsl(var(--primary) / 0.1), transparent 40%)`,
          }}
        />

        {/* Animated border gradient */}
        <div
          className={cn("absolute inset-0 z-20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", ANIMATION.duration.normal)}
          style={{
            background: `linear-gradient(${Math.atan2(mousePosition.y - 0.5, mousePosition.x - 0.5) * (180 / Math.PI)}deg, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.2), transparent)`,
            maskImage: 'linear-gradient(black, black) padding-box, linear-gradient(black, black)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '2px',
          }}
        />

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
            {/* Dark overlay for text contrast - modern pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
          </div>
        )}
        
        <div className={cn("relative z-10 p-4 md:p-8", SPACING.content)}>
          {/* Featured Badge */}
          <div className="flex items-center gap-4">
            <Badge 
              variant="default" 
              className={cn(TYPOGRAPHY.label.xs, "backdrop-blur-sm", 
                post.image && post.image.url && !post.image.hideCard 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/10 text-foreground border border-border/40'
              )}
            >
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
                  className={cn("text-xs backdrop-blur-sm transition-colors cursor-pointer",
                    post.image && post.image.url && !post.image.hideCard 
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>

          {/* Title & Summary */}
          <div className="space-y-2 md:space-y-3">
            <h2 className={cn(TYPOGRAPHY.h2.featured, "md:text-4xl", 
              post.image && post.image.url && !post.image.hideCard 
                ? 'text-white' 
                : 'text-foreground'
            )}>
              {post.title}
            </h2>
            {post.subtitle && (
              <p className={cn(TYPOGRAPHY.h3.standard,
                post.image && post.image.url && !post.image.hideCard 
                  ? 'text-white/80' 
                  : 'text-foreground/80'
              )}>
                {post.subtitle}
              </p>
            )}
            <p className={cn(TYPOGRAPHY.description,
              post.image && post.image.url && !post.image.hideCard 
                ? 'text-white/80' 
                : 'text-foreground/70'
            )}>
              {post.summary}
            </p>
          </div>

          {/* Metadata & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-3 md:pt-4">
            <div className={cn("flex items-center gap-4 text-sm",
              post.image && post.image.url && !post.image.hideCard 
                ? 'text-white/70' 
                : 'text-foreground/60'
            )}>
              <time dateTime={post.publishedAt}>{publishedDate}</time>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime.text}
              </span>
            </div>
            
            <div className={cn("inline-flex items-center gap-1 font-medium hover:underline group-hover:gap-2", 
              ANIMATION.transition.base,
              post.image && post.image.url && !post.image.hideCard 
                ? 'text-white' 
                : 'text-primary'
            )}>
              Read post
              <ArrowRight className={cn("h-4 w-4 group-hover:translate-x-1", ANIMATION.transition.movement)} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
