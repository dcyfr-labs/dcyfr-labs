<!--
Thank you for contributing to dcyfr-labs!

This template helps ensure quality and consistency.
Delete sections that don't apply to your PR.
-->

## 📝 Description

<!-- What does this PR do? Why is it needed? -->

### Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🎨 Design system / UI update
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security fix
- [ ] 🧪 Test coverage improvement
- [ ] 🔧 Configuration / tooling update

### Related Issues

<!-- Link to related issues, features, or bugs -->

Closes #
Related to #

---

## 🎯 Changes Made

<!-- List specific changes in this PR -->

-
-
-

---

## ✅ Pre-Submission Checklist

<!-- Auto-validation runs on PR open. Check manually if needed. -->

### Code Quality

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] ESLint passes with 0 errors (`npm run lint`)
- [ ] Code follows design token system (no hardcoded spacing/colors)
- [ ] All imports use barrel exports (`@/components/blog` not file paths)

### Testing

- [ ] Tests added/updated for new functionality
- [ ] All tests pass (`npm run test:run`)
- [ ] Test coverage ≥99% pass rate
- [ ] E2E tests pass if UI changes (`npm run test:e2e`)

### Documentation

- [ ] Code comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated (for user-facing changes)
- [ ] No emojis in public-facing content (use `lucide-react` icons)

### Security

- [ ] No secrets or sensitive data in code
- [ ] Environment variables documented (if new ones added)
- [ ] Security implications reviewed (if applicable)
- [ ] No console.log in production code paths

### Design System (if applicable)

- [ ] Uses `PageLayout` (or documented exception)
- [ ] Uses `SPACING` constants for margins/padding
- [ ] Uses `TYPOGRAPHY` constants for text styles
- [ ] Uses `SEMANTIC_COLORS` for colors
- [ ] Responsive design tested (mobile, tablet, desktop)

---

## 🧪 Testing Instructions

<!-- How should reviewers test this PR? -->

### Local Testing

```bash
# Setup
npm install
npm run dev

# Test steps
1.
2.
3.

# Expected behavior
-
```

### Preview Environment

<!-- Vercel preview URL will be auto-generated -->

- Test on preview deployment: [Wait for Vercel preview]
- Test on mobile devices
- Test with different data scenarios

---

## 📸 Screenshots / Videos

<!-- If UI changes, add before/after screenshots or screen recordings -->

### Before


### After


---

## 🤖 Automated Analysis

<!-- This section is auto-populated by pr-resolution-plan.yml workflow -->

⏳ **Resolution plan is being generated...**

The `pr-resolution-plan` workflow will automatically:
- ✅ Scan for security issues (Gitleaks)
- ✅ Check code quality (ESLint, TypeScript)
- ✅ Validate design tokens
- ✅ Run test suite
- ✅ Check markdown quality
- ✅ Generate prioritized resolution plan

Results will appear as a comment below when analysis completes (~2-3 minutes).

---

## 💡 Copilot Integration

<!-- How to use GitHub Copilot to help with this PR -->

### For Reviewers

Use `@copilot` in review comments to request automated fixes:

```
@copilot Fix ESLint warnings by using proper logging utilities
@copilot Convert hardcoded spacing to design tokens (SPACING constants)
@copilot Add missing tests for the new handleSubmit function
```

**Tips:**
- Click "Start a review" to batch multiple comments
- Be specific about what needs fixing
- Reference documentation: `@copilot Follow patterns in docs/ai/component-patterns.md`

### For Authors

If the automated plan identifies issues:

1. Review the resolution plan comment below
2. Address critical issues first (TypeScript errors, test failures)
3. Use `@copilot` to request help with fixes
4. Request re-review when ready

---

## 📋 Reviewer Checklist

<!-- For reviewers - check these before approving -->

- [ ] Code changes align with described functionality
- [ ] Design tokens used consistently
- [ ] No breaking changes (or properly documented)
- [ ] Tests cover new functionality
- [ ] Documentation is clear and complete
- [ ] No security concerns
- [ ] Performance impact acceptable
- [ ] Ready to merge

---

## 🚀 Deployment Notes

<!-- Any special considerations for deployment? -->

- [ ] No special deployment steps needed
- [ ] Database migrations required
- [ ] Environment variables need updating
- [ ] Cache invalidation required
- [ ] Feature flags need toggling
- [ ] External service configuration needed

**Deployment instructions:**


---

## 📚 Additional Context

<!-- Any other context, design decisions, or trade-offs made -->


---

<!--
For more information:
- [Contributing Guide](../CONTRIBUTING.md)
- [Agent Guide](../AGENTS.md)
- [Copilot PR Workflow](../docs/ai/copilot-pr-workflow.md)
- [Component Patterns](../docs/ai/component-patterns.md)
- [Testing Guide](../docs/testing/README.md)
-->
