/**
 * ESLint Rule: no-hardcoded-typography
 *
 * Detects hardcoded Tailwind typography classes and suggests using TYPOGRAPHY design tokens.
 *
 * Examples of violations:
 * - className="text-4xl font-bold"  → Use TYPOGRAPHY.h1.standard
 * - className="text-lg leading-7"   → Use TYPOGRAPHY tokens
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded typography values, require TYPOGRAPHY design tokens',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      hardcodedTypography: 'Use TYPOGRAPHY tokens instead of hardcoded "{{value}}". See docs/design/DESIGN_TOKEN_USAGE_GUIDE.md',
      complexTypography: 'Complex typography detected. Consider using TYPOGRAPHY tokens for consistency.',
    },
    schema: [],
  },

  create(context) {
    // Patterns to detect hardcoded typography
    const hardcodedPatterns = [
      // Font size: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, etc.
      /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,

      // Font weight: font-thin, font-light, font-normal, font-medium, font-semibold, font-bold, font-extrabold
      /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,

      // Line height: leading-3, leading-tight, leading-relaxed, etc.
      /leading-(none|tight|snug|normal|relaxed|loose|\d+)/,

      // Letter spacing: tracking-tight, tracking-normal, tracking-wide
      /tracking-(tighter|tight|normal|wide|wider|widest)/,
    ];

    function checkValue(node, value) {
      if (!value || typeof value !== 'string') return;

      let violationCount = 0;
      let firstViolation = '';

      // Check for hardcoded typography
      for (const pattern of hardcodedPatterns) {
        const match = value.match(pattern);
        if (match) {
          violationCount++;
          if (!firstViolation) {
            firstViolation = match[0];
          }
        }
      }

      if (violationCount > 0) {
        // If multiple typography properties detected, suggest using TYPOGRAPHY token
        if (violationCount >= 2) {
          context.report({
            node,
            messageId: 'complexTypography',
          });
        } else {
          context.report({
            node,
            messageId: 'hardcodedTypography',
            data: { value: firstViolation },
          });
        }
      }
    }

    return {
      // JSX className attribute
      JSXAttribute(node) {
        if (node.name.name === 'className') {
          // String literal: className="text-4xl font-bold"
          if (node.value && node.value.type === 'Literal') {
            checkValue(node, node.value.value);
          }

          // JSX expression: className={`text-${size}`}
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
