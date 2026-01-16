import Link from "next/link";
import { PageLayout } from "@/components/layouts";
import { PageHero } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import {
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  TYPOGRAPHY,
  ANIMATION,
} from "@/lib/design-tokens";

// Force dynamic rendering - don't attempt to prerender during build
// 404 page is rendered on-demand when routes are not found
export const dynamic = 'force-dynamic';

const recommendedLinks = [
  {
    label: "Home",
    href: "/",
    description: "Return to the homepage",
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Explore articles and insights",
  },
  {
    label: "Work",
    href: "/work",
    description: "View my portfolio projects",
  },
  {
    label: "About",
    href: "/about",
    description: "Learn more about me",
  },
  {
    label: "Contact",
    href: "/contact",
    description: "Get in touch",
  },
];

export default function NotFound() {
  return (
    <PageLayout>
      <PageHero
        title="Page not found"
        description="The page you&apos;re looking for doesn&apos;t exist."
        align="center"
        actions={
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        }
      />

      {/* Recommended Content Section */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING} pt-12 md:pt-16`}>
        <div className="text-center">
          <h2 className={`${TYPOGRAPHY.h2.standard} mb-2`}>
            Recommended Links
          </h2>
          <p className={`${TYPOGRAPHY.description} mb-8`}>
            Here are some helpful links to get you back on track.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative flex flex-col rounded-lg border border-border/40 p-4 hover:border-border/80 hover:bg-muted/40 ${ANIMATION.transition.theme}`}
            >
              <h3 className={`${TYPOGRAPHY.h3.standard} ${ANIMATION.transition.theme}`}>
                {link.label}
              </h3>
              <p className={`${TYPOGRAPHY.metadata} mt-2`}>
                {link.description}
              </p>
              <div className={`absolute inset-0 rounded-lg bg-linear-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 ${ANIMATION.transition.appearance}`} />
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
