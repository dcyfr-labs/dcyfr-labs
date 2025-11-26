import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { PAGE_LAYOUT, SPACING } from "@/lib/design-tokens";

/**
 * Loading state for contact page.
 * Uses PageHero component to match actual page structure.
 * 
 * @see src/app/contact/page.tsx - Must match structure
 */
export default function Loading() {
  return (
    <PageLayout>
      <div className="space-y-10 md:space-y-14">
        {/* Hero Section - Uses PageHero component */}
        <PageHero
          title="Contact Me"
          description={<Skeleton className="h-6 w-full max-w-2xl" />}
        />

        {/* Contact Form Section */}
        <section className={PAGE_LAYOUT.section.container}>
          <div className={SPACING.content}>
            <Card className="p-6">
              <div className="space-y-6">
                {/* Name field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
                {/* Email field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
                {/* Message field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-32 w-full" />
                </div>
                {/* Submit button */}
                <Skeleton className="h-10 w-32" />
              </div>
            </Card>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
