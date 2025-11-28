import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

/**
 * Breadcrumb item definition
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Breadcrumbs Component
 * 
 * Displays hierarchical navigation path for improved UX and SEO.
 * Shows clickable links for all items except the current page.
 * 
 * Features:
 * - Mobile-responsive with text truncation
 * - Semantic HTML with aria-label for accessibility
 * - Muted colors for visual hierarchy
 * - Chevron separators between items
 * 
 * @param props.items - Array of breadcrumb items (label + optional href)
 * 
 * @example
 * ```tsx
 * <Breadcrumbs items={[
 *   { label: "Home", href: "/" },
 *   { label: "Blog", href: "/blog" },
 *   { label: "Post Title" }
 * ]} />
 * ```
 */
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link 
                    href={item.href}
                    className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span 
                    className="truncate max-w-[150px] sm:max-w-none"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <ChevronRight 
                  className="h-4 w-4 flex-shrink-0" 
                  aria-hidden="true" 
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
