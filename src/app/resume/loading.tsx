import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { PAGE_LAYOUT, SPACING } from "@/lib/design-tokens";

/**
 * Loading state for resume page.
 * Uses PageHero component to match actual page structure.
 * Includes Stats and UnifiedTimeline sections.
 * 
 * @see src/app/resume/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <PageLayout>
      <div className="space-y-10 md:space-y-14">
        {/* Hero Section - Uses PageHero component */}
        <PageHero
          title="Drew's Resume"
          description={
            <>
              <Skeleton className="h-6 w-full max-w-3xl" />
              <Skeleton className="h-6 w-4/5 max-w-3xl" />
            </>
          }
        />

        {/* Stats Overview Section */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Timeline Section (Experience + Education) */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Skeleton className="h-8 w-56 mb-6" />
            {/* Timeline items */}
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-full w-0.5 flex-1" />
                  </div>
                  {/* Timeline card */}
                  <Card className="p-5 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <Skeleton className="h-6 w-64" />
                      <Skeleton className="h-4 w-32 mt-1 md:mt-0" />
                    </div>
                    <Skeleton className="h-4 w-48 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills & Certifications Section */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Skeleton className="h-8 w-56 mb-6" />
            <div className="grid gap-6 md:grid-cols-2">
              {/* Skills */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-24 mb-3" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-6 w-20" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Certifications */}
              <div>
                <Skeleton className="h-6 w-32 mb-3" />
                <Card className="p-5">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
