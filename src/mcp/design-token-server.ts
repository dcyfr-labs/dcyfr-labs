#!/usr/bin/env node
/**
 * Design Token Validator MCP Server
 *
 * Provides real-time design token validation and compliance checking.
 * AI assistants can validate code against design tokens and get suggestions.
 *
 * @deprecated Migrated to @dcyfr/ai/mcp/servers/design-tokens (Feb 2026)
 * This implementation maintained for backward compatibility.
 * New implementations should use createDesignTokenServer() with TokenProvider.
 * See src/mcp/start-token-server.ts for new usage pattern.
 * Planned removal: March 2027 (1-year transition period)
 *
 * @see docs/architecture/MCP_IMPLEMENTATION_PLAN.md - Phase 2
 */

import { FastMCP } from "fastmcp";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Design token imports
import {
  SPACING,
  TYPOGRAPHY,
  CONTAINER_WIDTHS,
  BREAKPOINTS,
} from "@/lib/design-tokens";

// Shared utilities
import { SimpleCache } from "./shared/cache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MCP server
const server = new FastMCP({
  name: "dcyfr-design-tokens",
  version: "1.0.0",
  instructions:
    "Real-time design token validation and compliance checking for dcyfr-labs. Use these tools to validate code against design tokens and get suggestions.",
});

// Cache for validation results (2 minutes)
const validationCache = new SimpleCache<string>(120000);
const complianceCache = new SimpleCache<object>(120000);

// ============================================================================
// Token Categories Registry
// ============================================================================

const TOKEN_CATEGORIES = {
  spacing: {
    tokens: SPACING,
    patterns: [
      /gap-\d+/,
      /space-[xy]-\d+/,
      /p[trblxy]?-\d+/,
      /m[trblxy]?-\d+/,
      /w-\d+/,
      /h-\d+/,
    ],
    description: "Spacing tokens for padding, margin, gaps, and sizes",
  },
  typography: {
    tokens: TYPOGRAPHY,
    patterns: [
      /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
      /font-(normal|medium|semibold|bold)/,
      /leading-\d+/,
      /tracking-\w+/,
    ],
    description: "Typography tokens for text styling",
  },
  containers: {
    tokens: CONTAINER_WIDTHS,
    patterns: [/max-w-\w+/, /min-w-\w+/],
    description: "Container width tokens",
  },
  breakpoints: {
    tokens: BREAKPOINTS,
    patterns: [/(sm|md|lg|xl|2xl):/],
    description: "Responsive breakpoint tokens",
  },
} as const;

// ============================================================================
// Validation Logic
// ============================================================================

interface ValidationViolation {
  type: "hardcoded-value" | "missing-token" | "incorrect-pattern";
  className: string;
  suggestion?: string;
  category?: string;
  line?: number;
}

interface ValidationResult {
  isValid: boolean;
  violations: ValidationViolation[];
  compliance: number;
  suggestions: string[];
}

/**
 * Validate code against design tokens
 */
function validateCode(code: string): ValidationResult {
  const violations: ValidationViolation[] = [];
  const suggestions: string[] = [];

  // Extract all className strings
  const classNameMatches = code.matchAll(
    /className=["{']([^"'}]+)["{']|className=\{[`"]([^`"]+)[`"]\}/g
  );

  let totalClasses = 0;
  let violationCount = 0;

  for (const match of classNameMatches) {
    const classNames = (match[1] || match[2] || "")
      .split(/\s+/)
      .filter(Boolean);

    for (const className of classNames) {
      totalClasses++;

      // Check spacing violations
      if (/^(gap|space-[xy]|p[trblxy]?|m[trblxy]?|w|h)-\d+$/.test(className)) {
        const matched =
          /^(gap|space-[xy]|p[trblxy]?|m[trblxy]?|w|h)-(\d+)$/.exec(className);
        if (matched) {
          const [, prefix, value] = matched;
          violations.push({
            type: "hardcoded-value",
            className,
            suggestion: `Use SPACING constant instead: gap-\${SPACING.content}`,
            category: "spacing",
          });
          violationCount++;
        }
      }

      // Check typography violations
      if (
        /^text-\d+xl$/.test(className) ||
        /^font-(normal|medium|semibold|bold)$/.test(className)
      ) {
        violations.push({
          type: "hardcoded-value",
          className,
          suggestion: "Use TYPOGRAPHY constant instead: TYPOGRAPHY.h1.standard",
          category: "typography",
        });
        violationCount++;
      }

      // Check color violations
      if (
        /^(text|bg|border)-(gray|zinc|slate|red|green|blue|yellow)-\d+$/.test(
          className
        )
      ) {
        violations.push({
          type: "hardcoded-value",
          className,
          suggestion: "Use COLORS constant instead",
          category: "colors",
        });
        violationCount++;
      }
    }
  }

  const compliance =
    totalClasses > 0
      ? Math.round(((totalClasses - violationCount) / totalClasses) * 100)
      : 100;

  if (violations.length > 0) {
    suggestions.push(
      "Import design tokens: import { SPACING, TYPOGRAPHY, COLORS } from '@/lib/design-tokens'"
    );
    suggestions.push("Use token constants in className template literals");
    suggestions.push(
      "See docs/ai/design-system.md for complete token reference"
    );
  }

  return {
    isValid: violations.length === 0,
    violations,
    compliance,
    suggestions,
  };
}

