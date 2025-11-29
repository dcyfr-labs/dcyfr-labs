/**
 * Project Content Loader
 * 
 * Utility for loading category-specific content for projects.
 * Content is stored in separate files per project for better organization.
 * 
 * Directory structure:
 * src/content/projects/
 * ├── code/
 * │   └── {slug}.ts    # CodeProjectContent
 * └── photography/
 *     └── {slug}.ts    # GalleryProjectContent
 * 
 * @example
 * ```tsx
 * import { getProjectContent } from "@/content/projects";
 * 
 * const content = await getProjectContent(project.slug, project.category);
 * ```
 */

import type { CodeProjectContent, GalleryProjectContent, ProjectCategory } from "@/data/projects";

// Type for content loaders
type ContentLoader<T> = () => Promise<{ default: T }>;

// Content registries (will be populated by dynamic imports)
const codeContentRegistry: Record<string, ContentLoader<CodeProjectContent>> = {};
const galleryContentRegistry: Record<string, ContentLoader<GalleryProjectContent>> = {};

/**
 * Register code project content
 * Call this to register content for a code project
 */
export function registerCodeContent(slug: string, loader: ContentLoader<CodeProjectContent>) {
  codeContentRegistry[slug] = loader;
}

/**
 * Register gallery project content  
 * Call this to register content for a photography project
 */
export function registerGalleryContent(slug: string, loader: ContentLoader<GalleryProjectContent>) {
  galleryContentRegistry[slug] = loader;
}

/**
 * Get project content based on category
 * Returns the appropriate content type for the project category
 */
export async function getProjectContent(
  slug: string,
  category?: ProjectCategory
): Promise<CodeProjectContent | GalleryProjectContent | null> {
  try {
    if (category === "code" && codeContentRegistry[slug]) {
      const contentModule = await codeContentRegistry[slug]();
      return contentModule.default;
    }

    if (category === "photography" && galleryContentRegistry[slug]) {
      const contentModule = await galleryContentRegistry[slug]();
      return contentModule.default;
    }

    return null;
  } catch (error) {
    console.error(`Failed to load content for project: ${slug}`, error);
    return null;
  }
}

/**
 * Check if project has additional content
 */
export function hasProjectContent(slug: string, category?: ProjectCategory): boolean {
  if (category === "code") {
    return slug in codeContentRegistry;
  }
  if (category === "photography") {
    return slug in galleryContentRegistry;
  }
  return false;
}
