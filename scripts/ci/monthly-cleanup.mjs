#!/usr/bin/env node

/**
 * Monthly Cleanup Script
 *
 * Analyzes codebase for cleanup opportunities:
 * - Dead code detection (unused exports)
 * - Unused dependencies
 * - Large files
 * - Duplicate code patterns
 * - TODO/FIXME comments
 *
 * Outputs markdown summary for GitHub Issue
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const LARGE_FILE_THRESHOLD = 500; // lines
const IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'coverage/**',
  'dist/**',
  'build/**',
  '.git/**',
];

/**
 * Run ts-prune to detect unused exports
 */
async function detectUnusedExports() {
  console.log('🔍 Detecting unused exports...');

  try {
    const output = execSync('npx ts-prune --error', { encoding: 'utf8' });

    // Parse output - ts-prune lists unused exports as:
    // path/to/file.ts:lineNumber - ExportName
    const lines = output.trim().split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return { count: 0, items: [] };
    }

    const items = lines.map(line => {
      const match = line.match(/^(.+?):(\d+)\s+-\s+(.+)$/);
      if (match) {
        const [, file, lineNum, exportName] = match;
        return { file, lineNum, exportName };
      }
      return null;
    }).filter(Boolean);

    return {
      count: items.length,
      items: items.slice(0, 20) // Limit to top 20
    };
  } catch (error) {
    // ts-prune exits with error code if unused exports found
    // Parse stderr for the actual results
    const output = error.stdout?.toString() || '';
    const lines = output.trim().split('\n').filter(line => line.trim() && !line.includes('used in module'));

    if (lines.length === 0) {
      return { count: 0, items: [] };
    }

    const items = lines.slice(0, 20).map(line => ({ raw: line }));
    return { count: lines.length, items };
  }
}

/**
 * Run depcheck to find unused dependencies
 */
async function detectUnusedDependencies() {
  console.log('📦 Detecting unused dependencies...');

  try {
    const output = execSync('npx depcheck --json', { encoding: 'utf8' });
    const results = JSON.parse(output);

    const unused = results.dependencies || [];
    const missing = Object.keys(results.missing || {});

    return {
      unusedCount: unused.length,
      unused: unused.slice(0, 15),
      missingCount: missing.length,
      missing: missing.slice(0, 10)
    };
  } catch (error) {
    console.error('depcheck failed:', error.message);
    return { unusedCount: 0, unused: [], missingCount: 0, missing: [] };
  }
}

/**
 * Find large files that might need refactoring
 */
async function findLargeFiles() {
  console.log('📏 Finding large files...');

  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: IGNORE_PATTERNS
  });

  const largeFiles = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n').length;

      if (lines > LARGE_FILE_THRESHOLD) {
        const stats = statSync(file);
        largeFiles.push({
          file,
          lines,
          size: Math.round(stats.size / 1024) // KB
        });
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  // Sort by line count descending
  largeFiles.sort((a, b) => b.lines - a.lines);

  return {
    count: largeFiles.length,
    files: largeFiles.slice(0, 10) // Top 10
  };
}

/**
 * Find TODO/FIXME comments
 */
async function findTodoComments() {
  console.log('📝 Finding TODO/FIXME comments...');

  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: IGNORE_PATTERNS
  });

  const todos = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const todoMatch = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX):?\s*(.+)/i);
        if (todoMatch) {
          todos.push({
            file,
            line: index + 1,
            type: todoMatch[1].toUpperCase(),
            comment: todoMatch[2].trim()
          });
        }
      });
    } catch (error) {
      continue;
    }
  }

  return {
    count: todos.length,
    items: todos.slice(0, 20) // Top 20
  };
}

/**
 * Check for duplicate package versions
 */
