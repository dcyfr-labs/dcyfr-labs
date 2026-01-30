/**
 * Design Token Compliance Automation
 *
 * Automatically validates design token usage when component files are changed.
 * Uses the new @dcyfr/agents enforcement layer via ai-compat.
 *
 * MIGRATION: Now using @dcyfr/ai framework with compatibility adapter.
 * Falls back to script-based validation if new system unavailable.
 *
 * @see docs/ai/enforcement/DESIGN_TOKENS.md
 */

import { inngest } from "../client";
import { exec } from "child_process";
import { promisify } from "util";
import { validateDesignTokens as validateTokensCompat } from "@/lib/ai-compat";

const execAsync = promisify(exec);

interface DesignTokenViolation {
  file: string;
  line: number;
  violation: string;
  pattern: string;
}

/**
 * Parse token violation output from find:token-violations script
 */
function parseViolations(output: string): DesignTokenViolation[] {
  const violations: DesignTokenViolation[] = [];
  const lines = output.split("\n");
  
  for (const line of lines) {
    // Example format: "src/components/foo.tsx:42: hardcoded padding-4 (use SPACING.md)"
    const match = line.match(/^(.+):(\d+):\s*(.+)$/);
    if (match) {
      violations.push({
        file: match[1],
        line: parseInt(match[2], 10),
        violation: match[3],
        pattern: extractPattern(match[3]),
      });
    }
  }
  
  return violations;
}

/**
 * Extract violation pattern for categorization
 */
function extractPattern(violation: string): string {
  if (violation.includes("SPACING")) return "spacing";
  if (violation.includes("TYPOGRAPHY")) return "typography";
  if (violation.includes("COLORS")) return "colors";
  if (violation.includes("BORDERS")) return "borders";
  if (violation.includes("ANIMATION")) return "animation";
  return "unknown";
}

/**
 * Run design token validation on changed files
 */
export const validateDesignTokens = inngest.createFunction(
  {
    id: "validate-design-tokens",
    name: "Validate Design Token Compliance",
    retries: 2,
  },
  { event: "github/design-tokens.validate" },
  async ({ event, step }) => {
    const { branch, changedFiles, commits, repository } = event.data;

    // Step 1: Run token violation check
    const violations = await step.run("check-violations", async () => {
      // Try new @dcyfr/ai-based validation first
      try {
        const result = await validateTokensCompat(changedFiles);

        // Convert to legacy format for backward compatibility
        return result.violations.map((v, idx) => ({
          file: changedFiles[0] || 'unknown', // TODO: Extract file from violation message
          line: 0, // TODO: Extract line number from violation message
          violation: v,
          pattern: extractPattern(v),
        }));
      } catch (compatError) {
        console.warn('[Design Tokens] New validation unavailable, falling back to script:', compatError);

        // Fallback to script-based validation
        try {
          const { stdout } = await execAsync("npm run find:token-violations");
          const allViolations = parseViolations(stdout);
          return allViolations.filter((v) =>
            changedFiles.some((f: string) => v.file.includes(f))
          );
        } catch (error) {
          // Script exits with non-zero code if violations found
          if (error instanceof Error && "stdout" in error) {
            const allViolations = parseViolations((error as any).stdout);
            return allViolations.filter((v) =>
              changedFiles.some((f: string) => v.file.includes(f))
            );
          }
          throw error;
        }
      }
    });

    // Step 2: Log results
    await step.run("log-results", async () => {
      console.log(`[Design Tokens] Branch: ${branch}`);
      console.log(`[Design Tokens] Files checked: ${changedFiles.length}`);
      console.log(`[Design Tokens] Violations found: ${violations.length}`);
      
      if (violations.length > 0) {
        console.log("[Design Tokens] Violations by pattern:");
        const byPattern = violations.reduce((acc, v) => {
          acc[v.pattern] = (acc[v.pattern] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(byPattern);
      }
      
      return {
        branch,
        filesChecked: changedFiles.length,
        violationsFound: violations.length,
        violationsByPattern: violations.reduce((acc, v) => {
          acc[v.pattern] = (acc[v.pattern] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    });

    // Step 3: Send notifications (if violations found)
    if (violations.length > 0) {
      await step.run("notify-violations", async () => {
        // TODO: Future enhancement - Post GitHub PR comment with violations
        // TODO: Future enhancement - Send Slack notification
        // TODO: Future enhancement - Update dashboard metrics
        
        console.warn(
          `[Design Tokens] ⚠️  ${violations.length} violations found in ${changedFiles.length} files`
        );
        
        // For now, just log critical violations
        const critical = violations.filter((v) =>
          ["spacing", "typography", "colors"].includes(v.pattern)
        );
        
        if (critical.length > 0) {
          console.error(
            `[Design Tokens] 🔴 ${critical.length} CRITICAL violations (SPACING/TYPOGRAPHY/COLORS)`
          );
        }
        
        return {
          total: violations.length,
          critical: critical.length,
          warning: violations.length - critical.length,
        };
      });
    }

    return {
      success: true,
      branch,
      filesChecked: changedFiles.length,
      violations: violations.length,
      status: violations.length === 0 ? "passed" : "failed",
    };
  }
);
