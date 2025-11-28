import { Card, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for ProjectCard component.
 * 
 * ⚠️ SYNC REQUIRED WITH: src/components/project-card.tsx
 * 
 * Structure must match ProjectCard:
 * - Div wrapper with block, group, cursor-pointer styling
 * - Card with flex, h-full, relative positioning
 * - CardHeader with space-y-1.5, px-4 sm:px-6, py-4 sm:py-5
 *   - Timeline with status badge
 *   - Title
 *   - Description
 *   - Tech Stack badges (max 3 shown)
 * - CardFooter with external project links only (flex-row, py-3 sm:py-4)
 *   - No "View Details" button (card itself is clickable)
 * 
 * Last synced: 2025-11-11 (Fixed nested link issue - using div + router instead)
 * 
 * @see /docs/components/project-card.md for structure details
 */
export function ProjectCardSkeleton() {
  return (
    <div className="block group cursor-pointer">
      <Card className="flex h-full flex-col overflow-hidden relative">
        {/* Background placeholder */}
        <div className="absolute inset-0 z-0 bg-muted/20" />

        {/* Content - matches CardHeader structure */}
        <CardHeader className="space-y-1.5 relative z-10 px-4 sm:px-6 py-4 sm:py-5">
          {/* Timeline with status badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" /> {/* Badge */}
            <Skeleton className="h-3 w-24" /> {/* Timeline */}
          </div>
          
          {/* Title */}
          <Skeleton className="h-6 sm:h-7 md:h-8 w-48 sm:w-56" />

          {/* Description - 2 lines */}
          <CardDescription className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardDescription>

          {/* Tech Stack badges (max 3) */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Skeleton className="h-5 sm:h-6 w-16" />
            <Skeleton className="h-5 sm:h-6 w-20" />
            <Skeleton className="h-5 sm:h-6 w-14" />
          </div>
        </CardHeader>

        {/* External project links only (no View Details button) */}
        <CardFooter className="mt-auto flex flex-row flex-wrap gap-2 sm:gap-3 relative z-10 px-4 sm:px-6 py-3 sm:py-4">
          <Skeleton className="h-10 w-20 rounded-md" /> {/* External link */}
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Skeleton loader for multiple project cards.
 * 
 * @param count - Number of skeleton cards to render (default: 3)
 */
export function ProjectListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
