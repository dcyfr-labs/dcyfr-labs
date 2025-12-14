// parse-gitleaks-report.test.mjs
// Unit tests for the gitleaks parser script
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Test data directory
const testDataDir = path.join(process.cwd(), 'scripts/__tests__/fixtures/gitleaks');

describe('parse-gitleaks-report.mjs', () => {
  const parserScript = path.join(process.cwd(), 'scripts/ci/parse-gitleaks-report.mjs');
  
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
      const output = execSync(`node "${parserScript}" "${reportFile}"`, { 
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

  describe('Allowlist Classification', () => {
    it('should filter allowlisted findings with placeholder reason', () => {
      const reportFile = path.join(testDataDir, 'allowlist-placeholder.json');
      const allowlistFile = path.join(process.cwd(), '.pii-allowlist.json');
      
      const allowlist = {
        "privateKeyPaths": ["docs/setup/"],
        "allowlistReasons": {
          "docs/setup/": "PLACEHOLDER examples for setup guide"
        }
      };
      fs.writeFileSync(allowlistFile, JSON.stringify(allowlist, null, 2));

      const report = [
        {
          "rule": "Private Key",
          "file": "docs/setup/example.md",
          "line": 45,
          "description": "Private Key in documentation"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Gitleaks: no critical secrets found');

      if (fs.existsSync(allowlistFile)) {
        fs.unlinkSync(allowlistFile);
      }
    });

    it('should not filter if reason does not contain placeholder markers', () => {
      const reportFile = path.join(testDataDir, 'allowlist-no-placeholder.json');
      const allowlistFile = path.join(process.cwd(), '.pii-allowlist.json');
      
      const allowlist = {
        "privateKeyPaths": ["docs/setup/"],
        "allowlistReasons": {
          "docs/setup/": "Documentation with security notes"
        }
      };
      fs.writeFileSync(allowlistFile, JSON.stringify(allowlist, null, 2));

      const report = [
        {
          "rule": "Private Key",
          "file": "docs/setup/real.md",
          "line": 45,
          "description": "Private Key in documentation"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('Gitleaks: 1 critical secrets found');

      if (fs.existsSync(allowlistFile)) {
        fs.unlinkSync(allowlistFile);
      }
    });

    it('should recognize multiple placeholder markers (EXAMPLE, REDACTED, DUMMY)', () => {
      const reportFile = path.join(testDataDir, 'allowlist-multiple-markers.json');
      const allowlistFile = path.join(process.cwd(), '.pii-allowlist.json');
      
      const allowlist = {
        "privateKeyPaths": ["docs/examples/"],
        "allowlistReasons": {
          "docs/examples/": "EXAMPLE and REDACTED credentials"
        }
      };
      fs.writeFileSync(allowlistFile, JSON.stringify(allowlist, null, 2));

      const report = [
        {
          "rule": "AWS Access Key",
          "file": "docs/examples/aws.md",
          "line": 10,
          "description": "AWS Access Key"
        },
        {
          "rule": "API Key",
          "file": "docs/examples/api.md",
          "line": 25,
          "description": "API Key"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(0);

      if (fs.existsSync(allowlistFile)) {
        fs.unlinkSync(allowlistFile);
      }
    });
  });

  describe('Blocklist Pattern Matching', () => {
    it('should block findings with AWS in rule name', () => {
      const reportFile = path.join(testDataDir, 'blocklist-aws.json');
      const report = [
        {
          "rule": "AWS Access Key",
          "file": "config.env",
          "line": 5,
          "description": "Found credentials"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('AWS Access Key');
    });

    it('should block findings with AKIA in description', () => {
      const reportFile = path.join(testDataDir, 'blocklist-akia.json');
      const report = [
        {
          "rule": "Generic Secret",
          "file": "env.js",
          "line": 10,
          "description": "AKIA pattern detected in credentials"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
    });

    it('should block findings with Private Key variations', () => {
      const variations = [
        { rule: "Private Key", description: "Private key" },
        { rule: "RSA Key", description: "RSA Private Key Found" },
        { rule: "Key Detector", description: "ENCRYPTED PRIVATE KEY" },
        { rule: "SSH Key", description: "SSH PRIVATE KEY block" }
      ];

      variations.forEach((variation, index) => {
        const reportFile = path.join(testDataDir, `blocklist-private-key-${index}.json`);
        const report = [variation];
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        const result = runParser(reportFile);
        
        expect(result.exitCode).toBe(3);
      });
    });

    it('should block findings with SECRET in tags', () => {
      const reportFile = path.join(testDataDir, 'blocklist-secret-tag.json');
      const report = [
        {
          "rule": "Credential Detector",
          "file": "config.yml",
          "line": 15,
          "description": "Found configuration",
          "tags": ["SECRET", "credentials"]
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
    });

    it('should block findings with API Key in rule', () => {
      const reportFile = path.join(testDataDir, 'blocklist-api-key.json');
      const report = [
        {
          "rule": "Generic API Key",
          "file": "src/config.ts",
          "line": 42,
          "description": "API credentials detected"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
    });

    it('should not block findings without blocklisted keywords', () => {
      const reportFile = path.join(testDataDir, 'blocklist-none.json');
      const report = [
        {
          "rule": "Entropy Check",
          "file": "random.txt",
          "line": 8,
          "description": "High entropy string detected"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Gitleaks: no critical secrets found');
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle null or undefined fields gracefully', () => {
      const reportFile = path.join(testDataDir, 'edge-null-fields.json');
      const report = [
        {
          "rule": null,
          "file": "config.env",
          "line": 5,
          "description": null,
          "tags": null
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      // Should not crash; exit code depends on implementation
      expect([0, 3]).toContain(result.exitCode);
    });

    it('should handle missing required fields', () => {
      const reportFile = path.join(testDataDir, 'edge-missing-fields.json');
      const report = [
        {
          "rule": "Private Key"
          // Missing file and description
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      // Should not crash
      expect([0, 2, 3]).toContain(result.exitCode);
    });

    it('should handle empty tags array', () => {
      const reportFile = path.join(testDataDir, 'edge-empty-tags.json');
      const report = [
        {
          "rule": "Credential Detector",
          "file": "config.env",
          "line": 5,
          "description": "Found credentials",
          "tags": []
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      // Should handle gracefully
      expect([0, 2, 3]).toContain(result.exitCode);
    });

    it('should handle very large findings arrays', () => {
      const reportFile = path.join(testDataDir, 'edge-large-array.json');
      const report = Array.from({ length: 1000 }, (_, i) => ({
        "rule": i % 10 === 0 ? "Private Key" : "Generic Email",
        "file": `file${i}.txt`,
        "line": i,
        "description": "Found something"
      }));
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      // Should process without memory issues
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('Gitleaks:');
    });

    it('should handle findings with special characters in filenames', () => {
      const reportFile = path.join(testDataDir, 'edge-special-chars.json');
      const report = [
        {
          "rule": "AWS Access Key",
          "file": "config/[prod]-secrets.env",
          "line": 5,
          "description": "AWS key found"
        },
        {
          "rule": "API Key",
          "file": "src/utils/(legacy)/api.js",
          "line": 20,
          "description": "API key found"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('[prod]-secrets.env');
      expect(result.error).toContain('(legacy)/api.js');
    });

    it('should handle findings with multi-line descriptions', () => {
      const reportFile = path.join(testDataDir, 'edge-multiline-desc.json');
      const report = [
        {
          "rule": "Private Key",
          "file": "certs/server.key",
          "line": 1,
          "description": "Private key found\nContext: RSA Key\nSeverity: Critical"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('Private Key');
    });

    it('should handle allowlist file that does not exist', () => {
      const reportFile = path.join(testDataDir, 'edge-no-allowlist.json');
      const report = [
        {
          "rule": "Generic Email",
          "file": "src/contact.ts",
          "line": 10,
          "description": "Email detected"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      // Rename/remove allowlist if it exists
      const allowlistFile = path.join(process.cwd(), '.pii-allowlist.json');
      const backupFile = allowlistFile + '.bak';
      if (fs.existsSync(allowlistFile)) {
        fs.renameSync(allowlistFile, backupFile);
      }

      try {
        const result = runParser(reportFile);
        
        expect(result.exitCode).toBe(0); // Non-critical, so should pass
      } finally {
        if (fs.existsSync(backupFile)) {
          fs.renameSync(backupFile, allowlistFile);
        }
      }
    });
  });

  describe('Integration Tests', () => {
    it('should process real-world gitleaks output format', () => {
      const reportFile = path.join(testDataDir, 'real-world-output.json');
      const report = [
        {
          "Description": "AWS Access Key",
          "StartLine": 12,
          "EndLine": 12,
          "StartColumn": 18,
          "EndColumn": 54,
          "Match": "AKIAIOSFODNN7EXAMPLE",
          "Secret": "AKIAIOSFODNN7EXAMPLE",
          "File": "config/.env.production",
          "SymbolName": "",
          "Entropy": 3.8,
          "Author": "Developer",
          "Date": "2024-01-15T10:30:00Z",
          "Message": "Add production config",
          "Tags": [],
          "RuleID": "aws-access-key",
          "Verified": false,
          "Fingerprint": "aws-access-key:config/.env.production:AKIAIOSFODNN7EXAMPLE",
          // Handle both 'rule' and 'Rule' fields
          "rule": "AWS Access Key ID"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('AWS');
    });

    it('should generate clear output message for CI logs', () => {
      const reportFile = path.join(testDataDir, 'ci-format.json');
      const report = [
        {
          "rule": "AWS Access Key",
          "file": "terraform/main.tf",
          "line": 42,
          "description": "AWS credentials found"
        },
        {
          "rule": "API Key",
          "file": "src/api-config.js",
          "line": 15,
          "description": "API token"
        }
      ];
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

      const result = runParser(reportFile);
      
      expect(result.exitCode).toBe(3);
      expect(result.error).toContain('Gitleaks: 2 critical secrets found');
      expect(result.error).toContain('AWS Access Key in terraform/main.tf (line 42)');
      expect(result.error).toContain('API Key in src/api-config.js (line 15)');
    });

    it('should exit with appropriate code for CI to stop deployment', () => {
      const reportFile = path.join(testDataDir, 'ci-exit-code.json');
      
      // Clean pass - no findings
      fs.writeFileSync(reportFile, '[]');
      let result = runParser(reportFile);
      expect(result.exitCode).toBe(0);

      // Non-critical only
      fs.writeFileSync(reportFile, JSON.stringify([
        { "rule": "Generic Email", "file": "README.md", "line": 5 }
      ], null, 2));
      result = runParser(reportFile);
      expect(result.exitCode).toBe(0);

      // Critical findings - should prevent deployment
      fs.writeFileSync(reportFile, JSON.stringify([
        { "rule": "AWS Access Key", "file": "env.js", "line": 8 }
      ], null, 2));
      result = runParser(reportFile);
      expect(result.exitCode).toBe(3);
    });
  });
});