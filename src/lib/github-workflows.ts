/**
 * GitHub Workflows API Client
 * Fetches workflow run data from GitHub Actions API
 */

import { Octokit } from "@octokit/rest";
import type {
  WorkflowRun,
  WorkflowSummary,
  WorkflowConfig,
} from "@/types/maintenance";

const GITHUB_OWNER = "dcyfr";
const GITHUB_REPO = "dcyfr-labs";

/**
 * Initialize Octokit client with GitHub token
 */
function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is required for GitHub API access"
    );
  }

  return new Octokit({ auth: token });
}

/**
 * Fetch workflow runs for a specific workflow
 *
 * @param workflowId - Workflow filename (e.g., "weekly-test-health.yml")
 * @param limit - Number of runs to fetch (default: 10)
 * @returns Array of workflow runs
 */
export async function getWorkflowRuns(
  workflowId: string,
  limit = 10
): Promise<WorkflowRun[]> {
  try {
    const octokit = getOctokit();

    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow_id: workflowId,
      per_page: limit,
    });

    return response.data.workflow_runs.map((run) => ({
      id: run.id,
      status: run.status as WorkflowRun["status"],
      conclusion: run.conclusion as WorkflowRun["conclusion"],
      created_at: run.created_at,
      updated_at: run.updated_at,
      run_number: run.run_number,
      html_url: run.html_url,
      workflow_id: run.workflow_id,
      workflow_name: run.name || "Unknown",
      event: run.event,
      head_branch: run.head_branch,
      head_sha: run.head_sha,
    }));
  } catch (error) {
    console.error(`Failed to fetch workflow runs for ${workflowId}:`, error);
    return [];
  }
}

/**
 * Calculate workflow summary statistics
 *
 * @param workflowConfig - Workflow configuration
 * @param runs - Array of workflow runs
 * @returns Workflow summary with statistics
 */
export function calculateWorkflowSummary(
  workflowConfig: WorkflowConfig,
  runs: WorkflowRun[]
): WorkflowSummary {
  const completedRuns = runs.filter((run) => run.status === "completed");
  const successfulRuns = completedRuns.filter(
    (run) => run.conclusion === "success"
  );
  const failedRuns = completedRuns.filter(
    (run) =>
      run.conclusion === "failure" ||
      run.conclusion === "timed_out" ||
      run.conclusion === "action_required"
  );

  const passRate =
    completedRuns.length > 0
      ? (successfulRuns.length / completedRuns.length) * 100
      : 0;

  return {
    workflow_id: workflowConfig.id,
    workflow_name: workflowConfig.name,
    last_run: runs[0] || null,
    recent_runs: runs,
    pass_rate: Math.round(passRate * 10) / 10, // Round to 1 decimal
    total_runs: completedRuns.length,
    successful_runs: successfulRuns.length,
    failed_runs: failedRuns.length,
  };
}

/**
 * Fetch workflow summaries for all tracked workflows
 *
 * @param workflows - Array of workflow configurations
 * @param limit - Number of runs per workflow (default: 10)
 * @returns Array of workflow summaries
 */
export async function getAllWorkflowSummaries(
  workflows: WorkflowConfig[],
  limit = 10
): Promise<WorkflowSummary[]> {
  const summaries = await Promise.all(
    workflows.map(async (workflow) => {
      const runs = await getWorkflowRuns(workflow.filename, limit);
      return calculateWorkflowSummary(workflow, runs);
    })
  );

  return summaries;
}

/**
 * Get workflow run by ID
 *
 * @param runId - Workflow run ID
 * @returns Workflow run details
 */
export async function getWorkflowRunById(
  runId: number
): Promise<WorkflowRun | null> {
  try {
    const octokit = getOctokit();

    const response = await octokit.rest.actions.getWorkflowRun({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      run_id: runId,
    });

    const run = response.data;

    return {
      id: run.id,
      status: run.status as WorkflowRun["status"],
      conclusion: run.conclusion as WorkflowRun["conclusion"],
      created_at: run.created_at,
      updated_at: run.updated_at,
      run_number: run.run_number,
      html_url: run.html_url,
      workflow_id: run.workflow_id,
      workflow_name: run.name || "Unknown",
      event: run.event,
      head_branch: run.head_branch,
      head_sha: run.head_sha,
    };
  } catch (error) {
    console.error(`Failed to fetch workflow run ${runId}:`, error);
    return null;
  }
}

/**
 * Re-run a failed workflow
 *
 * @param runId - Workflow run ID to re-run
 * @returns Success status
 */
export async function rerunWorkflow(runId: number): Promise<boolean> {
  try {
    const octokit = getOctokit();

    await octokit.rest.actions.reRunWorkflow({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      run_id: runId,
    });

    return true;
  } catch (error) {
    console.error(`Failed to re-run workflow ${runId}:`, error);
    return false;
  }
}
