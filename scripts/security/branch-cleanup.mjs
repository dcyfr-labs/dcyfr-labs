#!/usr/bin/env node

/**
 * Branch Cleanup Script
 * Identifies merged and stale branches for cleanup
 */

import { listBranches, deleteBranch } from "./github-api.mjs";

const PROTECTED_BRANCHES = ["main", "preview", "production"];
const MERGED_BRANCH_AGE_DAYS = 7; // Auto-delete merged branches after 7 days
const STALE_BRANCH_AGE_DAYS = 90; // Flag unmerged branches with no activity for 90 days
const AUTO_DELETE = process.env.AUTO_DELETE === "true"; // Set to true to actually delete branches

/**
 * Check if a branch has been merged into main
 * @param {string} branchName - Branch name
 * @returns {Promise<boolean>} True if merged
 */
async function isBranchMerged(branchName) {
  // Use GitHub API to check if branch is merged
  // This is a placeholder - actual implementation would use GitHub API
  // For now, we'll return false to be safe
  return false;
}

/**
 * Get last commit date for a branch
 * @param {string} branchName - Branch name
 * @returns {Promise<Date|null>} Last commit date or null
 */
async function getLastCommitDate(branchName) {
  // Placeholder - actual implementation would use GitHub API
  // For now, return null to indicate unknown
  return null;
}

/**
 * Analyze all branches and categorize them
 * @returns {Promise<Object>} Categorized branches
 */
async function analyzeBranches() {
  console.log("🔍 Analyzing branches...\n");

  const branches = await listBranches();

  if (branches.length === 0) {
    console.log("⚠️  No branches found or GitHub API unavailable");
    return {
      total: 0,
      protected: [],
      merged: [],
      stale: [],
      active: [],
    };
  }

  const categorized = {
    total: branches.length,
    protected: [],
    merged: [],
    stale: [],
    active: [],
  };

  const now = new Date();

  for (const branch of branches) {
    const branchName = branch.name;

    // Skip protected branches
    if (PROTECTED_BRANCHES.includes(branchName)) {
      categorized.protected.push(branchName);
      continue;
    }

    // Check if merged
    const merged = await isBranchMerged(branchName);
    const lastCommit = await getLastCommitDate(branchName);

    if (merged) {
      const daysSinceMerge = lastCommit
        ? Math.floor((now - lastCommit) / (1000 * 60 * 60 * 24))
        : null;

      categorized.merged.push({
        name: branchName,
        lastCommit: lastCommit?.toISOString() || "Unknown",
        daysSinceMerge,
        autoDeleteEligible: daysSinceMerge && daysSinceMerge > MERGED_BRANCH_AGE_DAYS,
      });
    } else if (lastCommit) {
      const daysSinceCommit = Math.floor((now - lastCommit) / (1000 * 60 * 60 * 24));

      if (daysSinceCommit > STALE_BRANCH_AGE_DAYS) {
        categorized.stale.push({
          name: branchName,
          lastCommit: lastCommit.toISOString(),
          daysSinceCommit,
        });
      } else {
        categorized.active.push({
          name: branchName,
          lastCommit: lastCommit.toISOString(),
          daysSinceCommit,
        });
      }
    } else {
      // Unknown last commit date - consider active for safety
      categorized.active.push({
        name: branchName,
        lastCommit: "Unknown",
        daysSinceCommit: null,
      });
    }
  }

  return categorized;
}

/**
 * Delete eligible merged branches
 * @param {Array} mergedBranches - List of merged branches
 * @returns {Promise<Object>} Deletion results
 */
async function cleanupMergedBranches(mergedBranches) {
  const eligible = mergedBranches.filter((b) => b.autoDeleteEligible);

  if (eligible.length === 0) {
    console.log("✅ No merged branches eligible for auto-deletion\n");
    return { deleted: [], failed: [] };
  }

  console.log(`🗑️  Found ${eligible.length} merged branches eligible for deletion:\n`);

  const results = {
    deleted: [],
    failed: [],
  };

  for (const branch of eligible) {
    console.log(`   - ${branch.name} (merged ${branch.daysSinceMerge} days ago)`);

    if (AUTO_DELETE) {
      const success = await deleteBranch(branch.name);
      if (success) {
        results.deleted.push(branch.name);
      } else {
        results.failed.push(branch.name);
      }
    } else {
      console.log(`     [DRY RUN] Would delete ${branch.name}`);
      results.deleted.push(branch.name);
    }
  }

  console.log("");

  if (AUTO_DELETE) {
    console.log(`✅ Deleted ${results.deleted.length} branches`);
    if (results.failed.length > 0) {
      console.log(`❌ Failed to delete ${results.failed.length} branches`);
    }
  } else {
    console.log(`📝 [DRY RUN] Would delete ${results.deleted.length} branches`);
    console.log(`   Set AUTO_DELETE=true to actually delete branches`);
  }

  console.log("");

  return results;
}

