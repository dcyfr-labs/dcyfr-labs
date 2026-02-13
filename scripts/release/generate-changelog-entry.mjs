#!/usr/bin/env node

/**
 * Automated Changelog Entry Generator
 *
 * Extracts changes from PR, todo.md, commits, and file changes to generate
 * a Keep a Changelog format entry.
 *
 * Input sources (priority order):
 * 1. todo.md → done.md moves (highest signal)
 * 2. PR description "Changes Made" section
 * 3. Commit messages (conventional commits)
 * 4. File changes analysis
 *
 * Usage:
 *   node scripts/release/generate-changelog-entry.mjs --pr=123 --version=2026.02.01
 *   GH_TOKEN=xxx node scripts/release/generate-changelog-entry.mjs --pr=123 --version=2026.02.01
 *
 * Environment:
 *   GH_TOKEN - GitHub API token (required for PR data)
 *   DEBUG=true - Enable debug output
 *
 * @see https://keepachangelog.com/ for format specification
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const prNumber = args.find((arg) => arg.startsWith('--pr='))?.split('=')[1];
const version = args.find((arg) => arg.startsWith('--version='))?.split('=')[1];
const debug = process.env.DEBUG === 'true';

// GitHub API configuration
const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const REPO = 'dcyfr/dcyfr-labs'; // TODO: Extract from git remote

/**
 * Debug logging
 */
function debugLog(...args) {
  if (debug) {
    console.error('[DEBUG]', ...args);
  }
}

/**
 * Fetch PR data from GitHub API
 * @param {string} prNumber - PR number
 * @returns {Promise<Object>} PR data
 */
