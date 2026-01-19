/**
 * Archive Layout Component
 *
 * Universal wrapper for list/grid pages (blog, projects, archives).
 * Provides consistent structure with header, filters, content, and pagination.
 * Now uses PageHero component internally for consistent hero sections.
 *
 * **Loading State Support:**
 * Pass `loading={true}` to render skeleton version automatically, ensuring
 * loading states always match the actual structure.
 *
 * @example Standard usage
 * ```tsx
 * <ArchiveLayout
 *   title="Blog Posts"
 *   description="Our writing about web development"
 *   filters={<ArchiveFilters {...filterProps} />}
 *   pagination={<ArchivePagination {...paginationProps} />}
 * >
 *   <PostList posts={posts} />
 * </ArchiveLayout>
 * ```
 *
 * @example Loading state
 * ```tsx
 * <ArchiveLayout loading>
 *   <PostListSkeleton count={5} />
 * </ArchiveLayout>
 * ```
 */

import {
  CONTAINER_WIDTHS,
  SPACING,
  CONTAINER_VERTICAL_PADDING,
  CONTAINER_PADDING,
} from '@/lib/design-tokens';
import { PageHero } from '@/components/layouts';
import { cn } from '@/lib/utils';

export interface ArchiveLayoutProps {
  /** Page title */
  title?: string | React.ReactNode;

  /** Page description (optional) */
  description?: string | React.ReactNode;

  /** Filter controls (optional) */
  filters?: React.ReactNode;

  /** Main content */
  children: React.ReactNode;

  /** Pagination controls (optional) */
  pagination?: React.ReactNode;

  /** Item count to display in header (optional) */
  itemCount?: number;

  /** Custom className for container */
  className?: string;

  /** Custom className for content section */
  contentClassName?: string;

  /** Loading state - renders skeleton version */
  loading?: boolean;
}

export function ArchiveLayout({
  title,
  description,
  filters,
  children,
  pagination,
  itemCount,
  className,
  contentClassName,
  loading = false,
}: ArchiveLayoutProps) {
  // Archive pages always use standard variant
  const variant = 'standard';
  return (
    <>
      {/* Header using PageHero for consistency */}
      <section id="hero">
        <PageHero
          title={title}
          description={description}
          itemCount={itemCount}
          loading={loading}
          variant={variant}
        />
      </section>

      <div
        className={cn(
          'mx-auto',
          CONTAINER_WIDTHS.archive,
          CONTAINER_PADDING,
          'pb-14 md:pb-20',
          className
        )}
      >
        {/* Filters */}
        {filters && <div className="mb-8">{filters}</div>}

        {/* Content */}
        <div className={cn(SPACING.content, contentClassName)}>{children}</div>

        {/* Pagination */}
        {pagination && <div className="mt-12">{pagination}</div>}
      </div>
    </>
  );
}
