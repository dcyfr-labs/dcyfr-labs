import { describe, it, expect } from 'vitest';
import { calculateTrendingTechnologies, normalizeTechName } from '@/lib/activity';
import type { Post } from '@/data/posts';
import type { Project } from '@/data/projects';

// ============================================================================
// MOCK DATA
// ============================================================================

const createPost = (slug: string, tags: string[]): Post => ({
  id: `post-${slug}`,
  slug,
  title: `Post ${slug}`,
  summary: 'Test post',
  publishedAt: '2025-01-01',
  tags,
  readingTime: { words: 100, minutes: 1, text: '1 min read' },
  body: 'content',
});

const createProject = (slug: string, tech: string[]): Project => ({
  id: `project-${slug}`,
  slug,
  title: `Project ${slug}`,
  description: 'Test project',
  status: 'active' as const,
  tech,
  links: [],
  publishedAt: '2024-01-01',
  body: 'content',
});

// ============================================================================
// TESTS: normalizeTechName
// ============================================================================

describe('normalizeTechName', () => {
  it('should normalize common aliases', () => {
    expect(normalizeTechName('react')).toBe('React');
    expect(normalizeTechName('nextjs')).toBe('Next.js');
    expect(normalizeTechName('typescript')).toBe('TypeScript');
    expect(normalizeTechName('node')).toBe('Node.js');
    expect(normalizeTechName('tailwind')).toBe('Tailwind CSS');
  });

  it('should be case insensitive', () => {
    expect(normalizeTechName('REACT')).toBe('React');
    expect(normalizeTechName('TypeScript')).toBe('TypeScript');
    expect(normalizeTechName('NEXTJS')).toBe('Next.js');
  });

  it('should handle various spellings', () => {
    expect(normalizeTechName('node.js')).toBe('Node.js');
    expect(normalizeTechName('nodejs')).toBe('Node.js');
    expect(normalizeTechName('next.js')).toBe('Next.js');
    expect(normalizeTechName('vue.js')).toBe('Vue.js');
    expect(normalizeTechName('react.js')).toBe('React');
  });

  it('should preserve unknown names as-is', () => {
    expect(normalizeTechName('Svelte')).toBe('Svelte');
    expect(normalizeTechName('Rust')).toBe('Rust');
    expect(normalizeTechName('  CustomLib  ')).toBe('CustomLib');
  });

  it('should trim whitespace', () => {
    expect(normalizeTechName('  react  ')).toBe('React');
    expect(normalizeTechName(' Svelte ')).toBe('Svelte');
  });
});

// ============================================================================
// TESTS: calculateTrendingTechnologies
// ============================================================================

