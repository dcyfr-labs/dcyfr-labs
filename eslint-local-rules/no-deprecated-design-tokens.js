/**
 * ESLint Rule: no-deprecated-design-tokens
 *
 * Detects usage of deprecated design tokens and suggests modern alternatives.
 *
 * Deprecated tokens:
 * - ANIMATIONS.* → Use ANIMATION_CONSTANTS.*
 * - SPACING.xs, SPACING.2xs, etc. (numeric properties) → Use SPACING_SCALE.xs or spacing('xs')
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow deprecated design token patterns',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      deprecatedAnimations: 'ANIMATIONS is deprecated. Use ANIMATION_CONSTANTS instead.',
      deprecatedSpacingNumeric: 'SPACING.{{property}} (numeric) is deprecated. Use SPACING_SCALE.{{property}} or spacing("{{property}}") helper instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      // Detect ANIMATIONS usage
      MemberExpression(node) {
        // Check for ANIMATIONS.* (deprecated)
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'ANIMATIONS'
        ) {
          context.report({
            node,
            messageId: 'deprecatedAnimations',
          });
        }

        // Check for SPACING.xs, SPACING.2xs, etc. (deprecated numeric properties)
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'SPACING' &&
          node.property.type === 'Identifier'
        ) {
          const deprecatedNumericProps = [
            'xs', 'sm', 'md', 'lg', 'xl', '2xl',
            '2xs', '0.5', '1.5'
          ];

          if (deprecatedNumericProps.includes(node.property.name)) {
            context.report({
              node,
              messageId: 'deprecatedSpacingNumeric',
              data: { property: node.property.name },
            });
          }
        }
      },

      // Detect ANIMATIONS import
      ImportSpecifier(node) {
        if (node.imported.name === 'ANIMATIONS') {
          context.report({
            node,
            messageId: 'deprecatedAnimations',
          });
        }
      },
    };
  },
};
