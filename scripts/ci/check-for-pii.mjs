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
    const out = execSync("git diff --name-only --cached --diff-filter=ACM", { // NOSONAR - Administrative script, inputs from controlled sources
      encoding: "utf8",
    });
    return out.split("\n").filter(Boolean);
  } catch (err) {
    return [];
  }
}

function getRepoFiles() {
  try {
    const out = execSync("git ls-files", { encoding: "utf8" }); // NOSONAR - Administrative script, inputs from controlled sources
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

function filterEmailMatches(matches, allowlist) {
  return matches.filter(m => {
    const lower = m.toLowerCase();
    if (allowlist.emails && allowlist.emails.some(e => {
      const le = e.toLowerCase();
      return le.includes('@') ? le === lower : lower.includes(le);
    })) return false;
    const parts = m.split('@');
    if (parts.length === 2) {
      const domain = parts[1].toLowerCase();
      if ((allowlist.emailDomains || []).some(d => domain.includes(d))) return false;
    }
    return true;
  });
}

function filterPhoneMatches(matches) {
  return matches.filter(m => {
    const digits = m.replace(/[^0-9]/g, '');
    if (digits.length < 7) return false;
    const hasSeparators = /[-.\s()]/.test(m);
    if (digits.length > 10 && !hasSeparators) return false;
    if (digits.length === 10) {
      const value = Number(digits);
      if (value >= 1600000000 && value <= 2000000000) return false;
    }
    if (/^(1234567890|0123456789|0000000000|1111111111|2222222222|9999999999)$/.test(digits)) return false;
    return true;
  });
}

function filterPrivateKeyMatches(matches, file, content, allowlist) {
  return matches.filter(m => {
    const surrounding = content.slice(Math.max(0, content.indexOf(m) - 100), content.indexOf(m) + m.length + 100);
    const isPlaceholder = /EXAMPLE|REDACTED|REPLACE|REPLACE_ME|DUMMY|YOUR_PRIVATE_KEY|PLACEHOLDER|\[REDACTED\]|YOUR_PRIVATE_KEY_EMAIL|YOUR KEY HERE|INSERT.*KEY/gi.test(surrounding);
    if (isInAllowlist(file, allowlist.privateKeyPaths)) {
      if (!isPlaceholder) console.warn(`⚠️  Warning: Private key found in allowlisted doc ${file} without clear redaction markers`);
      return !isPlaceholder;
    }
    return !isPlaceholder;
  });
}

function filterJwtMatches(matches, content) {
  return matches.filter(m => {
    const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
    if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY/i.test(surrounding)) return false;
    if (/\/\/|--|\s*#/.test(surrounding.substring(0, surrounding.indexOf(m)))) return false;
    return true;
  });
}

function filterOauthMatches(matches, isContentFile, content) {
  return matches.filter(m => {
    const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
    if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY|example\.com|localhost|placeholder/i.test(surrounding)) return false;
    if (isContentFile && m.length < 30) return false;
    return true;
  });
}

function filterDatabaseMatches(matches, content) {
  return matches.filter(m => {
    const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
    if (/example|placeholder|localhost|test|127\.0\.0\.1|docker|EXAMPLE|PLACEHOLDER|TEST|DUMMY/i.test(m)) return false;
    if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST/i.test(surrounding)) return false;
    if (/\$|{|}|<|>|YOUR|REPLACE/i.test(m)) return false;
    return true;
  });
}

function filterApiKeyMatches(matches, content) {
  return matches.filter(m => {
    const surrounding = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m) + m.length + 50);
    if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY/i.test(surrounding)) return false;
    if (/test|dev|example|placeholder|sk_test/i.test(m)) return false;
    return /[a-f0-9]{32,}|[a-zA-Z0-9._\-]{40,}/.test(m);
  });
}

function filterBusinessIdMatches(matches, file, isContentFile, content, allowlist) {
  return matches.filter(m => {
    if (/EXAMPLE|PLACEHOLDER|REDACTED|FAKE|MOCK|TEST|DUMMY|example\.com|placeholder/i.test(m)) return false;
    if (isInAllowlist(file, allowlist.piPaths)) return false;
    if (isContentFile && !file.includes('test')) return false;
    return true;
  });
}

