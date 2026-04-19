#!/usr/bin/env node
// Phase 0 inventory generator for openspec change `dcyfr-labs-cleanup`.
// Produces ground-truth reports in docs/_inventory/. Self-contained, deletable in Phase 9.
//
// Usage: node scripts/_inventory.mjs
//
// Reports written:
//   docs/_inventory/scripts.md         — every package.json script + provenance grep
//   docs/_inventory/routes.md          — every page.tsx + route.ts + has_test + linked_from
//   docs/_inventory/workflows.md       — every .github/workflows/*.yml + triggers + overlap
//   docs/_inventory/deps.md            — declared deps with naive used/unused classification
//   docs/_inventory/docs.md            — every docs/**/*.md with topic + freshness
//   docs/_inventory/topline-claims.md  — pattern audit of README/AGENTS/CLAUDE/copilot
//   docs/_inventory/external-refs.md   — vercel.json crons, op://, sentry, dependabot
//
// Reads only. No mutation outside docs/_inventory/.

import { readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative, dirname, basename } from 'node:path';

const REPO = process.cwd();
const OUT = join(REPO, 'docs', '_inventory');
mkdirSync(OUT, { recursive: true });

// ---------- helpers ----------

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch (_e) {
    return '';
  }
};

const shLines = (cmd) => sh(cmd).split('\n').filter(Boolean);

const gitLastDate = (file) => sh(`git log -1 --format=%cs -- "${file}"`) || '(untracked)';

const fileExists = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

const dirExists = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

// Recursive file walker that skips heavy/irrelevant trees.
const SKIP = new Set([
  'node_modules',
  '.git',
  '.next',
  'out',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '_deprecated',
]);
function walk(dir, exts = null) {
  const out = [];
  if (!dirExists(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, exts));
    else if (entry.isFile()) {
      if (!exts || exts.some((e) => p.endsWith(e))) out.push(p);
    }
  }
  return out;
}

// Build an in-memory haystack of every text file once, for fast in-process lookups.
const SEARCH_DIRS = [
  'src',
  'scripts',
  'content',
  'tests',
  'e2e',
  'docs',
  '.github',
  '.husky',
  'public',
];
const TEXT_EXTS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.yml',
  '.yaml',
  '.html',
  '.css',
  '.sh',
];
let HAYSTACK_MAP = null; // Map<relpath, contents>
function buildHaystack() {
  if (HAYSTACK_MAP) return HAYSTACK_MAP;
  HAYSTACK_MAP = new Map();
  for (const d of SEARCH_DIRS) {
    if (!dirExists(d)) continue;
    for (const f of walk(d, TEXT_EXTS)) {
      try {
        HAYSTACK_MAP.set(f, readFileSync(f, 'utf8'));
      } catch {}
    }
  }
  return HAYSTACK_MAP;
}

function grepRepo(needle) {
  const map = buildHaystack();
  const out = [];
  for (const [f, content] of map) {
    if (content.includes(needle)) out.push(f);
  }
  return out;
}

const tableHead = (cols) => `| ${cols.join(' | ')} |\n| ${cols.map(() => '---').join(' | ')} |`;

const esc = (s) =>
  String(s ?? '')
    .replace(/\\/g, '\\\\') // escape backslashes first so subsequent replacements don't double-escape
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');

// ---------- read source-of-truth files ----------

const pkg = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'));
const vercelJson = fileExists(join(REPO, 'vercel.json'))
  ? JSON.parse(readFileSync(join(REPO, 'vercel.json'), 'utf8'))
  : {};
const dependabotPath = join(REPO, '.github', 'dependabot.yml');
const dependabotConfig = fileExists(dependabotPath) ? readFileSync(dependabotPath, 'utf8') : '';

// ---------- 1. SCRIPTS ----------

