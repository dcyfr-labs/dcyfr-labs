import type { Metadata } from 'next';
import {
  visibleProjects,
  getAutomatedProjects,
  type Project,
  type ProjectCategory,
} from '@/data/projects';
import { mergeProjects } from '@/lib/projects/merge-projects';
import { SITE_URL, AUTHOR_NAME } from '@/lib/site-config';
import { createArchivePageMetadata, getJsonLdScriptProps } from '@/lib/metadata';
import { headers } from 'next/headers';
import { getArchiveData } from '@/lib/archive';
import { getMultipleProjectViews } from '@/lib/project-views';
import { ArchivePagination, PageLayout, ArchiveHero } from '@/components/layouts';
import { CONTAINER_WIDTHS, CONTAINER_PADDING, SPACING } from '@/lib/design-tokens';
import { ProjectList, ProjectFilters } from '@/components/projects';
import { SmoothScrollToHash } from '@/components/common';
import { FeedDropdown } from '@/components/blog/client';

const basePageTitle = 'Our Work';
const basePageDescription =
  'Browse our portfolio of development projects, open-source contributions, and published works.';
const PROJECTS_PER_PAGE = 9;

// Categories that are currently disabled/hidden
// Note: "code" was previously disabled but is now enabled for the automated repo showcase
const DISABLED_CATEGORIES: ProjectCategory[] = ['photography'];

// Category display names for titles (only enabled categories)
const CATEGORY_TITLES: Partial<Record<ProjectCategory, string>> = {
  code: 'Code',
  startup: 'Startups',
  nonprofit: 'Nonprofits',
  // photography: "Photography",  // disabled
};

// Category-specific descriptions (only enabled categories)
const CATEGORY_DESCRIPTIONS: Partial<Record<ProjectCategory, string>> = {
  code: 'Browse our open-source code projects and development work.',
  startup: 'See our startup ventures and entrepreneurial projects.',
  nonprofit: 'Discover our nonprofit work and charitable contributions.',
  // photography: "View our photography projects and visual works.",  // disabled
};

/**
 * Generate dynamic page title based on category filter
 */
