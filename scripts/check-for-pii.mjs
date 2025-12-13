#!/usr/bin/env node
/*
 * check-for-pii.mjs
 * Simple scanner for likely PII and PI in staged or all files
 */
import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const scanAll = args.includes("--all");

function getStagedFiles() {
  try {
    const out = execSync("git diff --name-only --cached --diff-filter=ACM", {
      encoding: "utf8",
    });
    return out.split("\n").filter(Boolean);
  } catch (err) {
    return [];
  }
}

function getRepoFiles() {
  try {
    const out = execSync("git ls-files", { encoding: "utf8" });
    return out.split("\n").filter(Boolean);
  } catch (err) {
    return [];
  }
}

function isTextFile(filePath) {
  // Very simple filter: check extensions
  const ext = path.extname(filePath).toLowerCase();
  const textExt = new Set([
    ".md",
    ".mdx",
    ".txt",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".yml",
    ".yaml",
    ".html",
    ".css",
  ]);
  return textExt.has(ext);
}

function shouldScanForContentPatterns(filePath) {
  // only scan docs and content for email/phone/SSN to reduce false positives in code/tests
  const isDoc = filePath.startsWith("docs/") || filePath.startsWith("src/content/") || filePath.startsWith("public/");
  const ext = path.extname(filePath).toLowerCase();
  const docExts = new Set([".md", ".mdx", ".txt", ".json", ".yml", ".yaml"]);
  return isDoc || docExts.has(ext);
}

