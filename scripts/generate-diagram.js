#!/usr/bin/env node
/**
 * visual-explainer/lib/generate.js
 *
 * Parses a diagram source file (content/diagrams/<name>.md) and writes
 * a self-contained HTML file to the specified output path.
 *
 * Usage:
 *   node .claude/skills/visual-explainer/lib/generate.js <source.md> <output.html>
 *
 * Called by scripts/generate-diagrams.sh and the visual-explainer skill.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, basename, extname } from 'path';

const [, , sourcePath, outputPath] = process.argv;

if (!sourcePath || !outputPath) {
  console.error('Usage: generate.js <source.md> <output.html>');
  process.exit(1);
}

// --- Parse source ---

const raw = readFileSync(sourcePath, 'utf8');

function extractMetaField(text, field) {
  const re = new RegExp(`^-\\s+${field}:\\s*(.+)$`, 'm');
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

const title = extractMetaField(raw, 'Title') || basename(sourcePath, extname(sourcePath));
const tlp = extractMetaField(raw, 'TLP') || 'CLEAR';

if (tlp !== 'CLEAR') {
  console.error(
    `Skipping ${sourcePath}: TLP is ${tlp} (only CLEAR diagrams are rendered publicly)`
  );
  process.exit(2);
}

// Extract mermaid fenced block inside ## Diagram section
const diagramSection = raw.match(/##\s+Diagram[\s\S]*?```mermaid\n([\s\S]*?)```/);
if (!diagramSection) {
  console.error(`No \`\`\`mermaid block found in ${sourcePath}`);
  process.exit(3);
}

const mermaidDsl = diagramSection[1].trimEnd();

// --- Generate HTML ---

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      font-family: system-ui, sans-serif;
      padding: 1rem;
    }
    .mermaid {
      width: 100%;
      max-width: 900px;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0f172a; }
    }
    @media (prefers-color-scheme: light) {
      body { background: #ffffff; }
    }
  </style>
</head>
<body>
  <div class="mermaid">
${mermaidDsl}
  </div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'strict',
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      mermaid.initialize({ startOnLoad: false, theme: e.matches ? 'dark' : 'default' });
      mermaid.run();
    });
  </script>
</body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html, 'utf8');
console.log(`✓  ${sourcePath} → ${outputPath}`);

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
