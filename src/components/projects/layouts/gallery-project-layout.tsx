import Link from "next/link";
import { ExternalLink, Camera } from "lucide-react";
import { visibleProjects, type Project } from "@/data/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sanitizeUrl } from "@/lib/utils";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { ProjectsCTA } from "@/components/common";
import { OtherProjectCard } from "@/components/projects/other-project-card";
import { ArticleHeader } from "@/components/layouts";
import { PhotoGrid } from "@/components/projects/photo-grid";
import { PostInteractions } from "@/components/common/PostInteractions";

const STATUS_LABEL: Record<Project["status"], string> = {
  "active": "Active",
  "in-progress": "In Progress",
  "archived": "Archived",
};

interface GalleryProjectLayoutProps {
  /** Project data with optional galleryContent */
  project: Project;
  /** CSP nonce for inline scripts (unused but kept for consistency) */
  nonce: string;
  /** Base path for project URLs (default: '/work') */
  basePath?: string;
}

/**
 * GalleryProjectLayout Component
 * 
 * Specialized layout for photography/gallery projects.
 * Features:
 * - Minimal header (title, timeline, status)
 * - Brief description
 * - Instagram-style photo grid
 * - Toggle between masonry and uniform layouts
 * - Lightbox for viewing full-size photos
 * 
 * @example
 * ```tsx
 * <GalleryProjectLayout project={project} nonce={nonce} basePath="/work" />
 * ```
 */
export function GalleryProjectLayout({ project, nonce, basePath = '/work' }: GalleryProjectLayoutProps) {
  const galleryContent = project.galleryContent;
  
  // Default empty photos array if no gallery content
  const photos = galleryContent?.photos || [];
  const columns = galleryContent?.columns || 3;
  
  return (
    <>
      {/* Project Header (minimal) */}
      <ArticleHeader
        title={project.title}
        metadata={project.timeline || undefined}
        badges={
          project.status !== "active" ? (
            <Link href={`${basePath}?status=${project.status}`}>
              <Badge variant="default" className="cursor-pointer hover:opacity-80 transition-opacity">
                {STATUS_LABEL[project.status]}
              </Badge>
            </Link>
          ) : undefined
        }
        backgroundImage={project.image ? {
          url: project.image.url,
          alt: project.image.alt,
          position: project.image.position || 'center',
          caption: project.image.caption,
          credit: project.image.credit,
          priority: project.featured || false,
          hideHero: project.image.hideHero,
        } : undefined}
      />
      
      {/* Project Description (brief) */}
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
        {project.description}
      </p>
      
      {/* Project Links */}
      {project.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {project.links.map((link) => {
            const isExternal = /^(?:https?:)?\/\//.test(link.href);
            return isExternal ? (
              <Button key={link.href} asChild variant="default" size="default">
                <a href={sanitizeUrl(link.href)} target="_blank" rel="noreferrer">
                  <span>{link.label}</span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button key={link.href} asChild variant="default" size="default">
                <Link href={link.href}>
                  <span>{link.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      )}

      {/* Photo Gallery Section */}
      {photos.length > 0 ? (
        <section className="mb-10">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 flex items-center gap-2`}>
            <Camera className="h-5 w-5" />
            Gallery
            <span className={`${TYPOGRAPHY.label.small} text-muted-foreground ml-2`}>
              ({photos.length} photos)
            </span>
          </h2>
          <PhotoGrid 
            photos={photos} 
            columns={columns}
            basePath={`${basePath}/${project.slug}`}
          />
        </section>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center mb-10">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            No photos available for this project yet.
          </p>
        </div>
      )}

      {/* Equipment/Tech (if applicable) */}
      {project.tech && project.tech.length > 0 && (
        <section className="mb-10">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Equipment & Tools</h2>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Post Interactions (like, bookmark, share) */}
      <div className="my-8">
        <PostInteractions
          contentId={project.slug}
          contentType="project"
          title={project.title}
          description={project.description}
          href={`${basePath}/${project.slug}`}
          variant="default"
          showCounts={true}
        />
      </div>

      {/* Other Projects */}
      <div className="mt-12 pt-8 border-t">
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-6`}>Other Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleProjects
            .filter((p) => p.slug !== project.slug)
            .slice(0, 2)
            .map((otherProject) => (
              <OtherProjectCard 
                key={otherProject.slug} 
                project={otherProject} 
              />
            ))}
        </div>
      </div>

      {/* Call-to-action */}
      <ProjectsCTA />
    </>
  );
}
