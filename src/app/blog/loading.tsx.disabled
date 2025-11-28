import { PostListSkeleton } from "@/components/post-list-skeleton";
import { ArchiveLayout } from "@/components/layouts/archive-layout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for blog listing page.
 * Uses ArchiveLayout component to match actual page structure.
 * 
 * @see src/app/blog/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <ArchiveLayout
      title={<Skeleton className="h-10 w-32" />}
      description={<Skeleton className="h-6 w-3/4 max-w-2xl" />}
      filters={
        <>
          {/* Search form skeleton */}
          <Skeleton className="h-10 w-full rounded-md mb-4" />

          {/* Tag filters skeleton */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </>
      }
    >
      <PostListSkeleton count={5} />
    </ArchiveLayout>
  );
}
