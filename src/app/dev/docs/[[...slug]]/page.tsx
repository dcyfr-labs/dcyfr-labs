import { createPageMetadata } from "@/lib/metadata";
import { PageLayout } from "@/components/layouts";
import { TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";

export const metadata = createPageMetadata({
  title: "Dev Docs",
  description: "Developer documentation",
  path: "/dev/docs",
});

export default function DevDocsPage() {
  return (
    <PageLayout>
      <div className="text-center">
        <h1 className={TYPOGRAPHY.h1.hero}>
          Developer Documentation
        </h1>
        <p className={`${TYPOGRAPHY.description} mt-4`}>
          Documentation page coming soon.
        </p>
      </div>
    </PageLayout>
  );
}
