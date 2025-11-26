import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { getContainerClasses, TYPOGRAPHY } from "@/lib/design-tokens";
import { Logo } from "@/components/common/logo";
import { ProjectsCTA } from "@/components/common";
import { headers } from "next/headers";
import { OtherProjectCard } from "@/components/projects/other-project-card";
import { ArticleHeader } from "@/components/layouts";

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

const STATUS_VARIANT: Record<Project["status"], "secondary" | "default" | "outline"> = {
  "active": "outline",
  "in-progress": "outline",
  "archived": "outline",
};

const STATUS_LABEL: Record<Project["status"], string> = {
  "active": "Active",
  "in-progress": "In Progress",
  "archived": "Archived",
};

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
  
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
      <div className={getContainerClasses('standard')}>
        {/* Back to Projects */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>
        
        {/* Project Header with Background Image */}
        <ArticleHeader
          title={project.title}
          metadata={project.timeline || undefined}
          badges={
            <Badge variant={STATUS_VARIANT[project.status]}>
              {STATUS_LABEL[project.status]}
            </Badge>
          }
          backgroundImage={{
            url: image.url,
            alt: image.alt,
            position: image.position as 'center' | 'top' | 'bottom' | 'left' | 'right' | undefined,
          }}
        />
        
        {/* Project Description */}
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
        
        {/* Project Details */}
        <div className="max-w-none">
          {/* Tech Stack */}
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 mt-0`}>Tech Stack</h2>
          {project.tech && project.tech.length > 0 && (
            <Card className="mb-8">
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Project Tags */}
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 mt-0`}>Categories</h2>
          {project.tags && project.tags.length > 0 && (
            <Card className="mb-8">
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Key Highlights */}

          <h2 className={`${TYPOGRAPHY.h2.standard} mb-4 mt-0`}>Key Highlights</h2>
          {project.highlights && project.highlights.length > 0 && (
            <Card className="mb-8">
              <CardContent>
                <ul className="space-y-3 mb-0">
                  {project.highlights.map((highlight, index) => (
                    <li key={index} className="flex gap-2 items-start text-base leading-relaxed">
                      <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="flex-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
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
      </div>
    </>
  );
}
