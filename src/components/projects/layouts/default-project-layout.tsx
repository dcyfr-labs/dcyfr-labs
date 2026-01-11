import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { visibleProjects, type Project } from "@/data/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sanitizeUrl } from "@/lib/utils";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { Logo } from "@/components/common";
import { ProjectsCTA } from "@/components/common";
import { PostInteractions } from "@/components/common";
import { OtherProjectCard } from "@/components/projects";
import { ArticleHeader } from "@/components/layouts";

const STATUS_LABEL: Record<Project["status"], string> = {
  active: "Active",
  "in-progress": "In Progress",
  archived: "Archived",
};

interface DefaultProjectLayoutProps {
  /** Project data */
  project: Project;
  /** CSP nonce for inline scripts (unused in default layout but kept for consistency) */
  nonce: string;
  /** Base path for project URLs (default: '/work') */
  basePath?: string;
}

/**
 * DefaultProjectLayout Component
 *
 * Standard layout for community, nonprofit, and startup projects.
 * Displays project information in a structured format with:
 * - Header with title, timeline, and status badge
 * - Description
 * - Action links (website, GitHub, docs)
 * - Tech stack badges
 * - Category/tag badges
 * - Key highlights
 * - Other projects section
 * - Call-to-action
 *
 * @example
 * ```tsx
 * <DefaultProjectLayout project={project} nonce={nonce} basePath="/work" />
 * ```
 */
export function DefaultProjectLayout({
  project,
  nonce,
  basePath = "/work",
}: DefaultProjectLayoutProps) {
  // Check if we have any metadata to show
  const hasTech = project.tech && project.tech.length > 0;
  const hasTags = project.tags && project.tags.length > 0;
  const hasHighlights = project.highlights && project.highlights.length > 0;
  const hasLinks = project.links.length > 0;

  return (
    <>
      {/* Project Header */}
      <ArticleHeader
        title={project.title}
        metadata={project.timeline || undefined}
        badges={
          <>
            {/* Status Badge - only show for non-active statuses */}
            {project.status !== "active" && (
              <Link href={`${basePath}?status=${project.status}`}>
                <Badge
                  variant="default"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {STATUS_LABEL[project.status]}
                </Badge>
              </Link>
            )}
            {/* Category Badge */}
            {project.category && (
              <Link href={`${basePath}?category=${project.category}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {project.category.charAt(0).toUpperCase() +
                    project.category.slice(1)}
                </Badge>
              </Link>
            )}
          </>
        }
        backgroundImage={
          project.image
            ? {
                url: project.image.url,
                alt: project.image.alt,
                position: project.image.position || "center",
                caption: project.image.caption,
                credit: project.image.credit,
                priority: project.featured || false,
                hideHero: project.image.hideHero,
              }
            : undefined
        }
      />

      {/* Project Description */}
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
        {project.description}
      </p>

      {/* Project Links */}
      {hasLinks && (
        <div className="flex flex-wrap gap-3 mb-8">
          {project.links.map((link) => {
            const isExternal = /^(?:https?:)?\/\//.test(link.href);
            return isExternal ? (
              <Button key={link.href} asChild variant="default" size="default">
                <a
                  href={sanitizeUrl(link.href)}
                  target="_blank"
                  rel="noreferrer"
                >
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

      {/* Key Highlights */}
      {hasHighlights && (
        <section className="mb-8">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4`}>Key Highlights</h2>
          <Card>
            <CardContent>
              <ul className="space-y-3 mb-0">
                {project.highlights!.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex gap-3 items-start text-base leading-relaxed"
                  >
                    <Logo
                      width={12}
                      height={12}
                      className="mt-1.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="flex-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* TODO: Tech Stack Badges */}

      {/* TODO: Tag Badges */}

      {/* Post interactions (like, bookmark, share) */}
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
      <div className={`${SPACING.sectionDivider.container} border-t`}>
        <h2
          className={`${TYPOGRAPHY.h2.standard} ${SPACING.sectionDivider.heading}`}
        >
          Other Projects
        </h2>
        <div className={`grid ${SPACING.sectionDivider.grid} sm:grid-cols-2`}>
          {visibleProjects
            .filter((p) => p.slug !== project.slug)
            .slice(0, 2)
            .map((otherProject) => (
              <OtherProjectCard
                key={otherProject.slug}
                project={otherProject}
                basePath={basePath}
              />
            ))}
        </div>
      </div>

      {/* Call-to-action */}
      <ProjectsCTA />
    </>
  );
}
