import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { PAGE_LAYOUT, SPACING } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/common";

/**
 * Loading state for home page.
 * Uses actual layout components (PageHero, PageLayout) with skeleton children
 * to ensure structure matches the actual page.
 * 
 * @see src/app/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <PageLayout>
      <div className="space-y-10 md:space-y-14">
        {/* Hero Section - Uses PageHero component */}
        <Section>
          <PageHero
            variant="homepage"
            align="center"
            title={<Skeleton className="h-12 w-64 mx-auto" />}
            description={
              <>
                <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
                <Skeleton className="h-6 w-3/4 max-w-2xl mx-auto" />
              </>
            }
            image={<Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />}
            actions={
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 justify-center">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36 hidden sm:inline-flex" />
              </div>
            }
          />
        </Section>

        {/* Featured Post Section */}
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </Section>

        {/* Recent Activity Section */}
        <Section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            {/* Section header skeleton */}
            <div className="mb-6">
              <Skeleton className="h-8 w-32" />
            </div>
            {/* RecentActivity uses space-y-3 with Card components */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="group">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="shrink-0 w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </PageLayout>
  );
}
