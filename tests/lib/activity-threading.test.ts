/**
 * Tests for Activity Threading System
 *
 * Tests the conversation-style threading logic that groups related activities.
 */

import { describe, it, expect } from 'vitest';
import {
  groupActivitiesIntoThreads,
  getCollapsedSummary,
  type ActivityThread,
} from '@/lib/activity';
import type { ActivityItem } from '@/lib/activity';

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

function createActivity(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: `activity-${Math.random()}`,
    source: 'blog',
    verb: 'published',
    title: 'Test Activity',
    timestamp: new Date(),
    href: '/test',
    ...overrides,
  };
}

function createBlogPost(title: string, postId: string, daysAgo = 0): ActivityItem {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  return createActivity({
    id: `blog-${postId}`,
    source: 'blog',
    verb: 'published',
    title,
    timestamp,
    href: `/blog/${postId}`,
    meta: {
      id: postId,
      postId,
    },
  });
}

function createTrendingPost(postTitle: string, postId: string, daysAgo = 0): ActivityItem {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  return createActivity({
    id: `trending-${postId}`,
    source: 'trending',
    verb: 'achieved',
    title: postTitle, // Use same title for threading match
    timestamp,
    href: `/blog/${postId}`,
    meta: {
      postId,
      trending: true,
    },
  });
}

function createMilestone(
  postTitle: string,
  postId: string,
  count: number,
  daysAgo = 0
): ActivityItem {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  return createActivity({
    id: `milestone-${postId}-${count}`,
    source: 'milestone',
    verb: 'achieved',
    title: postTitle, // Use same title for threading match
    timestamp,
    href: `/blog/${postId}`,
    meta: {
      postId,
      milestone: count,
    },
  });
}

function createProject(name: string, repo: string, daysAgo = 0): ActivityItem {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  return createActivity({
    id: `project-${repo}`,
    source: 'project',
    verb: 'launched',
    title: name,
    timestamp,
    href: `/work/${repo}`,
    meta: {
      repo,
    },
  });
}

function createCommit(repo: string, message: string, daysAgo = 0): ActivityItem {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  return createActivity({
    id: `commit-${repo}-${Math.random()}`,
    source: 'github',
    verb: 'committed',
    title: message,
    timestamp,
    href: `https://github.com/user/${repo}/commit/abc123`,
    meta: {
      repo,
    },
  });
}

// ============================================================================
// THREADING LOGIC TESTS
// ============================================================================