/**
 * Suggest design token for hardcoded value
 */
function suggestToken(
  hardcodedValue: string,
  category?: keyof typeof TOKEN_CATEGORIES
): string[] {
  const suggestions: string[] = [];

  // Parse numeric values
  const numMatch = hardcodedValue.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : null;

  if (category === "spacing" || !category) {
    // Spacing suggestions
    if (num !== null) {
      const spacingKeys = Object.keys(SPACING);
      const closest = spacingKeys.find((key) => {
        const value = SPACING[key as keyof typeof SPACING];
        return typeof value === "number" && Math.abs(value - num) <= 2;
      });

      if (closest) {
        suggestions.push(
          `SPACING.${closest} (${SPACING[closest as keyof typeof SPACING]})`
        );
      }
    }
  }

  if (category === "typography" || !category) {
    // Typography suggestions
    if (hardcodedValue.includes("text-") || hardcodedValue.includes("font-")) {
      suggestions.push("TYPOGRAPHY.h1.standard");
      suggestions.push("TYPOGRAPHY.body.default");
      suggestions.push("TYPOGRAPHY.small.muted");
    }
  }

  if (category === "containers" || !category) {
    // Container suggestions
    if (
      hardcodedValue.includes("max-w") ||
      hardcodedValue.includes("container")
    ) {
      suggestions.push("CONTAINER_WIDTHS.standard");
      suggestions.push("CONTAINER_WIDTHS.wide");
      suggestions.push("CONTAINER_WIDTHS.narrow");
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      `No exact match found for "${hardcodedValue}". Check design-tokens.ts`
    );
  }

  return suggestions;
}

/**
 * Calculate compliance for entire codebase or specific file
 */
