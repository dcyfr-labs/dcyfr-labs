#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

/**
 * Prune old Vercel preview deployments.
 *
 * Deletes preview deployments older than RETENTION_DAYS (default: 90).
 *
 * Required env vars:
 * - VERCEL_TOKEN
 * - VERCEL_PROJECT_ID
 *
 * Optional env vars:
 * - VERCEL_TEAM_ID
 * - RETENTION_DAYS (default: 90)
 * - DRY_RUN (true/false, default: false)
 * - VERCEL_API_BASE (default: https://api.vercel.com)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load local env first so npm scripts work without manual export.
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '.env.local') });

function resolveToken() {
  return (
    process.env.VERCEL_TOKEN ?? process.env.VERCEL_ACCESS_TOKEN ?? process.env.VERCEL_API_TOKEN
  );
}

function resolveLocalVercelProject() {
  const projectFilePath = join(__dirname, '..', '.vercel', 'project.json');

  if (!existsSync(projectFilePath)) {
    return { projectId: undefined, teamId: undefined };
  }

  try {
    const data = JSON.parse(readFileSync(projectFilePath, 'utf8'));

    return {
      projectId: data?.projectId,
      teamId: data?.orgId,
    };
  } catch {
    return { projectId: undefined, teamId: undefined };
  }
}

const localVercelProject = resolveLocalVercelProject();

const API_BASE = process.env.VERCEL_API_BASE ?? 'https://api.vercel.com';
const TOKEN = resolveToken();
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? localVercelProject.projectId;
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? localVercelProject.teamId;
const RETENTION_DAYS = Number.parseInt(process.env.RETENTION_DAYS ?? '90', 10);
const DRY_RUN = (process.env.DRY_RUN ?? 'false').toLowerCase() === 'true';
const PAGE_LIMIT = 100;
const MAX_PAGES = 200;

if (!TOKEN) {
  console.error(
    'Missing Vercel token. Set one of: VERCEL_TOKEN, VERCEL_ACCESS_TOKEN, or VERCEL_API_TOKEN'
  );
  process.exit(1);
}

if (!PROJECT_ID) {
  console.error('Missing required environment variable: VERCEL_PROJECT_ID');
  process.exit(1);
}

if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS < 1) {
  console.error(`Invalid RETENTION_DAYS value: ${process.env.RETENTION_DAYS}`);
  process.exit(1);
}

const cutoffMs = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** @param {string} path */
function buildUrl(path) {
  return new URL(path, API_BASE);
}

/**
 * @param {string} method
 * @param {URL} url
 */
async function requestJson(method, url) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error?.message ?? data?.message ?? text ?? `HTTP ${response.status}`;
    throw new Error(`${method} ${url.pathname} failed: ${message}`);
  }

  return data;
}

async function listPreviewDeployments() {
  const deployments = [];
  let until;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = buildUrl('/v6/deployments');
    url.searchParams.set('projectId', PROJECT_ID);
    url.searchParams.set('target', 'preview');
    url.searchParams.set('state', 'READY');
    url.searchParams.set('limit', String(PAGE_LIMIT));

    if (TEAM_ID) {
      url.searchParams.set('teamId', TEAM_ID);
    }

    if (until) {
      url.searchParams.set('until', String(until));
    }

    const payload = await requestJson('GET', url);
    const batch = Array.isArray(payload?.deployments) ? payload.deployments : [];

    if (batch.length === 0) {
      break;
    }

    deployments.push(...batch);

    const oldestCreatedAt = Math.min(
      ...batch.map((deployment) => deployment.createdAt || Number.MAX_SAFE_INTEGER)
    );

    if (!Number.isFinite(oldestCreatedAt)) {
      break;
    }

    until = oldestCreatedAt - 1;

    if (batch.length < PAGE_LIMIT) {
      break;
    }
  }

  return deployments;
}

async function deleteDeployment(deploymentId) {
  const url = buildUrl(`/v13/deployments/${deploymentId}`);

  if (TEAM_ID) {
    url.searchParams.set('teamId', TEAM_ID);
  }

  await requestJson('DELETE', url);
}

function formatDate(epochMs) {
  return new Date(epochMs).toISOString();
}

async function main() {
  console.log('Vercel preview deployment cleanup starting');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Retention days: ${RETENTION_DAYS}`);
  console.log(`Cutoff: ${formatDate(cutoffMs)}`);
  console.log(`Dry run: ${DRY_RUN}`);

  const allPreviewDeployments = await listPreviewDeployments();

  const candidates = allPreviewDeployments.filter((deployment) => {
    const createdAt = Number(deployment.createdAt ?? 0);
    return createdAt > 0 && createdAt < cutoffMs;
  });

  console.log(`Preview deployments found: ${allPreviewDeployments.length}`);
  console.log(`Deployments older than ${RETENTION_DAYS} days: ${candidates.length}`);

  if (candidates.length === 0) {
    console.log('Nothing to prune. Exiting.');
    return;
  }

  let deleted = 0;
  let failed = 0;

  for (const deployment of candidates) {
    const deploymentId = deployment.uid ?? deployment.id;
    const deploymentUrl = deployment.url ? `https://${deployment.url}` : deploymentId;

    if (!deploymentId) {
      failed += 1;
      console.error('Skipping deployment without id/uid');
      continue;
    }

    try {
      if (DRY_RUN) {
        console.log(
          `[dry-run] Would delete ${deploymentUrl} (${formatDate(deployment.createdAt)})`
        );
      } else {
        await deleteDeployment(deploymentId);
        console.log(`Deleted ${deploymentUrl} (${formatDate(deployment.createdAt)})`);
      }
      deleted += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to delete ${deploymentUrl}: ${error.message}`);
    }
  }

  console.log('Cleanup complete');
  console.log(`Eligible: ${candidates.length}`);
  console.log(`${DRY_RUN ? 'Would delete' : 'Deleted'}: ${deleted}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Cleanup failed: ${error.message}`);
  process.exit(1);
});