function reportScripts() {
  const scripts = pkg.scripts || {};
  const names = Object.keys(scripts).sort();
  const rows = [];

  // Pre-grep workflows once for performance.
  const workflowFiles = dirExists('.github/workflows')
    ? readdirSync('.github/workflows')
        .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
        .map((f) => `.github/workflows/${f}`)
    : [];
  const workflowText = workflowFiles.map((f) => readFileSync(f, 'utf8')).join('\n---\n');

  const huskyFiles = dirExists('.husky')
    ? readdirSync('.husky')
        .filter((f) => !f.startsWith('_'))
        .map((f) => `.husky/${f}`)
    : [];
  const huskyText = huskyFiles
    .map((f) => {
      try {
        return readFileSync(f, 'utf8');
      } catch {
        return '';
      }
    })
    .join('\n---\n');

  for (const name of names) {
    const def = scripts[name];
    const refs = [];

    // Workflow refs.
    const wfRe = new RegExp(
      `(npm run|yarn|pnpm( run)?)\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
    );
    if (wfRe.test(workflowText)) refs.push('workflow');

    // Husky refs.
    if (wfRe.test(huskyText)) refs.push('husky');

    // Internal pkg refs (script calls another).
    let internal = false;
    for (const [otherName, otherDef] of Object.entries(scripts)) {
      if (otherName === name) continue;
      if (wfRe.test(otherDef)) {
        internal = true;
        break;
      }
    }
    if (internal) refs.push('npm-script');

    // Vercel buildCommand.
    if (vercelJson.buildCommand && wfRe.test(vercelJson.buildCommand)) refs.push('vercel');

    const status = refs.length === 0 ? '**orphan**' : 'used';
    const lastTouched = gitLastDate('package.json'); // package.json is monolithic; per-script granularity not possible
    rows.push([
      name,
      '`' +
        def.slice(0, 80).replace(/\\/g, '\\\\').replace(/`/g, '\\`') +
        (def.length > 80 ? '…' : '') +
        '`',
      refs.join(', ') || '—',
      status,
    ]);
  }

  const orphanCount = rows.filter((r) => r[3] === '**orphan**').length;
  const usedCount = rows.length - orphanCount;
  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — npm scripts',
    '',
    `**Total:** ${rows.length} scripts (${usedCount} referenced, ${orphanCount} orphan candidates)`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)} via \`scripts/_inventory.mjs\``,
    '',
    '**Status meaning:**',
    '- `used` — at least one of: referenced from a workflow, husky hook, another npm script, or `vercel.json` `buildCommand`',
    '- `orphan` — no automated reference found (still may be invoked by humans or external systems — verify before delete)',
    '',
    tableHead(['script', 'definition', 'referenced_by', 'status']),
    ...rows.map((r) => '| ' + r.map(esc).join(' | ') + ' |'),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'scripts.md'), out);
  return { total: rows.length, orphan: orphanCount };
}

// ---------- 2. ROUTES ----------

