// parse-gitleaks-report.test.mjs
// Unit tests for the gitleaks parser script
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Test data directory
const testDataDir = path.join(process.cwd(), 'scripts/__tests__/fixtures/gitleaks');

describe('parse-gitleaks-report.mjs', () => {
  const parserScript = path.join(process.cwd(), 'scripts/parse-gitleaks-report.mjs');
  
  beforeEach(() => {
    // Ensure test data directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    const testFiles = ['empty-report.json', 'non-critical.json', 'critical-aws.json', 'allowlisted.json', 'multiple-critical.json'];
    testFiles.forEach(file => {
      const filePath = path.join(testDataDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  function runParser(reportFile) {
    try {
      const output = execSync(`node ${parserScript} ${reportFile}`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { exitCode: 0, output, error: null };
    } catch (error) {
      return { 
        exitCode: error.status, 
        output: error.stdout || '', 
        error: error.stderr || error.message 
      };
    }
  }

  it('should exit with code 0 for empty report', () => {
    const reportFile = path.join(testDataDir, 'empty-report.json');
    fs.writeFileSync(reportFile, '[]');

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Gitleaks: no findings');
  });

  it('should exit with code 0 for non-critical findings', () => {
    const reportFile = path.join(testDataDir, 'non-critical.json');
    const nonCriticalReport = [
      {
        "rule": "Generic Email",
        "file": "src/components/ContactForm.tsx",
        "line": 45,
        "description": "Email address detected"
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(nonCriticalReport, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Gitleaks: no critical secrets found');
  });

  it('should exit with code 3 for critical AWS key findings', () => {
    const reportFile = path.join(testDataDir, 'critical-aws.json');
    const criticalReport = [
      {
        "rule": "AWS Access Key",
        "file": "config/secrets.env",
        "line": 12,
        "description": "AWS Access Key detected",
        "tags": ["AWS", "key"]
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(criticalReport, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(3);
    expect(result.error).toContain('Gitleaks: 1 critical secrets found');
    expect(result.error).toContain('AWS Access Key in config/secrets.env');
  });

  it('should exit with code 3 for private key findings', () => {
    const reportFile = path.join(testDataDir, 'critical-private-key.json');
    const criticalReport = [
      {
        "rule": "RSA Private Key",
        "file": "certs/private.key",
        "line": 1,
        "description": "RSA Private Key detected"
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(criticalReport, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(3);
    expect(result.error).toContain('Gitleaks: 1 critical secrets found');
    expect(result.error).toContain('RSA Private Key in certs/private.key');
  });

  it('should exit with code 0 for allowlisted placeholders', () => {
    const reportFile = path.join(testDataDir, 'allowlisted.json');
    const allowlistFile = path.join(process.cwd(), '.pii-allowlist.json');
    
    // Create test allowlist
    const allowlist = {
      "privateKeyPaths": ["docs/examples/"],
      "allowlistReasons": {
        "docs/examples/": "PLACEHOLDER credentials for documentation examples"
      }
    };
    fs.writeFileSync(allowlistFile, JSON.stringify(allowlist, null, 2));

    const allowlistedReport = [
      {
        "rule": "AWS Access Key",
        "file": "docs/examples/api-config.md",
        "line": 15,
        "description": "AWS Access Key detected in documentation"
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(allowlistedReport, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Gitleaks: no critical secrets found');

    // Clean up test allowlist
    if (fs.existsSync(allowlistFile)) {
      fs.unlinkSync(allowlistFile);
    }
  });

  it('should exit with code 3 for multiple critical findings', () => {
    const reportFile = path.join(testDataDir, 'multiple-critical.json');
    const multipleReport = [
      {
        "rule": "AWS Access Key",
        "file": "config/aws.env",
        "line": 5,
        "description": "AWS Access Key detected"
      },
      {
        "rule": "Private Key",
        "file": "certs/server.key",
        "line": 1,
        "description": "Private Key detected"
      },
      {
        "rule": "API Key",
        "file": "src/utils/api.js",
        "line": 23,
        "description": "API Key detected"
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(multipleReport, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(3);
    expect(result.error).toContain('Gitleaks: 3 critical secrets found');
    expect(result.error).toContain('AWS Access Key in config/aws.env');
    expect(result.error).toContain('Private Key in certs/server.key');
    expect(result.error).toContain('API Key in src/utils/api.js');
  });

  it('should exit with code 2 for invalid JSON file', () => {
    const reportFile = path.join(testDataDir, 'invalid.json');
    fs.writeFileSync(reportFile, '{ invalid json }');

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('ERROR: Could not read or parse report');
  });

  it('should exit with code 2 for missing file', () => {
    const reportFile = path.join(testDataDir, 'nonexistent.json');

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('ERROR: Could not read or parse report');
  });

  it('should handle mixed critical and non-critical findings', () => {
    const reportFile = path.join(testDataDir, 'mixed-findings.json');
    const mixedReport = [
      {
        "rule": "Generic Email",
        "file": "src/components/ContactForm.tsx",
        "line": 45,
        "description": "Email address detected"
      },
      {
        "rule": "AWS Secret Access Key",
        "file": "config/production.env",
        "line": 8,
        "description": "AWS Secret Key detected"
      },
      {
        "rule": "Generic URL",
        "file": "README.md",
        "line": 25,
        "description": "URL detected"
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(mixedReport, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(3);
    expect(result.error).toContain('Gitleaks: 1 critical secrets found');
    expect(result.error).toContain('AWS Secret Access Key in config/production.env');
    // Should not mention non-critical findings
    expect(result.error).not.toContain('Generic Email');
    expect(result.error).not.toContain('Generic URL');
  });

  it('should handle findings without line numbers', () => {
    const reportFile = path.join(testDataDir, 'no-line-numbers.json');
    const reportWithoutLines = [
      {
        "rule": "API Key",
        "file": "config/api.conf",
        "description": "API Key detected"
        // No line property
      }
    ];
    fs.writeFileSync(reportFile, JSON.stringify(reportWithoutLines, null, 2));

    const result = runParser(reportFile);
    
    expect(result.exitCode).toBe(3);
    expect(result.error).toContain('API Key in config/api.conf (line n/a)');
  });
});