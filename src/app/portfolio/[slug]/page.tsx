import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { visibleProjects } from "@/data/projects";
import {
  SITE_URL,
  SITE_TITLE_PLAIN,
  AUTHOR_NAME,
  getOgImageUrl,
  getTwitterImageUrl,
} from "@/lib/site-config";
import { getContainerClasses } from "@/lib/design-tokens";
import { headers } from "next/headers";
import { ProjectLayoutStrategy } from "@/components/projects/layouts";

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
      url: `${SITE_URL}/portfolio/${project.slug}`,
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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = visibleProjects.find((p) => p.slug === slug);
  
  if (!project) {
    notFound();
  }
  
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // JSON-LD structured data for project
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/portfolio/${project.slug}`,
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
        {/* Back to Portfolio */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portfolio</span>
        </Link>
        
        {/* Render appropriate layout based on project category */}
        <ProjectLayoutStrategy project={project} nonce={nonce} />
      </div>
    </>
  );
}