async function checkDuplicatePackages() {
  console.log('🔄 Checking for duplicate packages...');

  try {
    const output = execSync('npm ls --all --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const tree = JSON.parse(output);

    const versions = new Map();

    function traverse(node, depth = 0) {
      if (!node.dependencies) return;

      for (const [name, data] of Object.entries(node.dependencies)) {
        if (!versions.has(name)) {
          versions.set(name, new Set());
        }
        versions.get(name).add(data.version);
        traverse(data, depth + 1);
      }
    }

    traverse(tree);

    const duplicates = Array.from(versions.entries())
      .filter(([, versionSet]) => versionSet.size > 1)
      .map(([name, versionSet]) => ({
        package: name,
        versions: Array.from(versionSet)
      }));

    return {
      count: duplicates.length,
      items: duplicates.slice(0, 10)
    };
  } catch (error) {
    // npm ls can exit with error if there are issues
    return { count: 0, items: [] };
  }
}

/**
 * Generate workspace cleanup checklist
 */
function generateWorkspaceChecklist() {
  return [
    'Clear `.next` build cache: `rm -rf .next`',
    'Clear node_modules: `rm -rf node_modules && npm ci`',
    'Clear test coverage: `rm -rf coverage`',
    'Review and close stale GitHub Issues',
    'Archive old branches (check branch-cleanup report)',
    'Update dependencies: `npm outdated`',
    'Clean git objects: `git gc --aggressive`',
    'Review and update `.gitignore`'
  ];
}

/**
 * Format results as GitHub Issue markdown
 */
function formatUnusedExportsSection(unusedExports, sections) {
  if (unusedExports.count > 0) {
    sections.push('### 🗑️ Unused Exports\n');
    sections.push('These exports are not used anywhere in the codebase:\n');
    unusedExports.items.forEach(item => {
      if (item.raw) {
        sections.push(`- \`${item.raw}\``);
      } else {
        sections.push(`- [\`${item.exportName}\`](${item.file}#L${item.lineNum})`);
      }
    });
    if (unusedExports.count > unusedExports.items.length) {
      sections.push(`\n*...and ${unusedExports.count - unusedExports.items.length} more*`);
    }
    sections.push('');
  }
}

function formatUnusedDepsSection(unusedDeps, sections) {
  if (unusedDeps.unusedCount > 0) {
    sections.push('### 📦 Unused Dependencies\n');
    sections.push('Consider removing these from `package.json`:\n');
    unusedDeps.unused.forEach(dep => {
      sections.push(`- \`${dep}\``);
    });
    if (unusedDeps.unusedCount > unusedDeps.unused.length) {
      sections.push(`\n*...and ${unusedDeps.unusedCount - unusedDeps.unused.length} more*`);
    }
    sections.push('');
  }
}

function formatMissingDepsSection(unusedDeps, sections) {
  if (unusedDeps.missingCount > 0) {
    sections.push('### ⚠️ Missing Dependencies\n');
    sections.push('These are used but not in `package.json`:\n');
    unusedDeps.missing.forEach(dep => {
      sections.push(`- \`${dep}\``);
    });
    sections.push('');
  }
}

function formatLargeFilesSection(largeFiles, sections) {
  if (largeFiles.count > 0) {
    sections.push('### 📏 Large Files\n');
    sections.push('Consider refactoring these files:\n');
    sections.push('| File | Lines | Size |');
    sections.push('|------|-------|------|');
    largeFiles.files.forEach(file => {
      sections.push(`| [\`${file.file}\`](${file.file}) | ${file.lines} | ${file.size}KB |`);
    });
    if (largeFiles.count > largeFiles.files.length) {
      sections.push(`\n*...and ${largeFiles.count - largeFiles.files.length} more*`);
    }
    sections.push('');
  }
}

function formatTodosSection(todos, sections) {
  if (todos.count > 0) {
    sections.push('### 📝 TODO/FIXME Comments\n');
    sections.push('Technical debt to address:\n');
    todos.items.forEach(todo => {
      sections.push(`- **${todo.type}** [\`${todo.file}:${todo.line}\`](${todo.file}#L${todo.line}): ${todo.comment}`);
    });
    if (todos.count > todos.items.length) {
      sections.push(`\n*...and ${todos.count - todos.items.length} more*`);
    }
    sections.push('');
  }
}

function formatDuplicatesSection(duplicates, sections) {
  if (duplicates.count > 0) {
    sections.push('### 🔄 Duplicate Package Versions\n');
    sections.push('Multiple versions detected (may increase bundle size):\n');
    duplicates.items.forEach(dup => {
      sections.push(`- **${dup.package}**: ${dup.versions.join(', ')}`);
    });
    sections.push('');
  }
}

function formatIssueBody(data) {
  const sections = [];

  // Header
  sections.push('## Monthly Cleanup Report\n');
  sections.push(`**Generated:** ${new Date().toISOString().split('T')[0]}\n`);

  // Summary
  sections.push('### Summary\n');
  sections.push('| Category | Count |');
  sections.push('|----------|-------|');
  sections.push(`| Unused Exports | ${data.unusedExports.count} |`);
  sections.push(`| Unused Dependencies | ${data.unusedDeps.unusedCount} |`);
  sections.push(`| Large Files (>${LARGE_FILE_THRESHOLD} lines) | ${data.largeFiles.count} |`);
  sections.push(`| TODO Comments | ${data.todos.count} |`);
  sections.push(`| Duplicate Packages | ${data.duplicates.count} |`);
  sections.push('');

  formatUnusedExportsSection(data.unusedExports, sections);
  formatUnusedDepsSection(data.unusedDeps, sections);
  formatMissingDepsSection(data.unusedDeps, sections);
  formatLargeFilesSection(data.largeFiles, sections);
  formatTodosSection(data.todos, sections);
  formatDuplicatesSection(data.duplicates, sections);

  // Workspace Cleanup Checklist
  sections.push('### 🧹 Workspace Cleanup Checklist\n');
  data.workspaceChecklist.forEach(item => {
    sections.push(`- [ ] ${item}`);
  });
  sections.push('');

  // Action Items
  sections.push('### ✅ Action Items\n');
  sections.push('- [ ] Review and remove unused exports');
  sections.push('- [ ] Clean up unused dependencies');
  sections.push('- [ ] Consider refactoring large files');
  sections.push('- [ ] Address high-priority TODO comments');
  sections.push('- [ ] Resolve duplicate package versions');
  sections.push('- [ ] Complete workspace cleanup checklist');
  sections.push('');

  return sections.join('\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting monthly cleanup analysis...\n');

    const [unusedExports, unusedDeps, largeFiles, todos, duplicates] = await Promise.all([
      detectUnusedExports(),
      detectUnusedDependencies(),
      findLargeFiles(),
      findTodoComments(),
      checkDuplicatePackages()
    ]);

    const workspaceChecklist = generateWorkspaceChecklist();

    const data = {
      unusedExports,
      unusedDeps,
      largeFiles,
      todos,
      duplicates,
      workspaceChecklist
    };

    const markdown = formatIssueBody(data);
    console.log('\n' + markdown);

    // Exit with error if significant issues found
    const hasIssues =
      unusedExports.count > 10 ||
      unusedDeps.unusedCount > 5 ||
      largeFiles.count > 5 ||
      todos.count > 50;

    if (hasIssues) {
      console.error('\n⚠️ Significant cleanup opportunities found');
      process.exit(1);
    }

    console.log('\n✅ Cleanup analysis complete');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup analysis failed:', error);
    process.exit(1);
  }
}

main();
