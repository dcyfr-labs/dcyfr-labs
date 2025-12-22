#!/usr/bin/env node
/**
 * Developer Pre-flight Check Script
 *
 * Runs all quality checks locally before pushing to avoid CI failures.
 * Simulates what CI will run (lint, typecheck, tests, etc.)
 *
 * Usage:
 *   npm run dev:check          # Run all checks
 *   npm run dev:check --fast   # Skip slow tests
 *   npm run dev:check --fix    # Auto-fix issues where possible
 */

import { spawn } from 'child_process'
import { parseArgs } from 'util'

const args = parseArgs({
  options: {
    fast: { type: 'boolean', default: false },
    fix: { type: 'boolean', default: false },
    verbose: { type: 'boolean', default: false },
  },
  allowPositionals: true,
})

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const results = []
let totalDuration = 0

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

function logHeader(message) {
  console.log('\n' + '━'.repeat(60))
  log(message, 'bright')
  console.log('━'.repeat(60))
}

function logResult(name, passed, duration) {
  const icon = passed ? '✅' : '❌'
  const color = passed ? 'green' : 'red'
  const durationText = duration ? ` (${duration}ms)` : ''
  log(`${icon} ${name}${durationText}`, color)
}

async function runCommand(command, args = [], options = {}) {
  const startTime = Date.now()

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: args.verbose ? 'inherit' : 'pipe',
      shell: true,
      ...options,
    })

    let stdout = ''
    let stderr = ''

    if (!args.verbose) {
      child.stdout?.on('data', (data) => (stdout += data))
      child.stderr?.on('data', (data) => (stderr += data))
    }

    child.on('close', (code) => {
      const duration = Date.now() - startTime
      const passed = code === 0

      if (!passed && !args.verbose && (stdout || stderr)) {
        console.log(stdout)
        console.error(stderr)
      }

      resolve({ passed, duration, stdout, stderr })
    })
  })
}

async function runCheck(name, command, args = [], options = {}) {
  log(`\n🔍 Running ${name}...`, 'cyan')

  const result = await runCommand(command, args, options)

  results.push({ name, ...result })
  totalDuration += result.duration

  logResult(name, result.passed, result.duration)

  return result.passed
}

async function main() {
  const startTime = Date.now()

  logHeader('🚀 Developer Pre-flight Checks')
  console.log(`Mode: ${args.values.fast ? 'Fast' : 'Full'} | Fix: ${args.values.fix ? 'Yes' : 'No'}`)

  // Step 1: PII Scan
  await runCheck('PII/PI Scan', 'npm', ['run', 'scan:pi'])

  // Step 2: Lint (with auto-fix if requested)
  if (args.values.fix) {
    await runCheck('ESLint (auto-fix)', 'npm', ['run', 'lint:fix'])
  } else {
    await runCheck('ESLint', 'npm', ['run', 'lint'])
  }

  // Step 3: TypeScript
  await runCheck('TypeScript', 'npm', ['run', 'typecheck'])

  // Step 4: Unit Tests
  if (!args.values.fast) {
    await runCheck('Unit Tests', 'npm', ['run', 'test:unit'])
  } else {
    log('\n⏩ Skipping unit tests (--fast mode)', 'yellow')
  }

  // Step 5: Build
  await runCheck('Production Build', 'npm', ['run', 'build'])

  // Step 6: Bundle Size Check
  if (!args.values.fast) {
    await runCheck('Bundle Size Check', 'npm', ['run', 'perf:check'])
  }

  // Step 7: Design Token Validation (if available)
  try {
    await runCheck('Design Token Validation', 'node', [
      'scripts/validation/validate-design-tokens.mjs',
    ])
  } catch {
    log('⚠️  Design token validation script not found, skipping', 'yellow')
  }

  // Summary
  const endTime = Date.now()
  const totalTime = ((endTime - startTime) / 1000).toFixed(2)

  logHeader('📊 Summary')

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length

  results.forEach((r) => logResult(r.name, r.passed))

  console.log('\n' + '─'.repeat(60))
  log(`Total: ${passed}/${total} passed, ${failed} failed`, failed === 0 ? 'green' : 'red')
  log(`Duration: ${totalTime}s`, 'cyan')

  if (failed === 0) {
    logHeader('🎉 All checks passed! Ready to push.')
    process.exit(0)
  } else {
    logHeader('❌ Some checks failed. Fix issues before pushing.')

    if (!args.values.fix) {
      log('\n💡 Tip: Run with --fix to auto-fix some issues:', 'yellow')
      log('   npm run dev:check -- --fix', 'yellow')
    }

    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