async function fetchPRData(prNumber) {
  if (!GH_TOKEN) {
    console.error('⚠️  Warning: GH_TOKEN not set, using fallback data extraction');
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    debugLog('PR Data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`❌ Error fetching PR data:`, error.message);
    return null;
  }
}

/**
 * Parse PR description for changes
 * @param {string} description - PR description body
 * @returns {Object} Extracted sections
 */
function parsePRDescription(description) {
  if (!description) {
    return { summary: '', changes: [], breaking: false };
  }

  const sections = {
    summary: '',
    changes: [],
    breaking: false,
  };

  // Extract summary (first paragraph or up to first heading)
  const summaryMatch = description.match(/^(.+?)(?:\n#{1,6}|$)/s);
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim();
  }

  // Extract "Changes Made" section
  const changesMatch = description.match(/##?\s*Changes?\s*Made[\s\S]*?\n((?:[-*]\s+.+\n?)+)/i);
  if (changesMatch) {
    sections.changes = changesMatch[1]
      .split('\n')
      .filter((line) => line.trim().match(/^[-*]\s+/))
      .map((line) => line.trim().replace(/^[-*]\s+/, ''));
  }

  // Detect breaking changes
  sections.breaking = /breaking/i.test(description);

  return sections;
}

/**
 * Get git diff for PR
 * @param {string} prNumber - PR number
 * @returns {string} Git diff output
 */
function getPRDiff(prNumber) {
  try {
    // FIX: CWE-78 - Validate PR number is numeric to prevent command injection
    if (!/^\d+$/.test(String(prNumber))) {
      console.error('❌ Invalid PR number format. Expected: numeric value');
      return '';
    }

    // Get merge commit for PR (use execFileSync with array args to avoid shell injection)
    const mergeCommit = execFileSync(
      'git',
      ['log', '--oneline', '--merges', `--grep=Merge pull request #${prNumber}`, '-1', '--format=%H'],
      { cwd: ROOT_DIR, encoding: 'utf-8' }
    ).trim();

    if (!mergeCommit) {
      debugLog('No merge commit found for PR', prNumber);
      return '';
    }

    // Get diff from merge commit
    const diff = execFileSync('git', ['diff', `${mergeCommit}^..${mergeCommit}`], {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    });

    return diff;
  } catch (error) {
    console.error('⚠️  Warning: Could not get PR diff:', error.message);
    return '';
  }
}

/**
 * Extract todo.md → done.md moves from diff
 * @param {string} diff - Git diff output
 * @returns {string[]} Array of completed tasks
 */
function extractTodoMoves(diff) {
  const tasks = [];

  // Look for lines removed from todo.md (starting with "- [ ]" or "- [x]")
  const todoRemovals = diff.match(/^-\s*-\s*\[[ x]\]\s*(.+)$/gm) || [];

  // Look for lines added to done.md
  const doneAdditions = diff.match(/^\+\s*-\s*\[x\]\s*(.+)$/gm) || [];

  // Parse task text
  const parsedTasks = [...todoRemovals, ...doneAdditions]
    .map((line) => {
      const match = line.match(/\[[ x]\]\s*(.+?)(?:\s*\([0-9.]+h\))?$/);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);

  // Deduplicate
  return [...new Set(parsedTasks)];
}

/**
 * Get commit messages for PR
 * @param {string} prNumber - PR number
 * @returns {string[]} Array of commit messages
 */
function getCommitMessages(prNumber) {
  try {
    // FIX: CWE-78 - Validate PR number is numeric to prevent command injection
    if (!/^\d+$/.test(String(prNumber))) {
      console.error('❌ Invalid PR number format. Expected: numeric value');
      return [];
    }

    const mergeCommit = execFileSync(
      'git',
      ['log', '--oneline', '--merges', `--grep=Merge pull request #${prNumber}`, '-1', '--format=%H'],
      { cwd: ROOT_DIR, encoding: 'utf-8' }
    ).trim();

    if (!mergeCommit) {
      return [];
    }

    const commits = execFileSync('git', ['log', `${mergeCommit}^..${mergeCommit}`, '--format=%s'], {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    }).trim();

    return commits.split('\n').filter(Boolean);
  } catch (error) {
    debugLog('Could not get commit messages:', error.message);
    return [];
  }
}

/**
 * Categorize change based on conventional commit format
 * @param {string} message - Commit message
 * @returns {string} Category (Added, Changed, Fixed, etc.)
 */
function categorizeCommit(message) {
  const lowerMessage = message.toLowerCase();

  if (/^feat(\(.+\))?:/.test(message)) return 'Added';
  if (/^fix(\(.+\))?:/.test(message)) return 'Fixed';
  if (/^refactor(\(.+\))?:/.test(message)) return 'Changed';
  if (/^chore(\(.+\))?:/.test(message)) return 'Changed';
  if (/^docs(\(.+\))?:/.test(message)) return 'Changed';
  if (/^style(\(.+\))?:/.test(message)) return 'Changed';
  if (/^perf(\(.+\))?:/.test(message)) return 'Changed';
  if (/^test(\(.+\))?:/.test(message)) return 'Changed';
  if (/^build(\(.+\))?:/.test(message)) return 'Changed';
  if (/^ci(\(.+\))?:/.test(message)) return 'Changed';

  // Keyword-based categorization
  if (lowerMessage.includes('add') || lowerMessage.includes('create')) return 'Added';
  if (lowerMessage.includes('fix') || lowerMessage.includes('resolve')) return 'Fixed';
  if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) return 'Removed';
  if (lowerMessage.includes('deprecate')) return 'Deprecated';
  if (lowerMessage.includes('security') || lowerMessage.includes('vulnerab')) return 'Security';

  return 'Changed'; // Default category
}

/**
 * Analyze file changes to infer changelog entries
 * @param {string} diff - Git diff output
 * @returns {Object} Categorized file changes
 */
function analyzeFileChanges(diff) {
  const changes = {
    Added: [],
    Changed: [],
    Removed: [],
    Fixed: [],
  };

  // Extract file paths from diff
  const fileMatches = diff.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm);

  for (const match of fileMatches) {
    const filePath = match[2];

    // Skip non-source files
    if (filePath.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) continue;
    if (filePath.match(/^(\.github|\.vscode|docs|scripts)/)) continue;

    // Detect new files
    if (diff.includes(`new file mode`) && diff.includes(filePath)) {
      if (filePath.match(/^src\/components\//)) {
        const componentName = filePath.match(/\/([^/]+)\/index\.tsx?$/)?.[1];
        if (componentName) {
          changes.Added.push(`New component: ${componentName}`);
        }
      } else if (filePath.match(/^src\/app\//)) {
        const pageName = filePath.match(/\/([^/]+)\/page\.tsx?$/)?.[1];
        if (pageName) {
          changes.Added.push(`New page: /${pageName}`);
        }
      } else if (filePath.match(/^src\/lib\//)) {
        const libName = filePath.match(/\/([^/]+)\.(ts|tsx|js|jsx)$/)?.[1];
        if (libName) {
          changes.Added.push(`New utility: ${libName}`);
        }
      }
    }

    // Detect deleted files
    if (diff.includes(`deleted file mode`) && diff.includes(filePath)) {
      changes.Removed.push(`Removed ${filePath}`);
    }
  }

  return changes;
}

/**
 * Detect breaking changes
 * @param {Object} prData - PR data from GitHub API
 * @param {string[]} commits - Commit messages
 * @param {string} diff - Git diff
 * @returns {boolean} True if breaking changes detected
 */
function detectBreakingChanges(prData, commits, diff) {
  // Check PR labels
  if (prData?.labels?.some((label) => label.name === 'breaking-change')) {
    return true;
  }

  // Check commit messages for "BREAKING CHANGE:"
  if (commits.some((msg) => /BREAKING CHANGE:/i.test(msg))) {
    return true;
  }

  // Check PR body for breaking change checkbox
  if (prData?.body && /\[x\].*breaking/i.test(prData.body)) {
    return true;
  }

  return false;
}

/**
 * Generate changelog entry
 * @param {Object} data - Aggregated changelog data
 * @returns {string} Formatted changelog entry
 */
function generateChangelogEntry(data) {
  const { version, summary, categories, breaking } = data;

  let entry = `## [${version}]`;

  // Add date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  entry += ` - ${dateStr}`;

  // Add breaking change marker
  if (breaking) {
    entry += ` ⚠️ BREAKING`;
  }

  entry += '\n\n';

  // Add summary if available
  if (summary) {
    entry += `${summary}\n\n`;
  }

  // Add categorized changes
  const standardCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];

  for (const category of standardCategories) {
    const items = categories[category];
    if (items && items.length > 0) {
      entry += `### ${category}\n\n`;
      for (const item of items) {
        entry += `- ${item}\n`;
      }
      entry += '\n';
    }
  }

  return entry.trim();
}

/**
 * Main execution
 */
async function main() {
  console.error('📝 Changelog Entry Generator');
  console.error('============================\n');

  // Validate inputs
  if (!prNumber) {
    console.error('❌ Error: --pr=<number> is required');
    process.exit(1);
  }

  if (!version) {
    console.error('❌ Error: --version=<version> is required');
    process.exit(1);
  }

  console.error(`📌 PR #${prNumber}`);
  console.error(`📦 Version: ${version}\n`);

  // Fetch PR data
  const prData = await fetchPRData(prNumber);

  // Get git diff
  const diff = getPRDiff(prNumber);

  // Extract todo moves
  console.error('🔍 Extracting todo.md → done.md moves...');
  const todoMoves = extractTodoMoves(diff);
  debugLog('Todo moves:', todoMoves);

  // Parse PR description
  console.error('🔍 Parsing PR description...');
  const prInfo = parsePRDescription(prData?.body || '');
  debugLog('PR info:', prInfo);

  // Get commit messages
  console.error('🔍 Analyzing commit messages...');
  const commits = getCommitMessages(prNumber);
  debugLog('Commits:', commits);

  // Analyze file changes
  console.error('🔍 Analyzing file changes...');
  const fileChanges = analyzeFileChanges(diff);
  debugLog('File changes:', fileChanges);

  // Detect breaking changes
  const breaking = detectBreakingChanges(prData, commits, diff);
  debugLog('Breaking changes:', breaking);

  // Aggregate changes by category
  const categories = {
    Added: [],
    Changed: [],
    Deprecated: [],
    Removed: [],
    Fixed: [],
    Security: [],
  };

  // Add todo moves (highest priority)
  for (const task of todoMoves) {
    // Infer category from task text
    const category = categorizeCommit(task);
    if (!categories[category].includes(task)) {
      categories[category].push(task);
    }
  }

  // Add PR description changes
  for (const change of prInfo.changes) {
    const category = categorizeCommit(change);
    if (!categories[category].includes(change)) {
      categories[category].push(change);
    }
  }

  // Add file changes
  for (const [category, items] of Object.entries(fileChanges)) {
    for (const item of items) {
      if (!categories[category].includes(item)) {
        categories[category].push(item);
      }
    }
  }

  // Add commit messages (fallback)
  if (Object.values(categories).every((arr) => arr.length === 0)) {
    for (const commit of commits) {
      // Skip merge commits
      if (commit.startsWith('Merge')) continue;

      const category = categorizeCommit(commit);
      // Remove conventional commit prefix
      const cleanMessage = commit.replace(
        /^(feat|fix|refactor|chore|docs|style|perf|test|build|ci)(\(.+\))?:\s*/,
        ''
      );
      if (!categories[category].includes(cleanMessage)) {
        categories[category].push(cleanMessage);
      }
    }
  }

  // Generate changelog entry
  console.error('✍️  Generating changelog entry...\n');
  const changelogEntry = generateChangelogEntry({
    version,
    summary: prInfo.summary,
    categories,
    breaking,
  });

  // Output to stdout
  console.log(changelogEntry);

  console.error(`\n✅ Changelog entry generated (${changelogEntry.split('\n').length} lines)`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
export {
  fetchPRData,
  parsePRDescription,
  extractTodoMoves,
  categorizeCommit,
  analyzeFileChanges,
  detectBreakingChanges,
  generateChangelogEntry,
};
