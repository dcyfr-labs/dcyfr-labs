/**
 * Tests for mergeProjects() — deduplication and sorting.
 *
 * Pure logic — no mocks required.
 */

import { describe, it, expect } from 'vitest';
import { mergeProjects } from '@/lib/projects/merge-projects';
import type { Project } from '@/data/projects';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let __counter = 0;
function makeProject(overrides: Partial<Project> & { slug: string }): Project {
  __counter++;
  return {
    id: `project-${__counter}`,
    slug: overrides.slug,
    title: overrides.title ?? overrides.slug,
    description: overrides.description ?? 'A project',
    timeline: overrides.timeline ?? '2024',
    status: overrides.status ?? 'active',
    category: overrides.category ?? 'code',
    tech: overrides.tech ?? [],
    tags: overrides.tags,
    links: overrides.links ?? [],
    featured: overrides.featured ?? false,
    hidden: overrides.hidden ?? false,
    highlights: overrides.highlights,
    image: overrides.image,
    body: overrides.body ?? '',
    readingTime: overrides.readingTime ?? { words: 100, minutes: 1, text: '1 min read' },
    publishedAt: overrides.publishedAt ?? '2024-01-01',
    codeContent: overrides.codeContent,
    galleryContent: overrides.galleryContent,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('mergeProjects', () => {
  it('returns static projects when automated is empty', () => {
    const static1 = makeProject({ slug: 'project-a', publishedAt: '2024-01-01' });
    const result = mergeProjects([static1], []);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('project-a');
  });

  it('returns automated projects when static is empty', () => {
    const auto1 = makeProject({ slug: 'auto-repo', publishedAt: '2024-01-01' });
    const result = mergeProjects([], [auto1]);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('auto-repo');
  });

  it('includes both static and automated when no slug collision', () => {
    const s1 = makeProject({ slug: 'static-a', publishedAt: '2024-01-01' });
    const a1 = makeProject({ slug: 'auto-b', publishedAt: '2024-02-01' });
    const result = mergeProjects([s1], [a1]);
    expect(result).toHaveLength(2);
  });

  it('static project wins on slug collision (automated is excluded)', () => {
    const staticProj = makeProject({
      slug: 'shared-slug',
      title: 'Static Version',
      publishedAt: '2023-01-01',
    });
    const autoProj = makeProject({
      slug: 'shared-slug',
      title: 'Automated Version',
      publishedAt: '2024-01-01',
    });
    const result = mergeProjects([staticProj], [autoProj]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Static Version');
  });

  it('sorts featured projects before non-featured', () => {
    const regular = makeProject({ slug: 'regular', publishedAt: '2024-06-01', featured: false });
    const featured = makeProject({ slug: 'featured', publishedAt: '2024-01-01', featured: true });
    const result = mergeProjects([regular, featured], []);
    expect(result[0].slug).toBe('featured');
    expect(result[1].slug).toBe('regular');
  });

  it('sorts by publishedAt descending within same featured bucket', () => {
    const older = makeProject({ slug: 'older', publishedAt: '2023-01-01', featured: false });
    const newer = makeProject({ slug: 'newer', publishedAt: '2024-06-01', featured: false });
    const mid = makeProject({ slug: 'mid', publishedAt: '2024-01-01', featured: false });
    const result = mergeProjects([older, mid], [newer]);
    expect(result[0].slug).toBe('newer');
    expect(result[1].slug).toBe('mid');
    expect(result[2].slug).toBe('older');
  });

  it('featured bucket sorted newest first, then non-featured newest first', () => {
    const f_old = makeProject({ slug: 'f-old', publishedAt: '2022-01-01', featured: true });
    const f_new = makeProject({ slug: 'f-new', publishedAt: '2024-01-01', featured: true });
    const r_old = makeProject({ slug: 'r-old', publishedAt: '2022-01-01', featured: false });
    const r_new = makeProject({ slug: 'r-new', publishedAt: '2024-01-01', featured: false });
    const result = mergeProjects([f_old, r_old], [f_new, r_new]);
    const slugs = result.map((p) => p.slug);
    expect(slugs.indexOf('f-new')).toBeLessThan(slugs.indexOf('f-old'));
    expect(slugs.indexOf('f-old')).toBeLessThan(slugs.indexOf('r-new'));
    expect(slugs.indexOf('r-new')).toBeLessThan(slugs.indexOf('r-old'));
  });

  it('does not mutate the original static projects array', () => {
    const originals = [
      makeProject({ slug: 'a', publishedAt: '2024-01-01' }),
      makeProject({ slug: 'b', publishedAt: '2024-02-01' }),
    ] as const;
    const frozen = Object.freeze(originals);
    expect(() => mergeProjects(frozen, [])).not.toThrow();
  });
});
