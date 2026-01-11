/**
 * Vercel Analytics API client (lightweight)
 *
 * Provides a minimal, safe abstraction to query Vercel Analytics or a configured
 * analytics proxy endpoint. For security and testability we prefer to rely on a
 * configurably-provided endpoint (VERCEL_ANALYTICS_ENDPOINT) rather than hard-
 * coding a Vercel REST path which can change over time.
 */
import fs from "fs";
import path from "path";

export type VercelTopPage = { path: string; views: number; url?: string };
export type VercelReferrer = { referrer: string; views: number };
export type VercelDevice = { device: string; views: number };

export interface VercelAnalyticsResult {
  topPages: VercelTopPage[];
  topReferrers: VercelReferrer[];
  topDevices: VercelDevice[];
  fetchedAt: string; // ISO timestamp
}

/** Try to resolve a Vercel project ID from env or from `.vercel/project.json` */
function getProjectId(): string | null {
  if (process.env.VERCEL_PROJECT_ID) return process.env.VERCEL_PROJECT_ID;

  try {
    const projectJsonPath = path.resolve(
      process.cwd(),
      ".vercel",
      "project.json"
    );
    if (fs.existsSync(projectJsonPath)) {
      const raw = fs.readFileSync(projectJsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projectId) return parsed.projectId;
    }
  } catch (error) {
    // ignore
  }

  return null;
}

/**
 * Fetch Vercel Analytics data from a configured endpoint. The preferred approach
 * for this repo is to use a small proxy in Vercel (or an explicit endpoint) and
 * provide it via `VERCEL_ANALYTICS_ENDPOINT`. This avoids binding the code to
 * a single Vercel REST version. If that variable isn't set the function will
 * return null to indicate: not configured.
 */
export async function fetchVercelAnalytics(
  days = 1
): Promise<VercelAnalyticsResult | null> {
  const token = process.env.VERCEL_TOKEN;
  const endpoint = process.env.VERCEL_ANALYTICS_ENDPOINT;

  // Not configured - return null for safety
  if (!token || !endpoint) return null;

  // Build URL with some sensible query params
  const projectId = getProjectId();
  const url = new URL(endpoint);
  if (projectId) url.searchParams.set("projectId", projectId);
  url.searchParams.set("days", String(days));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      // Non-200 from proxy/api
      console.warn("[Vercel Analytics] Non-OK response", res.status);
      return null;
    }

    const json = await res.json();

    // Basic normalization - accept both v1 and proxy shapes. When unrecognized
    // shape is returned, fall back to null so callers can implement graceful
    // degradation.
    const topPages: VercelTopPage[] = Array.isArray(json.topPages)
      ? json.topPages.map((p: any) => ({
          path: p.path || p.url || p.slug || "",
          views: Number(p.views || 0),
          url: p.url,
        }))
      : [];

    const topReferrers: VercelReferrer[] = Array.isArray(json.topReferrers)
      ? json.topReferrers.map((r: any) => ({
          referrer: r.referrer || r.source || "unknown",
          views: Number(r.views || 0),
        }))
      : [];

    const topDevices: VercelDevice[] = Array.isArray(json.topDevices)
      ? json.topDevices.map((d: any) => ({
          device: d.device || d.name || "unknown",
          views: Number(d.views || 0),
        }))
      : [];

    return {
      topPages,
      topReferrers,
      topDevices,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Swallow errors - this should not crash scheduled jobs or APIs
    console.warn("[Vercel Analytics] Fetch failed:", error);
    return null;
  }
}

const vercelAnalyticsApi = { fetchVercelAnalytics };

export default vercelAnalyticsApi;