/**
 * Format branch analysis as markdown
 * @param {Object} analysis - Branch analysis results
 * @param {Object} deletionResults - Deletion results
 * @returns {string} Markdown formatted summary
 */
function formatMarkdownSummary(analysis, deletionResults) {
  let markdown = "";

  // Summary stats
  markdown += `### Summary\n\n`;
  markdown += `- **Total Branches:** ${analysis.total}\n`;
  markdown += `- **Protected:** ${analysis.protected.length}\n`;
  markdown += `- **Merged:** ${analysis.merged.length}\n`;
  markdown += `- **Stale (${STALE_BRANCH_AGE_DAYS}+ days):** ${analysis.stale.length}\n`;
  markdown += `- **Active:** ${analysis.active.length}\n\n`;

  if (deletionResults.deleted.length > 0) {
    markdown += `### Auto-Deleted Branches\n\n`;
    markdown += `${deletionResults.deleted.length} merged branches deleted automatically:\n\n`;
    for (const branchName of deletionResults.deleted) {
      markdown += `- ✅ \`${branchName}\`\n`;
    }
    markdown += `\n`;
  }

  if (analysis.merged.length > 0) {
    markdown += `### Merged Branches\n\n`;
    markdown += `| Branch | Last Commit | Days Since Merge | Auto-Delete |\n`;
    markdown += `|--------|-------------|------------------|-------------|\n`;
    for (const branch of analysis.merged) {
      const autoDelete = branch.autoDeleteEligible ? "✅ Eligible" : `Wait ${MERGED_BRANCH_AGE_DAYS - (branch.daysSinceMerge || 0)} days`;
      markdown += `| \`${branch.name}\` | ${branch.lastCommit} | ${branch.daysSinceMerge || "?"} | ${autoDelete} |\n`;
    }
    markdown += `\n`;
  }

  if (analysis.stale.length > 0) {
    markdown += `### Stale Branches (Manual Review Required)\n\n`;
    markdown += `These branches have no commits in ${STALE_BRANCH_AGE_DAYS}+ days and are not merged:\n\n`;
    markdown += `| Branch | Last Commit | Days Inactive |\n`;
    markdown += `|--------|-------------|---------------|\n`;
    for (const branch of analysis.stale) {
      markdown += `| \`${branch.name}\` | ${branch.lastCommit} | ${branch.daysSinceCommit} |\n`;
    }
    markdown += `\n`;
    markdown += `**Action Required:** Review these branches and either:\n`;
    markdown += `- Merge them if work is complete\n`;
    markdown += `- Delete them if no longer needed\n`;
    markdown += `- Close associated PRs if abandoned\n\n`;
  }

  if (analysis.active.length > 0) {
    markdown += `### Active Branches\n\n`;
    markdown += `${analysis.active.length} branches with recent activity (last ${STALE_BRANCH_AGE_DAYS} days):\n\n`;
    const recentBranches = analysis.active.slice(0, 10); // Show top 10
    for (const branch of recentBranches) {
      markdown += `- \`${branch.name}\` (${branch.daysSinceCommit || "?"} days ago)\n`;
    }
    if (analysis.active.length > 10) {
      markdown += `\n_...and ${analysis.active.length - 10} more_\n`;
    }
    markdown += `\n`;
  }

  return markdown;
}

/**
 * Main function
 */
async function main() {
  console.log("🌿 Branch Cleanup Analysis\n");
  console.log("=" + "=".repeat(50) + "\n");

  // Analyze branches
  const analysis = await analyzeBranches();

  // Cleanup merged branches
  const deletionResults = await cleanupMergedBranches(analysis.merged);

  // Generate markdown summary
  const summary = formatMarkdownSummary(analysis, deletionResults);

  console.log("📊 Summary:\n");
  console.log(summary);

  // Output to file for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const fs = await import("fs/promises");
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `BRANCH_SUMMARY<<EOF\n${summary}\nEOF\n`
    );
    console.log("✅ Summary written to GITHUB_OUTPUT\n");
  }

  // Exit with appropriate code
  if (analysis.stale.length > 10) {
    console.log(`⚠️  Warning: ${analysis.stale.length} stale branches need review`);
    process.exit(0); // Don't fail, just warn
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
