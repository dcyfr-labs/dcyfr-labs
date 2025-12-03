import { Project } from "@/data/projects";
import { DefaultProjectLayout } from "./default-project-layout";
import { CodeProjectLayout } from "./code-project-layout";
import { GalleryProjectLayout } from "./gallery-project-layout";

interface ProjectLayoutStrategyProps {
  /** Project data with category-specific content */
  project: Project;
  /** CSP nonce for inline scripts */
  nonce: string;
  /** Base path for project URLs (default: '/work') */
  basePath?: string;
}

/**
 * ProjectLayoutStrategy Component
 * 
 * Strategy pattern selector that renders the appropriate layout based on project category.
 * 
 * Category Mapping:
 * - `code` → CodeProjectLayout (code demos, syntax highlighted blocks, references)
 * - `photography` → GalleryProjectLayout (photo grid with masonry/uniform toggle, lightbox)
 * - `community`, `nonprofit`, `startup` → DefaultProjectLayout (standard layout)
 * 
 * @example
 * ```tsx
 * <ProjectLayoutStrategy project={project} nonce={nonce} basePath="/work" />
 * ```
 */
export function ProjectLayoutStrategy({ project, nonce, basePath = '/work' }: ProjectLayoutStrategyProps) {
  switch (project.category) {
    case "code":
      return <CodeProjectLayout project={project} nonce={nonce} basePath={basePath} />;
    case "photography":
      return <GalleryProjectLayout project={project} nonce={nonce} basePath={basePath} />;
    default:
      // community, nonprofit, startup use default layout
      return <DefaultProjectLayout project={project} nonce={nonce} basePath={basePath} />;
  }
}
