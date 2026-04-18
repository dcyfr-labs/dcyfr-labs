/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ESLint Rule: no-hardcoded-colors
 *
 * Detects hardcoded Tailwind color classes and suggests using SEMANTIC_COLORS instead.
 *
 * Examples of violations:
 * - className="text-red-500"       → Use SEMANTIC_COLORS.text.error
 * - className="bg-blue-600"        → Use SEMANTIC_COLORS.background.*
 * - className="border-gray-300"    → Use SEMANTIC_COLORS.border.*
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded color values, require SEMANTIC_COLORS design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcodedColor: 'Use SEMANTIC_COLORS tokens instead of hardcoded "{{value}}". See docs/design/DESIGN_TOKEN_USAGE_GUIDE.md',
    },
    schema: [],
  },

  create(context) {
    // Color scale values (50-950)
    const colorScales = /\b(50|100|200|300|400|500|600|700|800|900|950)\b/;

    // Tailwind color names
    const colorNames = /\b(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\b/;

    // Patterns to detect hardcoded colors
    const hardcodedPatterns = [
      // Text colors: text-red-500, text-blue-600
      /text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,

      // Background colors: bg-blue-500
      /bg-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,

      // Border colors: border-gray-300
      /border-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,

      // Ring colors: ring-blue-500
      /ring-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,

      // From/via/to colors (gradients): from-blue-500
      /(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
    ];

    function checkValue(node, value) {
      if (!value || typeof value !== 'string') return;

      // Check for hardcoded colors
      for (const pattern of hardcodedPatterns) {
        const match = value.match(pattern);
        if (match) {
          context.report({
            node,
            messageId: 'hardcodedColor',
            data: { value: match[0] },
          });
          // Only report first violation per attribute
          return;
        }
      }
    }

    return {
      // JSX className attribute
      JSXAttribute(node) {
        if (node.name.name === 'className') {
          // String literal: className="text-red-500"
          if (node.value && node.value.type === 'Literal') {
            checkValue(node, node.value.value);
          }

          // JSX expression: className={`bg-${color}-500`}
          if (node.value && node.value.type === 'JSXExpressionContainer') {
            const expression = node.value.expression;

            // Template literal
            if (expression.type === 'TemplateLiteral') {
              const quasi = expression.quasis.map(q => q.value.raw).join('');
              checkValue(node, quasi);
            }
          }
        }
      },
    };
  },
};
