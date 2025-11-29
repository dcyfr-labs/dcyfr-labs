/**
 * Maintenance Dashboard Types
 * TypeScript types for the maintenance automation dashboard
 */

/**
 * GitHub Actions Workflow Run Status
 */
export type WorkflowStatus = "queued" | "in_progress" | "completed";

/**
 * GitHub Actions Workflow Run Conclusion
 */
export type WorkflowConclusion =
  | "success"
  | "failure"
  | "cancelled"
  | "skipped"
  | "timed_out"
  | "action_required"
  | null;

/**
 * GitHub Actions Workflow Run
 */
export interface WorkflowRun {
  id: number;
  status: WorkflowStatus;
  conclusion: WorkflowConclusion;
  created_at: string;
  updated_at: string;
  run_number: number;
  html_url: string;
  workflow_id: number;
  workflow_name: string;
  event: string;
  head_branch: string | null;
  head_sha: string;
}

/**
 * Workflow Summary Statistics
 */
export interface WorkflowSummary {
  workflow_id: string;
  workflow_name: string;
  last_run: WorkflowRun | null;
  recent_runs: WorkflowRun[];
  pass_rate: number; // 0-100
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
}

/**
 * Weekly Metrics for Trend Visualization
 */
export interface WeeklyMetrics {
  week: string; // ISO week (2025-W47)
  testPassRate: number; // 0-100
  coverage: number; // 0-100
  securityScore: number; // 0-100
  cleanupItems: number;
  validationErrors: number;
}

/**
 * Observation Category
 */
export type ObservationCategory =
  | "ai-performance"
  | "dev-tools"
  | "workflow"
  | "general";

/**
 * Observation Severity
 */
export type ObservationSeverity = "info" | "warning" | "error";

/**
 * Observation Log Entry
 */
export interface Observation {
  id: string; // UUID
  category: ObservationCategory;
  severity: ObservationSeverity;
  title: string;
  description: string;
  tags: string[];
  screenshot?: string;
  createdAt: string; // ISO timestamp
  createdBy: string; // "manual" | "automated"
  metadata?: Record<string, unknown>;
}

/**
 * Maintenance Metrics Summary
 */
export interface MaintenanceMetrics {
  weekly: {
    testPassRate: number;
    coverage: number;
    failedTests: number;
    slowTests: number;
    sentryErrors: number;
  };
  monthly: {
    criticalVulns: number;
    highVulns: number;
    mediumVulns: number;
    openDependabotPRs: number;
    unusedExports: number;
    largeFiles: number;
    todoComments: number;
  };
  content: {
    validationErrors: number;
    draftPosts: number;
    seoWarnings: number;
  };
}

/**
 * Workflow Configuration
 */
export interface WorkflowConfig {
  id: string;
  name: string;
  filename: string;
  schedule: string;
  description: string;
}

/**
 * Predefined Workflow Configurations
 */
export const TRACKED_WORKFLOWS: WorkflowConfig[] = [
  {
    id: "weekly-test-health",
    name: "Weekly Test Health",
    filename: "weekly-test-health.yml",
    schedule: "Every Monday at 08:00 UTC",
    description: "Automated testing health reports with Sentry enrichment",
  },
  {
    id: "monthly-security-review",
    name: "Monthly Security Review",
    filename: "monthly-security-review.yml",
    schedule: "First day of month at 09:00 UTC",
    description: "Security audits, CodeQL, and Dependabot tracking",
  },
  {
    id: "validate-content",
    name: "Content Validation",
    filename: "validate-content.yml",
    schedule: "Weekly on Wednesdays at 10:00 UTC",
    description: "MDX frontmatter validation for blog posts",
  },
  {
    id: "monthly-cleanup",
    name: "Monthly Cleanup",
    filename: "monthly-cleanup.yml",
    schedule: "15th of month at 11:00 UTC",
    description: "Codebase cleanup and technical debt tracking",
  },
];
