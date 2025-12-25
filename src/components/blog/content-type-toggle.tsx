"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION } from "@/lib/design-tokens";

export type ContentType = "posts" | "series";

interface ContentTypeToggleProps {
  /** Current content type */
  current: ContentType;
  /** Show item counts */
  counts?: {
    posts: number;
    series: number;
  };
  /** Custom className */
  className?: string;
}

/**
 * Content Type Toggle Component
 *
 * Allows users to switch between viewing blog posts and series.
 * Replaces the separate /blog/series page with an integrated filter.
 *
 * Features:
 * - Smooth animated transitions
 * - Item counts for each type
 * - URL parameter synchronization
 * - Keyboard accessible
 * - Mobile-optimized touch targets
 *
 * @example
 * ```tsx
 * <ContentTypeToggle
 *   current="posts"
 *   counts={{ posts: 42, series: 8 }}
 * />
 * ```
 */
export function ContentTypeToggle({
  current,
  counts,
  className,
}: ContentTypeToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTypeChange = (type: ContentType) => {
    if (type === current) return;

    const params = new URLSearchParams(searchParams.toString());

    if (type === "series") {
      params.set("type", "series");
    } else {
      params.delete("type");
    }

    // Reset to first page when changing type
    params.delete("page");

    const query = params.toString();
    router.push(`/blog${query ? `?${query}` : ""}`);
  };

  const options = [
    {
      value: "posts" as const,
      label: "Posts",
      icon: FileText,
      count: counts?.posts,
    },
    {
      value: "series" as const,
      label: "Series",
      icon: Layers,
      count: counts?.series,
    },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg bg-muted/50 border",
        className
      )}
      role="tablist"
      aria-label="Content type"
    >
      {options.map((option) => {
        const isActive = current === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${option.value}-panel`}
            onClick={() => handleTypeChange(option.value)}
            className={cn(
              "relative px-4 py-2 rounded-md text-sm transition-colors",
              "font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "min-h-[44px] md:min-h-[36px]", // Touch target
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              ANIMATION.transition.theme
            )}
          >
            {/* Animated background */}
            {isActive && (
              <motion.div
                layoutId="content-type-bg"
                className="absolute inset-0 bg-background border shadow-sm rounded-md"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{option.label}</span>
              {option.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
