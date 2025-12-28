"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Eye, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectStatus } from "@/data/projects";
import { ARCHIVE_CARD_VARIANTS, ARCHIVE_ANIMATIONS, TYPOGRAPHY, SEMANTIC_COLORS, IMAGE_PLACEHOLDER } from "@/lib/design-tokens";
import { cn, formatNumber } from "@/lib/utils";

// Human-readable status labels
const STATUS_LABEL: Record<ProjectStatus, string> = {
  "active": "Active",
  "in-progress": "In Progress",
  "archived": "Archived",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  "active": cn(SEMANTIC_COLORS.alert.success.container, SEMANTIC_COLORS.alert.success.text, "border-green-500/20"),
  "in-progress": cn(SEMANTIC_COLORS.alert.info.container, SEMANTIC_COLORS.alert.info.text, "border-primary/20"),
  "archived": "bg-muted/50 text-muted-foreground border-border",
};

interface ModernProjectCardProps {
  project: Project;
  viewCount?: number;
  variant?: "elevated" | "background" | "sideBySide";
  showActions?: boolean;
  index?: number;
}

/**
 * Modern Project Card Component
 *
 * Next-generation project card with elevated images and modern design.
 * Fixes washed-out image issue with prominent image display.
 *
 * Features:
 * - Elevated image on top (default) - images pop from the page
 * - View counts and status indicators
 * - Framer Motion animations
 * - Multiple layout variants
 * - Hover states with scale and shadow effects
 *
 * @example
 * ```tsx
 * <ModernProjectCard
 *   project={project}
 *   variant="elevated"
 *   viewCount={256}
 * />
 * ```
 */
