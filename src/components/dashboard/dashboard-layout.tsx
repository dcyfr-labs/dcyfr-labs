import { cn } from "@/lib/utils";
import { TYPOGRAPHY, CONTAINER_WIDTHS, CONTAINER_PADDING, CONTAINER_VERTICAL_PADDING } from "@/lib/design-tokens";

/**
 * Universal dashboard layout component for admin/developer tools
 * 
 * Provides consistent structure for all dashboard pages with:
 * - Standardized spacing and max-width constraints
 * - Title, description, and action buttons
 * - Optional filter section
 * - Responsive padding
 * 
 * @example
 * ```tsx
 * <DashboardLayout
 *   title="Analytics Dashboard"
 *   description="View post metrics and trends"
 *   actions={<RefreshButton />}
 *   filters={<SearchAndFilters />}
 * >
 *   <DashboardStats data={stats} />
 *   <DashboardTable data={posts} />
 * </DashboardLayout>
 * ```
 */

interface DashboardLayoutProps {
  /** Page title (h1) */
  title: string;
  /** Optional description text below title */
  description?: string;
  /** Optional action buttons (refresh, export, etc.) */
  actions?: React.ReactNode;
  /** Optional filter controls (search, dropdowns, etc.) */
  filters?: React.ReactNode;
  /** Dashboard content (stats, tables, charts) */
  children: React.ReactNode;
  /** Additional CSS classes for container */
  className?: string;
}

export function DashboardLayout({
  title,
  description,
  actions,
  filters,
  children,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn("mx-auto", CONTAINER_WIDTHS.archive, CONTAINER_PADDING, CONTAINER_VERTICAL_PADDING, className)}>
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={cn(TYPOGRAPHY.h1.hero, "mb-2")}>{title}</h1>
          {description && (
            <p className="text-muted-foreground text-base">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Filters Section */}
      {filters && (
        <div className="mb-6">
          {filters}
        </div>
      )}

      {/* Content Section */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
