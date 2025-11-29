"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Eye } from "lucide-react";
import { Project, ProjectStatus } from "@/data/projects";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, sanitizeUrl, formatNumber } from "@/lib/utils";
import { ensureProjectImage } from "@/lib/default-project-images";
import { HOVER_EFFECTS } from "@/lib/design-tokens";

const STATUS_VARIANT: Record<ProjectStatus, "secondary" | "default" | "outline"> = {
  "active": "default",
  "in-progress": "default",
  "archived": "outline",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  "active": "Active",
  "in-progress": "In progress",
  "archived": "Archived",
};

/**
 * ProjectCard Component
 * 
 * Displays a portfolio project card in archive view with link to detail page.
 * The entire card is clickable and links to the project detail page.
 * 
 * ⚠️ SKELETON SYNC REQUIRED
 * When updating this component's structure, also update:
 * - src/components/project-card-skeleton.tsx
 * 
 * Key structural elements that must match:
 * - Link wrapper: block, group styling for hover effects
 * - Card: flex, h-full, relative positioning, overflow-hidden
 * - CardHeader: space-y-1.5, px-4 sm:px-6, py-4 sm:py-5, z-10
 *   - Timeline (optional, text-xs with status badge)
 *   - Title (text-base sm:text-lg md:text-xl)
 *   - Description (CardDescription)
 *   - Tech Stack (flex-wrap, gap-1.5, Badge variant="outline", max 3 shown)
 * - CardFooter: flex-row, gap-2 sm:gap-3, px-4 sm:px-6, py-3 sm:py-4
 *   - External project links only (no View Details button)
 * 
 * @component
 * 
 * Mobile Optimizations:
 * - Full-width card is tappable/clickable
 * - Enhanced padding and spacing for better readability
 * 
 * Desktop Features:
 * - Hover effects on entire card
 * - Optimized spacing for larger screens
 * 
 * @param {Object} props - Component props
 * @param {Project} props.project - Project data object
 * 
 * @example
 * ```tsx
 * <ProjectCard project={projectData} />
 * ```
 * 
 * Accessibility:
 * - Entire card is keyboard accessible via Link
 * - Semantic HTML with proper heading hierarchy
 * - External links indicate opening in new tab
 * 
 * Related Components:
 * - Card components from @/components/ui/card
 * - Badge from @/components/ui/badge
 * - ProjectCardSkeleton from @/components/project-card-skeleton
 * 
 * @see {@link /docs/components/project-card.md} for detailed documentation
 * @see {@link /docs/components/skeleton-sync-strategy.md} for skeleton sync guidelines
 */
export function ProjectCard({ 
  project,
  viewCount
}: { 
  project: Project;
  viewCount?: number;
}) {
  const router = useRouter();
  
  // Always ensure we have an image (custom or default)
  const image = ensureProjectImage(project.image, {
    tags: project.tags,
    tech: project.tech,
  });
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't navigate if clicking on an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) {
      return;
    }
    router.push(`/portfolio/${project.slug}`);
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className="block group cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/portfolio/${project.slug}`);
        }
      }}
    >
      <Card className={cn("flex h-full flex-col overflow-hidden relative holo-card holo-card-3d", HOVER_EFFECTS.card)}>
        {/* Background Image - always present now (custom or default) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className={cn(
              "object-cover holo-image-shift",
              image.position && `object-${image.position}`
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 holo-gradient-dark group-hover:holo-gradient-dark-hover transition-all duration-300" />
        </div>
        
        {/* Subtle shine effect */}
        <div className="holo-shine" />

        {/* Content - positioned above background */}
        <CardHeader className="space-y-1.5 relative z-10 px-4 sm:px-6 py-4 sm:py-5">
          {project.timeline && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[project.status]}>{STATUS_LABEL[project.status]}</Badge> {project.timeline}
              {viewCount !== undefined && viewCount > 0 && (
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{formatNumber(viewCount)}</span>
                </span>
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base sm:text-lg md:text-xl flex align-middle gap-2">
             {project.title}
            </CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base md:text-[0.95rem] leading-relaxed">
            {project.description}
          </CardDescription>
          {project.tech && project.tech.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.tech.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="outline" className="font-normal text-xs sm:text-sm">
                  {tech}
                </Badge>
              ))}
              {project.tech.length > 3 && (
                <Badge variant="outline" className="font-normal text-xs sm:text-sm">
                  +{project.tech.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
