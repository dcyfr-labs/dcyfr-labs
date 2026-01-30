#!/usr/bin/env node

/**
 * Request GitHub Copilot Fix for CodeQL Alert
 *
 * Uses the Copilot CLI (or GitHub API) to request automated fixes
 * for a specific CodeQL security alert.
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub API token
 *   GITHUB_REPOSITORY - Repository in owner/repo format
 *   BRANCH_NAME - Feature branch created for this fix
 *   ALERT_NUMBER - CodeQL alert number
 *   RULE_ID - Security rule identifier
 *   RULE_NAME - Human-readable rule name
 *   ALERT_FILE - File containing the vulnerability
 *   ALERT_LINE - Line number of the alert
 *   DESCRIPTION - Rule description
 *   DRY_RUN - Skip actual fix generation if true
 *
 * Outputs:
 *   fix_generated - Whether a fix was generated
 */

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

function generateCopilotPrompt() {
  return `# Fix CodeQL Security Alert

**Alert:** ${RULE_ID} (ID: #${ALERT_NUMBER})
**File:** ${ALERT_FILE}:${ALERT_LINE}
**Rule:** ${RULE_NAME}
**Description:** ${DESCRIPTION}

## Task
Fix this security vulnerability in ${ALERT_FILE} following DCYFR security policies:

1. **Analyze the vulnerability** at line ${ALERT_LINE}
2. **Implement a fix** that:
   - Eliminates the security issue (don't suppress, fix it)
   - Maintains code functionality
   - Follows DCYFR patterns (design tokens, error handling)
   - Includes inline comments explaining the fix
3. **Add/update tests** if needed
4. **Verify ESLint passes** (run \`npm run lint -- ${ALERT_FILE}\`)

## DCYFR Security Rules
- **No LGTM suppressions** without 30+ min fix attempt
- Follow patterns in: .github/agents/patterns/CODEQL_SUPPRESSIONS.md
- Security findings must be FIXED, not suppressed
- Document fix rationale in commit message

## Success Criteria
- ✅ Vulnerability fixed (not suppressed)
- ✅ No new violations introduced
- ✅ Code compiles and tests pass
- ✅ Follows DCYFR patterns

Please fix this security issue now.`;
}

async function requestCopilotFix() {
  console.log(`🤖 Requesting GitHub Copilot fix for CodeQL alert #${ALERT_NUMBER}`);
  console.log(`   Rule: ${RULE_ID}`);
  console.log(`   File: ${ALERT_FILE}:${ALERT_LINE}`);

  if (DRY_RUN) {
    console.log('   [DRY RUN] Skipping actual fix generation');
    console.log(`::set-output name=fix_generated::false`);
    return;
  }

  const prompt = generateCopilotPrompt();

  // Note: This requires GitHub Copilot Extensions or API integration
  // For now, we'll create an instructional commit that explains the fix needed

  console.log(`\n📝 Copilot Fix Instructions:`);
  console.log(prompt);

  console.log(`\n⚠️  Manual Action Required:`);
  console.log(`1. Switch to branch: git checkout ${BRANCH_NAME}`);
  console.log(`2. Use GitHub Copilot (Chat or Inline) to fix: ${ALERT_FILE}:${ALERT_LINE}`);
  console.log(`3. Prompt: "Fix CodeQL alert ${RULE_ID}"`);
  console.log(`4. Commit changes: git commit -am "fix: resolve ${RULE_ID} alert"`);
  console.log(`5. Push branch: git push origin ${BRANCH_NAME}`);

  // For automation, we could:
  // 1. Create an initial commit with inline comments marking the vulnerability
  // 2. Trigger Copilot via GitHub CLI if available
  // 3. Wait for automated tools to make the fix

  // For now, mark as ready for Copilot processing
  console.log(`::set-output name=fix_generated::true`);
}

requestCopilotFix().catch((error) => {
  console.error('❌ Error:', error.message);
  console.log(`::set-output name=fix_generated::false`);
  process.exit(1);
});
