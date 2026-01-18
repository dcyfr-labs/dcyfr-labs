import Link from 'next/link';
import { PageLayout } from '@/components/layouts';
import { PageHero } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CONTAINER_WIDTHS,
  CONTAINER_PADDING,
  TYPOGRAPHY,
  SPACING,
  ANIMATION,
} from '@/lib/design-tokens';

// Force dynamic rendering - don't attempt to prerender during build
// 404 page is rendered on-demand when routes are not found
export const dynamic = 'force-dynamic';

const recommendedLinks = [
  {
    label: 'Home',
    href: '/',
    description: 'Return to the homepage',
  },
  {
    label: 'About',
    href: '/about',
    description: 'Learn more about us',
  },
  {
    label: 'Contact',
    href: '/contact',
    description: 'Get in touch',
  },
  {
    label: 'Activity',
    href: '/activity',
    description: 'See our latest updates',
  },
  {
    label: 'Blog',
    href: '/blog',
    description: 'Explore articles and insights',
  },
  {
    label: 'Work',
    href: '/work',
    description: 'View our portfolio projects',
  },
];

export default function NotFound() {
  return (
    <PageLayout>
      <PageHero
        title="Page not found"
        description="The page you're looking for doesn't exist."
        align="center"
      />

      {/* Recommended Content Section */}
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard} ${CONTAINER_PADDING}`}>
        <div className={`${SPACING.subsection}`}>
          {/* <div className="text-center">
            <h2 className={`${TYPOGRAPHY.h2.standard} mb-2`}>Recommended Links</h2>
            <p className={`${TYPOGRAPHY.description} mb-${SPACING.lg}`}>
              Here are some helpful links to get you back on track.
            </p>
          </div> */}

          {/* Links Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${SPACING.contentGrid}`}>
            {recommendedLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card
                  className={`group h-full border-border/40 hover:border-border/80 hover:bg-muted/40 ${ANIMATION.transition.theme} cursor-pointer`}
                >
                  <CardHeader>
                    <CardTitle
                      className={`${TYPOGRAPHY.h3.standard} ${ANIMATION.transition.theme}`}
                    >
                      {link.label}
                    </CardTitle>
                    <CardDescription className={TYPOGRAPHY.metadata}>
                      {link.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
