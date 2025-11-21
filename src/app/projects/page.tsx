import type { Metadata } from "next";
import { visibleProjects } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";
import dynamic from "next/dynamic";
import { GitHubHeatmapErrorBoundary } from "@/components/github-heatmap-error-boundary";
import { GitHubHeatmapSkeleton } from "@/components/github-heatmap-skeleton";
import { ArchiveLayout } from "@/components/layouts/archive-layout";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { createArchivePageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { headers } from "next/headers";

const GitHubHeatmap = dynamic(() => import("@/components/github-heatmap").then(mod => ({ default: mod.GitHubHeatmap })), {
  loading: () => <GitHubHeatmapSkeleton />,
});

const pageTitle = "Projects";
const pageDescription = "Browse my portfolio of development projects, open-source contributions, and published work.";

export const metadata: Metadata = createArchivePageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/projects",
  itemCount: visibleProjects.length,
});

export default async function ProjectsPage() {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // JSON-LD structured data for projects collection
  // Note: Using custom schema instead of createCollectionSchema() because
  // projects have unique fields (SoftwareSourceCode, codeRepository, etc.)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/projects`,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: visibleProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: project.title,
          description: project.description,
          url: `${SITE_URL}/projects/${project.slug}`,
          ...(project.links.find(l => l.type === "github") && {
            codeRepository: project.links.find(l => l.type === "github")?.href,
          }),
          programmingLanguage: project.tech,
          keywords: [...(project.tech || []), ...(project.tags || [])].join(", "),
          creativeWorkStatus: project.status === "active" ? "Published" : 
                             project.status === "in-progress" ? "Draft" : "Archived",
        },
      })),
    },
  };

  return (
    <>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      
      <ArchiveLayout
        title={pageTitle}
        description={pageDescription}
      >
        {/* GitHub contribution heatmap */}
        <div className="mb-8">
          <GitHubHeatmapErrorBoundary>
            <GitHubHeatmap username="dcyfr" />
          </GitHubHeatmapErrorBoundary>
        </div>
        
        {/* Projects grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </ArchiveLayout>
    </>
  );
}
