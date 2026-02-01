#!/usr/bin/env node
/**
 * @file deps-tree.mjs
 * @description Visualize dependency tree for a package
 * @usage npm run deps:tree [package-name]
 */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let execaSync;

try {
  ({ execaSync } = require('execa'));
} catch (error) {
  console.error("❌ The 'execa' package is required to run this script.");
  console.error('   Please install it with: npm install execa');
  process.exit(1);
}
const packageName = process.argv[2];

try {
  console.log('\n📦 Dependency Tree\n');

  if (packageName) {
    // Validate package name to prevent command injection
    // npm package names can only contain alphanumeric, dash, underscore, dot, @, and slash
    const validPackageNamePattern = /^[@a-z0-9][a-z0-9._/-]*$/i;

    if (!validPackageNamePattern.test(packageName)) {
      console.error(`❌ Invalid package name: ${packageName}`);
      console.error('Package names can only contain letters, numbers, and .-_@/');
      process.exit(1);
    }

    console.log(`Package: ${packageName}\n`);
    // FIX: CWE-78 - Use execa with array syntax to prevent command injection
    const { stdout: output } = execaSync('npm', ['ls', packageName, '--depth=3'], {
      encoding: 'utf-8',
      shell: false,
      reject: false, // Don't throw on non-zero exit (npm ls returns 1 if peer deps missing)
    });
    console.log(output);
  } else {
    console.log('Top-level dependencies:\n');
    // FIX: CWE-78 - Use execa with array syntax to prevent command injection
    const { stdout: output } = execaSync('npm', ['ls', '--depth=0'], {
      encoding: 'utf-8',
      shell: false,
      reject: false, // Don't throw on non-zero exit
    });
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
