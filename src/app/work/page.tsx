import type { Metadata } from "next";
import { visibleProjects, type Project, type ProjectCategory } from "@/data/projects";
import { SITE_URL, AUTHOR_NAME } from "@/lib/site-config";
import { createArchivePageMetadata, getJsonLdScriptProps } from "@/lib/metadata";
import { headers } from "next/headers";
import { getArchiveData } from "@/lib/archive";
import { getMultipleProjectViews } from "@/lib/project-views";
import { ArchivePagination } from "@/components/layouts/archive-pagination";
import { TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";
import { ProjectList, ProjectFilters } from "@/components/projects";

const basePageTitle = "Our Work";
const basePageDescription = "Browse our portfolio of development projects, open-source contributions, and published works.";
const PROJECTS_PER_PAGE = 9;

// Categories that are currently disabled/hidden
const DISABLED_CATEGORIES: ProjectCategory[] = ["photography", "code"];

// Filter out disabled categories from visible projects
const enabledProjects = visibleProjects.filter(
  p => !p.category || !DISABLED_CATEGORIES.includes(p.category)
);

// Category display names for titles (only enabled categories)
const CATEGORY_TITLES: Partial<Record<ProjectCategory, string>> = {
  community: "Community",
  nonprofit: "Nonprofit",
  // code: "Code",  // disabled
  // photography: "Photography",  // disabled
  startup: "Startup",
};

// Category-specific descriptions (only enabled categories)
const CATEGORY_DESCRIPTIONS: Partial<Record<ProjectCategory, string>> = {
  community: "Explore our community-focused projects and initiatives.",
  nonprofit: "Discover our nonprofit work and charitable contributions.",
  // code: "Browse our open-source code projects and development work.",  // disabled
  // photography: "View our photography projects and visual works.",  // disabled
  startup: "See our startup ventures and entrepreneurial projects.",
};

/**
 * Generate dynamic page title based on category filter
 */
function getPageTitle(category?: string): string {
  if (category && category in CATEGORY_TITLES) {
    return `Our ${CATEGORY_TITLES[category as ProjectCategory]} Work`;
  }
  return basePageTitle;
}

/**
 * Generate dynamic page description based on category filter
 */
function getPageDescription(category?: string): string {
  if (category && category in CATEGORY_DESCRIPTIONS) {
    return CATEGORY_DESCRIPTIONS[category as ProjectCategory] ?? basePageDescription;
  }
  return basePageDescription;
}

interface WorkPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: WorkPageProps): Promise<Metadata> {
  const resolvedParams = (await searchParams) ?? {};
  const categoryParam = Array.isArray(resolvedParams.category) 
    ? resolvedParams.category[0] 
    : resolvedParams.category;
  const category = categoryParam?.toLowerCase();
  
  const title = getPageTitle(category);
  const description = getPageDescription(category);
  
  // Count items for this category (using enabled projects only)
  const itemCount = category
    ? enabledProjects.filter(p => p.category?.toLowerCase() === category).length
    : enabledProjects.length;
  
  return createArchivePageMetadata({
    title,
    description,
    path: category ? `/work?category=${category}` : "/work",
    itemCount,
  });
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get("x-nonce") || "";
  
  // Resolve search parameters
  const resolvedParams = (await searchParams) ?? {};
  const getParam = (key: string) => {
    const value = resolvedParams[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  
  // Support category filter (primary classification - lowercase in URL)
  const categoryParam = getParam("category");
  const selectedCategory = categoryParam ? categoryParam.toLowerCase() : "";
  
  // Support multiple tags (comma-separated, case-insensitive)
  const tagParam = getParam("tag");
  const selectedTags = tagParam ? tagParam.split(",").filter(Boolean).map(t => t.toLowerCase()) : [];
  const query = getParam("q");
  const status = getParam("status");
  const sortBy = getParam("sortBy") || "newest";
  
  // Apply category filter first (case-insensitive) - using enabledProjects
  const projectsWithCategoryFilter = selectedCategory
    ? enabledProjects.filter((project) => 
        project.category && project.category.toLowerCase() === selectedCategory
      )
    : enabledProjects;
  
  // Apply status filter
  const projectsWithStatusFilter = status
    ? projectsWithCategoryFilter.filter((project) => project.status === status)
    : projectsWithCategoryFilter;
  
  // Apply multiple tag filter manually (project must have ALL selected tags, case-insensitive)
  const projectsWithTagFilter = selectedTags.length > 0
    ? projectsWithStatusFilter.filter((project) =>
        project.tags && selectedTags.every((tag) => 
          project.tags!.some(t => t.toLowerCase() === tag)
        )
      )
    : projectsWithStatusFilter;
  
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
  } else if (sortBy === "archived") {
    // Filter to only archived projects, sorted newest first
    sortedItems = [...archiveData.allFilteredItems]
      .filter((p) => p.status === "archived")
      .sort((a, b) => {
        const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || "0") : 0;
        const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || "0") : 0;
        return bYear - aYear;
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
  
  // Get available categories from all visible projects (for filter UI)
  // Categories use proper casing for display
  const categoryDisplayMap: Record<string, string> = {
    community: "Community",
    nonprofit: "Nonprofit", 
    // code: "Code",  // disabled
    // photography: "Photography",  // disabled
    startup: "Startup",
  };
  const availableCategories = Array.from(
    new Set(
      enabledProjects
        .map((p) => p.category)
        .filter((c): c is NonNullable<typeof c> => !!c)
    )
  ).sort();
  
  // Get available tags from filtered results (for progressive filtering)
  // Tags maintain proper casing for display
  const availableTags = Array.from(
    new Set([
      ...sortedArchiveData.allFilteredItems.flatMap((p) => p.tags || []),
    ])
  ).sort();
  
  // Check if filters are active for empty state
  const hasActiveFilters = Boolean(
    query || 
    selectedCategory ||
    selectedTags.length > 0 || 
    status || 
    sortBy !== 'newest'
  );
  
  // Compute dynamic title and description based on category
  const pageTitle = getPageTitle(selectedCategory);
  const pageDescription = getPageDescription(selectedCategory);
  
  // Get view counts for all projects
  const projectSlugs = sortedArchiveData.allFilteredItems.map(project => project.slug);
  let viewCounts = new Map<string, number>();
  try {
    viewCounts = await getMultipleProjectViews(projectSlugs);
  } catch (error) {
    console.error("Failed to fetch project view counts:", error);
    // Continue without view counts
  }
  
  // JSON-LD structured data for work collection
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/work`,
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
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          url: `${SITE_URL}/work/${project.slug}`,
          ...(project.links.find(l => l.type === "github") && {
            codeRepository: project.links.find(l => l.type === "github")?.href,
          }),
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

      <div className={`container ${CONTAINER_WIDTHS.content} mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-8`}>
        {/* Header */}
        <div id="work-header" className="mb-8">
          <h1 className={TYPOGRAPHY.h1.hero}>{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        {/* Filters - temporarily hidden
        <div className="mb-8">
          <ProjectFilters
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            categoryList={availableCategories}
            categoryDisplayMap={categoryDisplayMap}
            tagList={availableTags}
            query={query}
            sortBy={sortBy}
            totalResults={sortedArchiveData.totalItems}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
        */}

        {/* Projects list */}
        <div id="work-list">
        <ProjectList
          projects={sortedArchiveData.items}
          layout="grid"
          viewCounts={viewCounts}
          hasActiveFilters={hasActiveFilters}
          emptyMessage="No work found. Try adjusting your search or filters."
          basePath="/work"
        />
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
      </div>
    </>
  );
}