function reportRoutes() {
  const pages = walk('src/app', ['.tsx']).filter((f) => basename(f) === 'page.tsx');
  const apis = walk('src/app/api', ['.ts']).filter((f) => basename(f) === 'route.ts');
  const all = [...pages, ...apis];

  const vercelCrons = (vercelJson.crons || []).map((c) => c.path);
  const workflowText = dirExists('.github/workflows')
    ? readdirSync('.github/workflows')
        .filter((f) => f.endsWith('.yml'))
        .map((f) => readFileSync(`.github/workflows/${f}`, 'utf8'))
        .join('\n')
    : '';

  const rows = [];
  for (const file of all.sort()) {
    const rel = relative(REPO, file);
    // Derive route path: src/app/foo/page.tsx → /foo  ; src/app/api/foo/route.ts → /api/foo
    const routePath =
      '/' +
        dirname(rel)
          .replace(/^src\/app\/?/, '')
          .replace(/\/?\(.*?\)/g, '') || // strip route groups (group)
      '';
    const cleanPath = routePath === '/' ? '/' : routePath;

    const dirRel = dirname(rel);
    const hasTest =
      walk(dirRel, ['.test.ts', '.test.tsx']).length > 0 ||
      grepRepo(cleanPath).filter(
        (p) => p.includes('__tests__') || p.includes('/tests/') || p.includes('/e2e/')
      ).length > 0;

    const linkedFrom = grepRepo(cleanPath)
      .filter((p) => p !== rel && !p.startsWith('docs/_inventory'))
      .slice(0, 3);

    const inWorkflow = workflowText.includes(cleanPath);
    const inVercelCron = vercelCrons.some((c) => c === cleanPath || c.startsWith(cleanPath + '/'));

    const lastTouched = gitLastDate(rel);

    let status = 'shipped';
    if (linkedFrom.length === 0 && !hasTest && !inWorkflow && !inVercelCron) status = '**orphan**';

    rows.push({
      path: cleanPath,
      file: rel,
      has_test: hasTest ? 'yes' : 'no',
      linked_from: linkedFrom.length ? linkedFrom.join('<br>') : '—',
      external:
        [inWorkflow ? 'workflow' : null, inVercelCron ? 'vercel-cron' : null]
          .filter(Boolean)
          .join(', ') || '—',
      last_touched: lastTouched,
      status,
    });
  }

  const orphanCount = rows.filter((r) => r.status === '**orphan**').length;
  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — routes',
    '',
    `**Total:** ${rows.length} routes (${pages.length} pages, ${apis.length} API). ${orphanCount} orphan candidates.`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '**Protected (not orphan regardless of evidence):**',
    '- `src/app/.well-known/**`',
    '- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`',
    '- `src/app/api/health/**`',
    '- Any path appearing in `vercel.json` `crons:`',
    '',
    tableHead([
      'path',
      'file',
      'has_test',
      'linked_from',
      'external_refs',
      'last_touched',
      'status',
    ]),
    ...rows.map(
      (r) =>
        '| ' +
        [
          r.path,
          '`' + r.file + '`',
          r.has_test,
          r.linked_from,
          r.external,
          r.last_touched,
          r.status,
        ]
          .map(esc)
          .join(' | ') +
        ' |'
    ),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'routes.md'), out);
  return { total: rows.length, orphan: orphanCount, pages: pages.length, apis: apis.length };
}

// ---------- 3. WORKFLOWS ----------

function reportWorkflows() {
  if (!dirExists('.github/workflows')) {
    writeFileSync(
      join(OUT, 'workflows.md'),
      '# Inventory — workflows\n\nNo `.github/workflows/` directory.\n'
    );
    return { total: 0 };
  }
  const files = readdirSync('.github/workflows')
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort();

  // Group by name prefix for overlap detection.
  const groups = {};
  for (const f of files) {
    const stem = f.replace(/\.ya?ml$/, '');
    const root = stem.split(/[-_]/)[0];
    (groups[root] ||= []).push(f);
  }

  const rows = [];
  for (const f of files) {
    const path = `.github/workflows/${f}`;
    const text = readFileSync(path, 'utf8');
    // Naive trigger extraction: find top-level `on:` block keys.
    const onMatch = text.match(/^on:\s*\n([\s\S]*?)(?:\n[a-z]|\Z)/m);
    let triggers = [];
    if (onMatch) {
      const block = onMatch[1];
      const keys = [...block.matchAll(/^\s{2,4}([a-z_]+):/gm)].map((m) => m[1]);
      triggers = [...new Set(keys)];
    }
    if (/^on:\s*\[?(\w+)/.test(text)) {
      const m = text.match(/^on:\s*\[?(\w+)/);
      if (m) triggers.push(m[1]);
    }

    const stem = f.replace(/\.ya?ml$/, '');
    const root = stem.split(/[-_]/)[0];
    const overlap = (groups[root] || []).filter((x) => x !== f);

    const lastTouched = gitLastDate(path);
    rows.push([f, triggers.join(', ') || '(unknown)', overlap.join(', ') || '—', lastTouched]);
  }

  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — workflows',
    '',
    `**Total:** ${files.length} workflow files`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Note: `required_by_branch_protection` field is not populated by this script — it requires `gh api repos/dcyfr-labs/dcyfr-labs/branches/main/protection` and authenticated access. Check manually before deletion.',
    '',
    tableHead(['file', 'triggers', 'overlapping_with_same_prefix', 'last_touched']),
    ...rows.map((r) => '| ' + r.map(esc).join(' | ') + ' |'),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'workflows.md'), out);
  return { total: files.length };
}

// ---------- 4. DEPS ----------

