import { ProjectListSkeleton } from "@/components/project-card-skeleton";
import { GitHubHeatmapSkeleton } from "@/components/github-heatmap-skeleton";
import { ArchiveLayout } from "@/components/layouts/archive-layout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for projects page.
 * Uses ArchiveLayout component to match actual page structure.
 * 
 * @see src/app/projects/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <ArchiveLayout
      title={<Skeleton className="h-10 w-40" />}
      description={<Skeleton className="h-6 w-3/4 max-w-2xl" />}
    >
      {/* GitHub Heatmap Section */}
      <div className="mb-8">
        <GitHubHeatmapSkeleton />
      </div>
      
      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProjectListSkeleton count={4} />
      </div>
    </ArchiveLayout>
  );
}
