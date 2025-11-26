import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/layouts/page-layout";
import { PAGE_LAYOUT, SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { Logo } from "@/components/common/logo";

/**
 * Loading state for about page.
 * Uses custom hero structure with avatar to match actual page.
 * 
 * @see src/app/about/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <PageLayout>
      <div className="space-y-10 md:space-y-14">
        {/* Custom Hero Section with Avatar */}
        <section className={PAGE_LAYOUT.hero.container}>
          <div className="flex flex-col md:flex-row md:items-start md:gap-6 lg:gap-8">
            {/* Avatar skeleton */}
            <div className="shrink-0 mb-6 md:mb-0">
              <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
            </div>
            {/* Content */}
            <div className="flex-1 space-y-4">
              <h1 className={TYPOGRAPHY.h1.hero}>
                <span className="flex items-center gap-2">
                  Drew <Logo className="pb-2" width={32} height={32} />
                </span>
              </h1>
              <Skeleton className="h-6 w-full max-w-2xl" />
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-3 text-muted-foreground">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </section>

        {/* Professional Background Section */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </Card>
              ))}
            </div>
            
            {/* Current Role */}
            <Skeleton className="h-6 w-48 mb-3" />
            <Card className="p-5 space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          </div>
        </section>

        {/* Connect with Me Section */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            {/* Availability banner skeleton */}
            <Skeleton className="h-12 w-full mb-6 rounded-lg" />
            {/* Social links grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
