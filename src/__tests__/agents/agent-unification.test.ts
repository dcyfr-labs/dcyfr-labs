/**
 * Topline contract tests.
 *
 * After the dcyfr-labs-cleanup Phase 5 rewrite, the four topline files
 * (README.md, AGENTS.md, CLAUDE.md, .github/copilot-instructions.md) serve
 * four different audiences defined in docs/automation-glossary.md. Each file
 * is expected to:
 *
 *  - declare its audience via an HTML comment
 *  - stay under a per-file line budget
 *  - link to docs/automation-glossary.md exactly once
 *  - avoid duplicating substantive content (≥80 chars) with the other files
 *
 * This test used to assert the presence of specific inline patterns
 * (PageLayout, CONTAINER_WIDTHS, "Session Checkpoint System"). That contract
 * was retired in the cleanup — inline patterns now live in the code and in
 * targeted docs under docs/, not in topline files.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

type ToplineFile = {
  file: string;
  budget: number;
  audiencePattern: RegExp;
};

const TOPLINE_FILES: ToplineFile[] = [
  { file: 'README.md', budget: 200, audiencePattern: /humans/i },
  { file: 'AGENTS.md', budget: 300, audiencePattern: /agent/i },
  { file: 'CLAUDE.md', budget: 150, audiencePattern: /claude/i },
  {
    file: '.github/copilot-instructions.md',
    budget: 120,
    audiencePattern: /copilot/i,
  },
];

const GLOSSARY_PATH = 'docs/automation-glossary.md';

function read(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');
}

describe('Topline file contract', () => {
  for (const { file, budget, audiencePattern } of TOPLINE_FILES) {
    describe(file, () => {
      it(`exists and is under the ${budget}-line budget`, () => {
        const content = read(file);
        const lineCount = content.split('\n').length;
        expect(lineCount).toBeLessThanOrEqual(budget);
      });

      it('declares its audience in an HTML comment', () => {
        const content = read(file);
        const match = content.match(/<!--\s*audience:\s*([^-]+?)\s*-->/i);
        expect(match, 'missing <!-- audience: ... --> comment').not.toBeNull();
        expect(match![1]).toMatch(audiencePattern);
      });

      it('links to the automation glossary at least once and at most three times', () => {
        const content = read(file);
        // Count distinct markdown links whose href points at the glossary.
        // Files may cite the glossary in the intro, in a contract-surface
        // list, and in a related-files footer — three is the ceiling.
        const linkPattern = /\[[^\]]*?\]\([^)]*docs\/automation-glossary\.md[^)]*\)/g;
        const links = content.match(linkPattern) ?? [];
        expect(links.length, `expected 1-3 glossary links in ${file}`).toBeGreaterThanOrEqual(1);
        expect(links.length).toBeLessThanOrEqual(3);
      });
    });
  }
});

describe('Topline file de-duplication', () => {
  // Strip markdown links, code spans, and table separators before comparing.
  // Shared link hrefs and shared command tokens are expected overlap — the
  // contract only bans substantive PROSE duplication across the four files.
  function normalize(text: string): string {
    return text
      .replace(/\[[^\]]*?\]\([^)]*\)/g, '') // markdown links
      .replace(/`[^`\n]+`/g, '') // inline code spans
      .replace(/^[\s|:\-]*[|:\-][\s|:\-]*$/gm, '') // table separators (incl. `| --- | --- |` style with spaces)
      .replace(/^\s*```[\s\S]*?```\s*$/gm, '') // fenced code blocks
      .replace(/<!--[\s\S]*?-->/g, '') // html comments (incl. audience tag)
      .replace(/<!--/g, ''); // defensive: remove any remaining comment-opens after the above pass
  }

  const contents = TOPLINE_FILES.map(({ file }) => ({
    file,
    text: normalize(read(file)),
  }));

  function isSubstantive(chunk: string): boolean {
    if (/^\s*$/.test(chunk)) return false;
    // Require at least 40 non-whitespace characters in the 80-char window
    // to rule out mostly-blank slices from the normalized text.
    const nonSpace = chunk.replace(/\s+/g, '');
    return nonSpace.length >= 40;
  }

  for (let i = 0; i < contents.length; i++) {
    for (let j = i + 1; j < contents.length; j++) {
      const a = contents[i];
      const b = contents[j];
      it(`${a.file} and ${b.file} share no 80-char substantive prose`, () => {
        const N = 80;
        const dupes: string[] = [];
        for (let k = 0; k <= a.text.length - N; k++) {
          const sub = a.text.slice(k, k + N);
          if (!isSubstantive(sub)) continue;
          if (b.text.includes(sub)) {
            dupes.push(sub);
            k += N; // avoid counting the same run twice
          }
        }
        expect(dupes, `found duplicated content: ${dupes.slice(0, 3).join(' | ')}`).toEqual([]);
      });
    }
  }
});

describe('Topline files point at the glossary that owns the taxonomy', () => {
  it('docs/automation-glossary.md exists and declares its version', () => {
    const glossary = read(GLOSSARY_PATH);
    // Frontmatter must declare a semver on the first few lines so the
    // manifest validator can cross-check glossary_version.
    const versionMatch = glossary.match(/^version:\s*["']?([\d.]+)["']?\s*$/m);
    expect(versionMatch, 'glossary missing version frontmatter').not.toBeNull();
    expect(versionMatch![1]).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('.well-known/automation.yaml glossary_version matches the glossary', () => {
    const manifest = read('.well-known/automation.yaml');
    const glossary = read(GLOSSARY_PATH);
    const manifestVersion = manifest.match(/glossary_version:\s*["']?([\d.]+)["']?/);
    const glossaryVersion = glossary.match(/^version:\s*["']?([\d.]+)["']?\s*$/m);
    expect(manifestVersion).not.toBeNull();
    expect(glossaryVersion).not.toBeNull();
    expect(manifestVersion![1]).toBe(glossaryVersion![1]);
  });
});
