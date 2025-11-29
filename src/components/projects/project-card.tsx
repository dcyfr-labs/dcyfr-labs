"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Eye } from "lucide-react";
import { Project, ProjectStatus } from "@/data/projects";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, sanitizeUrl, formatNumber } from "@/lib/utils";
import { ensureProjectImage } from "@/lib/default-project-images";
import { HOVER_EFFECTS } from "@/lib/design-tokens";

// Human-readable status labels
const STATUS_LABEL: Record<ProjectStatus, string> = {
  "active": "Active",
  "in-progress": "In progress",
  "archived": "Archived",
};

// Status badge color styles - matching homepage activity badges
const STATUS_STYLES: Record<ProjectStatus, string> = {
  active:
    "border-green-500/70 bg-green-500/50 backdrop-blur-sm font-semibold text-white",
  "in-progress":
    "border-blue-500/70 bg-blue-500/50 backdrop-blur-sm font-semibold text-white",
  archived:
    "border-amber-500/70 bg-amber-500/50 backdrop-blur-sm font-semibold text-white",
};

export interface ProjectCardProps {
  /** Project data - omit for skeleton loading state */
  project?: Project;
  /** View count for the project */
  viewCount?: number;
  /** Loading state - renders skeleton version */
  loading?: boolean;
}

/**
 * ProjectCard Component
 * 
 * @deprecated **Currently unused** - The `/portfolio` page uses `ProjectList` which renders 
 * cards inline with multiple layout variants. Consider using `ProjectList` for archive views
 * or `OtherProjectCard` for compact card displays. This component is retained for potential
 * future use (e.g., homepage featured projects section).
 * 
 * Displays a portfolio project card in archive view with link to detail page.
 * The entire card is clickable and links to the project detail page.
 * 
 * **Loading State Support:**
 * Pass `loading={true}` to render skeleton version automatically. This ensures
 * the skeleton is always in sync with the actual component structure.
 * 
 * Key structural elements (auto-synced with skeleton):
 * - Wrapper: block, group, cursor-pointer styling
 * - Card: flex, h-full, relative positioning, overflow-hidden
 * - CardHeader: space-y-1.5, px-4 sm:px-6, py-4 sm:py-5, z-10
 *   - Timeline (optional, text-xs with status badge)
 *   - Title (text-base sm:text-lg md:text-xl)
 *   - Description (CardDescription)
 *   - Tech Stack (flex-wrap, gap-1.5, Badge variant="outline", max 3 shown)
 * 
 * @example Standard usage
 * ```tsx
 * <ProjectCard project={projectData} />
 * ```
 * 
 * @example Loading state
 * ```tsx
 * <ProjectCard loading />
 * ```
 * 
 * @example In a list with loading state
 * ```tsx
 * {isLoading 
 *   ? Array.from({ length: 3 }).map((_, i) => <ProjectCard key={i} loading />)
 *   : projects.map(p => <ProjectCard key={p.slug} project={p} />)
 * }
 * ```
 * 
 * @see {@link /docs/components/skeleton-sync-strategy.md} for skeleton sync guidelines
 * @see ProjectList - Used for /portfolio archive page with grid/list/compact layouts
 * @see OtherProjectCard - Used for "Other Projects" section on detail pages
 */
export function ProjectCard({ 
  project,
  viewCount,
  loading = false,
}: ProjectCardProps) {
  const router = useRouter();
  
  // Loading state - render skeleton with IDENTICAL structure
  if (loading || !project) {
    return (
      <div className="block group cursor-pointer">
        <Card className={cn("flex h-full flex-col overflow-hidden relative holo-card holo-card-3d", HOVER_EFFECTS.card)}>
          {/* Background placeholder */}
          <div className="absolute inset-0 z-0 bg-muted/20" />

          {/* Content - matches CardHeader structure exactly */}
          <CardHeader className="space-y-1.5 relative z-10 px-4 sm:px-6 py-4 sm:py-5">
            {/* Timeline with status badge */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-6 sm:h-7 md:h-8 w-48 sm:w-56" />

            {/* Description - 2 lines */}
            <CardDescription className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardDescription>

            {/* Tech Stack badges (max 3) */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Skeleton className="h-5 sm:h-6 w-16" />
              <Skeleton className="h-5 sm:h-6 w-20" />
              <Skeleton className="h-5 sm:h-6 w-14" />
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
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
              <Badge variant="outline" className={STATUS_STYLES[project.status]}>
                {STATUS_LABEL[project.status]}
              </Badge> {project.timeline}
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