function reportDeps() {
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };

  // Naive used/unused: grep `from "<dep>"` or `require("<dep>")` across src + scripts + tests + e2e + content + .config files.
  const searchPaths = ['src', 'scripts', 'tests', 'e2e', 'content'];
  const configFiles = readdirSync('.').filter(
    (f) => /\.(ts|mjs|cjs|js|json)$/.test(f) && !f.startsWith('_') && f !== 'package.json'
  );
  const haystack = (() => {
    const parts = [];
    for (const d of searchPaths) {
      if (dirExists(d)) {
        for (const f of walk(d, [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.mjs',
          '.cjs',
          '.json',
          '.md',
          '.mdx',
        ])) {
          try {
            parts.push(readFileSync(f, 'utf8'));
          } catch {}
        }
      }
    }
    for (const f of configFiles) {
      try {
        parts.push(readFileSync(f, 'utf8'));
      } catch {}
    }
    return parts.join('\n');
  })();

  const rows = [];
  const knownFalsePositives = new Set([
    // Frameworks that auto-load via convention or are referenced by string in config.
    'next',
    'react',
    'react-dom',
    'typescript',
    'eslint',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'tailwindcss',
    'postcss',
    'autoprefixer',
    '@tailwindcss/postcss',
    'vitest',
    '@vitejs/plugin-react',
    'tsx',
    'vite',
  ]);

  for (const [name, version] of Object.entries(allDeps)) {
    const isProd = !!deps[name];
    const escName = name.replace(/[/-]/g, '[/-]');
    const re = new RegExp(
      `(from\\s+["']${escName}(["'/])|require\\(["']${escName}(["'/])|import\\(["']${escName}(["'/])|"${escName}")`
    );
    const used = re.test(haystack) || knownFalsePositives.has(name);
    rows.push({
      name,
      version,
      kind: isProd ? 'dependency' : 'devDependency',
      status: used ? 'used' : '**unused?**',
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));

  const unused = rows.filter((r) => r.status === '**unused?**');
  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — dependencies',
    '',
    `**Total:** ${rows.length} (${Object.keys(deps).length} prod, ${Object.keys(devDeps).length} dev)`,
    `**Suspected unused:** ${unused.length}`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '**Method:** grep for `from "<dep>"`, `require("<dep>")`, `import("<dep>")`, or string literal `"<dep>"` across src/scripts/tests/e2e/content + top-level config files. **False positives expected** for framework deps that load via config string or convention. A pre-seeded false-positive list is applied (`next`, `react`, `eslint`, `tailwindcss`, etc.).',
    '',
    '**Verify before deletion:** run `npx depcheck --json` for an authoritative second opinion, and `npm run build` after any removal.',
    '',
    tableHead(['name', 'version', 'kind', 'status']),
    ...rows.map((r) => '| ' + [r.name, r.version, r.kind, r.status].map(esc).join(' | ') + ' |'),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'deps.md'), out);
  return { total: rows.length, suspectedUnused: unused.length };
}

// ---------- 5. DOCS ----------