export function ModernProjectCard({
  project,
  viewCount,
  variant = "elevated",
  showActions = true,
  index = 0,
}: ModernProjectCardProps) {
  const cardVariant = ARCHIVE_CARD_VARIANTS[variant];

  // Elevated variant (default - recommended)
  if (variant === "elevated") {
    const elevatedVariant = ARCHIVE_CARD_VARIANTS.elevated;
    return (
      <motion.article
        variants={ARCHIVE_ANIMATIONS.item}
        whileHover={ARCHIVE_ANIMATIONS.cardHover}
        className={elevatedVariant.container}
      >
        {/* Hero Image Section - Prominent, not washed out */}
        {project.image && (
          <div className={elevatedVariant.imageWrapper}>
            <Link href={`/work/${project.slug}`}>
              <Image
                src={project.image.url}
                alt={project.image.alt}
                fill
                className={elevatedVariant.image}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                placeholder="blur"
                blurDataURL={IMAGE_PLACEHOLDER.blur}
              />
            </Link>

            {/* Subtle gradient only at bottom for badges */}
            <div className={elevatedVariant.overlay} />

            {/* Status badge floats over image */}
            <div className={elevatedVariant.badgeContainer}>
              {project.status && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    elevatedVariant.badge,
                    STATUS_COLORS[project.status]
                  )}
                >
                  {STATUS_LABEL[project.status]}
                </Badge>
              )}
            </div>

            {/* External link indicator - top right */}
            {showActions && project.links && project.links.length > 0 && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <a
                  href={project.links[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-white/90 dark:bg-black/90 backdrop-blur-md hover:bg-white dark:hover:bg-black px-3 py-1.5 rounded-md text-xs transition-colors"
                  aria-label={`View ${project.title}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">View</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Content section - clean white space */}
        <Link href={`/work/${project.slug}`}>
          <div className={elevatedVariant.content}>
            {/* Metadata row */}
            <div className={cn("flex items-center gap-3 text-xs flex-wrap",
              project.image ? 'text-white/70' : 'text-muted-foreground'
            )}>
              {project.timeline && (
                <>
                  <time className="uppercase tracking-wide">{project.timeline}</time>
                  <span aria-hidden="true">•</span>
                </>
              )}

              {/* View count with icon */}
              {viewCount !== undefined && viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(viewCount)}
                </span>
              )}

              {/* Category if available */}
              {project.category && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="capitalize">{project.category}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className={cn(TYPOGRAPHY.h2.standard, "font-bold line-clamp-2 transition-colors",
              project.image ? 'text-white group-hover:text-white/90' : 'text-foreground group-hover:text-primary'
            )}>
              {project.title}
            </h3>

            {/* Description */}
            <p className={cn("line-clamp-3 text-sm leading-relaxed",
              project.image ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {project.description}
            </p>

            {/* Tech stack */}
            {project.tech && project.tech.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.tech.slice(0, 4).map((tech) => (
                  <Badge 
                    key={tech} 
                    variant="outline" 
                    className={cn("text-xs",
                      project.image 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'text-foreground'
                    )}
                  >
                    {tech}
                  </Badge>
                ))}
                {project.tech.length > 4 && (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs",
                      project.image 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'text-foreground'
                    )}
                  >
                    +{project.tech.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>
      </motion.article>
    );
  }

  // Background variant - with lighter overlay
  if (variant === "background") {
    return (
      <motion.article
        variants={ARCHIVE_ANIMATIONS.item}
        whileHover={ARCHIVE_ANIMATIONS.cardHover}
        className={cardVariant.container}
      >
        {/* Background image with lighter overlay */}
        {project.image && (
          <div className={cardVariant.imageWrapper}>
            <Image
              src={project.image.url}
              alt={project.image.alt}
              fill
              className={cardVariant.image}
              sizes="(max-width: 768px) 100vw, 100vw"
              priority={index === 0}
              placeholder="blur"
              blurDataURL={IMAGE_PLACEHOLDER.blur}
            />
            {/* Lighter overlay - 20-60% instead of 75-95% */}
            <div className={cardVariant.overlay} />
          </div>
        )}

        {/* Content - anchored to bottom with glass effect */}
        <Link href={`/work/${project.slug}`}>
          <div className={cardVariant.content}>
            {/* Status badge */}
            {project.status && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs mb-3 backdrop-blur-md bg-white/20 border-white/30 text-white",
                  STATUS_COLORS[project.status]
                )}
              >
                {STATUS_LABEL[project.status]}
              </Badge>
            )}

            {/* Glass card for content */}
            <div className={cardVariant.glassCard}>
              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-foreground/70 mb-3">
                {project.timeline && (
                  <>
                    <time className="uppercase tracking-wide">{project.timeline}</time>
                    <span>•</span>
                  </>
                )}
                {viewCount !== undefined && viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(viewCount)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={cn(TYPOGRAPHY.h2.mdx, "font-bold mb-2 line-clamp-2 text-foreground")}>
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-foreground/70 line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Side-by-side variant
  return (
    <motion.article
      variants={ARCHIVE_ANIMATIONS.item}
      className={cardVariant.container}
    >
      {/* Image on left */}
      {project.image && (
        <div className={cardVariant.imageWrapper}>
          <Link href={`/work/${project.slug}`}>
            <Image
              src={project.image.url}
              alt={project.image.alt}
              fill
              className={cardVariant.image}
              sizes="192px"
              placeholder="blur"
              blurDataURL={IMAGE_PLACEHOLDER.blur}
            />
          </Link>
        </div>
      )}

      {/* Content on right */}
      <Link href={`/work/${project.slug}`} className="flex-1">
        <div className={cardVariant.content}>
          {/* Status badge */}
          {project.status && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs mb-2",
                STATUS_COLORS[project.status]
              )}
            >
              {STATUS_LABEL[project.status]}
            </Badge>
          )}

          {/* Title */}
          <h3 className={cn(TYPOGRAPHY.h3.mdx, "mb-2 line-clamp-2")}>
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-auto">
            {project.description}
          </p>

          {/* Metadata footer */}
          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {project.timeline && (
                <time className="uppercase tracking-wide">{project.timeline}</time>
              )}
            </div>

            {/* Tech stack preview */}
            {project.tech && project.tech.length > 0 && (
              <div className="flex gap-1">
                {project.tech.slice(0, 2).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
