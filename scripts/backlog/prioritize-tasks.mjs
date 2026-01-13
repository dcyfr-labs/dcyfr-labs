#!/usr/bin/env node

/**
 * Priority Engine - Layer 2 of Backlog Intelligence System
 *
 * Scores and ranks tasks based on multiple factors:
 * - Effort (inverse - lower effort = higher score)
 * - Impact (user-defined or inferred)
 * - Urgency (based on age, blockers, dependencies)
 * - Readiness (no blockers, all dependencies complete)
 * - Context fit (time available, skill level)
 *
 * Supports filtering by:
 * - Time: quick (1-2h), half-day (2-4h), full-day (4-8h)
 * - Skill: junior, mid, senior
 * - Category: rivet, infrastructure, tests, debt, etc.
 *
 * Outputs: scripts/backlog/prioritized-tasks.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backlogDir = __dirname;
const backlogPath = path.resolve(backlogDir, "backlog.json");

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    time: null, // quick, half-day, full-day
    skill: "mid", // junior, mid, senior
    category: null,
    limit: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const [key, value] = args[i].substring(2).split("=");
      if (value) options[key] = value;
      else if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        options[key] = args[i + 1];
        i++;
      }
    }
  }

  return options;
}

/**
 * Calculate time window in hours
 */
function getTimeWindow(timeOption) {
  const windows = {
    quick: { min: 0.5, max: 2 },
    "half-day": { min: 2, max: 4 },
    "full-day": { min: 4, max: 8 },
    day: { min: 4, max: 8 },
  };
  return windows[timeOption] || null;
}

/**
 * Calculate priority score for a task
 */
function calculatePriorityScore(task, context = {}) {
  // Effort score (inverse - lower effort = higher score)
  // Validate effort hours (default to 5 if missing)
  const effortHours = Math.max(0, task.effort_hours || 5);
  // Max effort: 80h, map to 0-10 scale inversely
  // 0h = 10, 40h = 5, 80h = 0
  const effortScore = Math.max(0, Math.min(10, 10 - effortHours / 8));

  // Impact score (0-10, already provided)
  const impactScore = task.impact_score || 5;

  // Urgency score (based on status and blockers)
  let urgencyScore = 5; // Default neutral
  if (task.status === "in_progress") urgencyScore = 9;
  if (task.status === "completed") urgencyScore = 0;
  if (task.blockers && task.blockers.length > 0) urgencyScore = Math.max(0, urgencyScore - 3);

  // Readiness score (no blockers = ready)
  const readinessScore =
    !task.blockers || task.blockers.length === 0 ? 10 : Math.max(0, 10 - task.blockers.length * 2);

  // Context fit score
  let contextScore = 5; // Default neutral
  if (context?.preferredTags) {
    const matchingTags = task.tags?.filter((t) => context.preferredTags.includes(t)) || [];
    if (matchingTags.length > 0) {
      contextScore = Math.min(10, 5 + matchingTags.length);
    }
  }

  // Weighted calculation
  const score =
    effortScore * 0.15 +
    impactScore * 0.35 +
    urgencyScore * 0.2 +
    readinessScore * 0.2 +
    contextScore * 0.1;

  return Math.round(score * 10) / 10;
}

/**
 * Filter tasks based on criteria
 */
function filterTasks(tasks, options) {
  let filtered = [...tasks];

  // Filter by time window
  if (options.time) {
    const window = getTimeWindow(options.time);
    if (window) {
      filtered = filtered.filter((t) => t.effort_hours >= window.min && t.effort_hours <= window.max);
    }
  }

  // Filter by category
  if (options.category) {
    filtered = filtered.filter((t) => t.category.toLowerCase().includes(options.category.toLowerCase()));
  }

  // Filter by status (exclude completed)
  filtered = filtered.filter((t) => t.status !== "completed");

  return filtered;
}

/**
 * Generate prioritized tasks JSON
 */
function prioritizeTasks(backlog, options = {}) {
  // Extract all tasks from categories
  const allTasks = backlog.categories.flatMap((cat) => cat.tasks || []);

  // Calculate scores
  const scoredTasks = allTasks.map((task) => ({
    ...task,
    priority_score: calculatePriorityScore(task, options),
  }));

  // Filter based on criteria
  const filtered = filterTasks(scoredTasks, options);

  // Sort by score (descending)
  const sorted = filtered.sort((a, b) => b.priority_score - a.priority_score);

  // Apply limit if specified
  const limited = options.limit ? sorted.slice(0, parseInt(options.limit)) : sorted;

  return {
    generated_at: new Date().toISOString(),
    version: "1.0.0",
    filters: {
      time: options.time || "all",
      skill: options.skill || "mid",
      category: options.category || "all",
      limit: options.limit || "unlimited",
    },
    summary: {
      total_matched: limited.length,
      total_available: sorted.length,
      total_effort_hours: limited.reduce((sum, t) => sum + t.effort_hours, 0),
    },
    tasks: limited,
  };
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  // Load backlog
  if (!fs.existsSync(backlogPath)) {
    console.error(`❌ Backlog file not found: ${backlogPath}`);
    console.error("   Run 'npm run tasks:scan' first");
    process.exit(1);
  }

  try {
    const backlog = JSON.parse(fs.readFileSync(backlogPath, "utf-8"));

    // Prioritize
    const prioritized = prioritizeTasks(backlog, options);

    // Write output
    const outputPath = path.resolve(backlogDir, "prioritized-tasks.json");
    fs.writeFileSync(outputPath, JSON.stringify(prioritized, null, 2));

    console.log(`✅ Prioritized ${prioritized.summary.total_matched} tasks`);
    console.log(`   Total effort: ${prioritized.summary.total_effort_hours}h`);
    console.log(`   Saved to ${path.relative(path.resolve(backlogDir, "../.."), outputPath)}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error prioritizing tasks:", error.message);
    process.exit(1);
  }
}

main();