function reportDocs() {
  if (!dirExists('docs')) {
    writeFileSync(join(OUT, 'docs.md'), '# Inventory — docs\n\nNo `docs/` directory.\n');
    return { total: 0 };
  }
  const files = walk('docs', ['.md', '.mdx'])
    .filter((f) => !f.startsWith('docs/_inventory/'))
    .sort();

  // Topic = first path segment under docs/.
  const rows = [];
  for (const f of files) {
    const rel = relative(REPO, f);
    const parts = rel.split('/');
    const topic = parts.length >= 3 ? parts[1] : '(root)';
    const lastTouched = gitLastDate(rel);

    // Orphan if filename never appears as a link target outside docs/.
    const stem = basename(rel);
    const referencedFromCode =
      grepRepo(stem).filter((p) => !p.startsWith('docs/') && p !== rel).length > 0;
    const status = referencedFromCode ? 'linked' : '—';

    // Detect dated/status patterns.
    const datedPattern =
      /(-summary|-complete|-status|-report|-validation|-\d{4}-\d{2}-\d{2})\.md$/i;
    const isPrivate = datedPattern.test(stem);
    rows.push({
      file: rel,
      topic,
      last_touched: lastTouched,
      status,
      private_pattern: isPrivate ? 'yes' : 'no',
    });
  }

  // Topic histogram.
  const topicCounts = {};
  for (const r of rows) topicCounts[r.topic] = (topicCounts[r.topic] || 0) + 1;
  const topicTable = [
    tableHead(['topic', 'files']),
    ...Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `| ${t} | ${n} |`),
  ].join('\n');

  const privateCount = rows.filter((r) => r.private_pattern === 'yes').length;
  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — docs',
    '',
    `**Total:** ${rows.length} markdown files under \`docs/\``,
    `**Files matching dated/status/summary patterns:** ${privateCount} (should move to \`docs/_private/\`)`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Topic histogram',
    '',
    topicTable,
    '',
    '## All files',
    '',
    tableHead(['file', 'topic', 'last_touched', 'linked_from_code', 'private_pattern']),
    ...rows.map(
      (r) =>
        '| ' +
        [r.file, r.topic, r.last_touched, r.status, r.private_pattern].map(esc).join(' | ') +
        ' |'
    ),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'docs.md'), out);
  return { total: rows.length, private: privateCount, topics: Object.keys(topicCounts).length };
}

// ---------- 6. TOPLINE CLAIMS ----------

function reportToplineClaims() {
  const targets = ['README.md', 'AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md'];
  const findings = [];

  // Patterns that flag verifiable / auditable claims.
  const patterns = [
    {
      name: 'test_count_ratio',
      re: /\b(\d{2,4})\s*\/\s*(\d{2,4})\b\s*(?:tests?|passing)?/gi,
      hint: 'test ratio claim',
    },
    {
      name: 'phase_complete',
      re: /\bPhase\s+\d+(?:[-–]\d+)?\s+complete\b/gi,
      hint: 'phase completion claim',
    },
    {
      name: 'weeks_saved',
      re: /\b\d+\s*[-–]\s*\d+\s*weeks?\s+saved\b/gi,
      hint: 'labor-savings claim',
    },
    {
      name: 'dollar_savings',
      re: /\$\s?\d{2,}[,]?\d*\s*[-–]\s*\$\s?\d{2,}[,]?\d*/g,
      hint: 'dollar savings claim',
    },
    {
      name: 'production_ai_platform',
      re: /\bproduction\s+ai\s+platform\b/gi,
      hint: 'positioning claim',
    },
    { name: 'agents_count', re: /\b(\d+)\s+(?:sub-)?agents?\b/gi, hint: 'agent count claim' },
    { name: 'skills_count', re: /\b(\d+)\s+skills?\b/gi, hint: 'skill count claim' },
    { name: 'url_localhost', re: /https?:\/\/localhost(:\d+)?\b/g, hint: 'localhost URL' },
    {
      name: 'url_internal_ip',
      re: /https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?\b/g,
      hint: 'internal IP URL',
    },
  ];

  for (const file of targets) {
    if (!fileExists(file)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const p of patterns) {
        p.re.lastIndex = 0;
        let m;
        while ((m = p.re.exec(line)) !== null) {
          findings.push({
            file,
            line: i + 1,
            pattern: p.name,
            hint: p.hint,
            excerpt: line.trim().slice(0, 120),
          });
        }
      }
    }
  }

  const lineCounts = targets
    .filter(fileExists)
    .map((f) => ({ file: f, lines: readFileSync(f, 'utf8').split('\n').length }));

  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — topline claims audit',
    '',
    `**Files audited:** ${lineCounts.length}`,
    `**Findings:** ${findings.length}`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Line counts vs budget',
    '',
    tableHead(['file', 'lines', 'budget', 'delta']),
    ...lineCounts.map(({ file, lines }) => {
      const budget =
        file === 'README.md' ? 200 : file === 'AGENTS.md' ? 300 : file === 'CLAUDE.md' ? 150 : 120;
      const delta = lines - budget;
      return `| ${file} | ${lines} | ${budget} | ${delta > 0 ? '+' + delta + ' over' : delta + ' under'} |`;
    }),
    '',
    '## Verifiable claims (audit each → mark `verified` / `stale` / `removed`)',
    '',
    '**Action:** Drew (or whoever runs Phase 5) reviews each finding below and decides whether the claim survives the rewrite. Stale ones are deleted; verified ones are reframed against current state.',
    '',
    tableHead(['file', 'line', 'pattern', 'excerpt', 'decision']),
    ...findings.map((f) => `| ${f.file} | ${f.line} | ${f.pattern} | ${esc(f.excerpt)} | _TBD_ |`),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'topline-claims.md'), out);
  return { findings: findings.length, files: lineCounts.length };
}

