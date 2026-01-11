#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = process.cwd();
const reportsDir = path.join(root, "reports");
if (!fs.existsSync(reportsDir)) {
  console.log("No reports directory found - nothing to scan.");
  process.exit(0);
}

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const apiKeyRegex =
  /(?:api[_-]?key|apikey|secret|token)["']?[:=\s]{1,}["']?[A-Za-z0-9_\-]{16,}/i;
const privKeyRegex =
  /-----BEGIN (RSA |EC |OPENSSH |PRIVATE )?PRIVATE KEY-----/i;
const allowedEmailDomains = new Set(["dcyfr.dev"]);

let found = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const emailMatches = Array.from(content.matchAll(emailRegex));
  for (const match of emailMatches) {
    const email = match[0];
    const parts = email.split("@");
    const domain = parts[1]?.toLowerCase();
    if (!domain || allowedEmailDomains.has(domain)) {
      continue;
    }
    found.push({ file: filePath, type: "email" });
    break;
  }
  if (apiKeyRegex.test(content))
    found.push({ file: filePath, type: "api-key" });
  if (privKeyRegex.test(content))
    found.push({ file: filePath, type: "private-key" });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (stat.isFile()) {
      const ext = path.extname(full).toLowerCase();
      // Only scan text-like files to reduce false positives on binaries
      if ([".html", ".json", ".txt", ".log", ".md"].includes(ext)) {
        scanFile(full);
      }
    }
  }
}

walk(reportsDir);

if (found.length > 0) {
  console.error("Potential PII found in reports:");
  for (const f of found) console.error(` - ${f.type}: ${f.file}`);
  process.exit(1);
}

console.log("No obvious PII found in reports (text files scanned).");
process.exit(0);
