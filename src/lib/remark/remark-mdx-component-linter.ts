/**
 * Remark Plugin: MDX Component Linter
 *
 * Validates MDX component usage in blog posts according to content standards.
 * Warns when posts are missing recommended components or violating usage guidelines.
 *
 * @see docs/blog/content-audit-checklist.md for validation rules
 */

import { visit } from "unist-util-visit";

/**
 * Component usage recommendations
 */
const COMPONENT_RULES = {
  SectionShare: {
    min: 1,
    max: 3,
    message: "Posts should have 1-3 SectionShare components for optimal engagement",
  },
  GlossaryTooltip: {
    min: 5,
    max: 20,
    message: "Technical posts should have 5-10 GlossaryTooltip components",
  },
  CollapsibleSection: {
    min: 0,
    max: 10,
    message:
      "Avoid excessive CollapsibleSection usage (max 10) - don't hide core content",
  },
  Alert: {
    min: 0,
    max: 3,
    message:
      "Limit Alert components to 0-3 per post - reserve for critical information",
  },
  KeyTakeaway: {
    min: 0,
    max: 3,
    message: "Limit KeyTakeaway to 1-3 key insights per post",
  },
};

/**
 * Minimum word count for requiring engagement components
 */
const MIN_WORD_COUNT_FOR_COMPONENTS = 300;

/**
 * Count words in MDX content
 */
function countWords(tree: any): number {
  let wordCount = 0;

  visit(tree, "text", (node: any) => {
    const words = node.value.trim().split(/\s+/);
    wordCount += words.length;
  });

  return wordCount;
}

/**
 * Count MDX component usage
 */
function countComponents(tree: any): Record<string, number> {
  const counts: Record<string, number> = {};

  visit(tree, "mdxJsxFlowElement", (node: any) => {
    const componentName = node.name;
    if (componentName) {
      counts[componentName] = (counts[componentName] || 0) + 1;
    }
  });

  visit(tree, "mdxJsxTextElement", (node: any) => {
    const componentName = node.name;
    if (componentName) {
      counts[componentName] = (counts[componentName] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Remark plugin that validates MDX component usage
 */
export default function remarkMdxComponentLinter(options: any = {}) {
  const { filepath = "unknown file", strict = false } = options;

  return (tree: any, file: any) => {
    const wordCount = countWords(tree);
    const componentCounts = countComponents(tree);

    // Skip validation for short posts or drafts
    if (wordCount < MIN_WORD_COUNT_FOR_COMPONENTS) {
      return;
    }

    // Check each component rule
    for (const [componentName, rule] of Object.entries(COMPONENT_RULES)) {
      const count = componentCounts[componentName] || 0;

      if (count < rule.min) {
        const message = `${componentName}: Found ${count}, expected at least ${rule.min}. ${rule.message}`;
        if (strict) {
          file.fail(message);
        } else {
          file.message(message);
        }
      }

      if (count > rule.max) {
        const message = `${componentName}: Found ${count}, expected maximum ${rule.max}. ${rule.message}`;
        if (strict) {
          file.fail(message);
        } else {
          file.message(message);
        }
      }
    }

    // Special check: Posts over 300 words should have at least one SectionShare
    if (wordCount >= MIN_WORD_COUNT_FOR_COMPONENTS) {
      const sectionShareCount = componentCounts.SectionShare || 0;
      if (sectionShareCount === 0) {
        const message = `Post is ${wordCount} words but has no SectionShare components. Add 1-3 after major sections for better engagement.`;
        if (strict) {
          file.fail(message);
        } else {
          file.message(message);
        }
      }
    }

    // Add metadata to file for reporting
    file.data.componentCounts = componentCounts;
    file.data.wordCount = wordCount;
  };
}

/**
 * Standalone validation function for use in scripts
 */
export function validateMdxComponents(content: string, options: any = {}) {
  // This function is not implemented yet - use the standalone script instead
  throw new Error("Use scripts/validate-mdx-components.mjs instead");
}
