"use client";

import Link from "next/link";
import Image from "next/image";
import { Project } from "@/data/projects";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ensureProjectImage } from "@/lib/default-project-images";
import { HOVER_EFFECTS, TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * OtherProjectCard Component
 * 
 * Displays a compact project card used in the "Other Projects" section of project detail pages.
 * Features a clickable card with hover effects and project preview image.
 * 
 * @component
 * 
 * Features:
 * - Responsive aspect-ratio image with zoom on hover
 * - Consistent hover effects matching main ProjectCard
 * - Optimized for grid layouts
 * - Image optimization with Next.js Image component
 * 
 * @param {Object} props - Component props
 * @param {Project} props.project - Project data object
 * 
 * @example
 * ```tsx
 * <OtherProjectCard project={projectData} />
 * ```
 * 
 * Accessibility:
 * - Entire card is keyboard accessible via Link
 * - Semantic HTML with proper heading hierarchy
 * - Alt text for images
 * 
 * Related Components:
 * - ProjectCard from @/components/project-card (main archive view)
 * - Card components from @/components/ui/card
 * 
 * @see {@link /docs/components/project-card.md} for detailed documentation
 */
export function OtherProjectCard({ 
  project 
}: { 
  project: Project;
}) {
  // Always ensure we have an image (custom or default)
  const image = ensureProjectImage(project.image, {
    tags: project.tags,
    tech: project.tech,
  });

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block"
    >
      <Card className={cn("h-full overflow-hidden relative flex flex-col holo-card holo-card-3d", HOVER_EFFECTS.card)}>
        {/* Background Image with gradient overlay - matches main ProjectCard style */}
        <div className="absolute inset-0 z-0">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className={cn(
              "object-cover holo-image-shift",
              image.position && `object-${image.position}`
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 holo-gradient-dark group-hover:holo-gradient-dark-hover transition-all duration-300" />
        </div>
        
        {/* Subtle shine effect */}
        <div className="holo-shine" />
        
        {/* Content positioned above background */}
        <CardContent className="pt-4 relative z-10">
          <h3 className={`${TYPOGRAPHY.h3.standard} mb-2`}>
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