// ---------- 7. EXTERNAL REFS ----------

function reportExternalRefs() {
  const findings = [];

  // vercel.json crons + envs
  if (vercelJson.crons) {
    for (const c of vercelJson.crons) {
      findings.push({
        source: 'vercel.json',
        kind: 'cron',
        target: c.path,
        detail: `schedule: ${c.schedule}`,
      });
    }
  }
  if (vercelJson.env) {
    for (const k of Object.keys(vercelJson.env)) {
      findings.push({ source: 'vercel.json', kind: 'env', target: k, detail: vercelJson.env[k] });
    }
  }

  // dependabot
  if (dependabotConfig) {
    const ecosystems = [...dependabotConfig.matchAll(/package-ecosystem:\s*"?([^"\s]+)/g)].map(
      (m) => m[1]
    );
    findings.push({
      source: '.github/dependabot.yml',
      kind: 'dependabot',
      target: ecosystems.join(','),
      detail: 'auto-PR ecosystems',
    });
  }

  // 1Password op:// references in repo
  const opMatches = grepRepo('op://');
  for (const f of opMatches) {
    findings.push({
      source: f,
      kind: '1password-secret-ref',
      target: 'op://',
      detail: 'secret reference',
    });
  }

  // Sentry DSN references
  const sentryMatches = grepRepo('SENTRY_DSN');
  for (const f of sentryMatches.slice(0, 10)) {
    findings.push({ source: f, kind: 'sentry', target: 'SENTRY_DSN', detail: 'telemetry env var' });
  }

  // Inngest event keys
  const inngestMatches = grepRepo('INNGEST_');
  for (const f of inngestMatches.slice(0, 10)) {
    findings.push({
      source: f,
      kind: 'inngest',
      target: 'INNGEST_*',
      detail: 'background-job env var',
    });
  }

  const out = [
    '<!-- TLP:CLEAR -->',
    '# Inventory — external references',
    '',
    `**Findings:** ${findings.length}`,
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Note: Branch protection required-checks need `gh api repos/dcyfr-labs/dcyfr-labs/branches/main/protection` (not run by this script). Check manually before any workflow consolidation that touches required-status names.',
    '',
    tableHead(['source', 'kind', 'target', 'detail']),
    ...findings.map(
      (f) => `| ${esc(f.source)} | ${f.kind} | ${esc(f.target)} | ${esc(f.detail)} |`
    ),
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'external-refs.md'), out);
  return { findings: findings.length };
}

// ---------- run ----------

console.log('Phase 0 inventory generator — dcyfr-labs-cleanup');
console.log('Output: docs/_inventory/\n');

const t0 = Date.now();
const s = reportScripts();
console.log(`  scripts.md         ${s.total} scripts (${s.orphan} orphan candidates)`);
const r = reportRoutes();
console.log(
  `  routes.md          ${r.total} routes (${r.pages} pages, ${r.apis} api, ${r.orphan} orphan candidates)`
);
const w = reportWorkflows();
console.log(`  workflows.md       ${w.total} workflow files`);
const d = reportDeps();
console.log(`  deps.md            ${d.total} deps (${d.suspectedUnused} suspected unused)`);
const dc = reportDocs();
console.log(
  `  docs.md            ${dc.total} docs (${dc.topics} topics, ${dc.private} private-pattern)`
);
const tc = reportToplineClaims();
console.log(`  topline-claims.md  ${tc.findings} findings across ${tc.files} files`);
const ex = reportExternalRefs();
console.log(`  external-refs.md   ${ex.findings} external refs`);
console.log(`\nDone in ${Date.now() - t0}ms.`);
