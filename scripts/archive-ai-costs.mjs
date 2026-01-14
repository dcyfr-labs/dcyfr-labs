#!/usr/bin/env node

/**
 * Automated AI Cost Data Collection and Retention
 *
 * Archives unified cost data daily for historical analysis
 * Stores monthly snapshots in JSON format
 *
 * Usage:
 *   npm run ai:costs:archive
 *   node scripts/archive-ai-costs.mjs
 *
 * Output:
 *   .ai-costs-archive/YYYY-MM-DD.json - Daily snapshots
 *   .ai-costs-archive/monthly/YYYY-MM.json - Monthly summaries
 *
 * Retention Policy:
 *   - Daily snapshots: Keep last 90 days
 *   - Monthly summaries: Keep forever (compact format)
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const ARCHIVE_DIR = path.join(PROJECT_ROOT, ".ai-costs-archive");
const DAILY_DIR = path.join(ARCHIVE_DIR, "daily");
const MONTHLY_DIR = path.join(ARCHIVE_DIR, "monthly");
const API_URL = process.env.API_URL || "http://localhost:3000";

// Ensure archive directories exist
async function ensureDirectories() {
  await fs.mkdir(DAILY_DIR, { recursive: true });
  await fs.mkdir(MONTHLY_DIR, { recursive: true });
}

// Fetch cost data from API with retry
async function fetchCostData(period = "30d", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${API_URL}/api/dev/ai-costs/unified?period=${period}`, {
        timeout: 10000, // 10 second timeout
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.warn(`⚠️  Retry ${i + 1}/${retries} after ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`❌ Failed to fetch cost data after ${retries} retries: ${error.message}`);
        throw error;
      }
    }
  }
}

// Save daily snapshot
async function saveDailySnapshot(data) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = path.join(DAILY_DIR, `${today}.json`);

  await fs.writeFile(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Saved daily snapshot: ${filename}`);

  return filename;
}

// Save monthly summary
async function saveMonthlySummary(data) {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const filename = path.join(MONTHLY_DIR, `${month}.json`);

  // Check if monthly summary exists
  let monthlySummary;
  try {
    const existing = await fs.readFile(filename, "utf-8");
    monthlySummary = JSON.parse(existing);
  } catch {
    // Create new monthly summary
    monthlySummary = {
      month,
      dailySnapshots: [],
      totals: {
        cost: 0,
        sessions: 0,
        tokens: 0,
      },
      averages: {
        costPerDay: 0,
        sessionsPerDay: 0,
        tokensPerDay: 0,
      },
    };
  }

  // Add today's data
  monthlySummary.dailySnapshots.push({
    date: new Date().toISOString().split("T")[0],
    cost: data.summary.totalCost,
    sessions: data.summary.totalSessions,
    tokens: data.summary.totalTokens,
  });

  // Recalculate totals
  const snapshots = monthlySummary.dailySnapshots;
  monthlySummary.totals.cost = snapshots.reduce((sum, s) => sum + s.cost, 0);
  monthlySummary.totals.sessions = snapshots.reduce((sum, s) => sum + s.sessions, 0);
  monthlySummary.totals.tokens = snapshots.reduce((sum, s) => sum + s.tokens, 0);

  // Calculate averages
  const days = snapshots.length;
  monthlySummary.averages.costPerDay = monthlySummary.totals.cost / days;
  monthlySummary.averages.sessionsPerDay = monthlySummary.totals.sessions / days;
  monthlySummary.averages.tokensPerDay = monthlySummary.totals.tokens / days;

  await fs.writeFile(filename, JSON.stringify(monthlySummary, null, 2));
  console.log(`✅ Updated monthly summary: ${filename}`);

  return filename;
}

// Cleanup old daily snapshots (keep last 90 days)
async function cleanupOldSnapshots() {
  const files = await fs.readdir(DAILY_DIR);
  const now = Date.now();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  let deletedCount = 0;
  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(DAILY_DIR, file);
    const stats = await fs.stat(filePath);
    const age = now - stats.mtimeMs;

    if (age > NINETY_DAYS) {
      await fs.unlink(filePath);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} old daily snapshots`);
  }
}

// Main execution
async function main() {
  console.log("📊 Archiving AI cost data...\n");

  try {
    // Ensure directories exist
    await ensureDirectories();

    // Fetch cost data (30-day view)
    console.log("Fetching cost data from API...");
    const data = await fetchCostData("30d");

    // Save daily snapshot
    await saveDailySnapshot(data);

    // Update monthly summary
    await saveMonthlySummary(data);

    // Cleanup old snapshots
    await cleanupOldSnapshots();

    console.log("\n✅ Archive complete!");
    console.log(`   Total cost: $${data.summary.totalCost.toFixed(2)}`);
    console.log(`   Total sessions: ${data.summary.totalSessions}`);
    console.log(`   Budget used: ${data.summary.monthlyBudgetUsed.toFixed(1)}%`);
  } catch (error) {
    console.error(`\n❌ Archive failed: ${error.message}`);
    process.exit(1);
  }
}

main();
