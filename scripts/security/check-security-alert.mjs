#!/usr/bin/env node

/**
 * Check GitHub Code Scanning Alert Status
 *
 * Usage:
 *   node scripts/check-security-alert.mjs <alert-url-or-number>
 *
 * Examples:
 *   node scripts/check-security-alert.mjs 2
 *   node scripts/check-security-alert.mjs https://github.com/dcyfr/dcyfr-labs/security/code-scanning/2
 */

import { execSync } from "child_process";

const DEFAULT_OWNER = "dcyfr";
const DEFAULT_REPO = "dcyfr-labs";

function parseInput(input) {
	// Check if input is a URL
	const urlMatch = input.match(
		/github\.com\/([^\/]+)\/([^\/]+)\/security\/code-scanning\/(\d+)/
	);
	if (urlMatch) {
		return {
			owner: urlMatch[1],
			repo: urlMatch[2],
			alertNumber: urlMatch[3],
		};
	}

	// Otherwise treat as alert number
	if (/^\d+$/.test(input)) {
		return {
			owner: DEFAULT_OWNER,
			repo: DEFAULT_REPO,
			alertNumber: input,
		};
	}

	throw new Error(
		"Invalid input. Provide an alert number or full GitHub security alert URL."
	);
}

function checkAlert(owner, repo, alertNumber) {
	try {
		// Validate inputs to prevent command injection
		if (!/^\d+$/.test(alertNumber)) {
			throw new Error('Alert number must be numeric');
		}
		if (!/^[\w-]+$/.test(owner)) {
			throw new Error('Invalid owner format (alphanumeric and hyphens only)');
		}
		if (!/^[\w-]+$/.test(repo)) {
			throw new Error('Invalid repo format (alphanumeric and hyphens only)');
		}

		console.log(
			`\n🔍 Checking alert #${alertNumber} in ${owner}/${repo}...\n`
		);

		const result = execSync( // NOSONAR - Administrative script, inputs from controlled sources
			`gh api /repos/${owner}/${repo}/code-scanning/alerts/${alertNumber}`,
			{ encoding: "utf-8" }
		);

		const alert = JSON.parse(result);

		console.log("📋 Alert Details:");
		console.log(`   Number: #${alert.number}`);
		console.log(`   State: ${alert.state}`);
		console.log(`   Rule: ${alert.rule.id}`);
		console.log(`   Severity: ${alert.rule.severity}`);
		console.log(`   Description: ${alert.rule.description}`);

		if (alert.dismissed_at) {
			console.log(`   Dismissed: ${alert.dismissed_at}`);
			console.log(`   Reason: ${alert.dismissed_reason}`);
			if (alert.dismissed_comment) {
				console.log(`   Comment: ${alert.dismissed_comment}`);
			}
		}

		if (alert.fixed_at) {
			console.log(`   Fixed: ${alert.fixed_at}`);
		}

		if (alert.most_recent_instance) {
			const loc = alert.most_recent_instance.location;
			console.log(
				`   Location: ${loc.path}:${loc.start_line}-${loc.end_line}`
			);
		}

		console.log(`\n   URL: ${alert.html_url}\n`);

		// Summary
		if (alert.state === "open") {
			console.log("⚠️  Alert is OPEN and needs attention");
			return 1;
		} else if (alert.state === "fixed") {
			console.log("✅ Alert has been FIXED");
			return 0;
		} else if (alert.state === "dismissed") {
			console.log(
				"🔕 Alert has been DISMISSED (reason: " +
					alert.dismissed_reason +
					")"
			);
			return 0;
		} else {
			console.log(`ℹ️  Alert state: ${alert.state}`);
			return 0;
		}
	} catch (error) {
		if (error.message.includes("404")) {
			console.log(
				`\n✅ Alert #${alertNumber} not found - likely resolved and deleted\n`
			);
			return 0;
		}

		console.error(`\n❌ Error checking alert: ${error.message}\n`);
		return 1;
	}
}

// Main execution
const input = process.argv[2];

if (!input) {
	console.error(`
Usage: node scripts/check-security-alert.mjs <alert-url-or-number>

Examples:
  node scripts/check-security-alert.mjs 2
  node scripts/check-security-alert.mjs https://github.com/dcyfr/dcyfr-labs/security/code-scanning/2
`);
	process.exit(1);
}

try {
	const { owner, repo, alertNumber } = parseInput(input);
	const exitCode = checkAlert(owner, repo, alertNumber);
	process.exit(exitCode);
} catch (error) {
	console.error(`\n❌ ${error.message}\n`);
	process.exit(1);
}
