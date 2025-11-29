"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Project } from "@/data/projects";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { ensureProjectImage } from "@/lib/default-project-images";
import { HOVER_EFFECTS } from "@/lib/design-tokens";
import { formatNumber } from "@/lib/utils";

const ScrollReveal = dynamic(() => import("@/components/features/scroll-reveal").then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => <div className="contents" />,
  ssr: true,
});

const STATUS_LABEL = {
  "active": "Active",
  "in-progress": "In progress",
  "archived": "Archived",
} as const;

// Status badge color styles - matching homepage activity badges
const STATUS_STYLES = {
  "active": "border-green-500/70 bg-green-500/50 backdrop-blur-sm font-semibold text-white",
  "in-progress": "border-blue-500/70 bg-blue-500/50 backdrop-blur-sm font-semibold text-white",
  "archived": "border-amber-500/70 bg-amber-500/50 backdrop-blur-sm font-semibold text-white",
} as const;

/**
 * Props for the ProjectList component
 */
interface ProjectListProps {
  projects: Project[];
  layout?: "grid" | "list" | "compact";
  viewCounts?: Map<string, number>;
  hasActiveFilters?: boolean;
  emptyMessage?: string;
}

/**
 * ProjectList Component
 *
 * Reusable component for displaying projects in different layout variants.
 * Used across the site: /portfolio page, search results, tag filters.
 *
 * Features:
 * - **Layout variants**: grid (3-column), list (single column expanded), compact (dense)
 * - Project status badges (Active, In Progress, Archived)
 * - Project title with tech stack
 * - Description with metadata
 * - Hover effects with lift animation
 * - Empty state with customizable message
 * - View count display
 */
export function ProjectList({
  projects,
  layout = "grid",
  viewCounts,
  hasActiveFilters = false,
  emptyMessage = "No projects found.",
}: ProjectListProps) {
  const router = useRouter();

  // Handle clear filters
  const handleClearFilters = () => {
    router.push('/portfolio');
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">{emptyMessage}</p>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  // Grid layout: 3-column grid with images
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="project-list">
        {projects.map((project, index) => {
          const image = ensureProjectImage(project.image, {
            tags: project.tags,
            tech: project.tech,
          });

          return (
            <ScrollReveal
              key={project.slug}
              animation="fade-up"
              delay={index * 50}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative holo-card holo-card-3d ${HOVER_EFFECTS.cardSubtle} flex flex-col h-full`}>
                {/* Background Image with gradient overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover holo-image-shift"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 holo-gradient-dark group-hover:holo-gradient-dark-hover transition-all duration-300" />
                </div>

                {/* Subtle shine effect */}
                <div className="holo-shine" />

                <Link href={`/portfolio/${project.slug}`} className="flex flex-col h-full relative z-10">
                  {/* Project content */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col">
                    {/* Status and timeline */}
                    {project.timeline && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge variant="outline" className={STATUS_STYLES[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                        <span>{project.timeline}</span>
                        {viewCounts && viewCounts.has(project.slug) && viewCounts.get(project.slug)! > 0 && (
                          <span className="ml-auto flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(viewCounts.get(project.slug)!)}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="font-semibold text-base sm:text-lg md:text-xl line-clamp-2 mb-2">
                      {project.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    {project.tech && project.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.tech.slice(0, 3).map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.tech.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tech.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  // List layout: single column with full details
  if (layout === "list") {
    return (
      <div className="space-y-6" data-testid="project-list">
        {projects.map((project, index) => {
          const image = ensureProjectImage(project.image, {
            tags: project.tags,
            tech: project.tech,
          });

          return (
            <ScrollReveal
              key={project.slug}
              animation="fade-up"
              delay={index * 80}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative holo-card holo-card-3d ${HOVER_EFFECTS.cardSubtle}`}>
                {/* Background Image with gradient overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover holo-image-shift"
                    sizes="(max-width: 768px) 100vw, 800px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 holo-gradient-dark group-hover:holo-gradient-dark-hover transition-all duration-300" />
                </div>

                {/* Subtle shine effect */}
                <div className="holo-shine" />

                <Link href={`/portfolio/${project.slug}`} className="block relative z-10">
                  <div className="p-5 md:p-6">
                    {/* Status and timeline */}
                    {project.timeline && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Badge variant="outline" className={STATUS_STYLES[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                        <span>{project.timeline}</span>
                        {viewCounts && viewCounts.has(project.slug) && viewCounts.get(project.slug)! > 0 && (
                          <span className="ml-auto flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(viewCounts.get(project.slug)!)}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="font-semibold text-xl md:text-2xl line-clamp-2 mb-3">
                      {project.title}
                    </h2>

                    {/* Description - more lines visible */}
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-4 mb-4">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    {project.tech && project.tech.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  // Compact layout: minimal cards
  if (layout === "compact") {
    return (
      <div className="space-y-3" data-testid="project-list">
        {projects.map((project, index) => {
          const image = ensureProjectImage(project.image, {
            tags: project.tags,
            tech: project.tech,
          });

          return (
            <ScrollReveal
              key={project.slug}
              animation="fade-up"
              delay={index * 50}
              duration={600}
            >
              <article className={`group rounded-lg border overflow-hidden relative holo-card holo-card-3d ${HOVER_EFFECTS.cardSubtle}`}>
                {/* Background Image with gradient overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover holo-image-shift"
                    sizes="(max-width: 768px) 100vw, 400px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 holo-gradient-dark group-hover:holo-gradient-dark-hover transition-all duration-300" />
                </div>

                {/* Subtle shine effect */}
                <div className="holo-shine" />

                <Link href={`/portfolio/${project.slug}`} className="block relative z-10">
                  <div className="p-3">
                    {/* Status and timeline - compact */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[project.status]}`}>{STATUS_LABEL[project.status]}</Badge>
                      {project.timeline && <span>{project.timeline}</span>}
                      {viewCounts && viewCounts.has(project.slug) && viewCounts.get(project.slug)! > 0 && (
                        <span className="ml-auto flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">{formatNumber(viewCounts.get(project.slug)!)}</span>
                        </span>
                      )}
                    </div>

                    {/* Title - compact */}
                    <h2 className="font-medium text-sm sm:text-base line-clamp-2">
                      {project.title}
                    </h2>
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    );
  }

  // Default to grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="project-list">
      {projects.map((project, index) => {
        const image = ensureProjectImage(project.image, {
          tags: project.tags,
          tech: project.tech,
        });

        return (
          <ScrollReveal
            key={project.slug}
            animation="fade-up"
            delay={index * 50}
            duration={600}
          >
            <article className={`group rounded-lg border overflow-hidden relative holo-card holo-card-3d ${HOVER_EFFECTS.cardSubtle} flex flex-col h-full`}>
              {/* Background Image with gradient overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover holo-image-shift"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 holo-gradient-dark group-hover:holo-gradient-dark-hover transition-all duration-300" />
              </div>

              {/* Subtle shine effect */}
              <div className="holo-shine" />

              <Link href={`/portfolio/${project.slug}`} className="flex flex-col h-full relative z-10">
                {/* Project content */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                  {/* Status and timeline */}
                  {project.timeline && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Badge variant="outline" className={STATUS_STYLES[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                      <span>{project.timeline}</span>
                      {viewCounts && viewCounts.has(project.slug) && viewCounts.get(project.slug)! > 0 && (
                        <span className="ml-auto flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(viewCounts.get(project.slug)!)}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="font-semibold text-base sm:text-lg md:text-xl line-clamp-2 mb-2">
                    {project.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tech.slice(0, 3).map(tech => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.tech.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tech.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
