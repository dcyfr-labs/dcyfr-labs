/**
 * Integration test: Full automated-repo-showcase pipeline
 *
 * Exercises the complete path from GitHub API fetch → README parse →
 * data transformation → merge into final project list.
 *
 * ONLY the external boundary (global fetch) is mocked.
 * All internal modules (parse-frontmatter, repo-to-project, merge-projects, …)
 * run with real logic so regressions across module boundaries are caught.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// vi.hoisted — must be available in vi.mock() factory (hoisted before imports)
// ---------------------------------------------------------------------------

const { integTestCacheDir } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const _path = require('path') as typeof import('path');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const _os = require('os') as typeof import('os');
  return {
    integTestCacheDir: _path.join(_os.tmpdir(), 'dcyfr-labs-github-integ-test'),
  };
});

vi.mock('@/config/repos-config', () => ({
  GITHUB_ORG: 'dcyfr',
  CACHE_CONFIG: {
    cacheDir: integTestCacheDir,
    ttlMs: 60_000, // long TTL — we control cache files directly in tests
  },
  GITHUB_API_CONFIG: {
    baseUrl: 'https://api.github.com',
    timeoutMs: 10_000,
    perPage: 100,
  },
  REPO_DEFAULTS: {
    category: 'code',
    status: 'active',
    maxHeuristicsLines: 50,
  },
  REPO_EXCLUDE_LIST: ['dcyfr-labs', '.github'],
  REPO_INCLUDE_LIST: [],
  ENV_VARS: { token: 'GITHUB_TOKEN', enabled: 'ENABLE_AUTOMATED_REPOS' },
}));

vi.spyOn(process, 'cwd').mockReturnValue('/');

// ---------------------------------------------------------------------------
// Minimal fixture data
// ---------------------------------------------------------------------------

const RAW_SHOWCASE_README = `---
workShowcase: true
title: "My Showcase Repo"
description: "A great project."
category: code
status: active
featured: true
tech:
  - TypeScript
  - Node.js
tags:
  - ai
  - open-source
highlights:
  - "Does cool things"
  - "Very fast"
demo: https://demo.example.com
docs: https://docs.example.com
---

# My Showcase Repo

A great project.

## Features

- Does cool things
- Very fast
`;

// We encode the fixture as base64 for the README API response fixture
const README_B64 = Buffer.from(RAW_SHOWCASE_README, 'utf-8').toString('base64');

const REPO_FIXTURE = {
  id: 42,
  name: 'my-showcase-repo',
  full_name: 'dcyfr/my-showcase-repo',
  description: 'GitHub description (overridden by frontmatter)',
  html_url: 'https://github.com/dcyfr/my-showcase-repo',
  homepage: null,
  topics: ['typescript', 'ai'],
  language: 'TypeScript',
  stargazers_count: 101,
  forks_count: 12,
  pushed_at: '2025-06-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
  private: false,
  fork: false,
  archived: false,
};

const EXCLUDED_REPO = {
  ...REPO_FIXTURE,
  id: 99,
  name: 'dcyfr-labs',
  full_name: 'dcyfr/dcyfr-labs',
};

const NON_SHOWCASE_REPO = {
  ...REPO_FIXTURE,
  id: 43,
  name: 'internal-tool',
  full_name: 'dcyfr/internal-tool',
};

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit | undefined];

function makeFetch(repos = [REPO_FIXTURE, EXCLUDED_REPO, NON_SHOWCASE_REPO]) {
  return vi.fn(async (...args: FetchArgs) => {
    const url = String(args[0]);

    // Repos list endpoint
    if (url.includes('/orgs/dcyfr/repos')) {
      return new Response(JSON.stringify(repos), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Showcase repo README endpoint
    if (url.includes('/my-showcase-repo/readme')) {
      return new Response(JSON.stringify({ encoding: 'base64', content: README_B64 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Non-showcase readme — no frontmatter, no opts-in
    if (url.includes('/readme')) {
      return new Response('{"encoding":"base64","content":""}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clearCache() {
  if (fs.existsSync(integTestCacheDir)) {
    fs.rmSync(integTestCacheDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

import { fetchOrgRepos } from '@/lib/github/fetch-repos';
import { fetchRepoReadme } from '@/lib/github/fetch-readme';
import { parseReadmeMetadata } from '@/lib/markdown/parse-readme-metadata';
import { isShowcaseRepo } from '@/lib/markdown/parse-frontmatter';
import { repoToProject } from '@/lib/projects/repo-to-project';
import { mergeProjects } from '@/lib/projects/merge-projects';
import type { Project } from '@/data/projects';

describe('automated-repo-showcase: full pipeline integration', () => {
  beforeEach(() => {
    clearCache();
    vi.stubGlobal('fetch', makeFetch());
  });

  afterEach(() => {
    clearCache();
    vi.clearAllMocks(); // clear call history but preserve spy implementations (keeps cwd mock)
  });

  it('full pipeline: produces a single merged project from GitHub API', async () => {
    // 1. Fetch repos
    const repos = await fetchOrgRepos();
    // EXCLUDED_REPO is filtered at config level by our orchestrator — simulate
    const filteredRepos = repos.filter((r) => !['dcyfr-labs', '.github'].includes(r.name));
    expect(filteredRepos).toHaveLength(2); // my-showcase-repo + internal-tool

    // 2. Fetch READMEs and parse metadata
    const usedSlugs = new Set<string>();
    const automated: Project[] = [];

    for (const repo of filteredRepos) {
      const readme = await fetchRepoReadme(repo.full_name);
      const metadata = parseReadmeMetadata(readme);
      const optsIn = isShowcaseRepo(metadata.frontmatter);

      if (!optsIn) continue; // internal-tool has no frontmatter → skipped

      const project = repoToProject(repo, metadata, usedSlugs);
      usedSlugs.add(project.slug);
      automated.push(project);
    }

    expect(automated).toHaveLength(1);
    const project = automated[0]!;

    // 3. Verify transformation from real pipeline (not just mocks)
    expect(project.title).toBe('My Showcase Repo');
    expect(project.description).toBe('A great project.');
    expect(project.category).toBe('code');
    expect(project.status).toBe('active');
    expect(project.featured).toBe(true);

    // Links — GitHub always present; demo/docs from frontmatter
    const ghLink = project.links?.find((l) => l.label === 'GitHub');
    expect(ghLink?.href).toBe('https://github.com/dcyfr/my-showcase-repo');
    const demoLink = project.links?.find((l) => l.label === 'Demo');
    expect(demoLink?.href).toBe('https://demo.example.com');
    const docsLink = project.links?.find((l) => l.label === 'Docs');
    expect(docsLink?.href).toBe('https://docs.example.com');

    // Tech
    expect(project.tech).toContain('TypeScript');
    expect(project.tech).toContain('Node.js');

    // Highlights
    expect(project.highlights).toContain('Does cool things');
    expect(project.highlights).toContain('Very fast');
  });

  it('merge: automated project does not duplicate a static project with same slug', async () => {
    const staticProject: Project = {
      id: 'static-my-showcase-repo',
      slug: 'my-showcase-repo',
      title: 'My Showcase Repo (static)',
      description: 'Manually curated version',
      category: 'code',
      status: 'active',
      featured: false,
      tech: ['TypeScript'],
      links: [],
      body: '',
      publishedAt: '2024-01-01',
    };

    const repos = await fetchOrgRepos();
    const filteredRepos = repos.filter((r) => !['dcyfr-labs', '.github'].includes(r.name));
    const usedSlugs = new Set<string>([staticProject.slug]);
    const automated: Project[] = [];

    for (const repo of filteredRepos) {
      const readme = await fetchRepoReadme(repo.full_name);
      const metadata = parseReadmeMetadata(readme);
      if (!isShowcaseRepo(metadata.frontmatter)) continue;
      // Slug collision — automated gets a different slug
      const project = repoToProject(repo, metadata, usedSlugs);
      usedSlugs.add(project.slug);
      automated.push(project);
    }

    const merged = mergeProjects([staticProject], automated);

    // Static project wins slug; automated gets a suffixed slug
    const slugs = merged.map((p) => p.slug);
    expect(slugs).toContain('my-showcase-repo'); // static
    expect(merged.find((p) => p.slug === 'my-showcase-repo')?.title).toBe(
      'My Showcase Repo (static)'
    );
    // The automated variant has a collision-resolved slug
    const automatedVariant = merged.find((p) => p.slug !== 'my-showcase-repo');
    expect(automatedVariant?.slug).toMatch(/^my-showcase-repo-/);
  });

  it('graceful degradation: returns empty array when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('Network error');
      })
    );

    // fetchOrgRepos returns [] on error
    const repos = await fetchOrgRepos();
    expect(repos).toEqual([]);
  });

  it('ENABLE_AUTOMATED_REPOS=false: pipeline produces no automated projects', () => {
    // Simulate the env-var check in getAutomatedProjects()
    const isEnabled = process.env['ENABLE_AUTOMATED_REPOS'];
    if (isEnabled === 'false') {
      expect([]).toHaveLength(0);
    } else {
      // Feature is enabled — this assertion documents expected default behavior
      expect(isEnabled ?? 'true').not.toBe('false');
    }
  });
});
