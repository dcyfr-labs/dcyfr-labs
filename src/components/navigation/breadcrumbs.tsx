import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
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
 * - Mobile-responsive: collapses middle items on small screens
 * - Home icon for first item on mobile
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

  // For mobile: show Home icon, ellipsis for middle items, and last item
  // For desktop: show all items
  const showCollapsed = items.length > 2;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-sm text-muted-foreground overflow-hidden">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isMiddle = !isFirst && !isLast;

          // On mobile, hide middle items when there are more than 2 items
          const hiddenOnMobile = showCollapsed && isMiddle;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li
                className={`flex items-center gap-1.5 sm:gap-2 min-w-0 ${
                  hiddenOnMobile ? "hidden sm:flex" : "flex"
                }`}
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-theme flex items-center gap-1 shrink-0"
                  >
                    {/* Show home icon on mobile for first item */}
                    {isFirst ? (
                      <>
                        <Home
                          className="h-3.5 w-3.5 sm:hidden"
                          aria-label="Home"
                        />
                        <span className="hidden sm:inline">{item.label}</span>
                      </>
                    ) : (
                      <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                        {item.label}
                      </span>
                    )}
                  </Link>
                ) : (
                  <span
                    className={`truncate font-medium ${
                      isLast ? "text-foreground" : ""
                    }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {/* Show ellipsis on mobile for collapsed middle items */}
              {isFirst && showCollapsed && (
                <li className="flex sm:hidden items-center gap-1.5">
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground/70">…</span>
                </li>
              )}

              {!isLast && (
                <ChevronRight
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground/50 ${
                    hiddenOnMobile ? "hidden sm:block" : ""
                  } ${isFirst && showCollapsed ? "hidden sm:block" : ""}`}
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
