import type { Metadata } from 'next';
import { Suspense } from 'react';
import { posts } from '@/data/posts';
import { PageLayout } from '@/components/layouts';
import { createPageMetadata } from '@/lib/metadata';
import { CONTAINER_WIDTHS } from '@/lib/design-tokens';
import { BookmarksClient } from './bookmarks-client';
import { getBasicActivities } from '@/lib/activity/helpers.server';
import { ActivitySkeleton } from '@/components/activity';

// Force dynamic rendering - this page requires database/Redis access for activities
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Bookmarks',
  description: 'Your saved content for later reading',
  path: '/bookmarks',
});

/**
 * Inner async component so the data fetch is nested inside a Suspense boundary,
 * enabling streaming SSR — the page shell renders immediately while activities load.
 */
async function BookmarksContent() {
  const activities = await getBasicActivities();
  return <BookmarksClient posts={posts} activities={activities} />;
}

/**
 * Bookmarks Page (Server Component)
 *
 * Fetches all posts and activities server-side and passes to client component.
 * Client component handles localStorage bookmark filtering.
 * Supports bookmarking both blog posts AND all activity types (GitHub, projects, etc.)
 */
export default function BookmarksPage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <Suspense fallback={<ActivitySkeleton />}>
          <BookmarksContent />
        </Suspense>
      </div>
    </PageLayout>
  );
}
