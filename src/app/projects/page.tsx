import type { Metadata } from "next";
import { visibleProjects, type Project } from "@/data/projects";
import dynamic from "next/dynamic";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { createArchivePageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { headers } from "next/headers";
import { getArchiveData } from "@/lib/archive";
import { Badge } from "@/components/ui/badge";
import { getMultipleProjectViews } from "@/lib/project-views";
import { ArchiveLayout } from "@/components/layouts/archive-layout";
import { ArchivePagination } from "@/components/layouts/archive-pagination";
import { ProjectCard, ProjectFilters } from "@/components/projects";
import {
  GitHubHeatmapErrorBoundary,
  GitHubHeatmapSkeleton,
} from "@/components/common";

const GitHubHeatmap = dynamic(() => import("@/components/features/github/github-heatmap").then(mod => ({ default: mod.GitHubHeatmap })), {
  loading: () => <GitHubHeatmapSkeleton />,
});

const pageTitle = "Projects";
const pageDescription = "Browse my portfolio of development projects, open-source contributions, and published work.";
const PROJECTS_PER_PAGE = 9;

export const metadata: Metadata = createArchivePageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/projects",
  itemCount: visibleProjects.length,
});

interface ProjectsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Resolve search parameters
  const resolvedParams = (await searchParams) ?? {};
  const getParam = (key: string) => {
    const value = resolvedParams[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  
  // Support multiple tags and tech (comma-separated)
  const tagParam = getParam("tag");
  const selectedTags = tagParam ? tagParam.split(",").filter(Boolean) : [];
  const techParam = getParam("tech");
  const selectedTech = techParam ? techParam.split(",").filter(Boolean) : [];
  const query = getParam("q");
  const status = getParam("status");
  const sortBy = getParam("sortBy") || "newest";
  
  // Apply status filter
  const projectsWithStatusFilter = status
    ? visibleProjects.filter((project) => project.status === status)
    : visibleProjects;
  
  // Apply tech filter manually (support multiple tech selections - project must have ALL selected tech)
  const projectsWithTechFilter = selectedTech.length > 0
    ? projectsWithStatusFilter.filter((project) =>
        project.tech && selectedTech.every((tech) => project.tech!.includes(tech))
      )
    : projectsWithStatusFilter;
  
  // Apply multiple tag filter manually (project must have ALL selected tags)
  const projectsWithTagFilter = selectedTags.length > 0
    ? projectsWithTechFilter.filter((project) =>
        project.tags && selectedTags.every((tag) => project.tags!.includes(tag))
      )
    : projectsWithTechFilter;
  
  // Use Archive Pattern for search and pagination
  const archiveData = getArchiveData<Project>(
    {
      items: [...projectsWithTagFilter],
      searchFields: ["title", "description"],
      tagField: "tags",
      itemsPerPage: PROJECTS_PER_PAGE,
    },
    {
      search: query,
      page: getParam("page"),
    }
  );
  
  // Apply custom sorting
  let sortedItems = archiveData.allFilteredItems;
  if (sortBy === "oldest") {
    // Sort by timeline (earliest first) - handle "YYYY → Present" format
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || "9999") : 9999;
      const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || "9999") : 9999;
      return aYear - bYear;
    });
  } else if (sortBy === "alpha") {
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => 
      a.title.localeCompare(b.title)
    );
  } else if (sortBy === "status") {
    // Sort by status: active > in-progress > archived
    const statusOrder = { "active": 0, "in-progress": 1, "archived": 2 };
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => 
      statusOrder[a.status] - statusOrder[b.status]
    );
  } else {
    // "newest" - sort by timeline (most recent first)
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || "0") : 0;
      const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || "0") : 0;
      return bYear - aYear;
    });
  }
  
  // Re-paginate sorted items
  const startIndex = (archiveData.currentPage - 1) * archiveData.itemsPerPage;
  const endIndex = startIndex + archiveData.itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);
  
  // Update archiveData with sorted items
  const sortedArchiveData = {
    ...archiveData,
    items: paginatedItems,
    allFilteredItems: sortedItems,
    totalItems: sortedItems.length,
    totalPages: Math.ceil(sortedItems.length / archiveData.itemsPerPage),
  };
  
  // Get all available tags and tech from visible projects
  const availableTags = Array.from(
    new Set(visibleProjects.flatMap((p) => p.tags || []))
  ).sort();
  
  const availableTech = Array.from(
    new Set(visibleProjects.flatMap((p) => p.tech || []))
  ).sort();
  
  // Check if filters are active for empty state
  const hasActiveFilters = Boolean(
    query || 
    selectedTags.length > 0 || 
    selectedTech.length > 0 || 
    status || 
    sortBy !== 'newest'
  );
  
  // Get view counts for all projects
  const projectSlugs = sortedArchiveData.allFilteredItems.map(project => project.slug);
  let viewCounts = new Map<string, number>();
  try {
    viewCounts = await getMultipleProjectViews(projectSlugs);
  } catch (error) {
    console.error("Failed to fetch project view counts:", error);
    // Continue without view counts
  }
  
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
      itemListElement: sortedArchiveData.allFilteredItems.map((project, index) => ({
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
        {/* GitHub contribution heatmap 
        <div className="mb-8">
          <GitHubHeatmapErrorBoundary>
            <GitHubHeatmap username="dcyfr" />
          </GitHubHeatmapErrorBoundary>
        </div> */}
        
        {/* Filters */}
        <div className="mb-8">
          <ProjectFilters
            selectedTags={selectedTags}
            selectedTech={selectedTech}
            status={status}
            tagList={availableTags}
            techList={availableTech}
            query={query}
            sortBy={sortBy}
          />
        </div>
        
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {sortedArchiveData.totalItems === 0 && hasActiveFilters ? (
              "No projects match your filters"
            ) : sortedArchiveData.totalItems === 0 ? (
              "No projects found"
            ) : (
              <>
                Showing {sortedArchiveData.totalItems} {sortedArchiveData.totalItems === 1 ? "project" : "projects"}
                {hasActiveFilters && " (filtered)"}
              </>
            )}
          </p>
        </div>
        
        {/* Projects grid */}
        {sortedArchiveData.items.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedArchiveData.items.map((project) => (
                <ProjectCard key={project.slug} project={project} viewCount={viewCounts.get(project.slug)} />
              ))}
            </div>
            
            {/* Pagination */}
            {sortedArchiveData.totalPages > 1 && (
              <div className="mt-12">
                <ArchivePagination
                  currentPage={sortedArchiveData.currentPage}
                  totalPages={sortedArchiveData.totalPages}
                  hasPrevPage={sortedArchiveData.currentPage > 1}
                  hasNextPage={sortedArchiveData.currentPage < sortedArchiveData.totalPages}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  No projects match your filters.{" "}
                  <button
                    onClick={() => window.location.href = "/projects"}
                    className="text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                "No projects found."
              )}
            </p>
          </div>
        )}
      </ArchiveLayout>
    </>
  );
}