function applyMatchFilters(t, matches, file, content, isContentFile, allowlist) {
  if (t.name === 'email') return filterEmailMatches(matches, allowlist);
  if (t.name === 'phone') return filterPhoneMatches(matches);
  if (t.name === 'aws_key') return matches.filter(m => m.length > 10);
  if (t.name === 'private_key') return filterPrivateKeyMatches(matches, file, content, allowlist);
  if (t.name === 'jwt_token') return filterJwtMatches(matches, content);
  if (t.name === 'oauth_token') return filterOauthMatches(matches, isContentFile, content);
  if (t.name === 'database_connection') return filterDatabaseMatches(matches, content);
  if (t.name === 'generic_api_key') return filterApiKeyMatches(matches, content);
  if (['customer_id', 'order_number', 'transaction_id', 'account_number'].includes(t.name)) {
    return filterBusinessIdMatches(matches, file, isContentFile, content, allowlist);
  }
  return matches;
}

function scanIpLogging(t, file, content, results) {
  const matches = content.match(t.regex);
  if (!matches || matches.length === 0) return;
  const filteredMatches = matches.filter(m => {
    const ctx = content.slice(Math.max(0, content.indexOf(m) - 50), content.indexOf(m));
    return !/\/\/\s*❌\s*WRONG/.test(ctx);
  });
  if (filteredMatches.length > 0) {
    results.push({
      file, type: t.name, classification: t.classification || 'PII', message: t.message,
      matches: [...new Set(filteredMatches)].slice(0, 3),
    });
  }
}

function buildResultEntry(t, file, matches, allowlist) {
  const entry = {
    file, type: t.name, classification: t.classification || 'PII', message: t.message,
    matches: [...new Set(matches)].slice(0, 5),
  };
  if (t.name === 'private_key' && isInAllowlist(file, allowlist.privateKeyPaths)) {
    const reason = getAllowlistReason(file);
    entry.message = `${entry.message} (allowlisted path${reason ? `: ${reason}` : ''})`;
    entry.severity = 'critical';
  }
  return entry;
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
      // MongoDB: mongodb+srv://user:pass@cluster.mongodb.net/db pragma: allowlist secret
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
      if (isCodeFile) scanIpLogging(t, file, content, results);
      continue;
    }

    let matches = cleanedContent.match(t.regex);
    // If this is the proprietary marker, only flag in sensitive areas (agents, AI docs, inngest)
    if (t.name === 'proprietary') {
      const sensitivePaths = ['.github/agents', 'docs/ai', 'src/inngest'];
      if (!sensitivePaths.some(p => file.startsWith(p))) continue;
      if (isInAllowlist(file, allowlist.proprietaryPaths) || isInAllowlist(file, allowlist.piPaths)) {
        const reason = getAllowlistReason(file);
        if (reason) console.log(`Skipping proprietary check for ${file}: ${reason}`);
        continue;
      }
    }

    if (!matches || matches.length === 0) continue;

    matches = applyMatchFilters(t, matches, file, content, isContentFile, allowlist);
    if (matches.length === 0) continue;

    const classification = t.classification || 'PII';
    const isPiiAllowed = isInAllowlist(file, allowlist.piiPaths) || isPathAllowed(file);
    const isPiAllowed = isInAllowlist(file, allowlist.piPaths) || isInAllowlist(file, allowlist.proprietaryPaths);
    if (classification === 'PII' && isPiiAllowed && !['private_key', 'aws_key', 'proprietary'].includes(t.name)) continue;
    if (classification === 'PI' && isPiAllowed && !['private_key', 'aws_key'].includes(t.name)) continue;

    results.push(buildResultEntry(t, file, matches, allowlist));
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
      console.error(`  Examples: ${r.matches.map((m) => String(m)).join(", ")}`);
      console.error("");
    }
    console.error("If this content is expected, move files to a secure location or add a rationale.");
    process.exit(1);
  }

  console.log("PII/PI scan completed: no likely sensitive content detected.");
  process.exit(0);
}

main();