describe('calculateTrendingTechnologies', () => {
  describe('Basic Aggregation', () => {
    it('should aggregate technologies from posts', () => {
      const posts = [
        createPost('post-1', ['React', 'TypeScript']),
        createPost('post-2', ['React', 'Next.js']),
        createPost('post-3', ['TypeScript', 'Node.js']),
      ];

      const result = calculateTrendingTechnologies(posts, []);

      expect(result.length).toBe(4);
      const react = result.find((t) => t.name === 'React');
      expect(react).toBeDefined();
      expect(react!.blogMentions).toBe(2);
      expect(react!.projectMentions).toBe(0);
    });

    it('should aggregate technologies from projects', () => {
      const projects = [
        createProject('proj-1', ['React', 'TypeScript']),
        createProject('proj-2', ['React', 'Node.js']),
      ];

      const result = calculateTrendingTechnologies([], projects);

      const react = result.find((t) => t.name === 'React');
      expect(react).toBeDefined();
      expect(react!.blogMentions).toBe(0);
      expect(react!.projectMentions).toBe(2);
    });

    it('should combine post and project mentions', () => {
      const posts = [createPost('post-1', ['React', 'TypeScript'])];
      const projects = [createProject('proj-1', ['React', 'Node.js'])];

      const result = calculateTrendingTechnologies(posts, projects);

      const react = result.find((t) => t.name === 'React');
      expect(react).toBeDefined();
      expect(react!.blogMentions).toBe(1);
      expect(react!.projectMentions).toBe(1);
    });
  });

  describe('Scoring', () => {
    it('should use default weights (blog=1, project=2)', () => {
      const posts = [createPost('p1', ['React'])];
      const projects = [createProject('proj1', ['React'])];

      const result = calculateTrendingTechnologies(posts, projects);

      const react = result.find((t) => t.name === 'React');
      // score = 1*1 (blog) + 1*2 (project) = 3
      expect(react!.score).toBe(3);
    });

    it('should respect custom weights', () => {
      const posts = [createPost('p1', ['React']), createPost('p2', ['React'])];
      const projects = [createProject('proj1', ['React'])];

      const result = calculateTrendingTechnologies(posts, projects, {
        blogWeight: 3,
        projectWeight: 5,
      });

      const react = result.find((t) => t.name === 'React');
      // score = 2*3 (blog) + 1*5 (project) = 11
      expect(react!.score).toBe(11);
    });

    it('should sort by score descending', () => {
      const posts = [
        createPost('p1', ['React', 'CSS']),
        createPost('p2', ['React', 'TypeScript']),
        createPost('p3', ['React']),
      ];

      const result = calculateTrendingTechnologies(posts, []);

      expect(result[0].name).toBe('React');
      expect(result[0].score).toBe(3); // 3 mentions
    });

    it('should tie-break by name alphabetically', () => {
      const posts = [createPost('p1', ['Alpha', 'Bravo'])];

      const result = calculateTrendingTechnologies(posts, []);

      // Both score 1, sorted alphabetically
      expect(result[0].name).toBe('Alpha');
      expect(result[1].name).toBe('Bravo');
    });
  });

  describe('Normalization', () => {
    it('should merge aliased tech names', () => {
      const posts = [
        createPost('p1', ['react']), // alias of React
        createPost('p2', ['React']), // canonical
        createPost('p3', ['reactjs']), // alias of React
      ];

      const result = calculateTrendingTechnologies(posts, []);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('React');
      expect(result[0].blogMentions).toBe(3);
    });

    it('should merge blog and project aliases', () => {
      const posts = [createPost('p1', ['nextjs'])];
      const projects = [createProject('proj1', ['Next.js'])];

      const result = calculateTrendingTechnologies(posts, projects);

      const nextjs = result.find((t) => t.name === 'Next.js');
      expect(nextjs).toBeDefined();
      expect(nextjs!.blogMentions).toBe(1);
      expect(nextjs!.projectMentions).toBe(1);
    });
  });

  describe('Filtering', () => {
    it('should respect limit option', () => {
      const posts = [createPost('p1', ['A', 'B', 'C', 'D', 'E'])];

      const result = calculateTrendingTechnologies(posts, [], { limit: 3 });

      expect(result.length).toBe(3);
    });

    it('should respect minScore option', () => {
      const posts = [createPost('p1', ['React', 'CSS']), createPost('p2', ['React'])];

      const result = calculateTrendingTechnologies(posts, [], { minScore: 2 });

      // Only React (score 2) should pass, CSS (score 1) filtered
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('React');
    });

    it('should exclude archived posts', () => {
      const archivedPost: Post = {
        ...createPost('archived', ['OldTech']),
        archived: true,
      };
      const activePost = createPost('active', ['NewTech']);

      const result = calculateTrendingTechnologies([archivedPost, activePost], []);

      expect(result.find((t) => t.name === 'OldTech')).toBeUndefined();
      expect(result.find((t) => t.name === 'NewTech')).toBeDefined();
    });

    it('should exclude draft posts', () => {
      const draftPost: Post = {
        ...createPost('draft', ['DraftTech']),
        draft: true,
      };
      const activePost = createPost('active', ['LiveTech']);

      const result = calculateTrendingTechnologies([draftPost, activePost], []);

      expect(result.find((t) => t.name === 'DraftTech')).toBeUndefined();
      expect(result.find((t) => t.name === 'LiveTech')).toBeDefined();
    });
  });

  describe('Sources', () => {
    it('should track post slugs in sources', () => {
      const posts = [createPost('post-alpha', ['React']), createPost('post-beta', ['React'])];

      const result = calculateTrendingTechnologies(posts, []);

      const react = result.find((t) => t.name === 'React');
      expect(react!.sources.posts).toContain('post-alpha');
      expect(react!.sources.posts).toContain('post-beta');
      expect(react!.sources.projects).toHaveLength(0);
    });

    it('should track project slugs in sources', () => {
      const projects = [
        createProject('proj-x', ['TypeScript']),
        createProject('proj-y', ['TypeScript']),
      ];

      const result = calculateTrendingTechnologies([], projects);

      const ts = result.find((t) => t.name === 'TypeScript');
      expect(ts!.sources.projects).toContain('proj-x');
      expect(ts!.sources.projects).toContain('proj-y');
      expect(ts!.sources.posts).toHaveLength(0);
    });

    it('should not duplicate slugs for same post with multiple matching tags', () => {
      const posts = [
        createPost('post-1', ['React', 'react']), // both normalize to React
      ];

      const result = calculateTrendingTechnologies(posts, []);

      const react = result.find((t) => t.name === 'React');
      // Slug should only appear once in sources (Set deduplication)
      expect(react!.sources.posts).toEqual(['post-1']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty inputs', () => {
      const result = calculateTrendingTechnologies([], []);
      expect(result).toEqual([]);
    });

    it('should handle posts with no tags', () => {
      const posts = [createPost('empty', [])];
      const result = calculateTrendingTechnologies(posts, []);
      expect(result).toEqual([]);
    });

    it('should handle projects with no tech', () => {
      const project: Project = {
        ...createProject('no-tech', []),
        tech: undefined,
      };
      const result = calculateTrendingTechnologies([], [project]);
      expect(result).toEqual([]);
    });

    it('should use default limit of 12', () => {
      const tags = Array.from({ length: 20 }, (_, i) => `Tech${i}`);
      const posts = [createPost('p1', tags)];

      const result = calculateTrendingTechnologies(posts, []);

      expect(result.length).toBe(12);
    });
  });
});
