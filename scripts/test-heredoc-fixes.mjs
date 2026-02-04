#!/usr/bin/env node

/**
 * Heredoc Buffer Overflow Test Suite
 * 
 * Tests that verify fixes for AI agent output hanging heredocs.
 * Ensures terminal output is properly buffered without hangs or crashes.
 * 
 * @see docs/audits/HEREDOC_BUFFER_OVERFLOW_ANALYSIS_2026-02-02.md
 * @see docs/guides/HEREDOC_BUFFER_FIX_MIGRATION.md
 */

import { spawnSync, spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpNameSync } from 'tmp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const tests = [];
let passed = 0;
let failed = 0;

// Test 1: Verify ai-cli.mjs has buffer config
function testAiCliBufferConfig() {
  const testName = 'ai-cli.mjs has maxBuffer configuration';
  try {
    const content = readFileSync(path.join(ROOT_DIR, 'dcyfr-labs/scripts/ai-cli.mjs'), 'utf-8');
    
    const hasMaxBuffer = content.includes('maxBuffer: 10 * 1024 * 1024');
    const hasStdioArray = content.includes("stdio: ['inherit', 'pipe', 'pipe']");
    
    if (hasMaxBuffer && hasStdioArray) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}`, 'red');
      log(`    - maxBuffer: ${hasMaxBuffer ? '✓' : '✗'}`, 'red');
      log(`    - stdio array: ${hasStdioArray ? '✓' : '✗'}`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Test 2: Verify session-cli.mjs has buffer config
function testSessionCliBufferConfig() {
  const testName = 'session-cli.mjs has maxBuffer configuration';
  try {
    const content = readFileSync(path.join(ROOT_DIR, 'dcyfr-labs/scripts/session-cli.mjs'), 'utf-8');
    
    const hasMaxBuffer = content.includes('maxBuffer: 5 * 1024 * 1024');
    const hasStdioArray = content.includes("stdio: ['inherit', 'pipe', 'pipe']");
    
    if (hasMaxBuffer && hasStdioArray) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Test 3: Verify process-output.mjs helper exists
function testProcessOutputHelper() {
  const testName = 'process-output.mjs helper exists and exports';
  try {
    const content = readFileSync(path.join(ROOT_DIR, 'dcyfr-labs/scripts/helpers/process-output.mjs'), 'utf-8');
    
    const hasSpawnWithBuffering = content.includes('export async function spawnWithBuffering');
    const hasStreamOutput = content.includes('export async function streamProcessOutput');
    const hasExecuteWithTimeout = content.includes('export async function executeWithTimeout');
    
    if (hasSpawnWithBuffering && hasStreamOutput && hasExecuteWithTimeout) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}`, 'red');
      log(`    - spawnWithBuffering: ${hasSpawnWithBuffering ? '✓' : '✗'}`, 'red');
      log(`    - streamProcessOutput: ${hasStreamOutput ? '✓' : '✗'}`, 'red');
      log(`    - executeWithTimeout: ${hasExecuteWithTimeout ? '✓' : '✗'}`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Test 4: Small output test
function testSmallOutput() {
  const testName = 'Small output (1KB) completes without hang';
  try {
    const result = spawnSync('node', ['-e', 'console.log("test".repeat(256))'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      maxBuffer: 1 * 1024 * 1024,
      timeout: 5000
    });
    
    if (result.status === 0 && !result.error) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}: ${result.error?.message || `exit code ${result.status}`}`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Test 5: Large output test (5MB)
function testLargeOutput() {
  const testName = 'Large output (5MB) completes without hang';
  try {
    const result = spawnSync('node', ['-e', 'console.log("x".repeat(5000000))'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,  // Allow 10MB
      timeout: 10000
    });
    
    if (result.status === 0 && !result.error) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}: ${result.error?.message || `exit code ${result.status}`}`, 'red');
      failed++;
    }
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Test 6: Buffer overflow detection
function testBufferOverflow() {
  const testName = 'Buffer overflow detected and handled gracefully';
  try {
    const result = spawnSync('node', ['-e', 'console.log("x".repeat(20000000))'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,  // Only 10MB
      timeout: 10000
    });
    
    // Should either fail gracefully or timeout
    if (result.error?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' || result.status !== 0) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}: Should have failed on overflow`, 'red');
      failed++;
    }
  } catch (error) {
    // Expected to fail
    if (error.message.includes('buffer')) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${testName}: ${error.message}`, 'red');
      failed++;
    }
  }
}

// Test 7: JSON parsing with buffer
function testJSONParsing() {
  const testName = 'JSON output with buffer works correctly';
  try {
    const jsonData = { users: Array(1000).fill({ id: 1, name: 'Test User' }) };
    const jsonString = JSON.stringify(jsonData);
    
    const result = spawnSync('node', ['-e', `console.log(${JSON.stringify(jsonString)})`], {
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024
    });
    
    const output = result.stdout.trim();
    JSON.parse(output);  // Verify it parses
    
    log(`  ✓ ${testName}`, 'green');
    passed++;
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Test 8: No regression - check files still syntactically valid
function testSyntaxValidation() {
  const testName = 'Updated scripts are syntactically valid';
  try {
    const scripts = [
      'dcyfr-labs/scripts/ai-cli.mjs',
      'dcyfr-labs/scripts/session-cli.mjs'
    ];
    
    let allValid = true;
    for (const script of scripts) {
      const result = spawnSync('node', ['--check', path.join(ROOT_DIR, script)], {
        timeout: 5000
      });
      
      if (result.status !== 0) {
        log(`    ✗ ${script}: Syntax error`, 'red');
        allValid = false;
      }
    }
    
    if (allValid) {
      log(`  ✓ ${testName}`, 'green');
      passed++;
    } else {
      failed++;
    }
  } catch (error) {
    log(`  ✗ ${testName}: ${error.message}`, 'red');
    failed++;
  }
}

// Main execution
async function main() {
  log('\n🧪 HEREDOC BUFFER OVERFLOW FIX TEST SUITE\n', 'cyan');
  log(`Repository: ${ROOT_DIR}`, 'blue');
  log(`Date: ${new Date().toISOString()}\n`, 'blue');
  
  log('Configuration Tests:', 'yellow');
  testAiCliBufferConfig();
  testSessionCliBufferConfig();
  testProcessOutputHelper();
  
  log('\nFunctional Tests:', 'yellow');
  testSmallOutput();
  testLargeOutput();
  testBufferOverflow();
  testJSONParsing();
  
  log('\nValidation Tests:', 'yellow');
  testSyntaxValidation();
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`RESULTS: ${passed} passed, ${failed} failed`, failed > 0 ? 'red' : 'green');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (failed > 0) {
    log('❌ Some tests failed. Review output above.', 'red');
    process.exit(1);
  } else {
    log('✅ All tests passed! Heredoc buffer fixes verified.', 'green');
    process.exit(0);
  }
}

main().catch((error) => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
