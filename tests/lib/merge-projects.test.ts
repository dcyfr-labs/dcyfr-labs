import { describe, it, expect } from 'vitest';
import { mergeProjects } from '@/lib/projects/merge-projects';
import type { Project } from '@/data/projects';

function makeProject(overrides: Partial<Project> & { slug: string; publishedAt: string }): Project {
  return {
    title: overrides.slug,
    description: 'Test project',
    tags: [],
    featured: false,
    ...overrides,
  } as Project;
}

describe('mergeProjects', () => {
  it('returns static projects when no automated', () => {
    const staticProjects = [makeProject({ slug: 'a', publishedAt: '2025-01-01' })];
    const result = mergeProjects(staticProjects, []);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });

  it('returns automated projects when no static', () => {
    const automated = [makeProject({ slug: 'b', publishedAt: '2025-02-01' })];
    const result = mergeProjects([], automated);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('b');
  });

  it('deduplicates by slug — static wins', () => {
    const staticProjects = [
      makeProject({ slug: 'shared', publishedAt: '2025-01-01', title: 'Static' }),
    ];
    const automated = [
      makeProject({ slug: 'shared', publishedAt: '2025-06-01', title: 'Automated' }),
    ];
    const result = mergeProjects(staticProjects, automated);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Static');
  });

  it('sorts featured before non-featured', () => {
    const staticProjects = [
      makeProject({ slug: 'normal', publishedAt: '2025-06-01', featured: false }),
    ];
    const automated = [makeProject({ slug: 'feat', publishedAt: '2025-01-01', featured: true })];
    const result = mergeProjects(staticProjects, automated);
    expect(result[0].slug).toBe('feat');
    expect(result[1].slug).toBe('normal');
  });

  it('sorts by publishedAt descending within same featured bucket', () => {
    const staticProjects = [
      makeProject({ slug: 'old', publishedAt: '2024-01-01' }),
      makeProject({ slug: 'new', publishedAt: '2025-06-01' }),
    ];
    const result = mergeProjects(staticProjects, []);
    expect(result[0].slug).toBe('new');
    expect(result[1].slug).toBe('old');
  });

  it('handles empty inputs', () => {
    expect(mergeProjects([], [])).toEqual([]);
  });

  it('merges without slug collisions', () => {
    const staticProjects = [makeProject({ slug: 'a', publishedAt: '2025-01-01' })];
    const automated = [makeProject({ slug: 'b', publishedAt: '2025-02-01' })];
    const result = mergeProjects(staticProjects, automated);
    expect(result).toHaveLength(2);
  });
});
