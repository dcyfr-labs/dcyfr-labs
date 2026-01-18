#!/usr/bin/env node

/**
 * Todo Completion Checker
 *
 * Checks if any TODOs remain incomplete in the current session.
 * Used as a Stop hook to prevent agents from abandoning work.
 *
 * Inspired by oh-my-opencode's Sisyphus agent pattern.
 *
 * Exit codes:
 * - 0: All todos complete (or no todos exist)
 * - 1: Incomplete todos remain (warning)
 *
 * Usage:
 *   node scripts/check-todos-complete.mjs
 *   node scripts/check-todos-complete.mjs --strict  # Exit 1 on any incomplete
 *   node scripts/check-todos-complete.mjs --json    # JSON output
 *
 * @see docs/ai/claude-code-enhancements.md
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  // Session state files to check (in order of priority)
  sessionFiles: [
    '.claude/.session-state.json',
    '.opencode/.session-state.json',
    '.github/copilot-session-state.json',
  ],
  // Patterns that indicate incomplete work in code
  codePatterns: [
    /\/\/\s*TODO(?:\s*\(.*?\))?:\s*(.+)/gi,
    /\/\/\s*FIXME(?:\s*\(.*?\))?:\s*(.+)/gi,
    /\/\/\s*HACK(?:\s*\(.*?\))?:\s*(.+)/gi,
    /\/\*\s*TODO(?:\s*\(.*?\))?:\s*(.+?)\s*\*\//gi,
  ],
  // Files to scan for code TODOs (recently modified)
  scanExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  // Ignore patterns
  ignorePatterns: ['node_modules', '.next', 'dist', '.git', 'coverage'],
};

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// =============================================================================
// Session State Checker
// =============================================================================

/**
 * Check session state files for incomplete todos
 */
function checkSessionTodos() {
  const results = {
    found: false,
    file: null,
    todos: [],
    pending: [],
    inProgress: [],
    completed: [],
  };

  for (const sessionFile of CONFIG.sessionFiles) {
    const fullPath = join(projectRoot, sessionFile);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const state = JSON.parse(content);

        if (state.todos && Array.isArray(state.todos)) {
          results.found = true;
          results.file = sessionFile;
          results.todos = state.todos;

          for (const todo of state.todos) {
            const status = todo.status?.toLowerCase() || 'unknown';
            if (status === 'pending') {
              results.pending.push(todo);
            } else if (status === 'in_progress' || status === 'in-progress') {
              results.inProgress.push(todo);
            } else if (status === 'completed' || status === 'done') {
              results.completed.push(todo);
            }
          }
          break; // Use first found session file
        }
      } catch {
        // Invalid JSON, continue to next file
      }
    }
  }

  return results;
}

// =============================================================================
// Code TODO Scanner
// =============================================================================

/**
 * Get recently modified files (within last hour)
 */
