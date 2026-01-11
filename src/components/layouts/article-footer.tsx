/**
 * Article Footer Component
 *
 * Standardized footer for individual item pages with related content.
 * Provides consistent navigation and engagement patterns.
 *
 * Note: Sources/references should use native markdown footnotes ([^1] syntax).
 *
 * @example
 * ```tsx
 * <ArticleFooter
 *   relatedItems={[{title: "Related Post", slug: "related"}]}
 *   renderRelatedItem={(item) => <PostCard post={item} />}
 * />
 * ```
 */

import { SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { BlogPostCTA } from "@/components/common";

export interface ArticleFooterProps<T = Record<string, unknown>> {
  /** Related items to display (optional) */
  relatedItems?: T[];

  /** Render function for related items */
  renderRelatedItem?: (item: T, index: number) => React.ReactNode;

  /** Related section title (default: "Related Articles") */
  relatedTitle?: string;

  /** Custom footer content (optional) */
  children?: React.ReactNode;

  /** Custom className */
  className?: string;
}

export function ArticleFooter<T>({
  relatedItems = [],
  renderRelatedItem,
  relatedTitle = "Related Articles",
  children,
  className,
}: ArticleFooterProps<T>) {
  const hasRelated = relatedItems.length > 0 && renderRelatedItem;
  const hasContent = hasRelated || children;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={cn(SPACING.section, className)}>
      {/* Call-to-Action Section */}
      <BlogPostCTA variant="centered" location="blog-post-end" />

      {/* Custom Footer Content */}
      {children && <section className={SPACING.subsection}>{children}</section>}
    </div>
  );
}
