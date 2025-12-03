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
 * @param {string} [props.basePath='/work'] - Base path for project URLs
 * 
 * @example
 * ```tsx
 * <OtherProjectCard project={projectData} basePath="/work" />
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
  project,
  basePath = '/work',
}: { 
  project: Project;
  basePath?: string;
}) {
  // Always ensure we have an image (custom or default)
  const image = ensureProjectImage(project.image, {
    tags: project.tags,
    tech: project.tech,
  });

  return (
    <Link
      href={`${basePath}/${project.slug}`}
      className="group block"
    >
      <Card className={cn("h-full overflow-hidden relative flex flex-col", HOVER_EFFECTS.card)}>
        {/* Content */}
        <CardContent className="pt-4">
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
