/**
 * Article Layout Component
 * 
 * Universal wrapper for individual item pages (blog posts, project details).
 * Provides consistent structure with header, content, and footer sections.
 * 
 * **Loading State Support:**
 * Pass `loading={true}` to render skeleton version automatically, ensuring
 * loading states always match the actual structure.
 * 
 * @example Standard usage
 * ```tsx
 * <ArticleLayout
 *   header={<ArticleHeader title={post.title} date={post.publishedAt} tags={post.tags} />}
 *   footer={<ArticleFooter relatedItems={related} shareUrl={shareUrl} />}
 * >
 *   <MDX source={post.content} />
 * </ArticleLayout>
 * ```
 * 
 * @example Loading state
 * ```tsx
 * <ArticleLayout loading />
 * ```
 */

import { CONTAINER_WIDTHS, SPACING, CONTAINER_VERTICAL_PADDING, CONTAINER_PADDING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import {
  SkeletonHeading,
  SkeletonMetadata,
  SkeletonParagraphs,
  SkeletonBadges,
  SkeletonText
} from '@/components/ui/skeleton-primitives';

export interface ArticleLayoutProps {
  /** Article header (title, metadata, badges) */
  header?: React.ReactNode;
  
  /** Main content */
  children?: React.ReactNode;
  
  /** Article footer (share, related, sources) */
  footer?: React.ReactNode;
  
  /** Use prose container width (default: true) */
  useProseWidth?: boolean;
  
  /** Custom className for container */
  className?: string;
  
  /** Custom className for content wrapper */
  contentClassName?: string;
  
  /** Loading state - renders skeleton version automatically */
  loading?: boolean;
  
  /** Number of content paragraphs for skeleton (default: 8) */
  skeletonParagraphs?: number;
}

export function ArticleLayout({
  header,
  children,
  footer,
  useProseWidth = true,
  className,
  contentClassName,
  loading = false,
  skeletonParagraphs = 8,
}: ArticleLayoutProps) {
  const containerWidth = useProseWidth ? CONTAINER_WIDTHS.prose : CONTAINER_WIDTHS.content;

  // Loading state - render skeleton with identical structure
  if (loading) {
    return (
      <article className={cn(containerWidth, "mx-auto", CONTAINER_PADDING, CONTAINER_VERTICAL_PADDING, className)}>
        {/* Header skeleton */}
        <header className="mb-8 md:mb-10">
          <SkeletonMetadata className="mb-4" />
          <SkeletonHeading level="h1" variant="article" width="w-3/4" className="mb-4" />
          <SkeletonText lines={2} lastLineWidth="w-5/6" className="mb-4" />
          <SkeletonBadges count={4} />
        </header>

        {/* Content skeleton */}
        <div className={cn(SPACING.content, contentClassName)}>
          <SkeletonParagraphs count={skeletonParagraphs} linesPerParagraph={3} />
        </div>

        {/* Footer skeleton */}
        <footer className="mt-12 md:mt-16 pt-8 border-t">
          <SkeletonHeading level="h3" width="w-32" className="mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonText lines={2} />
            <SkeletonText lines={2} />
          </div>
        </footer>
      </article>
    );
  }

  return (
    <article className={cn(containerWidth, "mx-auto", CONTAINER_PADDING, CONTAINER_VERTICAL_PADDING, className)}>
      {/* Header */}
      {header && (
        <header className="mb-8 md:mb-10">
          {header}
        </header>
      )}

      {/* Content */}
      <div className={cn(contentClassName)}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <footer className="mt-12 md:mt-16 pt-8 border-t">
          {footer}
        </footer>
      )}
    </article>
  );
}