function getRecentlyModifiedFiles(dir, files = [], maxDepth = 5, depth = 0) {
  if (depth > maxDepth) return files;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip ignored patterns
      if (CONFIG.ignorePatterns.some((p) => entry.name.includes(p))) {
        continue;
      }

      if (entry.isDirectory()) {
        getRecentlyModifiedFiles(fullPath, files, maxDepth, depth + 1);
      } else if (entry.isFile()) {
        const ext = entry.name.substring(entry.name.lastIndexOf('.'));
        if (CONFIG.scanExtensions.includes(ext)) {
          try {
            const stats = statSync(fullPath);
            if (stats.mtimeMs > oneHourAgo) {
              files.push(fullPath);
            }
          } catch {
            // Skip files we can't stat
          }
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

/**
 * Scan code files for TODO comments
 */
function scanCodeTodos() {
  const results = {
    files: [],
    todos: [],
  };

  const recentFiles = getRecentlyModifiedFiles(join(projectRoot, 'src'));

  for (const file of recentFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = file.replace(projectRoot + '/', '');

      for (const pattern of CONFIG.codePatterns) {
        let match;
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;

        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          results.todos.push({
            file: relativePath,
            line: lineNumber,
            type: match[0].includes('FIXME')
              ? 'FIXME'
              : match[0].includes('HACK')
                ? 'HACK'
                : 'TODO',
            message: match[1]?.trim() || 'No description',
          });

          if (!results.files.includes(relativePath)) {
            results.files.push(relativePath);
          }
        }
      }
    } catch {
      // Skip files we can't read
    }
  }

  return results;
}

// =============================================================================
// Output Formatters
// =============================================================================

function formatSessionTodos(session) {
  if (!session.found) {
    return `${COLORS.dim}No session state file found${COLORS.reset}`;
  }

  const lines = [];
  lines.push(`${COLORS.cyan}Session: ${session.file}${COLORS.reset}`);
  lines.push(
    `  Total: ${session.todos.length} | ` +
      `${COLORS.green}Done: ${session.completed.length}${COLORS.reset} | ` +
      `${COLORS.yellow}In Progress: ${session.inProgress.length}${COLORS.reset} | ` +
      `${COLORS.red}Pending: ${session.pending.length}${COLORS.reset}`
  );

  if (session.inProgress.length > 0) {
    lines.push(`\n${COLORS.yellow}In Progress:${COLORS.reset}`);
    for (const todo of session.inProgress) {
      lines.push(`  - ${todo.content || todo.description || todo.id}`);
    }
  }

  if (session.pending.length > 0) {
    lines.push(`\n${COLORS.red}Pending:${COLORS.reset}`);
    for (const todo of session.pending) {
      lines.push(`  - ${todo.content || todo.description || todo.id}`);
    }
  }

  return lines.join('\n');
}

function formatCodeTodos(codeTodos) {
  if (codeTodos.todos.length === 0) {
    return `${COLORS.dim}No TODOs in recently modified files${COLORS.reset}`;
  }

  const lines = [];
  lines.push(
    `${COLORS.cyan}Code TODOs in ${codeTodos.files.length} file(s):${COLORS.reset}`
  );

  // Group by file
  const byFile = {};
  for (const todo of codeTodos.todos) {
    if (!byFile[todo.file]) byFile[todo.file] = [];
    byFile[todo.file].push(todo);
  }

  for (const [file, todos] of Object.entries(byFile)) {
    lines.push(`\n  ${COLORS.blue}${file}${COLORS.reset}`);
    for (const todo of todos) {
      const typeColor =
        todo.type === 'FIXME'
          ? COLORS.red
          : todo.type === 'HACK'
            ? COLORS.yellow
            : COLORS.dim;
      lines.push(
        `    L${todo.line}: ${typeColor}${todo.type}${COLORS.reset} ${todo.message}`
      );
    }
  }

  return lines.join('\n');
}

function generateContinuationPrompt(session, codeTodos) {
  const incomplete = [];

  if (session.inProgress.length > 0) {
    incomplete.push(
      ...session.inProgress.map((t) => t.content || t.description || t.id)
    );
  }
  if (session.pending.length > 0) {
    incomplete.push(
      ...session.pending.map((t) => t.content || t.description || t.id)
    );
  }
  if (codeTodos.todos.length > 0) {
    const fixmes = codeTodos.todos.filter((t) => t.type === 'FIXME');
    if (fixmes.length > 0) {
      incomplete.push(
        `Fix ${fixmes.length} FIXME(s) in ${new Set(fixmes.map((t) => t.file)).size} file(s)`
      );
    }
  }

  if (incomplete.length === 0) return null;

  return `Continue from previous session. Incomplete tasks:
${incomplete.slice(0, 5).map((t) => `- ${t}`).join('\n')}${incomplete.length > 5 ? `\n... and ${incomplete.length - 5} more` : ''}

Please complete these tasks before stopping.`;
}

// =============================================================================
// Main Execution
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const isStrict = args.includes('--strict');
  const isJson = args.includes('--json');
  const isQuiet = args.includes('--quiet') || args.includes('-q');

  // Check session todos
  const sessionTodos = checkSessionTodos();

  // Scan code for TODOs
  const codeTodos = scanCodeTodos();

  // Calculate status
  const hasIncomplete =
    sessionTodos.pending.length > 0 ||
    sessionTodos.inProgress.length > 0 ||
    codeTodos.todos.filter((t) => t.type === 'FIXME').length > 0;

  // JSON output
  if (isJson) {
    console.log(
      JSON.stringify(
        {
          status: hasIncomplete ? 'incomplete' : 'complete',
          session: {
            found: sessionTodos.found,
            file: sessionTodos.file,
            pending: sessionTodos.pending.length,
            inProgress: sessionTodos.inProgress.length,
            completed: sessionTodos.completed.length,
            todos: sessionTodos.todos,
          },
          code: {
            filesScanned: codeTodos.files.length,
            todos: codeTodos.todos,
          },
          continuationPrompt: generateContinuationPrompt(sessionTodos, codeTodos),
        },
        null,
        2
      )
    );
    process.exit(hasIncomplete && isStrict ? 1 : 0);
  }

  // Standard output
  if (!isQuiet) {
    console.log(`\n${COLORS.bright}Todo Completion Check${COLORS.reset}`);
    console.log('═'.repeat(50));

    console.log(`\n${formatSessionTodos(sessionTodos)}`);
    console.log(`\n${formatCodeTodos(codeTodos)}`);

    if (hasIncomplete) {
      console.log(`\n${COLORS.yellow}⚠️  Incomplete work detected${COLORS.reset}`);

      const prompt = generateContinuationPrompt(sessionTodos, codeTodos);
      if (prompt) {
        console.log(`\n${COLORS.cyan}Suggested continuation prompt:${COLORS.reset}`);
        console.log(`${COLORS.dim}─────────────────────────────────${COLORS.reset}`);
        console.log(prompt);
        console.log(`${COLORS.dim}─────────────────────────────────${COLORS.reset}`);
      }
    } else {
      console.log(`\n${COLORS.green}✅ All tracked todos complete${COLORS.reset}`);
    }

    console.log('');
  }

  // Exit code
  if (hasIncomplete && isStrict) {
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(`${COLORS.red}Error: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
