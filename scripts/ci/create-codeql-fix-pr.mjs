#!/usr/bin/env node

/**
 * Create Pull Request for CodeQL Fix
 *
 * Creates a GitHub pull request for the automated CodeQL security fix
 * with detailed description and links to original alert.
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub API token
 *   GITHUB_REPOSITORY - Repository in owner/repo format
 *   BRANCH_NAME - Feature branch to create PR from
 *   ALERT_NUMBER - CodeQL alert number
 *   RULE_ID - Security rule identifier
 *   RULE_NAME - Human-readable rule name
 *   ALERT_FILE - File containing the vulnerability
 *   ALERT_LINE - Line number of the alert
 *   DESCRIPTION - Rule description
 *   DRY_RUN - Skip PR creation if true
 *
 * Outputs:
 *   pr_number - GitHub PR number
 *   pr_url - GitHub PR URL
 */

import { execaSync } from 'execa';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const BRANCH_NAME = process.env.BRANCH_NAME;
const ALERT_NUMBER = process.env.ALERT_NUMBER;
const RULE_ID = process.env.RULE_ID;
const RULE_NAME = process.env.RULE_NAME;
const ALERT_FILE = process.env.ALERT_FILE;
const ALERT_LINE = process.env.ALERT_LINE;
const DESCRIPTION = process.env.DESCRIPTION;
const DRY_RUN = process.env.DRY_RUN === 'true';

const [REPO_OWNER, REPO_NAME] = GITHUB_REPOSITORY.split('/');

function generatePRTitle() {
  return `fix(security): resolve ${RULE_ID} CodeQL alert #${ALERT_NUMBER}`;
}

function generatePRDescription() {
  return `## 🔒 Security Fix: ${RULE_NAME}

### Alert Details
- **Alert ID:** #${ALERT_NUMBER}
- **Rule:** \`${RULE_ID}\`
- **Severity:** High
- **Description:** ${DESCRIPTION}
- **Location:** [\`${ALERT_FILE}:${ALERT_LINE}\`](../../blob/main/${ALERT_FILE}#L${ALERT_LINE})

### Fix Summary
This PR addresses a security vulnerability detected by GitHub CodeQL. The fix:

✅ Eliminates the security issue without suppressing alerts
✅ Maintains all existing functionality
✅ Follows DCYFR security standards and patterns
✅ Includes automated testing and validation

### CodeQL Reference
- 🔗 [View in Code Scanning Dashboard](https://github.com/${REPO_OWNER}/${REPO_NAME}/security/code-scanning/${ALERT_NUMBER})
- 📚 [DCYFR Security Guidelines](.github/agents/patterns/CODEQL_SUPPRESSIONS.md)

### Validation Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (0 errors)
- [ ] Tests pass (≥99%)
- [ ] Design tokens used (if UI changes)
- [ ] Security fix verified
- [ ] No new vulnerabilities introduced

### Related Issues
- Fixes security alert from CodeQL analysis
- Part of DCYFR automated security hardening

**Created by:** GitHub Actions + Copilot Autofix
**Branch:** \`${BRANCH_NAME}\`

---

### Security Review Notes
This fix was generated using GitHub Copilot Autofix and follows the DCYFR "Fix > Suppress" philosophy. All changes prioritize security over convenience, with inline comments explaining the security rationale.

For questions about the fix approach, see:
- [DCYFR Security Policy](.github/agents/patterns/CODEQL_SUPPRESSIONS.md)
- [Logging Security Best Practices](docs/ai/logging-security.md)
`;
}

async function createPullRequest() {
  const title = generatePRTitle();
  const body = generatePRDescription();

  console.log(`📝 Creating Pull Request for CodeQL Alert #${ALERT_NUMBER}`);
  console.log(`   Branch: ${BRANCH_NAME}`);
  console.log(`   Rule: ${RULE_ID}`);

  if (DRY_RUN) {
    console.log('   [DRY RUN] Skipping PR creation');
    console.log('\n📋 PR Title:');
    console.log(title);
    console.log('\n📋 PR Description Preview:');
    console.log(body.substring(0, 500) + '...\n');
    console.log(`::set-output name=pr_number::`);
    console.log(`::set-output name=pr_url::`);
    return;
  }

  try {
    // FIX: CWE-78 - Use execa with array syntax to prevent command injection
    console.log(`   Pushing branch to remote...`);
    execaSync('git', ['push', 'origin', BRANCH_NAME], { stdio: 'pipe', shell: false });

    console.log(`   Creating PR...`);
    const { stdout: output } = execaSync(
      'gh',
      [
        'pr',
        'create',
        '--base',
        'main',
        '--head',
        BRANCH_NAME,
        '--title',
        title, // No quotes needed - array syntax is safe
        '--body',
        body, // No quotes needed - array syntax is safe
        '--label',
        'security,automated,codeql-fix',
        '--draft=false',
      ],
      {
        env: { ...process.env, GITHUB_TOKEN },
        encoding: 'utf-8',
        shell: false, // Critical: disable shell interpretation
      },
    );

    // Extract PR number and URL from output
    const prMatch = output.match(/(\d+)/);
    const prNumber = prMatch ? prMatch[1] : null;
    const prUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/pull/${prNumber}`;

    console.log(`✅ Pull Request created!`);
    console.log(`   PR #${prNumber}: ${prUrl}`);

    console.log(`::set-output name=pr_number::${prNumber}`);
    console.log(`::set-output name=pr_url::${prUrl}`);
  } catch (error) {
    console.error(`❌ Failed to create PR: ${error.message}`);
    console.log(`::set-output name=pr_number::`);
    console.log(`::set-output name=pr_url::`);
    process.exit(1);
  }
}

createPullRequest().catch((error) => {
  console.error('❌ Error:', error.message);
  console.log(`::set-output name=pr_number::`);
  console.log(`::set-output name=pr_url::`);
  process.exit(1);
});
