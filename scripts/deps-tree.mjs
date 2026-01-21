#!/usr/bin/env node
/**
 * @file deps-tree.mjs
 * @description Visualize dependency tree for a package
 * @usage npm run deps:tree [package-name]
 */

import { execSync } from 'child_process';

const packageName = process.argv[2];

try {
  console.log('\n📦 Dependency Tree\n');

  if (packageName) {
    console.log(`Package: ${packageName}\n`);
    // lgtm [js/command-line-injection] - Package name from npm script arguments, not user input
    const output = execSync(`npm ls ${packageName} --depth=3`, { encoding: 'utf-8' });
    console.log(output);
  } else {
    console.log('Top-level dependencies:\n');
    const output = execSync('npm ls --depth=0', { encoding: 'utf-8' });
    console.log(output);
  }

  console.log('\n💡 Commands:');
  console.log('   View specific package: npm run deps:tree <package-name>');
  console.log('   Full tree (slow): npm ls');
  console.log('   Production only: npm ls --production');
  console.log('   Check for updates: npm outdated\n');
} catch (error) {
  // npm ls exits with 1 if there are dependency issues, but still shows tree
  if (error.stdout) {
    console.log(error.stdout);
    console.log('\n⚠️  Some dependencies have issues (shown above)\n');
  } else {
    console.error('❌ Error:', error.message);
  }
}
