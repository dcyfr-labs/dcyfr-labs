/**
 * ESLint Rule: no-hardcoded-spacing
 *
 * Detects hardcoded Tailwind spacing classes and suggests using design tokens instead.
 *
 * Examples of violations:
 * - className="space-y-8"         → Use SPACING.section
 * - className="gap-6"             → Use SPACING.content
 * - className="mb-4 mt-2"         → Use SPACING tokens
 * - className={`p-${size}`}       → Use spacing() helper
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded spacing values, require SPACING design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcodedSpacing: 'Use SPACING tokens instead of hardcoded "{{value}}". See docs/design/DESIGN_TOKEN_USAGE_GUIDE.md',
      hardcodedDynamicSpacing: 'Use spacing() helper for dynamic spacing values instead of "{{value}}"',
    },
    schema: [],
  },

  create(context) {
    // Patterns to detect hardcoded spacing
    const hardcodedPatterns = [
      // Vertical spacing
      /space-y-\d+/,
      /space-y-\d+\.\d+/,

      // Gap
      /gap-\d+/,
      /gap-x-\d+/,
      /gap-y-\d+/,

      // Padding
      /\bp-\d+/,
      /px-\d+/,
      /py-\d+/,
      /pt-\d+/,
      /pb-\d+/,
      /pl-\d+/,
      /pr-\d+/,

      // Margin
      /\bm-\d+/,
      /mx-\d+/,
      /my-\d+/,
      /mt-\d+/,
      /mb-\d+/,
      /ml-\d+/,
      /mr-\d+/,
    ];

    // Pattern for dynamic template literals (e.g., `gap-${size}`)
    const dynamicPattern = /(space-y-|gap-|p-|m-|mb-|mt-|mx-|my-|px-|py-)\$\{/;

    function matchHardcodedPattern(value, patterns) {
      for (const pattern of patterns) {
        const m = value.match(pattern);
        if (m) return m[0];
      }
      return null;
    }

    function checkValue(node, value) {
      if (!value || typeof value !== 'string') return;

      const matched = matchHardcodedPattern(value, hardcodedPatterns);
      if (matched) {
        context.report({ node, messageId: 'hardcodedSpacing', data: { value: matched } });
        return;
      }

      if (dynamicPattern.test(value)) {
        context.report({
          node,
          messageId: 'hardcodedDynamicSpacing',
          data: { value: value.substring(0, 50) + '...' },
        });
      }
    }

    function checkExpression(node, expression) {
      if (expression.type === 'TemplateLiteral') {
        checkValue(node, expression.quasis.map(q => q.value.raw).join('${...}'));
        return;
      }
      if (expression.type === 'BinaryExpression' && expression.operator === '+') {
        if (expression.left.type === 'Literal') checkValue(node, expression.left.value);
        if (expression.right.type === 'Literal') checkValue(node, expression.right.value);
      }
    }

    return {
      // JSX className attribute
      JSXAttribute(node) {
        if (node.name.name !== 'className') return;
        if (node.value?.type === 'Literal') {
          checkValue(node, node.value.value);
        } else if (node.value?.type === 'JSXExpressionContainer') {
          checkExpression(node, node.value.expression);
        }
      },
    };
  },
};
