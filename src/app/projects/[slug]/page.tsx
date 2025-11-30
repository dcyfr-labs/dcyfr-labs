import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { visibleProjects } from "@/data/projects";
import type { Project } from "@/data/projects";
import {
  SITE_URL,
  SITE_TITLE_PLAIN,
  AUTHOR_NAME,
  getOgImageUrl,
  getTwitterImageUrl,
} from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, sanitizeUrl } from "@/lib/utils";
import { ensureProjectImage } from "@/lib/default-project-images";
import { 
  TYPOGRAPHY, 
  SPACING, 
  HOVER_EFFECTS,
} from "@/lib/design-tokens";
import { Logo } from "@/components/common/logo";
import { ProjectsCTA } from "@/components/common";
import { headers } from "next/headers";
import { OtherProjectCard } from "@/components/projects/other-project-card";
import { ArticleLayout, ArticleHeader, ArticleFooter } from "@/components/layouts";

// Enable Incremental Static Regeneration with 1 hour revalidation
export const revalidate = 3600; // 1 hour in seconds

// Pre-generate all project pages at build time
export async function generateStaticParams() {
  return visibleProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = visibleProjects.find((p) => p.slug === slug);
  
  if (!project) return {};
  
  const pageTitle = project.title;
  const pageDescription = project.description;
  const imageUrl = getOgImageUrl(pageTitle, pageDescription);
  
  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: `${pageTitle} — ${SITE_TITLE_PLAIN}`,
      description: pageDescription,
      type: "article",
      url: `${SITE_URL}/projects/${project.slug}`,
      siteName: SITE_TITLE_PLAIN,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${pageTitle} — ${SITE_TITLE_PLAIN}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} — ${SITE_TITLE_PLAIN}`,
      description: pageDescription,
      images: [getTwitterImageUrl(pageTitle, pageDescription)],
    },
  };
}

const STATUS_LABEL: Record<Project["status"], string> = {
  "active": "Active",
  "in-progress": "In Progress",
  "archived": "Archived",
};

// Status badge color styles - matching homepage activity badges
const STATUS_STYLES: Record<Project["status"], string> = {
  active:
    "border-green-500/70 bg-green-500/50 backdrop-blur-sm font-semibold text-white",
  "in-progress":
    "border-blue-500/70 bg-blue-500/50 backdrop-blur-sm font-semibold text-white",
  archived:
    "border-amber-500/70 bg-amber-500/50 backdrop-blur-sm font-semibold text-white",
};

/**
 * Section Card Component
 * Reusable card wrapper for project detail sections with consistent design tokens
 */
function SectionCard({ 
  title, 
  children,
  className,
}: { 
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(SPACING.content, className)}>
      <h2 className={cn(TYPOGRAPHY.h2.standard, "mb-4 mt-0")}>{title}</h2>
      <Card className={HOVER_EFFECTS.cardSubtle}>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Project Links Component
 * Renders project action buttons with consistent styling
 */
function ProjectLinks({ links }: { links: Project["links"] }) {
  if (links.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => {
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
  );
}

/**
 * Related Projects Component
 * Displays other projects in a grid with proper design tokens
 */
function RelatedProjects({ 
  currentSlug 
}: { 
  currentSlug: string;
}) {
  const otherProjects = visibleProjects
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 2);
    
  if (otherProjects.length === 0) return null;
  
  return (
    <div className={cn("pt-8 border-t", SPACING.subsection)}>
      <h2 className={cn(TYPOGRAPHY.h2.standard, "mb-6")}>Other Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {otherProjects.map((project) => (
          <OtherProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = visibleProjects.find((p) => p.slug === slug);
  
  if (!project) {
    notFound();
  }
  
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Always ensure we have an image (custom or default)
  const image = ensureProjectImage(project.image, {
    tags: project.tags,
    tech: project.tech,
  });
  
  // JSON-LD structured data for project
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/projects/${project.slug}`,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    ...(project.links.find(l => l.type === "github") && {
      codeRepository: project.links.find(l => l.type === "github")?.href,
    }),
    programmingLanguage: project.tech,
    keywords: [...(project.tech || []), ...(project.tags || [])].join(", "),
    creativeWorkStatus: project.status === "active" ? "Published" : 
                       project.status === "in-progress" ? "Draft" : "Archived",
  };
  
  // Build header component with ArticleHeader
  const headerContent = (
    <>
      {/* Back to Projects */}
      <Link
        href="/projects"
        className={cn(
          "inline-flex items-center gap-2 text-sm text-muted-foreground mb-6",
          HOVER_EFFECTS.link
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </Link>
      
      {/* Project Header with Background Image */}
      <ArticleHeader
        title={project.title}
        metadata={project.timeline || undefined}
        badges={
          <Badge variant="outline" className={STATUS_STYLES[project.status]}>
            {STATUS_LABEL[project.status]}
          </Badge>
        }
        backgroundImage={{
          url: image.url,
          alt: image.alt,
          position: image.position as 'center' | 'top' | 'bottom' | 'left' | 'right' | undefined,
        }}
      />
    </>
  );
  
  // Build footer with related projects and CTA
  const footerContent = (
    <>
      <RelatedProjects currentSlug={project.slug} />
      <ProjectsCTA />
    </>
  );
  
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
      <ArticleLayout
        header={headerContent}
        footer={footerContent}
        useProseWidth={true}
      >
        {/* Project Description */}
        <p className={cn(TYPOGRAPHY.description, "leading-relaxed mb-8")}>
          {project.description}
        </p>
        
        {/* Project Links */}
        <div className="mb-8">
          <ProjectLinks links={project.links} />
        </div>
        
        {/* Project Details Sections */}
        <div className={SPACING.section}>
          {/* Tech Stack */}
          {project.tech && project.tech.length > 0 && (
            <SectionCard title="Tech Stack">
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </SectionCard>
          )}
          
          {/* Project Tags */}
          {project.tags && project.tags.length > 0 && (
            <SectionCard title="Categories">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </SectionCard>
          )}
          
          {/* Key Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <SectionCard title="Key Highlights">
              <ul className={cn(SPACING.content, "mb-0")}>
                {project.highlights.map((highlight, index) => (
                  <li key={index} className="flex gap-2 items-start text-base leading-relaxed">
                    <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="flex-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      </ArticleLayout>
    </>
  );
}