describe('Activity Threading System', () => {
  describe('groupActivitiesIntoThreads', () => {
    it('should return empty array for no activities', () => {
      const threads = groupActivitiesIntoThreads([]);
      expect(threads).toEqual([]);
    });

    it('should create standalone thread for single activity', () => {
      const activity = createBlogPost('My Post', 'my-post');
      const threads = groupActivitiesIntoThreads([activity]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(activity);
      expect(threads[0].replies).toEqual([]);
      expect(threads[0].collapsedCount).toBe(0);
    });

    it('should preserve chronological order (newest first)', () => {
      const older = createBlogPost('Old Post', 'old', 5);
      const newer = createBlogPost('New Post', 'new', 1);

      const threads = groupActivitiesIntoThreads([newer, older]);

      expect(threads).toHaveLength(2);
      expect(threads[0].primary.title).toBe('New Post');
      expect(threads[1].primary.title).toBe('Old Post');
    });
  });

  describe('Blog Post Threading', () => {
    it('should thread blog post with its trending notification', () => {
      const post = createBlogPost('Security Guide', 'security-guide', 2);
      const trending = createTrendingPost('Security Guide', 'security-guide', 1);

      // Pass blog post first so it becomes the primary (even though trending is newer)
      const threads = groupActivitiesIntoThreads([post, trending]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(post);
      expect(threads[0].replies).toHaveLength(1);
      expect(threads[0].replies[0]).toEqual(trending);
    });

    it('should thread blog post with milestone notifications', () => {
      const post = createBlogPost('Popular Post', 'popular', 3);
      const milestone1 = createMilestone('Popular Post', 'popular', 1000, 2);
      const milestone2 = createMilestone('Popular Post', 'popular', 5000, 1);

      // Blog post first to be the primary
      const threads = groupActivitiesIntoThreads([post, milestone1, milestone2]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(post);
      expect(threads[0].replies).toHaveLength(2);
      expect(threads[0].replies).toContain(milestone1);
      expect(threads[0].replies).toContain(milestone2);
    });

    it('should thread blog post with trending + milestones', () => {
      const post = createBlogPost('Viral Post', 'viral', 5);
      const trending = createTrendingPost('Viral Post', 'viral', 4);
      const milestone1 = createMilestone('Viral Post', 'viral', 1000, 3);
      const milestone2 = createMilestone('Viral Post', 'viral', 10000, 1);

      // Blog post first to be the primary
      const threads = groupActivitiesIntoThreads([post, trending, milestone1, milestone2]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(post);
      expect(threads[0].replies).toHaveLength(3);
    });

    it('should NOT thread posts with different postIds', () => {
      const post1 = createBlogPost('Post 1', 'post-1', 2);
      const trending1 = createTrendingPost('Post 1', 'post-1', 1);
      const post2 = createBlogPost('Post 2', 'post-2', 4);
      const trending2 = createTrendingPost('Post 2', 'post-2', 3);

      // Blog posts first to be primaries, with their trending notifications nearby
      const threads = groupActivitiesIntoThreads([post1, trending1, post2, trending2]);

      expect(threads).toHaveLength(2);
      expect(threads[0].primary.meta?.postId).toBe('post-1');
      expect(threads[0].replies).toHaveLength(1);
      expect(threads[1].primary.meta?.postId).toBe('post-2');
      expect(threads[1].replies).toHaveLength(1);
    });

    it('should match by exact title if postId missing', () => {
      const post = createActivity({
        id: 'blog-1',
        source: 'blog',
        verb: 'published',
        title: 'Exact Title Match',
        timestamp: new Date('2024-01-01'),
        href: '/blog/test',
        meta: {}, // No postId
      });

      const trending = createActivity({
        id: 'trending-1',
        source: 'trending',
        verb: 'achieved',
        title: 'Exact Title Match', // Same title
        timestamp: new Date('2024-01-02'),
        href: '/blog/test',
        meta: {
          trending: true,
        },
      });

      // Blog post first to be primary
      const threads = groupActivitiesIntoThreads([post, trending]);

      expect(threads).toHaveLength(1);
      expect(threads[0].replies).toHaveLength(1);
    });

    it('should NOT match by partial title', () => {
      const post = createActivity({
        id: 'blog-1',
        source: 'blog',
        verb: 'published',
        title: 'Security Best Practices',
        timestamp: new Date(),
        href: '/blog/test',
      });

      const trending = createActivity({
        id: 'trending-1',
        source: 'trending',
        verb: 'achieved',
        title: 'Security', // Partial match
        timestamp: new Date(),
        href: '/blog/test',
        meta: { trending: true },
      });

      const threads = groupActivitiesIntoThreads([trending, post]);

      expect(threads).toHaveLength(2); // Should be separate
    });

    it('should respect MAX_DAYS_APART limit', () => {
      const post = createBlogPost('Old Post', 'old-post', 30); // 30 days ago
      const trending = createTrendingPost('Old Post', 'old-post', 0); // Today

      const threads = groupActivitiesIntoThreads([trending, post]);

      // Should NOT thread because trending is >7 days after post
      expect(threads).toHaveLength(2);
    });
  });

  describe('Project + GitHub Threading', () => {
    it('should thread project with its commits', () => {
      const project = createProject('My App', 'my-app', 2);
      const commit1 = createCommit('my-app', 'feat: add feature', 1);
      const commit2 = createCommit('my-app', 'fix: bug fix', 0);

      // Project first to be primary
      const threads = groupActivitiesIntoThreads([project, commit1, commit2]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(project);
      expect(threads[0].replies).toHaveLength(2);
    });

    it('should NOT thread commits from different repos', () => {
      const project1 = createProject('App 1', 'app-1', 3);
      const commit1 = createCommit('app-1', 'Update', 2);
      const project2 = createProject('App 2', 'app-2', 1);
      const commit2 = createCommit('app-2', 'Update', 0);

      // Projects first to be primaries
      const threads = groupActivitiesIntoThreads([project1, commit1, project2, commit2]);

      expect(threads).toHaveLength(2);
      expect(threads[0].replies).toHaveLength(1); // app-1 + commit
      expect(threads[1].replies).toHaveLength(1); // app-2 + commit
    });
  });

  describe('Same-Day Commit Threading', () => {
    it('should thread multiple commits on same day', () => {
      const today = new Date();

      const commit1 = createActivity({
        id: 'commit-1',
        source: 'github',
        verb: 'committed',
        title: 'First commit',
        timestamp: new Date(today.setHours(9, 0, 0)),
        href: '/commit/1',
        meta: { repo: 'my-repo' },
      });

      const commit2 = createActivity({
        id: 'commit-2',
        source: 'github',
        verb: 'committed',
        title: 'Second commit',
        timestamp: new Date(today.setHours(14, 0, 0)),
        href: '/commit/2',
        meta: { repo: 'my-repo' },
      });

      const commit3 = createActivity({
        id: 'commit-3',
        source: 'github',
        verb: 'committed',
        title: 'Third commit',
        timestamp: new Date(today.setHours(18, 0, 0)),
        href: '/commit/3',
        meta: { repo: 'my-repo' },
      });

      const threads = groupActivitiesIntoThreads([commit3, commit2, commit1]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(commit3); // First in array becomes primary
      expect(threads[0].replies).toHaveLength(2);
    });

    it('should NOT thread commits from different days', () => {
      const commit1 = createCommit('repo', 'Day 1 commit', 1);
      const commit2 = createCommit('repo', 'Day 2 commit', 0);

      const threads = groupActivitiesIntoThreads([commit2, commit1]);

      expect(threads).toHaveLength(2);
    });
  });

  describe('Standalone Activities', () => {
    it('should keep certifications as standalone', () => {
      const cert = createActivity({
        id: 'cert-1',
        source: 'certification',
        verb: 'earned',
        title: 'AWS Certified',
        timestamp: new Date(),
        href: '/cert',
      });

      const threads = groupActivitiesIntoThreads([cert]);

      expect(threads).toHaveLength(1);
      expect(threads[0].primary).toEqual(cert);
      expect(threads[0].replies).toEqual([]);
    });

    it('should keep changelog as standalone', () => {
      const change = createActivity({
        id: 'change-1',
        source: 'changelog',
        verb: 'released',
        title: 'v1.0.0',
        timestamp: new Date(),
        href: '/changelog',
      });

      const threads = groupActivitiesIntoThreads([change]);

      expect(threads).toHaveLength(1);
      expect(threads[0].replies).toEqual([]);
    });
  });

  describe('Mixed Activity Threading', () => {
    it('should correctly thread mixed activity types', () => {
      const blogPost = createBlogPost('My Post', 'my-post', 5);
      const trending = createTrendingPost('My Post', 'my-post', 4);
      const project = createProject('My Project', 'my-project', 2);
      const commit = createCommit('my-project', 'Update', 1);
      const cert = createActivity({
        source: 'certification',
        verb: 'earned',
        title: 'Certified',
        timestamp: new Date(),
        href: '/cert',
      });

      // Threadable sources (blog, project) first, then their replies, then standalone
      // Ensure all items are within the search window (MAX_RELATIONSHIP_SEARCH_WINDOW)
      const threads = groupActivitiesIntoThreads([blogPost, trending, project, commit, cert]);

      expect(threads).toHaveLength(3);

      // Blog thread
      const blogThread = threads.find((t) => t.primary.source === 'blog');
      expect(blogThread?.replies).toHaveLength(1);

      // Project thread
      const projectThread = threads.find((t) => t.primary.source === 'project');
      expect(projectThread?.replies).toHaveLength(1);

      // Cert standalone
      const certThread = threads.find((t) => t.primary.source === 'certification');
      expect(certThread?.replies).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle activities without meta', () => {
      const activity = createActivity({
        meta: undefined,
      });

      const threads = groupActivitiesIntoThreads([activity]);

      expect(threads).toHaveLength(1);
      expect(threads[0].replies).toEqual([]);
    });

    it('should handle activities with partial meta', () => {
      const activity = createActivity({
        meta: {
          tags: ['test'],
          // No id, postId, or repo
        },
      });

      const threads = groupActivitiesIntoThreads([activity]);

      expect(threads).toHaveLength(1);
    });

    it('should handle very large activity lists', () => {
      const activities = Array.from({ length: 1000 }, (_, i) =>
        createBlogPost(`Post ${i}`, `post-${i}`, i)
      );

      const threads = groupActivitiesIntoThreads(activities);

      expect(threads).toHaveLength(1000);
      expect(threads[0].primary.title).toBe('Post 0'); // Newest
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS TESTS
// ============================================================================

describe('getCollapsedSummary', () => {
  it('should return correct summary for 1 hidden reply (blog)', () => {
    const summary = getCollapsedSummary(1, 'blog');
    expect(summary).toBe('1 more update');
  });

  it('should return correct summary for multiple hidden replies (blog)', () => {
    const summary = getCollapsedSummary(5, 'blog');
    expect(summary).toBe('5 more updates');
  });

  it('should handle github commits correctly', () => {
    const summary = getCollapsedSummary(3, 'github');
    expect(summary).toBe('3 more commits');
  });

  it('should use singular form for 1 item', () => {
    const summary = getCollapsedSummary(1, 'github');
    expect(summary).toBe('1 more commit');
  });

  it('should return empty string for 0 hidden replies', () => {
    const summary = getCollapsedSummary(0, 'blog');
    expect(summary).toBe('');
  });
});

// ============================================================================
// THREAD INTERFACE TESTS
// ============================================================================

describe('ActivityThread Interface', () => {
  it('should have correct structure', () => {
    const primary = createBlogPost('Test', 'test');
    const reply = createTrendingPost('Test', 'test');

    // Blog post first to be primary
    const threads = groupActivitiesIntoThreads([primary, reply]);
    const thread = threads[0];

    expect(thread).toHaveProperty('id');
    expect(thread).toHaveProperty('primary');
    expect(thread).toHaveProperty('replies');
    expect(thread).toHaveProperty('collapsedCount');
    expect(thread).toHaveProperty('timestamp');

    expect(thread.id).toBe(primary.id);
    expect(thread.timestamp).toBeInstanceOf(Date);
  });

  it('should calculate collapsedCount correctly', () => {
    const post = createBlogPost('Post', 'post', 10);
    // Create 7 milestones close to the post (within 6 days, safely inside MAX_DAYS_APART=7)
    // daysAgo: 10, 9, 8, 7, 6, 5, 4 → diff from post: 0, 1, 2, 3, 4, 5, 6
    const nearReplies = Array.from({ length: 7 }, (_, i) =>
      createMilestone('Post', 'post', (i + 1) * 1000, 10 - i)
    );
    // 1 milestone far from the post (9 days apart, safely outside MAX_DAYS_APART=7)
    const farReply = createMilestone('Post', 'post', 8000, 1);

    const threads = groupActivitiesIntoThreads([post, ...nearReplies, farReply]);

    expect(threads[0].replies).toHaveLength(5); // MAX_VISIBLE_REPLIES
    // 7 milestones thread (within window), 1 doesn't (9 days apart)
    expect(threads[0].collapsedCount).toBe(2); // 7 - MAX_VISIBLE_REPLIES (5)
  });
});
