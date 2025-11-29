/**
 * Article Footer Component
 * 
 * Standardized footer for individual item pages with share buttons and related content.
 * Provides consistent navigation and engagement patterns.
 * 
 * Note: Sources/references should use native markdown footnotes ([^1] syntax) instead
 * of the deprecated sources prop.
 * 
 * @example
 * ```tsx
 * <ArticleFooter
 *   shareUrl="https://cyberdrew.dev/blog/my-post"
 *   shareTitle="My Blog Post"
 *   relatedItems={[{title: "Related Post", slug: "related"}]}
 *   renderRelatedItem={(item) => <PostCard post={item} />}
 * />
 * ```
 */

import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { BlogPostCTA } from "@/components/common";

export interface ArticleFooterProps<T = Record<string, unknown>> {
  /** Share URL (enables share section) */
  shareUrl?: string;
  
  /** Share title */
  shareTitle?: string;
  
  /** Custom share component */
  shareComponent?: React.ReactNode;
  
  /** Tags/keywords (optional) */
  tags?: string[];
  
  /** Function to generate tag URLs (returns URL string) */
  onTagClick?: (tag: string) => string;
  
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
  shareUrl,
  shareComponent,
  tags = [],
  onTagClick,
  relatedItems = [],
  renderRelatedItem,
  relatedTitle = "Related Articles",
  children,
  className,
}: ArticleFooterProps<T>) {
  const hasShare = shareUrl || shareComponent;
  const hasTags = tags.length > 0;
  const hasRelated = relatedItems.length > 0 && renderRelatedItem;
  const hasContent = hasShare || hasTags || hasRelated || children;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={cn(SPACING.section, className)}>
      {/* Tags Section */}
      {hasTags && (
        <section className={SPACING.subsection}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Tagged:</span>
            {tags.map((tag) => {
              const tagUrl = onTagClick?.(tag);
              const badgeContent = (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    tagUrl &&
                      "cursor-pointer hover:bg-secondary/80 transition-colors"
                  )}
                >
                  {tag}
                </Badge>
              );

              return tagUrl ? (
                <Link key={tag} href={tagUrl}>
                  {badgeContent}
                </Link>
              ) : (
                badgeContent
              );
            })}
          </div>
        </section>
      )}

      {/* Share Section */}
      {hasShare && (
        <section className={SPACING.subsection}>
          <h2 className={cn(TYPOGRAPHY.h2.standard, "mb-4")}>
            Share this blog post
          </h2>
          {shareComponent || (
            <div className="flex gap-2">
              <p className="text-sm text-muted-foreground">
                Share functionality will be rendered by the parent component
              </p>
            </div>
          )}
        </section>
      )}

      {/* Call-to-Action Section */}
      <BlogPostCTA variant="centered" location="blog-post-end" />

      {/* Custom Footer Content */}
      {children && <section className={SPACING.subsection}>{children}</section>}
    </div>
  );
}
