#!/usr/bin/env node

/**
 * Manual version bump utility (when automation is disabled)
 *
 * Usage:
 *   npm run version:bump           # Bump to today's date
 *   npm run version:bump:dry-run   # Show what would happen
 */

import fs from 'fs';
import { execSync } from 'child_process';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    version: { type: 'string' },
    help: { type: 'boolean', default: false }
  },
  allowPositionals: true
});

if (values.help) {
  console.log(`
Manual Version Bump Tool

Updates package.json version to CalVer format and generates changelog entry.
This tool is for manual use when auto-calver workflow is disabled.

Usage:
  npm run version:bump                    # Bump to today's date
  npm run version:bump:dry-run            # Preview changes
  npm run version:bump -- --version 2026.02.15  # Specific version

⚠️  Normally handled automatically by .github/workflows/auto-calver.yml
    Use this tool only when automation is disabled or for hotfixes.
`);
  process.exit(0);
}

// Read current package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const currentVersion = pkg.version;

// Determine new version
const newVersion = values.version || new Date().toISOString().split('T')[0].replace(/-/g, '.');

console.log(`\n📦 Manual Version Bump`);
console.log(`   Current: ${currentVersion}`);
console.log(`   New:     ${newVersion}`);

if (values['dry-run']) {
  console.log(`   Mode:    DRY RUN (no changes will be made)\n`);
} else {
  console.log(`   Mode:    LIVE (will modify files)\n`);
}

// Validate new version format
const calverPattern = /^(\d{4})\.(\d{2})\.(\d{2})(?:\.(\d+))?$/;
if (!calverPattern.test(newVersion)) {
  console.error(`❌ Invalid CalVer format: ${newVersion}`);
  console.error(`   Expected: YYYY.MM.DD or YYYY.MM.DD.N`);
  process.exit(1);
}

// Check if version is different
if (currentVersion === newVersion) {
  console.log(`✅ Version ${newVersion} is already current`);
  process.exit(0);
}

// Generate changelog entry (if not dry run)
let changelogGenerated = false;
if (!values['dry-run']) {
  try {
    console.log(`📝 Generating changelog entry...`);

    // Get recent commits
    const commits = execSync('git log --oneline --no-merges --since="1 week ago"', { // NOSONAR - Administrative script, inputs from controlled sources
      encoding: 'utf-8'
    }).trim();

    if (commits) {
      // Write commits to temp file
      fs.writeFileSync('recent-commits.txt', commits);

      // Generate changelog entry
      execSync(`node scripts/generate-changelog-entry.mjs --version "${newVersion}" --previous "${currentVersion}" --commits-file recent-commits.txt --output changelog-entry.md`, { // NOSONAR - Administrative script, inputs from controlled sources
        stdio: 'inherit'
      });

      changelogGenerated = true;

      // Clean up temp file
      fs.unlinkSync('recent-commits.txt');
    } else {
      console.warn(`⚠️  No recent commits found, skipping changelog generation`);
    }
  } catch (error) {
    console.error(`❌ Changelog generation failed: ${error.message}`);
    console.warn(`⚠️  Continuing with version bump only...`);
  }
}

// Update package.json
if (values['dry-run']) {
  console.log(`📄 Would update package.json version: ${currentVersion} → ${newVersion}`);
} else {
  console.log(`📄 Updating package.json...`);

  try {
    execSync(`npm version ${newVersion} --no-git-tag-version --allow-same-version`, { // NOSONAR - Administrative script, inputs from controlled sources
      stdio: 'inherit'
    });
    console.log(`✅ Updated package.json to ${newVersion}`);
  } catch (error) {
    console.error(`❌ Failed to update package.json: ${error.message}`);
    process.exit(1);
  }
}

// Update CHANGELOG.md
if (changelogGenerated) {
  if (values['dry-run']) {
    console.log(`📝 Would prepend changelog entry to CHANGELOG.md`);
  } else {
    console.log(`📝 Updating CHANGELOG.md...`);

    try {
      // Prepend changelog entry
      const existingChangelog = fs.readFileSync('CHANGELOG.md', 'utf-8');
      const newEntry = fs.readFileSync('changelog-entry.md', 'utf-8');

      fs.writeFileSync('CHANGELOG.md', newEntry + existingChangelog);

      // Clean up temp file
      fs.unlinkSync('changelog-entry.md');

      console.log(`✅ Updated CHANGELOG.md with new entry`);
    } catch (error) {
      console.error(`❌ Failed to update CHANGELOG.md: ${error.message}`);
      console.warn(`⚠️  Manual changelog update required`);
    }
  }
}

// Git operations
if (values['dry-run']) {
  console.log(`\n🔄 Would commit changes:`);
  console.log(`   git add package.json package-lock.json${changelogGenerated ? ' CHANGELOG.md' : ''}`);
  console.log(`   git commit -m "chore(release): version ${newVersion}"`);
  console.log(`   git tag -a "v${newVersion}" -m "Release version ${newVersion}"`);
} else {
  console.log(`\n🔄 Creating commit...`);

  try {
    // Stage files
    const filesToAdd = ['package.json', 'package-lock.json'];
    if (changelogGenerated) {
      filesToAdd.push('CHANGELOG.md');
    }

    execSync(`git add ${filesToAdd.join(' ')}`, { stdio: 'pipe' }); // NOSONAR - Administrative script, inputs from controlled sources

    // Create commit
    const commitMessage = `chore(release): version ${newVersion}

Manual version bump using scripts/bump-version-manual.mjs
Previous version: ${currentVersion}

${changelogGenerated ? 'Changes documented in CHANGELOG.md.' : 'Manual changelog update recommended.'}
`;

    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' }); // NOSONAR - Administrative script, inputs from controlled sources

    // Create tag
    execSync(`git tag -a "v${newVersion}" -m "Release version ${newVersion}"`, { stdio: 'pipe' }); // NOSONAR - Administrative script, inputs from controlled sources

    console.log(`✅ Committed version ${newVersion}`);
    console.log(`✅ Created tag v${newVersion}`);

  } catch (error) {
    console.error(`❌ Git operations failed: ${error.message}`);
    console.warn(`⚠️  Manual git commit required`);
    process.exit(1);
  }
}

// Summary
console.log(`\n📊 Summary:`);
console.log(`   Version: ${currentVersion} → ${newVersion}`);
console.log(`   Changelog: ${changelogGenerated ? '✅ Generated' : '⚠️  Manual update needed'}`);
console.log(`   Git: ${values['dry-run'] ? '📋 Would commit' : '✅ Committed'}`);

if (!values['dry-run']) {
  console.log(`\n🚀 Next steps:`);
  console.log(`   git push origin main       # Push commit`);
  console.log(`   git push origin v${newVersion}  # Push tag`);
}

console.log(`\n💡 For automated version management, see:`);
console.log(`   .github/workflows/auto-calver.yml`);
console.log(`   docs/guides/VERSION_AUTOMATION_QUICK_REF.md`);
