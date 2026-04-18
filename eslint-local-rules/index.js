/**
 * Custom ESLint Rules for DCYFR Design Token Enforcement
 *
 * These rules ensure consistent usage of design tokens across the codebase.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = {
  'no-hardcoded-spacing': require('./no-hardcoded-spacing'),
  'no-hardcoded-colors': require('./no-hardcoded-colors'),
  'no-hardcoded-typography': require('./no-hardcoded-typography'),
  'no-deprecated-design-tokens': require('./no-deprecated-design-tokens'),
};
/* eslint-enable @typescript-eslint/no-require-imports */
