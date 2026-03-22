#!/usr/bin/env node

/**
 * Backlog Scanner - Layer 1 of Backlog Intelligence System
 *
 * Discovers and consolidates all backlog items from multiple sources:
 * - docs/operations task list markdown (structured)
 * - Code-level task markers in source comments
 * - Test infrastructure status (flaky, skipped, failing)
 * - Git history context (recent activity)
 * - Feature plans and roadmaps
 *
 * Outputs: scripts/backlog/backlog.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const backlogDir = path.resolve(__dirname);
const todoFile = path.resolve(rootDir, 'docs/operations/todo.md');

// Ensure backlog directory exists
if (!fs.existsSync(backlogDir)) {
  fs.mkdirSync(backlogDir, { recursive: true });
}

/**
 * Parse effort string into hours
 */
function parseEffortHours(effortStr) {
  if (!effortStr) return 0;
  const num = Number.parseFloat(effortStr) || 0;
  if (effortStr.match(/w|weeks?/i)) return num * 40;
  return num;
}

/**
 * Estimate priority and impact from task title
 */
function estimatePriorityAndImpact(title) {
  if (title.match(/quick|easy|simple/i)) return { priority: 'high', impact: 6 };
  if (title.match(/infrastructure|deployment|critical|high|urgent/i))
    return { priority: 'high', impact: 8 };
  if (title.match(/future|enhancement|backlog|defer/i)) return { priority: 'low', impact: 3 };
  if (title.match(/test|fix|debt|refactor/i)) return { priority: 'medium', impact: 5 };
  return { priority: 'medium', impact: 5 };
}

/**
 * Build a structured task object from a checkbox regex match.
 */
function buildTask(completed, title, effortStr, currentCategory) {
  const effortHours = parseEffortHours(effortStr);
  const { priority, impact } = estimatePriorityAndImpact(title);

  return {
    id: `todo-${Math.random().toString(36).slice(2, 11)}`,
    title,
    description: '',
    category: currentCategory || 'Uncategorized',
    effort_hours: effortHours,
    impact_score: impact,
    priority,
    status: completed ? 'completed' : 'pending',
    blockers: [],
    files_affected: [],
    related_docs: [],
    tags: [],
    created_at: new Date().toISOString().split('T')[0],
    last_updated: new Date().toISOString().split('T')[0],
  };
}

function parseChecklistTask(line, currentCategory) {
  const checkboxMatch = line.match(/^\s*-\s+\[([ xX])\]\s+(.+)$/);
  if (!checkboxMatch) return null;

  const completed = checkboxMatch[1].toLowerCase() === 'x';
  const taskText = checkboxMatch[2].trim();
  const effortMatch = taskText.match(/\((\d+(?:\.\d+)?(?:[hHwW]|hours?))\)\s*$/);
  const effortStr = effortMatch?.[1] || '0h';
  const title = effortMatch ? taskText.slice(0, taskText.lastIndexOf('(')).trim() : taskText;

  return buildTask(completed, title, effortStr, currentCategory);
}

/**
 * Parse operations task list markdown and extract structured tasks
 */
