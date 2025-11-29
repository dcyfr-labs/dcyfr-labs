/**
 * Project Layout Components Index
 * 
 * Category-based layouts for portfolio project detail pages.
 * Uses strategy pattern to select appropriate layout based on project category.
 * 
 * Layout Types:
 * - DefaultProjectLayout: community, nonprofit, startup (standard layout)
 * - CodeProjectLayout: code projects (demos, codeblocks, references)
 * - GalleryProjectLayout: photography (photo grid with lightbox)
 * 
 * @example
 * ```tsx
 * import { ProjectLayoutStrategy } from '@/components/projects/layouts';
 * 
 * // In [slug]/page.tsx
 * <ProjectLayoutStrategy project={project} nonce={nonce} />
 * ```
 */

// Strategy Pattern Selector
export { ProjectLayoutStrategy } from './project-layout-strategy';

// Individual Layouts
export { DefaultProjectLayout } from './default-project-layout';
export { CodeProjectLayout } from './code-project-layout';
export { GalleryProjectLayout } from './gallery-project-layout';