function loadAllowlist() {
  const allowlistPath = path.join(__dirname, '..', '.pii-allowlist.json');
  try {
    const raw = fs.readFileSync(allowlistPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { emailDomains: [], emails: [], paths: [] };
  }
}

const allowlist = loadAllowlist();

function isPathAllowed(file) {
  try {
    for (const p of allowlist.paths || []) {
      const prefix = p.replace('/**', '');
      if (file.startsWith(prefix)) return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

function isInAllowlist(file, list) {
  try {
    for (const p of list || []) {
      const prefix = p.replace('/**', '');
      if (file.startsWith(prefix)) return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

function getAllowlistReason(file) {
  try {
    const reasons = allowlist.allowlistReasons || {};
    if (reasons[file]) return reasons[file];
    // Try path-prefix matching
    for (const key of Object.keys(reasons)) {
      if (file.startsWith(key)) return reasons[key];
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function scanContent(file, content, results, isPrScan, isContentFile) {
  // Remove code fences and inline code to avoid false positives from chunk names, code snippets, and example outputs
  let cleanedContent = content.replace(/```[\s\S]*?```/g, '');
  cleanedContent = cleanedContent.replace(/`[^`]*`/g, '');
  // Remove URLs to avoid matching ISBNs, ASINs, or product IDs inside links
  cleanedContent = cleanedContent.replace(/https?:\/\/\S+/g, '');
  const tests = [
    // ============================================================================
    // PII PATTERNS (Personally Identifiable Information)
    // ============================================================================
    {
      name: "email",
      classification: 'PII',
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      message: "email address",
    },
    {
      name: "ssn",
      classification: 'PII',
      regex: /\b\d{3}-\d{2}-\d{4}\b/g,
      message: "SSN-like pattern",
    },
    {
      name: "phone",
      classification: 'PII',
      // More conservative phone pattern (US-centric) to reduce false positives
      // This pattern prefers phone numbers with separators (space, dot, dash) or parentheses
      // and reduces matching long epoch timestamps (digits-only large numbers)
      regex: /(?:\+?\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g,
      message: "phone number pattern (conservative match)",
    },
    {
      name: "ip_logging",
      classification: 'PII',
      // Detects console logging of IP addresses (PII under GDPR/CCPA)
      // Matches patterns like: console.log(`IP: ${clientIp}`) or console.error("IP:", ip)
      // Uses word boundaries to avoid false positives (e.g., "skipped" contains "ip")
      regex: /console\.(log|error|warn|info|debug)\([^)]*\$\{[^}]*\b(clientIp|ipAddress|ip|realIp|forwardedIp|remoteIp)\b/gi,
      message: "potential IP address logging in console statement (PII under GDPR/CCPA)",
      codeOnly: true, // Only check in code files, not docs
    },
    
    // ============================================================================
    // PI PATTERNS (Proprietary Information) - Credentials & Secrets
    // ============================================================================
    {
      name: "aws_key",
      classification: 'PI',
      regex: /AKIA[0-9A-Z]{16}/g,
      message: "AWS access key-like pattern",
    },
    {
      name: "private_key",
      classification: 'PI',
      regex: /-----BEGIN (RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g,
      message: "private key block",
    },
    {
      name: "jwt_token",
      classification: 'PI',
      // Matches JWT Bearer tokens: Bearer eyJ...
      // JWT format: 3 base64url-encoded parts separated by dots
      // eyJ is base64 for {"
      regex: /(?:Bearer|JWT)\s+eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi,
      message: "JWT (JSON Web Token) - bearer token",
    },
    {
      name: "oauth_token",
      classification: 'PI',
      // Matches OAuth 2.0 access/refresh tokens and API tokens
      // Looks for patterns like: access_token=..., refresh_token=..., token=...
      // Matches hex strings, base64, and URL-safe base64
      regex: /(?:access_token|refresh_token|oauth_token|api_token|token)\s*[=:]\s*["']?([a-zA-Z0-9._\-]{20,}|[a-f0-9]{32,})["']?/gi,
      message: "OAuth 2.0 token or API token assignment",
    },
    {
      name: "database_connection",
      classification: 'PI',
      // Matches database connection strings with embedded credentials
      // PostgreSQL: postgresql://user:pass@host:port/db
      // MongoDB: mongodb+srv://user:pass@cluster.mongodb.net/db
      // MySQL: mysql://user:pass@host:port/db
      // Redis: redis://:password@host:port
      regex: /(postgresql|mysql|mongodb\+srv|mongodb|redis|mariadb|cockroachdb):\/\/([a-zA-Z0-9._\-%]+:[a-zA-Z0-9._\-%$@!]+@|:([a-zA-Z0-9._\-%$@!]+)@)[a-zA-Z0-9._\-:]+\/[a-zA-Z0-9._\-]*/gi,
      message: "database connection string with credentials",
    },
    {
      name: "generic_api_key",
      classification: 'PI',
      // Matches generic API key patterns: api_key, apiKey, API_KEY assignments
      // Looks for hex strings (32+ chars), base64, or URL-safe patterns
      // Avoids false positives by requiring "api" keyword context
      regex: /(?:api_key|apiKey|API_KEY|api-key)\s*[=:]\s*["']?([a-zA-Z0-9._\-]{20,}|[a-f0-9]{32,}|sk-[a-zA-Z0-9]{20,})["']?/gi,
      message: "API key assignment",
    },
    
    // ============================================================================
    // PI PATTERNS (Proprietary Information) - Business Identifiers
    // ============================================================================
    {
      name: "customer_id",
      classification: 'PI',
      // Matches customer identifiers: CUST-123456, customer_id=12345678
      // Uses context detection to avoid false positives
      regex: /(?:customer[-_]?id|cust[-_]?(?:id|no)|customer[-_]?number)\s*[=:]\s*["']?([A-Z\d-]{4,20}|\d{6,})["']?/gi,
      message: "customer identifier (business data)",
    },
    {
      name: "order_number",
      classification: 'PI',
      // Matches order/transaction numbers: ORD-2024-001234, order_id=ABC123
      regex: /(?:order[-_]?(?:id|no|number)|order)\s*[=:]\s*["']?([A-Z]{2,4}-\d{4}-\d{4,}|[A-Z\d]{4,})["']?/gi,
      message: "order number or transaction identifier (business data)",
    },
    {
      name: "transaction_id",
      classification: 'PI',
      // Matches transaction identifiers: TXN-123456, transaction_id=xyz
      regex: /(?:transaction[-_]?(?:id|no)|txn[-_]?(?:id|no)|trans[-_]?(?:id|no))\s*[=:]\s*["']?([A-Z\d-]{4,20}|\d{6,})["']?/gi,
      message: "transaction identifier (business data)",
    },
    {
      name: "account_number",
      classification: 'PI',
      // Matches account numbers: acct=123456789, account_number=ACCT-123
      regex: /(?:account[-_]?(?:id|no|number)|acct(?:[-_]?(?:no|id))?)\s*[=:]\s*["']?([A-Z0-9]{4,20})["']?/gi,
      message: "account number or account identifier (business data)",
    },
  ];

  if (isPrScan) {
    tests.push({
      name: "proprietary",
      regex: /\b(PROPRIETARY|CONFIDENTIAL|PROPRIETARY INFORMATION|TRADE SECRET|DO NOT SHARE)\b/gi,
      message: "potential 'proprietary' or 'confidential' marker",
    });
  }

  for (const t of tests) {
    // Skip generic content patterns when not a content file (reduce false positives)
    if (!isContentFile && ["email", "ssn", "phone"].includes(t.name)) continue;

    // Skip code-only patterns when scanning content/docs files
    if (t.codeOnly && isContentFile) continue;

    // For IP logging detection, only scan code files (not docs/markdown)
    if (t.name === 'ip_logging') {
      const isCodeFile = /\.(ts|tsx|js|jsx)$/.test(file);
      if (!isCodeFile) continue;

      // Don't scan the original content for IP logging - use unprocessed content
      // to preserve template literals and console.log statements
      const matches = content.match(t.regex);
      if (matches && matches.length > 0) {
        // Filter out false positives from comments or documentation examples
        const filteredMatches = matches.filter(m => {
          // Allow if it's in a comment showing the WRONG way (educational)
          if (/\/\/\s*❌\s*WRONG/.test(content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m)))) {
            return false;
          }
          return true;
        });

        if (filteredMatches.length > 0) {
          const entry = {
            file,
            type: t.name,
            classification: t.classification || 'PII',
            message: t.message,
            matches: [...new Set(filteredMatches)].slice(0, 3) // Show up to 3 examples
          };
          results.push(entry);
        }
      }
      continue; // Skip normal processing for IP logging
    }

    let matches = cleanedContent.match(t.regex);
    // If this is the proprietary marker, only flag in sensitive areas (agents, AI docs, inngest)
    if (t.name === 'proprietary') {
      const sensitivePaths = ['.github/agents', 'docs/ai', 'src/inngest'];
      if (!sensitivePaths.some(p => file.startsWith(p))) {
        continue;
      }
      // If this file is explicitly allowlisted for proprietary markers, skip reporting
      if (isInAllowlist(file, allowlist.proprietaryPaths) || isInAllowlist(file, allowlist.piPaths)) {
        const reason = getAllowlistReason(file);
        if (reason) console.log(`Skipping proprietary check for ${file}: ${reason}`);
        continue;
      }
    }
    if (matches && matches.length > 0) {
      // Post-filter emails for allowlist domains and specific addresses to reduce noise
      if (t.name === 'email') {
        matches = matches.filter(m => {
          const lower = m.toLowerCase();
          // full email allowlist: exact email or substring match
          if (allowlist.emails && allowlist.emails.some(e => {
            const le = e.toLowerCase();
            if (le.includes('@')) return le === lower;
            return lower.includes(le);
          })) return false;
          // domain allowlist
          const parts = m.split('@');
          if (parts.length === 2) {
            const domain = parts[1].toLowerCase();
            if ((allowlist.emailDomains || []).some(d => domain.includes(d))) return false;
          }
          return true;
        });
      }
      if (t.name === 'phone') {
        // Filter out matches that are short or look like year numbers or epoch timestamps
        matches = matches.filter(m => {
          const digits = m.replace(/[^0-9]/g, '');
          // Require at least 7 digits
          if (digits.length < 7) return false;
          // If digits length is greater than 10 (likely epoch or long numeric), only keep if separators or parentheses present
          const hasSeparators = /[-.\s()]/.test(m);
          if (digits.length > 10 && !hasSeparators) return false;
          // If digits length == 10, check if this looks like a unix epoch in seconds (e.g., 169xxxxxxx)
          if (digits.length === 10) {
            const value = Number(digits);
            if (value >= 1600000000 && value <= 2000000000) return false; // skip epoch timestamps
          }
          // Common placeholder sequences like 1234567890 or repeating digits are not valid phones
          if (/^(1234567890|0123456789|0000000000|1111111111|2222222222|9999999999)$/.test(digits)) return false;
          return true;
        });
      }
      if (t.name === 'aws_key') {
        matches = matches.filter(m => m.length > 10);
      }
      if (t.name === 'private_key') {
        // If the private key example is explicitly labeled as an example or redacted, skip flagging
        // Look for nearby markers indicating placeholder/demo keys
        matches = matches.filter(m => {
          const surrounding = content.slice(Math.max(0, content.indexOf(m) - 100), content.indexOf(m) + m.length + 100);
          const isPlaceholder = /EXAMPLE|REDACTED|REPLACE|REPLACE_ME|DUMMY|YOUR_PRIVATE_KEY|PLACEHOLDER|\[REDACTED\]|YOUR_PRIVATE_KEY_EMAIL|YOUR KEY HERE|INSERT.*KEY/gi.test(surrounding);

          // If this file is in the privateKeyPaths allowlist, REQUIRE explicit markers
          // Documentation files should clearly mark examples as placeholders
          if (isInAllowlist(file, allowlist.privateKeyPaths)) {
            // For allowlisted docs, require explicit markers - no silent pass
            if (!isPlaceholder) {
              console.warn(`⚠️  Warning: Private key found in allowlisted doc ${file} without clear redaction markers`);
            }
            return !isPlaceholder; // Still filter if markers present, but warn if missing
          }

          return !isPlaceholder;
        });
        // If this path is an allowlisted place for examples, but a real private key exists without placeholder markers,
        // mark this as critical.
      }
      if (t.name === 'jwt_token') {
        // Filter JWT tokens: only flag if they look like real tokens (not examples)
        matches = matches.filter(m => {
          const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
          // Skip if marked as EXAMPLE or PLACEHOLDER
          if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY/i.test(surrounding)) return false;
          // Skip if it's in a comment explaining what JWT looks like
          if (/\/\/|--|\s*#/.test(surrounding.substring(0, surrounding.indexOf(m)))) return false;
          return true;
        });
      }
      if (t.name === 'oauth_token') {
        // Filter OAuth tokens: reduce false positives from docs/examples
        matches = matches.filter(m => {
          const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
          // Skip if marked as example or placeholder
          if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY|example\.com|localhost|placeholder/i.test(surrounding)) return false;
          // Skip if it's a short example (< 25 chars total) in documentation context
          if (isContentFile && m.length < 30) return false;
          return true;
        });
      }
      if (t.name === 'database_connection') {
        // Filter DB connection strings: only flag if they contain real credentials
        matches = matches.filter(m => {
          const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
          // Skip if it's an example connection string
          if (/example|placeholder|localhost|test|127\.0\.0\.1|docker|EXAMPLE|PLACEHOLDER|TEST|DUMMY/i.test(m)) return false;
          // Skip if marked as example in surrounding text
          if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST/i.test(surrounding)) return false;
          // Require actual hostname/port, not placeholders
          if (/\$|{|}|<|>|YOUR|REPLACE/i.test(m)) return false;
          return true;
        });
      }
      if (t.name === 'generic_api_key') {
        // Filter generic API keys: very strict to avoid false positives
        matches = matches.filter(m => {
          const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
          // Skip if marked as example or placeholder
          if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY/i.test(surrounding)) return false;
          // Skip test/development patterns
          if (/test|dev|example|placeholder|sk_test/i.test(m)) return false;
          // Require actual key-like content (32+ hex chars)
          const keyContent = m.match(/[a-f0-9]{32,}|[a-zA-Z0-9._\-]{40,}/);
          return keyContent !== null;
        });
      }
      // Business identifiers: filter based on context
      if (['customer_id', 'order_number', 'transaction_id', 'account_number'].includes(t.name)) {
        matches = matches.filter(m => {
          const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
          // Skip if marked as example or in allowlisted paths
          if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY|example\.com|placeholder/i.test(m)) return false;
          if (isInAllowlist(file, allowlist.piPaths)) return false; // Already allowlisted
          // Only flag if in code, not in documentation
          if (isContentFile && !file.includes('test')) return false;
          return true;
        });
      }
      if (matches.length === 0) continue;
      const classification = t.classification || 'PII';
      // Determine path allowlist check: PII vs PI
      const isPiiAllowed = isInAllowlist(file, allowlist.piiPaths) || isPathAllowed(file);
      const isPiAllowed = isInAllowlist(file, allowlist.piPaths) || isInAllowlist(file, allowlist.proprietaryPaths);
      // If file is in allowed path and this is a non-critical match, skip reporting
      if (classification === 'PII' && isPiiAllowed && !['private_key', 'aws_key', 'proprietary'].includes(t.name)) continue;
      if (classification === 'PI' && isPiAllowed && !(['private_key', 'aws_key'].includes(t.name))) continue;
      const entry = { file, type: t.name, classification: classification, message: t.message, matches: [...new Set(matches)].slice(0, 5) };
      // Enhance message for private key in allowlisted 'privateKeyPaths'
      if (t.name === 'private_key' && isInAllowlist(file, allowlist.privateKeyPaths)) {
        const reason = getAllowlistReason(file);
        if (reason) entry.message = `${entry.message} (allowlisted path: ${reason})`; else entry.message = `${entry.message} (allowlisted path)`;
        entry.severity = 'critical';
      }
      results.push(entry);
    }
  }
}

async function main() {
  const files = scanAll ? getRepoFiles() : getStagedFiles();
  if (!files || files.length === 0) {
    console.log(scanAll ? "No files in repo to scan." : "No staged files to scan.");
    process.exit(0);
  }

  const results = [];
  for (const file of files) {
    if (!isTextFile(file)) continue;
    if (file.startsWith("node_modules/") || file.startsWith(".next/") || file.startsWith("build/") || file.startsWith(".git/") ) continue;
    try {
      const content = fs.readFileSync(file, "utf8");
      const isContentFile = shouldScanForContentPatterns(file);
      scanContent(file, content, results, scanAll, isContentFile);
    } catch (err) {
      // ignore unreadable files
    }
  }

  if (results.length > 0) {
    console.error("PII/PI scan detected potential sensitive content:");
    console.error("------------------------------------------------");
    for (const r of results) {
      console.error(`File: ${r.file}`);
      console.error(`  Type: ${r.message}` + (r.severity ? ` [severity: ${r.severity}]` : ""));
      console.error(`  Examples: ${r.matches.map((m) => `${m}`).join(", ")}`);
      console.error("");
    }
    console.error("If this content is expected, move files to a secure location or add a rationale.");
    process.exit(1);
  }

  console.log("PII/PI scan completed: no likely sensitive content detected.");
  process.exit(0);
}

main();
