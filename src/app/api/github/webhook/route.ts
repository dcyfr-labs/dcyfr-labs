import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { inngest } from "@/inngest/client";

// GitHub webhook configuration
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";
const GITHUB_WEBHOOK_REPO = "dcyfr/dcyfr-labs";

/**
 * Verify GitHub webhook signature
 * @see https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
 */
function verifyGitHubSignature(
  payload: string,
  signature: string
): boolean {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn("[GitHub Webhook] GITHUB_WEBHOOK_SECRET not configured");
    return false;
  }

  const hash = createHmac("sha256", GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  const expected = `sha256=${hash}`;
  return signature === expected;
}

/**
 * GitHub push event payload types
 */
interface GitHubCommit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
  timestamp: string;
  added: string[];
  modified: string[];
  removed: string[];
}

interface GitHubPushPayload {
  ref: string;
  repository: {
    full_name: string;
  };
  commits: GitHubCommit[];
}

/**
 * Extract changed files from commits
 */
function extractChangedFiles(commits: GitHubCommit[]): string[] {
  const files = new Set<string>();
  
  for (const commit of commits) {
    commit.added?.forEach((f) => files.add(f));
    commit.modified?.forEach((f) => files.add(f));
    commit.removed?.forEach((f) => files.add(f));
  }
  
  return Array.from(files);
}

/**
 * Detect file patterns for automation triggers
 */
function detectAutomationTriggers(changedFiles: string[]): {
  designTokens: boolean;
  dependencies: boolean;
  blogPosts: boolean;
  documentation: boolean;
} {
  return {
    // Component files changed (design token compliance)
    designTokens: changedFiles.some((f) =>
      /src\/components\/.*\.(tsx?|jsx?)$/.test(f)
    ),
    
    // Dependency files changed (security monitoring)
    dependencies: changedFiles.some((f) =>
      ["package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"].includes(f)
    ),
    
    // Blog posts changed (SEO indexing)
    blogPosts: changedFiles.some((f) =>
      f.startsWith("src/content/blog/") && f.endsWith(".mdx")
    ),
    
    // Documentation changed (link validation)
    documentation: changedFiles.some((f) =>
      f.startsWith("docs/") && f.endsWith(".md")
    ),
  };
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 }
      );
    }

    // Verify signature
    if (!verifyGitHubSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse body
    const body: GitHubPushPayload = JSON.parse(rawBody);

    // Only process push events
    const eventType = request.headers.get("x-github-event");
    if (eventType !== "push") {
      return NextResponse.json(
        { message: "Event type not supported", eventType },
        { status: 200 }
      );
    }

    // Only process our repository
    if (body.repository?.full_name !== GITHUB_WEBHOOK_REPO) {
      return NextResponse.json(
        { message: "Repository not configured for this webhook" },
        { status: 200 }
      );
    }

    // Extract metadata
    const branchName = body.ref?.split("/").pop() || "unknown";
    const commits = body.commits || [];
    
    if (commits.length === 0) {
      return NextResponse.json(
        { message: "No commits in payload" },
        { status: 200 }
      );
    }

    // Analyze changed files across all commits
    const changedFiles = extractChangedFiles(commits);
    const triggers = detectAutomationTriggers(changedFiles);

    // Track which automations were triggered
    const triggeredAutomations: string[] = [];

    // 1. Design Token Compliance Automation
    if (triggers.designTokens) {
      await inngest.send({
        name: "github/design-tokens.validate",
        data: {
          branch: branchName,
          changedFiles: changedFiles.filter((f) =>
            /src\/components\/.*\.(tsx?|jsx?)$/.test(f)
          ),
          commits: commits.map((c) => ({
            hash: c.id.slice(0, 7),
            message: c.message.split("\n")[0],
            author: c.author.name,
          })),
          repository: GITHUB_WEBHOOK_REPO,
        },
      });
      triggeredAutomations.push("design-token-validation");
    }

    // 2. Security Dependency Monitoring
    if (triggers.dependencies) {
      await inngest.send({
        name: "github/dependencies.audit",
        data: {
          branch: branchName,
          changedFiles: changedFiles.filter((f) =>
            ["package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"].includes(f)
          ),
          commits: commits.map((c) => ({
            hash: c.id.slice(0, 7),
            message: c.message.split("\n")[0],
            author: c.author.name,
          })),
          repository: GITHUB_WEBHOOK_REPO,
        },
      });
      triggeredAutomations.push("dependency-security-audit");
    }

    // 3. Blog Post SEO Indexing (future)
    if (triggers.blogPosts) {
      // TODO: Implement blog post indexing
      triggeredAutomations.push("blog-post-indexing (pending)");
    }

    // 4. Documentation Validation (future)
    if (triggers.documentation) {
      // TODO: Implement docs validation
      triggeredAutomations.push("docs-validation (pending)");
    }

    return NextResponse.json(
      {
        success: true,
        branch: branchName,
        commitsProcessed: commits.length,
        filesChanged: changedFiles.length,
        automations: triggeredAutomations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GitHub Webhook] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for webhook verification
 * Used by GitHub to test webhook connectivity
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    webhook: "github",
    repository: GITHUB_WEBHOOK_REPO,
  });
}
