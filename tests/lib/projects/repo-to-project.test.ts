/**
 * Tests for repoToProject() and resolveSlugCollision().
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/repos-config', () => ({
  REPO_DEFAULTS: { status: 'active', category: 'code', maxHeuristicsLines: 50 },
}));

import { repoToProject, resolveSlugCollision } from '@/lib/projects/repo-to-project';
import type { GitHubRepo } from '@/lib/github/types';
import type { ParsedReadmeMetadata } from '@/lib/markdown/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: 'my-project',
    full_name: 'dcyfr/my-project',
    description: 'A GitHub repo description',
    private: false,
    archived: false,
    fork: false,
    html_url: 'https://github.com/dcyfr/my-project',
    homepage: 'https://example.com',
    language: 'TypeScript',
    topics: ['typescript', 'nodejs'],
    stargazers_count: 10,
    forks_count: 2,
    open_issues_count: 1,
    pushed_at: '2024-06-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    default_branch: 'main',
    contents_url: 'https://api.github.com/repos/dcyfr/my-project/contents/{+path}',
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<ParsedReadmeMetadata> = {}): ParsedReadmeMetadata {
  return {
    frontmatter: {},
    bodyWithoutFrontmatter: '# My Project\n\nThis is the project intro.',
    firstParagraph: 'This is the project intro.',
    hasFeaturesList: false,
    extractedHighlights: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// resolveSlugCollision
// ---------------------------------------------------------------------------

describe('resolveSlugCollision', () => {
  it('returns the slug unchanged when no collision', () => {
    const slugs = new Set(['other-slug']);
    expect(resolveSlugCollision('my-project', slugs)).toBe('my-project');
  });

  it('appends a hash suffix when the slug is taken', () => {
    const slugs = new Set(['my-project']);
    const result = resolveSlugCollision('my-project', slugs);
    expect(result).toMatch(/^my-project-[a-f0-9]{6}$/);
  });

  it('produces a stable suffix (same input → same output)', () => {
    const slugs = new Set(['my-project']);
    const r1 = resolveSlugCollision('my-project', slugs);
    const r2 = resolveSlugCollision('my-project', slugs);
    expect(r1).toBe(r2);
  });
});

// ---------------------------------------------------------------------------
// repoToProject — field priority
// ---------------------------------------------------------------------------

describe('repoToProject', () => {
  it('uses repo name as slug (URL-safe, trailing dashes stripped)', () => {
    const project = repoToProject(makeRepo({ name: 'my_project NAME!' }), makeMetadata());
    // Underscores and spaces → dashes, trailing punctuation stripped, consecutive dashes collapsed
    expect(project.slug).toBe('my-project-name');
  });

  it('uses repo name as title when no frontmatter title', () => {
    const project = repoToProject(makeRepo({ name: 'cool-repo' }), makeMetadata());
    expect(project.title).toBe('cool-repo');
  });

  it('prefers frontmatter title over repo name', () => {
    const meta = makeMetadata({ frontmatter: { workShowcase: true, title: 'Cool Project' } });
    const project = repoToProject(makeRepo(), meta);
    expect(project.title).toBe('Cool Project');
  });

  it('uses repo description when no frontmatter description', () => {
    const project = repoToProject(
      makeRepo({ description: 'Repo description from GitHub' }),
      makeMetadata({ frontmatter: {}, firstParagraph: undefined })
    );
    expect(project.description).toBe('Repo description from GitHub');
  });

  it('prefers frontmatter description over repo description', () => {
    const meta = makeMetadata({ frontmatter: { description: 'FM description' } });
    const project = repoToProject(makeRepo({ description: 'GitHub description' }), meta);
    expect(project.description).toBe('FM description');
  });

  it('falls back to firstParagraph when no description available', () => {
    const meta = makeMetadata({
      frontmatter: {},
      firstParagraph: 'Heuristic description.',
    });
    const project = repoToProject(makeRepo({ description: null }), meta);
    expect(project.description).toBe('Heuristic description.');
  });

  it("defaults category to 'code' from REPO_DEFAULTS", () => {
    const project = repoToProject(makeRepo(), makeMetadata());
    expect(project.category).toBe('code');
  });

  it('prefers frontmatter category', () => {
    const meta = makeMetadata({ frontmatter: { category: 'startup' } });
    const project = repoToProject(makeRepo(), meta);
    expect(project.category).toBe('startup');
  });

  it("defaults status to 'active' for non-archived repos", () => {
    const project = repoToProject(makeRepo({ archived: false }), makeMetadata());
    expect(project.status).toBe('active');
  });

  it("sets status to 'archived' for archived repos", () => {
    const project = repoToProject(makeRepo({ archived: true }), makeMetadata());
    expect(project.status).toBe('archived');
  });

  it('prefers frontmatter status over archive flag', () => {
    const meta = makeMetadata({ frontmatter: { status: 'in-progress' } });
    const project = repoToProject(makeRepo({ archived: true }), meta);
    expect(project.status).toBe('in-progress');
  });

  it('builds tech from language + topics when no frontmatter tech', () => {
    const project = repoToProject(
      makeRepo({ language: 'TypeScript', topics: ['nodejs', 'api'] }),
      makeMetadata({ frontmatter: {} })
    );
    expect(project.tech).toContain('TypeScript');
  });

  it('prefers frontmatter tech over GitHub fields', () => {
    const meta = makeMetadata({ frontmatter: { tech: ['Rust', 'WASM'] } });
    const project = repoToProject(makeRepo({ language: 'TypeScript' }), meta);
    expect(project.tech).toEqual(['Rust', 'WASM']);
  });

  it('always includes a GitHub link', () => {
    const project = repoToProject(makeRepo(), makeMetadata());
    const githubLink = project.links.find((l) => l.type === 'github');
    expect(githubLink).toBeDefined();
    expect(githubLink?.href).toBe('https://github.com/dcyfr/my-project');
  });

  it('adds a demo link when homepage is set', () => {
    const project = repoToProject(
      makeRepo({ homepage: 'https://demo.example.com' }),
      makeMetadata()
    );
    const demoLink = project.links.find((l) => l.type === 'demo');
    expect(demoLink?.href).toBe('https://demo.example.com');
  });

  it('sets publishedAt to created_at date', () => {
    const project = repoToProject(makeRepo({ created_at: '2024-03-15T00:00:00Z' }), makeMetadata());
    expect(project.publishedAt).toBe('2024-03-15');
  });

  it('resolves slug collision with hash suffix', () => {
    const usedSlugs = new Set(['my-project']);
    const project = repoToProject(makeRepo({ name: 'my-project' }), makeMetadata(), usedSlugs);
    expect(project.slug).not.toBe('my-project');
    expect(project.slug).toMatch(/^my-project-[a-f0-9]{6}$/);
  });
});