function getPageTitle(category?: string): string {
  if (category && category in CATEGORY_TITLES) {
    return CATEGORY_TITLES[category as ProjectCategory] ?? basePageTitle;
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

  // Count items for this category (using static visible projects for metadata — approximate)
  const metadataProjects = visibleProjects.filter(
    (p) => !p.category || !DISABLED_CATEGORIES.includes(p.category)
  );
  const itemCount = category
    ? metadataProjects.filter((p) => p.category?.toLowerCase() === category).length
    : metadataProjects.length;

  return {
    ...createArchivePageMetadata({
      title,
      description,
      path: category ? `/work?category=${category}` : '/work',
      itemCount,
    }),
    alternates: {
      types: {
        'application/rss+xml': [
          {
            url: `${SITE_URL}/work/rss.xml`,
            title: `${SITE_URL} - Projects (RSS)`,
          },
        ],
        'application/atom+xml': [
          {
            url: `${SITE_URL}/work/feed`,
            title: `${SITE_URL} - Projects (Atom)`,
          },
        ],
        'application/feed+json': [
          {
            url: `${SITE_URL}/work/feed.json`,
            title: `${SITE_URL} - Projects (JSON Feed)`,
          },
        ],
      },
    },
  };
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  // Get nonce from proxy for CSP
  const nonce = (await headers()).get('x-nonce') || '';

  // Fetch and merge automated projects from GitHub org (gracefully degrades on error)
  const automatedProjects = await getAutomatedProjects();
  const allProjects = mergeProjects(visibleProjects, automatedProjects);

  // Filter out disabled categories from the merged set
  const enabledProjects = allProjects.filter(
    (p) => !p.category || !DISABLED_CATEGORIES.includes(p.category)
  );

  // Resolve search parameters
  const resolvedParams = (await searchParams) ?? {};
  const getParam = (key: string) => {
    const value = resolvedParams[key];
    return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
  };

  // Support category filter (primary classification - lowercase in URL)
  const categoryParam = getParam('category');
  const selectedCategory = categoryParam ? categoryParam.toLowerCase() : '';

  // Support multiple tags (comma-separated, case-insensitive)
  const tagParam = getParam('tag');
  const selectedTags = tagParam
    ? tagParam
        .split(',')
        .filter(Boolean)
        .map((t) => t.toLowerCase())
    : [];
  const query = getParam('q');
  const status = getParam('status');
  const sortBy = getParam('sortBy') || 'newest';

  // Apply category filter first (case-insensitive) - using enabledProjects
  const projectsWithCategoryFilter = selectedCategory
    ? enabledProjects.filter(
        (project) => project.category && project.category.toLowerCase() === selectedCategory
      )
    : enabledProjects;

  // Apply status filter
  const projectsWithStatusFilter = status
    ? projectsWithCategoryFilter.filter((project) => project.status === status)
    : projectsWithCategoryFilter;

  // Apply multiple tag filter manually (project must have ALL selected tags, case-insensitive)
  const projectsWithTagFilter =
    selectedTags.length > 0
      ? projectsWithStatusFilter.filter(
          (project) =>
            project.tags &&
            selectedTags.every((tag) => project.tags!.some((t) => t.toLowerCase() === tag))
        )
      : projectsWithStatusFilter;

  // Use Archive Pattern for search and pagination
  const archiveData = getArchiveData<Project>(
    {
      items: [...projectsWithTagFilter],
      searchFields: ['title', 'description'],
      tagField: 'tags',
      itemsPerPage: PROJECTS_PER_PAGE,
    },
    {
      search: query,
      page: getParam('page'),
    }
  );

  // Apply custom sorting
  let sortedItems = archiveData.allFilteredItems;
  if (sortBy === 'oldest') {
    // Sort by timeline (earliest first) - handle "YYYY → Present" format
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || '9999') : 9999;
      const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || '9999') : 9999;
      return aYear - bYear;
    });
  } else if (sortBy === 'archived') {
    // Filter to only archived projects, sorted newest first
    sortedItems = [...archiveData.allFilteredItems]
      .filter((p) => p.status === 'archived')
      .sort((a, b) => {
        const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || '0') : 0;
        const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || '0') : 0;
        return bYear - aYear;
      });
  } else if (sortBy === 'alpha') {
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'status') {
    // Sort by status: active > in-progress > archived
    const statusOrder = { active: 0, 'in-progress': 1, archived: 2 };
    sortedItems = [...archiveData.allFilteredItems].sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status]
    );
  } else {
    // "newest" - sort by timeline (most recent first)
    sortedItems = [...archiveData.allFilteredItems].sort((a, b) => {
      const aYear = a.timeline ? parseInt(a.timeline.match(/^\d{4}/)?.[0] || '0') : 0;
      const bYear = b.timeline ? parseInt(b.timeline.match(/^\d{4}/)?.[0] || '0') : 0;
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
    nonprofit: 'Nonprofit',
    code: 'Code',
    // photography: "Photography",  // disabled
    startup: 'Startup',
  };
  const availableCategories = Array.from(
    new Set(enabledProjects.map((p) => p.category).filter((c): c is NonNullable<typeof c> => !!c))
  ).sort((a, b) => a.localeCompare(b));

  // Get available tags from filtered results (for progressive filtering)
  // Tags maintain proper casing for display
  const availableTags = Array.from(
    new Set([...sortedArchiveData.allFilteredItems.flatMap((p) => p.tags || [])])
  ).sort((a, b) => a.localeCompare(b));

  // Check if filters are active for empty state
  const hasActiveFilters = Boolean(
    query || selectedCategory || selectedTags.length > 0 || status || sortBy !== 'newest'
  );

  // Compute dynamic title and description based on category
  const pageTitle = getPageTitle(selectedCategory);
  const pageDescription = getPageDescription(selectedCategory);

  // Calculate unique technologies for stats
  const uniqueTechnologies = new Set(
    sortedArchiveData.allFilteredItems.flatMap((p) => p.tech || [])
  );

  // Get view counts for all projects
  const projectSlugs = sortedArchiveData.allFilteredItems.map((project) => project.slug);
  let viewCounts = new Map<string, number>();
  try {
    viewCounts = await getMultipleProjectViews(projectSlugs);
  } catch (error) {
    console.error('Failed to fetch project view counts:', error);
    // Continue without view counts
  }

  // JSON-LD structured data for work collection
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: pageDescription,
    url: `${SITE_URL}/work`,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: sortedArchiveData.allFilteredItems.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.title,
          description: project.description,
          url: `${SITE_URL}/work/${project.slug}`,
          ...(project.links.find((l) => l.type === 'github') && {
            codeRepository: project.links.find((l) => l.type === 'github')?.href,
          }),
          keywords: [...(project.tech || []), ...(project.tags || [])].join(', '),
          creativeWorkStatus:
            project.status === 'active'
              ? 'Published'
              : project.status === 'in-progress'
                ? 'Draft'
                : 'Archived',
        },
      })),
    },
  };

  return (
    <PageLayout>
      <script {...getJsonLdScriptProps(jsonLd, nonce)} />
      <SmoothScrollToHash />

      {/* Hero section with Feed dropdown */}
      <ArchiveHero
        variant="full"
        title={pageTitle}
        description={pageDescription}
        stats={`${sortedArchiveData.totalItems} ${sortedArchiveData.totalItems === 1 ? 'project' : 'projects'} • ${uniqueTechnologies.size} ${uniqueTechnologies.size === 1 ? 'technology' : 'technologies'}`}
        actions={<FeedDropdown feedType="work" />}
        align="center"
      />

      {/* Content section with archive-width container */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.archive} ${CONTAINER_PADDING}`}>
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
        <div className={SPACING.section}>
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
      </div>
    </PageLayout>
  );
}