function scanTodoMarkdown() {
  if (!fs.existsSync(todoFile)) {
    console.warn(`⚠️  Warning: ${todoFile} not found`);
    return [];
  }

  const content = fs.readFileSync(todoFile, 'utf-8');
  const tasks = [];
  let currentCategory = null;
  let currentTask = null;

  const lines = content.split('\n');

  for (const line of lines) {
    // Detect category headers (## or ###)
    if (line.match(/^#{2,3}\s+(.+)$/)) {
      if (currentTask) tasks.push(currentTask);
      currentCategory = line.replace(/^#+\s+/, '').trim();
      currentTask = null;
      continue;
    }

    const parsedTask = parseChecklistTask(line, currentCategory);
    if (parsedTask) {
      if (currentTask) tasks.push(currentTask);
      currentTask = parsedTask;
    }
  }

  // Push last task
  if (currentTask) {
    tasks.push(currentTask);
  }

  return tasks;
}

/**
 * Scan codebase for task markers in source comments
 */
function scanCodeTodos() {
  const tasks = [];

  try {
    // Search for task markers in source comments

    // Use grep if available (faster), fall back to Node fs
    let grepOutput = '';
    try {
      grepOutput = execSync(
        // NOSONAR - Administrative script, inputs from controlled sources
        String.raw`grep -r "TODO:\|FIXME:\|XXX:" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
        {
          cwd: rootDir,
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024,
        }
      );
    } catch {
      // Silently fail if grep not available
    }

    // Parse grep output
    const lines = grepOutput.split('\n').filter((line) => line.trim());

    const pattern = /^(.+?):(\d+):\s*.*?(TODO|FIXME|XXX):\s*(.+?)$/;
    for (const line of lines) {
      const match = pattern.exec(line);
      if (match) {
        const [, filePath, lineNum, type, description] = match;

        const relativePath = path.relative(rootDir, filePath);
        tasks.push({
          id: `code-todo-${Math.random().toString(36).slice(2, 11)}`,
          title: `${type}: ${description}`,
          description: `Found in ${relativePath}:${lineNum}`,
          category: 'Code TODOs',
          effort_hours: 0.5, // Unknown, estimate conservatively
          impact_score: 4,
          priority: 'low',
          status: 'pending',
          blockers: [],
          files_affected: [relativePath],
          related_docs: [],
          tags: ['code-todo', type.toLowerCase()],
          created_at: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString().split('T')[0],
        });
      }
    }
  } catch {
    console.warn('⚠️  Warning: Could not scan code TODOs');
  }

  return tasks;
}

/**
 * Scan test infrastructure for flaky, skipped, failing tests
 */
function scanTestStatus() {
  const tasks = [];

  // Known flaky tests (documented in operations task list)
  const flakyTests = [
    {
      file: 'src/__tests__/lib/activity-heatmap.test.ts',
      line: 144,
      title: 'Fix date boundary issues in heatmap tests',
      effort: 1,
      impact: 6,
    },
    {
      file: 'src/__tests__/lib/activity-search.test.ts',
      line: 240,
      title: 'Fix performance tests (environment-dependent, flaky in CI)',
      effort: 1,
      impact: 5,
    },
    {
      file: 'src/__tests__/components/home/trending-section.test.tsx',
      line: 216,
      title: 'Fix Radix Tabs async behavior in tests',
      effort: 1.5,
      impact: 6,
    },
    {
      file: 'src/__tests__/components/home/trending-section.test.tsx',
      line: 448,
      title: 'Fix aria-selected not updating in tests',
      effort: 1,
      impact: 5,
    },
  ];

  for (const test of flakyTests) {
    tasks.push({
      id: `test-flaky-${Math.random().toString(36).slice(2, 11)}`,
      title: test.title,
      description: `Flaky test at ${test.file}:${test.line}`,
      category: 'Test Infrastructure',
      effort_hours: test.effort,
      impact_score: test.impact,
      priority: 'high',
      status: 'pending',
      blockers: [],
      files_affected: [test.file],
      related_docs: ['docs/operations/todo.md'],
      tags: ['test', 'flaky'],
      created_at: '2025-12-23',
      last_updated: new Date().toISOString().split('T')[0],
    });
  }

  return tasks;
}

/**
 * Get recent git activity for context
 */
function getGitContext() {
  try {
    const log = execSync("git log --oneline --since='1 week ago' | head -10", {
      // NOSONAR - Administrative script, inputs from controlled sources
      cwd: rootDir,
      encoding: 'utf-8',
    });
    return log.split('\n').filter((line) => line.trim());
  } catch {
    return [];
  }
}

/**
 * Generate comprehensive backlog JSON
 */
function generateBacklogJson(allTasks) {
  const categories = [
    'Quick Wins',
    'Active Development',
    'Technical Debt',
    'Test Infrastructure',
    'Code TODOs',
    'Future Enhancements',
    'Recurring Maintenance',
    'Uncategorized',
  ];

  const categorizedTasks = {};
  for (const cat of categories) {
    categorizedTasks[cat] = allTasks.filter((t) => t.category === cat);
  }

  const backlog = {
    generated_at: new Date().toISOString(),
    version: '1.0.0',
    categories: categories
      .filter((cat) => categorizedTasks[cat].length > 0)
      .map((cat) => ({
        id: cat.toLowerCase().replaceAll(/\s+/g, '-'),
        name: cat,
        description: getCategoryDescription(cat),
        task_count: categorizedTasks[cat].length,
        total_effort_hours: categorizedTasks[cat].reduce(
          (sum, t) => sum + (t.effort_hours || 0),
          0
        ),
        tasks: categorizedTasks[cat],
      })),
    statistics: {
      total_tasks: allTasks.length,
      ready_to_start: allTasks.filter((t) => t.status === 'pending' && t.blockers.length === 0)
        .length,
      blocked: allTasks.filter((t) => t.blockers.length > 0).length,
      in_progress: allTasks.filter((t) => t.status === 'in_progress').length,
      completed: allTasks.filter((t) => t.status === 'completed').length,
      total_effort_hours: allTasks.reduce((sum, t) => sum + (t.effort_hours || 0), 0),
    },
    recent_git_activity: getGitContext(),
  };

  return backlog;
}

function getCategoryDescription(category) {
  const descriptions = {
    'Quick Wins': 'High impact, low effort tasks',
    'Active Development': 'Currently in progress or next priority',
    'Technical Debt': 'Code quality, tests, refactoring',
    'Test Infrastructure': 'Test maintenance and reliability',
    'Code TODOs': 'Code-level TODO/FIXME comments',
    'Future Enhancements': 'Low priority, backlog items',
    'Recurring Maintenance': 'Weekly, monthly, quarterly tasks',
    Uncategorized: 'Items without category',
  };

  return descriptions[category] || '';
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Scanning backlog...\n');

  try {
    // Collect tasks from all sources
    console.log('  📋 Parsing todo.md...');
    const todoTasks = scanTodoMarkdown();
    console.log(`     ✓ Found ${todoTasks.length} tasks`);

    console.log('  🔎 Scanning code TODOs...');
    const codeTodos = scanCodeTodos();
    console.log(`     ✓ Found ${codeTodos.length} code TODOs`);

    console.log('  🧪 Scanning test infrastructure...');
    const testTasks = scanTestStatus();
    console.log(`     ✓ Found ${testTasks.length} test issues`);

    const allTasks = [...todoTasks, ...codeTodos, ...testTasks];

    // Generate backlog
    console.log('\n  📊 Generating backlog.json...');
    const backlog = generateBacklogJson(allTasks);

    // Write backlog file
    const outputPath = path.resolve(backlogDir, 'backlog.json');
    fs.writeFileSync(outputPath, JSON.stringify(backlog, null, 2));

    console.log(`     ✓ Saved to ${path.relative(rootDir, outputPath)}`);

    // Summary
    console.log('\n📈 Backlog Summary:');
    console.log(`   Total Tasks: ${backlog.statistics.total_tasks}`);
    console.log(`   Ready to Start: ${backlog.statistics.ready_to_start}`);
    console.log(`   Blocked: ${backlog.statistics.blocked}`);
    console.log(`   In Progress: ${backlog.statistics.in_progress}`);
    console.log(`   Total Effort: ${backlog.statistics.total_effort_hours}h`);

    console.log('\n✅ Backlog scan complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error scanning backlog:', error.message);
    process.exit(1);
  }
}

await main();
