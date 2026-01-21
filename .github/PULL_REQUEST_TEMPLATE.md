# Pull Request

## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Dependency update
- [ ] CI/CD improvement

## Related Issue

<!-- Link to the related issue, if applicable -->

Closes #(issue number)

## Changes Made

<!-- Provide a detailed list of changes -->

-
-
-

## Testing

<!-- Describe the tests you ran to verify your changes -->

### Test Checklist

- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run typecheck` passes (no type errors)
- [ ] `npm run test` passes (≥99% pass rate maintained)
- [ ] `npm run build` succeeds (production build works)
- [ ] Manual testing completed (if applicable)
- [ ] E2E tests pass (if applicable)

### Test Coverage

- [ ] New code has test coverage
- [ ] Existing tests updated (if applicable)
- [ ] Integration tests added (if needed)

## Screenshots

<!-- If applicable, add screenshots to help explain your changes -->

### Before

<!-- Screenshot or description of behavior before changes -->

### After

<!-- Screenshot or description of behavior after changes -->

## Design System Compliance

<!-- For UI changes only -->

- [ ] Uses design tokens from `@/lib/design-tokens.ts`
- [ ] No hardcoded spacing, typography, or colors
- [ ] Follows existing component patterns
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Dark mode tested (if applicable)

## Security Considerations

<!-- Mark any security-related items -->

- [ ] No secrets or API keys in code
- [ ] Input validation added (if handling user input)
- [ ] XSS/CSRF protection considered
- [ ] Security headers unchanged or improved
- [ ] No new security vulnerabilities introduced

## Performance Impact

<!-- Describe any performance implications -->

- [ ] No negative performance impact
- [ ] Lighthouse scores maintained (≥90% perf, ≥95% a11y)
- [ ] Bundle size impact assessed
- [ ] Images optimized (if applicable)

## Accessibility

<!-- For UI changes only -->

- [ ] WCAG 2.1 AA compliance maintained
- [ ] Keyboard navigation works
- [ ] Screen reader tested (if significant UI changes)
- [ ] Color contrast meets standards
- [ ] ARIA labels added where needed

## Breaking Changes

<!-- List any breaking changes and migration steps -->

- [ ] No breaking changes
- [ ] Breaking changes documented in CHANGELOG.md
- [ ] Migration guide provided (if needed)

## Deployment Notes

<!-- Any special deployment considerations -->

- [ ] No special deployment steps required
- [ ] Environment variables added/updated (document in PR description)
- [ ] Database migrations needed (describe below)
- [ ] Cache invalidation needed (describe below)

## Documentation

- [ ] README.md updated (if needed)
- [ ] `/docs` updated (if needed)
- [ ] CHANGELOG.md updated (see `npm run changelog:help` for guidelines)
- [ ] Code comments added for complex logic
- [ ] API documentation updated (if applicable)

**Changelog Validation:**
```bash
# Before marking complete, validate changelog format:
npm run changelog:validate    # Check format compliance
npm run changelog:check       # Check if stale (>7 days)
```

**Guidelines:**
- ✅ Add entry for: New pages, components, features, breaking changes
- ✅ May skip for: Minor bug fixes, internal changes, refactoring
- ✅ Format: Use CalVer `[YYYY.MM.DD]` with sections (Added, Changed, Removed, Fixed)
- ✅ Breaking changes: Mark with ⚠️ BREAKING prefix

## Checklist

<!-- Final verification before requesting review -->

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have updated the documentation accordingly
- [ ] My changes maintain or improve test coverage
- [ ] All tests pass locally
- [ ] I have checked for conflicts with the base branch

## Additional Context

<!-- Add any other context about the PR here -->

---

**Reviewer Notes:**

<!-- For reviewers: Add any specific areas that need attention -->
