#!/usr/bin/env node

/**
 * What's Next CLI - Layer 3 of Backlog Intelligence System
 *
 * Provides human-readable task recommendations with:
 * - Daily standup suggestions
 * - Weekly planning output
 * - Full backlog statistics
 * - Task detail view
 *
 * Usage:
 *   npm run tasks:next                        # Default (today's tasks)
 *   npm run tasks:next -- --time=quick        # Quick 1-2h tasks
 *   npm run tasks:next -- --time=half-day     # 2-4h tasks
 *   npm run tasks:next -- --time=full-day     # 4-8h tasks
 *   npm run tasks:next -- --stats             # Full statistics
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backlogDir = __dirname;
const prioritizedPath = path.resolve(backlogDir, "prioritized-tasks.json");
const backlogPath = path.resolve(backlogDir, "backlog.json");

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    stats: args.includes("--stats"),
    time: args.find((a) => a.startsWith("--time="))?.split("=")[1] || "half-day",
    category: args.find((a) => a.startsWith("--category="))?.split("=")[1],
    verbose: args.includes("--verbose"),
  };
}

/**
 * Format priority score with color
 */
function formatScore(score) {
  if (score >= 8) return `🔴 ${score}/10`;
  if (score >= 6) return `🟠 ${score}/10`;
  if (score >= 4) return `🟡 ${score}/10`;
  return `🟢 ${score}/10`;
}

/**
 * Format status badge
 */
function formatStatus(status) {
  const badges = {
    ready: "✅ Ready",
    "in_progress": "🔄 In Progress",
    blocked: "🚫 Blocked",
    completed: "✨ Done",
    pending: "⏳ Pending",
  };
  return badges[status] || status;
}

/**
 * Group tasks by category
 */
function groupByCategory(tasks) {
  const grouped = {};
  for (const task of tasks) {
    if (!grouped[task.category]) {
      grouped[task.category] = [];
    }
    grouped[task.category].push(task);
  }
  return grouped;
}

/**
 * Format task for display
 */
function formatTask(index, task) {
  const lines = [];

  lines.push(
    `${index}. ${task.title} (${task.effort_hours}h) [${formatScore(task.priority_score)}]`
  );

  // Impact stars (safely handle any value)
  const impactValue = Math.min(10, Math.max(0, task.impact_score || 5));
  const starCount = Math.round(impactValue / 2);
  const stars = starCount > 0 ? Array(starCount).fill("⭐").join("") : "⭐";
  lines.push(`   Impact: ${stars} ${impactValue}/10`);

  lines.push(`   Status: ${formatStatus(task.status)}`);

  if (task.description) {
    lines.push(`   ${task.description}`);
  }

  if (task.blockers && task.blockers.length > 0) {
    lines.push(`   Blockers: ${task.blockers.join(", ")}`);
  }

  if (task.files_affected && task.files_affected.length > 0) {
    lines.push(`   Files: ${task.files_affected.slice(0, 2).join(", ")}`);
    if (task.files_affected.length > 2) {
      lines.push(`          ... and ${task.files_affected.length - 2} more`);
    }
  }

  if (task.related_docs && task.related_docs.length > 0) {
    lines.push(`   Docs: ${task.related_docs[0]}`);
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Print full statistics
 */
function printStatistics(backlog) {
  console.log("\n" + "═".repeat(70));
  console.log("📊 FULL BACKLOG STATISTICS");
  console.log("═".repeat(70) + "\n");

  for (const cat of backlog.categories) {
    const tasks = cat.tasks || [];
    const ready = tasks.filter((t) => t.status === "pending" && t.blockers.length === 0).length;
    const blocked = tasks.filter((t) => t.blockers && t.blockers.length > 0).length;

    console.log(
      `📁 ${cat.name.toUpperCase()}: ${tasks.length} tasks (${cat.total_effort_hours}h)`
    );
    console.log(`   ✅ Ready: ${ready} | 🚫 Blocked: ${blocked}`);

    // Show top 3 by priority
    const sorted = tasks
      .filter((t) => t.status !== "completed")
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 3);

    for (const task of sorted) {
      console.log(`   • ${task.title} (${formatScore(task.priority_score)})`);
    }
    console.log("");
  }

  console.log("━".repeat(70));
  console.log(`📈 TOTALS:`);
  console.log(`   Total Tasks: ${backlog.statistics.total_tasks}`);
  console.log(`   Ready to Start: ${backlog.statistics.ready_to_start}`);
  console.log(`   Blocked: ${backlog.statistics.blocked}`);
  console.log(`   In Progress: ${backlog.statistics.in_progress}`);
  console.log(`   Total Effort: ${backlog.statistics.total_effort_hours}h`);
  console.log("═".repeat(70) + "\n");
}

/**
 * Print daily recommendations
 */
function printDailyRecommendations(prioritized) {
  const now = new Date();
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  console.log("\n┌" + "─".repeat(68) + "┐");
  console.log(
    `│ 🎯 ${dayName.toUpperCase()}'S TASK QUEUE${" ".repeat(68 - dayName.length - 18)} │`
  );
  console.log(`│ ${dateStr}${" ".repeat(70 - dateStr.length - 2)} │`);
  console.log("└" + "─".repeat(68) + "┘\n");

  if (prioritized.tasks.length === 0) {
    console.log("✨ All caught up! No pending tasks in this time window.\n");
    return;
  }

  const totalEffort = prioritized.summary.total_effort_hours;
  const categorized = groupByCategory(prioritized.tasks);

  console.log(`📋 ${prioritized.summary.total_matched} tasks queued (${totalEffort}h total)\n`);

  let taskIndex = 1;
  for (const [category, tasks] of Object.entries(categorized)) {
    console.log(`━━ ${category.toUpperCase()} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    for (const task of tasks) {
      process.stdout.write(formatTask(taskIndex, task));
      taskIndex++;
    }
  }

  console.log("═".repeat(70));
  console.log("\n💡 Next steps:");
  console.log("   • npm run tasks:next:week - See full week's tasks");
  console.log("   • npm run tasks:next:quick - Show 1-2h quick wins only");
  console.log("   • npm run tasks:next -- --stats - View all statistics");
  console.log("   • npm run tasks:complete <task-id> - Mark task as done\n");
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  // Check if we need to generate prioritized tasks
  if (!fs.existsSync(prioritizedPath)) {
    console.log("📋 Generating prioritized tasks...");
    try {
      const result = spawnSync('node', [path.resolve(__dirname, "prioritize-tasks.mjs")], {
        cwd: path.resolve(__dirname, "../.."),
        stdio: "inherit",
        shell: false,
      });
      if (result.error) throw result.error;
      if (result.status !== 0 && result.status !== null) throw new Error(`Script exited with code ${result.status}`);
    } catch (error) {
      console.error("❌ Failed to prioritize tasks");
      process.exit(1);
    }
  }

  try {
    const backlog = JSON.parse(fs.readFileSync(backlogPath, "utf-8"));
    const prioritized = JSON.parse(fs.readFileSync(prioritizedPath, "utf-8"));

    // Print statistics if requested
    if (options.stats) {
      printStatistics(backlog);
    } else {
      // Print daily recommendations
      printDailyRecommendations(prioritized);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
