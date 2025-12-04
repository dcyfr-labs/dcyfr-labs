#!/usr/bin/env node

/**
 * GitHub API Helper
 * Shared utilities for creating and managing GitHub Issues in automation workflows
 */

import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY?.split("/")[0] || "dcyfr";
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split("/")[1] || "dcyfr-labs";

if (!GITHUB_TOKEN) {
  console.warn("⚠️  GITHUB_TOKEN not set. GitHub API operations will be skipped.");
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
  userAgent: "dcyfr-labs-maintenance-automation",
});

/**
 * Check if an Issue with the given label and signature already exists
 * @param {string} label - Issue label to filter by
 * @param {string} signature - Unique signature to search for in Issue body
 * @returns {Promise<Object|null>} Existing Issue or null
 */
export async function findExistingIssue(label, signature) {
  if (!GITHUB_TOKEN) return null;

  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      labels: label,
      state: "open",
      per_page: 100,
    });

    const existing = issues.find((issue) =>
      issue.body?.includes(signature)
    );

    return existing || null;
  } catch (error) {
    console.error("❌ Error finding existing Issue:", error.message);
    return null;
  }
}

/**
 * Create a new GitHub Issue
 * @param {Object} options - Issue creation options
 * @param {string} options.title - Issue title
 * @param {string} options.body - Issue body (markdown)
 * @param {string[]} options.labels - Issue labels
 * @param {string[]} options.assignees - Issue assignees
 * @returns {Promise<Object|null>} Created Issue or null
 */
export async function createIssue({ title, body, labels = [], assignees = [] }) {
  if (!GITHUB_TOKEN) {
    console.log("📝 Would create Issue:", { title, labels });
    return null;
  }

  try {
    const { data: issue } = await octokit.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title,
      body,
      labels,
      assignees,
    });

    console.log(`✅ Created Issue #${issue.number}: ${issue.title}`);
    console.log(`   ${issue.html_url}`);
    return issue;
  } catch (error) {
    console.error("❌ Error creating Issue:", error.message);
    return null;
  }
}

/**
 * Update an existing GitHub Issue
 * @param {number} issueNumber - Issue number to update
 * @param {Object} updates - Fields to update
 * @param {string} updates.title - New title
 * @param {string} updates.body - New body
 * @param {string} updates.state - New state (open/closed)
 * @returns {Promise<Object|null>} Updated Issue or null
 */
export async function updateIssue(issueNumber, updates) {
  if (!GITHUB_TOKEN) {
    console.log(`📝 Would update Issue #${issueNumber}:`, updates);
    return null;
  }

  try {
    const { data: issue } = await octokit.issues.update({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
      ...updates,
    });

    console.log(`✅ Updated Issue #${issue.number}: ${issue.title}`);
    return issue;
  } catch (error) {
    console.error(`❌ Error updating Issue #${issueNumber}:`, error.message);
    return null;
  }
}

/**
 * Add a comment to an existing Issue
 * @param {number} issueNumber - Issue number
 * @param {string} comment - Comment body (markdown)
 * @returns {Promise<Object|null>} Created comment or null
 */
export async function addIssueComment(issueNumber, comment) {
  if (!GITHUB_TOKEN) {
    console.log(`📝 Would comment on Issue #${issueNumber}`);
    return null;
  }

  try {
    const { data: commentData } = await octokit.issues.createComment({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
      body: comment,
    });

    console.log(`✅ Added comment to Issue #${issueNumber}`);
    return commentData;
  } catch (error) {
    console.error(`❌ Error adding comment to Issue #${issueNumber}:`, error.message);
    return null;
  }
}

/**
 * Close an Issue
 * @param {number} issueNumber - Issue number to close
 * @param {string} comment - Optional closing comment
 * @returns {Promise<Object|null>} Closed Issue or null
 */
export async function closeIssue(issueNumber, comment) {
  if (comment) {
    await addIssueComment(issueNumber, comment);
  }

  return updateIssue(issueNumber, { state: "closed" });
}

/**
 * Get or create an Issue
 * Checks for existing Issue by label and signature, creates new if not found
 * @param {Object} options - Issue options
 * @param {string} options.label - Label to search for
 * @param {string} options.signature - Unique signature for deduplication
 * @param {string} options.title - Issue title
 * @param {string} options.body - Issue body
 * @param {string[]} options.labels - All labels to apply
 * @param {string[]} options.assignees - Assignees
 * @param {boolean} options.updateIfExists - Update existing Issue instead of commenting
 * @returns {Promise<Object|null>} Issue (new or existing) or null
 */
export async function getOrCreateIssue({
  label,
  signature,
  title,
  body,
  labels = [],
  assignees = [],
  updateIfExists = false,
}) {
  const existing = await findExistingIssue(label, signature);

  if (existing) {
    console.log(`📌 Found existing Issue #${existing.number}: ${existing.title}`);

    if (updateIfExists) {
      console.log("   Updating existing Issue...");
      return updateIssue(existing.number, { body });
    } else {
      console.log("   Adding comment with latest data...");
      const comment = `## Updated ${new Date().toISOString().split("T")[0]}\n\n${body}`;
      await addIssueComment(existing.number, comment);
      return existing;
    }
  }

  console.log("🆕 No existing Issue found, creating new Issue...");
  return createIssue({ title, body, labels, assignees });
}

/**
 * List all branches in the repository
 * @returns {Promise<Array>} List of branch objects
 */
export async function listBranches() {
  if (!GITHUB_TOKEN) return [];

  try {
    const { data: branches } = await octokit.repos.listBranches({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 100,
    });

    return branches;
  } catch (error) {
    console.error("❌ Error listing branches:", error.message);
    return [];
  }
}

/**
 * Delete a branch
 * @param {string} branchName - Name of branch to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBranch(branchName) {
  if (!GITHUB_TOKEN) {
    console.log(`📝 Would delete branch: ${branchName}`);
    return false;
  }

  try {
    await octokit.git.deleteRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${branchName}`,
    });

    console.log(`✅ Deleted branch: ${branchName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting branch ${branchName}:`, error.message);
    return false;
  }
}

/**
 * Get CodeQL alerts from the last N days
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} CodeQL alerts
 */
export async function getCodeQLAlerts(days = 30) {
  if (!GITHUB_TOKEN) return [];

  try {
    const { data: alerts } = await octokit.codeScanning.listAlertsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: "open",
      per_page: 100,
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return alerts.filter((alert) => new Date(alert.created_at) >= cutoff);
  } catch (error) {
    console.error("❌ Error fetching CodeQL alerts:", error.message);
    return [];
  }
}

const githubApi = {
  findExistingIssue,
  createIssue,
  updateIssue,
  addIssueComment,
  closeIssue,
  getOrCreateIssue,
  listBranches,
  deleteBranch,
  getCodeQLAlerts,
};

export default githubApi;