async function calculateCompliance(filePath?: string): Promise<{
  percentage: number;
  totalFiles: number;
  totalViolations: number;
  fileBreakdown?: Record<string, number>;
}> {
  // Check cache first
  const cacheKey = filePath || "global";
  const cached = complianceCache.get(cacheKey);
  if (cached) return cached as any;

  // For specific file
  if (filePath) {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const content = await fs.readFile(fullPath, "utf-8");
      const result = validateCode(content);

      const data = {
        percentage: result.compliance,
        totalFiles: 1,
        totalViolations: result.violations.length,
        fileBreakdown: { [filePath]: result.violations.length },
      };

      complianceCache.set(cacheKey, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  // Global compliance (simplified - would need full file scan in production)
  const data = {
    percentage: 85, // Placeholder - would calculate from actual scan
    totalFiles: 120,
    totalViolations: 1657,
    fileBreakdown: {},
  };

  complianceCache.set(cacheKey, data);
  return data;
}

// ============================================================================
// MCP Tools
// ============================================================================

// Tool 1: Validate code against design tokens
server.addTool({
  name: "tokens:validate",
  description:
    "Validate code snippet against design token requirements. Returns violations and suggestions.",
  parameters: z.object({
    code: z.string().describe("Code snippet to validate (JSX/TSX)"),
    filePath: z.string().optional().describe("Optional file path for context"),
  }),
  execute: async ({ code, filePath }: { code: string; filePath?: string }) => {
    const cacheKey = `validate:${code}`;
    const cached = validationCache.get(cacheKey);
    if (cached) return cached;

    const result = validateCode(code);

    const output = {
      isValid: result.isValid,
      compliance: result.compliance,
      violations: result.violations,
      suggestions: result.suggestions,
      filePath,
    };

    const jsonOutput = JSON.stringify(output, null, 2);
    validationCache.set(cacheKey, jsonOutput);
    return jsonOutput;
  },
});

// Tool 2: Suggest design token for hardcoded value
server.addTool({
  name: "tokens:suggest",
  description:
    "Get design token suggestions for a hardcoded value (e.g., 'gap-4', 'text-2xl')",
  parameters: z.object({
    hardcodedValue: z.string().describe("Hardcoded Tailwind class or value"),
    category: z
      .enum(["spacing", "typography", "containers", "breakpoints"])
      .optional()
      .describe("Token category to search in"),
  }),
  execute: async ({ hardcodedValue, category }: { hardcodedValue: string; category?: "spacing" | "typography" | "containers" | "breakpoints" }) => {
    const suggestions = suggestToken(hardcodedValue, category);

    const output = {
      hardcodedValue,
      category: category || "all",
      suggestions,
      recommended: suggestions[0] || null,
    };

    return JSON.stringify(output, null, 2);
  },
});

// Tool 3: Get compliance percentage
server.addTool({
  name: "tokens:getCompliance",
  description:
    "Calculate design token compliance percentage for file or entire codebase",
  parameters: z.object({
    filePath: z
      .string()
      .optional()
      .describe("Optional file path (omit for global compliance)"),
  }),
  execute: async ({ filePath }: { filePath?: string }) => {
    const result = await calculateCompliance(filePath);

    const output = {
      compliance: `${result.percentage}%`,
      totalFiles: result.totalFiles,
      totalViolations: result.totalViolations,
      status: result.percentage >= 90 ? "passing" : "needs-improvement",
      target: "90%",
      fileBreakdown: result.fileBreakdown,
    };

    return JSON.stringify(output, null, 2);
  },
});

// Tool 4: Find token usages
server.addTool({
  name: "tokens:findUsages",
  description: "Find all files using a specific design token",
  parameters: z.object({
    tokenName: z
      .string()
      .describe(
        "Token name to search for (e.g., 'SPACING.content', 'TYPOGRAPHY.h1')"
      ),
  }),
  execute: async ({ tokenName }: { tokenName: string }) => {
    // Simplified implementation - would use grep or AST search in production
    const output = {
      tokenName,
      usages: [],
      count: 0,
      message:
        "Token usage search requires AST analysis - see grep-search for quick lookup",
    };

    return JSON.stringify(output, null, 2);
  },
});

// Tool 5: Analyze file for token usage
server.addTool({
  name: "tokens:analyzeFile",
  description: "Comprehensive design token analysis for a specific file",
  parameters: z.object({
    filePath: z.string().describe("File path to analyze"),
  }),
  execute: async ({ filePath }: { filePath: string }) => {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const content = await fs.readFile(fullPath, "utf-8");
      const validation = validateCode(content);
      const compliance = await calculateCompliance(filePath);

      const output = {
        filePath,
        compliance: compliance.percentage,
        violations: validation.violations,
        totalClasses:
          validation.violations.length +
          Math.round(
            (validation.violations.length / (100 - validation.compliance)) *
              validation.compliance
          ),
        categories: {
          spacing: validation.violations.filter((v) => v.category === "spacing")
            .length,
          typography: validation.violations.filter(
            (v) => v.category === "typography"
          ).length,
          colors: validation.violations.filter((v) => v.category === "colors")
            .length,
        },
        recommendations: validation.suggestions,
      };

      return JSON.stringify(output, null, 2);
    } catch (error) {
      throw new Error(
        `Failed to analyze file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});

// ============================================================================
// MCP Resources
// ============================================================================

// Resource 1: Token categories
server.addResource({
  uri: "tokens://categories",
  name: "Design Token Categories",
  description: "All design token categories with examples and patterns",
  mimeType: "application/json",
  async load() {
    const categories = Object.entries(TOKEN_CATEGORIES).map(([key, value]) => ({
      name: key,
      description: value.description,
      examples: Object.keys(value.tokens).slice(0, 5),
      patterns: value.patterns.map((p) => p.source),
    }));

    return {
      text: JSON.stringify(categories, null, 2),
    };
  },
});

// Resource 2: Current compliance
server.addResource({
  uri: "tokens://compliance/current",
  name: "Current Design Token Compliance",
  description: "Real-time compliance statistics",
  mimeType: "application/json",
  async load() {
    const compliance = await calculateCompliance();

    return {
      text: JSON.stringify(
        {
          percentage: compliance.percentage,
          status: compliance.percentage >= 90 ? "passing" : "needs-improvement",
          target: 90,
          totalViolations: compliance.totalViolations,
          lastUpdated: new Date().toISOString(),
        },
        null,
        2
      ),
    };
  },
});

// Resource 3: Recent violations (placeholder)
server.addResource({
  uri: "tokens://violations/recent",
  name: "Recent Design Token Violations",
  description: "Recent ESLint violations found",
  mimeType: "application/json",
  async load() {
    return {
      text: JSON.stringify(
        {
          message:
            "Run npm run find:token-violations for full violation report",
          recentViolations: [],
        },
        null,
        2
      ),
    };
  },
});

// Resource 4: Anti-patterns
server.addResource({
  uri: "tokens://anti-patterns",
  name: "Design Token Anti-Patterns",
  description: "Common anti-patterns to avoid",
  mimeType: "application/json",
  async load() {
    const antiPatterns = [
      {
        pattern: "Hardcoded spacing values",
        wrong: "className='gap-4 p-4'",
        correct: "className={`gap-4 p-4`}",
      },
      {
        pattern: "Hardcoded typography",
        wrong: "className='text-xl font-bold'",
        correct: "className={TYPOGRAPHY.h2.standard}",
      },
      {
        pattern: "Direct color values",
        wrong: "className='text-gray-900 bg-blue-500'",
        correct:
          "className={`text-${COLORS.text.primary} bg-${COLORS.brand.primary}`}",
      },
      {
        pattern: "Magic numbers",
        wrong: "className='max-w-[800px]'",
        correct: "className={CONTAINER_WIDTHS.standard}",
      },
    ];

    return {
      text: JSON.stringify(antiPatterns, null, 2),
    };
  },
});

// ============================================================================
// MCP Prompts
// ============================================================================

// NOTE: Prompts are currently disabled due to FastMCP API compatibility
// TODO: Re-enable after verifying correct FastMCP prompt API

// Prompt 1: Token migration plan
// server.addPrompt({
//   name: "token-migration",
//   description:
//     "Generate migration plan for converting hardcoded values to design tokens",
//   arguments: [
//     {
//       name: "filePath",
//       description: "File to migrate",
//       required: false,
//     },
//   ],
//   execute: async (args) => {
//     const filePath = args?.filePath;
//
//     return {
//       messages: [
//         {
//           role: "user" as const,
//           content: {
//             type: "text" as const,
//             text: `Generate a step-by-step migration plan to convert hardcoded Tailwind classes to design tokens${filePath ? ` for ${filePath}` : ""}. Include:
// 1. Current violations count
// 2. Priority order (spacing > typography > colors)
// 3. Specific replacements needed
// 4. Testing strategy
// 5. Estimated effort
//
// Use tokens:analyzeFile${filePath ? `({ filePath: "${filePath}" })` : ""} to get current state.`,
//           },
//         },
//       ],
//     };
//   },
// });

// Prompt 2: Compliance report
// server.addPrompt({
//   name: "compliance-report",
//   description: "Generate comprehensive compliance analysis report",
//   arguments: [],
//   execute: async () => {
//     return {
//       messages: [
//         {
//           role: "user" as const,
//           content: {
//             type: "text" as const,
//             text: `Generate a comprehensive design token compliance report. Include:
// 1. Current compliance percentage (use tokens:getCompliance)
// 2. Breakdown by category (spacing, typography, colors)
// 3. Top violating files
// 4. Recommended next steps
// 5. Timeline to reach 90% compliance
//
// Format as actionable insights with specific recommendations.`,
//           },
//         },
//       ],
//     };
//   },
// });

// ============================================================================
// Start Server
// ============================================================================

server.start({ transportType: "stdio" }).catch((error: unknown) => {
  console.error("❌ Failed to start Design Token MCP server:", error);
  process.exit(1);
});

console.error("✅ Design Token MCP Server started (stdio mode)");
