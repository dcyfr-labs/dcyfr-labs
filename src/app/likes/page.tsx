import type { Metadata } from 'next';
import { Suspense } from 'react';
import { posts } from '@/data/posts';
import { PageLayout } from '@/components/layouts';
import { createPageMetadata } from '@/lib/metadata';
import { CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { LikesClient } from './likes-client';
import { getBasicActivities } from '@/lib/activity/helpers.server';
import { ActivitySkeleton } from '@/components/activity';

// Force dynamic rendering - don't attempt to prerender during build
// This page requires database/Redis access for activities
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Likes',
  description: "Content you've liked and engaged with",
  path: '/likes',
});

/**
 * Inner async component so the data fetch is nested inside a Suspense boundary,
 * enabling streaming SSR — the page shell renders immediately while activities load.
 */
async function LikesContent() {
  const activities = await getBasicActivities();
  return <LikesClient posts={posts} activities={activities} />;
}

/**
 * Likes Page (Server Component)
 *
 * Fetches all posts and activities server-side and passes to client component.
 * Client component handles localStorage like filtering.
 * Supports liking both blog posts AND all activity types (GitHub, projects, etc.)
 */
export default function LikesPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <Suspense fallback={<ActivitySkeleton />}>
          <LikesContent />
        </Suspense>
      </div>
    </PageLayout>
  );
}
